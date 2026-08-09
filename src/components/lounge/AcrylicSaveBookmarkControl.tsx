import type { CSSProperties, MouseEvent } from 'react';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { AcrylicBookmarkGlyph } from './AcrylicBookmarkGlyph';

export type AcrylicSaveBookmarkControlProps = {
  saved?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  /** Visual glyph size — default 10px (matches prior SaveIcon). */
  glyphSize?: string;
  hitSize?: string;
  className?: string;
  style?: CSSProperties;
};

/** Compact acrylic bookmark — static crystal (no pause-style animation). */
export function AcrylicSaveBookmarkControl({
  saved = false,
  onClick,
  ariaLabel,
  glyphSize = '13px',
  hitSize = loungeTvGlassCqw(3.5, 8, 16),
  className = '',
  style,
}: AcrylicSaveBookmarkControlProps) {
  const label = ariaLabel ?? (saved ? 'Remove from my list' : 'Save to my list');

  return (
    <button
      type="button"
      className={['acrylic-media-control', 'acrylic-media-control--bookmark', className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-pressed={saved}
      onClick={onClick}
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
