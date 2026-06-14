/** Keep client preview under Vercel serverless POST body limit (~4.5MB total). */
export const HAIRSTYLE_ANALYSIS_CLIENT_PREVIEW_MAX_BYTES = 1_400_000;

const MAX_WIDTH = 1536;
const MAX_HEIGHT = 2048;

function estimateDataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.floor((base64.length * 3) / 4);
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load client preview image'));
    img.src = dataUrl;
  });
}

function drawScaled(
  img: HTMLImageElement,
  maxW: number,
  maxH: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare client preview canvas');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

/** Resize/compress a data-URL selfie so generate POST stays under Vercel limits. */
export async function compressClientPreviewDataUrl(
  dataUrl: string,
  maxBytes = HAIRSTYLE_ANALYSIS_CLIENT_PREVIEW_MAX_BYTES
): Promise<string> {
  const trimmed = dataUrl.trim();
  if (!trimmed.startsWith('data:')) return trimmed;
  if (estimateDataUrlBytes(trimmed) <= maxBytes) return trimmed;

  const img = await loadImage(trimmed);
  let { canvas, width, height } = drawScaled(img, MAX_WIDTH, MAX_HEIGHT);

  let quality = 0.88;
  let out = canvas.toDataURL('image/jpeg', quality);
  while (estimateDataUrlBytes(out) > maxBytes && quality > 0.52) {
    quality -= 0.08;
    out = canvas.toDataURL('image/jpeg', quality);
  }

  while (estimateDataUrlBytes(out) > maxBytes && width > 640 && height > 800) {
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) break;
    ctx.drawImage(img, 0, 0, width, height);
    out = canvas.toDataURL('image/jpeg', quality);
  }

  if (estimateDataUrlBytes(out) > maxBytes) {
    throw new Error(
      'CLIENT PHOTO IS STILL TOO LARGE AFTER COMPRESSION — USE A SMALLER IMAGE OR HTTPS URL'
    );
  }

  return out;
}
