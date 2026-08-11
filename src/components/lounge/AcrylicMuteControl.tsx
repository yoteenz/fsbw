import type { ButtonHTMLAttributes, CSSProperties, MouseEvent } from 'react';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { AcrylicMuteGlyph } from './AcrylicMuteGlyph';

export type AcrylicMuteControlProps = {
  muted?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  glyphSize?: string;
  hitSize?: string;
  className?: string;
  style?: CSSProperties;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-pressed' | 'onClick' | 'style' | 'className' | 'type'>;

/** Compact acrylic speaker mute / unmute — static crystal (matches bookmark control). */
export function AcrylicMuteControl({
  muted = true,
  onClick,
  ariaLabel,
  glyphSize = loungeTvGlassCqw(1.2, 2.75, 5.5),
  hitSize = loungeTvGlassCqw(1.6, 3.75, 7.5),
  className = '',
  style,
  ...rest
}: AcrylicMuteControlProps) {
  const label = ariaLabel ?? (muted ? 'Unmute' : 'Mute');

  return (
    <button
      type="button"
      {...rest}
      className={['acrylic-media-control', 'acrylic-media-control--volume', className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-pressed={muted}
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
      <AcrylicMuteGlyph muted={muted} className="acrylic-media-control__glyph" />
    </button>
  );
}
