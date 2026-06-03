import { useCallback, useState } from 'react';
import { postPsaChat, type PsaUsagePayload } from '../../utils/psaApi';

export type PsaChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function nextId(): string {
  return `psa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function usePsaChat(welcomeMessage: string) {
  const [messages, setMessages] = useState<PsaChatMessage[]>(() => [
    { id: 'welcome', role: 'assistant', content: welcomeMessage },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<PsaUsagePayload | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return { premiumRequired: false as const };

      setError(null);
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
      setIsSending(true);

      const result = await postPsaChat(trimmed, responseId);
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
      return { premiumRequired: false as const, clientActions: result.clientActions };
    },
    [isSending, responseId]
  );

  const resetChat = useCallback(() => {
    setMessages([{ id: 'welcome', role: 'assistant', content: welcomeMessage }]);
    setResponseId(null);
    setError(null);
  }, [welcomeMessage]);

  return {
    messages,
    isSending,
    error,
    usage,
    setUsage,
    sendMessage,
    resetChat,
  };
}
