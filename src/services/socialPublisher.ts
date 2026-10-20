import { ApiCredentials, ScheduledPost } from '../types';

export interface PublishLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export type LogCallback = (log: PublishLog) => void;

const STORAGE_KEY = 'clipflow_api_credentials';
const POSTS_KEY = 'clipflow_scheduled_posts';

export function loadSavedCredentials(): ApiCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load credentials from storage:', e);
  }
  return {
    youtubeClientId: '',
    youtubeAccessToken: '',
    instagramAccountId: '',
    instagramAccessToken: '',
    facebookPageId: '',
    facebookAccessToken: '',
    sandboxMode: true, // Default to sandbox for seamless immediate testing
  };
}

export function saveCredentials(creds: ApiCredentials) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
  } catch (e) {
    console.error('Failed to save credentials:', e);
  }
}

export function loadScheduledPosts(): ScheduledPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load scheduled posts:', e);
  }
  return [];
}

export function saveScheduledPosts(posts: ScheduledPost[]) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save scheduled posts:', e);
  }
}

// ==========================================
// YOUTUBE SHORTS PUBLISHER (YouTube Data API v3)
// ==========================================
export async function uploadToYouTubeShorts(
  videoBlob: Blob,
  metadata: { title: string; description: string; privacy?: string },
  creds: ApiCredentials,
  onLog: LogCallback
): Promise<{ success: boolean; videoId?: string; videoUrl?: string }> {
  const now = () => new Date().toLocaleTimeString();

  const titleWithShorts = metadata.title.toLowerCase().includes('#shorts')
    ? metadata.title
    : `${metadata.title} #Shorts`;

  if (creds.sandboxMode || !creds.youtubeAccessToken) {
    onLog({
      timestamp: now(),
      type: 'info',
      message: '[SANDBOX] Memulai simulasi upload YouTube Shorts resumable protocol...',
    });
    await delay(700);

    onLog({
      timestamp: now(),
      type: 'info',
      message: `[SANDBOX] Inisialisasi metadata: "${titleWithShorts}" (Part: snippet, status)`,
    });
    await delay(900);

    onLog({
      timestamp: now(),
      type: 'info',
      message: `[SANDBOX] Mengirim binary video 9:16 (${(videoBlob.size / (1024 * 1024)).toFixed(2)} MB)... 100%`,
    });
    await delay(1000);

    const mockId = `yt_${Math.random().toString(36).substring(2, 10)}`;
    const mockUrl = `https://youtube.com/shorts/${mockId}`;
    onLog({
      timestamp: now(),
      type: 'success',
      message: `[SANDBOX] Publikasi berhasil! URL: ${mockUrl}`,
    });

    return { success: true, videoId: mockId, videoUrl: mockUrl };
  }

  // REAL API FLOW
  try {
    onLog({
      timestamp: now(),
      type: 'info',
      message: 'Menginisialisasi sesi resumable upload ke YouTube Data API v3...',
    });

    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.youtubeAccessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': videoBlob.type || 'video/mp4',
        },
        body: JSON.stringify({
          snippet: {
            title: titleWithShorts,
            description: metadata.description || 'Uploaded with ClipFlow AI',
            categoryId: '22',
          },
          status: {
            privacyStatus: metadata.privacy || 'public',
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    if (!initRes.ok) {
      const errBody = await initRes.text();
      throw new Error(`Inisialisasi YouTube gagal (${initRes.status}): ${errBody}`);
    }

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('Tidak menerima header Location untuk resumable upload YouTube.');
    }

    onLog({
      timestamp: now(),
      type: 'info',
      message: `Location upload sesi diterima: ${uploadUrl.substring(0, 45)}...`,
    });

    onLog({
      timestamp: now(),
      type: 'info',
      message: `Mengunggah binary video 9:16 (${(videoBlob.size / (1024 * 1024)).toFixed(2)} MB)...`,
    });

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': videoBlob.type || 'video/mp4',
      },
      body: videoBlob,
    });

    if (!uploadRes.ok) {
      throw new Error(`Unggah binary video YouTube gagal (${uploadRes.status})`);
    }

    const data = await uploadRes.json();
    const videoId = data.id;
    const videoUrl = `https://youtube.com/shorts/${videoId}`;

    onLog({
      timestamp: now(),
      type: 'success',
      message: `YouTube Shorts berhasil tayang! URL: ${videoUrl}`,
    });

    return { success: true, videoId, videoUrl };
  } catch (err: any) {
    onLog({
      timestamp: now(),
      type: 'error',
      message: `Error YouTube Upload: ${err.message}`,
    });
    throw err;
  }
}

