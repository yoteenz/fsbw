import type { ExperienceLabIconName } from './experience-lab-icon-registry';
import {
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_ASSET_DIR,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
} from './experience-lab-icon-assets.generated';
import { StudioWorldIconCropManifest } from './studio-world-icon-crop-manifest';

/** Optical tuning paused until v3 source crops are founder-approved. */
export const EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED = true as const;

const PREVIEW_IMPORTS = import.meta.glob(
  '../../../assets/studio-world/experience-lab/icons/generated-v3/_preview-unapproved/*.png',
  { eager: true, import: 'default' },
) as Record<string, string>;

function previewUrlForKey(key: ExperienceLabIconName): string | null {
  const slug = key.replace(/([A-Z])/g, '-$1').toLowerCase();
  const entry = Object.entries(PREVIEW_IMPORTS).find(([path]) => path.endsWith(`/${slug}.png`));
  return entry?.[1] ?? null;
}

export type ResolvedExperienceLabIconAsset = {
  src: string | null;
  approved: boolean;
  auditStatus: 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
  source: 'v3-approved' | 'preview-unapproved' | 'missing';
};

/** Production runtime — approved v3 only; fail closed to neutral fallback. */
export function resolveProductionExperienceLabIconAsset(
  name: ExperienceLabIconName,
): ResolvedExperienceLabIconAsset {
  const entry = EXPERIENCE_LAB_ICON_ASSETS[name];
  if (entry?.approved && entry.src) {
    return {
      src: entry.src,
      approved: true,
      auditStatus: entry.auditStatus === 'PENDING' ? 'PASS' : entry.auditStatus,
      source: 'v3-approved',
    };
  }
  return { src: null, approved: false, auditStatus: 'PENDING', source: 'missing' };
}

/** QA / crop editor — may show unapproved v3 previews. */
export function resolveQaExperienceLabIconAsset(name: ExperienceLabIconName): ResolvedExperienceLabIconAsset {
  const production = resolveProductionExperienceLabIconAsset(name);
  if (production.src) return production;
  const preview = previewUrlForKey(name);
  if (preview) {
    return { src: preview, approved: false, auditStatus: 'PENDING', source: 'preview-unapproved' };
  }
  return production;
}

export function isExperienceLabIconLibraryCertified(): boolean {
  return EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED;
}

export function resolveCropEntry(name: ExperienceLabIconName) {
  return StudioWorldIconCropManifest[name];
}

export { EXPERIENCE_LAB_ICON_ASSET_DIR };
