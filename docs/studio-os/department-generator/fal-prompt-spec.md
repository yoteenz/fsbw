# FAL Prompt Spec — Environment Prompt Package

**Schema ID:** `studio.department-generator.v1.prompt-package`  
**Output folder:** `prompts/`  
**Status:** Environment Prompt Package specification — organized `.md` files, not HTML

---

## Purpose

Instead of producing HTML or UI mockups, the Department Generator outputs an **Environment Prompt Package** — organized markdown files optimized for high-end image and mesh generation via FAL and other providers.

Each file is a **compiled prompt document** with structured sections machines and humans can parse.

---

## Design Law

> Prompt packages are the deliverable. Founders never type FAL prompts. The Generator compiles them from DNA · Room DNA · Genome · environment tasks · asset blueprints.

---

## Prompt Package Structure

```
prompts/
├── environment.md      # Floor · atmosphere · overall room character
├── lighting.md         # Key · fill · rim · practicals · color temperature
├── materials.md        # Surface language · glass · wood · stone · chrome
├── furniture.md        # Tables · chairs · desks · pedestals · per-object sections
├── decor.md            # Plants · lamps · accent hardware · rails
├── architecture.md     # Shell · walls · ceiling · windows · columns · navigation
├── camera.md           # Positions · focal length · composition notes
├── vfx.md              # Particles · haze · depth · ambient motion
└── animation.md        # Motion personality · ceremony cues · idle behavior
```

---

## File Format Specification

Every prompt file follows this structure:

```markdown
---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: lighting.md
version: 1.0.0
compiledAt: 2026-07-08T00:00:00Z
genomeSnapshot: genome-snapshot-v1
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: dashboard, card grid, sidebar, white void, stock photo banner, UI chrome
---

# Lighting — Creative Direction Studio™

## Purpose
Three-point editorial warm rig for double-height atelier stage layout.

## Room DNA Modifiers
- warmth: 0.75 → warm key 3200K
- luxury: 0.92 → controlled contrast, soft falloff
- glass: 0.80 → window spill motivation

## Genome Slots
- {{genome.lightingStyle}}
- {{genome.materialLanguage}} (bounce character)

## Primary Prompt

Warm editorial three-point lighting in a double-height luxury creative atelier.
Soft key from camera-left at 3200K, gentle fill preserving shadow detail,
controlled rim on glass and brass accents. No harsh overhead fluorescents.
Atmospheric depth with subtle volumetric haze near ceiling coffer.
Photorealistic architectural visualization, 8K detail, cinematic grade.

## Negative Prompt

flat lighting, HDR blowout, neon, stock photo flash, ring light, SaaS office,
overhead panel grid, clinical hospital lighting

## Generation Parameters

| Parameter | Value |
|-----------|-------|
| aspect_ratio | 16:9 |
| resolution | 2048×1152 |
| style | architectural-interior-editorial |
| output_type | lighting-plate + rig-metadata |

## Sections

### Key Light
...

### Fill Light
...

### Rim / Accent
...

## Asset Compiler Routing

| Task ID | Output |
|---------|--------|
| env-lighting | lighting/rig.json |
```

---

## Per-File Responsibilities

### `environment.md`

| Section | Content |
|---------|---------|
| Floor | Material · grain · reflection · wear |
| Atmosphere | Overall room mood · air quality · time of day |
| Composition | Negative space · hero sightlines · depth layers |
| Scale | Human-scale reference · ceiling height feel |

**Feeds:** `env-floor` · `env-atmosphere` · `env-composition`

---

### `lighting.md`

| Section | Content |
|---------|---------|
| Key | Position · temperature · softness |
| Fill | Ratio · bounce surfaces |
| Rim | Edge separation · glass highlights |
| Practicals | Visible fixtures · track lights |
| Ambient | Base exposure · window spill |

**Feeds:** `env-lighting` → `lighting/rig.json`

---

### `materials.md`

| Section | Content |
|---------|---------|
| Primary | Dominant surface language |
| Glass | Frosted · clear · mullion detail |
| Wood | Species · grain · finish |
| Stone | Marble · concrete · vein direction |
| Chrome | Polish level · accent placement |
| Fabric | Upholstery · drapery |

**Feeds:** All object prompts · genome shader injection

Room DNA sliders `glass` · `wood` · `stone` · `chrome` compile here.

---

### `furniture.md`

