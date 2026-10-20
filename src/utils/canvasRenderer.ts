import { ClipItem, FramingConfig, SubtitleStyle } from '../types';

export interface RenderFrameOptions {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  clip: ClipItem;
  framing: FramingConfig;
  subtitleStyle: SubtitleStyle;
  currentLerpSpeakerX: number; // Smoothed speaker X
  currentTime: number;
}

export function calculateCurrentSpeakerX(
  clip: ClipItem,
  currentTime: number
): number {
  if (!clip.camera_keyframes || clip.camera_keyframes.length === 0) {
    return 0.5;
  }

  // Find keyframe closest to current time
  const kfs = [...clip.camera_keyframes].sort(
    (a, b) => a.timestamp_seconds - b.timestamp_seconds
  );

  let targetX = 0.5;
  for (let i = 0; i < kfs.length; i++) {
    if (currentTime >= kfs[i].timestamp_seconds) {
      targetX = kfs[i].speaker_x_center;
    }
  }

  return targetX;
}

export function determineActiveSpeaker(
  clip: ClipItem,
  currentTime: number
): 1 | 2 {
  if (clip.camera_keyframes && clip.camera_keyframes.length > 0) {
    const kfs = [...clip.camera_keyframes].sort(
      (a, b) => a.timestamp_seconds - b.timestamp_seconds
    );
    for (let i = 0; i < kfs.length; i++) {
      if (currentTime >= kfs[i].timestamp_seconds && kfs[i].activeSpeaker) {
        return kfs[i].activeSpeaker as 1 | 2;
      }
    }
  }
  return clip.activeSpeaker || 1;
}

