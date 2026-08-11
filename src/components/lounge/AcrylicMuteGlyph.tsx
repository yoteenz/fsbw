import type { CSSProperties } from 'react';
import { LOUNGE_TV_MUTED_ICON_SRC, LOUNGE_TV_UNMUTED_ICON_SRC } from './loungeTvAssets';

type Props = {
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Shipped acrylic speaker PNGs — muted vs unmuted. */
export function AcrylicMuteGlyph({ muted = true, className, style }: Props) {
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
      src={muted ? LOUNGE_TV_MUTED_ICON_SRC : LOUNGE_TV_UNMUTED_ICON_SRC}
      alt=""
      draggable={false}
      aria-hidden
    />
  );
}
