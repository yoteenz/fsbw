import { TRAINING_SOURCE_LABELS, TRAINING_SOURCES } from './constants';
import type { TrainingSourceStatus } from './types';

const CONSENT_REQUIRED: Set<(typeof TRAINING_SOURCES)[number]> = new Set([
  'organization-approved-training',
  'anonymized-patterns-consent',
]);

export function buildTrainingSources(brainApproved: boolean, instituteLinked: boolean): TrainingSourceStatus[] {
  return TRAINING_SOURCES.map((source) => {
    const consentRequired = CONSENT_REQUIRED.has(source);
    let approved = !consentRequired;
    let detail = TRAINING_SOURCE_LABELS[source];

    switch (source) {
      case 'approved-profession-brain':
        approved = brainApproved;
        detail = brainApproved
          ? 'Approved Profession Brain™ data available for Studio model training pipeline.'
          : 'Awaiting Profession Brain™ approval before training inclusion.';
        break;
      case 'studio-institute-materials':
        approved = instituteLinked;
        detail = instituteLinked
          ? 'Studio Institute™ materials linked — professional knowledge preservation.'
          : 'Studio Institute™ materials available when institute module active.';
        break;
      case 'anonymized-patterns-consent':
        detail = 'Never train on private organization data without explicit consent.';
        approved = false;
        break;
      case 'organization-approved-training':
        detail = 'Organization-approved training data only — explicit consent required.';
        approved = false;
        break;
      default:
        break;
    }

    return {
      source,
      label: TRAINING_SOURCE_LABELS[source],
      approved,
      consentRequired,
      detail,
    };
  });
}

export function summarizeTrainingSources(sources: TrainingSourceStatus[]): string {
  const approved = sources.filter((s) => s.approved).length;
  const consent = sources.filter((s) => s.consentRequired).length;
  return `${approved}/${sources.length} training sources approved. ${consent} require explicit consent — never train on private org data without permission.`;
}
