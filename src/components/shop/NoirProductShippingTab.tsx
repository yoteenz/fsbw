/** NOIR unit PDP — SHIPPING tab copy and list styling. */

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
  fontSize: '14px',
  color: '#EB1C24',
  fontWeight: 400,
  margin: '14px 0 10px 0',
  textTransform: 'lowercase' as const,
};

const CUSTOMIZATION_EXCLUSION_BULLETS = [
  'CUSTOM COLORING',
  'SPECIALTY COLOR SERVICES',
  'CUSTOM STYLING',
  'PRECISION CUTTING & LAYERING',
  'ADDITIONAL ADD-ON SERVICES',
  'EXTENSIVE UNIT MODIFICATIONS',
] as const;

const IMPORTANT_INFORMATION_ITEMS = [
  'PROCESSING TIME BEGINS AFTER PAYMENT VERIFICATION AND SUCCESSFUL COMPLETION OF THE ORDER AUTHORIZATION FORM.',
  'PROCESSING TIMES DO NOT INCLUDE SHIPPING TRANSIT TIMES.',
  'BUSINESS DAYS EXCLUDE WEEKENDS AND MAJOR U.S. HOLIDAYS.',
  'PROCESSING ESTIMATES MAY VARY DURING SALES, PROMOTIONAL EVENTS, PRODUCT LAUNCHES AND HIGH VOLUME PERIODS.',
  'TRACKING INFORMATION WILL BE PROVIDED VIA EMAIL ONCE YOUR ORDER HAS SHIPPED.',
  'SELECTING EXPEDITED SHIPPING DOES NOT REDUCE CUSTOMIZATION OR PRODUCTION TIMELINES UNLESS EXPRESS PROCESSING HAS ALSO BEEN PURCHASED.',
] as const;

/** Red checkmarks match premium upgrade subscription chart (`PremiumSubscriptionUpgradeChart`). */
const PREMIUM_CHECK_STYLE = { width: '10px', height: '10px', flexShrink: 0 } as const;

export default function NoirProductShippingTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={BODY_STYLE}>
        EVERY FRONTAL SLAYER UNIT IS HANDCRAFTED, INSPECTED AND PREPARED WITH METICULOUS ATTENTION TO DETAIL BEFORE SHIPMENT. BECAUSE QUALITY TAKES TIME, WE ENCOURAGE CLIENTS TO REVIEW PROCESSING TIMELINES CAREFULLY BEFORE PLACING AN ORDER.
      </p>

      <p style={SECTION_TITLE_STYLE}>standard processing</p>
      <p style={BODY_STYLE}>
        STANDARD PROCESSING FOR READY-TO-WEAR UNITS IS APPROXIMATELY 6-8 WEEKS.
      </p>
      <p style={BODY_STYLE}>
        UNITS THAT INCLUDE CUSTOMIZATION SERVICES SUCH AS CUSTOM COLOR, KNOT BLEACHING, PLUCKING, STYLING, CUTTING, LAYERING OR ADDITIONAL MODIFICATIONS MAY REQUIRE UP TO 10 WEEKS FOR COMPLETION.
      </p>

      <p style={SECTION_TITLE_STYLE}>express processing</p>
      <p style={BODY_STYLE}>NEED YOUR UNIT TO HIT YOUR DOORSTEP SOONER?</p>
      <p style={BODY_STYLE}>
        WE OFFER EXPRESS PROCESSING + RUSH SHIPPING FOR AN ADDITIONAL $120 USD.
      </p>
      <p style={BODY_STYLE}>
        ELIGIBLE UNITS ARE PRIORITIZED IN OUR PRODUCTION QUEUE AND PROCESSED WITHIN APPROXIMATELY 4-6 WEEKS.
      </p>
      <p style={BODY_STYLE}>
        PLEASE NOTE THAT EXPRESS PROCESSING IS RESERVED FOR QUALIFYING UNITS ONLY.
      </p>

      <p style={SECTION_TITLE_STYLE}>customization exclusions</p>
      <p style={BODY_STYLE}>
        TO MAINTAIN THE QUALITY AND INTEGRITY OF OUR WORK, THE FOLLOWING SERVICES ARE NOT ELIGIBLE FOR EXPRESS PROCESSING:
      </p>
      {CUSTOMIZATION_EXCLUSION_BULLETS.map((bullet) => (
        <p key={bullet} style={BULLET_STYLE}>
          <span style={BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}
      <p style={BODY_STYLE}>
        ORDERS CONTAINING THESE SERVICES WILL FOLLOW STANDARD PRODUCTION TIMELINES REGARDLESS OF SHIPPING METHOD SELECTED.
      </p>

      <p style={SECTION_TITLE_STYLE}>important information</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {IMPORTANT_INFORMATION_ITEMS.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <img src="/assets/premium-check.svg" alt="Included" style={PREMIUM_CHECK_STYLE} />
            <p style={BODY_STYLE}>{label}</p>
          </div>
        ))}
      </div>

      <p style={SECTION_TITLE_STYLE}>handmade, not mass produced</p>
      <p style={BODY_STYLE}>
        EVERY FRONTAL SLAYER UNIT IS INDIVIDUALLY CRAFTED, INSPECTED AND PREPARED TO MEET OUR QUALITY STANDARDS. WE PRIORITIZE EXCEPTIONAL CRAFTSMANSHIP OVER RUSHED PRODUCTION TO ENSURE YOUR UNIT ARRIVES READY TO MAKE A STATEMENT THE MOMENT IT TOUCHES YOUR HEAD.
      </p>
    </div>
  );
}
