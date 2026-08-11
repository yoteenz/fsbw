import type { CSSProperties } from 'react';
import { LOUNGE_TV_BOOKMARK_ICON_SRC, LOUNGE_TV_BOOKMARK_SAVED_ICON_SRC } from './loungeTvAssets';

type Props = {
  saved?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Shipped acrylic bookmark PNGs — unsaved vs saved. */
export function AcrylicBookmarkGlyph({ saved = false, className, style }: Props) {
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
      src={saved ? LOUNGE_TV_BOOKMARK_SAVED_ICON_SRC : LOUNGE_TV_BOOKMARK_ICON_SRC}
      alt=""
      draggable={false}
      aria-hidden
    />
  );
}
