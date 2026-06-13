import type { AnalysisTier } from '../types/hairstyleAnalysis';
import {
  defaultAdditionalManifests,
  defaultTopMatchManifest,
  normalizeManifestDraft,
  type ManifestLookDraft,
} from './hairstyleAnalysisManifestOptions';
import { additionalLooksLimit } from './hairstyleAnalysisRules';

export const HAIRSTYLE_ANALYSIS_MANIFEST_STORAGE_KEY = 'hairstyle_analysis_manifest_test';

export type ManifestTierStorage = {
  topMatch: ManifestLookDraft;
  additionalLooks: ManifestLookDraft[];
};

type ManifestStorageFile = {
  manifestTestMode?: boolean;
  tiers?: Partial<Record<AnalysisTier, ManifestTierStorage>>;
};

function isManifestLookDraft(raw: unknown): raw is ManifestLookDraft {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.unit === 'string' &&
    typeof o.color === 'string' &&
    typeof o.length === 'string' &&
    typeof o.lace === 'string' &&
    typeof o.density === 'string' &&
    typeof o.part === 'string' &&
    typeof o.hairline === 'string' &&
    typeof o.styling === 'string'
  );
}

function normalizeTierStorage(tier: AnalysisTier, raw: ManifestTierStorage): ManifestTierStorage {
  const limit = additionalLooksLimit(tier);
  const topMatch = normalizeManifestDraft(raw.topMatch);
  const additionalLooks = (raw.additionalLooks ?? [])
    .filter(isManifestLookDraft)
    .slice(0, limit)
    .map((draft) => normalizeManifestDraft(draft));

  const defaults = defaultAdditionalManifests();
  while (additionalLooks.length < limit) {
    additionalLooks.push(normalizeManifestDraft(defaults[additionalLooks.length] ?? defaultTopMatchManifest()));
  }

  return { topMatch, additionalLooks };
}

function readStorageFile(): ManifestStorageFile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HAIRSTYLE_ANALYSIS_MANIFEST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ManifestStorageFile;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorageFile(file: ManifestStorageFile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HAIRSTYLE_ANALYSIS_MANIFEST_STORAGE_KEY, JSON.stringify(file, null, 2));
}

export function loadManifestTestModeEnabled(): boolean {
  return readStorageFile().manifestTestMode === true;
}

export function saveManifestTestModeEnabled(enabled: boolean): void {
  const file = readStorageFile();
  file.manifestTestMode = enabled;
  writeStorageFile(file);
}

export function loadManifestForTier(tier: AnalysisTier): ManifestTierStorage | null {
  const saved = readStorageFile().tiers?.[tier];
  if (!saved || !isManifestLookDraft(saved.topMatch)) return null;
  return normalizeTierStorage(tier, saved);
}

export function saveManifestForTier(tier: AnalysisTier, state: ManifestTierStorage): void {
  const file = readStorageFile();
  if (!file.tiers) file.tiers = {};
  file.tiers[tier] = normalizeTierStorage(tier, state);
  writeStorageFile(file);
}

export function clearManifestForTier(tier: AnalysisTier): void {
  const file = readStorageFile();
  if (!file.tiers?.[tier]) return;
  delete file.tiers[tier];
  writeStorageFile(file);
}

export function initialManifestDrafts(
  tier: AnalysisTier,
  fallbackTop: ManifestLookDraft,
  fallbackAlts: ManifestLookDraft[]
): ManifestTierStorage {
  const saved = loadManifestForTier(tier);
  if (saved) return saved;
  const limit = additionalLooksLimit(tier);
  const defaults = defaultAdditionalManifests();
  return {
    topMatch: normalizeManifestDraft(fallbackTop),
    additionalLooks:
      fallbackAlts.length > 0
        ? fallbackAlts.slice(0, limit).map((d) => normalizeManifestDraft(d))
        : defaults.slice(0, limit).map((d) => normalizeManifestDraft(d)),
  };
}
