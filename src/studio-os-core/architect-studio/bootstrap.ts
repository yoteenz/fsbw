import { bootstrapArchitectStudioStore } from './store';
import type { ArchitectStudioStore, LivingHeadquarters } from './types';

function buildLivingHeadquartersSeed(): LivingHeadquarters {
  return {
    philosophy: [
      'Organizations never stop working — Studio OS should never feel paused',
      'Arrive at work inside your headquarters · not opening software',
      'Every executive already working before the founder arrives · join an org in motion',
      'Every visible activity represents meaningful intelligence · collaboration · execution',
    ],
    morningArrival: [
      { id: 'ma-1', executive: 'Chief of Staff', studioId: 'lobby', activity: 'Preparing today\'s executive briefing · pending approvals queued', status: 'preparing' },
      { id: 'ma-2', executive: 'Growth Architect', studioId: 'growth-studio', activity: 'Reviewing campaign projections · 100K readers trajectory', status: 'reviewing' },
      { id: 'ma-3', executive: 'Digital Architect', studioId: 'digital-studio', activity: 'Presenting prototype updates · editorial mode gallery walk-through', status: 'presenting' },
      { id: 'ma-4', executive: 'Brand Architect', studioId: 'brand-studio', activity: 'Refining stat-forward identity concepts · competitive whitespace', status: 'reviewing' },
      { id: 'ma-5', executive: 'Experience Architect', studioId: 'experience-studio', activity: 'Reviewing customer journey improvements · onboarding friction', status: 'reviewing' },
      { id: 'ma-6', executive: 'Studio Intelligence', studioId: 'forum', activity: 'Processing overnight organizational learning · genome mutations', status: 'processing' },
      { id: 'ma-7', executive: 'Business Architect', studioId: 'business-studio', activity: 'Maturity domain scan · architect recommendations refreshed', status: 'preparing' },
    ],
    executiveBriefing: {
      preparedBy: 'Chief of Staff',
      organizationalHealthPct: 87,
      majorWins: [
        'Reader graph +12% engaged readers overnight',
        'Knowledge maturity increased after yesterday\'s publication',
        'Campaign simulation completed · GTM path validated',
      ],
      majorRisks: [
        'Onboarding friction flagged by Experience Architect · resolve before scale',
        'Founder bottleneck on 2 pending approvals',
      ],
      pendingApprovals: [
        'GTM launch sequencing · Growth + Digital alignment',
        'Brand positioning refresh · stat-forward variant',
      ],
      todaysPriorities: [
        'Resolve onboarding friction in Experience Studio',
        'Forum gathering · GTM sequencing decision',
        'Review international expansion simulation results',
      ],
      recommendedFocus: 'Experience Studio · onboarding journey — highest impact before launch scale',
      opportunities: [
        'Three partnership opportunities identified overnight',
        'Brand positioning whitespace · competitive differentiation window',
        'Innovation lab · international expansion ready to compare',
      ],
      overnightIntelligence: [
        'Studio Intelligence processed 14 organizational signals',
        'Genome sync +2% · relationship strength rising',
        'Market intelligence updated · reader insights refreshed',
      ],
      estimatedFounderWorkload: 'Moderate · 2 approvals · 1 forum decision · ~45 min focused work',
    },
    executivePresence: [
      { id: 'ep-1', name: 'Chief of Staff', role: 'EXECUTIVE COORDINATOR', currentLocation: 'lobby', currentActivity: 'Finalizing morning briefing · routing approvals', movement: 'Lobby → Forum when founder arrives' },
      { id: 'ep-2', name: 'Growth Architect', role: 'GROWTH ARCHITECT', currentLocation: 'growth-studio', currentActivity: 'Campaign projection review · GTM sequencing prep', movement: 'Growth Studio ↔ Forum' },
      { id: 'ep-3', name: 'Digital Architect', role: 'DIGITAL ARCHITECT', currentLocation: 'digital-studio', currentActivity: 'Prototype presentation · hybrid architecture demo', movement: 'Digital Studio → Innovation Lab' },
      { id: 'ep-4', name: 'Brand Architect', role: 'BRAND ARCHITECT', currentLocation: 'brand-studio', currentActivity: 'Identity concept refinement · verbal system polish', movement: 'Brand Studio ↔ Experience Studio' },
      { id: 'ep-5', name: 'Experience Architect', role: 'EXPERIENCE ARCHITECT', currentLocation: 'experience-studio', currentActivity: 'Journey map review · friction analysis', movement: 'Experience Studio → Forum' },
      { id: 'ep-6', name: 'Business Architect', role: 'BUSINESS ARCHITECT', currentLocation: 'business-studio', currentActivity: 'Maturity assessment · domain scan', movement: 'Business Studio ↔ Brand Studio' },
      { id: 'ep-7', name: 'Studio Intelligence', role: 'ORG INTELLIGENCE', currentLocation: 'forum', currentActivity: 'Overnight learning synthesis · recommendation queue', movement: 'Forum → All studios' },
    ],
    ambientActivity: [
      { id: 'aa-1', category: 'HOLOGRAPHIC', label: 'Genome health display updating · 87% unified', intensity: 'subtle' },
      { id: 'aa-2', category: 'KNOWLEDGE FLOW', label: 'Knowledge Asset Engine → all studios · institutional circulation', intensity: 'subtle' },
      { id: 'aa-3', category: 'SIMULATION', label: 'Campaign timeline evolving · traction stage metrics', intensity: 'moderate' },
      { id: 'aa-4', category: 'RELATIONSHIP', label: 'New reader insights arriving · advocacy signals', intensity: 'subtle' },
      { id: 'aa-5', category: 'MARKET INTEL', label: 'Competitive landscape refresh · whitespace detected', intensity: 'subtle' },
      { id: 'aa-6', category: 'GENOME', label: 'Organizational genome evolving · +2% overnight sync', intensity: 'subtle' },
    ],
    overheardConversations: [
      { id: 'oc-1', speakers: 'Growth Architect · Studio Intelligence', snippet: '"The latest reader insights suggest we should prioritize relationship-driven acquisition over paid channels this quarter."', context: 'GTM strategy alignment' },
      { id: 'oc-2', speakers: 'Digital Architect · Experience Architect', snippet: '"The campaign simulation completed overnight — onboarding friction is the bottleneck before we scale."', context: 'Launch readiness' },
      { id: 'oc-3', speakers: 'Business Architect · Brand Architect', snippet: '"We identified three partnership opportunities that align with our stat-forward positioning."', context: 'Market expansion' },
      { id: 'oc-4', speakers: 'Chief of Staff · Growth Architect', snippet: '"Knowledge maturity increased after yesterday\'s publication — the genome reflects it."', context: 'Institutional learning' },
    ],
    livingArchitecture: [
      { id: 'la-arch-1', change: 'Innovation wall expanded · international expansion simulation mounted', trigger: 'Innovation lab milestone', visibleSince: '2026-07-05' },
      { id: 'la-arch-2', change: 'Achievement gallery grew · 100K readers initiative plaque added', trigger: 'Growth architect activation', visibleSince: '2026-04' },
      { id: 'la-arch-3', change: 'Memory corridor extended · Company Genome heartbeat installation', trigger: 'Genome V1.0 launch', visibleSince: '2026-05' },
      { id: 'la-arch-4', change: 'Collaboration forum ring upgraded · executive presence sensors live', trigger: 'Living Headquarters V1.5', visibleSince: '2026-07-05' },
    ],
    executiveAvailability: [
      { id: 'ea-1', executive: 'Chief of Staff', state: 'available', detail: 'Briefing ready · awaiting founder arrival' },
      { id: 'ea-2', executive: 'Growth Architect', state: 'has-recommendations', detail: 'GTM sequencing recommendation prepared' },
      { id: 'ea-3', executive: 'Digital Architect', state: 'collaborating', detail: 'Prototype walk-through in progress' },
      { id: 'ea-4', executive: 'Experience Architect', state: 'collaborating', detail: 'Journey review with Digital Architect' },
      { id: 'ea-5', executive: 'Brand Architect', state: 'researching', detail: 'Competitive positioning analysis' },
      { id: 'ea-6', executive: 'Business Architect', state: 'available', detail: 'Maturity scan complete · recommendations ready' },
      { id: 'ea-7', executive: 'Studio Intelligence', state: 'has-recommendations', detail: '3 priority signals · experience studio attention' },
      { id: 'ea-8', executive: 'Founder', state: 'awaiting-approval', detail: '2 decisions queued in briefing' },
    ],
    organizationalRhythm: {
      currentPhase: 'early-morning',
      label: 'EARLY MORNING · QUIET PLANNING',
      description: 'Executives preparing · briefing assembling · calm intelligence before collaboration peaks',
      energyPct: 52,
    },
    headquartersCulture: {
      profile: 'Editorial · stat-forward · luxury minimal',
      inheritedFrom: ['Brand Architect identity', 'Experience blueprint', 'Writing DNA · Company DNA'],
      expression: 'Bright natural light · marble · Futura typography · Grace metrics · calm momentum',
    },
    memorySpaces: [
      { id: 'ms-1', category: 'FOUNDING', title: 'NDXBOOK editorial platform conceived', date: '2025-11', significance: 'Origin moment · founding gallery' },
      { id: 'ms-2', category: 'LAUNCH', title: 'Platform launch · first 1K readers', date: '2026-01', significance: 'Launch milestone · achievement wall' },
      { id: 'ms-3', category: 'KNOWLEDGE', title: 'Writing Bible v2 institutionalized', date: '2026-02', significance: 'Knowledge breakthrough · memory corridor' },
      { id: 'ms-4', category: 'CUSTOMER', title: '12K engaged readers · advocacy threshold', date: '2026-06', significance: 'Relationship achievement · reader gallery' },
      { id: 'ms-5', category: 'INNOVATION', title: 'Architect Studio opens · innovation HQ', date: '2026-07', significance: 'Headquarters milestone · living architecture' },
    ],
  };
}

