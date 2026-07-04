import { resolveSiteOrigin } from '../email/brandAssets.js';
import { resolveServerCreativeDnaForAssetFactory } from './creativeDna.js';
import { FACTORY_POC_DERIVATIVE_OUTPUTS, getFactoryCropTemplate } from './factoryCropTemplates.js';
import { renderFactoryDerivative } from './cropEngine.js';
import { runProductAssetBackgroundRemoval } from './ideogramCutout.js';
import {
  productAssetPublicUrl,
  productAssetStoragePath,
  uploadProductAsset,
  PRODUCT_ASSETS_BUCKET,
} from './supabaseStorage.js';
import type {
  ProductAssetFactoryJob,
  ProductAssetFactoryLogEntry,
  ProductAssetFactoryStage,
  ProductAssetRegistryEntry,
} from './types.js';

export const PRODUCT_ASSET_FACTORY_POC_UNIT = {
  slug: 'soft-wave',
  label: 'SOFT WAVE',
  collectionNumber: '003',
  productLine: 'signature-collection',
  version: 'v1',
  /** POC master until approved 4096 hero is uploaded to media kit. */
  masterHeroSrc: '/assets/2D WAVY FRONT.png',
} as const;

const STAGE_ORDER: ProductAssetFactoryStage[] = [
  'waiting',
  'removing-background',
  'generating-transparent-master',
  'generating-derivatives',
  'uploading-to-supabase',
  'registering-assets',
  'ready-for-review',
];

function stageIndex(stage: ProductAssetFactoryStage): number {
  const i = STAGE_ORDER.indexOf(stage);
  return i >= 0 ? i : 0;
}

async function fetchMasterBuffer(masterUrl: string): Promise<Buffer> {
  const res = await fetch(masterUrl);
  if (!res.ok) throw new Error(`Master hero fetch failed (${res.status}): ${masterUrl}`);
  return Buffer.from(await res.arrayBuffer());
}

function resolveAbsoluteUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const origin = resolveSiteOrigin();
  return `${origin}${t.startsWith('/') ? t : `/${t}`}`;
}

function logEntry(stage: ProductAssetFactoryStage, message: string, level: ProductAssetFactoryLogEntry['level'] = 'info'): ProductAssetFactoryLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    stage,
    message,
    level,
  };
}

export type RunProductAssetFactoryResult = {
  ok: boolean;
  job: ProductAssetFactoryJob;
  registry: ProductAssetRegistryEntry[];
  logs: ProductAssetFactoryLogEntry[];
  error?: string;
};

