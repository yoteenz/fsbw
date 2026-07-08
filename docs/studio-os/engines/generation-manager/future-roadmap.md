# Future Roadmap — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.roadmap`  
**Status:** v2+ orchestration evolution

---

## v1.0.0 (This Sprint) — Orchestration Spec

| Deliverable | Status |
|-------------|--------|
| Queue system spec | ✓ |
| Dependency engine | ✓ |
| State machine | ✓ |
| Retry engine | ✓ |
| Provider abstraction | ✓ |
| Validation handoff | ✓ |
| Registry integration | ✓ |
| Build report schema | ✓ |
| CDS pilot queue map | ✓ |

**Not in v1:** FAL connection · UI · parallel execution · implementation.

---

## v1.1 — First CDS Production Run

| Milestone | Description |
|-----------|-------------|
| FAL adapter (primary) | First live provider connection |
| Job ingest from sealed package | Compiler handoff |
| Sequential queue execution | Safe default concurrency=1 |
| Per-asset validation handoff | Automated gates |
| Generation Build Report | Live output |
| Founder progress API | Pause · resume · status (no full UI) |

**Success:** `gen-job-cds-golden-v1` completes with 0 required failures.

---

## v1.2 — OpenAI + Audio Providers

| Provider | Assets |
|----------|--------|
| OpenAI Images | Fallback mesh · texture |
| ElevenLabs | CDS audio trio |
| Failover chains live | Per retry engine |

---

## v1.3 — Founder Production UI

| Feature | Description |
|---------|-------------|
| Progress view | Spec mockup → implementation |
| Per-group expand | Asset-level detail |
| Prioritize · regen controls | Founder actions |
| Build Report viewer | In-admin production panel |

**Route (future):** `/admin/studio/generation-manager` or embedded in department production flow.

---

## v2.0 — Parallel Generation

| Capability | Description |
|------------|-------------|
| `maxConcurrentPerStage` | 3+ parallel within stage |
| `maxConcurrentGlobal` | 5+ with dependency safety |
| Stage batch dispatch | Architecture parallel |
| Critical path optimization | Scheduler minimizes wall clock |

**Target:** CDS cook 151 min → **< 60 min** wall clock.

---

## v2.1 — Multi-Provider Simultaneous

| Capability | Description |
|------------|-------------|
| Split queue by provider | FAL + OpenAI + ElevenLabs parallel |
| Provider health routing | Real-time degradation |
| Cost optimizer | Cheapest capable provider |
| A/B provider bake-off | Same asset · two providers · pick best |

---

## v2.2 — Cloud Render Queues

| Capability | Description |
|------------|-------------|
| Remote worker pool | Vercel · dedicated render nodes |
| Queue persistence | Cross-region resume |
| Priority lanes | Golden · marketplace · standard |
| Org quota management | Credits · rate limits |

---

## v2.3 — Scheduled & Background

| Capability | Description |
|------------|-------------|
| Overnight generation | Founder queues · wakes to complete |
| Background rendering | Continue while founder in other departments |
| Scheduled cook | "Generate CDS tonight at 2am" |
| Notification on complete | Push · email · Command Dock |

Aligns with Anticipation Engine™ proactive prep.

---

## v3.0 — Enterprise Generation Farms

| Capability | Description |
|------------|-------------|
| Multi-tenant job isolation | Org-scoped workers |
| Marketplace pack generation | Bulk pack cooks |
| Collaborative production | Multiple founders · shared queue |
| Render farm autoscaler | Demand-based workers |
| SLA tiers | Premium faster queues |

---

## v3.1 — Intelligent Orchestration

| Capability | Source |
|------------|--------|
| ML retry optimization | Learn from failure classes |
| Predictive ETA | Historical job data |
| Auto-prioritize critical path | Scheduler AI |
| Provider benchmark routing | Model Orchestrator™ scores |

---

## Integration Roadmap

| Phase | Integration |
|-------|-------------|
| v1.1 | Compiler package ingest |
| v1.1 | Registry write on approve |
| v1.2 | Production pipeline Stage 03 execution |
| v1.3 | Validation Loop package token |
| v2.0 | Runtime notification automation |
| v2.3 | Mission Control production panel |
| v3.0 | Marketplace pack jobs |

---

## Explicit Non-Goals

| Non-Goal | Owner Engine |
|----------|--------------|
| Prompt expansion | Asset Compiler™ |
| Department definition | Department Generator™ |
| Quality authority | Validation Loop™ |
| Permanent library schema | Asset Registry™ |
| Scene assembly | Cursor / Runtime |
| New governance framework | — |

---

## Success Metrics by Phase

| Phase | Metric |
|-------|--------|
| v1.1 | CDS job 100% required pass |
| v2.0 | Wall clock < 50% Compiler estimate |
| v2.3 | 80% jobs complete overnight unattended |
| v3.0 | 10+ concurrent department cooks |
| Long-term | Founder zero prompt exposure — 100% |

---

_Future Roadmap — from coordinator spec to production factory at scale._
