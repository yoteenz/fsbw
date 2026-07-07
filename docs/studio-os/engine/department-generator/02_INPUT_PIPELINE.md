# 02 — Input Pipeline

**Engine Module:** `studio.department-generator.v1.input-pipeline`  
**Status:** Canonical input resolution system  
**Philosophy:** Founders supply intelligence. The Generator supplies generation tasks. Founders never manually prompt FAL.

---

## Design Principle

> Every input is **structured data** — not free text, not screenshots of settings pages, not ad-hoc chat messages to an image model.

The Input Pipeline resolves, validates, normalizes, and prioritizes all intelligence domains before any compiler runs.

---

## Input Domains

| # | Input | Schema ID | Required | Source |
|---|-------|-----------|----------|--------|
| 1 | Company Genome™ | `company-genome.snapshot.v1` | Yes | Genome service (M277) |
| 2 | Project Genome™ | `project-genome.snapshot.v1` | Conditional | Active project |
| 3 | Department Type™ | `department-type.id` | Yes | Founder selection or HQ expansion |
| 4 | Industry DNA™ | `industry-dna.v1` | Yes | Derived from Genome + industry catalog |
| 5 | Experience DNA™ | `experience-dna.v1` | Yes | Company Genome + Experience Architect |
| 6 | Design Language™ | `design-language.v1` | Yes | Design Language System |
| 7 | Founder Notes™ | `founder-notes.v1` | Optional | Voice · sketch · text drops |
| 8 | Mood Board™ | `mood-board.snapshot.v1` | Optional | Creative Direction Studio™ |
| 9 | Reference Library™ | `reference-library.snapshot.v1` | Optional | Creative Direction · Discovery |
| 10 | Creative Direction™ | `creative-direction.snapshot.v1` | Optional | Creative Direction Studio™ |
| 11 | Brand Assets™ | `brand-asset-manifest.v1` | Optional | Brand Architect · asset vault |
| 12 | Marketplace Expansions™ | `marketplace-expansion.v1[]` | Optional | Installed HQ expansions |
| 13 | Current Headquarters™ | `headquarters-context.v1` | Yes | HQ Engine |

---

## Resolution Pipeline

```
Raw Inputs (13 domains)
       ↓
Schema Validation
       ↓
Completeness Scoring (per department type requirements)
       ↓
Conflict Detection (Genome vs Creative Direction vs Industry DNA)
       ↓
Priority Merge (Project overrides Genome where allowed)
       ↓
Normalized GeneratorContext
       ↓
Department DNA Resolver (03)
```

---

## Per-Input Specification

### 1. Company Genome™

| Field Group | Generator Use |
|-------------|---------------|
| mission · values · brandDNA | AI Team tone · environmental storytelling |
| materialLanguage · lightingStyle | Environment Compiler |
| photographyDirection · editorialDirection | Object surface character |
| voice · customerEmotions | Audio Compiler · Orb register |
| visualReferences | Environment view plates · seed references |
| experienceDNA | Animation pacing · ambient personality |

**Rule:** Genome is apex identity. Generator reads; never writes.

### 2. Project Genome™

| Field | Generator Use |
|-------|---------------|
| projectIntent · audience | Zone content seeds |
| projectMood · palette | Mood Wall defaults |
| activeBranches | Sandbox + timeline object config |
| approvalState | Ceremony bindings |

Required when generating project-scoped departments (Creative Direction, Production, Review). Optional for HQ-only departments (Executive).

### 3. Department Type™

```yaml
DepartmentTypeId:
  id: string                    # creative-direction | discovery | law-firm | ...
  version: semver               # DNA catalog version
  industryAffinity: string[]    # recommended industries
  maturityGate: MaturityLevel   # minimum org maturity
```

Resolves to full Department DNA template (03).

### 4. Industry DNA™

| Industry | DNA Character |
|----------|---------------|
| Luxury beauty | Tactile · editorial · warm materials |
| Financial editorial | Precise · minimal · cool neutrals |
| Restaurant | Sensory · hospitality · natural wood |
| Law firm | Authoritative · trust · dark wood |
| Medical | Clinical calm · hygiene · soft light |
| Construction | Industrial · honest materials · scale |
| Education | Open · inspiring · readable |
| Salon | Intimate · service · mirror metaphors |

