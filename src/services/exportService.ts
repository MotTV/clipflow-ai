import { ClipItem, FramingConfig, SubtitleStyle } from '../types';
import { calculateCurrentSpeakerX, renderCanvasFrame } from '../utils/canvasRenderer';

// Audio Context Singleton map to prevent InvalidStateError on createMediaElementSource
const audioSourceMap = new WeakMap<
  HTMLVideoElement,
  {
    audioCtx: AudioContext;
    sourceNode: MediaElementAudioSourceNode;
    destinationNode: MediaStreamAudioDestinationNode;
  }
>();

export function getOrCreateAudioNodes(video: HTMLVideoElement) {
  let existing = audioSourceMap.get(video);
  if (existing) {
    if (existing.audioCtx.state === 'suspended') {
      existing.audioCtx.resume();
    }
    return existing;
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const sourceNode = audioCtx.createMediaElementSource(video);
  const destinationNode = audioCtx.createMediaStreamDestination();

  // Connect to stream destination AND audio output speakers
  sourceNode.connect(destinationNode);
  sourceNode.connect(audioCtx.destination);

  existing = { audioCtx, sourceNode, destinationNode };
  audioSourceMap.set(video, existing);
  return existing;
}

export interface ExportProgress {
  percent: number;
  currentTime: number;
  duration: number;
  status: 'initializing' | 'recording' | 'finalizing' | 'completed' | 'cancelled';
}

export interface ExportResult {
  blob: Blob;
  downloadUrl: string;
  filename: string;
  mimeType: string;
}

export function getSupportedMimeType(): { mimeType: string; extension: string } {
  const mp4Types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1.4d002a',
    'video/mp4',
  ];

  for (const type of mp4Types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
      return { mimeType: type, extension: 'mp4' };
    }
  }

  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  for (const type of webmTypes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
      return { mimeType: type, extension: 'webm' };
    }
  }

  return { mimeType: 'video/webm', extension: 'webm' };
}

export async function exportClipWithSubtitles(
  clip: ClipItem,
  video: HTMLVideoElement,
  framing: FramingConfig,
  subtitleStyle: SubtitleStyle,
  onProgress?: (progress: ExportProgress) => void,
  cancelRef?: { current: boolean }
): Promise<ExportResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const targetWidth = 720;
      const targetHeight = 1280;

      // Offscreen canvas for pristine render
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;

      const duration = clip.end_time_seconds - clip.start_time_seconds;
      if (duration <= 0) {
        throw new Error('Durasi klip tidak valid.');
      }

      onProgress?.({
        percent: 0,
        currentTime: 0,
        duration,
        status: 'initializing',
      });

      // Pause, mute temporarily during seek, and seek to start
      video.pause();
      const prevMuted = video.muted;
      const prevVolume = video.volume;
      video.muted = false; // Need audio for stream
      video.volume = 1.0;
      video.currentTime = clip.start_time_seconds;

      // Wait for seeked event
      await new Promise<void>((res) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          res();
        };
        video.addEventListener('seeked', onSeeked);
      });

      // Audio setup
      let audioDestination: MediaStreamAudioDestinationNode | null = null;
      try {
        const audioNodes = getOrCreateAudioNodes(video);
        audioDestination = audioNodes.destinationNode;
        if (audioNodes.audioCtx.state === 'suspended') {
          await audioNodes.audioCtx.resume();
        }
      } catch (err) {
        console.warn('Audio node connection warning (video might still record video-only):', err);
      }

      // Visual stream
      const canvasStream = exportCanvas.captureStream(30);

      // Combined stream
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
        tracks.push(audioDestination.stream.getAudioTracks()[0]);
      }
      const combinedStream = new MediaStream(tracks);

      const { mimeType, extension } = getSupportedMimeType();

      const options: MediaRecorderOptions = {
        mimeType: mimeType || undefined,
        videoBitsPerSecond: 8_000_000, // 8 Mbps
      };

      const recorder = new MediaRecorder(combinedStream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      let animationFrameId: number;
      let smoothedSpeakerX = calculateCurrentSpeakerX(clip, clip.start_time_seconds);

      const cleanup = () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        video.pause();
        video.muted = prevMuted;
        video.volume = prevVolume;
      };

      recorder.onstop = () => {
        cleanup();
        const blob = new Blob(chunks, { type: mimeType || 'video/mp4' });
        const downloadUrl = URL.createObjectURL(blob);
        const cleanTitle = clip.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '-');
        const filename = `ClipFlow-9x16-${cleanTitle || 'Clip'}.${extension}`;

        onProgress?.({
          percent: 100,
          currentTime: duration,
          duration,
          status: 'completed',
        });

        // Trigger automatic download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        resolve({
          blob,
          downloadUrl,
          filename,
          mimeType,
        });
      };

      recorder.onerror = (e) => {
        cleanup();
        reject(e);
      };

      recorder.start(200); // 200ms timeslices

      // Play video
      await video.play();

      const renderLoop = () => {
        if (cancelRef?.current) {
          cleanup();
          if (recorder.state !== 'inactive') recorder.stop();
          onProgress?.({
            percent: 0,
            currentTime: 0,
            duration,
            status: 'cancelled',
          });
          reject(new Error('Export dibatalkan oleh pengguna.'));
          return;
        }

        const cur = video.currentTime;
        const targetX = calculateCurrentSpeakerX(clip, cur);
        smoothedSpeakerX += (targetX - smoothedSpeakerX) * 0.12;

        renderCanvasFrame({
          canvas: exportCanvas,
          video,
          clip,
          framing,
          subtitleStyle,
          currentLerpSpeakerX: smoothedSpeakerX,
          currentTime: cur,
        });

        const elapsed = Math.max(0, cur - clip.start_time_seconds);
        const pct = Math.min(99, Math.round((elapsed / duration) * 100));

        onProgress?.({
          percent: pct,
          currentTime: elapsed,
          duration,
          status: 'recording',
        });

        if (cur >= clip.end_time_seconds || video.ended) {
          onProgress?.({
            percent: 99,
            currentTime: duration,
            duration,
            status: 'finalizing',
          });
          video.pause();
          setTimeout(() => {
            if (recorder.state !== 'inactive') {
              recorder.stop();
            }
          }, 400);
          return;
        }

        animationFrameId = requestAnimationFrame(renderLoop);
      };

      renderLoop();
    } catch (err) {
      reject(err);
    }
  });
}
