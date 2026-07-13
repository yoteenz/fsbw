import type { PermitStatus, PermitType } from './contract';
import type { MunicipalValidationResult } from './contract';
import { validateBuildingCode, type BuildingCodeCheckInput } from './building-code-engine';
import { validateUtilityInspection, type UtilityInspectionInput } from './utility-inspection';
import { validateZoningPlacement, type ZoningPlacementInput } from './zoning-system';

export const PERMIT_ENGINE_VERSION = 'permit-engine.v1' as const;

export type PermitApplication = {
  permitId: string;
  permitType: PermitType;
  status: PermitStatus;
  organizationId: string;
  applicantId: string;
  sceneId: string;
  departmentId: string;
  blueprintId: string | null;
  blueprintRevision: number | null;
  founderRenderUrl: string | null;
  constructionPlanId: string | null;
  submittedAt: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  denialReason: string | null;
  engineVersion: typeof PERMIT_ENGINE_VERSION;
};

export type PermitWorkflowStep =
  | 'permit-application'
  | 'blueprint-review'
  | 'dependency-review'
  | 'brand-asset-validation'
  | 'immune-review'
  | 'quality-guard-review'
  | 'budget-review'
  | 'resource-forecast'
  | 'city-council-approval'
  | 'permit-issued';

export const PERMIT_WORKFLOW_ORDER: PermitWorkflowStep[] = [
  'permit-application',
  'blueprint-review',
  'dependency-review',
  'brand-asset-validation',
  'immune-review',
  'quality-guard-review',
  'budget-review',
  'resource-forecast',
  'city-council-approval',
  'permit-issued',
];

export type PermitReviewContext = {
  application: PermitApplication;
  zoning: ZoningPlacementInput;
  buildingCode: BuildingCodeCheckInput;
  utilities: UtilityInspectionInput;
  immuneReviewPassed: boolean;
  qualityGuardPassed: boolean;
  budgetApproved: boolean;
  councilApproved: boolean;
};

export function createPermitApplication(input: {
  permitId: string;
  permitType: PermitType;
  organizationId: string;
  applicantId: string;
  sceneId: string;
  departmentId: string;
}): PermitApplication {
  return {
    permitId: input.permitId,
    permitType: input.permitType,
    status: 'draft',
    organizationId: input.organizationId,
    applicantId: input.applicantId,
    sceneId: input.sceneId,
    departmentId: input.departmentId,
    blueprintId: null,
    blueprintRevision: null,
    founderRenderUrl: null,
    constructionPlanId: null,
    submittedAt: null,
    issuedAt: null,
    expiresAt: null,
    denialReason: null,
    engineVersion: PERMIT_ENGINE_VERSION,
  };
}

export function submitPermitApplication(app: PermitApplication): PermitApplication {
  return {
    ...app,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };
}

export function reviewPermitApplication(ctx: PermitReviewContext): {
  ok: boolean;
  status: PermitStatus;
  failures: Array<{ step: PermitWorkflowStep; code: string; message: string }>;
} {
  const failures: Array<{ step: PermitWorkflowStep; code: string; message: string }> = [];

  const zoning = validateZoningPlacement(ctx.zoning);
  if (!zoning.ok) failures.push({ step: 'blueprint-review', code: zoning.code, message: zoning.message });

  const building = validateBuildingCode(ctx.buildingCode);
  if (!building.ok) failures.push({ step: 'blueprint-review', code: building.code, message: building.message });

  const utilities = validateUtilityInspection(ctx.utilities);
  if (!utilities.ok) failures.push({ step: 'resource-forecast', code: utilities.code, message: utilities.message });

  if (!ctx.immuneReviewPassed) {
    failures.push({ step: 'immune-review', code: 'IMMUNE_REVIEW_FAILED', message: 'Immune System review failed.' });
  }
  if (!ctx.qualityGuardPassed) {
    failures.push({ step: 'quality-guard-review', code: 'QUALITY_GUARD_FAILED', message: 'Quality Guard review failed.' });
  }
  if (!ctx.budgetApproved) {
    failures.push({ step: 'budget-review', code: 'BUDGET_NOT_APPROVED', message: 'Construction budget not approved.' });
  }
  if (!ctx.councilApproved) {
    failures.push({ step: 'city-council-approval', code: 'COUNCIL_NOT_APPROVED', message: 'City Council approval pending.' });
  }

  if (failures.length > 0) {
    return { ok: false, status: 'denied', failures };
  }

  return { ok: true, status: 'issued', failures: [] };
}

export function issuePermit(app: PermitApplication, ttlDays = 90): PermitApplication {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + ttlDays);
  return {
    ...app,
    status: 'issued',
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function isPermitValid(app: PermitApplication | null, now = Date.now()): MunicipalValidationResult {
  if (!app) {
    return { ok: false, code: 'PERMIT_REQUIRED', message: 'Structural generation requires a valid permit.' };
  }
  if (app.status !== 'issued') {
    return { ok: false, code: 'PERMIT_NOT_ISSUED', message: `Permit status is ${app.status}, not issued.` };
  }
  if (app.expiresAt && Date.parse(app.expiresAt) < now) {
    return { ok: false, code: 'PERMIT_EXPIRED', message: 'Permit has expired.' };
  }
  return { ok: true };
}

export function resolvePermitTypeForAction(action: 'world-generation' | 'asset-manufacturing' | 'renovation' | 'marketplace-publish' | 'expansion'): PermitType {
  switch (action) {
    case 'world-generation':
      return 'building';
    case 'asset-manufacturing':
      return 'interior-design';
    case 'renovation':
      return 'renovation';
    case 'marketplace-publish':
      return 'marketplace-certification';
    case 'expansion':
      return 'department-expansion';
    default:
      return 'building';
  }
}
