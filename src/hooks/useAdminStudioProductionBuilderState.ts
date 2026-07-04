import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ProductionDraft,
  ProductionOutputTypeId,
  ProductionScene,
  ProductionSceneAssetSelection,
  ProductionTemplateId,
  ProductionVersionEntry,
} from '../utils/adminStudioProductionBuilderDemo';
import {
  createDraftFromContentPack,
  createProductionDraft,
  getProductionTemplate,
  PRODUCTION_GENERATION_OUTPUTS,
} from '../utils/adminStudioProductionBuilderDemo';
import {
  assembleProductionPrompt,
  applyAssetToSelection,
  sceneSelectionToContentPack,
} from '../utils/adminStudioProductionBuilderPrompt';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import { getContentPackAssetSelection } from './useAdminStudioAssetDirectorState';

type ProductionBuilderStore = {
  drafts?: Record<string, ProductionDraft>;
  activeDraftId?: string;
  favorites?: string[];
};

function readStore(): ProductionBuilderStore {
  return readStudioJson<ProductionBuilderStore>(ADMIN_STUDIO_STORAGE_KEYS.productionBuilder) ?? {};
}

function writeStore(store: ProductionBuilderStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.productionBuilder, store);
}

function syncSceneToContentPack(packId: string, selection: ProductionSceneAssetSelection): void {
  const assetKey = ADMIN_STUDIO_STORAGE_KEYS.assetDirector;
  const adStore = readStudioJson<{
    packAssetSelections?: Record<string, ReturnType<typeof sceneSelectionToContentPack>>;
  }>(assetKey) ?? {};
  writeStudioJson(assetKey, {
    ...adStore,
    packAssetSelections: {
      ...(adStore.packAssetSelections ?? {}),
      [packId]: sceneSelectionToContentPack(selection),
    },
  });
}

export function exportProductionBuilderSnapshot() {
  const store = readStore();
  return {
    drafts: store.drafts ?? {},
    activeDraftId: store.activeDraftId,
    source: 'production-builder-local' as const,
  };
}

export function getProductionDraftById(draftId: string): ProductionDraft | null {
  const store = readStore();
  return store.drafts?.[draftId] ?? null;
}

export function persistProductionDraft(draft: ProductionDraft): void {
  const store = readStore();
  writeStore({
    ...store,
    drafts: { ...(store.drafts ?? {}), [draft.id]: { ...draft, updatedAt: new Date().toISOString().slice(0, 10) } },
    activeDraftId: draft.id,
  });
}

export function updateProductionDraftScene(
  draftId: string,
  sceneId: string,
  patch: Partial<ProductionScene> | Partial<ProductionSceneAssetSelection>
): ProductionDraft | null {
  const draft = getProductionDraftById(draftId);
  if (!draft) return null;
  const isSelection = 'studioId' in patch || 'talentId' in patch || 'cameraId' in patch || 'lightingId' in patch;
  const scenes = draft.scenes.map((s) => {
    if (s.id !== sceneId) return s;
    if (isSelection) return { ...s, selection: { ...s.selection, ...(patch as ProductionSceneAssetSelection) } };
    return { ...s, ...(patch as Partial<ProductionScene>) };
  });
  const next = { ...draft, scenes };
  persistProductionDraft(next);
  if (next.contentPackId) {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) syncSceneToContentPack(next.contentPackId, scene.selection);
  }
  return next;
}

export function reorderProductionDraftScenes(draftId: string, fromIndex: number, toIndex: number): ProductionDraft | null {
  const draft = getProductionDraftById(draftId);
  if (!draft) return null;
  const sorted = [...draft.scenes].sort((a, b) => a.order - b.order);
  const [moved] = sorted.splice(fromIndex, 1);
  sorted.splice(toIndex, 0, moved);
  const scenes = sorted.map((s, i) => ({ ...s, order: i }));
  const next = { ...draft, scenes };
  persistProductionDraft(next);
  return next;
}

