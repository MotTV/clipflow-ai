import React from 'react';
import {
  Scissors,
  Sparkles,
  Download,
  Share2,
  Settings,
  Upload,
  PlaySquare,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ApiCredentials, VideoSource } from '../types';

interface HeaderProps {
  currentSource: VideoSource;
  apiCreds: ApiCredentials;
  onOpenUpload: () => void;
  onOpenApiSettings: () => void;
  onOpenPublish: () => void;
  onStartExport: () => void;
  onLoadSample: (index: number) => void;
  isAnalyzing: boolean;
  onAnalyzeWithGemini: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSource,
  apiCreds,
  onOpenUpload,
  onOpenApiSettings,
  onOpenPublish,
  onStartExport,
  onLoadSample,
  isAnalyzing,
  onAnalyzeWithGemini,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  ClipFlow<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Opus Pro Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-[240px] sm:max-w-xs font-medium">
                {currentSource.name}
              </p>
            </div>
          </div>
        </div>

        {/* Center Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLoadSample(0)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors"
            title="Muat sample podcast wawancara 2 orang"
          >
            <PlaySquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sample Podcast (2 Speaker)</span>
          </button>

          <button
            onClick={() => onLoadSample(1)}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors"
            title="Muat sample talk solo 1 orang"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Sample Solo Talk</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-300" />
            <span>Ganti Video</span>
          </button>

          <button
            onClick={onAnalyzeWithGemini}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : 'text-emerald-300'}`} />
            <span>{isAnalyzing ? 'Menganalisis Gemini...' : 'Re-analisis AI'}</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Sandbox Status badge */}
          <div
            onClick={onOpenApiSettings}
            className="cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${apiCreds.sandboxMode ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>{apiCreds.sandboxMode ? 'Sandbox Aktif' : 'Live API'}</span>
          </div>

          <button
            onClick={onOpenApiSettings}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Pengaturan Integrasi API (YouTube, Instagram, Facebook)"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenPublish}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Publish Sosmed</span>
          </button>

          <button
            onClick={onStartExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-lg shadow-md shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Render MP4 9:16</span>
          </button>
        </div>
      </div>
    </header>
  );
};
