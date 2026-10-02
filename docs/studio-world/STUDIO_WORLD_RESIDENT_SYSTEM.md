# Studio World Resident System — Season 1 Foundation

**Status:** Season 1 foundation + **Resident Life OS Foundation2** (canon, domain, in-memory simulation services, PG schema — no UE, no public storefront)  
**Module:** `src/studio-os-core/studio-world-residents/` (+ `life-os/`)  
**QA surface:** `/__studio-world/residents` (registry + Life OS inspector — debug only)

## Terminology lock

| Layer | Meaning |
|-------|---------|
| **SITE 00** | Brand / identity inception |
| **Studio OS** | Internal machinery, pipelines, orchestration |
| **Studio World** | Living digital office ecosystem — **this system** |

Residents are **Studio World** cast, not Studio OS UI labels.

## Core model

1. **Canonical person** — one persistent identity (`SW-RESIDENT-###`)
2. **Cast role** — client/project persona via `ResidentCastRoleContract` (must not mutate canon)

**Etta Vale** is `SW-RESIDENT-001`. UE / MetaHuman are **embodiment targets** only; canon lives in the domain registry first.

## Season 1 cast (8)

| ID | Name | Core world role |
|----|------|-----------------|
| SW-RESIDENT-001 | Etta Vale | Founding presence / creative director |
| SW-RESIDENT-002 | Zuri Hale | Strategy / client intelligence |
| SW-RESIDENT-003 | Jules Mercer | Front office / concierge |
| SW-RESIDENT-004 | Noa Kline | Systems architect / Studio OS liaison |
| SW-RESIDENT-005 | Caspian Reed | World director |
| SW-RESIDENT-006 | Iona Wells | Fabrication lead |
| SW-RESIDENT-007 | Marlowe Saint | Casting director |
| SW-RESIDENT-008 | Elio Vahn | Tenancy / expansion |

## Subdomains

| Domain | Location |
|--------|----------|
| Residents + registry | `registry.ts`, `season1-residents.ts` |
| Relationships | `season1-relationships.ts`, `relationship-graph.ts` |
| Documentary profiles | `season1-documentary.ts` |
| Cast contracts | `casting.ts`, `types.ts` |
| Access / unlock | `access.ts` (no pricing) |
| Social story schema | `social-story.ts` |
| Fabrication | `fabrication.ts` |
| Canon versioning | `canon-versioning.ts` |

## Persistence

Postgres tables (Season 1 IDs seeded; full canon JSON remains source-controlled in repo):

- `studio_world_residents`
- `studio_world_resident_relationships`
- `studio_world_resident_cast_role_contracts`
- `studio_world_resident_access_grants`
- `studio_world_resident_documentary_profiles`
- `studio_world_resident_fabrication_requirements`

Migrations:

- `supabase/migrations/20261002143000_studio_world_resident_system_season1.sql` (Foundation1)
- `supabase/migrations/20261002180000_studio_world_resident_life_os_foundation2.sql` (Life OS)

Life OS architecture: `docs/studio-world/RESIDENT_LIFE_OS_ARCHITECTURE.md`

## Related systems (not duplicated)

- **Virtual Production** (`studio_vp_characters`) — brand-scoped production characters (e.g. Nia). Link optionally via `externalCharacterKeys`; does not define Studio World resident identity.
- **Production governance** — org entitlements for compute/platform; resident access grants are a separate talent/unlock domain.

## Spatial Architecture Review

**SKIPPED —** foundational domain + internal debug QA only; no new founder-facing Studio World navigation or public surfaces.
