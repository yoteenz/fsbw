import type { LoungeTvMainTab, LoungeTvVideoTile } from '../components/lounge/loungeTvContent';
import {
  LOUNGE_TV_MAIN_TABS,
  LOUNGE_TV_SIDEBAR,
  getLoungeTvTilesStatic,
  getWatchLearnVideoCopy,
} from '../components/lounge/loungeTvContent';
import {
  LOUNGE_TV_CONTENT_VIDEO_SRC,
  LOUNGE_TV_PLUCKING_LACE_TILE_ID,
} from '../components/lounge/loungeTvAssets';

export type LoungeTvAdminMediaType = 'image' | 'video';

export type LoungeTvAdminItem = {
  id: string;
  title: string;
  body: string;
  mediaType: LoungeTvAdminMediaType;
  mediaUrl: string;
  thumbSrc?: string;
  isNew?: boolean;
  durationLabel?: string;
};

export type LoungeTvAdminPlacement = {
  mainTab: LoungeTvMainTab;
  sidebarId: string;
  items: LoungeTvAdminItem[];
};

export type LoungeTvAdminConfig = {
  version: 1;
  /** Milliseconds since epoch; set on each admin save for merge/hydrate. */
  updatedAt?: number;
  placements: LoungeTvAdminPlacement[];
};

export const LOUNGE_TV_ADMIN_STORAGE_KEY = 'loungeTvAdminConfig';

function placementKey(mainTab: LoungeTvMainTab, sidebarId: string): string {
  return `${mainTab}:${sidebarId}`;
}

function tileToAdminItem(tile: LoungeTvVideoTile): LoungeTvAdminItem {
  const isVideo = Boolean(tile.videoSrc);
  const isPlucking = tile.id === LOUNGE_TV_PLUCKING_LACE_TILE_ID;
  return {
    id: tile.id,
    title: tile.title,
    body: tile.description ?? '',
    mediaType: isVideo || isPlucking ? 'video' : 'image',
    mediaUrl: isPlucking
      ? LOUNGE_TV_CONTENT_VIDEO_SRC
      : isVideo
        ? tile.videoSrc!
        : (tile.thumbSrc ?? ''),
    thumbSrc: tile.thumbSrc,
    isNew: tile.isNew,
    durationLabel: tile.durationLabel,
  };
}

/** Seed admin config from current hardcoded lounge TV tiles. */
export function buildDefaultLoungeTvAdminConfig(): LoungeTvAdminConfig {
  const placements: LoungeTvAdminPlacement[] = [];
  for (const tab of LOUNGE_TV_MAIN_TABS) {
    const sidebars = LOUNGE_TV_SIDEBAR[tab.id] ?? [];
    for (const sidebar of sidebars) {
      const tiles = getLoungeTvTilesStatic(tab.id, sidebar.id) ?? [];
      placements.push({
        mainTab: tab.id,
        sidebarId: sidebar.id,
        items: tiles.map(tileToAdminItem),
      });
    }
  }
  return { version: 1, placements };
}

function normalizeConfig(raw: unknown): LoungeTvAdminConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.placements)) return null;
  const placements: LoungeTvAdminPlacement[] = [];
  for (const p of o.placements) {
    if (!p || typeof p !== 'object') continue;
    const row = p as Record<string, unknown>;
    const mainTab = row.mainTab as LoungeTvMainTab;
    const sidebarId = typeof row.sidebarId === 'string' ? row.sidebarId : '';
    if (!mainTab || !sidebarId) continue;
    const items: LoungeTvAdminItem[] = [];
    if (Array.isArray(row.items)) {
      for (const it of row.items) {
        if (!it || typeof it !== 'object') continue;
        const item = it as Record<string, unknown>;
        const id = typeof item.id === 'string' ? item.id : '';
        const title = typeof item.title === 'string' ? item.title : '';
        const body = typeof item.body === 'string' ? item.body : '';
        const mediaUrl = typeof item.mediaUrl === 'string' ? item.mediaUrl : '';
        if (!id || !title) continue;
        const mediaType = item.mediaType === 'video' ? 'video' : 'image';
        items.push({
          id,
          title,
          body,
          mediaType,
          mediaUrl,
          thumbSrc: typeof item.thumbSrc === 'string' ? item.thumbSrc : undefined,
          isNew: Boolean(item.isNew),
          durationLabel: typeof item.durationLabel === 'string' ? item.durationLabel : undefined,
        });
      }
    }
    placements.push({ mainTab, sidebarId, items });
  }
  const updatedAt = typeof o.updatedAt === 'number' && Number.isFinite(o.updatedAt) ? o.updatedAt : undefined;
  return { version: 1, updatedAt, placements };
}

