import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { LoungeEngagementContentKey } from '../../../utils/loungeEngagementTypes';
import {
  fetchDiscussionComments,
  postCommentAction,
  postDiscussionComment,
  type LoungeDiscussionComment,
} from '../../../utils/loungeEngagementApi';
import { trackLoungeEngagementEvent } from '../../../utils/loungeEngagementAnalytics';
import { LOUNGE_TV_BRAND_RED, LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { loungeTvGlassCqw } from '../loungeTvResponsive';

type LoungeDiscussionPanelProps = {
  open: boolean;
  onClose: () => void;
  contentKey: LoungeEngagementContentKey;
  contentTitle: string;
  onRequireAuth: () => void;
  onCommentCountChange?: (count: number) => void;
  isAdmin?: boolean;
  variant?: 'default' | 'slay-tip';
};

function formatDiscussionTime(iso: string): string {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'NOW';
    if (diffMin < 60) return `${diffMin}M`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 48) return `${diffHr}H`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
  } catch {
    return '';
  }
}

export function LoungeDiscussionPanel({
  open,
  onClose,
  contentKey,
  contentTitle,
  onRequireAuth,
  onCommentCountChange,
  isAdmin = false,
  variant = 'default',
}: LoungeDiscussionPanelProps) {
  const isSlayTip = variant === 'slay-tip';
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<LoungeDiscussionComment[]>([]);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { comments: rows } = await fetchDiscussionComments(
        contentKey.contentType,
        contentKey.contentId
      );
      setComments(rows);
      onCommentCountChange?.(rows.length);
    } catch {
      setError('Could not load discussion.');
    } finally {
      setLoading(false);
    }
  }, [contentKey.contentId, contentKey.contentType, onCommentCountChange]);

  useEffect(() => {
    if (!open) return;
    trackLoungeEngagementEvent('lounge_discussion_opened', {
      contentType: contentKey.contentType,
      contentId: contentKey.contentId,
      contentTitle,
    });
    void load();
  }, [open, load, contentKey, contentTitle]);

  const { topLevel, repliesByParent } = useMemo(() => {
    const top: LoungeDiscussionComment[] = [];
    const replies = new Map<string, LoungeDiscussionComment[]>();
    for (const c of comments) {
      if (!c.parentId) {
        top.push(c);
      } else {
        const list = replies.get(c.parentId) ?? [];
        list.push(c);
        replies.set(c.parentId, list);
      }
    }
    return { topLevel: top, repliesByParent: replies };
  }, [comments]);

  const submit = useCallback(async () => {
    const body = draft.trim();
    if (!body) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await postDiscussionComment({
        contentType: contentKey.contentType,
        contentId: contentKey.contentId,
        body,
        parentId: replyTo,
      });
      setComments((prev) => [...prev, created]);
      setDraft('');
      setReplyTo(null);
      onCommentCountChange?.(comments.length + 1);
      trackLoungeEngagementEvent(replyTo ? 'lounge_comment_replied' : 'lounge_comment_created', {
        contentType: contentKey.contentType,
        contentId: contentKey.contentId,
        contentTitle,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'auth_required') onRequireAuth();
      else if (msg === 'rate_limited') setError('Please wait a moment before posting again.');
      else setError('Could not post. Try again.');
    } finally {
      setSubmitting(false);
    }
  }, [comments.length, contentKey, contentTitle, draft, onCommentCountChange, onRequireAuth, replyTo]);

  const removeComment = useCallback(
    async (commentId: string) => {
      try {
        await postCommentAction({ commentId, action: 'delete' });
        setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
        await load();
      } catch {
        setError('Could not remove comment.');
      }
    },
    [load]
  );

  const pinComment = useCallback(
    async (commentId: string, pin: boolean) => {
      if (!isAdmin) return;
      try {
        await postCommentAction({ commentId, action: pin ? 'pin' : 'unpin' });
        await load();
      } catch {
        setError('Could not update pin.');
      }
    },
    [isAdmin, load]
  );

  if (!open) return null;

  const renderComment = (c: LoungeDiscussionComment, isReply = false) => (
    <article
      key={c.id}
      style={{
        padding: loungeTvGlassCqw(0.7, 1.6, 3.2),
        borderLeft: isReply ? `1px solid rgba(255,255,255,0.12)` : undefined,
        marginLeft: isReply ? loungeTvGlassCqw(1.2, 2.8, 5.5) : 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: loungeTvGlassCqw(0.5, 1.1, 2.2), flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1, 2.3, 4.6),
            color: LOUNGE_TV_TEXT_WHITE,
          }}
        >
          {c.authorName}
        </span>
        {c.isOfficial ? (
          <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(0.9, 2, 4), color: LOUNGE_TV_BRAND_RED }}>
            PSA OFFICIAL
          </span>
        ) : null}
        {c.isPinned ? (
          <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(0.9, 2, 4), color: LOUNGE_TV_TEXT_GRAY }}>
            PINNED BY PSA
          </span>
        ) : null}
        <span style={{ fontFamily: LOUNGE_TV_FONT_BOOK, fontSize: loungeTvGlassCqw(0.9, 2, 4), color: LOUNGE_TV_TEXT_GRAY }}>
          {formatDiscussionTime(c.createdAt)}
        </span>
      </div>
      <p
        style={{
          margin: `${loungeTvGlassCqw(0.45, 1, 2)} 0 0`,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
          color: LOUNGE_TV_TEXT_GRAY,
          lineHeight: 1.45,
          textTransform: 'none',
        }}
      >
        {c.body}
      </p>
      <div style={{ display: 'flex', gap: loungeTvGlassCqw(0.8, 1.8, 3.6), marginTop: loungeTvGlassCqw(0.5, 1.1, 2.2) }}>
        {!isReply ? (
          <button
            type="button"
            style={discussionActionStyle}
            onClick={() => setReplyTo(c.id)}
          >
            REPLY
          </button>
        ) : null}
        {c.isOwn ? (
          <button type="button" style={discussionActionStyle} onClick={() => void removeComment(c.id)}>
            DELETE
          </button>
        ) : null}
        {isAdmin ? (
          <button
            type="button"
            style={discussionActionStyle}
            onClick={() => void pinComment(c.id, !c.isPinned)}
          >
            {c.isPinned ? 'UNPIN' : 'PIN'}
          </button>
        ) : null}
        {!c.isOwn ? (
          <button
            type="button"
            style={discussionActionStyle}
            onClick={() => void postCommentAction({ commentId: c.id, action: 'report' })}
          >
            REPORT
          </button>
        ) : null}
      </div>
      {(repliesByParent.get(c.id) ?? []).map((r) => renderComment(r, true))}
    </article>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${isSlayTip ? 'Comments' : 'Discussion'} for ${contentTitle}`}
      className={`lounge-tv-discussion-panel${isSlayTip ? ' lounge-tv-discussion-panel--slay-tip' : ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        background: isSlayTip ? '#000' : 'rgba(0,0,0,0.88)',
        backdropFilter: isSlayTip ? undefined : 'blur(6px)',
        WebkitBackdropFilter: isSlayTip ? undefined : 'blur(6px)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: loungeTvGlassCqw(0.9, 2, 4),
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.2, 2.8, 5.6),
            color: LOUNGE_TV_TEXT_WHITE,
            textTransform: 'uppercase',
          }}
        >
          {isSlayTip ? 'COMMENTS' : 'DISCUSSION'}
          {!loading && topLevel.length > 0 ? (
            <span style={{ marginLeft: loungeTvGlassCqw(0.6, 1.4, 2.8), color: LOUNGE_TV_TEXT_GRAY }}>
              {topLevel.length + [...repliesByParent.values()].reduce((n, r) => n + r.length, 0)}
            </span>
          ) : null}
        </span>
        <button type="button" onClick={onClose} style={discussionActionStyle} aria-label="Close discussion">
          CLOSE
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: loungeTvGlassCqw(0.9, 2, 4) }}>
        {loading ? (
          <p style={emptyCopyStyle}>LOADING…</p>
        ) : topLevel.length === 0 ? (
          <div style={{ ...emptyCopyStyle, lineHeight: 1.55 }}>
            <p style={{ margin: 0, color: LOUNGE_TV_TEXT_WHITE }}>
              {isSlayTip ? 'START THE CONVERSATION.' : 'NO QUESTIONS YET.'}
            </p>
            <p style={{ margin: `${loungeTvGlassCqw(0.5, 1.1, 2.2)} 0 0`, fontFamily: LOUNGE_TV_FONT_BOOK, textTransform: 'none' }}>
              {isSlayTip
                ? 'Be the first to leave a note on this Slay Tip.'
                : 'Be the first to start the discussion.'}
            </p>
          </div>
        ) : (
          topLevel.map((c) => renderComment(c))
        )}
        {error ? (
          <div style={{ marginTop: loungeTvGlassCqw(0.8, 1.8, 3.6) }}>
            <p style={{ ...emptyCopyStyle, color: LOUNGE_TV_BRAND_RED }}>{error}</p>
            <button type="button" style={discussionActionStyle} onClick={() => void load()}>
              RETRY
            </button>
          </div>
        ) : null}
      </div>

      <footer
        style={{
          padding: loungeTvGlassCqw(0.9, 2, 4),
          borderTop: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: loungeTvGlassCqw(0.5, 1.1, 2.2),
        }}
      >
        {replyTo ? (
          <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(0.95, 2.2, 4.4), color: LOUNGE_TV_TEXT_GRAY }}>
            REPLYING — <button type="button" style={discussionActionStyle} onClick={() => setReplyTo(null)}>CANCEL</button>
          </span>
        ) : null}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
          placeholder={isSlayTip ? 'ADD A COMMENT…' : 'ASK A QUESTION OR JOIN THE DISCUSSION…'}
          rows={2}
          data-lounge-tv-focusable
          className="lounge-tv-discussion-panel__composer"
          style={{
            width: '100%',
            resize: 'none',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: LOUNGE_TV_TEXT_WHITE,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: '16px',
            padding: loungeTvGlassCqw(0.6, 1.4, 2.8),
            textTransform: 'none',
          }}
        />
        <button
          type="button"
          disabled={submitting || !draft.trim()}
          onClick={() => void submit()}
          style={{
            alignSelf: 'flex-start',
            border: 'none',
            background: LOUNGE_TV_BRAND_RED,
            color: LOUNGE_TV_TEXT_WHITE,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1, 2.3, 4.6),
            padding: `${loungeTvGlassCqw(0.5, 1.1, 2.2)} ${loungeTvGlassCqw(1, 2.2, 4.4)}`,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting || !draft.trim() ? 0.6 : 1,
          }}
        >
          POST
        </button>
      </footer>
    </div>
  );
}

const discussionActionStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: LOUNGE_TV_TEXT_GRAY,
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(0.95, 2.2, 4.4),
  cursor: 'pointer',
  padding: 0,
  textTransform: 'uppercase',
};

const emptyCopyStyle: CSSProperties = {
  margin: 0,
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
  color: LOUNGE_TV_TEXT_GRAY,
  lineHeight: 1.5,
  textTransform: 'uppercase',
};
