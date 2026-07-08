# Company DNA™ — Visual Identity Coherence

**Module:** `studio.asset-intelligence.v1.company-dna`  
**Status:** Material · lighting · architecture consistency protection

---

## Mission

Over time, every company develops its own **visual DNA**.

Materials repeat. Lighting evolves consistently. Architectural language stays coherent. Brand identity naturally strengthens.

**Studio OS should protect this consistency** — not accidentally fragment it through unnecessary regeneration.

---

## What Is Company DNA™?

| Dimension | Examples |
|-----------|----------|
| **Materials** | Dark marble · brushed bronze · smoked glass |
| **Lighting** | Warm editorial pools · volumetric haze |
| **Architecture** | Double-height atelier · bronze columns |
| **Color** | Warm bronze accent · deep slate base |
| **Style** | Luxury editorial · executive formal |
| **Motion** | Slow ambient drift · low particle density |
| **Audio** | Warm ambient bed · minimal UI sounds |

DNA emerges from **approved Registry assets** + **founder choices** — not from a one-time settings form.

---

## DNA Profile

```yaml
CompanyDNA:
  orgId: string
  version: number
  materialFamilies:
    - id: dark-marble-executive
      registryRefs: string[]
      weight: 0.85
    - id: bronze-metal-trim
      registryRefs: string[]
      weight: 0.92
  lightingSignatures:
    - profile: editorial-volumetric-warm
      registryRefs: string[]
      departments: string[]
  architecturalLanguage:
    primary: luxury-atelier
    shellRefs: string[]
    landmarkRefs: string[]
  colorSystem:
    dominant: string[]
    accent: string[]
  coherenceScore: number          # 0-100 platform-computed
  lastUpdated: datetime
```

Derived from Registry — updated on each approval and reuse.

---

## DNA in Compatibility Scoring

| DNA Alignment | Score Effect |
|---------------|--------------|
| Reuse strengthens existing material family | +10% compatibility |
| Reuse matches lighting signature | +8% |
| New material family (novel) | Flag `dna-material-drift` |
| Conflicting architecture style | Flag `dna-style-fork` |

Intelligence **rewards coherence** without blocking intentional evolution.

---

## Protection Rules

### Prefer DNA-Aligned Reuse

When two candidates score within 5 points, **DNA-aligned asset wins**.

### Warn on Drift

New generation that introduces third marble family when two exist:

> *"Your company uses dark Calacatta and warm travertine. This request would add a cool gray marble — may fragment floor continuity across Finance and Executive."*

Founder may proceed — learning records intentional fork.

### Landmark Coherence

Signature Landmarks™ are department identity — Intelligence does not recommend cross-department landmark swap without **Can Be Modified™** path.

### Scene Stack Layer Coherence

Within a station, layers should share:

- Lighting temperature
- Material palette
- Atmospheric density

Intelligence flags layer sets that mix incompatible approved assets.

---

## DNA Evolution (Intentional)

DNA is not frozen. **Evolution™** stage allows:

- Gradual lighting migration (Upgrade™ paths)
- Seasonal atmosphere packs
- Expedition-driven visual transformation

Expedition milestones may declare **DNA chapter transitions** — Intelligence respects chapter boundaries.

---

## Relationship to Company Genome™

| System | Role |
|--------|------|
| **Company Genome™** | Structured brand/company data slots |
| **Company DNA™** | Emergent visual patterns from approved assets |

Genome informs adaptation. DNA emerges from reuse history.

See [company-genome-adaptation.md](../engines/studio-asset-registry/company-genome-adaptation.md).

---

## Founder Memory™

DNA coherence enables Founder Memory™ anchors:

- *"We always use bronze in our ateliers"*
- *"Our lighting is warm editorial — never cool fluorescent"*
- *"Finance and CDS share the same marble language"*

---

## Reporting

| Report | Audience |
|--------|----------|
| DNA Coherence Scorecard | Mission Control · founder |
| Material family map | Creative directors |
| Lighting signature coverage | Production |
| Drift warnings log | Audit |

---

## Success

Company DNA™ succeeds when:

- Departments feel like **one company**, not one SaaS with skins
- Reuse **strengthens** identity instead of repeating randomly
- New generation is **conscious evolution**, not accidental drift

---

_Company DNA™ — consistency is a creative asset._
