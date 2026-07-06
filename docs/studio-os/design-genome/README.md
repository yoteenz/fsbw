# Design Genome (Milestone 85)

Studio OS organizational visual memory — learn design thinking, not layouts.

## Purpose

The Design Genome is **not** a design system. Traditional design systems enforce consistency; the Design Genome **preserves identity**.

Each organization maintains an independent genome:

- Studio OS Genome
- Frontal Slayer Website Genome
- Frontal Slayer Admin Genome
- NDXBOOK Genome
- VXD Genome

Design intelligence never leaks between organizations unless explicitly shared.

## Admin entry

- **Route:** `/admin/studio/design-genome`
- **Nav group:** INTELLIGENCE
- **Core module:** `src/studio-os-core/design-genome/`

## Founder workflow

Approve naturally — no folders · no screenshots · no manual documentation.

| Founder says | Genome action |
|--------------|---------------|
| "This page is now Canon." | Promote entire page |
| "Keep this Hero." | Promote hero · auto-capture structure |
| "Use this graph style everywhere." | Promote graph pattern |
| "Don't reuse this." | Deprecate pattern |

## Pre-build review

Before designing any new interface:

> Does the Design Genome already contain an approved solution to this design problem?

- **Yes → inherit** or **evolve**
- **No → create new** for founder approval

## Promotion levels

Entire page · Hero · Section · Card · Panel · Timeline · Graph · Table · Navigation · Animation · Typography · Spacing pattern · Layout pattern · Interaction pattern

## Automatic capture (V1 demo)

When promoted, Studio OS records:

- Structure and component path (logical, not screenshot)
- Visual hierarchy · typography · spacing rhythm
- Interaction patterns · animation behavior
- Design analysis and founder reasoning
- Tags for intelligent search
- Version history and lineage

## Related systems

| Module | Relationship |
|--------|--------------|
| Design DNA & Canon (M84) | Customer-facing canon references |
| Company Genome (M57) | Organizational genetics |
| Experience Architect (M54) | Emotional design handoff |
| Admin Alignment Protocol | Commerce admin surgical changes |

## Code paths

- Store: `src/studio-os-core/design-genome/store.ts` (workspace-scoped)
- Analysis: `src/studio-os-core/design-genome/analysis.ts`
- UI: `src/components/admin/studio/design-genome/`
- Service: `src/services/studio/designGenomeModule/service.ts`
