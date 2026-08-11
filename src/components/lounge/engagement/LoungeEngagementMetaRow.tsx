import type { CSSProperties, MouseEvent, PointerEvent } from 'react';
import { formatEngagementCount, shouldHideCompactEngagementRow } from '../../../utils/formatEngagementCount';
import type { LoungeEngagementSummary } from '../../../utils/loungeEngagementTypes';
import { LOUNGE_TV_FONT_MEDIUM } from '../loungeTvTheme';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_ENGAGEMENT_COUNT_COLOR, LoungeEngagementIcon } from './LoungeEngagementIcons';

type LoungeEngagementMetaRowProps = {
  summary?: LoungeEngagementSummary;
  contentTitle: string;
  compact?: boolean;
  onHelpfulClick?: (e: MouseEvent) => void;
  onCommentsClick?: (e: MouseEvent) => void;
  helpfulActive?: boolean;
  helpfulPending?: boolean;
};

export function LoungeEngagementMetaRow({
  summary,
  contentTitle,
  compact = true,
  onHelpfulClick,
  onCommentsClick,
  helpfulActive = false,
  helpfulPending = false,
}: LoungeEngagementMetaRowProps) {
  const helpful = summary?.helpfulCount ?? 0;
  const views = summary?.qualifiedViewCount ?? 0;
  const comments = summary?.commentCount ?? 0;

  if (compact && shouldHideCompactEngagementRow({ helpful, views, comments })) {
    return null;
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: loungeTvGlassCqw(1, 2.2, 4.4),
    marginTop: loungeTvGlassCqw(0.35, 0.8, 1.6),
  };

  const itemStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: loungeTvGlassCqw(0.35, 0.75, 1.5),
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
    lineHeight: 1,
    color: LOUNGE_ENGAGEMENT_COUNT_COLOR,
    textTransform: 'uppercase',
  };

  const hitStyle: CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: loungeTvGlassCqw(0.35, 0.75, 1.5),
    margin: loungeTvGlassCqw(-0.35, -0.75, -1.5),
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: loungeTvGlassCqw(0.35, 0.75, 1.5),
  };

  const stopPointer = (e: PointerEvent) => {
    e.stopPropagation();
  };

  const stopClick =
    (fn: (e: MouseEvent) => void) =>
    (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      fn(e);
    };

  return (
    <span style={rowStyle} data-lounge-engagement-meta>
      {helpful > 0 || onHelpfulClick ? (
        onHelpfulClick ? (
          <button
            type="button"
            style={hitStyle}
            disabled={helpfulPending}
            aria-pressed={helpfulActive}
            aria-label={
              helpfulActive
                ? `Remove helpful reaction from ${contentTitle}`
                : `Mark ${contentTitle} as helpful`
            }
            onPointerDown={stopPointer}
            onPointerUp={stopPointer}
            onClick={stopClick(onHelpfulClick)}
          >
            <LoungeEngagementIcon kind="helpful" state={helpfulActive ? 'active' : 'inactive'} />
            {helpful > 0 ? <span>{formatEngagementCount(helpful)}</span> : null}
          </button>
        ) : (
          <span style={itemStyle} aria-hidden>
            <LoungeEngagementIcon kind="helpful" />
            {helpful > 0 ? <span>{formatEngagementCount(helpful)}</span> : null}
          </span>
        )
      ) : null}

      {views > 0 ? (
        <span style={itemStyle} aria-label={`${formatEngagementCount(views)} views for ${contentTitle}`}>
          <LoungeEngagementIcon kind="view" />
          <span>{formatEngagementCount(views)}</span>
        </span>
      ) : null}

      {comments > 0 || onCommentsClick ? (
        onCommentsClick ? (
          <button
            type="button"
            style={hitStyle}
            aria-label={`Open ${formatEngagementCount(comments)} comments for ${contentTitle}`}
            onPointerDown={stopPointer}
            onPointerUp={stopPointer}
            onClick={stopClick(onCommentsClick)}
          >
            <LoungeEngagementIcon kind="comment" />
            {comments > 0 ? <span>{formatEngagementCount(comments)}</span> : null}
          </button>
        ) : (
          <span style={itemStyle} aria-hidden>
            <LoungeEngagementIcon kind="comment" />
            {comments > 0 ? <span>{formatEngagementCount(comments)}</span> : null}
          </span>
        )
      ) : null}
    </span>
  );
}
