import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY });
});

// Video Analysis using Gemini
app.post('/api/analyze', async (req, res) => {
  try {
    const { videoTitle, videoDuration, promptHint, transcriptText } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Kamu adalah AI Video Clipper & Active Speaker Tracking Engine sekelas Opus Clip.
Tugasmu adalah menganalisis konten video dan menghasilkan potongan klip vertikal 9:16 terbaik yang berpotensi viral di YouTube Shorts, Instagram Reels, dan Facebook Reels.

Aturan ketat:
1. KURASI KLIP: Buat 2-4 segmen klip terbaik berdurasi 20-50 detik dengan Hook kuat di 3 detik pertama. Pastikan startTime dan endTime realistis di dalam durasi video total (${videoDuration || 120} detik).
2. ACTIVE SPEAKER TRACKING: Berikan koordinat titik tengah horizontal wajah pembicara aktif ('speaker_x_center' 0.00 - 1.00, tengah = 0.50) dan vertikal ('speaker_y_center' 0.00 - 1.00) per keyframe waktu.
   - Jika 2 orang berbicara bergantian cepat atau podcast/interview 2 orang, gunakan layout_mode: 'SPLIT_SCREEN', serta berikan 'speaker1': {x, y, label} dan 'speaker2': {x, y, label}, serta activeSpeaker (1 atau 2).
   - Jika 1 orang, gunakan layout_mode: 'SINGLE_TRACK'.
3. DYNAMIC SUBTITLES: Buat transkrip akurat dipecah per frasa pendek (3-5 kata per baris), dengan 'highlight_word' (kata paling emosional/penting) dan 'emoji' relevan.
4. SOCIAL MEDIA METADATA: Judul, caption, dan hashtag khusus untuk YouTube Shorts, Instagram Reels, dan Facebook Reels.

Keluarkan HANYA format JSON valid sesuai schema.`;

    const userPrompt = `Analisis video berikut:
Judul/Deskripsi: ${videoTitle || 'Podcast & Wawancara Inspiratif'}
Durasi Video: ${videoDuration || 120} detik
Catatan/Konteks Tambahan: ${promptHint || 'Temukan momen hook paling emosional dan berbobot'}
Transkrip Mentah (jika ada): ${transcriptText || 'Diskusi seputar tips sukses, kesalahan fatal, dan strategi pertumbuhan bisnis'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing video with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Gagal menganalisis video dengan Gemini.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClipFlow AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
