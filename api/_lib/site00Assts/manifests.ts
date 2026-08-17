import type { Site00BatchManifest } from './types.js';

export const ASSTS_MASTER_ENVIRONMENT_PROMPT = `Preserve the exact SITE 00 Asset Vault visual language.

Bright crisp white lighting. White marble and stone architecture. Restrained chrome accents. Transparent glass. High-end museum and archive character. Minimal decoration. Generous negative space. Architectural review environment for digital asset production.

No dark vault aesthetic. No cyberpunk. No warehouse. No server-room styling. No generic SaaS dashboard.

CRITICAL: Generate ONLY clean architectural environment photography.
NO text. NO UI. NO buttons. NO labels. NO logos. NO fake asset cards. NO thumbnails. NO metadata. NO navigation. NO baked interface elements.`;

export const BATCH_ASSTS_ENV_001: Site00BatchManifest = {
  batchKey: 'BATCH-ASSTS-ENV-001',
  displayName: 'ASSTS / MOBILE ENVIRONMENTS',
  description: 'First production batch — ASSTS mobile review environments (Library, Batch Wall, Inspection Chamber).',
  category: 'ASSTS / REVIEW ENVIRONMENT',
  masterPrompt: ASSTS_MASTER_ENVIRONMENT_PROMPT,
  promptVersion: 'v1',
  aspectRatio: '9:16',
  outputFormat: 'webp',
  model: 'fal-ai/nano-banana-pro',
  assets: [
    {
      assetKey: 's00_env_assts_library_mobile',
      displayName: 'ASSTS / LIBRARY',
      semanticSlotKey: 'assts.library.environment.mobile',
      compositionPrompt: `Mobile vertical framing. Entry into the Asset Vault archive. Architectural archive bays suggesting stored material categories. Welcoming but controlled museum-archive atmosphere. Clean UI-safe regions for headings and lists. Camera at entry threshold looking into bright white vault hall.`,
      required: true,
      variant: 'mobile',
      view: 'library',
    },
    {
      assetKey: 's00_env_assts_batch_mobile',
      displayName: 'ASSTS / BATCH REVIEW',
      semanticSlotKey: 'assts.batch.environment.mobile',
      compositionPrompt: `Mobile vertical framing. The Review Wall — deeper into the same Asset Vault world. Architecture supports a two-column asset review grid with strong image-safe wall regions. Functional review zone with display architecture and recesses. Same materials and lighting as vault entry.`,
      required: true,
      variant: 'mobile',
      view: 'batch',
    },
    {
      assetKey: 's00_env_assts_inspection_mobile',
      displayName: 'ASSTS / ASSET INSPECTION',
      semanticSlotKey: 'assts.inspection.environment.mobile',
      compositionPrompt: `Mobile vertical framing. The Inspection Chamber — quietest of the three. Large uncluttered central presentation bay for hero asset inspection. Minimal peripheral architecture. Generous central negative space. Same Asset Vault material language.`,
      required: true,
      variant: 'mobile',
      view: 'inspection',
    },
  ],
};

export function getBatchManifestByKey(batchKey: string): Site00BatchManifest | null {
  if (batchKey === BATCH_ASSTS_ENV_001.batchKey) return BATCH_ASSTS_ENV_001;
  return null;
}
