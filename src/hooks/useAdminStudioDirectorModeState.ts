import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductionDraft, ProductionScene } from '../utils/adminStudioProductionBuilderDemo';
import type {
  DirectorGraphicsToggles,
  DirectorModeSession,
  DirectorSceneMeta,
  DirectorSnapshot,
  DirectorVoiceSettings,
} from '../utils/adminStudioDirectorModeDemo';
import {
  allChecklistPassed,
  buildRehearsalSteps,
  computeConsoleMetrics,
  computeReadinessScores,
  createDirectorSession,
  evaluateChecklist,
} from '../utils/adminStudioDirectorModeDemo';
import { DEFAULT_DIRECTOR_LAYER_TOGGLES } from '../utils/adminStudioSetSeparation';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import {
  getProductionDraftById,
  persistProductionDraft,
  reorderProductionDraftScenes,
  updateProductionDraftScene,
} from './useAdminStudioProductionBuilderState';
import { applyAssetToSelection } from '../utils/adminStudioProductionBuilderPrompt';

type DirectorModeStore = {
  sessions?: Record<string, DirectorModeSession>;
};

function readDirectorStore(): DirectorModeStore {
  return readStudioJson<DirectorModeStore>(ADMIN_STUDIO_STORAGE_KEYS.directorMode) ?? {};
}

function writeDirectorStore(store: DirectorModeStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.directorMode, store);
}

function getOrCreateSession(draftId: string, scenes: ProductionScene[]): DirectorModeSession {
  const store = readDirectorStore();
  const existing = store.sessions?.[draftId];
  if (existing) {
    const merged = {
      ...existing,
      layerToggles: { ...DEFAULT_DIRECTOR_LAYER_TOGGLES, ...existing.layerToggles },
    };
    scenes.forEach((s) => {
      if (!merged.sceneMeta[s.id]) merged.sceneMeta[s.id] = createDirectorSession(draftId, [s]).sceneMeta[s.id];
    });
    return merged;
  }
  const session = createDirectorSession(draftId, scenes);
  writeDirectorStore({ ...store, sessions: { ...(store.sessions ?? {}), [draftId]: session } });
  return session;
}

export function exportDirectorModeSnapshot() {
  const store = readDirectorStore();
  return { sessions: store.sessions ?? {}, source: 'director-mode-local' as const };
}

