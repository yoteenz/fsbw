// src/studio-os-core/creative-production/initiative-model.ts
var EXPRESSION_FAMILIES = [
  "product-commerce",
  "campaign-launch",
  "screen-interactive",
  "moving-image",
  "executive-institutional",
  "physical-environmental"
];
function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function createVersionPin(system, id, version) {
  return { system, id, version };
}
function createCreativeInitiative(input) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: uid("initiative"),
    tenantId: input.tenantId,
    companyId: input.companyId,
    title: input.title.trim(),
    expressionFamily: input.expressionFamily,
    businessObjective: input.businessObjective.trim(),
    successMetric: input.successMetric?.trim(),
    audienceScope: input.audienceScope,
    touchpointPlan: input.touchpointPlan,
    companyGenomeVersion: input.companyGenomeVersion,
    brandDnaVersion: input.brandDnaVersion,
    designCanonVersion: input.designCanonVersion,
    narrativeBlueprintId: input.narrativeBlueprintId,
    productionGenomeId: input.productionGenomeId,
    status: input.status ?? "draft",
    createdAt: now,
    updatedAt: now
  };
}
function validateCreativeInitiative(initiative) {
  const errors = [];
  if (!initiative.title.trim()) errors.push("title is required");
  if (!initiative.businessObjective.trim()) errors.push("businessObjective is required");
  if (!EXPRESSION_FAMILIES.includes(initiative.expressionFamily)) {
    errors.push(`invalid expressionFamily: ${initiative.expressionFamily}`);
  }
  if (!initiative.touchpointPlan.length) errors.push("touchpointPlan must include at least one touchpoint");
  for (const pin of [
    initiative.companyGenomeVersion,
    initiative.brandDnaVersion,
    initiative.designCanonVersion
  ]) {
    if (!pin.id || !pin.version) errors.push(`version pin ${pin.system} requires id and version`);
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
function assertMaterialInitiativeReady(initiative) {
  const base = validateCreativeInitiative(initiative);
  if (!base.ok) return base;
  const errors = [];
  if (!initiative.narrativeBlueprintId) errors.push("narrativeBlueprintId required for material production");
  if (!initiative.productionGenomeId) errors.push("productionGenomeId required for material production");
  return errors.length ? { ok: false, errors } : { ok: true };
}

// src/studio-os-core/creative-production/authorization.ts
var REQUIRED_GATE_IDS_FOR_MATERIAL = [
  "narrative-blueprint",
  "strategic-fit",
  "production-package",
  "asset-generation"
];
function validateAuthorizationStructure(authorization, nowMs = Date.now()) {
  if (!authorization.id.trim()) {
    return { ok: false, code: "AUTH_INVALID", error: "ProductionAuthorization.id is required" };
  }
  if (!authorization.signature.trim()) {
    return { ok: false, code: "AUTH_UNSIGNED", error: "ProductionAuthorization.signature is required" };
  }
  if (authorization.approvalState === "rejected") {
    return { ok: false, code: "AUTH_REJECTED", error: "Production authorization was rejected" };
  }
  if (authorization.rightsState === "restricted") {
    return { ok: false, code: "AUTH_RIGHTS_RESTRICTED", error: "Rights clearance required before manufacture" };
  }
  if (authorization.expiresAt) {
    const expires = Date.parse(authorization.expiresAt);
    if (!Number.isNaN(expires) && expires < nowMs) {
      return { ok: false, code: "AUTH_EXPIRED", error: "Production authorization expired" };
    }
  }
  for (const gateId of REQUIRED_GATE_IDS_FOR_MATERIAL) {
    if (!authorization.satisfiedGateIds.includes(gateId)) {
      return {
        ok: false,
        code: "AUTH_GATE_MISSING",
        error: `Required gate not satisfied: ${gateId}`
      };
    }
  }
  for (const pin of [
    authorization.genomeRefs.companyGenome,
    authorization.genomeRefs.brandDna,
    authorization.genomeRefs.designCanon
  ]) {
    if (!pin.id || !pin.version) {
      return {
        ok: false,
        code: "AUTH_GENOME_PIN",
        error: `Genome pin ${pin.system} requires id and version`
      };
    }
  }
  return { ok: true, authorization };
}
function authorizationPermitsIntent(authorization, touchpoint, assetIntentId) {
  const structure = validateAuthorizationStructure(authorization);
  if (!structure.ok) return structure;
  if (authorization.scope.touchpoints.length > 0 && !authorization.scope.touchpoints.includes(touchpoint)) {
    return {
      ok: false,
      code: "AUTH_SCOPE_TOUCHPOINT",
      error: `Touchpoint "${touchpoint}" not permitted by authorization scope`
    };
  }
  if (authorization.scope.assetIntents.length > 0 && !authorization.scope.assetIntents.includes(assetIntentId)) {
    return {
      ok: false,
      code: "AUTH_SCOPE_INTENT",
      error: `AssetIntent "${assetIntentId}" not permitted by authorization scope`
    };
  }
  return { ok: true, authorization };
}
function buildAuthorizationPayloadForSigning(authorization) {
  const clone = { ...authorization, signature: void 0 };
  return JSON.stringify(clone);
}
function demoGenomePins() {
  const pin = (system, id) => ({
    system,
    id,
    version: "phase-1-demo"
  });
  return {
    companyGenome: pin("company-genome", "demo-company-genome"),
    brandDna: pin("brand-dna", "demo-brand-dna"),
    designCanon: pin("design-canon", "demo-design-canon")
  };
}

// src/studio-os-core/creative-production/lineage.ts
function buildSourceLineage(initiativeId) {
  return { kind: "source", initiativeId };
}
function buildRegistryLineageMetadata(audit) {
  return {
    creative_production: {
      gatewayVersion: audit.gatewayVersion,
      initiativeId: audit.initiativeId,
      productionAuthorizationId: audit.productionAuthorizationId,
      assetIntentId: audit.assetIntentId,
      outputClass: audit.outputClass,
      expressionLineage: audit.expressionLineage,
      genomeRefs: audit.genomeRefs,
      rightsState: audit.rightsState,
      approvalState: audit.approvalState,
      sourceRoute: audit.sourceRoute,
      sourceSystem: audit.sourceSystem,
      legacyCompat: audit.legacyCompat ?? false,
      recordedAt: audit.recordedAt
    }
  };
}
function lineageToRegistryRelationships(lineage, orgId) {
  if (lineage.kind === "adaptation") {
    return [
      {
        relation_type: "adapted_from",
        target_kind: "asset",
        to_asset_id: lineage.sourceAssetRegistryId,
        metadata: {
          org_id: orgId,
          source_expression_id: lineage.sourceExpressionId,
          adaptation_reason: lineage.adaptationReason
        }
      }
    ];
  }
  if (lineage.kind === "independent") {
    return [
      {
        relation_type: "governed_by",
        target_kind: "workspace",
        target_ref: lineage.governingDecisionId,
        metadata: { rationale: lineage.rationale }
      }
    ];
  }
  return [
    {
      relation_type: "sources",
      target_kind: "workspace",
      target_ref: lineage.initiativeId,
      metadata: { lineage_kind: "source" }
    }
  ];
}

// src/studio-os-core/creative-production/demo-seed.ts
var DEMO_TENANT_ID = "frontal-slayer";
var DEMO_COMPANY_ID = "frontal-slayer";
var DEMO_INITIATIVE_ID = "initiative-cds-phase1-demo";
var DEMO_PACKAGE_ID = "pkg-creative-direction-golden-v1";
var DEMO_BLUEPRINT_ID = "narrative-blueprint-phase1-demo";
var DEMO_GENOME_ID = "production-genome-phase1-demo";
var DEMO_AUTHORIZATION_ID = "auth-cds-phase1-demo";
function createDemoCreativeInitiative() {
  const initiative = createCreativeInitiative({
    tenantId: DEMO_TENANT_ID,
    companyId: DEMO_COMPANY_ID,
    title: "Creative Direction Studio Phase 1 Verification",
    expressionFamily: "campaign-launch",
    businessObjective: "Prove governed generation through canonical production graph types",
    audienceScope: { segment: "founder", channels: ["studio-internal"] },
    touchpointPlan: [
      { touchpoint: "single-asset", discipline: "icon", priority: "primary" }
    ],
    companyGenomeVersion: createVersionPin("company-genome", "frontal-slayer-genome", "phase-1-demo"),
    brandDnaVersion: createVersionPin("brand-dna", "frontal-slayer-brand", "phase-1-demo"),
    designCanonVersion: createVersionPin("design-canon", "frontal-slayer-design-canon", "phase-1-demo"),
    narrativeBlueprintId: DEMO_BLUEPRINT_ID,
    productionGenomeId: DEMO_GENOME_ID,
    status: "in_production"
  });
  return { ...initiative, id: DEMO_INITIATIVE_ID };
}
function createDemoProductionAuthorizationPayload(initiative) {
  return {
    id: DEMO_AUTHORIZATION_ID,
    productionPackageId: DEMO_PACKAGE_ID,
    narrativeBlueprintId: DEMO_BLUEPRINT_ID,
    productionGenomeId: DEMO_GENOME_ID,
    initiativeId: initiative.id,
    satisfiedGateIds: [
      "narrative-blueprint",
      "strategic-fit",
      "production-package",
      "asset-generation"
    ],
    issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    issuedBy: {
      actorId: "studio-production-system",
      role: "system",
      issuedVia: "demo-seed"
    },
    scope: {
      touchpoints: ["single-asset"],
      assetIntents: ["intent-cds-phase1-demo"]
    },
    genomeRefs: demoGenomePins(),
    rightsState: "cleared",
    approvalState: "approved"
  };
}
function createDemoAssetIntent(initiativeId) {
  return {
    id: "intent-cds-phase1-demo",
    productionAuthorizationId: DEMO_AUTHORIZATION_ID,
    initiativeId,
    touchpoint: "single-asset",
    discipline: "icon",
    recipeSlug: "hero-icon",
    inputRefs: [
      { kind: "genome", refId: "frontal-slayer-genome", version: "phase-1-demo" },
      { kind: "brand", refId: "frontal-slayer-brand", version: "phase-1-demo" },
      { kind: "design-canon", refId: "frontal-slayer-design-canon", version: "phase-1-demo" }
    ],
    rightsRequirements: [{ licenseClass: "internal-studio", requiredApproval: true }],
    qualityGates: ["design-canon", "brand-alignment"],
    expressionLineage: buildSourceLineage(initiativeId),
    outputClass: "material"
  };
}

// src/studio-os-core/creative-production/validation-compile-context.ts
function hasCompleteValidationCompileContext(ctx) {
  if (ctx === true || ctx === false || ctx == null) return false;
  if (ctx.validationMode !== true) return false;
  return String(ctx.compileRunId ?? "").trim().length > 0 && String(ctx.previewSessionId ?? "").trim().length > 0 && String(ctx.organizationId ?? "").trim().length > 0 && String(ctx.departmentId ?? "").trim().length > 0 && String(ctx.stationId ?? "").trim().length > 0 && String(ctx.projectId ?? "").trim().length > 0;
}

// src/studio-os-core/creative-production/cie-enforcement.ts
function enforceCieOnMaterialPath(request) {
  const outputClass = request.assetIntent.outputClass;
  if (outputClass !== "material") {
    return { ok: true };
  }
  if (request.skipCie) {
    return {
      ok: false,
      code: "CIE_SKIP_FORBIDDEN",
      error: "skipCie is forbidden on material generation paths"
    };
  }
  if (request.forceGenerate) {
    return {
      ok: false,
      code: "CIE_FORCE_FORBIDDEN",
      error: "forceGenerate is forbidden on material generation paths"
    };
  }
  return { ok: true };
}

// src/studio-os-core/creative-production/graph.ts
function uid2(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function representGovernedGenerationRequest(input) {
  const { authorization, initiative, request } = input;
  const initiativeCheck = validateCreativeInitiative(initiative);
  if (!initiativeCheck.ok) {
    return {
      ok: false,
      code: "INITIATIVE_INVALID",
      error: initiativeCheck.errors.join("; ")
    };
  }
  if (request.assetIntent.outputClass === "material") {
    const materialReady = assertMaterialInitiativeReady(initiative);
    if (!materialReady.ok) {
      return { ok: false, code: "INITIATIVE_NOT_READY", error: materialReady.errors.join("; ") };
    }
  }
  const authStructure = validateAuthorizationStructure(authorization);
  if (!authStructure.ok) {
    return { ok: false, code: authStructure.code, error: authStructure.error };
  }
  if (authorization.initiativeId !== initiative.id) {
    return {
      ok: false,
      code: "AUTH_INITIATIVE_MISMATCH",
      error: "ProductionAuthorization initiativeId does not match CreativeInitiative"
    };
  }
  const assetIntentId = request.assetIntent.id ?? uid2("intent");
  const authScope = authorizationPermitsIntent(
    authorization,
    request.assetIntent.touchpoint,
    assetIntentId
  );
  if (!authScope.ok) {
    return { ok: false, code: authScope.code, error: authScope.error };
  }
  const cie = enforceCieOnMaterialPath(request);
  if (!cie.ok) {
    return { ok: false, code: cie.code, error: cie.error };
  }
  const audit = {
    gatewayVersion: "phase-1",
    sourceRoute: request.sourceRoute,
    sourceSystem: request.sourceSystem,
    initiativeId: initiative.id,
    productionAuthorizationId: authorization.id,
    assetIntentId,
    genomeRefs: authorization.genomeRefs,
    rightsState: authorization.rightsState,
    approvalState: authorization.approvalState,
    outputClass: request.assetIntent.outputClass,
    expressionLineage: request.assetIntent.expressionLineage ?? buildSourceLineage(initiative.id),
    legacyCompat: authorization.issuedBy.role === "compat-legacy",
    recordedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const compiledRecipe = {
    intentId: assetIntentId,
    provider: "fal",
    model: String(request.execution.model ?? "fal-ai/nano-banana-pro/edit"),
    parameters: request.execution,
    recipeVersionHash: `phase1-${request.assetIntent.recipeSlug}`
  };
  const manufacturingJob = {
    id: uid2("job"),
    productionAuthorizationId: authorization.id,
    assetIntentId,
    compiledRecipe,
    status: "queued",
    audit
  };
  return {
    ok: true,
    audit,
    manufacturingJob
  };
}

// src/studio-os-core/asset-compiler/recipes.ts
var UNIVERSAL_NEGATIVE = "no watermark, no signature, no random text, no broken typography, no low resolution, no muddy lighting, no clutter, no generic stock aesthetic";
var GENERATION_RECIPES = {
  "hero-icon": {
    id: "hero-icon",
    label: "Hero Icon\u2122",
    falModel: "openai/gpt-image-2/edit",
    defaultPromptPrefix: "Studio World luxury hero icon, iconic single object silhouette, crystalline glass, polished marble, soft museum spotlight, premium spatial design language.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no background, no frame, no UI card, no text label`,
    resolution: "1536x1536",
    aspectRatio: "1:1",
    backgroundBehavior: "transparent",
    lightingProfile: "museum-spotlight-soft-rim",
    materialProfile: "crystal-glass-marble-champagne-metal",
    outputFormat: "png",
    registryDestination: "icons",
    versioningStrategy: "semantic-version",
    upscalingPipeline: "transparent-png-polish",
    metadata: {
      tags: ["hero-icon", "transparent", "studio-world"],
      relatedSystems: ["Orb\u2122", "Atlas\u2122", "Mission Control\u2122", "Asset Registry\u2122"],
      departmentsUsingIt: ["Orb", "Atlas", "Mission Control"],
      transparentBackground: true,
      foundryAssetClass: "hero-icon"
    }
  },
  environment: {
    id: "environment",
    label: "Environment\u2122",
    falModel: "fal-ai/nano-banana-pro/edit",
    defaultPromptPrefix: "Studio World immersive environment shell, world-first architecture, luxury headquarters atmosphere, modular room background, no dashboard UI.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no people, no logos, no brand colors, no interface chrome`,
    resolution: "4K",
    aspectRatio: "16:9",
    backgroundBehavior: "studio-world-environment",
    lightingProfile: "ambient-headquarters-depth",
    materialProfile: "marble-glass-warm-metal-environment",
    outputFormat: "webp",
    registryDestination: "images",
    versioningStrategy: "immutable-generation",
    upscalingPipeline: "webp-q92-room-polish",
    metadata: {
      tags: ["environment", "room-shell", "studio-world"],
      relatedSystems: ["Scene Assembly\u2122", "Experience Engine\u2122", "Asset Registry\u2122"],
      departmentsUsingIt: ["Scene Assembly", "Experience System"],
      transparentBackground: false,
      foundryAssetClass: "architecture"
    }
  },
  furniture: {
    id: "furniture",
    label: "Furniture\u2122",
    falModel: "fal-ai/nano-banana-pro/edit",
    defaultPromptPrefix: "Single modular luxury furniture asset for Studio World, isolated object, runtime-ready proportions, glass and stone material language.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no room background, no people, no text, no logos`,
    resolution: "2K",
    aspectRatio: "1:1",
    backgroundBehavior: "transparent",
    lightingProfile: "object-studio-soft-shadow",
    materialProfile: "glass-marble-brushed-metal",
    outputFormat: "png",
    registryDestination: "3d-models",
    versioningStrategy: "surgical-regeneration",
    upscalingPipeline: "object-cutout-and-lod",
    metadata: {
      tags: ["furniture", "modular-object", "scene-assembly"],
      relatedSystems: ["Scene Assembly\u2122", "Asset Registry\u2122", "Marketplace\u2122"],
      departmentsUsingIt: ["Scene Assembly", "Marketplace"],
      transparentBackground: true,
      foundryAssetClass: "furniture"
    }
  },
  orb: {
    id: "orb",
    label: "Orb\u2122",
    falModel: "openai/gpt-image-2/edit",
    defaultPromptPrefix: "Studio Orb artifact, luminous intelligent crystal sphere, sacred architectural object, premium glass refraction, calm executive presence.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no face, no mascot, no cartoon, no text`,
    resolution: "1536x1536",
    aspectRatio: "1:1",
    backgroundBehavior: "transparent",
    lightingProfile: "orb-inner-glow-rim-light",
    materialProfile: "crystal-energy-glass",
    outputFormat: "png",
    registryDestination: "icons",
    versioningStrategy: "semantic-version",
    upscalingPipeline: "transparent-png-glow-preservation",
    metadata: {
      tags: ["orb", "artifact", "transparent"],
      relatedSystems: ["Orb\u2122", "Command Dock\u2122", "Mission Control\u2122"],
      departmentsUsingIt: ["Orb", "Mission Control"],
      transparentBackground: true,
      foundryAssetClass: "landmark-object"
    }
  },
  "glass-ui": {
    id: "glass-ui",
    label: "Glass UI\u2122",
    falModel: "fal-ai/nano-banana-pro/edit",
    defaultPromptPrefix: "Transparent glass interface material sample for Studio World, acrylic depth, subtle highlights, no readable UI, reusable texture asset.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no buttons, no forms, no dashboard, no typography`,
    resolution: "2K",
    aspectRatio: "4:3",
    backgroundBehavior: "runtime-composited",
    lightingProfile: "acrylic-edge-highlight",
    materialProfile: "transparent-acrylic-glass",
    outputFormat: "webp",
    registryDestination: "templates",
    versioningStrategy: "semantic-version",
    upscalingPipeline: "material-tile-polish",
    metadata: {
      tags: ["glass-ui", "material", "interface-language"],
      relatedSystems: ["Experience Engine\u2122", "Design Language\u2122"],
      departmentsUsingIt: ["Experience System", "Design Language"],
      transparentBackground: false,
      foundryAssetClass: "ui-component"
    }
  },
  room: {
    id: "room",
    label: "Room\u2122",
    falModel: "fal-ai/nano-banana-pro/edit",
    defaultPromptPrefix: "Complete Studio World room concept, physical place not webpage, immersive luxury architecture, spatial storytelling, founder-ready headquarters room.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no dashboard, no cards, no app screen, no browser chrome`,
    resolution: "4K",
    aspectRatio: "16:9",
    backgroundBehavior: "studio-world-environment",
    lightingProfile: "cinematic-room-depth",
    materialProfile: "marble-glass-wood-warm-metal",
    outputFormat: "webp",
    registryDestination: "images",
    versioningStrategy: "immutable-generation",
    upscalingPipeline: "room-preview-polish",
    metadata: {
      tags: ["room", "architecture", "studio-world"],
      relatedSystems: ["Atlas\u2122", "Scene Assembly\u2122", "Architecture Auditor\u2122"],
      departmentsUsingIt: ["Atlas", "Scene Assembly"],
      transparentBackground: false,
      foundryAssetClass: "room"
    }
  },
  architecture: {
    id: "architecture",
    label: "Architecture\u2122",
    falModel: "fal-ai/nano-banana-pro/edit",
    defaultPromptPrefix: "Studio World architectural landmark, monumental spatial structure, luxury civilization design, museum-grade environmental identity.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no signage, no generic office, no webpage metaphors`,
    resolution: "4K",
    aspectRatio: "16:9",
    backgroundBehavior: "studio-world-environment",
    lightingProfile: "monumental-architectural-light",
    materialProfile: "stone-glass-bronze-crystal",
    outputFormat: "webp",
    registryDestination: "images",
    versioningStrategy: "date-stamped-version",
    upscalingPipeline: "architectural-preview-polish",
    metadata: {
      tags: ["architecture", "landmark", "world-first"],
      relatedSystems: ["Atlas\u2122", "World Graph\u2122", "Mission Control\u2122"],
      departmentsUsingIt: ["Atlas", "Mission Control"],
      transparentBackground: false,
      foundryAssetClass: "landmark-object"
    }
  },
  material: {
    id: "material",
    label: "Material\u2122",
    falModel: "fal-ai/nano-banana-pro/edit",
    defaultPromptPrefix: "Studio World seamless material study, premium surface sample, physically plausible texture, runtime material reference.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no object, no room, no text, no pattern seams`,
    resolution: "2K",
    aspectRatio: "1:1",
    backgroundBehavior: "none",
    lightingProfile: "material-lab-even-light",
    materialProfile: "surface-study",
    outputFormat: "webp",
    registryDestination: "images",
    versioningStrategy: "semantic-version",
    upscalingPipeline: "seamless-material-polish",
    metadata: {
      tags: ["material", "surface", "design-language"],
      relatedSystems: ["Design Language\u2122", "Scene Assembly\u2122"],
      departmentsUsingIt: ["Design Language", "Scene Assembly"],
      transparentBackground: false,
      foundryAssetClass: "material"
    }
  },
  particle: {
    id: "particle",
    label: "Particle\u2122",
    falModel: "deterministic-runtime",
    defaultPromptPrefix: "Deterministic Studio World particle system specification, ambient life, subtle luxury motion, performance-safe runtime behavior.",
    negativePrompt: "not AI-generated; deterministic runtime JSON only",
    resolution: "runtime",
    aspectRatio: "runtime",
    backgroundBehavior: "runtime-composited",
    lightingProfile: "ambient-reactive",
    materialProfile: "light-particle",
    outputFormat: "json",
    registryDestination: "animations",
    versioningStrategy: "semantic-version",
    upscalingPipeline: "not-applicable",
    metadata: {
      tags: ["particle", "runtime", "ambient-life"],
      relatedSystems: ["Experience Engine\u2122", "Scene Assembly\u2122"],
      departmentsUsingIt: ["Experience System", "Scene Assembly"],
      transparentBackground: true,
      foundryAssetClass: "particle-system"
    }
  },
  animation: {
    id: "animation",
    label: "Animation\u2122",
    falModel: "fal-ai/kling-video/v3/pro/image-to-video",
    defaultPromptPrefix: "Subtle Studio World cinematic motion, premium slow camera movement, elegant environmental animation, no cuts, no text.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no shaky camera, no fast motion, no text overlays`,
    resolution: "1080p",
    aspectRatio: "16:9",
    backgroundBehavior: "studio-world-environment",
    lightingProfile: "cinematic-motion-light",
    materialProfile: "preserve-source-materials",
    outputFormat: "mp4",
    registryDestination: "animations",
    versioningStrategy: "immutable-generation",
    upscalingPipeline: "motion-qc-and-webm-derivative",
    metadata: {
      tags: ["animation", "cinematic", "world-motion"],
      relatedSystems: ["Experience Engine\u2122", "Mission Control\u2122"],
      departmentsUsingIt: ["Experience System", "Mission Control"],
      transparentBackground: false,
      foundryAssetClass: "motion-asset"
    }
  },
  portrait: {
    id: "portrait",
    label: "Portrait\u2122",
    falModel: "openai/gpt-image-2/edit",
    defaultPromptPrefix: "Premium editorial portrait asset for Studio World, respectful human presentation, luxury lighting, clean isolated composition.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no distorted face, no extra limbs, no text, no logo`,
    resolution: "1536x2048",
    aspectRatio: "3:4",
    backgroundBehavior: "transparent",
    lightingProfile: "editorial-softbox",
    materialProfile: "human-editorial",
    outputFormat: "png",
    registryDestination: "images",
    versioningStrategy: "immutable-generation",
    upscalingPipeline: "portrait-cutout-and-polish",
    metadata: {
      tags: ["portrait", "editorial", "transparent"],
      relatedSystems: ["Brand Standards\u2122", "Experience Engine\u2122"],
      departmentsUsingIt: ["Brand Standards", "Experience System"],
      transparentBackground: true,
      foundryAssetClass: "portrait"
    }
  },
  "brand-asset": {
    id: "brand-asset",
    label: "Brand Asset\u2122",
    falModel: "openai/gpt-image-2/edit",
    defaultPromptPrefix: "Premium brand asset for Studio World, reusable identity object, luxury editorial polish, strong silhouette, system-ready.",
    negativePrompt: `${UNIVERSAL_NEGATIVE}, no random letters, no invented logo text, no low-quality mockup`,
    resolution: "1536x1536",
    aspectRatio: "1:1",
    backgroundBehavior: "transparent",
    lightingProfile: "brand-object-spotlight",
    materialProfile: "brand-material-language",
    outputFormat: "png",
    registryDestination: "brand-kits",
    versioningStrategy: "semantic-version",
    upscalingPipeline: "brand-asset-polish",
    metadata: {
      tags: ["brand-asset", "identity", "transparent"],
      relatedSystems: ["Brand Standards\u2122", "Asset Registry\u2122", "Marketplace\u2122"],
      departmentsUsingIt: ["Brand Standards", "Marketplace"],
      transparentBackground: true,
      foundryAssetClass: "brand-asset"
    }
  }
};
function getGenerationRecipe(recipeId) {
  return GENERATION_RECIPES[recipeId];
}

// src/studio-os-core/asset-compiler/types.ts
var ASSET_COMPILER_VERSION = "1.0.0";
var ASSET_COMPILER_ARTICLE = "ARTICLE-A01";

// src/studio-os-core/asset-compiler/compiler.ts
function slugify(value) {
  return value.trim().replace(/™/g, "").replace(/'/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}
function dateStamp(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}
function semanticVersionFor(recipe) {
  if (recipe.versioningStrategy === "date-stamped-version") return `${dateStamp(/* @__PURE__ */ new Date())}.1`;
  return "1.0.0";
}
function buildAssetCompilerPrompt(intent, recipe) {
  const modifiers = intent.modifiers?.map((m) => m.trim()).filter(Boolean) ?? [];
  return [
    recipe.defaultPromptPrefix,
    `ASSET NAME: ${intent.assetName}.`,
    modifiers.length ? `OPTIONAL MODIFIERS: ${modifiers.join(" \xB7 ")}.` : "",
    `LIGHTING PROFILE: ${recipe.lightingProfile}.`,
    `MATERIAL PROFILE: ${recipe.materialProfile}.`,
    `BACKGROUND BEHAVIOR: ${recipe.backgroundBehavior}.`,
    `OUTPUT: ${recipe.outputFormat.toUpperCase()} \xB7 ${recipe.aspectRatio} \xB7 ${recipe.resolution}.`,
    "Studio World asset compiler output only \u2014 reusable asset, registry-ready, versioned, metadata-safe."
  ].filter(Boolean).join(" ");
}
function buildFalGenerationRequest(intent, recipe) {
  const prompt = buildAssetCompilerPrompt(intent, recipe);
  if (recipe.falModel === "deterministic-runtime") {
    return {
      model: recipe.falModel,
      input: {
        prompt,
        recipe: recipe.id,
        output_format: recipe.outputFormat
      }
    };
  }
  return {
    model: recipe.falModel,
    input: {
      prompt,
      negative_prompt: recipe.negativePrompt,
      num_images: 1,
      aspect_ratio: recipe.aspectRatio,
      output_format: recipe.outputFormat,
      resolution: recipe.resolution,
      transparent_background: recipe.metadata.transparentBackground
    }
  };
}
function buildCompiledAssetMetadata(intent, recipe, falRequest, createdAt = /* @__PURE__ */ new Date()) {
  const safeName = slugify(intent.assetName || recipe.label);
  const assetId = intent.assetId?.trim() || `asset-${recipe.id}-${safeName}`;
  const version = semanticVersionFor(recipe);
  const ext = recipe.outputFormat;
  const organization = slugify(intent.organizationId || "studio-world");
  const storagePath = `asset-compiler/${organization}/${recipe.id}/${safeName}/v${version}/${assetId}.${ext}`;
  return {
    assetId,
    recipe: recipe.id,
    version,
    prompt: String(falRequest.input.prompt || ""),
    generationParameters: {
      model: falRequest.model,
      resolution: recipe.resolution,
      aspectRatio: recipe.aspectRatio,
      outputFormat: recipe.outputFormat,
      backgroundBehavior: recipe.backgroundBehavior,
      lightingProfile: recipe.lightingProfile,
      materialProfile: recipe.materialProfile,
      negativePrompt: recipe.negativePrompt
    },
    dependencies: intent.dependencies ?? [],
    tags: Array.from(/* @__PURE__ */ new Set([...recipe.metadata.tags, ...(intent.modifiers ?? []).map(slugify)])),
    departmentsUsingIt: intent.targetDepartments?.length ? intent.targetDepartments : recipe.metadata.departmentsUsingIt,
    creator: intent.creator || "Founder",
    createdDate: createdAt.toISOString(),
    preview: storagePath,
    relationships: recipe.metadata.relatedSystems,
    registryDestination: recipe.registryDestination,
    foundryAssetClass: recipe.metadata.foundryAssetClass,
    storagePath
  };
}
function buildAssetRegistryEntry(metadata) {
  return {
    assetId: metadata.assetId,
    name: metadata.assetId.replace(/^asset-/, "").split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
    category: metadata.registryDestination,
    owner: metadata.creator,
    department: metadata.departmentsUsingIt[0] ?? "Studio World",
    version: metadata.version,
    tags: metadata.tags,
    description: `${metadata.foundryAssetClass} asset manufactured by Studio Foundry\u2122 using the ${metadata.recipe} Generation Recipe\u2122.`,
    relatedSystems: metadata.relationships,
    lastModified: metadata.createdDate,
    usageCount: 0,
    status: "active"
  };
}
function compileAssetIntent(intent) {
  const recipe = getGenerationRecipe(intent.recipeId);
  const falRequest = buildFalGenerationRequest(intent, recipe);
  const metadata = buildCompiledAssetMetadata(intent, recipe, falRequest);
  const registryEntry = buildAssetRegistryEntry(metadata);
  return {
    compilerVersion: ASSET_COMPILER_VERSION,
    article: ASSET_COMPILER_ARTICLE,
    intent,
    recipe,
    falRequest,
    metadata,
    registryEntry
  };
}

// src/studio-os-core/founder-render/contract.ts
var FOUNDER_RENDER_ARTIFACT_INTENT = "founder-full-room-preview";
var FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION = "founder-full-room-preview-prompt.v1";

// src/studio-os-core/creative-production/model-routing-engine/types.ts
var MODEL_ROUTING_ENGINE_VERSION = "model-routing-engine.v1";

// src/studio-os-core/creative-production/model-routing-engine/intent-matrix.ts
var WORLD_ARCHITECT_INTENTS = /* @__PURE__ */ new Set([
  "founder-full-room-preview",
  "master-founder-landscape",
  "master-founder-portrait-recompose",
  "experience-environment",
  "world-preview",
  "world-expansion",
  "environment-shell",
  "final-scene",
  "final-scene-preview"
]);
var ASSET_MANUFACTURER_INTENTS = /* @__PURE__ */ new Set([
  "reception-desk",
  "furniture-asset",
  "landmark-asset",
  "decor-asset",
  "architecture-piece",
  "fixture",
  "lighting-object",
  "logo-asset",
  "campaign-graphic",
  "poster",
  "packaging-asset",
  "isolated-object",
  "object-group",
  "logo-component",
  "full-logo",
  "campaign-composite",
  "packaging-composite",
  "campaign-model-replacement"
]);
var BLEND_OVERLAY_INTENTS = /* @__PURE__ */ new Set([
  "transparent-overlay",
  "material-map"
]);
var BACKGROUND_CLEANUP_INTENTS = /* @__PURE__ */ new Set(["background-cleanup"]);
var INTENT_TO_ASSET_CLASS = {
  "founder-full-room-preview": "founder-full-room-preview",
  "master-founder-landscape": "founder-full-room-preview",
  "master-founder-portrait-recompose": "founder-full-room-preview",
  "experience-environment": "environment-shell",
  "world-preview": "environment-shell",
  "world-expansion": "environment-shell",
  "environment-shell": "environment-shell",
  "final-scene": "environment-shell",
  "final-scene-preview": "environment-shell",
  "reception-desk": "reception-structure",
  "furniture-asset": "furniture-objects",
  "landmark-asset": "signature-landmark",
  "decor-asset": "decorative-object",
  "architecture-piece": "architectural-prop",
  "fixture": "architectural-prop",
  "lighting-object": "decorative-object",
  "logo-asset": "signature-landmark",
  "campaign-graphic": "decorative-object",
  "poster": "decorative-object",
  "packaging-asset": "decorative-object",
  "isolated-object": "signature-landmark",
  "object-group": "furniture-objects",
  "logo-component": "signature-landmark",
  "full-logo": "signature-landmark",
  "campaign-composite": "decorative-object",
  "packaging-composite": "decorative-object",
  "campaign-model-replacement": "decorative-object",
  "transparent-overlay": "decorative-object",
  "material-map": "decorative-object",
  "background-cleanup": "background-removal"
};
function resolveWorkerFamilyForIntent(intent) {
  if (WORLD_ARCHITECT_INTENTS.has(intent)) return "world-architect";
  if (BACKGROUND_CLEANUP_INTENTS.has(intent)) return "background-cleanup";
  if (BLEND_OVERLAY_INTENTS.has(intent)) return "asset-manufacturer";
  return "asset-manufacturer";
}
function resolveAssetClassForIntent(intent, override) {
  if (override) return override;
  const mapped = INTENT_TO_ASSET_CLASS[intent];
  if (!mapped) {
    throw new Error(`No asset class mapping for artifact intent: ${intent}`);
  }
  return mapped;
}
function isWorldEnvironmentIntent(intent) {
  return WORLD_ARCHITECT_INTENTS.has(intent);
}
function isProductionAssetIntent(intent) {
  return ASSET_MANUFACTURER_INTENTS.has(intent);
}
function isBackgroundCleanupIntent(intent) {
  return BACKGROUND_CLEANUP_INTENTS.has(intent);
}

// src/studio-os-core/creative-production/model-registry/nano-banana-2-schema.ts
var NANO_BANANA_2_T2I_ENDPOINT = "fal-ai/nano-banana-2";
var NANO_BANANA_2_EDIT_ENDPOINT = "fal-ai/nano-banana-2/edit";
var NANO_BANANA_2_PRODUCTION_QUALITY = "4K";
var NANO_BANANA_2_PRODUCTION_THINKING = "high";
var NANO_BANANA_2_MAX_REFERENCE_IMAGES = 14;
function buildNanoBanana2FalInput(input) {
  const hasBrandRefs = (input.brandReferenceUrls?.length ?? 0) > 0;
  const endpoint = hasBrandRefs ? NANO_BANANA_2_EDIT_ENDPOINT : NANO_BANANA_2_T2I_ENDPOINT;
  const falInput = {
    prompt: input.negativePrompt ? `${input.prompt}

NEGATIVE: ${input.negativePrompt}` : input.prompt,
    resolution: NANO_BANANA_2_PRODUCTION_QUALITY,
    aspect_ratio: input.aspectRatio,
    output_format: input.outputFormat,
    num_images: 1,
    thinking_level: NANO_BANANA_2_PRODUCTION_THINKING
  };
  if (hasBrandRefs) {
    falInput.image_urls = input.brandReferenceUrls.slice(0, NANO_BANANA_2_MAX_REFERENCE_IMAGES);
  }
  return { endpoint, falInput, usesReferences: hasBrandRefs };
}

// src/studio-os-core/creative-production/model-registry/routes.ts
var SCENE_STACK_SHELL_FAL_MODEL = "fal-ai/nano-banana-pro/edit";
var BACKGROUND_REMOVAL_FAL_MODEL = "fal-ai/birefnet/v2";
var FOUNDER_APPROVED_AT = "2026-07-12";
var FOUNDER_APPROVED_BY = "founder-visual-comparison";
var MODEL_REGISTRY_ROUTES = [
  {
    routeId: "nano-banana-pro-edit-shell",
    assetClass: "environment-shell",
    generationMode: "image-to-image",
    provider: "fal",
    endpointId: SCENE_STACK_SHELL_FAL_MODEL,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "marble-genesis-anchor",
    alphaPolicy: "none",
    backgroundPolicy: "full-scene",
    supportsBrandAssetGuidance: false,
    supportsMultipleReferences: true,
    fallbackRouteIds: [],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "UNCHANGED \u2014 environment shell img2img with marble genesis anchor."
  },
  {
    routeId: "nano-banana-pro-founder-full-room",
    assetClass: "founder-full-room-preview",
    generationMode: "image-to-image",
    provider: "fal",
    endpointId: SCENE_STACK_SHELL_FAL_MODEL,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "brand-material-references-only",
    alphaPolicy: "none",
    backgroundPolicy: "full-scene",
    supportsBrandAssetGuidance: true,
    supportsMultipleReferences: true,
    fallbackRouteIds: [],
    enabled: true,
    rolloutState: "production",
    policyVersion: "founder-render-routing.v1",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Founder Render\u2122 \u2014 photoreal full-room preview for Founder Review approval gate."
  },
  {
    routeId: "nano-banana-2-isolated",
    assetClass: "signature-landmark",
    generationMode: "text-to-image",
    provider: "fal",
    endpointId: NANO_BANANA_2_T2I_ENDPOINT,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "brand-material-references-only",
    alphaPolicy: "post-cleanup",
    backgroundPolicy: "studio-seamless",
    supportsBrandAssetGuidance: true,
    supportsMultipleReferences: true,
    fallbackRouteIds: ["nano-banana-2-isolated-edit"],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Founder-approved isolated specialist \u2014 signature landmarks."
  },
  {
    routeId: "nano-banana-2-isolated-edit",
    assetClass: "signature-landmark",
    generationMode: "image-to-image",
    provider: "fal",
    endpointId: NANO_BANANA_2_EDIT_ENDPOINT,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "brand-material-references-only",
    alphaPolicy: "post-cleanup",
    backgroundPolicy: "studio-seamless",
    supportsBrandAssetGuidance: true,
    supportsMultipleReferences: true,
    fallbackRouteIds: [],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Brand-material reference mode \u2014 material URLs only, zero scene images."
  },
  {
    routeId: "nano-banana-2-isolated-group",
    assetClass: "furniture-objects",
    generationMode: "text-to-image",
    provider: "fal",
    endpointId: NANO_BANANA_2_T2I_ENDPOINT,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "brand-material-references-only",
    alphaPolicy: "post-cleanup",
    backgroundPolicy: "studio-seamless",
    supportsBrandAssetGuidance: true,
    supportsMultipleReferences: true,
    fallbackRouteIds: ["nano-banana-2-isolated-edit"],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Founder-approved isolated specialist \u2014 furniture object groups."
  },
  {
    routeId: "nano-banana-2-reception-structure",
    assetClass: "reception-structure",
    generationMode: "text-to-image",
    provider: "fal",
    endpointId: NANO_BANANA_2_T2I_ENDPOINT,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "brand-material-references-only",
    alphaPolicy: "post-cleanup",
    backgroundPolicy: "studio-seamless",
    supportsBrandAssetGuidance: true,
    supportsMultipleReferences: true,
    fallbackRouteIds: ["nano-banana-2-isolated-edit"],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Reception structures \u2014 brand-grounded isolated generation."
  },
  {
    routeId: "nano-banana-2-architectural-prop",
    assetClass: "architectural-prop",
    generationMode: "text-to-image",
    provider: "fal",
    endpointId: NANO_BANANA_2_T2I_ENDPOINT,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "brand-material-references-only",
    alphaPolicy: "post-cleanup",
    backgroundPolicy: "studio-seamless",
    supportsBrandAssetGuidance: true,
    supportsMultipleReferences: true,
    fallbackRouteIds: ["nano-banana-2-isolated-edit"],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Architectural props \u2014 brand-grounded isolated generation."
  },
  {
    routeId: "nano-banana-2-decorative-object",
    assetClass: "decorative-object",
    generationMode: "text-to-image",
    provider: "fal",
    endpointId: NANO_BANANA_2_T2I_ENDPOINT,
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "brand-material-references-only",
    alphaPolicy: "post-cleanup",
    backgroundPolicy: "studio-seamless",
    supportsBrandAssetGuidance: true,
    supportsMultipleReferences: true,
    fallbackRouteIds: ["nano-banana-2-isolated-edit"],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: FOUNDER_APPROVED_BY,
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Decorative objects \u2014 brand-grounded isolated generation."
  },
  {
    routeId: "birefnet-background-removal",
    assetClass: "background-removal",
    generationMode: "background-removal",
    provider: "fal",
    endpointId: BACKGROUND_REMOVAL_FAL_MODEL,
    qualityPreset: "production",
    targetResolution: "2K",
    referencePolicy: "none",
    alphaPolicy: "requested",
    backgroundPolicy: "transparent-alpha",
    supportsBrandAssetGuidance: false,
    supportsMultipleReferences: false,
    fallbackRouteIds: [],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: "verified-pipeline",
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Dedicated background removal \u2014 not NB2."
  },
  {
    routeId: "image-upscale-production",
    assetClass: "image-upscale",
    generationMode: "upscale",
    provider: "fal",
    endpointId: "fal-ai/clarity-upscaler",
    qualityPreset: "production",
    targetResolution: "4K",
    referencePolicy: "none",
    alphaPolicy: "requested",
    backgroundPolicy: "transparent-alpha",
    supportsBrandAssetGuidance: false,
    supportsMultipleReferences: false,
    fallbackRouteIds: [],
    enabled: true,
    rolloutState: "production",
    policyVersion: "layer-model-routing.v2",
    approvedBy: "resolution-truth-policy",
    approvedAt: FOUNDER_APPROVED_AT,
    notes: "Post-approval upscale path \u2014 labels output post-upscaled-4k."
  }
];
function getModelRouteById(routeId) {
  return MODEL_REGISTRY_ROUTES.find((r) => r.routeId === routeId && r.enabled) ?? null;
}
function getPrimaryRouteForAssetClass(assetClass) {
  const primary = MODEL_REGISTRY_ROUTES.find(
    (r) => r.assetClass === assetClass && r.enabled && r.rolloutState === "production"
  );
  if (!primary) {
    throw new Error(`No production route for asset class: ${assetClass}`);
  }
  return primary;
}

// src/studio-os-core/creative-production/prompt-router/prompt-registry.ts
var VERSIONED_GENERATION_PROMPTS = [
  {
    promptBuilderId: "founder-full-room-preview-prompt.v1",
    promptVersion: "founder-full-room-preview-prompt.v1",
    artifactIntent: "founder-full-room-preview",
    assetClass: "founder-full-room-preview",
    description: "Experience Lab \u2014 photoreal full-room Founder Render preview.",
    workerFamily: "world-architect"
  },
  {
    promptBuilderId: "master-founder-landscape-prompt.v1",
    promptVersion: "master-founder-landscape-prompt.v1",
    artifactIntent: "master-founder-landscape",
    assetClass: "founder-full-room-preview",
    description: "Master Founder Render \u2014 21:9 canonical landscape architectural truth.",
    workerFamily: "world-architect"
  },
  {
    promptBuilderId: "master-founder-portrait-recompose-prompt.v1",
    promptVersion: "master-founder-portrait-recompose-prompt.v1",
    artifactIntent: "master-founder-portrait-recompose",
    assetClass: "founder-full-room-preview",
    description: "Master Portrait \u2014 9:16 recomposition from approved landscape only.",
    workerFamily: "world-architect"
  },
  {
    promptBuilderId: "environment-shell-prompt.v1",
    promptVersion: "environment-shell-prompt.v1",
    artifactIntent: "environment-shell",
    assetClass: "environment-shell",
    description: "Experience Lab \u2014 environment shell img2img.",
    workerFamily: "world-architect"
  },
  {
    promptBuilderId: "experience-environment-prompt.v1",
    promptVersion: "experience-environment-prompt.v1",
    artifactIntent: "experience-environment",
    assetClass: "environment-shell",
    description: "Experience Lab \u2014 whole environment generation.",
    workerFamily: "world-architect"
  },
  {
    promptBuilderId: "world-preview-prompt.v1",
    promptVersion: "world-preview-prompt.v1",
    artifactIntent: "world-preview",
    assetClass: "environment-shell",
    description: "Experience Lab \u2014 world preview render.",
    workerFamily: "world-architect"
  },
  {
    promptBuilderId: "world-expansion-prompt.v1",
    promptVersion: "world-expansion-prompt.v1",
    artifactIntent: "world-expansion",
    assetClass: "environment-shell",
    description: "Experience Lab \u2014 world expansion render.",
    workerFamily: "world-architect"
  },
  {
    promptBuilderId: "asset-reception-desk-prompt.v1",
    promptVersion: "asset-reception-desk-prompt.v1",
    artifactIntent: "reception-desk",
    assetClass: "reception-structure",
    description: "CD Studio \u2014 reception desk isolated asset.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-chair-prompt.v1",
    promptVersion: "asset-chair-prompt.v1",
    artifactIntent: "furniture-asset",
    assetClass: "furniture-objects",
    description: "CD Studio \u2014 furniture / chair isolated asset.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "furniture-objects-isolated-prompt.v3",
    promptVersion: "furniture-objects-isolated-prompt.v3",
    artifactIntent: "object-group",
    assetClass: "furniture-objects",
    description: "Scene Stack \u2014 furniture object group.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "signature-landmark-isolated-prompt.v3",
    promptVersion: "signature-landmark-isolated-prompt.v3",
    artifactIntent: "landmark-asset",
    assetClass: "signature-landmark",
    description: "CD Studio \u2014 signature landmark isolated asset.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-logo-prompt.v1",
    promptVersion: "asset-logo-prompt.v1",
    artifactIntent: "logo-asset",
    assetClass: "signature-landmark",
    description: "CD Studio \u2014 logo component generation.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-campaign-prompt.v1",
    promptVersion: "asset-campaign-prompt.v1",
    artifactIntent: "campaign-graphic",
    assetClass: "decorative-object",
    description: "CD Studio \u2014 campaign graphic generation.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-packaging-prompt.v1",
    promptVersion: "asset-packaging-prompt.v1",
    artifactIntent: "packaging-asset",
    assetClass: "decorative-object",
    description: "CD Studio \u2014 packaging composite generation.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-decor-prompt.v1",
    promptVersion: "asset-decor-prompt.v1",
    artifactIntent: "decor-asset",
    assetClass: "decorative-object",
    description: "CD Studio \u2014 decorative object generation.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-architecture-piece-prompt.v1",
    promptVersion: "asset-architecture-piece-prompt.v1",
    artifactIntent: "architecture-piece",
    assetClass: "architectural-prop",
    description: "CD Studio \u2014 architectural prop (not full room).",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-fixture-prompt.v1",
    promptVersion: "asset-fixture-prompt.v1",
    artifactIntent: "fixture",
    assetClass: "architectural-prop",
    description: "CD Studio \u2014 fixture isolated asset.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "asset-lighting-object-prompt.v1",
    promptVersion: "asset-lighting-object-prompt.v1",
    artifactIntent: "lighting-object",
    assetClass: "decorative-object",
    description: "CD Studio \u2014 lighting object isolated asset.",
    workerFamily: "asset-manufacturer"
  },
  {
    promptBuilderId: "blend-overlay-prompt.v1",
    promptVersion: "blend-overlay-prompt.v1",
    artifactIntent: null,
    assetClass: null,
    description: "Scene Stack \u2014 overlay / blend layers.",
    workerFamily: "any"
  },
  {
    promptBuilderId: "background-cleanup-prompt.v1",
    promptVersion: "background-cleanup-prompt.v1",
    artifactIntent: "background-cleanup",
    assetClass: "background-removal",
    description: "Background removal / masking / transparency worker.",
    workerFamily: "background-cleanup"
  }
];

// src/studio-os-core/creative-production/prompt-router/types.ts
var PROMPT_ROUTER_VERSION = "prompt-router.v1";

// src/studio-os-core/creative-production/prompt-router/prompt-router.ts
var INTENT_PROMPT_MAP = {
  "founder-full-room-preview": "founder-full-room-preview-prompt.v1",
  "experience-environment": "experience-environment-prompt.v1",
  "world-preview": "world-preview-prompt.v1",
  "world-expansion": "world-expansion-prompt.v1",
  "environment-shell": "environment-shell-prompt.v1",
  "final-scene": "environment-shell-prompt.v1",
  "final-scene-preview": "environment-shell-prompt.v1",
  "reception-desk": "asset-reception-desk-prompt.v1",
  "furniture-asset": "asset-chair-prompt.v1",
  "object-group": "furniture-objects-isolated-prompt.v3",
  "landmark-asset": "signature-landmark-isolated-prompt.v3",
  "isolated-object": "signature-landmark-isolated-prompt.v3",
  "logo-asset": "asset-logo-prompt.v1",
  "logo-component": "asset-logo-prompt.v1",
  "full-logo": "asset-logo-prompt.v1",
  "campaign-graphic": "asset-campaign-prompt.v1",
  "campaign-composite": "asset-campaign-prompt.v1",
  "poster": "asset-campaign-prompt.v1",
  "packaging-asset": "asset-packaging-prompt.v1",
  "packaging-composite": "asset-packaging-prompt.v1",
  "decor-asset": "asset-decor-prompt.v1",
  "architecture-piece": "asset-architecture-piece-prompt.v1",
  "fixture": "asset-fixture-prompt.v1",
  "lighting-object": "asset-lighting-object-prompt.v1",
  "background-cleanup": "background-cleanup-prompt.v1",
  "transparent-overlay": "blend-overlay-prompt.v1",
  "material-map": "blend-overlay-prompt.v1",
  "campaign-model-replacement": "asset-campaign-prompt.v1"
};
var ASSET_CLASS_PROMPT_FALLBACK = {
  "founder-full-room-preview": "founder-full-room-preview-prompt.v1",
  "environment-shell": "environment-shell-prompt.v1",
  "signature-landmark": "signature-landmark-isolated-prompt.v3",
  "furniture-objects": "furniture-objects-isolated-prompt.v3",
  "reception-structure": "asset-reception-desk-prompt.v1",
  "architectural-prop": "asset-architecture-piece-prompt.v1",
  "decorative-object": "asset-decor-prompt.v1",
  "background-removal": "background-cleanup-prompt.v1",
  "material-overlay": "blend-overlay-prompt.v1",
  "atmosphere-overlay": "blend-overlay-prompt.v1",
  "motion-overlay": "blend-overlay-prompt.v1",
  "reflection-overlay": "blend-overlay-prompt.v1"
};
function resolvePromptBuilderId(intent, assetClass) {
  return INTENT_PROMPT_MAP[intent] ?? ASSET_CLASS_PROMPT_FALLBACK[assetClass] ?? "blend-overlay-prompt.v1";
}
function resolvePromptRouting(input) {
  const assetClass = input.assetClass ?? resolveAssetClassForIntent(input.artifactIntent);
  const promptBuilderId = resolvePromptBuilderId(input.artifactIntent, assetClass);
  const entry = VERSIONED_GENERATION_PROMPTS.find((p) => p.promptBuilderId === promptBuilderId);
  return {
    routerVersion: PROMPT_ROUTER_VERSION,
    promptBuilderId,
    promptVersion: entry?.promptVersion ?? promptBuilderId,
    artifactIntent: input.artifactIntent,
    assetClass
  };
}

// src/studio-os-core/creative-production/model-routing-engine/model-routing-engine.ts
function inferSurface(intent, surface) {
  if (surface) return surface;
  if (intent === "founder-full-room-preview") return "founder-render";
  if (isWorldEnvironmentIntent(intent)) return "experience-lab";
  if (isProductionAssetIntent(intent)) return "creative-direction-studio";
  if (isBackgroundCleanupIntent(intent)) return "scene-stack";
  return "scene-stack";
}
function resolveReferenceStrategy(input) {
  if (input.workerFamily === "background-cleanup") return "none";
  if (input.workerFamily === "world-architect") {
    return input.assetClass === "founder-full-room-preview" ? "brand-material-references-only" : "marble-genesis-anchor";
  }
  if (input.brandGroundingRequired) return "brand-material-references-only";
  return "placement-metadata-only";
}
function resolveRouteForDecision(input, assetClass) {
  let route = getPrimaryRouteForAssetClass(assetClass);
  const brandGrounding = input.brandGroundingRequired === true;
  if (brandGrounding && route.supportsBrandAssetGuidance && route.fallbackRouteIds.length > 0) {
    const editFallback = route.fallbackRouteIds.map((id) => getModelRouteById(id)).find((r) => r?.endpointId === NANO_BANANA_2_EDIT_ENDPOINT);
    if (editFallback) route = editFallback;
  }
  if (input.artifactIntent === "founder-full-room-preview") {
    const founderRoute = getModelRouteById("nano-banana-pro-founder-full-room");
    if (founderRoute) route = founderRoute;
  }
  if (input.artifactIntent === "environment-shell" || input.artifactIntent === "experience-environment") {
    const shellRoute = getModelRouteById("nano-banana-pro-edit-shell");
    if (shellRoute) route = shellRoute;
  }
  return route;
}
function resolveModelRoutingDecision(input) {
  const workerFamily = resolveWorkerFamilyForIntent(input.artifactIntent);
  const assetClass = resolveAssetClassForIntent(input.artifactIntent, input.assetClass);
  const surface = inferSurface(input.artifactIntent, input.surface);
  const route = resolveRouteForDecision(input, assetClass);
  const prompt = resolvePromptRouting({ artifactIntent: input.artifactIntent, assetClass });
  const brandGrounding = input.brandGroundingRequired === true;
  const referenceStrategy = resolveReferenceStrategy({
    workerFamily,
    assetClass,
    brandGroundingRequired: brandGrounding
  });
  const textToImageOnly = route.generationMode === "text-to-image" && route.endpointId === NANO_BANANA_2_T2I_ENDPOINT;
  return {
    engineVersion: MODEL_ROUTING_ENGINE_VERSION,
    artifactIntent: input.artifactIntent,
    workerFamily,
    surface,
    assetClass,
    routeId: route.routeId,
    provider: "fal",
    providerModel: route.endpointId,
    providerEndpoint: route.endpointId,
    generationMode: route.generationMode,
    referenceStrategy,
    referencePolicy: route.referencePolicy,
    promptVersion: prompt.promptVersion,
    promptBuilderId: prompt.promptBuilderId,
    textToImageOnly,
    requestedAlpha: route.alphaPolicy === "requested" || route.alphaPolicy === "post-cleanup",
    allowBackgroundExtraction: workerFamily === "asset-manufacturer",
    brandGroundingCapable: route.supportsBrandAssetGuidance,
    policyVersion: route.policyVersion,
    resolutionTruth: {
      requestedResolution: "4K",
      providerNativeResolution: NANO_BANANA_2_PRODUCTION_QUALITY,
      supportsNative4K: route.endpointId.startsWith("fal-ai/nano-banana-2"),
      thinkingLevel: route.endpointId.startsWith("fal-ai/nano-banana-2") ? NANO_BANANA_2_PRODUCTION_THINKING : void 0
    }
  };
}
function resolveModelRoutingFromLayerId(layerId, options) {
  const intent = layerIdToArtifactIntent(layerId);
  return resolveModelRoutingDecision({
    artifactIntent: intent,
    surface: options?.surface ?? "scene-stack",
    brandGroundingRequired: options?.brandGroundingRequired,
    isolationAttempt: options?.isolationAttempt,
    organizationId: options?.organizationId
  });
}
function layerIdToArtifactIntent(layerId) {
  switch (layerId) {
    case "environment-shell":
      return "environment-shell";
    case "signature-landmark":
      return "landmark-asset";
    case "furniture-objects":
      return "object-group";
    case "surface-materials":
      return "material-map";
    case "atmospheric-systems":
      return "transparent-overlay";
    case "ambient-motion":
      return "transparent-overlay";
    case "lighting-systems":
      return "material-map";
    default:
      return "decor-asset";
  }
}
function getWorldArchitectDefaultModel() {
  const route = getModelRouteById("nano-banana-pro-edit-shell");
  return route?.endpointId ?? MODEL_REGISTRY_ROUTES.find((r) => r.routeId === "nano-banana-pro-edit-shell").endpointId;
}
function getAssetManufacturerDefaultModel() {
  const route = getModelRouteById("nano-banana-2-isolated");
  return route?.endpointId ?? NANO_BANANA_2_T2I_ENDPOINT;
}
function getBackgroundCleanupModel() {
  const route = getModelRouteById("birefnet-background-removal");
  return route?.endpointId ?? "fal-ai/birefnet/v2";
}

// src/studio-os-core/founder-render/model-route.ts
var FOUNDER_RENDER_ROUTE_ID = "nano-banana-pro-founder-full-room";
function resolveFounderRenderModel(aspectRatio = "16:9") {
  return resolveFounderRenderModelRoute(aspectRatio).providerModel;
}
var FOUNDER_RENDER_MODEL = resolveFounderRenderModel();
function resolveFounderRenderModelRoute(aspectRatio = "16:9") {
  const decision = resolveModelRoutingDecision({
    artifactIntent: FOUNDER_RENDER_ARTIFACT_INTENT,
    surface: "founder-render"
  });
  return {
    routeId: FOUNDER_RENDER_ROUTE_ID,
    provider: "fal",
    providerModel: decision.providerModel,
    generationMode: "image-to-image",
    aspectRatio,
    outputFormat: "png",
    outputResolution: "4K",
    referencePolicy: "brand-material-references-only",
    artifactIntent: FOUNDER_RENDER_ARTIFACT_INTENT,
    promptVersion: decision.promptVersion,
    promptBuilderId: decision.promptBuilderId
  };
}

// src/studio-os-core/founder-render/prompt-builder.ts
import { createHash } from "node:crypto";

// src/studio-os-core/architecture-law-001/contract.ts
var ARCHITECTURE_LAW_001_VERSION = "architecture-law-001.v1";
var AI_ALLOWED_ENVIRONMENT_CATEGORIES = [
  "architecture",
  "walls",
  "floors",
  "ceilings",
  "furniture",
  "lighting",
  "materials",
  "glass",
  "acrylic",
  "chrome",
  "environment-props",
  "command-dock-shell",
  "workbench-shell",
  "monitor-bezels",
  "display-frames",
  "control-consoles",
  "button-housings",
  "touch-surfaces",
  "dashboard-shells",
  "panel-groupings",
  "toolbar-frames",
  "viewport-windows",
  "graph-containers",
  "thumbnail-frames",
  "navigation-rails",
  "physical-interaction-zones",
  "placeholder-cards",
  "placeholder-buttons",
  "empty-display-screens",
  "embedded-console-architecture"
];
var AI_FORBIDDEN_PRODUCTION_UI_CATEGORIES = [
  "typography",
  "words",
  "letters",
  "numbers",
  "dates",
  "charts",
  "graphs",
  "status-values",
  "progress-bars",
  "notifications",
  "icons",
  "navigation-labels",
  "company-names",
  "department-names",
  "revision-numbers",
  "button-captions",
  "logos",
  "brand-names",
  "breadcrumbs",
  "menus",
  "tooltips",
  "badges",
  "dashboard-metrics",
  "readable-interface-elements"
];
var DISPLAY_PLACEHOLDER_TREATMENTS = [
  "ambient-gradient",
  "subtle-blueprint-lines",
  "abstract-geometry",
  "neutral-scan-pattern",
  "glass-reflection",
  "soft-emissive-lighting",
  "minimal-wireframe",
  "depth-cue"
];

// src/studio-os-core/architecture-law-001/prompt-directives.ts
function buildArchitectureLawPositiveDirective() {
  return [
    `STUDIO WORLD ARCHITECTURE LAW #001 (${ARCHITECTURE_LAW_001_VERSION}): AI builds places. Studio World builds interfaces.`,
    `GENERATE: ${AI_ALLOWED_ENVIRONMENT_CATEGORIES.slice(0, 12).join(", ")}, integrated Command Dock\u2122 shell, Workbench\u2122 console furniture, monitor bezels, display frames, button housings, empty illuminated screens.`,
    `DISPLAY PLACEHOLDERS: Every monitor powered on, premium glass, illuminated, reflective, active \u2014 but intentionally BLANK. Use: ${DISPLAY_PLACEHOLDER_TREATMENTS.join(", ")}. No readable information.`,
    `INTEGRATION: Command Dock and Workbench are permanent architectural furniture \u2014 glass, acrylic, chrome, embedded screens, tool slots, console surfaces. Premium, realistic, fully integrated into the room.`
  ].join("\n");
}
function buildArchitectureLawNegativeDirective() {
  return [
    ...AI_FORBIDDEN_PRODUCTION_UI_CATEGORIES,
    "readable text",
    "legible words",
    "UI screenshot",
    "dashboard screenshot",
    "app interface",
    "software UI",
    "HUD overlay text",
    "status bar text",
    "menu labels",
    "button text",
    "chart labels",
    "graph axes",
    "notification banners",
    "company logo text",
    "brand lettering",
    "breadcrumb trail",
    "tooltip text",
    "metric numbers",
    "revision stamp"
  ].join(", ");
}
function appendArchitectureLawToEnvironmentPrompt(prompt) {
  return `${prompt}

${buildArchitectureLawPositiveDirective()}`;
}
function appendArchitectureLawToNegativePrompt(negativePrompt) {
  const lawNegative = buildArchitectureLawNegativeDirective();
  return negativePrompt ? `${negativePrompt}, ${lawNegative}` : lawNegative;
}

// src/studio-os-core/founder-render/prompt-builder.ts
function hashPrompt(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}
function describeAssets(plan) {
  const heroes = plan.heroAssets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId} (${a.assetClass})`;
  });
  const furniture = plan.furnitureSet.assets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  const decor = plan.decorSet.assets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  return [
    heroes.length ? `Hero assets: ${heroes.join("; ")}.` : "",
    furniture.length ? `Furniture: ${furniture.join("; ")}.` : "",
    decor.length ? `Decor: ${decor.join("; ")}.` : ""
  ].filter(Boolean).join(" ");
}
function buildFounderFullRoomPreviewPrompt(input) {
  const { plan, brandPackage } = input;
  const camera = plan.cameraAnchors.find((c) => c.purpose === "overview" || c.purpose === "hero") ?? plan.cameraAnchors[0];
  const materials = plan.materialSet.materialIds.join(", ");
  const assetSummary = describeAssets(plan);
  const sections = [
    `ROOM IDENTITY: ${plan.room.displayName} \u2014 ${plan.room.purpose}. Building ${plan.building.displayName}, floor ${plan.floor.displayName}.`,
    `ROOM PURPOSE: ${plan.room.purpose}. Organization visual language: ${plan.styleProfile.visualLanguage}.`,
    `COMPLETE-ROOM REQUIREMENT: Generate ONE complete photoreal interior room. This is a full environment preview for founder approval \u2014 NOT an isolated object, NOT a diagram, NOT a blueprint, NOT CAD, NOT wireframe, NOT procedural clay, NOT abstract geometry, NOT a UI mockup.`,
    `ARCHITECTURAL LAYOUT: Architecture ${plan.architecture.architectureId} v${plan.architecture.version}. Shell spec ${plan.architecture.shellSpecId}. Circulation and interaction zones per plan. Collision zones respected.`,
    `HERO AND FURNITURE PLACEMENT: ${assetSummary}`,
    `BRAND MATERIAL ASSIGNMENTS: ${materials}. ${brandPackage.promptSections.organizationMaterialAssignments}`,
    `LIGHTING PROFILE: ${plan.lightingProfile.profileId} \u2014 ${plan.lightingProfile.colorTemperatureK}K, reflection ${plan.lightingProfile.reflectionIntensity}, shadow softness ${plan.lightingProfile.shadowSoftness}, ambient ${plan.lightingProfile.ambientProfile}.`,
    `CAMERA AND COMPOSITION: ${camera?.label ?? "Wide interior"} \u2014 ${camera?.position ?? "eye-level wide interior"}, ${camera?.orientation ?? "natural architectural lens"}. Wide interior composition with clear foreground, midground, and background. No extreme fisheye. No dutch angle.`,
    `IMMERSIVE 3D-WORLD: Photoreal immersive explorable interior. Architecture, furniture, lighting, and hero assets appear together in one cohesive finished room visualization.`,
    `FOUNDER AESTHETIC: Luxury editorial interior photography quality. Trustworthy creative visualization of the intended finished room before manufacturing.`,
    `ASSET SEPARABILITY: Objects should read as distinct elements within the room even though this is one full-scene render.`,
    brandPackage.promptSections.forbiddenMaterialSubstitutions ? `FORBIDDEN OUTPUTS: ${brandPackage.promptSections.forbiddenMaterialSubstitutions}` : "",
    ...plan.negativeRules.length ? [`PLAN NEGATIVE RULES: ${plan.negativeRules.join(" \xB7 ")}`] : [],
    input.founderRevisionNote ? `FOUNDER REVISION: ${input.founderRevisionNote}` : "",
    `OUTPUT: ${FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION} \xB7 16:9 cinematic interior \xB7 4K photoreal.`
  ].filter(Boolean);
  const prompt = appendArchitectureLawToEnvironmentPrompt(sections.join("\n\n"));
  const negativePrompt = appendArchitectureLawToNegativePrompt(
    [
      "isolated object on transparent background",
      "product cutout",
      "wireframe",
      "blueprint diagram",
      "CAD view",
      "floor plan",
      "bounding boxes",
      "clay block proxy",
      "procedural placeholder",
      "UI mockup",
      "checkerboard transparency",
      "generic random marble",
      "Carrara substitute",
      "Calacatta substitute"
    ].join(", ")
  );
  return {
    prompt,
    negativePrompt,
    promptVersion: FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
    promptHash: hashPrompt(prompt)
  };
}

// src/studio-os-core/creative-production/brand-asset-grounding/vault.ts
function brandAssetChecksum(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `ba-${(h >>> 0).toString(16).padStart(8, "0")}`;
}
var FRONTAL_SLAYER_MARBLE_PATH = "/assets/marble-half.png";
var FRONTAL_SLAYER_RED = "#EB1C24";
var FRONTAL_SLAYER_VAULT = [
  {
    organizationId: "frontal-slayer",
    brandProfileId: "frontal-slayer-brand-v1",
    brandAssetSetId: "frontal-slayer-materials-v1",
    assetRole: "primary-marble-texture",
    assetId: "fs-primary-marble-half",
    assetType: "texture",
    canonicalUrl: FRONTAL_SLAYER_MARBLE_PATH,
    storagePath: "public/assets/marble-half.png",
    checksum: brandAssetChecksum("frontal-slayer:primary-marble-texture:marble-half.png"),
    mimeType: "image/png",
    width: 2048,
    height: 2048,
    colorSpace: "sRGB",
    repeatPolicy: "tile",
    cropPolicy: "full",
    referenceStrengthPolicy: "strong-material",
    materialScale: "architectural-surface",
    materialOrientation: "horizontal-vein",
    approvedForGeneration: true,
    approvedForPublicOutput: true,
    sensitivity: "public",
    active: true,
    version: "1.0.0",
    updatedAt: "2026-07-12T00:00:00.000Z"
  },
  {
    organizationId: "frontal-slayer",
    brandProfileId: "frontal-slayer-brand-v1",
    brandAssetSetId: "frontal-slayer-materials-v1",
    assetRole: "color-palette",
    assetId: "fs-brand-red",
    assetType: "palette",
    canonicalUrl: "",
    storagePath: "",
    checksum: brandAssetChecksum(`frontal-slayer:color:${FRONTAL_SLAYER_RED}`),
    mimeType: "application/json",
    width: 0,
    height: 0,
    colorSpace: "sRGB",
    repeatPolicy: "none",
    cropPolicy: "none",
    referenceStrengthPolicy: "strong-material",
    materialScale: "accent-illumination",
    materialOrientation: "n/a",
    approvedForGeneration: true,
    approvedForPublicOutput: true,
    sensitivity: "public",
    active: true,
    version: "1.0.0",
    updatedAt: "2026-07-12T00:00:00.000Z"
  }
];
var CANONICAL_FINISH_POLICIES = {
  "clear-crystal-acrylic": {
    promptInstruction: "Clear crystal acrylic panels \u2014 optical clarity, subtle internal refraction, premium glass-like acrylic without yellowing.",
    useMode: "finish-policy"
  },
  "mirror-polished-chrome": {
    promptInstruction: "Mirror-polished chrome trim \u2014 high reflectivity, crisp specular highlights, luxury metal edge treatment.",
    useMode: "finish-policy"
  },
  "subtle-crimson-illumination": {
    promptInstruction: `Subtle crimson accent illumination using exact Frontal Slayer Red ${FRONTAL_SLAYER_RED} \u2014 restrained glow, not oversaturated.`,
    useMode: "finish-policy"
  }
};
var ORGANIZATION_VAULTS = {
  "frontal-slayer": FRONTAL_SLAYER_VAULT
};
function getOrganizationBrandVault(organizationId) {
  return ORGANIZATION_VAULTS[organizationId] ?? [];
}
function findBrandAssetByRole(organizationId, role) {
  const vault = getOrganizationBrandVault(organizationId);
  return vault.find((a) => a.assetRole === role && a.active && a.approvedForGeneration) ?? null;
}
function getFrontalSlayerRedToken() {
  return FRONTAL_SLAYER_RED;
}

// src/studio-os-core/creative-production/brand-asset-grounding/resolver.ts
var MATERIAL_SYNONYMS = {
  "white polished marble": "primary-marble-texture",
  "polished white marble": "primary-marble-texture",
  "approved marble": "primary-marble-texture",
  "organization marble": "primary-marble-texture",
  "clear crystal acrylic": "clear-crystal-acrylic",
  "crystal acrylic": "clear-crystal-acrylic",
  "mirror-polished chrome": "mirror-polished-chrome",
  "chrome trim": "mirror-polished-chrome",
  "crimson illumination": "subtle-crimson-illumination",
  "subtle crimson illumination": "subtle-crimson-illumination",
  "subtle red illumination": "subtle-crimson-illumination",
  "frontal slayer red": "color-token"
};
function resolveRoleFromMaterial(requestedMaterial) {
  const key = requestedMaterial.trim().toLowerCase();
  return MATERIAL_SYNONYMS[key] ?? null;
}
function buildMarblePromptInstruction(orgName) {
  return [
    `Use the supplied organization-approved marble texture reference exactly as the material identity for all marble surfaces belonging to ${orgName}.`,
    "Preserve its base tone, vein character, vein density, vein subtlety, tonal contrast, material scale, and clean luxury appearance.",
    "Do not replace it with Carrara, Calacatta, generic white marble, dramatic gray-veined marble, gold-veined marble, random luxury stone, or invented veining.",
    "The reference is material guidance only \u2014 not a room layout or environment photograph."
  ].join(" ");
}
function buildForbiddenSubstitutions() {
  return [
    "FORBIDDEN MATERIAL SUBSTITUTIONS:",
    "Carrara marble",
    "Calacatta marble",
    "generic white marble",
    "dramatic gray-veined marble",
    "gold-veined marble",
    "random luxury stone",
    "invented veining",
    "substitute marble when approved organization marble is supplied",
    "generic marble fallback"
  ].join(" \xB7 ");
}
function resolveBrandMaterialPackage(input) {
  const vault = getOrganizationBrandVault(input.organizationId);
  if (vault.length === 0 && input.materialRequests.some((r) => r.required !== false)) {
    return {
      code: "BRAND_ASSET_REQUIRED_MISSING",
      missingRole: "primary-marble-texture",
      organizationId: input.organizationId,
      message: `No brand vault configured for organization ${input.organizationId}.`
    };
  }
  const orgName = input.organizationName ?? input.organizationId;
  const profile = vault[0];
  const slots = [];
  const referenceUrls = [];
  const referenceChecksums = [];
  const colorTokens = {};
  const materialMappings = {};
  for (const req of input.materialRequests) {
    const synonym = req.brandRole ?? resolveRoleFromMaterial(req.requestedMaterial);
    const required = req.required !== false;
    if (synonym === "color-token" || req.requestedMaterial.toLowerCase().includes("red")) {
      const token = getFrontalSlayerRedToken();
      colorTokens.accentLighting = token;
      materialMappings[req.slot] = `Frontal Slayer Red ${token}`;
      slots.push({
        slot: req.slot,
        requestedMaterial: req.requestedMaterial,
        resolvedBrandAssetId: "fs-brand-red",
        resolvedReferenceUrl: null,
        checksum: null,
        useMode: "prompt-token",
        promptInstruction: CANONICAL_FINISH_POLICIES["subtle-crimson-illumination"].promptInstruction,
        required,
        fallbackAllowed: false,
        referenceRole: "color-reference",
        referenceWeight: 1,
        sourceOrganizationId: input.organizationId,
        appliedToMaterialSlot: req.slot
      });
      continue;
    }
    if (typeof synonym === "string" && synonym in CANONICAL_FINISH_POLICIES) {
      const policy = CANONICAL_FINISH_POLICIES[synonym];
      materialMappings[req.slot] = synonym;
      slots.push({
        slot: req.slot,
        requestedMaterial: req.requestedMaterial,
        resolvedBrandAssetId: null,
        resolvedReferenceUrl: null,
        checksum: null,
        useMode: "finish-policy",
        promptInstruction: policy.promptInstruction,
        required,
        fallbackAllowed: req.fallbackAllowed ?? false,
        referenceRole: "material-reference",
        referenceWeight: 0.6,
        sourceOrganizationId: input.organizationId,
        appliedToMaterialSlot: req.slot
      });
      continue;
    }
    const role = synonym ?? req.brandRole;
    if (role) {
      const asset = findBrandAssetByRole(input.organizationId, role);
      if (!asset && required) {
        return {
          code: "BRAND_ASSET_REQUIRED_MISSING",
          missingRole: role,
          organizationId: input.organizationId,
          message: `Required brand asset missing for role ${role} (organization ${input.organizationId}).`
        };
      }
      if (asset) {
        if (asset.organizationId !== input.organizationId) {
          return {
            code: "BRAND_ASSET_REQUIRED_MISSING",
            missingRole: role,
            organizationId: input.organizationId,
            message: `Cross-organization brand asset blocked for role ${role}.`
          };
        }
        materialMappings[req.slot] = role;
        if (asset.canonicalUrl) {
          referenceUrls.push(asset.canonicalUrl);
          referenceChecksums.push(asset.checksum);
        }
        const promptInstruction = role === "primary-marble-texture" ? buildMarblePromptInstruction(orgName) : `Use approved organization ${role} reference exactly.`;
        slots.push({
          slot: req.slot,
          requestedMaterial: req.requestedMaterial,
          resolvedBrandAssetId: asset.assetId,
          resolvedReferenceUrl: asset.canonicalUrl || null,
          checksum: asset.checksum,
          useMode: asset.canonicalUrl ? "reference-image" : "prompt-token",
          promptInstruction,
          required,
          fallbackAllowed: false,
          referenceRole: "material-reference",
          referenceWeight: 0.85,
          sourceOrganizationId: input.organizationId,
          appliedToMaterialSlot: req.slot
        });
        continue;
      }
    }
    if (required) {
      return {
        code: "BRAND_ASSET_REQUIRED_MISSING",
        missingRole: "primary-marble-texture",
        organizationId: input.organizationId,
        message: `Cannot resolve required material: ${req.requestedMaterial}`
      };
    }
  }
  const assignmentLines = slots.map((s) => `${s.slot}: ${materialMappings[s.slot] ?? s.requestedMaterial}`).join(" \xB7 ");
  const referenceLines = slots.filter((s) => s.resolvedReferenceUrl).map(
    (s) => `${s.appliedToMaterialSlot} \u2190 ${s.resolvedBrandAssetId} (${s.referenceRole}, weight ${s.referenceWeight})`
  ).join(" \xB7 ");
  return {
    organizationId: input.organizationId,
    brandProfileId: profile?.brandProfileId ?? `${input.organizationId}-brand`,
    brandAssetSetId: profile?.brandAssetSetId ?? `${input.organizationId}-materials`,
    materialSlots: slots,
    referenceUrls: [...new Set(referenceUrls)],
    referenceChecksums,
    colorTokens,
    materialMappings,
    promptSections: {
      organizationMaterialAssignments: `ORGANIZATION MATERIAL ASSIGNMENTS: ${assignmentLines}`,
      exactBrandAssetReferences: referenceLines ? `EXACT BRAND-ASSET REFERENCES: ${referenceLines}` : "EXACT BRAND-ASSET REFERENCES: finish-policy tokens only.",
      forbiddenMaterialSubstitutions: buildForbiddenSubstitutions()
    }
  };
}
function isBrandAssetResolutionError(result) {
  return "code" in result && result.code === "BRAND_ASSET_REQUIRED_MISSING";
}

// src/studio-os-core/scene-stack/isolated-layer-contract.ts
var ISOLATED_LAYER_QUALITY_GATE_VERSION = "isolated-layer-quality.v1";
var FORBIDDEN_SCENE_CONTENT = [
  "full room",
  "interior environment",
  "walls",
  "ceiling",
  "floor",
  "windows",
  "architecture",
  "showroom",
  "lobby",
  "wide shot",
  "complete composition",
  "prior layers",
  "shell recreation"
];
function resolveLayerGenerationMode(layerId) {
  if (layerId === "environment-shell") return "full-scene-shell";
  if (layerId === "signature-landmark") return "isolated-single-object";
  if (layerId === "furniture-objects") return "isolated-object-group";
  if (layerId === "lighting-systems") return "lighting-map";
  if (layerId === "atmospheric-systems") return "atmosphere-overlay";
  if (layerId === "surface-materials") return "texture-map";
  if (layerId === "ambient-motion") return "motion-overlay";
  return "reflection-overlay";
}
function getIsolatedLayerContract(layerId) {
  if (layerId === "environment-shell") {
    return {
      layerId,
      layerType: "environment-shell",
      generationMode: "full-scene-shell",
      isolationMode: "none",
      expectedContent: "Architecture shell only \u2014 walls, ceiling, floor, proportions.",
      forbiddenContent: ["furniture", "hero objects", "lighting effects", "people"],
      expectedAlpha: false,
      maximumFrameCoverage: 1,
      minimumTransparentSides: 0,
      allowFullWidthEdgeContact: true,
      allowFullHeightEdgeContact: true,
      shellSimilarityThreshold: 1,
      referencePolicy: "none",
      outputFormat: "webp",
      mountBehavior: "structural",
      regenerationPolicy: "manual-only",
      qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION
    };
  }
  if (layerId === "signature-landmark") {
    return {
      layerId,
      layerType: "signature-landmark",
      generationMode: "isolated-single-object",
      isolationMode: "object-only",
      expectedContent: "One hero landmark object only \u2014 transparent background, mountable plate.",
      forbiddenContent: FORBIDDEN_SCENE_CONTENT,
      expectedAlpha: true,
      maximumFrameCoverage: 0.7,
      minimumTransparentSides: 3,
      allowFullWidthEdgeContact: false,
      allowFullHeightEdgeContact: false,
      shellSimilarityThreshold: 0.82,
      referencePolicy: "perspective-metadata-only",
      outputFormat: "png",
      mountBehavior: "css-composite",
      regenerationPolicy: "auto-up-to-2",
      qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION
    };
  }
  if (layerId === "furniture-objects") {
    return {
      layerId,
      layerType: "furniture-objects",
      generationMode: "isolated-object-group",
      isolationMode: "object-group",
      expectedContent: "Grouped furniture package only \u2014 preserved arrangement, transparent background.",
      forbiddenContent: FORBIDDEN_SCENE_CONTENT,
      expectedAlpha: true,
      maximumFrameCoverage: 0.85,
      minimumTransparentSides: 2,
      allowFullWidthEdgeContact: false,
      allowFullHeightEdgeContact: false,
      shellSimilarityThreshold: 0.84,
      referencePolicy: "perspective-metadata-only",
      outputFormat: "png",
      mountBehavior: "css-composite",
      regenerationPolicy: "auto-up-to-2",
      qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION
    };
  }
  return {
    layerId,
    layerType: layerId,
    generationMode: resolveLayerGenerationMode(layerId),
    isolationMode: "blend-overlay",
    expectedContent: "Isolated overlay pass \u2014 not a full scene.",
    forbiddenContent: FORBIDDEN_SCENE_CONTENT,
    expectedAlpha: true,
    maximumFrameCoverage: 0.55,
    minimumTransparentSides: 1,
    allowFullWidthEdgeContact: true,
    allowFullHeightEdgeContact: true,
    shellSimilarityThreshold: 0.9,
    referencePolicy: "none",
    outputFormat: "png",
    mountBehavior: "css-composite",
    regenerationPolicy: "auto-up-to-2",
    qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION
  };
}

// src/studio-os-core/creative-production/artifact-intent.ts
function validatorExistsForIntent(intent) {
  return [
    "final-scene",
    "final-scene-preview",
    "environment-shell",
    "experience-environment",
    "world-preview",
    "world-expansion",
    "isolated-object",
    "object-group",
    "transparent-overlay",
    "material-map",
    "campaign-composite",
    "logo-component",
    "full-logo",
    "packaging-composite",
    "campaign-model-replacement",
    "founder-full-room-preview",
    "master-founder-landscape",
    "master-founder-portrait-recompose",
    "reception-desk",
    "furniture-asset",
    "landmark-asset",
    "decor-asset",
    "architecture-piece",
    "fixture",
    "lighting-object",
    "logo-asset",
    "campaign-graphic",
    "poster",
    "packaging-asset",
    "background-cleanup"
  ].includes(intent);
}

// src/studio-os-core/founder-render/brand-organization.ts
var FOUNDER_RENDER_BRAND_VAULT_ALIASES = {
  "studio-os": "frontal-slayer",
  ndx: "frontal-slayer"
};
function resolveFounderRenderBrandOrganizationId(plan) {
  const planOrg = plan.metadata.organizationId;
  if (getOrganizationBrandVault(planOrg).length > 0) return planOrg;
  const alias = FOUNDER_RENDER_BRAND_VAULT_ALIASES[planOrg];
  if (alias && getOrganizationBrandVault(alias).length > 0) return alias;
  return planOrg;
}

// src/studio-os-core/founder-render/preflight.ts
function runFounderRenderPreflight(plan) {
  if (!validatorExistsForIntent("founder-full-room-preview")) {
    return { ok: false, code: "NO_VALIDATOR_FOR_ARTIFACT_INTENT", message: "Founder render validator missing." };
  }
  const route = resolveFounderRenderModelRoute("16:9");
  if (!route.providerModel) {
    return { ok: false, code: "MODEL_ROUTE_UNAVAILABLE", message: "Founder render model route unavailable." };
  }
  const brandVaultOrganizationId = resolveFounderRenderBrandOrganizationId(plan);
  const brandResult = resolveBrandMaterialPackage({
    organizationId: brandVaultOrganizationId,
    organizationName: plan.metadata.organizationId,
    materialRequests: [
      { slot: "floor", requestedMaterial: "white polished marble", brandRole: "primary-marble-texture", required: true },
      { slot: "desk", requestedMaterial: "mirror-polished chrome", brandRole: "chrome-finish-reference", required: false },
      { slot: "accent", requestedMaterial: "subtle crimson illumination", brandRole: "approved-lighting-reference", required: false }
    ]
  });
  if (isBrandAssetResolutionError(brandResult)) {
    const planOrg = plan.metadata.organizationId;
    const message = brandVaultOrganizationId !== planOrg ? `${brandResult.message} (plan org: ${planOrg}, brand vault: ${brandVaultOrganizationId})` : brandResult.message;
    return {
      ok: false,
      code: brandResult.code,
      message,
      missingRole: brandResult.missingRole
    };
  }
  const refs = brandResult.referenceUrls.filter((u) => u.length > 0);
  if (refs.length === 0) {
    return {
      ok: false,
      code: "BRAND_ASSET_REQUIRED_MISSING",
      message: "Required brand material references missing for founder render.",
      missingRole: "primary-marble-texture"
    };
  }
  return {
    ok: true,
    brandReferenceUrls: refs,
    materialSetId: plan.materialSet.materialSetId,
    brandVaultOrganizationId
  };
}

// src/studio-os-core/scene-stack/types.ts
var SCENE_STACK_LAYER_ORDER = [
  "environment-shell",
  "signature-landmark",
  "furniture-objects",
  "lighting-systems",
  "atmospheric-systems",
  "surface-materials",
  "ambient-motion",
  "interaction",
  "runtime-effects",
  "founder-personalization"
];

// src/studio-os-core/creative-production/model-registry/resolve-model-route.ts
function resolveSceneStackLayerModelRouteFromRegistry(layerId, options) {
  const contract = getIsolatedLayerContract(layerId);
  const generationMode = contract.generationMode;
  const decision = resolveModelRoutingFromLayerId(layerId, {
    organizationId: options?.organizationId,
    brandGroundingRequired: options?.brandGroundingRequired,
    isolationAttempt: options?.isolationAttempt,
    surface: "scene-stack"
  });
  let referenceStrategy;
  if (decision.referenceStrategy === "marble-genesis-anchor") {
    referenceStrategy = "marble-genesis-anchor";
  } else if (decision.referenceStrategy === "brand-material-references-only") {
    referenceStrategy = "brand-material-references-only";
  } else {
    referenceStrategy = "placement-metadata-only";
  }
  return {
    layerId,
    generationMode,
    provider: "fal",
    providerModel: decision.providerModel,
    providerEndpoint: decision.providerEndpoint,
    textToImageOnly: decision.textToImageOnly,
    referenceStrategy,
    requestedAlpha: contract.expectedAlpha,
    promptBuilderId: decision.promptBuilderId,
    allowBackgroundExtraction: decision.allowBackgroundExtraction,
    routeId: decision.routeId,
    assetClass: decision.assetClass,
    brandGroundingCapable: decision.brandGroundingCapable,
    resolutionTruth: decision.resolutionTruth,
    artifactIntent: decision.artifactIntent,
    promptVersion: decision.promptVersion,
    workerFamily: decision.workerFamily
  };
}

// src/studio-os-core/scene-stack/layer-model-routing.ts
function resolveLayerIdFromProductionGroupId(productionGroupId) {
  if (!productionGroupId.startsWith("scene-stack-")) return null;
  for (const layerId of [...SCENE_STACK_LAYER_ORDER].reverse()) {
    if (productionGroupId.endsWith(`-${layerId}`)) return layerId;
  }
  return null;
}
function resolveSceneStackLayerModelRoute(layerId, isolationAttempt = 0, options) {
  return resolveSceneStackLayerModelRouteFromRegistry(layerId, {
    organizationId: options?.organizationId,
    brandGroundingRequired: options?.brandGroundingRequired,
    isolationAttempt
  });
}

// src/studio-os-core/creative-production/generation-routing-record.ts
var GENERATION_ROUTING_RECORD_VERSION = "generation-routing-record.v1";
function buildGenerationRoutingRecord(input) {
  const { decision } = input;
  return {
    recordVersion: GENERATION_ROUTING_RECORD_VERSION,
    recordedAt: input.recordedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    artifactIntent: decision.artifactIntent,
    workerFamily: decision.workerFamily,
    surface: decision.surface,
    selectedModel: decision.providerModel,
    routeId: decision.routeId,
    promptVersion: decision.promptVersion,
    promptBuilderId: decision.promptBuilderId,
    routingDecision: `${decision.workerFamily}:${decision.routeId}`,
    referenceStrategy: decision.referenceStrategy,
    referencePolicy: decision.referencePolicy,
    policyVersion: decision.policyVersion,
    materialLibraryVersion: input.materialLibraryVersion ?? null,
    lightingProfileId: input.lightingProfileId ?? null,
    cameraProfileId: input.cameraProfileId ?? null,
    perspectiveProfileId: input.perspectiveProfileId ?? null,
    brandAssetRevision: input.brandAssetRevision ?? null,
    approvedFounderRenderUrl: input.approvedFounderRenderUrl ?? null,
    blueprintRevision: input.blueprintRevision ?? null,
    organizationId: input.organizationId ?? null
  };
}

// src/studio-os-core/immune-system/model-routing-validation.ts
function isNanoBananaProEndpoint(endpoint) {
  return endpoint.includes("nano-banana-pro");
}
function isNanoBanana2Endpoint(endpoint) {
  return endpoint.includes("nano-banana-2");
}
function isBirefnetEndpoint(endpoint) {
  return endpoint.includes("birefnet");
}
function validateModelRoutingDecision(decision) {
  const { artifactIntent, providerModel, workerFamily } = decision;
  if (isWorldEnvironmentIntent(artifactIntent) && !isNanoBananaProEndpoint(providerModel)) {
    return {
      ok: false,
      code: "WORLD_INTENT_REQUIRES_NBP",
      message: `Artifact intent ${artifactIntent} requires Nano Banana Pro (world architect) but received ${providerModel}.`
    };
  }
  if (BLEND_OVERLAY_INTENTS.has(artifactIntent)) {
    return { ok: true, decision };
  }
  if (isProductionAssetIntent(artifactIntent) && !isNanoBanana2Endpoint(providerModel)) {
    return {
      ok: false,
      code: "ASSET_INTENT_REQUIRES_NB2",
      message: `Artifact intent ${artifactIntent} requires Nano Banana 2 (asset manufacturer) but received ${providerModel}.`
    };
  }
  if (isBackgroundCleanupIntent(artifactIntent) && !isBirefnetEndpoint(providerModel)) {
    return {
      ok: false,
      code: "CLEANUP_INTENT_REQUIRES_BIREFNET",
      message: `Artifact intent ${artifactIntent} requires background cleanup worker but received ${providerModel}.`
    };
  }
  if (workerFamily === "world-architect" && isProductionAssetIntent(artifactIntent)) {
    return {
      ok: false,
      code: "WORLD_WORKER_ASSET_VIOLATION",
      message: `World architect worker cannot generate production asset intent ${artifactIntent}.`
    };
  }
  if (workerFamily === "asset-manufacturer" && isWorldEnvironmentIntent(artifactIntent)) {
    return {
      ok: false,
      code: "ASSET_WORKER_ROOM_VIOLATION",
      message: `Asset manufacturer worker cannot generate environment intent ${artifactIntent}.`
    };
  }
  return { ok: true, decision };
}
function validateAndResolveModelRouting(input) {
  const decision = resolveModelRoutingDecision(input);
  return validateModelRoutingDecision(decision);
}

// src/studio-os-core/architectural-dna/compiler/founder-render-prompt-compiler.ts
import { createHash as createHash2 } from "node:crypto";

// src/studio-os-core/canonical-studio-world/canonical-department-registry.ts
var CANONICAL_DEPARTMENT_REGISTRY_VERSION = "canonical-department-registry.v1";
var NOW = "2026-07-13T00:00:00.000Z";
function record(partial) {
  return {
    departmentClass: "CANONICAL_STUDIO_WORLD_DEPARTMENT",
    registryVersion: CANONICAL_DEPARTMENT_REGISTRY_VERSION,
    scope: "studio-world-global",
    createdAt: NOW,
    updatedAt: NOW,
    publishedAt: null,
    blueprintRevision: 1,
    founderRenderRevision: 0,
    constructionPlanRevision: 0,
    constructionPlanId: null,
    departmentModelRoute: "nano-banana-pro-full-scene",
    marketplaceEligibility: false,
    systemAccessible: true,
    status: partial.status ?? "DRAFT",
    lifecycleState: partial.lifecycleState ?? partial.status ?? "DRAFT",
    founderRenderId: partial.founderRenderId ?? null,
    publishedVersion: partial.publishedVersion ?? null,
    ...partial
  };
}
var CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY = [
  record({
    departmentId: "experience-lab",
    slug: "experience-lab",
    name: "Experience Lab\u2122",
    category: "world-creation",
    purpose: "Design canonical Studio World departments and official Industry Packs.",
    canonicalRole: "master-architecture-department",
    description: "Admin-only planning \u2014 canonical infrastructure and Industry Pack authoring.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-experience-lab-blueprint.v1",
    departmentPromptVersion: "canonical-experience-lab-founder-render.v1",
    commandDockProfile: "el-command-dock.v1",
    workbenchProfile: "el-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["blueprint-author", "world-compiler"],
    requiredCapabilities: ["architectural-planning", "industry-pack-authoring"],
    permittedActions: ["generate", "approve", "publish"],
    routePath: "/admin/studio/experience-lab"
  }),
  record({
    departmentId: "blueprint-author",
    slug: "blueprint-author",
    name: "Blueprint Author\u2122",
    category: "world-creation",
    purpose: "Deterministic construction specifications.",
    canonicalRole: "specification-authority",
    description: "Blueprint Author orchestrates construction plans and socket metadata.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-blueprint-author.v1",
    departmentPromptVersion: "canonical-blueprint-author-founder-render.v1",
    commandDockProfile: "el-command-dock.v1",
    workbenchProfile: "el-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["experience-lab"],
    requiredCapabilities: ["blueprint-authoring"],
    permittedActions: ["author", "approve"],
    routePath: "/admin/studio/experience-lab"
  }),
  record({
    departmentId: "world-compiler",
    slug: "world-compiler",
    name: "World Compiler\u2122",
    category: "world-creation",
    purpose: "Living experience assembly.",
    canonicalRole: "world-compiler",
    description: "Compiles approved architecture into interactive Studio World runtime.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-world-compiler.v1",
    departmentPromptVersion: "canonical-world-compiler-founder-render.v1",
    commandDockProfile: "el-command-dock.v1",
    workbenchProfile: "el-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["blueprint-author"],
    requiredCapabilities: ["world-compilation"],
    permittedActions: ["compile"],
    routePath: "/admin/studio/experience-engine"
  }),
  record({
    departmentId: "construction-mode",
    slug: "construction-mode",
    name: "Construction Mode\u2122",
    category: "world-creation",
    purpose: "Assembly-only manufacturing from approved assets.",
    canonicalRole: "construction-assembly",
    description: "Assembles approved departments \u2014 never invents architecture.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-construction-mode.v1",
    departmentPromptVersion: "canonical-construction-mode-founder-render.v1",
    commandDockProfile: "cm-command-dock.v1",
    workbenchProfile: "cm-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["creative-director-studio"],
    requiredCapabilities: ["assembly"],
    permittedActions: ["assemble"],
    routePath: "/admin/studio/world/construction-mode"
  }),
  record({
    departmentId: "creative-director-studio",
    slug: "creative-director-studio",
    name: "Creative Director Studio\u2122",
    category: "creative-production",
    purpose: "Asset manufacturing on approved architecture.",
    canonicalRole: "asset-manufacturing",
    description: "Founder creative workspace \u2014 edits approved HQ, never invents canonical architecture.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-cds-blueprint.v1",
    departmentPromptVersion: "canonical-creative-director-studio-founder-render.v1",
    commandDockProfile: "cds-command-dock.v1",
    workbenchProfile: "cds-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["experience-lab"],
    requiredCapabilities: ["asset-manufacturing", "material-editing"],
    permittedActions: ["manufacture", "customize"],
    routePath: "/admin/studio/department/creative-direction",
    status: "BLUEPRINT_READY",
    lifecycleState: "BLUEPRINT_READY"
  }),
  record({
    departmentId: "material-lab",
    slug: "material-lab",
    name: "Material Lab\u2122",
    category: "creative-production",
    purpose: "Global material intent and brand material governance.",
    canonicalRole: "material-lab",
    description: "Material profiles for canonical and HQ departments.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-material-lab.v1",
    departmentPromptVersion: "canonical-material-lab-founder-render.v1",
    commandDockProfile: "cds-command-dock.v1",
    workbenchProfile: "cds-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["asset-registry"],
    requiredCapabilities: ["material-intent"],
    permittedActions: ["edit-materials"],
    routePath: "/admin/studio/brand-assets"
  }),
  record({
    departmentId: "lighting-studio",
    slug: "lighting-studio",
    name: "Lighting Studio\u2122",
    category: "creative-production",
    purpose: "Lighting profiles and validation.",
    canonicalRole: "lighting-studio",
    description: "Canonical lighting rigs and department lighting intent.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-lighting-studio.v1",
    departmentPromptVersion: "canonical-lighting-studio-founder-render.v1",
    commandDockProfile: "cds-command-dock.v1",
    workbenchProfile: "cds-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: [],
    requiredCapabilities: ["lighting-intent"],
    permittedActions: ["edit-lighting"],
    routePath: "/admin/studio/studio-warehouse"
  }),
  record({
    departmentId: "composition-studio",
    slug: "composition-studio",
    name: "Composition Studio\u2122",
    category: "creative-production",
    purpose: "Device framing \u2014 not redesign.",
    canonicalRole: "composition-studio",
    description: "Multi-device composition from approved master landscape.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-composition-studio.v1",
    departmentPromptVersion: "canonical-composition-studio-founder-render.v1",
    commandDockProfile: "el-command-dock.v1",
    workbenchProfile: "el-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["experience-lab"],
    requiredCapabilities: ["composition-pack"],
    permittedActions: ["recompose"],
    routePath: "/admin/studio/experience-lab"
  }),
  record({
    departmentId: "animation-studio",
    slug: "animation-studio",
    name: "Animation Studio\u2122",
    category: "creative-production",
    purpose: "Motion and animation production.",
    canonicalRole: "animation-studio",
    description: "Canonical animation department infrastructure.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-animation-studio.v1",
    departmentPromptVersion: "canonical-animation-studio-founder-render.v1",
    commandDockProfile: "cds-command-dock.v1",
    workbenchProfile: "cds-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["creative-director-studio"],
    requiredCapabilities: ["animation"],
    permittedActions: ["animate"],
    routePath: "/admin/studio/studio-production"
  }),
  record({
    departmentId: "character-studio",
    slug: "character-studio",
    name: "Character Studio\u2122",
    category: "creative-production",
    purpose: "Character and talent layer production.",
    canonicalRole: "character-studio",
    description: "Canonical character production infrastructure.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-character-studio.v1",
    departmentPromptVersion: "canonical-character-studio-founder-render.v1",
    commandDockProfile: "cds-command-dock.v1",
    workbenchProfile: "cds-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["creative-director-studio"],
    requiredCapabilities: ["character-production"],
    permittedActions: ["produce-characters"],
    routePath: "/admin/studio/casting"
  }),
  record({
    departmentId: "command-center",
    slug: "command-center",
    name: "Command Center\u2122",
    category: "operations",
    purpose: "Studio World executive bridge and operating state.",
    canonicalRole: "command-center",
    description: "Global operations command for Studio World infrastructure.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-command-center.v1",
    departmentPromptVersion: "canonical-command-center-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["immune-system", "ai-workforce-center"],
    requiredCapabilities: ["operations", "incident-response"],
    permittedActions: ["monitor", "deploy"],
    routePath: "/admin/studio/overview",
    status: "BLUEPRINT_READY",
    lifecycleState: "BLUEPRINT_READY"
  }),
  record({
    departmentId: "ai-workforce-center",
    slug: "ai-workforce-center",
    name: "AI Workforce Center\u2122",
    category: "operations",
    purpose: "Manufacturing workers and governed queues.",
    canonicalRole: "ai-workforce",
    description: "Global AI workforce orchestration.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-ai-workforce.v1",
    departmentPromptVersion: "canonical-ai-workforce-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["command-center"],
    requiredCapabilities: ["worker-orchestration"],
    permittedActions: ["queue", "dispatch"],
    routePath: "/admin/studio/render-queue"
  }),
  record({
    departmentId: "asset-registry",
    slug: "asset-registry",
    name: "Asset Registry\u2122",
    category: "operations",
    purpose: "Global asset registry vault.",
    canonicalRole: "asset-registry",
    description: "Canonical asset registry for Studio World.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-asset-registry.v1",
    departmentPromptVersion: "canonical-asset-registry-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: [],
    requiredCapabilities: ["asset-registry"],
    permittedActions: ["register", "browse"],
    routePath: "/admin/studio/asset-registry"
  }),
  record({
    departmentId: "studio-world-registry",
    slug: "studio-world-registry",
    name: "Studio World Registry\u2122",
    category: "operations",
    purpose: "Published canonical departments and infrastructure catalog.",
    canonicalRole: "studio-world-registry",
    description: "Registry of published canonical Studio World departments.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-studio-world-registry.v1",
    departmentPromptVersion: "canonical-studio-world-registry-founder-render.v1",
    commandDockProfile: "el-command-dock.v1",
    workbenchProfile: "el-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["experience-lab"],
    requiredCapabilities: ["registry-publish"],
    permittedActions: ["publish", "browse"],
    routePath: "/admin/studio/experience-lab"
  }),
  record({
    departmentId: "observatory",
    slug: "observatory",
    name: "Observatory\u2122",
    category: "operations",
    purpose: "Studio World observability and experience intelligence.",
    canonicalRole: "observatory",
    description: "Architecture and experience observability.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-observatory.v1",
    departmentPromptVersion: "canonical-observatory-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["command-center"],
    requiredCapabilities: ["observability"],
    permittedActions: ["observe"],
    routePath: "/admin/studio/experience-observatory"
  }),
  record({
    departmentId: "city-council",
    slug: "city-council",
    name: "City Council\u2122",
    category: "governance",
    purpose: "Municipal governance and mod approval.",
    canonicalRole: "city-council",
    description: "Governance chamber for Studio World municipal operations.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-city-council.v1",
    departmentPromptVersion: "canonical-city-council-founder-render.v1",
    commandDockProfile: "council-command-dock.v1",
    workbenchProfile: "council-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["permit-center"],
    requiredCapabilities: ["governance", "voting"],
    permittedActions: ["review", "approve-mods"],
    routePath: "/admin/studio/constitution-hall"
  }),
  record({
    departmentId: "permit-center",
    slug: "permit-center",
    name: "Permit Center\u2122",
    category: "governance",
    purpose: "Municipal construction permits.",
    canonicalRole: "permit-office",
    description: "Permit issuance and review for construction projects.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-permit-center.v1",
    departmentPromptVersion: "canonical-permit-center-founder-render.v1",
    commandDockProfile: "council-command-dock.v1",
    workbenchProfile: "council-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: [],
    requiredCapabilities: ["permits"],
    permittedActions: ["submit-permit", "review-permit"],
    routePath: "/admin/studio/constitution-hall"
  }),
  record({
    departmentId: "quality-guard",
    slug: "quality-guard",
    name: "Quality Guard\u2122",
    category: "governance",
    purpose: "Composition and asset parity enforcement.",
    canonicalRole: "quality-guard",
    description: "Quality gates for renders and manufacturing.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-quality-guard.v1",
    departmentPromptVersion: "canonical-quality-guard-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["immune-system"],
    requiredCapabilities: ["quality-guard"],
    permittedActions: ["inspect", "approve-quality"],
    routePath: "/admin/studio/qa-headquarters"
  }),
  record({
    departmentId: "immune-system",
    slug: "immune-system",
    name: "Immune System\u2122",
    category: "governance",
    purpose: "Routing and boundary enforcement including Architecture Law #001.",
    canonicalRole: "immune-system",
    description: "Platform immune system \u2014 model routing, AI UI detection, drift repair.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-immune-system.v1",
    departmentPromptVersion: "canonical-immune-system-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: [],
    requiredCapabilities: ["immune-enforcement"],
    permittedActions: ["validate", "reject"],
    routePath: "/admin/studio/governance"
  }),
  record({
    departmentId: "marketplace",
    slug: "marketplace",
    name: "Marketplace\u2122",
    category: "commerce",
    purpose: "Industry packs, departments, headquarters commerce.",
    canonicalRole: "marketplace",
    description: "Global marketplace infrastructure.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-marketplace.v1",
    departmentPromptVersion: "canonical-marketplace-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["certification-center"],
    requiredCapabilities: ["commerce"],
    permittedActions: ["list", "purchase"],
    routePath: "/admin/studio/marketplace",
    marketplaceEligibility: true
  }),
  record({
    departmentId: "mod-registry",
    slug: "mod-registry",
    name: "Mod Registry\u2122",
    category: "commerce",
    purpose: "Approved mod catalog and attachment rules.",
    canonicalRole: "mod-registry",
    description: "Registry of approved mods for HQ customization.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-mod-registry.v1",
    departmentPromptVersion: "canonical-mod-registry-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["city-council"],
    requiredCapabilities: ["mod-registry"],
    permittedActions: ["register-mod"],
    routePath: "/admin/studio/marketplace",
    marketplaceEligibility: true
  }),
  record({
    departmentId: "certification-center",
    slug: "certification-center",
    name: "Certification Center\u2122",
    category: "commerce",
    purpose: "Certification and compliance for marketplace assets.",
    canonicalRole: "certification-center",
    description: "Certifies mods and marketplace listings.",
    accessClass: "studio-world-admin",
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: "canonical-certification-center.v1",
    departmentPromptVersion: "canonical-certification-center-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["quality-guard"],
    requiredCapabilities: ["certification"],
    permittedActions: ["certify"],
    routePath: "/admin/studio/marketplace",
    marketplaceEligibility: true
  }),
  record({
    departmentId: "founder-suite",
    slug: "founder-suite",
    name: "Founder Suite\u2122",
    category: "founder",
    purpose: "Founder executive suite and global founder tools.",
    canonicalRole: "founder-suite",
    description: "Global founder suite \u2014 not tenant HQ.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-founder-suite.v1",
    departmentPromptVersion: "canonical-founder-suite-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: [],
    requiredCapabilities: ["founder-tools"],
    permittedActions: ["access"],
    routePath: "/admin/headquarters"
  }),
  record({
    departmentId: "founder-dashboard",
    slug: "founder-dashboard",
    name: "Founder Dashboard\u2122",
    category: "founder",
    purpose: "Founder operating dashboard.",
    canonicalRole: "founder-dashboard",
    description: "Executive founder dashboard infrastructure.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-founder-dashboard.v1",
    departmentPromptVersion: "canonical-founder-dashboard-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["founder-suite"],
    requiredCapabilities: ["founder-dashboard"],
    permittedActions: ["view"],
    routePath: "/admin/dashboard"
  }),
  record({
    departmentId: "founder-archive",
    slug: "founder-archive",
    name: "Founder Archive\u2122",
    category: "founder",
    purpose: "Founder historical archive and legacy vault access.",
    canonicalRole: "founder-archive",
    description: "Archive infrastructure for founder legacy assets.",
    accessClass: "founder-read",
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: "canonical-founder-archive.v1",
    departmentPromptVersion: "canonical-founder-archive-founder-render.v1",
    commandDockProfile: "cc-command-dock.v1",
    workbenchProfile: "cc-workbench.v1",
    socketProfile: "default-department-ui-sockets.v1",
    materialLibraryId: "studio-world-global-materials",
    lightingProfileId: "studio-world-executive-lighting",
    compositionProfileId: "master-landscape-21x9",
    dependencies: ["asset-registry"],
    requiredCapabilities: ["archive"],
    permittedActions: ["archive", "browse"],
    routePath: "/admin/studio/legacy-system"
  })
];
function getCanonicalDepartmentRecord(departmentId) {
  return CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.find((d) => d.departmentId === departmentId);
}

// src/studio-os-core/canonical-studio-world/department-architectural-fingerprints.ts
var ARCHITECTURAL_FINGERPRINT_VERSION = "architectural-fingerprint.v1";
var RECEPTION_CONTAMINATION_MARKERS = [
  "ReceptionShell",
  "shell-reception",
  "ReceptionDesk",
  "ReceptionDeskSocket",
  "CrystalLandmark",
  "LandmarkSocket",
  "LeftSeating",
  "RightSeating",
  "Waiting Lounge",
  "Reception Foyer",
  "concierge desk",
  "reception desk",
  "waiting room",
  "receptionist furniture"
];
var fingerprint = (departmentId, shellId, signatureElements, forbiddenElements = [...RECEPTION_CONTAMINATION_MARKERS]) => ({
  fingerprintVersion: ARCHITECTURAL_FINGERPRINT_VERSION,
  departmentId,
  shellId,
  signatureElements,
  forbiddenElements
});
var DEPARTMENT_ARCHITECTURAL_FINGERPRINTS = {
  "experience-lab": fingerprint("experience-lab", "ExperienceLabShell", [
    "Architecture Studio",
    "Blueprint Holograms",
    "Floating Room Model",
    "Construction Tables",
    "Material Library",
    "Command Dock",
    "Workbench",
    "Holographic Blueprint Wall",
    "Lighting Study Rigs"
  ]),
  "blueprint-author": fingerprint("blueprint-author", "BlueprintAuthorShell", [
    "Specification Console",
    "Blueprint Drafting Tables",
    "Socket Registry Wall",
    "Construction Spec Displays",
    "Command Dock",
    "Workbench"
  ]),
  "world-compiler": fingerprint("world-compiler", "WorldCompilerShell", [
    "Compilation Chamber",
    "Runtime Assembly Tables",
    "Scene Stack Monitors",
    "World Graph Displays",
    "Command Dock",
    "Workbench"
  ]),
  "construction-mode": fingerprint("construction-mode", "ConstructionModeShell", [
    "Assembly Floor",
    "Manufacturing Bays",
    "Approved Asset Crates",
    "Assembly Consoles",
    "Command Dock",
    "Workbench"
  ]),
  "creative-director-studio": fingerprint("creative-director-studio", "CreativeDirectorStudioShell", [
    "Production Stage",
    "Asset Breakdown",
    "Version Wall",
    "Lighting Rig",
    "Reference Library",
    "Approval Console",
    "Material Testing Bench",
    "Camera Rig"
  ]),
  "material-lab": fingerprint("material-lab", "MaterialLabShell", [
    "Material Sample Wall",
    "Texture Testing Stations",
    "Brand Material Vault",
    "Swatch Library",
    "Command Dock",
    "Workbench"
  ]),
  "lighting-studio": fingerprint("lighting-studio", "LightingStudioShell", [
    "Lighting Rig Array",
    "Gobo Library",
    "Color Temperature Lab",
    "Reflection Study Zone",
    "Command Dock",
    "Workbench"
  ]),
  "composition-studio": fingerprint("composition-studio", "CompositionStudioShell", [
    "Device Framing Wall",
    "Aspect Ratio Displays",
    "Composition Grid Tables",
    "Multi-Device Preview Racks",
    "Command Dock",
    "Workbench"
  ]),
  "animation-studio": fingerprint("animation-studio", "AnimationStudioShell", [
    "Motion Capture Stage",
    "Timeline Consoles",
    "Keyframe Displays",
    "Animation Preview Wall",
    "Command Dock",
    "Workbench"
  ]),
  "character-studio": fingerprint("character-studio", "CharacterStudioShell", [
    "Casting Stage",
    "Talent Turntable",
    "Character Reference Wall",
    "Wardrobe Racks",
    "Command Dock",
    "Workbench"
  ]),
  "command-center": fingerprint("command-center", "CommandCenterShell", [
    "Mission Wall",
    "City Telemetry",
    "Organization Graph",
    "AI Monitoring",
    "Municipal Command Tables",
    "Operations Bridge",
    "Incident Feed Displays"
  ]),
  "ai-workforce-center": fingerprint("ai-workforce-center", "AiWorkforceCenterShell", [
    "Worker Orchestration Wall",
    "Queue Management Consoles",
    "Manufacturing Worker Bays",
    "Dispatch Tables",
    "Command Dock",
    "Workbench"
  ]),
  "asset-registry": fingerprint("asset-registry", "AssetRegistryShell", [
    "Asset Vault Displays",
    "Registry Catalog Wall",
    "Version Tracking Consoles",
    "Asset Turntables",
    "Command Dock",
    "Workbench"
  ]),
  "studio-world-registry": fingerprint("studio-world-registry", "StudioWorldRegistryShell", [
    "Published Department Catalog",
    "Infrastructure Registry Wall",
    "Canonical Version Displays",
    "Command Dock",
    "Workbench"
  ]),
  "observatory": fingerprint("observatory", "ObservatoryShell", [
    "Experience Intelligence Wall",
    "Architecture Observability Displays",
    "Telemetry Panoramas",
    "Diagnostic Consoles",
    "Command Dock",
    "Workbench"
  ]),
  "city-council": fingerprint("city-council", "CityCouncilShell", [
    "Council Chamber Dais",
    "Municipal Vote Panels",
    "Governance Displays",
    "Jurisdiction Maps",
    "Command Dock",
    "Workbench"
  ]),
  "permit-center": fingerprint("permit-center", "PermitCenterShell", [
    "Permit Review Consoles",
    "Construction Permit Wall",
    "Application Processing Tables",
    "Command Dock",
    "Workbench"
  ]),
  "quality-guard": fingerprint("quality-guard", "QualityGuardShell", [
    "Quality Inspection Stations",
    "Parity Validation Displays",
    "Composition Check Consoles",
    "Command Dock",
    "Workbench"
  ]),
  "immune-system": fingerprint("immune-system", "ImmuneSystemShell", [
    "Boundary Enforcement Wall",
    "Routing Validation Consoles",
    "Drift Detection Displays",
    "Architecture Law Monitors",
    "Command Dock",
    "Workbench"
  ]),
  "marketplace": fingerprint("marketplace", "MarketplaceShell", [
    "Storefronts",
    "Licensing Displays",
    "Creator Kiosks",
    "Featured Mods",
    "Commerce Galleries",
    "Command Dock",
    "Workbench"
  ]),
  "mod-registry": fingerprint("mod-registry", "ModRegistryShell", [
    "Mod Catalog Wall",
    "Attachment Rule Displays",
    "Approved Mod Vault",
    "Command Dock",
    "Workbench"
  ]),
  "certification-center": fingerprint("certification-center", "CertificationCenterShell", [
    "Certification Review Stations",
    "Compliance Displays",
    "Marketplace Approval Consoles",
    "Command Dock",
    "Workbench"
  ]),
  "founder-suite": fingerprint("founder-suite", "ExecutiveAtriumShell", [
    "Monumental Central Gathering Space",
    "Premium Executive Architecture",
    "Executive Circulation",
    "Presentation Areas",
    "Command Dock",
    "Workbench"
  ]),
  "founder-dashboard": fingerprint("founder-dashboard", "FounderDashboardShell", [
    "Executive Operating Dashboard",
    "Founder Metrics Wall",
    "Strategic Overview Displays",
    "Command Dock",
    "Workbench"
  ]),
  "founder-archive": fingerprint("founder-archive", "FounderArchiveShell", [
    "Legacy Vault Displays",
    "Historical Archive Wall",
    "Founder Legacy Consoles",
    "Command Dock",
    "Workbench"
  ])
};
function resolveDepartmentFingerprint(departmentId) {
  return DEPARTMENT_ARCHITECTURAL_FINGERPRINTS[departmentId];
}
function containsReceptionContamination(text) {
  const positiveOnly = text.split(/\n\n/).filter((section) => !section.startsWith("NEVER INCLUDE") && !section.toLowerCase().includes("forbidden outputs")).join("\n\n");
  const lower = positiveOnly.toLowerCase();
  for (const marker of RECEPTION_CONTAMINATION_MARKERS) {
    if (lower.includes(marker.toLowerCase())) return marker;
  }
  return null;
}

// src/studio-os-core/canonical-studio-world/department-charters.ts
var DEPARTMENT_CHARTER_VERSION = "department-charter.v1";
var charter = (departmentId, partial) => ({
  charterVersion: DEPARTMENT_CHARTER_VERSION,
  departmentId,
  ...partial
});
var DEPARTMENT_CHARTERS = {
  "experience-lab": charter("experience-lab", {
    mission: "Design canonical Studio World departments and official Industry Packs.",
    responsibilities: [
      "architectural planning",
      "Blueprint Author orchestration",
      "master Founder Render generation",
      "construction planning",
      "canonical infrastructure creation",
      "official pack creation"
    ],
    nonResponsibilities: ["founder customization", "isolated asset manufacturing", "tenant-specific edits"],
    userClasses: ["Admin Founder", "authorized Studio World architects", "system workers"],
    coreWorkflows: ["select department", "author blueprint", "generate render", "approve", "publish"],
    requiredTools: ["Blueprint Author", "Industry Pack Registry", "Socket Registry"],
    requiredCommandModules: ["world-registry-context", "blueprint-context", "revision-context", "permit-status", "cost-forecast"],
    requiredWorkbenchModules: ["architectural-tools", "material-intent", "lighting-intent", "composition", "budget-forecast", "permit-center"],
    requiredPanels: ["department-tree", "render-queue", "approval-queue"],
    requiredSockets: ["COMMAND_DOCK", "WORKBENCH", "VIEWPORT", "DISPLAY_A"],
    handoffDestinations: ["creative-director-studio", "construction-mode", "studio-world-registry"],
    upstreamDependencies: ["blueprint-author"],
    downstreamDependencies: ["creative-director-studio", "studio-world-registry"],
    visualIdentity: "bright architectural planning atelier",
    atmosphere: "executive marble planning studio",
    architecturalMetaphor: "master planning department",
    availability: "admin-only",
    healthRequirements: ["immune-system-clear", "architecture-law-001-pass"],
    permitRequirements: ["municipal-planning-permit"],
    lifecycleRules: ["must-publish-before-founder-clone", "no-tenant-ownership"],
    mustInclude: [
      "floating holographic room blueprint",
      "construction holograms",
      "lighting studies",
      "material studies",
      "architectural workbench",
      "integrated blank command dock",
      "integrated blank workbench"
    ],
    neverInclude: [
      "reception desk",
      "waiting room",
      "receptionist furniture",
      "corporate lobby",
      "concierge desk",
      "ReceptionShell"
    ]
  }),
  "creative-director-studio": charter("creative-director-studio", {
    mission: "Manufacture and customize assets on approved architecture.",
    responsibilities: ["asset manufacturing", "material editing", "lighting editing", "approved mod attachment"],
    nonResponsibilities: ["canonical architecture invention", "department creation", "Industry Pack authoring"],
    userClasses: ["Founder", "authorized production staff"],
    coreWorkflows: ["receive handoff", "manufacture assets", "customize HQ", "approve revisions"],
    requiredTools: ["Material Lab", "Lighting Studio", "Composition Suite", "Asset Library"],
    requiredCommandModules: ["project-context", "selected-asset", "manufacturing-status", "approvals", "render-queue"],
    requiredWorkbenchModules: ["asset-workbench", "material-lab", "lighting-studio", "composition-suite", "asset-library", "render-queue"],
    requiredPanels: ["asset-turntable", "approval-gallery"],
    requiredSockets: ["COMMAND_DOCK", "WORKBENCH", "VIEWPORT", "CENTER_STAGE"],
    handoffDestinations: ["construction-mode"],
    upstreamDependencies: ["experience-lab"],
    downstreamDependencies: ["construction-mode"],
    visualIdentity: "immersive creative manufacturing studio",
    atmosphere: "production atelier",
    architecturalMetaphor: "creative director atelier",
    availability: "founder-accessible",
    healthRequirements: ["approved-handoff-present"],
    permitRequirements: [],
    lifecycleRules: ["requires-approved-blueprint", "no-architecture-invention"],
    mustInclude: [
      "isolated production stages",
      "material testing",
      "asset version bays",
      "lighting rigs",
      "camera rigs",
      "reference wall",
      "production benches",
      "integrated blank command dock",
      "integrated blank workbench"
    ],
    neverInclude: ["Reception layout", "reception desk", "waiting lounge", "ReceptionShell"]
  }),
  "command-center": charter("command-center", {
    mission: "Operate Studio World global infrastructure and incident response.",
    responsibilities: ["global operating state", "infrastructure health", "workforce orchestration", "incident response"],
    nonResponsibilities: ["HQ customization", "Industry Pack authoring"],
    userClasses: ["Admin Founder", "operations staff"],
    coreWorkflows: ["monitor health", "dispatch workforce", "resolve incidents"],
    requiredTools: ["AI Workforce", "Immune System", "Observatory"],
    requiredCommandModules: ["global-operating-state", "alerts", "infrastructure-health", "active-incidents"],
    requiredWorkbenchModules: ["deployment-controls", "ai-workforce", "queue-management", "immune-system", "diagnostics", "budget-controls"],
    requiredPanels: ["health-grid", "incident-feed"],
    requiredSockets: ["COMMAND_DOCK", "WORKBENCH", "VIEWPORT", "STATUS_BAR"],
    handoffDestinations: ["ai-workforce-center", "immune-system"],
    upstreamDependencies: ["immune-system"],
    downstreamDependencies: ["ai-workforce-center", "observatory"],
    visualIdentity: "executive command bridge",
    atmosphere: "spaceship command bridge",
    architecturalMetaphor: "command center bridge",
    availability: "admin-only",
    healthRequirements: ["all-systems-nominal"],
    permitRequirements: [],
    lifecycleRules: ["global-scope-only"],
    mustInclude: [
      "mission wall",
      "city telemetry",
      "organization graph",
      "AI monitoring",
      "municipal command tables"
    ],
    neverInclude: ["reception desk", "waiting lounge", "ReceptionShell"]
  }),
  marketplace: charter("marketplace", {
    mission: "Commerce district for industry packs, mods, and licensing.",
    responsibilities: ["commerce", "listings", "licensing displays"],
    nonResponsibilities: ["canonical architecture invention"],
    userClasses: ["Founder", "creators"],
    coreWorkflows: ["browse", "purchase", "license"],
    requiredTools: ["Marketplace", "Mod Registry"],
    requiredCommandModules: ["commerce-context"],
    requiredWorkbenchModules: ["storefront-tools"],
    requiredPanels: ["featured-mods"],
    requiredSockets: ["COMMAND_DOCK", "WORKBENCH", "VIEWPORT"],
    handoffDestinations: ["certification-center"],
    upstreamDependencies: ["certification-center"],
    downstreamDependencies: [],
    visualIdentity: "commercial district with storefronts",
    atmosphere: "bustling commerce plaza",
    architecturalMetaphor: "marketplace district",
    availability: "founder-accessible",
    healthRequirements: ["certification-clear"],
    permitRequirements: [],
    lifecycleRules: ["marketplace-eligible"],
    mustInclude: ["storefronts", "licensing displays", "creator kiosks", "featured mods"],
    neverInclude: ["reception desk", "waiting lounge", "ReceptionShell"]
  }),
  "founder-suite": charter("founder-suite", {
    mission: "Executive headquarters and monumental gathering space.",
    responsibilities: ["founder executive access", "global founder tools"],
    nonResponsibilities: ["tenant HQ customization"],
    userClasses: ["Founder"],
    coreWorkflows: ["access", "present", "govern"],
    requiredTools: ["Founder Dashboard"],
    requiredCommandModules: ["founder-context"],
    requiredWorkbenchModules: ["founder-tools"],
    requiredPanels: ["executive-overview"],
    requiredSockets: ["COMMAND_DOCK", "WORKBENCH", "VIEWPORT"],
    handoffDestinations: ["founder-dashboard"],
    upstreamDependencies: [],
    downstreamDependencies: ["founder-dashboard"],
    visualIdentity: "monumental executive atrium",
    atmosphere: "premium executive headquarters",
    architecturalMetaphor: "executive atrium",
    availability: "founder-accessible",
    healthRequirements: ["founder-access"],
    permitRequirements: [],
    lifecycleRules: ["global-scope-only"],
    mustInclude: [
      "monumental central gathering space",
      "premium architecture",
      "executive circulation",
      "presentation areas"
    ],
    neverInclude: ["reception desk", "concierge desk", "waiting lounge"]
  })
};
function resolveDepartmentCharter(departmentId) {
  const existing = DEPARTMENT_CHARTERS[departmentId];
  if (existing) return existing;
  return charter(departmentId, {
    mission: `Operate canonical Studio World department: ${departmentId}.`,
    responsibilities: ["canonical infrastructure operation"],
    nonResponsibilities: ["tenant-specific ownership", "founder company branding"],
    userClasses: ["Admin Founder", "system workers"],
    coreWorkflows: ["generate", "approve", "publish"],
    requiredTools: ["Blueprint Author"],
    requiredCommandModules: ["department-context"],
    requiredWorkbenchModules: ["department-tools"],
    requiredPanels: ["department-panel"],
    requiredSockets: ["COMMAND_DOCK", "WORKBENCH", "VIEWPORT"],
    handoffDestinations: ["creative-director-studio"],
    upstreamDependencies: [],
    downstreamDependencies: ["creative-director-studio"],
    visualIdentity: "Studio World canonical department",
    atmosphere: "premium executive interior",
    architecturalMetaphor: "canonical department chamber",
    availability: "admin-only",
    healthRequirements: ["architecture-law-001-pass"],
    permitRequirements: [],
    lifecycleRules: ["no-organization-ownership"]
  });
}

// src/studio-os-core/architectural-dna/schemas/dna-profile.ts
var ARCHITECTURAL_DNA_VERSION = "architectural-dna.v1";

// src/studio-os-core/architectural-dna/references/negative-prompt-library.ts
var DEPARTMENT_NEGATIVE_PROMPTS = {
  "experience-lab": [
    "Reception desk",
    "Waiting room",
    "Reception seating",
    "Corporate lobby",
    "Reception landmark",
    "Retail checkout",
    "Concierge desk",
    "Receptionist furniture"
  ],
  "creative-director-studio": [
    "Reception",
    "Waiting room",
    "Blueprint holograms",
    "Medical furniture",
    "Restaurant furniture",
    "Reception desk",
    "Corporate lobby"
  ],
  marketplace: [
    "Conference room",
    "Reception",
    "Corporate office",
    "Executive boardroom",
    "Waiting lounge"
  ],
  "command-center": [
    "Reception desk",
    "Waiting lounge",
    "Retail storefront",
    "Restaurant"
  ],
  "founder-suite": [
    "Reception desk",
    "Concierge desk",
    "Waiting lounge",
    "Retail checkout"
  ]
};
var UNIVERSAL_FORBIDDEN = [
  "generic luxury room",
  "shared reception template",
  "wireframe",
  "blueprint diagram",
  "CAD view",
  "UI mockup",
  "isolated object cutout"
];
function resolveDepartmentNegativePrompts(departmentId) {
  const specific = DEPARTMENT_NEGATIVE_PROMPTS[departmentId] ?? [];
  return [.../* @__PURE__ */ new Set([...specific, ...RECEPTION_CONTAMINATION_MARKERS, ...UNIVERSAL_FORBIDDEN])];
}

// src/studio-os-core/architectural-dna/schemas/compiler-contract.ts
var FOUNDER_RENDER_PROMPT_COMPILER_VERSION = "founder-render-prompt-compiler.v1";

// src/studio-os-core/studio-world-style/style-bible/contract.ts
var STUDIO_WORLD_STYLE_BIBLE_VERSION = "studio-world-style-bible.v1";

// src/studio-os-core/studio-world-style/style-bible/registry.ts
var STUDIO_WORLD_STYLE_BIBLE = {
  authority: {
    bibleVersion: STUDIO_WORLD_STYLE_BIBLE_VERSION,
    bibleRevision: 1,
    authority: "highest-visual-authority",
    hierarchy: [
      "Studio World Constitution",
      "Studio World Style Bible",
      "Department Bible",
      "Department DNA",
      "Golden Reference Library",
      "Blueprint Author",
      "Construction Plan",
      "Founder Render",
      "Creative Director Studio",
      "Construction Mode",
      "Published Department"
    ]
  },
  worldLanguage: {
    typography: "React-injected only \u2014 AI renders blank acrylic title bars and panel headers",
    iconography: "placeholder icon sockets \u2014 React mounts icons after render",
    spacing: "8px base grid \u2014 4/8/12/16/24/32/48/64 scale",
    panelGeometry: "unified glass panel \u2014 12px radius, 1px border, elevation-2 shadow",
    glassTreatments: "premium architectural glass \u2014 subtle edge glow, controlled reflection",
    lightingPhilosophy: "bright white architectural primary + brand accent illumination",
    transitionLanguage: "ease-out-cubic 240ms standard \u2014 ease-in-out 360ms for modals",
    motionLanguage: "one operating system feel \u2014 panel reveals, dock expansion, approval animations",
    dockPlacement: "bottom-center integrated Command Dock \u2014 same proportions every department",
    workbenchPlacement: "right-rail integrated Workbench \u2014 architectural furniture, modular",
    navigationRhythm: "Top Navigation Rail + Bottom Command Dock + Workbench + Department Identifier",
    statusChips: "blank acrylic chip housings \u2014 React injects status text and color",
    informationHierarchy: "primary action \u2192 context \u2192 metadata \u2192 diagnostics",
    visualDensity: "executive luxury \u2014 breathable spacing, never cramped corporate UI",
    interactionLanguage: "spatial computing \u2014 furniture-first, UI overlays second",
    extensionRule: "departments may extend; never contradict"
  },
  typographyPlaceholders: {
    aiNeverRendersText: true,
    placeholderSurfaces: [
      "blank acrylic title bars",
      "blank panel headers",
      "blank chips",
      "blank menu rails",
      "blank tabs",
      "blank workbench labels",
      "blank command dock labels",
      "blank status zones",
      "blank navigation rails"
    ],
    reactInjects: ["fonts", "icons", "labels", "numbers", "translations", "status", "accessibility labels"],
    guarantees: [
      "perfect typography",
      "brand consistency",
      "localization",
      "accessibility",
      "future redesigns without re-render"
    ]
  },
  panelSystem: {
    geometry: "rounded-rect glass panel \u2014 consistent aspect-friendly proportions",
    cornerRadius: "12px",
    glassTreatment: "frosted architectural glass \u2014 24px blur, 8% white tint",
    elevationSystem: "elevation-0 floor \xB7 elevation-1 dock/workbench \xB7 elevation-2 panels \xB7 elevation-3 modals",
    shadowLanguage: "soft architectural shadow \u2014 0 8px 32px rgba(0,0,0,0.12)",
    borderTreatment: "1px rgba(255,255,255,0.18) inner glow border",
    blurSystem: "backdrop-blur 24px standard \xB7 40px for modals",
    paddingScale: ["4px", "8px", "12px", "16px", "24px", "32px"],
    contentRule: "different content only \u2014 geometry identical"
  },
  lightingPhilosophy: {
    primary: "bright white architectural light \u2014 4200-5000K executive illumination",
    accent: "brand-colored illumination \u2014 founder red accent slots via Company DNA",
    glass: "subtle edge glow on architectural glass and OLED bezels",
    reflection: "controlled \u2014 premium editorial, never mirror chaos",
    luxury: "premium cinematic \u2014 soft bounce, architectural shadows",
    forbidden: ["yellow offices", "flat corporate lighting", "random HDRI", "inconsistent brightness"]
  },
  materialPhilosophy: {
    universalDefaults: [
      "glass",
      "acrylic",
      "chrome",
      "premium stone",
      "founder-marble slots",
      "OLED",
      "transparent displays"
    ],
    brandInjectionRule: "Only Company DNA injects brand materials",
    forbidden: ["generic random marble", "unapproved material substitutes", "tenant-specific branding in canonical departments"]
  },
  motionLanguage: {
    panelReveals: "slide-up fade 240ms ease-out-cubic",
    cameraEasing: "cinematic ease-in-out 600ms for room transitions",
    dockExpansion: "vertical expand 280ms ease-out-cubic",
    workbenchExpansion: "horizontal slide 280ms ease-out-cubic",
    modalTransitions: "scale 0.96\u21921 + fade 360ms ease-in-out",
    approvalAnimations: "pulse glow 400ms on approve confirmation",
    generationProgress: "ambient shimmer on viewport bezel during NBP generation",
    loadingSequences: "skeleton glass panels \u2014 never spinner-only",
    notificationBehavior: "toast slide from status bar 240ms",
    operatingSystemFeel: "every department feels like one Studio World operating system"
  },
  navigationLanguage: {
    components: [
      "Top Navigation Rail\u2122",
      "Bottom Command Dock\u2122",
      "Workbench\u2122",
      "Department Identifier\u2122",
      "Breadcrumb\u2122",
      "World Location\u2122",
      "Founder Identity\u2122",
      "Department Status\u2122"
    ],
    rule: "only available actions change \u2014 architecture stays familiar"
  }
};
function buildStyleBiblePromptSection() {
  const bible = STUDIO_WORLD_STYLE_BIBLE;
  return [
    `STUDIO WORLD STYLE BIBLE\u2122: ${bible.authority.bibleVersion} r${bible.authority.bibleRevision}`,
    `WORLD LANGUAGE: ${bible.worldLanguage.glassTreatments}. ${bible.worldLanguage.lightingPhilosophy}. ${bible.worldLanguage.interactionLanguage}.`,
    `TYPOGRAPHY: AI NEVER renders text. Render ${bible.typographyPlaceholders.placeholderSurfaces.slice(0, 4).join(", ")} only. React injects all labels.`,
    `PANEL SYSTEM: ${bible.panelSystem.geometry}. Radius ${bible.panelSystem.cornerRadius}. ${bible.panelSystem.glassTreatment}.`,
    `LIGHTING PHILOSOPHY: Primary ${bible.lightingPhilosophy.primary}. Accent ${bible.lightingPhilosophy.accent}. Forbidden: ${bible.lightingPhilosophy.forbidden.join(", ")}.`,
    `MATERIAL PHILOSOPHY: ${bible.materialPhilosophy.universalDefaults.join(", ")}. ${bible.materialPhilosophy.brandInjectionRule}.`,
    `MOTION: ${bible.motionLanguage.operatingSystemFeel}.`,
    `NAVIGATION: ${bible.navigationLanguage.components.slice(0, 4).join(" \xB7 ")}.`
  ].join("\n");
}

// src/studio-os-core/architectural-dna/registry/dna-registry.ts
var STYLE_BIBLE_MATERIALS = STUDIO_WORLD_STYLE_BIBLE.materialPhilosophy.universalDefaults;
var DEFAULT_CAMERA = {
  desktopComposition: "21:9 hero composition \u2014 wide architectural lens, eye-height, signature framing",
  mobileComposition: "9:16 reframe \u2014 same room, same architecture, different crop only, no redesign",
  cinematicComposition: "16:9 cinematic interior \u2014 photoreal 4K editorial quality",
  framingRules: ["wide interior", "clear foreground midground background", "no extreme fisheye", "no dutch angle"],
  negativeCompositionRules: ["no regenerated room for mobile", "no architecture redesign for portrait", "no crop that hides hero object"],
  desktopAspectRatio: "21:9",
  mobileAspectRatio: "9:16"
};
var CANONICAL_MATERIALS = {
  floorMaterial: "founder-marble slot \u2014 white polished marble (Style Bible universal)",
  wallMaterial: `${STYLE_BIBLE_MATERIALS.filter((m) => ["glass", "acrylic", "OLED"].some((k) => m.includes(k))).join(", ")} display surfaces`,
  ceilingMaterial: "architectural lighting ceiling \u2014 Style Bible primary illumination",
  glassProfile: STUDIO_WORLD_STYLE_BIBLE.worldLanguage.glassTreatments,
  metalPalette: ["champagne brushed aluminum", "chrome", "brushed aluminum"],
  glassPalette: ["architectural glass", "OLED bezels", "acrylic surfaces", "transparent displays"],
  stonePalette: ["premium stone", "founder-marble"],
  woodPalette: ["minimal architectural wood accents"],
  colorPalette: ["white marble", "champagne", "chrome", "subtle brand accent illumination"]
};
var DNA_OVERRIDES = {
  "experience-lab": {
    profileRevision: 1,
    purpose: "Architectural visualization laboratory for canonical Studio World departments.",
    architecturalCharter: "Monumental architecture studio \u2014 holographic planning, never reception.",
    visualIdentity: "monumental futuristic architecture studio",
    signatureMood: "futuristic luxury \u2014 cinematic architecture visualization",
    architecturalStyle: "monumental architecture studio with holographic volumes",
    signatureGeometry: "floating holographic room blueprint, construction holograms, planning surfaces",
    spatialComposition: "central holographic room model, surrounding planning tables, integrated command dock and workbench",
    heroObject: "floating holographic room blueprint with construction holograms",
    materials: {
      ...CANONICAL_MATERIALS,
      metalPalette: ["champagne", "brushed aluminum", "chrome"],
      colorPalette: ["white marble", "bronze/champagne accents", "chrome", "holographic blue glow"]
    },
    lightingProfile: "ExperienceLabLighting \u2014 architectural study lighting, holographic accent glow",
    accentLighting: "holographic blue accent + champagne uplighting",
    signatureFurniture: [
      "architectural planning surfaces",
      "construction hologram tables",
      "material study stations",
      "integrated blank command dock",
      "integrated blank workbench"
    ],
    signatureTechnology: ["holographic room model", "floating blueprint volumes", "lighting study rigs"],
    environmentFX: ["holographic projections", "subtle particle glow", "architectural light rays"],
    atmosphere: "bright futuristic architecture atelier with premium glass and bronze accents",
    motionLanguage: "slow cinematic drift \u2014 holographic elements subtly animated",
    positivePromptTemplate: "monumental architecture studio with holographic room model and floating blueprint volumes",
    forbiddenElements: [
      "reception desk",
      "waiting room",
      "receptionist furniture",
      "corporate lobby",
      "ReceptionShell"
    ]
  },
  "creative-director-studio": {
    profileRevision: 1,
    purpose: "Asset manufacturing facility on approved architecture.",
    architecturalCharter: "Luxury production facility \u2014 isolated stages, never reception.",
    visualIdentity: "luxury production facility with dark premium environment",
    signatureMood: "luxury dark environment with premium showcase lighting",
    architecturalStyle: "asset manufacturing production studio",
    signatureGeometry: "isolated production stages, material testing bays, version wall",
    spatialComposition: "production stages along perimeter, central material testing, reference wall backdrop",
    heroObject: "isolated production stage with asset version wall",
    materials: {
      floorMaterial: "dark stone \u2014 luxury production floor",
      wallMaterial: "black architectural glass, dark brushed metal panels",
      ceilingMaterial: "luxury production lighting grid",
      glassProfile: "black architectural glass with showcase reflections",
      metalPalette: ["dark brushed metal", "matte black steel", "chrome accents"],
      glassPalette: ["black architectural glass", "showcase glass panels"],
      stonePalette: ["dark stone", "charcoal polished stone"],
      woodPalette: ["dark production wood accents"],
      colorPalette: ["dark stone", "black glass", "premium showcase lighting", "subtle warm accents"]
    },
    lightingProfile: "CdsProductionLighting \u2014 luxury showcase rigs, material testing spots",
    accentLighting: "premium showcase spotlights on production stages",
    signatureFurniture: [
      "production workbench",
      "material testing stations",
      "lighting rigs",
      "camera rigs",
      "asset version wall",
      "integrated blank command dock",
      "integrated blank workbench"
    ],
    signatureTechnology: ["lighting rigs", "camera rigs", "asset turntable", "version tracking displays"],
    environmentFX: ["showcase spotlight beams", "subtle production haze"],
    atmosphere: "luxury dark production atelier with premium showcase lighting",
    motionLanguage: "subtle spotlight sweep \u2014 production-ready stillness",
    positivePromptTemplate: "luxury asset manufacturing studio with isolated production stages and material testing",
    forbiddenElements: [
      "Reception",
      "waiting room",
      "blueprint holograms",
      "medical furniture",
      "restaurant furniture",
      "ReceptionShell"
    ]
  },
  "command-center": {
    profileRevision: 1,
    visualIdentity: "executive command bridge with mission wall",
    signatureMood: "spaceship command bridge \u2014 operational intensity",
    architecturalStyle: "operations command center",
    heroObject: "mission wall with city telemetry displays",
    positivePromptTemplate: "operations command bridge with mission wall and municipal command tables",
    forbiddenElements: ["reception desk", "waiting lounge", "retail storefront"]
  },
  marketplace: {
    profileRevision: 1,
    visualIdentity: "commercial district with storefronts and creator kiosks",
    signatureMood: "bustling commerce plaza",
    architecturalStyle: "marketplace commercial district",
    heroObject: "featured mod storefront with licensing displays",
    positivePromptTemplate: "commercial marketplace district with storefronts and creator kiosks",
    forbiddenElements: ["conference room", "reception", "corporate office", "executive boardroom"]
  },
  "founder-suite": {
    profileRevision: 1,
    visualIdentity: "monumental executive atrium",
    signatureMood: "premium executive headquarters",
    architecturalStyle: "executive atrium gathering space",
    heroObject: "monumental central gathering space with presentation areas",
    positivePromptTemplate: "monumental executive atrium with premium architecture and presentation areas",
    forbiddenElements: ["reception desk", "concierge desk", "waiting lounge"]
  }
};
function buildDnaProfile(departmentId) {
  const record2 = getCanonicalDepartmentRecord(departmentId);
  const charter2 = resolveDepartmentCharter(departmentId);
  const fingerprint2 = resolveDepartmentFingerprint(departmentId);
  const override = DNA_OVERRIDES[departmentId] ?? {};
  const forbidden = override.forbiddenElements ?? resolveDepartmentNegativePrompts(departmentId);
  return {
    dnaVersion: ARCHITECTURAL_DNA_VERSION,
    profileRevision: override.profileRevision ?? 1,
    departmentId,
    departmentName: record2.name,
    purpose: override.purpose ?? charter2.mission,
    architecturalCharter: override.architecturalCharter ?? charter2.mission,
    visualIdentity: override.visualIdentity ?? charter2.visualIdentity,
    signatureMood: override.signatureMood ?? charter2.atmosphere,
    architecturalStyle: override.architecturalStyle ?? charter2.architecturalMetaphor,
    signatureGeometry: override.signatureGeometry ?? fingerprint2.signatureElements.slice(0, 3).join(", "),
    spatialComposition: override.spatialComposition ?? `department-specific layout for ${record2.name}`,
    heroObject: override.heroObject ?? fingerprint2.signatureElements[0] ?? "department hero object",
    materials: override.materials ?? CANONICAL_MATERIALS,
    lightingProfile: override.lightingProfile ?? `${fingerprint2.shellId}Lighting`,
    accentLighting: override.accentLighting ?? "architectural accent lighting",
    cameraLanguage: override.cameraLanguage ?? DEFAULT_CAMERA,
    signatureFurniture: override.signatureFurniture ?? fingerprint2.signatureElements,
    signatureTechnology: override.signatureTechnology ?? ["integrated blank command dock", "integrated blank workbench"],
    environmentFX: override.environmentFX ?? ["architectural ambient lighting"],
    atmosphere: override.atmosphere ?? charter2.atmosphere,
    motionLanguage: override.motionLanguage ?? "cinematic stillness",
    futureExpansionRules: override.futureExpansionRules ?? ["additive socket expansion only", "no architecture redesign"],
    layoutRules: override.layoutRules ?? {
      commandDockLayout: `${record2.commandDockProfile} \u2014 physical shell, blank displays`,
      workbenchLayout: `${record2.workbenchProfile} \u2014 physical console, blank tool housings`,
      socketRules: ["COMMAND_DOCK", "WORKBENCH", "VIEWPORT"],
      assetRules: ["socket-placement-only", "approved-materials-only"],
      brandInjectionZones: ["floor-material", "accent-lighting", "hero-object-brand-mount"],
      placeholderZones: ["command-dock-displays", "workbench-tool-slots", "viewport-stage"]
    },
    referencePackId: `golden-ref-${departmentId}-v1`,
    positivePromptTemplate: override.positivePromptTemplate ?? `canonical ${record2.name} environment \u2014 ${charter2.visualIdentity}`,
    negativePromptTemplate: forbidden.join(", "),
    qualityTargets: override.qualityTargets ?? [
      "4K photoreal",
      "luxury editorial interior photography",
      "Architecture Law #001 compliant",
      "department-identity-distinct"
    ],
    forbiddenElements: forbidden,
    promptCompilerVersion: FOUNDER_RENDER_PROMPT_COMPILER_VERSION
  };
}
var ARCHITECTURAL_DNA_REGISTRY = Object.fromEntries(
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((r) => [r.departmentId, buildDnaProfile(r.departmentId)])
);
function resolveArchitecturalDna(departmentId) {
  return ARCHITECTURAL_DNA_REGISTRY[departmentId];
}

// src/studio-os-core/architectural-dna/schemas/company-dna.ts
var COMPANY_DNA_VERSION = "company-dna.v1";

// src/studio-os-core/architectural-dna/registry/company-dna-registry.ts
var KNOWN_COMPANY_PROFILES = {
  "frontal-slayer": {
    organizationId: "frontal-slayer",
    organizationName: "Frontal Slayer",
    logoAssetPath: "/assets/brand/frontal-slayer-logo.png",
    brandMarble: "founder-marble \u2014 white polished marble with subtle veining",
    accentColor: "founder-red-illumination \u2014 signature red accent lighting",
    secondaryAccents: ["founder-chrome", "founder-crystal"],
    materialOverrides: ["founder-marble", "founder-chrome", "founder-crystal", "founder-glass", "founder-red-illumination"],
    brandInjectionPrompt: "COMPANY BRAND LAYER \u2014 Frontal Slayer: apply founder marble floors, chrome and crystal accents, signature red illumination. Brand materials only \u2014 no generic substitutes.",
    forbiddenBrandSubstitutions: ["Carrara substitute", "Calacatta substitute", "generic random marble"],
    historyContext: "Frontal Slayer founder brand \u2014 executive luxury creative infrastructure",
    futureAssetSlots: ["brand-logo-mount", "brand-history-wall", "brand-accent-lighting"]
  },
  "studio-os": {
    organizationId: "studio-os",
    organizationName: "Studio World",
    logoAssetPath: null,
    brandMarble: "founder-marble \u2014 canonical Studio World marble grounding via frontal-slayer vault",
    accentColor: "founder-red-illumination",
    secondaryAccents: ["founder-chrome", "founder-white-acrylic"],
    materialOverrides: ["founder-marble", "founder-chrome", "founder-crystal", "founder-glass", "founder-red-illumination", "founder-white-acrylic"],
    brandInjectionPrompt: "COMPANY BRAND LAYER \u2014 Studio World canonical: neutral executive infrastructure with founder marble grounding. Architecture Law #001 compliant.",
    forbiddenBrandSubstitutions: ["generic random marble", "tenant-specific branding"],
    historyContext: "Studio World global canonical infrastructure \u2014 not tenant-owned",
    futureAssetSlots: ["canonical-brand-mount"]
  }
};
function resolveCompanyDna(organizationId, organizationName) {
  const known = KNOWN_COMPANY_PROFILES[organizationId];
  if (known) {
    return { companyDnaVersion: COMPANY_DNA_VERSION, ...known };
  }
  return {
    companyDnaVersion: COMPANY_DNA_VERSION,
    organizationId,
    organizationName: organizationName ?? organizationId,
    logoAssetPath: null,
    brandMarble: "approved organization materials",
    accentColor: "organization accent",
    secondaryAccents: [],
    materialOverrides: [],
    brandInjectionPrompt: `COMPANY BRAND LAYER \u2014 ${organizationName ?? organizationId}: apply approved brand materials only.`,
    forbiddenBrandSubstitutions: ["generic substitutes", "unapproved materials"],
    historyContext: null,
    futureAssetSlots: []
  };
}

// src/studio-os-core/architectural-dna/references/golden-reference-library.ts
function board(departmentId, boardType, revision = 1) {
  const base = `/assets/studio-os/golden-references/${departmentId}`;
  return {
    boardId: `${departmentId}-${boardType}-v${revision}`,
    label: boardType.replace(/-/g, " "),
    assetPath: `${base}/${boardType}.v${revision}.webp`,
    revision
  };
}
function buildPack(departmentId, note) {
  const packId = `golden-ref-${departmentId}-v1`;
  return {
    packVersion: "golden-reference-pack.v1",
    packRevision: 1,
    packId,
    departmentId,
    heroRender: board(departmentId, "hero-render"),
    materialBoard: board(departmentId, "material-board"),
    lightingBoard: board(departmentId, "lighting-board"),
    cameraBoard: board(departmentId, "camera-board"),
    compositionBoard: board(departmentId, "composition-board"),
    geometryBoard: board(departmentId, "geometry-board"),
    environmentBoard: board(departmentId, "environment-board"),
    moodBoard: board(departmentId, "mood-board"),
    desktopReference: board(departmentId, "desktop-21x9"),
    mobileReference: board(departmentId, "mobile-9x16"),
    signatureDetails: [board(departmentId, "signature-detail-a"), board(departmentId, "signature-detail-b")],
    futureExpansionExamples: [board(departmentId, "expansion-example")],
    versionHistory: [{ revision: 1, note, date: "2026-07-13T00:00:00.000Z" }]
  };
}
var GOLDEN_REFERENCE_NOTES = {
  "experience-lab": "v1 \u2014 monumental architecture studio, holographic room model, floating blueprint volumes, bronze/champagne accents, approved design exploration",
  "creative-director-studio": "v1 \u2014 luxury production facility, isolated production stages, material testing, lighting rigs, dark luxury environment, approved design exploration",
  "command-center": "v1 \u2014 mission wall, city telemetry, operations bridge",
  marketplace: "v1 \u2014 storefronts, licensing displays, creator kiosks",
  "founder-suite": "v1 \u2014 monumental executive atrium, premium architecture",
  observatory: "v1 \u2014 experience intelligence wall, telemetry panoramas",
  "city-council": "v1 \u2014 council chamber dais, municipal governance",
  "asset-registry": "v1 \u2014 asset vault displays, registry catalog wall"
};
var GOLDEN_REFERENCE_LIBRARY = Object.fromEntries(
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((record2) => [
    record2.departmentId,
    buildPack(
      record2.departmentId,
      GOLDEN_REFERENCE_NOTES[record2.departmentId] ?? `v1 \u2014 canonical golden reference for ${record2.name}`
    )
  ])
);
function resolveGoldenReferencePack(departmentId) {
  return GOLDEN_REFERENCE_LIBRARY[departmentId];
}
function listGoldenReferenceAssetPaths(departmentId) {
  const pack = resolveGoldenReferencePack(departmentId);
  return [
    pack.heroRender.assetPath,
    pack.materialBoard.assetPath,
    pack.lightingBoard.assetPath,
    pack.cameraBoard.assetPath,
    pack.compositionBoard.assetPath,
    pack.geometryBoard.assetPath,
    pack.environmentBoard.assetPath,
    pack.moodBoard.assetPath,
    pack.desktopReference.assetPath,
    pack.mobileReference.assetPath,
    ...pack.signatureDetails.map((b) => b.assetPath)
  ];
}

// src/studio-os-core/studio-world-style/command-dock/command-dock-system.ts
var COMMAND_DOCK_SYSTEM_VERSION = "universal-command-dock.v1";
var UNIVERSAL_COMMAND_DOCK = {
  systemVersion: COMMAND_DOCK_SYSTEM_VERSION,
  objectId: "StudioWorldCommandDock",
  integration: "integrated into environment \u2014 physically belongs to room",
  material: "acrylic/glass \u2014 premium lighting \u2014 placeholder icon sockets only",
  proportions: {
    desktop: { width: "72%", height: "8%", bottomOffset: "4%" },
    tablet: { width: "85%", height: "9%", bottomOffset: "3%" },
    mobile: { width: "92%", height: "10%", bottomOffset: "2%" }
  },
  rules: [
    "integrated into environment",
    "physically belongs to room",
    "AI-generated without text",
    "placeholder icon sockets only",
    "acrylic/glass premium lighting",
    "same proportions everywhere",
    "desktop, tablet, mobile variants",
    "UI overlays typography later",
    "no baked AI text"
  ],
  forbidden: ["floating HUD dock", "detached UI bar", "generated text labels", "fake readable UI"],
  toolOverlayRule: "only tools change \u2014 architecture never changes"
};
function buildCommandDockPromptSection(variant = "desktop") {
  const dock = UNIVERSAL_COMMAND_DOCK;
  const props = dock.proportions[variant];
  return [
    `UNIVERSAL COMMAND DOCK\u2122: ${dock.systemVersion}`,
    `Integration: ${dock.integration}`,
    `Material: ${dock.material}`,
    `Proportions (${variant}): width ${props.width}, height ${props.height}, bottom ${props.bottomOffset}`,
    `Rules: ${dock.rules.join(" \xB7 ")}`,
    `Forbidden: ${dock.forbidden.join(", ")}`
  ].join("\n");
}

// src/studio-os-core/studio-world-style/workbench/workbench-system.ts
var WORKBENCH_SYSTEM_VERSION = "universal-workbench.v1";
var UNIVERSAL_WORKBENCH = {
  systemVersion: WORKBENCH_SYSTEM_VERSION,
  objectId: "StudioWorldWorkbench",
  integration: "architectural furniture \u2014 built into environment \u2014 physically believable",
  material: "modular glass console \u2014 placeholder panel slots \u2014 no generated words",
  proportions: {
    desktop: { width: "22%", height: "65%", rightOffset: "3%" },
    tablet: { width: "28%", height: "60%", rightOffset: "2%" },
    mobile: { width: "100%", height: "35%", bottomOffset: "12%" }
  },
  rules: [
    "architectural furniture",
    "built into environment",
    "physically believable",
    "modular reusable",
    "AI renders geometry only",
    "placeholders for panels icons labels",
    "no generated words",
    "no fake UI"
  ],
  forbidden: ["floating tool palette", "detached sidebar", "AI-rendered text", "fake readable menus"],
  toolProfiles: {
    "architectural-tools": "Experience Lab \u2014 Blueprint Author \u2014 architectural planning tools overlay",
    "asset-tools": "Creative Director Studio \u2014 asset manufacturing tools overlay",
    "commercial-tools": "Marketplace \u2014 commerce and licensing tools overlay",
    "operations-tools": "Command Center \u2014 operations and workforce tools overlay",
    "governance-tools": "City Council \u2014 municipal governance tools overlay"
  },
  overlayRule: "same furniture language \u2014 different React overlays"
};
function buildWorkbenchPromptSection(profile = "architectural-tools") {
  const bench = UNIVERSAL_WORKBENCH;
  return [
    `UNIVERSAL WORKBENCH\u2122: ${bench.systemVersion}`,
    `Integration: ${bench.integration}`,
    `Material: ${bench.material}`,
    `Tool overlay profile: ${bench.toolProfiles[profile]}`,
    `Rules: ${bench.rules.join(" \xB7 ")}`,
    `Forbidden: ${bench.forbidden.join(", ")}`
  ].join("\n");
}
function mapDepartmentToWorkbenchProfile(departmentId) {
  if (departmentId === "experience-lab" || departmentId === "blueprint-author" || departmentId === "world-compiler") {
    return "architectural-tools";
  }
  if (departmentId === "creative-director-studio" || departmentId.includes("studio") || departmentId === "material-lab") {
    return "asset-tools";
  }
  if (departmentId === "marketplace" || departmentId === "mod-registry" || departmentId === "certification-center") {
    return "commercial-tools";
  }
  if (departmentId === "city-council" || departmentId === "permit-center" || departmentId === "quality-guard") {
    return "governance-tools";
  }
  return "operations-tools";
}

// src/studio-os-core/studio-world-style/design-tokens/export.ts
var DESIGN_TOKEN_EXPORT_VERSION = "studio-world-design-tokens.v1";
var STUDIO_WORLD_DESIGN_TOKENS = {
  tokenVersion: DESIGN_TOKEN_EXPORT_VERSION,
  spacing: {
    "space-1": "4px",
    "space-2": "8px",
    "space-3": "12px",
    "space-4": "16px",
    "space-6": "24px",
    "space-8": "32px",
    "space-12": "48px",
    "space-16": "64px"
  },
  radius: {
    "radius-panel": STUDIO_WORLD_STYLE_BIBLE.panelSystem.cornerRadius,
    "radius-chip": "8px",
    "radius-dock": "16px",
    "radius-workbench": "12px",
    "radius-modal": "16px"
  },
  blur: {
    "blur-panel": "24px",
    "blur-modal": "40px",
    "blur-dock": "16px"
  },
  glass: {
    "glass-panel": STUDIO_WORLD_STYLE_BIBLE.panelSystem.glassTreatment,
    "glass-dock": "acrylic command dock \u2014 illuminated edge glow",
    "glass-workbench": "frosted workbench console glass",
    "glass-border": STUDIO_WORLD_STYLE_BIBLE.panelSystem.borderTreatment
  },
  materials: {
    "material-glass": "architectural glass",
    "material-acrylic": "premium acrylic",
    "material-chrome": "chrome",
    "material-stone": "premium stone",
    "material-marble-slot": "founder-marble slot",
    "material-oled": "OLED transparent display"
  },
  lighting: {
    "light-primary": STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.primary,
    "light-accent": STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.accent,
    "light-glass-edge": STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.glass,
    "light-luxury": STUDIO_WORLD_STYLE_BIBLE.lightingPhilosophy.luxury
  },
  colors: {
    "color-marble": "#f8f6f3",
    "color-chrome": "#c0c0c0",
    "color-champagne": "#d4af37",
    "color-accent-red": "#eb1c24",
    "color-glass-tint": "rgba(255,255,255,0.08)",
    "color-shadow": "rgba(0,0,0,0.12)"
  },
  iconSizing: {
    "icon-sm": "16px",
    "icon-md": "20px",
    "icon-lg": "24px",
    "icon-dock": "28px",
    "icon-workbench": "20px"
  },
  animation: {
    "duration-fast": "240ms",
    "duration-standard": "280ms",
    "duration-modal": "360ms",
    "duration-camera": "600ms",
    "easing-standard": "ease-out-cubic",
    "easing-modal": "ease-in-out"
  },
  elevation: {
    "elevation-0": "floor level",
    "elevation-1": STUDIO_WORLD_STYLE_BIBLE.panelSystem.elevationSystem.split("\xB7")[1]?.trim() ?? "dock/workbench",
    "elevation-2": "panels",
    "elevation-3": "modals",
    "shadow-standard": STUDIO_WORLD_STYLE_BIBLE.panelSystem.shadowLanguage
  },
  border: {
    "border-standard": STUDIO_WORLD_STYLE_BIBLE.panelSystem.borderTreatment,
    "border-width": "1px"
  }
};
function buildDesignTokenPromptSection() {
  const t = STUDIO_WORLD_DESIGN_TOKENS;
  return `DESIGN TOKENS: spacing ${Object.keys(t.spacing).length} scales \xB7 radius ${t.radius["radius-panel"]} \xB7 blur ${t.blur["blur-panel"]} \xB7 glass ${t.glass["glass-panel"]}`;
}

// src/studio-os-core/studio-world-style/validators/world-cohesion-validator.ts
function violation(field, message) {
  return { code: "WORLD_STYLE_VIOLATION", field, message };
}
function validateWorldCohesion(input) {
  const violations = [];
  const bible = STUDIO_WORLD_STYLE_BIBLE;
  const hasCommandDock = input.plan.heroAssets.some(
    (a) => a.assetClass === "command-dock-shell" || a.socketId === "CommandDockSocket"
  ) || input.plan.furnitureSet.assets.some((a) => a.assetClass === "command-dock-shell");
  const hasWorkbench = input.plan.furnitureSet.assets.some(
    (a) => a.assetClass === "workbench-shell" || a.socketId === "WorkbenchSocket"
  );
  if (!hasCommandDock) {
    violations.push(violation("commandDock", "Department plan missing Universal Command Dock\u2122"));
  }
  if (!hasWorkbench) {
    violations.push(violation("workbench", "Department plan missing Universal Workbench\u2122"));
  }
  if (input.effectivePrompt) {
    const instructionSections = input.effectivePrompt.split(/\n\n/).filter(
      (s) => s.startsWith("STUDIO WORLD STYLE BIBLE") || s.startsWith("UNIVERSAL COMMAND DOCK") || s.startsWith("UNIVERSAL WORKBENCH") || s.startsWith("DESIGN TOKENS") || s.startsWith("TYPOGRAPHY:") || s.startsWith("Forbidden:")
    );
    const generativeSections = input.effectivePrompt.split(/\n\n/).filter((s) => !instructionSections.some((i) => s.startsWith(i.split(":")[0] ?? ""))).join("\n\n");
    const lower = generativeSections.toLowerCase();
    for (const forbidden of bible.lightingPhilosophy.forbidden) {
      if (lower.includes(forbidden.toLowerCase())) {
        violations.push(violation("lighting", `Prompt references forbidden lighting: ${forbidden}`));
      }
    }
    if (/\b(render|generate|show|display)\s+(readable\s+)?text\b/i.test(generativeSections) || /\b(render|generate)\s+(menu|button)\s+labels?\b/i.test(generativeSections)) {
      violations.push(violation("typography", "Prompt requests AI-rendered typography \u2014 violates Style Bible"));
    }
  }
  if (input.dna) {
    for (const forbidden of bible.materialPhilosophy.forbidden) {
      const matStr = JSON.stringify(input.dna.materials).toLowerCase();
      if (matStr.includes(forbidden.toLowerCase())) {
        violations.push(violation("materials", `DNA contains forbidden material: ${forbidden}`));
      }
    }
  }
  if (!input.plan.uiMountSockets?.sockets?.some((s) => s.socketId === "COMMAND_DOCK")) {
    violations.push(violation("navigation", "Plan missing COMMAND_DOCK UI mount socket"));
  }
  if (!input.plan.uiMountSockets?.sockets?.some((s) => s.socketId === "WORKBENCH")) {
    violations.push(violation("navigation", "Plan missing WORKBENCH UI mount socket"));
  }
  if (violations.length > 0) {
    return { ok: false, code: "WORLD_STYLE_VIOLATION", violations };
  }
  return {
    ok: true,
    bibleVersion: bible.authority.bibleVersion,
    bibleRevision: bible.authority.bibleRevision
  };
}

// src/studio-os-core/architectural-dna/compiler/founder-render-prompt-compiler.ts
function hashText(text) {
  return createHash2("sha256").update(text).digest("hex").slice(0, 16);
}
function describePlanAssets(plan) {
  const heroes = plan.heroAssets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  const furniture = plan.furnitureSet.assets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  return [
    heroes.length ? `Hero placement: ${heroes.join("; ")}` : "",
    furniture.length ? `Furniture: ${furniture.join("; ")}` : ""
  ].filter(Boolean).join(". ");
}
function compileFounderRenderPrompt(request) {
  const { departmentId, plan, brandPackage, companyDna, renderKind } = request;
  const record2 = getCanonicalDepartmentRecord(departmentId);
  if (!record2) throw new Error(`Unknown department: ${departmentId}`);
  const dna = resolveArchitecturalDna(departmentId);
  const goldenPack = resolveGoldenReferencePack(departmentId);
  const fingerprint2 = resolveDepartmentFingerprint(departmentId);
  const isPortrait = renderKind === "portrait";
  const cameraSection = isPortrait ? `MOBILE COMPOSITION: ${dna.cameraLanguage.mobileComposition}. Aspect ${dna.cameraLanguage.mobileAspectRatio}. Same architecture as desktop \u2014 reframe only.` : `DESKTOP COMPOSITION: ${dna.cameraLanguage.desktopComposition}. Aspect ${dna.cameraLanguage.desktopAspectRatio}.`;
  const goldenRefPaths = listGoldenReferenceAssetPaths(departmentId);
  const workbenchProfile = mapDepartmentToWorkbenchProfile(departmentId);
  const sections = [
    buildStyleBiblePromptSection(),
    buildCommandDockPromptSection(isPortrait ? "mobile" : "desktop"),
    buildWorkbenchPromptSection(workbenchProfile),
    buildDesignTokenPromptSection(),
    `COMPILED FOUNDER RENDER \u2014 ${dna.departmentName}`,
    `DEPARTMENT DNA: ${dna.dnaVersion} r${dna.profileRevision}`,
    `GOLDEN REFERENCE PACK: ${goldenPack.packId} r${goldenPack.packRevision}`,
    `PROMPT COMPILER: ${FOUNDER_RENDER_PROMPT_COMPILER_VERSION}`,
    `DEPARTMENT ID: ${departmentId}`,
    `PROMPT VERSION: ${record2.departmentPromptVersion}`,
    `ARCHITECTURAL CHARTER: ${dna.architecturalCharter}`,
    `PURPOSE: ${dna.purpose}`,
    `VISUAL IDENTITY: ${dna.visualIdentity}`,
    `SIGNATURE MOOD: ${dna.signatureMood}`,
    `ARCHITECTURAL STYLE: ${dna.architecturalStyle}`,
    `SIGNATURE GEOMETRY: ${dna.signatureGeometry}`,
    `SPATIAL COMPOSITION: ${dna.spatialComposition}`,
    `HERO OBJECT: ${dna.heroObject}`,
    `ATMOSPHERE: ${dna.atmosphere}`,
    `ENVIRONMENT FX: ${dna.environmentFX.join(" \xB7 ")}`,
    `MUST INCLUDE: ${dna.signatureFurniture.join(" \xB7 ")} \xB7 ${dna.signatureTechnology.join(" \xB7 ")}`,
    `DNA POSITIVE TEMPLATE: ${dna.positivePromptTemplate}`,
    `BLUEPRINT: ${plan.architecture.architectureId} v${plan.architecture.version} \xB7 Shell ${plan.architecture.shellSpecId}`,
    `CONSTRUCTION PLAN: ${plan.planId} r${plan.metadata.revision}`,
    `ASSET PLACEMENT: ${describePlanAssets(plan)}`,
    `MATERIAL LANGUAGE \u2014 Floors: ${dna.materials.floorMaterial}. Walls: ${dna.materials.wallMaterial}. Ceiling: ${dna.materials.ceilingMaterial}. Metals: ${dna.materials.metalPalette.join(", ")}. Glass: ${dna.materials.glassPalette.join(", ")}.`,
    `LIGHTING: ${dna.lightingProfile} \u2014 ${dna.accentLighting}. Plan profile: ${plan.lightingProfile.profileId} ${plan.lightingProfile.colorTemperatureK}K.`,
    cameraSection,
    `FRAMING RULES: ${dna.cameraLanguage.framingRules.join(" \xB7 ")}`,
    `GOLDEN REFERENCES: Hero ${goldenPack.heroRender.assetPath} \xB7 Material ${goldenPack.materialBoard.assetPath} \xB7 Mood ${goldenPack.moodBoard.assetPath}`,
    `REFERENCE BOARDS: ${goldenRefPaths.slice(0, 4).join(", ")}`,
    companyDna.brandInjectionPrompt,
    `BRAND MATERIALS: ${brandPackage.promptSections.organizationMaterialAssignments}`,
    `COMMAND DOCK: ${dna.layoutRules.commandDockLayout}`,
    `WORKBENCH: ${dna.layoutRules.workbenchLayout}`,
    `QUALITY TARGETS: ${dna.qualityTargets.join(" \xB7 ")}`,
    request.founderRevisionNote ? `FOUNDER REVISION: ${request.founderRevisionNote}` : "",
    `OUTPUT: ${record2.departmentPromptVersion} \xB7 ${isPortrait ? "9:16 portrait reframe" : "21:9 desktop hero"} \xB7 department-compiled \xB7 DNA-isolated.`
  ].filter(Boolean);
  const prompt = appendArchitectureLawToEnvironmentPrompt(sections.join("\n\n"));
  const negativeItems = [
    dna.negativePromptTemplate,
    ...resolveDepartmentNegativePrompts(departmentId),
    ...dna.cameraLanguage.negativeCompositionRules,
    ...companyDna.forbiddenBrandSubstitutions,
    brandPackage.promptSections.forbiddenMaterialSubstitutions
  ].filter(Boolean);
  const negativePrompt = appendArchitectureLawToNegativePrompt([...new Set(negativeItems)].join(", "));
  const cohesion = validateWorldCohesion({ plan, dna, effectivePrompt: prompt });
  if (!cohesion.ok) {
    const first = cohesion.violations[0];
    throw new Error(`WORLD_STYLE_VIOLATION: ${first?.message ?? "Style Bible cohesion failed"}`);
  }
  const promptHash = hashText(prompt);
  const negativePromptHash = hashText(negativePrompt);
  return {
    compilerVersion: FOUNDER_RENDER_PROMPT_COMPILER_VERSION,
    prompt,
    negativePrompt,
    promptVersion: record2.departmentPromptVersion,
    promptHash,
    negativePromptHash,
    departmentId,
    dnaProfile: dna,
    goldenReferencePack: goldenPack,
    companyDna,
    artifactIntent: isPortrait ? "master-founder-portrait" : "master-founder-landscape",
    architecturalFingerprint: fingerprint2.signatureElements,
    diagnostics: {
      departmentDnaVersion: dna.dnaVersion,
      departmentDnaRevision: dna.profileRevision,
      goldenReferenceVersion: goldenPack.packVersion,
      goldenReferenceRevision: goldenPack.packRevision,
      promptCompilerVersion: FOUNDER_RENDER_PROMPT_COMPILER_VERSION,
      blueprintVersion: plan.architecture.version,
      blueprintRevision: plan.metadata.revision,
      referencePackVersion: goldenPack.packId,
      cameraVersion: isPortrait ? dna.cameraLanguage.mobileAspectRatio : dna.cameraLanguage.desktopAspectRatio,
      lightingVersion: plan.lightingProfile.version,
      materialVersion: plan.materialSet.version,
      qualityVersion: dna.qualityTargets[0] ?? "4K photoreal",
      promptHash,
      negativePromptHash,
      companyDnaVersion: companyDna.companyDnaVersion,
      organizationId: companyDna.organizationId,
      renderKind,
      aspectRatio: isPortrait ? "9:16" : "21:9",
      styleBibleVersion: cohesion.bibleVersion,
      styleBibleRevision: cohesion.bibleRevision
    }
  };
}
function compileFromConstructionPlan(input) {
  const departmentId = input.plan.room.roomId;
  return compileFounderRenderPrompt({
    departmentId,
    plan: input.plan,
    brandPackage: input.brandPackage,
    companyDna: resolveCompanyDna(input.organizationId ?? input.plan.metadata.organizationId),
    renderKind: input.renderKind ?? "landscape",
    founderRevisionNote: input.founderRevisionNote
  });
}

// src/studio-os-core/canonical-studio-world/canonical-founder-render-prompt.ts
function buildCanonicalFounderRenderPrompt(input) {
  const compiled = compileFromConstructionPlan({
    plan: input.plan,
    brandPackage: input.brandPackage,
    founderRevisionNote: input.founderRevisionNote,
    renderKind: input.renderKind ?? "landscape",
    organizationId: input.plan.metadata.organizationId
  });
  return {
    prompt: compiled.prompt,
    negativePrompt: compiled.negativePrompt,
    promptVersion: compiled.promptVersion,
    promptHash: compiled.promptHash,
    departmentId: compiled.departmentId,
    artifactIntent: compiled.artifactIntent === "master-founder-portrait" ? "master-founder-landscape" : compiled.artifactIntent,
    architecturalFingerprint: compiled.architecturalFingerprint,
    negativePromptHash: compiled.negativePromptHash,
    compilerDiagnostics: compiled.diagnostics
  };
}

// src/studio-os-core/canonical-studio-world/department-blueprint-builder.ts
function isCanonicalDepartmentPlan(plan) {
  return plan.room.roomType === "canonical-department" || plan.metadata.organizationId === "studio-os";
}

// src/studio-os-core/canonical-studio-world/founder-render-cache-identity.ts
import { createHash as createHash3 } from "node:crypto";
var FOUNDER_RENDER_CACHE_IDENTITY_VERSION = "founder-render-cache-identity.v1";
function buildFounderRenderCacheIdentity(input) {
  const departmentId = input.plan.room.roomId;
  const parts = {
    organizationId: input.plan.metadata.organizationId,
    departmentId,
    departmentRevision: input.plan.metadata.revision,
    blueprintRevision: input.plan.metadata.revision,
    promptRevision: input.promptVersion,
    referenceRevision: input.referencePackageVersion ?? `ref-${input.plan.metadata.organizationId}-v1`,
    materialRevision: input.plan.materialSet.version,
    lightingRevision: input.plan.lightingProfile.version,
    cameraRevision: input.plan.cameraAnchors[0]?.anchorId ?? "default",
    model: input.model,
    aspectRatio: input.aspectRatio,
    provider: input.provider,
    architectureId: input.plan.architecture.architectureId,
    shellSpecId: input.plan.architecture.shellSpecId
  };
  const cacheKey = createHash3("sha256").update(
    [
      parts.organizationId,
      parts.departmentId,
      String(parts.departmentRevision),
      String(parts.blueprintRevision),
      parts.promptRevision,
      parts.referenceRevision,
      parts.materialRevision,
      parts.lightingRevision,
      parts.cameraRevision,
      parts.model,
      parts.aspectRatio,
      parts.provider,
      parts.architectureId,
      parts.shellSpecId
    ].join("|")
  ).digest("hex");
  return {
    identityVersion: FOUNDER_RENDER_CACHE_IDENTITY_VERSION,
    organizationId: parts.organizationId,
    departmentId: parts.departmentId,
    departmentRevision: parts.departmentRevision,
    blueprintRevision: parts.blueprintRevision,
    promptRevision: parts.promptRevision,
    referenceRevision: parts.referenceRevision,
    materialRevision: parts.materialRevision,
    lightingRevision: parts.lightingRevision,
    cameraRevision: parts.cameraRevision,
    model: parts.model,
    aspectRatio: parts.aspectRatio,
    provider: parts.provider,
    cacheKey
  };
}

// src/studio-os-core/canonical-studio-world/department-distinctness-validator.ts
var priorArchitectureByDepartment = /* @__PURE__ */ new Map();
var priorPromptHashByDepartment = /* @__PURE__ */ new Map();
function promptFingerprint(plan, effectivePrompt) {
  return `${plan.architecture.architectureId}:${plan.architecture.shellSpecId}:${effectivePrompt.slice(0, 200)}`;
}
function validateDepartmentDistinctness(input) {
  if (!isCanonicalDepartmentPlan(input.plan)) {
    return { ok: true, departmentId: input.plan.room.roomId, architectureId: input.plan.architecture.architectureId, promptFingerprint: "" };
  }
  const departmentId = input.plan.room.roomId;
  const architectureId = input.plan.architecture.architectureId;
  const fp = resolveDepartmentFingerprint(departmentId);
  if (architectureId === "ReceptionShell" || input.plan.architecture.shellSpecId.startsWith("shell-reception")) {
    return {
      ok: false,
      code: "RECEPTION_CONTAMINATION",
      message: `Department ${departmentId} must not use ReceptionShell architecture.`,
      marker: "ReceptionShell"
    };
  }
  const promptMarker = containsReceptionContamination(input.effectivePrompt);
  if (promptMarker) {
    return {
      ok: false,
      code: "RECEPTION_CONTAMINATION",
      message: `Effective prompt for ${departmentId} contains reception contamination: ${promptMarker}`,
      marker: promptMarker
    };
  }
  for (const asset of [...input.plan.heroAssets, ...input.plan.furnitureSet.assets]) {
    const assetMarker = RECEPTION_CONTAMINATION_MARKERS.find(
      (m) => asset.assetId.toLowerCase().includes(m.toLowerCase()) || asset.assetClass === "reception-desk"
    );
    if (assetMarker) {
      return {
        ok: false,
        code: "RECEPTION_CONTAMINATION",
        message: `Asset ${asset.assetId} in ${departmentId} is reception-contaminated.`,
        marker: assetMarker
      };
    }
  }
  if (architectureId !== fp.shellId) {
    return {
      ok: false,
      code: "SHARED_ARCHITECTURE",
      message: `Department ${departmentId} expected shell ${fp.shellId} but got ${architectureId}.`
    };
  }
  const fingerprint2 = promptFingerprint(input.plan, input.effectivePrompt);
  if (input.priorDepartmentId && input.priorDepartmentId !== departmentId) {
    const priorArch = priorArchitectureByDepartment.get(input.priorDepartmentId);
    const priorPrompt = priorPromptHashByDepartment.get(input.priorDepartmentId);
    if (priorArch === architectureId && priorPrompt === fingerprint2) {
      return {
        ok: false,
        code: "DEPARTMENT_NOT_DISTINCT",
        message: `${departmentId} shares identical architecture and prompt fingerprint with ${input.priorDepartmentId}.`
      };
    }
  }
  for (const [otherId, otherArch] of priorArchitectureByDepartment.entries()) {
    if (otherId === departmentId) continue;
    if (otherArch === architectureId) {
      const otherPrompt = priorPromptHashByDepartment.get(otherId);
      if (otherPrompt === fingerprint2) {
        return {
          ok: false,
          code: "DEPARTMENT_NOT_DISTINCT",
          message: `${departmentId} is architecturally identical to ${otherId}.`
        };
      }
    }
  }
  priorArchitectureByDepartment.set(departmentId, architectureId);
  priorPromptHashByDepartment.set(departmentId, fingerprint2);
  return { ok: true, departmentId, architectureId, promptFingerprint: fingerprint2 };
}
export {
  DEMO_AUTHORIZATION_ID,
  FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
  FOUNDER_RENDER_ARTIFACT_INTENT,
  FOUNDER_RENDER_ROUTE_ID,
  GENERATION_ROUTING_RECORD_VERSION,
  MODEL_ROUTING_ENGINE_VERSION,
  PROMPT_ROUTER_VERSION,
  SCENE_STACK_SHELL_FAL_MODEL,
  buildAuthorizationPayloadForSigning,
  buildCanonicalFounderRenderPrompt,
  buildFounderFullRoomPreviewPrompt,
  buildFounderRenderCacheIdentity,
  buildGenerationRoutingRecord,
  buildNanoBanana2FalInput,
  buildRegistryLineageMetadata,
  compileAssetIntent,
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  getAssetManufacturerDefaultModel,
  getBackgroundCleanupModel,
  getCanonicalDepartmentRecord,
  getWorldArchitectDefaultModel,
  hasCompleteValidationCompileContext,
  isCanonicalDepartmentPlan,
  lineageToRegistryRelationships,
  representGovernedGenerationRequest,
  resolveBrandMaterialPackage,
  resolveFounderRenderBrandOrganizationId,
  resolveFounderRenderModelRoute,
  resolveLayerIdFromProductionGroupId,
  resolveModelRoutingDecision,
  resolveModelRoutingFromLayerId,
  resolvePromptRouting,
  resolveSceneStackLayerModelRoute,
  runFounderRenderPreflight,
  validateAndResolveModelRouting,
  validateAuthorizationStructure,
  validateDepartmentDistinctness,
  validateModelRoutingDecision
};
