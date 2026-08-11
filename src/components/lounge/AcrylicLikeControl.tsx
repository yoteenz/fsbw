import type { CSSProperties, MouseEvent, PointerEvent } from 'react';
import { AcrylicHeartGlyph } from './AcrylicHeartGlyph';
import { LEARN_ACRYLIC_GLYPH_SIZE, LEARN_ACRYLIC_HIT_SIZE } from './learnAcrylicGlyphSizes';

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
  glyphSize = LEARN_ACRYLIC_GLYPH_SIZE,
  hitSize = LEARN_ACRYLIC_HIT_SIZE,
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
      <AcrylicHeartGlyph liked={liked} className="acrylic-media-control__glyph acrylic-media-control__glyph--like" />
    </button>
  );
}
