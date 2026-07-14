/**
 * Experience Lab Reception — idempotent migration of six variant packages.
 * Preserves preview URLs; does not generate production outputs.
 */

import { buildVariantPackageId } from '../../src/studio-os-core/environment-asset-package/EnvironmentAssetPackage.js';
import {
  appendAuditEvent,
  getPackageById,
  upsertOutput,
  upsertPackage,
  upsertReadiness,
} from './persistence.js';

const DEPARTMENT_ID = 'experience-lab';
const ENVIRONMENT_ID = 'reception';

const VARIANT_SEEDS: Array<{
  variantId: string;
  variantName: string;
  theme: 'light' | 'dark';
  promptHash: string;
  seed: string;
  estimatedCostUsd: number;
  mobilePreviewUrl?: string;
  desktopPreviewUrl?: string;
}> = [
  { variantId: 'light-01', variantName: 'Light 01', theme: 'light', promptHash: 'elab-light-01-v1', seed: '42811', estimatedCostUsd: 0.12 },
  { variantId: 'light-02', variantName: 'Light 02', theme: 'light', promptHash: 'elab-light-02-v1', seed: '42812', estimatedCostUsd: 0.12 },
  { variantId: 'light-03', variantName: 'Light 03', theme: 'light', promptHash: 'elab-light-03-v1', seed: '42813', estimatedCostUsd: 0.12 },
  { variantId: 'dark-01', variantName: 'Dark 01', theme: 'dark', promptHash: 'elab-dark-01-v1', seed: '51801', estimatedCostUsd: 0.14 },
  { variantId: 'dark-02', variantName: 'Dark 02', theme: 'dark', promptHash: 'elab-dark-02-v1', seed: '51802', estimatedCostUsd: 0.14 },
  { variantId: 'dark-03', variantName: 'Dark 03', theme: 'dark', promptHash: 'elab-dark-03-v1', seed: '51803', estimatedCostUsd: 0.14 },
];

export type MigrationInput = {
  lightPreviewUrl: string;
  darkPreviewUrl: string;
};

export async function migrateExperienceLabReceptionPackages(
  input: MigrationInput
): Promise<{ migrated: number; packageIds: string[] }> {
  const packageIds: string[] = [];
  let migrated = 0;

  for (const variant of VARIANT_SEEDS) {
    const packageId = buildVariantPackageId({
      departmentId: DEPARTMENT_ID,
      environmentId: ENVIRONMENT_ID,
      variantId: variant.variantId,
      revision: 1,
    });
    packageIds.push(packageId);

    const existing = await getPackageById(packageId);
    if (existing) continue;

    const mobileUrl = variant.theme === 'light' ? input.lightPreviewUrl : input.darkPreviewUrl;
    const desktopUrl = variant.theme === 'dark' ? input.darkPreviewUrl : null;
    const now = new Date().toISOString();
    const cacheKey = [DEPARTMENT_ID, ENVIRONMENT_ID, variant.variantId, 'r1', variant.promptHash, variant.seed, 'preview-cache', 'bible-v1'].join(':');

    await upsertPackage({
      package_id: packageId,
      department_id: DEPARTMENT_ID,
      environment_id: ENVIRONMENT_ID,
      variant_id: variant.variantId,
      variant_name: variant.variantName,
      theme: variant.theme,
      revision: 1,
      canonical: variant.variantId === 'light-01',
      status: variant.variantId === 'light-01' ? 'review' : 'review',
      lifecycle_state: 'preview-ready',
      stage: 'concept-preview',
      provider: 'preview-cache',
      model: 'stage-1-preview',
      seed: variant.seed,
      prompt_version: variant.promptHash,
      prompt_hash: variant.promptHash,
      department_bible_version: 'bible-v1',
      estimated_cost_usd: variant.estimatedCostUsd,
      cache_key: cacheKey,
      outputs_snapshot: { mobile: mobileUrl, desktop: desktopUrl },
      created_at: now,
      updated_at: now,
    });

    await upsertOutput({
      package_id: packageId,
      output_type: 'mobile',
      aspect_ratio: '9:16',
      status: 'cached',
      artifact_url: mobileUrl,
      cached: true,
      generated_at: now,
    });

    if (desktopUrl) {
      await upsertOutput({
        package_id: packageId,
        output_type: 'desktop',
        aspect_ratio: '21:9',
        status: 'cached',
        artifact_url: desktopUrl,
        cached: true,
        generated_at: now,
      });
    }

    await upsertReadiness({
      readiness_id: `readiness.${packageId}`,
      package_id: packageId,
      variant_id: variant.variantId,
      lifecycle_state: 'preview-ready',
      readiness_percent: 0,
      blockers: [],
      checklist: {},
      generation_estimate: {},
      founder_approved: false,
      revision: 1,
      created_at: now,
      updated_at: now,
    });

    await appendAuditEvent({
      packageId,
      eventType: 'created',
      actor: null,
      detail: 'Migrated Experience Lab reception package (preview only)',
      revision: 1,
    });

    migrated += 1;
  }

  return { migrated, packageIds };
}
