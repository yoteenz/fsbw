# Asset Production Workflow — Studio OS v1

**Stage:** 02 (Planning) → 03 (Generation)  
**Pilot:** Creative Direction Studio™ — 35 assets · 12 compile stages  
**Engine:** [Studio Asset Compiler™](../engines/studio-asset-compiler/README.md)

---

## Purpose

Define the **production order**, **per-asset specifications**, and **provider handoff** for manufacturing every modular asset in an immersive department.

Generation is **ordered**. Dependencies are **respected**. Reuse is **default**.

---

## Pre-Generation — Smart Reuse Check

Before any provider call, Compiler consults [Studio Asset Registry™](../engines/studio-asset-registry/reuse-engine.md):

```
For each asset in asset-manifest.json:
  1. Query reuseCategory
  2. Score Registry candidates
  3. exact | adapt | inherit | remix | generate
  4. Record in build-report.md
```

**CDS reuse targets (expected ≥40% reuse):**

| Asset ID | Expected Mode | Registry Ref |
|----------|---------------|--------------|
| `orb-cds` | exact | `registry:orb-universal-v2` |
| `glass-panels-cds` | adapt | `registry:glass-panel-frosted-v2` |
| `panel-context-float-cds` | adapt | `registry:acrylic-menu-v1` |
| `lighting-rig-cds` | adapt | `registry:lighting-rig-editorial-v1` |
| `wall-mood-cds` | generate | — (hero · department-unique) |

---

## Generation Stage Order

Aligned with Compiler [generation-pipeline.md](../engines/studio-asset-compiler/generation-pipeline.md):

| Order | Stage ID | Package Folder | Gate |
|-------|----------|----------------|------|
| 1 | `environment` | `01_environment/` | None |
| 2 | `architecture` | `02_architecture/` | Stage 1 queued |
| 3 | `lighting` | `08_lighting/` | Stage 2 queued |
| 4 | `furniture` | `03_furniture/` | Stages 1, 3 |
| 5 | `large-objects` | `04_objects/` | Stages 2, 3, 4 |
| 6 | `interactive-objects` | `04_objects/` | Stage 5 |
| 7 | `glass` | `05_glass/` · `07_ui/` | Stages 4, 5 |
| 8 | `floating-ui` | `07_ui/` · `14_metadata/` | Stage 7 |
| 9 | `effects` | `09_vfx/` · `12_particles/` | Stages 3, 5 |
| 10 | `animation-refs` | `10_animation/` | Stages 5, 6 |
| 11 | `audio-refs` | `11_audio/` | Stage 6 |
| 12 | `final-validation` | `14_metadata/` | All 1–11 |

**Estimated CDS compile time:** ~151 minutes (provider execution, not Compiler overhead).

---

## Per-Asset Production Specification

Every asset specifies five production fields:

| Field | Description |
|-------|-------------|
| **generator** | Engine + provider route |
| **prompt source** | fal-prompt-package ref · Registry fragment · expanded stack |
| **dependencies** | Prior assets · genome slots · stage gate |
| **validation** | Per-asset review criteria (Stage 04) |
| **registry destination** | Registry ID on approval (Stage 05) |

---

## Environment

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `env-floor-cds` | Compiler → FAL (PBR) | `environment.md#floor` | `env-shell-cds` | Scale 18×12m · reflection · no flat plate | `registry:floor-luxury-editorial-v1` |
| `env-shell-cds` | Compiler → FAL (mesh) | `architecture.md` | — | Stage proportions · gallery height · no columns clutter | `registry:interior-shell-atelier-v1` |

---

