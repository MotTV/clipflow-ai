import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  Layers,
  FileText,
  Play,
  Smile,
  Highlighter,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { ClipItem, SubtitleItem } from '../types';

interface LeftClipsPanelProps {
  clips: ClipItem[];
  selectedClip: ClipItem;
  onSelectClip: (clip: ClipItem) => void;
  onSeekTo: (seconds: number) => void;
  onUpdateSubtitles: (clipId: number, subtitles: SubtitleItem[]) => void;
  currentPlaybackTime: number;
}

export const LeftClipsPanel: React.FC<LeftClipsPanelProps> = ({
  clips,
  selectedClip,
  onSelectClip,
  onSeekTo,
  onUpdateSubtitles,
  currentPlaybackTime,
}) => {
  const [activeTab, setActiveTab] = useState<'clips' | 'transcript'>('clips');

  const handleSubtitleTextChange = (id: string, newText: string) => {
    const updated = selectedClip.subtitles.map((sub) =>
      sub.id === id ? { ...sub, text: newText } : sub
    );
    onUpdateSubtitles(selectedClip.clip_id, updated);
  };

  const handleSubtitleHighlightChange = (id: string, newHighlight: string) => {
    const updated = selectedClip.subtitles.map((sub) =>
      sub.id === id ? { ...sub, highlight_word: newHighlight } : sub
    );
    onUpdateSubtitles(selectedClip.clip_id, updated);
  };

  const handleSubtitleEmojiChange = (id: string, newEmoji: string) => {
    const updated = selectedClip.subtitles.map((sub) =>
      sub.id === id ? { ...sub, emoji: newEmoji } : sub
    );
    onUpdateSubtitles(selectedClip.clip_id, updated);
  };

  const handleDeleteSubtitle = (id: string) => {
    const updated = selectedClip.subtitles.filter((sub) => sub.id !== id);
    onUpdateSubtitles(selectedClip.clip_id, updated);
  };

  const handleAddSubtitle = () => {
    const lastSub = selectedClip.subtitles[selectedClip.subtitles.length - 1];
    const newStart = lastSub ? lastSub.end_seconds + 0.5 : selectedClip.start_time_seconds;
    const newEnd = Math.min(selectedClip.end_time_seconds, newStart + 2.5);

    const newSub: SubtitleItem = {
      id: `sub_${Date.now()}`,
      start_seconds: Number(newStart.toFixed(1)),
      end_seconds: Number(newEnd.toFixed(1)),
      text: 'Teks subtitle baru',
      highlight_word: 'baru',
      emoji: '✨',
    };

    onUpdateSubtitles(selectedClip.clip_id, [...selectedClip.subtitles, newSub]);
  };

  return (
    <aside className="w-full lg:w-[350px] xl:w-[380px] shrink-0 border-r border-zinc-800 bg-zinc-900/60 flex flex-col h-[calc(100vh-57px)] overflow-hidden">
      {/* Top Tabs */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950/40">
        <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clips'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Klip Viral ({clips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'transcript'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transkrip ({selectedClip.subtitles?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {activeTab === 'clips' ? (
          <>
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Rekomendasi Potongan Viral
              </span>
              <span className="text-[11px] text-zinc-500">
                Pilih untuk preview & edit
              </span>
            </div>

            {clips.map((clip) => {
              const isSelected = selectedClip.clip_id === clip.clip_id;
              const duration = Math.round(clip.end_time_seconds - clip.start_time_seconds);

              return (
                <div
                  key={clip.clip_id}
                  onClick={() => onSelectClip(clip)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-indigo-950/30 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Virality Score Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{clip.virality_score}/100</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Layout badge */}
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        {clip.layout_mode === 'SPLIT_SCREEN' ? 'Split Screen' : 'Single Track'}
                      </span>

                      {/* Duration */}
                      <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {duration}s
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug mb-2">
                    {clip.title}
                  </h4>

                  {/* Hook Explanation Card */}
                  <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 leading-relaxed mb-3">
                    <span className="font-semibold text-amber-400 mr-1">Analisis Hook:</span>
                    {clip.virality_explanation}
                  </div>

                  {/* Bottom Stats & Trigger */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-400">
                    <span>
                      Rentang:{' '}
                      <strong className="text-zinc-200">
                        {clip.start_time_seconds.toFixed(1)}s - {clip.end_time_seconds.toFixed(1)}s
                      </strong>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClip(clip);
                        onSeekTo(clip.start_time_seconds);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play Klip</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* ==========================================
             INTERACTIVE TRANSCRIPT EDITOR
             ========================================== */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Transkrip Subtitle Klip #{selectedClip.clip_id}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Klik detik untuk lompat ke video
                </p>
              </div>

              <button
                onClick={handleAddSubtitle}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Baris Baru</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedClip.subtitles.map((sub, idx) => {
                const isCurrentlyPlaying =
                  currentPlaybackTime >= sub.start_seconds &&
                  currentPlaybackTime <= sub.end_seconds;

                return (
                  <div
                    key={sub.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrentlyPlaying
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-sm shadow-indigo-500/20'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Timestamp & Controls Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        onClick={() => onSeekTo(sub.start_seconds)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                          isCurrentlyPlaying
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                        title="Lompat ke detik ini"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>
                          {sub.start_seconds.toFixed(1)}s - {sub.end_seconds.toFixed(1)}s
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteSubtitle(sub.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtitle Text Input */}
                    <textarea
                      value={sub.text}
                      onChange={(e) => handleSubtitleTextChange(sub.id, e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                      placeholder="Masukkan frasa subtitle pendek (3-5 kata)..."
                    />

                    {/* Highlight Word & Emoji Settings */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
                        <Highlighter className="w-3 h-3 text-amber-400 shrink-0" />
                        <input
                          type="text"
                          value={sub.highlight_word || ''}
                          onChange={(e) => handleSubtitleHighlightChange(sub.id, e.target.value)}
                          placeholder="Highlight kata..."
                          className="w-full bg-transparent text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
                        <Smile className="w-3 h-3 text-indigo-400 shrink-0" />
                        <input
                          type="text"
                          value={sub.emoji || ''}
                          onChange={(e) => handleSubtitleEmojiChange(sub.id, e.target.value)}
                          placeholder="Emoji (🔥)..."
                          className="w-full bg-transparent text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
