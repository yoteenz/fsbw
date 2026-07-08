/**
 * Studio Alpha™ creative portfolio metrics — derived from registry + generation receipts.
 */

import { listAllRegistryAssets } from '../studio-builder/registry-store';
import {
  effectiveCostPerUse,
  costLabel,
  savingsFromReuse,
} from './cost-engine';
import { listGenerationReceipts } from './receipt-store';
import type { AssetRoiEntry, CreativePortfolioSnapshot } from './types';

function assetDisplayName(assetId: string, category?: string): string {
  const layer = assetId.replace(/^scene-stack-/, '').replace(/-v\d+$/, '');
  if (category) return `${category} · ${layer}`;
  return layer.replace(/-/g, ' ');
}

export function buildAssetRoiEntries(limit = 5): AssetRoiEntry[] {
  const receipts = listGenerationReceipts().filter(
    (r) => r.status === 'complete' || r.status === 'reused'
  );
  const registry = listAllRegistryAssets();

  const byAsset = new Map<
    string,
    {
      generationCost: number;
      certainty: 'estimated' | 'actual';
      reuseCount: number;
      scenes: Set<string>;
      departments: Set<string>;
      displayName: string;
      marketplaceEligible: boolean;
    }
  >();

  for (const r of receipts) {
    if (r.status === 'reused') continue;
    const cost =
      r.actualCostCertainty === 'actual' && typeof r.actualCost === 'number'
        ? r.actualCost
        : r.estimatedCost;
    const existing = byAsset.get(r.assetId);
    if (!existing || cost > 0) {
      byAsset.set(r.assetId, {
        generationCost: cost,
        certainty: r.actualCostCertainty === 'actual' ? 'actual' : 'estimated',
        reuseCount: existing?.reuseCount ?? 0,
        scenes: existing?.scenes ?? new Set([r.sceneId]),
        departments: existing?.departments ?? new Set([r.departmentId]),
        displayName: r.assetType || assetDisplayName(r.assetId),
        marketplaceEligible: true,
      });
    }
  }

  for (const r of receipts) {
    if (r.status !== 'reused' || !r.reusedAssets?.length) continue;
    const sourceId = r.reusedAssets[0];
    const entry = byAsset.get(sourceId);
    if (entry) {
      entry.reuseCount += 1;
      entry.scenes.add(r.sceneId);
      entry.departments.add(r.departmentId);
    }
  }

  for (const reg of registry) {
    const entry = byAsset.get(reg.assetId);
    if (entry) {
      entry.marketplaceEligible = reg.status === 'validated';
      if (!entry.displayName || entry.displayName === reg.assetId) {
        entry.displayName = assetDisplayName(reg.assetId, reg.category);
      }
    }
  }

  const entries: AssetRoiEntry[] = [...byAsset.entries()].map(([assetId, data]) => {
    const savings = savingsFromReuse(data.generationCost, data.reuseCount);
    const eff = effectiveCostPerUse(data.generationCost, data.reuseCount);
    const portfolioValue = data.generationCost + savings;
    return {
      assetId,
      displayName: data.displayName,
      generationCost: costLabel(data.generationCost, data.certainty),
      reuseCount: data.reuseCount,
      scenesUsing: data.scenes.size,
      departmentsUsing: data.departments.size,
      effectiveCostPerUse: costLabel(eff, 'estimated'),
      savingsGenerated: costLabel(savings, 'estimated'),
      marketplaceEligible: data.marketplaceEligible,
      portfolioValue: costLabel(portfolioValue, 'estimated'),
    };
  });

  return entries
    .sort((a, b) => b.savingsGenerated.value - a.savingsGenerated.value)
    .slice(0, limit);
}

export function buildCreativePortfolioSnapshot(): CreativePortfolioSnapshot {
  const registry = listAllRegistryAssets();
  const receipts = listGenerationReceipts();
  const roi = buildAssetRoiEntries(10);

  const reusableAssets = registry.filter((e) => e.status === 'validated').length;
  const blueprintSystems = new Set(registry.map((e) => e.productionGroupId)).size;
  const marketplaceEligible = registry.filter((e) => e.status === 'validated').length;
  const studioCertified = registry.filter(
    (e) => e.status === 'validated' && e.publicUrl
  ).length;

  const totalSavings = receipts
    .filter((r) => r.status === 'reused')
    .reduce((s, r) => s + (r.savingsEstimate ?? 0), 0);

  const totalGenCost = receipts
    .filter((r) => r.status === 'complete')
    .reduce((s, r) => s + (r.actualCost ?? r.estimatedCost), 0);

  const portfolioValue = totalGenCost + totalSavings;
  const reuseRatio =
    reusableAssets > 0
      ? receipts.filter((r) => r.status === 'reused').length /
        Math.max(1, receipts.filter((r) => r.status === 'complete').length)
      : 0;

  const highestRoi = roi[0]?.displayName ?? null;
  const mostReused =
    [...roi].sort((a, b) => b.reuseCount - a.reuseCount)[0]?.displayName ?? null;

  const creativeEquityScore = Math.min(
    100,
    Math.round(
      40 +
        Math.min(30, reusableAssets / 20) +
        Math.min(20, reuseRatio * 40) +
        Math.min(10, blueprintSystems)
    )
  );

  return {
    creativeEquityScore,
    estimatedPortfolioValue: costLabel(portfolioValue, 'estimated'),
    reusableAssets,
    blueprintSystems,
    highestRoiAsset: highestRoi,
    mostReusedBlueprint: mostReused,
    assetHealth: Math.min(100, Math.round(70 + reusableAssets / 30)),
    designConsistency: Math.min(100, Math.round(75 + blueprintSystems * 2)),
    marketplaceEligibleAssets: marketplaceEligible,
    studioCertifiedCandidates: studioCertified,
  };
}
