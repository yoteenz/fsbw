import type { CSSProperties, KeyboardEvent } from 'react';
import { getWishlistBcfThumbSrc, getWishlistUnitThumbImage } from '../../utils/wishlistListItemDetails';

const LEAF_BRICK_UNIT_IMG_STYLE: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 3,
  transform: 'translateX(-50%)',
  width: 'auto',
  height: '96%',
  maxWidth: '106%',
  objectFit: 'contain',
  objectPosition: 'bottom',
  zIndex: 1,
};

const THUMB_BORDER_FRAME_STYLE: CSSProperties = {
  border: '1.3px solid #000',
  overflow: 'hidden',
  boxSizing: 'border-box',
};

const LEAF_BRICK_FRAME_STYLE: CSSProperties = {
  backgroundImage: "url('/assets/leaf-brick-resize.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  ...THUMB_BORDER_FRAME_STYLE,
  boxShadow: 'inset 0 0 0 3px #fff',
};

type WishlistItemThumbProps = {
  item: any;
  widthPx: number;
  heightPx: number;
  onActivate: () => void;
  /** Overview list thumbs use a 3px inset ring; expanded line/grid use the same. */
  frameInsetPx?: number;
};

export function WishlistItemThumb({
  item,
  widthPx,
  heightPx,
  onActivate,
  frameInsetPx = 3,
}: WishlistItemThumbProps) {
  const bcfThumb = getWishlistBcfThumbSrc(item);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') onActivate();
  };

  if (bcfThumb) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onActivate}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-center cursor-pointer"
        style={{
          width: widthPx,
          height: heightPx,
          ...THUMB_BORDER_FRAME_STYLE,
          boxShadow: `inset 0 0 0 ${frameInsetPx}px #fff`,
        }}
      >
        <img
          src={bcfThumb}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
      style={{
        width: widthPx,
        height: heightPx,
        ...LEAF_BRICK_FRAME_STYLE,
        boxShadow: `inset 0 0 0 ${frameInsetPx}px #fff`,
      }}
    >
      <img src={getWishlistUnitThumbImage(item)} alt="" style={LEAF_BRICK_UNIT_IMG_STYLE} />
    </div>
  );
}
