/** Product PDP — REVIEWS tab placeholder (matches DETAILS/SHIPPING tab typography + rose markers). */

import {
  NOIR_PRODUCT_TAB_ROSE_ALERT_BADGE_STYLE,
  NOIR_PRODUCT_TAB_ROSE_ALERT_SRC,
} from './noirProductTabRoseBadge';

const BODY_STYLE = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000000',
  fontWeight: 400,
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase' as const,
};

const SECTION_TITLE_STYLE = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '20px',
  color: '#808080',
  fontWeight: 400,
  margin: '12px 0 8px 0',
  textTransform: 'lowercase' as const,
};

const COMING_SOON_FEATURES = [
  'VERIFIED REVIEWS',
  'CLIENT PHOTOS',
  'VIDEO REVEALS',
  'STYLING TIPS',
  'BEFORE + AFTERS',
] as const;

export default function ProductReviewsComingSoonTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ ...BODY_STYLE, marginBottom: '4px' }}>REAL CLIENT EXPERIENCES COMING SOON!</p>

      <p style={BODY_STYLE}>
        THE FIRST FRONTAL SLAYER TRANSFORMATIONS WILL BE SHOWCASED HERE.
      </p>

      <p style={SECTION_TITLE_STYLE}>this space will soon feature:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {COMING_SOON_FEATURES.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <img src={NOIR_PRODUCT_TAB_ROSE_ALERT_SRC} alt="" style={NOIR_PRODUCT_TAB_ROSE_ALERT_BADGE_STYLE} />
            <p style={BODY_STYLE}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
