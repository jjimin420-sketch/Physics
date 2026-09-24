// Video utility functions for file extraction, thumbnail generation, and server uploads

export interface VideoMetadata {
  durationFormatted: string;
  durationSeconds: number;
  thumbnailDataUrl: string;
  fileSizeFormatted: string;
  fileName: string;
}

/**
 * Format bytes to readable size (e.g. 15.4 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format seconds to MM:SS or HH:MM:SS นาที
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00 นาที';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} ชม.`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} นาที`;
}

/**
 * Transforms various video links (YouTube, Google Drive, Dropbox, Vimeo) into their proper playable or embeddable URLs.
 */
export function normalizeVideoUrl(rawUrl: string | undefined): {
  url: string;
  isDirect: boolean;
  isEmbed: boolean;
  provider: 'file' | 'youtube' | 'drive' | 'vimeo' | 'external';
} {
  if (!rawUrl) {
    return { url: '', isDirect: false, isEmbed: false, provider: 'external' };
  }
  const trimmed = rawUrl.trim();

  // Local uploads or blob/data
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('blob:') || trimmed.startsWith('data:video/')) {
    return { url: trimmed, isDirect: true, isEmbed: false, provider: 'file' };
  }

  // YouTube normalization (standard watch, youtu.be, shorts, embed)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      url: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      isDirect: false,
      isEmbed: true,
      provider: 'youtube'
    };
  }

  // Google Drive preview normalization (converts /view to /preview)
  const gdriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      url: `https://drive.google.com/file/d/${fileId}/preview`,
      isDirect: false,
      isEmbed: true,
      provider: 'drive'
    };
  }

  // Dropbox direct link normalization
  if (trimmed.includes('dropbox.com')) {
    const directDropbox = trimmed.replace(/[?&]dl=0/i, '').replace(/\?dl=1/i, '') + '?raw=1';
    return {
      url: directDropbox,
      isDirect: true,
      isEmbed: false,
      provider: 'file'
    };
  }

  // Vimeo normalization
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      url: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      isDirect: false,
      isEmbed: true,
      provider: 'vimeo'
    };
  }

  // Direct video file extension check
  const clean = trimmed.split('?')[0].toLowerCase();
  const isDirect = (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.mkv')
  );

  return {
    url: trimmed,
    isDirect,
    isEmbed: !isDirect,
    provider: isDirect ? 'file' : 'external'
  };
}

/**
 * Determines if a video URL is a direct playable file or an embed/YouTube
 */
export function isDirectVideoFile(url: string | undefined): boolean {
  if (!url) return false;
  return normalizeVideoUrl(url).isDirect;
}

/**
 * Automatically extracts duration and captures a real frame thumbnail from video file
 */
export async function extractVideoMetadataAndThumbnail(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const defaultThumbnail =
      'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80';
    const fileSizeFormatted = formatBytes(file.size);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    // Timeout safety in case video cannot decode frame
    const safetyTimeout = setTimeout(() => {
      cleanup();
      resolve({
        durationFormatted: '15:00 นาที',
        durationSeconds: 900,
        thumbnailDataUrl: defaultThumbnail,
        fileSizeFormatted,
        fileName: file.name
      });
    }, 6000);

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const durationFormatted = formatDuration(duration);

      // Seek to 1 second or 25% of the video to grab a clear lecture frame
      const seekTime = duration > 2 ? Math.min(2.0, duration * 0.25) : 0.5;
      video.currentTime = seekTime;

      video.onseeked = () => {
        clearTimeout(safetyTimeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(640, video.videoWidth || 640);
          canvas.height = Math.min(360, video.videoHeight || 360);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.82);
            cleanup();
            resolve({
              durationFormatted,
              durationSeconds: Math.round(duration),
              thumbnailDataUrl: thumbnail,
              fileSizeFormatted,
              fileName: file.name
            });
            return;
          }
        } catch (err) {
          console.warn('Canvas frame capture error:', err);
        }
        cleanup();
        resolve({
          durationFormatted,
          durationSeconds: Math.round(duration),
          thumbnailDataUrl: defaultThumbnail,
          fileSizeFormatted,
          fileName: file.name
        });
      };
    };

    video.onerror = () => {
      clearTimeout(safetyTimeout);
      cleanup();
      resolve({
        durationFormatted: '15:00 นาที',
        durationSeconds: 900,
        thumbnailDataUrl: defaultThumbnail,
        fileSizeFormatted,
        fileName: file.name
      });
    };
  });
}

/**
 * Uploads a video file to the server API via raw binary streaming.
 * Highly performant, supports files up to 500MB+ without memory crashes or base64 overhead.
 */
export async function uploadVideoFileToServer(
  file: File,
  onProgress?: (percent: number, loadedBytes?: number, totalBytes?: number) => void
): Promise<{ url: string; filename: string; fileSize: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const encodedName = encodeURIComponent(file.name);
    const mime = encodeURIComponent(file.type || 'video/mp4');

    xhr.open('POST', `/api/upload-stream?filename=${encodedName}&type=${mime}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          const pct = Math.min(99, Math.round((e.loaded / e.total) * 100));
          onProgress(pct, e.loaded, e.total);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100, file.size, file.size);
          resolve({
            url: res.url,
            filename: res.filename,
            fileSize: res.fileSize || formatBytes(file.size)
          });
        } catch (err) {
          reject(new Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง'));
        }
      } else {
        console.warn(`Streaming upload status ${xhr.status}, attempting JSON upload fallback...`);
        fallbackBase64Upload(file, onProgress).then(resolve).catch(reject);
      }
    };

    xhr.onerror = () => {
      console.warn('Streaming network error, attempting JSON upload fallback...');
      fallbackBase64Upload(file, onProgress).then(resolve).catch(reject);
    };

    xhr.ontimeout = () => {
      reject(new Error('การอัปโหลดใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'));
    };

    xhr.send(file);
  });
}

function fallbackBase64Upload(
  file: File,
  onProgress?: (percent: number, loadedBytes?: number, totalBytes?: number) => void
): Promise<{ url: string; filename: string; fileSize: string }> {
  return new Promise((resolve, reject) => {
    // Only attempt base64 for files smaller than 25MB to prevent memory crash
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error(`ไฟล์มีขนาด ${formatBytes(file.size)} ซึ่งใหญ่เกินกว่าจะอัปโหลดด้วยโหมดสำรอง กรุณาลองใหม่อีกครั้ง`));
      return;
    }

    const reader = new FileReader();
    if (onProgress) onProgress(20, file.size * 0.2, file.size);

    reader.onload = async () => {
      try {
        if (onProgress) onProgress(50, file.size * 0.5, file.size);
        const dataUrl = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, fileType: file.type, dataUrl })
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const data = await res.json();
        if (onProgress) onProgress(100, file.size, file.size);
        resolve({
          url: data.url,
          filename: data.filename,
          fileSize: data.fileSize || formatBytes(file.size)
        });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });
}