## Architecture

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `env-ceiling-cds` | Compiler → FAL | `architecture.md#ceiling` | `env-shell-cds` | Coffered diffuse · track alignment | `registry:ceiling-stage-hero-v1` |
| `env-window-cds` | Compiler → FAL | `architecture.md#windows` | `env-shell-cds` | Glass wall right flank · parallax exterior | `registry:window-flank-editorial-v1` |
| `env-alcove-cds` | Compiler → FAL | `architecture.md#alcove` | `env-shell-cds` | Observatory niche · stone platform | `registry:alcove-observatory-v1` |
| `portal-entry-cds` | Compiler → FAL | `architecture.md#portals` | `env-shell-cds` | Arrival threshold · ceremony weight | `registry:portal-entry-editorial-v1` |
| `portal-exit-cds` | Compiler → FAL | `architecture.md#portals` | `env-shell-cds` | Discover Department exit affordance | `registry:portal-exit-discover-v1` |

---

## Furniture

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `table-timeline-cds` | Compiler → FAL | `furniture.md#timeline` | floor · lighting | Work surface scale · branch lanes | `registry:table-workstation-v1` |
| `table-sandbox-cds` | Compiler → FAL | `furniture.md#sandbox` | floor · lighting | Isolated branch surface | `registry:table-sandbox-v1` |
| `shelf-library-cds` | Compiler → FAL | `furniture.md#library` | floor · lighting | Reference spine · genome tint | `registry:shelf-library-v1` |

---

## Objects (Large + Interactive)

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `wall-mood-cds` | Compiler → FAL | `furniture.md#mood-wall` | shell · lighting · furniture | **Hero** · pin-ready · cluster zones | `registry:mood-wall-hero-v1` |
| `wall-brief-cds` | Compiler → FAL | `furniture.md#brief-wall` | shell · lighting | Brief readability · genome overlay | `registry:brief-wall-v1` |
| `observatory-cds` | Compiler → FAL | `objects.md#observatory` | alcove · lighting | Genome data visualization surface | `registry:observatory-genome-v1` |
| `screen-compare-cds` | Compiler → FAL | `objects.md#compare` | mood wall zone | Split comparison · approval affordance | `registry:screen-compare-v1` |
| `pedestal-orb-cds` | Compiler → FAL | `objects.md#pedestal` | floor · lighting | Orb mount · ceremony elevation | `registry:pedestal-orb-v1` |
| `orb-cds` | Registry reuse | `orb.md` | pedestal | Universal orb · greeting behavior | `registry:orb-universal-v2` |
| `zone-inspiration-drop-cds` | Compiler → FAL | `objects.md#inspiration` | floor zone | Drop affordance · paste · upload | `registry:zone-inspiration-drop-v1` |
| `pedestal-approval-cds` | Compiler → FAL | `objects.md#approval` | floor · ceremony | Approval ceremony focal point | `registry:pedestal-approval-v1` |

---

## Glass

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `glass-panels-cds` | Registry adapt | `objects.md#glass` | furniture · large objects | Frosted inspect · genome tint | `registry:glass-panel-frosted-v2` |
| `panel-context-float-cds` | Registry adapt | `acrylic.md` | glass stage | Floating context · readable type area | `registry:acrylic-menu-v1` |
| `panel-founder-notes-cds` | Compiler → FAL | `acrylic.md#notes` | floating-ui stage | Founder notes · chronicle bind | `registry:panel-founder-notes-v1` |

---

## Lighting

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `lighting-rig-cds` | Registry adapt | `lighting.md` | architecture | Three-point editorial · zone coverage | `registry:lighting-rig-editorial-v1` |

---

## VFX & Particles

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `particles-ambient-cds` | Compiler → FAL/metadata | `vfx.md` | lighting · large objects | Subtle dust · not distracting | `registry:vfx-dust-editorial-v1` |

---

## Holograms & NPCs (Intelligence Layer)

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `ai-creative-director-cds` | Generator (definition) | `ai-team.md` | orb · runtime | Routes creative decisions · never auto-approves | `registry:concierge-creative-director-v1` |
| `ai-research-concierge-cds` | Generator (definition) | `ai-team.md` | orb · runtime | Reference analysis · inspiration | `registry:concierge-research-v1` |
| `ai-brand-concierge-cds` | Generator (definition) | `ai-team.md` | orb · runtime | Genome compliance · brand guard | `registry:concierge-brand-v1` |

*Intelligence assets are behavioral definitions — meshes reuse concierge hologram patterns where applicable.*

