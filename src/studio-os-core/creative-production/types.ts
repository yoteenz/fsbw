/**
 * Creative Production Graph™ — canonical types (Genesis §9B.28 Phase 1).
 * Binding contracts for Creative Direction Studio migration.
 */

/** Expression families — universal taxonomy, not per-channel engines. */
export type ExpressionFamily =
  | 'product-commerce'
  | 'campaign-launch'
  | 'screen-interactive'
  | 'moving-image'
  | 'executive-institutional'
  | 'physical-environmental';

/** Production disciplines map to Foundry recipe families, not constitutional engines. */
export type ProductionDiscipline =
  | 'static-image'
  | 'icon'
  | 'product-photography'
  | 'video'
  | 'motion-graphics'
  | 'email-hero'
  | 'social-derivative'
  | 'experience-compile'
  | 'print-prepress'
  | 'deck'
  | 'packaging';

/** Delivery touchpoints — Content Engine or Experience Engine owns delivery. */
export type TouchpointKind =
  | 'single-asset'
  | 'collection'
  | 'campaign'
  | 'launch-campaign'
  | 'product-launch'
  | 'email-campaign'
  | 'social-campaign'
  | 'advertisement'
  | 'product-photography'
  | 'packaging'
  | 'landing-page'
  | 'web-experience'
  | 'mobile-experience'
  | 'video'
  | 'motion-graphics'
  | 'presentation-deck'
  | 'print-collateral'
  | 'investor-materials'
  | 'retail-installation';

export type AudienceScope = {
  segment: string;
  regions?: string[];
  channels?: string[];
};

export type VersionPin = {
  system: 'company-genome' | 'brand-dna' | 'design-canon' | 'narrative-blueprint' | 'production-genome';
  id: string;
  version: string;
};

export type TouchpointPlan = {
  touchpoint: TouchpointKind;
  discipline: ProductionDiscipline;
  priority: 'primary' | 'secondary' | 'optional';
  adaptationOf?: string;
};

export type CreativeInitiativeStatus =
  | 'draft'
  | 'directing'
  | 'orchestrating'
  | 'in_production'
  | 'in_review'
  | 'delivered'
  | 'archived';

/** Creative Direction Studio — founder-facing unit of creative work. */
export type CreativeInitiative = {
  id: string;
  tenantId: string;
  companyId: string;
  title: string;
  expressionFamily: ExpressionFamily;
  businessObjective: string;
  successMetric?: string;
  audienceScope: AudienceScope;
  touchpointPlan: TouchpointPlan[];
  companyGenomeVersion: VersionPin;
  brandDnaVersion: VersionPin;
  designCanonVersion: VersionPin;
  narrativeBlueprintId?: string;
  productionGenomeId?: string;
  orchestrationPlanId?: string;
  status: CreativeInitiativeStatus;
  createdAt: string;
  updatedAt: string;
};

export type AuthorityRecord = {
  actorId: string;
  actorEmail?: string;
  role: 'founder' | 'delegated' | 'system' | 'compat-legacy';
  issuedVia: 'studio-production-system' | 'demo-seed' | 'legacy-adapter';
};

/** Immutable authorization to manufacture — generation APIs must verify. */
export type ProductionAuthorization = {
  id: string;
  productionPackageId: string;
  narrativeBlueprintId: string;
  productionGenomeId: string;
  initiativeId: string;
  satisfiedGateIds: string[];
  issuedAt: string;
  issuedBy: AuthorityRecord;
  expiresAt?: string;
  scope: {
    touchpoints: TouchpointKind[];
    assetIntents: string[];
    maxCost?: number;
  };
  genomeRefs: {
    companyGenome: VersionPin;
    brandDna: VersionPin;
    designCanon: VersionPin;
  };
  rightsState: 'pending' | 'cleared' | 'restricted';
  approvalState: 'pending' | 'approved' | 'rejected';
  signature: string;
};

