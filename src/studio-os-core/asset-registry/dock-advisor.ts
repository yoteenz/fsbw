import {
  filterAcademyVideos,
  filterOutdatedBrandAssets,
  filterUnusedAssets,
  findAssetByName,
} from './asset-catalog';
import { explainAssetCategory, queryAssetRegistry } from './discovery-engine';
import { summarizeAssetRegistry } from './engine-profile-builder';
import {
  ensureOrganizationAssetRegistryProfile,
  getOrganizationAssetRegistryProfile,
} from './store';
import type { AssetRegistryDockAdvice } from './types';

export function resolveAssetRegistryAdvice(input: string, organizationId: string): AssetRegistryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationAssetRegistryProfile(organizationId) ??
    ensureOrganizationAssetRegistryProfile(organizationId);

  if (/asset registry|managed platform resource|organizational asset|media into knowledge/i.test(trimmed)) {
    return {
      response: summarizeAssetRegistry(profile),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/unused assets|show unused|zero usage/i.test(trimmed)) {
    const unused = filterUnusedAssets(profile.registeredAssets);
    const names = unused.slice(0, 4).map((a) => a.name);
    return {
      response:
        profile.unusedAssetCount === 0
          ? 'No unused assets detected in the last 90 days.'
          : `${profile.unusedAssetCount} unused: ${names.join(' · ')} — consider archive or workflow assignment.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/latest logo|find.*logo|our logo|primary logo/i.test(trimmed)) {
    const logo = findAssetByName(profile.registeredAssets, 'logo');
    return {
      response: logo
        ? `${logo.name} v${logo.version} — ${logo.usageCount} uses · ${logo.status}. Storage: Asset Director.`
        : 'Primary logo not found — register in Asset Registry.',
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  if (/archive outdated brand|outdated brand assets|archive.*brand/i.test(trimmed)) {
    const outdated = filterOutdatedBrandAssets(profile.registeredAssets);
    const names = outdated.map((a) => a.name);
    return {
      response:
        outdated.length === 0
          ? 'No outdated brand assets pending archive.'
          : `${outdated.length} to archive: ${names.join(' · ')} — sync to Legacy Vault on archive.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/videos.*academy|academy.*videos|which videos.*academy/i.test(trimmed)) {
    const videos = filterAcademyVideos(profile.registeredAssets);
    const names = videos.map((a) => a.name);
    return {
      response:
        videos.length === 0
          ? 'No Academy video assets registered.'
          : `${videos.length} Academy resources: ${names.join(' · ')}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/version|never overwrite|previous version|restore/i.test(trimmed)) {
    const current = profile.versionRecords.filter((v) => v.isCurrent).length;
    return {
      response: `${profile.versionRecords.length} version records · ${current} current. Never overwrite — restore and compare any previous version.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/metadata|tags|searchable|broken links|duplicate/i.test(trimmed)) {
    const health = profile.healthMetrics.slice(0, 3).map((m) => `${m.label}: ${m.issueCount} issues`);
    return {
      response: `Asset health ${profile.healthScorePct}% — ${health.join(' · ')}. Everything searchable via metadata.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainCatMatch = trimmed.match(/explain (?:category|asset type)\s+(.+)/i);
  if (explainCatMatch) {
    const hits = queryAssetRegistry(explainCatMatch[1], organizationId, 1);
    if (hits[0]?.type === 'category') {
      return { response: explainAssetCategory(hits[0].id) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryAssetRegistry(trimmed, organizationId, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => h.label).join(' · '),
      concierge: 'Chief Concierge',
      registryScore: profile.registryScore,
    };
  }

  return null;
}

export function listAssetRegistryDockSuggestions(_organizationId: string): string[] {
  return [
    'Show unused assets.',
    'Find our latest logo.',
    'Archive outdated brand assets.',
    'Which videos are used in Academy?',
  ].slice(0, 4);
}

export function buildProactiveAssetRegistrySuggestion(organizationId: string): string | null {
  const profile = getOrganizationAssetRegistryProfile(organizationId);
  if (!profile) return null;
  return summarizeAssetRegistry(profile);
}

export function buildAssetRegistryOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationAssetRegistryProfile(organizationId);
  return profile.dockRegistryLine;
}
