import type { StudioWorldIconCategoryId } from './StudioWorldIconCategories';
import type { StudioWorldIconDefinition, StudioWorldIconCertificationStage } from './StudioWorldIconDefinition';
import { listAllIcons, listRecentlyUsed } from './StudioWorldIconRegistry';

export type StudioWorldIconSearchInput = {
  query?: string;
  category?: StudioWorldIconCategoryId;
  department?: string;
  status?: StudioWorldIconDefinition['status'];
  certification?: StudioWorldIconCertificationStage;
  tag?: string;
  favorite?: boolean;
  recent?: boolean;
  limit?: number;
};

function matchesQuery(icon: StudioWorldIconDefinition, q: string): boolean {
  const needle = q.toLowerCase();
  if (icon.id.toLowerCase().includes(needle)) return true;
  if (icon.displayName.toLowerCase().includes(needle)) return true;
  if (icon.aliases.some((a) => a.toLowerCase().includes(needle))) return true;
  if (icon.keywords.some((k) => k.toLowerCase().includes(needle))) return true;
  if (icon.metadata.tags.some((t) => t.toLowerCase().includes(needle))) return true;
  if (icon.metadata.departmentUsage.some((d) => d.toLowerCase().includes(needle))) return true;
  return false;
}

/** Instant icon search — future AI semantic hook via `semanticQuery` extension point. */
export function searchIcons(input: StudioWorldIconSearchInput = {}): StudioWorldIconDefinition[] {
  let pool = input.recent ? listRecentlyUsed(input.limit ?? 20) : listAllIcons();

  if (input.query?.trim()) {
    pool = pool.filter((i) => matchesQuery(i, input.query!.trim()));
  }
  if (input.category) pool = pool.filter((i) => i.category === input.category);
  if (input.department) {
    const d = input.department.toLowerCase();
    pool = pool.filter((i) => i.metadata.departmentUsage.some((u) => u.toLowerCase().includes(d)));
  }
  if (input.status) pool = pool.filter((i) => i.status === input.status);
  if (input.certification) pool = pool.filter((i) => i.certification === input.certification);
  if (input.tag) {
    const t = input.tag.toLowerCase();
    pool = pool.filter((i) => i.metadata.tags.some((tag) => tag.toLowerCase() === t));
  }
  if (input.favorite) pool = pool.filter((i) => i.metadata.favorite);

  const limit = input.limit ?? 100;
  return pool.slice(0, limit);
}

/** Future AI semantic search hook — architecture placeholder. */
export async function searchIconsSemantic(
  _query: string,
  _options?: { limit?: number }
): Promise<StudioWorldIconDefinition[]> {
  return [];
}
