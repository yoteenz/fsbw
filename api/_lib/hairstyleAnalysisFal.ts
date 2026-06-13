import { noirFalGrayBrickMannequinPublicUrlForAngle } from './bawNoirFalMannequinUrls.js';
import {
  bawStylingReferenceStoragePath,
  collectStylingRefsForAnalysis,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
import { collectHairlineRefsForAnalysis } from './hairstyleAnalysisBawHairlineRefs.js';
import { normalizeHairstyleAnalysisForFal } from './hairstyleAnalysisNormalize.js';
import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import {
  buildHairstyleAnalysisFalPrompt,
  type FalHairstyleAnalysis,
  type FalPromptBuildOptions,
} from './hairstyleAnalysisFalPrompt.js';
import {
  overallScoreFontPromptLabel,
  type HairstyleAnalysisFontOverrides,
} from './hairstyleAnalysisFontOverrides.js';
import { collectMannequinRefsForAnalysis } from './hairstyleAnalysisMannequinRefs.js';
import { storageObjectExists } from './liveTryOnBatchGenerate.js';
import {
  compositeHairstyleAnalysisPostProcess,
} from './hairstyleAnalysisFalComposite.js';
import { hairstyleAnalysisClientPhotoPostProcessEnabled } from './hairstyleAnalysisClientPhotoCutout.js';

export const HAIRSTYLE_ANALYSIS_GPT2_MODEL = 'openai/gpt-image-2/edit';

/** Native template size (2048×2560 = 4:5). quality medium ≈ 2K tier on GPT Image 2. */
export const HAIRSTYLE_ANALYSIS_GPT2_IMAGE_SIZE = { width: 2048, height: 2560 } as const;

export const HAIRSTYLE_ANALYSIS_GPT2_QUALITY = 'medium' as const;

type FalClient = {
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

async function getFalClient(falKey: string): Promise<FalClient> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  return fal as unknown as FalClient;
}

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

function formatFalError(e: unknown, step: string): Error {
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

async function uploadBufferToFal(
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
  return uploadBufferToFal(fal, buf, fileName, mimeFromUrl(url));
}

async function normalizeClientPreviewBuffer(buf: Buffer, mime: string): Promise<{ buf: Buffer; mime: string }> {
  if (buf.length <= 1_500_000) return { buf, mime };
  const sharp = (await import('sharp')).default;
  const out = await sharp(buf)
    .rotate()
    .resize({ width: 1536, height: 2048, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  return { buf: out, mime: 'image/jpeg' };
}

async function resolvePublicImageUrl(
  fal: FalClient,
  raw: string,
  siteOrigin: string,
  fileLabel: string
): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error(`${fileLabel} URL is required`);

  if (trimmed.startsWith('data:')) {
    const { mime, buf } = parseDataUrl(trimmed);
    const normalized =
      fileLabel === 'client-preview' ? await normalizeClientPreviewBuffer(buf, mime) : { buf, mime };
    const ext = normalized.mime.includes('png') ? 'png' : normalized.mime.includes('webp') ? 'webp' : 'jpg';
    return uploadBufferToFal(fal, normalized.buf, `${fileLabel}.${ext}`, normalized.mime);
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

async function resolveStylingRefForFal(
  fal: FalClient,
  ref: HairstyleAnalysisStylingRef
): Promise<string> {
  const sourceUrl = await resolveStylingRefSourceUrl(ref);
  const ext = sourceUrl.toLowerCase().includes('.png') ? 'png' : 'webp';
  return uploadPublicUrlToFal(fal, sourceUrl, `styling-${ref.key}.${ext}`);
}

function extractFalImageUrl(result: unknown): string | null {
  return (
    (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url ??
    (result as { data?: { image?: { url?: string } } })?.data?.image?.url ??
    null
  );
}

async function subscribeHairstyleAnalysisFal(
  fal: FalClient,
  imageUrls: string[],
  prompt: string
): Promise<unknown> {
  const attempts: Array<{ image_size: typeof HAIRSTYLE_ANALYSIS_GPT2_IMAGE_SIZE | 'auto' }> = [
    { image_size: HAIRSTYLE_ANALYSIS_GPT2_IMAGE_SIZE },
    { image_size: 'auto' },
  ];

  let lastErr: Error | undefined;
  for (const attempt of attempts) {
    try {
      return await fal.subscribe(HAIRSTYLE_ANALYSIS_GPT2_MODEL, {
        input: {
          prompt,
          image_urls: imageUrls,
          image_size: attempt.image_size,
          quality: HAIRSTYLE_ANALYSIS_GPT2_QUALITY,
          output_format: 'png',
          num_images: 1,
        },
        logs: false,
      });
    } catch (e) {
      if (!isFalValidationError(e)) throw formatFalError(e, 'Hairstyle analysis');
      lastErr = formatFalError(e, 'Hairstyle analysis');
    }
  }
  throw lastErr ?? new Error('Hairstyle analysis rejected by Fal');
}

function unitsFromAnalysis(analysis: FalHairstyleAnalysis): string[] {
  return [analysis.topMatch.unit, ...analysis.additionalLooks.map((l) => l.unit)];
}

/** Template + client by default. Set HAIRSTYLE_ANALYSIS_FAL_MINIMAL_REFS=true to skip BAW styling refs. */
export function hairstyleAnalysisFalMinimalImageRefs(): boolean {
  const raw = process.env.HAIRSTYLE_ANALYSIS_FAL_MINIMAL_REFS?.trim().toLowerCase();
  if (raw === 'true' || raw === '1' || raw === 'yes') return true;
  return false;
}

/** Opt-in unit mannequin fronts for hair texture/drape hints. Default off — avoids neck/shoulder bleed from mannequin geometry. */
export function hairstyleAnalysisFalMannequinImageRefs(): boolean {
  const raw = process.env.HAIRSTYLE_ANALYSIS_FAL_MANNEQUIN_REFS?.trim().toLowerCase();
  if (raw === 'true' || raw === '1' || raw === 'yes') return true;
  return false;
}

export type GenerateHairstyleAnalysisFalInput = {
  analysis: FalHairstyleAnalysis;
  templateUrl: string;
  clientPreviewUrl: string;
  siteOrigin: string;
  layoutOverrides?: CompositeLayoutOverrides;
  fontOverrides?: HairstyleAnalysisFontOverrides;
};

export type GenerateHairstyleAnalysisFalResult = {
  imageUrl: string;
  prompt: string;
  model: string;
  imageSize: typeof HAIRSTYLE_ANALYSIS_GPT2_IMAGE_SIZE;
  quality: typeof HAIRSTYLE_ANALYSIS_GPT2_QUALITY;
};

export async function generateHairstyleAnalysisWithFal(
  input: GenerateHairstyleAnalysisFalInput
): Promise<GenerateHairstyleAnalysisFalResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY is not configured');

  const fal = await getFalClient(falKey);
  const templateUrl = await resolvePublicImageUrl(
    fal,
    input.templateUrl,
    input.siteOrigin,
    'template'
  );
  const clientUrl = await resolvePublicImageUrl(
    fal,
    input.clientPreviewUrl,
    input.siteOrigin,
    'client-preview'
  );

  const analysis = normalizeHairstyleAnalysisForFal(input.analysis);
  const minimalRefs = hairstyleAnalysisFalMinimalImageRefs();
  const includeMannequins = hairstyleAnalysisFalMannequinImageRefs();
  const mannequinRefs = includeMannequins
    ? collectMannequinRefsForAnalysis(unitsFromAnalysis(analysis), 3)
    : [];
  const mannequinUrls = includeMannequins
    ? await Promise.all(
        mannequinRefs.map((ref) =>
          resolvePublicImageUrl(fal, ref.path, input.siteOrigin, `mannequin-${ref.unit}`)
        )
      )
    : [];

  const allLooks = [analysis.topMatch, ...analysis.additionalLooks];
  const hairlineRefs = collectHairlineRefsForAnalysis(allLooks, 3 + mannequinRefs.length);
  const hairlineUrls = await Promise.all(
    hairlineRefs.map((ref) =>
      resolvePublicImageUrl(fal, ref.publicPath, input.siteOrigin, `hairline-${ref.key.toLowerCase()}`)
    )
  );

  const stylingRefs = minimalRefs
    ? []
    : collectStylingRefsForAnalysis(allLooks, 3 + mannequinRefs.length + hairlineRefs.length);
  const stylingUrls = minimalRefs
    ? []
    : await Promise.all(stylingRefs.map((ref) => resolveStylingRefForFal(fal, ref)));

  const imageUrls = [templateUrl, clientUrl, ...mannequinUrls, ...hairlineUrls, ...stylingUrls];
  const promptOptions: FalPromptBuildOptions = {
    overallScoreFontLabel: overallScoreFontPromptLabel(
      input.fontOverrides?.topScore?.fontFamily,
      input.fontOverrides?.topScore?.siteFontId
    ),
  };
  const prompt = buildHairstyleAnalysisFalPrompt(
    analysis,
    { mannequinRefs, stylingRefs, hairlineRefs },
    promptOptions
  );

  const result = await subscribeHairstyleAnalysisFal(fal, imageUrls, prompt);

  let imageUrl = extractFalImageUrl(result);
  if (!imageUrl) throw new Error('Fal returned no image URL');

  const templateFetchUrl =
    input.templateUrl.startsWith('http://') || input.templateUrl.startsWith('https://')
      ? input.templateUrl
      : `${input.siteOrigin.replace(/\/$/, '')}${input.templateUrl.startsWith('/') ? '' : '/'}${input.templateUrl}`;
  const composited = await compositeHairstyleAnalysisPostProcess(
    imageUrl,
    templateFetchUrl,
    input.layoutOverrides,
    hairstyleAnalysisClientPhotoPostProcessEnabled()
  );
  imageUrl = await uploadBufferToFal(fal, composited, 'hairstyle-analysis-final.png', 'image/png');

  return {
    imageUrl,
    prompt,
    model: HAIRSTYLE_ANALYSIS_GPT2_MODEL,
    imageSize: HAIRSTYLE_ANALYSIS_GPT2_IMAGE_SIZE,
    quality: HAIRSTYLE_ANALYSIS_GPT2_QUALITY,
  };
}
