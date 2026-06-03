import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PSA_CHAT_SUBTITLE,
  PSA_CHAT_TITLE,
} from '../../constants/psaConfig';
import { formatPsaVoiceText } from '../../utils/psaVoiceFormat';
import type { PsaChatCard } from '../../utils/psaApi';
import type { PsaChatMessage } from './usePsaChat';

type PsaChatPanelProps = {
  messages: PsaChatMessage[];
  isSending: boolean;
  isLoadingHistory?: boolean;
  usageLabel?: string | null;
  panelQuickReplies?: string[];
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
  onArchiveThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  onInputFocusChange?: (focused: boolean) => void;
  onInputTextChange?: (hasText: boolean) => void;
  initialInput?: string;
};

function bubbleContent(msg: PsaChatMessage): string {
  if (msg.role === 'user') return msg.content;
  return formatPsaVoiceText(msg.content);
}

function extractPaths(text: string): string[] {
  const matches = text.match(/\/(?:[a-z0-9-]+\/)*[a-z0-9-]+/gi) ?? [];
  const unique = [...new Set(matches.map((m) => m.split(/[\s),."'<>]/)[0]))];
  return unique.filter((p) => p.startsWith('/') && p.length > 1).slice(0, 4);
}

function PsaChatCards({
  cards,
  onNavigate,
}: {
  cards: PsaChatCard[];
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="psa-chat-cards">
      {cards.map((card, idx) => {
        if (card.type === 'product') {
          return (
            <button
              key={`${card.name}-${idx}`}
              type="button"
              className="psa-chat-card psa-chat-card-product"
              onClick={() => onNavigate(card.buildAWigPath || card.path)}
            >
              <span className="psa-chat-card-title">{card.name}</span>
              {card.startingPriceUsd != null ? (
                <span className="psa-chat-card-meta">FROM ${card.startingPriceUsd} BASE</span>
              ) : null}
              {card.summary ? <span className="psa-chat-card-body">{card.summary}</span> : null}
              <span className="psa-chat-card-cta">BUILD-A-WIG</span>
            </button>
          );
        }
        if (card.type === 'order') {
          return (
            <button
              key={`${card.orderNumber}-${idx}`}
              type="button"
              className="psa-chat-card psa-chat-card-order"
              onClick={() => onNavigate(card.path)}
            >
              <span className="psa-chat-card-title">{card.orderNumber}</span>
              {card.status ? <span className="psa-chat-card-meta">{card.status}</span> : null}
              {card.note ? <span className="psa-chat-card-body">{card.note}</span> : null}
              <span className="psa-chat-card-cta">VIEW ORDER</span>
            </button>
          );
        }
        if (card.type === 'nav' || card.type === 'action') {
          return (
            <button
              key={`${card.path}-${idx}`}
              type="button"
              className="psa-chat-card psa-chat-card-nav"
              onClick={() => onNavigate(card.path)}
            >
              <span className="psa-chat-card-title">{card.type === 'nav' ? card.label : card.label}</span>
              {card.type === 'nav' && card.description ? (
                <span className="psa-chat-card-body">{card.description}</span>
              ) : null}
              <span className="psa-chat-card-cta">GO</span>
            </button>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function PsaChatPanel({
  messages,
  isSending,
  isLoadingHistory = false,
  usageLabel,
  panelQuickReplies = [],
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
  onArchiveThread,
  onDeleteThread,
  onInputFocusChange,
  onInputTextChange,
  initialInput = '',
}: PsaChatPanelProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState(initialInput);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending, panelQuickReplies]);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  const submit = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isSending) return;
    setInput('');
    await onSend(value);
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

  const quickReplies =
    panelQuickReplies.length > 0
      ? panelQuickReplies
      : [...messages].reverse().find((m) => m.role === 'assistant' && m.quickReplies?.length)?.quickReplies ?? [];

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
              <div key={thread.id} className="psa-chat-history-row">
                <button
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
                <div className="psa-chat-history-actions">
                  {onArchiveThread ? (
                    <button
                      type="button"
                      className="psa-chat-history-action"
                      aria-label="Archive chat"
                      onClick={() => onArchiveThread(thread.id)}
                    >
                      ARCHIVE
                    </button>
                  ) : null}
                  {onDeleteThread ? (
                    <button
                      type="button"
                      className="psa-chat-history-action psa-chat-history-action-delete"
                      aria-label="Delete chat"
                      onClick={() => onDeleteThread(thread.id)}
                    >
                      DELETE
                    </button>
                  ) : null}
                </div>
              </div>
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
          const cards = msg.cards ?? [];
          return (
            <div key={msg.id} className={`psa-chat-bubble psa-chat-bubble-${msg.role}`}>
              {bubbleContent(msg)}
              {cards.length > 0 ? <PsaChatCards cards={cards} onNavigate={goTo} /> : null}
              {paths.length > 0 ? (
                <div className="psa-chat-nav-links">
                  {paths.map((path) => (
                    <button
                      key={path}
                      type="button"
                      className="psa-chat-nav-link"
                      onClick={() => goTo(path)}
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

      {quickReplies.length > 0 && !isSending ? (
        <div className="psa-chat-quick-replies" aria-label="Suggested replies">
          {quickReplies.map((chip) => (
            <button
              key={chip}
              type="button"
              className="psa-chat-quick-reply"
              onClick={() => void submit(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}

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
