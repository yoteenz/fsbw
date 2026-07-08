# Asset Review System — Studio OS v1

**Stage:** 04 — Asset Review™  
**Pilot:** Creative Direction Studio™ — 35 assets  
**Authority:** Founder + Studio Intelligence™ QA

---

## Purpose

Every generated asset enters **structured review** before Registry registration or assembly.

Rejected assets return to [Asset Generation](./asset-production-workflow.md) with **surgical revision scope** — never full-package regen by default.

---

## Review Pipeline

```
Provider delivers artifact
         ↓
Automated pre-review (Compiler Quality Engine checks)
         ↓
Per-asset review queue
         ↓
├── Automated checks (scale · naming · genome slots · duplicates)
├── Studio Intelligence™ visual analysis
├── Genome compliance scan
└── Founder review (hero assets + failures)
         ↓
├── APPROVED → Stage 05 Registry
├── REVISE → Stage 03 surgical regen
└── REJECT → discard · regenerate from scratch
```

---

## Review Dimensions

Every asset is evaluated against eleven dimensions:

| # | Dimension | Question | Severity |
|---|-----------|----------|----------|
| 1 | **Luxury quality** | Does it feel editorial-premium, not stock or SaaS? | error |
| 2 | **Company Genome alignment** | Do genome slots resolve? `thingsWeNeverDo` respected? | error |
| 3 | **Room DNA alignment** | Sliders (luxury · editorial · glass · warmth) reflected? | warn |
| 4 | **Scale** | Dimensions match manifest (meters)? Proportions believable? | error |
| 5 | **Perspective** | Camera angle matches prompt spec? No distortion? | warn |
| 6 | **Materials** | PBR believable? Genome-tint slots present? No baked brand hex? | error |
| 7 | **Lighting** | Responds to rig? No competing key lights? | warn |
| 8 | **Readability** | Interactive surfaces legible at walk distance? | error |
| 9 | **Reusability** | `reuseCategory` valid? Registry-ready metadata? | info |
| 10 | **Immersion** | Contributes to "place not page"? No UI chrome bleed? | error |
| 11 | **Founder approval** | Hero + flagged assets explicitly approved | error (hero) |

---

## Asset Class Review Profiles

### Environment & Architecture

| Check | Pass Criteria |
|-------|---------------|
| No flattened room | Shell · floor · ceiling are separate artifacts |
| Walk surface | Floor collision mesh accurate |
| Portal affordance | Entry/exit visually distinct |
| Exterior parallax | Window wall has depth, not flat paste |

### Furniture & Large Objects

| Check | Pass Criteria |
|-------|---------------|
| Hero (mood wall) | Pin rails visible · cluster zones · comparison split |
| Work surfaces | Timeline table supports branch lanes |
| Zone binding | Object anchors to correct `zoneId` |

### Glass & UI Panels

| Check | Pass Criteria |
|-------|---------------|
| Transparency | Frosted level matches Room DNA `glassLevel` |
| Floating UI | Acrylic panels do not obscure walk path |
| Genome tint | Slots active — not baked single-brand |

### Orb & Intelligence

| Check | Pass Criteria |
|-------|---------------|
| Universal reuse | `orb-cds` links `registry:orb-universal-v2` when reused |
| Concierge routing | AI definitions match `ai-team.md` — no auto-approve |
| Ceremony bind | Approval pedestal connects to ceremony asset |

### Audio & Atmosphere

| Check | Pass Criteria |
|-------|---------------|
| Loop seamless | Ambient audio no audible seam |
| Ceremony weight | Approval stinger matches editorial register |
| Orb acknowledge | Greeting SFX non-intrusive |

### Particles & VFX

| Check | Pass Criteria |
|-------|---------------|
| Subtlety | Ambient dust visible but not distracting |
| Performance | Particle budget within department 120 MB |

---

## Automated Pre-Review (Quality Engine)

From [quality-engine.md](../engines/studio-asset-compiler/quality-engine.md):

| Check | Auto Result |
|-------|-------------|
| Naming convention | Pass/fail |
| Prompt hash uniqueness | Warn on duplicate |
| Genome slot resolution | Pass/fail |
| Design Language negatives | Pass/fail |
| Reuse opportunity missed | Info flag |
| Budget MB | Warn if over |

