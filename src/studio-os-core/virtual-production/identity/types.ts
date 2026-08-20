/**
 * Nia Identity Lock — Reference Pack V1 domain types.
 */

import type { QcCategory, QcStatus } from '../types';

export const REFERENCE_PACK_V1_SLOT_KEYS = [
  'front',
  'three_quarter_left',
  'three_quarter_right',
  'profile_left',
  'profile_right',
  'medium',
  'full_body',
  'neutral',
  'smile',
  'serious',
  'movement',
  'hair_detail',
  'skin_detail',
] as const;

export type ReferencePackSlot = (typeof REFERENCE_PACK_V1_SLOT_KEYS)[number];

/** Full slot lifecycle states per sprint spec */
export type ReferencePackSlotLifecycleState =
  | 'missing'
  | 'candidate'
  | 'qc_required'
  | 'approved'
  | 'rejected'
  | 'locked';

export type ReferencePackCandidateStatus = 'candidate' | 'rejected' | 'archived' | 'approved';

export type IdentityQcCategory = QcCategory | 'canon_fidelity' | 'realism' | 'age_presentation';

export type IdentityQcEntry = {
  category: IdentityQcCategory;
  status: QcStatus;
  notes?: string;
  reviewer?: string;
  reviewedAt?: string;
};

export type ReferencePackSlotRecord = {
  state: ReferencePackSlotLifecycleState;
  approvedAssetId?: string;
  approvedMediaUrl?: string;
  candidateAssetId?: string;
  candidateMediaUrl?: string;
  qc?: IdentityQcEntry[];
  rejectedCandidateIds?: string[];
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ReferencePackSlotStates = Record<ReferencePackSlot, ReferencePackSlotRecord>;

export type PrimaryIdentityAnchor = {
  assetId: string;
  mediaUrl?: string;
  source: string;
  providerId: string;
  modelId?: string;
  referenceLineage: unknown[];
  approvalStatus: 'approved' | 'locked';
  notes?: string;
  designatedAt?: string;
  designatedBy?: string;
};

export type OpenArtCharacterStatus = 'programmatic' | 'external' | 'not_used';

export type ProviderIdentityMapping = {
  providerId: string;
  mappingType: 'openart_character' | 'fal_lora' | 'upload' | 'other';
  externalId?: string;
  notes?: string;
};

export type ReferencePackLockRecord = {
  packKey: string;
  version: number;
  lockedAt: string;
  lockedBy: string;
  primaryAnchorAssetId: string;
  slotAssetIds: Partial<Record<ReferencePackSlot, string>>;
  immutable: true;
};

export type CampaignIdentityGateStatus = 'blocked' | 'pass';

export type ReferencePackCandidate = {
  id: string;
  orgId: string;
  referencePackId: string;
  slotKey: ReferencePackSlot;
  assetId?: string;
  mediaUrl?: string;
  providerId: string;
  modelId?: string;
  referenceLineage: unknown[];
  qc: IdentityQcEntry[];
  status: ReferencePackCandidateStatus;
  rejectionReason?: string;
  operator?: string;
  billingOwnerOrgId?: string;
  estimatedCostUsd?: number;
  actualCostUsd?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type IdentityAuditFinding = {
  category:
    | 'canonical_portrait'
    | 'campaign_image'
    | 'facial_reference'
    | 'full_body'
    | 'profile'
    | 'hair'
    | 'skin'
    | 'approved_generation'
    | 'rejected_generation';
  path: string;
  status: 'found' | 'missing' | 'text_only' | 'rejected_archive';
  notes: string;
  suitableForSlot?: ReferencePackSlot[];
};
