# Learning System™ — Accumulating Creative Intelligence

**Module:** `studio.asset-intelligence.v1.learning`  
**Status:** Preference · reuse · rejection learning loop

---

## Mission

**Asset Intelligence Engine™** learns from every founder decision so future recommendations become increasingly accurate.

Every generation makes future generations smarter.

---

## What the Engine Learns

| Signal | Learning |
|--------|----------|
| **Assets frequently reused** | Boost category · material · style in rankings |
| **Assets frequently rejected** | Lower scores · suggest alternatives |
| **Founder preferences** | Override thresholds per category |
| **Favorite materials** | DNA weight · search bias |
| **Favorite lighting** | Lighting profile priority |
| **Favorite architecture** | Environment Shell™ · landmark bias |
| **Favorite styles** | Style coherence enforcement |
| **Generate New overrides** | Novelty preference · when reuse feels stale |
| **Duplicate & Modify patterns** | Common modify specs → prompt fragments |

---

## Learning Sources

```
Founder Control™ choices
         +
Creative Approval Pipeline™ approve / reject / regenerate
         +
Scene Stack™ per-layer decisions
         +
Founder Taste Engine™ taste vectors
         +
Reuse telemetry (reuseCount · lastUsed)
         +
Marketplace pack adoption
```

---

## Taste Integration

[Founder Taste Engine™](../founder-taste-engine/README.md) supplies **WHY** behind choices.

| Taste Signal | Intelligence Effect |
|--------------|---------------------|
| Approves warm bronze | Boost bronze Material™ matches |
| Rejects cool slate | Penalize cool palette in Close Match™ |
| Regenerates lighting often | Lower auto-trust for lighting |
| Branches concepts | Preserve alternates · don't delete |
| Director Feedback™ | Natural language preference rules |

Intelligence learns **preferences**, not just clicks.

---

## Preference Model (Conceptual)

```yaml
OrgPreferenceProfile:
  orgId: string
  materials:
    favored: string[]          # bronze, dark-marble
    avoided: string[]
  lighting:
    favoredProfiles: string[]
    temperatureBias: warm | cool | neutral
  architecture:
    favoredStyles: string[]
    landmarkAffinities: string[]
  reuse:
    defaultDelegation: always-ask | trust-exact | trust-recommendations
    categoryOverrides:
      lighting: { minScoreForAutoReuse: 98 }
      furniture: { preferModifyOverGenerate: true }
  novelty:
    generateNewRate: number    # % overrides — high = more novel requests
```

Stored in org-scoped intelligence plane — not in UI components.

---

## Rejection Learning

When founder rejects a reuse recommendation:

| Data Captured | Use |
|---------------|-----|
| Candidate asset ID | Don't lead with same asset for similar request |
| Rejection reason (optional) | Tune scoring weights |
| Chosen alternative | Positive signal for winner |
| Request context | Department · station · category |

Rejected assets remain in Registry — **Alternate Branch™** for taste, not deletion.

---

## Cross-Department Learning

Patterns propagate when DNA-aligned:

```
CDS: founder always reuses editorial lighting
         ↓
Marketing request for "editorial spotlights"
         ↓
Boost same lighting family before Finance-only assets
```

Cross-department reuse is a **feature** when Company DNA™ strengthens.

---

## Pack Learning

| Signal | Effect |
|--------|--------|
| Pack assets reused often | Recommend pack siblings |
| Pack assets never used | Surface in Command Dock · don't auto-rank |
| Purchased pack | Entitlement + preference boost |

---

## Feedback Loop Timing

| Phase | Learning |
|-------|----------|
| **Immediate** | Update `lastUsed` · `reuseCount` |
| **Session** | Adjust candidate ranking for similar requests |
| **Weekly** | Recompute org preference profile |
| **Milestone** | DNA report · reuse efficiency scorecard |

---

## Privacy & Export

- Preference profiles are **org-owned**
- Export via Business Discovery / data portability flows
- Delete org → intelligence profile archived per policy

---

## Metrics

| Metric | Healthy Signal |
|--------|----------------|
| Recommendation acceptance rate | Rising over time |
| Avg compatibility at acceptance | Stable or rising |
| Generate New override rate | Stable (not frustration spike) |
| Cross-department reuse rate | Rising in mature orgs |
| Time-to-decision at gate | Falling (trust building) |

---

_Learning System™ — every decision teaches the OS._
