import {
  DESIGN_DNA_PHILOSOPHY,
  FINAL_DESIGN_TEST,
  HEADQUARTERS_REVIEW_CRITERIA,
  VISUAL_RELATIONSHIP_PATTERNS,
} from './constants';
import { bootstrapDesignDnaCanonStore } from './store';
import type {
  CanonPage,
  DesignDnaCanonStore,
  DesignDnaPrinciple,
  PageDesignReview,
  ReviewCriterionScore,
} from './types';

function buildCriterionScores(
  overrides: Partial<Record<(typeof HEADQUARTERS_REVIEW_CRITERIA)[number]['id'], ReviewCriterionScore>>
): PageDesignReview['criteria'] {
  const base: PageDesignReview['criteria'] = {} as PageDesignReview['criteria'];
  for (const c of HEADQUARTERS_REVIEW_CRITERIA) {
    base[c.id] = overrides[c.id] ?? { score: 88, note: 'Aligns with canon relationships — demo baseline.' };
  }
  return base;
}

function buildReview(
  partial: Omit<PageDesignReview, 'criteria'> & {
    criteria?: Partial<Record<(typeof HEADQUARTERS_REVIEW_CRITERIA)[number]['id'], ReviewCriterionScore>>;
  }
): PageDesignReview {
  return {
    ...partial,
    criteria: buildCriterionScores(partial.criteria ?? {}),
  };
}

const FRONTAL_SLAYER_CANON_PAGES: CanonPage[] = [
  {
    id: 'concierge',
    label: 'CONCIERGE',
    route: '/account/concierge',
    roomMetaphor: 'Personal welcome — hospitality at the mansion entrance.',
    dominantEmotion: 'Personal hospitality',
    status: 'protected',
    protectedNote: 'PSA presence · marble welcome · trust-first tone — never robotic.',
    visualRelationships: [
      'Spacious personal welcome — not a support ticket queue.',
      'Glass concierge panel floats over marble calm.',
      'Handwritten grace accents on key moments.',
    ],
    rhythmNotes: ['Large welcome · small summary · conversational depth · breathing room.'],
    interactionNotes: ['Soft panel expansion · gentle reveals · never abrupt modals.'],
  },
  {
    id: 'build-a-wig',
    label: 'BUILD-A-WIG',
    route: '/build-a-wig/view',
    roomMetaphor: 'Creative atelier — where customization becomes craft.',
    dominantEmotion: 'Creative freedom',
    status: 'protected',
    protectedNote: 'Leaf-stack thumbs · optical step rhythm · atelier pacing — not a configurator.',
    visualRelationships: [
      'Editorial step progression — large visuals alternate with summaries.',
      'Red accent directs selection · marble holds calm between choices.',
      'Custom compositions per step — never normalized card stacks.',
    ],
    rhythmNotes: ['Hero mannequin · thumb strip · interactive section · pause · next room.'],
    interactionNotes: ['Leaf transitions · soft confirm · layered depth on selections.'],
  },
  {
    id: 'hair-analysis',
    label: 'HAIR ANALYSIS',
    route: '/tools/hairstyle-analysis',
    roomMetaphor: 'Consultation laboratory — expert guidance in a private suite.',
    dominantEmotion: 'Expert guidance',
    status: 'protected',
    protectedNote: 'Clinical luxury · trust over sales · PSA-adjacent expertise tone.',
    visualRelationships: [
      'Laboratory calm — white glass · restrained red highlights.',
      'Results feel consultative — not algorithmic dashboard output.',
    ],
    rhythmNotes: ['Capture moment · analysis reveal · guidance summary · next step invitation.'],
    interactionNotes: ['Gentle upload · layered results reveal · no flash loading states.'],
  },
  {
    id: 'orders',
    label: 'ORDERS',
    route: '/account/orders',
    roomMetaphor: 'Fulfillment office — confidence in every delivery.',
    dominantEmotion: 'Confidence',
    status: 'protected',
    protectedNote: 'Order cards match fulfillment trust — status pills · product imagery · editorial dates.',
    visualRelationships: [
      'Rows feel composed — not stacked SaaS tables.',
      'Product thumbnail anchors each row · status pill whispers state.',
    ],
    rhythmNotes: ['Summary header · order rows · detail expansion · calm footer.'],
    interactionNotes: ['Soft row expansion · status transitions · no jarring refreshes.'],
  },
  {
    id: 'rewards',
    label: 'REWARDS',
    route: '/account/rewards',
    roomMetaphor: 'Gallery — celebration of membership and achievement.',
    dominantEmotion: 'Celebration',
    status: 'protected',
    protectedNote: 'Gallery pacing · collectible presentation · grace numbers on milestones.',
    visualRelationships: [
      'Celebration without clutter — editorial trophy moments.',
      'Red accents on achievement · marble on rest.',
    ],
    rhythmNotes: ['Hero celebration · collectible grid · membership summary · breathing room.'],
    interactionNotes: ['Reveal animations on unlock · glass detail panels.'],
  },
  {
    id: 'appointments',
    label: 'APPOINTMENTS',
    route: '/booking/consultation',
    roomMetaphor: 'Private scheduling lounge — unhurried · intentional.',
    dominantEmotion: 'Personal care',
    status: 'protected',
    protectedNote: 'Booking flows feel lounge-like — never administrative forms.',
    visualRelationships: [
      'Scheduling feels private · soft calendar · marble backdrop.',
      'Premium paths maintain elevated pacing without duplicating layouts.',
    ],
    rhythmNotes: ['Welcome · service selection · time choice · confirmation calm.'],
    interactionNotes: ['Step transitions feel like moving deeper into the lounge.'],
  },
  {
    id: 'client-profile',
    label: 'CLIENT PROFILES',
    route: '/account/settings',
    roomMetaphor: 'Client suite — care for the person behind the membership.',
    dominantEmotion: 'Care',
    status: 'protected',
    protectedNote: 'Account settings rhythm · menu offsets · social block spacing — optical not mathematical.',
    visualRelationships: [
      'Profile feels like a suite — not a settings dashboard.',
      'Handwritten grace on personal details.',
    ],
    rhythmNotes: ['Identity header · menu rhythm · settings depth · sign-out anchor.'],
    interactionNotes: ['Inline edits · soft validation · no harsh error states.'],
  },
  {
    id: 'products',
    label: 'PRODUCTS',
    route: '/home/shop',
    roomMetaphor: 'Luxury showroom — every unit presented as craft.',
    dominantEmotion: 'Desire through restraint',
    status: 'protected',
    protectedNote: 'Showroom editorial · unit PDPs · leaf-brick mannequin language — never generic e-commerce.',
    visualRelationships: [
      'Large product visuals · small editorial copy · red accent on CTA only.',
      'Showroom pacing — not infinite identical product cards.',
    ],
    rhythmNotes: ['Hero collection · category rhythm · unit spotlight · detail depth.'],
    interactionNotes: ['Gallery swipe · soft add-to-bag · layered product shots.'],
  },
];

