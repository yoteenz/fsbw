import type { CSSProperties } from 'react';
import { LOUNGE_TV_HEART_ACTIVE_ICON_SRC, LOUNGE_TV_HEART_ICON_SRC } from './loungeTvAssets';

type Props = {
  liked?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Shipped acrylic heart PNGs — inactive vs liked/helpful. */
export function AcrylicHeartGlyph({ liked = false, className, style }: Props) {
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
      src={liked ? LOUNGE_TV_HEART_ACTIVE_ICON_SRC : LOUNGE_TV_HEART_ICON_SRC}
      alt=""
      draggable={false}
      aria-hidden
    />
  );
}
