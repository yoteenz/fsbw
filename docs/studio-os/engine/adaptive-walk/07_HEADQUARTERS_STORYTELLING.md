# 07 — Headquarters Storytelling

**Engine Module:** `studio.adaptive-walk.v1.headquarters-storytelling`  
**Status:** Felt-sense business narrative system  
**Philosophy:** The Headquarters becomes the visualization of company health.

---

## Design Principle

> Instead of reading metrics, the founder should **sense** momentum · growth · calm · urgency · innovation · success · opportunity. The HQ tells the story.

---

## Story Dimensions

```yaml
HeadquartersStory:
  date: ISO8601
  dominantNarrative: enum
    # momentum · growth · calm · urgency · innovation · success · opportunity · strain

  feltQualities:
    - quality: enum
      intensity: number             # 0–1 — never shown as number to founder
      spatialExpression: string

  orbNarrativeHook: string          # one sentence story frame
  departmentStories: DepartmentStory[]
```

---

## Felt Quality → Spatial Expression

| Quality | Founder Senses | HQ Expression |
|---------|----------------|---------------|
| **Momentum** | Things are moving | Objects in transit · active concierges · warm light |
| **Growth** | Business expanding | New wing visible · evolution markers · busier lot |
| **Calm** | Steady · under control | Soft light · slow idle · Orb quiet |
| **Urgency** | Needs us now | Pathway light · concern zones bright · direct Orb |
| **Innovation** | New possibilities | Marketplace glow · lab activity · discovery objects |
| **Success** | Winning | Celebration residuals · trophy objects · confident concierges |
| **Opportunity** | Upside available | Pedestal displays · Orb curiosity tone |
| **Strain** | Pressure without panic | Cooler light · visible queues · supportive tone |

Multiple qualities may coexist — **dominant** sets atmosphere; **secondary** adds nuance.

---

## Story Generation

```
1. Ingest analytics · pipeline · health · overnight events
2. Derive dominant narrative (not single KPI)
3. Map to felt qualities + intensity
4. Compose department-level micro-stories
5. Generate Orb narrative hook
6. Feed Dynamic HQ Profile (04) + concierge talking points
```

**Example hook:**

> "Momentum is with us — two projects advanced overnight, and Marketing is ready for today's launch."

---

## Metrics Translation (Never Raw)

| Metric | Story |
|--------|-------|
| Revenue +12% | Success quality + Observatory sculpture |
| Support +40% | Urgency at CX · Operations day bias |
| 0 launches 7d | Calm · explore encouragement |
| New expansion fit | Opportunity · Innovation day candidate |
| Blocker 48h | Strain + urgency at Production |

Analytics Observatory is **optional deep-dive** — story is environmental.

---

## Department Micro-Stories

```yaml
DepartmentStory:
  departmentId: string
  oneLineStory: string              # concierge uses this
  visualCue: string                 # what founder should notice
  emotionalTone: enum
```

Production: *"Project 014 crossed into Review last night — the lot feels busy."*

Marketing: *"Campaign assets finalized — the walls look ready."*

---

## Story Consistency

Story must align with:
- Resolved Walk Mode (02)
- Executive Priorities (06)
- Headquarters Health (Walk the Business 07)
- Genome celebration register

Contradiction forbidden: Celebration story on Crisis mode without explicit secondary ceremony.

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Dashboard summary read aloud | Breaks spatial philosophy |
| Story disconnected from visible HQ | Founder looks around · story must match |
| Toxic positivity on strain day | Honest atmosphere · supportive tone |
| Identical story two days running | Anti-repetition violation |

---

_Next: [08 — Personalization](./08_PERSONALIZATION.md)_
