import { updateInstitutePublicationStatus } from '../publications/engine';
import { addInstitutePublicationRelationship } from '../publications/engine';
import { readInstituteStore } from '../persistence/store';
import type { InstitutePublication, InstitutePublicationStatus } from '../types';

const PROMOTION_PATH: InstitutePublicationStatus[] = [
  'Draft',
  'Working',
  'Review',
  'Approved',
  'Canonical',
];

export function getNextPromotionStatus(
  current: InstitutePublicationStatus
): InstitutePublicationStatus | null {
  const idx = PROMOTION_PATH.indexOf(current);
  if (idx < 0 || idx >= PROMOTION_PATH.length - 1) return null;
  return PROMOTION_PATH[idx + 1];
}

export function canPromoteToCanonical(publication: InstitutePublication): {
  allowed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (publication.status !== 'Approved' && publication.status !== 'Review') {
    reasons.push('Publication must be Approved or in Review before canon promotion.');
  }
  if (!publication.summary.trim()) reasons.push('Summary is required.');
  if (publication.revisionHistory.length === 0) reasons.push('Revision history is required.');
  if (publication.approvalHistory.length === 0 && publication.status !== 'Approved') {
    reasons.push('At least one approval record is required.');
  }

  return { allowed: reasons.length === 0, reasons };
}

export function promotePublication(
  publicationId: string,
  reviewer: string,
  targetStatus: InstitutePublicationStatus = 'Canonical',
  notes = 'Promoted through Institute Knowledge Validation Bureau™.'
): InstitutePublication | undefined {
  const publication = readInstituteStore().publications.find((p) => p.publicationId === publicationId);
  if (!publication) return undefined;

  if (targetStatus === 'Canonical') {
    const gate = canPromoteToCanonical(publication);
    if (!gate.allowed) throw new Error(gate.reasons.join(' '));
  }

  return updateInstitutePublicationStatus(publicationId, targetStatus, {
    decision: 'promote',
    statusBefore: publication.status,
    statusAfter: targetStatus,
    reviewer,
    divisionId: 'knowledge-validation-bureau',
    notes,
  });
}

export function advancePublicationPipeline(
  publicationId: string,
  reviewer: string,
  notes?: string
): InstitutePublication | undefined {
  const publication = readInstituteStore().publications.find((p) => p.publicationId === publicationId);
  if (!publication) return undefined;

  const next = getNextPromotionStatus(publication.status);
  if (!next) return undefined;

  return promotePublication(publicationId, reviewer, next, notes ?? `Advanced to ${next}.`);
}

export function deprecatePublication(
  publicationId: string,
  reviewer: string,
  supersededByPublicationId?: string,
  notes = 'Deprecated by Institute Historical Archives™.'
): InstitutePublication | undefined {
  const updated = updateInstitutePublicationStatus(publicationId, 'Deprecated', {
    decision: 'deprecate',
    statusBefore: readInstituteStore().publications.find((p) => p.publicationId === publicationId)
      ?.status ?? 'Canonical',
    statusAfter: 'Deprecated',
    reviewer,
    divisionId: 'historical-archives',
    notes,
  });

  if (updated && supersededByPublicationId) {
    addInstitutePublicationRelationship({
      fromPublicationId: supersededByPublicationId,
      toPublicationId: publicationId,
      type: 'supersedes',
      label: 'institute-deprecation',
    });
  }

  return updated;
}

export function archiveToHistorical(
  publicationId: string,
  reviewer: string,
  notes = 'Archived to Historical status — knowledge preserved, no longer active canon.'
): InstitutePublication | undefined {
  return updateInstitutePublicationStatus(publicationId, 'Historical', {
    decision: 'archive',
    statusBefore:
      readInstituteStore().publications.find((p) => p.publicationId === publicationId)?.status ??
      'Deprecated',
    statusAfter: 'Historical',
    reviewer,
    divisionId: 'historical-archives',
    notes,
  });
}

export function listPromotionCandidates(): InstitutePublication[] {
  return readInstituteStore().publications.filter(
    (p) => p.status === 'Review' || p.status === 'Approved'
  );
}