function mergeAdminItem(primary: LoungeTvAdminItem, secondary: LoungeTvAdminItem): LoungeTvAdminItem {
  return {
    ...primary,
    title: primary.title || secondary.title,
    body: primary.body || secondary.body,
    mediaUrl: primary.mediaUrl?.trim() ? primary.mediaUrl : secondary.mediaUrl,
    thumbSrc: primary.thumbSrc?.trim() ? primary.thumbSrc : secondary.thumbSrc,
    mediaType:
      primary.mediaType === 'video' || secondary.mediaType === 'video' ? 'video' : primary.mediaType,
    isNew: primary.isNew ?? secondary.isNew,
    durationLabel: primary.durationLabel ?? secondary.durationLabel,
  };
}

function mergeAdminItemLists(
  primary: LoungeTvAdminItem[],
  secondary: LoungeTvAdminItem[]
): LoungeTvAdminItem[] {
  const secondaryById = new Map(secondary.map((item) => [item.id, item]));
  const merged = primary.map((item) => {
    const other = secondaryById.get(item.id);
    return other ? mergeAdminItem(item, other) : item;
  });
  const primaryIds = new Set(primary.map((item) => item.id));
  for (const item of secondary) {
    if (!primaryIds.has(item.id)) merged.push(item);
  }
  return merged;
}

function mergeAdminPlacements(
  primary: LoungeTvAdminPlacement[],
  secondary: LoungeTvAdminPlacement[]
): LoungeTvAdminPlacement[] {
  const byKey = new Map<string, LoungeTvAdminPlacement>();
  for (const placement of primary) {
    byKey.set(placementKey(placement.mainTab, placement.sidebarId), {
      ...placement,
      items: [...placement.items],
    });
  }
  for (const placement of secondary) {
    const key = placementKey(placement.mainTab, placement.sidebarId);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, placement);
      continue;
    }
    byKey.set(key, {
      ...existing,
      items: mergeAdminItemLists(existing.items, placement.items),
    });
  }
  return [...byKey.values()];
}

/** Prefer newer `updatedAt`; always fill empty media fields from the other copy. */
export function mergeLoungeTvAdminConfigs(
  a: LoungeTvAdminConfig,
  b: LoungeTvAdminConfig
): LoungeTvAdminConfig {
  const aTs = a.updatedAt ?? 0;
  const bTs = b.updatedAt ?? 0;
  const [primary, secondary] = aTs >= bTs ? [a, b] : [b, a];
  return {
    version: 1,
    updatedAt: Math.max(aTs, bTs) || undefined,
    placements: mergeAdminPlacements(primary.placements, secondary.placements),
  };
}

let runtimeCache: LoungeTvAdminConfig | null = null;

export function setLoungeTvAdminConfigCache(config: LoungeTvAdminConfig | null): void {
  runtimeCache = config;
}

export function getLoungeTvAdminConfigCache(): LoungeTvAdminConfig | null {
  return runtimeCache;
}

export function loadLoungeTvAdminConfigFromStorage(): LoungeTvAdminConfig | null {
  try {
    const raw = localStorage.getItem(LOUNGE_TV_ADMIN_STORAGE_KEY);
    if (!raw) return null;
    return normalizeConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export const LOUNGE_TV_CONFIG_UPDATED_EVENT = 'loungeTvConfigUpdated';

export function saveLoungeTvAdminConfigToStorage(config: LoungeTvAdminConfig): void {
  localStorage.setItem(LOUNGE_TV_ADMIN_STORAGE_KEY, JSON.stringify(config));
  runtimeCache = config;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOUNGE_TV_CONFIG_UPDATED_EVENT));
  }
}

