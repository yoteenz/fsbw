import { bootstrapArchitectStudioStore } from './store';
import type { ArchitectStudioStore } from './types';

export function buildArchitectStudioSeed(): Partial<ArchitectStudioStore> {
  return {
    companyName: 'NDXBOOK',
    dashboard: {
      summary:
        'ARCHITECT STUDIO V1.0 — enter the innovation headquarters · five connected studios · one living campus.',
      studioHealthPct: 87,
      activeProjects: 12,
      collaborationScorePct: 84,
      innovationPct: 79,
      genomeSyncPct: 83,
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
      { id: 'ew-7', date: '2026-07', category: 'INNOVATION', label: 'Architect Studio V1.0 · innovation headquarters opens', genomeImpact: '+7% collaboration' },
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
      { id: 'ig-5', category: 'STRATEGIC', signal: 'Genome sync at 83% · maturity assessment refresh due', recommendedStudio: 'business-studio', priority: 'low' },
    ],
    personalization: {
      architecture: 'Modern minimal atelier · floor-to-ceiling glass · open sightlines',
      lighting: 'Bright natural daylight · warm accent spots',
      materials: 'White oak · brushed steel · Carrara marble · linen',
      ambientSound: 'Calm innovation studio · optional lo-fi focus',
      theme: 'Luxury futurist · Studio OS design language preserved',
    },
    portfolioCampus: [
      { id: 'ndxbook', name: 'NDXBOOK', studioHealthPct: 87, activeArchitects: 5 },
      { id: 'frontal-slayer', name: 'FRONTAL SLAYER', studioHealthPct: 91, activeArchitects: 4 },
      { id: 'studio-os', name: 'STUDIO OS', studioHealthPct: 94, activeArchitects: 5 },
    ],
    recommendedNextSteps: [
      'Enter Experience Studio · resolve onboarding friction before launch scale',
      'Gather in collaboration forum · GTM sequencing decision with CoS',
      'Review evolution wall · confirm genome trajectory toward 100K readers',
      'Innovation lab · compare international expansion concepts',
    ],
    futureOpportunities: [
      'Full 3D spatial campus with ambient sound and artwork personalization',
      'Real-time architect avatar collaboration in forum',
      'Evolution wall synced live from Company Genome mutations',
      'Portfolio campus with shared innovation spaces across holdings',
    ],
  };
}

export function bootstrapArchitectStudioPlatform(): void {
  bootstrapArchitectStudioStore(buildArchitectStudioSeed());
}
