# Compatibility Engine™

**Module:** `studio.asset-intelligence.v1.compatibility`  
**Status:** Match scoring · recommendations · explanations

---

## Mission

The **Compatibility Engine™** determines whether an existing Registry asset can satisfy a new request — and **explains WHY**.

Studio OS never silently reuses. Every decision is scored, classified, and narrated.

---

## Match Outcomes

| Outcome | Score Range (default) | Recommended Action |
|---------|----------------------|-------------------|
| **Exact Match™** | ≥ 95 | **Reuse Existing™** |
| **Close Match™** | 85–94 | **Reuse Existing™** (founder confirm) |
| **Can Be Modified™** | 70–84 | **Duplicate & Modify™** |
| **Requires Upgrade™** | 55–69 | **Upgrade™** (resolution · quality · genome) |
| **Generate New™** | < 55 | **Generate Completely New™** |

Thresholds are org-tunable. Founder Taste Engine™ may adjust floors per category over time.

---

## Scoring Model

Composite **Compatibility Score™** (0–100):

| Signal | Weight | Description |
|--------|--------|-------------|
| Category match | 20% | Exact · parent · cross-role |
| Visual role alignment | 18% | Same function in scene |
| Material compatibility | 12% | Materials™ overlap |
| Lighting profile alignment | 10% | Same mood · temperature |
| Style coherence | 10% | Editorial vs executive etc. |
| Company DNA™ alignment | 10% | Strengthens vs risks drift |
| Department context | 8% | Same · compatible · cross-dept OK |
| Genome / Room DNA fit | 7% | Slot coverage · slider overlap |
| Quality tier | 5% | Golden vs draft |
| Reuse history | 5% | Proven assets boost |
| Recency | 5% | Last Used™ within project |

---

## Outcome Logic

### Exact Match™

```
score ≥ 95
AND category exact
AND visual role identical
AND no DNA risk flags
→ Reuse Existing™ (zero provider)
```

**Example:** Executive Marble Floor™ for Finance vault — 98% — same artifact, same material family, used in Capital Vault™.

---

### Close Match™

```
score 85–94
AND minor deltas (scale · palette shift within DNA)
→ Reuse Existing™ with founder confirmation
```

**Example:** Editorial Lighting Pack™ for CDS station — 96% — same rig family, station tag differs.

---

### Can Be Modified™

```
score 70–84
AND structural match · finish/scale/content differs
→ Duplicate & Modify™
```

**Example:** Creative Library Shelving™ for Marketing bronze shelves — 91% — duplicate + finish swap.

---

### Requires Upgrade™

```
score 55–69
AND asset exists but quality/resolution/genome insufficient
→ Upgrade™ (targeted regen from parent)
```

**Example:** Older lighting layer at 2K when project requires 4K golden tier.

---

### Generate New™

```
score < 55
OR no candidates
OR founder DNA requires novel expression
→ Generate Completely New™
```

Generation Manager™ invoked only after this classification.

---

## Explanation Contract

Every recommendation **must** include human-readable rationale:

```yaml
Explanation:
  summary: string              # one sentence
  factors:
    positive: string[]         # why it matches
    neutral: string[]          # acceptable deltas
    risks: string[]            # DNA drift · dependency warnings
  comparison:
    vsGenerate: string         # what reuse saves
    vsAlternatives: string     # why this candidate over #2
```

**Example explanation:**

> *"Editorial Lighting Pack™ matches your volumetric bronze-pool profile used in Story Table™ and Mood Wall™ (96%). Reusing preserves lighting continuity and saves ~4 provider calls. Minor station framing difference — no regen required."*

---

## Dependency Awareness

Before recommending reuse, Compatibility Engine checks:

| Check | Failure Action |
|-------|----------------|
| Required dependencies approved | Block reuse · list missing |
| Scene Stack layer order | Lighting reuse must not break shell |
| Landmark pairing | Furniture must scale to landmark |
| Pack license valid | Suggest purchase if unentitled |
| Deprecated successor exists | Recommend successor item |

Aligns with [dependency-graph.md](../engines/studio-asset-registry/dependency-graph.md).

---

## Multi-Candidate Ranking

Present top **3** candidates when scores within 10 points:

```
#1 Editorial Lighting Pack™     96%  Reuse Existing™
#2 Warm Pool Lighting v2        89%  Reuse Existing™
#3 CDS Mood Wall Rig            87%  Reuse Existing™
```

Default = #1. Founder may select any.

---

## DNA Risk Flags

| Flag | Trigger | UI Signal |
|------|---------|-----------|
| `dna-material-drift` | New marble family vs Company DNA™ | Warn · suggest existing material |
| `dna-lighting-break` | Different color temperature | Warn · show palette comparison |
| `dna-style-fork` | Executive vs editorial mix | Inform · founder decides |
| `dna-landmark-conflict` | Wrong archetype landmark | Block exact reuse |

See [company-dna.md](./company-dna.md).

---

## Compiler Reuse Engine Relationship

| Layer | Scope |
|-------|-------|
| **Compatibility Engine™** | Founder-facing · interactive · explains WHY |
| **Reuse Engine** (Registry) | Batch compile · manifest scan · build-report |

Both share scoring signals. Compatibility Engine is authoritative for **interactive** requests.

---

## Telemetry

| Event | Use |
|-------|-----|
| `compatibility.scored` | Candidate analytics |
| `compatibility.exact` | Reuse success rate |
| `compatibility.override` | Founder chose Generate New™ |
| `compatibility.explained` | Explanation quality feedback |

---

_Compatibility Engine™ — score, classify, explain._
