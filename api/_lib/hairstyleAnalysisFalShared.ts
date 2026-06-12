import { noirFalGrayBrickMannequinPublicUrlForAngle } from './bawNoirFalMannequinUrls.js';
import {
  bawStylingReferenceStoragePath,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
import { storageObjectExists } from './liveTryOnBatchGenerate.js';

const HAIRSTYLE_ANALYSIS_GPT2_MODEL = 'openai/gpt-image-2/edit';
const HAIRSTYLE_ANALYSIS_GPT2_QUALITY = 'medium' as const;

export type FalClient = {
  storage: { upload: (file: File) => Promise<string> };
  subscribe: (
    model: string,
    opts: { input: Record<string, unknown>; logs?: boolean }
  ) => Promise<unknown>;
};

type FalValidationError = Error & {
  status?: number;
  body?: { detail?: unknown; message?: string };
};

function parseDataUrl(dataUrl: string): { mime: string; buf: Buffer } {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!m) throw new Error('Invalid client preview data URL');
  const mime = m[1].toLowerCase();
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length < 1024) throw new Error('Client preview image too small');
  if (buf.length > 12_000_000) throw new Error('Client preview image too large');
  return { mime, buf };
}

function mimeFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function isFalValidationError(e: unknown): boolean {
  const err = e as FalValidationError;
  return err?.status === 422 || /unprocessable entity/i.test(String(err?.message || e));
}

export function formatFalError(e: unknown, step: string): Error {
  const err = e as FalValidationError;
  const raw = err?.message || String(e);
  const detail = err?.body?.detail;
  const bodyMsg = typeof err?.body?.message === 'string' ? err.body.message : '';
  let detailStr = '';
  if (typeof detail === 'string') detailStr = detail;
  else if (Array.isArray(detail)) {
    detailStr = detail
      .map((d) =>
        typeof d === 'object' && d && 'msg' in d ? String((d as { msg: string }).msg) : JSON.stringify(d)
      )
      .filter(Boolean)
      .join('; ');
  } else if (detail != null) detailStr = JSON.stringify(detail);

  const hint = [detailStr, bodyMsg, raw].filter(Boolean).join(' — ');
  if (isFalValidationError(e) || err?.name === 'ValidationError') {
    return new Error(`${step} rejected by Fal: ${hint}`);
  }
  return new Error(`${step}: ${hint}`);
}

export async function createHairstyleAnalysisFalClient(falKey: string): Promise<FalClient> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  return fal as unknown as FalClient;
}

export async function uploadBufferToFalStorage(
  fal: FalClient,
  buf: Buffer,
  fileName: string,
  mime: string
): Promise<string> {
  if (!buf.length) throw new Error(`Fal upload empty file: ${fileName}`);
  const file = new File([buf], fileName, { type: mime });
  try {
    return await fal.storage.upload(file);
  } catch (e) {
    throw formatFalError(e, `Fal storage upload (${fileName})`);
  }
}

async function uploadPublicUrlToFal(fal: FalClient, url: string, fileName: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`image fetch failed (${res.status}) for ${fileName}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error(`image empty for ${fileName}`);
  return uploadBufferToFalStorage(fal, buf, fileName, mimeFromUrl(url));
}

export async function resolveHairstyleAnalysisImageUrl(
  fal: FalClient,
  raw: string,
  siteOrigin: string,
  fileLabel: string
): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error(`${fileLabel} URL is required`);

  if (trimmed.startsWith('data:')) {
    const { mime, buf } = parseDataUrl(trimmed);
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    return uploadBufferToFalStorage(fal, buf, `${fileLabel}.${ext}`, mime);
  }

  const publicUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : trimmed.startsWith('/')
      ? `${siteOrigin.replace(/\/$/, '')}${trimmed}`
      : null;

  if (!publicUrl) throw new Error(`Unsupported ${fileLabel} URL`);

  const ext = publicUrl.toLowerCase().includes('.png')
    ? 'png'
    : publicUrl.toLowerCase().includes('.webp')
      ? 'webp'
      : 'jpg';
  return uploadPublicUrlToFal(fal, publicUrl, `${fileLabel}.${ext}`);
}

async function resolveStylingRefSourceUrl(ref: HairstyleAnalysisStylingRef): Promise<string> {
  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const storagePath = bawStylingReferenceStoragePath(ref.salonMode, ref.part);

  if (storagePath && (await storageObjectExists(bucket, storagePath))) {
    return ref.publicPath;
  }

  const head = await fetch(ref.publicPath, { method: 'HEAD' });
  if (head.ok) return ref.publicPath;

  return noirFalGrayBrickMannequinPublicUrlForAngle('front');
}

export async function resolveStylingRefForFal(
  fal: FalClient,
  ref: HairstyleAnalysisStylingRef
): Promise<string> {
  const sourceUrl = await resolveStylingRefSourceUrl(ref);
  const ext = sourceUrl.toLowerCase().includes('.png') ? 'png' : 'webp';
  return uploadPublicUrlToFal(fal, sourceUrl, `styling-${ref.key}.${ext}`);
}

export function extractFalImageUrl(result: unknown): string | null {
  return (
    (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url ??
    (result as { data?: { image?: { url?: string } } })?.data?.image?.url ??
    null
  );
}

const HAIR_EDIT_IMAGE_SIZES: Array<{ width: number; height: number } | 'auto'> = [
  { width: 1536, height: 2048 },
  'auto',
];

export async function runGptImage2HairEdit(
  fal: FalClient,
  imageUrls: string[],
  prompt: string,
  step: string
): Promise<string> {
  let lastErr: Error | undefined;
  for (const image_size of HAIR_EDIT_IMAGE_SIZES) {
    try {
      const result = await fal.subscribe(HAIRSTYLE_ANALYSIS_GPT2_MODEL, {
        input: {
          prompt,
          image_urls: imageUrls,
          image_size,
          quality: HAIRSTYLE_ANALYSIS_GPT2_QUALITY,
          output_format: 'png',
          num_images: 1,
        },
        logs: false,
      });
      const url = extractFalImageUrl(result);
      if (!url) throw new Error(`${step}: Fal returned no image URL`);
      return url;
    } catch (e) {
      if (!isFalValidationError(e)) throw formatFalError(e, step);
      lastErr = formatFalError(e, step);
    }
  }
  throw lastErr ?? new Error(`${step} rejected by Fal`);
}

export async function fetchFalResultBuffer(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download Fal result: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
