/**
 * Reuses existing Fal Ideogram background removal — same model as live try-on overlay.
 */
import { LIVE_TRY_ON_IDEOGRAM_MODEL } from '../liveTryOnOverlay.js';

export { LIVE_TRY_ON_IDEOGRAM_MODEL as PRODUCT_ASSET_FACTORY_IDEOGRAM_MODEL };

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
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Ideogram background removal failed: ${msg}`);
  }

  const cutUrl = extractFalImageUrl(cutResult);
  if (!cutUrl) throw new Error('Ideogram: no cutout URL in response');
  return downloadUrlToBuffer(cutUrl);
}

/** Upload buffer to Fal storage for Ideogram input. */
export async function uploadBufferToFalStorage(falKey: string, buf: Buffer, filename: string): Promise<string> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const lower = filename.toLowerCase();
  const type = lower.endsWith('.webp') ? 'image/webp' : 'image/png';
  return fal.storage.upload(new File([buf], filename, { type }));
}
