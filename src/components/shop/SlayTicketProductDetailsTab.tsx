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

const SLAY_TICKET_DETAILS_INTRO =
  'UNLOCK LOUNGE TV CONTENT WITH SLAY TICKETS — YOUR PASS TO BRAND STORIES, SLAY TIPS, WATCH + LEARN LESSONS, AND ACADEMY-STYLE EDUCATION INSIDE THE LOUNGE. PURCHASE A DIGITAL TICKET PACK AND TICKETS ARE ADDED TO YOUR ACCOUNT IMMEDIATELY AFTER CHECKOUT.';

const SLAY_TICKET_DETAILS_BULLETS = [
  'SLAY TICKET PACK PURCHASES ARE AVAILABLE TO PREMIUM MEMBERS ONLY.',
  'SLAY TICKETS ARE A DIGITAL PRODUCT — NO PHYSICAL ITEM WILL BE SHIPPED.',
  'TICKETS ARE DELIVERED TO YOUR ACCOUNT BALANCE IMMEDIATELY AFTER PURCHASE.',
  'AVAILABLE IN 4, 8, 12, AND 24 TICKET PACKS AT $4 PER TICKET LIST RATE.',
  '8-, 12-, AND 24-TICKET PACKS INCLUDE VOLUME SAVINGS ($30, $46, AND $90).',
  'USE TICKETS TO UNLOCK INDIVIDUAL LOUNGE TV CONTENT ITEMS FROM YOUR ACCOUNT.',
  'EARN 2 SLAY TICKETS FOR EVERY PHYSICAL HAIR PRODUCT PURCHASED (WIG UNITS AND BCF).',
  'GIFT CARDS, MEMBERSHIPS, DIGITAL CASH, AND SLAY TICKET PACK PURCHASES DO NOT EARN BONUS TICKETS.',
  'UNLOCKED VIDEOS STAY IN YOUR LIBRARY FOR 1 YEAR; REWATCHES AFTER EXPIRY COST 1 TICKET.',
  'VIEW YOUR BALANCE AND TRANSACTION HISTORY ANYTIME FROM ACCOUNT → PROFILE.',
] as const;

const SLAY_TICKET_HIGHLIGHTS = [
  'INSTANT DIGITAL DELIVERY',
  'UNLOCK LOUNGE TV CONTENT',
  'NO PHYSICAL SHIPPING REQUIRED',
  'STACK WITH EARNED TICKETS',
  'FLEXIBLE PACK SIZES',
  'VIEW HISTORY IN YOUR ACCOUNT',
  'PERFECT FOR BINGE-WATCHING SLAY TIPS',
  'POWER YOUR LOUNGE TV EXPERIENCE',
] as const;

export default function SlayTicketProductDetailsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px' }}>
      <p style={{ ...BODY_STYLE, marginBottom: '4px' }}>{SLAY_TICKET_DETAILS_INTRO}</p>

      {SLAY_TICKET_DETAILS_BULLETS.map((bullet) => (
        <p key={bullet} style={BULLET_STYLE}>
          <span style={BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}

      <p style={SECTION_TITLE_STYLE}>why slay tickets</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {SLAY_TICKET_HIGHLIGHTS.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <img src={NOIR_PRODUCT_TAB_ROSE_ALERT_SRC} alt="" style={NOIR_PRODUCT_TAB_ROSE_ALERT_BADGE_STYLE} />
            <p style={BODY_STYLE}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
