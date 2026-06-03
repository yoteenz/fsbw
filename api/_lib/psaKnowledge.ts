/**
 * Static knowledge for PSA v1: site navigation, unit catalog, and FAQ snippets.
 * Keep in sync with `src/constants/brandFaqCopy.ts` when FAQ changes materially.
 */
import {
  PSA_UNIT_PRICE_NOTE,
  psaCatalogPricingSummaryLines,
  psaStartingPriceUsdForUnitName,
} from './psaCatalogPricing.js';
import { buildPsaFounderNotesBlock } from './psaFounderNotes.js';
import { buildPsaLoungeLessonsBlock } from './psaLoungeLessons.js';

export type PsaNavLink = {
  label: string;
  path: string;
  description: string;
};

export type PsaProduct = {
  id: string;
  name: string;
  texture: 'straight' | 'wavy' | 'curly';
  path: string;
  buildAWigPath: string;
  summary: string;
};

export function mapPsaProductForTool(product: PsaProduct) {
  const startingPriceUsd = psaStartingPriceUsdForUnitName(product.name);
  return {
    name: product.name,
    texture: product.texture,
    startingPriceUsd,
    priceNote: PSA_UNIT_PRICE_NOTE,
    productPage: product.path,
    buildAWig: product.buildAWigPath,
    summary: product.summary,
  };
}

export const PSA_NAV_LINKS: PsaNavLink[] = [
  { label: 'SHOP UNITS', path: '/home/shop', description: 'Browse all wig units and storefront categories.' },
  { label: 'UNITS HUB', path: '/shop/units', description: 'Unit collection landing from the lounge carousel.' },
  { label: 'BUILD-A-WIG', path: '/build-a-wig', description: 'Customize a unit with length, color, lace, styling, and add-ons.' },
  { label: 'SHOPPING BAG', path: '/bag', description: 'View cart and saved-for-later items.' },
  { label: 'WISHLIST', path: '/wishlist', description: 'Saved items and lists.' },
  { label: 'ACCOUNT', path: '/account', description: 'Profile, orders, settings, and member hub.' },
  { label: 'CONCIERGE', path: '/account/concierge', description: 'Priority messages, special offers, Slay Challenge, and member perks.' },
  { label: 'REWARDS / MEMBERSHIP', path: '/account/rewards', description: 'Premium subscription chart and member rewards.' },
  { label: 'ORDERS', path: '/orders', description: 'Active and past order tracking.' },
  { label: 'REFERRALS', path: '/account/referrals', description: 'Referral code, digital cash rewards, and share-with-friends perks.' },
  { label: 'AFFILIATE', path: '/account/affiliate', description: 'Affiliate content submissions and community rewards for points.' },
  { label: 'BOOK CONSULTATION', path: '/booking/consultation', description: 'Standard consultation booking.' },
  { label: 'BOOK APPOINTMENT', path: '/booking/appointment', description: 'Hair install / appointment booking.' },
  { label: 'PREMIUM CONSULTATION', path: '/booking/premium/consultation', description: 'Premium-tier consult (premium members).' },
  { label: 'PREMIUM APPOINTMENT', path: '/booking/premium/appointment', description: 'Premium-tier appointment (premium members).' },
  { label: 'VIP LOUNGE', path: '/lobby/lounge', description: 'Members-only lounge experience.' },
  { label: 'FAQ', path: '/brand/faq', description: 'Full FAQ and ask-a-question form.' },
  { label: 'TERMS OF SERVICE', path: '/brand/terms', description: 'Returns, refunds, and full policy terms.' },
  { label: 'CONTACT', path: '/brand/contact', description: 'Brand contact form.' },
  { label: 'GIFT CARD', path: '/tools/gift-card', description: 'Purchase a gift card.' },
];

