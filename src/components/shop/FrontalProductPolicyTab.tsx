/** BCF frontals PDP — POLICY tab (matches NOIR tab typography + markers). */

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

/** Match `/brand/terms` bullet rows (`BrandTermsBody`). */
const BULLET_STYLE = {
  ...BODY_STYLE,
  paddingLeft: '12px',
};

const BULLET_MARK_STYLE = { color: '#EB1C24' };

const EMAIL_STYLE = {
  ...BODY_STYLE,
  color: '#EB1C24',
  fontFamily: '"Futura PT Medium"',
  fontWeight: 500,
};

const SECTION_TITLE_STYLE = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '20px',
  color: '#808080',
  fontWeight: 400,
  margin: '12px 0 8px 0',
  textTransform: 'lowercase' as const,
};

const ORDER_ISSUE_RECEIVE_BULLETS = [
  'AN INCORRECT ITEM',
  'A DEFECTIVE PRODUCT',
  'AN INCOMPLETE ORDER',
] as const;

const ORDER_ISSUE_PROVIDE_BULLETS = [
  'YOUR FULL NAME',
  'ORDER NUMBER',
  'CLEAR PHOTOS AND/OR VIDEOS OF THE ISSUE',
  'ORIGINAL PACKAGING (WHEN APPLICABLE)',
] as const;

const VERIFIED_ISSUE_RESOLUTIONS = [
  'CORRECT THE SHIPMENT',
  'REPLACE THE AFFECTED ITEM',
  'ISSUE STORE CREDIT',
  'OFFER A COMPARABLE REPLACEMENT',
] as const;

const PRODUCT_VARIATION_BULLETS = [
  'TEXTURE',
  'COLOR TONE',
  'DENSITY',
  'LACE APPEARANCE',
  'CURL OR WAVE PATTERN',
] as const;

export default function FrontalProductPolicyTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={BODY_STYLE}>
        DUE TO THE SANITARY NATURE OF HAIR PRODUCTS, PRODUCT CUSTOMIZATION OPTIONS AND LIMITED INVENTORY AVAILABILITY, ALL FRONTAL SALES ARE FINAL. WE ARE UNABLE TO OFFER REFUNDS, RETURNS OR EXCHANGES ONCE AN ORDER HAS BEEN PLACED AND CONFIRMED. WE ENCOURAGE CLIENTS TO CAREFULLY REVIEW ALL PRODUCT DETAILS, LACE OPTIONS, TEXTURE SELECTIONS, LENGTHS, PROCESSING TIMELINES AND POLICIES BEFORE COMPLETING THEIR PURCHASE.
      </p>

      <p style={SECTION_TITLE_STYLE}>order issues</p>
      <p style={BODY_STYLE}>IF YOU RECEIVE:</p>
      {ORDER_ISSUE_RECEIVE_BULLETS.map((bullet) => (
        <p key={bullet} style={BULLET_STYLE}>
          <span style={BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}
      <p style={BODY_STYLE}>
        PLEASE CONTACT US WITHIN 48 HOURS OF CONFIRMED DELIVERY AND PROVIDE:
      </p>
      {ORDER_ISSUE_PROVIDE_BULLETS.map((bullet) => (
        <p key={bullet} style={BULLET_STYLE}>
          <span style={BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}
      <p style={BODY_STYLE}>
        CLAIMS SUBMITTED OUTSIDE OF THIS TIMEFRAME MAY NOT QUALIFY FOR REVIEW.
      </p>

      <p style={SECTION_TITLE_STYLE}>if an issue is verified</p>
      <p style={BODY_STYLE}>
        IF AN ISSUE IS DETERMINED TO BE THE DIRECT RESULT OF OUR ERROR, WE RESERVE THE RIGHT TO:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {VERIFIED_ISSUE_RESOLUTIONS.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <img src={NOIR_PRODUCT_TAB_ROSE_ALERT_SRC} alt="" style={NOIR_PRODUCT_TAB_ROSE_ALERT_BADGE_STYLE} />
            <p style={BODY_STYLE}>{label}</p>
          </div>
        ))}
      </div>
      <p style={BODY_STYLE}>
        STORE CREDIT MAY BE ISSUED AT OUR DISCRETION WHEN A REPLACEMENT IS UNAVAILABLE.
      </p>

      <p style={SECTION_TITLE_STYLE}>product variations</p>
      <p style={BODY_STYLE}>
        BECAUSE OUR FRONTALS ARE CRAFTED USING AUTHENTIC RAW HUMAN HAIR, SLIGHT VARIATIONS MAY OCCUR IN:
      </p>
      {PRODUCT_VARIATION_BULLETS.map((bullet) => (
        <p key={bullet} style={BULLET_STYLE}>
          <span style={BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}
      <p style={BODY_STYLE}>
        THESE NATURAL CHARACTERISTICS ARE EXPECTED AND ARE NOT CONSIDERED DEFECTS. NO TWO FRONTALS ARE GUARANTEED TO BE IDENTICAL, WHICH CONTRIBUTES TO THE AUTHENTICITY AND UNIQUENESS OF EACH PIECE.
      </p>

      <p style={SECTION_TITLE_STYLE}>processing & communication</p>
      <p style={BODY_STYLE}>
        FINAL PROCESSING TIMELINES MAY VARY BASED ON INVENTORY AVAILABILITY, CUSTOMIZATION REQUESTS, ORDER VOLUME, HOLIDAYS AND PROMOTIONAL PERIODS. ORDER UPDATES, SHIPPING CONFIRMATIONS AND TRACKING INFORMATION WILL BE SENT TO THE EMAIL ADDRESS PROVIDED DURING CHECKOUT. CUSTOMERS ARE RESPONSIBLE FOR ENSURING ALL CONTACT AND SHIPPING INFORMATION IS ACCURATE BEFORE SUBMITTING THEIR ORDER.
      </p>

      <p style={SECTION_TITLE_STYLE}>agreement to terms</p>
      <p style={BODY_STYLE}>
        BY COMPLETING YOUR PURCHASE, YOU ACKNOWLEDGE THAT YOU HAVE REVIEWED AND AGREED TO OUR TERMS OF SERVICE, PROCESSING POLICY, REFUND POLICY AND ALL PRODUCT SPECIFIC POLICIES LISTED THROUGHOUT THE WEBSITE.
      </p>
      <p style={BODY_STYLE}>
        FOR PRODUCT QUESTIONS, ORDER ASSISTANCE, OR SUPPORT, PLEASE EMAIL{' '}
        <span style={EMAIL_STYLE}>CONTACT@FRONTALSLAYER.COM</span>
      </p>
      <p style={BODY_STYLE}>RESPONSE TIMES ARE TYPICALLY WITHIN 72 BUSINESS HOURS.</p>
    </div>
  );
}
