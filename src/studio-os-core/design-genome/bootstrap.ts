import { DESIGN_GENOME_PHILOSOPHY, PRE_BUILD_QUESTION } from './constants';
import { bootstrapDesignGenomeStore } from './store';
import type { DesignGenomeEntry, DesignGenomeStore } from './types';
import type { ModuleTenantId } from '../workspace/tenant-ids';

function entry(
  partial: Omit<DesignGenomeEntry, 'organizationId' | 'genomeLabel' | 'referencedBy' | 'references' | 'searchKeywords'> & {
    organizationId: ModuleTenantId;
    genomeLabel: string;
    referencedBy?: string[];
    references?: string[];
  }
): DesignGenomeEntry {
  return {
    ...partial,
    referencedBy: partial.referencedBy ?? [],
    references: partial.references ?? [],
    searchKeywords: [
      partial.title,
      partial.scope,
      partial.level,
      ...partial.tags,
      partial.versions[0]?.capture.route ?? '',
    ],
  };
}

function buildFrontalSlayerAdminSeed(): DesignGenomeEntry[] {
  const hero = entry({
    id: 'dg-fs-admin-profile-hero',
    organizationId: 'frontal-slayer',
    genomeLabel: 'FRONTAL SLAYER ADMIN GENOME',
    scope: 'admin-dashboard',
    level: 'hero',
    title: 'CLIENT PROFILE HERO',
    tags: ['hero', 'dashboard', 'customer-experience', 'luxury-layout', 'admin'],
    versions: [
      {
        versionNumber: 3,
        promotedAt: '2026-07-04T14:00:00.000Z',
        founderPhrase: 'Keep this Hero — use this spacing going forward.',
        reasoning: {
          summary: 'Customer Profile Hero — benchmark for admin client suite pages.',
          approvedBecause: [
            'Excellent visual hierarchy',
            'Luxury breathing room',
            'Strong typography rhythm',
            'Balanced spacing · calm information density',
            'Clear executive summary',
          ],
        },
        analysis: {
          purpose: 'Personal client suite welcome — care over administration.',
          pageType: 'ADMIN DASHBOARD',
          sectionType: 'HERO',
          informationHierarchy: ['Identity leads', 'Stats support', 'Actions recede'],
          componentRelationships: ['Hero anchors menu rhythm below', 'Social block optically aligned'],
          visualRhythm: ['Large identity · small labels · breathing room before menu'],
          interactionStyle: ['Soft menu expansion · no abrupt panel swaps'],
          layoutPhilosophy: 'Suite-like profile — not settings dashboard.',
          luxuryCharacteristics: ['Grace accents · restrained red · marble calm'],
          organizationalPurpose: 'Teaches admin client pages how to feel personal.',
        },
        capture: {
          route: '/admin/clients',
          pageLabel: 'CLIENT PROFILE',
          componentPath: 'Client Details › Hero › Profile Header',
          structureSummary: 'Auto-captured structure · hierarchy · spacing rhythm · no screenshot.',
          typography: ['Futura PT Medium labels', 'Covered By Your Grace stats', '13px value rhythm'],
          spacingRhythm: ['Optical menu offsets · 20px social block · translateY micro-adjustments'],
          animationBehavior: ['Tab transitions soft · image viewer layered reveal'],
          visualHierarchy: ['Name + photo dominate', 'Referral block right-aligned optically'],
          interactionPatterns: ['Search overview-only · details nav + back'],
          metadata: { scope: 'admin-dashboard', level: 'hero', version: '3' },
        },
        status: 'current',
      },
      {
        versionNumber: 2,
        promotedAt: '2026-06-01T10:00:00.000Z',
        founderPhrase: 'Promote this Hero v2',
        reasoning: { summary: 'Prior hero iteration', approvedBecause: ['Strong hierarchy'] },
        analysis: {
          purpose: 'Earlier profile hero',
          pageType: 'ADMIN DASHBOARD',
          sectionType: 'HERO',
          informationHierarchy: [],
          componentRelationships: [],
          visualRhythm: [],
          interactionStyle: [],
          layoutPhilosophy: 'Superseded',
          luxuryCharacteristics: [],
          organizationalPurpose: 'Historical',
        },
        capture: {
          route: '/admin/clients',
          pageLabel: 'CLIENT PROFILE',
          componentPath: 'Client Details › Hero v2',
          structureSummary: 'Version 2 capture',
          typography: [],
          spacingRhythm: [],
          animationBehavior: [],
          visualHierarchy: [],
          interactionPatterns: [],
          metadata: { version: '2' },
        },
        status: 'superseded',
      },
    ],
    references: [],
  });

  const ordersCard = entry({
    id: 'dg-fs-admin-orders-row',
    organizationId: 'frontal-slayer',
    genomeLabel: 'FRONTAL SLAYER ADMIN GENOME',
    scope: 'admin-dashboard',
    level: 'card',
    title: 'ORDERS ROW CARD',
    tags: ['cards', 'dashboard', 'customer-experience', 'admin'],
    references: ['dg-fs-admin-profile-hero'],
    versions: [
      {
        versionNumber: 1,
        promotedAt: '2026-07-03T11:00:00.000Z',
        founderPhrase: 'Keep this card style.',
        reasoning: {
          summary: 'Orders/Appointments shared row language.',
          approvedBecause: ['Composed rows not SaaS tables', 'Status pill whispers state', 'Product thumbnail anchors'],
        },
        analysis: {
          purpose: 'Fulfillment confidence in admin client details.',
          pageType: 'ADMIN DASHBOARD',
          sectionType: 'CARD',
          informationHierarchy: ['Date leads', 'Type secondary', 'Status pill right'],
          componentRelationships: ['Matches appointments tab optically', '85×85 left anchor'],
          visualRhythm: ['Row · row · pause · empty state calm'],
          interactionStyle: ['Row expansion soft'],
          layoutPhilosophy: 'Editorial list — not data grid.',
          luxuryCharacteristics: ['Covered By Your Grace dates', 'Futura type scale'],
          organizationalPurpose: 'Reference for admin list patterns.',
        },
        capture: {
          route: '/admin/clients',
          pageLabel: 'CLIENT ORDERS TAB',
          componentPath: 'Client Details › Orders › Row Card',
          structureSummary: 'Flex row · 85×85 thumb · pill status',
          typography: ['Grace 16px date', 'Futura 10px type', 'Futura 8px pill'],
          spacingRhythm: ['gap 12px · time translateY(-2px)'],
          animationBehavior: ['None abrupt'],
          visualHierarchy: ['Left thumb · center story · right status'],
          interactionPatterns: ['Click row for detail'],
          metadata: { sharedWith: 'appointments-tab' },
        },
        status: 'current',
      },
    ],
  });

  hero.referencedBy = ['dg-fs-admin-orders-row'];
  ordersCard.referencedBy = [];

  return [hero, ordersCard];
}

