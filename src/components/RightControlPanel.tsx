import React, { useState } from 'react';
import {
  Type,
  Video,
  Share2,
  Sliders,
  Palette,
  Sparkles,
  ArrowUpDown,
  ZoomIn,
  Eye,
  Check,
  Send,
  Calendar,
  Youtube,
  Instagram,
  Facebook,
  Download,
} from 'lucide-react';
import {
  ClipItem,
  FramingConfig,
  SubtitlePreset,
  SubtitleStyle,
} from '../types';

interface RightControlPanelProps {
  selectedClip: ClipItem;
  subtitleStyle: SubtitleStyle;
  framing: FramingConfig;
  onUpdateSubtitleStyle: (style: SubtitleStyle) => void;
  onUpdateFraming: (framing: FramingConfig) => void;
  onOpenPublish: (platform?: 'youtube' | 'instagram' | 'facebook') => void;
  onStartExport: () => void;
}

export const RightControlPanel: React.FC<RightControlPanelProps> = ({
  selectedClip,
  subtitleStyle,
  framing,
  onUpdateSubtitleStyle,
  onUpdateFraming,
  onOpenPublish,
  onStartExport,
}) => {
  const [activeTab, setActiveTab] = useState<'subtitles' | 'framing' | 'social'>('subtitles');
  const [socialPlatformTab, setSocialPlatformTab] = useState<'youtube' | 'instagram' | 'facebook'>('youtube');

  // Preset Applier
  const applyPreset = (preset: SubtitlePreset) => {
    switch (preset) {
      case 'hormozi':
        onUpdateSubtitleStyle({
          ...subtitleStyle,
          preset: 'hormozi',
          fontFamily: 'Montserrat',
          fontSize: 48,
          textColor: '#FFFFFF',
          highlightColor: '#FACC15', // Bright yellow
          strokeColor: '#000000',
          strokeWidth: 8,
          backgroundColor: '#000000',
          backgroundOpacity: 0.0,
          uppercase: true,
          showEmoji: true,
          karaokeMode: true,
        });
        break;
      case 'mrbeast':
        onUpdateSubtitleStyle({
          ...subtitleStyle,
          preset: 'mrbeast',
          fontFamily: 'Poppins',
          fontSize: 46,
          textColor: '#FFFFFF',
          highlightColor: '#38BDF8', // bright cyan
          strokeColor: '#000000',
          strokeWidth: 10,
          backgroundColor: '#000000',
          backgroundOpacity: 0.0,
          uppercase: true,
          showEmoji: true,
          karaokeMode: true,
        });
        break;
      case 'clean':
        onUpdateSubtitleStyle({
          ...subtitleStyle,
          preset: 'clean',
          fontFamily: 'Inter',
          fontSize: 38,
          textColor: '#F8FAFC',
          highlightColor: '#34D399', // emerald
          strokeColor: '#0f172a',
          strokeWidth: 2,
          backgroundColor: '#020617',
          backgroundOpacity: 0.75,
          uppercase: false,
          showEmoji: false,
          karaokeMode: true,
        });
        break;
      case 'neon':
        onUpdateSubtitleStyle({
          ...subtitleStyle,
          preset: 'neon',
          fontFamily: 'Montserrat',
          fontSize: 44,
          textColor: '#FFFFFF',
          highlightColor: '#22D3EE', // neon cyan
          strokeColor: '#D946EF', // neon fuchsia
          strokeWidth: 5,
          backgroundColor: '#090d16',
          backgroundOpacity: 0.8,
          uppercase: true,
          showEmoji: true,
          karaokeMode: true,
        });
        break;
      default:
        break;
    }
  };

  const isSplit =
    framing.mode === 'SPLIT_SCREEN' ||
    (framing.mode === 'AUTO' && selectedClip.layout_mode === 'SPLIT_SCREEN');

  return (
    <aside className="w-full lg:w-[350px] xl:w-[390px] shrink-0 border-l border-zinc-800 bg-zinc-900/60 flex flex-col h-[calc(100vh-57px)] overflow-hidden">
      {/* Top Navigation Tabs */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950/40">
        <div className="grid grid-cols-3 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('subtitles')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'subtitles'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>Subtitle</span>
          </button>

          <button
            onClick={() => setActiveTab('framing')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'framing'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kamera & Split</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'social'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sosmed</span>
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* =========================================================
            TAB 1: SUBTITLES & KARAOKE STYLING
            ========================================================= */}
        {activeTab === 'subtitles' && (
          <div className="space-y-4">
            {/* Quick 4 Presets */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                4 Preset Cepat Populer
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'hormozi', name: 'Hormozi Bold', tag: 'Kuning Menang', col: 'text-yellow-400' },
                  { id: 'mrbeast', name: 'MrBeast Pop', tag: 'Shadow Tebal', col: 'text-cyan-400' },
                  { id: 'clean', name: 'Clean Podcast', tag: 'Pill Minimalis', col: 'text-emerald-400' },
                  { id: 'neon', name: 'Neon Cyber', tag: 'Glow Fuchsia', col: 'text-fuchsia-400' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => applyPreset(item.id as SubtitlePreset)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      subtitleStyle.preset === item.id
                        ? 'bg-zinc-800 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${item.col}`}>{item.name}</span>
                      {subtitleStyle.preset === item.id && (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family & Size */}
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Font Family
                </label>
                <select
                  value={subtitleStyle.fontFamily}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({ ...subtitleStyle, fontFamily: e.target.value, preset: 'custom' })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Montserrat">Montserrat (Modern Heavy)</option>
                  <option value="Poppins">Poppins (Punchy Pop)</option>
                  <option value="Inter">Inter (Clean Minimal)</option>
                  <option value="Anton">Anton (Ultra Compact)</option>
                  <option value="Impact">Impact (Classic Bold)</option>
                </select>
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                  <span>Ukuran Huruf</span>
                  <span className="text-indigo-400 font-bold">{subtitleStyle.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={26}
                  max={68}
                  value={subtitleStyle.fontSize}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({
                      ...subtitleStyle,
                      fontSize: Number(e.target.value),
                      preset: 'custom',
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Subtitle Y Position Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                  <span>Posisi Vertikal (Y-Axis)</span>
                  <span className="text-emerald-400 font-bold">
                    {isSplit ? '50% (Auto Center)' : `${subtitleStyle.yPercent}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  disabled={isSplit}
                  value={isSplit ? 50 : subtitleStyle.yPercent}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({
                      ...subtitleStyle,
                      yPercent: Number(e.target.value),
                      preset: 'custom',
                    })
                  }
                  className={`w-full accent-emerald-400 cursor-pointer ${isSplit ? 'opacity-40' : ''}`}
                />
                {isSplit && (
                  <p className="text-[10px] text-emerald-400 mt-1 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                    💡 Mode Split-Screen Aktif: Posisi otomatis dikunci di garis tengah layar (50%) agar tidak menutupi wajah kedua pembicara.
                  </p>
                )}
              </div>
            </div>

            {/* Color Controls */}
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Warna & Gaya Teks</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Primary Text Color */}
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">Teks Utama</span>
                  <input
                    type="color"
                    value={subtitleStyle.textColor}
                    onChange={(e) =>
                      onUpdateSubtitleStyle({ ...subtitleStyle, textColor: e.target.value, preset: 'custom' })
                    }
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                </div>

                {/* Highlight Karaoke Color */}
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-yellow-400 font-semibold">Highlight Kata</span>
                  <input
                    type="color"
                    value={subtitleStyle.highlightColor}
                    onChange={(e) =>
                      onUpdateSubtitleStyle({ ...subtitleStyle, highlightColor: e.target.value, preset: 'custom' })
                    }
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                </div>

                {/* Stroke Outline Color */}
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">Outline/Stroke</span>
                  <input
                    type="color"
                    value={subtitleStyle.strokeColor}
                    onChange={(e) =>
                      onUpdateSubtitleStyle({ ...subtitleStyle, strokeColor: e.target.value, preset: 'custom' })
                    }
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                </div>

                {/* Background Box Color */}
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">Kotak Background</span>
                  <input
                    type="color"
                    value={subtitleStyle.backgroundColor}
                    onChange={(e) =>
                      onUpdateSubtitleStyle({ ...subtitleStyle, backgroundColor: e.target.value, preset: 'custom' })
                    }
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Ketebalan Stroke</span>
                  <span>{subtitleStyle.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={16}
                  value={subtitleStyle.strokeWidth}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({
                      ...subtitleStyle,
                      strokeWidth: Number(e.target.value),
                      preset: 'custom',
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Background Opacity */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Transparansi Background</span>
                  <span>{(subtitleStyle.backgroundOpacity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={subtitleStyle.backgroundOpacity}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({
                      ...subtitleStyle,
                      backgroundOpacity: Number(e.target.value),
                      preset: 'custom',
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="space-y-2 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
              <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer">
                <span>Huruf KAPITAL (UPPERCASE)</span>
                <input
                  type="checkbox"
                  checked={subtitleStyle.uppercase}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({ ...subtitleStyle, uppercase: e.target.checked, preset: 'custom' })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer">
                <span>Tampilkan Auto-Emoji</span>
                <input
                  type="checkbox"
                  checked={subtitleStyle.showEmoji}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({ ...subtitleStyle, showEmoji: e.target.checked, preset: 'custom' })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer">
                <span>Efek Karaoke (Highlight Kata Kunci)</span>
                <input
                  type="checkbox"
                  checked={subtitleStyle.karaokeMode}
                  onChange={(e) =>
                    onUpdateSubtitleStyle({ ...subtitleStyle, karaokeMode: e.target.checked, preset: 'custom' })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: KAMERA TRACKING & SMART SPLIT-SCREEN
            ========================================================= */}
        {activeTab === 'framing' && (
          <div className="space-y-4">
            {/* Quick Switch */}
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Format Rasio & Framing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateFraming({ ...framing, mode: 'AUTO' })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    framing.mode === 'AUTO'
                      ? 'bg-zinc-800 border-indigo-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Auto AI
                  </span>
                  <span className="text-[10px] text-zinc-500">Deteksi otomatis</span>
                </button>

                <button
                  onClick={() => onUpdateFraming({ ...framing, mode: 'SPLIT_SCREEN' })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    framing.mode === 'SPLIT_SCREEN'
                      ? 'bg-zinc-800 border-emerald-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block flex items-center gap-1 text-emerald-400">
                    <Video className="w-3.5 h-3.5" />
                    2 Pembicara Split
                  </span>
                  <span className="text-[10px] text-zinc-500">Podcast atas-bawah</span>
                </button>

                <button
                  onClick={() => onUpdateFraming({ ...framing, mode: 'SINGLE_TRACK' })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    framing.mode === 'SINGLE_TRACK'
                      ? 'bg-zinc-800 border-indigo-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">1 Pembicara Full</span>
                  <span className="text-[10px] text-zinc-500">Auto pan 9:16</span>
                </button>

                <button
                  onClick={() => onUpdateFraming({ ...framing, mode: 'CENTER_LOCK' })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    framing.mode === 'CENTER_LOCK'
                      ? 'bg-zinc-800 border-indigo-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">Center Lock</span>
                  <span className="text-[10px] text-zinc-500">Kamera tetap di tengah</span>
                </button>
              </div>
            </div>

            {/* SPLIT SCREEN CONTROLS */}
            {isSplit ? (
              <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Kontrol Podcast Split-Screen
                  </span>

                  {/* Tukar Posisi Button */}
                  <button
                    onClick={() =>
                      onUpdateFraming({ ...framing, swapSpeakers: !framing.swapSpeakers })
                    }
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Tukar Posisi Atas/Bawah</span>
                  </button>
                </div>

                {/* Active Speaker Dynamic Zoom Toggle */}
                <label className="flex items-center justify-between text-xs text-zinc-200 cursor-pointer pt-1">
                  <span>Dynamic Zoom (1.05x) saat Berbicara</span>
                  <input
                    type="checkbox"
                    checked={framing.activeSpeakerHighlight}
                    onChange={(e) =>
                      onUpdateFraming({ ...framing, activeSpeakerHighlight: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </label>

                {/* Divider Line Color & Thickness */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-400">Garis Pembatas</span>
                    <input
                      type="color"
                      value={framing.dividerColor}
                      onChange={(e) =>
                        onUpdateFraming({ ...framing, dividerColor: e.target.value })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                  </div>

                  <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Ketebalan</span>
                      <span>{framing.dividerThickness}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={framing.dividerThickness}
                      onChange={(e) =>
                        onUpdateFraming({ ...framing, dividerThickness: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Fine-Tuning Calibration Sliders */}
                <div className="pt-2 border-t border-zinc-800 space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Kalibrasi Manual (Fine-Tuning)
                  </span>

                  {/* Top Camera Pan & Zoom */}
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                    <span className="text-xs font-semibold text-zinc-300 block">
                      Kamera Atas ({framing.swapSpeakers ? 'Pembicara 2' : 'Pembicara 1'})
                    </span>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Geser Pan X (Kiri-Kanan)</span>
                        <span>{(framing.topSpeakerPanX * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={0.9}
                        step={0.01}
                        value={framing.topSpeakerPanX}
                        onChange={(e) =>
                          onUpdateFraming({ ...framing, topSpeakerPanX: Number(e.target.value) })
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Zoom Kamera</span>
                        <span>{framing.topSpeakerZoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={1.0}
                        max={1.5}
                        step={0.05}
                        value={framing.topSpeakerZoom}
                        onChange={(e) =>
                          onUpdateFraming({ ...framing, topSpeakerZoom: Number(e.target.value) })
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Bottom Camera Pan & Zoom */}
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                    <span className="text-xs font-semibold text-zinc-300 block">
                      Kamera Bawah ({framing.swapSpeakers ? 'Pembicara 1' : 'Pembicara 2'})
                    </span>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Geser Pan X (Kiri-Kanan)</span>
                        <span>{(framing.bottomSpeakerPanX * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={0.9}
                        step={0.01}
                        value={framing.bottomSpeakerPanX}
                        onChange={(e) =>
                          onUpdateFraming({ ...framing, bottomSpeakerPanX: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Zoom Kamera</span>
                        <span>{framing.bottomSpeakerZoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={1.0}
                        max={1.5}
                        step={0.05}
                        value={framing.bottomSpeakerZoom}
                        onChange={(e) =>
                          onUpdateFraming({ ...framing, bottomSpeakerZoom: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Track Fine-Tuning */
              <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-white block">
                  Kalibrasi Kamera Single Track
                </span>
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Geser Fokus Pan X</span>
                    <span>{(framing.topSpeakerPanX * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.01}
                    value={framing.topSpeakerPanX}
                    onChange={(e) =>
                      onUpdateFraming({ ...framing, topSpeakerPanX: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-zinc-400 mt-2">
                    Kamera 9:16 otomatis mengikuti posisi pembicara aktif berdasarkan koordinat keyframe AI Gemini.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: SOCIAL MEDIA PUBLISHER & SCHEDULER
            ========================================================= */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            {/* Platform Selector */}
            <div className="grid grid-cols-3 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              <button
                onClick={() => setSocialPlatformTab('youtube')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  socialPlatformTab === 'youtube'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Shorts</span>
              </button>

              <button
                onClick={() => setSocialPlatformTab('instagram')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  socialPlatformTab === 'instagram'
                    ? 'bg-pink-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Reels</span>
              </button>

              <button
                onClick={() => setSocialPlatformTab('facebook')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  socialPlatformTab === 'facebook'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>FB Reels</span>
              </button>
            </div>

            {/* Generated Metadata Preview */}
            <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-3">
              {socialPlatformTab === 'youtube' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      Judul YouTube Shorts
                    </label>
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-white font-medium">
                      {selectedClip.social_posts.youtube_shorts.title}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                      Deskripsi & Tags
                    </label>
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap">
                      {selectedClip.social_posts.youtube_shorts.description}
                    </div>
                  </div>
                </>
              )}

              {socialPlatformTab === 'instagram' && (
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    Caption & Hashtags Instagram Reels
                  </label>
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {selectedClip.social_posts.instagram_reels.caption}
                  </div>
                </div>
              )}

              {socialPlatformTab === 'facebook' && (
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    Caption Facebook Reels
                  </label>
                  <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {selectedClip.social_posts.facebook_reels.caption}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => onOpenPublish(socialPlatformTab)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Publikasikan ke {socialPlatformTab.toUpperCase()}</span>
              </button>

              <button
                onClick={onStartExport}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Render & Download File MP4 9:16</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
