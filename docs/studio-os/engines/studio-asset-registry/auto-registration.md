# Auto-Registration™

**Engine Module:** `studio.asset-registry.v1.auto-registration`  
**Status:** Every generated asset automatically saves to Registry

---

## Law

> Every generated asset should **automatically save** into the Registry.

The Registry becomes one of the **foundational engines** of Studio OS — not an optional export step.

---

## Registration Pipeline

```
Generation Manager™ job completes
         ↓
Quality Inspector™ pass
         ↓
AUTO-REGISTER (draft)
  - UUID assigned
  - Canonical record populated from job metadata
  - Artifact refs attached
  - status.lifecycle: generated
         ↓
Approval Queue™ (founder or pipeline gate)
         ↓
ON APPROVE → lifecycle: approved
  - usageCount initialized: 0
  - marketplaceEligible evaluated
  - Equity event · ROI seed
         ↓
SEARCHABLE for remember-first reuse
```

**No manual "save to library" step.**

---

## Auto-Registration Payload

```yaml
AutoRegistrationEvent:
  jobId: string
  assetId: uuid                    # assigned at register
  canonicalRecord: CanonicalAssetRecord
  artifacts:
    primary: artifactRef
    derivatives: artifactRef[]
  provenance:
    productionEstimateId: string
    blueprintId: string
    promptComposerVersion: string
    generationPackId: string
  orgId: string
  registeredAt: ISO8601
  lifecycle: generated
```

Source: [Generation Manager™](../generation-manager/README.md) build report + [Prompt Composer™](../../creative-intelligence-engine/prompt-generation-architecture.md) output.

---

## Draft vs Approved

| State | Reuse behavior |
|-------|----------------|
| `generated` | Internal search · pending QA · not founder-recommended |
| `approved` | Full remember-first candidate |
| `archived` | Historical · DNA reference · not recommended |

Rejected generations may remain as `draft` branch records (Founder Taste Engine™) — not promoted.

---

## Idempotency

| Rule | Behavior |
|------|----------|
| Same job ID twice | Upsert — no duplicate UUID |
| Retry success after fail | Update existing draft record |
| Regenerate layer | New UUID OR version branch per founder choice |

---

## Event Bus™

| Event | Subscribers |
|-------|-------------|
| `registry.asset.auto-registered` | Asset Intelligence · Creative Portfolio · Creative Equity |
| `registry.asset.approved` | Reuse index rebuild · Orb coaching |
| `registry.asset.reused` | usageCount++ · ROI update |

---

## Storage Planes (Future Implementation)

| Plane | v1 sprint | v1.1+ |
|-------|-----------|-------|
| Intelligence metadata | **Spec complete** | Supabase `studio_registry_items` |
| Artifact binaries | Referenced | Supabase Storage · CDN |
| Search index | Spec | Precomputed reuse index |

**No UI · no storage implementation this sprint.**

---

## Forbidden

| Forbidden | Why |
|-----------|-----|
| Opt-in registration | Amnesia risk |
| Register only on marketplace publish | Too late for reuse |
| Delete on reject | Violates remember-first history |

---

_Auto-Registration™ — generate once, remembered forever._
