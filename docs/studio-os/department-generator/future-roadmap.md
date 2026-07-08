# Future Roadmap — Department Generator v2+

**Status:** Evolution plan for Studio Department Generator™ schema and engine layers  
**Current version:** v1.0.0 (schema + engine docs only — no implementation)

---

## v1.0.0 — Complete (This Sprint)

| Deliverable | Location |
|-------------|----------|
| Engine architecture (18 docs) | `docs/studio-os/engine/department-generator/` |
| Schema & output layer (9 docs) | `docs/studio-os/department-generator/` |
| Golden validation project spec | `docs/studio-os/golden-department/creative-direction-studio/` |

**v1 defines the machine.** No React · no Three.js · no UI.

---

## v1.1 — Schema Hardening

| Item | Description |
|------|-------------|
| JSON Schema files | Formal `.schema.json` for every manifest type |
| Validator CLI | `validate-department-package` checks output folder structure |
| Golden fixture | `generated/creative-direction/1.0.0/` reference output (JSON only) |
| Cross-engine type sync | Shared types with `studio.asset-compiler.v1` · `studio.department-runtime.v1` |

---

## v1.2 — First Live Generation

| Item | Description |
|------|-------------|
| Prompt compiler implementation | DNA + Room DNA → `prompts/*.md` |
| Creative Direction compile run | First end-to-end `pkg-creative-direction-golden-v1` |
| Asset Compiler integration | `generation-instruction-set.json` → cooked assets |
| Validation Loop gate | Package must pass before Runtime install |

Success criterion: Generated Creative Direction Studio™ feels indistinguishable from Golden Department intent.

---

## v2.0 — Multi-Department Scale

| Item | Description |
|------|-------------|
| Department type registry API | Register new types without engine code changes |
| Industry pack compiler | Law firm · salon · restaurant templates from Industry DNA |
| Marketplace export pipeline | `15_MARKETPLACE_EXPORT.md` → installable packs |
| Reuse library | Cross-department asset matching by `reuseCategory` |
| Batch generation | Generate N departments from Headquarters expansion manifest |

Target: **hundreds of departments** assembled from reusable generated assets.

---

## v2.1 — Room DNA Evolution

| Item | Description |
|------|-------------|
| Slider inheritance | Child rooms inherit parent HQ Room DNA baseline |
| Surgical regen UI contract | `regenerationScopes` from `room-dna.json` → Revision Engine |
| A/B room variants | Same topology · two Room DNA snapshots · Validation Loop picks winner |
| Founder slider overrides | Walk the Room™ critique → Room DNA adjustment directives |

---

## v2.2 — Procedural Assembly++

| Item | Description |
|------|-------------|
| Physics-enabled departments | Workshop · production floors with collision |
| Multi-room departments | Connected zones with portal transitions |
| Dynamic furniture | `autoDistribute` uses ML density from department category |
| Live genome re-injection | Brand refresh without full regen |

---

## v3.0 — Industry Operating System

| Item | Description |
|------|-------------|
| Vertical compilers | Fuel tax · medical intake · restaurant kitchen — industry object libraries |
| Concierge auto-roster | AI Team Compiler generates industry-appropriate staff |
| Compliance overlays | Legal · medical · finance interaction permission gates |
| Multi-brand campus | Same Generator · different Genome per brand wing |

---

## v3.1 — Intelligence Loop

| Item | Description |
|------|-------------|
| Learning Engine feedback | Validation Loop outcomes → prompt compiler tuning |
| Critique Session → Room DNA | Action items auto-compile to regen scopes |
| Founder Journey adaptation | Maturity stage influences default Room DNA ranges |
| Walk the Business presence | Department usage signals → interaction map refinement |

---

## v4.0 — Autonomous Department Birth

| Item | Description |
|------|-------------|
| Natural language intake | Founder describes department → structured DNA resolution |
| Auto QA + self-revision | Generator runs Validation Loop internally before founder sees output |
| Cross-company template marketplace | Verified packs with Room DNA presets |
| Real-time department evolution | Living departments regen subsystems without downtime |

---

## Non-Goals (Permanent)

| Never | Why |
|-------|-----|
| Flattened background departments | Violates modular asset law |
| Founder manual FAL prompts | Generator compiles all prompts |
| Dashboard-as-department | SDK place-not-page law |
| Generator implements Runtime | Boundary: Generator creates · Runtime executes |
| UI in Generator repo | Schema and engine docs only until implementation phase |

---

## Dependency Graph

```
v1 Schema (this sprint)
    ↓
v1.1 JSON Schema + validator
    ↓
v1.2 Creative Direction live generation
    ↓
v2 Multi-department + Marketplace
    ↓
v3 Industry OS + compliance
    ↓
v4 Autonomous birth
```

Parallel tracks: Room DNA (v2.1) · Assembly (v2.2) · Intelligence Loop (v3.1) can ship independently once v1.2 succeeds.

---

## Success Metrics

| Milestone | Metric |
|-----------|--------|
| v1.2 | Creative Direction package passes Generator QA + Validation Loop |
| v2.0 | 10+ department types generated from same engine |
| v2.0 | 30%+ assets reused across departments via `reuseCategory` |
| v3.0 | 3+ industries with distinct object libraries |
| v4.0 | New department from founder description in < 1 generation cycle |

---

## Related Roadmaps

| Engine | Roadmap location |
|--------|------------------|
| Asset Compiler | `engine/asset-compiler/15_IMPLEMENTATION_GUIDE.md` |
| Department Runtime | `engine/department-runtime/21_RUNTIME_QA.md` |
| Validation Loop | `engine/validation-loop/16_IMPLEMENTATION_GUIDE.md` |
| Golden Department | `golden-department/` experience narrative |

---

_Studio Department Generator™ — the engine that scales Studio OS to every industry._
