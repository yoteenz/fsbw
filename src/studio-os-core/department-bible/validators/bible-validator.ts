import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../../canonical-studio-world/canonical-department-registry';
import { resolveArchitecturalDna } from '../../architectural-dna/registry/dna-registry';
import { resolveGoldenReferencePack } from '../../architectural-dna/references/golden-reference-library';
import { resolveStyleBible } from '../../studio-world-style/style-bible/registry';
import { DEPARTMENT_BIBLE_REGISTRY, resolveDepartmentBible } from '../registry/bible-registry';
import { compileDepartment } from '../compiler/department-compiler';

export const DEPARTMENT_BIBLE_VALIDATOR_VERSION = 'department-bible-validator.v1' as const;

export type BibleValidationResult = {
  departmentId: CanonicalMainDepartmentId;
  ok: boolean;
  violations: string[];
};

function validateBibleFields(bible: ReturnType<typeof resolveDepartmentBible>): string[] {
  const violations: string[] = [];
  if (!bible.mission?.trim()) violations.push('missing-mission');
  if (!bible.purpose?.trim()) violations.push('missing-purpose');
  if (!bible.responsibilities.length) violations.push('missing-responsibilities');
  if (!bible.requiredAiWorkers.length) violations.push('missing-ai-workers');
  if (!bible.dependencies.length && !bible.upstreamDepartments.length) {
    violations.push('missing-dependencies');
  }
  if (!bible.lifecycleStates.length) violations.push('missing-lifecycle');
  return violations;
}

export function validateDepartmentBible(departmentId: CanonicalMainDepartmentId): BibleValidationResult {
  const violations: string[] = [];
  const bible = resolveDepartmentBible(departmentId);

  violations.push(...validateBibleFields(bible));

  const dna = resolveArchitecturalDna(departmentId);
  if (!dna.positivePromptTemplate?.trim()) violations.push('missing-architectural-dna');
  if (!dna.forbiddenElements.length) violations.push('missing-dna-forbidden-elements');

  const goldenPack = resolveGoldenReferencePack(departmentId);
  if (!goldenPack.packId) violations.push('missing-golden-references');
  if (!goldenPack.heroRender.assetPath) violations.push('missing-golden-hero-render');

  const styleBible = resolveStyleBible();
  if (!styleBible.authority.hierarchy.includes('Studio World Style Bible')) {
    violations.push('missing-style-bible-inheritance');
  }
  if (!styleBible.authority.hierarchy.includes('Department Bible')) {
    violations.push('missing-department-bible-in-hierarchy');
  }

  const compiled = compileDepartment(departmentId, 'landscape');
  if (!compiled.ok) {
    violations.push(`department-compiler-failed:${compiled.code}`);
  } else {
    if (!compiled.compiled.constructionPlan.planId) violations.push('missing-blueprint');
    if (!compiled.compiled.constructionPlan.versions.promptVersion) violations.push('missing-construction-plan');
    if (!compiled.compiled.styleInjectionOk) violations.push('style-bible-injection-failed');
  }

  return { departmentId, ok: violations.length === 0, violations };
}

export function validateAllDepartmentBibles(): BibleValidationResult[] {
  return CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((r) => validateDepartmentBible(r.departmentId));
}

export function assertCanonicalDepartmentComplete(departmentId: CanonicalMainDepartmentId): boolean {
  return validateDepartmentBible(departmentId).ok;
}

export function countBibleRegistryCompleteness(): { total: number; complete: number; incomplete: string[] } {
  const results = validateAllDepartmentBibles();
  const incomplete = results.filter((r) => !r.ok).map((r) => r.departmentId);
  return { total: results.length, complete: results.length - incomplete.length, incomplete };
}

export function assertOneBiblePerDepartment(): boolean {
  return Object.keys(DEPARTMENT_BIBLE_REGISTRY).length === CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length;
}
