# Executive Headquarters™ — Platform Runtime Guide

**Blueprint:** `genesis/articles/EXECUTIVE_HEADQUARTERS.md`  
**Content home:** `genesis/executive-headquarters/`  
**Runtime:** `src/studio-os-core/genesis/executive-headquarters/`  
**Experience route:** `/admin/studio/executive-headquarters`

---

## Status

Executive Headquarters™ Launch Stack Sprint 1 runtime is **implemented** with projection adapters and an immersive headquarters shell.

---

## Runtime module

| Path | Responsibility |
|------|----------------|
| `constants.ts` | Subsystem identity, room IDs, maturity levels |
| `types.ts` | Store schemas and projection contracts |
| `persistence.ts` | Nested Genesis store key `executiveHeadquarters` |
| `rooms/registry.ts` | Platform room registry (generic, expandable) |
| `navigation/routing.ts` | Spatial room routing |
| `projections/` | Briefing, health, mission, company, room adapters |
| `bootstrap/seed.ts` | Generic fixtures — no brand hardcoding |
| `engine.ts` | Public API + Build Order status hook |

---

## Projections (v1)

| Projection | Owning system (future) |
|------------|------------------------|
| `HeadquartersCompanyProjection` | Identity Engine™ / Company Genome™ |
| `HeadquartersBriefingProjection` | Ambient Awareness™ |
| `HeadquartersHealthProjection` | Company Health Index™ / Analytics™ |
| `HeadquartersMissionProjection` | Mission Engine™ |
| `HeadquartersRoomProjection` | Atlas™ / Executive Headquarters™ |

Headquarters owns **experience composition only**. Source truth remains in owning systems.

---

## Experience shell

| Component | Path |
|-----------|------|
| Workspace | `src/components/admin/studio/executive-headquarters/ExecutiveHeadquartersWorkspace.tsx` |
| Shell | `ExecutiveHeadquartersShell.tsx` |
| Hook | `src/hooks/useExecutiveHeadquartersState.ts` |
| Page | `src/pages/admin/studio/executive-headquarters/page.tsx` |

### Launch Stack v1 rooms (live)

- Executive Atrium™
- Founder Office™
- Mission Control™
- Daily Briefing™
- Command Center™ (guarded)
- Department Directory™
- Orb Dock™ (persistent)
- Company Pulse™
- Mission Queue™
- Executive Advisories™

Locked future rooms render with meaningful unlock explanations.

---

## Genesis integration

- `ensureExecutiveHeadquartersSubsystem()` in `ensureGenesisStore()`
- Framework module: `'executive-headquarters'`
- Build Order marks `executive-headquarters` as `implemented` when seeded

---

## API (selected)

```typescript
ensureExecutiveHeadquartersSubsystem();
getExecutiveHeadquartersReadyView(roomId?);
openExecutiveHeadquartersRoom(roomId);
getExecutiveHeadquartersPlatformStats();
listHeadquartersNavigationRooms();
```
