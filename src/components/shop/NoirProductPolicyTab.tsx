/** NOIR unit PDP — POLICY tab copy and list styling. */

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

const IF_YOU_RECEIVE_BULLETS = [
  'AN INCORRECT ITEM',
  'A DEFECTIVE PRODUCT',
  'AN INCOMPLETE ORDER',
] as const;

const VERIFIED_ISSUE_RESOLUTIONS = [
  'CORRECT THE SHIPMENT',
  'REPLACE THE AFFECTED ITEM',
  'ISSUE STORE CREDIT',
  'OFFER A COMPARABLE REPLACEMENT',
] as const;

export default function NoirProductPolicyTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={BODY_STYLE}>
        DUE TO THE SANITARY NATURE OF HAIR PRODUCTS, PRODUCT CUSTOMIZATION AND LIMITED INVENTORY AVAILABILITY, ALL SALES ARE FINAL.
      </p>
      <p style={BODY_STYLE}>
        WE ARE UNABLE TO OFFER REFUNDS, RETURNS OR EXCHANGES ONCE AN ORDER HAS BEEN PLACED AND CONFIRMED.
      </p>

      <p style={BODY_STYLE}>IF YOU RECEIVE:</p>
      {IF_YOU_RECEIVE_BULLETS.map((bullet) => (
        <p key={bullet} style={BULLET_STYLE}>
          <span style={BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}
      <p style={BODY_STYLE}>
        PLEASE CONTACT US WITHIN 48 HOURS OF DELIVERY WITH YOUR ORDER NUMBER AND CLEAR PHOTOS/VIDEOS OF THE ISSUE FOR REVIEW.
      </p>

      <p style={BODY_STYLE}>
        IF AN ISSUE IS VERIFIED AS A RESULT OF OUR ERROR, WE RESERVE THE RIGHT TO:
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

      <p style={BODY_STYLE}>
        PLEASE NOTE THAT SLIGHT VARIATIONS IN COLOR, TEXTURE, DENSITY AND CURL PATTERN ARE NORMAL CHARACTERISTICS OF RAW HUMAN HAIR AND ARE NOT CONSIDERED DEFECTS.
      </p>
      <p style={BODY_STYLE}>
        BY COMPLETING YOUR PURCHASE, YOU ACKNOWLEDGE THAT YOU HAVE REVIEWED AND AGREE TO OUR FULL TERMS OF SERVICE, PROCESSING POLICY AND REFUND POLICY.
      </p>

      <p style={BODY_STYLE}>
        FOR ASSISTANCE, PLEASE EMAIL{' '}
        <span style={EMAIL_STYLE}>CONTACT@FRONTALSLAYER.COM</span>
      </p>
      <p style={BODY_STYLE}>RESPONSE TIMES ARE TYPICALLY WITHIN 72 BUSINESS HOURS.</p>
    </div>
  );
}
