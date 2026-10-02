# Studio World Resident Life OS — Architecture (Foundation2)

**Sprint:** `P0.STUDIOWORLD.RESIDENT-LIFE-OPERATING-SYSTEM.FOUNDATION2`  
**Module:** `src/studio-os-core/studio-world-residents/life-os/`  
**Version:** `foundation2-v1`  
**QA:** `/__studio-world/residents` (Life OS inspector sections)

**Runtime (Simulation1):** See `RESIDENT_LIFE_RUNTIME.md` — persistence repositories, manual debug tick, return brief. Prod apply **pending verification**.

## North star

Residents are persistent digital coworkers with lives, work, memory, relationships, and autonomy bounded by founder-gated real-world actions. The simulation supports organizational operating value — not a game skin, chatbot collection, or HR dashboard.

## Layering (extends Season 1 — do not duplicate)

| Layer | Season 1 (Foundation1) | Foundation2 |
|-------|------------------------|-------------|
| Identity / cast / access | `types.ts`, `casting.ts`, `access.ts` | Unchanged |
| Relationships (graph) | `season1-relationships.ts` | Life dimensions + sentiments (runtime) |
| Documentary | `season1-documentary.ts` | Observes simulation; no parallel fake reality |
| Life simulation | — | `life-os/*` |

## Interconnected subsystems (30 → one model)

All subsystems share:

- **Event envelope** (`event-envelope.ts`) — append-only history + materialized slices
- **Ground truth vs belief** — `studio_world_resident_social_truth_events` vs `studio_world_resident_beliefs`
- **Resident Life Twin aggregate** (`life-twin-model.ts`) — composed views, not one JSON blob
- **Founder gate** (`founder-gate.ts`) — blocks real-world side effects in simulation
- **Domain firewall** — `STUDIO_WORLD_RESIDENT` ≠ `HUMAN_EMPLOYEE` ≠ `BRAND_VP_CHARACTER` ≠ cast role

## Implementation status (Foundation2)

| Capability | Canon | Schema | Persisted (PG) | In-memory services | QA visible |
|------------|-------|--------|----------------|--------------------|------------|
| Life Twin aggregate | ✓ | ✓ | ✓ tables | ✓ seed + APIs | ✓ |
| Current state / presence | ✓ | ✓ | ✓ | ✓ | ✓ |
| Needs + causes | ✓ | ✓ | ✓ | ✓ | ✓ |
| Autonomy / agency | ✓ | ✓ | partial | ✓ | ✓ |
| Memory classes + significance | ✓ | ✓ | ✓ | ✓ | ✓ |
| Knowledge / belief | ✓ | ✓ | ✓ | ✓ | ✓ |
| Social truth + rumor | ✓ | ✓ | ✓ | ✓ | ✓ |
| Career / employment events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Founder interventions | ✓ | ✓ | ✓ | ✓ | ✓ |
| Organizational memory | ✓ | ✓ | ✓ | ✓ | ✓ |
| Return brief | ✓ | ✓ | events | ✓ | deferred UI |
| Workforce training canon | ✓ | ✓ | ✓ | ✓ | partial |
| Human employee learning profile | ✓ | ✓ | ✓ | ✓ | partial |
| Full autonomous runtime / ticks | planned | — | — | **deferred** | — |

## Service surface

Primary entry: `life-os/life-os-services.ts` — `getResidentLifeTwin`, `recordSocialEvent`, `propagateRumor`, `evaluateFounderGate`, `getReturnBrief`, training APIs, etc.

## Migrations (order)

1. `20261002143000_studio_world_resident_system_season1.sql` (Foundation1)
2. `20261002180000_studio_world_resident_life_os_foundation2.sql` (Foundation2)

## Spatial Architecture Review

**SKIPPED —** internal domain + debug inspector extension only; no new public Studio World navigation.
