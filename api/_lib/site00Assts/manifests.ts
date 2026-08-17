import type { Site00BatchManifest } from './types.js';

/** Active environment production batch — replacement lineage test. */
export const ACTIVE_ASSTS_ENV_BATCH_KEY = 'BATCH-ASSTS-ENV-002';
export const LEGACY_ASSTS_ENV_BATCH_KEY = 'BATCH-ASSTS-ENV-001';

/** Shared REVIEW_ENVIRONMENT / ASSTS master — ONE canonical Asset Vault digital twin. */
export const ASSTS_MASTER_ENVIRONMENT_PROMPT = `CANONICAL SITE 00 ASSET VAULT — ONE physical virtual facility. Photorealistic luxury architectural visualization.

MONUMENTAL repeating rounded white marble arches. Extremely bright crisp white illumination — no gray cast, no beige/yellow lighting. White marble and pale stone construction. Polished reflective flooring with physically believable reflections. Deep symmetrical perspective. Subtle integrated architectural illumination. Transparent glass and acrylic details. Extremely restrained chrome/silver accents. Tiny controlled Site 00 red wayfinding accents only. Museum / archive / futuristic institutional quality. Monumental scale. Spatial depth. Immersive virtual-world quality.

NOT: normal office, retail store, generic gallery, residential interior, random white hallway, template website background, warehouse, server room, cyberpunk, gaming UI, sci-fi HUD, generic minimalism, random furniture, people.

Mobile vertical framing (~9:16). Environment photography ONLY.
NO text. NO typography. NO icons. NO buttons. NO cards. NO dashboard. NO navigation. NO labels. NO device frame. NO fake UI. NO fake thumbnails. NO watermark.`;

export const BATCH_ASSTS_ENV_001: Site00BatchManifest = {
  batchKey: LEGACY_ASSTS_ENV_BATCH_KEY,
  displayName: 'ASSTS / MOBILE ENVIRONMENTS (LEGACY)',
  description: 'Superseded — generic interiors. See BATCH-ASSTS-ENV-002.',
  category: 'ASSTS / REVIEW ENVIRONMENT',
  masterPrompt: ASSTS_MASTER_ENVIRONMENT_PROMPT,
  promptVersion: 'v1.1',
  aspectRatio: '9:16',
  outputFormat: 'webp',
  model: 'fal-ai/nano-banana-pro',
  assets: [
    {
      assetKey: 's00_env_assts_library_mobile',
      displayName: 'ASSTS / LIBRARY',
      semanticSlotKey: 'assts.library.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.library',
      environmentRole: 'library',
      environmentRoleLabel: 'LIBRARY',
      environmentRoleSublabel: 'VAULT ENTRANCE',
      generationOrder: 1,
      compositionPrompt: `Legacy batch — superseded by ENV-002.`,
      required: true,
      variant: 'mobile',
      view: 'library',
    },
    {
      assetKey: 's00_env_assts_batch_mobile',
      displayName: 'ASSTS / BATCH REVIEW',
      semanticSlotKey: 'assts.batch.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.batchReview',
      environmentRole: 'batchReview',
      environmentRoleLabel: 'BATCH REVIEW',
      environmentRoleSublabel: 'PRODUCTION GALLERY',
      generationOrder: 2,
      requiresVaultReference: true,
      compositionPrompt: `Legacy batch — superseded by ENV-002.`,
      required: true,
      variant: 'mobile',
      view: 'batch',
    },
    {
      assetKey: 's00_env_assts_inspection_mobile',
      displayName: 'ASSTS / ASSET INSPECTION',
      semanticSlotKey: 'assts.inspection.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.inspection',
      environmentRole: 'inspection',
      environmentRoleLabel: 'ASSET INSPECTION',
      environmentRoleSublabel: 'INSPECTION CHAMBER',
      generationOrder: 3,
      requiresVaultReference: true,
      compositionPrompt: `Legacy batch — superseded by ENV-002.`,
      required: true,
      variant: 'mobile',
      view: 'inspection',
    },
  ],
};

