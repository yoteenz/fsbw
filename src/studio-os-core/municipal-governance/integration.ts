/**
 * Integration hooks — Experience Lab, CDS, Immune System, Quality Guard.
 */
import type { MunicipalValidationResult } from './contract';
import { assertPermitBeforeGeneration, authorizeConstruction, type ConstructionAuthorizationRequest } from './municipal-government';
import type { PermitApplication } from './permit-engine';
import { validateOccupancyForOpening } from './occupancy-permit';
import type { OccupancyPermit } from './occupancy-permit';

export const EXPERIENCE_LAB_REQUIRES_PERMIT = true;
export const CDS_REQUIRES_PERMIT_FOR_ARCHITECTURE = true;

/** Experience Lab — permitted construction project only. */
export function validateExperienceLabGeneration(input: {
  permit: PermitApplication | null;
  sceneRegistered: boolean;
  founderRenderApproved: boolean;
}): MunicipalValidationResult {
  if (!input.sceneRegistered) {
    return { ok: false, code: 'SCENE_NOT_REGISTERED', message: 'Experience Lab must develop a registered Studio World scene.' };
  }
  const permitCheck = assertPermitBeforeGeneration(input.permit, 'building');
  if (!permitCheck.ok) return permitCheck;
  if (!input.founderRenderApproved && input.permit?.status === 'issued') {
    return { ok: true };
  }
  return { ok: true };
}

/** Creative Director Studio — cannot modify architecture without permit. */
export function validateCdsArchitectureChange(input: {
  permit: PermitApplication | null;
  changeType: 'interior' | 'structural' | 'expansion' | 'marketplace';
}): MunicipalValidationResult {
  if (input.changeType === 'interior') {
    return assertPermitBeforeGeneration(input.permit, 'interior-design');
  }
  if (input.changeType === 'structural' || input.changeType === 'expansion') {
    return assertPermitBeforeGeneration(input.permit, input.changeType === 'expansion' ? 'department-expansion' : 'renovation');
  }
  return assertPermitBeforeGeneration(input.permit, 'marketplace-certification');
}

/** Immune System municipal inspector — halt construction on violation. */
export function municipalInspectorHalt(input: {
  permitValid: boolean;
  zoningValid: boolean;
  buildingCodeValid: boolean;
  budgetWithinLimit: boolean;
  constructionDriftDetected: boolean;
}): MunicipalValidationResult {
  if (!input.permitValid) {
    return { ok: false, code: 'MISSING_PERMIT', message: 'Construction halted — missing or expired permit.' };
  }
  if (!input.zoningValid) {
    return { ok: false, code: 'ZONING_VIOLATION', message: 'Construction halted — zoning violation.' };
  }
  if (!input.buildingCodeValid) {
    return { ok: false, code: 'BUILDING_CODE_VIOLATION', message: 'Construction halted — building code violation.' };
  }
  if (!input.budgetWithinLimit) {
    return { ok: false, code: 'BUDGET_OVERRUN', message: 'Construction halted — budget overrun.' };
  }
  if (input.constructionDriftDetected) {
    return { ok: false, code: 'CONSTRUCTION_DRIFT', message: 'Construction halted — drift from approved blueprint detected.' };
  }
  return { ok: true };
}

/** Quality Guard — occupancy gate. */
export function validateQualityGuardForOccupancy(input: {
  occupancyPermit: OccupancyPermit | null;
  blueprintValid: boolean;
  founderRenderValid: boolean;
  brandGroundingValid: boolean;
}): MunicipalValidationResult {
  if (!input.blueprintValid) {
    return { ok: false, code: 'BLUEPRINT_INVALID', message: 'Occupancy denied — invalid blueprint.' };
  }
  if (!input.founderRenderValid) {
    return { ok: false, code: 'FOUNDER_RENDER_INVALID', message: 'Occupancy denied — invalid Founder Render.' };
  }
  if (!input.brandGroundingValid) {
    return { ok: false, code: 'BRAND_GROUNDING_FAILED', message: 'Occupancy denied — brand grounding failed.' };
  }
  return validateOccupancyForOpening(input.occupancyPermit);
}

export { authorizeConstruction, type ConstructionAuthorizationRequest };
