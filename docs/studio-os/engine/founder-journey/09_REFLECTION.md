# 09 — Reflection

**Engine Module:** `studio.founder-journey.v1.reflection`  
**Status:** Periodic leadership growth system  
**Philosophy:** Studio OS helps founders grow — not just businesses.

---

## Design Principle

> Founder Journey **periodically encourages reflection** — quarterly · post-milestone · stage transition — through Orb-led dialogue · not survey forms.

---

## Reflection Prompt Catalog

| Prompt Theme | Example Question |
|--------------|------------------|
| Learning | "What have we learned this quarter?" |
| Leadership | "How has your leadership changed?" |
| Patterns | "What patterns keep repeating?" |
| Strengths | "What strengths are emerging?" |
| Pruning | "What should we stop doing?" |
| Vision | "Is our long-term vision still true?" |
| Team | "Who are we becoming as an organization?" |
| Founder | "What kind of leader do you want to be next year?" |

Prompts adapt to **Founder Stage** (02) and **Chronicle** context (10).

---

## Reflection Session Schema

```yaml
ReflectionSession:
  sessionId: string
  founderId: string
  triggeredBy: enum               # scheduled · milestone · stage-shift · founder-request
  scheduledAt: ISO8601
  completedAt: ISO8601 | null

  prompts: ReflectionPrompt[]
  responses:
    - promptId: string
      response: string
      channel: enum                 # voice · text · orb-dialogue
      insightsExtracted: string[]

  profileUpdates: ProfileUpdate[]
  chronicleEntries: ChronicleEvent[]
  adaptationDirectives: AdaptationDirective[]
```

---

## Scheduling

```yaml
ReflectionSchedule:
  quarterly: boolean                # default on for Leading+ stages
  postMilestone: boolean            # transformational milestones
  stageTransition: boolean          # when primary stage shifts
  founderCadence: enum              # monthly · quarterly · minimal
```

Dreaming/Building: lighter · annual optional.  
Leading/Legacy: quarterly default.

---

## Reflection Experience

**Not** a form page. **Spatial** session:

- Executive Office or Founder Walk reflection space
- Orb dialogue — Conversation Engine patterns from Critique Sessions
- Optional Braintrust: Strategy Concierge · Leadership DNA voice
- Concludes with Chronicle entry + profile updates

Duration: 15–30 minutes · skippable · rescheduled without guilt.

---

## Insight Extraction

```
Reflection response analyzed
    ↓
Extract: leadership shifts · stated preferences · strategic pivots
    ↓
Update Founder Profile (04) with confidence weights
    ↓
Append Chronicle (10) if turning point
    ↓
Emit AdaptationDirectives to rituals (07)
```

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Mandatory guilt trips | Reflection is invitation |
| Corporate HR survey tone | Mentor · not compliance |
| Ignored reflections | Must influence profile or trust erodes |

---

_Next: [10 — Founder Chronicle](./10_FOUNDER_CHRONICLE.md)_
