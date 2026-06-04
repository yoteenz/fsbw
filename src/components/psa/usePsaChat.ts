import { useCallback, useEffect, useRef, useState } from 'react';
import {
  archivePsaThread,
  deletePsaThread,
  fetchPsaActiveThread,
  fetchPsaThreadList,
  postPsaChat,
  renamePsaThread,
  unarchivePsaThread,
  type PsaContinueHint,
  type PsaChatCard,
  type PsaThreadSummary,
  type PsaUsagePayload,
} from '../../utils/psaApi';
import type { PsaClientSessionContext } from '../../utils/psaSessionContext';

export type PsaChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  cards?: PsaChatCard[];
  quickReplies?: string[];
};

function nextId(): string {
  return `psa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function welcomeOnly(welcomeMessage: string): PsaChatMessage[] {
  return [{ id: 'welcome', role: 'assistant', content: welcomeMessage }];
}

export function usePsaChat(
  welcomeMessage: string,
  getSessionContext?: (pendingMessage?: string) => PsaClientSessionContext
) {
  const [messages, setMessages] = useState<PsaChatMessage[]>(() => welcomeOnly(welcomeMessage));
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadList, setThreadList] = useState<PsaThreadSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyArchivedView, setHistoryArchivedView] = useState(false);
  const [historyAvailable, setHistoryAvailable] = useState(true);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<PsaUsagePayload | null>(null);
  const [panelQuickReplies, setPanelQuickReplies] = useState<string[]>([]);
  const [continueHint, setContinueHint] = useState<PsaContinueHint | null>(null);
  const historyLoadedRef = useRef(false);
  const getSessionContextRef = useRef(getSessionContext);
  getSessionContextRef.current = getSessionContext;

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0]?.id === 'welcome') {
        return welcomeOnly(welcomeMessage);
      }
      return prev;
    });
  }, [welcomeMessage]);

  const applyThreadPayload = useCallback(
    (payload: {
      threadId: string | null;
      lastResponseId: string | null;
      messages: { id: string; role: PsaChatMessage['role']; content: string }[];
    }) => {
      setThreadId(payload.threadId);
      setResponseId(payload.lastResponseId);
      setPanelQuickReplies([]);
      if (payload.messages.length > 0) {
        setMessages(
          payload.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          }))
        );
      } else {
        setMessages(welcomeOnly(welcomeMessage));
      }
    },
    [welcomeMessage]
  );

  const loadActiveThread = useCallback(
    async (targetThreadId?: string) => {
      setIsLoadingHistory(true);
      const result = await fetchPsaActiveThread(targetThreadId);
      setIsLoadingHistory(false);

      if (!result.ok) {
        if (result.code !== 'SIGN_IN_REQUIRED' && result.code !== 'PREMIUM_REQUIRED') {
          setError(result.message);
        }
        return false;
      }

      setHistoryAvailable(result.historyAvailable);
      setContinueHint(result.continueHint ?? null);
      applyThreadPayload({
        threadId: result.threadId,
        lastResponseId: result.lastResponseId,
        messages: result.messages,
      });
      return true;
    },
    [applyThreadPayload]
  );

  const refreshThreadList = useCallback(async (archivedOnly?: boolean) => {
    const result = await fetchPsaThreadList({
      archivedOnly: archivedOnly ?? historyArchivedView,
    });
    if (result.ok) {
      setThreadList(result.threads);
    }
  }, [historyArchivedView]);

  const openHistory = useCallback(async () => {
    setHistoryOpen(true);
    setHistoryArchivedView(false);
    const result = await fetchPsaThreadList({ archivedOnly: false });
    if (result.ok) {
      setThreadList(result.threads);
    }
  }, []);

  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
    setHistoryArchivedView(false);
  }, []);

  const toggleHistoryArchivedView = useCallback(async () => {
    const next = !historyArchivedView;
    setHistoryArchivedView(next);
    const result = await fetchPsaThreadList({ archivedOnly: next });
    if (result.ok) {
      setThreadList(result.threads);
    }
  }, [historyArchivedView]);

  const startNewThread = useCallback(async () => {
    setHistoryOpen(false);
    setError(null);
    setThreadId(null);
    setResponseId(null);
    setPanelQuickReplies([]);
    setContinueHint(null);
    setMessages(welcomeOnly(welcomeMessage));
    await refreshThreadList();
    return true;
  }, [refreshThreadList, welcomeMessage]);

  const switchThread = useCallback(
    async (id: string) => {
      setHistoryOpen(false);
      setError(null);
      await loadActiveThread(id);
    },
    [loadActiveThread]
  );

  const ensureHistoryLoaded = useCallback(async () => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    await loadActiveThread();
  }, [loadActiveThread]);

  const refreshContinueHint = useCallback(async () => {
    const result = await fetchPsaActiveThread();
    if (result.ok) {
      setContinueHint(result.continueHint ?? null);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      text: string,
      options?: { immediateNavigate?: boolean }
    ) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return { premiumRequired: false as const };

      setError(null);
      setPanelQuickReplies([]);
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);

      const context = getSessionContextRef.current?.(trimmed);
      const chatOpts = {
        previousResponseId: responseId,
        threadId,
        context,
      };

      const applyChatResult = (result: Awaited<ReturnType<typeof postPsaChat>>) => {
        if (!result.ok) {
          if (result.code === 'PREMIUM_REQUIRED') {
            return { premiumRequired: true as const, message: result.message };
          }
          if (result.code === 'PSA_LIMIT_REACHED' && result.usage) {
            setUsage(result.usage);
          }
          setError(result.message);
          setMessages((prev) => [
            ...prev,
            { id: nextId(), role: 'system', content: result.message },
          ]);
          return {
            premiumRequired: false as const,
            limitReached: result.code === 'PSA_LIMIT_REACHED',
          };
        }

        if (result.threadId) setThreadId(result.threadId);
        setResponseId(result.responseId);
        setUsage((prev) => {
          if (!prev || prev.unlimited) return prev;
          return {
            ...prev,
            monthCount: prev.monthCount + 1,
            dayCount: prev.dayCount + 1,
          };
        });
        setPanelQuickReplies(result.quickReplies ?? []);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            content: result.reply,
            cards: result.cards,
            quickReplies: result.quickReplies,
          },
        ]);
        void refreshThreadList();
        void refreshContinueHint();
        return { premiumRequired: false as const, clientActions: result.clientActions };
      };

      if (options?.immediateNavigate) {
        void (async () => {
          const result = await postPsaChat(trimmed, chatOpts);
          applyChatResult(result);
        })();
        return { premiumRequired: false as const, immediateNavigate: true as const };
      }

      setIsSending(true);

      const result = await postPsaChat(trimmed, chatOpts);
      const typingDelayMs = 300 + Math.floor(Math.random() * 401);
      await new Promise((resolve) => setTimeout(resolve, typingDelayMs));
      setIsSending(false);

      return applyChatResult(result);
    },
    [isSending, responseId, threadId, refreshThreadList, refreshContinueHint]
  );

  const archiveThread = useCallback(
    async (id: string) => {
      const result = await archivePsaThread(id);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      if (threadId === id) {
        setThreadId(null);
        setResponseId(null);
        setMessages(welcomeOnly(welcomeMessage));
        setContinueHint(null);
      }
      await refreshThreadList(historyArchivedView);
      return true;
    },
    [threadId, refreshThreadList, welcomeMessage, historyArchivedView]
  );

  const renameThread = useCallback(
    async (id: string, title: string) => {
      const result = await renamePsaThread(id, title);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      await refreshThreadList();
      return true;
    },
    [refreshThreadList]
  );

  const unarchiveThread = useCallback(
    async (id: string) => {
      const result = await unarchivePsaThread(id);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      await refreshThreadList(true);
      return true;
    },
    [refreshThreadList]
  );

  const removeThread = useCallback(
    async (id: string) => {
      const result = await deletePsaThread(id);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      if (threadId === id) {
        setThreadId(null);
        setResponseId(null);
        setMessages(welcomeOnly(welcomeMessage));
        setContinueHint(null);
      }
      await refreshThreadList(historyArchivedView);
      return true;
    },
    [threadId, refreshThreadList, welcomeMessage, historyArchivedView]
  );

  const resetChat = useCallback(() => {
    setMessages(welcomeOnly(welcomeMessage));
    setThreadId(null);
    setResponseId(null);
    setError(null);
    setPanelQuickReplies([]);
    setContinueHint(null);
    setHistoryOpen(false);
    setHistoryArchivedView(false);
    historyLoadedRef.current = false;
  }, [welcomeMessage]);

  return {
    messages,
    isSending,
    isLoadingHistory,
    threadId,
    threadList,
    historyOpen,
    historyArchivedView,
    historyAvailable,
    error,
    usage,
    panelQuickReplies,
    continueHint,
    setUsage,
    sendMessage,
    resetChat,
    archiveThread,
    renameThread,
    unarchiveThread,
    removeThread,
    loadActiveThread,
    ensureHistoryLoaded,
    refreshContinueHint,
    startNewThread,
    switchThread,
    openHistory,
    closeHistory,
    toggleHistoryArchivedView,
    refreshThreadList,
  };
}
