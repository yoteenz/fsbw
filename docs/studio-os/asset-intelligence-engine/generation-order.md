# Generation Order — Remember First

**Module:** `studio.asset-intelligence.v1.generation-order`  
**Status:** Canonical pipeline law

---

## The Old Order (Forbidden)

```
Request → Prompt → Provider → Approve → Hope we remember later
```

This is how traditional AI behaves. Studio OS **never** uses this as default.

---

## The New Order (Mandatory)

```
① Founder Request
         ↓
② Asset Intelligence Engine™ — Registry Search™
         ↓
③ Find Similar Assets
         ↓
④ Compatibility Engine™ — Evaluate
         ↓
⑤ Rank Recommendations + Explain WHY
         ↓
⑥ Founder Control Gate™ — Choose
         ↓
⑦a Reuse Existing™        → Link Registry · skip provider
⑦b Duplicate & Modify™    → Fork Registry · partial provider
⑦c Upgrade™              → New version from parent · targeted provider
⑦d Generate Completely New™ → Full Generation Manager™ job
         ↓
⑧ Approve → Register → Company Memory™
         ↓
⑨ Learning Loop™ + Company DNA™ update
```

---

## Stage Detail

### Stage ① — Founder Request

Any phrasing that implies new visual production:

- *"Generate Story Table"*
- *"We need luxury lighting for this station"*
- *"Add bronze shelves to Marketing"*
- Scene Stack™ layer regeneration request

Normalized into `IntelligenceRequest` before any provider contact.

---

### Stage ② — Registry Search™

Search dimensions (all indexed):

| Dimension | Examples |
|-----------|----------|
| Asset Name™ | Story Table · Editorial Lighting Pack |
| Department™ | creative-direction · finance · marketing |
| Scene™ · Station™ | mood-wall · arrival · capital-vault |
| Category™ | lighting · furniture · environment-shell |
| Style™ | editorial · executive · luxury-atelier |
| Materials™ | bronze · dark marble · smoked glass |
| Lighting Profile™ | volumetric-pools · editorial-rig |
| Color Palette™ | warm-bronze · cool-slate |
| Environment Tags™ | atelier · vault · library |
| Golden Build Version™ | golden-build-v1 · scene-stack-v1 |

Search runs against **org-scoped Registry** + entitled **Marketplace Packs™**.

---

### Stage ③ — Similar Assets

Candidates ranked by composite signal — not keyword match alone.

Minimum candidate set:

- Same category matches
- Cross-department compatible matches (when DNA-aligned)
- Pack-owned matches (when entitled)
- Parent/child version lineage matches

---

### Stage ④ — Compatibility Evaluation

See [compatibility-engine.md](./compatibility-engine.md).

Outcomes:

| Outcome | Threshold (default) |
|---------|---------------------|
| **Exact Match™** | ≥ 95 |
| **Close Match™** | 85–94 |
| **Can Be Modified™** | 70–84 |
| **Requires Upgrade™** | 55–69 |
| **Generate New™** | < 55 |

---

### Stage ⑤ — Recommendations

Top 3 candidates presented internally; default recommendation = highest score above floor.

Each includes:

- Compatibility %
- Match type
- Proposed action
- **Explanation** (WHY)
- Estimated savings (tokens · time · compute)

---

### Stage ⑥ — Founder Control Gate™

Mandatory pause before provider execution.

Orb or review UI presents:

> *"We already own three compatible lighting systems."*

| Choice | Effect |
|--------|--------|
| **Reuse Existing™** | Link artifact · zero provider |
| **Duplicate & Modify™** | Fork + targeted delta gen |
| **Generate Completely New™** | Full new asset path |

Founder may also pick a specific ranked candidate instead of default.

See [founder-control.md](./founder-control.md).

---

### Stage ⑦ — Execution Paths

| Path | Generation Manager™ | Registry |
|------|---------------------|----------|
| Reuse | **Not invoked** | `reuseCount++` · `lastUsed` update |
| Duplicate & Modify | Partial job (delta only) | New item · `forkedFrom` parent |
| Upgrade | Targeted quality/resolution job | New version · parent preserved |
| Generate New | Full job | New item after approval |

---

### Stage ⑧ — Company Memory™

Every approved asset:

- Receives full Registry metadata
- Becomes searchable forever
- Contributes to Company DNA™ profile
- May surface in future searches for any department

---

### Stage ⑨ — Learning

Record:

- Which recommendation was shown
- What founder chose
- Whether choice matched recommendation
- Outcome quality (if reviewed)

Feeds [learning-system.md](./learning-system.md) and Founder Taste Engine™.

---

## Scene Stack™ Integration

Per-layer regeneration **must** query Intelligence first:

```
Regenerate Lighting Systems™ only
         ↓
Search category: lighting
         ↓
Filter: same station shell + landmark dependencies
         ↓
Recommend reuse of existing lighting layer from sibling station OR modify OR generate
```

Environment Shell™ and Signature Landmark™ remain intact — Intelligence never suggests full-scene regen.

---

## Generation Manager™ Handoff

Only when routing = `Generate New™` or `Duplicate & Modify™` or `Upgrade™`:

```yaml
GenerationManagerJob:
  intelligenceRequestId: string
  reuseContext:
    parentRegistryId: string | null
    modifySpec: ModifySpec | null
    upgradeSpec: UpgradeSpec | null
  bypassReuse: false              # true only if founder forced new
```

Generation Manager **does not** run its own reuse scan — Intelligence already decided.

Compiler-path **Reuse Engine** ([reuse-engine.md](../engines/studio-asset-registry/reuse-engine.md)) remains for batch package compiles; Intelligence Engine owns **interactive founder-facing** decisions.

---

## Metrics

| Metric | Target (mature org) |
|--------|---------------------|
| Reuse rate | ≥ 40% of asset requests |
| Founder override to Generate New | tracked · not penalized |
| Avg tokens saved per reuse | reported in build health |
| DNA coherence score | ≥ 80 across departments |

---

_Generation Order — remember first, generate last._
