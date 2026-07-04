import { resolveSiteOrigin } from '../email/brandAssets.js';
import { generateMasterHeroFromCreativeDna } from '../productPhotographyGeneration/generateMasterHero.js';
import { PRODUCT_PHOTOGRAPHY_POC_UNIT } from '../productPhotographyGeneration/creativeDnaV1.js';
import { resolveServerCreativeDnaForAssetFactory } from './creativeDna.js';
import { FACTORY_POC_DERIVATIVE_OUTPUTS, getFactoryCropTemplate } from './factoryCropTemplates.js';
import { renderFactoryDerivative } from './cropEngine.js';
import { runProductAssetBackgroundRemoval } from './ideogramCutout.js';
import {
  productAssetStoragePath,
  uploadProductAsset,
  PRODUCT_ASSETS_BUCKET,
} from './supabaseStorage.js';
import type {
  ProductAssetFactoryAction,
  ProductAssetFactoryJob,
  ProductAssetFactoryLogEntry,
  ProductAssetFactoryStage,
  ProductAssetRegistryEntry,
} from './types.js';
import { DERIVATIVE_BLOCKED_MESSAGE } from './types.js';

export const PRODUCT_ASSET_FACTORY_POC_UNIT = {
  slug: 'soft-wave',
  label: 'SOFT WAVE',
  collectionNumber: '003',
  productLine: 'signature-collection',
  version: 'v1',
  productReferenceSrc: PRODUCT_PHOTOGRAPHY_POC_UNIT.defaultProductRef,
} as const;

const DERIVATIVE_STAGE_ORDER: ProductAssetFactoryStage[] = [
  'hero-approved',
  'removing-background',
  'transparent-master-generated',
  'generating-smart-assets',
  'uploading-to-supabase',
  'registering-assets',
  'ready-for-review',
];

