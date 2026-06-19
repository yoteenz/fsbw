import type { CSSProperties } from 'react';
import { BRAND_MEMBER_BLOCKS } from '../../constants/brandMemberCopy';
import { BRAND_MEMBER_HERO_IMAGE_SRC } from '../../constants/brandMemberAssets';
import PageHeroImage from '../PageHeroImage';
import PremiumRewardsMarketingList from '../membership/PremiumRewardsMarketingList';

const BODY_FONT_SIZE_PX = 10;
const BRAND_GRAY = '#808080';

function blockStyle(variant: 'body' | 'accent' | 'demiGray' | 'bohemy' | 'bohemyAccent'): CSSProperties {
  const base: CSSProperties = {
    margin: 0,
    lineHeight: 1.45,
    textTransform: 'uppercase',
  };

  if (variant === 'bohemy') {
    return {
      margin: 0,
      lineHeight: 1.45,
      textTransform: 'none',
      fontFamily: '"Bohemy", cursive',
      fontSize: '17px',
      color: BRAND_GRAY,
      fontWeight: 400,
    };
  }

  if (variant === 'bohemyAccent') {
    return {
      margin: 0,
      lineHeight: 1.45,
      textTransform: 'none',
      fontFamily: '"Bohemy", cursive',
      fontSize: '21px',
      color: '#EB1C24',
      fontWeight: 400,
    };
  }

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

  return {
    ...base,
    fontFamily: '"Futura PT Book"',
    fontSize: `${BODY_FONT_SIZE_PX}px`,
    color: '#000000',
  };
}

/** Become a Member marketing copy + premium perks list on `/brand/member`. */
export default function BrandMemberSection() {
  const bodyBlocks = BRAND_MEMBER_BLOCKS;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left',
      }}
    >
      <PageHeroImage src={BRAND_MEMBER_HERO_IMAGE_SRC} />
      {bodyBlocks.map((block) => {
        const variant =
          block.variant === 'bohemy'
            ? 'bohemy'
            : block.variant === 'accent'
              ? 'accent'
              : block.variant === 'demiGray'
                ? 'demiGray'
                : block.variant === 'bohemyAccent'
                  ? 'bohemyAccent'
                  : 'body';
        return (
          <p
            key={block.id}
            style={{
              ...blockStyle(variant),
              ...(block.id === 'invite' ? { marginBottom: '6px' } : {}),
            }}
          >
            {block.text}
          </p>
        );
      })}
      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          marginTop: '4px',
        }}
      >
        <PremiumRewardsMarketingList heading="PREMIUM MEMBER PERKS" />
      </div>
    </div>
  );
}
