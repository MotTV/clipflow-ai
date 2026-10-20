import React, { useState } from 'react';
import {
  X,
  Upload,
  Link,
  Film,
  Sparkles,
  Users,
  User,
  ArrowRight,
  CheckCircle2,
  FileVideo,
} from 'lucide-react';
import { SAMPLE_VIDEOS } from '../data/sampleData';
import { VideoSource } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSource: (source: VideoSource, customPrompt?: string) => void;
  onSelectSample: (index: number) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSelectSource,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'upload' | 'sample' | 'url'>('sample');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmFile = () => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    onSelectSource(
      {
        type: 'file',
        name: selectedFile.name,
        url: objectUrl,
      },
      customPrompt
    );
    onClose();
  };

  const handleConfirmUrl = () => {
    if (!youtubeUrl.trim()) return;
    // For demo purposes, URL gets attached as web source
    onSelectSource(
      {
        type: 'url',
        name: `YouTube: ${youtubeUrl.substring(0, 30)}...`,
        url: youtubeUrl,
      },
      customPrompt
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pilih atau Unggah Video Sumber (16:9)
              </h3>
              <p className="text-xs text-zinc-400">
                Pilih video podcast, interview, atau video bicara yang ingin dipotong ke 9:16
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('sample')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'sample'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Video Sampel Cepat</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>File Lokal (MP4)</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'url'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Link Video / YouTube</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* TAB 1: SAMPLES */}
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Pilih Sampel Berkualitas Tinggi (Siap Uji Seketika)
              </label>

              {SAMPLE_VIDEOS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectSample(idx);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-indigo-500 hover:bg-zinc-800/80 transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-indigo-200">
                        {item.source.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {idx === 0 ? 'Split-Screen 2 Orang' : 'Solo Single-Track'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      {idx === 0
                        ? 'Cocok untuk menguji deteksi 2 pembicara, garis pembatas tengah, dan auto-center subtitle.'
                        : 'Cocok untuk menguji auto-reframe smooth panning 9:16 mengikuti pembicara solo.'}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: LOCAL FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
                }`}
              >
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload-input"
                />
                <label htmlFor="video-upload-input" className="cursor-pointer space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Klik untuk telusuri file atau Drag & Drop ke sini
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Mendukung MP4, WebM (Maks 500 MB)
                    </span>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileVideo className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-white font-medium truncate max-w-xs">
                      {selectedFile.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Masukkan Link Video YouTube atau Direct Video MP4
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                AI akan membaca metadata konten dan merekomendasikan potongan klip terbaik berpotensi viral.
              </p>
            </div>
          )}

          {/* Gemini AI Prompt / Hint Focus */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instruksi Fokus AI Gemini (Opsional)</span>
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Contoh: Fokus pada momen tips bisnis, perdebatan seru, atau hook emosional..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Batal
          </button>

          {activeTab === 'upload' && (
            <button
              onClick={handleConfirmFile}
              disabled={!selectedFile}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analisis File Video</span>
            </button>
          )}

          {activeTab === 'url' && (
            <button
              onClick={handleConfirmUrl}
              disabled={!youtubeUrl.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analisis Link Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
