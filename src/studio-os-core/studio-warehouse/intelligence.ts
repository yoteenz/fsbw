/**
 * Studio Warehouse™ — Reuse Intelligence™, World Graph™, Asset Relationships™
 * ERA 2 — WORLD™ · ERA 3 — INTELLIGENCE™ foundations
 */

import { STUDIO_WORLD_NAVIGATION_EDGES } from '../studio-world/navigation';
import type { WarehouseAsset } from './types';
import { WAREHOUSE_SCENE_RECIPES } from './scene-recipes';

export type WarehouseReuseIntelligence = {
  generationCostUsd: number;
  reuseCostUsd: number;
  savingsUsd: number;
  usedInWorkspaces: string[];
  usedInCount: number;
  totalSavingsUsd: number;
  generationTimeAvoidedMinutes: number;
  reuseEfficiencyPct: number;
};

export type WarehouseAssetRelationship = {
  role: string;
  assetId: string;
  assetName: string;
  depth: number;
};

export type WarehouseWorldGraphNode = {
  id: string;
  label: string;
  kind: 'asset' | 'workspace' | 'blueprint' | 'headquarters' | 'marketplace' | 'simulation';
};

export type WarehouseWorldGraphEdge = {
  from: string;
  to: string;
  label: string;
};

export type WarehouseQualityReport = {
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  factors: Array<{ label: string; value: string }>;
};

export function computeQualityScore(asset: WarehouseAsset): WarehouseQualityReport {
  const reuseFactor = Math.min(40, asset.reuseCount * 3);
  const goldenFactor = Math.min(30, asset.goldenBuildCount * 2.5);
  const genomeFactor = Math.min(20, asset.genomeCompatibilityPct * 0.2);
  const usageFactor = Math.min(10, asset.usageCount * 2);
  const score = Math.round(reuseFactor + goldenFactor + genomeFactor + usageFactor);

  const grade: WarehouseQualityReport['grade'] =
    score >= 92 ? 'A+' : score >= 85 ? 'A' : score >= 75 ? 'B+' : score >= 65 ? 'B' : 'C';

  return {
    score,
    grade,
    factors: [
      { label: 'Reuse History', value: `${asset.reuseCount} remounts` },
      { label: 'Golden Builds', value: String(asset.goldenBuildCount) },
      { label: 'Genome Match', value: `${asset.genomeCompatibilityPct}%` },
      { label: 'Workspace Usage', value: String(asset.usageCount) },
    ],
  };
}

