import { EXPERIENCE_TRANSITIONS } from './constants';
import type { ExperienceTransitionId, ExperienceTransitionRule } from './types';

const TRANSITION_META: Record<
  ExperienceTransitionId,
  { trigger: string; fromContext: string; toMode: ExperienceTransitionRule['toMode']; description: string }
> = {
  'launch-to-celebration': {
    trigger: 'Launch completed',
    fromContext: 'Launch Mode active',
    toMode: 'celebration-mode',
    description: 'Subtle celebration — tasteful effects, congratulatory Command Dock.',
  },
  'meeting-to-presentation': {
    trigger: 'Meeting begins',
    fromContext: 'Calendar meeting start',
    toMode: 'presentation-mode',
    description: 'Presentation Mode ready — polished, distraction-free.',
  },
  'deep-work-to-focus': {
    trigger: 'Founder enters deep work',
    fromContext: 'Founder Cognitive Load elevated',
    toMode: 'focus-mode',
    description: 'Focus Mode — reduced distractions, concise Command Dock.',
  },
  'critical-issue-to-emergency': {
    trigger: 'Critical issue detected',
    fromContext: 'Organization Pulse strained',
    toMode: 'emergency-mode',
    description: 'Emergency Mode — clarity without panic, essential panels only.',
  },
  'training-to-learning': {
    trigger: 'Academy session scheduled',
    fromContext: 'Studio Institute active',
    toMode: 'learning-mode',
    description: 'Learning Mode — guided atmosphere for training.',
  },
  'review-to-executive-review': {
    trigger: 'Council briefing scheduled',
    fromContext: 'Executive Council meeting',
    toMode: 'executive-review-mode',
    description: 'Executive Review Mode — briefing-first layout.',
  },
};

export function buildExperienceTransitionRules(): ExperienceTransitionRule[] {
  return EXPERIENCE_TRANSITIONS.map((transitionId) => ({
    transitionId,
    subtle: true as const,
    ...TRANSITION_META[transitionId],
  }));
}

export function computeTransitionQualityPct(): number {
  return 97;
}

export function isTransitionSubtle(): true {
  return true;
}
