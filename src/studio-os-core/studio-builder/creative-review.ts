/**
 * Creative Review™ — The AI Braintrust
 * Rule-based alpha review layer (no new engine / no API).
 */

import type { PipelineStageId } from './pipeline-definition';
import type { CreativeReviewReport, FounderReviewPath, SpecialistReview } from './types';
import { listDirectorsNotes } from './directors-notes-store';
import { parseDirectorFeedback } from './director-feedback';

export type BraintrustSpecialistId =
  | 'experience-architect'
  | 'interior-designer'
  | 'lighting-director'
  | 'brand-concierge'
  | 'technical-director'
  | 'performance-engineer'
  | 'ux-designer'
  | 'creative-director'
  | 'brand-strategist'
  | 'visual-designer'
  | 'marketing-director'
  | 'copy-director'
  | 'growth-strategist'
  | 'social-director'
  | 'packaging-designer'
  | 'product-director';

const SPECIALIST_LABELS: Record<BraintrustSpecialistId, string> = {
  'experience-architect': 'Experience Architect',
  'interior-designer': 'Interior Designer',
  'lighting-director': 'Lighting Director',
  'brand-concierge': 'Brand Concierge',
  'technical-director': 'Technical Director',
  'performance-engineer': 'Performance Engineer',
  'ux-designer': 'UX Designer',
  'creative-director': 'Creative Director',
  'brand-strategist': 'Brand Strategist',
  'visual-designer': 'Visual Designer',
  'marketing-director': 'Marketing Director',
  'copy-director': 'Copy Director',
  'growth-strategist': 'Growth Strategist',
  'social-director': 'Social Director',
  'packaging-designer': 'Packaging Designer',
  'product-director': 'Product Director',
};

const STAGE_SPECIALISTS: Record<PipelineStageId, BraintrustSpecialistId[]> = {
  'environment-shell': [
    'experience-architect',
    'interior-designer',
    'lighting-director',
    'brand-concierge',
    'technical-director',
  ],
  lighting: ['lighting-director', 'experience-architect', 'performance-engineer'],
  architecture: ['experience-architect', 'interior-designer', 'technical-director'],
  furniture: ['interior-designer', 'ux-designer', 'brand-concierge'],
  'hero-objects': ['creative-director', 'visual-designer', 'brand-strategist'],
  decor: ['interior-designer', 'visual-designer', 'brand-concierge'],
  'interactive-objects': ['ux-designer', 'experience-architect', 'creative-director'],
  'ambient-systems': ['lighting-director', 'experience-architect', 'performance-engineer'],
  runtime: ['experience-architect', 'technical-director', 'ux-designer'],
  'golden-build-review': [
    'creative-director',
    'experience-architect',
    'brand-strategist',
    'technical-director',
  ],
};

const STAGE_STRENGTHS: Record<PipelineStageId, string[]> = {
  'environment-shell': [
    'Editorial spatial hierarchy reads immediately',
    'Luxury material language aligns with Company Genome™',
    'No SaaS/dashboard chrome detected',
  ],
  lighting: [
    'Warm key preserves shadow detail on hero surfaces',
    'Floor reflections support mood without glare',
    'Lighting supports Walk the Room™ sightlines',
  ],
  architecture: [
    'Double-height proportion feels cinematic',
    'Glass flank adds depth without corporate coldness',
    'Structural elements frame work zones clearly',
  ],
  furniture: [
    'Human-scale furnishings support standing creative work',
    'Timeline table anchors project narrative',
    'Spacing avoids office cubicle aesthetics',
  ],
  'hero-objects': [
    'Orb focal hierarchy is legible',
    'Mood Wall reads as hero surface',
    'Story Table invites project anchoring',
  ],
  decor: [
    'Set dressing density feels editorial not chaotic',
    'Material swatches support creative direction',
    'Awards and props reinforce brand story',
  ],
  'interactive-objects': [
    'Interactions read as architecture not UI overlays',
    'Glass panels maintain immersion',
    'Approval ceremony pedestal feels ceremonial',
  ],
  'ambient-systems': [
    'Particle layer is subtle not distracting',
    'Audio atmosphere supports Idle Life™ readiness',
    'FX accents reinforce Set DNA™ calm register',
  ],
  runtime: [
    'Walk the Room markers imply clear founder path',
    'Camera paths respect spatial hierarchy',
    'Entry/exit portals support Transitions™ handoff',
  ],
  'golden-build-review': [
    'All approved stages compose a unified atelier',
    'Golden Build™ reads as destination not page',
    'Walkthrough-ready spatial narrative',
  ],
};

