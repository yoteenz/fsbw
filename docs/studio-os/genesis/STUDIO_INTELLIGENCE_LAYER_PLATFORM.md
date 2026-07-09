# Studio Intelligence Layer™ — Platform Runtime

**Architecture:** `genesis/articles/STUDIO_INTELLIGENCE_LAYER.md`  
**Runtime:** `src/studio-os-core/genesis/studio-intelligence-layer/`  
**UI:** `/admin/studio/studio-intelligence-layer`  
**Hooks:** `useStudioIntelligenceLayerState` · `useExecutiveIntelligence`  
**Genesis key:** `studioIntelligenceLayerDna`

Depends on **Brand Discovery Engine™** (`brandDiscoveryEngineDna`) and **Experience Runtime™** (`experienceRuntimeDna`).

---

## Routes

| Path | Experience |
|------|------------|
| `/admin/studio/studio-intelligence-layer` | Intelligence Arrival |
| `/admin/studio/studio-intelligence-layer/intelligence` | Executive Intelligence Overview |
| `/admin/studio/studio-intelligence-layer/company-operating-manual` | Company Operating Manual™ |
| `/admin/studio/studio-intelligence-layer/decision-dna` | Decision DNA™ |
| `/admin/studio/studio-intelligence-layer/taste-genome` | Taste Genome™ |
| `/admin/studio/studio-intelligence-layer/canon-engine` | Canon Engine™ |
| `/admin/studio/studio-intelligence-layer/experience-compiler` | Experience Compiler™ |
| `/admin/studio/studio-intelligence-layer/audience-dna` | Audience DNA™ |
| `/admin/studio/studio-intelligence-layer/product-dna` | Product DNA™ |
| `/admin/studio/studio-intelligence-layer/creative-genome` | Creative Genome™ |
| `/admin/studio/studio-intelligence-layer/decision-dna-playground` | Decision DNA Playground™ |
| `/admin/studio/studio-intelligence-layer/audience-dna-playground` | Audience DNA Playground™ |
| `/admin/studio/studio-intelligence-layer/brand-dna-playground` | Brand DNA Playground™ (links to Brand Discovery) |
| `/admin/studio/studio-intelligence-layer/experience-playground` | Experience Playground™ |
| `/admin/studio/studio-intelligence-layer/creative-genome-explorer` | Creative Genome Explorer™ |
| `/admin/studio/studio-intelligence-layer/canon-review-workspace` | Canon Review Workspace™ |

---

## Engines

| Engine | Purpose |
|--------|---------|
| **Operating Manual Engine™** | Doctrine consultation for AI workers |
| **Decision Intelligence Engine™** | Founder decision model for Orb recommendations |
| **Taste Learning Engine™** | Creative fingerprint learning |
| **Canon Engine™** | Founder-approved canonization |
| **Experience Compiler™** | Intelligence-aware experience assembly |
| **Audience Intelligence Engine™** | Audience DNA reasoning |
| **Product Intelligence Engine™** | Product DNA reasoning |
| **Creative Knowledge Graph™** | Searchable creative graph |
| **Executive Intelligence Engine™** | Unified recommendation API |

---

## Registries

Company Registry™ · Operating Manual Registry™ · Decision Registry™ · Audience Registry™ · Product Registry™ · Creative Registry™ · Canon Registry™ · Experience Registry™

---

## Public API

```typescript
import {
  getStudioIntelligenceLayerReadyView,
  evaluateExecutiveIntelligence,
  compileExperienceEnvironment,
  buildManualConsultationChecklist,
} from '@/studio-os-core/genesis';
import { useStudioIntelligenceLayerState } from '@/hooks/useStudioIntelligenceLayerState';
```

---

## Consumer systems

Orb™, Mission Engine™, Content Engine™, Experience Runtime™, Studio Foundry™, Brand Discovery™, Company Genome™, Institute of Knowledge™ consume Studio Intelligence Layer™ instead of implementing isolated reasoning.
