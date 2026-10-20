import { ClipItem, VideoSource } from "../types";

export const SAMPLE_VIDEOS: { source: VideoSource; clips: ClipItem[] }[] = [
  {
    source: {
      type: "sample",
      name: "Podcast Studio: Rahasia Scale-Up Startup (2 Pembicara)",
      // Stable, CORS-friendly open tech interview video
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      duration: 180,
    },
    clips: [
      {
        clip_id: 1,
        title: "Kunci Terbesar Kenapa 90% Startup Gagal di Tahun Pertama",
        start_time_seconds: 5.0,
        end_time_seconds: 36.0,
        virality_score: 97,
        virality_explanation: "Hook 3 detik pertama sangat provokatif ('Kebanyakan founder buang duit di awal'), intonasi intensif, dan kontras pendapat antara dua pembicara sangat memicu perdebatan di kolom komentar.",
        layout_mode: "SPLIT_SCREEN",
        speaker1: { x: 0.28, y: 0.42, label: "Rian (Host)" },
        speaker2: { x: 0.72, y: 0.45, label: "Budi (Guest Tech Founder)" },
        activeSpeaker: 2,
        camera_keyframes: [
          { timestamp_seconds: 5.0, speaker_x_center: 0.72, speaker_y_center: 0.45, active_speaker_description: "Budi berbicara menjelaskan kesalahan awal", activeSpeaker: 2 },
          { timestamp_seconds: 12.0, speaker_x_center: 0.28, speaker_y_center: 0.42, active_speaker_description: "Rian menyela dengan pertanyaan tajam", activeSpeaker: 1 },
          { timestamp_seconds: 18.5, speaker_x_center: 0.72, speaker_y_center: 0.45, active_speaker_description: "Budi memberikan contoh konkret validasi pasar", activeSpeaker: 2 },
          { timestamp_seconds: 28.0, speaker_x_center: 0.72, speaker_y_center: 0.45, active_speaker_description: "Budi merangkum solusi penting", activeSpeaker: 2 },
        ],
        subtitles: [
          { id: "s1", start_seconds: 5.0, end_seconds: 7.2, text: "Kesalahan terbesar founder pemula", highlight_word: "terbesar", emoji: "🚨" },
          { id: "s2", start_seconds: 7.3, end_seconds: 9.8, text: "adalah bikin produk tanpa market!", highlight_word: "tanpa", emoji: "💸" },
          { id: "s3", start_seconds: 10.0, end_seconds: 12.0, text: "Mereka bakar uang promosi,", highlight_word: "uang", emoji: "🔥" },
          { id: "s4", start_seconds: 12.1, end_seconds: 14.5, text: "tapi solusinya gak dicari orang?", highlight_word: "gak dicari", emoji: "🤔" },
          { id: "s5", start_seconds: 14.6, end_seconds: 17.0, text: "Tepat sekali Rian!", highlight_word: "Tepat", emoji: "🎯" },
          { id: "s6", start_seconds: 17.2, end_seconds: 20.2, text: "Jangan coding satu baris pun", highlight_word: "Jangan", emoji: "🛑" },
          { id: "s7", start_seconds: 20.4, end_seconds: 23.5, text: "sebelum dapat 10 pembeli pertama!", highlight_word: "10 pembeli", emoji: "💰" },
          { id: "s8", start_seconds: 23.8, end_seconds: 27.2, text: "Validasi masalah, bukan khayalan.", highlight_word: "Validasi", emoji: "🧠" },
          { id: "s9", start_seconds: 27.5, end_seconds: 31.0, text: "Itu yang bikin bisnis bertahan!", highlight_word: "bertahan", emoji: "🚀" },
          { id: "s10", start_seconds: 31.2, end_seconds: 35.8, text: "Setuju gak kalian? Tulis pendapatmu!", highlight_word: "Setuju", emoji: "👇" },
        ],
        social_posts: {
          youtube_shorts: {
            title: "Rahasia 10 Pembeli Pertama Sebelum Bikin Startup! #Shorts",
            description: "Banyak founder habis puluhan juta bikin produk tapi gak laku. Ini tips validasi dari praktisi startup! #startup #bisnis #entrepreneur #shorts",
          },
          instagram_reels: {
            caption: "Jangan buang uang untuk produk yang belum tentu dicari orang! 🛑 Validasi dulu dengan 10 pembeli pertama sebelum kamu mulai build besar-besaran.\n\nKalian ada yang pernah ngalamin hal ini? Bagikan ceritamu di komentar ya! 👇🔥\n\n#startupindonesia #bisnisanakmuda #tipsbisnis #reelsviral #entrepreneurmindset",
          },
          facebook_reels: {
            caption: "Kunci keberhasilan bisnis bukan seberapa hebat ide kita, tapi seberapa cepat kita membuktikan ada orang yang mau bayar. Simak obrolan menarik ini dan tag teman founder kamu! 💡🚀\n\n#BisnisSukses #PeluangUsaha #InspirasiBisnis #ReelsFacebook",
          },
        },
      },
      {
        clip_id: 2,
        title: "Mindset Cash Flow vs Valuasi Palsu",
        start_time_seconds: 40.0,
        end_time_seconds: 70.0,
        virality_score: 93,
        virality_explanation: "Topik panas mengenai bakar uang vs profit nyata, bahasa tajam dan relevan untuk semua pengusaha UMKM hingga Tech.",
        layout_mode: "SPLIT_SCREEN",
        speaker1: { x: 0.28, y: 0.42, label: "Rian (Host)" },
        speaker2: { x: 0.72, y: 0.45, label: "Budi (Guest Tech Founder)" },
        activeSpeaker: 1,
        camera_keyframes: [
          { timestamp_seconds: 40.0, speaker_x_center: 0.28, speaker_y_center: 0.42, active_speaker_description: "Rian menanyakan fenomena unicorn rugi", activeSpeaker: 1 },
          { timestamp_seconds: 48.0, speaker_x_center: 0.72, speaker_y_center: 0.45, active_speaker_description: "Budi menjelaskan kas riil adalah raja", activeSpeaker: 2 },
          { timestamp_seconds: 60.0, speaker_x_center: 0.72, speaker_y_center: 0.45, active_speaker_description: "Budi menutup dengan nasihat keuangan", activeSpeaker: 2 },
        ],
        subtitles: [
          { id: "s20", start_seconds: 40.0, end_seconds: 43.0, text: "Banyak yang pamer valuasi miliaran,", highlight_word: "valuasi", emoji: "🦄" },
          { id: "s21", start_seconds: 43.2, end_seconds: 46.5, text: "tapi saldo bank kosong melompong?", highlight_word: "kosong", emoji: "💀" },
          { id: "s22", start_seconds: 46.8, end_seconds: 50.0, text: "Cash flow adalah raja!", highlight_word: "raja", emoji: "👑" },
          { id: "s23", start_seconds: 50.2, end_seconds: 54.0, text: "Valuasi cuma cerita di atas kertas,", highlight_word: "kertas", emoji: "📄" },
          { id: "s24", start_seconds: 54.2, end_seconds: 58.0, text: "tapi profit nyata yang bayar gaji tim!", highlight_word: "profit", emoji: "💵" },
          { id: "s25", start_seconds: 58.2, end_seconds: 62.5, text: "Fokus ke unit economics positif,", highlight_word: "positif", emoji: "📈" },
          { id: "s26", start_seconds: 62.8, end_seconds: 66.0, text: "maka bisnismu tak terkalahkan!", highlight_word: "tak terkalahkan", emoji: "🛡️" },
          { id: "s27", start_seconds: 66.2, end_seconds: 69.8, text: "Save video ini biar gak lupa!", highlight_word: "Save", emoji: "📌" },
        ],
        social_posts: {
          youtube_shorts: {
            title: "Valuasi Cuma Khayalan, CASH FLOW Adalah Nyata! #Shorts",
            description: "Jangan tergiur gelar startup sebelum bisnismu menghasilkan profit mandiri! #keuangan #investasi #bisnis #shorts",
          },
          instagram_reels: {
            caption: "Profit > Valuasi! 💰 Jangan tertipu angka di atas kertas kalau kas perusahaan kering. Fokus bangun bisnis yang menguntungkan sejak hari pertama.\n\nKomen 'SETUJU' kalau kamu sepakat! 🔥\n\n#tipskeuangan #manajemenbisnis #umkmindonesia #reelsviral",
          },
          facebook_reels: {
            caption: "Nasihat emas untuk siapa saja yang sedang membangun usaha. Uang kas adalah nafas bisnis kita. Bagikan jika postingan ini bermanfaat! 👍\n\n#PengusahaMuda #EdukasiBisnis #ReelsViral",
          },
        },
      },
    ],
  },
  {
    source: {
      type: "sample",
      name: "Keynote Talk: Disrupsi AI & Peluang Karir Masa Depan",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: 120,
    },
    clips: [
      {
        clip_id: 3,
        title: "AI Tidak Menggantikanmu, Tapi Orang yang Pakai AI!",
        start_time_seconds: 2.0,
        end_time_seconds: 32.0,
        virality_score: 98,
        virality_explanation: "Super relatable untuk pekerja modern & kreator, pesan tegas dan call-to-action yang mendorong penonton menguasai AI tools.",
        layout_mode: "SINGLE_TRACK",
        camera_keyframes: [
          { timestamp_seconds: 2.0, speaker_x_center: 0.50, speaker_y_center: 0.38, active_speaker_description: "Pembicara di tengah panggung" },
          { timestamp_seconds: 12.0, speaker_x_center: 0.42, speaker_y_center: 0.38, active_speaker_description: "Pembicara bergerak sedikit ke kiri" },
          { timestamp_seconds: 22.0, speaker_x_center: 0.55, speaker_y_center: 0.38, active_speaker_description: "Pembicara bergerak ke kanan panggung" },
        ],
        subtitles: [
          { id: "s30", start_seconds: 2.0, end_seconds: 4.5, text: "Apakah AI akan merebut pekerjaanmu?", highlight_word: "pekerjaanmu", emoji: "🤖" },
          { id: "s31", start_seconds: 4.8, end_seconds: 7.0, text: "Jawabannya: TIDAK!", highlight_word: "TIDAK", emoji: "⚡" },
          { id: "s32", start_seconds: 7.2, end_seconds: 10.5, text: "Tapi orang yang menguasai AI,", highlight_word: "menguasai", emoji: "🦾" },
          { id: "s33", start_seconds: 10.8, end_seconds: 13.8, text: "akan menggantikan posisimu dengan cepat!", highlight_word: "menggantikan", emoji: "💨" },
          { id: "s34", start_seconds: 14.0, end_seconds: 17.5, text: "Kecepatan kerja mereka 10x lipat,", highlight_word: "10x lipat", emoji: "🏎️" },
          { id: "s35", start_seconds: 17.8, end_seconds: 21.0, text: "dan kualitasnya jauh lebih presisi.", highlight_word: "presisi", emoji: "🎯" },
          { id: "s36", start_seconds: 21.2, end_seconds: 25.5, text: "Mulailah belajar hari ini juga,", highlight_word: "belajar", emoji: "📚" },
          { id: "s37", start_seconds: 25.8, end_seconds: 31.5, text: "sebelum kamu tertinggal di masa lalu!", highlight_word: "tertinggal", emoji: "⏳" },
        ],
        social_posts: {
          youtube_shorts: {
            title: "AI Gak Bakal Gantiin Kamu, TAPI... 😱 #Shorts",
            description: "Fakta keras tentang AI di dunia kerja tahun 2026. Siapkah kamu bersaing? #artificialintelligence #karir #productivity #shorts",
          },
          instagram_reels: {
            caption: "Kebenaran pahit: AI bukan musuhmu, tapi mereka yang cepat beradaptasi dengan AI adalah kompetitor utamamu! 🦾🔥\n\nMau mulai belajar AI dari mana? Tulis bidang pekerjaanmu di bawah!\n\n#teknologikini #aitools #karirgemilang #reelsviral",
          },
          facebook_reels: {
            caption: "Pesan penting untuk generasi profesional masa kini. Adaptasi adalah kunci bertahan dan menang di era otomasi. Simak selengkapnya! 🌐✨\n\n#InovasiTeknologi #MasaDepanKerja #EdukasiDigital",
          },
        },
      },
    ],
  },
];
