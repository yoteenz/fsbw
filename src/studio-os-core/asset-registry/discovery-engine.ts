import { buildRegisteredAssets } from './asset-catalog';
import { buildAssetCategoryCatalog } from './category-catalog';
import { buildAssetHealthMetrics } from './health-engine';
import { buildVersionRecords } from './versioning-engine';
import type { AssetSearchHit } from './types';

export function queryAssetRegistry(query: string, organizationId: string, limit = 12): AssetSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const hits: AssetSearchHit[] = [];

  for (const c of buildAssetCategoryCatalog()) {
    const blob = `${c.label} ${c.category} ${c.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (c.category.includes(term)) score += 10;
      if (c.label.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'category', id: c.category, label: c.label, score, matchReason: 'asset category' });
  }

  for (const a of buildRegisteredAssets(organizationId)) {
    const blob = `${a.name} ${a.assetId} ${a.tags.join(' ')} ${a.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (a.assetId.includes(term)) score += 10;
      if (a.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'asset', id: a.assetId, label: a.name, score, matchReason: 'registered asset' });
  }

  for (const v of buildVersionRecords()) {
    const blob = `${v.version} ${v.assetId} ${v.changeSummary}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (v.version.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'version', id: v.versionId, label: `${v.assetId} v${v.version}`, score, matchReason: 'version record' });
  }

  for (const h of buildAssetHealthMetrics()) {
    const blob = `${h.label} ${h.checkId} ${h.detail}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (h.checkId.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'health', id: h.checkId, label: h.label, score, matchReason: 'health check' });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainAssetCategory(category: string): string | null {
  const c = buildAssetCategoryCatalog().find((x) => x.category === category);
  if (!c) return null;
  return `${c.label} — ${c.description} ${c.registeredCount} registered · searchable.`;
}
