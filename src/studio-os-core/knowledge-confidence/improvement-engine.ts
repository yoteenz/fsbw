import { CONFIDENCE_DECREASE_TRIGGERS, LOW_CONFIDENCE_THRESHOLD, LOW_DIMENSION_THRESHOLD } from './constants';
import type {
  LearningRecommendation,
  OrganizationKnowledgeConfidenceProfile,
  ProfessionBrainConfidenceProfile,
} from './types';

function recommendationForDimension(
  brain: ProfessionBrainConfidenceProfile,
  dimension: string,
  score: number
): LearningRecommendation | null {
  if (score >= LOW_DIMENSION_THRESHOLD) return null;

  const triggers: Record<string, { trigger: string; rec: string; target: LearningRecommendation['targetModule'] }> = {
    'Regulatory Currency': {
      trigger: CONFIDENCE_DECREASE_TRIGGERS[0],
      rec: `Update ${brain.shortLabel} Profession Brain™ with current regulations · add Studio Institute™ compliance lesson`,
      target: 'both',
    },
    'Documentation Completeness': {
      trigger: CONFIDENCE_DECREASE_TRIGGERS[1],
      rec: `Add reference manuals and checklists to ${brain.shortLabel} brain · publish Institute training module`,
      target: 'both',
    },
    'Workflow Validation': {
      trigger: CONFIDENCE_DECREASE_TRIGGERS[2],
      rec: `Complete workflow documentation for ${brain.shortLabel} · validate steps in Profession Brain™`,
      target: 'profession-brain',
    },
    'Decision Confidence': {
      trigger: CONFIDENCE_DECREASE_TRIGGERS[3],
      rec: `Resolve conflicting guidance in ${brain.shortLabel} · add judgment patterns with clear reasoning`,
      target: 'profession-brain',
    },
    'Knowledge Coverage': {
      trigger: CONFIDENCE_DECREASE_TRIGGERS[4],
      rec: `Expand ${brain.shortLabel} knowledge entries for new services · Institute onboarding for staff`,
      target: 'both',
    },
    'Version Freshness': {
      trigger: CONFIDENCE_DECREASE_TRIGGERS[5],
      rec: `Refresh outdated policies in ${brain.shortLabel} brain · schedule Institute policy review`,
      target: 'both',
    },
    'Training Coverage': {
      trigger: 'Insufficient training coverage',
      rec: `Create Studio Institute™ modules for ${brain.shortLabel} · link to Profession Brain™ entries`,
      target: 'studio-institute',
    },
    'Automation Readiness': {
      trigger: 'Automation readiness below threshold',
      rec: `Complete Shadow Mode observation for ${brain.shortLabel} workflows before automation`,
      target: 'profession-brain',
    },
  };

  const match = triggers[dimension];
  if (!match) {
    return {
      id: `rec-${brain.brainId}-${dimension.replace(/\s+/g, '-').toLowerCase()}`,
      brainId: brain.brainId,
      brainLabel: brain.brainLabel,
      trigger: 'Confidence below threshold',
      recommendation: `Strengthen ${dimension} for ${brain.shortLabel} — update Profession Brain™ and Studio Institute™`,
      targetModule: 'both',
      priority: score < 60 ? 'high' : 'medium',
      dimension: brain.dimensionScores.find((d) => d.label === dimension)?.dimension ?? 'knowledge-coverage',
    };
  }

  return {
    id: `rec-${brain.brainId}-${dimension.replace(/\s+/g, '-').toLowerCase()}`,
    brainId: brain.brainId,
    brainLabel: brain.brainLabel,
    trigger: match.trigger,
    recommendation: match.rec,
    targetModule: match.target,
    priority: score < 60 ? 'high' : 'medium',
    dimension: brain.dimensionScores.find((d) => d.label === dimension)?.dimension ?? 'knowledge-coverage',
  };
}

export function buildLearningRecommendations(
  brainProfiles: ProfessionBrainConfidenceProfile[]
): LearningRecommendation[] {
  const recs: LearningRecommendation[] = [];

  for (const brain of brainProfiles) {
    if (brain.overallConfidenceScore < LOW_CONFIDENCE_THRESHOLD) {
      const weakest = brain.dimensionScores.slice().sort((a, b) => a.scorePct - b.scorePct)[0];
      if (weakest) {
        const rec = recommendationForDimension(brain, weakest.label, weakest.scorePct);
        if (rec) recs.push(rec);
      }
    }

    for (const dim of brain.dimensionScores) {
      if (dim.scorePct < LOW_DIMENSION_THRESHOLD) {
        const rec = recommendationForDimension(brain, dim.label, dim.scorePct);
        if (rec && !recs.some((r) => r.id === rec.id)) recs.push(rec);
      }
    }
  }

  return recs
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 20);
}

export function summarizeConfidenceProfile(profile: OrganizationKnowledgeConfidenceProfile): string {
  const strongest = profile.brainProfiles.slice().sort((a, b) => b.overallConfidenceScore - a.overallConfidenceScore)[0];
  const weakest = profile.brainProfiles.slice().sort((a, b) => a.overallConfidenceScore - b.overallConfidenceScore)[0];

  return (
    `Knowledge Confidence ${profile.overallConfidenceScore}% across ${profile.brainsAssessed} Profession Brains. ` +
    `Strongest: ${strongest?.shortLabel ?? '—'} (${strongest?.overallConfidenceScore ?? 0}%). ` +
    `Needs teaching: ${weakest?.shortLabel ?? '—'} (${weakest?.overallConfidenceScore ?? 0}%). ` +
    `${profile.learningRecommendations.length} learning recommendation(s) active.`
  );
}
