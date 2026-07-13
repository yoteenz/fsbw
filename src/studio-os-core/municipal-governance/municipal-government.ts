import type { PermitType } from './contract';
import type { MunicipalValidationResult } from './contract';
import { BEAUTY_HEADQUARTERS_REGISTRY } from './fixtures';
import {
  createPermitApplication,
  isPermitValid,
  issuePermit,
  resolvePermitTypeForAction,
  reviewPermitApplication,
  submitPermitApplication,
  type PermitApplication,
  type PermitReviewContext,
} from './permit-engine';
import { forecastConstructionBudget } from './construction-budget-engine';
import { calculatePermitFee } from './permit-fee-system';
import { reviewCityCouncilPermit, recordCouncilDecision, type CityCouncilDecision } from './city-council';
import { createEmptyMunicipalLedger, type MunicipalLedger } from './municipal-ledger';
import { getStudioWorldScene } from './studio-world-registry-helpers';
import type { StudioWorldRegistry } from './studio-world-registry';
import { validateZoningPlacement } from './zoning-system';
import { validateBuildingCode } from './building-code-engine';
import { validateUtilityInspection } from './utility-inspection';
import { MUNICIPAL_GOVERNANCE_VERSION } from './contract';

export const MUNICIPAL_GOVERNMENT_VERSION = MUNICIPAL_GOVERNANCE_VERSION;

export type ConstructionAuthorizationRequest = {
  organizationId: string;
  applicantId: string;
  sceneId: string;
  departmentId: string;
  action: 'world-generation' | 'asset-manufacturing' | 'renovation' | 'marketplace-publish' | 'expansion';
  blueprintId: string | null;
  blueprintRevision: number | null;
  founderRenderUrl: string | null;
  constructionPlanId: string | null;
  assetCount: number;
  renderCount: number;
  floor: import('./zoning-system').ZoningFloor;
  coexistingDepartmentIds?: string[];
  buildingCode: import('./building-code-engine').BuildingCodeCheckInput;
  utilities: import('./utility-inspection').UtilityInspectionInput;
  immuneReviewPassed: boolean;
  qualityGuardPassed: boolean;
};

export type ConstructionAuthorizationResult =
  | {
      ok: true;
      permit: PermitApplication;
      budget: ReturnType<typeof forecastConstructionBudget>;
      permitFee: ReturnType<typeof calculatePermitFee>;
      councilDecision: CityCouncilDecision;
      ledger: MunicipalLedger;
    }
  | { ok: false; code: string; message: string; stage: string };

/** StudioWorldMunicipalGovernment™ — orchestrates permit workflow before construction. */
export function authorizeConstruction(input: ConstructionAuthorizationRequest): ConstructionAuthorizationResult {
  const permitType = resolvePermitTypeForAction(input.action);
  const permitId = `permit-${input.organizationId}-${input.sceneId}-${Date.now()}`;

  let permit = createPermitApplication({
    permitId,
    permitType,
    organizationId: input.organizationId,
    applicantId: input.applicantId,
    sceneId: input.sceneId,
    departmentId: input.departmentId,
  });
  permit = {
    ...submitPermitApplication(permit),
    blueprintId: input.blueprintId,
    blueprintRevision: input.blueprintRevision,
    founderRenderUrl: input.founderRenderUrl,
    constructionPlanId: input.constructionPlanId,
  };

  const zoning = validateZoningPlacement({
    floor: input.floor,
    departmentId: input.departmentId,
    coexistingDepartmentIds: input.coexistingDepartmentIds,
  });
  if (!zoning.ok) {
    return { ok: false, code: zoning.code, message: zoning.message, stage: 'zoning' };
  }

  const building = validateBuildingCode(input.buildingCode);
  if (!building.ok) {
    return { ok: false, code: building.code, message: building.message, stage: 'building-code' };
  }

  const utilities = validateUtilityInspection(input.utilities);
  if (!utilities.ok) {
    return { ok: false, code: utilities.code, message: utilities.message, stage: 'utility-inspection' };
  }

  const budget = forecastConstructionBudget({
    permitType,
    assetCount: input.assetCount,
    renderCount: input.renderCount,
    includesWorldGeneration: input.action === 'world-generation',
  });

  const permitFee = calculatePermitFee(permitType);

  const reviewCtx: PermitReviewContext = {
    application: permit,
    zoning: { floor: input.floor, departmentId: input.departmentId, coexistingDepartmentIds: input.coexistingDepartmentIds },
    buildingCode: input.buildingCode,
    utilities: input.utilities,
    immuneReviewPassed: input.immuneReviewPassed,
    qualityGuardPassed: input.qualityGuardPassed,
    budgetApproved: true,
    councilApproved: false,
  };

  const councilDecision = reviewCityCouncilPermit({
    permit,
    budget,
    immunePassed: input.immuneReviewPassed,
    qualityGuardPassed: input.qualityGuardPassed,
    securityPassed: true,
    compatibilityPassed: true,
    performancePassed: true,
  });

  if (!councilDecision.approved) {
    return { ok: false, code: councilDecision.code, message: councilDecision.message, stage: 'city-council' };
  }

  reviewCtx.councilApproved = true;
  const permitReview = reviewPermitApplication(reviewCtx);
  if (!permitReview.ok) {
    const first = permitReview.failures[0];
    return { ok: false, code: first?.code ?? 'PERMIT_DENIED', message: first?.message ?? 'Permit denied.', stage: first?.step ?? 'permit-review' };
  }

  permit = issuePermit(permit);
  let ledger = createEmptyMunicipalLedger();
  ledger = recordCouncilDecision(ledger, councilDecision, permit, 'city-council');

  return { ok: true, permit, budget, permitFee, councilDecision, ledger };
}

export function assertPermitBeforeGeneration(
  permit: PermitApplication | null,
  permitType?: PermitType
): MunicipalValidationResult {
  const valid = isPermitValid(permit);
  if (!valid.ok) return valid;
  if (permitType && permit && permit.permitType !== permitType) {
    return {
      ok: false,
      code: 'PERMIT_TYPE_MISMATCH',
      message: `Expected permit type ${permitType}, received ${permit.permitType}.`,
    };
  }
  return { ok: true };
}

export function resolveDefaultStudioWorldRegistry(): StudioWorldRegistry {
  return BEAUTY_HEADQUARTERS_REGISTRY;
}

export function assertSceneIsRegistered(sceneId: string, registry: StudioWorldRegistry = BEAUTY_HEADQUARTERS_REGISTRY): MunicipalValidationResult {
  const scene = getStudioWorldScene(registry, sceneId);
  if (!scene) {
    return { ok: false, code: 'SCENE_NOT_REGISTERED', message: `Scene ${sceneId} is not in Studio World Registry™.` };
  }
  return { ok: true };
}
