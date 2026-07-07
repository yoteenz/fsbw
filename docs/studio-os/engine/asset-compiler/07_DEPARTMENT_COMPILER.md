# 07 — Department Compiler

**Engine Module:** `studio.asset-compiler.v1.department-compiler`  
**Status:** Per-department compilation profiles  
**Philosophy:** Each department generates unique assets while following identical SDK rules

---

## Definition

The **Department Compiler** applies department-specific compilation profiles atop the universal compiler pipeline. Every department uses the same engine, the same ordering, the same metadata standard — but produces different asset inventories, prompt templates, and spatial configurations.

> Same compiler. Different departments. Different worlds.

---

## Compile Profile Schema

```yaml
DepartmentCompileProfile:
  id: string                          # matches department ID
  displayName: string
  sdkAnatomyTemplate: string          # reference to SDK anatomy template
  layoutTemplate: enum              # stage | workshop | gallery
  industryAffinity: string[]          # recommended industries

  # Asset inventory
  requiredAssets: AssetSpec[]         # must generate
  optionalAssets: AssetSpec[]         # generate if in Department DNA
  excludedAssets: string[]            # never generate for this department

  # Prompt customization
  promptModifiers: PromptModifier[]   # department-specific template overrides
  materialFamilyHints: string[]       # primary material families
  atmosphereCharacter: string         # department atmosphere description

  # AI staffing (for ai-triggers.json)
  aiRoles: string[]                   # SDK 05 role IDs

  # Workflow
  primaryVerbs: string[]              # dominant interaction verbs
  ceremonies: string[]                # approval, launch, etc.
  outputPorts: string[]               # what this department produces

  # Performance
  assetBudget: number                 # max assets
  sizeBudgetMB: number
```

---

## Canonical Department Profiles

### Creative Direction

| Field | Value |
|-------|-------|
| **ID** | `creative-direction` |
| **Layout** | Stage |
| **Atmosphere** | Editorial creative studio — inspiration-rich, reference-heavy |
| **Required Assets** | environment, mood-wall, glass-table, interactive-wall, asset-shelf, timeline, project-board, orb-pedestal, preview-screen, lighting, materials, particles, audio, camera, interactions |
| **Material Families** | glass, stone, wood |
| **Primary Verbs** | pin, annotate, compare, branch, reference-drop |
| **AI Roles** | creative-director, research-concierge, brand-concierge, orb |
| **Ceremonies** | creative-approval |
| **Unique Assets** | inspiration-shelf, mood-board-wall, variant-split-screen |

---

### Discovery

| Field | Value |
|-------|-------|
| **ID** | `discovery` |
| **Layout** | Gallery |
| **Atmosphere** | Research library — curious, exploratory, reference-dense |
| **Required Assets** | environment, interactive-wall (×2), asset-shelf, glass-table, media-display, floating-panel, lighting, materials, audio, camera, interactions |
| **Material Families** | wood, fabric, glass |
| **Primary Verbs** | reference-drop, pin, compare, version-history |
| **AI Roles** | research-concierge, creative-director, orb |
| **Ceremonies** | none |
| **Unique Assets** | reference-archive-shelf, trend-signal-display, competitor-comparison-wall |

---

### Storyboarding

| Field | Value |
|-------|-------|
| **ID** | `storyboarding` |
| **Layout** | Workshop |
| **Atmosphere** | Production planning room — temporal, sequential, visual |
| **Required Assets** | environment, timeline-table, interactive-wall, preview-screen, glass-table, project-board, lighting, materials, animations, camera, interactions |
| **Material Families** | wood, metal, glass |
| **Primary Verbs** | scrub, drag, pin, annotate, branch |
| **AI Roles** | creative-director, production-manager, orb |
| **Ceremonies** | story-approval |
| **Unique Assets** | storyboard-strip-table, sequence-timeline, shot-list-board |

---

### Talent

| Field | Value |
|-------|-------|
| **ID** | `talent` |
| **Layout** | Gallery |
| **Atmosphere** | Casting gallery — portrait-focused, comparison-oriented |
| **Required Assets** | environment, media-display, preview-screen, glass-table, asset-shelf, interactive-wall, lighting, materials, audio, camera, interactions |
| **Material Families** | velvet, glass, metal |
| **Primary Verbs** | compare, preview, pin, approve, reject |
| **AI Roles** | creative-director, quality-concierge, orb |
| **Ceremonies** | casting-approval |
| **Unique Assets** | portrait-display-wall, talent-comparison-table, expression-preview-screen |

---

### Production

| Field | Value |
|-------|-------|
| **ID** | `production` |
| **Layout** | Workshop |
| **Atmosphere** | Active production floor — focused, operational, timeline-driven |
| **Required Assets** | environment, timeline-table, project-board, command-console, glass-table, asset-shelf, approval-station, lighting, materials, particles, audio, animations, camera, interactions |
| **Material Families** | metal, concrete, glass |
| **Primary Verbs** | scrub, drag, approve, reject, command |
| **AI Roles** | production-manager, quality-concierge, creative-director, orb |
| **Ceremonies** | production-approval, delivery-handoff |
| **Unique Assets** | production-queue-board, dependency-chain-timeline, status-console |

---

### Review

