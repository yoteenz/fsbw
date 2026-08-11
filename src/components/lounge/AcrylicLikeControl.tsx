import type { CSSProperties, MouseEvent, PointerEvent } from 'react';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LoungeEngagementIcon } from './engagement/LoungeEngagementIcons';

export type AcrylicLikeControlProps = {
  liked?: boolean;
  pending?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  glyphSize?: string;
  hitSize?: string;
  className?: string;
  style?: CSSProperties;
  'data-lounge-tv-focusable'?: boolean;
};

/** Compact acrylic heart — like/helpful toggle for Learn browse cards. */
export function AcrylicLikeControl({
  liked = false,
  pending = false,
  onClick,
  onPointerDown,
  onPointerUp,
  ariaLabel,
  glyphSize = '13px',
  hitSize = loungeTvGlassCqw(3.5, 8, 16),
  className = '',
  style,
  'data-lounge-tv-focusable': focusable,
}: AcrylicLikeControlProps) {
  const label = ariaLabel ?? (liked ? 'Unlike' : 'Like');

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPointerDown?.(e);
  };

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPointerUp?.(e);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <button
      type="button"
      {...(focusable ? { 'data-lounge-tv-focusable': true } : {})}
      className={[
        'acrylic-media-control',
        'acrylic-media-control--like',
        liked ? 'acrylic-media-control--like-active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      aria-pressed={liked}
      disabled={pending}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      style={
        {
          '--acrylic-glyph-size': glyphSize,
          '--acrylic-hit-size': hitSize,
          ...style,
        } as CSSProperties
      }
    >
      <span className="acrylic-media-control__hit" aria-hidden />
      <span className="acrylic-media-control__glyph acrylic-media-control__glyph--like">
        <LoungeEngagementIcon
          kind="helpful"
          state={liked ? 'active' : 'inactive'}
          size="100%"
        />
      </span>
    </button>
  );
}