const STAGE_CONCERNS: Record<PipelineStageId, string[]> = {
  'environment-shell': [
    'Marble presence may read corporate if not warmed',
    'Negative space could be stronger at entry threshold',
  ],
  lighting: ['Accent contrast may need tuning for mobile preview', 'Rim on glass could be softer'],
  architecture: ['Window exterior plate could carry more brand atmosphere'],
  furniture: ['Sandbox zone could use stronger visual anchor'],
  'hero-objects': ['Orb scale may compete with Mood Wall on small screens'],
  decor: ['Prop density borderline — watch clutter on mobile pan'],
  'interactive-objects': ['Floating panels need depth cue to avoid flat UI read'],
  'ambient-systems': ['Particle count should stay conservative on mobile tier'],
  runtime: ['Portal visibility depends on prior stage approvals staying aligned'],
  'golden-build-review': [
    'Any downstream regeneration will require re-walkthrough',
    'Certified™ gate still requires full Validation Loop',
  ],
};

function scoreForStage(stageId: PipelineStageId, specialistId: BraintrustSpecialistId, notes: string[]): number {
  let base = 82;
  if (stageId === 'environment-shell' && specialistId === 'experience-architect') base = 88;
  if (stageId === 'lighting' && specialistId === 'lighting-director') base = 90;
  if (stageId === 'golden-build-review' && specialistId === 'creative-director') base = 86;
  if (notes.some((n) => /corporate|website|clutter/i.test(n))) base -= 8;
  if (notes.some((n) => /luxury|warmer|editorial/i.test(n))) base += 4;
  return Math.min(98, Math.max(62, base));
}

function buildSpecialistReview(
  stageId: PipelineStageId,
  specialistId: BraintrustSpecialistId,
  notes: string[]
): SpecialistReview {
  const strengths = STAGE_STRENGTHS[stageId].slice(0, 2);
  const concerns = STAGE_CONCERNS[stageId].slice(0, 1);
  const score = scoreForStage(stageId, specialistId, notes);

  return {
    specialistId,
    role: SPECIALIST_LABELS[specialistId],
    overallScore: score,
    strengths,
    concerns: score < 78 ? [...concerns, ...STAGE_CONCERNS[stageId].slice(1, 2)] : concerns,
    recommendations:
      score < 80
        ? ['Consider Regenerate™ with Director feedback before unlocking next stage']
        : ['Stage is strong enough to proceed with founder judgment'],
    confidence: Math.min(95, score + 4),
  };
}

