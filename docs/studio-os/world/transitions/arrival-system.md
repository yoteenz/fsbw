# Arrival System™ — Headquarters & Set Entry

**Version:** 1.0.0  
**Status:** Canonical (docs only)  
**Relationship:** Arrival Sequence™ ⊂ Transitions™

---

## Purpose

Define **arrival** as a first-class transition — entering Headquarters and entering any Set™.

Arrival is **introduction** — not loading.

---

## Two Arrival Contexts

### 1. Headquarters Arrival™

**Entering the company building** from outside.

| Beat | Description |
|------|-------------|
| Exterior | Company signage · genome materials |
| Plaza | Arrival Plaza — first impression |
| Threshold | Cross into connected lot |
| Circulation hint | Wings visible · Orb welcome |
| Destination routing | Adaptive Walk™ suggests first Set™ |

Duration: 8–15s first visit · 4–8s daily return.

Uses transition type: **Arrival™**

---

### 2. Set Arrival™

**Entering a specific Set™** from a transition edge.

This is the [Arrival Sequence™](../../foundational-experience-systems/arrival-sequence.md) — terminal phase of journey:

| Beat | Description |
|------|-------------|
| Departure fade | Previous Set™ recedes (via transition) |
| Exterior / threshold | Camera outside Set doors |
| Doors open | Automatic |
| Glide in | Slow entry |
| Lighting boot | Section by section |
| Audio fade | Ambient in |
| Orb awakening | Greet |
| Hero illuminate | Mood Wall · etc. |
| Interaction unlock | ACTIVE |

Duration: 5s standard · 7s first visit.

---

## Arrival Stack

```
TRANSITION (journey)
  Walk / Elevator / Skybridge / Gallery …
       ↓
SET ARRIVAL (Arrival Sequence™)
  Doors · glide · lighting · Orb · hero
       ↓
SET ACTIVE
  Full interaction
```

**Headquarters Arrival™** is the outermost layer — before any department Set™.

---

## Interaction Lock

During **all arrival phases**:

| Locked | Unlocked after |
|--------|----------------|
| Walk verbs | Interaction unlock beat |
| Object interaction | Interaction unlock beat |
| Generate | Interaction unlock beat |
| Orb speak (founder-initiated) | Optional partial unlock at Orb awakening |

Founder is **passenger** during arrival — **inhabitant** after.

---

## Return Visit Shortening

| Visit type | HQ Arrival | Set Arrival |
|------------|------------|-------------|
| First ever | Full | Full (7s) |
| Same day return | Skip plaza · short threshold | Skip identity phase |
| Next day | Medium plaza | Standard (5s) |
| Legacy journey | Ceremonial extended | Reflective extended |

Session token tracks visit recency — World Persistence™.

---

## Headquarters Arrival™ Example

```
Exterior — genome marble · company mark
    ↓
Plaza — ambient 0% → 12%
    ↓
Threshold doors — warm interior glow
    ↓
Orb — "Welcome back to [Company]. Creative has updates."
    ↓
Circulation — wings visible · optional Adaptive Walk route
    ↓
HQ ACTIVE — founder selects destination → Transition™ begins
```

---

## Set Arrival™ Example (Creative Atelier™)

After Glass Hallway™ transition completes approach phase:

```
Doors part — editorial brass
    ↓
Glide — Mood Wall fills frame
    ↓
Lighting — ceiling bloom · pin illuminate
    ↓
Orb — "Welcome back to the Creative Atelier."
    ↓
ACTIVE
```

---

## Anti-Patterns

| Anti-pattern | Correction |
|--------------|------------|
| "Loading headquarters…" | Environmental arrival only |
| Skip arrival on Set switch | Shorten — never zero |
| Instant spawn in Set center | Always threshold entry |
| Black screen between HQ and Set | Continuous transition graph |

---

## Cross-References

- [Arrival Sequence™](../../foundational-experience-systems/arrival-sequence.md)
- [Transition philosophy](./transition-philosophy.md)
- [Camera language](./camera-language.md)
- [Orb guidance](./orb-guidance.md)
