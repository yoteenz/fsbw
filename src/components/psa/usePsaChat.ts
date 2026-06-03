import { useCallback, useRef, useState } from 'react';
import {
  createPsaThread,
  fetchPsaActiveThread,
  fetchPsaThreadList,
  postPsaChat,
  type PsaThreadSummary,
  type PsaUsagePayload,
} from '../../utils/psaApi';

export type PsaChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function nextId(): string {
  return `psa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function welcomeOnly(welcomeMessage: string): PsaChatMessage[] {
  return [{ id: 'welcome', role: 'assistant', content: welcomeMessage }];
}

export function usePsaChat(welcomeMessage: string) {
  const [messages, setMessages] = useState<PsaChatMessage[]>(() => welcomeOnly(welcomeMessage));
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadList, setThreadList] = useState<PsaThreadSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAvailable, setHistoryAvailable] = useState(true);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<PsaUsagePayload | null>(null);
  const historyLoadedRef = useRef(false);

  const applyThreadPayload = useCallback(
    (payload: {
      threadId: string | null;
      lastResponseId: string | null;
      messages: { id: string; role: PsaChatMessage['role']; content: string }[];
    }) => {
      setThreadId(payload.threadId);
      setResponseId(payload.lastResponseId);
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
      applyThreadPayload({
        threadId: result.threadId,
        lastResponseId: result.lastResponseId,
        messages: result.messages,
      });
      return true;
    },
    [applyThreadPayload]
  );

  const refreshThreadList = useCallback(async () => {
    const result = await fetchPsaThreadList();
    if (result.ok) {
      setThreadList(result.threads);
    }
  }, []);

  const openHistory = useCallback(async () => {
    setHistoryOpen(true);
    await refreshThreadList();
  }, [refreshThreadList]);

  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
  }, []);

  const startNewThread = useCallback(async () => {
    setHistoryOpen(false);
    setError(null);
    const result = await createPsaThread();
    if (!result.ok) {
      setError(result.message);
      return false;
    }
    setThreadId(result.threadId);
    setResponseId(null);
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

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return { premiumRequired: false as const };

      setError(null);
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
      setIsSending(true);

      const result = await postPsaChat(trimmed, {
        previousResponseId: responseId,
        threadId,
      });
      setIsSending(false);

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
        return { premiumRequired: false as const, limitReached: result.code === 'PSA_LIMIT_REACHED' };
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
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', content: result.reply },
      ]);
      void refreshThreadList();
      return { premiumRequired: false as const, clientActions: result.clientActions };
    },
    [isSending, responseId, threadId, refreshThreadList]
  );

  const resetChat = useCallback(() => {
    setMessages(welcomeOnly(welcomeMessage));
    setThreadId(null);
    setResponseId(null);
    setError(null);
    setHistoryOpen(false);
    historyLoadedRef.current = false;
  }, [welcomeMessage]);

  return {
    messages,
    isSending,
    isLoadingHistory,
    threadId,
    threadList,
    historyOpen,
    historyAvailable,
    error,
    usage,
    setUsage,
    sendMessage,
    resetChat,
    loadActiveThread,
    ensureHistoryLoaded,
    startNewThread,
    switchThread,
    openHistory,
    closeHistory,
    refreshThreadList,
  };
}
