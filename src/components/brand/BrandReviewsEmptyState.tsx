import type { CSSProperties } from 'react';
import { BRAND_REVIEWS_BLOCKS, type BrandReviewsBlockVariant } from '../../constants/brandReviewsCopy';
import { BRAND_REVIEWS_HERO_IMAGE_SRC } from '../../constants/brandReviewsAssets';
import PageHeroImage from '../PageHeroImage';

const BODY_FONT_SIZE_PX = 10;
const BRAND_GRAY = '#808080';

function blockStyle(variant: BrandReviewsBlockVariant): CSSProperties {
  const base: CSSProperties = {
    margin: 0,
    lineHeight: 1.45,
    textTransform: 'uppercase',
  };

  if (variant === 'accent') {
    return {
      ...base,
      fontFamily: '"Futura PT Medium"',
      fontSize: `${BODY_FONT_SIZE_PX}px`,
      color: '#EB1C24',
      fontWeight: 500,
    };
  }

  if (variant === 'demiGray') {
    return {
      ...base,
      fontFamily: '"Futura PT Demi"',
      fontSize: `${BODY_FONT_SIZE_PX}px`,
      color: BRAND_GRAY,
      fontWeight: 500,
    };
  }

  if (variant === 'mediumGray') {
    return {
      ...base,
      fontFamily: '"Futura PT Medium"',
      fontSize: `${BODY_FONT_SIZE_PX}px`,
      color: BRAND_GRAY,
      fontWeight: 500,
    };
  }

  if (variant === 'bohemy') {
    return {
      margin: 0,
      lineHeight: 1.45,
      textTransform: 'none',
      fontFamily: '"Bohemy", cursive',
      fontSize: '21px',
      color: BRAND_GRAY,
      fontWeight: 400,
    };
  }

  return {
    ...base,
    fontFamily: '"Futura PT Book"',
    fontSize: `${BODY_FONT_SIZE_PX}px`,
    color: '#000000',
  };
}

/** Empty state body for `/brand/reviews` — matches About / Member brand typography. */
export default function BrandReviewsEmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left',
      }}
    >
      <PageHeroImage src={BRAND_REVIEWS_HERO_IMAGE_SRC} />
      {BRAND_REVIEWS_BLOCKS.map((block) => (
        <p key={block.id} style={blockStyle(block.variant)}>
          {block.text}
        </p>
      ))}
    </div>
  );
}
