import { LIVE_TRY_ON_IDEOGRAM_MODEL } from './liveTryOnOverlay.js';

const IDEOGRAM_MAX_BYTES = 9_500_000;

type FalClient = {
  storage: { upload: (file: File) => Promise<string> };
  subscribe: (
    model: string,
    opts: { input: Record<string, unknown>; logs?: boolean }
  ) => Promise<unknown>;
};

function extractFalImageUrl(result: unknown): string | null {
  return (
    (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url ??
    (result as { data?: { image?: { url?: string } } })?.data?.image?.url ??
    null
  );
}

export function hairstyleAnalysisClientPhotoIdeogramEnabled(): boolean {
  const raw = process.env.HAIRSTYLE_ANALYSIS_CLIENT_PHOTO_IDEOGRAM?.trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'no') return false;
  return true;
}

export function hairstyleAnalysisClientPhotoPostProcessEnabled(): boolean {
  const raw = process.env.HAIRSTYLE_ANALYSIS_CLIENT_PHOTO_POST_PROCESS?.trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'no') return false;
  return true;
}

/** Sample corner pixels and key out a uniform studio backdrop (tan/beige/gray). */
async function chromaKeyStudioBackground(pngBuf: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(pngBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  if (!w || !h) return pngBuf;

  const cornerCoords: Array<[number, number]> = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
    [0, Math.floor(h / 2)],
  ];

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  for (const [x, y] of cornerCoords) {
    const idx = (y * w + x) * 4;
    rSum += data[idx];
    gSum += data[idx + 1];
    bSum += data[idx + 2];
  }
  const n = cornerCoords.length;
  const bgR = rSum / n;
  const bgG = gSum / n;
  const bgB = bSum / n;
  const threshold = 42;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const dr = data[idx] - bgR;
      const dg = data[idx + 1] - bgG;
      const db = data[idx + 2] - bgB;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist <= threshold) {
        data[idx + 3] = 0;
      }
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

export async function ideogramRemoveBackground(fal: FalClient, imageBuf: Buffer): Promise<Buffer> {
  const normalized =
    imageBuf.length > IDEOGRAM_MAX_BYTES
      ? await (await import('sharp')).default(imageBuf)
          .resize({ width: 1536, height: 2048, fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer()
      : imageBuf;

  const file = new File([normalized], 'hairstyle-analysis-cut.png', { type: 'image/png' });
  const falUrl = await fal.storage.upload(file);
  const result = await fal.subscribe(LIVE_TRY_ON_IDEOGRAM_MODEL, {
    input: { image_url: falUrl },
    logs: false,
  });
  const cutUrl = extractFalImageUrl(result);
  if (!cutUrl) throw new Error('Ideogram cutout returned no image URL');
  const res = await fetch(cutUrl);
  if (!res.ok) throw new Error(`Ideogram cutout fetch failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Scale subject to fill panel width and anchor flush to the bottom of the fade window. */
export async function bottomAnchorCutoutInCanvas(
  cutoutPng: Buffer,
  canvasW: number,
  canvasH: number
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  const { data, info } = await sharp(cutoutPng)
    .ensureAlpha()
    .trim({ threshold: 12 })
    .toBuffer({ resolveWithObject: true });

  const subW = info.width;
  const subH = info.height;
  if (!subW || !subH) return cutoutPng;

  const targetW = Math.round(canvasW * 0.94);
  const maxH = Math.round(canvasH * 0.98);
  const scale = Math.min(targetW / subW, maxH / subH);
  const scaledW = Math.max(1, Math.round(subW * scale));
  const scaledH = Math.max(1, Math.round(subH * scale));

  const scaled = await sharp(data).resize(scaledW, scaledH, { fit: 'fill' }).png().toBuffer();

  const left = Math.round((canvasW - scaledW) / 2);
  const top = canvasH - scaledH;

  return sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: scaled, left, top }])
    .png()
    .toBuffer();
}

export async function removeBackgroundFromClientRegion(
  fal: FalClient | null,
  regionPng: Buffer
): Promise<Buffer> {
  if (fal && hairstyleAnalysisClientPhotoIdeogramEnabled()) {
    try {
      return await ideogramRemoveBackground(fal, regionPng);
    } catch (e) {
      console.warn('[hairstyle-analysis] Ideogram cutout failed, trying chroma key:', e);
    }
  }
  return chromaKeyStudioBackground(regionPng);
}
