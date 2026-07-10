/** Creative Studio Preview Compiler™ — read-only preview specifications (Phase 2). */

export const CREATIVE_PREVIEW_READ_ONLY = true as const;

export type CreativePreviewCompanyId = 'studio-os' | 'frontal-slayer' | 'ndx';

export type CreativePreviewConceptTier = 'recommended' | 'alternative' | 'experimental';

export type PreviewArchitectureArchetype =
  | 'institutional-crystal'
  | 'luxury-mansion'
  | 'broadcast-command';

export type PreviewSpecification = {
  designPhilosophy: string;
  interiorArchitecture: string;
  materialSystem: string[];
  lightingLanguage: string;
  spatialOrganization: string;
  interactionPhilosophy: string;
  motionBehavior: string;
  environmentalMood: string;
  workflowStructure: string;
  signatureExperiences: string[];
};

export type CreativePreviewConcept = {
  conceptId: 'a' | 'b' | 'c';
  tier: CreativePreviewConceptTier;
  label: string;
  whyExists: string;
  traitsProduced: string[];
  strengths: string[];
  weaknesses: string[];
  confidencePct: number;
  specification: PreviewSpecification;
};

export type CreativeIntelligenceScoreCategory =
  | 'industry-recognition'
  | 'brand-identity'
  | 'creative-direction'
  | 'spatial-logic'
  | 'workflow-accuracy'
  | 'narrative-alignment'
  | 'luxury-premium'
  | 'emotional-accuracy'
  | 'founder-alignment'
  | 'overall-confidence';

export type CreativeIntelligenceScore = {
  category: CreativeIntelligenceScoreCategory;
  label: string;
  scorePct: number;
  evidence: string[];
};

export type CreativeIntelligenceScorecard = {
  scores: CreativeIntelligenceScore[];
  overallConfidencePct: number;
  summary: string;
};

export type GoverningInputRef = {
  source: string;
  field: string;
  value: string;
};

export type CreativeStudioPreviewResult = {
  readOnly: typeof CREATIVE_PREVIEW_READ_ONLY;
  companyId: CreativePreviewCompanyId;
  companyLabel: string;
  registryCompanyId: string;
  compiledAt: string;
  architectureArchetype: PreviewArchitectureArchetype;
  governingInputs: GoverningInputRef[];
  dnaInheritance: string[];
  rulesApplied: string[];
  constraintsRespected: string[];
  reasoningChain: string[];
  concepts: CreativePreviewConcept[];
  recommendedConceptId: 'a';
  scorecard: CreativeIntelligenceScorecard;
  validationSummary: string;
};

export type CreativeStudioPreviewBundle = {
  companies: Record<CreativePreviewCompanyId, CreativeStudioPreviewResult>;
  comparedAt: string;
};