function derivativeStageIndex(stage: ProductAssetFactoryStage): number {
  const i = DERIVATIVE_STAGE_ORDER.indexOf(stage);
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

function logEntry(
  stage: ProductAssetFactoryStage,
  message: string,
  level: ProductAssetFactoryLogEntry['level'] = 'info'
): ProductAssetFactoryLogEntry {
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

export type RunProductAssetFactoryOpts = {
  action?: ProductAssetFactoryAction;
  fromStage?: ProductAssetFactoryStage;
  productReferenceSrc?: string;
  generatedMasterHeroSrc?: string;
  heroApproved?: boolean;
  existingJob?: ProductAssetFactoryJob;
  assetType?: string;
  transparentMasterUrl?: string;
};

function buildBaseJob(productReferenceUrl: string): ProductAssetFactoryJob {
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  return {
    id: `paf-${unit.slug}-${Date.now()}`,
    unitSlug: unit.slug,
    productLabel: unit.label,
    collectionNumber: unit.collectionNumber,
    version: unit.version,
    stage: 'reference-ready',
    productReferenceUrl,
    generatedMasterHeroUrl: undefined,
    heroApproved: false,
    masterHeroUrl: '',
    derivativeCount: 0,
    registryEntryIds: [],
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

function buildFailedJob(
  stage: ProductAssetFactoryStage,
  error: string,
  partial?: Partial<ProductAssetFactoryJob>
): ProductAssetFactoryJob {
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  return {
    ...buildBaseJob(unit.productReferenceSrc),
    ...partial,
    stage: 'failed',
    failedStage: stage,
    error,
    lastUpdated: new Date().toISOString(),
  };
}

/** Build job after Fal generation (Photography Bible path — hero already generated). */
export function buildHeroAwaitingApprovalJob(opts: {
  productReferenceSrc: string;
  generatedMasterHeroUrl: string;
}): ProductAssetFactoryJob {
  const job = buildBaseJob(resolveAbsoluteUrl(opts.productReferenceSrc));
  return {
    ...job,
    stage: 'awaiting-hero-approval',
    generatedMasterHeroUrl: opts.generatedMasterHeroUrl,
    masterHeroUrl: opts.generatedMasterHeroUrl,
    lastUpdated: new Date().toISOString(),
  };
}

function canRunDerivatives(job: ProductAssetFactoryJob): boolean {
  return Boolean(
    job.heroApproved &&
      job.generatedMasterHeroUrl &&
      job.generatedMasterHeroUrl !== job.productReferenceUrl
  );
}

export async function runProductAssetFactoryPipeline(
  opts: RunProductAssetFactoryOpts = {}
): Promise<RunProductAssetFactoryResult> {
  const action: ProductAssetFactoryAction = opts.action ?? 'generate-hero';
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  const productRef = opts.productReferenceSrc ?? unit.productReferenceSrc;
  const productReferenceUrl = resolveAbsoluteUrl(productRef);

  const logs: ProductAssetFactoryLogEntry[] = [];
  const registry: ProductAssetRegistryEntry[] = [];
  const now = new Date().toISOString().slice(0, 10);

  const creativeDna = resolveServerCreativeDnaForAssetFactory({
    unitSlug: unit.slug,
    productReferenceSrc: productRef,
  });
  for (const rule of creativeDna.rulesApplied) {
    logs.push(logEntry('reference-ready', rule));
  }

  if (action === 'generate-hero') {
    return runHeroGenerationPhase({ productReferenceUrl, productRef, logs });
  }

  if (action === 'approve-hero') {
    let job = opts.existingJob ?? buildBaseJob(productReferenceUrl);
    if (opts.generatedMasterHeroSrc) {
      job = {
        ...job,
        generatedMasterHeroUrl: opts.generatedMasterHeroSrc,
        masterHeroUrl: opts.generatedMasterHeroSrc,
        productReferenceUrl: job.productReferenceUrl || productReferenceUrl,
      };
    }
    if (!job.generatedMasterHeroUrl) {
      return {
        ok: false,
        job: buildFailedJob('awaiting-hero-approval', DERIVATIVE_BLOCKED_MESSAGE, job),
        registry: [],
        logs: [...logs, logEntry('awaiting-hero-approval', DERIVATIVE_BLOCKED_MESSAGE, 'error')],
        error: DERIVATIVE_BLOCKED_MESSAGE,
      };
    }
    const approved: ProductAssetFactoryJob = {
      ...job,
      stage: 'hero-approved',
      heroApproved: true,
      masterHeroUrl: job.generatedMasterHeroUrl,
      lastUpdated: new Date().toISOString(),
    };
    logs.push(logEntry('hero-approved', 'Generated Master Hero Portrait approved for derivative processing'));
    return { ok: true, job: approved, registry: [], logs };
  }

  if (action === 'run-derivatives' || action === 'retry') {
    let job =
      opts.existingJob ??
      buildBaseJob(productReferenceUrl);

    if (opts.generatedMasterHeroSrc) {
      job = {
        ...job,
        generatedMasterHeroUrl: opts.generatedMasterHeroSrc,
        masterHeroUrl: opts.generatedMasterHeroSrc,
        productReferenceUrl: job.productReferenceUrl || productReferenceUrl,
      };
    }
    if (opts.heroApproved) {
      job = { ...job, heroApproved: true, stage: 'hero-approved' };
    }

    if (!canRunDerivatives(job)) {
      return {
        ok: false,
        job: { ...job, stage: 'awaiting-hero-approval', error: DERIVATIVE_BLOCKED_MESSAGE },
        registry: [],
        logs: [...logs, logEntry('awaiting-hero-approval', DERIVATIVE_BLOCKED_MESSAGE, 'error')],
        error: DERIVATIVE_BLOCKED_MESSAGE,
      };
    }

    return runDerivativePhase({
      job,
      logs,
      registry,
      now,
      fromStage: action === 'retry' ? opts.fromStage : undefined,
    });
  }

  if (action === 'regenerate-derivative') {
    return runRegenerateSingleDerivative({
      assetType: opts.assetType,
      transparentMasterUrl: opts.transparentMasterUrl ?? opts.existingJob?.transparentMasterUrl,
      existingJob: opts.existingJob,
      logs,
      now,
    });
  }

  return {
    ok: false,
    job: buildFailedJob('reference-ready', `Unknown action: ${action}`),
    registry: [],
    logs,
    error: `Unknown action: ${action}`,
  };
}

async function runHeroGenerationPhase(ctx: {
  productReferenceUrl: string;
  productRef: string;
  logs: ProductAssetFactoryLogEntry[];
}): Promise<RunProductAssetFactoryResult> {
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  let job = buildBaseJob(ctx.productReferenceUrl);
  ctx.logs.push(logEntry('reference-ready', `Product reference loaded — ${ctx.productRef} (input only, not processed as master)`));

  job = { ...job, stage: 'generating-master-hero', lastUpdated: new Date().toISOString() };
  ctx.logs.push(
    logEntry(
      'generating-master-hero',
      'Step 1: Generate Master Hero Portrait from Creative DNA v1.0 + Approved Prompt v2.0 + Display Bust v1.0'
    )
  );

  const generation = await generateMasterHeroFromCreativeDna({
    action: 'generate-variants',
    unitSlug: unit.slug,
    productReferenceImageSrc: ctx.productRef,
    includeBenchmarkAttachment: true,
  });

  for (const entry of generation.logs) {
    ctx.logs.push(
      logEntry(
        'generating-master-hero',
        entry.message,
        entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'info'
      )
    );
  }

  if (!generation.ok || !generation.generatedMasterUrl) {
    return {
      ok: false,
      job: buildFailedJob('generating-master-hero', generation.error ?? 'Master hero generation failed', {
        productReferenceUrl: ctx.productReferenceUrl,
      }),
      registry: [],
      logs: ctx.logs,
      error: generation.error ?? 'Master hero generation failed',
    };
  }

  job = {
    ...job,
    stage: 'hero-generated',
    generatedMasterHeroUrl: generation.generatedMasterUrl,
    masterHeroUrl: generation.generatedMasterUrl,
    lastUpdated: new Date().toISOString(),
  };
  ctx.logs.push(logEntry('hero-generated', 'New Master Hero Portrait generated via Fal — preview before approval'));

  job = { ...job, stage: 'awaiting-hero-approval', lastUpdated: new Date().toISOString() };
  ctx.logs.push(
    logEntry(
      'awaiting-hero-approval',
      'Awaiting operator approval — background removal blocked until generated master is approved'
    )
  );

  return { ok: true, job, registry: [], logs: ctx.logs };
}

async function runDerivativePhase(ctx: {
  job: ProductAssetFactoryJob;
  logs: ProductAssetFactoryLogEntry[];
  registry: ProductAssetRegistryEntry[];
  now: string;
  fromStage?: ProductAssetFactoryStage;
}): Promise<RunProductAssetFactoryResult> {
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return {
      ok: false,
      job: buildFailedJob('removing-background', 'FAL_KEY not configured', ctx.job),
      registry: ctx.registry,
      logs: [...ctx.logs, logEntry('removing-background', 'FAL_KEY not configured', 'error')],
      error: 'FAL_KEY not configured',
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return {
      ok: false,
      job: buildFailedJob('uploading-to-supabase', 'SUPABASE_URL not configured', ctx.job),
      registry: ctx.registry,
      logs: [...ctx.logs, logEntry('uploading-to-supabase', 'SUPABASE_URL not configured', 'error')],
      error: 'SUPABASE_URL not configured',
    };
  }

  const masterUrl = ctx.job.generatedMasterHeroUrl!;
  let job = { ...ctx.job, stage: 'hero-approved' as ProductAssetFactoryStage, lastUpdated: new Date().toISOString() };
  ctx.logs.push(logEntry('hero-approved', 'Processing approved generated master — not the website reference image'));

  const startFrom = ctx.fromStage && ctx.fromStage !== 'failed' ? ctx.fromStage : 'hero-approved';
  const minStage = derivativeStageIndex(startFrom);

  try {
    let masterWhiteBuf: Buffer | null = null;
    let transparentBuf: Buffer | null = null;
    const derivativeBuffers: Array<{ assetType: string; templateId: string; fileName: string; buffer: Buffer }> = [];

    if (minStage <= derivativeStageIndex('removing-background')) {
      job = { ...job, stage: 'removing-background', lastUpdated: new Date().toISOString() };
      ctx.logs.push(logEntry('removing-background', 'Fetching approved generated Master Hero Portrait'));
      masterWhiteBuf = await fetchMasterBuffer(masterUrl);
      ctx.logs.push(logEntry('removing-background', `Removing background from generated hero (${masterWhiteBuf.length} bytes)`));
      const cutout = await runProductAssetBackgroundRemoval(falKey, masterWhiteBuf);
      transparentBuf = cutout.buffer;
      ctx.logs.push(
        logEntry(
          'removing-background',
          cutout.method === 'ideogram'
            ? 'Ideogram background removal complete (fal-ai/ideogram/remove-background)'
            : 'Ideogram unavailable — used pure-white studio fallback on generated master',
          cutout.method === 'ideogram' ? 'info' : 'warn'
        )
      );
      job = { ...job, stage: 'transparent-master-generated', lastUpdated: new Date().toISOString() };
      ctx.logs.push(logEntry('transparent-master-generated', 'Transparent master PNG generated from approved generated hero'));
    }

    if (minStage <= derivativeStageIndex('generating-smart-assets') && transparentBuf) {
      job = { ...job, stage: 'generating-smart-assets', lastUpdated: new Date().toISOString() };
      for (const output of FACTORY_POC_DERIVATIVE_OUTPUTS) {
        const template = getFactoryCropTemplate(output.templateId);
        if (!template) {
          ctx.logs.push(logEntry('generating-smart-assets', `Missing template ${output.templateId}`, 'warn'));
          continue;
        }
        derivativeBuffers.push({ ...output, buffer: await renderFactoryDerivative(transparentBuf, template) });
      }
      job = { ...job, derivativeCount: derivativeBuffers.length, lastUpdated: new Date().toISOString() };
      ctx.logs.push(logEntry('generating-smart-assets', `${derivativeBuffers.length} smart assets rendered via crop templates`));
    }

    if (minStage <= derivativeStageIndex('uploading-to-supabase')) {
      if (!masterWhiteBuf) masterWhiteBuf = await fetchMasterBuffer(masterUrl);
      if (!transparentBuf) {
        const cutout = await runProductAssetBackgroundRemoval(falKey, masterWhiteBuf);
        transparentBuf = cutout.buffer;
      }
      if (derivativeBuffers.length === 0 && transparentBuf) {
        for (const output of FACTORY_POC_DERIVATIVE_OUTPUTS) {
          const template = getFactoryCropTemplate(output.templateId);
          if (!template) continue;
          derivativeBuffers.push({ ...output, buffer: await renderFactoryDerivative(transparentBuf, template) });
        }
      }

      job = { ...job, stage: 'uploading-to-supabase', lastUpdated: new Date().toISOString() };
      ctx.logs.push(logEntry('uploading-to-supabase', `Uploading to bucket ${PRODUCT_ASSETS_BUCKET}`));

      const whitePath = productAssetStoragePath(unit.productLine, unit.slug, unit.version, 'master-white.png');
      const whiteUp = await uploadProductAsset(whitePath, masterWhiteBuf);
      ctx.registry.push(buildRegistryEntry(unit, 'master-white', 'master-hero-full', masterWhiteBuf, whiteUp, ctx.now));

      const transPath = productAssetStoragePath(unit.productLine, unit.slug, unit.version, 'master-transparent.png');
      const transUp = await uploadProductAsset(transPath, transparentBuf);
      ctx.registry.push(
        buildRegistryEntry(unit, 'master-transparent', 'master-transparent-full', transparentBuf, transUp, ctx.now)
      );
      job = { ...job, transparentMasterUrl: transUp.publicUrl };

      for (const d of derivativeBuffers) {
        const template = getFactoryCropTemplate(d.templateId)!;
        const path = productAssetStoragePath(unit.productLine, unit.slug, unit.version, d.fileName);
        const up = await uploadProductAsset(path, d.buffer);
        ctx.registry.push(buildRegistryEntry(unit, d.assetType, d.templateId, d.buffer, up, ctx.now, template));
      }
      ctx.logs.push(logEntry('uploading-to-supabase', `${ctx.registry.length} assets uploaded`));
    }

    job = { ...job, stage: 'registering-assets', lastUpdated: new Date().toISOString() };
    ctx.logs.push(logEntry('registering-assets', `${ctx.registry.length} assets registered`));

    job = {
      ...job,
      stage: 'ready-for-review',
      derivativeCount: ctx.registry.filter((r) => !r.assetType.startsWith('master')).length,
      registryEntryIds: ctx.registry.map((r) => r.id),
      lastUpdated: new Date().toISOString(),
    };
    ctx.logs.push(logEntry('ready-for-review', 'Pipeline complete — ready for review'));

    return { ok: true, job, registry: ctx.registry, logs: ctx.logs };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    ctx.logs.push(logEntry(job.stage, msg, 'error'));
    return {
      ok: false,
      job: {
        ...job,
        stage: 'failed',
        failedStage: job.stage,
        error: msg,
        lastUpdated: new Date().toISOString(),
      },
      registry: ctx.registry,
      logs: ctx.logs,
      error: msg,
    };
  }
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

async function runRegenerateSingleDerivative(ctx: {
  assetType?: string;
  transparentMasterUrl?: string;
  existingJob?: ProductAssetFactoryJob;
  logs: ProductAssetFactoryLogEntry[];
  now: string;
}): Promise<RunProductAssetFactoryResult> {
  const unit = PRODUCT_ASSET_FACTORY_POC_UNIT;
  const assetType = ctx.assetType?.trim();
  const transparentUrl = ctx.transparentMasterUrl?.trim();

  let job = ctx.existingJob ?? buildBaseJob(resolveAbsoluteUrl(unit.productReferenceSrc));

  if (!assetType) {
    return {
      ok: false,
      job: buildFailedJob('generating-smart-assets', 'assetType required for regenerate-derivative', job),
      registry: [],
      logs: [...ctx.logs, logEntry('generating-smart-assets', 'assetType required', 'error')],
      error: 'assetType required',
    };
  }

  if (!transparentUrl) {
    return {
      ok: false,
      job: buildFailedJob('generating-smart-assets', 'Transparent master required to regenerate derivative', job),
      registry: [],
      logs: [...ctx.logs, logEntry('generating-smart-assets', 'Transparent master URL missing', 'error')],
      error: 'Transparent master required',
    };
  }

  const output = FACTORY_POC_DERIVATIVE_OUTPUTS.find((o) => o.assetType === assetType);
  if (!output) {
    return {
      ok: false,
      job: buildFailedJob('generating-smart-assets', `Unknown asset type: ${assetType}`, job),
      registry: [],
      logs: [...ctx.logs, logEntry('generating-smart-assets', `Unknown asset type: ${assetType}`, 'error')],
      error: `Unknown asset type: ${assetType}`,
    };
  }

  try {
    ctx.logs.push(logEntry('generating-smart-assets', `Regenerating ${assetType} from transparent master`));
    const transparentBuf = await fetchMasterBuffer(transparentUrl);
    const template = getFactoryCropTemplate(output.templateId);
    if (!template) throw new Error(`Missing template ${output.templateId}`);

    const buffer = await renderFactoryDerivative(transparentBuf, template);
    const path = productAssetStoragePath(unit.productLine, unit.slug, unit.version, output.fileName);
    const up = await uploadProductAsset(path, buffer);
    const entry = buildRegistryEntry(unit, output.assetType, output.templateId, buffer, up, ctx.now, template);

    job = {
      ...job,
      stage: 'ready-for-review',
      transparentMasterUrl: transparentUrl,
      heroApproved: true,
      derivativeCount: (job.derivativeCount ?? 0) + 1,
      registryEntryIds: [...new Set([...(job.registryEntryIds ?? []), entry.id])],
      lastUpdated: new Date().toISOString(),
    };
    ctx.logs.push(logEntry('generating-smart-assets', `${assetType} regenerated and uploaded`));

    return { ok: true, job, registry: [entry], logs: ctx.logs };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    ctx.logs.push(logEntry('generating-smart-assets', msg, 'error'));
    return {
      ok: false,
      job: buildFailedJob('generating-smart-assets', msg, job),
      registry: [],
      logs: ctx.logs,
      error: msg,
    };
  }
}

export { productAssetStoragePath } from './supabaseStorage.js';
