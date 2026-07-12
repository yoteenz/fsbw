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
export {
  DEMO_AUTHORIZATION_ID,
  buildAuthorizationPayloadForSigning,
  buildRegistryLineageMetadata,
  compileAssetIntent,
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  hasCompleteValidationCompileContext,
  lineageToRegistryRelationships,
  representGovernedGenerationRequest,
  validateAuthorizationStructure
};
