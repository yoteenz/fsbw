# Future Roadmap — Prompt Composer™

**Engine:** `studio.prompt-composer.v1`  
**Last updated:** 2026-07-08

---

## v1.0.0 — Architecture Sprint (This Sprint) ✓

| Deliverable | Status |
|-------------|--------|
| Engine README · mission · law | ✓ |
| Founder Intent Translation™ | ✓ |
| Composition Sources™ (12 layers) | ✓ |
| Assembly Pipeline™ | ✓ |
| Production Prompt Schema™ | ✓ |
| Provider-Neutral Contract™ | ✓ |
| Provider Optimizer™ handoff contract | ✓ |
| Compiler Convergence™ | ✓ |
| Cross-refs CIE · Registry · Generation Manager | ✓ |

**No implementation · no UI · no provider SDKs.**

---

## v1.1 — Provider Optimizer™ Engine

| Item | Priority |
|------|----------|
| Dedicated `docs/studio-os/engines/provider-optimizer/` pack | P0 |
| FAL adapter (first) | P0 |
| OpenAI Images adapter | P0 |
| Flux / BFL adapter | P1 |
| Imagen adapter | P1 |
| Org provider policy enforcement | P0 |
| Health-based failover | P1 |

---

## v1.2 — Compose Service

| Item | Priority |
|------|----------|
| `composeProductionPrompt()` API contract | P0 |
| Genome snapshot fetch integration | P0 |
| Registry fragment loader | P0 |
| Compose validation · enrichment | P0 |
| ComposeAuditRecord storage | P1 |
| CDS Story Table™ first intent compose | P0 |

---

## v1.3 — Compiler Native Output

| Item | Priority |
|------|----------|
| Compiler writes `ProductionPrompt™` not `ExpandedPromptStack` | P0 |
| `13_prompts/` migration script spec | P1 |
| Unified `promptVersion` lineage | P0 |

---

## v1.4 — Intelligence Upgrades

| Item | Priority |
|------|----------|
| Semantic fragment matching | P1 |
| Founder taste genome compose weighting | P1 |
| Thin-compose auto-enrich ML assist | P2 |
| Cross-department prompt recipe reuse scoring | P1 |

---

## v2.0 — Provider Expansion

| Item | Priority |
|------|----------|
| Runway video adapter | P1 |
| Luma 3D adapter | P2 |
| ElevenLabs audio compose path | P1 |
| Plugin adapter registry for future providers | P0 |

---

## Dependencies

| Upstream | Relationship |
|----------|--------------|
| Creative Interpreter™ | Structured request input |
| Scene Planner™ | GenerationLineItem input |
| Blueprint Engine™ | Scope authority |
| Asset Registry™ | Fragments · reuse · promptVersion storage |
| Company Genome™ | DNA injection |
| Generation Manager™ | Downstream execution |

---

## Forbidden Until v2+

- Founder prompt textarea in any UI
- FAL-only compose paths
- Provider selection inside Composer
- Skipping Registry references on compose

---

_Future Roadmap — translation layer first, adapters second, execution third._
