import type { RefresherExperienceSpec, RefresherModeId } from '../types';

export type RefresherGeneratorContext = {
  conceptTitle: string;
  profession: string;
  domain: string;
  industryVersion: string;
  triggers: string[];
};

export type RefresherGenerator = {
  modeId: RefresherModeId;
  buildSpec: (context: RefresherGeneratorContext) => Omit<RefresherExperienceSpec, 'id' | 'profileId' | 'modeId' | 'conceptTitle' | 'optional'>;
};

export const REFRESHER_COMPLETION_CRITERIA: Record<RefresherModeId, string[]> = {
  'memory-spark': ['Recall one professional cue', 'State one judgment call'],
  'tldr-review': ['Review sequence', 'Identify two decision points'],
  'interactive-scenario': ['Complete client-facing scenario', 'Choose professional response'],
  'simulation-replay': ['Replay simulated moment', 'Apply technique in context'],
  'mentor-walkthrough': ['Watch mentor demonstration', 'Attempt guided imitation'],
  'quick-assessment': ['Answer mastery prompts', 'Demonstrate recall under pressure'],
  'industry-update': ['Understand what changed', 'Identify work impact'],
  'certification-renewal': ['Review credential requirements', 'Confirm compliance steps'],
};

export const REFRESHER_ESTIMATED_MINUTES: Record<RefresherModeId, number> = {
  'memory-spark': 1,
  'tldr-review': 5,
  'interactive-scenario': 12,
  'simulation-replay': 15,
  'mentor-walkthrough': 10,
  'quick-assessment': 8,
  'industry-update': 6,
  'certification-renewal': 20,
};