| Section | Content |
|---------|---------|
| Layout | Zone placement rules (not coordinates) |
| Per-object | `## {assetId}` sections with full FAL prompt |

Example per-object section:

```markdown
## wall-mood-cds — Mood Wall

**Purpose:** Hero comparison surface
**Reuse:** interactive-wall-hero

### Prompt
Editorial mood wall, 5.5m wide floor-to-ceiling frosted glass panel,
slim brushed brass frame, luxury creative atelier, pin-ready surface
with subtle rail detail, soft internal glow, photorealistic 3D asset
on transparent background, studio product lighting.

### Negative
whiteboard, cork, kanban, sticky notes, flat UI mockup

### Output
- format: glb
- dimensions: 5.5 × 4.2 × 0.15 m
```

**Feeds:** `assets/*.blueprint.json` · Object Compiler tasks

---

### `decor.md`

Plants · floor lamps · ceiling lights · accent rails · hardware · environmental storytelling props.

Lower priority in generation pipeline (stage 7).

---

### `architecture.md`

| Section | Content |
|---------|---------|
| Shell | Envelope · proportions · double-height zones |
| Walls | Planes · alcoves · treatments |
| Ceiling | Coffers · tracks · skylight |
| Windows | Glass walls · frames · exterior connection |
| Columns | Structural · glass mullions |
| Navigation | Entry threshold · portal positions · walk paths |

**Feeds:** `environment-blueprint.json` architecture tasks

---

### `camera.md`

| Position | Focal Length | Purpose |
|----------|--------------|---------|
| `arrival-threshold` | 35mm | Entry ceremony dolly end |
| `hero-mood-wall` | 50mm | Mood wall hero framing |
| `timeline-inspect` | 85mm | Table detail orbit |
| `orb-command` | 40mm | Orb pedestal medium shot |

Includes composition notes for image-generation reference plates.

---

### `vfx.md`

Particle density · fog volume · depth haze · ambient dust · light shafts.

**Feeds:** `env-atmosphere` · `particles/ambient.json`

---

### `animation.md`

| Section | Content |
|---------|---------|
| Ambient | Idle loops · subtle motion |
| Interaction | Hover glow · pin settle · approve ceremony |
| Arrival | Camera dolly · audio fade · orb pulse |
| Ceremony | creative-approval sequence timing |

**Feeds:** Animation Compiler · `assembly-blueprint.json#animationAssembly`

---

## Prompt Compilation Pipeline

```
Department DNA™
         +
Room DNA™ sliders
         +
Company Genome™ slots
         +
Industry modifiers
         ↓
Environment Compiler (per task)
         +
Object Compiler (per asset)
         ↓
Prompt Package Writer
         ↓
prompts/*.md (this spec)
         ↓
GenerationInstructionSet (machine extract)
         ↓
Studio Asset Compiler™ → FAL / providers
```

---

## Provider Routing Hints

| Asset Type | Preferred Providers | Notes |
|------------|---------------------|-------|
| Architectural plates | FAL · GPT Image | Reference for mesh gen |
| Modular GLB objects | FAL 3D · mesh providers | Transparent BG product shots |
| Floor shaders | Procedural + genome | Not image-generated |
| Lighting rig | JSON metadata | Compiled not generated |
| Audio stems | Audio providers | Separate from visual package |

Generator is **provider-agnostic**. `providerHints` in frontmatter are suggestions for Asset Compiler.

---

## Quality Rules

1. **No UI chrome in prompts** — rooms, not dashboards
2. **Negative prompts required** — every file includes anti-SaaS negatives
3. **Genome slots as tokens** — `{{genome.*}}` never hardcoded brand values
4. **Room DNA reflected** — warmth · luxury · glass visible in language
5. **Per-object sections in furniture.md** — never one blob prompt for all furniture
6. **Machine-parseable frontmatter** — YAML block required

---

## Relationship to Other Artifacts

| Artifact | Relationship |
|----------|--------------|
| `environment-blueprint.json` | `promptRef` points to file + section |
| `assets/*.blueprint.json` | `falPromptRef` points to `furniture.md#{assetId}` |
| `room-dna.json` | `promptModifiers` injected at compile |
| `handoff/generation-instruction-set.json` | Extracted `promptStack` per task |

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| HTML export of prompts | `.md` files only |
| Single `prompt.txt` for entire room | Nine categorized files |
| Founder-editable prompt fields | Compiled output only |
| Embedded images in prompt files | Text prompts; images are compiler output |