export const PSA_PRODUCTS: PsaProduct[] = [
  {
    id: 'noir',
    name: 'NOIR',
    texture: 'straight',
    path: '/straight/noir',
    buildAWigPath: '/build-a-wig/noir',
    summary: 'Straight unit — signature sleek look; full Build-a-Wig customization including live color preview.',
  },
  {
    id: 'blanco',
    name: 'BLANCO',
    texture: 'straight',
    path: '/straight/blanco',
    buildAWigPath: '/build-a-wig/blanco',
    summary: 'Straight unit — lighter / soft straight aesthetic.',
  },
  {
    id: 'soft-wave',
    name: 'SOFT WAVE',
    texture: 'wavy',
    path: '/wavy/soft-wave',
    buildAWigPath: '/build-a-wig/soft-wave',
    summary: 'Wavy unit — soft, brushed S-wave texture.',
  },
  {
    id: 'beach-wave',
    name: 'BEACH WAVE',
    texture: 'wavy',
    path: '/wavy/beach-wave',
    buildAWigPath: '/build-a-wig/beach-wave',
    summary: 'Wavy unit — relaxed beach-wave pattern.',
  },
  {
    id: 'soft-curl',
    name: 'SOFT CURL',
    texture: 'curly',
    path: '/curly/soft-curl',
    buildAWigPath: '/build-a-wig/soft-curl',
    summary: 'Curly unit — soft curl definition.',
  },
  {
    id: 'ocean-curl',
    name: 'OCEAN CURL',
    texture: 'curly',
    path: '/curly/ocean-curl',
    buildAWigPath: '/build-a-wig/ocean-curl',
    summary: 'Curly unit — deeper ocean-inspired curl pattern.',
  },
];

