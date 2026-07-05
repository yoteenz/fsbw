import { DECISION_DIMENSIONS } from './constants';
import { bootstrapExecutiveFrameworkStore } from './store';
import type { ExecutiveFrameworkStore } from './types';

export function buildExecutiveFrameworkSeed(): Partial<ExecutiveFrameworkStore> {
  return {
    companyName: 'NDXBOOK',
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary:
        'EXECUTIVE FRAMEWORK V1.0 — constitutional foundation for every AI executive · coordinated leadership organization.',
      activeExecutives: 6,
      activeCollaborations: 4,
      recommendationPipeline: 7,
      executiveHealthPct: 88,
      organizationalAlignmentPct: 91,
      futureRolesPrepared: 9,
    },
    identityInheritance: [
      { id: 'ii-1', source: 'Company DNA', status: 'inherited', note: 'Editorial intelligence · stat-forward identity' },
      { id: 'ii-2', source: 'Leadership DNA', status: 'inherited', note: 'Founder operating blueprint · decision preferences' },
      { id: 'ii-3', source: 'Creative DNA', status: 'inherited', note: 'Visual and editorial standards' },
      { id: 'ii-4', source: 'Writing DNA', status: 'inherited', note: 'Writing Bible · institutional voice' },
      { id: 'ii-5', source: 'Operational DNA', status: 'partial', note: 'Workflow patterns · maturity improving' },
      { id: 'ii-6', source: 'Founder\'s Promise', status: 'inherited', note: 'North star governing all recommendations' },
      { id: 'ii-7', source: 'Organizational History', status: 'inherited', note: 'Motherboard memory · institutional lessons' },
      { id: 'ii-8', source: 'Relationship Philosophy', status: 'inherited', note: 'Trust before scale · reader-first' },
      { id: 'ii-9', source: 'Knowledge Philosophy', status: 'inherited', note: 'SSOT · knowledge compounds forever' },
    ],
    decisionCriteria: DECISION_DIMENSIONS.map((d, i) => ({
      id: `dc-${i + 1}`,
      dimension: d.toUpperCase(),
      description: `Every executive evaluates ${d} before recommending · display supporting reasoning`,
    })),
    collaborations: [
      { id: 'ec-1', fromExecutive: 'Brand Architect', toExecutive: 'Experience Architect', request: 'Experience review of stat-forward identity expression', status: 'active' },
      { id: 'ec-2', fromExecutive: 'Experience Architect', toExecutive: 'Digital Architect', request: 'Digital feasibility of onboarding journey improvements', status: 'active' },
      { id: 'ec-3', fromExecutive: 'Digital Architect', toExecutive: 'Growth Architect', request: 'Growth implications of editorial mode ecosystem', status: 'resolved' },
      { id: 'ec-4', fromExecutive: 'Growth Architect', toExecutive: 'Brand Architect', request: 'Brand validation of 100K readers GTM sequencing', status: 'active' },
      { id: 'ec-5', fromExecutive: 'Chief of Staff', toExecutive: 'All Architects', request: 'Coordinate GTM forum decision alignment before founder escalation', status: 'active' },
    ],
    institutionalMemory: [
      { id: 'em-1', category: 'DECISION', memory: 'Trust before scale · first customer shaped monetization path', date: '2026-01' },
      { id: 'em-2', category: 'LESSON', memory: 'Onboarding friction · almost launched too early · experience pivot', date: '2026-06' },
      { id: 'em-3', category: 'SUCCESS', memory: 'Writing Bible institutionalization · all copy aligned', date: '2026-02' },
      { id: 'em-4', category: 'PREFERENCE', memory: 'Founder prefers relationship metrics over vanity acquisition', date: '2026-04' },
      { id: 'em-5', category: 'FAILED EXPERIMENT', memory: 'Generic media template copy · rejected · voice preserved', date: '2025-12' },
      { id: 'em-6', category: 'EVOLUTION', memory: 'Architect Studio opened · executives now coordinate in forum', date: '2026-07' },
    ],
    executiveWorkspaces: [
      { id: 'ew-1', executive: 'Chief of Staff', office: 'Executive Council · HQ lobby', activePriorities: 5, pendingRecommendations: 3, location: 'Architect Studio · central forum' },
      { id: 'ew-2', executive: 'Brand Architect', office: 'Brand Studio · north wing', activePriorities: 4, pendingRecommendations: 2, location: 'Architect Studio' },
      { id: 'ew-3', executive: 'Experience Architect', office: 'Experience Studio · east wing', activePriorities: 3, pendingRecommendations: 2, location: 'Architect Studio' },
      { id: 'ew-4', executive: 'Digital Architect', office: 'Digital Studio · south wing', activePriorities: 4, pendingRecommendations: 1, location: 'Architect Studio' },
      { id: 'ew-5', executive: 'Growth Architect', office: 'Growth Studio · west wing', activePriorities: 5, pendingRecommendations: 2, location: 'Architect Studio' },
      { id: 'ew-6', executive: 'Business Architect', office: 'Business Studio · strategy floor', activePriorities: 3, pendingRecommendations: 1, location: 'Company Maturity Engine link' },
    ],
    accountability: [
      { id: 'am-1', executive: 'Chief of Staff', metric: 'Recommendation quality', score: 92, trend: 'up' },
      { id: 'am-2', executive: 'Brand Architect', metric: 'Decision accuracy', score: 89, trend: 'stable' },
      { id: 'am-3', executive: 'Experience Architect', metric: 'Collaboration quality', score: 87, trend: 'up' },
      { id: 'am-4', executive: 'Digital Architect', metric: 'Knowledge contribution', score: 85, trend: 'up' },
      { id: 'am-5', executive: 'Growth Architect', metric: 'Organizational impact', score: 90, trend: 'stable' },
      { id: 'am-6', executive: 'Business Architect', metric: 'Learning velocity', score: 88, trend: 'up' },
    ],
    recommendationPipeline: [
      { id: 'rp-1', executive: 'Chief of Staff', summary: 'GTM forum sequencing · relationship-first launch', confidence: 88, alignmentScore: 94, hasAlternatives: true },
      { id: 'rp-2', executive: 'Brand Architect', summary: 'Stat-forward identity lock · no generic templates', confidence: 95, alignmentScore: 96, hasAlternatives: false },
      { id: 'rp-3', executive: 'Experience Architect', summary: 'Onboarding friction fix before scale', confidence: 91, alignmentScore: 96, hasAlternatives: true },
      { id: 'rp-4', executive: 'Digital Architect', summary: 'Editorial mode · immersive not hype-driven', confidence: 87, alignmentScore: 92, hasAlternatives: true },
      { id: 'rp-5', executive: 'Growth Architect', summary: '100K readers · relationship-driven acquisition', confidence: 90, alignmentScore: 94, hasAlternatives: true },
    ],
    futureExecutives: [
      { id: 'fe-1', title: 'Chief Brand Officer', readiness: 'architecture-ready', inheritsFramework: true },
      { id: 'fe-2', title: 'Chief Experience Officer', readiness: 'architecture-ready', inheritsFramework: true },
      { id: 'fe-3', title: 'Chief Digital Officer', readiness: 'architecture-ready', inheritsFramework: true },
      { id: 'fe-4', title: 'Chief Growth Officer', readiness: 'architecture-ready', inheritsFramework: true },
      { id: 'fe-5', title: 'Chief Financial Officer', readiness: 'planned', inheritsFramework: true },
      { id: 'fe-6', title: 'Chief Operating Officer', readiness: 'planned', inheritsFramework: true },
      { id: 'fe-7', title: 'Chief Legal Officer', readiness: 'future', inheritsFramework: true },
      { id: 'fe-8', title: 'Chief People Officer', readiness: 'future', inheritsFramework: true },
      { id: 'fe-9', title: 'Chief Technology Officer', readiness: 'planned', inheritsFramework: true },
      { id: 'fe-10', title: 'Chief Research Officer', readiness: 'future', inheritsFramework: true },
    ],
    leadershipMap: [
      { id: 'lm-1', executive: 'Chief of Staff', responsibility: 'Coordinate executives · founder briefing · decision routing', authority: 'Recommend · escalate · never decide', reportsTo: 'Founder' },
      { id: 'lm-2', executive: 'Business Architect', responsibility: 'Business model · maturity · strategic foundation', authority: 'Blueprint · assess · recommend', reportsTo: 'Chief of Staff' },
      { id: 'lm-3', executive: 'Brand Architect', responsibility: 'Brand identity · verbal/visual systems', authority: 'Design · validate · handoff', reportsTo: 'Chief of Staff' },
      { id: 'lm-4', executive: 'Experience Architect', responsibility: 'Customer journey · emotional architecture', authority: 'Map · simulate · recommend', reportsTo: 'Chief of Staff' },
      { id: 'lm-5', executive: 'Digital Architect', responsibility: 'Digital ecosystem · solution architecture', authority: 'Architect · preview · handoff', reportsTo: 'Chief of Staff' },
      { id: 'lm-6', executive: 'Growth Architect', responsibility: 'Sustainable growth · GTM · experiments', authority: 'Plan · orchestrate · measure', reportsTo: 'Chief of Staff' },
    ],
    organizationalPriorities: [
      '100K readers initiative · relationship-driven GTM',
      'Onboarding experience pivot · trust before scale',
      'Creator marketplace pilot · quality gate via Writing DNA',
      'Architect Studio coordination · forum alignment before escalation',
    ],
    recommendedNextSteps: [
      'Resolve Brand ↔ Growth GTM validation collaboration',
      'Review Chief of Staff GTM forum recommendation with founder',
      'Complete Operational DNA inheritance for all executives',
      'Prepare CFO architecture-ready role definition',
    ],
    futureOpportunities: [
      'Automatic recommendation format validation across all executives',
      'Executive health dashboard synced to Company Genome',
      'Cross-portfolio executive organization for holding companies',
      'Decision history lineage in Knowledge Graph',
    ],
  };
}

export function bootstrapExecutiveFrameworkPlatform(): void {
  bootstrapExecutiveFrameworkStore(buildExecutiveFrameworkSeed());
}