/** Every output declares lineage per Genesis §9B.28 rule 6. */
export type ExpressionLineage =
  | { kind: 'source'; initiativeId: string }
  | {
      kind: 'adaptation';
      sourceAssetRegistryId: string;
      sourceExpressionId: string;
      adaptationReason: string;
    }
  | { kind: 'independent'; rationale: string; governingDecisionId: string };

export type SourceReference = {
  kind: 'genome' | 'brand' | 'design-canon' | 'asset-registry' | 'narrative' | 'manual';
  refId: string;
  version?: string;
};

export type RightsRequirement = {
  licenseClass: string;
  territory?: string;
  usageWindow?: string;
  requiredApproval?: boolean;
};

/** Permitted manufacturing intent — references ProductionAuthorization. */
export type AssetIntent = {
  id: string;
  productionAuthorizationId: string;
  initiativeId: string;
  touchpoint: TouchpointKind;
  discipline: ProductionDiscipline;
  recipeSlug: string;
  inputRefs: SourceReference[];
  rightsRequirements: RightsRequirement[];
  qualityGates: string[];
  expressionLineage: ExpressionLineage;
  outputClass: 'material' | 'exploratory_draft' | 'ephemeral';
};

export type CompiledRecipe = {
  intentId: string;
  provider: string;
  model: string;
  parameters: Record<string, unknown>;
  recipeVersionHash: string;
};

export type CostReceipt = {
  provider: string;
  model: string;
  estimatedUsd: number;
  actualUsd?: number;
  currency: string;
};

export type BuildReport = {
  jobId: string;
  qcHints: string[];
  warnings: string[];
  compiledAt: string;
};

export type ManufacturingJob = {
  id: string;
  productionAuthorizationId: string;
  assetIntentId: string;
  compiledRecipe: CompiledRecipe;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  providerJobId?: string;
  costReceipt?: CostReceipt;
  buildReport?: BuildReport;
  outputAssetRegistryId?: string;
  audit: GovernedGenerationAudit;
};

/** Gateway audit record — source, intent, genome refs, rights, approval, output class. */
export type GovernedGenerationAudit = {
  gatewayVersion: 'phase-1';
  sourceRoute: string;
  sourceSystem: 'studio-builder' | 'studio-foundry' | 'studio-generate-asset' | 'generation-gateway';
  initiativeId: string;
  productionAuthorizationId: string;
  assetIntentId: string;
  genomeRefs: ProductionAuthorization['genomeRefs'];
  rightsState: ProductionAuthorization['rightsState'];
  approvalState: ProductionAuthorization['approvalState'];
  outputClass: AssetIntent['outputClass'];
  expressionLineage: ExpressionLineage;
  legacyCompat?: boolean;
  recordedAt: string;
};

export type GovernedGenerationRequest = {
  productionAuthorizationId: string;
  assetIntent: Omit<AssetIntent, 'id' | 'productionAuthorizationId'> & { id?: string };
  orgId: string;
  sourceRoute: string;
  sourceSystem: GovernedGenerationAudit['sourceSystem'];
  /** Legacy bypass flags — blocked on material paths in Phase 1. */
  skipCie?: boolean;
  forceGenerate?: boolean;
  evaluateOnly?: boolean;
  cieDecisionId?: string;
  /** Provider execution payload — route-specific. */
  execution: Record<string, unknown>;
};

export type GovernedGenerationResult =
  | {
      ok: true;
      audit: GovernedGenerationAudit;
      manufacturingJob: ManufacturingJob;
      publicUrl?: string;
      storagePath?: string;
      model?: string;
      assetRegistryId?: string;
    }
  | {
      ok: false;
      code: string;
      error: string;
      audit?: Partial<GovernedGenerationAudit>;
    };

export type RegistryWritePolicy = {
  soleWriteTarget: 'supabase-asset-registry';
  localRegistries: 'read-only-cache' | 'deprecated-write';
};
