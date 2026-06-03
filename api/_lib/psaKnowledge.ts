/**
 * Static knowledge for PSA v1: site navigation, unit catalog, and FAQ snippets.
 * Keep in sync with `src/constants/brandFaqCopy.ts` when FAQ changes materially.
 */

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
  { label: 'BOOK CONSULTATION', path: '/booking/consultation', description: 'Standard consultation booking.' },
  { label: 'BOOK APPOINTMENT', path: '/booking/appointment', description: 'Hair install / appointment booking.' },
  { label: 'PREMIUM CONSULTATION', path: '/booking/premium/consultation', description: 'Premium-tier consult (premium members).' },
  { label: 'PREMIUM APPOINTMENT', path: '/booking/premium/appointment', description: 'Premium-tier appointment (premium members).' },
  { label: 'VIP LOUNGE', path: '/lobby/lounge', description: 'Members-only lounge experience.' },
  { label: 'FAQ', path: '/brand/faq', description: 'Full FAQ and ask-a-question form.' },
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
  const products = PSA_PRODUCTS.map((p) => `- ${p.name} (${p.texture}): PDP ${p.path}, Build-a-Wig ${p.buildAWigPath}. ${p.summary}`).join('\n');
  const nav = PSA_NAV_LINKS.map((l) => `- ${l.label}: ${l.path} — ${l.description}`).join('\n');
  return `## UNIT CATALOG\n${products}\n\n## SITE NAVIGATION\n${nav}`;
}