function buildFrontalSlayerWebsiteSeed(): DesignGenomeEntry[] {
  return [
    entry({
      id: 'dg-fs-web-concierge-welcome',
      organizationId: 'frontal-slayer',
      genomeLabel: 'FRONTAL SLAYER WEBSITE GENOME',
      scope: 'customer-website',
      level: 'hero',
      title: 'CONCIERGE WELCOME',
      tags: ['hero', 'customer-experience', 'glass-panels', 'luxury-layout', 'interactive'],
      versions: [
        {
          versionNumber: 1,
          promotedAt: '2026-07-05T16:00:00.000Z',
          founderPhrase: 'This page is now Canon.',
          reasoning: {
            summary: 'Concierge personal hospitality — protected canon.',
            approvedBecause: [
              'Spacious welcome',
              'Glass panel floats on marble',
              'Trust-first PSA tone',
              'Handwritten grace guides attention',
            ],
          },
          analysis: {
            purpose: 'Mansion entrance hospitality.',
            pageType: 'CUSTOMER WEBSITE',
            sectionType: 'HERO',
            informationHierarchy: ['Welcome dominates', 'Conversation depth follows'],
            componentRelationships: ['PSA panel · marble · grace accents'],
            visualRhythm: ['Large welcome · small summary · conversational depth'],
            interactionStyle: ['Glass expansion · gentle reveals'],
            layoutPhilosophy: 'Personal welcome — not support queue.',
            luxuryCharacteristics: ['Negative space · restraint · trust over sales'],
            organizationalPurpose: 'Canon reference for hospitality rooms.',
          },
          capture: {
            route: '/account/concierge',
            pageLabel: 'CONCIERGE',
            componentPath: 'Concierge › Welcome Hero',
            structureSummary: 'Auto-captured · relationships · interaction patterns',
            typography: ['Futura labels', 'Grace accents'],
            spacingRhythm: ['Generous hero breathing room'],
            animationBehavior: ['Soft panel expansion'],
            visualHierarchy: ['Welcome first · details follow'],
            interactionPatterns: ['PSA messaging layered'],
            metadata: { canon: 'protected' },
          },
          status: 'current',
        },
      ],
    }),
  ];
}

