import type { CSSProperties } from 'react';
import { BRAND_MEMBER_BLOCKS } from '../../constants/brandMemberCopy';

const BODY_FONT_SIZE_PX = 10;
const BRAND_GRAY = '#808080';

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

/** Become a Member marketing copy only — no included-benefits or unlock-rewards blocks on `/brand/member`. */
export default function BrandMemberSection() {
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
    </div>
  );
}
