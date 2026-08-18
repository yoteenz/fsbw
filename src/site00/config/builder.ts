/**
 * BLDR configuration — build classes, framework pillars, investment guide.
 */

export type BuildClass = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  icon: 'site' | 'world' | 'enterprise' | 'discovery';
  cta: string;
};

export const BLDR_BUILD_CLASSES: BuildClass[] = [
  {
    id: 'site',
    code: '01',
    title: 'SITE',
    subtitle: 'STRUCTURED DIGITAL BUILD.',
    description:
      'Websites, online stores, portfolios, booking systems, memberships, brochures, and more.',
    icon: 'site',
    cta: 'SELECT SITE →',
  },
  {
    id: 'world',
    code: '02',
    title: 'WORLD',
    subtitle: 'BESPOKE DIGITAL EXPERIENCE.',
    description:
      'Immersive experiences, platforms, custom systems, configurators, advanced interaction, and more.',
    icon: 'world',
    cta: 'SELECT WORLD →',
  },
  {
    id: 'enterprise',
    code: '03',
    title: 'ENTERPRISE',
    subtitle: 'COMPLEX DIGITAL SYSTEMS.',
    description:
      'Large-scale systems, multi-user platforms, custom infrastructure, integrations, and advanced security.',
    icon: 'enterprise',
    cta: 'SELECT ENTERPRISE →',
  },
  {
    id: 'not-sure',
    code: '04',
    title: 'NOT SURE?',
    subtitle: 'LET BLDR DETERMINE.',
    description: "Answer a few questions and we'll recommend the right build class for you.",
    icon: 'discovery',
    cta: 'START DISCOVERY →',
  },
];

export type BldrFrameworkPillar = {
  id: string;
  title: string;
  description: string;
  icon: 'direction' | 'structure' | 'function' | 'experience' | 'scope';
};

export const BLDR_FRAMEWORK_PILLARS: BldrFrameworkPillar[] = [
  {
    id: 'direction',
    title: 'DIRECTION',
    description: 'Clarify purpose, goals, target audience, and success metrics.',
    icon: 'direction',
  },
  {
    id: 'structure',
    title: 'STRUCTURE',
    description: 'Define content architecture, page hierarchy, user flows, and navigational logic.',
    icon: 'structure',
  },
  {
    id: 'function',
    title: 'FUNCTION',
    description: 'Identify features, integrations, and system requirements.',
    icon: 'function',
  },
  {
    id: 'experience',
    title: 'EXPERIENCE',
    description: 'Shape the user experience, interactions, mood, and overall vibe.',
    icon: 'experience',
  },
  {
    id: 'scope',
    title: 'SCOPE',
    description: 'Define timeline, budget range, priorities, and project scale.',
    icon: 'scope',
  },
];

export type BldrInvestmentTier = {
  id: string;
  label: string;
  priceLabel: string;
  keywords: string[];
  buildClassId?: string;
};

export const BLDR_INVESTMENT_TIERS: BldrInvestmentTier[] = [
  {
    id: 'site-tier',
    label: 'SITE',
    priceLabel: '$3.5K',
    buildClassId: 'site',
    keywords: ['WEBSITES', 'COMMERCE', 'PORTFOLIOS', 'BOOKINGS', 'MEMBERSHIPS', 'MORE'],
  },
  {
    id: 'world-tier',
    label: 'WORLD',
    priceLabel: '$10K+',
    buildClassId: 'world',
    keywords: ['IMMERSIVE', 'CONFIGURATORS', 'PLATFORMS', 'CUSTOM SYSTEMS', 'INTERACTION', 'MORE'],
  },
  {
    id: 'enterprise-tier',
    label: 'ENTERPRISE',
    priceLabel: '$25K+',
    buildClassId: 'enterprise',
    keywords: ['MULTI-SYSTEM', 'CUSTOM', 'INTEGRATIONS', 'SECURITY', 'ADVANCED', 'MORE'],
  },
  {
    id: 'discovery-tier',
    label: 'NOT SURE?',
    priceLabel: '—',
    buildClassId: 'not-sure',
    keywords: ['QUESTIONNAIRE', 'RECOMMENDATION', 'EXPERT REVIEW', 'CLARITY'],
  },
];

export const BLDR_HOMEPAGE_EXPANDED = {
  number: '02',
  title: 'BLDR',
  subtitle: 'START MY BUILD.',
  overview:
    'BLDR IS THE BLUEPRINT ENGINE. IT GATHERS EVERYTHING WE NEED TO PLAN, STRUCTURE, AND DESIGN YOUR SITE OR WORLD. THE INFORMATION YOU PROVIDE HERE SHAPES YOUR PROJECT\'S FUNCTION, DESIGN, AND OVERALL EXPERIENCE. ONCE COMPLETE, BLDR POWERS THE CREATION OF THREE STRATEGIC BLUEPRINT DIRECTIONS FOR YOUR REVIEW AND SELECTION.',
  offerings: [
    {
      code: '01',
      title: 'SITE',
      description:
        'STRUCTURED DIGITAL BUILD. Websites, ecommerce, portfolios, landing pages, bookings, memberships, and more.',
      price: 'FROM ~$3.5K',
    },
    {
      code: '02',
      title: 'WORLD',
      description:
        'BESPOKE DIGITAL EXPERIENCE. Immersive experiences, platforms, custom systems, configurators, advanced interaction, and more.',
      price: 'FROM ~$10K+',
    },
  ],
  cta: 'BEGIN BLDR',
} as const;

export const BLDR_STATE_COPY = {
  headline: 'WHAT ARE WE BUILDING?',
  subhead: 'CHOOSE THE TYPE OF DIGITAL PLACE YOU NEED.',
  helper: "NOT SURE? WE'LL HELP YOU DETERMINE THE RIGHT BUILD.",
  investmentHeading: 'BLDR / INVESTMENT GUIDE',
  investmentSubhead: 'YOUR BUILD CLASS DETERMINES THE INVESTMENT SCOPE.',
  footer:
    'YOUR VISION SETS THE DIRECTION. ♦ YOUR CHOICES SHAPE THE BUILD. ♦ OUR FRAMEWORK BRINGS IT TO LIFE.',
  locationLabel: 'LOCATION / BLDR / 00',
} as const;
