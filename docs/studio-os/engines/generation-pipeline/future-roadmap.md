# Future Roadmap — Generation Pipeline™

**Engine:** `studio.generation-pipeline.v1`  
**Last updated:** 2026-07-08

---

## v1.0.0 — Architecture Sprint (This Sprint) ✓

| Deliverable | Status |
|-------------|--------|
| Master production engine README | ✓ |
| Twelve pipeline stages | ✓ |
| Layer-by-layer generation order | ✓ |
| Founder controls (5 actions) | ✓ |
| Pre-generation estimates | ✓ |
| Remember-first integration | ✓ |
| Generation Queue · Quality · Assembly stages | ✓ |
| Engine orchestration map | ✓ |
| Cross-refs all production engines | ✓ |

**No implementation · no UI · no provider execution.**

---

## v1.1 — Pipeline Coordinator Service

| Item | Priority |
|------|----------|
| `GenerationPipelineCoordinator` API | P0 |
| Stage state machine implementation | P0 |
| Estimate gate enforcement | P0 |
| CDS Story Table™ first full pipeline run | P0 — [Story Table™ Hello World](../../benchmarks/story-table-hello-world/README.md) |
| Progressive assembly preview | P1 |

---

## v1.2 — Provider Optimizer Engine

| Item | Priority |
|------|----------|
| Dedicated provider-optimizer/ pack | P0 |
| Dry-run provider usage estimates | P0 |
| FAL + OpenAI adapters | P0 |

---

## v1.3 — Founder Workstation Integration

| Item | Priority |
|------|----------|
| Pipeline™ workstation controls | P0 |
| Per-layer approval UI (diegetic) | P1 |
| Orb narration per stage | P0 |
| Five founder controls wired | P0 |

---

## v1.4 — Analytics

| Item | Priority |
|------|----------|
| Pipeline run audit trail | P1 |
| Estimate vs actual reconciliation | P1 |
| Reuse rate dashboard (Studio Alpha™) | P2 |

---

## Dependencies

All sub-engines must be contract-stable:

- Prompt Composer™ v1.0 ✓
- Scene Planner™ v1.0 ✓
- Asset Registry™ v1.1 ✓
- Generation Manager™ v1.0 ✓
- Production Estimates™ v1.0 ✓

---

## Forbidden Until v2+

- Monolithic full-scene generation
- Skip pre-generation estimate gate
- Skip Registry Check per layer
- Provider execution before estimate approval
- Founder-facing provider details

---

_Future Roadmap — orchestrate first, execute second, publish last._
