import { bootstrapFounderWalkStore } from './store';
import type { FounderWalkStore } from './types';

export function buildFounderWalkSeed(): Partial<FounderWalkStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'FOUNDER WALK V1.0 — the emotional spine of the campus · preserve the soul of the organization · not a trophy case.',
      pathLengthMilestones: 14,
      reflectionSpaces: 5,
      preservedMemories: 8,
      activeTimelineEra: 'year-one',
      landscapeMaturityPct: 42,
      legacyDepthPct: 58,
    },
    dayOnePath: {
      description: 'Single marble pathway from headquarters entrance to founder studio · quiet · simple · hopeful · unfinished',
      atmosphere: 'Possibility rather than success · bright premium materials · calm · intentional silence',
    },
    pathwayMilestones: [
      { id: 'pm-1', category: 'FOUNDING', title: 'NDXBOOK conceived · editorial stat-forward vision', date: '2025-11', architecturalMemory: 'Origin marble inscription at path entrance', memoryType: 'inscription' },
      { id: 'pm-2', category: 'FIRST PRODUCT', title: 'Editorial platform prototype live', date: '2025-12', architecturalMemory: 'First stepping stone · polished marble', memoryType: 'installation' },
      { id: 'pm-3', category: 'FIRST CUSTOMER', title: 'First paying reader · validation', date: '2026-01', architecturalMemory: 'Reflecting pool · first trust', memoryType: 'bridge' },
      { id: 'pm-4', category: 'FIRST COMMUNITY', title: '100th engaged reader', date: '2026-02', architecturalMemory: 'Community garden planted', memoryType: 'garden' },
      { id: 'pm-5', category: 'KNOWLEDGE', title: 'Writing Bible v2 institutionalized', date: '2026-02', architecturalMemory: 'Knowledge tree · roots deepen', memoryType: 'tree' },
      { id: 'pm-6', category: 'FIRST PARTNERSHIP', title: 'Creator marketplace pilot partner', date: '2026-03', architecturalMemory: 'Partnership bridge across path', memoryType: 'bridge' },
      { id: 'pm-7', category: 'BRAND', title: 'Stat-forward identity locked', date: '2026-03', architecturalMemory: 'Brand sculpture · editorial form', memoryType: 'sculpture' },
      { id: 'pm-8', category: 'CAMPAIGN', title: '100K readers initiative launched', date: '2026-04', architecturalMemory: 'Campaign pavilion · growth marker', memoryType: 'pavilion' },
      { id: 'pm-9', category: 'RELATIONSHIP', title: '12K engaged readers · advocacy', date: '2026-06', architecturalMemory: 'Relationship courtyard · reader stories', memoryType: 'courtyard' },
      { id: 'pm-10', category: 'INNOVATION', title: 'Architect Studio opens', date: '2026-07', architecturalMemory: 'Innovation terrace extension', memoryType: 'pavilion' },
      { id: 'pm-11', category: 'LESSON', title: 'Onboarding friction lesson · experience pivot', date: '2026-06', architecturalMemory: 'Wisdom bench · what we learned', memoryType: 'installation' },
      { id: 'pm-12', category: 'GENOME', title: 'Company Genome heartbeat live', date: '2026-05', architecturalMemory: 'Crystal installation · living organism', memoryType: 'installation' },
      { id: 'pm-13', category: 'CAMPUS', title: 'Campus Evolution Engine · earned architecture', date: '2026-07', architecturalMemory: 'Path connects to legacy hall', memoryType: 'bridge' },
      { id: 'pm-14', category: 'LEGACY', title: 'Founder Walk opens · emotional spine', date: '2026-07', architecturalMemory: 'Legacy pavilion at path horizon', memoryType: 'pavilion' },
    ],
    memoryMarkers: [
      { id: 'mm-1', milestoneId: 'pm-1', whyItMattered: 'Defined editorial intelligence as the product — not hype', whatWasLearned: 'Stat-forward voice attracts the right readers', whoMadeItPossible: 'Founder vision · early believers', whatAlmostWentWrong: 'Nearly copied generic media templates', whatChangedAfter: 'Writing DNA became institutional', futureAdvice: 'Never compromise voice for velocity' },
      { id: 'mm-2', milestoneId: 'pm-3', whyItMattered: 'First proof someone would pay for editorial intelligence', whatWasLearned: 'Trust before scale', whoMadeItPossible: 'First reader · founder persistence', whatChangedAfter: 'Monetization path validated', futureAdvice: 'Honor first customers forever on the walk' },
      { id: 'mm-3', milestoneId: 'pm-5', whyItMattered: 'Institutional memory began compounding', whatWasLearned: 'Writing rules scale better than individual talent', whoMadeItPossible: 'Memory Bible · editorial team', whatChangedAfter: 'Knowledge Asset Engine foundation', futureAdvice: 'Document decisions while memory is fresh' },
      { id: 'mm-4', milestoneId: 'pm-8', whyItMattered: '100K readers became the north star metric', whatWasLearned: 'Relationship-driven growth over paid acquisition', whoMadeItPossible: 'Growth Architect · reader graph', whatChangedAfter: 'GTM sequencing aligned to trust', futureAdvice: 'Measure relationships · not vanity' },
      { id: 'mm-5', milestoneId: 'pm-11', whyItMattered: 'Friction taught more than any success', whatWasLearned: 'Experience before scale · onboarding is the product', whoMadeItPossible: 'Experience Architect · reader feedback', whatAlmostWentWrong: 'Almost launched before fixing journey', whatChangedAfter: 'Customer experience gallery planned', futureAdvice: 'Preserve lessons · not just wins' },
    ],
    reflectionSpaces: [
      { id: 'rs-1', label: 'FOUNDER\'S BENCH', purpose: 'Day one reflection · why you started', locationOnPath: 'Entrance · marble pathway start' },
      { id: 'rs-2', label: 'REFLECTION GARDEN', purpose: 'Quiet pause · appreciate progress', locationOnPath: 'After first customer pool' },
      { id: 'rs-3', label: 'INNOVATION TERRACE', purpose: 'Look forward · prototype tomorrow', locationOnPath: 'Architect Studio connection' },
      { id: 'rs-4', label: 'MEMORY COURTYARD', purpose: 'Reader stories · relationship gratitude', locationOnPath: '12K readers milestone' },
      { id: 'rs-5', label: 'VISION OVERLOOK', purpose: 'See entire path · decade perspective', locationOnPath: 'Legacy pavilion approach' },
    ],
    livingLandscape: [
      { id: 'll-1', element: 'Knowledge trees', evolution: 'Saplings → mature canopy · roots visible', season: 'Spring growth' },
      { id: 'll-2', element: 'Community garden', evolution: 'First plot → expanded beds · seasonal blooms', season: 'Summer fullness' },
      { id: 'll-3', element: 'Reflecting pool', evolution: 'Still water · deeper with each reader milestone', season: 'Autumn reflection' },
      { id: 'll-4', element: 'Marble pathway', evolution: 'Single strip → winding journey · new stones per milestone', season: 'Year-round' },
      { id: 'll-5', element: 'Legacy pavilion', evolution: 'Foundation laid → structure rising · horizon marker', season: 'Winter clarity' },
    ],
    organizationalConnections: [
      { id: 'oc-1', memoryId: 'pm-5', connectedSystem: 'Knowledge Asset Engine', connection: 'Writing Bible → SSOT knowledge asset' },
      { id: 'oc-2', memoryId: 'pm-8', connectedSystem: 'Campaign Engine', connection: '100K initiative → campaign orchestration' },
      { id: 'oc-3', memoryId: 'pm-9', connectedSystem: 'Reader Graph', connection: '12K engaged → relationship milestone' },
      { id: 'oc-4', memoryId: 'pm-12', connectedSystem: 'Company Genome', connection: 'Genome mutation recorded on path' },
      { id: 'oc-5', memoryId: 'pm-7', connectedSystem: 'Leadership DNA', connection: 'Brand taste · founder operating blueprint' },
      { id: 'oc-6', memoryId: 'pm-11', connectedSystem: 'Experience Architect', connection: 'Friction lesson → journey improvement' },
    ],
    futureGenerations: [
      { id: 'fg-1', category: 'PHILOSOPHY', insight: 'Editorial intelligence over hype · stat-forward forever' },
      { id: 'fg-2', category: 'DECISION', insight: 'Trust before scale · first customer shaped everything' },
      { id: 'fg-3', category: 'VALUES', insight: 'Institutional memory compounds · document while fresh' },
      { id: 'fg-4', category: 'SACRIFICE', insight: 'Slow brand build over quick growth hacks' },
      { id: 'fg-5', category: 'TURNING POINT', insight: 'Onboarding friction · almost launched too early' },
      { id: 'fg-6', category: 'LESSON', insight: 'Relationships measure success · not revenue alone' },
    ],
    familyLegacy: [
      { id: 'fl-1', title: 'Family inspiration', note: 'Built for readers who think · not algorithms', visibility: 'private' },
      { id: 'fl-2', title: 'Early believers', note: 'Three people who said yes before proof existed', visibility: 'shared' },
      { id: 'fl-3', title: 'Personal sacrifice', note: 'Years of editorial craft before traction', visibility: 'private' },
    ],
    portfolioLegacy: [
      { id: 'pl-1', fromCompany: 'NDXBOOK', toCompany: 'STUDIO OS', influence: 'Editorial OS patterns · motherboard memory model' },
      { id: 'pl-2', fromCompany: 'STUDIO OS', toCompany: 'NDXBOOK', influence: 'Architect pipeline · campus evolution methodology' },
      { id: 'pl-3', fromCompany: 'NDXBOOK', toCompany: 'FRONTAL SLAYER', influence: 'Relationship engine · reader graph concepts' },
    ],
    memoryIntelligence: [
      { id: 'mi-1', signal: 'GTM sequencing decision will define year two trajectory', recommendation: 'Preserve forum decision story on the walk before details fade', priority: 'high' },
      { id: 'mi-2', signal: 'Onboarding friction lesson influenced multiple future campaigns', recommendation: 'Expand memory marker · link to Experience Architect handoff', priority: 'high' },
      { id: 'mi-3', signal: 'First creator partnership became foundational relationship', recommendation: 'Add partnership bridge memory · who made it possible', priority: 'medium' },
      { id: 'mi-4', signal: 'Writing Bible institutionalization changed all copy forever', recommendation: 'Connect knowledge tree to Knowledge Asset Engine lineage', priority: 'medium' },
    ],
    campusIntegration: [
      { id: 'ci-1', campusLocation: 'Architect Studio', connection: 'Path enters through headquarters lobby · morning arrival' },
      { id: 'ci-2', campusLocation: 'Knowledge Library', connection: 'Knowledge trees link to institutional assets' },
      { id: 'ci-3', campusLocation: 'Legacy Hall', connection: 'Path terminus · future generations entrance' },
      { id: 'ci-4', campusLocation: 'Executive Council', connection: 'Major decisions marked on path' },
      { id: 'ci-5', campusLocation: 'Innovation Lab', connection: 'Innovation terrace overlooks experiments' },
      { id: 'ci-6', campusLocation: 'Company Genome', connection: 'Genome mutations appear as path stones' },
    ],
    recommendedNextSteps: [
      'Walk year-one timeline · reflect at founder\'s bench',
      'Preserve GTM forum decision memory before details fade',
      'Connect onboarding lesson marker to Experience Architect',
      'Preview year-five path projection · legacy pavilion horizon',
    ],
    futureOpportunities: [
      'Voice recordings and photos attached to memory markers',
      'Seasonal landscape animation synced to organizational rhythm',
      'Portfolio walk bridges between company headquarters',
      'Future generation guided tour mode · founder philosophy narration',
    ],
  };
}

export function bootstrapFounderWalkPlatform(): void {
  bootstrapFounderWalkStore(buildFounderWalkSeed());
}
