# 02 — Arrival Experience

**Engine Module:** `studio.walk-the-business.v1.arrival`  
**Status:** Morning entry sequence  
**Philosophy:** Every session begins with arrival — not a loading screen.

---

## Design Principle

> Every morning, the founder should feel like they are **physically arriving** at their headquarters before work begins.

---

## Arrival Sequence

```
1. Session initiated (login · return · explicit "start day")
2. Transition canvas: soft fade from void
3. Headquarters resolves into view (progressive · not pop-in)
4. Morning light fills environment (time-of-day from Experience Engine)
5. Departments sequentially come online (staggered 0.5s · left-to-right or narrative order)
6. Ambient sound rises (birds · HVAC hum · industry-appropriate · Genome-matched)
7. Background activity begins (distant motion · AI employees · project indicators)
8. Studio Orb approaches from guide position
9. Orb delivers welcome · scope prompt
10. Founder selects walk mode · walk begins OR free explore
```

**Duration:** 8–15 seconds. Calm. Never skippable on first daily arrival — skippable on same-day return.

---

## Canonical Orb Welcome

> "Good morning.
>
> Welcome back.
>
> Your headquarters has been active while you were away.
>
> Would you like today's **executive walkthrough**?"

Tone: warm · confident · unhurried. Never alarmist at arrival.

---

## Walk Scope Options

| Option | ID | Behavior |
|--------|-----|----------|
| **Full Walkthrough** | `full` | Complete executive path · all departments · 20–25 min |
| **Priority Walkthrough** | `priority` | Orb-curated stops — approvals · risks · opportunities only · 10–15 min |
| **Quick Summary** | `summary` | Orb verbal brief at arrival point · optional 3-stop walk · 5 min |
| **Explore Freely** | `free-explore` | No guided path · HQ fully interactive · async brief generated |

Founder responds via voice · Orb ring · or natural selection.

---

## Away State Narrative

While founder was away, Headquarters **continued living** (not paused simulation — real activity summary):

```yaml
AwaySummary:
  duration: duration
  highlights:
    - type: enum              # project-progress · approval-waiting · launch · revenue · concern
      departmentId: string
      summary: string
  orbTeaser: string           # "Three things happened while you were away."
```

Orb may preview away highlights before scope selection — never full dump at arrival.

---

## Arrival Configuration

```yaml
ArrivalExperienceConfig:
  timeOfDay: enum               # morning · afternoon · evening · night
  lightingPreset: string        # morning-warmth · golden-hour · etc.
  ambientSoundscape: string
  departmentStaggerMs: number
  orbApproachDuration: number
  firstVisitOfDay: boolean
  headquartersType: string      # law-firm · creative-agency · salon · etc.
  genomeMood: string            # from Company Genome
```

Experience Engine provides time-of-day and Founder Mode hooks.

---

## First Visit vs Return

| Scenario | Arrival |
|----------|---------|
| **First login ever** | Extended arrival · HQ tour offer · Orb introduces buildings |
| **First login of day** | Full sequence · walk offered |
| **Same-day return** | Abbreviated · "Welcome back" · priorities since last session |
| **After multi-day absence** | Emphasize away summary · World Evolution changes highlighted |

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Login → instant dashboard grid | Violates core philosophy |
| Loading spinner with KPIs | SaaS pattern |
| Notification badge explosion at entry | Overwhelming before walk |
| Silent pop-in to HQ | Breaks arrival ritual |
| Mandatory 20-minute walk | Founder may choose summary or free explore |

---

## Arrival → Walk Handoff

```
Founder selects scope
    ↓
WalkOrchestrator resolves path (03)
    ↓
Camera to first stop OR hold at executive plaza if summary-only
    ↓
Executive Walk begins
```

---

_Next: [03 — Executive Walk](./03_EXECUTIVE_WALK.md)_