Automated failures **block** founder review queue until resolved.

---

## Founder Review Protocol

### Mandatory Founder Review

| Asset | Reason |
|-------|--------|
| `wall-mood-cds` | Hero object — defines department soul |
| `env-shell-cds` | Spatial envelope — sets all proportions |
| `orb-cds` | Universal Studio identity |
| `lighting-rig-cds` | Atmospheric authority |
| Any auto-failed asset | Human judgment on borderline |
| Any REVISE after 2nd attempt | Escalation |

### Founder Review Format

```
Asset: wall-mood-cds
Review surface: isolated 3/4 + in-room context + genome overlay (Frontal Slayer)
Decision: APPROVE | REVISE(scope) | REJECT
Notes: [optional — feeds Revision Engine]
```

Walk the Room™ preview available for in-context review (Stage 08 precursor).

---

## Genome Compliance Scan

For each asset, verify against active Company Genome snapshot:

```yaml
checks:
  - genomeSlots[] resolve in org snapshot
  - thingsWeNeverDo[] absent from artifact semantics
  - materialLanguage expression matches genome
  - editorialDirection consistent with art direction lock (Stage 01)
  - Room DNA sliders within clamp ranges per industry preset
```

**CDS test:** Run against Frontal Slayer · NDXBook · Law Firm presets — same mesh, different soul.

---

## Revision Scopes (Return to Stage 03)

| Scope ID | When | Regenerates |
|----------|------|-------------|
| `material-only` | Material wrong · scale OK | Textures · shader slots |
| `mesh-topology` | Proportions wrong | Full mesh |
| `prompt-layer` | Semantic wrong · physical OK | Re-expand prompt · regen |
| `lighting-response` | Rig mismatch | Relight pass or metadata |
| `genome-overlay` | Tint wrong · mesh OK | Overlay prompts only |
| `full-asset` | Multiple failures | Complete asset |

Revision Engine never defaults to `full-asset` — requires explicit founder or QA escalation.

---

## Review Record Schema

```json
{
  "$schema": "studio.production.v1/asset-review",
  "assetId": "wall-mood-cds",
  "packageId": "pkg-creative-direction-golden-v1",
  "reviewedAt": "2026-07-08T00:00:00Z",
  "reviewer": "founder | studio-intelligence | automated",
  "dimensions": {
    "luxuryQuality": { "score": 94, "pass": true },
    "genomeAlignment": { "score": 96, "pass": true },
    "roomDnaAlignment": { "score": 91, "pass": true },
    "scale": { "pass": true },
    "perspective": { "pass": true },
    "materials": { "pass": true },
    "lighting": { "pass": true },
    "readability": { "pass": true },
    "reusability": { "registryReady": true },
    "immersion": { "pass": true }
  },
  "decision": "approved",
  "revisionScope": null,
  "founderApproved": true,
  "notes": "Hero surface approved — pin rails visible at walk distance"
}
```

---

## Batch Review Order

Review in **reverse dependency** — hero and large objects before environment details:

1. Hero: `wall-mood-cds`
2. Intelligence: `orb-cds` · concierges
3. Large objects: brief wall · observatory · compare screen
4. Furniture: timeline · sandbox · library
5. Glass · UI panels
6. Lighting rig
7. Architecture · environment
8. Atmosphere: particles · audio
9. Navigation · animation metadata
10. Content seeds

Failures in early items may cascade — block dependent reviews until resolved.

---

## Rejection Loop

```
REJECT or REVISE
         ↓
Assign revisionScope
         ↓
Re-queue in Compiler (surgical)
         ↓
Re-deliver artifact
         ↓
Re-review (increment attempt counter)
         ↓
├── Pass → APPROVED
├── Attempt 2 fail → escalate to founder
└── Attempt 3 fail → Braintrust session · full-asset scope
```

---

## Stage 04 Gate

**Asset Review Complete** when:

- [ ] 100% of 35 assets have review record
- [ ] 0 assets in `pending` or `revise` state
- [ ] Hero object founder-approved
- [ ] All `error` severity dimensions pass
- [ ] Genome compliance scan pass for target org
- [ ] Review records packaged in `14_metadata/reviews/`

---

_Asset Review System — nothing enters the library unexamined._
