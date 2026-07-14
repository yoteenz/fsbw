import type { StudioWorldIconCategoryId } from './StudioWorldIconCategories';
import type { StudioWorldIconDefinition } from './StudioWorldIconDefinition';
import type { StudioWorldIconCertificationStage } from './StudioWorldIconDefinition';

const ICONS = new Map<string, StudioWorldIconDefinition>();
const ALIAS_INDEX = new Map<string, string>();
const RECENTLY_USED: string[] = [];
const FAVORITES = new Set<string>();

export type RegisterIconResult =
  | { ok: true; icon: StudioWorldIconDefinition }
  | { ok: false; code: 'DUPLICATE_ID' | 'DUPLICATE_ALIAS'; message: string };

export function registerIcon(definition: StudioWorldIconDefinition): RegisterIconResult {
  if (ICONS.has(definition.id)) {
    return { ok: false, code: 'DUPLICATE_ID', message: `Icon id already registered: ${definition.id}` };
  }
  for (const alias of definition.aliases) {
    if (ALIAS_INDEX.has(alias.toLowerCase())) {
      return { ok: false, code: 'DUPLICATE_ALIAS', message: `Alias already registered: ${alias}` };
    }
  }
  ICONS.set(definition.id, definition);
  for (const alias of definition.aliases) {
    ALIAS_INDEX.set(alias.toLowerCase(), definition.id);
  }
  ALIAS_INDEX.set(definition.id.toLowerCase(), definition.id);
  ALIAS_INDEX.set(definition.displayName.toLowerCase(), definition.id);
  return { ok: true, icon: definition };
}

export function getIcon(id: string): StudioWorldIconDefinition | null {
  const direct = ICONS.get(id);
  if (direct) return direct;
  const viaAlias = ALIAS_INDEX.get(id.toLowerCase());
  return viaAlias ? ICONS.get(viaAlias) ?? null : null;
}

export function listAllIcons(): StudioWorldIconDefinition[] {
  return [...ICONS.values()];
}

export function listByCategory(categoryId: StudioWorldIconCategoryId): StudioWorldIconDefinition[] {
  return listAllIcons().filter((i) => i.category === categoryId);
}

export function listFavorites(): StudioWorldIconDefinition[] {
  return listAllIcons().filter((i) => i.metadata.favorite || FAVORITES.has(i.id));
}

export function listRecentlyUsed(limit = 20): StudioWorldIconDefinition[] {
  return RECENTLY_USED.slice(0, limit)
    .map((id) => getIcon(id))
    .filter((i): i is StudioWorldIconDefinition => i !== null);
}

export function markIconUsed(id: string): void {
  const idx = RECENTLY_USED.indexOf(id);
  if (idx >= 0) RECENTLY_USED.splice(idx, 1);
  RECENTLY_USED.unshift(id);
  if (RECENTLY_USED.length > 50) RECENTLY_USED.length = 50;
  const icon = ICONS.get(id);
  if (icon) icon.metadata.usageCount += 1;
}

export function setIconFavorite(id: string, favorite: boolean): void {
  if (favorite) FAVORITES.add(id);
  else FAVORITES.delete(id);
  const icon = ICONS.get(id);
  if (icon) icon.metadata.favorite = favorite;
}

export function listByCertification(stage: StudioWorldIconCertificationStage): StudioWorldIconDefinition[] {
  return listAllIcons().filter((i) => i.certification === stage);
}

export function listDeprecated(): StudioWorldIconDefinition[] {
  return listAllIcons().filter((i) => i.metadata.deprecated || i.status === 'deprecated');
}

/** Test-only reset */
export function resetStudioWorldIconRegistry(): void {
  ICONS.clear();
  ALIAS_INDEX.clear();
  RECENTLY_USED.length = 0;
  FAVORITES.clear();
}

export function getRegistryStats(): {
  total: number;
  byCategory: Record<string, number>;
  certified: number;
  draft: number;
  deprecated: number;
} {
  const all = listAllIcons();
  const byCategory: Record<string, number> = {};
  for (const icon of all) {
    byCategory[icon.category] = (byCategory[icon.category] ?? 0) + 1;
  }
  return {
    total: all.length,
    byCategory,
    certified: all.filter((i) => i.certification === 'certified' || i.certification === 'production').length,
    draft: all.filter((i) => i.certification === 'draft').length,
    deprecated: all.filter((i) => i.metadata.deprecated).length,
  };
}
