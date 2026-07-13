/**
 * Studio World Municipal Governance™ — foundational contract.
 * Plan → Review → Permit → Build → Inspect → Approve → Occupy → Expand
 */

export const MUNICIPAL_GOVERNANCE_VERSION = 'municipal-governance.v1' as const;

export type MunicipalZone =
  | 'executive'
  | 'creative'
  | 'customer'
  | 'operations'
  | 'manufacturing'
  | 'public'
  | 'private'
  | 'infrastructure';

export type PermitType =
  | 'building'
  | 'department-expansion'
  | 'infrastructure'
  | 'renovation'
  | 'interior-design'
  | 'marketplace-certification'
  | 'automation'
  | 'utility'
  | 'ai-service'
  | 'large-world-expansion';

export type PermitStatus =
  | 'draft'
  | 'submitted'
  | 'blueprint-review'
  | 'dependency-review'
  | 'brand-asset-validation'
  | 'immune-review'
  | 'quality-guard-review'
  | 'budget-review'
  | 'resource-forecast'
  | 'council-review'
  | 'approved'
  | 'denied'
  | 'issued'
  | 'expired'
  | 'revoked';

export type OccupancyStatus =
  | 'under-construction'
  | 'inspection-pending'
  | 'quality-review'
  | 'immune-review'
  | 'performance-review'
  | 'accessibility-review'
  | 'compatibility-review'
  | 'occupancy-granted'
  | 'closed';

export type DepartmentOccupancyState = 'planned' | 'under-construction' | 'inspection' | 'open' | 'closed';

export type MarketplaceCertificationTier = 'certified-studio-world-building' | 'community-mod';

export type MunicipalDecisionKind =
  | 'permit-application'
  | 'permit-approval'
  | 'permit-denial'
  | 'permit-issuance'
  | 'inspection-pass'
  | 'inspection-fail'
  | 'occupancy-granted'
  | 'occupancy-denied'
  | 'marketplace-certification'
  | 'zoning-violation'
  | 'building-code-violation'
  | 'construction-halt'
  | 'budget-overrun';

export type MunicipalValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };
