import { CONFIDENCE_LEVEL_LABELS } from './constants';
import type { ConfidenceExplorerEntry, ConfidenceRecommendation } from './types';

function scoreToLevel(score: number): import('./types').ConfidenceLevel {
  if (score >= 90) return 'very-high';
  if (score >= 75) return 'high';
  if (score >= 55) return 'moderate';
  if (score >= 35) return 'low';
  return 'insufficient-evidence';
}

const EXPLORER_TEMPLATES: Omit<ConfidenceExplorerEntry, 'id' | 'recommendationId' | 'changedAt'>[] = [
  {
    label: 'Publishing Schedule Confidence',
    previousScore: 84,
    currentScore: 92,
    delta: 8,
    previousLevel: 'high',
    currentLevel: 'very-high',
    changeReasons: [
      'Additional knowledge assets published on tax filing topic',
      'Improved QA Simulation results (+6% success rate)',
      'More customer engagement history collected',
      'Better validation from Knowledge Confidence module',
    ],
  },
  {
    label: 'Workflow Approval Confidence',
    previousScore: 76,
    currentScore: 88,
    delta: 12,
    previousLevel: 'high',
    currentLevel: 'high',
    changeReasons: [
      'QA Simulation Engine: 2 additional personas passed',
      'Production gate status changed from blocked to cleared',
      'Executive Trust Dashboard trust score improved',
    ],
  },
  {
    label: 'Pricing Change Confidence',
    previousScore: 58,
    currentScore: 67,
    delta: 9,
    previousLevel: 'moderate',
    currentLevel: 'moderate',
    changeReasons: [
      'Additional competitor pricing data ingested',
      'Customer satisfaction survey results added',
      'Marketplace demand forecast updated',
    ],
  },
  {
    label: 'Knowledge Publication Confidence',
    previousScore: 72,
    currentScore: 58,
    delta: -14,
    previousLevel: 'high',
    currentLevel: 'moderate',
    changeReasons: [
      'Expert review not yet completed',
      'Simulation not run on draft content',
      'Knowledge Confidence dropped on permit topic',
    ],
  },
  {
    label: 'Marketplace Listing Confidence',
    previousScore: 52,
    currentScore: 41,
    delta: -11,
    previousLevel: 'moderate',
    currentLevel: 'low',
    changeReasons: [
      'Compliance attestation still incomplete',
      'New category policy requirements added',
      'Limited historical outcomes for this service type',
    ],
  },
];

export function buildExplorerHistory(
  recommendations: ConfidenceRecommendation[],
  now: string
): ConfidenceExplorerEntry[] {
  return EXPLORER_TEMPLATES.map((template, i) => {
    const rec = recommendations[i] ?? recommendations[0];
    const currentScore = rec?.confidenceScore ?? template.currentScore;
    const currentLevel = scoreToLevel(currentScore);
    return {
      id: `explorer-${i}`,
      recommendationId: rec?.id ?? `rec-unknown-${i}`,
      ...template,
      currentScore,
      currentLevel,
      delta: currentScore - template.previousScore,
      changedAt: now,
    };
  });
}

export function explainConfidenceChange(entry: ConfidenceExplorerEntry): string {
  const direction = entry.delta >= 0 ? 'increased' : 'decreased';
  return `${entry.label}: ${entry.previousScore}% → ${entry.currentScore}% (${direction} ${Math.abs(entry.delta)}%). ${CONFIDENCE_LEVEL_LABELS[entry.previousLevel]} → ${CONFIDENCE_LEVEL_LABELS[entry.currentLevel]}. Reasons: ${entry.changeReasons.join(' · ')}`;
}

export function summarizeConfidenceEngine(profile: {
  overallConfidenceScore: number;
  recommendationsActive: number;
  lowConfidenceCount: number;
  recommendations: ConfidenceRecommendation[];
}): string {
  const top = profile.recommendations[0];
  const topLine = top
    ? ` Top: "${top.recommendation.slice(0, 50)}…" (${top.confidenceScore}% · ${top.confidenceLevelLabel}).`
    : '';
  return `Confidence Engine™ ${profile.overallConfidenceScore}% overall · ${profile.recommendationsActive} recommendations · ${profile.lowConfidenceCount} low confidence.${topLine}`;
}

export function buildDockConfidenceLine(profile: {
  overallConfidenceScore: number;
  recommendationsActive: number;
  lowConfidenceCount: number;
  recommendations: ConfidenceRecommendation[];
}): string {
  return summarizeConfidenceEngine(profile);
}

export function formatRecommendationConversation(rec: ConfidenceRecommendation): string {
  let text = rec.conversationalExplanation;
  if (rec.lowConfidenceDisclaimer) {
    text += ` Note: ${rec.lowConfidenceDisclaimer}`;
  }
  return text;
}
