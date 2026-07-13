/**
 * @deprecated Use architectural-dna/compiler/founder-render-prompt-compiler — thin bridge for existing imports.
 */
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { BrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import { compileFromConstructionPlan } from '../architectural-dna/compiler/founder-render-prompt-compiler';

export type CanonicalFounderRenderPrompt = {
  prompt: string;
  negativePrompt: string;
  promptVersion: string;
  promptHash: string;
  departmentId: CanonicalMainDepartmentId;
  artifactIntent: 'master-founder-landscape';
  architecturalFingerprint: string[];
  negativePromptHash?: string;
  compilerDiagnostics?: import('../architectural-dna/schemas/compiler-contract').FounderRenderCompilerDiagnostics;
};

export function buildCanonicalFounderRenderPrompt(input: {
  plan: ConstructionPlan;
  brandPackage: BrandMaterialPackage;
  founderRevisionNote?: string | null;
  renderKind?: 'landscape' | 'portrait';
}): CanonicalFounderRenderPrompt {
  const compiled = compileFromConstructionPlan({
    plan: input.plan,
    brandPackage: input.brandPackage,
    founderRevisionNote: input.founderRevisionNote,
    renderKind: input.renderKind ?? 'landscape',
    organizationId: input.plan.metadata.organizationId,
  });
  return {
    prompt: compiled.prompt,
    negativePrompt: compiled.negativePrompt,
    promptVersion: compiled.promptVersion,
    promptHash: compiled.promptHash,
    departmentId: compiled.departmentId,
    artifactIntent: compiled.artifactIntent === 'master-founder-portrait' ? 'master-founder-landscape' : compiled.artifactIntent,
    architecturalFingerprint: compiled.architecturalFingerprint,
    negativePromptHash: compiled.negativePromptHash,
    compilerDiagnostics: compiled.diagnostics,
  };
}
