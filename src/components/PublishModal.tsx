import React, { useState } from 'react';
import {
  X,
  Youtube,
  Instagram,
  Facebook,
  Send,
  Calendar,
  Terminal,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ApiCredentials, ClipItem, ScheduledPost } from '../types';
import {
  LogCallback,
  PublishLog,
  loadScheduledPosts,
  publishToFacebookReels,
  publishToInstagramReels,
  saveScheduledPosts,
  uploadToYouTubeShorts,
} from '../services/socialPublisher';

interface PublishModalProps {
  isOpen: boolean;
  selectedClip: ClipItem;
  renderedBlob: Blob | null;
  apiCreds: ApiCredentials;
  initialPlatform?: 'youtube' | 'instagram' | 'facebook';
  onClose: () => void;
  onOpenSettings: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  selectedClip,
  renderedBlob,
  apiCreds,
  initialPlatform = 'youtube',
  onClose,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'facebook'>(initialPlatform);
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDateTime, setScheduleDateTime] = useState<string>(() => {
    const d = new Date(Date.now() + 3600 * 1000 * 4); // 4 hours later
    return d.toISOString().slice(0, 16);
  });

  // Prefilled metadata based on platform
  const [ytTitle, setYtTitle] = useState(selectedClip.social_posts.youtube_shorts.title);
  const [ytDescription, setYtDescription] = useState(
    selectedClip.social_posts.youtube_shorts.description
  );
  const [igCaption, setIgCaption] = useState(selectedClip.social_posts.instagram_reels.caption);
  const [fbCaption, setFbCaption] = useState(selectedClip.social_posts.facebook_reels.caption);

  const [isPublishing, setIsPublishing] = useState(false);
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => loadScheduledPosts());

  const addLog: LogCallback = (log) => {
    setLogs((prev) => [...prev, log]);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishedUrl(null);
    setLogs([]);

    // Create a fallback mock blob if user publishes before running full render
    const targetBlob =
      renderedBlob ||
      new Blob(['dummy video payload for 9:16 vertical clip'], { type: 'video/mp4' });

    try {
      if (publishMode === 'schedule') {
        addLog({
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `Menjadwalkan postingan ke ${platform.toUpperCase()} untuk tanggal: ${scheduleDateTime}...`,
        });

        const newPost: ScheduledPost = {
          id: `sch_${Date.now()}`,
          clipTitle: selectedClip.title,
          platform,
          titleOrCaption: platform === 'youtube' ? ytTitle : platform === 'instagram' ? igCaption : fbCaption,
          scheduledTime: scheduleDateTime,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
        };

        const updated = [newPost, ...scheduledPosts];
        setScheduledPosts(updated);
        saveScheduledPosts(updated);

        await new Promise((r) => setTimeout(r, 600));
        addLog({
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: 'Postingan berhasil dimasukkan ke antrean auto-scheduler!',
        });
        setIsPublishing(false);
        return;
      }

      if (platform === 'youtube') {
        const res = await uploadToYouTubeShorts(
          targetBlob,
          { title: ytTitle, description: ytDescription },
          apiCreds,
          addLog
        );
        if (res.videoUrl) setPublishedUrl(res.videoUrl);
      } else if (platform === 'instagram') {
        const res = await publishToInstagramReels(
          targetBlob,
          { caption: igCaption },
          apiCreds,
          addLog
        );
        if (res.postUrl) setPublishedUrl(res.postUrl);
      } else if (platform === 'facebook') {
        const res = await publishToFacebookReels(
          targetBlob,
          { caption: fbCaption },
          apiCreds,
          addLog
        );
        if (res.postUrl) setPublishedUrl(res.postUrl);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Publikasi & Jadwal Konten 9:16
              </h3>
              <p className="text-xs text-zinc-400">
                Unggah langsung ke Shorts/Reels atau jadwalkan tayang otomatis
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Platform Tab Selection */}
          <div className="grid grid-cols-3 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              onClick={() => setPlatform('youtube')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                platform === 'youtube'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube Shorts</span>
            </button>

            <button
              onClick={() => setPlatform('instagram')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                platform === 'instagram'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram Reels</span>
            </button>

            <button
              onClick={() => setPlatform('facebook')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                platform === 'facebook'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook Reels</span>
            </button>
          </div>

          {/* Sandbox Notice */}
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className={`w-2.5 h-2.5 rounded-full ${apiCreds.sandboxMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>
                Status API:{' '}
                <strong className={apiCreds.sandboxMode ? 'text-amber-400' : 'text-emerald-400'}>
                  {apiCreds.sandboxMode ? 'Mode Sandbox / Simulasi Aktif' : 'Koneksi Token Asli'}
                </strong>
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-indigo-400 hover:underline text-[11px] font-semibold"
            >
              Ubah Kredensial & Token
            </button>
          </div>

          {/* Publishing Mode: Now vs Schedule */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setPublishMode('now')}
              className={`p-3 rounded-xl border text-left transition-all ${
                publishMode === 'now'
                  ? 'bg-indigo-950/40 border-indigo-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <span className="font-bold block flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Post Sekarang
              </span>
              <span className="text-[10px] text-zinc-500">Unggah dan tayang langsung</span>
            </button>

            <button
              onClick={() => setPublishMode('schedule')}
              className={`p-3 rounded-xl border text-left transition-all ${
                publishMode === 'schedule'
                  ? 'bg-indigo-950/40 border-indigo-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <span className="font-bold block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Jadwalkan Tayang
              </span>
              <span className="text-[10px] text-zinc-500">Pilih waktu rilis optimal</span>
            </button>
          </div>

          {/* Date Picker if Schedule */}
          {publishMode === 'schedule' && (
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pilih Tanggal & Jam Tayang (WIB):</span>
              </label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Dynamic Inputs according to platform */}
          {platform === 'youtube' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Judul YouTube Shorts (Maks 100 Karakter)
                </label>
                <input
                  type="text"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Deskripsi & Tag
                </label>
                <textarea
                  value={ytDescription}
                  onChange={(e) => setYtDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          )}

          {platform === 'instagram' && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Caption & Hashtags Instagram Reels
              </label>
              <textarea
                value={igCaption}
                onChange={(e) => setIgCaption(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>
          )}

          {platform === 'facebook' && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Caption Facebook Reels
              </label>
              <textarea
                value={fbCaption}
                onChange={(e) => setFbCaption(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>
          )}

          {/* Trigger Publish Button */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 hover:from-emerald-300 hover:to-indigo-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isPublishing
                ? 'Sedang Memproses...'
                : publishMode === 'schedule'
                ? `Jadwalkan ke ${platform.toUpperCase()}`
                : `Publikasikan Sekarang ke ${platform.toUpperCase()}`}
            </span>
          </button>

          {/* Live Terminal Console Log */}
          {logs.length > 0 && (
            <div className="bg-black rounded-xl border border-zinc-800 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                <span className="flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Live API Console Log
                </span>
                {isPublishing && <span className="animate-pulse text-emerald-400">Streaming...</span>}
              </div>

              <div className="font-mono text-[11px] space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-emerald-300'
                        : 'text-zinc-300'
                    }`}
                  >
                    <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>

              {publishedUrl && (
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold">Tautan Tayang:</span>
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-white hover:text-emerald-300 underline font-mono font-bold"
                  >
                    <span>{publishedUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Scheduled Posts Queue */}
          {scheduledPosts.length > 0 && (
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Antrean Postingan Terjadwal ({scheduledPosts.length})
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                {scheduledPosts.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[340px]">
                      <span className="font-bold text-white block truncate">{sp.clipTitle}</span>
                      <span className="text-[10px] text-zinc-400">
                        {sp.platform.toUpperCase()} • Jadwal: {new Date(sp.scheduledTime).toLocaleString()}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {sp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
