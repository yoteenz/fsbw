import type { VisualAuthorityApprovalStatus } from './types';

export type FounderApprovalGate =
  | 'VISUAL_AUTHORITY_APPROVAL'
  | 'GEOMETRY_APPROVAL'
  | 'MATERIAL_APPROVAL'
  | 'SPATIAL_ASSEMBLY_APPROVAL'
  | 'INTERACTION_APPROVAL'
  | 'FINAL_EXPERIENCE_APPROVAL'
  | 'DEPLOYMENT_AUTHORIZATION';

export type FounderReviewRecord = {
  reviewId: string;
  manifestId: string;
  gate: FounderApprovalGate;
  status: VisualAuthorityApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  supersedesReviewId?: string;
};

const GATE_ORDER: FounderApprovalGate[] = [
  'VISUAL_AUTHORITY_APPROVAL',
  'GEOMETRY_APPROVAL',
  'MATERIAL_APPROVAL',
  'SPATIAL_ASSEMBLY_APPROVAL',
  'INTERACTION_APPROVAL',
  'FINAL_EXPERIENCE_APPROVAL',
  'DEPLOYMENT_AUTHORIZATION',
];

export function assertGateAllowed(
  gate: FounderApprovalGate,
  priorReviews: FounderReviewRecord[]
): { ok: boolean; reason?: string } {
  const idx = GATE_ORDER.indexOf(gate);
  for (let i = 0; i < idx; i++) {
    const required = GATE_ORDER[i];
    const found = priorReviews.find((r) => r.gate === required);
    if (!found || !isFounderApproved(found.status)) {
      return { ok: false, reason: `Missing approval for ${required}` };
    }
  }
  return { ok: true };
}

export function isFounderApproved(status: VisualAuthorityApprovalStatus): boolean {
  return status === 'APPROVED' || status === 'APPROVED_WITH_CORRECTIONS';
}

export function rejectGeneratedAsCanonical(status: VisualAuthorityApprovalStatus): boolean {
  return !isFounderApproved(status);
}
