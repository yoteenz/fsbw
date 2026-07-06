import type { GettingStartedStep } from './types';

/** Progressive onboarding — advanced systems unlock later. */
export const GETTING_STARTED_PROGRESSION: GettingStartedStep[] = [
  {
    phase: 'organization',
    title: 'YOUR ORGANIZATION',
    summary: 'Studio OS begins with your organization — identity, workspace, and registry.',
    moduleId: 'studio-os',
    routeSegment: 'studio-os',
    unlockAfterPhases: [],
    order: 1,
  },
  {
    phase: 'blueprint',
    title: 'BUSINESS DISCOVERY BLUEPRINT™',
    summary: 'Capture how your business operates before automation.',
    moduleId: 'business-discovery-blueprint',
    routeSegment: 'business-discovery-blueprint',
    unlockAfterPhases: ['organization'],
    order: 2,
  },
  {
    phase: 'profession-brain',
    title: 'PROFESSION BRAIN™',
    summary: 'Your expertise becomes living organizational intelligence.',
    moduleId: 'profession-brain',
    routeSegment: 'profession-brain',
    unlockAfterPhases: ['blueprint'],
    order: 3,
  },
  {
    phase: 'headquarters',
    title: 'HEADQUARTERS',
    summary: 'Mission Control — your executive nerve center.',
    moduleId: 'mission-control',
    routeSegment: 'mission-control',
    unlockAfterPhases: ['profession-brain'],
    order: 4,
  },
  {
    phase: 'command-dock',
    title: 'COMMAND DOCK™',
    summary: 'Speak naturally — Studio OS routes intelligently.',
    moduleId: 'command-dock',
    routeSegment: 'command-dock',
    unlockAfterPhases: ['headquarters'],
    order: 5,
  },
  {
    phase: 'departments',
    title: 'DEPARTMENTS',
    summary: 'Each wing reflects how your business actually operates.',
    unlockAfterPhases: ['command-dock'],
    order: 6,
  },
  {
    phase: 'digital-concierges',
    title: 'DIGITAL CONCIERGES',
    summary: 'Hire intelligence employees on Digital Payroll.',
    moduleId: 'expansion-center',
    routeSegment: 'expansion-center',
    unlockAfterPhases: ['departments'],
    order: 7,
  },
  {
    phase: 'executive-council',
    title: 'EXECUTIVE COUNCIL™',
    summary: 'Many minds, one briefing — simulated executive perspectives.',
    moduleId: 'executive-council',
    routeSegment: 'executive-council',
    unlockAfterPhases: ['digital-concierges'],
    order: 8,
  },
  {
    phase: 'studio-institute',
    title: 'STUDIO INSTITUTE™',
    summary: 'Learn from expertise — carry the legacy forward.',
    moduleId: 'studio-institute',
    routeSegment: 'studio-institute',
    unlockAfterPhases: ['executive-council'],
    order: 9,
  },
  {
    phase: 'knowledge-commerce',
    title: 'KNOWLEDGE COMMERCE™',
    summary: 'Monetize knowledge — expand your legacy.',
    moduleId: 'knowledge-commerce',
    routeSegment: 'knowledge-commerce',
    unlockAfterPhases: ['studio-institute'],
    order: 10,
  },
  {
    phase: 'advanced-intelligence',
    title: 'ADVANCED INTELLIGENCE',
    summary: 'Studio Intelligence Architecture, Model Orchestrator, Foundation Models.',
    moduleId: 'studio-intelligence-architecture',
    routeSegment: 'studio-intelligence-architecture',
    unlockAfterPhases: ['knowledge-commerce'],
    order: 11,
  },
  {
    phase: 'organizational-consciousness',
    title: 'ORGANIZATIONAL CONSCIOUSNESS™',
    summary: 'One intelligence — preserve expertise, build legacy.',
    moduleId: 'organizational-consciousness',
    routeSegment: 'organizational-consciousness',
    unlockAfterPhases: ['advanced-intelligence'],
    order: 12,
  },
];

export function getGettingStartedSteps(): GettingStartedStep[] {
  return [...GETTING_STARTED_PROGRESSION].sort((a, b) => a.order - b.order);
}

export function computeGettingStartedProgress(completedPhases: string[]): number {
  const total = GETTING_STARTED_PROGRESSION.length;
  const done = GETTING_STARTED_PROGRESSION.filter((s) => completedPhases.includes(s.phase)).length;
  return Math.round((done / total) * 100);
}

export function getNextGettingStartedStep(completedPhases: string[]): GettingStartedStep | undefined {
  return GETTING_STARTED_PROGRESSION.find((s) => !completedPhases.includes(s.phase));
}
