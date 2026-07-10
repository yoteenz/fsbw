# World Persistence Model™

**Status:** Canonical persistence architecture — P0 Foundation Sprint  
**Extends:** [World Memory™](../world/world-memory.md) · [World Rules™](../world/world-rules.md) · [World Persistence™](../foundational-experience-systems/world-persistence.md)

---

## Persistence Thesis

Studio World™ is a **persistent reality**. The headquarters never resets. Work left on a table remains on the table. The organization continues when the founder leaves.

Persistence is not a technical feature. It is a **constitutional promise**.

---

## Three Persistence Domains

### Domain 1 — Spatial Persistence

*Where things are in the world.*

| Object | Persists as |
|--------|-------------|
| Mood board pin positions | Wall coordinates · z-order |
| Table artifacts | Story Table™ layout · object positions |
| Shelf arrangements | Prototype order · rejection clusters |
| Camera pose | Last zone visited · orbit angle |
| Door states | Which corridors recently traversed |
| Display content | Monitor reels · ticker positions |
| Lighting state | Time-of-day · World State™ overlay |

### Domain 2 — Organizational Persistence

*What the organization knows and is doing.*

| Object | Persists as |
|--------|-------------|
| Active project binding | Project Genome™ link |
| Creative direction state | Brief · branches · approved canon |
| Generation queue | In-flight · completed · failed jobs |
| AI conversation context | Orb thread · specialist session memory |
| Meeting history | Review outcomes · debate artifacts |
| Production handoffs | Artifacts in transit between departments |
| Scheduled reviews | Prepared table · assembled specialists |

### Domain 3 — Historical Persistence

*What the organization remembers forever.*

| Object | Persists as |
|--------|-------------|
| Approved canon | Vault · gallery permanent |
| Rejected directions | Archive shelf · never deleted by default |
| Version lineage | Layered proofs · branch trees |
| Founder decisions | Chronicle · taste genome updates |
| Milestones | Hall of Legacy™ exhibits |
| Visitor sessions | Guest chronicle (future) |
| Company evolution | Headquarters wing history |

---

## Persistence Layers (Technical)

| Layer | Duration | Authority | Examples |
|-------|----------|-----------|----------|
| **Ephemeral** | Current interaction | Runtime only | Hover state · drag in progress |
| **Session** | Browser session | Session store | Camera pose · panel state |
| **Local** | Device-persistent | localStorage (alpha) | Mood wall · notes · queue |
| **Cloud** | Org-scoped permanent | Supabase (target) | Queue · registry · orb memory |
| **Graph** | Civilization truth | World Graph™ | Company nodes · relationships |
| **Chronicle** | Immutable history | Founder Chronicle™ | Milestone moments |

Alpha uses local storage. Persistence **law** applies regardless of storage backend.

---

## Hydration Sequence (Return Visit)

```
Founder arrives at destination
        ↓
1. World State™ hydrate (global atmosphere)
        ↓
2. Department state hydrate (Set™ activation level)
        ↓
3. Room state hydrate (object positions · displays)
        ↓
4. Project state hydrate (genome · direction · branches)
        ↓
5. AI state hydrate (Orb context · specialist memory)
        ↓
6. Queue hydrate (resume in-flight generation)
        ↓
7. Arrival Sequence™ (short return — not full first visit)
        ↓
8. Camera restore (last zone OR entry portal)
        ↓
9. Idle Life™ resume (ambient from persisted state)
        ↓
FOUNDER CONTINUES — nothing lost
```

---

## Pre-Arrival State (Before Founder)

Persistence includes **pre-computed life** — not just saved founder work:

| Pre-arrival source | Generated state |
|--------------------|-----------------|
| Overnight research queue | New reference pins on Mood Wall |
| Scheduled AI tasks | Completed lighting tests on monitors |
| Production pipeline | Deliverables arrived at Distribution Dock |
| Cross-department handoffs | Artifacts on transit tables |
| World Graph updates | Atlas reflects new nodes |
| Taste genome learning | Orb surfaces new learned patterns |

The founder arrives into **accumulated reality** — not a loading screen.

---

## Persistence Boundaries

### What always persists

- Founder creative work (pins · notes · branches · approvals)
- Canon decisions
- Rejected directions (unless founder explicitly destroys)
- Project binding
- AI conversation threads (role-scoped)
- Generation queue state
- Room object positions
- World State™ selection

### What may expire

- Ephemeral UI state (hover · drag)
- Unpinned draft annotations (configurable)
- Temporary comparison views
- Session-only arrival skip tokens

### What never persists (by design)

- Other founders' private sessions (multi-tenant isolation)
- Visitor credentials (future — scoped guest tokens)
- Platform admin debug overlays

---

## Cross-Session Continuity Scenarios

| Scenario | Expected behavior |
|----------|-------------------|
| Close browser tab | Full hydrate on return |
| Switch department | Previous department state preserved |
| Switch company | Company-scoped state isolated |
| Deploy update | World state restores · runtime may change |
| Founder away 1 hour | Pre-arrival life accumulates modestly |
| Founder away 1 week | More evidence · scheduled reviews prepared |
| Branch merge | Physical consolidation on boards · archive branch |
| Direction rejection | Red-tag shelf addition · canon unchanged |

---

## Memory Physicalization Rules

Persistence must be **visible** — not only stored in database:

| Stored data | Physical expression |
|-------------|---------------------|
| Pin list | Actual pins on wall |
| Version history | Stacked proofs · numbered layers |
| Branch state | Parallel boards in sandbox alcove |
| Approval | Vault seal · wall migration |
| Rejection | Shelf placement · red tag |
| Queue progress | Monitor progress · table placeholders |
| Conversation | Sticky notes · meeting remnants |

**Law:** If data persists but has no physical expression, the persistence model is incomplete.

---

## Persistence & World Graph™

The World Graph™ is the **canonical truth layer** for organizational persistence:

```
Experience Layer (what founder sees)
        ↓ hydrate / dehydrate
Persistence Layer (session · local · cloud)
        ↓ sync
World Graph™ (civilization truth)
        ↓ project
Knowledge Core™ (approved canon)
```

Not all persisted state is graph-canonical. Only approved organizational truth promotes to graph nodes.

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| "Start fresh" on every visit | Constitutional amnesia |
| Session-only mood boards | Spatial persistence failure |
| Invisible state restore | No physical evidence |
| Reset on deploy | World Rules™ violation |
| Lost generation queue | Organizational persistence failure |
| Branch overwrite | Historical persistence violation |

---

## Closing

Persistence is how Studio World™ keeps its promise: *"This place was already alive before you arrived — and it will still be here when you return."*
