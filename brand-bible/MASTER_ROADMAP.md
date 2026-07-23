# Frontal Slayer Brand Bible — Master Roadmap

**Document:** MASTER_ROADMAP  
**Version:** 1.0  
**Status:** Canonical — documentation architecture & implementation plan  
**Owner:** Executive Creative + Brand Operations  
**Classification:** Internal — governs all Brand Bible work  
**Last audit:** 2026-07-22

---

## Executive summary

The Frontal Slayer **Brand Bible** is the **permanent production handbook** for a luxury beauty company that is also an entertainment property, a digital product, and a future physical retail operator. It is not marketing, not a prompt library, and not a replacement for operational runbooks in `docs/frontal-slayer/`.

This roadmap defines:

1. What **already exists** and its canonical home  
2. **Gaps, overlaps, and merge/split** recommendations  
3. The **full target document set** (with purpose, dependencies, phase, priority)  
4. **Folder hierarchy** scalable to thousands of files  
5. **Governance** (versioning, ownership, review, deprecation)

**Design principle:** The smartest bible is **small at the core, deep at the edges** — philosophy and locks at the center; channel specs and pipelines **link outward** rather than duplicate.

---

## Part 1 — Audit of existing documentation

### 1.1 Brand Bible (`/brand-bible/`) — canonical creative constitution

| Document | Version | Role | Strength | Gap / risk |
| --- | --- | --- | --- | --- |
| [`storytelling/storytelling-philosophy.md`](storytelling/storytelling-philosophy.md) | 1.0 | Narrative rules, protagonist/guide, mansion, continuity | Strong philosophy layer | No timeline, series bibles, or campaign registry yet |
| [`visual-language/visual-language.md`](visual-language/visual-language.md) | 1.0 | Brand-wide look/feel, materials, light, motion | Strong umbrella | Reserved sections empty; overlaps with future UI/color specs |
| [`psa/design-principles.md`](psa/design-principles.md) | 1.0 | PSA **visual** philosophy | Clear hierarchy under PSA | Must not absorb PSA voice/performance |
| [`psa/identity.md`](psa/identity.md) | 1.0 | PSA **identity lock** (likeness, anatomy, expressions) | Production-ready lock | Golden prompts remain in `motherboard/golden-prompts/` — needs explicit boundary |

**Missing at brand-bible root:** Index, governance charter, glossary, decision trees, explicit **bridge** to `docs/frontal-slayer/` operational bibles.

| [`frontal-slayer-north-star-manifesto.md`](frontal-slayer-north-star-manifesto.md) | 1.0 | **Highest creative constitution** — tie-break principles | Timeless one-page North Star | Subordinate docs must not contradict |

### 1.2 Related internal docs (not yet in Brand Bible — **do not duplicate**)

| Location | Contents | Relationship to Brand Bible |
| --- | --- | --- |
| [`docs/frontal-slayer/BRAND_RULES.md`](../docs/frontal-slayer/BRAND_RULES.md) | Implemented visual + voice shortcuts | **Bridge candidate** → merge into `foundation/brand-rules.md` or keep as **implementation snapshot** with pointer from bible |
| [`docs/frontal-slayer/COMPANY_GENOME.md`](../docs/frontal-slayer/COMPANY_GENOME.md) | Business architecture | **Out of scope** for creative bible except cross-link in strategy |
| [`docs/frontal-slayer/OWNERS_MANUAL.md`](../docs/frontal-slayer/OWNERS_MANUAL.md) | Workspace ops | Operational, not brand constitution |
| [`docs/frontal-slayer/product-photography-bible/`](../docs/frontal-slayer/product-photography-bible/README.md) | Product photo standards (12 chapters) | **Canonical home for product photography execution** — Brand Bible references via registry |
| [`docs/frontal-slayer/photography-creative-dna/`](../docs/frontal-slayer/photography-creative-dna/) | Generation packages (Fal) | **Technical pipeline** — link from `ai-systems/` governance, not rewrite philosophy |
| [`docs/frontal-slayer/asset-factory/`](../docs/frontal-slayer/asset-factory/) | Asset factory workflow | Production ops — registry link |
| [`docs/frontal-slayer/design-dna-canon/`](../docs/frontal-slayer/design-dna-canon/) | Customer page rooms | Spatial/product UX canon — link from `environments/digital-spaces.md` |
| [`docs/frontal-slayer/tutorial-os/`](../docs/frontal-slayer/tutorial-os/) | Mansion Tour | Link from storytelling + environments |
| [`motherboard/golden-prompts/psa-*`](../motherboard/golden-prompts/) | Model prompts | **Explicitly excluded** from Brand Bible body — governed by `ai-systems/generation-governance.md` |
| [`motherboard/CORE.md`](../motherboard/CORE.md) | Engineering + design implementation | **Implementation truth** for app — UI bible must align, not repeat stack docs |

### 1.3 Gap analysis (critical)

| Category | Status | Recommendation |
| --- | --- | --- |
| **Brand foundation** (mission, vision, values, pillars) | Partial in COMPANY_GENOME | Create **`foundation/brand-charter.md`** (creative-facing subset); link to Genome for business |
| **Voice & tone (brand-wide)** | Partial in BRAND_RULES + PSA voice | Create **`voice-tone/voice-and-tone.md`**; PSA voice as child doc |
| **UI / product language** | Scattered in CORE.md | Create **`digital-product/ui-language.md`** + **`interaction-principles.md`** |
| **Typography / color (measured)** | Values in CORE + Visual Language philosophy | Create **`visual-system/color-standards.md`**, **`typography-standards.md`** when ready — **do not** duplicate hex in philosophy files |
| **Film / TV / Lounge** | Story + visual philosophy only | Create **`content-systems/tv-lounge-production-standards.md`**, **`film-standards.md`** |
| **Campaign framework** | Philosophy only | Create **`storytelling/campaign-framework.md`** (structure, not scripts) |
| **QA / approval** | Missing | Create **`operations/creative-approval-workflow.md`**, **`quality-assurance/visual-qa-checklist.md`** |
| **AI governance** | Prompts in motherboard | Create **`ai-systems/generation-governance.md`** (rules, not prompts) |
| **Retail / events** | Missing | Phase 8+ placeholders |
| **Sound / music** | Missing | Phase 7 **`audio/sound-design-direction.md`** |
| **Glossary** | Missing | **`reference/glossary.md`** early — reduces drift |

