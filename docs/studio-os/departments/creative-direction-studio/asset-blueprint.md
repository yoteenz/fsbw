# Asset Blueprint — Creative Direction Studio™

**Schema ID:** `studio.department-generator.v1.asset-blueprint`  
**Department ID:** `creative-direction`  
**Package ID:** `pkg-creative-direction-golden-v1`  
**Manifest:** [asset-manifest.json](./asset-manifest.json)

---

## Design Principle

Every object is an **independently generatable asset** with its own FAL prompt, material, animation behavior, interaction behavior, and reuse category. Nothing baked into the room shell.

---

## Environment Assets

### `env-shell-cds` — Room Envelope

| Field | Value |
|-------|-------|
| **Purpose** | Walls · floor plane · ceiling shell geometry |
| **Material** | Genome-injected plaster / walnut / concrete |
| **Dimensions** | 18 × 12 × 6.5 m envelope |
| **FAL Prompt** | `fal-prompt-package/architecture.md` |
| **Animation** | None — static shell |
| **Interaction** | Navigation collision only |
| **Reuse** | `environment-shell-stage` |
| **Dependencies** | None (stage 1) |
| **Genome slots** | materialLanguage, editorialDirection |

### `env-floor-cds` — Floor Surface

| Field | Value |
|-------|-------|
| **Purpose** | Polished stone/wood floor with reflection |
| **Material** | Polished stone (default) or wide-plank wood |
| **Format** | Shader + normal map |
| **FAL Prompt** | `fal-prompt-package/environment.md#floor` |
| **Animation** | Reflection shimmer on light movement |
| **Reuse** | `floor-luxury-editorial` |
| **Dependencies** | env-shell-cds |

### `env-ceiling-cds` — Ceiling Coffer

| Field | Value |
|-------|-------|
| **Purpose** | Diffused sky panel + accent track |
| **Dimensions** | Full envelope span |
| **FAL Prompt** | `fal-prompt-package/architecture.md#ceiling` |
| **Dependencies** | env-shell-cds |

### `env-window-cds` — Glass Wall + Exterior

| Field | Value |
|-------|-------|
| **Purpose** | Right flank glass + atmospheric exterior plate |
| **Dimensions** | 8 m span × 6.5 m height |
| **FAL Prompt** | `fal-prompt-package/architecture.md#windows` |
| **Animation** | Exterior breathe 120s cycle |
| **Genome slots** | visualReferences, lightingStyle |

### `env-alcove-cds` — Observatory Alcove

| Field | Value |
|-------|-------|
| **Purpose** | Left alcove geometry for Genome Observatory |
| **FAL Prompt** | `fal-prompt-package/architecture.md#alcove` |
| **Dependencies** | env-shell-cds |

---

## Zone Assets (Hero Objects)

### `wall-mood-cds` — Living Mood Wall™

| Field | Value |
|-------|-------|
| **Purpose** | Infinite inspiration surface — emotional heart |
| **Object class** | mood-wall |
| **Zone** | mood-wall |
| **Dimensions** | Full back wall · double height · 55% vertical FOV from entry |
| **Material** | Continuous surface — frosted glass depth planes |
| **FAL Prompt** | `fal-prompt-package/mood-wall.md` |
| **Animation** | Parallax 0.5px/s · color breathe 8s · pin stick-bounce 400ms |
| **Interaction** | pin · drag · cluster · compare · annotate · reject · approve · reference-drop · scrub |
| **Reuse** | `interactive-wall-hero` |
| **Genome slots** | photographyDirection, customerEmotions |

### `wall-brief-cds` — Creative Brief Wall™

| Field | Value |
|-------|-------|
| **Purpose** | Strategic anchor — mission · objective · audience |
| **Object class** | interactive-wall |
| **Zone** | brief-wall |
| **Dimensions** | 3.5 × 6 m full-height left wall |
| **Material** | Matte plaster + brass pin rails every 0.4 m |
| **FAL Prompt** | `fal-prompt-package/creative-brief-wall.md` |
| **Animation** | Pin sway 0.5px · sequential illuminate on arrival |
| **Interaction** | pin · annotate · drag · compare · speak · inspect |
| **Reuse** | `interactive-wall-brief` |
| **Genome slots** | editorialDirection, voice |

### `observatory-cds` — Company Genome Observatory™

| Field | Value |
|-------|-------|
| **Purpose** | Living Company Genome visualization |
| **Object class** | interactive-object |
| **Zone** | observatory |
| **Dimensions** | 1.2 m diameter hemispherical glass vessel on stone pedestal |
| **FAL Prompt** | `fal-prompt-package/genome-observatory.md` |
| **Animation** | Ring orbit 20s · domain pulse on Genome update |
| **Interaction** | inspect · compare · speak · pin · scrub |
| **Reuse** | `genome-observatory` |
| **Genome slots** | brandDNA, values, experienceDNA |

### `table-timeline-cds` — Project Timeline Table™

