import type { WarehouseAsset, WarehouseSearchResult } from './types';

const NL_PATTERNS: Array<{ pattern: RegExp; filter: (a: WarehouseAsset) => boolean; term: string }> = [
  {
    pattern: /white marble|marble headquarters/i,
    filter: (a) => a.tags.some((t) => /marble|white/i.test(t)) || /marble/i.test(a.name),
    term: 'white marble',
  },
  {
    pattern: /frontal slayer/i,
    filter: (a) => /frontal slayer/i.test(a.workspace) || /frontal/i.test(a.department),
    term: 'Frontal Slayer',
  },
  {
    pattern: /floating architecture/i,
    filter: (a) => a.category === 'environment-shell' && /float|arch/i.test(a.name + a.tags.join(' ')),
    term: 'floating architecture',
  },
  {
    pattern: /most expensive|expensive generation/i,
    filter: () => true,
    term: 'generation cost',
  },
  {
    pattern: /unused furniture/i,
    filter: (a) => a.category === 'furniture' && a.usageCount === 0,
    term: 'unused furniture',
  },
  {
    pattern: /story table/i,
    filter: (a) => a.compatibleScenePackIds.includes('story-table') || /story table/i.test(a.workspace),
    term: 'Story Table™',
  },
  {
    pattern: /lighting/i,
    filter: (a) => a.category === 'lighting-pack' || a.districtId === 'lighting-gallery',
    term: 'lighting',
  },
  {
    pattern: /environment/i,
    filter: (a) => a.category === 'environment-shell',
    term: 'environment',
  },
  {
    pattern: /atmosphere|fog|dust|particle/i,
    filter: (a) => a.districtId === 'atmosphere-lab',
    term: 'atmosphere',
  },
  {
    pattern: /studio orb|hero object/i,
    filter: (a) => a.districtId === 'hero-object-vault',
    term: 'hero object',
  },
];

function tokenScore(asset: WarehouseAsset, tokens: string[]): { score: number; matched: string[] } {
  const hay = [
    asset.name,
    asset.department,
    asset.workspace,
    asset.category,
    asset.districtId,
    ...asset.tags,
  ]
    .join(' ')
    .toLowerCase();
  let score = 0;
  const matched: string[] = [];
  for (const token of tokens) {
    if (token.length < 2) continue;
    if (hay.includes(token)) {
      score += 10;
      matched.push(token);
    }
  }
  return { score, matched };
}

export function searchWarehouseAssets(query: string, assets: WarehouseAsset[], limit = 24): WarehouseSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const expensiveQuery = /most expensive|expensive generation/i.test(trimmed);

  for (const { pattern, filter, term } of NL_PATTERNS) {
    if (pattern.test(trimmed)) {
      let hits = assets.filter((a) => !a.archived && filter(a));
      if (expensiveQuery) {
        hits = [...hits].sort((a, b) => b.generationCostUsd - a.generationCostUsd);
      }
      return hits.slice(0, limit).map((asset, i) => ({
        asset,
        score: 100 - i,
        matchedTerms: [term],
      }));
    }
  }

  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const results: WarehouseSearchResult[] = [];

  for (const asset of assets) {
    if (asset.archived) continue;
    const { score, matched } = tokenScore(asset, tokens);
    if (score > 0) {
      results.push({ asset, score, matchedTerms: matched });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function filterCompatibleAssets(
  assets: WarehouseAsset[],
  workspaceId: string,
  slotRole: string
): WarehouseAsset[] {
  const role = slotRole.toLowerCase();
  return assets.filter((a) => {
    if (a.archived) return false;
    if (!a.compatibleScenePackIds.includes(workspaceId)) return false;
    if (role.includes('light') && a.category !== 'lighting-pack') return false;
    if (role.includes('furniture') && a.category !== 'furniture') return false;
    if (role.includes('material') && a.category !== 'materials') return false;
    if (role.includes('environment') && a.category !== 'environment-shell') return false;
    if (role.includes('atmosphere') && a.districtId !== 'atmosphere-lab') return false;
    if (role.includes('hero') && a.districtId !== 'hero-object-vault') return false;
    return true;
  });
}
