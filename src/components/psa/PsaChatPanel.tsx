import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PSA_CHAT_SUBTITLE,
  PSA_CHAT_TITLE,
} from '../../constants/psaConfig';
import { formatPsaVoiceText } from '../../utils/psaVoiceFormat';
import type { PsaChatMessage } from './usePsaChat';

type PsaChatPanelProps = {
  messages: PsaChatMessage[];
  isSending: boolean;
  isLoadingHistory?: boolean;
  usageLabel?: string | null;
  historyOpen?: boolean;
  historyAvailable?: boolean;
  threadList?: { id: string; title: string | null; updatedAt: string; preview: string | null }[];
  activeThreadId?: string | null;
  onClose: () => void;
  onSend: (text: string) => Promise<{ premiumRequired?: boolean } | void>;
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onCloseHistory?: () => void;
  onSelectThread?: (threadId: string) => void;
  onInputFocusChange?: (focused: boolean) => void;
  onInputTextChange?: (hasText: boolean) => void;
};

/** Member-facing bubble copy — uppercase via CSS; voice-normalized for assistant/system. */
function bubbleContent(msg: PsaChatMessage): string {
  if (msg.role === 'user') return msg.content;
  return formatPsaVoiceText(msg.content);
}

/** Extract in-app paths like /account/concierge from assistant text for tap-to-navigate. */
function extractPaths(text: string): string[] {
  const matches = text.match(/\/(?:[a-z0-9-]+\/)*[a-z0-9-]+/gi) ?? [];
  const unique = [...new Set(matches.map((m) => m.split(/[\s),."'<>]/)[0]))];
  return unique.filter((p) => p.startsWith('/') && p.length > 1).slice(0, 4);
}

export default function PsaChatPanel({
  messages,
  isSending,
  isLoadingHistory = false,
  usageLabel,
  historyOpen = false,
  historyAvailable = true,
  threadList = [],
  activeThreadId = null,
  onClose,
  onSend,
  onNewChat,
  onOpenHistory,
  onCloseHistory,
  onSelectThread,
  onInputFocusChange,
  onInputTextChange,
}: PsaChatPanelProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  const submit = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    await onSend(text);
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div className="psa-chat-panel" role="dialog" aria-label="Personal Slay Assistant chat">
      <header className="psa-chat-header">
        <div className="psa-chat-header-text">
          <h2 className="psa-chat-title">{PSA_CHAT_TITLE}</h2>
          <p className="psa-chat-subtitle">{PSA_CHAT_SUBTITLE}</p>
          {usageLabel ? <p className="psa-chat-usage">{usageLabel}</p> : null}
        </div>
        <div className="psa-chat-header-actions">
          {historyAvailable && onOpenHistory ? (
            <button
              type="button"
              className="psa-chat-header-btn"
              onClick={historyOpen ? onCloseHistory : onOpenHistory}
              aria-label={historyOpen ? 'Close chat history' : 'Open chat history'}
            >
              {historyOpen ? 'BACK' : 'HISTORY'}
            </button>
          ) : null}
          {onNewChat ? (
            <button type="button" className="psa-chat-header-btn" onClick={onNewChat} aria-label="Start new PSA chat">
              NEW
            </button>
          ) : null}
          <button type="button" className="psa-chat-close" onClick={onClose} aria-label="Close PSA">
            ×
          </button>
        </div>
      </header>

      {historyOpen ? (
        <div className="psa-chat-history" aria-label="Past PSA chats">
          {threadList.length === 0 ? (
            <p className="psa-chat-history-empty">NO PAST CHATS YET</p>
          ) : (
            threadList.map((thread) => (
              <button
                key={thread.id}
                type="button"
                className={`psa-chat-history-item${thread.id === activeThreadId ? ' is-active' : ''}`}
                onClick={() => onSelectThread?.(thread.id)}
              >
                <span className="psa-chat-history-item-title">
                  {thread.title?.trim() || thread.preview?.trim() || 'PSA CHAT'}
                </span>
                {thread.preview && thread.title ? (
                  <span className="psa-chat-history-item-preview">{thread.preview}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : (
      <>
      <div className="psa-chat-messages" ref={scrollRef}>
        {isLoadingHistory ? (
          <div className="psa-chat-bubble psa-chat-bubble-system">LOADING YOUR CHAT…</div>
        ) : null}
        {messages.map((msg) => {
          const paths = msg.role === 'assistant' ? extractPaths(msg.content) : [];
          return (
            <div
              key={msg.id}
              className={`psa-chat-bubble psa-chat-bubble-${msg.role}`}
            >
              {bubbleContent(msg)}
              {paths.length > 0 ? (
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {paths.map((path) => (
                    <button
                      key={path}
                      type="button"
                      className="psa-chat-nav-link"
                      onClick={() => {
                        onClose();
                        navigate(path);
                      }}
                    >
                      GO TO {path.toUpperCase()}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {isSending ? (
          <div className="psa-chat-bubble psa-chat-bubble-system">PSA IS TYPING…</div>
        ) : null}
      </div>

      <form className="psa-chat-input-row" onSubmit={onFormSubmit}>
        <input
          className="psa-chat-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onInputTextChange?.(e.target.value.trim().length > 0);
          }}
          onFocus={() => onInputFocusChange?.(true)}
          onBlur={() => onInputFocusChange?.(false)}
          onKeyDown={onInputKeyDown}
          placeholder="ASK PSA ANYTHING…"
          disabled={isSending || isLoadingHistory}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button className="psa-chat-send" type="submit" disabled={isSending || isLoadingHistory || !input.trim()}>
          SEND
        </button>
      </form>
      </>
      )}
    </div>
  );
}
