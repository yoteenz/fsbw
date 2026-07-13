import type { ConstructionPlan } from '../../blueprint-author/construction-plan-schema';
import type { BrandMaterialPackage } from '../../creative-production/brand-asset-grounding';
import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import type { ArchitecturalDnaProfile } from './dna-profile';
import type { GoldenReferencePack } from './golden-reference';
import type { CompanyDnaProfile } from './company-dna';

export const FOUNDER_RENDER_PROMPT_COMPILER_VERSION = 'founder-render-prompt-compiler.v1' as const;

export type FounderRenderCompileRequest = {
  departmentId: CanonicalMainDepartmentId;
  plan: ConstructionPlan;
  brandPackage: BrandMaterialPackage;
  companyDna: CompanyDnaProfile;
  renderKind: 'landscape' | 'portrait';
  founderRevisionNote?: string | null;
};

export type FounderRenderCompileResult = {
  compilerVersion: typeof FOUNDER_RENDER_PROMPT_COMPILER_VERSION;
  prompt: string;
  negativePrompt: string;
  promptVersion: string;
  promptHash: string;
  negativePromptHash: string;
  departmentId: CanonicalMainDepartmentId;
  dnaProfile: ArchitecturalDnaProfile;
  goldenReferencePack: GoldenReferencePack;
  companyDna: CompanyDnaProfile;
  artifactIntent: 'master-founder-landscape' | 'master-founder-portrait';
  architecturalFingerprint: string[];
  diagnostics: FounderRenderCompilerDiagnostics;
};

export type FounderRenderCompilerDiagnostics = {
  departmentDnaVersion: string;
  departmentDnaRevision: number;
  goldenReferenceVersion: string;
  goldenReferenceRevision: number;
  promptCompilerVersion: string;
  blueprintVersion: string;
  blueprintRevision: number;
  referencePackVersion: string;
  cameraVersion: string;
  lightingVersion: string;
  materialVersion: string;
  qualityVersion: string;
  promptHash: string;
  negativePromptHash: string;
  companyDnaVersion: string;
  organizationId: string;
  renderKind: 'landscape' | 'portrait';
  aspectRatio: '21:9' | '9:16';
};