const DESIGN_DNA_PRINCIPLES: DesignDnaPrinciple[] = [
  {
    id: 'dna-hq-not-website',
    category: 'philosophy',
    title: 'HEADQUARTERS · NOT WEBSITE',
    body: 'Every page is a room inside the mansion — handcrafted · intentional · experiential.',
    whyItMatters: 'Prevents generic SaaS dashboard drift across new pages.',
  },
  {
    id: 'dna-emotional-consistency',
    category: 'philosophy',
    title: 'EMOTIONAL CONSISTENCY OVER UNIFORMITY',
    body: 'Rooms differ in layout but share luxury feeling — rhythm · breathing room · restraint.',
    whyItMatters: 'Allows intentional imperfection while preserving brand soul.',
  },
  {
    id: 'dna-canon-protected',
    category: 'canon-protection',
    title: 'CANON PROTECTION',
    body: 'Existing pages are architectural references — study · understand · never redesign for consistency.',
    whyItMatters: 'Preserves masterpieces while unfinished spaces evolve toward them.',
  },
  {
    id: 'dna-no-pixel-copy',
    category: 'do-not-copy-pixels',
    title: 'DO NOT COPY PIXELS',
    body: 'Never enforce universal spacing values · identify visual relationships instead.',
    whyItMatters: 'Luxury comes from relationships — hero spaciousness · glass float · marble calm.',
  },
  {
    id: 'dna-optical-alignment',
    category: 'optical-alignment',
    title: 'OPTICAL ALIGNMENT',
    body: 'Align according to the eye · not the ruler · preserve what feels correct visually.',
    whyItMatters: 'Frontal Slayer uses optical harmony like luxury brands — measurements may differ.',
  },
  {
    id: 'dna-intentional-imperfection',
    category: 'intentional-imperfection',
    title: 'INTENTIONAL IMPERFECTION',
    body: 'Allow creative asymmetry · custom compositions · organic spacing · grid breaks when luxurious.',
    whyItMatters: 'Avoids machine-generated uniformity that kills craftsmanship.',
  },
  {
    id: 'dna-spatial-storytelling',
    category: 'spatial-storytelling',
    title: 'SPATIAL STORYTELLING',
    body: 'Entering each page should feel like walking into another room — experiential · not administrative.',
    whyItMatters: 'Room metaphors guide new page composition without templating.',
  },
  {
    id: 'dna-emotional-objective',
    category: 'emotional-design',
    title: 'ONE DOMINANT EMOTION',
    body: 'Every page supports one emotional objective — creative freedom · hospitality · confidence · celebration.',
    whyItMatters: 'Focuses design decisions when multiple features compete for attention.',
  },
  {
    id: 'dna-visual-rhythm',
    category: 'visual-rhythm',
    title: 'VISUAL RHYTHM',
    body: 'Alternate large visuals · small summaries · interactive sections · breathing room — editorial pacing.',
    whyItMatters: 'Prevents endless stacks of identical cards that feel like SaaS.',
  },
  {
    id: 'dna-interaction-elegance',
    category: 'interaction',
    title: 'ELEGANT INTERACTIONS',
    body: 'Soft transitions · glass expansion · layered reveals · luxury motion · gentle depth — never flashy.',
    whyItMatters: 'Interactions should feel intentional · never abrupt or gimmicky.',
  },
  {
    id: 'dna-component-evolution',
    category: 'component-evolution',
    title: 'COMPONENT EVOLUTION',
    body: 'Components may evolve but never become generic — ask if the page always belonged here.',
    whyItMatters: 'Final test before considering any new page complete.',
  },
];

