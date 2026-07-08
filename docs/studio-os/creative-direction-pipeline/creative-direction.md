# Creative Direction™

**Step 02 — Creative authority before production**

---

## Purpose

Synthesize the Creative Brief™ into approved **creative authority** — the governing vision that gates all concept generation.

This is Stage 01 of the [Creative Production Pipeline](../production/creative-production-pipeline.md) — evolved for vision-first manufacturing.

---

## Activities

| Activity | Input | Output |
|----------|-------|--------|
| Genome analysis | Company · Project · Brand · Room DNA | Alignment constraints |
| Brief synthesis | Creative Brief™ raw inputs | Emotional target · spatial intent |
| Reference curation | Clusters from brief | Approved reference set |
| Art direction | Golden Department spec · Design Language™ | Anti-SaaS law · luxury tier |
| Conflict resolution | Competing references | Orb-facilitated founder choice |
| Creative lock | Founder confirmation | **Creative Direction Lock** |

---

## Creative Direction Package

```typescript
interface CreativeDirectionPackage {
  id: string;
  briefId: string;

  // Authority
  emotionalRegister: string[];      // inspired · curious · cinematic…
  artDirectionLaw: string[];        // no SaaS dashboards · no card grids
  spatialScale: 'intimate' | 'grand' | 'expansive' | 'monumental';
  photographyDirection: string;     // lens · depth · lighting mood
  materialPhilosophy: string;       // marble · glass · warm wood…
  colorPhilosophy: string;          // palette intent (not hex codes yet)

  // Constraints
  genomeAlignment: GenomeAlignmentReport;
  antiPatterns: string[];
  heroObjectIntent?: string;        // Mood Wall™ · Story Table™ · Orb™

  // Lock
  lockedAt?: string;
  lockedBy: 'founder';
  status: 'draft' | 'locked';
}
```

---

## Genome Alignment

Every Creative Direction™ must align with:

| Layer | Governs |
|-------|---------|
| **Company Genome™** | Who the company is · tone · values |
| **Project Genome™** | Project audience · constraints · notes |
| **Brand DNA™** | Visual identity · vocabulary |
| **Room DNA™** | 17 aesthetic sliders · department personality |

Concepts that violate locked Creative Direction™ are **invalid** — not presented to founder.

---

## Creative Direction Lock

Gate before concept generation:

> **"This is the creative brain we are building."**

Founder confirms · Creative Direction™ status → `locked`.

Changes after lock trigger **revision scope** — return to brief · not full pipeline restart.

---

## CDS Pilot Alignment

| Deliverable | Reference |
|-------------|-----------|
| Emotional register | Inspired · Curious · Creative · Powerful · Focused · Supported |
| Art direction law | `05_ART_DIRECTION.md` — no SaaS · no card grids |
| Room DNA sliders | `room-dna.json` (17 sliders) |
| Hero object | Mood Wall™ (`wall-mood-cds`) |

---

## Cross-References

- [creative-brief.md](./creative-brief.md)
- [complete-concepts.md](./complete-concepts.md)
- [creative-production-pipeline.md](../production/creative-production-pipeline.md) — Stage 01
