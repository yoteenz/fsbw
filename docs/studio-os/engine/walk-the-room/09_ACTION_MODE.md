# 09 — Action Mode

**Engine Module:** `studio.walk-the-room.v1.action-mode`  
**Status:** In-situ actionable recommendations  
**Philosophy:** The founder should never leave Walk the Room™ wondering what happens next.

---

## Design Principle

> Every recommendation becomes **actionable at the anchor** where it was raised — not in a follow-up email, not on a separate tasks page.

---

## Action Dispositions

Inherited from Critique Sessions Revision Workflows (09) — presented **spatially**:

| Disposition | ID | Walk the Room Presentation |
|-------------|-----|---------------------------|
| **Apply immediately** | `apply-immediately` | Orb confirms · preview commits · regen starts |
| **Assign to Creative Director** | `assign-concierge` | Concierge acknowledges · walks off-stage to work |
| **Send to Production** | `send-department` | Package routes to Production Engine building |
| **Create Branch** | `branch-experiment` | Sandbox zone activates · branch labeled in Room Memory |
| **Regenerate Object** | `regenerate-object` | Scoped object regen queued |
| **Regenerate Lighting** | `regenerate-lighting` | Lighting-only scope |
| **Regenerate Motion** | `regenerate-motion` | Motion-only scope |
| **Follow-up Session** | `follow-up-session` | Next Critique Session scheduled · type suggested |
| **Schedule Later** | `schedule-later` | Orb reminder set · concern stays open in Room Memory |
| **Dismiss Permanently** | `dismiss-permanent` | Logged · ghost fades · learning tracks outcome |

---

## Action Mode UI (Spatial — Not Dashboard)

Actions appear as **Orb radial or anchored menu** at critique point:

```
┌─────────────────────────────────────┐
│  [Spatial Critique on Mood Wall]     │
│                                      │
│  Creative Director: "Palette safe."  │
│                                      │
│  ┌─ Apply ─┬─ Branch ─┬─ Later ─┐ │
│  │ Preview  │ Assign   │ Dismiss  │ │
│  └──────────┴──────────┴──────────┘ │
└─────────────────────────────────────┘
```

**Not** a modal form. **Not** a task list panel. Actions feel like **decisions in the room**.

---

## Action Flow

```
Spatial critique raised
    ↓
Founder reviews · may request live preview
    ↓
Orb presents disposition options (voice or spatial menu)
    ↓
Founder selects disposition
    ↓
┌─ apply-immediately → Live Visualization commit → Revision Workflow
├─ assign-concierge → Concierge assignment
├─ send-department → Production Engine handoff
├─ branch-experiment → Sandbox branch
├─ regenerate-* → Generator/Compiler scoped queue
├─ follow-up-session → Critique Session scheduler
├─ schedule-later → Room Memory open concern
└─ dismiss-permanent → Memory + learning log
    ↓
Action recorded in ActionItemBundle
    ↓
Critique status updated at anchor
```

---

## Batch Actions at Summary

Final stop — Orb aggregates:

```yaml
WalkActionSummary:
  appliedImmediately: ActionItem[]
  assigned: ActionItem[]
  sentToProduction: ActionItem[]
  branched: ActionItem[]
  scheduled: ActionItem[]
  dismissed: ActionItem[]
  followUpSessions: CritiqueSessionType[]
```

Founder confirms summary — or revisits any stop.

---

## Never Leave Wondering

Before Presentation Mode exits, system verifies:

- [ ] Every **critical** spatial critique has disposition OR explicit deferral with date
- [ ] Action Item Bundle generated (Critique Sessions 08)
- [ ] Founder received Orb spoken summary
- [ ] Next session suggested if needed
- [ ] Production Engine handoffs queued

If open items remain — Orb asks: "Two items still open. Schedule follow-up or exit anyway?"

---

## Integration with Critique Sessions

Action Mode is the **spatial presentation** of Critique Sessions Revision Workflows:

| Critique Sessions | Walk the Room |
|-------------------|---------------|
| `RevisionWorkflow` | Action disposition trigger |
| `ActionItemBundle` | Walk action summary |
| `ConciergeAssignment` | Assign to Creative Director, etc. |

Same backend contracts. Different experience layer.

---

## Regeneration Scope Reminder

| Scope | Action |
|-------|--------|
| `object:{id}` | Regenerate Object |
| `lighting-only` | Regenerate Lighting |
| `motion-only` | Regenerate Motion |
| `environment-only` | Send to Production + Generator |
| `full-department` | **Founder explicit confirmation required** |

---

_Next: [10 — Emotional Design](./10_EMOTIONAL_DESIGN.md)_
