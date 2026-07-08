import { REFRESHER_MODES } from '../constants';
import type {
  KnowledgeRetentionProfile,
  RefresherExperienceSpec,
  RefresherModeId,
  RetentionEvaluation,
} from '../types';
import {
  REFRESHER_COMPLETION_CRITERIA,
  REFRESHER_ESTIMATED_MINUTES,
  type RefresherGeneratorContext,
} from './specs';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function modeLabel(modeId: RefresherModeId): string {
  return REFRESHER_MODES.find((mode) => mode.id === modeId)?.label ?? modeId;
}

function buildHeadline(modeId: RefresherModeId, conceptTitle: string): string {
  switch (modeId) {
    case 'memory-spark':
      return `Memory Spark™ — ${conceptTitle}`;
    case 'tldr-review':
      return `TL;DR Review™ — ${conceptTitle}`;
    case 'interactive-scenario':
      return `Interactive Scenario™ — ${conceptTitle}`;
    case 'simulation-replay':
      return `Simulation Replay™ — ${conceptTitle}`;
    case 'mentor-walkthrough':
      return `Mentor Walkthrough™ — ${conceptTitle}`;
    case 'quick-assessment':
      return `Quick Assessment™ — ${conceptTitle}`;
    case 'industry-update':
      return `Industry Update™ — ${conceptTitle}`;
    case 'certification-renewal':
      return `Certification Renewal™ — ${conceptTitle}`;
    default:
      return conceptTitle;
  }
}

function buildMentorIntro(modeId: RefresherModeId, context: RefresherGeneratorContext): string {
  switch (modeId) {
    case 'industry-update':
      return `Profession Brain™ updated ${context.conceptTitle.toLowerCase()} to version ${context.industryVersion}. Here is what matters for your work.`;
    case 'certification-renewal':
      return `Your credential path still depends on ${context.conceptTitle.toLowerCase()}. This is optional, but worth a quick renewal pass.`;
    case 'simulation-replay':
      return `Your upcoming simulation is a natural place to replay ${context.conceptTitle.toLowerCase()} — no classroom required.`;
    default:
      return `You've mastered ${context.conceptTitle.toLowerCase()} before. This refresher is optional whenever you want it.`;
  }
}

export function generateRefresherSpec(
  profile: KnowledgeRetentionProfile,
  modeId: RefresherModeId,
  evaluation?: RetentionEvaluation
): RefresherExperienceSpec {
  const context: RefresherGeneratorContext = {
    conceptTitle: profile.conceptTitle,
    profession: profile.profession,
    domain: profile.domain,
    industryVersion: profile.industryVersion,
    triggers: evaluation?.triggers ?? [],
  };

  return {
    id: uid('refresher'),
    profileId: profile.id,
    modeId,
    conceptTitle: profile.conceptTitle,
    headline: buildHeadline(modeId, profile.conceptTitle),
    mentorIntro: buildMentorIntro(modeId, context),
    estimatedMinutes: REFRESHER_ESTIMATED_MINUTES[modeId],
    optional: true,
    completionCriteria: REFRESHER_COMPLETION_CRITERIA[modeId],
    payload: {
      modeLabel: modeLabel(modeId),
      profession: profile.profession,
      domain: profile.domain,
      brainId: profile.brainId,
      triggers: context.triggers,
      orbLine: evaluation?.orbMentorLine ?? null,
    },
  };
}

export function generateRefresherSpecsForEvaluation(
  profile: KnowledgeRetentionProfile,
  evaluation: RetentionEvaluation
): RefresherExperienceSpec[] {
  return evaluation.recommendedModes.map((mode) =>
    generateRefresherSpec(profile, mode.id, evaluation)
  );
}

export function generateRefresherSpecsForEvaluations(
  evaluations: RetentionEvaluation[],
  profiles: KnowledgeRetentionProfile[]
): RefresherExperienceSpec[] {
  return evaluations.flatMap((evaluation) => {
    const profile = profiles.find((item) => item.id === evaluation.profileId);
    if (!profile) return [];
    return generateRefresherSpecsForEvaluation(profile, evaluation);
  });
}

/** Extension point — Career Worlds and Profession Simulation can register custom generators. */
export type RefresherGeneratorRegistry = Partial<
  Record<RefresherModeId, (profile: KnowledgeRetentionProfile) => RefresherExperienceSpec>
>;

export function applyRefresherGeneratorRegistry(
  profile: KnowledgeRetentionProfile,
  modeId: RefresherModeId,
  registry: RefresherGeneratorRegistry,
  evaluation?: RetentionEvaluation
): RefresherExperienceSpec {
  const custom = registry[modeId];
  return custom ? custom(profile) : generateRefresherSpec(profile, modeId, evaluation);
}
