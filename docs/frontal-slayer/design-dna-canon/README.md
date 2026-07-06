# Design DNA & Canon System (Milestone 84)

Permanent creative compass for Frontal Slayer Headquarters — not a design system that normalizes layouts.

## Purpose

Frontal Slayer is a **luxury digital headquarters**. Every customer page is a **room** inside the mansion. This module teaches future pages how to **inherit** the design language of existing pages without copying pixels or redesigning canon.

## Admin entry

- **Route:** `/admin/studio/design-dna-canon`
- **Nav group:** CREATE
- **Core module:** `src/studio-os-core/design-dna-canon/`

## Canon pages (protected references)

| Room | Route | Dominant emotion |
|------|-------|------------------|
| Concierge | `/account/concierge` | Personal hospitality |
| Build-A-Wig | `/build-a-wig/view` | Creative freedom |
| Hair Analysis | `/tools/hairstyle-analysis` | Expert guidance |
| Orders | `/account/orders` | Confidence |
| Rewards | `/account/rewards` | Celebration |
| Appointments | `/booking/consultation` | Personal care |
| Client Profiles | `/account/settings` | Care |
| Products | `/home/shop` | Desire through restraint |

**Rule:** Canon pages are architectural references — study them · never redesign for consistency.

## Design DNA vs Photography Creative DNA

| System | Scope |
|--------|-------|
| **Design DNA & Canon** (this module) | Customer-facing page rooms · emotional consistency · spatial storytelling |
| **Photography Creative DNA** | Product shot generation · display mannequin · Fal prompts |

## Headquarters Design Review

After every new page, evaluate ten criteria with a confidence score:

1. Luxury
2. Brand consistency
3. Visual hierarchy
4. Breathing room
5. Editorial composition
6. Interaction quality
7. Emotional alignment
8. Optical balance
9. Immersion
10. Design DNA alignment

**Final test:** *If this page were shown beside every existing Frontal Slayer page, would it feel like it has always lived here?*

## Related docs

- [BRAND_RULES.md](../BRAND_RULES.md) — visual identity and voice
- [photography-creative-dna/](../photography-creative-dna/) — product photography DNA
- `docs/studio-os/` — platform architecture

## Code paths

- Store: `src/studio-os-core/design-dna-canon/store.ts` (workspace-scoped)
- UI: `src/components/admin/studio/design-dna-canon/`
- Service stub: `src/services/studio/designDnaCanonModule/service.ts`
