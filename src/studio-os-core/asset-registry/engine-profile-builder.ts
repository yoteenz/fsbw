import { getOrganizationStateEngineProfile } from '../state-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildRegisteredAssets,
  countDuplicates,
  countUnusedAssets,
} from './asset-catalog';
import { buildAssetCategoryCatalog, countTotalRegisteredAssets } from './category-catalog';
import {
  buildAssetRecommendations,
  computeCatalogCoveragePct,
  runAssetGovernanceAudit,
} from './governance-engine';
import { buildAssetHealthMetrics, computeHealthScorePct } from './health-engine';
import { buildAssetMetadataSchema } from './metadata-engine';
import { buildVersionRecords, computeVersioningIntegrityPct } from './versioning-engine';
import type { OrganizationAssetRegistryProfile } from './types';

export function buildDockRegistryLine(profile: OrganizationAssetRegistryProfile): string {
  return `Asset Registry™ ${profile.registryScore}% — ${profile.totalAssetCount} assets · ${profile.categories.length} categories · ${profile.healthScorePct}% health.`;
}

export function buildOrganizationAssetRegistryProfile(organizationId: string): OrganizationAssetRegistryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const stateEngine = getOrganizationStateEngineProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const categories = buildAssetCategoryCatalog();
  const registeredAssets = buildRegisteredAssets(organizationId);
  const metadataSchema = buildAssetMetadataSchema();
  const versionRecords = buildVersionRecords();
  const healthMetrics = buildAssetHealthMetrics();
  const healthScorePct = computeHealthScorePct(healthMetrics);
  const versioningIntegrityPct = computeVersioningIntegrityPct();
  const totalAssetCount = countTotalRegisteredAssets();
  const catalogCoveragePct = computeCatalogCoveragePct(categories.length, totalAssetCount);
  const unusedAssetCount = countUnusedAssets(registeredAssets);
  const duplicateCount = countDuplicates(registeredAssets);
  const governanceFindings = runAssetGovernanceAudit();

  const stateBoost = stateEngine ? Math.round(stateEngine.consistencyScore / 25) : 0;
  const registryScore = Math.min(
    99,
    Math.round((catalogCoveragePct + versioningIntegrityPct + healthScorePct + stateBoost) / 3 - unusedAssetCount)
  );

  const profile: OrganizationAssetRegistryProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore,
    catalogCoveragePct,
    versioningIntegrityPct,
    healthScorePct,
    categories,
    registeredAssets,
    metadataSchema,
    versionRecords,
    healthMetrics,
    governanceFindings,
    recommendations: buildAssetRecommendations(unusedAssetCount, duplicateCount),
    totalAssetCount,
    unusedAssetCount,
    duplicateCount,
    dockRegistryLine: '',
    managedPlatformResource: true,
    lastSyncedAt: now,
  };

  profile.dockRegistryLine = buildDockRegistryLine(profile);
  return profile;
}

export function summarizeAssetRegistry(profile: OrganizationAssetRegistryProfile): string {
  return `${profile.dockRegistryLine} Discoverable · reusable · versioned · connected.`;
}
