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

function blockStyle(variant: 'body' | 'accent'): CSSProperties {
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

  return {
    ...base,
    fontFamily: '"Futura PT Book"',
    fontSize: `${BODY_FONT_SIZE_PX}px`,
    color: '#000000',
  };
}

type BrandMemberSectionProps = {
  /** When set, show INCLUDED IN YOUR MEMBERSHIP instead of unlock marketing list. */
  includedMembershipBenefits?: string[];
};

export default function BrandMemberSection({
  includedMembershipBenefits = [],
}: BrandMemberSectionProps) {
  const showIncludedMembership = includedMembershipBenefits.length > 0;
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
      <p style={scriptHeadlineStyle}>JOIN THE SLAY SOCIETY!</p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        {showIncludedMembership ? (
          <>
            <p
              style={{
                margin: 0,
                fontFamily: '"Futura PT Medium"',
                color: '#EB1C24',
                fontSize: '12px',
                textTransform: 'uppercase',
                fontWeight: 500,
                lineHeight: 1.35,
              }}
            >
              INCLUDED IN YOUR MEMBERSHIP
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              {includedMembershipBenefits.map((label) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    maxWidth: '100%',
                    textAlign: 'left',
                  }}
                >
                  <img
                    src="/assets/premium-check.svg"
                    alt=""
                    style={{ width: '8.4px', height: '8.4px', marginTop: '4px', flexShrink: 0 }}
                  />
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '10px',
                      color: '#000000',
                      margin: 0,
                      textTransform: 'uppercase',
                      lineHeight: 1.45,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {bodyBlocks.map((block) => (
        <p key={block.id} style={blockStyle(block.variant === 'accent' ? 'accent' : 'body')}>
          {block.text}
        </p>
      ))}
    </div>
  );
}