/** Condensed FAQ for PSA v1 — sourced from brand FAQ copy. */
export const PSA_FAQ_ENTRIES: { id: string; question: string; answer: string }[] = [
  {
    id: 'unit-base-pricing',
    question: 'HOW MUCH DO UNITS START AT? IS NOIR EXPENSIVE COMPARED TO OTHER UNITS?',
    answer:
      'Starting base prices before Build-a-Wig customization: NOIR $740, BLANCO $820, SOFT WAVE and BEACH WAVE $760 each, SOFT CURL and OCEAN CURL $780 each. NOIR is the most accessible straight unit on base price in our line. Length, density, lace, color, styling and add-ons increase your total in Build-a-Wig.',
  },
  {
    id: 'processing-time',
    question: 'HOW LONG DOES PROCESSING TAKE?',
    answer:
      'Processing varies by product and customization. Ready-to-ship orders often process within 3–10 business days. Made-to-order custom units typically need 6–8 weeks (up to 10 for extensive customization). Express processing (4–6 weeks) is available on select units for an additional fee.',
  },
  {
    id: 'expedited-shipping',
    question: 'DO YOU OFFER EXPEDITED SHIPPING?',
    answer:
      'Yes — expedited shipping is available at checkout. Shipping speed does not reduce processing or customization time; it only affects transit after your order ships.',
  },
  {
    id: 'change-cancel-order',
    question: 'CAN I CHANGE OR CANCEL MY ORDER?',
    answer:
      'Because many products are customized per client, orders generally cannot be changed or canceled once confirmed. Double-check details before payment. Qualifying physical orders also require a signed order authorization form within 24 hours or the order may be canceled and refunded.',
  },
  {
    id: 'order-authorization-form',
    question: 'DO I NEED AN ORDER AUTHORIZATION FORM?',
    answer:
      'For applicable orders, yes — complete and submit your signed order authorization form within 24 hours of purchase or your order may be refunded and canceled. Track status from Account → Orders.',
  },
  {
    id: 'payment-plans',
    question: 'DO YOU OFFER PAYMENT PLANS?',
    answer:
      'Yes — installment options at checkout through providers like Affirm and Klarna where available.',
  },
  {
    id: 'tracking',
    question: 'WILL I RECEIVE TRACKING?',
    answer:
      'Yes — tracking is emailed when your order ships. View status from Account → Orders when signed in.',
  },
  {
    id: 'hair-type',
    question: 'WHAT TYPE OF HAIR DO YOU SELL?',
    answer:
      'Premium raw and luxury virgin hair extensions and units sourced for longevity, softness, and minimal shedding when properly maintained.',
  },
  {
    id: 'hair-longevity',
    question: 'HOW LONG DOES THE HAIR LAST?',
    answer:
      'With proper care, hair can last 1–3+ years depending on wear frequency, coloring, heat styling, and maintenance.',
  },
  {
    id: 'color-bleach',
    question: 'CAN THE HAIR BE COLORED OR BLEACHED?',
    answer:
      'Yes — professional color, tone, lift, and styling are supported. Use a licensed professional for chemical services.',
  },
  {
    id: 'returns',
    question: 'WHAT IS YOUR RETURN POLICY?',
    answer:
      'Due to the customized nature of many products, returns are limited. Review Terms and FAQ on /brand/faq and /brand/terms for eligibility. Contact support for order-specific questions.',
  },
  {
    id: 'membership',
    question: 'WHAT DO PREMIUM MEMBERS GET?',
    answer:
      'Premium includes discounted shipping, Build-a-Wig premium options, VIP lounge access, fast-track support, priority booking, challenges, live order tracking, and tier-specific perks like priority messages (6mo+) and special offers (12mo). See Account → Rewards.',
  },
  {
    id: 'build-a-wig',
    question: 'WHAT IS BUILD-A-WIG?',
    answer:
      'Build-a-Wig lets you customize unit length, density, lace, texture, hairline, color, styling, cap size, and add-ons. Sign in to access. Premium options require an active premium membership.',
  },
  {
    id: 'priority-messages',
    question: 'HOW DO PRIORITY MESSAGES WORK?',
    answer:
      'Premium members (6- and 12-month tiers per rewards chart) can send priority messages from Account → Concierge. Our team responds asynchronously — PSA can help with instant answers; Concierge handles human follow-up.',
  },
  {
    id: 'shed-tangle',
    question: 'DOES THE HAIR SHED OR TANGLE?',
    answer:
      'Minimal shedding is normal with extensions and wigs, especially after customization. Proper maintenance, brushing technique, and nighttime care reduce tangling and extend hair life.',
  },
  {
    id: 'bundle-count',
    question: 'HOW MANY BUNDLES DO I NEED FOR A FULL INSTALL?',
    answer:
      'Depends on desired fullness and length. Typical guide: 12"–18" = 2–3 bundles; 20"–26" = 3–4 bundles; 28"+ = 4 or more. For units, use Build-a-Wig to set length and density on your chosen texture.',
  },
  {
    id: 'beginner-friendly',
    question: 'ARE YOUR WIGS BEGINNER FRIENDLY?',
    answer:
      'Yes — many units offer beginner-friendly customization options to make installation easier for everyday wear. Ask about pre-plucked hairlines, lace options, and cap size in Build-a-Wig or book a consult.',
  },
  {
    id: 'pre-plucked',
    question: 'DO YOUR WIGS COME PRE-PLUCKED OR CUSTOMIZED?',
    answer:
      'Customization varies by unit. Options include pre-plucking, bleached knots, styling, color, layering, and other upgrades at checkout or through Build-a-Wig.',
  },
  {
    id: 'cap-size',
    question: 'HOW DO I CHOOSE THE CORRECT WIG CAP SIZE?',
    answer:
      'Measure head circumference before ordering. Use the Build-a-Wig cap size step or product page cap options. When in doubt, book a consultation or contact support before purchasing.',
  },
  {
    id: 'custom-color-style',
    question: 'CAN I REQUEST A CUSTOM COLOR OR STYLE?',
    answer:
      'Yes — customization services personalize your unit. Availability depends on request complexity and production volume. Build-a-Wig color and styling steps show live options for premium members on select units.',
  },
  {
    id: 'length-density',
    question: 'HOW DO I CHOOSE LENGTH AND DENSITY?',
    answer:
      'In Build-a-Wig, pick your unit (texture), then set length, density, lace, hairline, color, and styling. Straight: NOIR or BLANCO. Wavy: SOFT WAVE or BEACH WAVE. Curly: SOFT CURL or OCEAN CURL. Higher density = fuller look; longer lengths may need higher density for balance.',
  },
  {
    id: 'installation-care',
    question: 'INSTALLATION AND MAINTENANCE TIPS?',
    answer:
      'Use a licensed professional for install and chemical services. Store on a wig stand, detangle gently from ends up, minimize heat, and follow night-care routines. Book an appointment at /booking/appointment for pro install; see FAQ for maintenance and longevity.',
  },
  {
    id: 'loyalty',
    question: 'HOW DOES THE LOYALTY REWARDS PROGRAM WORK?',
    answer:
      'Earn loyalty points through purchases, product reviews, referrals, social engagement, and promotions. Redeem toward discounts, perks, free gifts, and savings. View points and rewards at Account → Rewards.',
  },
  {
    id: 'referral',
    question: 'HOW DOES THE REFERRAL PROGRAM WORK?',
    answer:
      'After your first purchase, get a personalized referral code at Account → Referrals. When someone uses it on their first order, they get $20 off and you earn digital cash once their order is confirmed.',
  },
  {
    id: 'affiliate',
    question: 'HOW DOES THE AFFILIATE PROGRAM WORK?',
    answer:
      'Share your referral code and tag the brand on social to earn points and digital cash. Submit affiliate content for review at Account → Affiliate. Referrals and affiliate perks stack with loyalty rewards.',
  },
  {
    id: 'member-perks',
    question: 'DO YOU OFFER EXCLUSIVE PERKS FOR MEMBERS?',
    answer:
      'Yes — early drops, giveaways, promotional offers, loyalty rewards, exclusive discounts, and VIP community perks. Premium members also get lounge access, priority booking, and tier-specific benefits on Account → Rewards.',
  },
  {
    id: 'returns-exchanges',
    question: 'DO YOU ACCEPT RETURNS OR EXCHANGES?',
    answer:
      'Due to bespoke customization and hygiene standards, all sales are final — no refunds, returns, or exchanges. See /brand/terms. For wrong or damaged items, contact support within 48 hours with photos and order number.',
  },
  {
    id: 'wrong-item',
    question: 'WHAT IF I RECEIVE THE WRONG ITEM?',
    answer:
      'Contact customer support within 48 hours of delivery with clear photos and your order number. We investigate and, when appropriate, correct the shipment or issue store credit if the item is out of stock.',
  },
  {
    id: 'contact-support',
    question: 'HOW CAN I CONTACT CUSTOMER SUPPORT?',
    answer:
      'Use /brand/contact or Account → Concierge priority messages (6mo+ premium). Allow up to 72 hours for a response. Business hours: 10am–6pm CST weekdays, excluding major U.S. holidays.',
  },
];

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function searchPsaFaq(query: string, limit = 5): typeof PSA_FAQ_ENTRIES {
  const nq = normalizeQuery(query);
  if (!nq) return PSA_FAQ_ENTRIES.slice(0, limit);

  const scored = PSA_FAQ_ENTRIES.map((entry) => {
    const hay = normalizeQuery(`${entry.question} ${entry.answer}`);
    let score = 0;
    for (const word of nq.split(' ')) {
      if (word.length < 2) continue;
      if (hay.includes(word)) score += 1;
    }
    if (hay.includes(nq)) score += 3;
    return { entry, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return PSA_FAQ_ENTRIES.slice(0, limit);
  }
  return scored.slice(0, limit).map((x) => x.entry);
}

export function searchPsaProducts(query: string, limit = 6): PsaProduct[] {
  const nq = normalizeQuery(query);
  if (!nq) return PSA_PRODUCTS.slice(0, limit);

  const scored = PSA_PRODUCTS.map((p) => {
    const hay = normalizeQuery(`${p.name} ${p.texture} ${p.summary}`);
    let score = 0;
    if (hay.includes(nq)) score += 3;
    for (const word of nq.split(' ')) {
      if (word.length < 2) continue;
      if (hay.includes(word)) score += 1;
    }
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.length ? scored.slice(0, limit).map((x) => x.p) : PSA_PRODUCTS.slice(0, limit);
}

export function searchPsaNavigation(query: string, limit = 5): PsaNavLink[] {
  const nq = normalizeQuery(query);
  if (!nq) return PSA_NAV_LINKS.slice(0, limit);

  const scored = PSA_NAV_LINKS.map((link) => {
    const hay = normalizeQuery(`${link.label} ${link.path} ${link.description}`);
    let score = 0;
    if (hay.includes(nq)) score += 3;
    for (const word of nq.split(' ')) {
      if (word.length < 2) continue;
      if (hay.includes(word)) score += 1;
    }
    return { link, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.length ? scored.slice(0, limit).map((x) => x.link) : PSA_NAV_LINKS.slice(0, limit);
}

export function buildPsaKnowledgeContext(): string {
  const pricingLines = psaCatalogPricingSummaryLines().join('\n');
  const products = PSA_PRODUCTS.map((p) => {
    const price = psaStartingPriceUsdForUnitName(p.name);
    const priceLabel = price != null ? `from $${price} base` : 'see Build-a-Wig';
    return `- ${p.name} (${p.texture}, ${priceLabel}): PDP ${p.path}, Build-a-Wig ${p.buildAWigPath}. ${p.summary}`;
  }).join('\n');
  const nav = PSA_NAV_LINKS.map((l) => `- ${l.label}: ${l.path}, ${l.description}`).join('\n');
  const customization = `## BUILD-A-WIG (LENGTH, TEXTURE, DENSITY, PRICING)
- Flow: /build-a-wig → pick unit → length → density → lace → hairline → color → styling → add-ons → cap size.
- Texture guide: straight (NOIR, BLANCO), wavy (SOFT WAVE, BEACH WAVE), curly (SOFT CURL, OCEAN CURL).
- Base starting prices (USD, before customization):\n${pricingLines}
- ${PSA_UNIT_PRICE_NOTE}
- Length/density: longer lengths often pair with higher density for fullness; final total is set in Build-a-Wig.
- Premium-only steps (live color preview, premium lounge options) require active premium membership.`;
  return `## UNIT CATALOG\n${products}\n\n${customization}\n\n## SITE NAVIGATION\n${nav}\n\n${buildPsaFounderNotesBlock()}\n\n${buildPsaLoungeLessonsBlock()}`;
}
