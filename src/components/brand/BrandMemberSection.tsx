import type { CSSProperties } from 'react';
import { BRAND_MEMBER_BLOCKS } from '../../constants/brandMemberCopy';

const BODY_FONT_SIZE_PX = 10;
const HEADLINE_FONT_SIZE_PX = BODY_FONT_SIZE_PX + 8;

function blockStyle(variant: 'headline' | 'body' | 'accent'): CSSProperties {
  const base: CSSProperties = {
    margin: 0,
    lineHeight: 1.45,
    textTransform: 'uppercase',
  };

  if (variant === 'headline') {
    return {
      ...base,
      fontFamily: '"Futura PT Medium"',
      fontSize: `${HEADLINE_FONT_SIZE_PX}px`,
      color: '#808080',
      fontWeight: 500,
    };
  }

  if (variant === 'accent') {
    return {
      ...base,
      fontFamily: '"Futura PT Book"',
      fontSize: `${BODY_FONT_SIZE_PX}px`,
      color: '#EB1C24',
    };
  }

  return {
    ...base,
    fontFamily: '"Futura PT Book"',
    fontSize: `${BODY_FONT_SIZE_PX}px`,
    color: '#000000',
  };
}

export default function BrandMemberSection() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'center',
      }}
    >
      {BRAND_MEMBER_BLOCKS.map((block) => (
        <p key={block.id} style={blockStyle(block.variant)}>
          {block.text}
        </p>
      ))}
    </div>
  );
}
