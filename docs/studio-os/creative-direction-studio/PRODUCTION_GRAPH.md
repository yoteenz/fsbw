# Creative Direction Studio™ — Production Graph

**Authority:** Genesis §9B.28  
**Status:** Binding target architecture for migration  
**Companion:** `MIGRATION_AUDIT.md`, `IMPLEMENTATION_ROADMAP.md`

This document defines the **Universal Creative Production System™** as an
executable graph—not a new engine. It specifies nodes, edges, objects,
touchpoint taxonomy, and traceability contracts.

---

## 1. Graph overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ GOVERNING INPUTS (read-only, version-pinned)                            │
│  Company Genome™ · Brand DNA™ · Design Canon · Manual/Policy · SIL      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Creative Direction Studio™                                              │
│  CreativeInitiative · DirectionAlternatives · OrchestrationPlan         │
│  ReviewState · ProductionStatusProjection                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Creative Operating System™                                              │
│  InitiativeGovernance · CouncilDecision · EvolutionProposal           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Narrative Intelligence™                                                 │
│  NarrativeBlueprint · ProductionGenome · NarrativeBrief               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Studio Production System™                                             │
│  ProductionPackage · DepartmentPlan · ApprovalGate · QCRecord         │
│  ProductionAuthorization (signed, immutable)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Foundry / Asset Compiler™                                               │
│  AssetIntent · CompiledRecipe · ManufacturingJob · BuildReport        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Asset Registry™                                                         │
│  AssetRecord · Version · Rights · Provenance · Usage · Relationships    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────────────────┐
│ Content Engine™              │   │ Experience Engine™ / Runtime™    │
│ MasterContent · Derivative   │   │ ExperienceProfile · SceneBinding │
│ EditorialState · Publication │   │ EphemeralSessionArtifact         │
└──────────────────────────────┘   └──────────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
                              DELIVERY
                    (social · email · web · app · print ·
                     retail · event · investor · video CDN · runtime)
```

**Creative Genome™** spans the graph as a **relationship index** (not a store):
links initiatives, decisions, assets, derivatives, publications, and outcomes.

---

## 2. Core graph objects

### 2.1 CreativeInitiative™ (Creative Direction Studio)

The founder-facing unit of creative work.

```typescript
type CreativeInitiative = {
  id: string;
  tenantId: string;
  companyId: string;
  title: string;
  expressionFamily: ExpressionFamily;
  businessObjective: string;
  successMetric?: string;
  audienceScope: AudienceScope;
  touchpointPlan: TouchpointPlan[];
  // Version pins — required before material production
  companyGenomeVersion: VersionPin;
  brandDnaVersion: VersionPin;
  designCanonVersion: VersionPin;
  narrativeBlueprintId?: string;
  productionGenomeId?: string;
  orchestrationPlanId?: string;
  status: 'draft' | 'directing' | 'orchestrating' | 'in_production' | 'in_review' | 'delivered' | 'archived';
};
```

### 2.2 ProductionAuthorization™ (Studio Production System)

Immutable authorization to manufacture. Generation APIs **must** verify this.

```typescript
type ProductionAuthorization = {
  id: string;
  productionPackageId: string;
  narrativeBlueprintId: string;
  productionGenomeId: string;
  satisfiedGateIds: string[];
  issuedAt: string;
  issuedBy: AuthorityRecord;
  expiresAt?: string;
  scope: {
    touchpoints: TouchpointKind[];
    assetIntents: string[];
    maxCost?: number;
  };
  signature: string; // server-signed, tamper-evident
};
```

### 2.3 ExpressionLineage™

Every output declares lineage per Genesis §9B.28 rule 6.

```typescript
type ExpressionLineage =
  | { kind: 'source'; initiativeId: string }
  | { kind: 'adaptation'; sourceAssetRegistryId: string; sourceExpressionId: string; adaptationReason: string }
  | { kind: 'independent'; rationale: string; governingDecisionId: string };
```

### 2.4 AssetIntent → CompiledRecipe → ManufacturingJob

```typescript
type AssetIntent = {
  id: string;
  productionAuthorizationId: string;
  touchpoint: TouchpointKind;
  discipline: ProductionDiscipline;
  recipeSlug: string;
  inputRefs: SourceReference[];
  rightsRequirements: RightsRequirement[];
  qualityGates: string[];
};