export function runBraintrustReview(input: {
  departmentId: string;
  projectId: string;
  stageId: PipelineStageId;
  displayName: string;
  branchId: string;
  branchLabel: string;
}): CreativeReviewReport {
  const specialists = STAGE_SPECIALISTS[input.stageId];
  const notes = listDirectorsNotes(input.departmentId, input.projectId).map((n) => n.body);
  const specialistReviews = specialists.map((id) =>
    buildSpecialistReview(input.stageId, id, notes)
  );

  const overallScore = Math.round(
    specialistReviews.reduce((sum, r) => sum + r.overallScore, 0) / specialistReviews.length
  );

  const significantObservations = specialistReviews.filter((r) => r.concerns.length > 0).length;
  const optionalRefinements = specialistReviews.filter((r) => r.overallScore < 85).length;

  const consensus =
    overallScore >= 84
      ? `The Braintrust recommends approving ${input.displayName} and continuing to the next stage. Spatial hierarchy is strong enough to support downstream work.`
      : `The Braintrust recommends regenerating ${input.displayName} before continuing because improving spatial hierarchy now will reduce downstream revisions.`;

  const recommendedAction: CreativeReviewReport['recommendedAction'] =
    overallScore >= 84 ? 'approve' : overallScore >= 76 ? 'neutral' : 'regenerate';

  const orbIntro = [
    `${input.displayName} is complete.`,
    'The Braintrust has completed its review.',
    `There are ${significantObservations} significant observation${significantObservations === 1 ? '' : 's'} and ${optionalRefinements} optional refinement${optionalRefinements === 1 ? '' : 's'}.`,
    'How would you like to proceed?',
  ].join('\n');

  const topStrength = specialistReviews.sort((a, b) => b.overallScore - a.overallScore)[0];
  const topConcern = specialistReviews
    .filter((r) => r.concerns.length > 0)
    .sort((a, b) => a.overallScore - b.overallScore)[0];

  const summaryBriefing = [
    `Overall Score: ${overallScore}/100`,
    `Strongest quality: ${topStrength?.strengths[0] ?? 'Cohesive stage composition'}`,
    `Biggest concern: ${topConcern?.concerns[0] ?? 'No blocking concerns'}`,
    `Recommended action: ${recommendedAction === 'regenerate' ? 'Regenerate™' : recommendedAction === 'approve' ? 'Approve™' : 'Founder judgment'}`,
    `Consensus: ${consensus}`,
  ].join('\n');

  return {
    id: `cr-${Date.now()}`,
    stageId: input.stageId,
    branchId: input.branchId,
    branchLabel: input.branchLabel,
    completedAt: new Date().toISOString(),
    specialists,
    overallScore,
    significantObservations,
    optionalRefinements,
    specialistReviews,
    consensus,
    recommendedAction,
    orbIntro,
    summaryBriefing,
    followUpThread: [],
  };
}

export function answerBraintrustFollowUp(
  report: CreativeReviewReport,
  question: string
): string {
  const q = question.trim().toLowerCase();
  if (!q) return 'Ask the Orb a follow-up question when ready.';

  if (/brand score|brand.*low/i.test(q)) {
    const brand = report.specialistReviews.find(
      (r) => r.specialistId === 'brand-concierge' || r.specialistId === 'brand-strategist'
    );
    return brand
      ? `Brand Concierge (${brand.overallScore}/100): ${brand.concerns[0] ?? 'Brand alignment is acceptable'} — ${brand.recommendations[0]}`
      : 'Brand specialists were not on this review panel.';
  }

  if (/lighting director/i.test(q)) {
    const lit = report.specialistReviews.find((r) => r.specialistId === 'lighting-director');
    return lit
      ? `${lit.role} (${lit.overallScore}/100): ${lit.strengths[0]}. Concern: ${lit.concerns[0] ?? 'none'}.`
      : 'Lighting Director was not invited for this stage.';
  }

  if (/version a|version b|compare/i.test(q)) {
    return `Active branch: ${report.branchLabel}. Use Branch™ to generate Version B/C for side-by-side comparison in the Story Table.`;
  }

  if (/genome|frontal slayer/i.test(q)) {
    return 'Frontal Slayer Brand Genome recommends editorial luxury, warm material honesty, and zero SaaS chrome. The Braintrust weighted this in brand scores.';
  }

  if (/concern|worry|missing/i.test(q)) {
    const worst = [...report.specialistReviews].sort((a, b) => a.overallScore - b.overallScore)[0];
    return worst
      ? `Greatest concern from ${worst.role}: ${worst.concerns[0] ?? 'No major flags'}.`
      : 'No significant concerns flagged.';
  }

  if (/improve first|first priority/i.test(q)) {
    const low = report.specialistReviews.find((r) => r.overallScore < 80);
    return low
      ? `${low.role} suggests: ${low.recommendations[0]}`
      : 'No urgent improvements — founder judgment on polish.';
  }

  const instructions = parseDirectorFeedback(question);
  if (instructions.length > 0) {
    return `Noted for Director's Notes™ and future generations: ${instructions.join(' ')}`;
  }

  return report.consensus;
}

export function getSpecialistLabel(id: BraintrustSpecialistId): string {
  return SPECIALIST_LABELS[id];
}

export function founderPathLabel(path: FounderReviewPath): string {
  switch (path) {
    case 'summary':
      return 'Summary Review™';
    case 'deep-dive':
      return 'Deep Dive™';
    case 'self-review':
      return 'Self Review™';
    case 'trust-instinct':
      return 'Trust My Instinct™';
    default:
      return '';
  }
}
