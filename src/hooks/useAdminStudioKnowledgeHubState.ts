import { useCallback, useMemo, useState } from 'react';
import {
  KNOWLEDGE_PAGE_GUIDES,
  type KnowledgePageGuide,
} from '../utils/adminStudioKnowledgeHubDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type KnowledgeHubStore = {
  readGuideIds?: string[];
  completedTourModuleIds?: string[];
  executiveNotes?: string;
  dismissedContextualHints?: string[];
};

function readStore(): KnowledgeHubStore {
  return readStudioJson<KnowledgeHubStore>(ADMIN_STUDIO_STORAGE_KEYS.knowledgeHub) ?? {};
}

function writeStore(store: KnowledgeHubStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.knowledgeHub, store);
}

export function useAdminStudioKnowledgeHub() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const unreadGuideCount = useMemo(() => {
    const read = new Set(store.readGuideIds ?? []);
    return KNOWLEDGE_PAGE_GUIDES.filter((g) => g.moduleId !== 'knowledge-hub' && !read.has(g.moduleId)).length;
  }, [store.readGuideIds]);

  const unreadGuides = useMemo(() => {
    const read = new Set(store.readGuideIds ?? []);
    return KNOWLEDGE_PAGE_GUIDES.filter((g) => g.moduleId !== 'knowledge-hub' && !read.has(g.moduleId)).map((g) => ({
      id: g.moduleId,
      title: g.title,
      moduleLabel: g.title,
    }));
  }, [store.readGuideIds]);

  const markGuideRead = useCallback(
    (moduleId: string) => {
      const s = readStore();
      const ids = s.readGuideIds ?? [];
      if (ids.includes(moduleId)) return;
      writeStore({ ...s, readGuideIds: [...ids, moduleId] });
      bump();
    },
    [bump]
  );

  const completeTour = useCallback(
    (moduleId: string) => {
      const s = readStore();
      const ids = s.completedTourModuleIds ?? [];
      if (ids.includes(moduleId)) return;
      writeStore({ ...s, completedTourModuleIds: [...ids, moduleId] });
      bump();
    },
    [bump]
  );

  const executiveNotes = store.executiveNotes ?? '';
  const setExecutiveNotes = useCallback(
    (notes: string) => {
      writeStore({ ...readStore(), executiveNotes: notes });
      bump();
    },
    [bump]
  );

  const dismissContextualHint = useCallback(
    (moduleId: string) => {
      const s = readStore();
      const ids = s.dismissedContextualHints ?? [];
      if (ids.includes(moduleId)) return;
      writeStore({ ...s, dismissedContextualHints: [...ids, moduleId] });
      bump();
    },
    [bump]
  );

  const isHintDismissed = useCallback(
    (moduleId: string) => (store.dismissedContextualHints ?? []).includes(moduleId),
    [store.dismissedContextualHints]
  );

  return {
    unreadGuideCount,
    unreadGuides,
    markGuideRead,
    completeTour,
    executiveNotes,
    setExecutiveNotes,
    dismissContextualHint,
    isHintDismissed,
    completedTourModuleIds: store.completedTourModuleIds ?? [],
  };
}

export type KnowledgeTourState = {
  stepIndex: number;
  guide: KnowledgePageGuide | null;
};