export function useAdminStudioDirectorMode(draftId: string | undefined) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [rehearsalStep, setRehearsalStep] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setEntranceComplete(true), 50);
    return () => clearTimeout(t);
  }, []);

  const draft: ProductionDraft | null = useMemo(() => {
    void version;
    if (!draftId) return null;
    return getProductionDraftById(draftId);
  }, [draftId, version]);

  const session: DirectorModeSession | null = useMemo(() => {
    if (!draftId || !draft) return null;
    void version;
    return getOrCreateSession(draftId, draft.scenes);
  }, [draftId, draft, version]);

  const persistSession = useCallback(
    (next: DirectorModeSession) => {
      const store = readDirectorStore();
      writeDirectorStore({
        ...store,
        sessions: {
          ...(store.sessions ?? {}),
          [next.draftId]: { ...next, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') },
        },
      });
      bump();
    },
    [bump]
  );

  const activeScene = useMemo(() => {
    if (!draft) return undefined;
    const sorted = [...draft.scenes].sort((a, b) => a.order - b.order);
    return activeSceneId ? sorted.find((s) => s.id === activeSceneId) ?? sorted[0] : sorted[0];
  }, [draft, activeSceneId]);

  const activeMeta = activeScene && session ? session.sceneMeta[activeScene.id] : undefined;

  const checklist = useMemo(() => {
    if (!draft || !session) return [];
    return evaluateChecklist(draft, session);
  }, [draft, session, version]);

  const readiness = useMemo(() => {
    if (!draft || !session) return { dimensions: [], overall: 0 };
    return computeReadinessScores(draft, { ...session, checklist });
  }, [draft, session, checklist]);

  const consoleMetrics = useMemo(() => {
    if (!draft || !session) return null;
    return computeConsoleMetrics(draft, { ...session, checklist });
  }, [draft, session, checklist]);

  const rehearsalSteps = useMemo(() => {
    if (!draft || !session) return [];
    return buildRehearsalSteps(draft, session);
  }, [draft, session]);

  const canGenerate = allChecklistPassed(checklist);

  const swapAsset = useCallback(
    (category: string, assetId: string) => {
      if (!draftId || !activeScene) return;
      if (category === 'brand') {
        updateProductionDraftScene(draftId, activeScene.id, { graphicsId: assetId });
        bump();
        return;
      }
      const nextSelection = applyAssetToSelection(activeScene.selection, category, assetId);
      updateProductionDraftScene(draftId, activeScene.id, nextSelection);
      bump();
    },
    [draftId, activeScene, bump]
  );

  const setCameraOverride = useCallback(
    (cameraId: string) => {
      if (!session) return;
      persistSession({ ...session, activeCameraOverride: cameraId });
      if (draftId && activeScene) updateProductionDraftScene(draftId, activeScene.id, { cameraId });
    },
    [session, persistSession, draftId, activeScene]
  );

  const setLightingOverride = useCallback(
    (lightingId: string) => {
      if (!session) return;
      persistSession({ ...session, activeLightingOverride: lightingId });
      if (draftId && activeScene) updateProductionDraftScene(draftId, activeScene.id, { lightingId });
    },
    [session, persistSession, draftId, activeScene]
  );

  const setMusic = useCallback(
    (musicId: string) => {
      if (!session) return;
      persistSession({ ...session, activeMusicId: musicId });
      if (draftId && activeScene) updateProductionDraftScene(draftId, activeScene.id, { musicId });
    },
    [session, persistSession, draftId, activeScene]
  );

  const toggleGraphics = useCallback(
    (key: keyof DirectorGraphicsToggles) => {
      if (!session) return;
      persistSession({
        ...session,
        graphics: { ...session.graphics, [key]: !session.graphics[key] },
      });
    },
    [session, persistSession]
  );

  const toggleLayer = useCallback(
    (key: string) => {
      if (!session) return;
      persistSession({
        ...session,
        layerToggles: { ...session.layerToggles, [key]: !session.layerToggles[key] },
      });
    },
    [session, persistSession]
  );

  const updateVoice = useCallback(
    (patch: Partial<DirectorVoiceSettings>) => {
      if (!session) return;
      persistSession({ ...session, voice: { ...session.voice, ...patch } });
    },
    [session, persistSession]
  );

  const updateSceneMeta = useCallback(
    (patch: Partial<DirectorSceneMeta>) => {
      if (!session || !activeScene) return;
      persistSession({
        ...session,
        sceneMeta: {
          ...session.sceneMeta,
          [activeScene.id]: { ...session.sceneMeta[activeScene.id], ...patch },
        },
      });
    },
    [session, activeScene, persistSession]
  );

  const reorderTimeline = useCallback(
    (from: number, to: number) => {
      if (!draftId) return;
      reorderProductionDraftScenes(draftId, from, to);
      bump();
    },
    [draftId, bump]
  );

  const saveSnapshot = useCallback(() => {
    if (!session || !draft) return;
    const labels = ['VERSION A', 'VERSION B', 'VERSION C', 'VERSION D'];
    const entry: DirectorSnapshot = {
      id: `snap-${Date.now()}`,
      label: labels[session.snapshots.length % labels.length] ?? `VERSION ${session.snapshots.length + 1}`,
      savedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      note: draft.productionName,
    };
    persistSession({ ...session, snapshots: [entry, ...session.snapshots].slice(0, 6) });
  }, [session, draft, persistSession]);

  const toggleClientPreview = useCallback(() => {
    if (!session) return;
    persistSession({ ...session, clientPreviewMode: !session.clientPreviewMode });
  }, [session, persistSession]);

  const startRehearsal = useCallback(() => {
    if (!session) return;
    setRehearsalStep(0);
    persistSession({ ...session, rehearsalActive: true });
  }, [session, persistSession]);

  const stopRehearsal = useCallback(() => {
    if (!session) return;
    setRehearsalStep(0);
    persistSession({ ...session, rehearsalActive: false });
  }, [session, persistSession]);

  const advanceRehearsal = useCallback(() => {
    if (!session?.rehearsalActive) return;
    setRehearsalStep((s) => {
      const max = rehearsalSteps.length - 1;
      if (s >= max) {
        persistSession({ ...session, rehearsalActive: false });
        return 0;
      }
      return s + 1;
    });
  }, [session, rehearsalSteps.length, persistSession]);

  const generateProduction = useCallback(() => {
    if (!draft || !canGenerate) return;
    persistProductionDraft({ ...draft, generationStatus: 'queued', promptStatus: 'ready' });
    bump();
  }, [draft, canGenerate, bump]);

  return {
    draft,
    session,
    activeScene,
    activeMeta,
    setActiveSceneId,
    entranceComplete,
    checklist,
    readiness,
    consoleMetrics,
    rehearsalSteps,
    rehearsalStep,
    canGenerate,
    swapAsset,
    setCameraOverride,
    setLightingOverride,
    setMusic,
    toggleGraphics,
    toggleLayer,
    updateVoice,
    updateSceneMeta,
    reorderTimeline,
    saveSnapshot,
    toggleClientPreview,
    startRehearsal,
    stopRehearsal,
    advanceRehearsal,
    generateProduction,
  };
}
