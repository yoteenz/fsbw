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

// src/studio-os-core/founder-render/model-route.ts
var FOUNDER_RENDER_ROUTE_ID = "nano-banana-pro-founder-full-room";
var FOUNDER_RENDER_MODEL = SCENE_STACK_SHELL_FAL_MODEL;
function resolveFounderRenderModelRoute(aspectRatio = "16:9") {
  return {
    routeId: FOUNDER_RENDER_ROUTE_ID,
    provider: "fal",
    providerModel: FOUNDER_RENDER_MODEL,
    generationMode: "image-to-image",
    aspectRatio,
    outputFormat: "png",
    outputResolution: "4K",
    referencePolicy: "brand-material-references-only",
    artifactIntent: "founder-full-room-preview"
  };
}

// src/studio-os-core/founder-render/prompt-builder.ts
import { createHash } from "node:crypto";
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
  const prompt = sections.join("\n\n");
  const negativePrompt = [
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
  ].join(", ");
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
    "isolated-object",
    "object-group",
    "transparent-overlay",
    "material-map",
    "campaign-composite",
    "logo-component",
    "full-logo",
    "packaging-composite",
    "campaign-model-replacement",
    "founder-full-room-preview"
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
function layerIdToAssetClass(layerId) {
  switch (layerId) {
    case "environment-shell":
      return "environment-shell";
    case "signature-landmark":
      return "signature-landmark";
    case "furniture-objects":
      return "furniture-objects";
    case "surface-materials":
      return "material-overlay";
    case "atmospheric-systems":
      return "atmosphere-overlay";
    case "ambient-motion":
      return "motion-overlay";
    case "lighting-systems":
      return "reflection-overlay";
    default:
      return "decorative-object";
  }
}
var PROMPT_BUILDER_BY_LAYER = {
  "environment-shell": "environment-shell-prompt.v1",
  "signature-landmark": "signature-landmark-isolated-prompt.v3",
  "furniture-objects": "furniture-objects-isolated-prompt.v3"
};
function resolveModelRoute(input) {
  const brandGrounding = input.brandGroundingRequired === true;
  let route = getPrimaryRouteForAssetClass(input.assetClass);
  if (brandGrounding && route.supportsBrandAssetGuidance && route.fallbackRouteIds.length > 0) {
    const editFallback = route.fallbackRouteIds.map((id) => getModelRouteById(id)).find((r) => r?.endpointId === NANO_BANANA_2_EDIT_ENDPOINT);
    if (editFallback) {
      route = editFallback;
    }
  }
  const textToImageOnly = route.generationMode === "text-to-image" && route.endpointId === NANO_BANANA_2_T2I_ENDPOINT;
  return {
    ...route,
    providerModel: route.endpointId,
    providerEndpoint: route.endpointId,
    textToImageOnly,
    promptBuilderId: PROMPT_BUILDER_BY_LAYER[input.assetClass] ?? "blend-overlay-prompt.v1",
    allowBackgroundExtraction: route.assetClass !== "environment-shell",
    requestedAlpha: route.alphaPolicy === "requested" || route.alphaPolicy === "post-cleanup",
    resolutionTruth: {
      requestedResolution: "4K",
      providerNativeResolution: NANO_BANANA_2_PRODUCTION_QUALITY,
      supportsNative4K: route.endpointId.startsWith("fal-ai/nano-banana-2"),
      thinkingLevel: route.endpointId.startsWith("fal-ai/nano-banana-2") ? NANO_BANANA_2_PRODUCTION_THINKING : void 0
    }
  };
}
function resolveSceneStackLayerModelRouteFromRegistry(layerId, options) {
  const contract = getIsolatedLayerContract(layerId);
  const generationMode = contract.generationMode;
  const assetClass = layerIdToAssetClass(layerId);
  const brandGrounding = options?.brandGroundingRequired === true;
  const resolved = resolveModelRoute({
    organizationId: options?.organizationId,
    assetClass,
    brandGroundingRequired: brandGrounding,
    isolationAttempt: options?.isolationAttempt ?? 0,
    surface: "scene-stack"
  });
  let referenceStrategy;
  if (layerId === "environment-shell") {
    referenceStrategy = "marble-genesis-anchor";
  } else if (resolved.referencePolicy === "brand-material-references-only") {
    referenceStrategy = brandGrounding ? "placement-metadata-only" : "placement-metadata-only";
  } else {
    referenceStrategy = "placement-metadata-only";
  }
  const promptBuilderId = layerId === "signature-landmark" ? "signature-landmark-isolated-prompt.v3" : layerId === "furniture-objects" ? "furniture-objects-isolated-prompt.v3" : layerId === "environment-shell" ? "environment-shell-prompt.v1" : "blend-overlay-prompt.v1";
  return {
    layerId,
    generationMode,
    provider: "fal",
    providerModel: layerId === "environment-shell" ? SCENE_STACK_SHELL_FAL_MODEL : resolved.providerModel,
    providerEndpoint: layerId === "environment-shell" ? SCENE_STACK_SHELL_FAL_MODEL : resolved.providerEndpoint,
    textToImageOnly: layerId === "environment-shell" ? false : resolved.textToImageOnly,
    referenceStrategy,
    requestedAlpha: contract.expectedAlpha,
    promptBuilderId,
    allowBackgroundExtraction: layerId !== "environment-shell",
    routeId: layerId === "environment-shell" ? "nano-banana-pro-edit-shell" : resolved.routeId,
    assetClass,
    brandGroundingCapable: resolved.supportsBrandAssetGuidance,
    resolutionTruth: resolved.resolutionTruth
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
export {
  DEMO_AUTHORIZATION_ID,
  FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
  FOUNDER_RENDER_ARTIFACT_INTENT,
  FOUNDER_RENDER_ROUTE_ID,
  SCENE_STACK_SHELL_FAL_MODEL,
  buildAuthorizationPayloadForSigning,
  buildFounderFullRoomPreviewPrompt,
  buildNanoBanana2FalInput,
  buildRegistryLineageMetadata,
  compileAssetIntent,
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  hasCompleteValidationCompileContext,
  lineageToRegistryRelationships,
  representGovernedGenerationRequest,
  resolveBrandMaterialPackage,
  resolveFounderRenderBrandOrganizationId,
  resolveFounderRenderModelRoute,
  resolveLayerIdFromProductionGroupId,
  resolveSceneStackLayerModelRoute,
  runFounderRenderPreflight,
  validateAuthorizationStructure
};
