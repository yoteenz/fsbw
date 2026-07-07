# 03 — Mode Resolution

**Engine Module:** `studio.adaptive-walk.v1.mode-resolution`  
**Status:** Day-type detection and mode selection  
**Philosophy:** What kind of day is today?

---

## Design Principle

> Studio OS ingests business signals and resolves the **most relevant walk mode** before the founder takes a step. Resolution is explainable · overridable · never arbitrary.

---

## Resolution Pipeline

```
1. Ingest signals (projects · launches · alerts · celebrations · activity)
2. Score each WalkMode candidate
3. Apply priority hierarchy (crisis always wins)
4. Apply founder memory bias (habits · preferences)
5. Apply Genome modifiers (celebration register · industry)
6. Select primary mode (+ optional secondary)
7. Generate rationale for Orb (human-readable subset)
8. Present to founder at arrival — confirm or override
```

**Latency target:** < 2s before Orb welcome speaks.

---

## Signal Sources

| Source | Signals |
|--------|---------|
| **Project pipeline** | Blockers · at-risk · creative queue depth |
| **Launch calendar** | Events within 24h · 7d |
| **Approval queue** | Count · urgency · department |
| **Analytics** | Revenue delta · engagement spikes/dips |
| **Customer Experience** | Support queue · VIP alerts · testimonials |
| **System monitors** | Critical alerts · performance · integration failures |
| **Marketplace** | New expansions · recommendations |
| **Celebration queue** | Milestones · achievements overnight |
| **Chief of Staff** | Executive priority feed |
| **Founder memory** | Typical Monday mode · skip patterns |
| **Calendar** (optional) | External meetings · launch dates |

---

## Mode Scoring

```yaml
ModeScore:
  modeId: WalkModeId
  score: number                       # 0–100
  contributingSignals:
    - signalId: string
      weight: number
      description: string
  suppressedBy: WalkModeId | null     # if crisis blocks celebration-only
```

### Priority Hierarchy (Hard Rules)

| Rank | Mode | Rule |
|------|------|------|
| 1 | **Crisis Mode** | Any critical alert → immediate · score floor 90 |
| 2 | **Launch Day** | Launch < 24h → score floor 80 unless crisis |
| 3 | **Celebration Mode** | Major win < 24h → opening ceremony · may blend with brief |
| 4 | **Operations Day** | CX/support critical mass |
| 5 | **Creative Sprint** | Creative queue depth threshold |
| 6 | **Innovation Day** | Marketplace/expansion signals |
| 7 | **Morning Brief** | Default fallback |

Higher rank **wins** unless founder override.

---

## Scoring Examples

### Launch Day Detected

```
Signal: launchEvent "Truth Tuesday" in 8 hours → Launch Day +85
Signal: marketing assets pending approval → Launch Day +10
Signal: revenue milestone yesterday → Celebration +40 (secondary)
Result: Primary Launch Day · Celebration opening ceremony
```

### Quiet Monday

```
Signal: no critical alerts
Signal: support queue normal
Signal: 2 routine approvals low priority
Signal: founder memory — explores on quiet days
Result: Morning Brief · 5 stops · soft atmosphere · Orb offers explore
```

### Crisis Override

```
Signal: production blocker on launch-critical path → Crisis +95
Signal: launch in 8 hours → Launch Day suppressed as primary
Result: Crisis Mode · Production + Publishing · launch deferred in brief
```

---

## Mode Confidence

```yaml
ModeResolution:
  primaryMode: WalkModeId
  secondaryMode: WalkModeId | null
  confidence: enum                  # high · medium · low
  rationale: string[]
  founderConfirmSuggested: boolean    # true if low confidence
```

Low confidence → Orb asks:

> "It could be a creative-focused morning or a standard brief. Which feels right?"

---

## Intraday Re-Resolution

If crisis emerges **during** walk:

```
Crisis signal received mid-walk
    ↓
Orb: "I need to redirect — Production has an urgent blocker."
    ↓
Path recalculates → Crisis stops inserted
    ↓
HQ atmosphere shifts (04) — focused lighting
    ↓
Non-critical stops deferred to brief
```

Walk the Business orchestrator accepts live path updates from Adaptive Walk.

---

## Genome Influence

| Genome Field | Resolution Effect |
|--------------|-------------------|
| `industryType` | Operations vs Creative default weights |
| `celebrationRegister` | Celebration mode threshold · expression |
| `riskTolerance` | Crisis sensitivity |
| `creativeCadence` | Creative Sprint frequency |

Same signals · different mode thresholds per Genome.

---

_Next: [04 — Dynamic Headquarters](./04_DYNAMIC_HEADQUARTERS.md)_
