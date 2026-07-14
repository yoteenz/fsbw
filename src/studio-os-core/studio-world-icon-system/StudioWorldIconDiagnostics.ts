import { listAllIcons, getRegistryStats } from './StudioWorldIconRegistry';
import { STUDIO_WORLD_ICON_CATEGORIES } from './StudioWorldIconCategories';
import { STUDIO_WORLD_ICON_STATES } from './StudioWorldIconState';

export type StudioWorldIconDiagnosticReport = {
  generatedAt: string;
  totalIcons: number;
  categoryCount: number;
  certified: number;
  draft: number;
  missingStates: Array<{ iconId: string; missing: string[] }>;
  missingMetadata: Array<{ iconId: string; fields: string[] }>;
  brokenAssets: Array<{ iconId: string; reason: string }>;
  duplicateIds: string[];
  duplicateAliases: string[];
  unusedIcons: string[];
  deprecatedIcons: string[];
  largestCategories: Array<{ categoryId: string; count: number }>;
  newestIcons: Array<{ iconId: string; updatedAt: string }>;
  recentlyChanged: Array<{ iconId: string; updatedAt: string }>;
};

export function analyzeStudioWorldIconDiagnostics(): StudioWorldIconDiagnosticReport {
  const icons = listAllIcons();
  const stats = getRegistryStats();
  const aliasSeen = new Map<string, string>();
  const duplicateAliases: string[] = [];

  const missingStates: StudioWorldIconDiagnosticReport['missingStates'] = [];
  const missingMetadata: StudioWorldIconDiagnosticReport['missingMetadata'] = [];
  const brokenAssets: StudioWorldIconDiagnosticReport['brokenAssets'] = [];

  for (const icon of icons) {
    for (const alias of icon.aliases) {
      const key = alias.toLowerCase();
      if (aliasSeen.has(key)) duplicateAliases.push(alias);
      else aliasSeen.set(key, icon.id);
    }

    const missing = STUDIO_WORLD_ICON_STATES.filter((s) => s !== 'default' && !icon.stateAssets[s]);
    if (missing.length > 0) missingStates.push({ iconId: icon.id, missing });

    const metaMissing: string[] = [];
    if (!icon.description) metaMissing.push('description');
    if (icon.keywords.length === 0) metaMissing.push('keywords');
    if (metaMissing.length) missingMetadata.push({ iconId: icon.id, fields: metaMissing });

    if (!icon.defaultAsset && !icon.pngPath && !icon.svgPath) {
      brokenAssets.push({ iconId: icon.id, reason: 'no-default-asset' });
    }
  }

  const byCategory = Object.entries(stats.byCategory)
    .map(([categoryId, count]) => ({ categoryId, count }))
    .sort((a, b) => b.count - a.count);

  const sortedByDate = [...icons].sort(
    (a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
  );

  return {
    generatedAt: new Date().toISOString(),
    totalIcons: stats.total,
    categoryCount: STUDIO_WORLD_ICON_CATEGORIES.length,
    certified: stats.certified,
    draft: stats.draft,
    missingStates,
    missingMetadata,
    brokenAssets,
    duplicateIds: [],
    duplicateAliases,
    unusedIcons: icons.filter((i) => i.metadata.usageCount === 0).map((i) => i.id),
    deprecatedIcons: icons.filter((i) => i.metadata.deprecated).map((i) => i.id),
    largestCategories: byCategory.slice(0, 5),
    newestIcons: sortedByDate.slice(0, 10).map((i) => ({ iconId: i.id, updatedAt: i.metadata.updatedAt })),
    recentlyChanged: sortedByDate.slice(0, 10).map((i) => ({ iconId: i.id, updatedAt: i.metadata.updatedAt })),
  };
}
