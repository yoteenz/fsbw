import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS,
  createBlankShowBible,
  type ShowBibleEntry,
  type ShowBibleFieldKey,
  type ShowBibleSeason,
  type ShowBibleSeasonStatus,
} from '../utils/adminStudioShowBibleDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type ShowBiblePatch = Partial<ShowBibleEntry>;
type ShowBiblePatchStore = Record<string, ShowBiblePatch>;
type ShowBibleChecklistStore = Record<string, Record<string, boolean>>;

const DEFAULT_SHOW_IDS = new Set(ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.map((s) => s.id));

function readPatches(): ShowBiblePatchStore {
  return readStudioJson<ShowBiblePatchStore>(ADMIN_STUDIO_STORAGE_KEYS.showBible) ?? {};
}

function readCustomShows(): ShowBibleEntry[] {
  return readStudioJson<ShowBibleEntry[]>(ADMIN_STUDIO_STORAGE_KEYS.showBibleCustom) ?? [];
}

function readChecklists(): ShowBibleChecklistStore {
  return readStudioJson<ShowBibleChecklistStore>(ADMIN_STUDIO_STORAGE_KEYS.showBibleChecklist) ?? {};
}

function writePatches(store: ShowBiblePatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.showBible, store);
}

function writeCustomShows(shows: ShowBibleEntry[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.showBibleCustom, shows);
}

function writeChecklists(store: ShowBibleChecklistStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.showBibleChecklist, store);
}

function mergeDefaultShows(patches: ShowBiblePatchStore): ShowBibleEntry[] {
  return ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.map((d) => ({ ...d, ...(patches[d.id] ?? {}) }));
}

export function listShowBibleShows(): ShowBibleEntry[] {
  const patches = readPatches();
  const custom = readCustomShows();
  const mergedDefaults = mergeDefaultShows(patches);
  const customOnly = custom.filter((c) => !DEFAULT_SHOW_IDS.has(c.id));
  return [...mergedDefaults, ...customOnly];
}

export function getShowBibleShowById(showId: string): ShowBibleEntry | undefined {
  return listShowBibleShows().find((s) => s.id === showId);
}

export function getShowBibleChecklist(showId: string): Record<string, boolean> {
  return readChecklists()[showId] ?? {};
}

export function exportShowBibleSnapshot() {
  return {
    shows: listShowBibleShows(),
    checklists: readChecklists(),
    source: 'show-bible-local' as const,
  };
}

function patchShow(showId: string, patch: ShowBiblePatch): void {
  if (DEFAULT_SHOW_IDS.has(showId)) {
    const store = readPatches();
    store[showId] = { ...(store[showId] ?? {}), ...patch };
    writePatches(store);
    return;
  }
  const custom = readCustomShows();
  const idx = custom.findIndex((s) => s.id === showId);
  if (idx >= 0) {
    custom[idx] = { ...custom[idx], ...patch };
    writeCustomShows(custom);
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function useAdminStudioShowBible(showId?: string) {
  const [shows, setShows] = useState(listShowBibleShows);
  const [checklists, setChecklists] = useState(readChecklists);

  const selectedShow = useMemo(
    () => (showId ? shows.find((s) => s.id === showId) ?? null : null),
    [shows, showId]
  );

  const refresh = useCallback(() => {
    setShows(listShowBibleShows());
    setChecklists(readChecklists());
  }, []);

  const updateField = useCallback((id: string, key: ShowBibleFieldKey, value: string) => {
    setShows((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, [key]: value } : s));
      patchShow(id, { [key]: value });
      return next;
    });
  }, []);

  const addCustomShow = useCallback((name: string) => {
    const base = slugify(name) || `show-${Date.now()}`;
    let id = base;
    let n = 1;
    const existing = new Set(listShowBibleShows().map((s) => s.id));
    while (existing.has(id)) {
      id = `${base}-${n++}`;
    }
    const entry = createBlankShowBible(id, name);
    const custom = readCustomShows();
    custom.push(entry);
    writeCustomShows(custom);
    setShows(listShowBibleShows());
    return id;
  }, []);

  const updateSeason = useCallback((id: string, seasonId: string, patch: Partial<ShowBibleSeason>) => {
    setShows((prev) => {
      const next = prev.map((s) => {
        if (s.id !== id) return s;
        const seasons = s.seasons.map((ep) => (ep.id === seasonId ? { ...ep, ...patch } : ep));
        patchShow(id, { seasons });
        return { ...s, seasons };
      });
      return next;
    });
  }, []);

  const addSeason = useCallback((id: string) => {
    setShows((prev) => {
      const next = prev.map((s) => {
        if (s.id !== id) return s;
        const epNum = String(s.seasons.length + 1);
        const season: ShowBibleSeason = {
          id: `ep-${Date.now()}`,
          seasonNumber: s.seasonNumber || '1',
          episodeNumber: epNum,
          episodeOrder: epNum,
          premiereDate: '',
          finaleDate: '',
          status: 'draft',
          title: `EPISODE ${epNum}`,
        };
        const seasons = [...s.seasons, season];
        patchShow(id, { seasons });
        return { ...s, seasons };
      });
      return next;
    });
  }, []);

  const removeSeason = useCallback((id: string, seasonId: string) => {
    setShows((prev) => {
      const next = prev.map((s) => {
        if (s.id !== id) return s;
        const seasons = s.seasons.filter((ep) => ep.id !== seasonId);
        patchShow(id, { seasons });
        return { ...s, seasons };
      });
      return next;
    });
  }, []);

  const setSeasonStatus = useCallback((id: string, seasonId: string, status: ShowBibleSeasonStatus) => {
    updateSeason(id, seasonId, { status });
  }, [updateSeason]);

  const toggleChecklistItem = useCallback((id: string, itemId: string) => {
    setChecklists((prev) => {
      const showItems = { ...(prev[id] ?? {}), [itemId]: !(prev[id]?.[itemId] ?? false) };
      const next = { ...prev, [id]: showItems };
      writeChecklists(next);
      const allDone = Object.values(showItems).every(Boolean);
      const status = allDone ? 'APPROVED' : 'PENDING';
      setShows((showsPrev) => {
        const updated = showsPrev.map((s) => (s.id === id ? { ...s, checklistApproved: status } : s));
        patchShow(id, { checklistApproved: status });
        return updated;
      });
      return next;
    });
  }, []);

  return {
    shows,
    selectedShow,
    checklists,
    refresh,
    updateField,
    addCustomShow,
    updateSeason,
    addSeason,
    removeSeason,
    setSeasonStatus,
    toggleChecklistItem,
    getChecklist: (id: string) => checklists[id] ?? getShowBibleChecklist(id),
  };
}
