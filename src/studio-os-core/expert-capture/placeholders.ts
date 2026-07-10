/**
 * Future Studio Institute capabilities — architected only, not implemented in MVP v1.
 */
export const EXPERT_CAPTURE_FUTURE_PLACEHOLDERS = [
  'Studio Worker Certification',
  'Knowledge Graph integration',
  'Skill Scores',
  'Scenario Testing',
  'AI Apprentices',
  'Studio HR',
  'Full Studio Institute spatial campus',
  'Avatar Interviewer',
  'Immersive Office environment',
  'Expert Ranking',
  'Certification Levels',
  'Cross-Expert Knowledge Merging',
  'Competency Testing',
  'Worker Graduation',
  'Learning Paths',
  'Multi-session expert profiles',
] as const;

export type ExpertCaptureFutureCapability = (typeof EXPERT_CAPTURE_FUTURE_PLACEHOLDERS)[number];