---

## Interactive Panels

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `markers-walk-room-cds` | Compiler → metadata | `interaction.md` | all zones | Walk the Room path · critique anchors | `registry:markers-walk-room-v1` |
| `ceremony-approval-cds` | Generator (interaction) | `interaction-manifest.json` | approval pedestal | Ceremony choreography · founder gate | `registry:ceremony-approval-cds-v1` |

---

## Audio

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `audio-ambient-cds` | Compiler → audio provider | `audio.md#ambient` | interactive objects | Atelier atmosphere · loop seamless | `registry:audio-ambient-creative-v1` |
| `audio-ceremony-cds` | Compiler → audio provider | `audio.md#ceremony` | approval ceremony | Approval stinger · weight | `registry:audio-ceremony-approval-v1` |
| `audio-orb-cds` | Compiler → audio provider | `audio.md#orb` | orb | Greeting · command acknowledge | `registry:audio-orb-greeting-v1` |

---

## Animations

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `camera-paths-cds` | Compiler → metadata | `camera.md` | all zones | Arrival · inspect · walk path | `registry:camera-paths-cds-v1` |
| *(implicit)* | Compiler → metadata | `animation.md` | interactive objects | Panel reveal · orb idle · arrival | per-object in `10_animation/` |

---

## Content Seeds (Non-Generated)

| Asset ID | Generator | Prompt Source | Dependencies | Validation | Registry Destination |
|----------|-----------|---------------|--------------|------------|-------------------|
| `seed-mood-cds` | Content pipeline | content-seed | mood wall | Boot content present | `registry:seed-mood-cds-v1` |
| `seed-brief-cds` | Content pipeline | content-seed | brief wall | Boot content present | `registry:seed-brief-cds-v1` |
| `seed-library-cds` | Content pipeline | content-seed | library shelf | Boot content present | `registry:seed-library-cds-v1` |

---

## Provider Execution Handoff

```
DepartmentPackage.zip sealed (Compiler Stage 12)
         ↓
Provider queue (FAL primary · OpenAI · Runway future)
         ↓
Per-stage execution (parallel within stage allowed)
         ↓
Artifact delivery → artifact:// storage
         ↓
Stage 04 Asset Review (per artifact)
```

### Provider Profile (CDS)

| Asset Type | Primary Provider | Output Format |
|------------|------------------|---------------|
| Environment mesh | FAL | GLB |
| Furniture mesh | FAL | GLB |
| Glass / acrylic | FAL (GPT Image 2 / NBP per golden models) | GLB + texture |
| Materials / floor | FAL PBR | Shader + texture set |
| Audio | ElevenLabs / Suno (future) | MP3 / OGG |
| Particles | Metadata + Runtime | JSON manifest |
| Animation | Metadata + Runtime | JSON choreography |

---

## Package Output Structure

```
CreativeDirectionStudio_Package.zip
├── 01_environment/
├── 02_architecture/
├── 03_furniture/
├── 04_objects/
├── 05_glass/
├── 06_orb/
├── 07_ui/
├── 08_lighting/
├── 09_vfx/
├── 10_animation/
├── 11_audio/
├── 12_particles/
├── 13_prompts/          ← expanded stacks per asset
├── 14_metadata/         ← dependency graph · navigation
├── 15_runtime/          ← assembly manifest for Cursor
├── 16_preview/          ← marketing stills (optional)
├── package-manifest.json
└── build-report.md
```

---

## Production Checklist (Stage 03 Complete)

- [ ] All 35 assets assigned to compile stage
- [ ] Smart Reuse documented in `build-report.md`
- [ ] Build Health ≥ 80
- [ ] No flattened background in package
- [ ] Every `promptRef` expanded in `13_prompts/`
- [ ] `15_runtime/assembly-manifest.json` complete
- [ ] Hero object `wall-mood-cds` in stage ≤ 6
- [ ] Orb present and linked
- [ ] Dependency graph acyclic

---

_Asset Production Workflow — ordered manufacture with reuse first._
