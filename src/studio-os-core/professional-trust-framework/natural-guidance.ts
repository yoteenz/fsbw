import type { NaturalGuidanceMessage } from './types';
import type { BrainConfidenceProfile, ProfessionalScope } from './types';
import type { OrganizationProfessionBrain } from '../profession-brain/types';

export function buildNaturalGuidanceSamples(
  brain: OrganizationProfessionBrain,
  scope: ProfessionalScope,
  confidence: BrainConfidenceProfile
): NaturalGuidanceMessage[] {
  const samples: NaturalGuidanceMessage[] = [];

  if (brain.definitionId === 'fuel-tax') {
    samples.push({
      id: `guide-${brain.id}-filing`,
      brainId: brain.id,
      context: 'Quarterly filing prepared',
      message:
        "I've prepared your quarterly filing and organized the supporting documentation. Before submission, I recommend having your licensed tax professional review the final filing.",
      tone: 'natural',
    });
  }

  if (brain.definitionId === 'legal-intake') {
    samples.push({
      id: `guide-${brain.id}-intake`,
      brainId: brain.id,
      context: 'Client intake complete',
      message:
        "I've organized the intake information and flagged potential conflicts. An attorney on your team should review before any legal guidance is shared with the client.",
      tone: 'natural',
    });
  }

  if (brain.definitionId === 'hair-color') {
    samples.push({
      id: `guide-${brain.id}-consult`,
      brainId: brain.id,
      context: 'Color consultation',
      message:
        "Based on your organization's color expertise, I've prepared formulation notes and client expectations. For scalp concerns beyond color, I recommend a licensed professional assessment.",
      tone: 'educational',
    });
  }

  if (confidence.professionalReviewStatus !== 'none') {
    samples.push({
      id: `guide-${brain.id}-confidence`,
      brainId: brain.id,
      context: 'Confidence transparency',
      message: `Knowledge coverage is ${confidence.knowledgeCoveragePct}% with ${confidence.confidenceLevel} confidence. ${scope.reviewRequired[0] ?? 'Professional review applies before final action.'}`,
      tone: 'natural',
    });
  }

  if (samples.length === 0) {
    samples.push({
      id: `guide-${brain.id}-default`,
      brainId: brain.id,
      context: 'General assistance',
      message:
        "I can educate, prepare, and organize from your organization's expertise. I'll recommend human review whenever the decision exceeds my scope.",
      tone: 'natural',
    });
  }

  return samples;
}

export function formatNaturalGuidance(message: NaturalGuidanceMessage): string {
  return message.message;
}
