# ARTICLE-E02 — Career Worlds™

**Status:** Accepted architecture  
**System:** Career Worlds™  
**Layer:** Persistent professional-life worlds  
**Version:** 1.0.0  
**Era:** Era 2 — World™ foundation, implemented as Era 1 graph/canon substrate

---

## One sentence

**Studio World does not create Academies; it creates Career Worlds™ — persistent professional lives where learners inhabit, build, and eventually transform a profession.**

---

## Why E02 exists

The Profession Simulation Engine™ established that professional growth should be practiced inside simulations rather than consumed as passive lessons.

Career Worlds™ moves one level higher.

The question is not:

> What lesson are you taking today?

The question is:

> What kind of life are you building?

Education becomes an alternate professional reality. A learner does not enter a course. They enter Hair World™, Marketing World™, Architecture World™, or another living professional world and begin building a persistent career identity.

---

## Core philosophy

Career Worlds™ blur the line between:

- learning,
- career,
- game,
- simulation,
- community,
- professional network,
- business,
- personal growth.

Traditional education packages knowledge into lessons and completion states.

Career Worlds™ package knowledge into a persistent life.

The learner accumulates reputation, income, relationships, work history, portfolio, certifications, promotions, clients, and influence. Over time, the learner can become a master professional who mentors future generations.

---

## Relationship to Profession Simulation Engine™

| System | Responsibility |
|--------|----------------|
| **Career Worlds™** | Owns the persistent profession world: places, companies, economy, identity, progression, community, seasons, events, and endgame mastery. |
| **Profession Simulation Engine™** | Runs professional scenarios inside the world: clients, tasks, decisions, coworkers, feedback, market consequences, and practice loops. |
| **Profession Brain™** | Supplies domain knowledge, judgment, standards, vocabulary, and professional reasoning. |
| **World Graph™** | Stores the canonical relationships between worlds, careers, identity, reputation, events, places, and future mastery. |
| **Studio World Atlas™** | Projects Career Worlds spatially as discoverable worlds, districts, workplaces, and paths. |

The simulation engine is the runtime.

The Career World is the life.

---

## What a Career World contains

Every profession receives a living world with:

- companies,
- workplaces,
- districts,
- NPC professionals,
- mentors,
- clients,
- suppliers,
- competitors,
- economy,
- events,
- challenges,
- promotions,
- industry news,
- seasonal changes,
- community achievements.

Implemented catalog:

- Hair World™
- Marketing World™
- Architecture World™
- Construction World™
- Photography World™
- Film World™
- Music World™
- Finance World™
- Fashion World™
- Legal World™
- Healthcare World™
- Restaurant World™

Core implementation:

```ts
CAREER_WORLD_BLUEPRINTS
CAREER_WORLD_BLUEPRINT_BY_ID
listCareerWorlds()
getCareerWorld(id)
buildCareerWorldRuntimeSnapshot(...)
```

Path:

```text
src/studio-os-core/career-worlds/
```

---

## Time never stops

Career Worlds™ must feel alive even when the learner is offline.

Offline evolution includes:

- clients continue booking,
- coworkers continue working,
- competitors continue improving,
- market demand shifts,
- economies fluctuate,
- new technologies emerge,
- industry news changes context,
- seasonal opportunities open,
- community achievements unlock.

Implementation principle:

> Offline time should update world state as signals, opportunities, and consequences — not as punitive decay.

Early implementation exposes this as `buildCareerWorldRuntimeSnapshot(...)`, which reports:

- offline delta,
- active events,
- market signals,
- reputation signals,
- recommended next professional-life actions.

Future runtimes can replace snapshot heuristics with full background simulation without changing the Career World model.

---

## Identity

Each learner owns a persistent professional identity:

- reputation,
- resume,
- portfolio,
- income,
- network,
- certifications,
- achievements,
- promotion history,
- mentorship history,
- industry influence.

This identity should eventually become portable across:

- Studio World profile,
- Expert Marketplace™,
- Professional Trust Framework™,
- Career World communities,
- portfolios,
- certification surfaces,
- business ownership surfaces.

---

## Life progression

Progression is not only skills.

The learner eventually:

- starts a business,
- hires employees,
- opens new locations,
- mentors apprentices,
- invents new techniques,
- publishes research,
- speaks at conferences,
- wins industry awards,
- changes the profession itself.

Canonical phases:

1. Entry
2. Apprentice
3. Operator
4. Specialist
5. Leader
6. Founder
7. Master Professional
8. Mentor

Career Worlds™ therefore have no traditional “course completion” end state. The endgame is contribution, mastery, and generational teaching.

---

## World Graph model

ARTICLE-E02 registers:

- `W-ENG-career-worlds` — Career Worlds™ engine
- `W-ENG-profession-simulation-engine` — approved runtime layer
- one `district` node per Career World blueprint:
  - `W-DST-hair-world`
  - `W-DST-marketing-world`
  - `W-DST-architecture-world`
  - etc.

Relationships:

```text
Career Worlds™ owns Career World blueprints.
Career World depends on Profession Simulation Engine™.
Career World integrates with Profession Brain™.
Career World references Industry Genome™.
Career World projects to World Graph™.
```

This keeps the architecture compatible with future Atlas rooms, economy nodes, NPC nodes, company nodes, reputation nodes, and simulation events without redesign.

---

## Anti-patterns

Do not build Career Worlds™ as:

- Academies,
- course catalogs,
- lesson paths,
- static modules,
- certification-only systems,
- gamified quizzes,
- isolated education pages.

Those may exist as surfaces inside a world, but they are not the product architecture.

The product architecture is persistent professional life.

---

## Success criteria

Career Worlds™ succeeds when:

- the learner feels they have entered an alternate version of reality,
- the profession continues evolving without them,
- identity persists for months or years,
- progress means reputation, work, relationships, money, mastery, and influence,
- the learner can eventually become a master professional who teaches future generations,
- every Career World becomes self-sustaining.

Studio World’s education category is not “online learning.”

It is professional life simulation.
