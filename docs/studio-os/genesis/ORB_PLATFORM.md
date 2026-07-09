# Genesis Orb™ — Platform Runtime Guide

**Blueprint:** `genesis/articles/ORB.md`  
**Content home:** `genesis/orb/`  
**Runtime:** `src/studio-os-core/genesis/orb/`  
**Experience:** Persistent Studio Orb™ + Executive Workspace panel

---

## Status

Orb™ Launch Stack Stack 2 runtime is **implemented** with projection adapters and Genesis persistence.

---

## Runtime module

| Path | Responsibility |
|------|----------------|
| `constants.ts` | Subsystem identity, presence states, roles, memory tiers |
| `types.ts` | Store schemas, ready view, projection contracts |
| `persistence.ts` | Nested Genesis store key `orb` |
| `context/context-engine.ts` | OrbContextBundle assembly |
| `memory/memory-engine.ts` | Memory hierarchy and write proposals |
| `recommendations/recommendation-engine.ts` | Evidence-backed recommendation cards |
| `briefings/briefing-engine.ts` | Executive Briefing Engine |
| `missions/mission-advisor.ts` | Mission Advisor projection |
| `knowledge/knowledge-retrieval.ts` | Institute/Knowledge Core adapter |
| `creative/creative-partner.ts` | Content Engine / Foundry adapter |
| `decisions/decision-support.ts` | Decision support drafts |
| `conversation/timeline.ts` | Conversation timeline continuity |
| `attention/attention-engine.ts` | Interrupt / silence / recommend policy |
| `bootstrap/seed.ts` | Generic fixtures — no brand hardcoding |
| `engine.ts` | Public API |

---

## UI integration

| Component | Path |
|-----------|------|
| Executive Workspace panel | `src/components/admin/studio/studio-orb/StudioOrbExecutiveWorkspace.tsx` |
| Persistent Orb | `StudioOrb.tsx` + `StudioOrbMount.tsx` |
| Hook | `src/hooks/useOrbState.ts` |
| Provider wiring | `StudioOrbProvider.tsx` |

Open via radial menu **Orb Partner** (`executive-workspace` surface) or contextual Hero Object slot.

---

## Genesis integration

- `ensureOrbSubsystem()` in `ensureGenesisStore()`
- Framework module: `'orb'`
- Integrates with Executive Headquarters™ projections for company, briefing, missions

---

## API (selected)

```typescript
ensureOrbSubsystem(runtimeInput);
getOrbReadyView(runtimeInput);
getOrbPlatformStats(runtimeInput);
overrideOrbRecommendation(recommendationId);
recordFounderOrbMessage(content);
recordOrbResponse(content);
proposeOrbMemoryWrite(entry);
```
