import React from 'react';
import { Download, X, CheckCircle2, Film, AlertTriangle, Share2 } from 'lucide-react';
import { ExportProgress, ExportResult } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  progress: ExportProgress;
  result: ExportResult | null;
  onCancel: () => void;
  onClose: () => void;
  onOpenPublish: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  progress,
  result,
  onCancel,
  onClose,
  onOpenPublish,
}) => {
  if (!isOpen) return null;

  const isDone = progress.status === 'completed' && !!result;
  const isFailed = progress.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isDone ? 'Render Selesai!' : 'Merender Video 9:16'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isDone
                  ? 'File MP4 sudah otomatis diunduh'
                  : 'Menggabungkan visual 9:16 + burn subtitle + audio jernih'}
              </p>
            </div>
          </div>

          {(isDone || isFailed) && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar & Visual */}
        {!isDone && !isFailed && (
          <div className="space-y-4 my-6">
            <div className="relative">
              <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                <div
                  style={{ width: `${progress.percent}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-150"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {progress.status === 'initializing' && 'Menyiapkan Canvas & Audio...'}
                {progress.status === 'recording' && 'Merekam Frame 9:16 & Subtitle...'}
                {progress.status === 'finalizing' && 'Mengompres Bitrate 8 Mbps MP4...'}
              </span>
              <span className="text-sm font-bold text-white font-mono">{progress.percent}%</span>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
              <div className="flex justify-between">
                <span>Waktu Klip:</span>
                <span className="text-zinc-200 font-mono">
                  {progress.currentTime.toFixed(1)}s / {progress.duration.toFixed(1)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Output Format:</span>
                <span className="text-emerald-400 font-semibold">
                  720x1280 @ 30 FPS (8 Mbps High Quality)
                </span>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors"
            >
              Batalkan Render
            </button>
          </div>
        )}

        {/* Completed State */}
        {isDone && result && (
          <div className="space-y-4 my-4">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  Video Berhasil Dipotong & Di-render!
                </p>
                <p className="text-[11px] text-zinc-300 font-mono truncate max-w-[260px]">
                  {result.filename}
                </p>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Ukuran: {(result.blob.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={result.downloadUrl}
                download={result.filename}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Ulang File MP4</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onOpenPublish();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Publikasikan Langsung ke Sosmed</span>
              </button>
            </div>
          </div>
        )}

        {/* Cancelled State */}
        {isFailed && (
          <div className="space-y-4 my-4">
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <p className="text-xs text-zinc-300">
                Perekaman video dibatalkan oleh pengguna.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
