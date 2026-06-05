import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import {
  getPsaChatUiCopy,
  getPsaStarterQuickReplyLabels,
  PSA_CHAT_COPY_UPDATED_EVENT,
} from '../../utils/psaChatCopyResolve';
import { formatPsaVoiceText } from '../../utils/psaVoiceFormat';
import { formatPsaMessageRouteDisplay } from '../../utils/psaRouteDisplay';
import { renderPsaAssistantBubbleText } from '../../utils/psaBubbleText';
import { psaHistoryCardTitle, psaHistoryPreviewLine } from '../../utils/psaThreadHistoryDisplay';
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
  historyArchivedView?: boolean;
  isLoadingThreadList?: boolean;
  historyAvailable?: boolean;
  threadList?: {
    id: string;
    title: string | null;
    updatedAt: string;
    preview: string | null;
    threadSummary?: string | null;
  }[];
  activeThreadId?: string | null;
  onClose: () => void;
  onSend: (text: string) => Promise<{ premiumRequired?: boolean } | void>;
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onCloseHistory?: () => void;
  onToggleHistoryArchived?: () => void;
  onSelectThread?: (threadId: string) => void;
  onArchiveThread?: (threadId: string) => void;
  onUnarchiveThread?: (threadId: string) => void;
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

function PsaChatArchivedIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16v12H4V7z"
        stroke="#EB1C24"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={active ? 'rgba(235, 28, 36, 0.12)' : 'none'}
      />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke="#EB1C24" strokeWidth="1.5" />
      <path d="M4 10h16" stroke="#EB1C24" strokeWidth="1.5" />
    </svg>
  );
}

function PsaChatCardArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 8h16" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 11v6" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 14l3 3 3-3" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V8" stroke="#EB1C24" strokeWidth="1.5" />
    </svg>
  );
}

function PsaChatCardDeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PsaChatRenameSaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#EB1C24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PsaChatRenameCancelIcon() {
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
  historyArchivedView = false,
  isLoadingThreadList = false,
  historyAvailable = true,
  threadList = [],
  activeThreadId = null,
  onClose,
  onSend,
  onNewChat,
  onOpenHistory,
  onCloseHistory,
  onToggleHistoryArchived,
  onSelectThread,
  onArchiveThread,
  onUnarchiveThread,
  onDeleteThread,
  onRenameThread,
  onInputFocusChange,
  onInputTextChange,
  initialInput = '',
}: PsaChatPanelProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState(initialInput);
  const [renamingThreadId, setRenamingThreadId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [deleteConfirmThreadId, setDeleteConfirmThreadId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [uiCopy, setUiCopy] = useState(() => getPsaChatUiCopy());

  useEffect(() => {
    const reload = () => setUiCopy(getPsaChatUiCopy());
    reload();
    window.addEventListener(PSA_CHAT_COPY_UPDATED_EVENT, reload);
    return () => window.removeEventListener(PSA_CHAT_COPY_UPDATED_EVENT, reload);
  }, []);

  useEffect(() => {
    if (renamingThreadId) {
      renameInputRef.current?.focus();
    }
  }, [renamingThreadId]);

  useEffect(() => {
    if (!historyOpen) {
      setRenamingThreadId(null);
      setRenameDraft('');
    }
  }, [historyOpen]);

  const cancelRename = () => {
    setRenamingThreadId(null);
    setRenameDraft('');
  };

  const startRename = (threadId: string) => {
    setRenamingThreadId(threadId);
    setRenameDraft('');
  };

  const saveRename = (threadId: string) => {
    const trimmed = renameDraft.trim();
    if (!trimmed || !onRenameThread) return;
    onRenameThread(threadId, trimmed);
    cancelRename();
  };

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
        ? getPsaStarterQuickReplyLabels().map((chip) => formatPsaVoiceText(chip, { stripGreeting: false }))
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
          <h2 className="psa-chat-subtitle">
            {historyOpen ? (historyArchivedView ? 'ARCHIVED CHATS' : 'CHAT HISTORY') : uiCopy.chatSubtitle}
          </h2>
          {usageLabel ? <p className="psa-chat-usage">{usageLabel}</p> : null}
        </div>
        <div className="psa-chat-header-side psa-chat-header-side--right">
          {historyOpen && !historyArchivedView && onToggleHistoryArchived ? (
            <button
              type="button"
              className="psa-chat-header-icon-btn"
              onClick={onToggleHistoryArchived}
              aria-label="View archived chats"
              aria-pressed={false}
            >
              <PsaChatArchivedIcon active={false} />
            </button>
          ) : onNewChat ? (
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
          <div className="psa-chat-history" aria-label={historyArchivedView ? 'Archived PSA chats' : 'Past PSA chats'}>
            {isLoadingThreadList ? (
              <div className="psa-chat-bubble psa-chat-bubble-system">
                {historyArchivedView ? 'ARCHIVED CHAT HISTORY LOADING…' : 'CHAT HISTORY LOADING…'}
              </div>
            ) : threadList.length === 0 ? (
              <p className="psa-chat-history-empty">
                {historyArchivedView ? 'NO ARCHIVED CHAT HISTORY.' : 'NO PAST CHAT HISTORY.'}
              </p>
            ) : (
              threadList.map((thread) => {
                const isRenaming = renamingThreadId === thread.id;
                const previewLine = psaHistoryPreviewLine(thread.preview);
                const displayTitle = psaHistoryCardTitle({
                  title: thread.title,
                  firstUserMessage: thread.preview,
                  threadSummary: thread.threadSummary ?? null,
                });
                return (
                <div key={thread.id} className="psa-chat-history-entry">
                  <div className="psa-chat-history-card-wrap">
                    {isRenaming ? (
                      <div className="psa-chat-history-item psa-chat-history-item--renaming">
                        <input
                          ref={renameInputRef}
                          type="text"
                          className="psa-chat-history-rename-input"
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          placeholder="TYPE CHAT NAME…"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveRename(thread.id);
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelRename();
                            }
                          }}
                        />
                        {previewLine ? (
                          <span className="psa-chat-history-item-preview">{previewLine}</span>
                        ) : (
                          <span className="psa-chat-history-item-preview" aria-hidden="true">
                            {'\u00A0'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`psa-chat-history-item${thread.id === activeThreadId ? ' is-active' : ''}`}
                        onClick={() => onSelectThread?.(thread.id)}
                      >
                        <span className="psa-chat-history-item-title">{displayTitle}</span>
                        {previewLine ? (
                          <span className="psa-chat-history-item-preview">{previewLine}</span>
                        ) : (
                          <span className="psa-chat-history-item-preview" aria-hidden="true">
                            {'\u00A0'}
                          </span>
                        )}
                      </button>
                    )}
                    {!isRenaming && historyArchivedView && onDeleteThread ? (
                      <button
                        type="button"
                        className="psa-chat-history-card-archive-btn"
                        aria-label="Delete chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmThreadId(thread.id);
                        }}
                      >
                        <PsaChatCardDeleteIcon />
                      </button>
                    ) : !isRenaming && onArchiveThread ? (
                      <button
                        type="button"
                        className="psa-chat-history-card-archive-btn"
                        aria-label="Archive chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveThread(thread.id);
                        }}
                      >
                        <PsaChatCardArchiveIcon />
                      </button>
                    ) : null}
                  </div>
                  <div className="psa-chat-history-item-actions">
                    {!isRenaming && historyArchivedView && onUnarchiveThread ? (
                      <button
                        type="button"
                        className="psa-chat-history-item-action psa-chat-history-item-action--left"
                        disabled={renamingThreadId !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnarchiveThread(thread.id);
                        }}
                      >
                        UNARCHIVE
                      </button>
                    ) : onRenameThread && !isRenaming ? (
                      <button
                        type="button"
                        className="psa-chat-history-item-action psa-chat-history-item-action--left"
                        disabled={renamingThreadId !== null && renamingThreadId !== thread.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(thread.id);
                        }}
                      >
                        RENAME CHAT
                      </button>
                    ) : null}
                    {isRenaming ? (
                      <div className="psa-chat-history-rename-actions">
                        <button
                          type="button"
                          className="psa-chat-history-rename-icon-btn"
                          aria-label="Save renamed chat"
                          disabled={!renameDraft.trim()}
                          onClick={(e) => {
                            e.stopPropagation();
                            saveRename(thread.id);
                          }}
                        >
                          <PsaChatRenameSaveIcon />
                        </button>
                        <button
                          type="button"
                          className="psa-chat-history-rename-icon-btn"
                          aria-label="Cancel rename"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelRename();
                          }}
                        >
                          <PsaChatRenameCancelIcon />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
              })
            )}
          </div>
        </>
      ) : (
      <>
      <div className="psa-chat-messages" ref={scrollRef}>
        {isLoadingHistory ? (
          <div className="psa-chat-bubble psa-chat-bubble-system">{uiCopy.loadingLabel}</div>
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
          <div className="psa-chat-bubble psa-chat-bubble-system">{uiCopy.typingLabel}</div>
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
          placeholder={uiCopy.inputPlaceholder}
          disabled={isSending || isLoadingHistory}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button className="psa-chat-send" type="submit" disabled={isSending || isLoadingHistory}>
          SEND
        </button>
      </form>
      </>
      )}

      <ConfirmationModal
        isOpen={deleteConfirmThreadId !== null}
        onClose={() => setDeleteConfirmThreadId(null)}
        onConfirm={() => {
          if (deleteConfirmThreadId && onDeleteThread) {
            onDeleteThread(deleteConfirmThreadId);
          }
          setDeleteConfirmThreadId(null);
        }}
        title="DELETE CHAT?"
        message="THIS PERMANENTLY DELETES THIS CHAT. THIS CANNOT BE UNDONE."
        confirmText="DELETE"
        cancelText="CANCEL"
        dataAttribute="psa-delete-chat-confirm"
      />
    </div>
  );
}