export const BATCH_ASSTS_ENV_002: Site00BatchManifest = {
  batchKey: ACTIVE_ASSTS_ENV_BATCH_KEY,
  displayName: 'ASSTS / MOBILE ENVIRONMENTS (VAULT LINEAGE v2)',
  description: 'Canonical Asset Vault digital twin — monumental arch lineage with reference-conditioned child zones.',
  category: 'ASSTS / REVIEW ENVIRONMENT',
  masterPrompt: ASSTS_MASTER_ENVIRONMENT_PROMPT,
  promptVersion: 'v2.0',
  aspectRatio: '9:16',
  outputFormat: 'webp',
  model: 'fal-ai/nano-banana-pro',
  useVaultLineage: true,
  forceNewVersion: true,
  replacementBatch: true,
  assets: [
    {
      assetKey: 's00_env_assts_library_mobile',
      displayName: 'ASSTS / LIBRARY',
      semanticSlotKey: 'assts.library.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.library',
      environmentRole: 'library',
      environmentRoleLabel: 'LIBRARY',
      environmentRoleSublabel: 'VAULT ENTRANCE',
      generationOrder: 1,
      compositionPrompt: `ENVIRONMENT 01 — VAULT ENTRANCE / LIBRARY (MASTER).
Vertical mobile 9:16. Viewer on the monumental entrance axis. Strong symmetrical central perspective. Architecture extends deeply.
Breathtaking sequence of repeating monumental white marble rounded arches forming a futuristic archival corridor. Large sculptural side bays suggest assets and collections throughout the architecture.
Establish the CANONICAL Asset Vault architecture — this image is the master reference for all other Asset Vault zones.
UI-safe breathing room in upper title, metric, review, and dock regions — do NOT place critical architecture under persistent UI zones.`,
      required: true,
      variant: 'mobile',
      view: 'library',
    },
    {
      assetKey: 's00_env_assts_batch_mobile',
      displayName: 'ASSTS / BATCH REVIEW',
      semanticSlotKey: 'assts.batch.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.batchReview',
      environmentRole: 'batchReview',
      environmentRoleLabel: 'BATCH REVIEW',
      environmentRoleSublabel: 'PRODUCTION GALLERY',
      generationOrder: 2,
      requiresVaultReference: true,
      compositionPrompt: `ENVIRONMENT 02 — PRODUCTION GALLERY / BATCH REVIEW.
Camera traveled deeper into the SAME Asset Vault — identical marble arch language and materials.
Production gallery with architectural display bays and illuminated archival niches. Generated assets are organized and reviewed here.
Recessed illuminated display bays, glass/acrylic presentation architecture, repeating vault modules, controlled red status illumination, deep perspective, same polished reflective marble floor.
Central image-safe wall region for a two-column asset grid — NO drawn assets or cards.`,
      required: true,
      variant: 'mobile',
      view: 'batch',
    },
    {
      assetKey: 's00_env_assts_inspection_mobile',
      displayName: 'ASSTS / ASSET INSPECTION',
      semanticSlotKey: 'assts.inspection.environment.mobile',
      canonicalSlotAlias: 'site00.assetVault.environments.inspection',
      environmentRole: 'inspection',
      environmentRoleLabel: 'ASSET INSPECTION',
      environmentRoleSublabel: 'INSPECTION CHAMBER',
      generationOrder: 3,
      requiresVaultReference: true,
      compositionPrompt: `ENVIRONMENT 03 — INSPECTION CHAMBER.
Continue deeper into the SAME Asset Vault. Quieter, more focused, unmistakably the same facility.
Monumental centered inspection bay. Sculptural marble framing. Transparent glass/acrylic presentation enclosure. Subtle integrated lighting. Strong central composition. Controlled architectural red accents. Polished reflective floor.
High-end futuristic museum inspection chamber — object will be placed by the application. Do NOT permanently render an asset inside.`,
      required: true,
      variant: 'mobile',
      view: 'inspection',
    },
  ],
};

export function getBatchManifestByKey(batchKey: string): Site00BatchManifest | null {
  if (batchKey === BATCH_ASSTS_ENV_002.batchKey) return BATCH_ASSTS_ENV_002;
  if (batchKey === BATCH_ASSTS_ENV_001.batchKey) return BATCH_ASSTS_ENV_001;
  return null;
}

export function getActiveAsstsEnvBatchKey(): string {
  return ACTIVE_ASSTS_ENV_BATCH_KEY;
}