export function buildDesignDnaCanonSeed(): Partial<DesignDnaCanonStore> {
  const reviews: PageDesignReview[] = [
    buildReview({
      id: 'review-mobile-showroom-v1',
      pageLabel: 'MOBILE SHOWROOM · V2 REFINEMENT',
      route: '/mobile/showroom',
      isNewPage: true,
      status: 'needs-refinement',
      confidenceScore: 78,
      finalTestAnswer:
        'Not yet — card rhythm too uniform · needs editorial alternation and more breathing room between unit rows.',
      criteria: {
        luxury: { score: 82, note: 'Marble and glass present — density still high in mid-scroll.' },
        'brand-consistency': { score: 85, note: 'Red accent and Futura labels correct · thumb frames need leaf language.' },
        'visual-hierarchy': { score: 80, note: 'Hero strong · secondary rows compete equally.' },
        'breathing-room': { score: 72, note: 'Card stack feels administrative — add pause zones.' },
        'editorial-composition': { score: 74, note: 'Identical card grid — break rhythm with one large visual row.' },
        'interaction-quality': { score: 88, note: 'Transitions soft · glass panels behave well.' },
        'emotional-alignment': { score: 79, note: 'Showroom desire present · celebration undertone missing.' },
        'optical-balance': { score: 76, note: 'Thumb alignment mathematically even · optically stiff.' },
        immersion: { score: 77, note: 'Feels like a new wing — not yet a room that always existed.' },
        'design-dna-alignment': { score: 75, note: 'Would notice it was built later beside canon shop pages.' },
      },
    }),
    buildReview({
      id: 'review-account-concierge-refresh',
      pageLabel: 'CONCIERGE · CANON REFERENCE AUDIT',
      route: '/account/concierge',
      canonPageId: 'concierge',
      isNewPage: false,
      status: 'passed',
      confidenceScore: 96,
      finalTestAnswer: 'Yes — personal hospitality · marble calm · PSA trust — always lived here.',
      criteria: {
        luxury: { score: 97, note: 'Handcrafted welcome · restraint throughout.' },
        'brand-consistency': { score: 98, note: 'Canonical reference — protected.' },
        'visual-hierarchy': { score: 95, note: 'Welcome dominates · support details recede.' },
        'breathing-room': { score: 96, note: 'Negative space creates hospitality calm.' },
        'editorial-composition': { score: 94, note: 'Composed like editorial · not dashboard.' },
        'interaction-quality': { score: 95, note: 'Glass expansion · soft PSA reveals.' },
        'emotional-alignment': { score: 98, note: 'Personal hospitality — dominant and clear.' },
        'optical-balance': { score: 96, note: 'Grace annotations optically guide — not ruler-aligned.' },
        immersion: { score: 97, note: 'Entering feels like mansion welcome.' },
        'design-dna-alignment': { score: 98, note: 'Protected canon — source of truth.' },
      },
      reviewedAt: '2026-07-05T18:00:00.000Z',
    }),
    buildReview({
      id: 'review-build-a-wig-hub',
      pageLabel: 'BUILD-A-WIG · CANON REFERENCE AUDIT',
      route: '/build-a-wig/view',
      canonPageId: 'build-a-wig',
      isNewPage: false,
      status: 'passed',
      confidenceScore: 94,
      finalTestAnswer: 'Yes — atelier rhythm · leaf thumbs · creative freedom — canonical craft room.',
      reviewedAt: '2026-07-05T17:30:00.000Z',
    }),
  ];

  return {
    organizationName: 'FRONTAL SLAYER',
    selectedCanonPageId: 'concierge',
    selectedReviewId: 'review-mobile-showroom-v1',
    activeNavId: 'canon-pages',
    philosophy: [...DESIGN_DNA_PHILOSOPHY],
    finalDesignTest: FINAL_DESIGN_TEST,
    visualRelationshipPatterns: [...VISUAL_RELATIONSHIP_PATTERNS],
    dashboard: {
      summary:
        'DESIGN DNA & CANON SYSTEM V1.0 · FRONTAL SLAYER · permanent creative compass — preserve masterpieces · evolve unfinished spaces.',
      protectedCanonCount: FRONTAL_SLAYER_CANON_PAGES.length,
      principleCount: DESIGN_DNA_PRINCIPLES.length,
      avgReviewConfidence: 89,
      pendingReviews: 1,
    },
    canonPages: FRONTAL_SLAYER_CANON_PAGES,
    principles: DESIGN_DNA_PRINCIPLES,
    reviews,
  };
}

export function bootstrapDesignDnaCanonPlatform(): void {
  bootstrapDesignDnaCanonStore(buildDesignDnaCanonSeed());
}
