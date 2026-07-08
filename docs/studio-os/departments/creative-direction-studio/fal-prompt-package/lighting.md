---
schema: studio.department-generator.v1/prompt-file
departmentId: creative-direction
file: lighting.md
version: 1.0.0
packageId: pkg-creative-direction-golden-v1
compiledAt: 2026-07-08T00:00:00Z
roomDnaRef: room-dna.json
providerHints: [fal, openai]
negativePromptUniversal: flat lighting, HDR blowout, neon, stock photo flash, ring light, clinical hospital lighting, overhead panel grid
---

# Lighting — Creative Direction Studio™

## Purpose

Three-point editorial warm rig — hero key above Mood Wall, work key above Timeline Table, ambient fill from ceiling coffer and window spill.

## Room DNA Modifiers

- warmth: 0.75 → warm key 3200K
- luxury: 0.92 → controlled contrast, soft falloff, no harsh shadows
- glass: 0.80 → window spill motivation, rim on glass surfaces

## Genome Slots

- {{genome.lightingStyle}}
- {{genome.materialLanguage}} (bounce character)

---

## Primary Prompt

Warm editorial three-point lighting in double-height luxury creative atelier. Soft key from camera-left at 3200K above hero mood wall, crisp work key above center glass timeline table, gentle fill preserving shadow detail, controlled rim on glass and brass accents. Ceiling luminous coffer provides ambient daylight simulation. No harsh overhead fluorescents. Subtle volumetric haze near ceiling coffer. Photorealistic architectural lighting, cinematic grade.

## Negative Prompt

flat lighting, HDR blowout, neon accents, stock photo flash, ring light beauty setup, clinical hospital lighting, overhead fluorescent panel grid, uncontrolled specular blowout

## Output

- assetId: lighting-rig-cds
- format: json (rig metadata) + optional reference plate
- path: lighting/rig.json

---

## Key Light — Hero (Mood Wall)

| Property | Value |
|----------|-------|
| Position | Above Mood Wall, 15° off-center |
| Temperature | 3200K (Genome-adjustable) |
| Character | Soft wash — imagery is the star |
| Intensity | 0.85 relative |

---

## Key Light — Work (Timeline Table)

| Property | Value |
|----------|-------|
| Position | Above Timeline Table center |
| Temperature | 3400K |
| Character | Crisp but warm — review clarity |
| Intensity | 0.75 relative |

---

## Fill Light

| Source | Character |
|--------|-----------|
| Ceiling sky coffer | Diffused daylight, room never dark |
| Window spill (right flank) | Soft directional, parallax-motivated |
| Floor bounce | Warm reflection from polished stone |

---

## Rim / Accent

| Feature | Light |
|---------|-------|
| Orb Pedestal | Uplight + {{genome.accentColor}} glow ring |
| Brief Wall | Pin spots on active brief sections |
| Observatory | Subtle internal glow — living data |
| Sandbox | Dimmable — brightens on branch activation |
| Approval ceremony | Ceiling grid accent pulse |

---

## Genome Lighting Presets

| Company Register | Character |
|------------------|-----------|
| Luxury beauty | Warm amber key, soft rose fill |
| Tech minimal | Cool neutral key, precise shadows |
| Editorial finance | Cool neutral key, controlled contrast |
| Law firm | Warm desk-lamp pools, mahogany warmth |
| Restaurant | Golden hour through windows |

**Rule:** No flat overhead fluorescent. Ever.
