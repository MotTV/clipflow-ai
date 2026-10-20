import React, { useState } from 'react';
import {
  X,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Youtube,
  Instagram,
  Facebook,
  LogIn,
  Save,
  HelpCircle,
} from 'lucide-react';
import { ApiCredentials } from '../types';
import { testConnection } from '../services/socialPublisher';

interface ApiSettingsModalProps {
  isOpen: boolean;
  creds: ApiCredentials;
  onSave: (creds: ApiCredentials) => void;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  creds,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<ApiCredentials>({ ...creds });
  const [testResult, setTestResult] = useState<{
    platform: string;
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async (platform: 'youtube' | 'instagram' | 'facebook') => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(platform, form);
      setTestResult({ platform, success: res.success, message: res.message });
    } catch (err: any) {
      setTestResult({ platform, success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: form.youtubeClientId || '855424564882-demo-client-id.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/youtube.upload',
          callback: (response: any) => {
            if (response.access_token) {
              setForm((prev) => ({ ...prev, youtubeAccessToken: response.access_token }));
              setTestResult({
                platform: 'youtube',
                success: true,
                message: 'OAuth Google Identity Services Berhasil! Token aktif.',
              });
            }
          },
        });
        client.requestAccessToken();
      } else {
        // Fallback simulated OAuth token for testing
        const simulatedToken = `ya29.simulated_${Math.random().toString(36).substring(2, 15)}`;
        setForm((prev) => ({ ...prev, youtubeAccessToken: simulatedToken }));
        setTestResult({
          platform: 'youtube',
          success: true,
          message: 'Simulasi OAuth Google berhasil menghasilkan token pengujian!',
        });
      }
    } catch (e: any) {
      console.error('Google OAuth Error:', e);
    }
  };

  const handleSaveAndClose = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pengaturan Integrasi API & OAuth
              </h3>
              <p className="text-xs text-zinc-400">
                Hubungkan YouTube Shorts, Instagram Reels, dan Facebook Reels
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Sandbox Toggle */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-emerald-950/40 rounded-xl border border-indigo-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Mode Sandbox / Simulasi API</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Aktifkan mode ini jika ingin mencoba alur publish tanpa perlu token API asli.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.sandboxMode}
                onChange={(e) => setForm({ ...form, sandboxMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Test Alert Banner if any */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* 1. YouTube Data API */}
          <div className="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-white">YouTube Shorts (Data API v3)</span>
              </div>

              <button
                type="button"
                onClick={() => handleTest('youtube')}
                disabled={isTesting}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
              >
                Tes Koneksi
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Google OAuth Client ID (Opsional)
                </label>
                <input
                  type="text"
                  value={form.youtubeClientId}
                  onChange={(e) => setForm({ ...form, youtubeClientId: e.target.value })}
                  placeholder="e.g. xxxxxxxx.apps.googleusercontent.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  YouTube OAuth Access Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={form.youtubeAccessToken}
                    onChange={(e) => setForm({ ...form, youtubeAccessToken: e.target.value })}
                    placeholder="Bearer token (ya29.xxxx)"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                    title="Login dengan Google OAuth"
                  >
                    <LogIn className="w-3.5 h-3.5 text-red-400" />
                    <span>OAuth Google</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Instagram Graph API */}
          <div className="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-bold text-white">Instagram Reels (Meta Graph API)</span>
              </div>

              <button
                type="button"
                onClick={() => handleTest('instagram')}
                disabled={isTesting}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
              >
                Tes Koneksi
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Instagram Business Account ID
                </label>
                <input
                  type="text"
                  value={form.instagramAccountId}
                  onChange={(e) => setForm({ ...form, instagramAccountId: e.target.value })}
                  placeholder="e.g. 17841400000000000"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Meta User / Page Access Token
                </label>
                <input
                  type="password"
                  value={form.instagramAccessToken}
                  onChange={(e) => setForm({ ...form, instagramAccessToken: e.target.value })}
                  placeholder="EAABxxxxxxxxxxxx..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Facebook Reels Graph API */}
          <div className="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-white">Facebook Reels (Page Video API)</span>
              </div>

              <button
                type="button"
                onClick={() => handleTest('facebook')}
                disabled={isTesting}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
              >
                Tes Koneksi
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Facebook Page ID</label>
                <input
                  type="text"
                  value={form.facebookPageId}
                  onChange={(e) => setForm({ ...form, facebookPageId: e.target.value })}
                  placeholder="e.g. 1048291048201"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Facebook Page Access Token
                </label>
                <input
                  type="password"
                  value={form.facebookAccessToken}
                  onChange={(e) => setForm({ ...form, facebookAccessToken: e.target.value })}
                  placeholder="EAAGxxxxxxxxxxxx..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
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
          <button
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Kredensial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