export function touchLoungeTvAdminConfigUpdatedAt(config: LoungeTvAdminConfig): LoungeTvAdminConfig {
  return { ...config, updatedAt: Date.now() };
}

export function getLoungeTvAdminPlacement(
  config: LoungeTvAdminConfig,
  mainTab: LoungeTvMainTab,
  sidebarId: string
): LoungeTvAdminPlacement | undefined {
  return config.placements.find((p) => p.mainTab === mainTab && p.sidebarId === sidebarId);
}

export function upsertLoungeTvAdminPlacement(
  config: LoungeTvAdminConfig,
  placement: LoungeTvAdminPlacement
): LoungeTvAdminConfig {
  const key = placementKey(placement.mainTab, placement.sidebarId);
  const rest = config.placements.filter((p) => placementKey(p.mainTab, p.sidebarId) !== key);
  return { version: 1, placements: [...rest, placement] };
}

function watchLearnDescriptionForItem(item: LoungeTvAdminItem): string {
  const fromAdmin = item.body.trim().toUpperCase();
  if (fromAdmin) return fromAdmin;
  return getWatchLearnVideoCopy(item.id)?.description ?? '';
}

export function adminItemToVideoTile(item: LoungeTvAdminItem, mainTab: LoungeTvMainTab): LoungeTvVideoTile {
  const thumbSrc =
    item.thumbSrc ||
    (item.mediaType === 'image' ? item.mediaUrl : undefined) ||
    '/assets/NOIR/wave-thumb.png';
  const tile: LoungeTvVideoTile = {
    id: item.id,
    title: item.title.toUpperCase(),
    isNew: item.isNew,
    thumbSrc,
  };
  const bodyUpper =
    mainTab === 'watch-learn' ? watchLearnDescriptionForItem(item) : item.body.trim().toUpperCase();
  if (bodyUpper) {
    tile.description = bodyUpper;
    tile.body = bodyUpper;
  }
  if (mainTab === 'slay-tips') {
    tile.format = 'blog';
    if (item.mediaUrl.trim()) {
      tile.attachmentSrc = item.mediaUrl.trim();
      tile.attachmentType = item.mediaType;
      if (item.mediaType === 'image' && !item.thumbSrc?.trim()) {
        tile.thumbSrc = item.mediaUrl.trim();
      }
    }
    return tile;
  }
  if (mainTab === 'watch-learn') {
    if (item.id === LOUNGE_TV_PLUCKING_LACE_TILE_ID) {
      const customSrc = item.mediaType === 'video' && item.mediaUrl.trim() ? item.mediaUrl.trim() : '';
      tile.videoSrc = customSrc || LOUNGE_TV_CONTENT_VIDEO_SRC;
      if (!tile.description) {
        tile.description = watchLearnDescriptionForItem(item);
      }
    } else if (item.mediaType === 'video' && item.mediaUrl.trim()) {
      tile.videoSrc = item.mediaUrl.trim();
      if (!tile.description) {
        tile.description = watchLearnDescriptionForItem(item);
      }
      if (item.durationLabel) tile.durationLabel = item.durationLabel;
    }
    const resolvedDescription = watchLearnDescriptionForItem(item);
    if (resolvedDescription) {
      tile.description = tile.description || resolvedDescription;
      tile.body = item.body.trim() ? item.body.trim().toUpperCase() : tile.description;
    }
  }
  return tile;
}

function enrichWatchLearnTiles(
  mainTab: LoungeTvMainTab,
  sidebarId: string,
  tiles: LoungeTvVideoTile[] | null
): LoungeTvVideoTile[] | null {
  if (!tiles || mainTab !== 'watch-learn') return tiles;
  const staticTiles = getLoungeTvTilesStatic(mainTab, sidebarId);
  const staticById = new Map((staticTiles ?? []).map((tile) => [tile.id, tile]));
  return tiles.map((tile) => {
    const staticTile = staticById.get(tile.id);
    const staticCopy = getWatchLearnVideoCopy(tile.id);
    const description = (
      tile.description?.trim() ||
      tile.body?.trim() ||
      staticTile?.description?.trim() ||
      staticCopy?.description ||
      ''
    ).toUpperCase();
    if (!description) return tile;
    return {
      ...tile,
      description,
      body: tile.body?.trim() ? tile.body.trim().toUpperCase() : description,
    };
  });
}

