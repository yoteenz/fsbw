# Registry Expectations™ — Story Table™ Benchmark

**Benchmark Module:** `studio.benchmark.story-table-hello-world.v1.registry`  
**Status:** Store · reuse · version proof requirements

---

## Law

Every Story Table™ layer must end as a **reusable company asset** in [Asset Registry™](../engines/studio-asset-registry/README.md).

---

## Expected Registry Outcomes

| Layer | Expected Registry action |
|-------|-------------------------|
| Environment Shell™ | reuse · `usageCount++` |
| Lighting™ | reuse or version bump after regen proof |
| Architecture™ | reuse |
| Furniture™ | modify → new version · `forkedFrom` parent |
| Executive Strategy Table™ | **new record** · golden candidate |
| Floating Studio Orb™ | reuse platform Orb · genome tint metadata |
| Holographic Project Boards™ | modify → new version |
| Material Samples™ | reuse · material vocabulary refs |
| Atmosphere™ | reuse |
| Particles™ | reuse |
| Ambient Audio™ | reuse or new stem |
| Runtime FX™ | cursor metadata record · no provider artifact |

---

## Canonical Record Requirements (Per Layer)

From [canonical-asset-record.md](../engines/studio-asset-registry/canonical-asset-record.md):

```yaml
requiredFields:
  - uuid
  - name
  - category
  - department: creative-direction
  - workspace: story-table
  - scene: story-table-scene-v1
  - generationPack: pack-creative-direction-golden-v1
  - tags
  - materials
  - lightingProfile        # where applicable
  - cameraProfile          # where applicable
  - resolution
  - aspectRatio
  - generationCost
  - generationModel        # internal only
  - promptVersion
  - blueprintVersion
  - createdBy
  - date
  - usageCount
  - marketplaceEligible
  - favorite
  - archived: false
```

---

## Reuse Categories (Benchmark Seeds)

| reuseCategory | Layer |
|---------------|-------|
| `env-shell-editorial-hq` | Environment Shell™ |
| `lighting-rig-editorial` | Lighting™ |
| `studio-orb-spatial-host` | Floating Studio Orb™ |
| `executive-strategy-table-hero` | Executive Strategy Table™ |
| `holographic-project-cards` | Holographic Project Boards™ |
| `material-samples-luxury` | Material Samples™ |

Enables cross-workspace query: Mood Wall™ · Arrival™ · future departments.

---

## Dependency Graph Edges

After benchmark, Registry DAG must include:

```
registry:env-shell-story-table
  ├── requires → registry:blueprint-editorial-luxury-v1
  └── usedBy → registry:lighting-story-table

registry:executive-strategy-table
  ├── requires → registry:env-shell-story-table
  └── enables → registry:holographic-project-boards
```

---

## Auto-Registration Trigger

Per [auto-registration.md](../engines/studio-asset-registry/auto-registration.md):

```
Quality Inspector™ pass
         ↓
Founder Approval™
         ↓
Registry Update™ (draft → approved)
```

Benchmark proof: no asset remains `draft` after workspace published.

---

## Second-Run Reuse Proof

After Hello World completes, run **Mood Wall™** plan:

```
Registry Check for Mood Wall™ Lighting™
         ↓
Should recommend: registry:lighting-story-table (or sibling)
         ↓
Reuse Existing™ → zero generation
```

**Proves:** Story Table™ assets are reusable company memory.

---

## Studio Alpha™ Audit Query

```sql
-- conceptual
SELECT category, name, usage_count, prompt_version
FROM registry_items
WHERE workspace = 'story-table'
ORDER BY layer_index;
```

Expected: 12 rows minimum.

---

_Registry Expectations — every layer remembered forever._