| Field | Value |
|-------|-------|
| **Purpose** | Temporal command surface — branches · approvals |
| **Object class** | timeline-table + glass-table |
| **Zone** | timeline-table |
| **Dimensions** | 2.4 × 1.0 m glass · 40 mm depth · 0.72 m height |
| **FAL Prompt** | `fal-prompt-package/timeline-table.md` |
| **Animation** | Branch ribbon rise 600ms · reflection shimmer 400ms |
| **Interaction** | scrub · drag · click · compare · branch · approve · reject · annotate · pin |
| **Reuse** | `timeline-surface` |
| **Genome slots** | editorialDirection |

### `table-sandbox-cds` — Creative Sandbox™

| Field | Value |
|-------|-------|
| **Purpose** | Isolated experimentation — no main Project impact |
| **Object class** | glass-table |
| **Zone** | sandbox |
| **Material** | Frosted when inactive — clears on entry |
| **FAL Prompt** | `fal-prompt-package/furniture.md#sandbox` |
| **Interaction** | branch · compare · preview · approve · reject · speak · annotate |
| **Rule** | Approve promotes to Timeline — until then isolated |

### `shelf-library-cds` — Reference Library™

| Field | Value |
|-------|-------|
| **Purpose** | Permanent visual memory archive |
| **Object class** | asset-shelf |
| **Zone** | reference-library |
| **Material** | Walnut or steel open shelving |
| **FAL Prompt** | `fal-prompt-package/furniture.md#library` |
| **Interaction** | browse · filter · drag · preview · search · pin · inspect |

### `screen-compare-cds` — Sandbox Comparison Screens

| Field | Value |
|-------|-------|
| **Purpose** | Twin glass panels for branch compare |
| **Zone** | sandbox |
| **FAL Prompt** | `fal-prompt-package/objects.md#compare-screens` |
| **Interaction** | compare · preview |

---

## Intelligence Assets

### `pedestal-orb-cds` — Orb Pedestal

| Field | Value |
|-------|-------|
| **Purpose** | Physical intelligence anchor |
| **Dimensions** | 0.9 m cylinder · command ring on top |
| **Material** | Stone or metal · Genome glow ring |
| **FAL Prompt** | `fal-prompt-package/orb.md#pedestal` |
| **Reuse** | `orb-universal` |

### `orb-cds` — Studio Orb

| Field | Value |
|-------|-------|
| **Purpose** | Voice · route · generate · navigate |
| **Dimensions** | 0.12 m sphere · floats 0.15 m above pedestal |
| **FAL Prompt** | `fal-prompt-package/orb.md` |
| **Animation** | Idle breathe 4s · listen ring · ceremony expand |
| **Interaction** | speak · touch · inspect |
| **States** | idle · listening · thinking · speaking · routing · ceremony |
| **Genome slots** | voice |

### AI Trigger Assets

| Asset ID | Role | Zones |
|----------|------|-------|
| `ai-creative-director-cds` | Creative Director | brief-wall, timeline-table |
| `ai-research-concierge-cds` | Research Concierge | mood-wall, reference-library |
| `ai-brand-concierge-cds` | Brand Concierge | observatory, brief-wall |

---

## Atmosphere Assets

| Asset ID | Purpose | Prompt Ref |
|----------|---------|------------|
| `lighting-rig-cds` | Three-point editorial rig | `lighting.md` |
| `particles-ambient-cds` | Hero dust motes | `vfx.md` |
| `audio-ambient-cds` | Room tone stem | Runtime audio manifest |
| `audio-ceremony-cds` | Approval stamp | Runtime audio manifest |
| `audio-orb-cds` | Orb pulse + voice bed | Runtime audio manifest |

---

## Navigation Assets

| Asset ID | Purpose |
|----------|---------|
| `camera-paths-cds` | arrival · hero · primary · orb · ceremony · departure |
| `portal-entry-cds` | Entry Portal |
| `portal-exit-cds` | Exit Portal |

---

## Dependency Graph

```
env-shell-cds
├── env-floor-cds
├── env-ceiling-cds
├── env-window-cds
├── env-alcove-cds
├── wall-mood-cds
├── wall-brief-cds
├── table-timeline-cds
├── table-sandbox-cds
├── shelf-library-cds
├── observatory-cds
├── pedestal-orb-cds
│   └── orb-cds
├── screen-compare-cds
├── lighting-rig-cds
├── particles-ambient-cds
├── portal-entry-cds
├── portal-exit-cds
├── camera-paths-cds
├── glass-panels-cds
└── ai-* + audio-* + ceremony-approval-cds
```

---

## Regeneration Rules

| Trigger | Assets |
|---------|--------|
| Genome material change | env-*, furniture, floor |
| Genome lighting change | lighting-rig, particles, window |
| Mood Wall refresh | wall-mood-cds only |
| Industry switch | Full package ordered stages |

**Full inventory:** [asset-manifest.json](./asset-manifest.json)