function applyWatchLearnTileOverrides(
  mainTab: LoungeTvMainTab,
  tiles: LoungeTvVideoTile[] | null
): LoungeTvVideoTile[] | null {
  if (!tiles || mainTab !== 'watch-learn') return tiles;
  return tiles.map((tile) => {
    if (tile.id !== LOUNGE_TV_PLUCKING_LACE_TILE_ID) return tile;
    const hasCustom = Boolean(tile.videoSrc && tile.videoSrc !== LOUNGE_TV_CONTENT_VIDEO_SRC);
    return {
      ...tile,
      videoSrc: tile.videoSrc || LOUNGE_TV_CONTENT_VIDEO_SRC,
      ...(hasCustom ? {} : { durationLabel: undefined }),
    };
  });
}

export function getLoungeTvTilesFromAdminConfig(
  mainTab: LoungeTvMainTab,
  sidebarId: string
): LoungeTvVideoTile[] | null {
  const config = runtimeCache ?? loadLoungeTvAdminConfigFromStorage();
  if (!config) return null;
  const placement = getLoungeTvAdminPlacement(config, mainTab, sidebarId);
  if (!placement) return null;
  return placement.items.map((item) => adminItemToVideoTile(item, mainTab));
}

function fillEmptyAdminBodiesFromDefaults(config: LoungeTvAdminConfig): LoungeTvAdminConfig {
  const defaults = buildDefaultLoungeTvAdminConfig();
  const defaultByKey = new Map(
    defaults.placements.map((placement) => [placementKey(placement.mainTab, placement.sidebarId), placement])
  );
  return {
    ...config,
    placements: config.placements.map((placement) => {
      const defaultPlacement = defaultByKey.get(placementKey(placement.mainTab, placement.sidebarId));
      if (!defaultPlacement) return placement;
      const defaultById = new Map(defaultPlacement.items.map((item) => [item.id, item]));
      return {
        ...placement,
        items: placement.items.map((item) => {
          if (item.body.trim()) return item;
          const defaultItem = defaultById.get(item.id);
          if (!defaultItem?.body.trim()) return item;
          return { ...item, body: defaultItem.body };
        }),
      };
    }),
  };
}

/** Admin config when present, otherwise built-in lounge TV tiles. */
export function resolveLoungeTvTiles(mainTab: LoungeTvMainTab, sidebarId: string): LoungeTvVideoTile[] | null {
  const fromAdmin = getLoungeTvTilesFromAdminConfig(mainTab, sidebarId);
  const staticTiles = getLoungeTvTilesStatic(mainTab, sidebarId);
  const tiles = fromAdmin !== null && fromAdmin.length > 0 ? fromAdmin : staticTiles;
  return enrichWatchLearnTiles(
    mainTab,
    sidebarId,
    applyWatchLearnTileOverrides(mainTab, tiles)
  );
}

export async function hydrateLoungeTvAdminConfig(
  fetchRemote: () => Promise<Record<string, unknown> | null>
): Promise<LoungeTvAdminConfig> {
  const stored = loadLoungeTvAdminConfigFromStorage();
  let remoteNormalized: LoungeTvAdminConfig | null = null;
  try {
    const remote = await fetchRemote();
    remoteNormalized = remote ? normalizeConfig(remote) : null;
  } catch {
    /* ignore */
  }

  let merged: LoungeTvAdminConfig;
  if (stored && remoteNormalized) {
    merged = mergeLoungeTvAdminConfigs(stored, remoteNormalized);
  } else if (remoteNormalized) {
    merged = remoteNormalized;
  } else if (stored) {
    merged = stored;
  } else {
    merged = buildDefaultLoungeTvAdminConfig();
  }

  merged = fillEmptyAdminBodiesFromDefaults(merged);
  saveLoungeTvAdminConfigToStorage(merged);
  return merged;
}
