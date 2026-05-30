import type { LoungeTvMainTab, LoungeTvVideoTile } from '../components/lounge/loungeTvContent';
import {
  LOUNGE_TV_MAIN_TABS,
  LOUNGE_TV_SIDEBAR,
  getLoungeTvTilesStatic,
} from '../components/lounge/loungeTvContent';
import { LOUNGE_TV_CONTENT_VIDEO_SRC } from '../components/lounge/loungeTvAssets';

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
  placements: LoungeTvAdminPlacement[];
};

export const LOUNGE_TV_ADMIN_STORAGE_KEY = 'loungeTvAdminConfig';

function placementKey(mainTab: LoungeTvMainTab, sidebarId: string): string {
  return `${mainTab}:${sidebarId}`;
}

function tileToAdminItem(tile: LoungeTvVideoTile): LoungeTvAdminItem {
  const isVideo = Boolean(tile.videoSrc);
  return {
    id: tile.id,
    title: tile.title,
    body: tile.description ?? '',
    mediaType: isVideo ? 'video' : 'image',
    mediaUrl: isVideo ? tile.videoSrc! : tile.thumbSrc ?? '',
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
  return { version: 1, placements };
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
  if (item.body.trim()) tile.description = item.body.trim().toUpperCase();
  if (mainTab === 'watch-learn' && item.mediaType === 'video') {
    tile.videoSrc =
      item.id === 'plucking-lace' ? LOUNGE_TV_CONTENT_VIDEO_SRC : item.mediaUrl;
    tile.durationLabel = item.durationLabel ?? '4:32';
    if (!tile.description) {
      tile.description =
        item.body.trim().toUpperCase() || 'WATCH AND LEARN WITH STEP-BY-STEP GUIDANCE.';
    }
  }
  return tile;
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

/** Admin config when present, otherwise built-in lounge TV tiles. */
export function resolveLoungeTvTiles(mainTab: LoungeTvMainTab, sidebarId: string): LoungeTvVideoTile[] | null {
  const fromAdmin = getLoungeTvTilesFromAdminConfig(mainTab, sidebarId);
  if (fromAdmin !== null) return fromAdmin;
  return getLoungeTvTilesStatic(mainTab, sidebarId);
}

export async function hydrateLoungeTvAdminConfig(
  fetchRemote: () => Promise<Record<string, unknown> | null>
): Promise<LoungeTvAdminConfig> {
  try {
    const remote = await fetchRemote();
    const normalized = remote ? normalizeConfig(remote) : null;
    if (normalized) {
      saveLoungeTvAdminConfigToStorage(normalized);
      return normalized;
    }
  } catch {
    /* ignore */
  }
  const stored = loadLoungeTvAdminConfigFromStorage();
  if (stored) {
    runtimeCache = stored;
    return stored;
  }
  const defaults = buildDefaultLoungeTvAdminConfig();
  saveLoungeTvAdminConfigToStorage(defaults);
  return defaults;
}
