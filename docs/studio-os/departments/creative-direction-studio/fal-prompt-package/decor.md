---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: decor.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: clutter, knick-knacks, generic office plants, motivational posters
---

# Decor — Creative Direction Studio™

## Purpose

Accent hardware, environmental storytelling props, pin rails detail. Stage 7 — lower priority. Minimalism slider 0.68 enforces restraint.

## Room DNA

- minimalism: 0.68 → fewer decor objects, larger void volumes
- luxury: 0.92 → quality over quantity

---

## Decor Inventory (v1)

| Element | Zone | Purpose |
|---------|------|---------|
| Brass pin rails | brief-wall | Physical pin affordance — part of wall-brief-cds |
| Accent track spots | ceiling | Brief wall pin illumination |
| Data stream channels | observatory alcove | Subtle wall channels to Brief + Mood walls |
| Archive shelf below mood wall | mood-wall | Rejected references fade here |
| Pedestal glow ring | orb-command | Part of pedestal-orb-cds |

---

## Primary Prompt (Accent Hardware)

Brass pin rail hardware detail, luxury editorial atelier accent, brushed brass finish, subtle shadow under raking light, photorealistic macro product shot, {{genome.materialLanguage}} metal treatment.

## Negative Prompt

clutter, knick-knacks, motivational posters, generic fake plants, office desk accessories, sticky note stacks

---

## Environmental Storytelling

Design spec only — no literal objects required:

- "Gallery air" — clean, faint material warmth
- Rejected references visually archive to lower shelf
- New library references animate onto shelf with spine label
- Observatory data streams connect domains to active work zones

---

## Auto-Distribute (Future)

Per assembly blueprint: decor category may use perimeter-scatter at density 0.3, excluding arrival and orb-command zones. v1 package relies on integrated zone asset decor — no standalone scatter props.

---

## Regeneration Scope

materials-only regen may update brass/chrome finish via Room DNA chrome slider without topology change.
