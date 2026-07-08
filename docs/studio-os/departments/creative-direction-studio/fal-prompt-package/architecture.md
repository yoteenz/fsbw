---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: architecture.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: dashboard, card grid, white void, cubicle office, flat background
---

# Architecture — Creative Direction Studio™

## Purpose

Shell geometry, walls, ceiling, windows, columns, alcove, navigation portals. Stage 1–3 environment tasks.

## Room DNA Modifier

{{roomDna.promptModifiers.architecture}}

## Genome Slots

- {{genome.materialLanguage}}
- {{genome.editorialDirection}}

---

## Shell — env-shell-cds

### Prompt

Double-height editorial creative atelier architecture shell, Stage layout 3:2 width-depth ratio, 18m × 12m footprint, hero zone 6.5m ceiling, work zones 3.2m, minimal structural expression, luxury architecture studio envelope, generous horizontal sweep, {{genome.materialLanguage}} wall treatments, photorealistic architectural visualization.

### Negative

office building, cubicle floor plan, flat single-height box, white void

### Output

- format: glb
- path: environment/shell.glb

---

## Walls

### Prompt

Interior wall planes — left brief wall zone, hero mood wall backing, right glass flank connection, gallery plaster or dark walnut panel per {{genome.materialLanguage}}, subtle alcove cut for observatory left side, etched section demarcation on brief wall zone only.

---

## Ceiling

### Prompt

Double-volume coffer above hero mood wall zone, diffused luminous sky panel primary, recessed accent track for pin spots and ceremony lighting, optional slow-moving light blade kinetic element per Experience DNA, editorial gallery ceiling, no exposed ductwork, no fluorescent panels.

### Output

- assetId: env-ceiling-cds

---

## Windows

### Prompt

Floor-to-ceiling glass wall right flank, 8m span, slim steel or brass frames, clear glass with subtle interior reflection, exterior atmospheric plate connection, {{genome.visualReferences}} horizon character, parallax-ready separation from interior.

### Exterior by Genome

| Context | View |
|---------|------|
| Urban luxury | Soft-focus city skyline dusk |
| Editorial | Abstract horizon |
| Beauty | Garden terrace greenery |
| Finance | Minimal sky, cloud movement |
| Law | Library courtyard abstract |

### Output

- assetId: env-window-cds

---

## Columns

### Prompt

Two slender structural supports at 35% room depth, stone or steel per {{genome.materialLanguage}}, minimal visual weight, do not obstruct hero sightlines, editorial restraint.

Optional — omit if shell geometry self-supporting in compiled mesh.

---

## Alcove — env-alcove-cds

### Prompt

Left alcove niche for Company Genome Observatory, 3m × 2.5m × 4m, stone pedestal platform center, subtle data stream wall channels connecting to brief and mood walls, recessed lighting pocket, luxury editorial alcove architecture.

---

## Navigation

### Entry Portal — portal-entry-cds

Threshold frame center-left, Z=-0.9, editorial metal frame, arrival ceremony trigger zone, 2m × 2.8m opening.

### Exit Portal — portal-exit-cds

Threshold frame center-right, departure to Story/Production departments, matching entry register.

### Walk Graph

```
entry (arrival-threshold)
  → ceremony → mood-wall (hero)
  → timeline-table (primary work)
  → sandbox / library / observatory (exploration)
  → orb-command (intelligence routing)
exit (departure-threshold)
```

---

## Composition Rules

- Hero zone: double height above mood wall
- Work zone: uniform 3.2m around timeline + sandbox
- Glass flank: right side full depth
- Entry sightline: mood wall 55% vertical FOV