export function buildReuseIntelligence(asset: WarehouseAsset): WarehouseReuseIntelligence {
  const generationCostUsd = asset.generationCostUsd;
  const reuseCostUsd = 0;
  const savingsUsd = generationCostUsd;
  const usedInWorkspaces = asset.compatibleScenePackIds.map((id) =>
    id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
  const usedInCount = Math.max(usedInWorkspaces.length, asset.usageCount);
  const totalSavingsUsd = savingsUsd * Math.max(asset.reuseCount, 1);
  const generationTimeAvoidedMinutes = Math.round(asset.reuseCount * 1.5 + asset.goldenBuildCount * 0.75);
  const reuseEfficiencyPct = Math.min(
    99,
    Math.round(70 + asset.reuseCount * 2 + asset.goldenBuildCount * 0.5)
  );

  return {
    generationCostUsd,
    reuseCostUsd,
    savingsUsd,
    usedInWorkspaces,
    usedInCount,
    totalSavingsUsd,
    generationTimeAvoidedMinutes,
    reuseEfficiencyPct,
  };
}

/** Scene assembly family tree — teaches how scenes are built */
export function buildAssetRelationshipTree(
  asset: WarehouseAsset,
  catalog: WarehouseAsset[]
): WarehouseAssetRelationship[] {
  const recipe = WAREHOUSE_SCENE_RECIPES.find((r) =>
    r.ingredients.some((i) => i.assetId === asset.id)
  );
  if (!recipe) {
    const related = catalog.filter((a) => asset.similarAssetIds.includes(a.id)).slice(0, 4);
    return related.map((a, i) => ({
      role: a.category.replace('-', ' '),
      assetId: a.id,
      assetName: a.name,
      depth: i + 1,
    }));
  }

  const roleOrder = [
    'Environment Shell™',
    'Lighting™',
    'Materials™',
    'Furniture™',
    'Atmosphere™',
    'Particles™',
    'Hero Object™',
    'Runtime™',
    'Animations™',
  ];

  const sorted = [...recipe.ingredients].sort((a, b) => {
    const ai = roleOrder.findIndex((r) => a.role.includes(r.replace('™', '')));
    const bi = roleOrder.findIndex((r) => b.role.includes(r.replace('™', '')));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return sorted.map((ing, i) => ({
    role: ing.role,
    assetId: ing.assetId,
    assetName: ing.assetName,
    depth: i,
  }));
}

/** World Graph™ — every asset is a connected node */
export function buildWorldGraphForAsset(
  asset: WarehouseAsset,
  catalog: WarehouseAsset[]
): { nodes: WarehouseWorldGraphNode[]; edges: WarehouseWorldGraphEdge[] } {
  const nodes: WarehouseWorldGraphNode[] = [
    { id: asset.id, label: asset.name, kind: 'asset' },
  ];
  const edges: WarehouseWorldGraphEdge[] = [];

  asset.compatibleScenePackIds.forEach((wsId) => {
    const nodeId = `ws-${wsId}`;
    nodes.push({
      id: nodeId,
      label: wsId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      kind: 'workspace',
    });
    edges.push({ from: asset.id, to: nodeId, label: 'Used In™' });
  });

  const recipe = WAREHOUSE_SCENE_RECIPES.find((r) =>
    r.ingredients.some((i) => i.assetId === asset.id)
  );
  if (recipe) {
    nodes.push({
      id: `bp-${recipe.workspaceId}`,
      label: `${recipe.workspaceName} Blueprint`,
      kind: 'blueprint',
    });
    edges.push({ from: `bp-${recipe.workspaceId}`, to: asset.id, label: 'Blueprint Registry™' });
  }

  if (asset.marketplaceStatus === 'marketplace-listed' || asset.marketplaceStatus === 'imported') {
    nodes.push({ id: 'marketplace-pavilion', label: 'Marketplace Pavilion™', kind: 'marketplace' });
    edges.push({ from: asset.id, to: 'marketplace-pavilion', label: 'Marketplace Usage™' });
  }

  nodes.push({ id: 'hq-marketing', label: 'Headquarters™', kind: 'headquarters' });
  edges.push({ from: asset.id, to: 'hq-marketing', label: 'Headquarters Use' });

  if (asset.goldenBuildCount >= 5) {
    nodes.push({ id: 'future-sim', label: 'Parallel Futures™', kind: 'simulation' });
    edges.push({ from: asset.id, to: 'future-sim', label: 'Future Simulation' });
  }

  asset.similarAssetIds.slice(0, 3).forEach((relatedId) => {
    const related = catalog.find((a) => a.id === relatedId);
    if (related) {
      nodes.push({ id: related.id, label: related.name, kind: 'asset' });
      edges.push({ from: asset.id, to: related.id, label: 'Related Asset' });
    }
  });

  STUDIO_WORLD_NAVIGATION_EDGES.slice(0, 2).forEach((navEdge, i) => {
    const nodeId = `nav-${i}`;
    nodes.push({ id: nodeId, label: navEdge.label, kind: 'workspace' });
    edges.push({ from: asset.id, to: nodeId, label: navEdge.movementVerb });
  });

  return { nodes, edges };
}

export type WarehouseCompareRow = {
  label: string;
  values: string[];
};

export function buildCompareRows(assets: WarehouseAsset[]): WarehouseCompareRow[] {
  if (assets.length === 0) return [];

  const qualityScores = assets.map((a) => computeQualityScore(a).score);

  return [
    { label: 'Quality', values: qualityScores.map((s) => `${s}/100`) },
    {
      label: 'Generation Cost',
      values: assets.map((a) => `$${a.generationCostUsd.toFixed(2)}`),
    },
    { label: 'Reuse Count', values: assets.map((a) => String(a.reuseCount)) },
    {
      label: 'Workspace Usage',
      values: assets.map((a) => String(Math.max(a.usageCount, a.compatibleScenePackIds.length))),
    },
    { label: 'Version', values: assets.map((a) => a.version) },
    { label: 'Created', values: assets.map((a) => a.generationDate) },
    {
      label: 'Future Variant',
      values: assets.map((a) => (a.goldenBuildCount >= 8 ? 'Parallel Future™ ready' : '—')),
    },
  ];
}