type CompiledRecipe = {
  intentId: string;
  provider: string;
  model: string;
  parameters: Record<string, unknown>;
  recipeVersionHash: string;
};

type ManufacturingJob = {
  id: string;
  compiledRecipe: CompiledRecipe;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  providerJobId?: string;
  costReceipt?: CostReceipt;
  buildReport?: BuildReport;
  outputAssetRegistryId?: string;
};
```

### 2.5 MasterContent™ / DerivativeContent™ (Content Engine)

```typescript
type MasterContent = {
  id: string;
  initiativeId: string;
  sourceAssetRegistryIds: string[];
  expressionLineage: ExpressionLineage;
  editorialState: 'draft' | 'in_review' | 'approved' | 'published' | 'retired';
  approvalRecords: ApprovalRecord[];
};

type DerivativeContent = {
  id: string;
  masterContentId: string;
  touchpoint: TouchpointKind;
  channelSpec: ChannelSpec;
  assetRegistryIds: string[];
  expressionLineage: ExpressionLineage; // always adaptation from master
  editorialState: MasterContent['editorialState'];
};
```

---

## 3. Touchpoint taxonomy

All listed outputs map to **one expression family** and **one production
discipline**. No new constitutional engine per channel.

| Output | Expression family | Production discipline | Delivery owner |
|---|---|---|---|
| Single asset | Any | Foundry specialist | Content or Experience |
| Collection / moodboard | Campaign & launch | Foundry (draft) or Registry (approved) | Content |
| Complete campaign | Campaign & launch | Multi-package Production System | Content |
| Launch campaign | Campaign & launch | Narrative + Production + Content | Content |
| Product launch | Campaign & launch | Narrative + Production + Content + Experience | Content + Experience |
| Email campaign | Campaign & launch | Foundry (heroes) + Content (copy/layout) | Content |
| Social campaign | Campaign & launch | Foundry + Content (derivatives) | Content |
| Advertisements | Campaign & launch | Foundry + Content (+ legal claim gate) | Content |
| Product photography | Product & commerce | Product Asset Factory / Foundry | Content + Experience |
| Packaging / labels | Product & commerce | Foundry + physical spec review | Content |
| Landing pages | Screen & interactive | Experience Engine compile | Experience Runtime |
| Web experiences | Screen & interactive | Experience Engine | Experience Runtime |
| Mobile experiences | Screen & interactive | Experience Engine | Experience Runtime |
| Video production | Moving-image | Specialist video Foundry | Content |
| Motion graphics | Moving-image | Foundry animation recipes | Content |
| Presentation decks | Executive & institutional | Foundry + Content | Content |
| Print collateral | Physical & environmental | Foundry + prepress gate | Content |
| Investor materials | Executive & institutional | Foundry + Content (+ legal) | Content |
| Retail / trade show / installations | Physical & environmental | Foundry + spatial review | Content + Experience |

---

## 4. Graph edges (dependency rules)

| From | To | Edge | Rule |
|---|---|---|---|
| CreativeInitiative | NarrativeBlueprint | `requests` | Cannot manufacture without approved blueprint |
| NarrativeBlueprint | ProductionGenome | `compiles_to` | Production Genome is reusable across touchpoints |
| ProductionGenome | ProductionPackage | `packages_as` | Package is touchpoint-scoped execution unit |
| ProductionPackage | ProductionAuthorization | `authorizes` | Signed only when all required gates satisfied |
| ProductionAuthorization | AssetIntent | `permits` | Each intent must reference authorization ID |
| AssetIntent | CompiledRecipe | `compiled_by` | Asset Compiler only |
| CompiledRecipe | ManufacturingJob | `executes_as` | Foundry / specialist service |
| ManufacturingJob | AssetRecord | `registers` | Atomic upload + registry transaction |
| AssetRecord | MasterContent | `sources` | Approved assets only |
| MasterContent | DerivativeContent | `adapts_to` | Adaptation lineage required |
| DerivativeContent | Publication | `publishes_via` | Content Engine authorization |
| AssetRecord | ExperienceProfile | `binds_to` | Experience Engine compile input |
| Any node | CreativeGenomeNode | `indexed_by` | Relationship only, no duplicate payload |

---

## 5. Two production paths

### 5.1 Material production path (required)

```text
Initiative → Blueprint (approved) → Package → Authorization → Intent →
Recipe → Job → Registry → Review → Master/Derivative → Delivery
```

Used for: campaigns, launches, public assets, packaging, ads, email heroes,
investor decks, canonical product photography, experience-bound assets.

### 5.2 Exploratory draft path (exception)

```text
Initiative → DraftIntent (nonCanonical=true) → Recipe → Job →
local draft store ONLY (no registry, no publish)
```

Used for: private moodboards, concept sketches, founder exploration.

Promotion to material path requires explicit review + new ProductionAuthorization.

### 5.3 Ephemeral runtime path (customer-facing)

```text
RuntimeSession → EphemeralArtifact (classified) → Storage with retention policy
Optional: PromotionRequest → Material path → Registry
```

Used for: Build-a-Wig previews, try-on renders, consult composites.

These **do not** bypass policy/privacy gates but **do not** require full
campaign Production Package when classified ephemeral.

---

## 6. Approval and rights gates

| Gate | Owner | Blocks |
|---|---|---|
| Narrative blueprint approved | Narrative Intelligence | Production Package creation |
| Strategic fit / continuity | Studio Production | Authorization issuance |
| Brand / taste alignment | Brand owner + Creative Director role | Direction finalization |
| Legal / claims / disclosures | Obligation governance (when ratified) | Ads, investor, regulated copy |
| Rights / license | Asset Registry + Manual | Manufacture and publish |
| Accessibility | Experience / Content | Public web/app delivery |
| QC / screening | Studio Production + Screening facility | Registry promotion |
| Publication | Content Engine | External delivery |

---

## 7. Campaign system model

A **campaign** is not a separate engine. It is a **graph composition**:

```text
CreativeInitiative (campaign)
  └── NarrativeBlueprint
  └── ProductionGenome (stable)
  └── ProductionPackage[] (per wave/discipline)
        └── AssetIntent[] (heroes, video, print, etc.)
  └── MasterContent (source expression)
  └── DerivativeContent[] (social, email, ads, landing, deck, etc.)
  └── PublicationSchedule (Content Engine + Workflow)
