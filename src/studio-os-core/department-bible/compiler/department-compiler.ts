import type { ConstructionPlan } from '../../blueprint-author/construction-plan-schema';
import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import {
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY,
  getCanonicalDepartmentRecord,
} from '../../canonical-studio-world/canonical-department-registry';
import { buildCanonicalDepartmentConstructionPlan } from '../../canonical-studio-world/canonical-department-construction-plan';
import { resolveArchitecturalDna } from '../../architectural-dna/registry/dna-registry';
import { resolveGoldenReferencePack } from '../../architectural-dna/references/golden-reference-library';
import { resolveStyleBible } from '../../studio-world-style/style-bible/registry';
import { injectStyleBibleForCanonicalDepartment } from '../../studio-world-style/integrations/experience-lab-style-guardian';
import type { DepartmentBible } from '../schemas/department-bible';
import { resolveDepartmentBible } from '../registry/bible-registry';
import type { ArchitecturalDnaProfile } from '../../architectural-dna/schemas/dna-profile';
import type { GoldenReferencePack } from '../../architectural-dna/schemas/golden-reference';
import type { StudioWorldStyleBible } from '../../studio-world-style/style-bible/contract';

export const DEPARTMENT_COMPILER_VERSION = 'department-compiler.v1' as const;

export type CompiledDepartment = {
  compilerVersion: typeof DEPARTMENT_COMPILER_VERSION;
  departmentId: CanonicalMainDepartmentId;
  bibleVersion: string;
  styleBibleVersion: string;
  dnaVersion: string;
  goldenReferencePackId: string;
  blueprintRevision: number;
  constructionPlanId: string;
  promptVersion: string;
  styleInjectionOk: boolean;
  compiledAt: string;
  bible: DepartmentBible;
  architecturalDna: ArchitecturalDnaProfile;
  styleBible: StudioWorldStyleBible;
  goldenReferencePack: GoldenReferencePack;
  constructionPlan: ConstructionPlan;
};

/**
 * DepartmentCompiler™ — assembles a canonical department from governed layers.
 * Hierarchy: Style Bible → Department Bible → Architectural DNA → Golden References → Blueprint → Construction Plan.
 */
export function compileDepartment(
  departmentId: CanonicalMainDepartmentId,
  renderKind: 'landscape' | 'portrait' = 'landscape'
): { ok: true; compiled: CompiledDepartment } | { ok: false; code: string; message: string } {
  const record = getCanonicalDepartmentRecord(departmentId);
  if (!record) {
    return { ok: false, code: 'DEPARTMENT_UNKNOWN', message: `Unknown canonical department: ${departmentId}` };
  }

  const bible = resolveDepartmentBible(departmentId);
  const architecturalDna = resolveArchitecturalDna(departmentId);
  const styleBible = resolveStyleBible();
  const goldenReferencePack = resolveGoldenReferencePack(departmentId);
  const styleInjection = injectStyleBibleForCanonicalDepartment(departmentId);

  const built = buildCanonicalDepartmentConstructionPlan(departmentId, renderKind);
  if (!built.ok) return built;

  return {
    ok: true,
    compiled: {
      compilerVersion: DEPARTMENT_COMPILER_VERSION,
      departmentId,
      bibleVersion: bible.bibleVersion,
      styleBibleVersion: styleBible.authority.bibleVersion,
      dnaVersion: architecturalDna.dnaVersion,
      goldenReferencePackId: goldenReferencePack.packId,
      blueprintRevision: record.blueprintRevision,
      constructionPlanId: built.plan.planId,
      promptVersion: built.plan.versions.promptVersion,
      styleInjectionOk: styleInjection.cohesionOk,
      compiledAt: new Date().toISOString(),
      bible,
      architecturalDna,
      styleBible,
      goldenReferencePack,
      constructionPlan: built.plan,
    },
  };
}

export function compileAllDepartments(
  renderKind: 'landscape' | 'portrait' = 'landscape'
): Array<{ departmentId: CanonicalMainDepartmentId; result: ReturnType<typeof compileDepartment> }> {
  return CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((r) => ({
    departmentId: r.departmentId,
    result: compileDepartment(r.departmentId, renderKind),
  }));
}