function buildNdxbookSeed(): DesignGenomeEntry[] {
  return [
    entry({
      id: 'dg-ndx-article-hero',
      organizationId: 'ndxbook',
      genomeLabel: 'NDXBOOK GENOME',
      scope: 'ndxbook',
      level: 'hero',
      title: 'KNOWLEDGE PAGE HERO',
      tags: ['hero', 'editorial', 'publishing', 'luxury-layout'],
      versions: [
        {
          versionNumber: 2,
          promotedAt: '2026-07-02T09:00:00.000Z',
          founderPhrase: 'Promote this Hero — editorial benchmark.',
          reasoning: {
            summary: 'NDXBOOK article hero — trust-first editorial.',
            approvedBecause: ['Editorial hierarchy', 'Reader journey clarity', 'Indigo accent discipline'],
          },
          analysis: {
            purpose: 'Reader trust at first impression.',
            pageType: 'NDXBOOK',
            sectionType: 'HERO',
            informationHierarchy: ['Title · subtitle · read time · CTA calm'],
            componentRelationships: ['Volume context · chapter markers'],
            visualRhythm: ['Editorial pause · content depth follows'],
            interactionStyle: ['Scroll reveals · no flash'],
            layoutPhilosophy: 'Journal luxury — not blog template.',
            luxuryCharacteristics: ['Breathing room · indigo CTA only'],
            organizationalPurpose: 'Benchmark for knowledge pages.',
          },
          capture: {
            route: '/ndxbook/lace-mastery/cutting-your-lace',
            pageLabel: 'LACE MASTERY PAGE',
            componentPath: 'Article › Hero',
            structureSummary: 'Editorial hero capture',
            typography: ['Serif headline · Futura meta'],
            spacingRhythm: ['Wide measure · generous margin'],
            animationBehavior: ['Subtle scroll'],
            visualHierarchy: ['Headline dominates'],
            interactionPatterns: ['Subscribe CTA restrained'],
            metadata: { series: 'lace-mastery' },
          },
          status: 'current',
        },
      ],
    }),
  ];
}

function buildStudioOsSeed(): DesignGenomeEntry[] {
  return [
    entry({
      id: 'dg-so-mission-dept-cards',
      organizationId: 'studio-os',
      genomeLabel: 'STUDIO OS GENOME',
      scope: 'studio-os-hq',
      level: 'card',
      title: 'MISSION CONTROL DEPARTMENT CARDS',
      tags: ['dashboard', 'executive-summary', 'headquarters', 'glass-panels', 'organization'],
      versions: [
        {
          versionNumber: 1,
          promotedAt: '2026-07-06T10:00:00.000Z',
          founderPhrase: 'Use this card style everywhere in HQ.',
          reasoning: {
            summary: 'M83 department cards — executive IA benchmark.',
            approvedBecause: [
              'Icon-supported navigation',
              'Health ring communicates status',
              'One primary question per page',
              'Workspace transforms beneath selection',
            ],
          },
          analysis: {
            purpose: 'Executive department navigation without dashboard clutter.',
            pageType: 'STUDIO OS HQ',
            sectionType: 'CARD',
            informationHierarchy: ['Department name · status dot · enter wing'],
            componentRelationships: ['Hero above · focus panel below on select'],
            visualRhythm: ['Cards as destinations · not equal-weight panels'],
            interactionStyle: ['Wing-enter microinteraction · soft scale'],
            layoutPhilosophy: 'Executive IA — guided headquarters.',
            luxuryCharacteristics: ['Marble · glass · red accent discipline'],
            organizationalPurpose: 'HQ navigation DNA for all Studio OS modules.',
          },
          capture: {
            route: '/admin/studio/mission-control',
            pageLabel: 'MISSION CONTROL',
            componentPath: 'Mission Control › Department Cards',
            structureSummary: 'ExecutiveDepartmentCard grid capture',
            typography: ['Futura 8px labels', 'Grace health metrics'],
            spacingRhythm: ['Grid gap 2 · panel breathe'],
            animationBehavior: ['studio-wing-enter · pipeline-flow'],
            visualHierarchy: ['Hero first · cards second · focus on select'],
            interactionPatterns: ['Select transforms workspace zone'],
            metadata: { milestone: 'M83' },
          },
          status: 'current',
        },
      ],
    }),
  ];
}

