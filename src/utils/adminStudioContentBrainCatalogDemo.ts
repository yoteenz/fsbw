/** Product Knowledge + CTA Library — searchable catalog for Content Brain. */

export type ProductKnowledgeEntry = {
  id: string;
  name: string;
  collection: string;
  texture: string;
  density: string;
  lengths: string;
  colors: string;
  features: string;
  benefits: string;
  care: string;
  targetCustomer: string;
  crossSells: string;
  recommendedPairings: string;
  faqs: string;
};

export type ProductKnowledgeFieldKey = keyof Omit<ProductKnowledgeEntry, 'id'>;

export const PRODUCT_KNOWLEDGE_FIELD_GROUPS: Array<{
  title: string;
  keys: ProductKnowledgeFieldKey[];
}> = [
  {
    title: 'IDENTITY',
    keys: ['name', 'collection', 'texture', 'density'],
  },
  {
    title: 'SPECS',
    keys: ['lengths', 'colors', 'features', 'benefits'],
  },
  {
    title: 'CUSTOMER',
    keys: ['care', 'targetCustomer', 'crossSells', 'recommendedPairings', 'faqs'],
  },
];

export const PRODUCT_KNOWLEDGE_FIELD_LABELS: Record<ProductKnowledgeFieldKey, string> = {
  name: 'PRODUCT NAME',
  collection: 'COLLECTION',
  texture: 'TEXTURE',
  density: 'DENSITY',
  lengths: 'LENGTHS',
  colors: 'COLORS',
  features: 'FEATURES',
  benefits: 'BENEFITS',
  care: 'CARE',
  targetCustomer: 'TARGET CUSTOMER',
  crossSells: 'CROSS-SELLS',
  recommendedPairings: 'RECOMMENDED PAIRINGS',
  faqs: 'FAQS',
};

