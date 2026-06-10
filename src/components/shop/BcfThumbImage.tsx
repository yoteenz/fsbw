import type { CSSProperties, SyntheticEvent } from 'react';
import {
  bcfThumbCartContainSlotStyle,
  bcfThumbContainImgStyle,
  shopTextureCategoryThumbFallbackSrc,
  shopTextureCategoryThumbLegacySrc,
  shopTextureCategoryThumbSrc,
  type ShopTextureCategoryThumbCategory,
  type ShopTextureCategoryThumbTexture,
} from '../../utils/shopTextureCategoryThumb';

type BcfThumbImageCartProps = {
  texture: ShopTextureCategoryThumbTexture;
  category: ShopTextureCategoryThumbCategory;
  /** Override resolved thumb URL. */
  src?: string;
  alt?: string;
  className?: string;
  imgStyle?: CSSProperties;
  boxPx: number;
  /** Cart dropdown / bag BCF nudge — default 4px right. */
  nudgeX?: number;
};

function resolveThumbSrc(
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory,
  src?: string
): string {
  return src ?? shopTextureCategoryThumbSrc(texture, category);
}

function handleThumbError(
  e: SyntheticEvent<HTMLImageElement>,
  texture: ShopTextureCategoryThumbTexture,
  category: ShopTextureCategoryThumbCategory
) {
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
}

/** Cart / bag / checkout BCF thumb — fixed square slot with `object-fit: contain`. */
export function BcfThumbImage({
  texture,
  category,
  src: srcOverride,
  alt = '',
  className = '',
  imgStyle,
  boxPx,
  nudgeX = 4,
}: BcfThumbImageCartProps) {
  const thumbSrc = resolveThumbSrc(texture, category, srcOverride);

  const imgEl = (
    <div style={bcfThumbCartContainSlotStyle(boxPx)}>
      <img
        src={thumbSrc}
        alt={alt}
        className={`rounded ${className}`.trim()}
        onError={(e) => handleThumbError(e, texture, category)}
        style={{ ...bcfThumbContainImgStyle, ...imgStyle }}
      />
    </div>
  );

  return nudgeX ? <div style={{ transform: `translateX(${nudgeX}px)` }}>{imgEl}</div> : imgEl;
}
