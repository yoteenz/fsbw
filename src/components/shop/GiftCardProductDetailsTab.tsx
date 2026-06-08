/** Gift card PDP — DETAILS tab (matches NOIR / BCF tab typography + markers). */

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

const SECTION_TITLE_STYLE = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '20px',
  color: '#808080',
  fontWeight: 400,
  margin: '12px 0 8px 0',
  textTransform: 'lowercase' as const,
};

const GIFT_CARD_DETAILS_LEAD =
  'NOT SURE WHICH TEXTURE, LENGTH, COLOR OR CUSTOMIZATION TO CHOOSE? LET THEM DECIDE.';

const GIFT_CARD_DETAILS_INTRO =
  "THE FRONTAL SLAYER GIFT CARD IS THE PERFECT WAY TO GIFT LUXURY, FLEXIBILITY AND CONFIDENCE WITHOUT THE GUESSWORK. WHETHER YOU'RE CELEBRATING A BIRTHDAY, HOLIDAY, GRADUATION, SPECIAL OCCASION OR SIMPLY TREATING SOMEONE WHO DESERVES TO SLAY, OUR DIGITAL GIFT CARDS ALLOW RECIPIENTS TO SHOP THEIR FAVORITE PRODUCTS AND SERVICES ON THEIR OWN TERMS.";

const GIFT_CARD_DETAILS_BULLETS = [
  'DIGITAL GIFT CARDS ARE DELIVERED ELECTRONICALLY AND NO PHYSICAL PRODUCT WILL BE SHIPPED.',
  'GIFT CARDS ARE TYPICALLY DELIVERED VIA EMAIL WITHIN 24 HOURS OF PURCHASE.',
  'AVAILABLE IN MULTIPLE DENOMINATIONS TO FIT EVERY OCCASION AND BUDGET.',
  'FUNDS MAY BE LOADED DIRECTLY FROM YOUR ACCOUNT DURING PURCHASE.',
  'CAN BE USED TOWARD ANY ELIGIBLE PRODUCT, SERVICE, CUSTOMIZATION OR PURCHASE AVAILABLE ON THE FRONTAL SLAYER WEBSITE.',
  'IDEAL FOR WIGS, BUNDLES, CLOSURES, FRONTALS, CUSTOM COLOR SERVICES, BUILD-A-WIG CUSTOMIZATIONS, MEMBERSHIPS AND MORE.',
  'GIFT CARD BALANCES MAY BE APPLIED ACROSS MULTIPLE TRANSACTIONS UNTIL THE AVAILABLE BALANCE IS EXHAUSTED.',
  'DIGITAL DELIVERY MAKES IT THE PERFECT LAST MINUTE GIFT WITH NO SHIPPING DELAYS OR PROCESSING CONCERNS.',
  "PLEASE ENSURE THE RECIPIENT'S EMAIL ADDRESS IS ENTERED CORRECTLY AT CHECKOUT TO AVOID DELIVERY DELAYS.",
] as const;

const GIFT_CARD_THE_PERFECT_GIFT = [
  'INSTANT DIGITAL DELIVERY',
  'NO PHYSICAL SHIPPING REQUIRED',
  'PERFECT FOR LAST-MINUTE GIFTING',
  'REDEEMABLE SITEWIDE',
  'FLEXIBLE SPENDING OPTIONS',
  'AVAILABLE IN MULTIPLE AMOUNTS',
  'IDEAL FOR ANY OCCASION',
  'LET THEM CHOOSE THEIR OWN SLAY',
] as const;

export default function GiftCardProductDetailsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '24px' }}>
      <p style={{ ...BODY_STYLE, marginBottom: '4px' }}>{GIFT_CARD_DETAILS_LEAD}</p>
      <p style={BODY_STYLE}>{GIFT_CARD_DETAILS_INTRO}</p>

      {GIFT_CARD_DETAILS_BULLETS.map((bullet) => (
        <p key={bullet} style={BULLET_STYLE}>
          <span style={BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}

      <p style={SECTION_TITLE_STYLE}>the perfect gift</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {GIFT_CARD_THE_PERFECT_GIFT.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <img src={NOIR_PRODUCT_TAB_ROSE_ALERT_SRC} alt="" style={NOIR_PRODUCT_TAB_ROSE_ALERT_BADGE_STYLE} />
            <p style={BODY_STYLE}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
