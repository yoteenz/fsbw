import { listAllRegistryAssets } from '../studio-builder/registry-store';
import type { ArchitectureViolation } from './types';

function uid(): string {
  return `ar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export type AssetRegistryAuditResult = {
  violations: ArchitectureViolation[];
  duplicateAssetCount: number;
  registryEfficiencyPct: number;
  reuseScore: number;
};

export function auditAssetRegistry(): AssetRegistryAuditResult {
  const entries = listAllRegistryAssets();
  const violations: ArchitectureViolation[] = [];
  const seen = new Map<string, number>();
  let duplicates = 0;

  for (const entry of entries) {
    const key = `${entry.departmentId}:${entry.assetId}:${entry.productionGroupId ?? 'default'}`;
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (count > 1) duplicates++;
  }

  if (duplicates > 0) {
    violations.push({
      id: uid(),
      category: 'asset-registry',
      severity: 'major',
      problem: `${duplicates} duplicate asset registrations detected`,
      reason: 'Asset Registry™ must deduplicate — search registry first, maximum reuse',
      affectedRoutes: [],
      detectedPatterns: ['duplicate assets'],
    });
  }

  const uncategorized = entries.filter((e) => !e.productionGroupId);
  if (uncategorized.length > entries.length * 0.3 && entries.length > 5) {
    violations.push({
      id: uid(),
      category: 'asset-registry',
      severity: 'minor',
      problem: `${uncategorized.length} assets lack production group categorization`,
      reason: 'Proper categorization enables reuse across Scene Stack™ layers',
      affectedRoutes: [],
      detectedPatterns: ['uncategorized assets'],
    });
  }

  const uniqueAssets = seen.size;
  const registryEfficiencyPct =
    entries.length > 0 ? Math.round((uniqueAssets / entries.length) * 100) : 100;
  const reuseScore = Math.min(100, Math.round((entries.length / Math.max(uniqueAssets, 1)) * 20 + registryEfficiencyPct * 0.5));

  return {
    violations,
    duplicateAssetCount: duplicates,
    registryEfficiencyPct,
    reuseScore,
  };
}