| Field | Value |
|-------|-------|
| **ID** | `review` |
| **Layout** | Stage |
| **Atmosphere** | Quality gallery — evaluative, comparison-focused, ceremonial |
| **Required Assets** | environment, preview-screen (×2), approval-station, glass-table, interactive-wall, media-display, lighting, materials, audio, animations, camera, interactions |
| **Material Families** | glass, stone |
| **Primary Verbs** | compare, preview, approve, reject, annotate |
| **AI Roles** | quality-concierge, brand-concierge, legal-concierge, orb |
| **Ceremonies** | quality-approval, compliance-review |
| **Unique Assets** | side-by-side-preview-screens, compliance-check-station, version-comparison-table |

---

### Publishing

| Field | Value |
|-------|-------|
| **ID** | `publishing` |
| **Layout** | Workshop |
| **Atmosphere** | Distribution command — scheduled, channel-aware, precise |
| **Required Assets** | environment, timeline-table, preview-screen, command-console, glass-table, approval-station, lighting, materials, audio, camera, interactions |
| **Material Families** | metal, glass |
| **Primary Verbs** | scrub, preview, approve, command |
| **AI Roles** | publishing-concierge, marketing-concierge, production-manager, orb |
| **Ceremonies** | publication-approval, launch-celebration |
| **Unique Assets** | channel-preview-screen, schedule-timeline, distribution-console |

---

### Marketing

| Field | Value |
|-------|-------|
| **ID** | `marketing` |
| **Layout** | Stage |
| **Atmosphere** | Campaign war room — strategic, channel-rich, launch-oriented |
| **Required Assets** | environment, mood-wall, timeline-table, preview-screen, approval-station, project-board, asset-shelf, interactive-wall, glass-table, lighting, materials, particles, audio, animations, camera, interactions |
| **Material Families** | glass, stone, wood |
| **Primary Verbs** | compare, preview, approve, reject, branch, scrub |
| **AI Roles** | marketing-concierge, brand-concierge, publishing-concierge, research-concierge, orb |
| **Ceremonies** | campaign-approval, launch-celebration |
| **Unique Assets** | channel-comparison-screen, campaign-timeline, audience-segment-board |

---

### Marketplace

| Field | Value |
|-------|-------|
| **ID** | `marketplace` |
| **Layout** | Gallery |
| **Atmosphere** | Exhibition hall — product-focused, comparison-friendly |
| **Required Assets** | environment, media-display, preview-screen, glass-table, asset-shelf, interactive-wall, floating-panel, lighting, materials, audio, camera, interactions |
| **Material Families** | glass, marble, metal |
| **Primary Verbs** | preview, compare, pin |
| **AI Roles** | brand-concierge, research-concierge, orb |
| **Ceremonies** | listing-approval |
| **Unique Assets** | product-showcase-pedestal, pack-preview-screen, install-preview-console |

---

### Executive

| Field | Value |
|-------|-------|
| **ID** | `executive` |
| **Layout** | Stage |
| **Atmosphere** | Command center — authoritative, overview-rich, decision-focused |
| **Required Assets** | environment, mood-wall, project-board, floating-panel (×3), command-console, glass-table, timeline-table, lighting, materials, particles, audio, camera, interactions |
| **Material Families** | marble, crystal, glass |
| **Primary Verbs** | preview, approve, command, speak |
| **AI Roles** | brand-concierge, production-manager, research-concierge, orb |
| **Ceremonies** | executive-decision, strategy-approval |
| **Unique Assets** | executive-brief-panel, health-score-display, decision-station |

---

## Profile Selection

```
Department DNA.departmentId
         ↓
Lookup DepartmentCompileProfile registry
         ↓
Merge with Department DNA object instances (add/remove optional assets)
         ↓
Generate asset inventory for Prompt Compiler (03)
```

If `departmentId` has no registered profile, compiler uses **universal profile** (SDK minimum objects only) with warning.

---

## Profile Extension

New departments register a profile:

```yaml
# Registration requirements
DepartmentCompileProfile:
  id: string                          # unique
  sdkVersion: "1.0.0"                # compatible SDK version
  anatomyTemplate: string             # validated against SDK 01
  requiredAssets: AssetSpec[]         # minimum SDK objects present
  qaChecklist: string                   # passes SDK 17
```

Profiles are stored in the compiler's profile registry. Marketplace packages include their compile profile for reproducibility.

---

## Cross-Department Consistency

Despite unique assets, all profiles share:

| Shared Rule | Source |
|-------------|--------|
| Generation order | Pipeline 04 |
| Metadata standard | 06 |
| Genome injection | 08 |
| Versioning | 10 |
| Regeneration | 11 |
| QA validation | 12 |
| Package format | 05 |
| Orb platform standard | Platform cache |
| Camera preset structure | SDK 02 |
| Interaction verb catalog | SDK 04 |

---

## Industry Affinity

Profiles declare recommended industries but are **never locked** to an industry:

| Profile | Recommended | Universal |
|---------|-------------|-----------|
| Creative Direction | agency, beauty, fashion | ✓ |
| Discovery | all | ✓ |
| Production | all | ✓ |
| Marketing | all | ✓ |
| Executive | all | ✓ |
| Talent | agency, fashion, media | ✓ |
| Marketplace | retail, creator | ✓ |

Genome transformation (08) handles industry visual expression — not the compile profile.

---

_Next: [08 — Company Genome Injection](./08_COMPANY_GENOME_INJECTION.md)_
