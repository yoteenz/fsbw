import type { XpsTrackedAsset } from '../types';
import type { XniNarrativeBlueprint } from '../../narrative-intelligence/types';
import type { XpsDepartmentAssignment } from '../types';

/** Asset Tracker™ — required assets from blueprint + departments */
export function buildAssetChecklist(
  blueprint: XniNarrativeBlueprint,
  departments: XpsDepartmentAssignment[]
): XpsTrackedAsset[] {
  const blueprintAssets: XpsTrackedAsset[] = blueprint.requiredAssets.map((label, i) => ({
    assetId: `asset-bp-${i}`,
    label,
    departmentId: 'production-design',
    status: 'required',
    source: 'blueprint',
  }));

  const deptAssets: XpsTrackedAsset[] = departments.flatMap((d) =>
    d.outputs.slice(0, 2).map((output, i) => ({
      assetId: `asset-${d.departmentId}-${i}`,
      label: output,
      departmentId: d.departmentId,
      status: d.status === 'complete' ? ('ready' as const) : ('required' as const),
      source: 'department' as const,
    }))
  );

  return [...blueprintAssets, ...deptAssets];
}

export function markAssetReady(assets: XpsTrackedAsset[], assetId: string): XpsTrackedAsset[] {
  return assets.map((a) => (a.assetId === assetId ? { ...a, status: 'ready' } : a));
}

export function countAssetsByStatus(assets: XpsTrackedAsset[]): Record<string, number> {
  return assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
}
