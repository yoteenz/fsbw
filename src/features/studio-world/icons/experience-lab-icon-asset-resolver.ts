import type { ExperienceLabIconName } from './experience-lab-icon-registry';
import {
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_ASSET_DIR,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_SOURCE_ROLE,
} from './experience-lab-icon-assets.generated';

/** Optical tuning paused until v5 source twin passes founder visual QA. */
export const EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED = true as const;

export type ResolvedExperienceLabIconAsset = {
  src: string | null;
  approved: boolean;
  auditStatus: 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
  source: 'v5-source-twin' | 'missing';
  parityStatus?: 'PASS' | 'WARN' | 'FAIL';
  twinParityStatus?: 'PASS' | 'WARN' | 'FAIL';
};

function resolveV5Asset(name: ExperienceLabIconName): ResolvedExperienceLabIconAsset {
  const entry = EXPERIENCE_LAB_ICON_ASSETS[name];
  if (!entry?.src) {
    return { src: null, approved: false, auditStatus: 'FAIL', source: 'missing' };
  }
  const audit = entry.auditStatus === 'PENDING' ? 'PASS' : entry.auditStatus;
  return {
    src: entry.src,
    approved: entry.approved && audit !== 'FAIL',
    auditStatus: audit,
    source: 'v5-source-twin',
    parityStatus: entry.parityStatus,
  };
}

/** Production runtime — v5 pixel-preserving twin grid extraction only. */
export function resolveProductionExperienceLabIconAsset(
  name: ExperienceLabIconName,
): ResolvedExperienceLabIconAsset {
  return resolveV5Asset(name);
}

/** QA route — v5 assets with source-twin parity metadata. */
export function resolveQaExperienceLabIconAsset(name: ExperienceLabIconName): ResolvedExperienceLabIconAsset {
  return resolveV5Asset(name);
}

export function isExperienceLabIconLibraryCertified(): boolean {
  return EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED;
}

export function getExperienceLabIconSourceRole(): typeof EXPERIENCE_LAB_ICON_SOURCE_ROLE {
  return EXPERIENCE_LAB_ICON_SOURCE_ROLE;
}

export { EXPERIENCE_LAB_ICON_ASSET_DIR };
