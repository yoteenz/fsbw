import type { ProfessionalMemoryClass, ProfessionalMemoryRecord } from './types';

export const PROFESSIONAL_MEMORY_CLASSES: Array<{
  id: ProfessionalMemoryClass;
  label: string;
  description: string;
}> = [
  {
    id: 'career-memory',
    label: 'Career Memories™',
    description: 'Promotions, firsts, credentials, transitions, and identity-defining milestones.',
  },
  {
    id: 'client-memory',
    label: 'Client Memories™',
    description: 'Meaningful service moments, trust earned, corrections, reviews, and outcomes.',
  },
  {
    id: 'simulation-memory',
    label: 'Simulation Memories™',
    description: 'Practice outcomes that changed judgment before real-world consequences arrived.',
  },
  {
    id: 'teaching-memory',
    label: 'Teaching Memories™',
    description: 'Mentorship, apprentices, feedback given, and mastery passed forward.',
  },
  {
    id: 'innovation-memory',
    label: 'Innovation Memories™',
    description: 'New methods, systems, formulas, tools, or workflows created by the professional.',
  },
  {
    id: 'business-memory',
    label: 'Business Memories™',
    description: 'Businesses opened, teams hired, offers launched, risks taken, and growth moments.',
  },
  {
    id: 'leadership-memory',
    label: 'Leadership Memories™',
    description: 'Decisions under pressure, team trust, conflict resolution, and responsibility.',
  },
  {
    id: 'community-memory',
    label: 'Community Memories™',
    description: 'Contributions to peers, clients, local community, and professional culture.',
  },
  {
    id: 'historical-memory',
    label: 'Historical Memories™',
    description: 'Industry events, awards, competitions, and moments that place a career in history.',
  },
];

export const LAUNCH_PROFESSIONAL_MEMORIES: ProfessionalMemoryRecord[] = [
  {
    id: 'wisdom-first-lace-install',
    learnerId: 'studio-local-learner',
    profession: 'luxury-install-specialist',
    title: 'First successful lace install',
    memoryClass: 'client-memory',
    occurredAt: '2023-07-08T10:00:00.000Z',
    signals: ['achievement', 'career-milestone'],
    summary: 'Completed the first lace install that earned client trust and proved technique under pressure.',
    wisdomExtracted:
      'Client confidence rises when technical precision and calm communication happen together.',
    emotionalTone: 'proud',
    relatedConceptIds: ['memory-lace-installation'],
    relatedSimulationIds: ['sim-lace-customization-client'],
    relatedCareerGoalIds: ['luxury-install-specialist'],
    relatedBusinessIds: [],
    relatedMentorshipIds: [],
    impactScore: 82,
    masteryDelta: 14,
    visibleToOrb: true,
  },
  {
    id: 'wisdom-failed-formulation',
    learnerId: 'studio-local-learner',
    profession: 'corrective-color-specialist',
    title: 'First failed formulation',
    memoryClass: 'career-memory',
    occurredAt: '2024-02-19T15:00:00.000Z',
    signals: ['mistake', 'knowledge-breakthrough'],
    summary: 'A color formula missed the expected lift and forced a corrective consultation.',
    wisdomExtracted:
      'When chemistry is uncertain, strand-test evidence matters more than speed or confidence.',
    emotionalTone: 'humbled',
    relatedConceptIds: ['memory-hair-bleaching-chemistry', 'memory-corrective-color'],
    relatedSimulationIds: ['sim-corrective-color-consult'],
    relatedCareerGoalIds: ['corrective-color-specialist'],
    relatedBusinessIds: [],
    relatedMentorshipIds: [],
    impactScore: 91,
    masteryDelta: 18,
    visibleToOrb: true,
  },
  {
    id: 'wisdom-first-apprentice-master-stylist',
    learnerId: 'studio-local-learner',
    profession: 'team-lead',
    title: 'First apprentice earned Master Stylist',
    memoryClass: 'teaching-memory',
    occurredAt: '2026-06-12T12:00:00.000Z',
    signals: ['mentorship', 'achievement', 'career-milestone'],
    summary: 'An apprentice trained under the learner advanced into Master Stylist status.',
    wisdomExtracted:
      'Mentorship becomes legacy when the apprentice can make confident decisions without imitation.',
    emotionalTone: 'legacy-building',
    relatedConceptIds: ['memory-leadership', 'memory-client-consultations'],
    relatedSimulationIds: ['sim-team-conflict'],
    relatedCareerGoalIds: ['team-lead'],
    relatedBusinessIds: ['studio-training-program'],
    relatedMentorshipIds: ['mentor-apprentice-master-stylist'],
    impactScore: 96,
    masteryDelta: 22,
    visibleToOrb: true,
  },
  {
    id: 'wisdom-first-salon-opened',
    learnerId: 'studio-local-learner',
    profession: 'studio-owner',
    title: 'First salon opened',
    memoryClass: 'business-memory',
    occurredAt: '2025-09-01T09:00:00.000Z',
    signals: ['business', 'career-milestone', 'community-contribution'],
    summary: 'Opened the first salon and began building a local professional reputation.',
    wisdomExtracted:
      'A salon grows when the operator treats every system as a client experience multiplier.',
    emotionalTone: 'responsible',
    relatedConceptIds: ['memory-salon-management', 'memory-accounting'],
    relatedSimulationIds: ['sim-staffing-salon-day', 'sim-month-end-close'],
    relatedCareerGoalIds: ['studio-owner', 'profitable-studio-owner'],
    relatedBusinessIds: ['first-salon'],
    relatedMentorshipIds: [],
    impactScore: 94,
    masteryDelta: 20,
    visibleToOrb: true,
  },
];

export function listProfessionalMemoryClasses() {
  return PROFESSIONAL_MEMORY_CLASSES;
}

export function listLaunchProfessionalMemories(): ProfessionalMemoryRecord[] {
  return LAUNCH_PROFESSIONAL_MEMORIES;
}