export function renderCanvasFrame({
  canvas,
  video,
  clip,
  framing,
  subtitleStyle,
  currentLerpSpeakerX,
  currentTime,
}: RenderFrameOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx || !video.videoWidth || !video.videoHeight) return;

  const width = canvas.width;
  const height = canvas.height;
  const vWidth = video.videoWidth;
  const vHeight = video.videoHeight;

  // Clear canvas
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, width, height);

  const isSplit =
    framing.mode === 'SPLIT_SCREEN' ||
    (framing.mode === 'AUTO' && clip.layout_mode === 'SPLIT_SCREEN');

  const activeSpeaker = determineActiveSpeaker(clip, currentTime);

  if (isSplit) {
    // ==========================================
    // 2-SPEAKER SPLIT SCREEN (ATAS - BAWAH)
    // ==========================================
    const halfH = height / 2;

    // Speakers definition
    let speakerTop = clip.speaker1 || { x: 0.28, y: 0.42, label: 'Speaker 1' };
    let speakerBottom = clip.speaker2 || { x: 0.72, y: 0.45, label: 'Speaker 2' };

    let topIsActive = activeSpeaker === 1;
    let bottomIsActive = activeSpeaker === 2;

    if (framing.swapSpeakers) {
      const temp = speakerTop;
      speakerTop = speakerBottom;
      speakerBottom = temp;
      topIsActive = activeSpeaker === 2;
      bottomIsActive = activeSpeaker === 1;
    }

    // Manual Pan Overrides & Zoom
    const topCenterX = framing.topSpeakerPanX !== undefined ? framing.topSpeakerPanX : speakerTop.x;
    const topZoom = (framing.topSpeakerZoom || 1.0) * (topIsActive && framing.activeSpeakerHighlight ? 1.05 : 1.0);

    const bottomCenterX = framing.bottomSpeakerPanX !== undefined ? framing.bottomSpeakerPanX : speakerBottom.x;
    const bottomZoom = (framing.bottomSpeakerZoom || 1.0) * (bottomIsActive && framing.activeSpeakerHighlight ? 1.05 : 1.0);

    // TOP FRAME (Aspect ratio 9:8)
    // Target ratio: width / halfH = 720 / 640 = 9:8 = 1.125
    const targetAspectSplit = width / halfH;
    let sH1 = vHeight / topZoom;
    let sW1 = sH1 * targetAspectSplit;
    if (sW1 > vWidth) {
      sW1 = vWidth;
      sH1 = sW1 / targetAspectSplit;
    }
    let sX1 = vWidth * topCenterX - sW1 / 2;
    let sY1 = vHeight * (speakerTop.y || 0.4) - sH1 / 2;
    sX1 = Math.max(0, Math.min(vWidth - sW1, sX1));
    sY1 = Math.max(0, Math.min(vHeight - sH1, sY1));

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, halfH);
    ctx.clip();
    ctx.drawImage(video, sX1, sY1, sW1, sH1, 0, 0, width, halfH);

    // Active glow indicator badge on top frame
    if (topIsActive && framing.activeSpeakerHighlight) {
      ctx.strokeStyle = '#10B981'; // emerald
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, width - 6, halfH - 6);
    }
    ctx.restore();

    // BOTTOM FRAME (Aspect ratio 9:8)
    let sH2 = vHeight / bottomZoom;
    let sW2 = sH2 * targetAspectSplit;
    if (sW2 > vWidth) {
      sW2 = vWidth;
      sH2 = sW2 / targetAspectSplit;
    }
    let sX2 = vWidth * bottomCenterX - sW2 / 2;
    let sY2 = vHeight * (speakerBottom.y || 0.45) - sH2 / 2;
    sX2 = Math.max(0, Math.min(vWidth - sW2, sX2));
    sY2 = Math.max(0, Math.min(vHeight - sH2, sY2));

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, halfH, width, halfH);
    ctx.clip();
    ctx.drawImage(video, sX2, sY2, sW2, sH2, 0, halfH, width, halfH);

    // Active glow indicator badge on bottom frame
    if (bottomIsActive && framing.activeSpeakerHighlight) {
      ctx.strokeStyle = '#10B981'; // emerald
      ctx.lineWidth = 6;
      ctx.strokeRect(3, halfH + 3, width - 6, halfH - 6);
    }
    ctx.restore();

    // Horizontal Divider Bar
    const dThick = framing.dividerThickness || 6;
    ctx.fillStyle = framing.dividerColor || '#10B981';
    ctx.fillRect(0, halfH - dThick / 2, width, dThick);

    // Speaker Names Pills (aesthetic clean tag)
    drawSpeakerTag(ctx, speakerTop.label || 'Speaker 1', 20, 24, topIsActive);
    drawSpeakerTag(ctx, speakerBottom.label || 'Speaker 2', 20, halfH + 24, bottomIsActive);

  } else {
    // ==========================================
    // 1-SPEAKER / SINGLE TRACK FULL 9:16
    // ==========================================
    const targetAspect = 9 / 16;
    let cropH = vHeight;
    let cropW = cropH * targetAspect;

    if (cropW > vWidth) {
      cropW = vWidth;
      cropH = cropW / targetAspect;
    }

    let targetX = currentLerpSpeakerX;
    if (framing.mode === 'CENTER_LOCK') {
      targetX = 0.5;
    } else if (framing.topSpeakerPanX !== undefined && framing.mode === 'SINGLE_TRACK') {
      targetX = framing.topSpeakerPanX;
    }

    let cropX = vWidth * targetX - cropW / 2;
    cropX = Math.max(0, Math.min(vWidth - cropW, cropX));
    let cropY = (vHeight - cropH) / 2;

    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, width, height);
  }

  // ==========================================
  // RENDER DYNAMIC SUBTITLES
  // ==========================================
  renderSubtitlesOnCanvas(ctx, clip, subtitleStyle, currentTime, width, height, isSplit);
}

function drawSpeakerTag(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  isActive: boolean
) {
  ctx.save();
  ctx.font = '600 16px Inter, sans-serif';
  const textMetrics = ctx.measureText(label);
  const tagW = textMetrics.width + 24;
  const tagH = 28;

  // Background pill
  ctx.fillStyle = isActive ? 'rgba(16, 185, 129, 0.85)' : 'rgba(15, 23, 42, 0.75)';
  ctx.beginPath();
  ctx.roundRect(x, y, tagW, tagH, 14);
  ctx.fill();

  ctx.strokeStyle = isActive ? '#34D399' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 12, y + tagH / 2);

  // Active micro dot
  if (isActive) {
    ctx.beginPath();
    ctx.arc(x + tagW - 10, y + tagH / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE047'; // yellow
    ctx.fill();
  }

  ctx.restore();
}

