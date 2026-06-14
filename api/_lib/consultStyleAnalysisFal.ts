import {
  hexForConsultHairColor,
  pickConsultComparisonColors,
  type ConsultHairColorName,
} from './consultStyleAnalysisCatalog.js';
import { detectInspoHairColor } from './consultStyleAnalysisInspoColor.js';
import {
  buildConsultColorVariantPrompt,
  buildConsultInspoMatchPrompt,
} from './consultStyleAnalysisFalPrompt.js';

export const CONSULT_STYLE_ANALYSIS_GPT2_MODEL = 'openai/gpt-image-2/edit';
export const CONSULT_STYLE_ANALYSIS_IMAGE_SIZE = { width: 1536, height: 2048 } as const;
export const CONSULT_STYLE_ANALYSIS_QUALITY = 'medium' as const;

export type ConsultStyleAnalysisChartCell = {
  id: string;
  role: 'inspo_match' | 'comparison';
  color: ConsultHairColorName;
  imageUrl: string;
  subtitle: string;
};

export type ConsultStyleAnalysisGenerateResult = {
  kind: 'consult_inspo';
  comparisonTier: 1 | 4;
  inspoHairColor: ConsultHairColorName;
  heroImageUrl: string;
  cells: ConsultStyleAnalysisChartCell[];
};

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

async function getFalClient(falKey: string): Promise<FalClient> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  return fal as unknown as FalClient;
}

function parseDataUrl(dataUrl: string): { mime: string; buf: Buffer } {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!m) throw new Error('Invalid image data URL');
  const mime = m[1].toLowerCase();
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length < 1024) throw new Error('Image too small');
  if (buf.length > 12_000_000) throw new Error('Image too large');
  return { mime, buf };
}

async function uploadBufferToFal(
  fal: FalClient,
  buf: Buffer,
  fileName: string,
  mime: string
): Promise<string> {
  const file = new File([buf], fileName, { type: mime });
  try {
    return await fal.storage.upload(file);
  } catch (e) {
    throw formatFalError(e, `Fal storage upload (${fileName})`);
  }
}

async function resolveImageUrl(
  fal: FalClient,
  raw: string,
  siteOrigin: string,
  label: string
): Promise<string> {
  const trimmed = raw.trim();
  if (trimmed.startsWith('data:image/')) {
    const { mime, buf } = parseDataUrl(trimmed);
    return uploadBufferToFal(fal, buf, `${label}.jpg`, mime);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const res = await fetch(trimmed);
    if (!res.ok) throw new Error(`Failed to fetch ${label} image (${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get('content-type') || 'image/jpeg';
    return uploadBufferToFal(fal, buf, `${label}.jpg`, mime);
  }
  const origin = siteOrigin.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const url = `${origin}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${label} from ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/jpeg';
  return uploadBufferToFal(fal, buf, `${label}.jpg`, mime);
}

function extractFalImageUrl(result: unknown): string | null {
  return (
    (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url ??
    (result as { data?: { image?: { url?: string } } })?.data?.image?.url ??
    null
  );
}

async function subscribeConsultFal(
  fal: FalClient,
  imageUrls: string[],
  prompt: string
): Promise<string> {
  const attempts: Array<{ image_size: typeof CONSULT_STYLE_ANALYSIS_IMAGE_SIZE | 'auto' }> = [
    { image_size: CONSULT_STYLE_ANALYSIS_IMAGE_SIZE },
    { image_size: 'auto' },
  ];

  let lastErr: Error | undefined;
  for (const attempt of attempts) {
    try {
      const result = await fal.subscribe(CONSULT_STYLE_ANALYSIS_GPT2_MODEL, {
        input: {
          prompt,
          image_urls: imageUrls,
          image_size: attempt.image_size,
          quality: CONSULT_STYLE_ANALYSIS_QUALITY,
          output_format: 'png',
          num_images: 1,
        },
        logs: false,
      });
      const url = extractFalImageUrl(result);
      if (!url) throw new Error('Fal returned no image URL');
      return url;
    } catch (e) {
      if (!isFalValidationError(e)) throw formatFalError(e, 'Consult style analysis');
      lastErr = formatFalError(e, 'Consult style analysis');
    }
  }
  throw lastErr ?? new Error('Consult style analysis rejected by Fal');
}

function cellSubtitle(color: ConsultHairColorName): string {
  return color;
}

export type GenerateConsultStyleAnalysisInput = {
  selfieUrl: string;
  inspoUrl: string;
  comparisonCount: 1 | 4;
  siteOrigin: string;
};

/**
 * Wig consult pipeline — separate from PSA selfie picks and template hairstyle analysis.
 * 1) Selfie + inspo → exact inspo hairstyle on client.
 * 2) Color variants recolor the hero only (same hairstyle geometry).
 */
export async function generateConsultStyleAnalysis(
  input: GenerateConsultStyleAnalysisInput
): Promise<ConsultStyleAnalysisGenerateResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY is not configured');

  const fal = await getFalClient(falKey);
  const [selfieFalUrl, inspoFalUrl] = await Promise.all([
    resolveImageUrl(fal, input.selfieUrl, input.siteOrigin, 'consult-selfie'),
    resolveImageUrl(fal, input.inspoUrl, input.siteOrigin, 'consult-inspo'),
  ]);

  const inspoDataUrl = input.inspoUrl.trim().startsWith('data:image/')
    ? input.inspoUrl.trim()
    : null;
  const inspoHairColor = inspoDataUrl
    ? await detectInspoHairColor(inspoDataUrl)
    : await detectInspoHairColorFromUrl(inspoFalUrl);

  const heroImageUrl = await subscribeConsultFal(
    fal,
    [selfieFalUrl, inspoFalUrl],
    buildConsultInspoMatchPrompt()
  );

  const altCount = input.comparisonCount === 4 ? 4 : 1;
  const altColors = pickConsultComparisonColors(inspoHairColor, altCount);

  const comparisonUrls = await Promise.all(
    altColors.map((color) =>
      subscribeConsultFal(fal, [heroImageUrl], buildConsultColorVariantPrompt(color))
    )
  );

  const cells: ConsultStyleAnalysisChartCell[] = [
    {
      id: 'inspo-match',
      role: 'inspo_match',
      color: inspoHairColor,
      imageUrl: heroImageUrl,
      subtitle: cellSubtitle(inspoHairColor),
    },
    ...comparisonUrls.map((imageUrl, i) => ({
      id: `comparison-${i + 1}`,
      role: 'comparison' as const,
      color: altColors[i],
      imageUrl,
      subtitle: cellSubtitle(altColors[i]),
    })),
  ];

  return {
    kind: 'consult_inspo',
    comparisonTier: input.comparisonCount,
    inspoHairColor,
    heroImageUrl,
    cells,
  };
}

async function detectInspoHairColorFromUrl(url: string): Promise<ConsultHairColorName> {
  try {
    const res = await fetch(url);
    if (!res.ok) return 'JET BLACK';
    const buf = Buffer.from(await res.arrayBuffer());
    const b64 = buf.toString('base64');
    const mime = res.headers.get('content-type') || 'image/jpeg';
    return detectInspoHairColor(`data:${mime};base64,${b64}`);
  } catch {
    return 'JET BLACK';
  }
}