### 1.4 Redundancy and merge decisions

| Topic | Current duplication risk | Decision |
| --- | --- | --- |
| Visual philosophy | Visual Language vs PSA Design Principles vs BRAND_RULES | **Keep split:** Visual Language = brand world; PSA Design Principles = character; BRAND_RULES = **living implementation digest** OR fold into `foundation/brand-rules.md` v2 and deprecate loose file |
| Storytelling vs Campaign | Philosophy vs future campaigns | **Keep split:** philosophy permanent; campaigns in `storytelling/campaign-framework.md` + external timeline |
| Product photography | Visual Language materials vs photography bible | **Single execution home:** `docs/frontal-slayer/product-photography-bible/`; Brand Bible **`production/photography-registry.md`** points to it |
| Fal / AI generation | golden-prompts vs future bible | **Prompts stay out of bible**; governance doc defines **when** prompts may be used and **identity locks** |
| Mansion / environments | Storytelling + design-dna-canon + tutorial-os | **Merge narrative in storytelling**; **spatial specs in** `environments/mansion-and-rooms.md`; link tutorial-os |

### 1.5 Scalability concerns

- **Risk:** Flat explosion of markdown files without registry → **MASTER_ROADMAP + README index + naming convention** required.  
- **Risk:** Philosophy docs accrete hex, prompts, scripts → **enforce layer rules** (philosophy ≠ spec ≠ prompt).  
- **Risk:** Studio OS docs confused with customer brand → **scope banner** on every bible file (customer brand vs admin platform).  
- **Risk:** Multiple “version 1.0” without global semver → **governance/versioning.md**.

---

## Part 2 — Documentation layers (information architecture)

Use **four layers**. Every new file must declare its layer in the header.

| Layer | Purpose | Example paths |
| --- | --- | --- |
| **L0 — Constitution** | Why; non-negotiable philosophy | `storytelling/`, `visual-language/`, `foundation/` |
| **L1 — Standards** | Measurable rules (color, type, UI, film) | `visual-system/`, `digital-product/`, `production/` |
| **L2 — Systems** | Frameworks (campaigns, education, QA) | `content-systems/`, `operations/`, `ai-systems/` |
| **L3 — Reference & ops** | Libraries, glossary, pipelines, external bibles | `reference/`, `registry/` → `docs/frontal-slayer/` |

**Rule:** L0 never contains prompts or campaign scripts. L3 never rewrites L0 philosophy.

---

## Part 3 — Target folder hierarchy (long-term)

```
brand-bible/
├── MASTER_ROADMAP.md                 ← this file
├── README.md                         ← entry point + layer guide (Phase 1)
├── governance/
│   ├── versioning.md
│   ├── ownership-and-approvals.md
│   ├── change-management.md
│   ├── documentation-quality-standards.md
│   └── contribution-guide.md
├── foundation/
│   ├── brand-charter.md              ← mission, vision, values, pillars (creative)
│   ├── brand-positioning.md
│   ├── luxury-philosophy.md
│   └── brand-rules.md                ← optional merge of BRAND_RULES.md
├── voice-tone/
│   ├── voice-and-tone.md
│   ├── editorial-standards.md
│   └── microcopy-principles.md
├── visual-language/
│   └── visual-language.md            ✅ exists
├── visual-system/
│   ├── color-standards.md
│   ├── typography-standards.md
│   ├── iconography-standards.md
│   ├── spacing-and-layout.md
│   └── motion-standards.md           ← extract from VL reserved when measured
├── storytelling/
│   ├── storytelling-philosophy.md  ✅ exists
│   ├── campaign-framework.md
│   ├── universe-timeline.md          ← reserved chronology
│   └── continuity-registry.md
├── experience/
│   └── frontal-slayer-experience-bible.md  ✅ SHIPPED v1.0
├── psa/
│   ├── identity.md                   ✅ exists
│   ├── design-principles.md          ✅ exists
│   ├── voice-and-performance.md      ← narrative + chat/film performance
│   ├── wardrobe-standards.md
│   ├── hair-makeup-standards.md
│   ├── expression-library.md         ← catalog slugs, not prompts
│   └── continuity-checklist.md
├── characters/
│   └── future-characters-template.md ← single template until cast exists
├── environments/
│   ├── mansion-and-rooms.md
│   ├── digital-spaces-registry.md    ← links design-dna-canon
│   ├── tv-lounge-set-standards.md
│   └── retail-environment-standards.md
├── content-systems/
│   ├── tv-lounge-production-standards.md
│   ├── education-system.md
│   ├── social-media-standards.md
│   ├── email-standards.md
│   └── launch-methodology.md
├── production/
│   ├── film-trilogy-master-cinematography-bible.md  ✅ SHIPPED v1.0 LOCKED
│   ├── film-trilogy-visual-story-bible.md           ✅ SHIPPED v1.0 LOCKED
│   ├── art-direction-workflow.md
│   ├── photography-registry.md       ← points to product-photography-bible
│   ├── film-standards.md
│   ├── animation-standards.md
│   ├── lighting-standards.md
│   └── material-library-spec.md      ← measured swatches
├── digital-product/
│   ├── ui-language.md
│   ├── interaction-principles.md
│   ├── accessibility-standards.md
│   └── onboarding-story-standards.md ← Mansion Tour alignment
├── audio/
│   ├── sound-design-direction.md
│   └── music-direction.md
├── packaging/
│   └── packaging-standards.md
├── partnerships/
│   └── brand-partnership-guidelines.md
├── ai-systems/
│   ├── generation-governance.md
│   ├── identity-preservation-qa.md
│   ├── model-compatibility-matrix.md
│   └── prompt-asset-boundary.md      ← where prompts live (outside bible)
├── operations/
│   ├── creative-approval-workflow.md
│   ├── asset-management-naming.md
│   ├── file-structure-conventions.md
│   └── production-pipelines-overview.md
├── reference/
│   ├── glossary.md
│   ├── decision-trees/
│   │   ├── approve-creative-asset.md
│   │   └── use-psa-in-campaign.md
│   └── external-bibles-index.md      ← docs/frontal-slayer map
└── appendices/
    └── revision-history-log.md
```

