import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LeftClipsPanel } from './components/LeftClipsPanel';
import { CenterPlayerPanel } from './components/CenterPlayerPanel';
import { RightControlPanel } from './components/RightControlPanel';
import { ExportModal } from './components/ExportModal';
import { PublishModal } from './components/PublishModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { UploadModal } from './components/UploadModal';
import { SAMPLE_VIDEOS } from './data/sampleData';
import {
  ApiCredentials,
  ClipItem,
  FramingConfig,
  SubtitleItem,
  SubtitleStyle,
  VideoSource,
} from './types';
import {
  exportClipWithSubtitles,
  ExportProgress,
  ExportResult,
} from './services/exportService';
import {
  loadSavedCredentials,
  saveCredentials,
} from './services/socialPublisher';
import { analyzeVideoWithGemini } from './services/geminiService';

export default function App() {
  // Video Source & Clips State
  const [currentSource, setCurrentSource] = useState<VideoSource>(SAMPLE_VIDEOS[0].source);
  const [clips, setClips] = useState<ClipItem[]>(SAMPLE_VIDEOS[0].clips);
  const [selectedClip, setSelectedClip] = useState<ClipItem>(SAMPLE_VIDEOS[0].clips[0]);

  // Video Element Ref & Playback State
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(
    SAMPLE_VIDEOS[0].clips[0].start_time_seconds
  );

  // Framing Configuration State
  const [framing, setFraming] = useState<FramingConfig>({
    mode: 'AUTO',
    swapSpeakers: false,
    topSpeakerPanX: 0.28,
    topSpeakerZoom: 1.05,
    bottomSpeakerPanX: 0.72,
    bottomSpeakerZoom: 1.05,
    dividerColor: '#10B981', // emerald
    dividerThickness: 6,
    activeSpeakerHighlight: true,
  });

  // Subtitle Style State
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    preset: 'hormozi',
    fontFamily: 'Montserrat',
    fontSize: 46,
    yPercent: 78,
    textColor: '#FFFFFF',
    highlightColor: '#FACC15', // vibrant yellow
    strokeColor: '#000000',
    strokeWidth: 8,
    backgroundColor: '#000000',
    backgroundOpacity: 0.0,
    uppercase: true,
    showEmoji: true,
    karaokeMode: true,
  });

  // API Credentials State
  const [apiCreds, setApiCreds] = useState<ApiCredentials>(() => loadSavedCredentials());

  // Rendered Output State
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);

  // Modals & Flows State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishInitialPlatform, setPublishInitialPlatform] = useState<
    'youtube' | 'instagram' | 'facebook'
  >('youtube');

  // Export State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    percent: 0,
    currentTime: 0,
    duration: 0,
    status: 'initializing',
  });
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const cancelExportRef = useRef<{ current: boolean }>({ current: false });

  // Gemini Analyzer Loading State
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-adapt framing when switching clips
  const handleSelectClip = (clip: ClipItem) => {
    setSelectedClip(clip);
    if (clip.layout_mode === 'SPLIT_SCREEN' && clip.speaker1 && clip.speaker2) {
      setFraming((prev) => ({
        ...prev,
        topSpeakerPanX: clip.speaker1?.x ?? 0.28,
        bottomSpeakerPanX: clip.speaker2?.x ?? 0.72,
      }));
    } else if (clip.camera_keyframes && clip.camera_keyframes.length > 0) {
      setFraming((prev) => ({
        ...prev,
        topSpeakerPanX: clip.camera_keyframes[0]?.speaker_x_center ?? 0.5,
      }));
    }
  };

  // Seek video
  const handleSeekTo = (seconds: number) => {
    if (videoElementRef.current) {
      videoElementRef.current.currentTime = seconds;
      setCurrentPlaybackTime(seconds);
    }
  };

  // Update subtitles
  const handleUpdateSubtitles = (clipId: number, newSubtitles: SubtitleItem[]) => {
    setClips((prev) =>
      prev.map((c) => (c.clip_id === clipId ? { ...c, subtitles: newSubtitles } : c))
    );
    if (selectedClip.clip_id === clipId) {
      setSelectedClip((prev) => ({ ...prev, subtitles: newSubtitles }));
    }
  };

  // Load predefined sample
  const handleLoadSample = (sampleIndex: number) => {
    const sample = SAMPLE_VIDEOS[sampleIndex] || SAMPLE_VIDEOS[0];
    setCurrentSource(sample.source);
    setClips(sample.clips);
    setSelectedClip(sample.clips[0]);
    if (videoElementRef.current) {
      videoElementRef.current.src = sample.source.url;
      videoElementRef.current.load();
    }
    if (sample.clips[0].layout_mode === 'SPLIT_SCREEN') {
      setFraming((prev) => ({
        ...prev,
        mode: 'SPLIT_SCREEN',
        topSpeakerPanX: sample.clips[0].speaker1?.x ?? 0.28,
        bottomSpeakerPanX: sample.clips[0].speaker2?.x ?? 0.72,
      }));
    } else {
      setFraming((prev) => ({
        ...prev,
        mode: 'SINGLE_TRACK',
        topSpeakerPanX: sample.clips[0].camera_keyframes[0]?.speaker_x_center ?? 0.5,
      }));
    }
  };

  // Handle new source upload or URL
  const handleSelectSource = async (newSource: VideoSource, customPrompt?: string) => {
    setCurrentSource(newSource);
    if (videoElementRef.current) {
      videoElementRef.current.src = newSource.url;
      videoElementRef.current.load();
    }
    await runGeminiAnalysis(newSource, customPrompt);
  };

  // Analyze with Gemini
  const runGeminiAnalysis = async (source = currentSource, promptHint?: string) => {
    setIsAnalyzing(true);
    try {
      const generatedClips = await analyzeVideoWithGemini({
        videoTitle: source.name,
        videoDuration: videoElementRef.current?.duration || 120,
        promptHint,
      });

      if (generatedClips && generatedClips.length > 0) {
        setClips(generatedClips);
        handleSelectClip(generatedClips[0]);
      }
    } catch (err) {
      console.error('Failed to analyze with Gemini:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start real 9:16 MP4 video export with canvas capture & audio
  const handleStartExport = async () => {
    if (!videoElementRef.current) return;
    setIsExportOpen(true);
    setExportResult(null);
    cancelExportRef.current.current = false;

    try {
      const res = await exportClipWithSubtitles(
        selectedClip,
        videoElementRef.current,
        framing,
        subtitleStyle,
        (progress) => setExportProgress(progress),
        cancelExportRef.current
      );
      setExportResult(res);
      setRenderedBlob(res.blob);
    } catch (err: any) {
      console.error('Export error:', err);
    }
  };

  const handleCancelExport = () => {
    cancelExportRef.current.current = true;
    setExportProgress((prev) => ({ ...prev, status: 'cancelled' }));
  };

  // Open Publish Modal
  const handleOpenPublish = (platform: 'youtube' | 'instagram' | 'facebook' = 'youtube') => {
    setPublishInitialPlatform(platform);
    setIsPublishOpen(true);
  };

  // Save API Credentials
  const handleSaveApiCreds = (newCreds: ApiCredentials) => {
    setApiCreds(newCreds);
    saveCredentials(newCreds);
  };

  // Keyboard shortcut: Spacebar to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (videoElementRef.current) {
          if (videoElementRef.current.paused) {
            videoElementRef.current.play();
          } else {
            videoElementRef.current.pause();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Navbar */}
      <Header
        currentSource={currentSource}
        apiCreds={apiCreds}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenPublish={() => handleOpenPublish('youtube')}
        onStartExport={handleStartExport}
        onLoadSample={handleLoadSample}
        isAnalyzing={isAnalyzing}
        onAnalyzeWithGemini={() => runGeminiAnalysis(currentSource)}
      />

      {/* 3-Column Studio Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Viral Clips & Transcript Editor */}
        <LeftClipsPanel
          clips={clips}
          selectedClip={selectedClip}
          onSelectClip={handleSelectClip}
          onSeekTo={handleSeekTo}
          onUpdateSubtitles={handleUpdateSubtitles}
          currentPlaybackTime={currentPlaybackTime}
        />

        {/* Center Column: 9:16 Canvas Portrait Player */}
        <CenterPlayerPanel
          videoUrl={currentSource.url}
          selectedClip={selectedClip}
          framing={framing}
          subtitleStyle={subtitleStyle}
          onUpdateFraming={setFraming}
          onTimeUpdate={setCurrentPlaybackTime}
          onVideoElementReady={(el) => {
            videoElementRef.current = el;
          }}
        />

        {/* Right Column: Subtitles, Camera & Split-Screen, Social Publisher */}
        <RightControlPanel
          selectedClip={selectedClip}
          subtitleStyle={subtitleStyle}
          framing={framing}
          onUpdateSubtitleStyle={setSubtitleStyle}
          onUpdateFraming={setFraming}
          onOpenPublish={handleOpenPublish}
          onStartExport={handleStartExport}
        />
      </div>

      {/* MODALS */}
      <ExportModal
        isOpen={isExportOpen}
        progress={exportProgress}
        result={exportResult}
        onCancel={handleCancelExport}
        onClose={() => setIsExportOpen(false)}
        onOpenPublish={() => {
          setIsExportOpen(false);
          setIsPublishOpen(true);
        }}
      />

      <PublishModal
        isOpen={isPublishOpen}
        selectedClip={selectedClip}
        renderedBlob={renderedBlob}
        apiCreds={apiCreds}
        initialPlatform={publishInitialPlatform}
        onClose={() => setIsPublishOpen(false)}
        onOpenSettings={() => {
          setIsPublishOpen(false);
          setIsApiSettingsOpen(true);
        }}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        creds={apiCreds}
        onSave={handleSaveApiCreds}
        onClose={() => setIsApiSettingsOpen(false)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectSource={handleSelectSource}
        onSelectSample={(idx) => handleLoadSample(idx)}
      />
    </div>
  );
}
