# Brand Discovery Engine™ — Platform Runtime

**Architecture:** `genesis/articles/BRAND_DISCOVERY_ENGINE.md`  
**Runtime:** `src/studio-os-core/genesis/brand-discovery-engine/`  
**UI:** `/admin/studio/brand-discovery-engine`  
**Hooks:** `useBrandDiscoveryEngineState` · `useBrandIntelligence`  
**Genesis key:** `brandDiscoveryEngineDna`

Depends on **Experience Engine™** (`experienceEngineDna`) for compiled Experience Brand DNA. Strategic Brand DNA compiles downward — Experience Engine / Runtime are not redesigned.

---

## Routes

| Path | Experience |
|------|------------|
| `/admin/studio/brand-discovery-engine` | Brand Discovery Arrival · brand switcher |
| `/admin/studio/brand-discovery-engine/brand-discovery` | Orb-led Brand Discovery Flow |
| `/admin/studio/brand-discovery-engine/brand-dna` | Brand DNA Registry™ |
| `/admin/studio/brand-discovery-engine/brand-intelligence` | Brand Intelligence Layer™ |
| `/admin/studio/brand-discovery-engine/brand-consistency` | Brand Consistency Checker™ |
| `/admin/studio/brand-discovery-engine/brand-elevation` | Brand Elevation Engine™ |
| `/admin/studio/brand-discovery-engine/audience-discovery` | Audience Discovery Engine™ |
| `/admin/studio/brand-discovery-engine/packaging-intelligence` | Packaging Strategy Engine™ |
| `/admin/studio/brand-discovery-engine/content-intelligence` | Content Direction Engine™ |
| `/admin/studio/brand-discovery-engine/brand-applications` | Brand Application Engine™ |
| `/admin/studio/brand-discovery-engine/brand-playground` | Brand DNA Playground |

---

## Engines

| Engine | Purpose |
|--------|---------|
| **Brand Discovery Engine™** | Orb-led intake → synthesis → draft Brand DNA |
| **Brand DNA Registry™** | Canonical strategic Brand DNA store |
| **Brand Intelligence Layer™** | Reusable reasoning API for all creative systems |
| **Brand Consistency Checker™** | Alignment scores + improvement notes |
| **Brand Elevation Engine™** | Brand DNA health audit |
| **Audience Discovery Engine™** | Audience profile and direction |
| **Packaging Strategy Engine™** | Packaging direction from Brand DNA |
| **Content Direction Engine™** | Content, website, HQ direction |
| **Brand Application Engine™** | Downstream consumer bindings |
| **Brand DNA Playground** | Same asset type across Frontal Slayer / Studio OS / NDX |

---

## Public API

```typescript
import {
  getBrandDiscoveryEngineReadyView,
  evaluateBrandIntelligence,
  scoreBrandConsistency,
  compileExperienceBrandDnaId,
} from '@/studio-os-core/genesis';
import { useBrandDiscoveryEngineState } from '@/hooks/useBrandDiscoveryEngineState';
```

---

## Brand DNA record

Each profile stores: `brandId`, `companyId`, `brandName`, mission, vision, values, audienceProfile, emotionalTerritory, visualPersonality, writingVoice, colorSystem, typography, materials, photographyStyle, packagingStyle, contentStyle, luxuryLevel, positioning, competitors, antiPatterns, brandRules, timestamps, version, status.

---

## Consistency dimensions

Brand Alignment · Voice · Visual · Audience Fit · Luxury Fit · Positioning Fit · Differentiation · Improvement Notes. Default pass threshold: **80/100**.
