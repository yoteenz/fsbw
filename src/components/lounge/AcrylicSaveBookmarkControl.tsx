import type { CSSProperties, MouseEvent, PointerEvent } from 'react';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { AcrylicBookmarkGlyph } from './AcrylicBookmarkGlyph';

export type AcrylicSaveBookmarkControlProps = {
  saved?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  /** Visual glyph size — default 10px (matches prior SaveIcon). */
  glyphSize?: string;
  hitSize?: string;
  className?: string;
  style?: CSSProperties;
  /** Lounge TV spatial focus ring target. */
  'data-lounge-tv-focusable'?: boolean;
};

/** Compact acrylic bookmark — static crystal (no pause-style animation). */
export function AcrylicSaveBookmarkControl({
  saved = false,
  onClick,
  onPointerDown,
  onPointerUp,
  ariaLabel,
  glyphSize = '13px',
  hitSize = loungeTvGlassCqw(3.5, 8, 16),
  className = '',
  style,
  'data-lounge-tv-focusable': focusable,
}: AcrylicSaveBookmarkControlProps) {
  const label = ariaLabel ?? (saved ? 'Remove from my list' : 'Save to my list');

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
        'acrylic-media-control--bookmark',
        saved ? 'acrylic-media-control--bookmark-saved' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      aria-pressed={saved}
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
      <AcrylicBookmarkGlyph saved={saved} className="acrylic-media-control__glyph" />
    </button>
  );
}