export function useAdminStudioProductionBuilder(packId?: string, packTitle?: string) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const s = readStore();
    const drafts = { ...(s.drafts ?? {}) };
    let nextActive = s.activeDraftId;
    let changed = false;

    if (packId && !drafts[`pb-pack-${packId}`]) {
      const fromPack = createDraftFromContentPack(packId, packTitle ?? 'CONTENT PACK');
      const packSelection = getContentPackAssetSelection(packId);
      if (Object.keys(packSelection).length > 0 && fromPack.scenes[0]) {
        fromPack.scenes[0].selection = { ...fromPack.scenes[0].selection, ...packSelection };
      }
      drafts[`pb-pack-${packId}`] = fromPack;
      nextActive = `pb-pack-${packId}`;
      changed = true;
    } else if (!nextActive || !drafts[nextActive]) {
      const fallback = createProductionDraft({ id: 'pb-default' });
      if (!drafts[fallback.id]) {
        drafts[fallback.id] = fallback;
        changed = true;
      }
      nextActive = fallback.id;
    }

    if (changed) {
      writeStore({ ...s, drafts, activeDraftId: nextActive });
      bump();
    }
  }, [packId, packTitle, bump]);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const draft: ProductionDraft = useMemo(() => {
    const drafts = store.drafts ?? {};
    const activeId = packId ? `pb-pack-${packId}` : store.activeDraftId;
    if (activeId && drafts[activeId]) return drafts[activeId];
    return createProductionDraft({ id: 'pb-default' });
  }, [store, packId]);

  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const activeScene = useMemo(() => {
    const scenes = [...draft.scenes].sort((a, b) => a.order - b.order);
    const target = activeSceneId ? scenes.find((s) => s.id === activeSceneId) : scenes[0];
    return target ?? scenes[0];
  }, [draft.scenes, activeSceneId]);

  const assembledPrompt = useMemo(() => {
    if (draft.promptOverride?.trim()) return draft.promptOverride;
    return assembleProductionPrompt(draft);
  }, [draft]);

  const persistDraft = useCallback(
    (next: ProductionDraft) => {
      const s = readStore();
      const drafts = { ...(s.drafts ?? {}), [next.id]: { ...next, updatedAt: new Date().toISOString().slice(0, 10) } };
      writeStore({ ...s, drafts, activeDraftId: next.id });
      if (next.contentPackId && next.scenes[0]) {
        syncSceneToContentPack(next.contentPackId, next.scenes[0].selection);
      }
      bump();
    },
    [bump]
  );

  const updateDraftMeta = useCallback(
    (patch: Partial<ProductionDraft>) => {
      persistDraft({ ...draft, ...patch });
    },
    [draft, persistDraft]
  );

  const updateActiveScene = useCallback(
    (patch: Partial<ProductionScene> | Partial<ProductionSceneAssetSelection>) => {
      if (!activeScene) return;
      const isSelectionPatch = 'studioId' in patch || 'talentId' in patch || 'propIds' in patch;
      const nextScene: ProductionScene = isSelectionPatch
        ? { ...activeScene, selection: { ...activeScene.selection, ...(patch as ProductionSceneAssetSelection) } }
        : { ...activeScene, ...(patch as Partial<ProductionScene>) };
      const scenes = draft.scenes.map((s) => (s.id === activeScene.id ? nextScene : s));
      const promptStatus = draft.promptOverride ? 'edited' : scenes.some((sc) => sc.selection.studioId) ? 'assembled' : 'draft';
      persistDraft({ ...draft, scenes, promptStatus });
    },
    [activeScene, draft, persistDraft]
  );

  const applyAssetDrop = useCallback(
    (category: string, assetId: string) => {
      if (!activeScene) return;
      const nextSelection = applyAssetToSelection(activeScene.selection, category, assetId);
      updateActiveScene(nextSelection);
    },
    [activeScene, updateActiveScene]
  );

  const addScene = useCallback(() => {
    const order = draft.scenes.length;
    const newScene: ProductionScene = {
      id: `scene-${Date.now()}`,
      name: `SCENE ${order + 1}`,
      order,
      selection: activeScene ? { ...activeScene.selection } : {},
    };
    persistDraft({ ...draft, scenes: [...draft.scenes, newScene] });
    setActiveSceneId(newScene.id);
  }, [activeScene, draft, persistDraft]);

  const removeScene = useCallback(
    (sceneId: string) => {
      if (draft.scenes.length <= 1) return;
      const scenes = draft.scenes
        .filter((s) => s.id !== sceneId)
        .map((s, i) => ({ ...s, order: i }));
      persistDraft({ ...draft, scenes });
    },
    [draft, persistDraft]
  );

  const reorderScenes = useCallback(
    (fromIndex: number, toIndex: number) => {
      const sorted = [...draft.scenes].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      const scenes = sorted.map((s, i) => ({ ...s, order: i }));
      persistDraft({ ...draft, scenes });
    },
    [draft, persistDraft]
  );

  const toggleOutputType = useCallback(
    (outputId: ProductionOutputTypeId) => {
      const has = draft.outputTypes.includes(outputId);
      const outputTypes = has ? draft.outputTypes.filter((id) => id !== outputId) : [...draft.outputTypes, outputId];
      persistDraft({ ...draft, outputTypes });
    },
    [draft, persistDraft]
  );

  const loadTemplate = useCallback(
    (templateId: ProductionTemplateId) => {
      const template = getProductionTemplate(templateId);
      if (!template) return;
      persistDraft({
        ...draft,
        templateId,
        productionName: template.productionName,
        show: template.show,
        episode: template.episode,
        scenes: template.scenes.map((s) => ({ ...s, id: `${s.id}-${Date.now()}` })),
        outputTypes: template.outputTypes,
        promptStatus: 'assembled',
      });
    },
    [draft, persistDraft]
  );

  const saveDraft = useCallback(() => {
    const entry: ProductionVersionEntry = {
      id: `v-${Date.now()}`,
      label: `VERSION ${draft.versionHistory.length + 1}`,
      savedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      note: draft.productionName,
    };
    persistDraft({
      ...draft,
      versionHistory: [entry, ...draft.versionHistory].slice(0, 12),
      departmentStatus: { ...draft.departmentStatus, production: 'ready' },
    });
  }, [draft, persistDraft]);

  const duplicateDraft = useCallback(() => {
    const s = readStore();
    const newDraft = createProductionDraft({
      ...draft,
      id: `pb-dup-${Date.now()}`,
      productionName: `${draft.productionName} (COPY)`,
      versionHistory: [],
      generationStatus: 'idle',
    });
    writeStore({
      ...s,
      drafts: { ...(s.drafts ?? {}), [newDraft.id]: newDraft },
      activeDraftId: newDraft.id,
    });
    bump();
  }, [draft, bump]);

  const toggleFavorite = useCallback(() => {
    persistDraft({ ...draft, favorite: !draft.favorite });
  }, [draft, persistDraft]);

  const archiveDraft = useCallback(() => {
    persistDraft({ ...draft, archived: !draft.archived });
  }, [draft, persistDraft]);

  const setPromptOverride = useCallback(
    (text: string) => {
      persistDraft({
        ...draft,
        promptOverride: text,
        promptStatus: text.trim() ? 'edited' : 'assembled',
      });
    },
    [draft, persistDraft]
  );

  const [generationOutputs, setGenerationOutputs] = useState<typeof PRODUCTION_GENERATION_OUTPUTS | null>(null);

  const buildProduction = useCallback(() => {
    persistDraft({
      ...draft,
      generationStatus: 'queued',
      promptStatus: 'ready',
      departmentStatus: {
        research: 'complete',
        creative: 'complete',
        visual: 'complete',
        production: 'working',
        editorial: 'working',
        publishing: 'waiting',
        analytics: 'waiting',
        legacy: 'waiting',
      },
    });
    setTimeout(() => {
      setGenerationOutputs(
        PRODUCTION_GENERATION_OUTPUTS.map((o) => ({ ...o, status: 'ready' as const }))
      );
      const s = readStore();
      const current = s.drafts?.[draft.id];
      if (current) {
        writeStore({
          ...s,
          drafts: {
            ...s.drafts,
            [draft.id]: {
              ...current,
              generationStatus: 'complete',
              departmentStatus: {
                research: 'complete',
                creative: 'complete',
                visual: 'complete',
                production: 'complete',
                editorial: 'complete',
                publishing: 'ready',
                analytics: 'ready',
                legacy: 'waiting',
              },
            },
          },
        });
        bump();
      }
    }, 800);
  }, [draft, persistDraft, bump]);

  return {
    draft,
    activeScene,
    setActiveSceneId,
    assembledPrompt,
    updateDraftMeta,
    updateActiveScene,
    applyAssetDrop,
    addScene,
    removeScene,
    reorderScenes,
    toggleOutputType,
    loadTemplate,
    saveDraft,
    duplicateDraft,
    toggleFavorite,
    archiveDraft,
    setPromptOverride,
    buildProduction,
    generationOutputs,
  };
}