function renderSubtitlesOnCanvas(
  ctx: CanvasRenderingContext2D,
  clip: ClipItem,
  style: SubtitleStyle,
  currentTime: number,
  width: number,
  height: number,
  isSplitScreen: boolean
) {
  if (!clip.subtitles || clip.subtitles.length === 0) return;

  // Find active subtitle
  const sub = clip.subtitles.find(
    (s) => currentTime >= s.start_seconds && currentTime <= s.end_seconds
  );

  if (!sub) return;

  ctx.save();

  // Formatting text
  let rawText = sub.text.trim();
  if (style.uppercase) {
    rawText = rawText.toUpperCase();
  }

  // Calculate Y Position:
  // In Split-Screen mode: automatically place in the center (y = 50% or right on divider)
  // as per anti-face-overlap requirement!
  let yPos = isSplitScreen ? height * 0.50 : (height * (style.yPercent || 78)) / 100;

  // Font setup
  const fontSize = style.fontSize || 44;
  const fontFamily = style.fontFamily || 'Montserrat';
  ctx.font = `900 ${fontSize}px "${fontFamily}", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Words array
  const words = rawText.split(/\s+/);
  const highlightWordClean = (sub.highlight_word || '').toLowerCase().trim();

  // Calculate total line width
  const spaceWidth = ctx.measureText(' ').width;
  let totalWidth = 0;
  const wordMetrics = words.map((w) => {
    const wWidth = ctx.measureText(w).width;
    totalWidth += wWidth;
    return { word: w, width: wWidth };
  });
  totalWidth += spaceWidth * (words.length - 1);

  // Auto-wrap if too wide for 9:16 portrait (max 85% width)
  const maxW = width * 0.88;
  const lines: { words: { word: string; width: number; isHighlight: boolean }[]; width: number }[] = [];

  let currentLineWords: { word: string; width: number; isHighlight: boolean }[] = [];
  let currentLineWidth = 0;

  words.forEach((w) => {
    const cleanW = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isHighlight =
      highlightWordClean.length > 0 &&
      (cleanW.includes(highlightWordClean) || highlightWordClean.includes(cleanW));
    const wWidth = ctx.measureText(w).width;

    if (currentLineWidth + wWidth + (currentLineWords.length > 0 ? spaceWidth : 0) > maxW && currentLineWords.length > 0) {
      lines.push({ words: currentLineWords, width: currentLineWidth });
      currentLineWords = [{ word: w, width: wWidth, isHighlight }];
      currentLineWidth = wWidth;
    } else {
      if (currentLineWords.length > 0) currentLineWidth += spaceWidth;
      currentLineWords.push({ word: w, width: wWidth, isHighlight });
      currentLineWidth += wWidth;
    }
  });

  if (currentLineWords.length > 0) {
    lines.push({ words: currentLineWords, width: currentLineWidth });
  }

  // Draw background box if enabled
  const lineHeight = fontSize * 1.25;
  const totalBoxHeight = lines.length * lineHeight + 24;

  if (style.backgroundOpacity > 0) {
    const maxLineWidth = Math.max(...lines.map((l) => l.width));
    const boxW = Math.min(width - 40, maxLineWidth + 48);
    const boxX = (width - boxW) / 2;
    const boxY = yPos - totalBoxHeight / 2;

    ctx.fillStyle = hexToRgba(style.backgroundColor || '#000000', style.backgroundOpacity);
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, totalBoxHeight, 18);
    ctx.fill();

    if (style.preset === 'neon') {
      ctx.strokeStyle = style.highlightColor || '#06B6D4';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Preset specific styling
  if (style.preset === 'mrbeast') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
  } else if (style.preset === 'neon') {
    ctx.shadowColor = style.highlightColor || '#06B6D4';
    ctx.shadowBlur = 16;
  }

  // Render each line
  const startY = yPos - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, lineIndex) => {
    const curY = startY + lineIndex * lineHeight;
    let startX = (width - line.width) / 2;

    line.words.forEach((item) => {
      const isHl = item.isHighlight;
      const fillCol = isHl ? (style.highlightColor || '#FDE047') : (style.textColor || '#FFFFFF');

      // Stroke
      if (style.strokeWidth > 0) {
        ctx.strokeStyle = style.strokeColor || '#000000';
        ctx.lineWidth = style.strokeWidth * (width / 720); // Scale with resolution
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(item.word, startX + item.width / 2, curY);
      }

      // Fill
      ctx.fillStyle = fillCol;
      ctx.fillText(item.word, startX + item.width / 2, curY);

      startX += item.width + spaceWidth;
    });
  });

  // Render Emoji at the top or end if enabled
  if (style.showEmoji && sub.emoji) {
    ctx.font = `${Math.round(fontSize * 1.1)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.fillText(sub.emoji, width / 2, startY - lineHeight * 0.7);
  }

  ctx.restore();
}

function hexToRgba(hex: string, alpha: number): string {
  let c: string[] | string = hex.replace('#', '');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  } else {
    c = c.match(/.{1,2}/g) || ['00', '00', '00'];
  }
  const r = parseInt(c[0], 16) || 0;
  const g = parseInt(c[1], 16) || 0;
  const b = parseInt(c[2], 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
