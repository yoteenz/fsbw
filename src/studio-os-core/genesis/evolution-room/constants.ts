export const ER_SUBSYSTEM_NAME = 'The Evolution Room™';
export const ER_SUBSYSTEM_VERSION = '1.0.0';

/** Ceremonial meeting flow stages — Orb Presentation Mode™ */
export const ER_MEETING_STAGES = [
  'arrival',
  'orb-greeting',
  'monthly-highlights',
  'company-performance',
  'knowledge-review',
  'launch-stack-progress',
  'genesis-opportunities',
  'future-recommendations',
  'founder-decisions',
  'meeting-summary',
  'archive-session',
] as const;

export type ErMeetingStage = (typeof ER_MEETING_STAGES)[number];

export const ER_MEETING_STAGE_LABELS: Record<ErMeetingStage, string> = {
  arrival: 'Arrival',
  'orb-greeting': 'Orb Executive Greeting',
  'monthly-highlights': 'Monthly Highlights',
  'company-performance': 'Company Performance',
  'knowledge-review': 'Knowledge Review',
  'launch-stack-progress': 'Launch Stack Progress',
  'genesis-opportunities': 'Genesis Opportunities',
  'future-recommendations': 'Future Recommendations',
  'founder-decisions': 'Founder Decisions',
  'meeting-summary': 'Meeting Summary',
  'archive-session': 'Archive Session',
};

/** Room destinations inside Evolution Room™ */
export const ER_ROOM_PATHS = [
  'evolution-room',
  'executive-review',
  'evolution-brief',
  'genesis-proposals',
  'legacy-wall',
  'future-wall',
  'evolution-council',
  'monthly-review',
] as const;

export type ErRoomPath = (typeof ER_ROOM_PATHS)[number];

export const ER_ROOM_PATH_LABELS: Record<ErRoomPath, string> = {
  'evolution-room': 'Evolution Room™',
  'executive-review': 'Executive Review',
  'evolution-brief': 'Executive Evolution Brief™',
  'genesis-proposals': 'Genesis Proposal Queue™',
  'legacy-wall': 'Legacy Wall™',
  'future-wall': 'Future Wall™',
  'evolution-council': 'Evolution Council™',
  'monthly-review': 'Monthly Review',
};

export const ER_LEGACY_CATEGORIES = [
  'launch',
  'milestone',
  'breakthrough',
  'genesis-evolution',
  'platform-evolution',
  'founder-growth',
  'company-growth',
] as const;

export type ErLegacyCategory = (typeof ER_LEGACY_CATEGORIES)[number];

export const ER_FUTURE_CATEGORIES = [
  'automation',
  'launch-stack',
  'genesis',
  'mission',
  'knowledge',
  'revenue',
  'product',
  'department',
] as const;

export type ErFutureCategory = (typeof ER_FUTURE_CATEGORIES)[number];

export const ER_DECISION_STATUSES = ['pending', 'accepted', 'deferred', 'rejected'] as const;
export type ErDecisionStatus = (typeof ER_DECISION_STATUSES)[number];

export const ER_SESSION_STATUSES = ['scheduled', 'in-progress', 'completed', 'archived'] as const;
export type ErSessionStatus = (typeof ER_SESSION_STATUSES)[number];