Industry DNA **modulates** Department DNA — does not replace SDK topology.

### 5. Experience DNA™

| Attribute | Compiler Target |
|-----------|-----------------|
| pacingMultiplier | Animation Compiler |
| ceremonyWeight | Approval rituals |
| ambientDensity | Particle + audio layers |
| interactionVerbosity | Interaction Compiler hint density |
| arrivalDuration | Animation arrival profile |

### 6. Design Language™

Structural visual law from SDK 07 — typography classes, spacing rhythm, glass treatment rules. Generator binds to object metadata; never overrides spatial topology.

### 7. Founder Notes™

| Type | Routing |
|------|---------|
| Voice transcript | Brief Wall seed · AI Team context |
| Sketch overlay | Sandbox object annotation defaults |
| Direction change | Creative Direction merge before compile |
| Rejection reason | Archive behavior on Mood objects |

### 8. Mood Board™

Living inspiration surface snapshot — pinned references, clusters, approved direction tier. Seeds Mood Wall object defaults and Environment atmosphere hints.

### 9. Reference Library™

Categorized archive — feeds Object Compiler seed assets and Research Concierge auto-tag training context.

### 10. Creative Direction™

Living creative summary — mission, objective, audience, direction statement. Required for production-adjacent departments. Optional for greenfield industry departments.

### 11. Brand Assets™

| Asset Type | Use |
|------------|-----|
| Logo variants | Observatory · Brief Wall — never hero banner |
| Color tokens | Genome slot validation |
| Typography specimens | Object text plane hints |
| Photography canon | Mood Wall seed filter |

### 12. Marketplace Expansions™

Installed expansions that **extend** base Department DNA — additional objects, AI roles, audio stems, interaction verbs. Merge rules in Package Spec (13).

### 13. Current Headquarters™

```yaml
HeadquartersContext:
  buildingId: string
  organizationId: string
  installedDepartments: DepartmentTypeId[]
  connectionGraph: DepartmentConnection[]
  maturityLevel: MaturityLevel
  workspaceId: string
```

Determines placement, navigation ports, and maturity-gated features.

---

## Validation Rules

| Rule | Action on Fail |
|------|----------------|
| Company Genome incomplete | Warn · use defaults · flag Observatory gaps |
| Department Type unknown | Hard fail |
| Maturity below DNA gate | Soft fail · recommend maturity upgrade |
| Creative Direction missing for production dept | Warn · generate with Genome-only seeds |
| Marketplace expansion incompatible | Hard fail · list conflicts |
| Regeneration scope invalid asset ID | Hard fail |

---

## Conflict Resolution

| Conflict | Resolution |
|----------|------------|
| Project mood vs Genome photographyDirection | Project wins for Mood Wall; Genome wins for materials |
| Creative Direction vs Brand DNA | Flag for Brand Concierge; compile both; Runtime surfaces divergence |
| Industry DNA vs Department DNA topology | Department DNA topology fixed; Industry modulates materials only |
| Marketplace expansion vs base object ID | Expansion wins on ID collision with version semver check |

---

## Founder Experience Contract

| Founder Does | Founder Never Does |
|--------------|-------------------|
| Select department type | Type FAL prompts |
| Approve generated package preview | Arrange objects in a page builder |
| Request regeneration of lighting only | Rebuild entire department manually |
| Drop references into Creative Direction | Paste URLs into a generation box |
| Say *"Create a Publishing department"* | Design dashboard wireframes |

---

## Output: Normalized GeneratorContext

```yaml
GeneratorContext:
  resolvedAt: ISO8601
  completenessScore: number       # 0–100
  warnings: ValidationWarning[]
  companyGenome: CompanyGenomeSnapshot
  projectGenome: ProjectGenomeSnapshot | null
  departmentType: DepartmentTypeId
  resolvedDNA: ResolvedDepartmentDNA    # from 03
  industryModifiers: IndustryModifier[]
  experienceModifiers: ExperienceModifier[]
  creativeContext: CreativeContextBundle | null
  headquarters: HeadquartersContext
  regenerationScope: RegenerationScope | null
```

Passed to all compilers (04–09).

---

_Next: [03 — Department DNA](./03_DEPARTMENT_DNA.md)_
