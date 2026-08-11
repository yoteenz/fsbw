import type { MouseEvent } from 'react';
import { formatEngagementCount } from '../../../utils/formatEngagementCount';
import type { LoungeEngagementSummary } from '../../../utils/loungeEngagementTypes';
import { LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LoungeEngagementIcon } from './LoungeEngagementIcons';

type LoungeEngagementBarProps = {
  contentTitle: string;
  summary?: LoungeEngagementSummary;
  saved?: boolean;
  onHelpfulToggle: () => void;
  onCommentsOpen: () => void;
  onSaveToggle: () => void;
  helpfulActive?: boolean;
  helpfulPending?: boolean;
  /** Editorial slay-tip viewer — icon + count, save pinned right. */
  variant?: 'default' | 'editorial';
  helpfulLabel?: 'HELPFUL' | 'LIKE';
};

export function LoungeEngagementBar({
  contentTitle,
  summary,
  saved = false,
  onHelpfulToggle,
  onCommentsOpen,
  onSaveToggle,
  helpfulActive = false,
  helpfulPending = false,
  variant = 'default',
  helpfulLabel = 'HELPFUL',
}: LoungeEngagementBarProps) {
  const helpful = summary?.helpfulCount ?? 0;
  const views = summary?.qualifiedViewCount ?? 0;
  const comments = summary?.commentCount ?? 0;
  const editorial = variant === 'editorial';

  const stop = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fn();
  };

  if (editorial) {
    return (
      <div
        className="lounge-tv-engagement-bar lounge-tv-engagement-bar--editorial"
        data-lounge-engagement-bar
        role="group"
        aria-label={`Engagement for ${contentTitle}`}
      >
        <button
          type="button"
          className={`lounge-tv-engagement-bar__action${helpfulActive ? ' lounge-tv-engagement-bar__action--active' : ''}`}
          disabled={helpfulPending}
          aria-pressed={helpfulActive}
          aria-label={
            helpfulActive ? `Unlike ${contentTitle}` : `Like ${contentTitle}`
          }
          data-lounge-tv-focusable
          onClick={stop(onHelpfulToggle)}
        >
          <LoungeEngagementIcon
            kind="helpful"
            state={helpfulActive ? 'active' : 'inactive'}
            size={loungeTvGlassCqw(1.35, 3.1, 6.2)}
          />
          <span className="lounge-tv-engagement-bar__count">{formatEngagementCount(helpful)}</span>
        </button>

        <button
          type="button"
          className="lounge-tv-engagement-bar__action"
          aria-label={`Open ${formatEngagementCount(comments)} comments for ${contentTitle}`}
          data-lounge-tv-focusable
          onClick={stop(onCommentsOpen)}
        >
          <LoungeEngagementIcon kind="comment" size={loungeTvGlassCqw(1.35, 3.1, 6.2)} />
          <span className="lounge-tv-engagement-bar__count">{formatEngagementCount(comments)}</span>
        </button>

        <span
          className="lounge-tv-engagement-bar__stat"
          aria-label={`${formatEngagementCount(views)} views for ${contentTitle}`}
        >
          <LoungeEngagementIcon kind="view" size={loungeTvGlassCqw(1.35, 3.1, 6.2)} />
          <span className="lounge-tv-engagement-bar__count">{formatEngagementCount(views)}</span>
        </span>

        <button
          type="button"
          className={`lounge-tv-engagement-bar__action lounge-tv-engagement-bar__action--save${saved ? ' lounge-tv-engagement-bar__action--active' : ''}`}
          aria-label={saved ? `Remove ${contentTitle} from saved tips` : `Save ${contentTitle}`}
          data-lounge-tv-focusable
          onClick={stop(onSaveToggle)}
        >
          <LoungeEngagementIcon
            kind="bookmark"
            state={saved ? 'active' : 'inactive'}
            size={loungeTvGlassCqw(1.35, 3.1, 6.2)}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: loungeTvGlassCqw(1.2, 2.8, 5.5),
        marginTop: loungeTvGlassCqw(0.6, 1.4, 2.8),
        textTransform: 'uppercase',
      }}
      data-lounge-engagement-bar
    >
      <button
        type="button"
        disabled={helpfulPending}
        aria-pressed={helpfulActive}
        aria-label={
          helpfulActive
            ? `Remove ${helpfulLabel.toLowerCase()} from ${contentTitle}`
            : `${helpfulLabel} ${contentTitle}`
        }
        onClick={stop(onHelpfulToggle)}
        style={{
          border: 'none',
          background: 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: loungeTvGlassCqw(0.5, 1.1, 2.2),
          cursor: 'pointer',
          padding: loungeTvGlassCqw(0.4, 0.9, 1.8),
          color: LOUNGE_TV_TEXT_WHITE,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.1, 2.6, 5.2),
        }}
      >
        <LoungeEngagementIcon kind="helpful" state={helpfulActive ? 'active' : 'inactive'} size={loungeTvGlassCqw(1.4, 3.2, 6.4)} />
        <span>{helpfulLabel}</span>
        <span style={{ color: LOUNGE_TV_TEXT_GRAY }}>{formatEngagementCount(helpful)}</span>
      </button>

      <span
        aria-label={`${formatEngagementCount(views)} views`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: loungeTvGlassCqw(0.5, 1.1, 2.2),
          color: LOUNGE_TV_TEXT_GRAY,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.1, 2.6, 5.2),
        }}
      >
        <LoungeEngagementIcon kind="view" size={loungeTvGlassCqw(1.4, 3.2, 6.4)} />
        <span>{formatEngagementCount(views)} VIEWS</span>
      </span>

      <button
        type="button"
        aria-label={`Open ${formatEngagementCount(comments)} comments for ${contentTitle}`}
        onClick={stop(onCommentsOpen)}
        style={{
          border: 'none',
          background: 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: loungeTvGlassCqw(0.5, 1.1, 2.2),
          cursor: 'pointer',
          padding: loungeTvGlassCqw(0.4, 0.9, 1.8),
          color: LOUNGE_TV_TEXT_WHITE,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.1, 2.6, 5.2),
        }}
      >
        <LoungeEngagementIcon kind="comment" size={loungeTvGlassCqw(1.4, 3.2, 6.4)} />
        <span>COMMENTS</span>
        <span style={{ color: LOUNGE_TV_TEXT_GRAY }}>{formatEngagementCount(comments)}</span>
      </button>

      <button
        type="button"
        aria-label={saved ? `Remove ${contentTitle} from saved content` : `Save ${contentTitle}`}
        onClick={stop(onSaveToggle)}
        style={{
          border: 'none',
          background: 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: loungeTvGlassCqw(0.5, 1.1, 2.2),
          cursor: 'pointer',
          padding: loungeTvGlassCqw(0.4, 0.9, 1.8),
          color: LOUNGE_TV_TEXT_WHITE,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.1, 2.6, 5.2),
        }}
      >
        <LoungeEngagementIcon kind="bookmark" state={saved ? 'active' : 'inactive'} size={loungeTvGlassCqw(1.4, 3.2, 6.4)} />
        <span>SAVE</span>
      </button>
    </div>
  );
}