// ==========================================
// INSTAGRAM REELS PUBLISHER (Meta Graph API)
// ==========================================
export async function publishToInstagramReels(
  videoBlob: Blob,
  metadata: { caption: string },
  creds: ApiCredentials,
  onLog: LogCallback
): Promise<{ success: boolean; mediaId?: string; postUrl?: string }> {
  const now = () => new Date().toLocaleTimeString();

  if (creds.sandboxMode || !creds.instagramAccessToken || !creds.instagramAccountId) {
    onLog({
      timestamp: now(),
      type: 'info',
      message: '[SANDBOX] Menginisialisasi Instagram Reels Container (Meta Graph API)...',
    });
    await delay(800);

    onLog({
      timestamp: now(),
      type: 'info',
      message: `[SANDBOX] Mengunggah frame vertikal 9:16 (${(videoBlob.size / (1024 * 1024)).toFixed(2)} MB) ke rupload.facebook.com...`,
    });
    await delay(1100);

    onLog({
      timestamp: now(),
      type: 'info',
      message: '[SANDBOX] Memeriksa status encoding video Reels: FINISHED',
    });
    await delay(700);

    const mockId = `ig_${Math.random().toString(36).substring(2, 10)}`;
    const mockUrl = `https://www.instagram.com/reel/${mockId}/`;
    onLog({
      timestamp: now(),
      type: 'success',
      message: `[SANDBOX] Instagram Reels berhasil dipublikasikan! URL: ${mockUrl}`,
    });

    return { success: true, mediaId: mockId, postUrl: mockUrl };
  }

  // REAL API FLOW
  try {
    onLog({
      timestamp: now(),
      type: 'info',
      message: `Membuat Reels Media Container untuk IG User: ${creds.instagramAccountId}...`,
    });

    const initUrl = `https://graph.facebook.com/v21.0/${creds.instagramAccountId}/media`;
    const initRes = await fetch(initUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        upload_type: 'resumable',
        caption: metadata.caption,
        access_token: creds.instagramAccessToken,
      }),
    });

    if (!initRes.ok) {
      const err = await initRes.text();
      throw new Error(`Inisialisasi Reels gagal: ${err}`);
    }

    const initData = await initRes.json();
    const containerId = initData.id;

    onLog({
      timestamp: now(),
      type: 'info',
      message: `Container Reels dibuat (ID: ${containerId}). Mengunggah binary ke Meta RUpload...`,
    });

    const ruploadRes = await fetch(`https://rupload.facebook.com/ig-api-upload/${containerId}`, {
      method: 'POST',
      headers: {
        Authorization: `OAuth ${creds.instagramAccessToken}`,
        offset: '0',
        file_size: String(videoBlob.size),
        'Content-Type': 'application/octet-stream',
      },
      body: videoBlob,
    });

    if (!ruploadRes.ok) {
      throw new Error(`Upload binary ke Instagram gagal (${ruploadRes.status})`);
    }

    onLog({
      timestamp: now(),
      type: 'info',
      message: 'Binary terkirim. Menunggu proses transcode IG Reels...',
    });

    await delay(3000);

    // Publish step
    const pubRes = await fetch(
      `https://graph.facebook.com/v21.0/${creds.instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: creds.instagramAccessToken,
        }),
      }
    );

    if (!pubRes.ok) {
      throw new Error(`Finalisasi publikasi Instagram gagal: ${await pubRes.text()}`);
    }

    const pubData = await pubRes.json();
    const postUrl = `https://www.instagram.com/reel/${pubData.id}/`;

    onLog({
      timestamp: now(),
      type: 'success',
      message: `Instagram Reels live! URL: ${postUrl}`,
    });

    return { success: true, mediaId: pubData.id, postUrl };
  } catch (err: any) {
    onLog({
      timestamp: now(),
      type: 'error',
      message: `Error IG Reels: ${err.message}`,
    });
    throw err;
  }
}

