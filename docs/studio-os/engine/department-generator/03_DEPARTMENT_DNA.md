# 03 — Department DNA

**Engine Module:** `studio.department-generator.v1.department-dna`  
**Status:** Per-type department identity catalog  
**Philosophy:** Same DNA topology across companies. Different Genome → completely different soul.

---

## Definition

**Department DNA™** is the canonical identity template for a department type — defining purpose, emotional goal, spatial rules, object inventory, interaction style, AI team, and ambient personality.

> Department DNA is **what kind of place** this is. Company Genome is **whose place** it is.

---

## DNA Schema

```yaml
DepartmentDNA:
  id: DepartmentTypeId
  version: semver
  displayName: string
  category: enum                  # creative | production | executive | industry | commerce

  # Identity
  purpose: string
  emotionalGoal: string[]
  metaphor: string

  # Spatial (SDK 02)
  layoutTemplate: enum            # stage | workshop | gallery
  spatialRules: SpatialRuleSet
  zoneInventory: ZoneSpec[]
  lightingPhilosophy: string
  materialFamilies: string[]

  # Objects (SDK 03)
  primaryObjects: ObjectClassId[]
  secondaryObjects: ObjectClassId[]
  forbiddenObjects: ObjectClassId[]

  # Interaction (SDK 04)
  primaryVerbs: VerbId[]
  ceremonies: CeremonyId[]
  interactionStyle: enum          # editorial | command | gallery | workshop | executive

  # Motion + Audio (SDK 08–09)
  motionLanguage: MotionProfileId
  ambientPersonality: AmbientProfileId

  # AI Team (SDK 05)
  requiredAIRoles: AIRoleId[]
  optionalAIRoles: AIRoleId[]

  # Navigation
  entryBehavior: ArrivalProfileId
  exitPorts: DepartmentConnection[]
  orbPresence: OrbPlacementSpec

  # Compile
  assetBudget: number
  promptBudget: number
  atmosphereCharacter: string
```

---

## DNA Catalog (Canonical Types)

### Creative Pipeline

| ID | Purpose | Emotional Goal | Layout | Hero Object |
|----|---------|----------------|--------|-------------|
| `creative-direction` | Living creative brain | Inspired · Powerful · Supported | Stage | Mood Wall |
| `discovery` | Research and exploration | Curious · Exploratory | Gallery | Reference Archive |
| `story` | Narrative and sequence | Imaginative · Sequential | Workshop | Storyboard Strip |
| `production` | Execution command | Capable · Focused | Workshop | Command Table |
| `review` | Quality and comparison | Discerning · Clear | Gallery | Comparison Screens |
| `publishing` | Launch and distribution | Anticipatory · Proud | Stage | Launch Timeline |
| `marketing` | Campaign direction | Bold · Strategic | Stage | Campaign Mood Wall |

### Commerce & Executive

| ID | Purpose | Emotional Goal | Layout | Hero Object |
|----|---------|----------------|--------|-------------|
| `marketplace` | Asset discovery and install | Exploratory · Trusting | Gallery | Asset Gallery Wall |
| `executive-hq` | Strategic command | Commanding · Clear | Stage | Strategy Observatory |

### Industry Departments

| ID | Purpose | Emotional Goal | Layout | Hero Object |
|----|---------|----------------|--------|-------------|
| `photography` | Visual capture direction | Precise · Aesthetic | Gallery | Light Table |
| `podcast` | Audio show production | Warm · Conversational | Workshop | Recording Console |
| `education` | Curriculum and learning | Open · Inspiring | Gallery | Learning Wall |
| `salon` | Service experience design | Intimate · Luxurious | Stage | Styling Mirror Wall |
| `law-firm` | Legal strategy HQ | Authoritative · Trustworthy | Stage | Precedent Library |
| `medical` | Clinical innovation | Calm · Precise | Workshop | Patient Journey Table |
| `restaurant` | Culinary innovation | Sensory · Warm | Workshop | Menu Innovation Table |
| `construction` | Project command | Industrial · Capable | Workshop | Site Command Table |

