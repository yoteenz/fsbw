/** Backward-compatible facade — delegates to review-engine. */
export {
  buildOrbMentorLine,
  buildRetentionPlan,
  calculateRetentionRisk,
  evaluateRetentionProfile,
  resolveLivingKnowledgeImpacts,
} from './review-engine/evaluator';
