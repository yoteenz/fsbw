# 16 — Department Creation Guide

**SDK Module:** `studio.department.sdk.v1.creation-guide`  
**Status:** Official authoring workflow  
**Philosophy:** Every new department follows the same creation process — no shortcuts

---

## Overview

This is the **official step-by-step workflow** for creating a brand-new Studio OS department. Every department — regardless of industry — follows these steps in order.

**Estimated artifacts produced:** 14+ asset modules, 6+ configuration files, 3+ preview renders.

---

## Prerequisites

Before starting:

| Prerequisite | Source |
|-------------|--------|
| SDK documents read (01–15) | This package |
| Approved blueprint (if generating assets) | Blueprint Manager |
| Company Genome™ available (for testing transforms) | Genome service |
| FAL model selections confirmed | `motherboard/golden-models/` |
| QA reviewer assigned | Team roster |

---

## Phase 1: Define (Specification)

### Step 1.1 — Declare Purpose and Responsibilities

Write the department's business purpose and responsibilities.

```
□ Purpose statement (one sentence)
□ Responsibilities list (≤ 12 verbs)
□ Industry tags (or universal)
□ Maturity level (starter / growth / enterprise)
□ Building assignment in HQ hierarchy
```

**Output:** Purpose document (section of anatomy.json)

### Step 1.2 — Author Department Anatomy

Complete the full anatomy schema per [01 — Department Anatomy](./01_DEPARTMENT_ANATOMY.md).

```
□ department.id (globally unique, kebab-case)
□ department.version (semver, start at 1.0.0)
□ All 13 anatomy fields completed
□ Inputs declared (minimum: project)
□ Outputs declared (minimum: asset or project-update)
□ Genome hooks declared (all mandatory domains)
□ Marketplace metadata declared (packagable: true)
```

**Output:** `anatomy.json`

### Step 1.3 — Select Layout Template

Choose spatial layout template per [02 — Spatial Layout System](./02_SPATIAL_LAYOUT_SYSTEM.md).

```
□ Template selected (stage / workshop / gallery)
□ Entry point defined
□ Hero space defined
□ Primary zone defined
□ Secondary zones defined (0–2)
□ Orb position defined
□ Lighting anchors defined (minimum 3)
□ Camera positions defined (all 6)
□ Exit portal defined
```

**Output:** `spatial-layout.json`

---

## Phase 2: Compose (Objects and Interactions)

### Step 2.1 — Place Objects

Select and place object class instances per [03 — Object Library](./03_OBJECT_LIBRARY.md).

```
□ Entry Marker placed
□ Orb Pedestal placed (required)
□ Primary work surface placed (Glass Table, Timeline Table, or Command Console)
□ Approval Station placed (if department has approval responsibility)
□ Supporting objects placed (Asset Shelf, Preview Screen, etc.)
□ Exit Portal placed
□ All objects have unique instanceIds
□ All objects assigned to zones
□ No overlapping placements (spacing ≥ 0.15)
```

**Output:** `objects.json`

### Step 2.2 — Define Interaction Maps

Bind verbs to objects and zones per [04 — Interaction Engine](./04_INTERACTION_ENGINE.md).

```
□ Every responsibility has at least one verb binding
□ All zones have allowedVerbs declared
□ All objects have interaction profiles
□ Permission requirements specified per verb
□ Feedback profiles assigned per verb
□ No form-only workflows
```

**Output:** `interaction-maps.json`

### Step 2.3 — Assign AI Employees

Staff the department per [05 — AI Employee System](./05_AI_EMPLOYEE_SYSTEM.md).

```
□ Minimum 1 specialist + Orb
□ Each AI has role, permissions, memory scope
□ Escalation rules defined
□ No single AI monopoly on decisions
□ AI collaboration flows documented
□ Brand Concierge included (recommended)
```

**Output:** `ai-employees.json`

---

## Phase 3: Generate (Assets)

### Step 3.1 — Create Blueprint

Register blueprint in Blueprint Manager with department specification.

```
□ Blueprint category selected
□ Department anatomy linked
□ Spatial layout linked
□ Object instances listed
□ Material family hints (neutral)
□ Generation plan created
□ Blueprint approved
```

**Output:** Approved blueprint in Blueprint Manager

### Step 3.2 — Compile with FAL

Run FAL Asset Compiler per [14 — FAL Asset Compiler](./14_FAL_ASSET_COMPILER.md).

```
□ Compilation plan reviewed and approved
□ Cost estimate acknowledged
□ Generation executed (14 module categories)
□ All modules pass post-processing validation
□ No branding detected in generated assets
□ All Genome slots verified empty
□ Modules registered in Asset Registry™
```

**Output:** `assets/` directory with 14 category folders

### Step 3.3 — Validate Assets

Verify all assets per [06 — Asset Standard](./06_ASSET_STANDARD.md).

```
□ All 12+ asset categories present
□ Each module has valid schema
□ Each module has version tag
□ Each module has fallbackId
□ No flattened/combined scenes
□ No hardcoded colors, logos, or text
□ LOD variants generated for environment + furniture
□ Total package size ≤ 25 MB
```

**Output:** Validated asset package

---

## Phase 4: Configure (Genome and Dependencies)

### Step 4.1 — Declare Genome Rules

