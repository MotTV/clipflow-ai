import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Layers,
  User,
  Users,
  Crosshair,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { ClipItem, FramingConfig, SubtitleStyle } from '../types';
import {
  calculateCurrentSpeakerX,
  determineActiveSpeaker,
  renderCanvasFrame,
} from '../utils/canvasRenderer';

interface CenterPlayerPanelProps {
  videoUrl: string;
  selectedClip: ClipItem;
  framing: FramingConfig;
  subtitleStyle: SubtitleStyle;
  onUpdateFraming: (framing: FramingConfig) => void;
  onTimeUpdate: (time: number) => void;
  onVideoElementReady: (video: HTMLVideoElement) => void;
}

export const CenterPlayerPanel: React.FC<CenterPlayerPanelProps> = ({
  videoUrl,
  selectedClip,
  framing,
  subtitleStyle,
  onUpdateFraming,
  onTimeUpdate,
  onVideoElementReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(selectedClip.start_time_seconds);
  const [duration, setDuration] = useState(120);
  const [isMuted, setIsMuted] = useState(false);
  const [loopClipOnly, setLoopClipOnly] = useState(true);

  // Smooth lerped speaker X tracking
  const smoothedSpeakerXRef = useRef<number>(0.5);

  // Expose video ref to parent for export
  useEffect(() => {
    if (videoRef.current) {
      onVideoElementReady(videoRef.current);
    }
  }, [onVideoElementReady, videoUrl]);

  // Handle clip change: seek to clip start time
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = selectedClip.start_time_seconds;
      setCurrentTime(selectedClip.start_time_seconds);
      smoothedSpeakerXRef.current = calculateCurrentSpeakerX(
        selectedClip,
        selectedClip.start_time_seconds
      );
    }
  }, [selectedClip]);

  // Main Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const cur = video.currentTime;
        setCurrentTime(cur);
        onTimeUpdate(cur);

        // Check clip boundaries if looping clip
        if (loopClipOnly) {
          if (cur >= selectedClip.end_time_seconds || cur < selectedClip.start_time_seconds) {
            video.currentTime = selectedClip.start_time_seconds;
          }
        }

        // Calculate smooth camera pan lerp
        const targetX = calculateCurrentSpeakerX(selectedClip, cur);
        smoothedSpeakerXRef.current += (targetX - smoothedSpeakerXRef.current) * 0.12;

        renderCanvasFrame({
          canvas,
          video,
          clip: selectedClip,
          framing,
          subtitleStyle,
          currentLerpSpeakerX: smoothedSpeakerXRef.current,
          currentTime: cur,
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedClip, framing, subtitleStyle, loopClipOnly, onTimeUpdate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const activeSpeaker = determineActiveSpeaker(selectedClip, currentTime);
  const isSplit =
    framing.mode === 'SPLIT_SCREEN' ||
    (framing.mode === 'AUTO' && selectedClip.layout_mode === 'SPLIT_SCREEN');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-between p-4 bg-zinc-950/70 overflow-hidden relative">
      {/* Hidden Source Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 120);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Top Info Bar */}
      <div className="w-full max-w-[420px] flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            9:16 Canvas Studio
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
            720 x 1280 HD
          </span>
        </div>

        {/* Dynamic Framing Mode Tag */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-zinc-900/90 px-2.5 py-1 rounded-lg border border-zinc-800">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>
            {isSplit
              ? `Split-Screen (Speaker ${activeSpeaker} Aktif)`
              : `Tracking (X: ${(smoothedSpeakerXRef.current * 100).toFixed(0)}%)`}
          </span>
        </div>
      </div>

      {/* Main 9:16 Canvas Frame */}
      <div className="relative group w-full max-w-[360px] h-[580px] sm:h-[620px] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-950/40 border-2 border-zinc-800/90 bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={1280}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer select-none"
        />

        {/* Center Play Overlay when Paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-zinc-950/80 flex items-center justify-center">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Corner Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-700/60 text-white hover:bg-zinc-800 transition-colors backdrop-blur-md"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Timeline & Controls Bar */}
      <div className="w-full max-w-[560px] mt-3 space-y-2.5">
        {/* Quick Framing Switches */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => onUpdateFraming({ ...framing, mode: 'AUTO' })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              framing.mode === 'AUTO'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Auto AI</span>
          </button>

          <button
            onClick={() => onUpdateFraming({ ...framing, mode: 'SINGLE_TRACK' })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              framing.mode === 'SINGLE_TRACK'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-indigo-300" />
            <span>1 Pembicara (Full 9:16)</span>
          </button>

          <button
            onClick={() => onUpdateFraming({ ...framing, mode: 'SPLIT_SCREEN' })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              framing.mode === 'SPLIT_SCREEN'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>2 Pembicara (Split Atas-Bawah)</span>
          </button>

          <button
            onClick={() => onUpdateFraming({ ...framing, mode: 'CENTER_LOCK' })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              framing.mode === 'CENTER_LOCK'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-zinc-300" />
            <span>Center Lock</span>
          </button>
        </div>

        {/* Video Scrubber Timeline */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-2">
          {/* Timeline Bar with Clip Boundary Marker */}
          <div className="relative w-full h-3 bg-zinc-800 rounded-full cursor-pointer flex items-center">
            {/* Range of the selected clip on the total video */}
            <div
              style={{
                left: `${(selectedClip.start_time_seconds / duration) * 100}%`,
                width: `${
                  ((selectedClip.end_time_seconds - selectedClip.start_time_seconds) / duration) * 100
                }%`,
              }}
              className="absolute h-full bg-emerald-500/30 border border-emerald-500/60 rounded-full"
              title="Rentang Klip Terpilih"
            />

            {/* Current Playhead */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div
              style={{ left: `${(currentTime / duration) * 100}%` }}
              className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-black -translate-x-1/2 pointer-events-none"
            />
          </div>

          {/* Time & Playback Controls */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={() => handleSeek(selectedClip.start_time_seconds)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Kembali ke awal klip"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setLoopClipOnly(!loopClipOnly)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  loopClipOnly
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
                title="Loop hanya rentang klip ini"
              >
                <Repeat className="w-3 h-3" />
                <span>Loop Klip</span>
              </button>
            </div>

            <div className="font-mono text-zinc-300 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span className="text-zinc-500">{formatTime(duration)}</span>
              <span className="ml-2 text-emerald-400 font-bold">
                ({(selectedClip.end_time_seconds - selectedClip.start_time_seconds).toFixed(0)}s Klip)
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
