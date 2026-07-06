# Official Brand Positioning V2.0 (Milestone 92)

Permanent Studio OS brand philosophy and voice architecture.

## Official tagline

**PRESERVE EXPERTISE. BUILD LEGACY.**

Treat this tagline with the same importance as the Studio OS logo. Do not replace unless explicitly instructed by the founder.

## Brand philosophy

- Studio OS is **not** software and **not** another AI platform.
- Studio OS exists to **preserve professional expertise** before it is lost and transform it into **lasting organizational legacy**.
- Before any new feature: Does it preserve expertise? Does it help build legacy?

## Brand voice architecture

The master tagline is permanent. Each major system has a **contextual expression** that complements — never replaces — the tagline.

| System | Contextual voice |
|--------|------------------|
| Studio OS | Preserve Expertise. Build Legacy. |
| Business Discovery Blueprint™ | Today, we begin preserving your expertise. |
| Profession Brain™ | Your expertise is becoming legacy. |
| Studio Institute™ | Learn from expertise. Carry the legacy forward. |
| Expert Marketplace™ | Share expertise. Expand your legacy. |
| Expansion Center | Grow your organization. Expand your legacy. |
| Command Dock | Building today's decisions into tomorrow's legacy. |
| Organization Inauguration | Your Headquarters is ready. Your legacy begins now. |

## Code

```
src/studio-os-core/brand-positioning/
  constants.ts   — STUDIO_OS_OFFICIAL_TAGLINE, STUDIO_OS_BRAND_VOICE
  index.ts

src/components/admin/studio/brand/
  StudioOsBrandTagline.tsx   — reusable shell tagline + contextual line
```

## UI integration

`StudioOsBrandTagline` is mounted on major Studio OS module pages (Blueprint, Inauguration, Profession Brain, Expansion Center, Expert Marketplace). Demo subtitles reference `STUDIO_OS_OFFICIAL_TAGLINE` where appropriate.
