/**
 * BAW salon styling reference images for hairstyle analysis Fal prompts.
 * Uses the same after-color Storage paths as POST /api/live-wig-after-color-styling
 * (JET BLACK NOIR color tier + layers/crimps/flat-iron folders). Fal copies hairstyle
 * shape from these refs and retints to the look's catalog hex — no invented styles.
 */

import { noirFalGrayBrickMannequinPublicUrlForAngle } from './bawNoirFalMannequinUrls.js';
import {
  wigPreviewLiveAfterColorStylingPaths,
  wigPreviewLiveCrimpsPartFolder,
  wigPreviewLiveFlatIronPartFolder,
  wigPreviewLiveLayersPartFolder,
  wigPreviewManifestHashLiveColorTier,
  type WigPreviewSelections,
} from './wigPreviewSelectionHash.js';

/** Public object URLs include the `live-preview` bucket segment (same as templates / Noir refs). */
const SUPABASE_PUBLIC_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview';

/** Canonical NOIR selections for BAW styling reference WebPs (JET BLACK color tier). */
const BAW_STYLING_REF_COLOR_TIER: WigPreviewSelections = {
  unitKey: 'NOIR',
  length: '24"',
  density: '250%',
  lace: '13X6',
  texture: 'SILKY',
  color: 'JET BLACK',
  hairline: 'NATURAL',
  styling: 'NONE',
  addOns: [],
};

export type BawSalonMode = 'layers' | 'crimps' | 'flat_iron' | 'none';

export type HairstyleAnalysisStylingRef = {
  /** Stable key e.g. layers-MIDDLE */
  key: string;
  salonMode: BawSalonMode;
  part: 'MIDDLE' | 'LEFT' | 'RIGHT';
  /** 1-based index in Fal image_urls */
  imageIndex: number;
  /** Public URL passed to Fal */
  publicPath: string;
};

function promptVersion(): string {
  return process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
}

function normalizePart(part: string): 'MIDDLE' | 'LEFT' | 'RIGHT' {
  const p = String(part || 'MIDDLE')
    .replace(/\s*PART\s*$/i, '')
    .trim()
    .toUpperCase();
  if (p === 'LEFT' || p === 'RIGHT') return p;
  return 'MIDDLE';
}

/** Map BAW / catalog styling ids to salon modes used in live-wig-after-color-styling. */
export function resolveBawSalonMode(stylingRaw: string): BawSalonMode {
  const s = String(stylingRaw || '')
    .replace(/^STYLING:\s*/i, '')
    .trim()
    .toUpperCase();
  if (!s || s === 'NONE') return 'none';
  if (s.includes('FLAT IRON')) return 'flat_iron';
  if (s.includes('CRIMPS') || s.includes('WAND CURLS')) return 'crimps';
  if (s.includes('LAYERS') || s.includes('DEFINE')) return 'layers';
  return 'none';
}

function afterColorFolderKey(salonMode: BawSalonMode, part: 'MIDDLE' | 'LEFT' | 'RIGHT'): string | null {
  if (salonMode === 'layers') return wigPreviewLiveLayersPartFolder(part);
  if (salonMode === 'crimps') return wigPreviewLiveCrimpsPartFolder(part);
  if (salonMode === 'flat_iron') return wigPreviewLiveFlatIronPartFolder(part);
  return null;
}

function publicUrlForStoragePath(storagePath: string): string {
  return `${SUPABASE_PUBLIC_BASE}/${storagePath}`;
}

/** Storage path (inside `live-preview` bucket) for front-angle BAW styling reference WebP. */
export function bawStylingReferenceStoragePath(
  salonMode: BawSalonMode,
  part: 'MIDDLE' | 'LEFT' | 'RIGHT'
): string | null {
  if (salonMode === 'none') return null;
  const folder = afterColorFolderKey(salonMode, part);
  if (!folder) return null;
  const colorTierHash = wigPreviewManifestHashLiveColorTier(BAW_STYLING_REF_COLOR_TIER);
  return wigPreviewLiveAfterColorStylingPaths(promptVersion(), 'NOIR', colorTierHash, folder).front;
}

/** Front-angle BAW styling reference for a salon mode + part (JET BLACK NOIR tier). */
export function bawStylingReferencePublicUrl(
  salonMode: BawSalonMode,
  part: 'MIDDLE' | 'LEFT' | 'RIGHT'
): string | null {
  const storagePath = bawStylingReferenceStoragePath(salonMode, part);
  return storagePath ? publicUrlForStoragePath(storagePath) : null;
}

function stylingKey(salonMode: BawSalonMode, part: 'MIDDLE' | 'LEFT' | 'RIGHT'): string {
  return `${salonMode}-${part}`;
}

/**
 * Unique BAW styling refs for all looks that use salon styling.
 * `startImageIndex` = first free slot after template, client, and unit mannequins.
 */
export function collectStylingRefsForAnalysis(
  looks: Array<{ styling: string; part: string }>,
  startImageIndex: number
): HairstyleAnalysisStylingRef[] {
  const seen = new Set<string>();
  const refs: HairstyleAnalysisStylingRef[] = [];
  let next = startImageIndex;

  for (const look of looks) {
    const salonMode = resolveBawSalonMode(look.styling);
    if (salonMode === 'none') continue;
    const part = normalizePart(look.part);
    const key = stylingKey(salonMode, part);
    if (seen.has(key)) continue;
    seen.add(key);

    const afterColorUrl = bawStylingReferencePublicUrl(salonMode, part);
    const publicPath =
      afterColorUrl ??
      (salonMode === 'flat_iron'
        ? noirFalGrayBrickMannequinPublicUrlForAngle('front')
        : noirFalGrayBrickMannequinPublicUrlForAngle('front'));

    refs.push({
      key,
      salonMode,
      part,
      imageIndex: next++,
      publicPath,
    });
  }

  return refs;
}

export function stylingRefForLook(
  refs: HairstyleAnalysisStylingRef[],
  stylingRaw: string,
  partRaw: string
): HairstyleAnalysisStylingRef | null {
  const salonMode = resolveBawSalonMode(stylingRaw);
  if (salonMode === 'none') return null;
  const part = normalizePart(partRaw);
  return refs.find((r) => r.key === stylingKey(salonMode, part)) ?? null;
}

export function bawStylingRefListBlock(refs: HairstyleAnalysisStylingRef[]): string {
  if (refs.length === 0) return '';
  const lines = refs.map(
    (r) =>
      `IMAGE ${r.imageIndex} = BAW salon styling reference (${r.salonMode.toUpperCase()}, ${r.part} part) — copy hairstyle shape/texture exactly; retint hair color only.`
  );
  return ['=== BAW STYLING REFERENCE IMAGES (HAIRSTYLE SHAPE ONLY) ===', ...lines].join('\n');
}
