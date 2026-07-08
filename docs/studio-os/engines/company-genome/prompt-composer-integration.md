# Prompt Composer™ Integration™

**Engine Module:** `studio.company-genome.v2.prompt-composer`  
**Status:** Mandatory pre-compose consultation

---

## Law

> **Before Prompt Composer™ builds a production prompt it must automatically query Company Genome™.**

Founder mentions none of the inherited traits — Genome fills them.

---

## Query Contract

```yaml
GenomeComposeQuery:
  orgId: string
  founderIntentId: uuid
  workspaceScene: string | null
  departmentId: string | null
  layerCategory: AssetCategory | null
  blueprintId: string | null
  minConfidence: number           # default 60
```

**Response:** `CompanyGenomeSnapshot` + resolved tokens for compose.

---

## Integration Point

```
Founder Intent™
         ↓
Prompt Composer™ Stage ① Fetch Sources
         ↓
★ queryCompanyGenome(orgId) ★     ← MANDATORY
         ↓
Company DNA™ injection (composition source #1)
         ↓
Merge with Blueprint · Workspace · Registry · …
         ↓
ProductionPrompt™
```

See [composition-sources.md](../prompt-composer/composition-sources.md).

---

## Example

### Founder says

> *"Create a headquarters."*

### Genome auto-inherits (confidence ≥ 80)

| Trait | Source strand | Confidence |
|-------|---------------|------------|
| Warm editorial lighting | Visual DNA™ | 97% |
| Calacatta marble · aged brass | Visual DNA™ | 94% |
| Floating architecture volumes | Visual DNA™ | 92% |
| Editorial luxury atmosphere | Visual DNA™ | 91% |
| Archviz realism level | Visual DNA™ | 88% |
| Slow orbital camera | Visual DNA™ | 85% |
| Deliberate pacing | Creative DNA™ | 82% |
| Generous spacing | Brand DNA™ | 90% |
| editorial-luxury quality tier | Operational DNA™ | 89% |

### Founder sees

*"Composing headquarters — applying your established editorial luxury language."*

Never: a list of 40 genome fields.

---

## Token Resolution

```yaml
GenomeTokens:
  materialLanguage: "warm calacatta marble, aged brushed brass, frosted glass"
  lightingStyle: "warm editorial key-fill with subtle volumetric haze"
  editorialDirection: "restrained luxury editorial atelier"
  architecturePreference: "floating volumes, monumental double-height"
  realismLevel: "architectural-visualization fidelity"
  cameraMotivation: "slow orbital establishing"
  negativeConstraints:
    - heavy industrial materials
    - cold steel palette
    - SaaS dashboard aesthetic
```

Stored in `ProductionPrompt™.provenance.companyDnaHash`.

---

## Low-Confidence Behavior

| Confidence | Compose behavior |
|------------|----------------|
| ≥ 80 | Auto-inject silently |
| 60–79 | Inject · Orb mentions lightly |
| 40–59 | Inject weakly · may ask one question |
| < 40 | Omit · use Blueprint defaults |

---

## Cache

```yaml
GenomeComposeCache:
  orgId: string
  snapshotHash: sha256
  ttlSeconds: 300
```

Invalidated on `GenomeUpdateEvent`.

---

## Forbidden

| Forbidden | Required |
|-----------|----------|
| Compose without Genome query | Mandatory fetch |
| Hardcode org-specific traits | Snapshot per orgId |
| Founder re-state preferences | Genome injection |

---

_Prompt Composer™ Integration — the company whispers before the prompt speaks._
