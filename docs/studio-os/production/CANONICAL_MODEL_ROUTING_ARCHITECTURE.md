# Canonical AI Model Routing Architecture

**Status:** Production Architecture  
**Policy:** `model-routing-engine.v1` · `prompt-router.v1`  
**Sprint:** P1 — Separate World Generation from Asset Manufacturing

---

## Principle

Studio OS no longer uses one universal generation model. Every generation request routes through **ModelRoutingEngine™** and **PromptRouter™** before any AI worker executes.

| Worker family | Model | Surface | Responsibility |
|---|---|---|---|
| **World Architect** | Nano Banana Pro (NBP) | Experience Lab | Whole environments only |
| **Asset Manufacturer** | Nano Banana 2 (NB2) | Creative Director Studio | Isolated production assets |
| **Background Cleanup** | BiRefNet | Scene Stack / post-process | Masking, transparency, removal |

---

## ModelRoutingEngine™

**Module:** `src/studio-os-core/creative-production/model-routing-engine/`

```typescript
resolveModelRoutingDecision({ artifactIntent, surface?, brandGroundingRequired? })
resolveModelRoutingFromLayerId(layerId, options?)
```

### Intent → model matrix

| Artifact intent | Worker | Model |
|---|---|---|
| `founder-full-room-preview` | world-architect | NBP |
| `experience-environment` | world-architect | NBP |
| `world-preview` | world-architect | NBP |
| `world-expansion` | world-architect | NBP |
| `environment-shell` | world-architect | NBP |
| `reception-desk` | asset-manufacturer | NB2 |
| `furniture-asset` | asset-manufacturer | NB2 |
| `landmark-asset` | asset-manufacturer | NB2 |
| `logo-asset` | asset-manufacturer | NB2 |
| `campaign-graphic` | asset-manufacturer | NB2 |
| `packaging-asset` | asset-manufacturer | NB2 |
| `background-cleanup` | background-cleanup | BiRefNet |

No worker hardcodes model endpoint strings — routes resolve from `MODEL_REGISTRY_ROUTES`.

---

## PromptRouter™

**Module:** `src/studio-os-core/creative-production/prompt-router/`

Versioned prompt contracts — no inline prompts in routing code:

| Intent | Prompt version |
|---|---|
| Founder Render | `founder-full-room-preview-prompt.v1` |
| Reception desk | `asset-reception-desk-prompt.v1` |
| Furniture / chair | `asset-chair-prompt.v1` |
| Landmark | `signature-landmark-isolated-prompt.v3` |
| Logo | `asset-logo-prompt.v1` |
| Campaign | `asset-campaign-prompt.v1` |
| Packaging | `asset-packaging-prompt.v1` |

---

## Generation pipeline

```
Founder
  → Experience Lab (NBP)
  → Founder Render
  → Founder Approval
  → Blueprint Lock
  → Creative Director Studio (NB2 workers)
  → Quality Guard
  → Scene Stack
  → Final World
```

CD Studio **never** invents architecture. Experience Lab **never** generates isolated furniture, logos, or décor.

---

## Reference strategy

NB2 asset workers receive:

- Approved Founder Render (reference context only)
- Blueprint metadata
- Asset crop + socket position
- Founder Material Library assignments
- Perspective + lighting profile

Not a full-room edit request.

---

## Immune System

**Module:** `src/studio-os-core/immune-system/model-routing-validation.ts`

| Violation | Code |
|---|---|
| World intent + non-NBP model | `WORLD_INTENT_REQUIRES_NBP` |
| Asset intent + non-NB2 model | `ASSET_INTENT_REQUIRES_NB2` |
| Cleanup intent + non-BiRefNet | `CLEANUP_INTENT_REQUIRES_BIREFNET` |
| CDS attempting room generation | `ASSET_WORKER_ROOM_VIOLATION` |
| EL attempting asset generation | `WORLD_WORKER_ASSET_VIOLATION` |

Integrated into `runGenerationArtifactPreflight()` by default.

---

## Quality Guard forensic record

**Module:** `src/studio-os-core/creative-production/generation-routing-record.ts`

Every governed generation should persist:

- Selected model + routeId
- Prompt version + builder ID
- Artifact intent + worker family
- Reference strategy
- Material library version
- Lighting / camera / perspective profiles
- Brand asset revision
- Approved Founder Render URL (when applicable)

---

## Bundle exports

Serverless handlers import routing from `api/_lib/creativeProduction/studio-os-server.bundle.js`:

- `resolveModelRoutingDecision`
- `resolvePromptRouting`
- `validateModelRoutingDecision`
- `buildGenerationRoutingRecord`
- `getWorldArchitectDefaultModel`

---

## Related docs

- `docs/studio-os/production/EXPERIENCE_LAB_CDS_MANUFACTURING_PIPELINE.md` — EL → CDS handoff (P0)
- `src/studio-os-core/creative-production/model-registry/routes.ts` — route configuration
- `src/studio-os-core/scene-stack/layer-model-routing.ts` — scene-stack integration