const GENOME_LABELS: Record<ModuleTenantId, string> = {
  'frontal-slayer': 'FRONTAL SLAYER DESIGN GENOME',
  ndxbook: 'NDXBOOK GENOME',
  'studio-os': 'STUDIO OS GENOME',
  portfolio: 'VXD GENOME',
};

const ORG_NAMES: Record<ModuleTenantId, string> = {
  'frontal-slayer': 'FRONTAL SLAYER',
  ndxbook: 'NDXBOOK',
  'studio-os': 'STUDIO OS',
  portfolio: 'VXD INC',
};

export function buildDesignGenomeSeed(organizationId: ModuleTenantId = 'frontal-slayer'): Partial<DesignGenomeStore> {
  let entries: DesignGenomeEntry[] = [];
  if (organizationId === 'frontal-slayer') {
    entries = [...buildFrontalSlayerAdminSeed(), ...buildFrontalSlayerWebsiteSeed()];
  } else if (organizationId === 'ndxbook') {
    entries = buildNdxbookSeed();
  } else if (organizationId === 'studio-os') {
    entries = buildStudioOsSeed();
  } else {
    entries = buildStudioOsSeed().map((e) => ({
      ...e,
      organizationId,
      genomeLabel: GENOME_LABELS[organizationId] ?? `${ORG_NAMES[organizationId]} GENOME`,
    }));
  }

  const preBuildReviews = [
    {
      id: 'pbr-demo-appointments',
      problem: 'New admin appointments summary section',
      queriedAt: '2026-07-06T11:00:00.000Z',
      matches: [
        {
          entryId: 'dg-fs-admin-orders-row',
          title: 'ORDERS ROW CARD',
          relevanceScore: 88,
          matchReason: 'Matches card pattern · shared with appointments tab',
          recommendation: 'inherit' as const,
        },
        {
          entryId: 'dg-fs-admin-profile-hero',
          title: 'CLIENT PROFILE HERO',
          relevanceScore: 62,
          matchReason: 'Same client details context · hierarchy reference',
          recommendation: 'evolve' as const,
        },
      ],
      recommendation: 'inherit' as const,
      reasoning:
        'Design Genome contains approved ORDERS ROW CARD — inherit before inventing new list pattern.',
    },
  ];

  return {
    organizationId,
    organizationName: ORG_NAMES[organizationId] ?? organizationId.toUpperCase(),
    genomeLabel: GENOME_LABELS[organizationId] ?? `${ORG_NAMES[organizationId]} GENOME`,
    selectedEntryId: entries[0]?.id ?? null,
    selectedReviewId: preBuildReviews[0]?.id ?? null,
    philosophy: [...DESIGN_GENOME_PHILOSOPHY],
    preBuildQuestion: PRE_BUILD_QUESTION,
    entries,
    preBuildReviews: organizationId === 'frontal-slayer' ? preBuildReviews : [],
    dashboard: {
      summary: `DESIGN GENOME V1.0 · ${ORG_NAMES[organizationId]} · organizational visual memory · learn design thinking · preserve identity.`,
      approvedPatterns: entries.length,
      currentVersions: entries.length,
      lineageLinks: entries.reduce((n, e) => n + e.referencedBy.length + e.references.length, 0),
      pendingPromotions: 1,
    },
    pendingPromotions:
      organizationId === 'frontal-slayer'
        ? [
            {
              id: 'promo-demo-membership',
              founderPhrase: 'I love this graph style everywhere.',
              route: '/admin/dashboard',
              pageLabel: 'ADMIN DASHBOARD REVENUE',
              detectedLevel: 'graph',
              detectedScope: 'admin-dashboard',
              status: 'pending-capture',
              createdAt: '2026-07-06T12:00:00.000Z',
            },
          ]
        : [],
  };
}

export function bootstrapDesignGenomePlatform(): void {
  bootstrapDesignGenomeStore(buildDesignGenomeSeed('frontal-slayer'));
}

export function bootstrapDesignGenomeForOrganization(organizationId: ModuleTenantId): void {
  bootstrapDesignGenomeStore(buildDesignGenomeSeed(organizationId));
}
