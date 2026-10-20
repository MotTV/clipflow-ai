export interface CameraKeyframe {
  timestamp_seconds: number;
  speaker_x_center: number; // 0.0 to 1.0
  speaker_y_center?: number; // 0.0 to 1.0
  active_speaker_description?: string;
  activeSpeaker?: 1 | 2;
}

export interface SubtitleItem {
  id: string;
  start_seconds: number;
  end_seconds: number;
  text: string;
  highlight_word?: string;
  emoji?: string;
}

export interface SocialPosts {
  youtube_shorts: {
    title: string;
    description: string;
  };
  instagram_reels: {
    caption: string;
  };
  facebook_reels: {
    caption: string;
  };
}

export interface ClipItem {
  clip_id: number;
  title: string;
  start_time_seconds: number;
  end_time_seconds: number;
  virality_score: number;
  virality_explanation: string;
  layout_mode: "SINGLE_TRACK" | "SPLIT_SCREEN";
  speaker1?: { x: number; y: number; label: string };
  speaker2?: { x: number; y: number; label: string };
  activeSpeaker?: 1 | 2;
  camera_keyframes: CameraKeyframe[];
  subtitles: SubtitleItem[];
  social_posts: SocialPosts;
}

export type SubtitlePreset = "hormozi" | "mrbeast" | "clean" | "neon" | "custom";

export interface SubtitleStyle {
  preset: SubtitlePreset;
  fontFamily: string;
  fontSize: number;
  yPercent: number; // 0 - 100
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  backgroundOpacity: number;
  uppercase: boolean;
  showEmoji: boolean;
  karaokeMode: boolean;
}

export interface FramingConfig {
  mode: "AUTO" | "SINGLE_TRACK" | "SPLIT_SCREEN" | "CENTER_LOCK";
  swapSpeakers: boolean;
  topSpeakerPanX: number; // 0.0 to 1.0
  topSpeakerZoom: number; // 1.0 to 1.5
  bottomSpeakerPanX: number; // 0.0 to 1.0
  bottomSpeakerZoom: number; // 1.0 to 1.5
  dividerColor: string;
  dividerThickness: number;
  activeSpeakerHighlight: boolean;
}

export interface ApiCredentials {
  youtubeClientId: string;
  youtubeAccessToken: string;
  instagramAccountId: string;
  instagramAccessToken: string;
  facebookPageId: string;
  facebookAccessToken: string;
  sandboxMode: boolean;
}

export interface ScheduledPost {
  id: string;
  clipTitle: string;
  platform: "youtube" | "instagram" | "facebook";
  titleOrCaption: string;
  scheduledTime: string;
  status: "scheduled" | "published" | "failed";
  postUrl?: string;
  createdAt: string;
}

export interface VideoSource {
  type: "file" | "url" | "sample";
  name: string;
  url: string;
  duration?: number;
}
