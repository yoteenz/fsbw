# 10 — Founder Chronicle™

**Engine Module:** `studio.founder-journey.v1.founder-chronicle`  
**Status:** Living founder and company history  
**Philosophy:** A living history of the founder's journey.

---

## Design Principle

> **Founder Chronicle™** records major decisions · turning points · lessons · breakthroughs · experiments · leadership evolution · company evolution — accessible across years · informing Orb · rituals · reflection.

---

## Chronicle Entry Schema

```yaml
ChronicleEvent:
  eventId: string
  timestamp: ISO8601
  founderId: string
  companyId: string

  category: enum
    # decision · turning-point · lesson · creative-breakthrough
    # successful-experiment · failed-experiment · leadership-evolution
    # company-evolution · milestone · reflection

  title: string
  narrative: string
  rationale: string | null
  evidence: string[]                # project ids · walk ids · metrics refs

  linkedMilestone: string | null
  linkedDecision: string | null
  emotionalTone: enum

  visibility: enum                  # private · executive · organization
  spatialAnchor: string | null      # Founder Walk inscription · office object
```

---

## What Gets Recorded

| Automatic | Founder-Initiated |
|-----------|-------------------|
| Major approvals with rationale | "Remember this decision" via Orb |
| Milestones achieved | Voice note to Chronicle |
| Failed experiments (post-learning) | Reflection session insights |
| Stage transitions observed | Manual entry |
| Acquisition · launch · pivot | |
| Orb challenges accepted/rejected | |

**Not** every click — **turning points only**.

---

## Chronicle Access

| Access | Method |
|--------|--------|
| Orb query | "What did we decide about pricing last year?" |
| Founder Walk | Physical timeline along path |
| Reflection sessions | Prior quarter context |
| Walk the Business | Optional chronicle stop for Leading+ |
| Executive Office | Chronicle wall object |

---

## Chronicle → Orb Intelligence

```
Chronicle pattern: founder rejected international expansion twice
    ↓
Orb (years later): "You're considering EU again — 
      last two times we paused for capacity. What's different now?"
```

Chronicle enables **strategic partner** Orb phase (05).

---

## Company vs Founder Entries

| Type | Focus |
|------|-------|
| `company-evolution` | HQ unlock · department · revenue · team |
| `leadership-evolution` | How founder changed · delegation · style |
| `decision` | Specific choice with rationale |

Both interleave on timeline — dual story per Journey Overview.

---

## Retention

Indefinite · exportable · succession-ready for Legacy stage.

Integrates **Founder Walk™** · **Remembrance Garden™** · **Founder's Promise™**.

---

_Next: [11 — Multi-Brand Evolution](./11_MULTI_BRAND_EVOLUTION.md)_
