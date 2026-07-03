import { useCallback, useEffect, useState } from 'react';
import type { AdminStudioShow } from '../utils/adminStudioShowsDemo';
import { getAdminStudioShowById, ADMIN_STUDIO_DEFAULT_SHOWS } from '../utils/adminStudioShowsDemo';
import type {
  AdminStudioContentPack,
  AdminStudioContentPackTabId,
} from '../utils/adminStudioContentPacksDemo';
import { getAdminStudioContentPackById, ADMIN_STUDIO_DEFAULT_CONTENT_PACKS } from '../utils/adminStudioContentPacksDemo';
import type { AdminStudioDistributionTarget, AdminStudioDistributionTargetId } from '../utils/adminStudioDistributionDemo';
import { mergeDistributionTargets } from '../utils/adminStudioDistributionDemo';
import {
  ADMIN_STUDIO_STORAGE_KEYS,
  patchStudioRecord,
  readStudioJson,
  writeStudioJson,
} from '../utils/adminStudioStorage';

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
  return {
    ...pack,
    tabs,
    distributionTargets: pack.distributionTargets.map((t) => ({ ...t })),
  };
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
  const merged: AdminStudioContentPack = {
    ...base,
    ...patch,
    tabs: base.tabs,
    distributionTargets: mergeDistributionTargets(base.distributionTargets, patch.distributionTargets),
  };
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
    const store = readStudioJson<ShowsStore>(ADMIN_STUDIO_STORAGE_KEYS.shows);
    return mergeShow(defaults, store?.[showId]);
  });

  useEffect(() => {
    if (!defaults || !showId) {
      setShow(null);
      return;
    }
    const store = readStudioJson<ShowsStore>(ADMIN_STUDIO_STORAGE_KEYS.shows);
    setShow(mergeShow(defaults, store?.[showId]));
  }, [showId, defaults]);

  const updateField = useCallback(
    (key: keyof AdminStudioShow, value: string) => {
      if (!show || !showId || !defaults) return;
      setShow((prev) => {
        if (!prev) return prev;
        const next = { ...prev, [key]: value };
        patchStudioRecord(ADMIN_STUDIO_STORAGE_KEYS.shows, showId, { [key]: value });
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
    const store = readStudioJson<PacksStore>(ADMIN_STUDIO_STORAGE_KEYS.contentPacks);
    return mergePack(defaults, store?.[packId]);
  });

  useEffect(() => {
    if (!defaults || !packId) {
      setPack(null);
      return;
    }
    const store = readStudioJson<PacksStore>(ADMIN_STUDIO_STORAGE_KEYS.contentPacks);
    setPack(mergePack(defaults, store?.[packId]));
  }, [packId, defaults]);

  const persistPackPatch = useCallback((id: string, patch: Partial<AdminStudioContentPack>) => {
    const store = readStudioJson<PacksStore>(ADMIN_STUDIO_STORAGE_KEYS.contentPacks) ?? {};
    store[id] = { ...(store[id] ?? {}), ...patch };
    writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.contentPacks, store);
  }, []);

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
        const existingPatch = readStudioJson<PacksStore>(ADMIN_STUDIO_STORAGE_KEYS.contentPacks)?.[packId] ?? {};
        const existingTabs = existingPatch.tabs ?? {};
        const tabFields = nextTabs[tabId].map((f) => ({
          key: f.key,
          label: f.label,
          value: f.value,
          multiline: f.multiline,
        }));
        persistPackPatch(packId, {
          tabs: { ...existingTabs, [tabId]: tabFields } as AdminStudioContentPack['tabs'],
        });
        return next;
      });
    },
    [pack, packId, defaults, persistPackPatch]
  );

  const updatePackMeta = useCallback(
    (key: 'title' | 'subtitle' | 'status', value: string) => {
      if (!pack || !packId || !defaults) return;
      setPack((prev) => {
        if (!prev) return prev;
        const next = { ...prev, [key]: value };
        patchStudioRecord(ADMIN_STUDIO_STORAGE_KEYS.contentPacks, packId, { [key]: value });
        return next;
      });
    },
    [pack, packId, defaults]
  );

  const updateDistributionTarget = useCallback(
    (targetId: AdminStudioDistributionTargetId, enabled: boolean) => {
      if (!pack || !packId || !defaults) return;
      setPack((prev) => {
        if (!prev) return prev;
        const nextTargets: AdminStudioDistributionTarget[] = prev.distributionTargets.map((t) =>
          t.id === targetId && t.activation === 'ACTIVE' ? { ...t, enabled } : t
        );
        const next = { ...prev, distributionTargets: nextTargets };
        persistPackPatch(packId, { distributionTargets: nextTargets });
        return next;
      });
    },
    [pack, packId, defaults, persistPackPatch]
  );

  return { pack, updateTabField, updatePackMeta, updateDistributionTarget };
}

export function listAdminStudioShows(): AdminStudioShow[] {
  const store = readStudioJson<ShowsStore>(ADMIN_STUDIO_STORAGE_KEYS.shows) ?? {};
  return ADMIN_STUDIO_DEFAULT_SHOWS.map((defaults) => mergeShow(defaults, store[defaults.id]));
}

export function listAdminStudioContentPacks(): AdminStudioContentPack[] {
  const store = readStudioJson<PacksStore>(ADMIN_STUDIO_STORAGE_KEYS.contentPacks) ?? {};
  return ADMIN_STUDIO_DEFAULT_CONTENT_PACKS.map((defaults) => mergePack(defaults, store[defaults.id]));
}
