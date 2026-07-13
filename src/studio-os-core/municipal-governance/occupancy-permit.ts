import type { OccupancyStatus, DepartmentOccupancyState } from './contract';
import type { MunicipalValidationResult } from './contract';
import { appendLedgerEntry, createMunicipalLedgerEntry, type MunicipalLedger } from './municipal-ledger';

export const OCCUPANCY_PERMIT_VERSION = 'occupancy-permit.v1' as const;

export type OccupancyReviewInput = {
  occupancyPermitId: string;
  organizationId: string;
  sceneId: string;
  departmentId: string;
  inspectionPassed: boolean;
  qualityGuardPassed: boolean;
  immunePassed: boolean;
  performancePassed: boolean;
  accessibilityPassed: boolean;
  compatibilityPassed: boolean;
  marketplaceCompliant: boolean;
  brandGroundingPassed: boolean;
};

export type OccupancyPermit = {
  occupancyPermitId: string;
  organizationId: string;
  sceneId: string;
  departmentId: string;
  status: OccupancyStatus;
  grantedAt: string | null;
  engineVersion: typeof OCCUPANCY_PERMIT_VERSION;
};

export function createOccupancyPermit(input: {
  occupancyPermitId: string;
  organizationId: string;
  sceneId: string;
  departmentId: string;
}): OccupancyPermit {
  return {
    occupancyPermitId: input.occupancyPermitId,
    organizationId: input.organizationId,
    sceneId: input.sceneId,
    departmentId: input.departmentId,
    status: 'under-construction',
    grantedAt: null,
    engineVersion: OCCUPANCY_PERMIT_VERSION,
  };
}

export function reviewOccupancyPermit(input: OccupancyReviewInput): {
  ok: boolean;
  status: OccupancyStatus;
  occupancyState: DepartmentOccupancyState;
  failures: string[];
} {
  const failures: string[] = [];

  if (!input.inspectionPassed) failures.push('Inspection failed.');
  if (!input.qualityGuardPassed) failures.push('Quality Guard validation failed.');
  if (!input.immunePassed) failures.push('Immune System validation failed.');
  if (!input.performancePassed) failures.push('Performance review failed.');
  if (!input.accessibilityPassed) failures.push('Accessibility review failed.');
  if (!input.compatibilityPassed) failures.push('Compatibility review failed.');
  if (!input.marketplaceCompliant) failures.push('Marketplace compliance failed.');
  if (!input.brandGroundingPassed) failures.push('Brand asset grounding failed.');

  if (failures.length > 0) {
    return { ok: false, status: 'inspection-pending', occupancyState: 'inspection', failures };
  }

  return { ok: true, status: 'occupancy-granted', occupancyState: 'open', failures: [] };
}

export function grantOccupancyPermit(permit: OccupancyPermit): OccupancyPermit {
  return {
    ...permit,
    status: 'occupancy-granted',
    grantedAt: new Date().toISOString(),
  };
}

export function validateOccupancyForOpening(permit: OccupancyPermit | null): MunicipalValidationResult {
  if (!permit) {
    return { ok: false, code: 'OCCUPANCY_PERMIT_REQUIRED', message: 'Department cannot open without occupancy permit.' };
  }
  if (permit.status !== 'occupancy-granted') {
    return {
      ok: false,
      code: 'UNDER_CONSTRUCTION',
      message: `Department remains under construction — occupancy status: ${permit.status}.`,
    };
  }
  return { ok: true };
}

export function recordOccupancyGrant(
  ledger: MunicipalLedger,
  permit: OccupancyPermit,
  actorId: string
): MunicipalLedger {
  const entry = createMunicipalLedgerEntry({
    entryId: `occupancy-${permit.occupancyPermitId}`,
    organizationId: permit.organizationId,
    sceneId: permit.sceneId,
    departmentId: permit.departmentId,
    decisionKind: 'occupancy-granted',
    actorId,
    summary: `Occupancy granted for ${permit.departmentId}.`,
  });
  return appendLedgerEntry(ledger, entry);
}
