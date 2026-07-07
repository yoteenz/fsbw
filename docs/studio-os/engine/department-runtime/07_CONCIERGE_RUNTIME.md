# 07 — Concierge Runtime

**Engine Module:** `studio.department-runtime.v1.concierge`  
**Status:** AI employee actor specification  
**Parent:** SDK [05 — AI Employee System](../../sdk/05_AI_EMPLOYEE_SYSTEM.md)

---

## Definition

**Concierge Runtime** instantiates each SDK AI Employee role as a **living department actor** — with presence, memory, collaboration, and escalation behavior.

> Every Concierge behaves like a department employee — not a chatbot sidebar.

---

## Concierge Actor Schema

```yaml
ConciergeActor:
  roleId: string                      # SDK 05 canonical role
  instanceId: string
  displayName: string                 # Genome terminology override
  primaryZone: string
  state: ConciergeState
  permissions: PermissionSet
  memory: ConciergeMemory
  communication: CommunicationProfile
  escalationRules: EscalationRule[]

ConciergeState:
  presence: enum                      # available | busy | reviewing | collaborating | escalated
  currentTask: string | null
  lastAction: string | null
  visibleToUser: boolean              # ambient panel or voice only
```

---

## Lifecycle Behaviors

### Arrival

When user enters department:

| Concierge | Arrival Behavior |
|-----------|------------------|
| Primary specialist | Ambient acknowledgment in zone |
| Brand Concierge | Silent guard — activates on brand check |
| Orb | Department arrival (06) |
| Others | Available — reactive |

### Presence

| Presence Mode | Expression |
|---------------|------------|
| `available` | Subtle zone indicator |
| `busy` | Dimmed — processing |
| `reviewing` | Active on object (e.g., Quality on Preview Screen) |
| `collaborating` | Visible cross-concierge exchange |
| `escalated` | Notification to human founder |

### Assignments

Concierges receive assignments from:
- Verb completion (user approves → Publishing Concierge handoff)
- Project Runtime task delegation
- Output port monitoring
- Other Concierge escalation

### Notifications

| Type | Delivery |
|------|----------|
| Review complete | Ambient panel near object |
| Blocker detected | Orb + Production Manager |
| Brand conflict | Brand Concierge glow on asset |
| Legal flag | Legal Concierge formal note |

### Review Requests

When user places work on review surface:

```
Asset on Preview Screen
    → Quality Concierge: compliance check (ambient)
    → Brand Concierge: genome alignment (glow)
    → Marketing Concierge: channel fit (timeline marker)
    → Visible collaboration — not hidden
```

### Collaboration

Cross-concierge consultation is **visible**:

```yaml
CollaborationExchange:
  from: roleId
  to: roleId
  topic: string
  visiblePanel: boolean             # always true
  duration: number
```

### Escalation

Per SDK 05 escalation rules:

| Trigger | Path |
|---------|------|
| Veto | Human founder |
| Legal uncertainty | Human counsel |
| Genome conflict | Brand → founder |
| Blocker > 48h | Production Manager → founder |

### Memory

| Scope | Content |
|-------|---------|
| Department | Department-specific learnings |
| Organization | Shared institutional knowledge |
| Project | Active project context |
| Session | Current visit |

Memory feeds Genome learning outputs — suggestive only.

### Department Ownership

Each Concierge owns **knowledge domains** — not the department:

| Role | Owns | Does Not Own |
|------|------|--------------|
| Creative Director | Creative vision | Final approval |
| Brand Concierge | Brand veto | All decisions |
| Production Manager | Timeline | Creative direction |
| Orb | Routing | Specialist decisions |

---

## Concierge Communication Channels

| Channel | Use |
|---------|-----|
| Ambient panel | Short notes on/near objects |
| Orb relay | Longer dialogue |
| Voice | TTS with Genome voice profile |
| Notification | Urgent escalation |

---

## Genome Adaptation

| Attribute | Genome Domain |
|-----------|---------------|
| Display name | terminology |
| Voice/TTS | voice, personality |
| Verbosity | interactionStyle |
| Proactivity | interactionStyle |
| Veto sensitivity | thingsWeNeverDo |

---

## Collaboration Example (Runtime Flow)

```
User: drag asset to Approval Station
    → Interaction Engine: approve-pending state
    → Quality Concierge: presence → reviewing
    → Brand Concierge: presence → reviewing
    → CollaborationExchange: quality → brand "alignment check"
    → Ambient panels show notes
    → Orb: "Ready for your approval"
    → User: approve verb
    → Publishing Concierge: assignment received
```

---

_Next: [08 — Navigation Engine](./08_NAVIGATION_ENGINE.md)_
