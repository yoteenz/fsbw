import { compositeMatchRatingStars } from './hairstyleAnalysisFalComposite.js';
import {
  buildHairstyleAnalysisFalPrompt,
  HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH,
  HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH,
  type FalHairstyleAnalysis,
} from './hairstyleAnalysisFalPrompt.js';
import { collectMannequinRefsForAnalysis } from './hairstyleAnalysisMannequinRefs.js';

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

async function uploadBufferToFal(
  fal: FalClient,
  buf: Buffer,
  fileName: string,
  mime: string
): Promise<string> {
  const file = new File([buf], fileName, { type: mime });
  return fal.storage.upload(file);
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
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    return uploadBufferToFal(fal, buf, `${fileLabel}.${ext}`, mime);
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    const origin = siteOrigin.replace(/\/$/, '');
    return `${origin}${trimmed}`;
  }

  throw new Error(`Unsupported ${fileLabel} URL`);
}

function extractFalImageUrl(result: unknown): string | null {
  return (
    (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url ??
    (result as { data?: { image?: { url?: string } } })?.data?.image?.url ??
    null
  );
}

async function downloadImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download Fal image (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

function unitsFromAnalysis(analysis: FalHairstyleAnalysis): string[] {
  return [analysis.topMatch.unit, ...analysis.additionalLooks.map((l) => l.unit)];
}

export type GenerateHairstyleAnalysisFalInput = {
  analysis: FalHairstyleAnalysis;
  templateUrl: string;
  clientPreviewUrl: string;
  siteOrigin: string;
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

  const origin = input.siteOrigin.replace(/\/$/, '');
  const emptyStarUrl = `${origin}${HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH}`;
  const filledStarUrl = `${origin}${HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH}`;

  const mannequinRefs = collectMannequinRefsForAnalysis(unitsFromAnalysis(input.analysis), 5);
  const mannequinUrls = await Promise.all(
    mannequinRefs.map((ref) => resolvePublicImageUrl(fal, ref.path, input.siteOrigin, `mannequin-${ref.unit}`))
  );

  const imageUrls = [templateUrl, clientUrl, emptyStarUrl, filledStarUrl, ...mannequinUrls];
  const prompt = buildHairstyleAnalysisFalPrompt(input.analysis, { mannequinRefs });

  const result = await fal.subscribe(HAIRSTYLE_ANALYSIS_GPT2_MODEL, {
    input: {
      prompt,
      image_urls: imageUrls,
      image_size: HAIRSTYLE_ANALYSIS_GPT2_IMAGE_SIZE,
      quality: HAIRSTYLE_ANALYSIS_GPT2_QUALITY,
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });

  const rawImageUrl = extractFalImageUrl(result);
  if (!rawImageUrl) throw new Error('Fal returned no image URL');

  const rawBuf = await downloadImageBuffer(rawImageUrl);
  const compositedBuf = await compositeMatchRatingStars(rawBuf, input.analysis.topMatch.rating);
  const imageUrl = await uploadBufferToFal(
    fal,
    compositedBuf,
    'hairstyle-analysis-composited.png',
    'image/png'
  );

  return {
    imageUrl,
    prompt,
    model: HAIRSTYLE_ANALYSIS_GPT2_MODEL,
    imageSize: HAIRSTYLE_ANALYSIS_GPT2_IMAGE_SIZE,
    quality: HAIRSTYLE_ANALYSIS_GPT2_QUALITY,
  };
}
