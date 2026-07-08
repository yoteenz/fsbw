# ARTICLE-K22 — The Knowledge Core™

**Status:** Accepted  
**System:** Studio World Knowledge Core™  
**Graph role:** Canonical memory engine + `knowledge-object` entries  
**Era:** Era 1 — Knowledge™  
**Approved:** 2026-07-08  

---

## One sentence

**Studio World should not rely on external AI memory. Studio World becomes its own memory through the Knowledge Core™.**

---

## Constitutional purpose

The Knowledge Core™ is the canonical source of truth for everything inside Studio World.

It is not documentation. It is the memory of the civilization.

Article K23 refines this by separating raw conversation history from extracted knowledge and approved canon. See [ARTICLE_K23_MEMORY_SYSTEM.md](./ARTICLE_K23_MEMORY_SYSTEM.md).

The Knowledge Core preserves:

- why decisions were made,
- how systems evolved,
- what principles govern Studio World,
- which ideas became canon,
- which ideas remain experimental,
- what should never be contradicted.

No architectural decision should depend on someone's memory, chat history, commit messages, or external AI state.

---

## Knowledge domains

The Knowledge Core is organized into permanent domains. Each domain owns its own history.

| Domain | Memory responsibility |
|--------|-----------------------|
| Constitution™ | Laws, articles, governance, oaths |
| Architecture™ | System architecture and structural decisions |
| World Bible™ | Publication projections from canon |
| Design Language™ | Visual, material, typographic, and spatial language |
| Experience System™ | Interaction philosophy, presence, navigation, ambient behavior |
| Orb™ | Orb identity, modes, memory, and guidance logic |
| Mission Control™ | Command center architecture and world-interface decisions |
| Atlas™ | Spatial world projection and navigation memory |
| Scene Assembly™ | Scene Stack™, layers, shells, blueprints, assembly rules |
| Knowledge Engine™ | Knowledge Core, search, lifecycle, graph memory |
| Marketplace™ | Economy, distribution, licensing, asset reuse |
| Discovery Packs™ | Exploration, unknowns, expansion lore |
| Civilization™ | World evolution, events, ecology, relationships |
| ADR Archive™ | Architecture Decision Records™ and decision lineage |
| Asset Standards™ | Reuse, registry, generation, conservation |
| Engineering Standards™ | Implementation standards and repository patterns |
| Prompt Standards™ | Recurring prompt structure and governance |
| Brand Standards™ | Brand meaning, voice, presentation, consistency |
| Research™ | Evidence, experiments, discoveries, external context |
| Future Concepts™ | Preserved future ideas not yet canon |
| Architect's Memory™ | Philosophy, vocabulary, naming, materials, heuristics |

---

## Canonical Status™

Every Knowledge Entry receives exactly one status:

| Status | Meaning | Automatic influence |
|--------|---------|---------------------|
| Canon™ | Ratified truth | Yes |
| Approved™ | Accepted but not fully canonized | No |
| Draft™ | Working proposal | No |
| Experimental™ | Exploratory or prototype | No |
| Deprecated™ | No longer active | No |
| Historical™ | Preserved past state | No |
| Archived™ | Stored reference | No |

**Only Canon™ may influence future architecture automatically.**

Other statuses remain searchable and preserved, but must not silently govern new architecture.

---

## Prompt Memory™

Every major prompt that fundamentally changes Studio World should create a Knowledge Entry.

Each entry stores:

- Title
- Summary
- Reasoning
- Final Prompt
- Architecture Added
- Related Systems
- Constitution Articles
- ADR References
- World Bible References
- Implementation Status
- Superseded By

This converts prompts from temporary conversations into searchable institutional memory.

---

## Search

Knowledge should never require browsing folders.

The Knowledge Core must support questions such as:

- "Show every decision involving the Orb."
- "Find all Atlas architecture."
- "What constitutional articles affect navigation?"
- "Which prompts introduced Progressive Presence?"
- "Why was Mission Control created?"

Knowledge should behave like intelligence rather than documentation. Search should traverse domains, statuses, entries, ADRs, laws, rooms, engines, and World Graph relationships.

---

## Versioning

Never overwrite history.

Every major revision creates:

```text
v1 → v2 → v3 → ...
```

Previous versions remain preserved. Superseded entries move to Historical™ or Archived™ status and keep their graph relationships.

Civilization remembers its evolution.

---

## Prompt Standards™

Recurring prompt preferences become constitutional prompt standards rather than conversational preferences.

Canon standards include:

- Always include Recommended Model when model choice matters.
- Always include Prompt Classification.
- Always include Architectural Improvements Added.
- Always include Future Expansion.
- Always architect before prompting.
- Always prefer reusable systems over one-off implementations.

Prompt Standards™ belong to the Knowledge Core and may influence future prompt generation only when their status is Canon™.

---

## Architect's Memory™

Architect's Memory™ is a dedicated Knowledge Core domain.

It stores:

- design philosophies,
- recurring preferences,
- creative principles,
- Studio World vocabulary,
- naming conventions,
- material language,
- interaction philosophy,
- presentation format,
- decision-making heuristics.

The goal is not to remember personal conversations. The goal is to preserve architectural consistency.

---

## World Graph integration

Every Knowledge Entry becomes a World Graph™ node.

Relationships connect:

- ADRs,
- Constitution,
- World Bible,
- departments,
- Orb,
- Atlas,
- Marketplace,
- Mission Control,
- Scene Assembly,
- Experience Engine.

Nothing exists in isolation.

Implementation:

- Core: `src/studio-os-core/studio-world-knowledge-core/`
- Graph ingestion: `src/studio-os-core/world-graph/ingestion/knowledge-core-ingest.ts`
- Canon: `knowledge/canon/constitution/studio-world-knowledge-core.md`

---

## Success criteria

If Studio World were handed to an entirely new team five years from now, they should be able to understand:

- how the world works,
- why it works,
- how it evolved,
- what principles must never change,
- what is canon,
- what is experimental,
- what has been superseded,
- and what should never be contradicted.

Without relying on chat history.

The Knowledge Core becomes Studio World's institutional memory.

---

## Related constitutional memory layers

- [ARTICLE_K23_MEMORY_SYSTEM.md](./ARTICLE_K23_MEMORY_SYSTEM.md) — Conversation Archive™ → Knowledge Ingestion™ → Architect Review™ → Knowledge Core™
