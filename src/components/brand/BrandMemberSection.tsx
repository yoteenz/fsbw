import type { CSSProperties } from 'react';
import { BRAND_MEMBER_BLOCKS } from '../../constants/brandMemberCopy';
import { BRAND_UNLOCK_PREMIUM_REWARD_ITEMS } from '../../constants/brandMemberPremiumRewards';

const BODY_FONT_SIZE_PX = 10;
const SCRIPT_HEADLINE_FONT_SIZE_PX = BODY_FONT_SIZE_PX + 6;
const COVERED_BY_YOUR_GRACE =
  '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif';
const BRAND_GRAY = '#808080';

const scriptHeadlineStyle: CSSProperties = {
  margin: 0,
  lineHeight: 1.35,
  textTransform: 'uppercase',
  fontFamily: COVERED_BY_YOUR_GRACE,
  fontSize: `${SCRIPT_HEADLINE_FONT_SIZE_PX}px`,
  color: BRAND_GRAY,
};

function blockStyle(variant: 'body' | 'accent' | 'demiGray' | 'bohemy'): CSSProperties {
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
      fontSize: '16px',
      color: BRAND_GRAY,
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

type BrandMemberSectionProps = {
  /** When false, hide UNLOCK PREMIUM REWARDS (e.g. user already has premium). */
  showUnlockPremiumRewards?: boolean;
};

function UnlockPremiumRewardsSection() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'center',
      }}
    >
      <p style={scriptHeadlineStyle}>UNLOCK PREMIUM REWARDS</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {BRAND_UNLOCK_PREMIUM_REWARD_ITEMS.map((item) => (
          <div key={item.id}>
            <p
              style={{
                fontFamily: COVERED_BY_YOUR_GRACE,
                fontSize: '14px',
                color: '#000000',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                lineHeight: 1.35,
              }}
            >
              {item.title}
            </p>
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontWeight: 500,
                fontSize: '10px',
                color: BRAND_GRAY,
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 1.45,
              }}
            >
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandMemberSection({
  showUnlockPremiumRewards = true,
}: BrandMemberSectionProps) {
  const bodyBlocks = BRAND_MEMBER_BLOCKS.filter((block) => block.id !== 'headline');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'center',
      }}
    >
      {(() => {
        const headlineBlock = BRAND_MEMBER_BLOCKS.find((block) => block.id === 'headline');
        return headlineBlock ? (
          <p style={blockStyle('bohemy')}>{headlineBlock.text}</p>
        ) : null;
      })()}

      {bodyBlocks.map((block) => {
        const variant =
          block.variant === 'bohemy'
            ? 'bohemy'
            : block.variant === 'accent'
              ? 'accent'
              : block.variant === 'demiGray'
                ? 'demiGray'
                : 'body';
        return (
          <p
            key={block.id}
            style={{
              ...blockStyle(variant),
              ...(block.id === 'invite' ? { marginBottom: '12px' } : {}),
            }}
          >
            {block.text}
          </p>
        );
      })}

      {showUnlockPremiumRewards ? <UnlockPremiumRewardsSection /> : null}
    </div>
  );
}
