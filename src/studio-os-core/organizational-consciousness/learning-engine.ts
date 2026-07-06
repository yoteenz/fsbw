import { getOrganizationAutonomousPreparationProfile } from '../autonomous-preparation/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { LEARNING_CONTRIBUTION_LABELS, LEARNING_CONTRIBUTION_TYPES } from './constants';
import type { ContinuousLearningSignal, LearningContributionType } from './types';

function signal(
  organizationId: string,
  type: LearningContributionType,
  index: number,
  contribution: string
): ContinuousLearningSignal {
  return {
    id: `learn-${organizationId}-${type}-${index}`,
    type,
    label: LEARNING_CONTRIBUTION_LABELS[type],
    contribution,
    strengthenedAt: new Date().toISOString(),
  };
}

export function buildContinuousLearningSignals(organizationId: string): ContinuousLearningSignal[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const preparation = getOrganizationAutonomousPreparationProfile(organizationId);

  const signals: ContinuousLearningSignal[] = [
    signal(organizationId, 'projects', 0, 'Project completions archived in Memory Engine — patterns inform future recommendations.'),
    signal(organizationId, 'meetings', 0, 'Meeting rhythms observed through Ambient Awareness and Relationship Memory.'),
    signal(organizationId, 'lessons', 0, 'Wisdom Capture and Legacy Vault preserve lessons that strengthen organizational history.'),
    signal(
      organizationId,
      'approvals',
      0,
      preparation
        ? `${preparation.learningLoop.approvalsLogged} approval(s) · ${preparation.learningLoop.rejectionsLogged} rejection(s) — Autonomous Preparation learning loop active.`
        : 'Approval patterns calibrating through Autonomous Preparation.'
    ),
    signal(organizationId, 'customer-interactions', 0, 'Customer behavior feeds Predictive Organization and Organization Pulse continuously.'),
    signal(organizationId, 'campaigns', 0, 'Marketing campaigns contribute to predictive intelligence and preparation queue.'),
    signal(organizationId, 'training', 0, 'Studio Institute training strengthens Knowledge Confidence and Profession Brain maturity.'),
    signal(
      organizationId,
      'knowledge-updates',
      0,
      confidence
        ? `${confidence.learningRecommendations.length} learning recommendation(s) — knowledge updates strengthen consciousness.`
        : 'Knowledge updates flow from Profession Brain living sync.'
    ),
    signal(
      organizationId,
      'profession-brain-improvements',
      0,
      brain
        ? `${brain.brains.length} brain(s) evolving · rejected preparations feed Profession Brain signals.`
        : 'Profession Brain improvements compound organizational intelligence.'
    ),
  ];

  return LEARNING_CONTRIBUTION_TYPES.map(
    (type) => signals.find((s) => s.type === type) ?? signal(organizationId, type, 0, 'Contributing to organizational consciousness.')
  );
}

export function summarizeContinuousLearning(signals: ContinuousLearningSignal[]): string {
  return `${signals.length} learning channels active — every interaction strengthens Organizational Consciousness™.`;
}