**External (linked, not moved):** `docs/frontal-slayer/product-photography-bible/`, `asset-factory/`, `photography-derivative-engine/`, `build-a-wig-visual-snapshot/`.

---

## Part 4 — Creation phases (dependency order)

Phases are **sequential gates**. Do not write L1 specs before L0 for that domain is stable.

| Phase | Name | Goal | Exit criteria |
| --- | --- | --- | --- |
| **0** | **Governance & index** | Operable system | README, governance/*, glossary stub, external index |
| **1** | **Foundation** | Why we exist creatively | brand-charter, positioning, luxury-philosophy, brand-rules bridge |
| **2** | **Voice & narrative** | How we speak & story | voice-and-tone; campaign-framework; continuity-registry stub |
| **3** | **Visual constitution** | ✅ largely done | Visual Language maintained; split color/type when ready |
| **4** | **Character (PSA)** | ✅ lock + expand | PSA voice/performance, expression library, wardrobe/hair/makeup |
| **5** | **Environments & content** | World consistency | mansion-and-rooms, TV Lounge, education-system |
| **6** | **Production standards** | Shoot & ship | film, photo registry, lighting/material specs |
| **7** | **Digital product** | App/web UX | ui-language, interaction, a11y, onboarding story |
| **8** | **Audio, packaging, retail** | Physical & sonic brand | sound, music, packaging, retail standards |
| **9** | **AI & operations** | Scale without drift | generation governance, QA, approval workflow, pipelines |
| **10** | **Future expansion** | Timelines, arcs, partnerships | universe timeline, partnership guidelines, new characters |

---

## Part 5 — Document registry (proposed)

Each entry: **ID** for tracking. **Priority:** P0 (blocking production), P1 (high), P2 (medium), P3 (later). **Phase:** from Part 4.

---

### Governance & index

#### DOC-GOV-001 — `README.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Single entry point: layers, how to navigate, what is in vs out of scope |
| **Why it exists** | Prevents bible sprawl and Studio OS confusion |
| **Scope** | Brand Bible only; links outward |
| **Dependencies** | MASTER_ROADMAP |
| **Primary audience** | All creatives, contractors, leadership |
| **Related** | governance/*, reference/external-bibles-index.md |
| **Importance** | Critical |
| **Priority** | P0 |
| **Phase** | 0 |
| **Future expansion** | Role-based quick starts (film vs UI) |
| **Maintenance** | Update on every new top-level folder |

#### DOC-GOV-002 — `governance/versioning.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Semver for bible docs, breaking vs minor, file headers |
| **Why it exists** | Ten-year consistency |
| **Scope** | All `/brand-bible/` |
| **Dependencies** | None |
| **Primary audience** | Doc owners, agents, legal |
| **Related** | change-management.md, appendices/revision-history-log.md |
| **Importance** | Critical |
| **Priority** | P0 |
| **Phase** | 0 |
| **Future expansion** | Automated changelog |
| **Maintenance** | Review annually |

#### DOC-GOV-003 — `governance/ownership-and-approvals.md`

| Field | Detail |
| --- | --- |
| **Purpose** | RACI: Founder, ECD, Narrative, Product, Legal sign-off |
| **Why it exists** | Luxury brands fail on ambiguous approval |
| **Scope** | Creative + brand docs |
| **Dependencies** | versioning |
| **Primary audience** | Leadership, producers |
| **Related** | operations/creative-approval-workflow.md |
| **Importance** | Critical |
| **Priority** | P0 |
| **Phase** | 0 |
| **Future expansion** | Partner approval tier |
| **Maintenance** | Review on org change |

#### DOC-GOV-004 — `governance/change-management.md`

| Field | Detail |
| --- | --- |
| **Purpose** | How changes propagate (PSA lock vs UI tweak) |
| **Why it exists** | Avoid silent drift |
| **Scope** | All bible + linked docs |
| **Dependencies** | ownership, versioning |
| **Primary audience** | Doc owners |
| **Related** | PSA identity, visual language |
| **Importance** | High |
| **Priority** | P1 |
| **Phase** | 0 |
| **Future expansion** | Impact assessment template |
| **Maintenance** | Quarterly |

#### DOC-GOV-005 — `governance/documentation-quality-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Required sections, tone, no prompts/marketing, scope banners |
| **Why it exists** | Agent and vendor consistency |
| **Scope** | Writing standards for bible |
| **Dependencies** | None |
| **Primary audience** | Authors, AI agents |
| **Related** | contribution-guide.md |
| **Importance** | High |
| **Priority** | P1 |
| **Phase** | 0 |
| **Future expansion** | Lint automation |
| **Maintenance** | Annual |

#### DOC-GOV-006 — `governance/contribution-guide.md`

| Field | Detail |
| --- | --- |
| **Purpose** | How to propose edits, PR discipline, MEMORY/motherboard boundary |
| **Why it exists** | Scale contributions |
| **Scope** | Process |
| **Dependencies** | quality-standards |
| **Primary audience** | Internal team, agents |
| **Related** | motherboard/ADDING.md (engineering memory — separate) |
| **Importance** | Medium |
| **Priority** | P2 |
| **Phase** | 0 |
| **Future expansion** | External vendor onboarding |
| **Maintenance** | As needed |

---

### North Star (supreme creative constitution)

#### DOC-NS-001 — `frontal-slayer-north-star-manifesto.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | One-page permanent manifesto — tie-break when creative ideas compete; highest-level creative law |
| **Dependencies** | None (supersedes tone of subordinate bibles on conflict; Founder exception only) |
| **Primary audience** | All creatives, leadership, ECD |
| **Priority** | P0 |
| **Phase** | 0 (done) |

---

### Foundation

#### DOC-FND-001 — `foundation/brand-charter.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Mission, vision, values, brand pillars (creative-facing) |
| **Why it exists** | All decisions trace to why |
| **Scope** | Customer brand; not Studio OS platform |
| **Dependencies** | COMPANY_GENOME (business superset) |
| **Primary audience** | Leadership, strategy, all creatives |
| **Related** | brand-positioning, luxury-philosophy |
| **Importance** | Critical |
| **Priority** | P0 |
| **Phase** | 1 |
| **Future expansion** | Regional positioning addenda |
| **Maintenance** | Rare; versioned |

#### DOC-FND-002 — `foundation/brand-positioning.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Market frame, differentiation, luxury tier, competitor boundaries |
| **Why it exists** | Prevents generic “premium hair” copy |
| **Scope** | Strategy, not campaigns |
| **Dependencies** | brand-charter |
| **Primary audience** | Strategy, marketing leadership, ECD |
| **Related** | storytelling-philosophy |
| **Importance** | High |
| **Priority** | P1 |
| **Phase** | 1 |
| **Future expansion** | Category expansion (services, retail) |
| **Maintenance** | Annual review |

#### DOC-FND-003 — `foundation/luxury-philosophy.md`

| Field | Detail |
| --- | --- |
| **Purpose** | What luxury means for FS (hospitality, restraint, trust) |
| **Why it exists** | Unifies beauty + entertainment + product |
| **Scope** | Philosophy |
| **Dependencies** | brand-charter |
| **Primary audience** | All creatives |
| **Related** | visual-language, storytelling-philosophy |
| **Importance** | High |
| **Priority** | P1 |
| **Phase** | 1 |
| **Future expansion** | Retail service standards tie-in |
| **Maintenance** | Stable; minor updates |

#### DOC-FND-004 — `foundation/brand-rules.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Canonical digest of implemented rules (marble, red, Futura, catalog units) |
| **Why it exists** | Single bridge from bible to product |
| **Scope** | Customer-facing brand implementation |
| **Dependencies** | CORE.md, BRAND_RULES.md (migrate or supersede) |
| **Primary audience** | Product design, engineering, creatives |
| **Related** | ui-language, visual-system |
| **Importance** | Critical |
| **Priority** | P1 |
| **Phase** | 1 |
| **Future expansion** | Component mapping table |
| **Maintenance** | Update when CORE design changes |

---

### Voice & tone

#### DOC-VOC-001 — `voice-tone/voice-and-tone.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Brand-wide voice (non-PSA-specific): editorial, trust, uppercase conventions |
| **Why it exists** | PSA voice alone is insufficient for site, email, packaging |
| **Scope** | All copy |
| **Dependencies** | brand-charter, BRAND_RULES |
| **Primary audience** | Copywriters, product, support |
| **Related** | psa/voice-and-performance.md, editorial-standards.md |
| **Importance** | Critical |
| **Priority** | P0 |
| **Phase** | 2 |
| **Future expansion** | Locale guidelines |
| **Maintenance** | Semi-annual |

#### DOC-VOC-002 — `voice-tone/editorial-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Long-form, captions, titles, show naming |
| **Why it exists** | Lounge + campaigns need editorial consistency |
| **Scope** | Published text |
| **Dependencies** | voice-and-tone |
| **Primary audience** | Content, social, TV |
| **Related** | storytelling-philosophy |
| **Importance** | High |
| **Priority** | P1 |
| **Phase** | 2 |
| **Future expansion** | AP vs house style choices |
| **Maintenance** | Annual |

#### DOC-VOC-003 — `voice-tone/microcopy-principles.md`

| Field | Detail |
| --- | --- |
| **Purpose** | UI labels, errors, CTAs, empty states — hospitality tone |
| **Why it exists** | App is story environment |
| **Scope** | Digital product copy |
| **Dependencies** | voice-and-tone, interaction-principles |
| **Primary audience** | Product design, eng |
| **Related** | ui-language.md |
| **Importance** | High |
| **Priority** | P1 |
| **Phase** | 2 |
| **Future expansion** | Component copy library (L3) |
| **Maintenance** | Per release train |

---

### Visual (existing + extensions)

#### DOC-VIS-001 — `visual-language/visual-language.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Brand-wide visual philosophy and language |
| **Priority** | P0 — maintain |
| **Phase** | 3 (done) |
| **Future expansion** | Pull measured specs to visual-system/* |
| **Maintenance** | Minor version on philosophy change only |

#### DOC-VIS-002 — `visual-system/color-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Roles + measured tokens (#EB1C24, marble refs, semantic colors) |
| **Why it exists** | Philosophy doc must not hold fragile hex lists |
| **Scope** | All media + UI |
| **Dependencies** | visual-language, brand-rules |
| **Primary audience** | Design, eng, vendors |
| **Related** | ui-language |
| **Importance** | Critical |
| **Priority** | P1 |
| **Phase** | 3 |
| **Future expansion** | Dark-stage palette (TV Lounge) |
| **Maintenance** | On token change |

#### DOC-VIS-003 — `visual-system/typography-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Futura PT roles, CBYG usage, scale, mobile hierarchy |
| **Why it exists** | HIG-level type system |
| **Dependencies** | visual-language, CORE |
| **Primary audience** | Design, eng |
| **Importance** | Critical |
| **Priority** | P1 |
| **Phase** | 3 |
| **Future expansion** | Motion type |
| **Maintenance** | On type change |

#### DOC-VIS-004 — `visual-system/iconography-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | SVG assets, red filter rule, sizing |
| **Dependencies** | brand-rules |
| **Priority** | P2 |
| **Phase** | 3 |

#### DOC-VIS-005 — `visual-system/spacing-and-layout.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Luxury spacing, grid, touch targets (mobile-first) |
| **Dependencies** | ui-language |
| **Priority** | P1 |
| **Phase** | 7 |

#### DOC-VIS-006 — `visual-system/motion-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Durations, easing, reduced motion — extract from Visual Language |
| **Dependencies** | visual-language |
| **Priority** | P2 |
| **Phase** | 3 |

---

### Storytelling (existing + extensions)

#### DOC-STY-001 — `storytelling/storytelling-philosophy.md` ✅ **SHIPPED v1.0**

| Priority | P0 — maintain |
| **Phase** | 2 (done) |

#### DOC-STY-001B — `storytelling/story-department-overview.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Story Department master OS — purpose, pillars, hierarchy, content types, emotional journey ops, rules, approval, cross-dept |
| **Dependencies** | storytelling-philosophy |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001C — `storytelling/cinematic-universe-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Definitive FS cinematic/experiential universe — canon, world, time, locations, tech, tone, continuity, expansion, manifesto |
| **Dependencies** | storytelling-philosophy, story-department-overview, visual-language (ref), PSA bibles (ref) |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001D — `storytelling/episode-development-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Episode development OS — lifecycle, structure, story/character/env/product/emotion/education, platform, AI EDP, QA, mistakes, best practices |
| **Dependencies** | storytelling-philosophy, cinematic-universe-bible, story-department-overview, PSA/character QA refs |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001E — `storytelling/content-distribution-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Master story-first cross-platform distribution — Content Packages, platform philosophy (no algorithms), perspective system, continuity, information layering, audience rewards, campaign structure, repurposing standards, luxury bar, manifesto |
| **Dependencies** | storytelling-philosophy, cinematic-universe-bible, story-department-overview, episode-development-bible |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001F — `storytelling/season-one-creative-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Season One flagship launch constitution — relationship arc (4 chapters), mystery/product reveal rules, craft philosophies (visual/light/camera/sound/edit), hospitality, motifs, decision framework, review gates, scalability |
| **Dependencies** | storytelling-philosophy, cinematic-universe-bible, content-distribution-bible, visual-language (ref), PSA bibles (ref) |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001G — `storytelling/chapter-one-creative-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Chapter One “Who are you?” creative constitution — dramatic question, mystery/reveal ladder, character roles, sensory direction, platform package opportunities, Ch2 setup, success/failure signals |
| **Dependencies** | season-one-creative-bible, storytelling-philosophy, content-distribution-bible, episode-development-bible |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001H — `storytelling/film-i-the-arrival-discovery-packet.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Film I **The Arrival** — Story Trust discovery packet (pre-screenplay): emotional/thematic architecture, curiosity journey, character intentions, symbolism, craft roles, risks, weaknesses, improvements; no script/scenes/dialogue |
| **Dependencies** | season-one-creative-bible, chapter-one-creative-bible, storytelling-philosophy, content-distribution-bible |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001I — `storytelling/film-i-the-arrival-emotional-architecture-blueprint.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Film I **The Arrival** — Emotional Experience Department blueprint: emotional thesis, journey, phased beats, peaks, curiosity/trust/luxury/hospitality/wonder/anticipation architecture, rhythm, psychology timeline, memory & rewatch design, cross-platform continuity, creative review framework |
| **Dependencies** | film-i-the-arrival-discovery-packet, chapter-one-creative-bible, season-one-creative-bible, content-distribution-bible |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001J — `storytelling/film-i-narrative-design-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Film I **The Arrival** — narrative structure for screenplay: spine, information/mystery/reveal/curiosity architecture, POV, escalation/tension/wonder, beginning/middle/end functions, ending image, Film II setup, review checklist |
| **Dependencies** | film-i discovery + emotional architecture, chapter/season bibles, experience bible, storytelling-philosophy |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001K — `storytelling/film-i-screenplay-design-packet.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Film I **The Arrival** — final writer brief before screenplay: intent, promises, objectives (emotion/narrative/character/PSA/world/mystery/hospitality/luxury), beginning/middle/end requirements, milestones, turning points, signature moments, symbolism/motifs, dialogue/visual/scene/transition/pacing philosophy, constraints/opportunities, writer & approval checklists, success/failure |
| **Dependencies** | full Film I canon stack (discovery, emotional, narrative, experience, chapter/season) |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-001L — `storytelling/the-guest-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | **The Guest Bible** — emotional archetype for Film I protagonist / Slayer projection: emotional season, quiet beliefs, seeking, threshold pause, invisible decision, pre-product transformation, audience mirror, enduring archetype, writer principles |
| **Dependencies** | North Star, storytelling-philosophy, Film I screenplay design packet, experience bible |
| **Priority** | P0 |
| **Phase** | 2 (done) |

---

### Experience (guest journey & hospitality)

#### DOC-EXP-001 — `experience/frontal-slayer-experience-bible.md` ✅ **SHIPPED v1.0**

| Field | Detail |
| --- | --- |
| **Purpose** | Permanent guest experience constitution — philosophy, journey, luxury & hospitality standards, sensory/emotional design, language philosophy, rituals, platform DNA, invisible details, commandments, cross-department review system |
| **Dependencies** | storytelling-philosophy, cinematic-universe-bible, content-distribution-bible, visual-language, Film I emotional architecture (ref), season/chapter bibles (ref) |
| **Primary audience** | Experience Design, ECD, Product, Marketing, CS, Retail (future), all guest-facing teams |
| **Priority** | P0 |
| **Phase** | 2 (done) |

#### DOC-STY-002 — `storytelling/campaign-framework.md`

| Field | Detail |
| --- | --- |
| **Purpose** | How campaigns plug into universe (chapter structure, beats, handoff) |
| **Why it exists** | Philosophy without framework does not scale |
| **Scope** | Framework only — no scripts |
| **Dependencies** | storytelling-philosophy |
| **Primary audience** | Marketing, ECD, producers |
| **Importance** | High |
| **Priority** | P1 |
| **Phase** | 2 |

#### DOC-STY-003 — `storytelling/universe-timeline.md`

| Field | Detail |
| --- | --- |
| **Purpose** | In-world chronology, launch order, seasonal layers |
| **Dependencies** | campaign-framework |
| **Priority** | P2 |
| **Phase** | 10 |

#### DOC-STY-004 — `storytelling/continuity-registry.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Living log of canon decisions (what launched when, PSA taught what) |
| **Dependencies** | universe-timeline |
| **Priority** | P2 |
| **Phase** | 5 |

---

### PSA (existing + extensions)

#### DOC-PSA-001 — `psa/identity.md` ✅ **SHIPPED v1.0**

#### DOC-PSA-002 — `psa/design-principles.md` ✅ **SHIPPED v1.0**

#### DOC-PSA-003 — `psa/voice-and-performance.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Guide role, dialogue philosophy, chat/film performance — **not** API prompts |
| **Dependencies** | identity, storytelling-philosophy, psaInstructions (reference) |
| **Priority** | P0 |
| **Phase** | 4 |

#### DOC-PSA-004 — `psa/expression-library.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Approved expressions + use cases (slug registry) |
| **Dependencies** | identity, resolvePsaAvatarExpression (code ref) |
| **Priority** | P1 |
| **Phase** | 4 |

#### DOC-PSA-005 — `psa/wardrobe-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Stylist wardrobe philosophy + approved families |
| **Dependencies** | design-principles |
| **Priority** | P2 |
| **Phase** | 4 |

#### DOC-PSA-006 — `psa/hair-makeup-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | On-camera hair/makeup locks for PSA |
| **Dependencies** | identity |
| **Priority** | P2 |
| **Phase** | 4 |

#### DOC-PSA-007 — `psa/continuity-checklist.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Pre-ship checklist distilled from identity + design principles |
| **Dependencies** | identity, design-principles |
| **Priority** | P1 |
| **Phase** | 4 |

---

### Environments

#### DOC-ENV-001 — `environments/mansion-and-rooms.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Room purpose, emotion, narrative function (mansion as character) |
| **Dependencies** | storytelling-philosophy, tutorial-os |
| **Priority** | P1 |
| **Phase** | 5 |

#### DOC-ENV-002 — `environments/digital-spaces-registry.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Index customer routes/slides to narrative role |
| **Dependencies** | design-dna-canon |
| **Priority** | P2 |
| **Phase** | 5 |

#### DOC-ENV-003 — `environments/tv-lounge-set-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Set pieces, dark-stage rules, host framing |
| **Dependencies** | visual-language, content-systems/tv-lounge-* |
| **Priority** | P1 |
| **Phase** | 5 |

#### DOC-ENV-004 — `environments/retail-environment-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Future flagship: materials, service choreography |
| **Priority** | P3 |
| **Phase** | 8 |

---

### Content systems

#### DOC-CNT-001 — `content-systems/tv-lounge-production-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Episodic metadata, host role, rails philosophy, continuity — not UI code |
| **Dependencies** | storytelling, psa docs, visual-language |
| **Priority** | P1 |
| **Phase** | 5 |

#### DOC-CNT-002 — `content-systems/education-system.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Edutainment structure: paths, episodes, assessment tone |
| **Dependencies** | storytelling-philosophy |
| **Priority** | P1 |
| **Phase** | 5 |

#### DOC-CNT-003 — `content-systems/launch-methodology.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Launch as chapter: film → product → lounge → email sequence |
| **Dependencies** | campaign-framework |
| **Priority** | P2 |
| **Phase** | 6 |

#### DOC-CNT-004 — `content-systems/social-media-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Crops, pacing, protagonist grammar, no clickbait |
| **Dependencies** | visual-language, storytelling |
| **Priority** | P2 |
| **Phase** | 6 |

#### DOC-CNT-005 — `content-systems/email-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Scene-not-blast, typography, hospitality |
| **Dependencies** | voice-tone |
| **Priority** | P2 |
| **Phase** | 6 |

---

### Production

#### DOC-PRD-001T — `production/film-trilogy-master-cinematography-bible.md` ✅ **SHIPPED v1.0 (LOCKED)**

| Field | Detail |
| --- | --- |
| **Purpose** | **Film trilogy** master cinematography — camera personality, movement, lens, composition, light, color, reflection, edit, sound, **Nia** performance/comedy/discovery, locked look, story contrast, **locked opening frames 001–007** |
| **Dependencies** | north-star, visual-language, the-guest-bible (emotional archetype) |
| **Authority** | Mandatory for trilogy cinematic sequences, storyboards, AI gen, animation, camera, edit — no deviation unless Founder/ECD instructs |
| **Priority** | P0 |
| **Phase** | 6 (done) |

#### DOC-PRD-001V — `production/film-trilogy-visual-story-bible.md` ✅ **SHIPPED v1.0 (LOCKED)**

| Field | Detail |
| --- | --- |
| **Purpose** | **Visual Story Bible** — trilogy SSoT for storyboards, AI image/video, shot lists, blocking, pacing; Nia/boutique discovery story; emotional journey; **First Act FRAME 001–009**; music/comedy/discovery rules |
| **Dependencies** | north-star, film-trilogy-master-cinematography-bible, the-guest-bible, visual-language |
| **Authority** | Nothing in trilogy generation/blocking should contradict; supersedes prior 001–007-only frame summary where they differ |
| **Priority** | P0 |
| **Phase** | 6 (done) |

#### DOC-PRD-001 — `production/photography-registry.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Point to `docs/frontal-slayer/product-photography-bible/` as execution authority |
| **Why it exists** | Avoid duplicating 12 chapters |
| **Priority** | P1 |
| **Phase** | 6 |

#### DOC-PRD-002 — `production/film-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Lens language, grade, pacing, sound on set |
| **Dependencies** | visual-language, storytelling |
| **Priority** | P1 |
| **Phase** | 6 |

#### DOC-PRD-003 — `production/animation-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | PSA crossfade, UI motion, 2D/3D boundaries |
| **Dependencies** | motion-standards, psa identity |
| **Priority** | P2 |
| **Phase** | 6 |

#### DOC-PRD-004 — `production/lighting-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Measured setups; extract from Visual Language reserved |
| **Dependencies** | visual-language, photography bible |
| **Priority** | P2 |
| **Phase** | 6 |

#### DOC-PRD-005 — `production/material-library-spec.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Swatches, vendors, marble asset refs |
| **Dependencies** | visual-language |
| **Priority** | P3 |
| **Phase** | 6 |

#### DOC-PRD-006 — `production/art-direction-workflow.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Brief → concept → review → ship |
| **Dependencies** | operations/creative-approval-workflow |
| **Priority** | P2 |
| **Phase** | 6 |

---

### Digital product

#### DOC-DIG-001 — `digital-product/ui-language.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Glass cards, marble, nav patterns — HIG-level |
| **Dependencies** | brand-rules, visual-system |
| **Priority** | P0 |
| **Phase** | 7 |

#### DOC-DIG-002 — `digital-product/interaction-principles.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Mobile-first flows, hospitality pacing, no dark patterns |
| **Dependencies** | storytelling, ui-language |
| **Priority** | P1 |
| **Phase** | 7 |

#### DOC-DIG-003 — `digital-product/accessibility-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | WCAG targets, motion reduction, contrast with luxury |
| **Dependencies** | color, typography |
| **Priority** | P1 |
| **Phase** | 7 |

#### DOC-DIG-004 — `digital-product/onboarding-story-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Mansion Tour as narrative onboarding |
| **Dependencies** | mansion-and-rooms, tutorial-os |
| **Priority** | P2 |
| **Phase** | 7 |

---

### Audio & packaging

#### DOC-AUD-001 — `audio/sound-design-direction.md`

| Field | Detail |
| --- | --- |
| **Purpose** | UI sounds, lobby ambience, restraint |
| **Priority** | P3 |
| **Phase** | 8 |

#### DOC-AUD-002 — `audio/music-direction.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Score tone for film/Lounge — licensing notes |
| **Priority** | P3 |
| **Phase** | 8 |

#### DOC-PKG-001 — `packaging/packaging-standards.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Unboxing, materials, story continuity |
| **Priority** | P3 |
| **Phase** | 8 |

#### DOC-PTN-001 — `partnerships/brand-partnership-guidelines.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Co-brand rules, PSA usage, mansion integrity |
| **Priority** | P3 |
| **Phase** | 10 |

---

### AI systems

#### DOC-AI-001 — `ai-systems/generation-governance.md`

| Field | Detail |
| --- | --- |
| **Purpose** | When AI may be used; identity locks; QA gates — **not prompts** |
| **Dependencies** | psa/identity, visual-language |
| **Primary audience** | Creative tech, vendors |
| **Priority** | P0 |
| **Phase** | 9 |

#### DOC-AI-002 — `ai-systems/identity-preservation-qa.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Reject criteria for PSA and brand imagery |
| **Dependencies** | generation-governance |
| **Priority** | P1 |
| **Phase** | 9 |

#### DOC-AI-003 — `ai-systems/model-compatibility-matrix.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Which models for which asset classes (reference golden-models) |
| **Dependencies** | golden-models folder |
| **Priority** | P2 |
| **Phase** | 9 |

#### DOC-AI-004 — `ai-systems/prompt-asset-boundary.md`

| Field | Detail |
| --- | --- |
| **Purpose** | States prompts live in `motherboard/golden-prompts/`, not bible |
| **Dependencies** | generation-governance |
| **Priority** | P1 |
| **Phase** | 9 |

---

### Operations

#### DOC-OPS-001 — `operations/creative-approval-workflow.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Stage gates: concept → internal → founder |
| **Dependencies** | governance/ownership |
| **Priority** | P1 |
| **Phase** | 9 |

#### DOC-OPS-002 — `operations/asset-management-naming.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Naming, DAM structure, supersession |
| **Dependencies** | photography bible file naming |
| **Priority** | P2 |
| **Phase** | 9 |

#### DOC-OPS-003 — `operations/file-structure-conventions.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Repo + brand-bible + export paths |
| **Priority** | P2 |
| **Phase** | 9 |

#### DOC-OPS-004 — `operations/production-pipelines-overview.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Map asset-factory, derivative engine, Lounge metadata |
| **Dependencies** | reference/external-bibles-index |
| **Priority** | P2 |
| **Phase** | 9 |

---

### Reference

#### DOC-REF-001 — `reference/glossary.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Slayer, PSA, Mansion, units, shows — canonical terms |
| **Priority** | P0 |
| **Phase** | 0 |

#### DOC-REF-002 — `reference/external-bibles-index.md`

| Field | Detail |
| --- | --- |
| **Purpose** | Map all `docs/frontal-slayer/*` to brand layers |
| **Priority** | P0 |
| **Phase** | 0 |

#### DOC-REF-003 — `reference/decision-trees/*`

| Field | Detail |
| --- | --- |
| **Purpose** | Approve asset, use PSA, pick photography path |
| **Priority** | P2 |
| **Phase** | 9 |

---

## Part 6 — Dependency graph (critical path)

```
Phase 0: README + governance + glossary + external index
    ↓
Phase 1: brand-charter, brand-rules bridge, luxury-philosophy
    ↓
Phase 2: voice-and-tone, campaign-framework  ←→  storytelling-philosophy ✅
    ↓
Phase 3: visual-system (color, type)  ←→  visual-language ✅
    ↓
Phase 4: PSA voice/performance, expression library, continuity checklist  ←→  identity ✅ + design-principles ✅
    ↓
Phase 5: mansion-and-rooms, TV Lounge standards, education-system
    ↓
Phase 6: film standards, photography registry, launch methodology
    ↓
Phase 7: ui-language, interaction, a11y
    ↓
Phase 8: audio, packaging, retail
    ↓
Phase 9: AI governance, QA, approval, pipelines
    ↓
Phase 10: universe timeline, partnerships, new characters
```

**Parallel OK:** Phase 6 product photography bible (external) continues independently; registry links when Phase 6 starts.

---

## Part 7 — Governance recommendations

### Versioning

- **Major (X.0):** Philosophy or identity lock change — Founder + ECD approval.  
- **Minor (x.Y):** New sections, clarified standards — ECD approval.  
- **Patch:** Typos, links — doc owner.  
- Every file header: `Version`, `Status`, `Owner`, `Classification`.

### Approval process

| Change type | Approver |
| --- | --- |
| PSA identity / likeness | Founder + ECD |
| Visual Language philosophy | ECD |
| Color/type tokens | Design lead + Product |
| UI language | Product design + ECD |
| AI governance | Creative tech + ECD |
| Campaign framework | Narrative director + ECD |
| External bible (photo) | Photography lead |

### Ownership (recommended)

| Domain | Owner role |
| --- | --- |
| MASTER_ROADMAP, governance | Brand operations / ECD |
| Foundation, positioning | Founder office + strategy |
| Visual Language + visual-system | ECD / art director |
| Storytelling + campaigns | Narrative director |
| PSA folder | Character director + ECD |
| Digital product | Head of product design |
| AI systems | Creative technologist |
| Operations | Producer / PMO |

### Review cadence

| Layer | Cadence |
| --- | --- |
| L0 Constitution | Annual + after major launch |
| L1 Standards | Semi-annual or on token change |
| L2 Systems | Quarterly |
| L3 Reference index | Monthly link check |
| Continuity registry | Continuous |

### Deprecation policy

- Mark **Deprecated** in header; point to successor.  
- Keep file **6 months** minimum for vendor contracts.  
- Do not delete history — move to `appendices/deprecated/` if needed.

### Contribution standards

- No prompts in bible.  
- No campaign scripts in bible.  
- Scope banner: customer Frontal Slayer vs Studio OS admin.  
- Cross-link instead of copy-paste from `docs/frontal-slayer/`.

---

## Part 8 — Immediate next actions (recommended order)

| Order | Action | Phase |
| --- | --- | --- |
| 1 | Create `brand-bible/README.md` | 0 |
| 2 | Create `governance/versioning.md` + `ownership-and-approvals.md` | 0 |
| 3 | Create `reference/glossary.md` + `external-bibles-index.md` | 0 |
| 4 | Create `foundation/brand-charter.md` + `foundation/brand-rules.md` (bridge CORE) | 1 |
| 5 | Create `voice-tone/voice-and-tone.md` | 2 |
| 6 | Create `storytelling/campaign-framework.md` | 2 |
| 7 | Create `psa/voice-and-performance.md` + `psa/expression-library.md` | 4 |
| 8 | Create `visual-system/color-standards.md` + `typography-standards.md` | 3 |
| 9 | Create `digital-product/ui-language.md` | 7 |
| 10 | Create `ai-systems/generation-governance.md` | 9 |

**Do not** rewrite product-photography-bible inside brand-bible — **registry only**.

---

## Part 9 — Success metrics (documentation system health)

| Metric | Target |
| --- | --- |
| Time to onboard vendor | < 2 days with README + role path |
| Duplicate philosophy paragraphs | Zero across files (link instead) |
| Prompts inside `/brand-bible/` | Zero |
| Broken cross-links | Zero in monthly check |
| PSA identity failures in QA | Tracked; trending down |
| Documents without owner header | Zero |

---

## Revision history

| Version | Date | Summary | Approver |
| --- | --- | --- | --- |
| **1.0** | 2026-07-22 | Initial master roadmap: audit, architecture, registry, phases, governance | Executive Creative |

---

*End of Brand Bible Master Roadmap v1.0*