export const ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS: ProductKnowledgeEntry[] = [
  {
    id: 'noir',
    name: 'NOIR',
    collection: 'STRAIGHT · SIGNATURE UNIT',
    texture: 'RAW RUSSIAN · SILKY STRAIGHT',
    density: '130% · 150% · 180%',
    lengths: '16" · 18" · 20" · 22" · 24"',
    colors: 'OFF BLACK · JET BLACK · NATURALS · FASHION SWATCHES',
    features: 'HD LACE · PRE-PLUCKED HAIRLINE · 3-ANGLE LIVE PREVIEW IN BUILD-A-WIG',
    benefits: 'VERSATILE STRAIGHT BASE · CUSTOM COLOR + STYLING · MUSEUM-QUALITY CRAFT',
    care: 'SULFATE-FREE WASH · AIR DRY · STORE ON WIG STAND · HEAT PROTECTANT FOR STYLING',
    targetCustomer: 'SLAYERS WHO WANT A BOLD STRAIGHT SIGNATURE LOOK — DAILY WEAR TO RED CARPET',
    crossSells: 'LACE SPRAY · WIG STAND · HEAT PROTECTANT · INSTALL APPOINTMENT',
    recommendedPairings: 'BLANCO FOR COLOR CONTRAST · SOFT WAVE FOR TEXTURE ROTATION',
    faqs: 'Q: CAN I CUSTOMIZE COLOR? A: YES IN BUILD-A-WIG. Q: PREMIUM GATES? A: LACE, TEXTURE, COLOR OPTIONS.',
  },
  {
    id: 'blanco',
    name: 'BLANCO',
    collection: 'STRAIGHT · PLATINUM SIGNATURE',
    texture: 'RAW RUSSIAN · SILKY STRAIGHT',
    density: '130% · 150% · 180%',
    lengths: '16" · 18" · 20" · 22" · 24"',
    colors: 'GOLDEN · PLATINUM · ASH',
    features: 'HD LACE · PLATINUM-OPTIMIZED COLOR PALETTE · PRE-PLUCKED HAIRLINE',
    benefits: 'STATEMENT BLONDE AND PLATINUM LOOKS · SAME BUILD-A-WIG CUSTOMIZATION AS NOIR',
    care: 'PURPLE TONING SHAMPOO · MINIMAL HEAT · PROFESSIONAL TONE REFRESH RECOMMENDED',
    targetCustomer: 'CUSTOMERS WHO WANT HIGH-IMPACT BLONDE / PLATINUM WITH LUXURY CRAFT',
    crossSells: 'PURPLE SHAMPOO · SILVER TONING MASK · COLOR-PROTECT SPRAY',
    recommendedPairings: 'NOIR FOR ROOT SHADOW LOOKS · BEACH WAVE FOR SOFT BLONDE TEXTURE',
    faqs: 'Q: ASH VS PLATINUM? A: ASH IS COOLER TONED. Q: MAINTENANCE? A: TONING EVERY 2–3 WEEKS.',
  },
  {
    id: 'soft-wave',
    name: 'SOFT WAVE',
    collection: 'WAVY · EVERYDAY GLAM',
    texture: 'BODY WAVE · SOFT S-WAVE PATTERN',
    density: '130% · 150%',
    lengths: '18" · 20" · 22" · 24"',
    colors: 'NATURALS · HIGHLIGHTS · FASHION',
    features: 'NATURAL MOVEMENT · EASY STYLING · LOUNGE EDUCATION SERIES',
    benefits: 'EFFORTLESS VOLUME · FLATTERING ON MOST FACE SHAPES · LOW DAILY STYLING',
    care: 'DIFFUSE DRY · WIDE-TOOTH COMB · LIGHT HOLD MOUSSE',
    targetCustomer: 'EVERYDAY GLAM · OFFICE-TO-EVENING · FIRST-TIME WIG BUYERS',
    crossSells: 'DIFFUSER ATTACHMENT · WAVE CREAM · WIG CAP',
    recommendedPairings: 'BEACH WAVE FOR MORE TEXTURE · NOIR FOR STRAIGHT CONTRAST',
    faqs: 'Q: CAN I STRAIGHTEN? A: YES WITH HEAT PROTECTANT. Q: BEST LENGTH? A: 20–22 FOR MOST.',
  },
  {
    id: 'beach-wave',
    name: 'BEACH WAVE',
    collection: 'WAVY · VACATION TEXTURE',
    texture: 'LOOSE BEACH WAVE · TOUSLED MOVEMENT',
    density: '130% · 150%',
    lengths: '18" · 20" · 22" · 24"',
    colors: 'SUN-KISSED NATURALS · HIGHLIGHTS',
    features: 'RELAXED TEXTURE · INSTANT VACATION VIBE · GREAT FOR SOCIAL CONTENT',
    benefits: 'TEXTURE WITHOUT EFFORT · PHOTOGENIC MOVEMENT · SUMMER-READY',
    care: 'SEA SALT SPRAY · AIR DRY · SCRUNCH AND GO',
    targetCustomer: 'CONTENT CREATORS · VACATION · TEXTURE LOVERS',
    crossSells: 'SEA SALT SPRAY · TEXTURE CREAM · TRAVEL WIG CASE',
    recommendedPairings: 'SOFT WAVE FOR SUBTLER TEXTURE · OCEAN CURL FOR MORE DEFINITION',
    faqs: 'Q: VS SOFT WAVE? A: BEACH IS LOOSER AND MORE TOSSED. Q: FRIZZ? A: LIGHT OIL ON ENDS.',
  },
  {
    id: 'soft-curl',
    name: 'SOFT CURL',
    collection: 'CURLY · DEFINED GLAM',
    texture: 'SOFT RINGLET · BOUNCY CURL PATTERN',
    density: '150% · 180%',
    lengths: '16" · 18" · 20" · 22"',
    colors: 'NATURALS · RICH BROWNS · FASHION',
    features: 'DEFINED CURLS · VOLUME · SLAY ACADEMY STYLING LESSONS',
    benefits: 'FULL GLAM LOOK · GREAT FOR EVENTS · HOLDS SHAPE WITH PROPER CARE',
    care: 'CO-WASH · LEAVE-IN CONDITIONER · DIFFUSE · NO BRUSH WHEN DRY',
    targetCustomer: 'EVENT GLAM · CURL LOVERS · FULL VOLUME SEEKERS',
    crossSells: 'LEAVE-IN · CURL CREAM · SILK SCARF FOR NIGHT',
    recommendedPairings: 'OCEAN CURL FOR LOOSER PATTERN · SOFT WAVE FOR WAVY ALTERNATIVE',
    faqs: 'Q: SHEDDING? A: NORMAL FIRST FEW WEARS — GENTLE DETANGLE. Q: LENGTH? A: CURLS MEASURE SHORTER.',
  },
  {
    id: 'ocean-curl',
    name: 'OCEAN CURL',
    collection: 'CURLY · BEACH CURL',
    texture: 'LOOSE CURL · OCEAN-INSPIRED PATTERN',
    density: '150% · 180%',
    lengths: '18" · 20" · 22" · 24"',
    colors: 'NATURALS · CARAMEL · FASHION',
    features: 'EFFORTLESS CURL DEFINITION · BEACH-TO-EVENING VERSATILITY',
    benefits: 'ROMANTIC TEXTURE · LESS MAINTENANCE THAN TIGHT CURLS · FLATTERING MOVEMENT',
    care: 'CO-WASH · SCRUNCH WITH CURL MOUSSE · PINEAPPLE METHOD AT NIGHT',
    targetCustomer: 'ROMANTIC GLAM · BRUNCH-TO-DATE NIGHT · CURL CURIOUS',
    crossSells: 'CURL MOUSSE · SATIN PILLOWCASE · DETANGLING SPRAY',
    recommendedPairings: 'BEACH WAVE FOR WAVY OPTION · SOFT CURL FOR TIGHTER DEFINITION',
    faqs: 'Q: VS SOFT CURL? A: OCEAN IS LOOSER AND MORE RELAXED. Q: HUMIDITY? A: ANTI-HUMIDITY SERUM HELPS.',
  },
];

export type CtaLibraryEntry = {
  id: string;
  title: string;
  body: string;
  channel: string;
  funnel: string;
  destination: string;
  notes: string;
};

export type CtaLibraryFieldKey = keyof Omit<CtaLibraryEntry, 'id'>;

