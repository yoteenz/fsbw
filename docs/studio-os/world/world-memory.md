# World Memory™

**What the living headquarters remembers**

---

## Purpose

Studio World™ remembers **everything that should not feel temporary**.

When a founder returns, they should feel they **picked up where they left off** — not reopened software.

---

## The Memory Contract

| Remember | Forget (by design) |
|----------|-------------------|
| Work-in-progress in Sets™ | Discarded draft previews (per policy) |
| Last HQ location | — |
| Open Orb conversation thread | — |
| Camera position & facing | — |
| Lighting preferences (founder) | — |
| Project anchors (Story Table · Mood Wall) | — |
| Transition mid-journey (graceful resume) | Broken partial loads |
| Generation queue state | — |
| Walk the Room™ progress | — |
| Founder Notes content | — |

**Nothing important should feel like it lived only in a session.**

---

## Memory Domains

### 1 — Spatial Memory

| Field | Example |
|-------|---------|
| `lastSetId` | `creative-atelier` |
| `lastZoneId` | `mood-wall` |
| `camera` | position · rotation · zoom |
| `transitionResume` | edge id · progress 0.0–1.0 |
| `walkPath` | recent Sets™ visited this session |

Return arrival may restore camera or play short **re-orientation** Arrival beat — not instant snap (configurable).

### 2 — Conversation Memory

| Field | Example |
|-------|---------|
| `orbThreadId` | active dialogue |
| `orbLastIntent` | "approval-requested" |
| `conciergePending` | Marketing requested meeting |
| `unreadGuidance` | queued Orb lines from transitions |

Orb remembers **context**, not full chat log forever — archive to Legacy when milestone.

### 3 — Object Memory

Per Set™ persistent objects:

| Object | Persists |
|--------|----------|
| Living Mood Wall™ | pins · order · labels |
| Founder Notes™ | text · voice refs |
| Story Table™ | open project · documents |
| Generation Queue™ | job states |
| Reference Library™ | last viewed refs |
| Display surfaces | last metric snapshot |

**Detail:** [../foundational-experience-systems/world-persistence.md](../foundational-experience-systems/world-persistence.md)

### 4 — Journey Memory

| Field | Example |
|-------|---------|
| `founderJourneyStage` | Mastery |
| `setsVisitedCount` | onboarding progress |
| `walkTheBusinessProgress` | last stop index |
| `arrivalCeremonySeen` | per Set™ flags |

### 5 — Preference Memory

| Field | Example |
|-------|---------|
| `reducedMotion` | a11y |
| `audioLevel` | ambient bus |
| `quietFocusDefault` | schedule |
| `lightingWarmth` | founder slider |

Life & Culture Preferences™ feed this domain.

### 6 — Legacy Memory (Append-Only)

| Surface | Behavior |
|---------|----------|
| Hall of Legacy™ | exhibits permanent |
| The Archive™ | curated history |
| Founder Chronicle™ | narrative chapters |
| Certified™ snapshots | immutable golden moments |

Legacy memory **never** deletes on "reset" — only founder-approved archival.

---

## Storage Architecture (Conceptual)

```
World Memory Store™
├── session.hot     — camera · transition progress · active thread
├── workspace.warm  — Set™ objects · queue · notes (org-scoped)
├── company.cold    — genome · topology · lifecycle (durable)
└── legacy.archive  — append-only exhibits
```

| Tier | Sync | Latency |
|------|------|---------|
| Hot | local + immediate | 0ms perceived |
| Warm | `studio_os_workspace_state` + API | < 500ms |
| Cold | Supabase org record | on boundary load |
| Archive | immutable store | read-mostly |

Aligns with `studioOsBrowserStorage.ts` philosophy — hot prefs local, heavy payloads server.

---

## Resume Scenarios

### Founder closes tab mid-Mood Wall edit

Return → Creative Atelier™ → Mood Wall zone → pins restored → Orb: "You left three concepts on the wall."

### Founder mid-elevator transition

Return → resume transition at last progress OR complete elevator arrival with Orb catch-up line — never black screen.

### Founder away 2 weeks

Return → Morning™ state · briefing Orb · projects show progress that occurred while away (real data) · ambient life was dimmed not frozen.

---

## Memory vs World State™

| World Memory™ | World States™ |
|---------------|---------------|
| *What* was happening | *How* HQ feels now |
| Positions · objects · threads | Lighting · audio · mood |
| Persistent facts | Temporary atmosphere (may expire) |

Both compose the return experience.

---

## Privacy & Export

Founder may:

- Export World Memory™ snapshot (Blueprint / succession)
- Delete session hot cache
- Request legacy exhibit correction (audit trail — not silent delete)

AI employees reference Memory — never invent stored state.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| localStorage-only project state | Lost on device switch |
| Reset on every navigation | Violates memory contract |
| Orb with no thread continuity | Breaks guidance trust |
| Camera snap on return | Disorienting — use Arrival re-orient |
| Mutable legacy exhibit | Violates append-only law |

---

## Cross-References

- [world-rules.md](./world-rules.md) — Rule 1 & 6
- [world-streaming.md](./world-streaming.md) — resume after stream
- [arrival-system.md](./transitions/arrival-system.md) — return arrival variants
- [Succession Mode™](../../studio-os/succession-mode.md) — memory as continuity risk
