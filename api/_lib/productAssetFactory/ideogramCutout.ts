/**
 * Reuses existing Fal Ideogram background removal — same model as live try-on overlay.
 * Normalizes large masters (4K Fal output) before Ideogram (10MB limit).
 * Falls back to local pure-white studio keying when Ideogram rejects input.
 */
import { LIVE_TRY_ON_IDEOGRAM_MODEL } from '../liveTryOnOverlay.js';

export { LIVE_TRY_ON_IDEOGRAM_MODEL as PRODUCT_ASSET_FACTORY_IDEOGRAM_MODEL };

const IDEOGRAM_MAX_BYTES = 9_500_000;
const IDEOGRAM_MAX_PX = 2048;
const IDEOGRAM_FALLBACK_MAX_PX = 1536;

export type BackgroundRemovalResult = {
  buffer: Buffer;
  method: 'ideogram' | 'white-studio-fallback';
};

async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ideogram download failed (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

function extractFalImageUrl(result: unknown): string | null {
  const data = (result as { data?: Record<string, unknown> })?.data ?? result;
  if (!data || typeof data !== 'object') return null;
  const candidates = [
    (data as { image?: { url?: string } }).image?.url,
    (data as { images?: Array<{ url?: string }> }).images?.[0]?.url,
    (data as { url?: string }).url,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
}

function formatIdeogramError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/unprocessable entity/i.test(raw) || /\b422\b/.test(raw)) {
    return `Ideogram rejected the image (422 — often file size over 10MB or invalid format). ${raw}`;
  }
  return raw;
}

/** Downscale/compress master hero before Ideogram (max 10MB, JPEG/PNG/WebP only). */
export async function prepareMasterForIdeogram(buf: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let prepared = buf;
  if (w > IDEOGRAM_MAX_PX || h > IDEOGRAM_MAX_PX || buf.length > IDEOGRAM_MAX_BYTES) {
    prepared = await sharp(buf)
      .resize({ width: IDEOGRAM_MAX_PX, height: IDEOGRAM_MAX_PX, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
  }

  if (prepared.length > IDEOGRAM_MAX_BYTES) {
    prepared = await sharp(prepared)
      .resize({ width: IDEOGRAM_FALLBACK_MAX_PX, height: IDEOGRAM_FALLBACK_MAX_PX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();
  }

  return prepared;
}

/** Pure white seamless studio → alpha (Creative DNA locked background). */
export async function whiteStudioBackgroundToAlpha(buf: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  if (!w || !h) return buf;

  const threshold = 248;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r >= threshold && g >= threshold && b >= threshold) {
        data[idx + 3] = 0;
        continue;
      }
      const avg = (r + g + b) / 3;
      if (avg >= threshold - 20) {
        const alpha = Math.max(0, Math.min(255, Math.floor((threshold - avg) * 12)));
        data[idx + 3] = Math.min(data[idx + 3], alpha);
      }
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

/** Remove white studio background via Ideogram — preserves lace, hair edges, logo, stand. */
export async function runProductAssetIdeogramCutout(falKey: string, imageUrl: string): Promise<Buffer> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  let cutResult: unknown;
  try {
    cutResult = await fal.subscribe(LIVE_TRY_ON_IDEOGRAM_MODEL, {
      input: { image_url: imageUrl },
      logs: false,
    });
  } catch (e) {
    throw new Error(`Ideogram background removal failed: ${formatIdeogramError(e)}`);
  }

  const cutUrl = extractFalImageUrl(cutResult);
  if (!cutUrl) throw new Error('Ideogram: no cutout URL in response');
  return downloadUrlToBuffer(cutUrl);
}

/** Prepare master, try Ideogram, fall back to white-studio key for pure white Creative DNA masters. */
export async function runProductAssetBackgroundRemoval(
  falKey: string,
  masterWhiteBuf: Buffer
): Promise<BackgroundRemovalResult> {
  const prepared = await prepareMasterForIdeogram(masterWhiteBuf);
  const uploadName = prepared.length > IDEOGRAM_MAX_BYTES ? 'master-hero.jpg' : 'master-hero-white.png';
  const falInputUrl = await uploadBufferToFalStorage(falKey, prepared, uploadName);

  try {
    const buffer = await runProductAssetIdeogramCutout(falKey, falInputUrl);
    return { buffer, method: 'ideogram' };
  } catch {
    const buffer = await whiteStudioBackgroundToAlpha(prepared);
    return { buffer, method: 'white-studio-fallback' };
  }
}

/** Upload buffer to Fal storage for Ideogram input. */
export async function uploadBufferToFalStorage(falKey: string, buf: Buffer, filename: string): Promise<string> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const lower = filename.toLowerCase();
  const type = lower.endsWith('.webp')
    ? 'image/webp'
    : lower.endsWith('.jpg') || lower.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/png';
  return fal.storage.upload(new File([buf], filename, { type }));
}