```

**Launch campaigns** add Experience compile/bind steps for web/mobile onboarding
surfaces tied to the same Production Genome.

---

## 8. Multi-company onboarding

Every onboarded company receives:

1. Pinned Company Genome + Brand DNA + Design Canon references in Studio config
2. Empty Creative Initiative workspace (Creative Direction Studio UI)
3. Registered Domain System of Record slots (when Genesis v1 closure ratified)
4. Asset Registry tenant namespace
5. Content Engine publication policy defaults from Manual
6. Experience Engine tenant DNA inheritance

No per-company creative engine is created. Expression families and disciplines
are universal; inputs are tenant-scoped.

---

## 9. Implementation contracts (Phase 1 deliverables)

These TypeScript modules will anchor migration (see roadmap):

| Contract | Path (proposed) |
|---|---|
| Graph types | `src/studio-os-core/creative-production/types.ts` |
| Production authorization verifier | `src/studio-os-core/creative-production/authorization.ts` |
| Graph orchestrator (facade) | `src/studio-os-core/creative-production/graph.ts` |
| Registry transaction helper | `api/_lib/creativeProduction/registry-transaction.ts` |
| Generation gateway | `api/_lib/creativeProduction/generation-gateway.ts` |

All existing generation endpoints migrate to call `generation-gateway.ts`,
which verifies `ProductionAuthorization` before delegating to Foundry/providers.

---

## 10. Anti-patterns (forbidden after migration)

- Channel-specific engines (Social Engine, Email Engine, Ad Engine)
- Local asset registries with write authority
- `forceGenerate` / `skipCie` on material endpoints
- Auto-approve in Scene Stack for registry-bound assets
- Newsletter send without Content Engine `PublicationAuthorization`
- Treating Creative Genome or Content Brain as source of truth
- Software Production Orchestrator naming collision with creative Production Package
