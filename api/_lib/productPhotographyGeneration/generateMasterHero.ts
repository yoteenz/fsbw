import { resolveSiteOrigin } from '../email/brandAssets.js';
import { uploadBufferToFalStorage } from '../productAssetFactory/ideogramCutout.js';
import { productAssetStoragePath, uploadProductAsset } from '../productAssetFactory/supabaseStorage.js';
import { assembleProductPhotographyFalPrompt } from './assembleFalPrompt.js';
import {
  PRODUCT_PHOTOGRAPHY_POC_UNIT,
  resolveDisplayBustFront,
} from './creativeDnaV1.js';
import type { ProductPhotographyGenerateAction, ProductPhotographyGenerateLogEntry } from './types.js';

export const PRODUCT_PHOTOGRAPHY_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

function log(message: string, level: ProductPhotographyGenerateLogEntry['level'] = 'info'): ProductPhotographyGenerateLogEntry {
  return { timestamp: new Date().toISOString(), message, level };
}

function resolveAbsoluteUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const origin = resolveSiteOrigin();
  return `${origin}${t.startsWith('/') ? t : `/${t}`}`;
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reference fetch failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadRefToFal(falKey: string, pathOrUrl: string, label: string): Promise<string> {
  const absolute = resolveAbsoluteUrl(pathOrUrl);
  const buf = await fetchImageBuffer(absolute);
  const name = pathOrUrl.split('/').pop()?.split('?')[0] || `${label}.png`;
  return uploadBufferToFalStorage(falKey, buf, name);
}

function extractFalImageUrl(result: unknown): string | null {
  const data = (result as { data?: { images?: Array<{ url?: string }> } })?.data;
  return data?.images?.[0]?.url?.trim() ?? null;
}

export type GenerateMasterHeroInput = {
  action: ProductPhotographyGenerateAction;
  unitSlug: string;
  productReferenceImageSrc?: string;
  includeBenchmarkAttachment?: boolean;
};

export type GenerateMasterHeroOutput = {
  ok: boolean;
  generatedMasterUrl?: string;
  storagePath?: string;
  productReferenceImageSrc: string;
  displayBustSrc: string;
  falModel: string;
  logs: ProductPhotographyGenerateLogEntry[];
  error?: string;
};

/** Generate Master Hero Portrait via Fal using Creative DNA v1.0 package. SOFT WAVE POC. */
export async function generateMasterHeroFromCreativeDna(
  input: GenerateMasterHeroInput
): Promise<GenerateMasterHeroOutput> {
  const logs: ProductPhotographyGenerateLogEntry[] = [];
  const unit = PRODUCT_PHOTOGRAPHY_POC_UNIT;

  if (input.unitSlug !== unit.slug) {
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(input.unitSlug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs: [log(`Only ${unit.slug} POC is enabled`, 'error')],
      error: `Only ${unit.slug} POC is enabled`,
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(unit.slug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs: [log('FAL_KEY not configured', 'error')],
      error: 'FAL_KEY not configured',
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(unit.slug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs: [log('SUPABASE_URL not configured', 'error')],
      error: 'SUPABASE_URL not configured',
    };
  }

  const productRef = (input.productReferenceImageSrc ?? unit.defaultProductRef).trim();
  const displayBust = resolveDisplayBustFront(unit.slug);
  const includeBenchmark =
    input.includeBenchmarkAttachment ?? input.action === 'generate-variants';

  logs.push(log('Creative DNA v1.0 loaded — assembling generation package'));
  logs.push(log(`Action: ${input.action} · Unit: ${unit.label}`));

  try {
    logs.push(log('Uploading Display Bust v1.0 reference to Fal'));
    const displayBustFalUrl = await uploadRefToFal(falKey, displayBust, 'display-bust');

    logs.push(log('Uploading product reference to Fal'));
    const productRefFalUrl = await uploadRefToFal(falKey, productRef, 'product-ref');

    const imageUrls = [displayBustFalUrl, productRefFalUrl];
    if (includeBenchmark) {
      logs.push(log('Uploading SOFT WAVE benchmark reference to Fal'));
      imageUrls.push(await uploadRefToFal(falKey, unit.benchmarkHeroSrc, 'benchmark'));
    }

    const prompt = assembleProductPhotographyFalPrompt({
      unitLabel: unit.label,
      collectionNumber: unit.collectionNumber,
      texture: unit.texture,
      length: unit.length,
      density: unit.density,
      lace: unit.lace,
      includeBenchmarkAttachment: includeBenchmark,
    });

    logs.push(log(`Calling ${PRODUCT_PHOTOGRAPHY_FAL_MODEL} (1:1 · 4K · PNG)`));
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const result = await fal.subscribe(PRODUCT_PHOTOGRAPHY_FAL_MODEL, {
      input: {
        prompt,
        image_urls: imageUrls,
        aspect_ratio: '1:1',
        resolution: '4K',
        output_format: 'png',
        num_images: 1,
      },
      logs: false,
    });

    const falImageUrl = extractFalImageUrl(result);
    if (!falImageUrl) {
      throw new Error('Fal returned no image URL');
    }

    logs.push(log('Downloading generated master hero from Fal'));
    const masterBuf = await fetchImageBuffer(falImageUrl);

    const fileName = `generated-master-${Date.now()}.png`;
    const storagePath = productAssetStoragePath(unit.productLine, unit.slug, unit.version, fileName);
    logs.push(log(`Uploading generated master to Supabase · ${storagePath}`));
    const upload = await uploadProductAsset(storagePath, masterBuf, 'image/png');

    logs.push(log('Master Hero Portrait generated and stored'));
    return {
      ok: true,
      generatedMasterUrl: upload.publicUrl,
      storagePath: upload.storagePath,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.push(log(msg, 'error'));
    return {
      ok: false,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs,
      error: msg,
    };
  }
}
