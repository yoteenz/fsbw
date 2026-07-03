import { useCallback, useEffect, useState } from 'react';
import type { AdminStudioShow } from '../utils/adminStudioShowsDemo';
import { getAdminStudioShowById, ADMIN_STUDIO_DEFAULT_SHOWS } from '../utils/adminStudioShowsDemo';
import type {
  AdminStudioContentPack,
  AdminStudioContentPackTabId,
} from '../utils/adminStudioContentPacksDemo';
import { getAdminStudioContentPackById, ADMIN_STUDIO_DEFAULT_CONTENT_PACKS } from '../utils/adminStudioContentPacksDemo';

const SHOWS_STORAGE_KEY = 'adminStudioShowsEditable_v1';
const PACKS_STORAGE_KEY = 'adminStudioContentPacksEditable_v1';

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function deepCloneShow(show: AdminStudioShow): AdminStudioShow {
  return { ...show };
}

function deepClonePack(pack: AdminStudioContentPack): AdminStudioContentPack {
  const tabs = Object.fromEntries(
    Object.entries(pack.tabs).map(([tabId, fields]) => [
      tabId,
      fields.map((f) => ({ ...f })),
    ])
  ) as AdminStudioContentPack['tabs'];
  return { ...pack, tabs };
}

type ShowsStore = Record<string, Partial<AdminStudioShow>>;
type PacksStore = Record<string, Partial<AdminStudioContentPack>>;

function mergeShow(defaults: AdminStudioShow, patch?: Partial<AdminStudioShow>): AdminStudioShow {
  if (!patch) return deepCloneShow(defaults);
  return deepCloneShow({ ...defaults, ...patch });
}

function mergePack(defaults: AdminStudioContentPack, patch?: Partial<AdminStudioContentPack>): AdminStudioContentPack {
  const base = deepClonePack(defaults);
  if (!patch) return base;
  const merged = { ...base, ...patch, tabs: base.tabs };
  if (patch.tabs) {
    for (const tabId of Object.keys(patch.tabs) as AdminStudioContentPackTabId[]) {
      const patchFields = patch.tabs[tabId];
      if (!patchFields) continue;
      const baseFields = base.tabs[tabId] ?? [];
      merged.tabs[tabId] = baseFields.map((field) => {
        const override = patchFields.find((f) => f.key === field.key);
        return override ? { ...field, value: override.value } : field;
      });
    }
  }
  return merged;
}

export function useAdminStudioShow(showId: string | undefined) {
  const defaults = showId ? getAdminStudioShowById(showId) : undefined;
  const [show, setShow] = useState<AdminStudioShow | null>(() => {
    if (!defaults || !showId) return null;
    const store = readJson<ShowsStore>(SHOWS_STORAGE_KEY);
    return mergeShow(defaults, store?.[showId]);
  });

  useEffect(() => {
    if (!defaults || !showId) {
      setShow(null);
      return;
    }
    const store = readJson<ShowsStore>(SHOWS_STORAGE_KEY);
    setShow(mergeShow(defaults, store?.[showId]));
  }, [showId, defaults]);

  const updateField = useCallback(
    (key: keyof AdminStudioShow, value: string) => {
      if (!show || !showId || !defaults) return;
      setShow((prev) => {
        if (!prev) return prev;
        const next = { ...prev, [key]: value };
        const store = readJson<ShowsStore>(SHOWS_STORAGE_KEY) ?? {};
        store[showId] = { ...(store[showId] ?? {}), [key]: value };
        writeJson(SHOWS_STORAGE_KEY, store);
        return next;
      });
    },
    [show, showId, defaults]
  );

  return { show, updateField };
}

export function useAdminStudioContentPack(packId: string | undefined) {
  const defaults = packId ? getAdminStudioContentPackById(packId) : undefined;
  const [pack, setPack] = useState<AdminStudioContentPack | null>(() => {
    if (!defaults || !packId) return null;
    const store = readJson<PacksStore>(PACKS_STORAGE_KEY);
    return mergePack(defaults, store?.[packId]);
  });

  useEffect(() => {
    if (!defaults || !packId) {
      setPack(null);
      return;
    }
    const store = readJson<PacksStore>(PACKS_STORAGE_KEY);
    setPack(mergePack(defaults, store?.[packId]));
  }, [packId, defaults]);

  const updateTabField = useCallback(
    (tabId: AdminStudioContentPackTabId, fieldKey: string, value: string) => {
      if (!pack || !packId || !defaults) return;
      setPack((prev) => {
        if (!prev) return prev;
        const nextTabs = { ...prev.tabs };
        nextTabs[tabId] = (nextTabs[tabId] ?? []).map((field) =>
          field.key === fieldKey ? { ...field, value } : field
        );
        const next = { ...prev, tabs: nextTabs };
        const store = readJson<PacksStore>(PACKS_STORAGE_KEY) ?? {};
        const existingPatch = store[packId] ?? {};
        const existingTabs = existingPatch.tabs ?? {};
        const tabFields = nextTabs[tabId].map((f) => ({ key: f.key, label: f.label, value: f.value, multiline: f.multiline }));
        store[packId] = {
          ...existingPatch,
          tabs: { ...existingTabs, [tabId]: tabFields } as AdminStudioContentPack['tabs'],
        };
        writeJson(PACKS_STORAGE_KEY, store);
        return next;
      });
    },
    [pack, packId, defaults]
  );

  const updatePackMeta = useCallback(
    (key: 'title' | 'subtitle' | 'status', value: string) => {
      if (!pack || !packId || !defaults) return;
      setPack((prev) => {
        if (!prev) return prev;
        const next = { ...prev, [key]: value };
        const store = readJson<PacksStore>(PACKS_STORAGE_KEY) ?? {};
        store[packId] = { ...(store[packId] ?? {}), [key]: value };
        writeJson(PACKS_STORAGE_KEY, store);
        return next;
      });
    },
    [pack, packId, defaults]
  );

  return { pack, updateTabField, updatePackMeta };
}

export function listAdminStudioShows(): AdminStudioShow[] {
  const store = readJson<ShowsStore>(SHOWS_STORAGE_KEY) ?? {};
  return ADMIN_STUDIO_DEFAULT_SHOWS.map((defaults) => mergeShow(defaults, store[defaults.id]));
}

export function listAdminStudioContentPacks(): AdminStudioContentPack[] {
  const store = readJson<PacksStore>(PACKS_STORAGE_KEY) ?? {};
  return ADMIN_STUDIO_DEFAULT_CONTENT_PACKS.map((defaults) => mergePack(defaults, store[defaults.id]));
}

