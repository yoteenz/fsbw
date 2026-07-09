# The Evolution Room™ — Platform Runtime

**Architecture:** `genesis/articles/EVOLUTION_ROOM.md`  
**Runtime:** `src/studio-os-core/genesis/evolution-room/`  
**UI:** `/admin/studio/evolution-room`  
**Hook:** `src/hooks/useEvolutionRoomState.ts`  
**Genesis key:** `evolutionRoom` in `genesis_v1` localStorage

---

## Routes

| Path | Experience |
|------|------------|
| `/admin/studio/evolution-room` | Evolution Room™ · Orb Presentation Mode™ meeting flow |
| `/admin/studio/evolution-room/executive-review` | Executive Review |
| `/admin/studio/evolution-room/evolution-brief` | Executive Evolution Brief™ |
| `/admin/studio/evolution-room/monthly-review` | Monthly Review · Founder Timeline™ |
| `/admin/studio/evolution-room/genesis-proposals` | Genesis Proposal Queue™ |
| `/admin/studio/evolution-room/evolution-council` | Evolution Council™ |
| `/admin/studio/evolution-room/future-wall` | Future Wall™ · Automation · Strategic Priorities |
| `/admin/studio/evolution-room/legacy-wall` | Legacy Wall™ · Legacy Timeline™ |

---

## Runtime modules

| Module | Path | Purpose |
|--------|------|---------|
| Brief engine | `brief/brief-engine.ts` | Executive Evolution Brief™ from LVS + FAT signals |
| Founder timeline | `founder-timeline/timeline-engine.ts` | Founder Timeline™ from diary + architectural history |
| Launch stack | `launch-stack/launch-stack-engine.ts` | Launch Stack Progress™ (FAT) |
| Genesis queue | `genesis-queue/proposal-queue-engine.ts` | Genesis Proposal Queue™ (LVS proposals) |
| Legacy wall | `legacy-wall/legacy-engine.ts` | Legacy Timeline™ preservation |
| Future wall | `future-wall/future-engine.ts` | Future Opportunities™ |
| Automation | `automation/automation-engine.ts` | Automation Suggestions™ |
| Priorities | `priorities/priorities-engine.ts` | Strategic Priorities™ |
| Council | `council/council-engine.ts` | Evolution Council™ agenda |
| Meeting flow | `session/meeting-flow-engine.ts` | Ceremonial 11-stage session |
| Archive | `session/session-archive-engine.ts` | Session seal + Legacy/Future updates |

---

## Meeting flow (Orb Presentation Mode™)

```text
Arrival → Orb Executive Greeting → Monthly Highlights → Company Performance
→ Knowledge Review → Launch Stack Progress → Genesis Opportunities
→ Future Recommendations → Founder Decisions → Meeting Summary → Archive Session
```

Every completed session generates:

- Executive Summary™
- Action Items™
- Genesis Improvement Proposals™ (references)
- Mission Recommendations™
- Knowledge Updates™
- Future Launch Stack Suggestions™

---

## Integration

- **`ensureEvolutionRoomSubsystem()`** in `ensureGenesisStore()` chain
- Depends on **Live Validation System™** and **Founder Acceptance Testing™**
- Reuses `listImprovementProposals()` from LVS (never auto-modifies Genesis)
- Marble/glass immersive UI — not a dashboard

---

## Constitutional rule

```text
Nothing becomes canon automatically.
```

Decisions and proposals require founder review in Evolution Council™ and Genesis Review.