export const CTA_LIBRARY_FIELD_LABELS: Record<CtaLibraryFieldKey, string> = {
  title: 'CTA TITLE',
  body: 'CTA BODY / SUBTEXT',
  channel: 'CHANNEL',
  funnel: 'FUNNEL STAGE',
  destination: 'DESTINATION URL / ACTION',
  notes: 'NOTES',
};

export const ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS: CtaLibraryEntry[] = [
  {
    id: 'cta-hair-analysis',
    title: 'START YOUR HAIR ANALYSIS',
    body: 'UPLOAD YOUR SELFIE — PSA FINDS YOUR BEST LOOKS WITHIN 24 HOURS.',
    channel: 'LOUNGE · PSA · EMAIL',
    funnel: 'CONSIDERATION',
    destination: '/account/concierge · FIND MY BEST LOOKS',
    notes: 'PREMIUM GATE — REFERENCE PSA PERSONALITY.',
  },
  {
    id: 'cta-build-a-wig',
    title: 'OPEN BUILD-A-WIG',
    body: 'CUSTOMIZE YOUR UNIT — COLOR, LACE, STYLING — SEE LIVE PREVIEW.',
    channel: 'ALL CHANNELS',
    funnel: 'CONVERSION',
    destination: '/build-a-wig',
    notes: 'SIGN-IN GATE — BUILDAWIG FEATURE MODAL.',
  },
  {
    id: 'cta-meet-psa',
    title: 'MEET PSA',
    body: 'YOUR FOUNDER HOLOGRAM — TRUST OVER SALES, REAL UNIT RECOMMENDATIONS.',
    channel: 'LOUNGE · CONCIERGE · EMAIL',
    funnel: 'AWARENESS',
    destination: 'PSA HOLOGRAM · /account/concierge',
    notes: 'NEVER ROBOTIC — PSA PERSONALITY RULES.',
  },
  {
    id: 'cta-membership',
    title: 'JOIN MEMBERSHIP',
    body: 'UNLOCK LOUNGE TV, PSA PRIORITY, AND PREMIUM BUILD OPTIONS.',
    channel: 'EMAIL · ACCOUNT · LOUNGE',
    funnel: 'CONVERSION',
    destination: '/account/rewards · /checkout/upgrade',
    notes: 'TRUST OVER SALES — EDUCATE VALUE FIRST.',
  },
  {
    id: 'cta-watch-episode',
    title: 'WATCH FULL EPISODE',
    body: 'PRESS PLAY IN THE LOUNGE — VIDEO, ARTICLE, AND CHECKLIST INCLUDED.',
    channel: 'EMAIL · SOCIAL · PUSH',
    funnel: 'ENGAGEMENT',
    destination: 'LOUNGE TV EPISODE',
    notes: 'PAIR WITH CONTENT PACK METADATA.',
  },
  {
    id: 'cta-unlock-rewards',
    title: 'UNLOCK REWARDS',
    body: 'COMPLETE THE SLAY CHALLENGE — SELECT YOUR REWARD AT CYCLE END.',
    channel: 'ACCOUNT · EMAIL · CONCIERGE',
    funnel: 'RETENTION',
    destination: '/account/rewards · SLAY CHALLENGE',
    notes: 'SYNC WITH REWARD CAMPAIGN FRAMEWORK.',
  },
  {
    id: 'cta-slay-challenge',
    title: 'VIEW SLAY CHALLENGE',
    body: 'YOUR 6-MONTH SLAY JOURNEY — TRACK PROGRESS AND EARN REWARDS.',
    channel: 'ACCOUNT · EMAIL',
    funnel: 'RETENTION',
    destination: '/account/concierge',
    notes: 'FOUNDER CAN OVERRIDE STAGE FOR TESTING.',
  },
  {
    id: 'cta-shop-collection',
    title: 'SHOP COLLECTION',
    body: 'BROWSE NOIR, BLANCO, WAVES, AND CURLS — MUSEUM-QUALITY UNITS.',
    channel: 'ALL CHANNELS',
    funnel: 'CONVERSION',
    destination: '/home/shop',
    notes: 'CHECK INVENTORY AVAILABILITY — SOLD OUT UI.',
  },
  {
    id: 'cta-browse-colors',
    title: 'BROWSE COLORS',
    body: 'FIND YOUR SIGNATURE SHADE — SWATCHES, TRENDS, AND BUILD-A-WIG PREVIEW.',
    channel: 'SOCIAL · EMAIL · LOUNGE',
    funnel: 'CONSIDERATION',
    destination: '/build-a-wig/noir/customize/color',
    notes: 'SEASONAL CAMPAIGN ANCHOR CTA.',
  },
  {
    id: 'cta-book-consult',
    title: 'BOOK CONSULT',
    body: 'WORK WITH OUR TEAM — STYLE ANALYSIS, CUSTOM BUILD, INSTALL PLANNING.',
    channel: 'PSA · EMAIL · LOUNGE',
    funnel: 'CONVERSION',
    destination: '/booking/consultation',
    notes: 'PREMIUM CONSULT GATE FOR /booking/premium/consultation.',
  },
];
