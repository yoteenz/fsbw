import { bootstrapCampusEvolutionStore } from './store';
import type { CampusEvolutionStore } from './types';

export function buildCampusEvolutionSeed(): Partial<CampusEvolutionStore> {
  return {
    companyName: 'NDXBOOK',
    dashboard: {
      summary:
        'CAMPUS EVOLUTION ENGINE V1.0 — walk through decades of organizational growth · architecture earned through progress.',
      currentStageId: 'creative-headquarters',
      stageProgressPct: 68,
      organizationalHealthPct: 87,
      knowledgeGrowthPct: 84,
      relationshipGrowthPct: 79,
      innovationPct: 81,
      activeConstruction: 3,
      futureExpansionPct: 72,
    },
    activeWorkspaceId: 'ndxbook',
    dayOneSpaces: [
      { id: 'd1-1', label: 'FOUNDER\'S WORKSPACE', purpose: 'Possibility · calm premium materials · bright atmosphere' },
      { id: 'd1-2', label: 'EXECUTIVE BRIEFING ROOM', purpose: 'Morning arrival · CoS briefing · strategic clarity' },
      { id: 'd1-3', label: 'COLLABORATION AREA', purpose: 'Small team · first decisions · innovation table' },
      { id: 'd1-4', label: 'KNOWLEDGE WALL', purpose: 'Institutional seed · writing rules · company blueprint' },
      { id: 'd1-5', label: 'INNOVATION TABLE', purpose: 'Prototype · brainstorm · first concepts' },
      { id: 'd1-6', label: 'COMPANY BLUEPRINT', purpose: 'Mission · vision · 100K readers north star' },
    ],
    stages: [
      { id: 'startup-studio', label: 'STARTUP STUDIO', description: 'Day one · founder studio · possibility', current: false, progressPct: 100 },
      { id: 'innovation-loft', label: 'INNOVATION LOFT', description: 'First product · early team · knowledge wall grows', current: false, progressPct: 100 },
      { id: 'creative-headquarters', label: 'CREATIVE HEADQUARTERS', description: 'Brand identity · experience atelier · newsroom', current: true, progressPct: 68 },
      { id: 'executive-headquarters', label: 'EXECUTIVE HEADQUARTERS', description: 'Leadership maturity · executive council', current: false, progressPct: 42 },
      { id: 'innovation-campus', label: 'INNOVATION CAMPUS', description: 'Multiple products · creator pavilion · innovation lab', current: false, progressPct: 28 },
      { id: 'global-campus', label: 'GLOBAL CAMPUS', description: 'International expansion · relationship center', current: false, progressPct: 12 },
      { id: 'organizational-institute', label: 'ORGANIZATIONAL INSTITUTE', description: 'Knowledge institute · legacy hall · teaching', current: false, progressPct: 5 },
      { id: 'legacy-campus', label: 'LEGACY CAMPUS', description: 'Decades of intentional leadership · living monument', current: false, progressPct: 0 },
    ],
    organicEvolution: [
      { id: 'oe-1', category: 'PRODUCT', achievement: 'Editorial platform launch · first 1K readers', architecturalImpact: 'Newsroom tower foundation laid', earnedAt: '2026-01' },
      { id: 'oe-2', category: 'KNOWLEDGE', achievement: 'Writing Bible v2 · institutional voice', architecturalImpact: 'Knowledge library wing expanded', earnedAt: '2026-02' },
      { id: 'oe-3', category: 'BRAND', achievement: 'Brand Architect handoff · stat-forward identity', architecturalImpact: 'Brand pavilion opened', earnedAt: '2026-03' },
      { id: 'oe-4', category: 'COMMUNITY', achievement: '12K engaged readers · advocacy threshold', architecturalImpact: 'Community commons inaugurated', earnedAt: '2026-06' },
      { id: 'oe-5', category: 'MATURITY', achievement: 'Company Maturity Engine · domain scan complete', architecturalImpact: 'Strategy observatory under construction', earnedAt: '2026-05' },
      { id: 'oe-6', category: 'INNOVATION', achievement: 'Architect Studio + Living Headquarters', architecturalImpact: 'Executive council chamber connected', earnedAt: '2026-07' },
    ],
    earnedSpaces: [
      { id: 'es-1', label: 'BRAND PAVILION', earnedBecause: 'Brand Architect · cohesive identity system', status: 'active' },
      { id: 'es-2', label: 'EXPERIENCE ATELIER', earnedBecause: 'Experience Architect · journey maps approved', status: 'active' },
      { id: 'es-3', label: 'DIGITAL ENGINEERING WING', earnedBecause: 'Digital Architect · editorial mode gallery', status: 'active' },
      { id: 'es-4', label: 'NEWSROOM TOWER', earnedBecause: '100K readers initiative · editorial production', status: 'active' },
      { id: 'es-5', label: 'RELATIONSHIP CENTER', earnedBecause: 'Reader graph milestone · 12K engaged', status: 'active' },
      { id: 'es-6', label: 'KNOWLEDGE LIBRARY', earnedBecause: 'Knowledge Asset Engine · SSOT model', status: 'active' },
      { id: 'es-7', label: 'STRATEGY OBSERVATORY', earnedBecause: 'Leadership maturity · executive alignment', status: 'under-construction' },
      { id: 'es-8', label: 'INNOVATION LABORATORY', earnedBecause: 'Growth Architect · GTM simulations', status: 'under-construction' },
      { id: 'es-9', label: 'CUSTOMER EXPERIENCE GALLERY', earnedBecause: 'Experience friction resolution pending', status: 'planned' },
      { id: 'es-10', label: 'LEGACY HALL', earnedBecause: 'Organizational institute threshold · decades ahead', status: 'planned' },
    ],
    companyMemory: [
      { id: 'cm-1', category: 'FOUNDING', title: 'NDXBOOK conceived · editorial stat-forward vision', date: '2025-11', architecturalMemorial: 'Founder\'s gallery · origin wall' },
      { id: 'cm-2', category: 'FIRST CUSTOMER', title: 'First paying reader · validation moment', date: '2026-01', architecturalMemorial: 'First customer plaque · knowledge wall' },
      { id: 'cm-3', category: 'CAMPAIGN', title: '100K readers initiative launched', date: '2026-04', architecturalMemorial: 'Campaign hall · growth wing' },
      { id: 'cm-4', category: 'KNOWLEDGE', title: 'Writing Bible institutionalized', date: '2026-02', architecturalMemorial: 'Knowledge archive · writing DNA exhibit' },
      { id: 'cm-5', category: 'RELATIONSHIP', title: '12K engaged readers milestone', date: '2026-06', architecturalMemorial: 'Relationship gallery · reader advocacy wall' },
      { id: 'cm-6', category: 'INNOVATION', title: 'Living Headquarters opens', date: '2026-07', architecturalMemorial: 'Innovation archive · campus timeline' },
    ],
    livingMuseum: [
      { id: 'lm-1', name: 'FOUNDER\'S GALLERY', contents: 'Origin story · first blueprint · early decisions · possibility preserved' },
      { id: 'lm-2', name: 'INNOVATION ARCHIVE', contents: 'Architect Studio evolution · simulation outcomes · failed experiments honored' },
      { id: 'lm-3', name: 'CAMPAIGN HALL', contents: '100K readers · editorial launches · stat-forward campaigns over time' },
      { id: 'lm-4', name: 'RELATIONSHIP GALLERY', contents: 'Reader graph evolution · advocacy · community milestones' },
      { id: 'lm-5', name: 'KNOWLEDGE ARCHIVE', contents: 'Writing Bible · institutional memory · compounding IP' },
      { id: 'lm-6', name: 'PRODUCT EVOLUTION', contents: 'Platform iterations · feature lineage · digital architect handoffs' },
      { id: 'lm-7', name: 'COMPANY TIMELINE', contents: 'Full organizational journey · genome mutations · decade view' },
    ],
    brandInheritance: {
      companyName: 'NDXBOOK',
      identity: 'Editorial · stat-forward · luxury minimal · no hype',
      materials: 'Carrara marble · white oak · brushed steel · linen · Futura typography',
      colors: 'Black · white · Grace metrics · subtle gold accent · never Frontal Slayer red-dominant',
      architecture: 'Bright natural light · editorial gallery proportions · stat display walls',
      motionLanguage: 'Calm transitions · Grace numbers animate · purposeful not flashy',
      lighting: 'Daylight-forward · warm reading spots · editorial spotlight on milestones',
      uniqueness: 'Unmistakably NDXBOOK — editorial intelligence campus · never resembles Frontal Slayer commerce HQ',
    },
    cultureProfile: {
      profile: 'Editorial · media · knowledge-first',
      influences: ['Writing DNA', 'Brand Architect', 'Experience blueprint', 'Leadership DNA'],
      expression: 'Gallery layouts · reading rooms · stat-forward exhibits · calm intellectual momentum',
    },
    portfolioDistricts: [
      { id: 'pd-1', label: 'SHARED EXECUTIVE COUNCIL', sharedBy: ['NDXBOOK', 'STUDIO OS', 'FRONTAL SLAYER'], purpose: 'Portfolio governance · cross-company decisions' },
      { id: 'pd-2', label: 'SHARED KNOWLEDGE INSTITUTE', sharedBy: ['NDXBOOK', 'STUDIO OS'], purpose: 'Institutional learning · motherboard · agent memory' },
      { id: 'pd-3', label: 'SHARED ORGANIZATIONAL INTELLIGENCE HUB', sharedBy: ['All portfolio companies'], purpose: 'Studio Intelligence · genome comparison · campus recommendations' },
      { id: 'pd-4', label: 'SHARED CREATOR PAVILION', sharedBy: ['NDXBOOK', 'FRONTAL SLAYER'], purpose: 'Creator marketplace · talent network crossover' },
    ],
    campusIntelligence: [
      { id: 'ci-1', category: 'NEW SPACE', recommendation: 'Customer experience gallery · resolve onboarding friction before construction completes', priority: 'high' },
      { id: 'ci-2', category: 'DEPARTMENT GROWTH', recommendation: 'Digital engineering wing expansion · hybrid architecture lab', priority: 'medium' },
      { id: 'ci-3', category: 'KNOWLEDGE', recommendation: 'Knowledge library annex · Knowledge Asset Engine maturity', priority: 'medium' },
      { id: 'ci-4', category: 'RELATIONSHIP', recommendation: 'Relationship center expansion · reader advocacy exhibit', priority: 'low' },
      { id: 'ci-5', category: 'INNOVATION', recommendation: 'Innovation campus threshold approaching · prepare creator pavilion', priority: 'high' },
    ],
    livingEnvironment: [
      { id: 'le-1', eventType: 'CONSTRUCTION', label: 'Strategy observatory · leadership maturity wing', status: 'active' },
      { id: 'le-2', eventType: 'CONSTRUCTION', label: 'Innovation laboratory · GTM simulation chamber', status: 'active' },
      { id: 'le-3', eventType: 'RENOVATION', label: 'Knowledge library · SSOT exhibit refresh', status: 'active' },
      { id: 'le-4', eventType: 'NEW WING', label: 'Relationship center · advocacy gallery expansion', status: 'planned' },
      { id: 'le-5', eventType: 'PUBLIC SPACE', label: 'Community commons · celebration terrace', status: 'planned' },
    ],
    simulations: [
      { id: 'sim-1', horizon: '5 YEARS', scenario: 'Innovation campus · 100K readers achieved · creator pavilion live', campusPreview: 'Newsroom tower complete · strategy observatory active · relationship center expanded', shapedBy: 'Today\'s GTM decisions · experience friction resolution · knowledge compounding' },
      { id: 'sim-2', horizon: '10 YEARS', scenario: 'Global campus · international editorial expansion', campusPreview: 'Global commons · regional wings · knowledge institute founding', shapedBy: 'International expansion simulation · brand inheritance · leadership succession' },
      { id: 'sim-3', horizon: '20 YEARS', scenario: 'Organizational institute · teaching the NDXBOOK model', campusPreview: 'Legacy hall · founder\'s gallery complete · organizational institute campus', shapedBy: 'Decades of intentional leadership · community · culture · legacy' },
      { id: 'sim-4', horizon: 'HOLDING CO', scenario: 'Portfolio campus · shared districts across NDXBOOK · FS · Studio OS', campusPreview: 'Interconnected HQ · shared intelligence hub · distinct brand inheritance per company', shapedBy: 'Portfolio genetics · cross-company knowledge · organizational inheritance' },
    ],
    recommendedNextSteps: [
      'Walk company timeline · confirm creative headquarters progression at 68%',
      'Review active construction · strategy observatory + innovation laboratory',
      'Preview 5-year simulation · validate GTM path shapes campus correctly',
      'Resolve experience gallery prerequisite before customer experience wing',
    ],
    futureOpportunities: [
      'Real-time construction animation synced from organizational milestones',
      'Brand inheritance auto-rendered from Brand Architect + Experience Architect',
      'Portfolio campus fly-through between distinct company headquarters',
      'Legacy campus unlock tied to organizational institute threshold',
    ],
  };
}

export function bootstrapCampusEvolutionPlatform(): void {
  bootstrapCampusEvolutionStore(buildCampusEvolutionSeed());
}
