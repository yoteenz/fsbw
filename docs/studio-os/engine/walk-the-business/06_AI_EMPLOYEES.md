# 06 — AI Employees

**Engine Module:** `studio.walk-the-business.v1.ai-employees`  
**Status:** Staffed department presence  
**Philosophy:** Departments feel staffed. Nothing should feel like reading notifications.

---

## Design Principle

> **Concierges naturally appear where needed** — they greet, offer updates, request approvals, celebrate wins, and raise concerns. As colleagues in the building — not notification avatars.

---

## Daily Walk Concierge Behaviors

| Behavior | Example |
|----------|---------|
| **Greet** | "Good morning — Production had an active night." |
| **Update** | "Project 014 moved to Review. Assets are ready." |
| **Request approval** | "Creative Direction needs your sign-off on the mood board." |
| **Celebrate** | "Marketing's campaign exceeded targets — congratulations." |
| **Raise concern** | "I'm worried about timeline on Project 009 — may I show you?" |
| **Defer to Orb** | Cross-department routing — "Orb can summarize the full picture." |

---

## Presence Rules

```yaml
DailyWalkConciergePresence:
  departmentId: string
  conciergeId: AIRoleId
  spawnTrigger: enum
    # founder-approach · approval-waiting · celebration · concern · always-on-greet

  greeting: string | null
  update: string | null
  request: ApprovalRequest | null
  emotionalTone: enum           # warm · urgent · celebratory · concerned · neutral

  position: Vector3
  gesture: GestureType
  dismissAfterExchange: boolean
```

| Rule | Detail |
|------|--------|
| Max concierges per stop | 2 visible + Orb |
| Speak queue | One primary · founder may invite second |
| Notification ban | No toast · no inbox — concierge speaks |
| Idle between walks | Ambient industry-appropriate activity |

---

## Department Staffing Map

| Department | Typical Concierges |
|------------|-------------------|
| Creative Direction | Creative Director · Brand Concierge |
| Production | Production Concierge · Engineering Concierge |
| Marketing | Marketing Concierge · Growth Strategist |
| Publishing | Publishing Concierge |
| Customer Experience | Experience Concierge · Support Concierge |
| Marketplace | Marketplace Concierge |
| Operations | Operations Concierge · CoS liaison |
| Analytics Observatory | Strategy Concierge |
| Innovation Lab | Innovation Concierge |

Staffing from Generator AI Team Compiler — Runtime actors.

---

## Approval Requests (Spatial)

Instead of notification:

```
Marketing Concierge approaches at department threshold:

"Good morning. Before today's launch, we need your approval on the 
 landing page CTA. It will take two minutes — shall we review now 
 or schedule for after the walk?"

Founder: "After the walk."
Concierge: "Scheduled. I'll have it ready at Publishing."

→ Logged in daily brief · not lost
```

Approvals link to Critique Sessions or inline decision when quick.

---

## Celebration Protocol

```yaml
CelebrationEncounter:
  trigger: enum                 # launch · revenue · engagement · milestone
  concierge: AIRoleId
  ceremony: string | null       # Genome-weighted
  duration: string              # brief — 30s max during walk
  deferrable: boolean
```

Celebrations are **Executive Moments** (08) — organic · not spam.

---

## Concern Protocol

Concerns use **concerned** tone — never alarm:

> "I want to flag something — Project 009 hasn't moved in 48 hours. May I show you the blocker?"

Orb may add context if cross-department.

---

## Relationship to Walk the Room

If approval or concern requires depth:

```
Concierge: "This deserves more than a hallway conversation."
Orb: "Shall we schedule Walk the Room for Project 014?"
```

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Notification bell with 47 items | SaaS pattern |
| Concierge reads bullet list | Natural speech only |
| Identical greeting every day | Reference away-state · specific updates |
| Teleporting concierges | Walk from station |

---

_Next: [07 — Headquarters Health](./07_HEADQUARTERS_HEALTH.md)_
