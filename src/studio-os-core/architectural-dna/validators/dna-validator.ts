import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../../canonical-studio-world/canonical-department-registry';
import { ARCHITECTURAL_DNA_REGISTRY } from '../registry/dna-registry';
import { GOLDEN_REFERENCE_LIBRARY } from '../references/golden-reference-library';

export const DNA_VALIDATOR_VERSION = 'dna-validator.v1' as const;

export type DnaValidationResult =
  | { ok: true; departmentId: CanonicalMainDepartmentId }
  | { ok: false; code: string; message: string };

export function validateDnaRegistryCompleteness(): DnaValidationResult[] {
  const results: DnaValidationResult[] = [];
  for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
    const dna = ARCHITECTURAL_DNA_REGISTRY[record.departmentId];
    const golden = GOLDEN_REFERENCE_LIBRARY[record.departmentId];
    if (!dna) {
      results.push({ ok: false, code: 'DNA_MISSING', message: `No DNA profile for ${record.departmentId}` });
    } else if (!golden) {
      results.push({ ok: false, code: 'GOLDEN_REF_MISSING', message: `No golden reference for ${record.departmentId}` });
    } else if (dna.departmentId !== record.departmentId) {
      results.push({ ok: false, code: 'DNA_ID_MISMATCH', message: `DNA ID mismatch for ${record.departmentId}` });
    } else {
      results.push({ ok: true, departmentId: record.departmentId });
    }
  }
  return results;
}

export function validateDnaCrossContamination(
  requestedDepartmentId: CanonicalMainDepartmentId,
  compiledDepartmentId: CanonicalMainDepartmentId
): DnaValidationResult {
  if (requestedDepartmentId !== compiledDepartmentId) {
    return {
      ok: false,
      code: 'DNA_CROSS_CONTAMINATION',
      message: `Requested ${requestedDepartmentId} but compiled ${compiledDepartmentId} DNA`,
    };
  }
  const dna = ARCHITECTURAL_DNA_REGISTRY[requestedDepartmentId];
  const otherDna = ARCHITECTURAL_DNA_REGISTRY[compiledDepartmentId];
  if (dna.positivePromptTemplate === otherDna.positivePromptTemplate && requestedDepartmentId !== compiledDepartmentId) {
    return {
      ok: false,
      code: 'SHARED_DNA_TEMPLATE',
      message: `${requestedDepartmentId} shares DNA template with ${compiledDepartmentId}`,
    };
  }
  return { ok: true, departmentId: requestedDepartmentId };
}

export function assertExperienceLabNotReception(dna: (typeof ARCHITECTURAL_DNA_REGISTRY)['experience-lab']): DnaValidationResult {
  const forbidden = ['reception desk', 'ReceptionShell', 'waiting room'];
  for (const f of forbidden) {
    if (dna.positivePromptTemplate.toLowerCase().includes(f.toLowerCase())) {
      return { ok: false, code: 'EL_RECEPTION_CONTAMINATION', message: `Experience Lab DNA contains ${f}` };
    }
  }
  if (dna.forbiddenElements.some((e) => e.toLowerCase().includes('reception'))) {
    return { ok: true, departmentId: 'experience-lab' };
  }
  return { ok: true, departmentId: 'experience-lab' };
}

export function assertCdsNotExperienceLab(
  cdsDna: (typeof ARCHITECTURAL_DNA_REGISTRY)['creative-director-studio'],
  elDna: (typeof ARCHITECTURAL_DNA_REGISTRY)['experience-lab']
): DnaValidationResult {
  if (cdsDna.positivePromptTemplate === elDna.positivePromptTemplate) {
    return { ok: false, code: 'CDS_EL_DNA_SHARED', message: 'CDS shares positive template with Experience Lab' };
  }
  if (cdsDna.heroObject === elDna.heroObject) {
    return { ok: false, code: 'CDS_EL_HERO_SHARED', message: 'CDS shares hero object with Experience Lab' };
  }
  if (cdsDna.materials.floorMaterial === elDna.materials.floorMaterial && cdsDna.architecturalStyle === elDna.architecturalStyle) {
    return { ok: false, code: 'CDS_EL_MATERIAL_SHARED', message: 'CDS shares full material+style profile with Experience Lab' };
  }
  return { ok: true, departmentId: 'creative-director-studio' };
}
