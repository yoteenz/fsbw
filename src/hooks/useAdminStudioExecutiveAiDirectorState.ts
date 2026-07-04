import { useCallback, useMemo, useState } from 'react';
import type { ProductionDraft } from '../utils/adminStudioProductionBuilderDemo';
import type { ExecutiveAiTabId, ExecutiveChatMessage, WorkspaceMemoryEntry } from '../utils/adminStudioExecutiveAiDirectorDemo';
import {
  CREATIVE_INTELLIGENCE_INDEX,
  EXECUTIVE_SCORECARD_SEED,
  EXECUTIVE_TODAYS_BRIEF,
  EXECUTIVE_TIMELINE_SEED,
  PRODUCTION_TIMELINE_SEED,
  WORKSPACE_MEMORY_SEED,
  overallStudioHealth,
  searchCreativeIntel,
} from '../utils/adminStudioExecutiveAiDirectorDemo';
import {
  analyzeProductionDraft,
  evaluateBrandCompliance,
  generateExecutiveChatResponse,
  scorePrompt,
} from '../utils/adminStudioExecutiveAiDirectorAnalysis';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import { exportProductionBuilderSnapshot, getProductionDraftById } from './useAdminStudioProductionBuilderState';

type ExecutiveAiStore = {
  chatHistory?: ExecutiveChatMessage[];
  memoryAppend?: WorkspaceMemoryEntry[];
  activeTab?: ExecutiveAiTabId;
};

function readStore(): ExecutiveAiStore {
  return readStudioJson<ExecutiveAiStore>(ADMIN_STUDIO_STORAGE_KEYS.executiveAiDirector) ?? {};
}

function writeStore(store: ExecutiveAiStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.executiveAiDirector, store);
}

export function exportExecutiveAiDirectorSnapshot() {
  const store = readStore();
  const pb = exportProductionBuilderSnapshot();
  return {
    chatHistory: store.chatHistory ?? [],
    memory: [...WORKSPACE_MEMORY_SEED, ...(store.memoryAppend ?? [])],
    productionDraftCount: Object.keys(pb.drafts).length,
    source: 'executive-ai-director-local' as const,
  };
}

export function useAdminStudioExecutiveAiDirector(options?: { draftId?: string }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const [intelQuery, setIntelQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const activeTab: ExecutiveAiTabId = store.activeTab ?? 'brief';

  const setActiveTab = useCallback(
    (tab: ExecutiveAiTabId) => {
      writeStore({ ...readStore(), activeTab: tab });
      bump();
    },
    [bump]
  );

  const draft: ProductionDraft | null = useMemo(() => {
    if (options?.draftId) return getProductionDraftById(options.draftId);
    const pb = exportProductionBuilderSnapshot();
    const id = pb.activeDraftId;
    return id ? getProductionDraftById(id) ?? null : null;
  }, [options?.draftId, version]);

  const productionNotes = useMemo(() => analyzeProductionDraft(draft), [draft]);
  const promptReview = useMemo(() => scorePrompt(draft, draft?.promptOverride), [draft]);
  const brandCompliance = useMemo(() => evaluateBrandCompliance(draft), [draft]);
  const intelResults = useMemo(() => searchCreativeIntel(intelQuery), [intelQuery]);
  const scorecard = EXECUTIVE_SCORECARD_SEED;
  const studioHealth = overallStudioHealth(scorecard);
  const workspaceMemory = useMemo(
    () => [...WORKSPACE_MEMORY_SEED, ...(store.memoryAppend ?? [])],
    [store.memoryAppend]
  );

  const chatHistory = store.chatHistory ?? [];

  const sendChat = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const userMsg: ExecutiveChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: trimmed,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const s = readStore();
      writeStore({ ...s, chatHistory: [...(s.chatHistory ?? []), userMsg] });
      bump();
      setChatLoading(true);
      setChatInput('');

      setTimeout(() => {
        const response = generateExecutiveChatResponse(trimmed, draft);
        const advisorMsg: ExecutiveChatMessage = {
          id: `a-${Date.now()}`,
          role: 'advisor',
          text: response.text,
          sourceNote: response.sourceNote,
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
        const st = readStore();
        writeStore({ ...st, chatHistory: [...(st.chatHistory ?? []), advisorMsg] });
        setChatLoading(false);
        bump();
      }, 600);
    },
    [draft, bump]
  );

  const appendMemory = useCallback(
    (entry: Omit<WorkspaceMemoryEntry, 'id' | 'recordedAt'>) => {
      const s = readStore();
      const newEntry: WorkspaceMemoryEntry = {
        ...entry,
        id: `wm-${Date.now()}`,
        recordedAt: new Date().toISOString().slice(0, 10),
      };
      writeStore({ ...s, memoryAppend: [newEntry, ...(s.memoryAppend ?? [])].slice(0, 24) });
      bump();
    },
    [bump]
  );

  return {
    activeTab,
    setActiveTab,
    brief: EXECUTIVE_TODAYS_BRIEF,
    scorecard,
    studioHealth,
    intelQuery,
    setIntelQuery,
    intelResults,
    creativeIndex: CREATIVE_INTELLIGENCE_INDEX,
    productionNotes,
    promptReview,
    brandCompliance,
    draft,
    workspaceMemory,
    executiveTimeline: EXECUTIVE_TIMELINE_SEED,
    productionTimeline: PRODUCTION_TIMELINE_SEED,
    chatHistory,
    chatInput,
    setChatInput,
    chatLoading,
    sendChat,
    appendMemory,
  };
}
