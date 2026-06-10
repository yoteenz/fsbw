import type { CSSProperties, ImgHTMLAttributes } from 'react';
import {
  bcfThumbContainImgStyle,
  bcfThumbGridContainSlotStyle,
  bcfThumbMarbleStripContainSlotStyle,
  shopTextureCategoryThumbFallbackSrc,
  shopTextureCategoryThumbLegacySrc,
  shopTextureCategoryThumbSrc,
  type ShopTextureCategoryThumbCategory,
  type ShopTextureCategoryThumbTexture
} from '../../utils/shopTextureCategoryThumb';

export type BcfShopThumbVariant = 'grid' | 'marbleStrip';

type BcfShopThumbProps = {
  texture: ShopTextureCategoryThumbTexture;
  category: ShopTextureCategoryThumbCategory;
  variant: BcfShopThumbVariant;
  src?: string;
  alt?: string;
  onClick?: ImgHTMLAttributes<HTMLImageElement>['onClick'];
  imgStyle?: CSSProperties;
  className?: string;
};

/** BCF marble thumb with fixed contain slot (grid + similar strip). */
export function BcfShopThumb({
  texture,
  category,
  variant,
  src,
  alt = '',
  onClick,
  imgStyle,
  className
}: BcfShopThumbProps) {
  const resolvedSrc = src ?? shopTextureCategoryThumbSrc(texture, category);
  const slotStyle =
    variant === 'grid'
      ? bcfThumbGridContainSlotStyle(texture, category)
      : bcfThumbMarbleStripContainSlotStyle();

  return (
    <div style={slotStyle}>
      <img
        src={resolvedSrc}
        alt={alt}
        onClick={onClick}
        className={className}
        onError={(e) => {
          const img = e.currentTarget;
          const step = img.getAttribute('data-fallback-step') ?? '0';
          if (step === '0') {
            img.setAttribute('data-fallback-step', '1');
            img.src = shopTextureCategoryThumbLegacySrc(texture, category);
            return;
          }
          if (step === '1') {
            img.setAttribute('data-fallback-step', '2');
            img.src = shopTextureCategoryThumbFallbackSrc[texture];
          }
        }}
        style={{ ...bcfThumbContainImgStyle, ...imgStyle }}
      />
    </div>
  );
}
