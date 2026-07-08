# Production Flow — Studio Builder™

**Sprint:** Alpha 002  
**Trigger:** Founder presses **Generate** on a production group

---

## One Button Philosophy

```
[ Generate Environment ]
         ↓
Studio OS performs 10+ steps automatically
         ↓
Founder sees: Preparing… → Prompt Ready → (alpha: copy/upload) → Validating… → ✓ Complete
```

Founder never sees step 1–9 as separate tasks.

---

## Orchestration Chain

When founder presses **Generate {Group}**:

```
STUDIO BUILDER
    │
    ├─ 1. Resolve production group → asset IDs (from internal manifest)
    │
    ├─ 2. INGEST INTERNAL KNOWLEDGE (automatic)
    │      ├─ docs/studio-os/alpha/environment-storytelling.md
    │      ├─ docs/studio-os/alpha/room-layout.md
    │      ├─ docs/studio-os/alpha/object-catalog.md
    │      ├─ docs/studio-os/alpha/arrival-experience.md (if relevant)
    │      ├─ departments/creative-direction-studio/asset-manifest.json
    │      ├─ departments/creative-direction-studio/room-dna.json
    │      ├─ departments/creative-direction-studio/fal-prompt-package/
    │      ├─ engines/studio-asset-registry/prompt-library.md (fragments)
    │      └─ frozen package if exists: 13_prompts/*.json
    │
    ├─ 3. LOAD GENOMES
    │      ├─ Company Genome™ snapshot
    │      ├─ Project Genome™ snapshot (Project 001)
    │      ├─ Brand DNA / Brand Genome subset
    │      └─ Founder Journey™ pacing hints
    │
    ├─ 4. CREATIVE DIRECTION CONTEXT
    │      ├─ Stage 01 creative lock (if set)
    │      └─ Living mood / brief seeds from project
    │
    ├─ 5. PROMPT COMPILER™
    │      └─ Merge all sources → single ExpandedPromptStack per asset
    │
    ├─ 6. REGISTRY SMART REUSE CHECK
    │      └─ Skip generation if exact/adapt link available
    │
    ├─ 7. GENERATION MANAGER™
    │      └─ Queue item · provider route · dependency hold
    │
    ├─ 8. PRESENT TO FOUNDER
    │      ├─ Alpha: Prompt Ready + Copy + Open Generator
    │      └─ Future: submit to provider automatically
    │
    ├─ 9. RECEIVE ARTIFACT
    │      ├─ Alpha: founder upload
    │      └─ Future: provider webhook / poll
    │
    ├─ 10. VALIDATION WORKFLOW
    │       └─ resolution · luxury · genome · room DNA
    │
    └─ 11. ON APPROVE
            ├─ Store artifact · Registry write
            └─ DEPENDENCY UNLOCK next groups
```

---

## Example: Generate Environment

### Internal reads (founder invisible)

| # | Source | Extracts |
|---|--------|----------|
| 1 | `environment-storytelling.md` | Material language · light behavior · emotional tone |
| 2 | `room-layout.md` | Floor footprint · spawn · reflection zones |
| 3 | Company Genome™ | `materialLanguage` · `lightingStyle` · `thingsWeNeverDo` |
| 4 | Project Genome™ | Project mood bias · visual brief |
| 5 | Creative Direction lock | Anti-SaaS · luxury tier |
| 6 | `asset-manifest.json` | `env-floor-cds` · dimensions · genomeSlots |
| 7 | Prompt Library™ | `registry:prompt-fragment-environment-atelier-v1` |
| 8 | Brand DNA | Accent · photography direction |
| 9 | Room DNA™ | `luxuryLevel` · `warmthLevel` sliders |

### Output

One **polished production prompt** displayed in Prompt Ready surface:

```
Prompt Ready — Environment Floor

[Readable summary for founder — not raw JSON]

"Polished stone floor, 18×12m editorial atelier, wide reflection 
depth, luxury gallery gravity, {materialLanguage from Frontal Slayer}, 
soft key from coffered ceiling, photorealistic PBR, no stock office…"

[ Copy Prompt ]  [ Open Generator ]
```

Founder may read summary — never required to edit.

---

## Group → Asset Mapping

| Founder group | Asset IDs compiled |
|---------------|-------------------|
| Environment | `env-floor-cds` |
| Architecture | `env-shell-cds`, `env-ceiling-cds`, `env-alcove-cds`, `env-window-cds`, `portal-entry-cds`, `portal-exit-cds` |
| Lighting | `lighting-rig-cds` |
| Furniture | `table-timeline-cds`, `table-sandbox-cds`, `shelf-library-cds` |
| Glass Systems | `glass-panels-cds`, `panel-context-float-cds` |
| Mood Wall | `wall-mood-cds`, `wall-brief-cds`, `observatory-cds`, `screen-compare-cds` |
| Orb | `pedestal-orb-cds`, `orb-cds` |
| Timeline | *(timeline table — may batch with Furniture)* |
| Panels | `panel-founder-notes-cds`, `markers-walk-room-cds` |
| Particles | `particles-ambient-cds` |
| Audio | `audio-ambient-cds`, `audio-ceremony-cds`, `audio-orb-cds` |
| Animations | `camera-paths-cds`, ceremony metadata |
| Runtime Metadata | seeds · markers · ceremony defs |

**Generate Environment** may compile **one hero prompt** for the group batch (floor first) or sequential sub-assets — UI shows one button; Manager sequences internally.

---

## State Transitions (Founder-Visible)

```
Not Started
    → [Generate]
Preparing…        (ingest + compile — 2–8s)
Prompt Ready      (alpha: await founder copy OR future: auto-submit)
Generating…       (alpha: founder at FAL; future: provider job)
Awaiting Upload   (alpha only)
Reviewing Quality…
✓ Complete   OR   Needs Revision
```

---

## Parallelism (Hidden)

If Architecture unlocked and founder generates while Lighting still locked:

- Manager respects dependencies
- UI may show **Generating…** on one · **Queued** on another
- Founder does not coordinate — optional **Generate All Ready** (future)

---

## Error Flow

| Failure | Founder sees | Action |
|---------|--------------|--------|
| Compile fail | "Studio OS could not prepare prompt" | Retry · Contact (rare) |
| Validation fail | Needs Revision + report | Retry · Regenerate |
| Upload wrong format | Inline error on upload | Re-upload |
| Dependency race | Group stays locked | Wait (automatic) |

Never: stack trace · file path to fix manifest.

---

## Internal Knowledge Manifest

Studio Builder maintains `builder-knowledge-index.json` (implementation artifact):

```json
{
  "departmentId": "creative-direction",
  "ingestOnGenerate": [
    "docs/studio-os/alpha/environment-storytelling.md",
    "docs/studio-os/alpha/room-layout.md",
    "docs/studio-os/departments/creative-direction-studio/asset-manifest.json",
    "engines/studio-asset-registry/prompt-library.md"
  ],
  "genomeRefs": ["company", "project", "brand", "founder-journey", "room-dna"]
}
```

Founder never opens this file — Builder loads at department bind.

---

## Engine Delegation

| Step | Engine |
|------|--------|
| Ingest docs | Studio Builder knowledge layer |
| Compile prompt | Prompt Compiler™ / Asset Compiler expansion |
| Reuse check | Asset Registry™ |
| Queue | Generation Manager™ |
| Validate | Validation handoff + asset review rules |
| Store | Registry™ |
| Unlock | Builder dependency map + Manager graph |

---

_Production flow — one button, full studio behind the wall._