---

## DNA Field Deep Dive

### Purpose

One sentence — what this department **does** for the organization. Feeds Brief Wall seeds and AI Team system prompts.

### Emotional Goal

3–6 adjectives the founder must feel. Validated in Department QA (16).

| Example (creative-direction) | Inspired · Curious · Creative · Powerful · Focused · Supported |
|------------------------------|---------------------------------------------------------------|

### Architecture (Spatial Rules)

| Rule | Specification |
|------|---------------|
| Topology | Fixed per DNA — Genome changes materials only |
| Ceiling | Double-volume at hero zone (Stage) or uniform (Workshop) |
| Entry | Portal required — never direct page load aesthetic |
| Orb | Physical pedestal — never chat bubble |
| Floor | Reflective material family — Genome slot |
| Exterior | Window plate — Genome-driven view |

### Lighting

Three-point rig minimum. DNA defines character; Genome defines temperature.

| DNA | Light Character |
|-----|-----------------|
| creative-direction | Editorial wash · warm work key |
| law-firm | Desk-lamp pools · mahogany warmth |
| restaurant | Golden hour · kitchen muffled accent |

### Materials

Primary families from DNA. Genome injects specific stone, wood, metal, glass variants.

### Interaction Style

| Style | Verb Dominance | UI Forbidden |
|-------|----------------|--------------|
| editorial | pin · annotate · compare | forms · tables |
| command | scrub · approve · branch | card grids |
| gallery | browse · inspect · filter | sidebars |
| workshop | drag · branch · preview | modals |
| executive | inspect · approve · speak | metrics dashboards |

### Motion Language

| Profile | Pace | Ceremony Weight |
|---------|------|-----------------|
| editorial-slow | 0.9× | High |
| command-crisp | 1.0× | Medium |
| gallery-drift | 0.8× | Low |
| workshop-direct | 1.1× | Medium |
| executive-measured | 1.0× | High |

### AI Specialists

Per-type roster compiled in AI Team Compiler (07). Universal: **Studio Orb™** always present.

### Navigation

| Field | Rule |
|-------|------|
| entryBehavior | Arrival sequence required — duration from Experience DNA |
| exitPorts | Minimum 1 — to adjacent pipeline departments |
| orbPresence | Visible within 2s of entry camera |

### Ambient Personality

Particle density · audio stem family · exterior motion character. Genome modulates; DNA selects profile.

---

## DNA Inheritance from Golden Department

`creative-direction` DNA is **canonical** — sourced from Golden Department spec:

| Golden Department Doc | DNA Field |
|----------------------|-----------|
| 01_THE_ROOM | spatialRules · zoneInventory |
| 03_INTERACTIVE_ZONES | primaryObjects · zoneInventory |
| 08_INTERACTION_MAP | primaryVerbs · ceremonies |
| 09_ORB_AND_CONCIERGE | requiredAIRoles |
| 10_MOTION_AND_AUDIO | motionLanguage · ambientPersonality |

Future departments **extend** this pattern — never omit Golden Department principles.

---

## DNA Resolution

```
DepartmentTypeId
       ↓
Load DNA template from catalog
       ↓
Apply Industry DNA modifiers
       ↓
Apply Experience DNA modifiers
       ↓
Merge Marketplace Expansions
       ↓
Validate against SDK anatomy (01)
       ↓
ResolvedDepartmentDNA → all compilers
```

---

## DNA Versioning

| Change Type | Version Bump |
|-------------|--------------|
| New optional object | Minor |
| New required zone | Major |
| Verb addition | Minor |
| Topology change | Major — requires migration |
| AI role addition | Minor |

---

_Next: [04 — Environment Compiler](./04_ENVIRONMENT_COMPILER.md)_
