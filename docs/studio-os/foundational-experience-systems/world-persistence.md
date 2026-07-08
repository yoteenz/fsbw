# World Persistence™

**System:** World Persistence™  
**Status:** Canonical experience law  
**Scope:** Every department · Headquarters · session continuity

---

## Purpose

Every department should **remember its previous state**.

When the founder returns, nothing resets simply because the page was reopened.

The headquarters should feel **persistent**.

---

## Persistence Philosophy

| Persistence Is | Persistence Is Not |
|----------------|-------------------|
| Continuity of creative work | Browser tab refresh amnesia |
| Resume exactly where left off | "Start fresh" every visit |
| Cross-session queue progress | Lost generation jobs |
| Orb conversation memory | Stateless chatbot |

---

## What Must Persist

| State | CDS example | Storage authority |
|-------|-------------|-------------------|
| **Living Mood Wall™** | Yesterday's references · order · pins | Studio object store |
| **Story Table™** | Yesterday's prototypes · layout | Department runtime state |
| **Founder Notes™** | Open notes · pinned decisions | Studio object store |
| **Studio Orb™** | Previous conversation context | Orb runtime memory |
| **Generation Queue™** | Jobs in progress · completed previews | Queue store → cloud |
| **Active project** | Project Genome™ binding | Project genome store |
| **Camera / zone** | Last zone visited · camera pose | Session restore |
| **Branch state** | Active sandbox branch | Project genome |
| **Arrival skip token** | Return visit short arrival | Session only |

---

## Return Visit Behavior

```
Founder opens department
    ↓
World Persistence™ hydrate
    ↓
Load mood wall · notes · queue · project · orb context
    ↓
Resume generation jobs (poll if in-flight)
    ↓
Short Arrival Sequence™ (not full first-visit)
    ↓
Camera restores to last zone OR entry portal (configurable)
    ↓
Idle Life™ resumes from persisted ambient state
    ↓
FOUNDER CONTINUES — nothing lost
```

---

## Persistence Layers

| Layer | Duration | Examples |
|-------|----------|----------|
| **Session** | Current browser session | Camera pose · panel open state |
| **Local** | Device storage (alpha) | Mood wall · notes · queue |
| **Cloud** | Supabase · org-scoped (target) | Queue · registry · orb memory |
| **Chronicle** | Permanent | Milestone moments → Founder Chronicle™ |

Alpha Golden Build uses **localStorage** — persistence law applies; storage backend evolves.

---

## What Must NOT Reset on Refresh

| Forbidden reset | Why |
|-----------------|-----|
| Mood Wall cleared | Destroys creative work |
| Queue jobs lost | Breaks trust in generation |
| Notes disappeared | Breaks decision capture |
| Orb forgets context | Breaks partnership feel |
| Project unbound | Breaks room coherence |

---

## Technical Contract

```json
{
  "worldPersistence": {
    "departmentId": "creative-direction",
    "projectId": "project-001",
    "lastVisitedAt": "ISO8601",
    "hydrateOnEntry": [
      "living-mood-wall",
      "founder-notes",
      "generation-queue",
      "project-genome",
      "studio-orb-context",
      "active-zone-id"
    ],
    "restoreCamera": "last-zone",
    "arrivalMode": "return-short",
    "generationResume": true
  }
}
```

---

## Relationship to Production Lifecycle

| Lifecycle stage | Persistence behavior |
|-----------------|---------------------|
| Golden Build™ | Local persistence minimum |
| Certified™ | Cloud-backed queue + registry |
| Live™ | Full cross-device persistence |
| Legacy™ | Frozen snapshot in Archive™ |

---

## Anti-Patterns

| Anti-pattern | Correct approach |
|--------------|------------------|
| Demo mode reset on each visit | Persist unless explicit "new project" |
| Clear storage on department switch | Scope per department + project |
| Persist only on explicit save | Auto-persist on meaningful change |
| Orb memory only in session RAM | Durable orb context per project |

---

## Golden Build™ Status

| Object | Persisted today (alpha) |
|--------|-------------------------|
| Mood Wall | ✓ localStorage |
| Founder Notes | ✓ localStorage |
| Generation Queue | ✓ localStorage |
| Project Genome | ✓ localStorage |
| Orb conversation | ✗ — Sprint 002+ |
| Camera / zone | ✗ session only |
| Story Table | ✗ not implemented |

---

## Cross-References

- [Founder Chronicle™](../production-lifecycle/founder-chronicle.md) — permanent memory
- [Idle Life™](./idle-life.md) — resumes from persisted state
- [Ambient Storytelling™](./ambient-storytelling.md) — visuals reflect persistence
