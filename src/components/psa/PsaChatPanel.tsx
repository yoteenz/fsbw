import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import {
  PSA_CHAT_SUBTITLE,
  PSA_STARTER_QUICK_REPLIES,
} from '../../constants/psaConfig';
import { formatPsaVoiceText } from '../../utils/psaVoiceFormat';
import { formatPsaMessageRouteDisplay } from '../../utils/psaRouteDisplay';
import { renderPsaAssistantBubbleText } from '../../utils/psaBubbleText';
import { resolvePsaQuickReplyNavigation } from '../../utils/psaQuickReplyNavigation';
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
  onRenameThread?: (threadId: string, title: string) => void;
  onInputFocusChange?: (focused: boolean) => void;
  onInputTextChange?: (hasText: boolean) => void;
  initialInput?: string;
};

function bubbleDisplay(msg: PsaChatMessage): ReturnType<typeof formatPsaMessageRouteDisplay> {
  const stripGreeting = msg.role === 'assistant' && msg.id !== 'welcome';
  const formatted = formatPsaVoiceText(msg.content, { stripGreeting });
  const routeDisplay = formatPsaMessageRouteDisplay(formatted);
  const cardPaths = new Set(
    (msg.cards ?? [])
      .map((c) => c.path?.trim().toLowerCase())
      .filter((p): p is string => Boolean(p))
  );
  return {
    ...routeDisplay,
    routeLinks: routeDisplay.routeLinks.filter((link) => !cardPaths.has(link.path.toLowerCase())),
  };
}

function formatCardField(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return formatPsaVoiceText(text, { stripGreeting: false });
}

function PsaChatHistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.636 18.364A9 9 0 1 0 4.5 12H3m2 2-2-2 2-2"
        stroke="#EB1C24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 7v5l3 2" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PsaChatBackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PsaChatNewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PsaChatDeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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
              <span className="psa-chat-card-title">{formatCardField(card.name) ?? card.name}</span>
              {card.startingPriceUsd != null ? (
                <span className="psa-chat-card-meta">FROM ${card.startingPriceUsd} BASE</span>
              ) : null}
              {card.summary ? (
                <span className="psa-chat-card-body">{formatCardField(card.summary)}</span>
              ) : null}
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
              <span className="psa-chat-card-title">{formatCardField(card.orderNumber) ?? card.orderNumber}</span>
              {card.status ? (
                <span className="psa-chat-card-meta">{formatCardField(card.status)}</span>
              ) : null}
              {card.note ? <span className="psa-chat-card-body">{formatCardField(card.note)}</span> : null}
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
              <span className="psa-chat-card-title">{formatCardField(card.label) ?? card.label}</span>
              {card.type === 'nav' && card.description ? (
                <span className="psa-chat-card-body">{formatCardField(card.description)}</span>
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
  onRenameThread,
  onInputFocusChange,
  onInputTextChange,
  initialInput = '',
}: PsaChatPanelProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState(initialInput);
  const [deleteConfirmThreadId, setDeleteConfirmThreadId] = useState<string | null>(null);
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
    if (resolvePsaQuickReplyNavigation(value)) {
      void onSend(value);
      return;
    }
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

  const isWelcomeOnly =
    messages.length === 1 && messages[0]?.role === 'assistant' && messages[0]?.id === 'welcome';

  const quickReplies =
    panelQuickReplies.length > 0
      ? panelQuickReplies.map((chip) => formatPsaVoiceText(chip, { stripGreeting: false }))
      : isWelcomeOnly
        ? PSA_STARTER_QUICK_REPLIES.map((chip) => formatPsaVoiceText(chip, { stripGreeting: false }))
        : (
            [...messages].reverse().find((m) => m.role === 'assistant' && m.quickReplies?.length)
              ?.quickReplies ?? []
          ).map((chip) => formatPsaVoiceText(chip, { stripGreeting: false }));

  return (
    <div className="psa-chat-panel" role="dialog" aria-label="Personal Slay Assistant chat">
      <header className="psa-chat-header">
        <div className="psa-chat-header-side psa-chat-header-side--left">
          {historyAvailable && onOpenHistory ? (
            <button
              type="button"
              className="psa-chat-header-icon-btn"
              onClick={historyOpen ? onCloseHistory : onOpenHistory}
              aria-label={historyOpen ? 'Close chat history' : 'Open chat history'}
            >
              {historyOpen ? <PsaChatBackIcon /> : <PsaChatHistoryIcon />}
            </button>
          ) : null}
        </div>
        <div className="psa-chat-header-text">
          <h2 className="psa-chat-subtitle">{PSA_CHAT_SUBTITLE}</h2>
          {usageLabel ? <p className="psa-chat-usage">{usageLabel}</p> : null}
        </div>
        <div className="psa-chat-header-side psa-chat-header-side--right">
          {onNewChat ? (
            <button
              type="button"
              className="psa-chat-header-icon-btn"
              onClick={onNewChat}
              aria-label="Start new PSA chat"
            >
              <PsaChatNewIcon />
            </button>
          ) : null}
        </div>
      </header>

      {historyOpen ? (
        <>
          <div className="psa-chat-history" aria-label="Past PSA chats">
            {threadList.length === 0 ? (
              <p className="psa-chat-history-empty">NO PAST CHATS YET</p>
            ) : (
              threadList.map((thread) => (
                <div key={thread.id} className="psa-chat-history-entry">
                  <div className="psa-chat-history-card-wrap">
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
                    {onDeleteThread ? (
                      <button
                        type="button"
                        className="psa-chat-history-delete-btn"
                        aria-label="Delete chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmThreadId(thread.id);
                        }}
                      >
                        <PsaChatDeleteIcon />
                      </button>
                    ) : null}
                  </div>
                  <div className="psa-chat-history-item-actions">
                    {onRenameThread ? (
                      <button
                        type="button"
                        className="psa-chat-history-item-action psa-chat-history-item-action--left"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextTitle = window.prompt(
                            'Rename chat',
                            thread.title?.trim() || thread.preview?.trim() || 'PSA CHAT'
                          );
                          if (nextTitle === null) return;
                          const trimmed = nextTitle.trim();
                          if (!trimmed) return;
                          onRenameThread(thread.id, trimmed);
                        }}
                      >
                        RENAME CHAT
                      </button>
                    ) : null}
                    {onArchiveThread ? (
                      <button
                        type="button"
                        className="psa-chat-history-item-action psa-chat-history-item-action--right"
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveThread(thread.id);
                        }}
                      >
                        ARCHIVE
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
          <ConfirmationModal
            isOpen={deleteConfirmThreadId !== null}
            onClose={() => setDeleteConfirmThreadId(null)}
            onConfirm={() => {
              if (deleteConfirmThreadId) {
                onDeleteThread?.(deleteConfirmThreadId);
              }
              setDeleteConfirmThreadId(null);
            }}
            title="DELETE PSA CHAT"
            message="DELETE THIS CHAT PERMANENTLY? THIS CANNOT BE UNDONE."
            confirmText="DELETE"
            cancelText="CANCEL"
            dataAttribute="psa-delete-chat-modal"
          />
        </>
      ) : (
      <>
      <div className="psa-chat-messages" ref={scrollRef}>
        {isLoadingHistory ? (
          <div className="psa-chat-bubble psa-chat-bubble-system">LOADING YOUR CHAT…</div>
        ) : null}
        {messages.map((msg) => {
          const { displayText, routeLinks, inlineTailCue } =
            msg.role === 'assistant' ? bubbleDisplay(msg) : { displayText: msg.content, routeLinks: [], inlineTailCue: null };
          const cards = msg.cards ?? [];
          return (
            <div key={msg.id} className={`psa-chat-bubble psa-chat-bubble-${msg.role}`}>
              {msg.role === 'assistant' ? (
                <span className="psa-chat-bubble-body">
                  {renderPsaAssistantBubbleText(displayText)}
                  {inlineTailCue && routeLinks.length > 0 ? (
                    <>
                      {displayText ? ' ' : null}
                      <span className="psa-chat-route-tail">
                        {inlineTailCue}{' '}
                        {routeLinks.map((link) => (
                          <button
                            key={link.path}
                            type="button"
                            className="psa-chat-nav-link psa-chat-nav-link-inline"
                            onClick={() => goTo(link.path)}
                          >
                            {link.label}
                          </button>
                        ))}
                      </span>
                    </>
                  ) : null}
                </span>
              ) : (
                displayText
              )}
              {cards.length > 0 ? <PsaChatCards cards={cards} onNavigate={goTo} /> : null}
              {!inlineTailCue && routeLinks.length > 0 ? (
                <div className="psa-chat-nav-links">
                  {routeLinks.map((link) => (
                    <button
                      key={link.path}
                      type="button"
                      className="psa-chat-nav-link"
                      onClick={() => goTo(link.path)}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {isSending ? (
          <div className="psa-chat-bubble psa-chat-bubble-system">YOUR PSA IS TYPING…</div>
        ) : null}
      </div>

      {quickReplies.length > 0 && !isSending && !isLoadingHistory ? (
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
