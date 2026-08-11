import type { CSSProperties } from 'react';
import { LOUNGE_TV_PAUSE_ICON_SRC, LOUNGE_TV_PLAY_ICON_SRC } from './loungeTvAssets';

export type AcrylicGlyphMode = 'play' | 'pause';

type Props = {
  mode: AcrylicGlyphMode;
  className?: string;
  style?: CSSProperties;
};

/** Shipped clear-acrylic Play / Pause PNGs. */
export function AcrylicMediaPlayPauseGlyph({ mode, className, style }: Props) {
  const src = mode === 'pause' ? LOUNGE_TV_PAUSE_ICON_SRC : LOUNGE_TV_PLAY_ICON_SRC;

  return (
    <img
      className={[className, 'acrylic-glyph-image'].filter(Boolean).join(' ')}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
      src={src}
      alt=""
      draggable={false}
      aria-hidden
    />
  );
}