// ==========================================
// FACEBOOK REELS PUBLISHER (Meta Graph API)
// ==========================================
export async function publishToFacebookReels(
  videoBlob: Blob,
  metadata: { caption: string },
  creds: ApiCredentials,
  onLog: LogCallback
): Promise<{ success: boolean; videoId?: string; postUrl?: string }> {
  const now = () => new Date().toLocaleTimeString();

  if (creds.sandboxMode || !creds.facebookAccessToken || !creds.facebookPageId) {
    onLog({
      timestamp: now(),
      type: 'info',
      message: '[SANDBOX] Fase 1: Meminta upload session Facebook Reels...',
    });
    await delay(800);

    onLog({
      timestamp: now(),
      type: 'info',
      message: `[SANDBOX] Fase 2: Mengirim binary video (${(videoBlob.size / (1024 * 1024)).toFixed(2)} MB)...`,
    });
    await delay(1000);

    onLog({
      timestamp: now(),
      type: 'info',
      message: '[SANDBOX] Fase 3: Menyelesaikan sesi upload & mempublikasikan caption...',
    });
    await delay(700);

    const mockId = `fb_${Math.random().toString(36).substring(2, 10)}`;
    const mockUrl = `https://www.facebook.com/reel/${mockId}/`;
    onLog({
      timestamp: now(),
      type: 'success',
      message: `[SANDBOX] Facebook Reels berhasil tayang! URL: ${mockUrl}`,
    });

    return { success: true, videoId: mockId, postUrl: mockUrl };
  }

  // REAL API FLOW
  try {
    onLog({
      timestamp: now(),
      type: 'info',
      message: `Fase 1: Inisialisasi video_reels untuk Facebook Page: ${creds.facebookPageId}...`,
    });

    const phase1Url = `https://graph.facebook.com/v21.0/${creds.facebookPageId}/video_reels`;
    const initRes = await fetch(phase1Url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'start',
        access_token: creds.facebookAccessToken,
      }),
    });

    if (!initRes.ok) {
      throw new Error(`Inisialisasi Facebook Reels gagal: ${await initRes.text()}`);
    }

    const { video_id, upload_url } = await initRes.json();
    const targetUploadUrl = upload_url || `https://rupload.facebook.com/fb-api-upload/${video_id}`;

    onLog({
      timestamp: now(),
      type: 'info',
      message: `Fase 2: Mengunggah binary ke ${targetUploadUrl.substring(0, 45)}...`,
    });

    const uploadRes = await fetch(targetUploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `OAuth ${creds.facebookAccessToken}`,
        offset: '0',
        file_size: String(videoBlob.size),
        'Content-Type': 'application/octet-stream',
      },
      body: videoBlob,
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload binary Facebook Reels gagal (${uploadRes.status})`);
    }

    onLog({
      timestamp: now(),
      type: 'info',
      message: 'Fase 3: Mengirim perintah publish dan caption...',
    });

    const finishRes = await fetch(phase1Url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'finish',
        video_id,
        video_state: 'PUBLISHED',
        description: metadata.caption,
        access_token: creds.facebookAccessToken,
      }),
    });

    if (!finishRes.ok) {
      throw new Error(`Finalisasi Facebook Reels gagal: ${await finishRes.text()}`);
    }

    const postUrl = `https://www.facebook.com/reel/${video_id}/`;
    onLog({
      timestamp: now(),
      type: 'success',
      message: `Facebook Reels berhasil dipublikasikan! URL: ${postUrl}`,
    });

    return { success: true, videoId: video_id, postUrl };
  } catch (err: any) {
    onLog({
      timestamp: now(),
      type: 'error',
      message: `Error Facebook Reels: ${err.message}`,
    });
    throw err;
  }
}

export async function testConnection(
  platform: 'youtube' | 'instagram' | 'facebook',
  creds: ApiCredentials
): Promise<{ success: boolean; message: string }> {
  if (creds.sandboxMode) {
    return {
      success: true,
      message: `[Sandbox] Mode simulasi aktif - koneksi ${platform} siap digunakan tanpa token asli.`,
    };
  }

  try {
    if (platform === 'youtube') {
      if (!creds.youtubeAccessToken) throw new Error('Access Token YouTube belum diisi');
      const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { Authorization: `Bearer ${creds.youtubeAccessToken}` },
      });
      if (!res.ok) throw new Error(`Token YouTube tidak valid (${res.status})`);
      const data = await res.json();
      const channelTitle = data.items?.[0]?.snippet?.title || 'Akun YouTube Valid';
      return { success: true, message: `Terhubung ke channel: ${channelTitle}` };
    }

    if (platform === 'instagram') {
      if (!creds.instagramAccessToken || !creds.instagramAccountId) {
        throw new Error('Instagram Business Account ID atau Access Token belum diisi');
      }
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${creds.instagramAccountId}?fields=username,name&access_token=${creds.instagramAccessToken}`
      );
      if (!res.ok) throw new Error(`Token Instagram tidak valid (${res.status})`);
      const data = await res.json();
      return { success: true, message: `Terhubung ke @${data.username || data.name}` };
    }

    if (platform === 'facebook') {
      if (!creds.facebookAccessToken || !creds.facebookPageId) {
        throw new Error('Facebook Page ID atau Access Token belum diisi');
      }
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${creds.facebookPageId}?fields=name&access_token=${creds.facebookAccessToken}`
      );
      if (!res.ok) throw new Error(`Token Facebook tidak valid (${res.status})`);
      const data = await res.json();
      return { success: true, message: `Terhubung ke Halaman: ${data.name}` };
    }

    return { success: false, message: 'Platform tidak dikenal' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
