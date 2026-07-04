import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_PRODUCTION_DEFAULTS,
  createBlankProductionPack,
  getQaCompletionPercent,
  type ProductionContentPack,
  type ProductionFieldKey,
  type ProductionScene,
  type ProductionStageId,
} from '../utils/adminStudioProductionDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type PackPatch = Partial<ProductionContentPack>;
type PackPatchStore = Record<string, PackPatch>;
type QaStore = Record<string, Record<string, boolean>>;

const DEFAULT_IDS = new Set(ADMIN_STUDIO_PRODUCTION_DEFAULTS.map((p) => p.id));

function readPatches(): PackPatchStore {
  return readStudioJson<PackPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.production) ?? {};
}

function readCustomPacks(): ProductionContentPack[] {
  return readStudioJson<ProductionContentPack[]>(ADMIN_STUDIO_STORAGE_KEYS.productionCustom) ?? [];
}

function readQaStore(): QaStore {
  return readStudioJson<QaStore>(ADMIN_STUDIO_STORAGE_KEYS.productionQa) ?? {};
}

function writePatches(store: PackPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.production, store);
}

function writeCustomPacks(packs: ProductionContentPack[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.productionCustom, packs);
}

function writeQaStore(store: QaStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.productionQa, store);
}

function mergeDefaults(patches: PackPatchStore, qaStore: QaStore): ProductionContentPack[] {
  return ADMIN_STUDIO_PRODUCTION_DEFAULTS.map((d) => ({
    ...d,
    ...(patches[d.id] ?? {}),
    qaChecklist: { ...d.qaChecklist, ...(qaStore[d.id] ?? patches[d.id]?.qaChecklist ?? {}) },
    scenes: patches[d.id]?.scenes ?? d.scenes,
  }));
}

export function listProductionPacks(): ProductionContentPack[] {
  const patches = readPatches();
  const qaStore = readQaStore();
  const custom = readCustomPacks();
  const merged = mergeDefaults(patches, qaStore);
  const customOnly = custom.filter((c) => !DEFAULT_IDS.has(c.id));
  return [
    ...merged,
    ...customOnly.map((c) => ({
      ...c,
      qaChecklist: { ...c.qaChecklist, ...(qaStore[c.id] ?? {}) },
    })),
  ];
}

export function getProductionPackById(packId: string): ProductionContentPack | undefined {
  return listProductionPacks().find((p) => p.id === packId);
}

export function exportProductionSnapshot() {
  return { packs: listProductionPacks(), source: 'production-local' as const };
}

function patchPack(packId: string, patch: PackPatch): void {
  if (DEFAULT_IDS.has(packId)) {
    const store = readPatches();
    store[packId] = { ...(store[packId] ?? {}), ...patch };
    writePatches(store);
    return;
  }
  const custom = readCustomPacks();
  const idx = custom.findIndex((p) => p.id === packId);
  if (idx >= 0) {
    custom[idx] = { ...custom[idx], ...patch };
    writeCustomPacks(custom);
  }
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
}

export function useAdminStudioProduction(packId?: string) {
  const [packs, setPacks] = useState(listProductionPacks);
  const [draggedPackId, setDraggedPackId] = useState<string | null>(null);

  const selectedPack = useMemo(
    () => (packId ? packs.find((p) => p.id === packId) ?? null : null),
    [packs, packId]
  );

  const updateField = useCallback((id: string, key: ProductionFieldKey, value: string) => {
    setPacks((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [key]: value, lastUpdated: new Date().toISOString().slice(0, 10) };
        patchPack(id, { [key]: value, lastUpdated: updated.lastUpdated });
        return updated;
      });
      return next;
    });
  }, []);

  const moveToStage = useCallback((id: string, stage: ProductionStageId) => {
    setPacks((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, stage, lastUpdated: new Date().toISOString().slice(0, 10) };
        patchPack(id, { stage, lastUpdated: updated.lastUpdated });
        return updated;
      });
      return next;
    });
  }, []);

  const toggleQaItem = useCallback((id: string, itemId: string) => {
    setPacks((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const qaChecklist = { ...p.qaChecklist, [itemId]: !p.qaChecklist[itemId] };
        const store = readQaStore();
        store[id] = qaChecklist;
        writeQaStore(store);
        return { ...p, qaChecklist };
      });
      return next;
    });
  }, []);

  const updateScene = useCallback((packId: string, sceneId: string, patch: Partial<ProductionScene>) => {
    setPacks((prev) => {
      const next = prev.map((p) => {
        if (p.id !== packId) return p;
        const scenes = p.scenes.map((s) => (s.id === sceneId ? { ...s, ...patch } : s));
        patchPack(packId, { scenes });
        return { ...p, scenes };
      });
      return next;
    });
  }, []);

  const addPack = useCallback((title: string) => {
    const base = slugify(title) || `pack-${Date.now()}`;
    let id = base;
    let n = 1;
    const existing = new Set(listProductionPacks().map((p) => p.id));
    while (existing.has(id)) id = `${base}-${n++}`;
    const entry = createBlankProductionPack(id, title);
    const custom = readCustomPacks();
    custom.push(entry);
    writeCustomPacks(custom);
    setPacks(listProductionPacks());
    return id;
  }, []);

  const packsByStage = useMemo(() => {
    const map = new Map<ProductionStageId, ProductionContentPack[]>();
    for (const pack of packs) {
      const list = map.get(pack.stage) ?? [];
      list.push(pack);
      map.set(pack.stage, list);
    }
    return map;
  }, [packs]);

  const qaPercent = selectedPack ? getQaCompletionPercent(selectedPack.qaChecklist) : 0;

  return {
    packs,
    selectedPack,
    packsByStage,
    draggedPackId,
    setDraggedPackId,
    updateField,
    moveToStage,
    toggleQaItem,
    updateScene,
    addPack,
    qaPercent,
  };
}
