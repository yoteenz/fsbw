import type { Site00BatchManifest } from './types.js';

/** Shared REVIEW_ENVIRONMENT / ASSTS master style — all three zones inherit this. */
export const ASSTS_MASTER_ENVIRONMENT_PROMPT = `Preserve the exact SITE 00 Asset Vault visual language within ONE continuous physical Asset Vault world.

MASTER STYLE: Extremely bright crisp white illumination. White marble and pale architectural stone. Transparent glass partitions. Restrained silver/chrome detailing. Museum-grade presentation. Architectural archive and gallery character. Minimalism. Clean vertical mobile proportions. Soft depth. High-end spatial design. SITE 00 red only as rare architectural micro-accent — never as UI.

Same materials, lighting, marble treatment, glass treatment, chrome restraint, white-space philosophy, SITE 00 geometry language, and overall exposure across all three zones.

No gray cast. No yellow or cream lighting. No dark environment. No literal bank vault. No warehouse. No server room. No cyberpunk. No gaming UI. No sci-fi HUD. No generic office.

CRITICAL: Generate ONLY clean architectural environment photography for mobile vertical framing (~9:16).
NO text. NO typography. NO icons. NO buttons. NO cards. NO dashboard. NO navigation. NO labels. NO device frame. NO phone mockup. NO fake UI. NO fake thumbnails. NO metadata. NO watermark.`;

export const BATCH_ASSTS_ENV_001: Site00BatchManifest = {
  batchKey: 'BATCH-ASSTS-ENV-001',
  displayName: 'ASSTS / MOBILE ENVIRONMENTS',
  description: 'First production batch — ASSTS mobile review environments (Library, Batch Wall, Inspection Chamber).',
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
      compositionPrompt: `ZONE: THE VAULT — entry / archive section of the Asset Vault.
Mobile vertical 9:16. True mobile art direction — not a cropped desktop room.
Bright white archival gallery with long spatial depth. Architectural display bays and recessed luminous niches suggesting stored categories. Elegant central passage. Welcoming, pristine, controlled museum-archive atmosphere.
Intentional UI-safe negative space: upper title region, mid metric zone, lower list/grid regions, bottom dock margin — do NOT place critical architecture under persistent UI areas.
Subtle non-textual SITE 00 geometry language only if architectural.`,
      required: true,
      variant: 'mobile',
      view: 'library',
    },
    {
      assetKey: 's00_env_assts_batch_mobile',
      displayName: 'ASSTS / BATCH REVIEW',
      semanticSlotKey: 'assts.batch.environment.mobile',
      compositionPrompt: `ZONE: THE REVIEW WALL — deeper into the same Asset Vault (camera moved forward).
Mobile vertical 9:16. Same vault materials and lighting as Library entry.
Architectural gallery wall with recessed review bays. Strong clean vertical planes. Slightly more focused and technical than Library. Visible architecture around a central image-safe wall region sized for a two-column asset review grid — but NO drawn assets, cards, or thumbnails.
UI-safe regions for batch header, progress indicators, asset grid, sticky progress bar, floating dock margin.`,
      required: true,
      variant: 'mobile',
      view: 'batch',
    },
    {
      assetKey: 's00_env_assts_inspection_mobile',
      displayName: 'ASSTS / ASSET INSPECTION',
      semanticSlotKey: 'assts.inspection.environment.mobile',
      compositionPrompt: `ZONE: THE INSPECTION CHAMBER — quietest, most focused ASSTS zone in the same Asset Vault.
Mobile vertical 9:16. Same vault material language.
Large central inspection stage with white luminous chamber. Minimal pedestal or inspection plane. Subtle coordinate/technical architecture at edges. Deep clean spatial framing. Minimal peripheral distraction.
Generous central negative space for hero asset presentation. UI-safe bands for version strip, metadata, and control console below — NO baked controls.`,
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