export function buildArchitectStudioSeed(): Partial<ArchitectStudioStore> {
  const livingHeadquarters = buildLivingHeadquartersSeed();
  return {
    companyName: 'NDXBOOK',
    dashboard: {
      summary:
        'LIVING HEADQUARTERS V1.5 — arrive at work inside your company · organization already in motion before you interact.',
      studioHealthPct: 87,
      activeProjects: 12,
      collaborationScorePct: 84,
      innovationPct: 79,
      genomeSyncPct: 85,
      activeSpatialMode: 'campus',
      focusedStudioId: null,
    },
    activeWorkspaceId: 'ndxbook',
    studios: [
      { id: 'business-studio', label: 'BUSINESS STUDIO', tagline: 'Where ideas become businesses', architectModule: 'Company Maturity Engine', healthPct: 86, activeProjects: 3, liveDiscussions: 2, accentColor: '#0369A1' },
      { id: 'brand-studio', label: 'BRAND STUDIO', tagline: 'Where businesses become brands', architectModule: 'Brand Architect', healthPct: 88, activeProjects: 2, liveDiscussions: 1, accentColor: '#BE185D' },
      { id: 'experience-studio', label: 'EXPERIENCE STUDIO', tagline: 'Where brands become unforgettable experiences', architectModule: 'Experience Architect', healthPct: 85, activeProjects: 2, liveDiscussions: 2, accentColor: '#0891B2' },
      { id: 'digital-studio', label: 'DIGITAL STUDIO', tagline: 'Where experiences become digital ecosystems', architectModule: 'Digital Architect', healthPct: 84, activeProjects: 3, liveDiscussions: 1, accentColor: '#6366F1' },
      { id: 'growth-studio', label: 'GROWTH STUDIO', tagline: 'Where businesses become enduring organizations', architectModule: 'Growth Architect', healthPct: 82, activeProjects: 2, liveDiscussions: 2, accentColor: '#059669' },
    ],
    collaborationForum: {
      summary: 'Circular executive design forum — founder · CoS · studio intelligence · architects gather for major decisions.',
      activeParticipants: ['Founder', 'Chief of Staff', 'Studio Intelligence', 'Brand Architect', 'Growth Architect'],
      pendingDecisions: 2,
      lastGathering: '2026-07-04 · GTM launch sequencing review',
    },
    livingActivities: [
      { id: 'la-1', studioId: 'business-studio', activityType: 'PROJECT', label: '100K readers maturity assessment · domain scan active', status: 'active' },
      { id: 'la-2', studioId: 'brand-studio', activityType: 'RECOMMENDATION', label: 'Brand Architect proposes stat-forward positioning refresh', status: 'review' },
      { id: 'la-3', studioId: 'experience-studio', activityType: 'DISCUSSION', label: 'Journey friction identified · onboarding touchpoint review', status: 'active' },
      { id: 'la-4', studioId: 'digital-studio', activityType: 'SIMULATION', label: 'Editorial mode gallery walk-through · hybrid architecture preview', status: 'simulation' },
      { id: 'la-5', studioId: 'growth-studio', activityType: 'PROJECT', label: 'Traction stage initiative · relationship-driven GTM plan', status: 'active' },
      { id: 'la-6', studioId: 'business-studio', activityType: 'KNOWLEDGE', label: 'Knowledge flowing from Knowledge Asset Engine → all studios', status: 'active' },
    ],
    architectCollaborations: [
      { id: 'ac-1', fromArchitect: 'Business Architect', toArchitect: 'Brand Architect', topic: 'Market validation complete · ready for brand positioning', status: 'coordinated' },
      { id: 'ac-2', fromArchitect: 'Brand Architect', toArchitect: 'Experience Architect', topic: 'Approved identity handoff · journey map alignment', status: 'open' },
      { id: 'ac-3', fromArchitect: 'Experience Architect', toArchitect: 'Digital Architect', topic: 'Customer friction at onboarding · digital touchpoint rec', status: 'open' },
      { id: 'ac-4', fromArchitect: 'Digital Architect', toArchitect: 'Growth Architect', topic: 'Ecosystem launch ready · GTM sequencing recommendation', status: 'coordinated' },
      { id: 'ac-5', fromArchitect: 'Growth Architect', toArchitect: 'Business Architect', topic: 'Market expansion validation request', status: 'open' },
      { id: 'ac-6', fromArchitect: 'Chief of Staff', toArchitect: 'All Architects', topic: 'Coordinating major launch decision · forum gathering', status: 'coordinated' },
    ],
    evolutionWall: [
      { id: 'ew-1', date: '2026-01', category: 'LAUNCH', label: 'NDXBOOK editorial platform launch', genomeImpact: '+4% innovation' },
      { id: 'ew-2', date: '2026-02', category: 'KNOWLEDGE', label: 'Writing Bible v2 · institutional voice locked', genomeImpact: '+3% writing DNA' },
      { id: 'ew-3', date: '2026-03', category: 'BRAND', label: 'Brand Architect handoff · stat-forward identity', genomeImpact: '+5% brand consistency' },
      { id: 'ew-4', date: '2026-04', category: 'CAMPAIGN', label: '100K readers initiative · growth architect activated', genomeImpact: '+6% growth genetics' },
      { id: 'ew-5', date: '2026-05', category: 'GENOME', label: 'Company Genome V1.0 · living organizational heartbeat', genomeImpact: '+8% unified health' },
      { id: 'ew-6', date: '2026-06', category: 'RELATIONSHIP', label: 'Reader graph milestone · 12K engaged readers', genomeImpact: '+4% relationship strength' },
      { id: 'ew-7', date: '2026-07', category: 'INNOVATION', label: 'Living Headquarters V1.5 · continuously alive campus', genomeImpact: '+7% collaboration' },
    ],
    innovationLab: [
      { id: 'il-1', title: 'International expansion prototype', phase: 'simulate', status: 'Comparing UK vs Canada market entry' },
      { id: 'il-2', title: 'Premium membership tier concept', phase: 'brainstorm', status: 'Founder + Growth Architect ideation' },
      { id: 'il-3', title: 'Community marketplace experiment', phase: 'prototype', status: 'Digital + Growth collaboration' },
      { id: 'il-4', title: 'Executive hire simulation · CMO', phase: 'compare', status: 'Genome impact preview before commit' },
    ],
    intelligenceGuides: [
      { id: 'ig-1', category: 'ATTENTION', signal: 'Experience Studio requires attention · onboarding friction detected', recommendedStudio: 'experience-studio', priority: 'high' },
      { id: 'ig-2', category: 'OPPORTUNITY', signal: 'Brand positioning whitespace · competitive differentiation window', recommendedStudio: 'brand-studio', priority: 'medium' },
      { id: 'ig-3', category: 'DECISION', signal: 'Major GTM launch sequencing · forum gathering recommended', recommendedStudio: 'forum', priority: 'critical' },
      { id: 'ig-4', category: 'BREAKTHROUGH', signal: 'Innovation lab simulation ready · international expansion', recommendedStudio: 'innovation-lab', priority: 'medium' },
      { id: 'ig-5', category: 'STRATEGIC', signal: 'Genome sync at 85% · maturity assessment refresh due', recommendedStudio: 'business-studio', priority: 'low' },
    ],
    personalization: {
      architecture: 'Modern minimal atelier · floor-to-ceiling glass · open sightlines · living architecture',
      lighting: 'Bright natural daylight · warm accent spots · rhythm-aware dimming',
      materials: 'White oak · brushed steel · Carrara marble · linen',
      ambientSound: 'Calm innovation studio · subtle organizational rhythm',
      theme: 'Editorial luxury · inherited from brand + experience DNA',
    },
    portfolioCampus: [
      { id: 'ndxbook', name: 'NDXBOOK', studioHealthPct: 87, activeArchitects: 5 },
      { id: 'frontal-slayer', name: 'FRONTAL SLAYER', studioHealthPct: 91, activeArchitects: 4 },
      { id: 'studio-os', name: 'STUDIO OS', studioHealthPct: 94, activeArchitects: 5 },
    ],
    recommendedNextSteps: [
      'Review morning briefing · begin with Experience Studio friction resolution',
      'Gather in collaboration forum · GTM sequencing decision with CoS',
      'Walk memory corridor · confirm organizational trajectory',
      'Innovation lab · compare international expansion concepts',
    ],
    futureOpportunities: [
      'Real-time executive movement animation between studios',
      'Rhythm-aware lighting and ambient sound by organizational tempo',
      'Memory spaces auto-populated from Company Genome milestones',
      'Portfolio headquarters with shared innovation bridges',
    ],
    livingHeadquarters,
  };
}

export function bootstrapArchitectStudioPlatform(): void {
  bootstrapArchitectStudioStore(buildArchitectStudioSeed());
}