export async function runProductAssetFactoryPipeline(opts: {
  fromStage?: ProductAssetFactoryStage;
  masterHeroSrc?: string;
}): Promise<RunProductAssetFactoryResult> {
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return {
      ok: false,
      job: buildFailedJob('removing-background', 'FAL_KEY not configured'),
      registry: [],
      logs: [logEntry('removing-background', 'FAL_KEY not configured — Ideogram background removal unavailable', 'error')],
      error: 'FAL_KEY not configured',
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return {
      ok: false,
      job: buildFailedJob('uploading-to-supabase', 'SUPABASE_URL not configured'),
      registry: [],
      logs: [logEntry('uploading-to-supabase', 'SUPABASE_URL not configured', 'error')],
      error: 'SUPABASE_URL not configured',
    };
  }

  const logs: ProductAssetFactoryLogEntry[] = [];
  const registry: ProductAssetRegistryEntry[] = [];
  const now = new Date().toISOString().slice(0, 10);

  const creativeDna = resolveServerCreativeDnaForAssetFactory({
    unitSlug: unit.slug,
    masterHeroSrcOverride: opts.masterHeroSrc,
  });
  for (const rule of creativeDna.rulesApplied) {
    logs.push(logEntry('waiting', rule));
  }

  const masterSrc = opts.masterHeroSrc ?? creativeDna.masterHeroSrc ?? unit.masterHeroSrc;
  const masterUrl = resolveAbsoluteUrl(masterSrc);

  let job: ProductAssetFactoryJob = {
    id: `paf-${unit.slug}-${Date.now()}`,
    unitSlug: unit.slug,
    productLabel: unit.label,
    collectionNumber: unit.collectionNumber,
    version: unit.version,
    stage: 'waiting',
    masterHeroUrl: masterUrl,
    derivativeCount: 0,
    registryEntryIds: [],
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  const startFrom = opts.fromStage && opts.fromStage !== 'failed' ? opts.fromStage : 'waiting';
  const minStage = stageIndex(startFrom);

  try {
    logs.push(logEntry('waiting', `Starting Asset Factory for ${unit.label} (${unit.slug})`));

    let masterWhiteBuf: Buffer | null = null;
    let transparentBuf: Buffer | null = null;
    const derivativeBuffers: Array<{ assetType: string; templateId: string; fileName: string; buffer: Buffer }> = [];

    if (minStage <= stageIndex('removing-background')) {
      job = { ...job, stage: 'removing-background', lastUpdated: new Date().toISOString() };
      logs.push(logEntry('removing-background', 'Fetching approved master hero portrait'));
      masterWhiteBuf = await fetchMasterBuffer(masterUrl);
      logs.push(logEntry('removing-background', `Normalizing master for Ideogram (${masterWhiteBuf.length} bytes)`));
      const cutout = await runProductAssetBackgroundRemoval(falKey, masterWhiteBuf);
      transparentBuf = cutout.buffer;
      logs.push(
        logEntry(
          'removing-background',
          cutout.method === 'ideogram'
            ? 'Ideogram background removal complete (fal-ai/ideogram/remove-background)'
            : 'Ideogram unavailable for this master — used pure-white studio fallback (Creative DNA)',
          cutout.method === 'ideogram' ? 'info' : 'warn'
        )
      );
      job = { ...job, stage: 'generating-transparent-master', lastUpdated: new Date().toISOString() };
      logs.push(logEntry('generating-transparent-master', 'Transparent master PNG generated'));
    }

    if (minStage <= stageIndex('generating-derivatives') && transparentBuf) {
      job = { ...job, stage: 'generating-derivatives', lastUpdated: new Date().toISOString() };
      for (const output of FACTORY_POC_DERIVATIVE_OUTPUTS) {
        const template = getFactoryCropTemplate(output.templateId);
        if (!template) {
          logs.push(logEntry('generating-derivatives', `Missing template ${output.templateId}`, 'warn'));
          continue;
        }
        const buffer = await renderFactoryDerivative(transparentBuf, template);
        derivativeBuffers.push({ ...output, buffer });
      }
      job = { ...job, derivativeCount: derivativeBuffers.length, lastUpdated: new Date().toISOString() };
      logs.push(logEntry('generating-derivatives', `${derivativeBuffers.length} derivatives rendered via crop templates`));
    }

    if (minStage <= stageIndex('uploading-to-supabase')) {
      if (!masterWhiteBuf) masterWhiteBuf = await fetchMasterBuffer(masterUrl);
      if (!transparentBuf) {
        const cutout = await runProductAssetBackgroundRemoval(falKey, masterWhiteBuf);
        transparentBuf = cutout.buffer;
        logs.push(
          logEntry(
            'uploading-to-supabase',
            cutout.method === 'ideogram' ? 'Transparent master via Ideogram' : 'Transparent master via white-studio fallback',
            cutout.method === 'ideogram' ? 'info' : 'warn'
          )
        );
      }
      if (derivativeBuffers.length === 0) {
        for (const output of FACTORY_POC_DERIVATIVE_OUTPUTS) {
          const template = getFactoryCropTemplate(output.templateId);
          if (!template) continue;
          derivativeBuffers.push({ ...output, buffer: await renderFactoryDerivative(transparentBuf, template) });
        }
      }

      job = { ...job, stage: 'uploading-to-supabase', lastUpdated: new Date().toISOString() };
      logs.push(logEntry('uploading-to-supabase', `Uploading to bucket ${PRODUCT_ASSETS_BUCKET}`));

      const whitePath = productAssetStoragePath(unit.productLine, unit.slug, unit.version, 'master-white.png');
      const whiteUp = await uploadProductAsset(whitePath, masterWhiteBuf);
      registry.push(buildRegistryEntry(unit, 'master-white', 'master-hero-full', masterWhiteBuf, whiteUp, now));

      const transPath = productAssetStoragePath(unit.productLine, unit.slug, unit.version, 'master-transparent.png');
      const transUp = await uploadProductAsset(transPath, transparentBuf);
      registry.push(buildRegistryEntry(unit, 'master-transparent', 'master-transparent-full', transparentBuf, transUp, now));
      job = { ...job, transparentMasterUrl: transUp.publicUrl };

      for (const d of derivativeBuffers) {
        const template = getFactoryCropTemplate(d.templateId)!;
        const path = productAssetStoragePath(unit.productLine, unit.slug, unit.version, d.fileName);
        const up = await uploadProductAsset(path, d.buffer);
        registry.push(
          buildRegistryEntry(unit, d.assetType, d.templateId, d.buffer, up, now, template)
        );
      }
      logs.push(logEntry('uploading-to-supabase', `${registry.length} assets uploaded`));
    }

    job = { ...job, stage: 'registering-assets', lastUpdated: new Date().toISOString() };
    logs.push(logEntry('registering-assets', `${registry.length} assets registered`));

    job = {
      ...job,
      stage: 'ready-for-review',
      derivativeCount: registry.filter((r) => !r.assetType.startsWith('master')).length,
      registryEntryIds: registry.map((r) => r.id),
      lastUpdated: new Date().toISOString(),
    };
    logs.push(logEntry('ready-for-review', 'Pipeline complete — ready for review'));

    return { ok: true, job, registry, logs };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.push(logEntry(job.stage, msg, 'error'));
    return {
      ok: false,
      job: {
        ...job,
        stage: 'failed',
        failedStage: job.stage,
        error: msg,
        lastUpdated: new Date().toISOString(),
      },
      registry,
      logs,
      error: msg,
    };
  }
}

function buildFailedJob(stage: ProductAssetFactoryStage, error: string): ProductAssetFactoryJob {
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  return {
    id: `paf-failed-${Date.now()}`,
    unitSlug: unit.slug,
    productLabel: unit.label,
    collectionNumber: unit.collectionNumber,
    version: unit.version,
    stage: 'failed',
    failedStage: stage,
    error,
    masterHeroUrl: unit.masterHeroSrc,
    derivativeCount: 0,
    registryEntryIds: [],
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

function buildRegistryEntry(
  unit: typeof PRODUCT_ASSET_FACTORY_POC_UNIT,
  assetType: string,
  cropTemplateId: string,
  buffer: Buffer,
  upload: { publicUrl: string; storagePath: string },
  date: string,
  template?: ReturnType<typeof getFactoryCropTemplate>
): ProductAssetRegistryEntry {
  return {
    id: `${unit.slug}-${assetType}-${unit.version}`,
    product: unit.label,
    productSlug: unit.slug,
    collectionNumber: unit.collectionNumber,
    version: unit.version,
    assetType: assetType as ProductAssetRegistryEntry['assetType'],
    cropTemplateId,
    dimensions: {
      width: template?.outputWidth ?? 4096,
      height: template?.outputHeight ?? 4096,
    },
    aspectRatio: template?.aspectRatio ?? '1:1',
    transparency: template?.transparency ?? (assetType.includes('transparent') || assetType !== 'master-white'),
    supabaseUrl: upload.publicUrl,
    storagePath: upload.storagePath,
    createdDate: date,
    lastUpdated: date,
    status: 'ready-for-review',
  };
}

export { productAssetPublicUrl, productAssetStoragePath };
