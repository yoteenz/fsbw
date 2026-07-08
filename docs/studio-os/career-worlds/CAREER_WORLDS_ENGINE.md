# Career Worlds™ Engine — Implementation Guide

**Status:** Foundation sprint (ARTICLE-E02 extension)  
**Location:** `src/studio-os-core/career-worlds/`  
**Route:** `/admin/studio/career-worlds`

Career Worlds™ extends the **Profession Simulation Engine™** into **persistent professional realities**. This is **not** Frontal Slayer Academy and **not** a learning management system. Every profession (Hair, Marketing, Architecture, Finance, Healthcare, Construction, etc.) plugs into the same reusable engine.

---

## Architecture

```
career-worlds/
├── core/schemas.ts          # World, player, NPC, clock, save schemas
├── catalog.ts               # Profession blueprints (12 worlds)
├── worlds/                  # World initialization + save bundling
├── world-clock/             # Daily / weekly / monthly / yearly clock
├── economy/                 # Economy index + income multipliers
├── reputation/              # Reputation tiers + promotion progress
├── industry-events/         # Event template registry + spawning
├── company-life/            # Jobs, projects, company growth
├── social-network/          # NPC ecosystem + memory
├── career-history/          # Promotion + milestone history
├── portfolio/               # Published work store
├── awards/                  # Award catalog + eligibility
├── persistence/             # localStorage save model (+ Supabase adapter type)
├── simulation/              # Offline catch-up tick engine
├── career-hub/              # Career Hub view model (replaces course dashboard)
└── engine.ts                # Public orchestration API
```

---

## Core schemas

| Schema | Purpose |
|--------|---------|
| `CareerWorldState` | Economy, trends, jobs, projects, events, seasons |
| `CareerPlayerProfile` | Title, XP, skills, certs, income, business, reputation |
| `CareerNpcProfile` | Conversations, trust, projects, employment/teaching history |
| `WorldClockState` | Scheduled conferences, competitions, technology shifts |
| `CareerWorldSave` | Full persistent save: `{worldId}:{learnerId}` |

---

## Public API (`engine.ts`)

| Function | Description |
|----------|-------------|
| `bootstrapCareerWorld(worldId, learnerId)` | Create or load save |
| `syncCareerWorldOnReturn(worldId, learnerId)` | Advance simulation on return |
| `getCareerHub(worldId, learnerId)` | Build Career Hub view model |
| `runSimulationTick(save)` | Low-level tick (economy, events, reputation) |
| `persistCareerWorldSave(save)` | Write save after UI mutations |

**React hook:** `useCareerWorldState(worldId)` — subscribes to `studio-career-worlds-updated`.

---

## Adding a new profession world

1. **Blueprint** — Add entry to `catalog.ts`:
   - `profession`, `worldQuestion`, `canonicalDistricts`
   - `npcArchetypes`, `mentorArchetypes`, `clientArchetypes`
   - `challengeLoops`, `economy`, `graphTags`
2. **ID** — Extend `CAREER_WORLD_IDS` in `types.ts`.
3. **No engine changes** — Initialization reads blueprint fields generically.
4. **Optional content packs** — Profession-specific districts, event copy, or NPC voice can layer on top without forking core modules.

---

## Extension points

| Layer | Extend via |
|-------|------------|
| World seed | `createInitialWorldState(blueprint)` |
| Clock schedules | `createInitialWorldClock()` + blueprint-driven entries |
| Events | `INDUSTRY_EVENT_TEMPLATES` in `industry-events/registry.ts` |
| Economy | `tickEconomy(worldState, blueprint, days)` |
| Company life | `tickCompanyLife(worldState, blueprint, days)` |
| NPCs | `createNpcFromArchetype()` + conversation memory APIs |
| Awards | `AWARD_CATALOG` + `eligibleAward()` rules |
| Persistence | Implement `CareerWorldPersistenceAdapter` for Supabase |
| UI surfaces | `buildCareerHubViewModel()` + profession-themed shells |

---

## Simulation clock

- **Offline ratio:** `CAREER_WORLD_HOURS_PER_SIM_DAY = 1` (1 real hour ≈ 1 sim day)
- **Granularity:** daily, weekly, monthly, yearly via `WorldClockScheduleEntry`
- **On return:** `syncCareerWorldOnReturn` computes offline hours → sim days → ticks economy, company life, events, reputation

---

## Career Hub™

Replaces "Course Dashboard." Displays:

- Current role, phase, simulated time
- Today's schedule, upcoming appointments
- Promotion progress, reputation tier
- Mentor feedback, world news, community activity
- Industry challenges, active projects, open jobs

**Prototype:** `CareerHubWorkspace.tsx` at `/admin/studio/career-worlds`.

---

## Storage

- **Key:** `studioCareerWorlds_v1` (localStorage)
- **Version:** `CAREER_WORLDS_ENGINE_VERSION`
- **Event:** `studio-career-worlds-updated` (cross-tab / hook refresh)

Future: swap `readCareerWorldStore` / `writeCareerWorldStore` for Supabase via `CareerWorldPersistenceAdapter` without changing simulation code.

---

## Related docs

- `docs/studio-os/career-worlds/ARTICLE_E02_CAREER_WORLDS.md` — architecture article
- `motherboard/CORE.md` — Career Worlds canon entry
