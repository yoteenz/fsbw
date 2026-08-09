import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { AcrylicMediaPlayPauseGlyph, type AcrylicGlyphMode } from './AcrylicMediaPlayPauseGlyph';

export type AcrylicMediaPlayPauseControlProps = {
  /** true = video paused (shows animated pause bars); false = playing (calm play glyph on hover). */
  paused: boolean;
  /** Override play/pause shape (e.g. hero always shows pause bars). */
  glyphMode?: AcrylicGlyphMode;
  /** Keep glyph visible while playing — required on touch (no hover). */
  alwaysVisible?: boolean;
  onToggle?: () => void;
  ariaLabel?: string;
  /** When true, control is visual-only (parent handles tap). */
  decorative?: boolean;
  /** Override responsive glyph size (CSS length). */
  glyphSize?: string;
  /** Override hit target size (CSS length). */
  hitSize?: string;
  className?: string;
  style?: CSSProperties;
};

function AcrylicControlShell({
  paused,
  alwaysVisible,
  decorative,
  className,
  style,
  onClick,
  ariaLabel,
  shellRef,
  children,
}: {
  paused: boolean;
  alwaysVisible: boolean;
  decorative: boolean;
  className: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel: string;
  shellRef: RefObject<HTMLDivElement | HTMLButtonElement | null>;
  children: ReactNode;
}) {
  const shellClass = [
    'acrylic-media-control',
    paused ? 'acrylic-media-control--paused' : 'acrylic-media-control--playing',
    alwaysVisible ? 'acrylic-media-control--always-visible' : '',
    decorative ? 'acrylic-media-control--decorative' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (decorative) {
    return (
      <div ref={shellRef as RefObject<HTMLDivElement>} className={shellClass} style={style} aria-hidden>
        {children}
      </div>
    );
  }

  return (
    <button
      ref={shellRef as RefObject<HTMLButtonElement>}
      type="button"
      className={shellClass}
      aria-label={ariaLabel}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

/**
 * Sculptural clear-acrylic Play / Pause — reusable Frontal Slayer media control language.
 * Paused state: icicle-in-sunlight optical animation. Playing state: quiet static acrylic.
 */
export function AcrylicMediaPlayPauseControl({
  paused,
  glyphMode,
  alwaysVisible = false,
  onToggle,
  ariaLabel,
  decorative = false,
  glyphSize: glyphSizeProp,
  hitSize: hitSizeProp,
  className = '',
  style,
}: AcrylicMediaPlayPauseControlProps) {
  const shellRef = useRef<HTMLDivElement | HTMLButtonElement>(null);
  const glyphSize = glyphSizeProp ?? loungeTvGlassCqw(2.8, 6.5, 13);
  const hitSize = hitSizeProp ?? loungeTvGlassCqw(5.5, 12, 24);

  useEffect(() => {
    const el = shellRef.current;
    if (!el || !paused) return;
    el.classList.remove('acrylic-media-control--settling');
    void el.offsetWidth;
    el.classList.add('acrylic-media-control--settling');
    const t = window.setTimeout(() => el.classList.remove('acrylic-media-control--settling'), 420);
    return () => window.clearTimeout(t);
  }, [paused]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggle?.();
  };

  const label = ariaLabel ?? (paused ? 'Resume video' : 'Pause video');

  const cssVars = {
    '--acrylic-glyph-size': glyphSize,
    '--acrylic-hit-size': hitSize,
    ...style,
  } as CSSProperties;

  const resolvedGlyphMode = glyphMode ?? (paused ? 'pause' : 'play');

  const inner = (
    <>
      <span className="acrylic-media-control__hit" aria-hidden />
      <AcrylicMediaPlayPauseGlyph mode={resolvedGlyphMode} className="acrylic-media-control__glyph" />
    </>
  );

  return (
    <AcrylicControlShell
      paused={paused}
      alwaysVisible={alwaysVisible}
      decorative={decorative}
      className={className}
      style={cssVars}
      onClick={handleClick}
      ariaLabel={label}
      shellRef={shellRef}
    >
      {inner}
    </AcrylicControlShell>
  );
}