Complete genome hook declarations per [10 — Company Genome Integration](./10_COMPANY_GENOME_INTEGRATION.md).

```
□ All 20+ mandatory domains have hooks
□ Each hook has targets and fallback
□ genome-rules.json created
□ No branding in any configuration file
```

**Output:** `genome-rules.json`

### Step 4.2 — Declare Dependencies

```
□ Platform module dependencies listed (Asset Registry, Genome, etc.)
□ Department dependencies listed (upstream handoff departments)
□ External service dependencies listed (if any)
□ Fallback behaviors defined per dependency
```

**Output:** `dependencies.json`

### Step 4.3 — Configure Routing

Define department connections per [12 — World Routing](./12_WORLD_ROUTING.md).

```
□ Entry/exit portals configured
□ Connections to related departments declared
□ Transit style selected
□ World Map position assigned
```

**Output:** Routing section in anatomy.json + spatial-layout.json

---

## Phase 5: Test (Validation)

### Step 5.1 — Runtime Dry Load

Load department through Department Runtime without live users.

```
□ Load sequence completes within 5s
□ All asset modules load (or fallback)
□ Genome injection succeeds
□ All objects placed correctly
□ All zones computed correctly
□ Camera positions reachable
□ Arrival sequence plays
```

### Step 5.2 — Genome Transform Test

Load department with 3+ different Company Genome profiles.

```
□ Luxury brand profile → visually distinct
□ Professional services profile → visually distinct
□ Operational/industrial profile → visually distinct
□ AI personalities differ per Genome
□ Terminology adapts per Genome
□ Audio character differs per Genome
□ Same topology across all transforms
```

### Step 5.3 — Interaction Test

Execute every declared verb.

```
□ All verbs execute with feedback (motion + audio)
□ Permission gating works (denied verbs disabled)
□ AI employees respond to verbs
□ Approval ceremony plays completely
□ Forms appear only as escape hatches
□ Keyboard equivalents work
□ Reduced motion respected
```

### Step 5.4 — Travel Test

```
□ Departure sequence plays
□ Transit to connected department works
□ Arrival at destination works
□ Return path preserves state
□ World Map shows department
□ Quick travel works
□ Orb dispatch works
```

### Step 5.5 — QA Checklist

Complete full [17 — QA Checklist](./17_QA_CHECKLIST.md).

```
□ All checklist items passed
□ Reviewer sign-off obtained
```

**Output:** QA approval record

---

## Phase 6: Package (Distribution)

### Step 6.1 — Assemble Package

Build Marketplace package per [13 — Marketplace Packaging](./13_MARKETPLACE_PACKAGING.md).

```
□ manifest.json created
□ All configuration files included
□ All asset modules included
□ Neutral preview renders generated
□ 3+ Genome transform previews generated
□ CHANGELOG.md written
□ LICENSE.json specified
```

**Output:** Complete `department-package/`

### Step 6.2 — Publish (Optional)

```
□ Package submitted to Marketplace review
□ Review gates passed
□ Published to catalog (or installed directly for internal use)
```

---

## Phase 7: Install (Deployment)

### Step 7.1 — Install into Headquarters

```
□ Install engine merges into organization architecture profile
□ Headquarters layout updated
□ AI employees added to concierge roster
□ Commands registered in Command Dock
□ World Map updated
□ Mission Control department card appears
```

### Step 7.2 — Verify Live

```
□ Founder can travel to department
□ Genome injection live and correct
□ Active project hydrates surfaces
□ AI employees respond
□ Output ports connect to destination departments
```

---

## Creation Checklist Summary

| Phase | Steps | Key Output |
|-------|-------|------------|
| **1. Define** | 1.1–1.3 | anatomy.json, spatial-layout.json |
| **2. Compose** | 2.1–2.3 | objects.json, interaction-maps.json, ai-employees.json |
| **3. Generate** | 3.1–3.3 | assets/ (14 categories) |
| **4. Configure** | 4.1–4.3 | genome-rules.json, dependencies.json |
| **5. Test** | 5.1–5.5 | QA approval |
| **6. Package** | 6.1–6.2 | department-package/ |
| **7. Install** | 7.1–7.2 | Live department in HQ |

---

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| Hardcoding brand colors | Use Genome hooks only (10) |
| Creating flattened scene | FAL generates modules, not scenes (14) |
| Form-first workflow | Map responsibilities to verbs (04) |
| Single AI owns department | Staff multiple specialists (05) |
| Skipping Genome transform test | Phase 5.2 is mandatory |
| Missing exit portal | Required in spatial layout (02) |
| No approval ceremony | Approval Station + motion profile (08) |
| Dashboard-style layout | Use spatial zones and objects (02, 03) |

---

## Templates and Starters

SDK provides starter templates to accelerate Phase 1:

| Template | Industry | Includes |
|----------|----------|----------|
| `marketing-department` | Universal | Full anatomy, stage layout, 8 objects, 4 AI |
| `creative-department` | Universal | Full anatomy, stage layout, 7 objects, 3 AI |
| `production-department` | Universal | Full anatomy, workshop layout, 6 objects, 3 AI |
| `operations-department` | Universal | Full anatomy, workshop layout, 5 objects, 2 AI |

Templates provide anatomy and layout — assets must still be generated via FAL.

---

_Next: [17 — QA Checklist](./17_QA_CHECKLIST.md)_
