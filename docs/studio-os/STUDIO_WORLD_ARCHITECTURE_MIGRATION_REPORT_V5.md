# Studio World™ V5 — Architecture Migration Report

**Status:** Audit complete — implementation not started  
**Date:** July 2026  
**Sprint:** Architectural Enforcement (remove website thinking)  
**Scope:** Structure and navigation only — not a visual redesign sprint

---

## Executive Summary

Studio World™ V4 established the physical law (campus → flagship → district → wing → room) and delivered **three live immersive destinations**:

| Destination | Route | Shell | Status |
|-------------|-------|-------|--------|
| Creative Direction Studio™ | `/admin/studio/department/creative-direction` | `DepartmentGoldenBuildShell` | **immersive-live** |
| Studio Archives™ | `/admin/studio/studio-warehouse` | `DepartmentGoldenBuildShell` | **immersive-live** |
| Campus Map Atrium™ (Overview) | `/admin/studio/overview` | `DepartmentGoldenBuildShell` | **immersive-partial** ⚠️ |

**The reset is ~70% architecturally defined but ~3% experientially migrated.**

### Hard numbers (automated inventory — July 2026)

| Metric | Count |
|--------|------:|
| `page.tsx` files under `/admin/studio` | **213** |
| Nav modules in `adminStudioNavigation.ts` | **191** |
| Routes mapped in `STUDIO_WORLD_ROUTE_REGISTRY` | **76** |
| Routes using `AdminStudioStageShell` (scrollable webpage) | **192 pages / 163 modules** |
| Routes using `DepartmentGoldenBuildShell` (immersive) | **3** |
| Routes flagged as webpage-like in this audit | **163 / 191 modules (85%)** |

**Conclusion:** The system still defaults to webpage architecture on **every administrative and operational route** except CDS and Archives. Overview has an immersive shell but **behaves like a dashboard** (KPI grid, wing cards, `navigate()` to legacy pages).

### Final Law (V5)

There must be no concept of *"I opened a page."* Only *"I entered another place."*

---

## Audit Methodology

1. **Inventory** — All `src/pages/admin/studio/**/page.tsx` (213) + `src/pages/admin/studio-os/**` (11) + `/admin/headquarters`.
2. **Shell classification** — Grep for `DepartmentGoldenBuildShell`, `AdminStudioStageShell`, `AdminStudioLayout`, `MissionControlWorkspace`, `StudioPlatformLayout`.
3. **Module crosswalk** — `ADMIN_STUDIO_MODULES` (191) matched to page files by route.
4. **Physical mapping** — `route-registry.ts`, `flagship-destinations.ts`, `feature-lexicon.ts`, V5 Room Rule (user brief).
5. **Flagging** — Any route using scroll container, card grid, KPI metrics, section headers, or `navigate()` as primary wing transition = **webpage**.

**Machine-readable export:** `src/studio-os-core/studio-world/migration-audit.ts`

---

## Forbidden Pattern Inventory

These patterns are **forbidden** in Studio World™ V5. Current prevalence:

| Forbidden Pattern | Where it lives today | Prevalence |
|-------------------|---------------------|------------|
| Dashboard cards | `AdminStudioModuleCard`, Mission Control, Executive Command Center | ~191 module cards |
| Statistic grids | `OrganizationPulseCore` 3×2 KPI grid, health scorecards | Overview, Mission Control, HQ |
| Section headers | `AdminStudioStageShell` title/subtitle/breadcrumb | 192 pages |
| Large white panels | `AdminStudioLayout` marble cards | All stage-shell pages |
| Analytics blocks | `analytics`, `company-health-index`, intelligence modules | 40+ routes |
| Page containers | `AdminStudioStageShell` → `AdminStudioLayout` scroll | 192 pages |
| Scrolling reports | Executive timeline, QA dashboards, knowledge hub | 50+ routes |
| Admin widgets | Demo metrics on nav modules, disclaimer footers | Universal |

### Replacement vocabulary (required)

Living displays · Architectural installations · Interactive tables · Wall projections · Command consoles · Digital sculptures · Observation decks · Physical stations

---

## P0 — Executive Operations Headquarters™ (Command Center V5)

### Current state (FLAGGED)

**Route:** `/admin/studio/overview`  
**Shell:** `DepartmentGoldenBuildShell` + `StudioCommandCenterRoom`  
**UI pattern:** **Immersive-partial dashboard hybrid**

| Element | Current behavior | Violation |
|---------|------------------|-----------|
| `OrganizationPulseCore` | 3×2 metric grid (STUDIO PULSE, MODULES, COMPANY HEALTH…) | ❌ KPI dashboard |
| Wing portals | Hotspots call `navigate()` to first module in nav group | ❌ Page navigation, not walking |
| Focused wing panel | Button list of module routes | ❌ Admin widget list |
| Camera zones | Threshold → Atrium only; wings exit to legacy URLs | ❌ Not continuous HQ |
| Scene Stack | `studio-command-center` manifest exists | ✅ Partial |

**Also flagged:** `/admin/studio/mission-control` — `AdminStudioStageShell` wrapping `MissionControlWorkspace` (modular dashboard: hero, department grid, scorecards, calendar, approval center).

### V5 target architecture

**Physical destination:** Executive Operations Headquarters™  
**Entry:** Founder physically enters **Mission Control™**  
**Centerpiece:** **Organization Pulse Core™** (living sculpture — not a metric grid)

**Operational wings (movement-based, single continuous Scene Stack):**

```
Mission Control™
    ↓ walk
Operations Wing™
    ↓ walk
Intelligence Wing™
    ↓ walk
Distribution Wing™
    ↓ walk
Finance Wing™
    ↓ walk
Marketplace Wing™
    ↓ walk
Global AI Wing™
    ↓ walk
Licensing Wing™
    ↓ walk
Organization Registry™
    ↓ walk
System Health Observatory™
```

### Room Rule mappings (user canon)

| Former software feature | Physical room |
|------------------------|---------------|
| Portfolio Health | Executive Monitoring Room™ |
| Cross Company Insights | Intelligence Observatory™ |
| Organizations Requiring Attention | Situation Room™ |
| Revenue | Financial Observatory™ |
| Marketplace | Commerce Pavilion™ |
| Global AI | Intelligence Nexus™ |
| Organization Registry | Headquarters Directory™ |
| Licensing | Licensing Bureau™ |
| System Health | Infrastructure Observatory™ |

### Required Scene Stack™ (Command Center rebuild)

```
threshold → mission-control-floor → organization-pulse-core (sculpture)
→ operations-corridor → intelligence-corridor → distribution-corridor
→ finance-observatory → marketplace-pavilion → global-ai-nexus
→ licensing-bureau → headquarters-directory → infrastructure-observatory
```

**Navigation:** Camera track zones (pattern: `commandCenterCameraZones.ts` + Archives 20-zone model). Wing transitions = **pan/dolly inside HQ**, never `navigate()`.

**Reuse estimate:** 45% (shell + Scene Stack pipeline exist; content layer is wrong)  
**New assets:** Medium — one HQ environment, 10 wing corridor extensions, diegetic installations replacing KPIs  
**Generation cost:** $$  
**Complexity:** XL  
**Priority:** **P0 — first implementation after this audit**

---

## Studio World™ District Map

### Five flagships → districts → wings

```
Studio World™ Campus
├── Executive Operations Headquarters™ (Studio Command Center™)
│   ├── Mission Control™
│   ├── Operations Wing™
│   ├── Intelligence Wing™
│   ├── Distribution Wing™ (exec-level)
│   ├── Finance Wing™
│   ├── Marketplace Wing™ (exec-level)
│   ├── Global AI Wing™
│   ├── Licensing Wing™
│   ├── Organization Registry™
│   └── System Health Observatory™
├── Creative Direction Studio™
│   ├── Story Table™
│   └── Scene Stack™ Assembly
├── Studio Archives™ ✅ immersive-live
│   ├── Grand Entrance™ → Orientation Atrium™
│   ├── Warehouse Wing™ · Museum Wing™ · Hall of Innovation™
│   ├── Company Genome Vault™ · Blueprint Archive™
│   └── Marketplace Pavilion™
├── Headquarters™ (department immersive offices)
│   ├── Marketing Headquarters™
│   ├── Distribution Headquarters™
│   ├── Intelligence Headquarters™
│   └── Operations Headquarters™
└── Expedition Hub™
    ├── Discovery Atrium™
    └── Growth Corridor™
```

### Platform layer (outside org boundary)

| Route | Current UI | Target building |
|-------|-----------|-----------------|
| `/admin/studio-os/command-center` | Platform admin scroll | **Studio Platform Command Bridge™** |
| `/admin/studio-os/administration` | Portfolio owner panel | **Studio Administration Tower™** |
| `/admin/studio-os/workspace/*` | Workspace settings/dashboard | **Workspace Registry Office™** |

---

## Migration Priority Tiers

| Tier | Scope | Module count | Action |
|------|-------|-------------:|--------|
| **P0** | Command Center / Overview / Mission Control / exec observatories | 44 | Rebuild as continuous HQ — no dashboards |
| **P1** | Distribution, Archives sub-rooms, Production, Legacy, Create | 42 | Immersive room per flagship pattern |
| **P2** | Intelligence engines (101 modules) | 105 | Batch by sub-wing; observatory/console scenes |
| **P3** | Settings, platform infra, NDXBOOK pilots | remainder | Systems Dock™ rooms |

---

## Flagship Migration Tables

### Studio Command Center™ / Executive Operations HQ™ (P0)

| Current Route | Current UI Pattern | Physical Destination | Building | Wing | Room | Scene Type | Navigation Path | Scene Stack | Reuse % | New Assets | Cost | Complexity | Priority |
|---------------|-------------------|---------------------|----------|------|------|------------|-----------------|-------------|--------|------------|------|------------|----------|
| `/admin/studio/overview` | Immersive shell + KPI grid + wing `navigate()` | Organization Pulse Core™ | Executive Operations HQ™ | Mission Control™ | Campus Map Atrium™ | immersive-partial-dashboard | Campus → command-center → walk wings | `studio-command-center` threshold→atrium→wings | 45% | Medium | $$ | XL | **P0** |
| `/admin/studio/mission-control` | AdminStudioStageShell + MissionControlWorkspace dashboard | Mission Control Room™ | Executive Operations HQ™ | Mission Control™ | Mission Control Room™ | admin-scroll-panel | HQ → Mission Control™ | none (rebuild) | 20% | High | $$$ | XL | **P0** |
| `/admin/studio/executive-command-center` | Scroll + executive overview cards | Executive Command Bridge™ | Executive Operations HQ™ | Executive District™ | Executive Command Bridge™ | admin-scroll-panel | HQ → Executive District™ | TBD | 25% | High | $$$ | L | **P0** |
| `/admin/studio/executive-ai-director` | Scroll + briefing panels + scorecard | Intelligence Nexus™ | Executive Operations HQ™ | Global AI Wing™ | Intelligence Nexus™ | admin-scroll-panel | HQ → Global AI Wing™ | TBD | 25% | Medium | $$ | L | **P0** |
| `/admin/studio/company-health-index` | Health scorecards + analytics blocks | Financial Observatory™ | Executive Operations HQ™ | Finance Wing™ | Financial Observatory™ | admin-scroll-panel | HQ → Finance Wing™ | TBD | 25% | Medium | $$ | M | **P0** |
| `/admin/studio/organization-pulse` | Pulse metrics scroll page | Organization Pulse Core™ | Executive Operations HQ™ | Mission Control™ | Organization Pulse Core™ | admin-scroll-panel | HQ → Pulse Core (center) | pulse-sculpture layer | 30% | Medium | $$ | M | **P0** |
| `/admin/studio/analytics` | Analytics tables + charts | Performance Observatory™ | Executive Operations HQ™ | Intelligence Wing™ | Performance Observatory™ | admin-scroll-panel | HQ → Intelligence Wing™ | observatory-deck | 20% | High | $$$ | L | **P0** |
| `/admin/studio/chief-of-staff` | Executive briefing scroll | Chief of Staff Office™ | Executive Operations HQ™ | Executive District™ | Chief of Staff Office™ | admin-scroll-panel | HQ → Executive District™ | TBD | 25% | Medium | $$ | M | **P0** |
| `/admin/studio/executive-council` | Council chamber cards | Executive Council Chamber™ | Executive Operations HQ™ | Executive District™ | Executive Council Chamber™ | admin-scroll-panel | HQ → Executive District™ | TBD | 25% | Medium | $$ | M | **P0** |
| `/admin/studio/qa-headquarters` | QA dashboard scroll | Infrastructure Observatory™ | Executive Operations HQ™ | System Health Wing™ | Infrastructure Observatory™ | admin-scroll-panel | HQ → System Health Observatory™ | TBD | 20% | High | $$$ | L | **P0** |
| `/admin/studio/engineering-excellence-dashboard` | Engineering metrics grid | Infrastructure Observatory™ | Executive Operations HQ™ | System Health Wing™ | Infrastructure Observatory™ | admin-scroll-panel | HQ → System Health Observatory™ | TBD | 20% | High | $$$ | L | **P0** |
| `/admin/studio/work-orchestration` | Ops coordination tables | Operations Coordination Room™ | Executive Operations HQ™ | Operations Wing™ | Operations Coordination Room™ | admin-scroll-panel | HQ → Operations Wing™ | TBD | 25% | Medium | $$ | M | **P0** |
| `/admin/studio/campaign-orchestrator` | Campaign wizard + dashboard | Campaign Operations Theater™ | Executive Operations HQ™ | Operations Wing™ | Campaign Operations Theater™ | admin-scroll-panel | HQ → Operations Wing™ | TBD | 25% | Medium | $$ | L | **P0** |
| `/admin/studio/system-registry` | Integrations list/table | Systems Dock™ | Executive Operations HQ™ | Operations Wing™ | Systems Dock™ | admin-scroll-panel | HQ → Operations Wing™ → Systems Dock™ | TBD | 30% | Medium | $$ | M | **P0** |
| `/admin/studio/governance` | Policy scroll panels | Security Center™ | Executive Operations HQ™ | Security Center™ | Security Center™ | admin-scroll-panel | HQ → Security Center™ | TBD | 25% | Medium | $$ | M | **P0** |

*Remaining 29 overview-group modules (architect studios, genome, maturity, CXO roles, etc.) — all `AdminStudioStageShell` — map to Executive District™ sub-rooms; see Appendix.*

### Creative Direction Studio™ (P1 — 1 live, 8 partial)

| Current Route | Current UI Pattern | Physical Destination | Building | Wing | Scene Type | Reuse % | Priority |
|---------------|-------------------|---------------------|----------|------|------------|--------|----------|
| `/admin/studio/department/creative-direction` | Golden Build immersive ✅ | Creative Direction Studio™ | CDS™ | Scene Stack™ | immersive-walk | **90%** | Done |
| `/admin/studio/director-mode` | Tabbed control room scroll | Director Mode Theater™ | CDS™ | Scene Stack™ | admin-scroll-panel | 35% | P1 |
| `/admin/studio/production-builder` | Three-column builder UI | Production Builder Workshop™ | CDS™ | Scene Stack™ | admin-scroll-panel | 35% | P1 |
| `/admin/studio/prompt-library` | Card list + filters | Prompt Library™ | CDS™ | Scene Stack™ | admin-scroll-panel | 30% | P1 |
| `/admin/studio/ai-studio` | Tool panels scroll | AI Studio Laboratory™ | CDS™ | Scene Stack™ | admin-scroll-panel | 30% | P1 |
| `/admin/studio/screening-room` | Screening UI scroll | Screening Theater™ | CDS™ | Scene Stack™ | admin-scroll-panel | 30% | P1 |
| `/admin/studio/render-queue` | Queue table scroll | Render Queue Bay™ | CDS™ | Scene Stack™ | admin-scroll-panel | 30% | P1 |
| `/admin/studio/creative-director` | Briefing panels | Creative Director Briefing Room™ | CDS™ | Story Table™ | admin-scroll-panel | 40% | P1 |
| `/admin/studio/content-brain` | Knowledge cards scroll | Content Brain Library™ | CDS™ | Story Table™ | admin-scroll-panel | 30% | P1 |

### Studio Archives™ (P1 — campus live, sub-rooms webpage)

| Current Route | Current UI Pattern | Physical Destination | Building | Wing | Reuse % | Priority |
|---------------|-------------------|---------------------|----------|------|--------|----------|
| `/admin/studio/studio-warehouse` | 20-zone immersive campus ✅ | Studio Archives™ | Studio Archives™ | Grand Entrance™ | **90%** | Done |
| `/admin/studio/marketplace` | Marketplace card grid | Commerce Pavilion™ | Studio Archives™ | Marketplace Wing™ | 40% | P1 |
| `/admin/studio/blueprint-manager` | Blueprint editor scroll | Blueprint Archive™ | Studio Archives™ | Blueprint Archive™ | 40% | P1 |
| `/admin/studio/asset-factory` | Factory dashboard scroll | Generation Bay™ | Studio Archives™ | Warehouse Wing™ | 40% | P1 |
| `/admin/studio/asset-director` | Gallery/list modes | Asset Director Gallery™ | Studio Archives™ | Warehouse Wing™ | 35% | P1 |
| `/admin/studio/legacy-system` | Museum editorial cards | Legacy Museum Hall™ | Studio Archives™ | Museum Wing™ | 35% | P1 |
| `/admin/studio/asset-library` | Media vault table | Media Vault™ | Studio Archives™ | Warehouse Wing™ | 35% | P1 |
| `/admin/studio/organization-genome` | Genome scroll panels | Company Genome Vault™ | Studio Archives™ | Genome Vault™ | 35% | P1 |

### Headquarters™ (P1–P2 — all webpage today)

| Current Route | Current UI Pattern | Physical Destination | Building | Wing | Priority |
|---------------|-------------------|---------------------|----------|------|----------|
| `/admin/headquarters` | Executive Lobby (partial immersive) | The Mansion™ / HQ Lobby | Headquarters™ | Executive Lobby™ | P1 |
| `/admin/studio/distribution-network` | Department dashboard | Distribution Command Bridge™ | Headquarters™ | Distribution HQ™ | P1 |
| `/admin/studio/publishing-queue` | Queue table scroll | Distribution Dock™ | Headquarters™ | Distribution HQ™ | P1 |
| `/admin/studio/social-accounts` | OAuth connector panels | Social Publishing Studio™ | Headquarters™ | Distribution HQ™ | P1 |
| `/admin/studio/intelligence-engine` | Strategy dashboard | Intelligence Command Bridge™ | Headquarters™ | Intelligence HQ™ | P2 |
| `/admin/studio/audience-brain` | Analytics scroll | Audience Brain Observatory™ | Headquarters™ | Intelligence HQ™ | P2 |
| `/admin/studio/profession-brain` | Brain library scroll | Profession Brain Library™ | Headquarters™ | Intelligence HQ™ | P2 |
| `/admin/studio/knowledge-hub` | Wiki slide-over + scroll | Knowledge Library™ | Headquarters™ | Knowledge Wing™ | P2 |
| `/admin/studio/production` | Pipeline kanban scroll | Production Wall™ | Headquarters™ | Operations HQ™ | P1 |
| `/admin/studio/ai-production-engine` | AI execution panels | AI Production Laboratory™ | Headquarters™ | Operations HQ™ | P1 |
| `/admin/studio/talent-agency` | Talent roster tables | Talent Theater™ | Headquarters™ | Operations HQ™ | P1 |
| `/admin/studio/campaign-engine` | Campaign studio scroll | Campaign Studio™ | Headquarters™ | Marketing HQ™ | P1 |
| `/admin/studio/brand-architect` | Brand wizard scroll | Brand Headquarters™ | Headquarters™ | Marketing HQ™ | P1 |

### Expedition Hub™ (P1)

| Current Route | Current UI Pattern | Physical Destination | Building | Wing | Priority |
|---------------|-------------------|---------------------|----------|------|----------|
| `/admin/studio/expansion-center` | Expansion tabs + payroll UI | Expansion Center Atrium™ | Expedition Hub™ | Discovery Atrium™ | P1 |
| `/admin/studio/business-discovery-blueprint` | Nine-chapter wizard scroll | Business Discovery Expedition™ | Expedition Hub™ | Discovery Atrium™ | P1 |
| `/admin/studio/organization-inauguration` | Ceremony phases scroll | Inauguration Ceremony Hall™ | Expedition Hub™ | Discovery Atrium™ | P1 |
| `/admin/studio/tutorial-os` | Learning path cards | Learning Path Library™ | Expedition Hub™ | Growth Corridor™ | P2 |
| `/admin/studio/business-simulation-lab` | Simulation panels | Simulation Laboratory™ | Expedition Hub™ | Growth Corridor™ | P2 |

### Intelligence engines (P2 — 101 modules, representative sample)

All 101 `intelligence` group modules use `AdminStudioStageShell`. They batch-migrate into **Intelligence Wing™** sub-observatories:

| Current Route | Current UI Pattern | Target Room | Scene Type |
|---------------|-------------------|-------------|------------|
| `/admin/studio/studio-intelligence` | Intelligence dashboard | Intelligence Observatory™ | observation-deck |
| `/admin/studio/memory-engine` | Memory vault tables | Memory Engine Vault™ | vault-installation |
| `/admin/studio/strategy-engine` | Strategy panels | Strategy Console™ | command-console |
| `/admin/studio/simulation-engine` | Simulation scroll | Strategy Simulation Workshop™ | workshop-floor |
| `/admin/studio/predictive-qa` | QA prediction tables | Predictive Observatory™ | wall-projection |
| `/admin/studio/confidence-engine` | Confidence metrics | Confidence Observatory™ | living-display |
| *…96 additional intelligence modules* | admin-scroll-panel | `{Module} Observatory™` or `{Module} Console™` | per feature law |

---

## Implementation Order (mandated)

**Do not mass-redesign.** Follow this sequence:

1. ✅ **Inventory** — this report  
2. ✅ **Categorize** — P0/P1/P2/P3 tiers above  
3. ✅ **Map to buildings** — district map above  
4. ✅ **Map buildings to districts** — five flagships  
5. ✅ **Map districts to Studio World** — `route-registry.ts` extension plan  
6. ⏳ **Replace** — P0 Command Center HQ only, then P1 flagships, then P2 batch

### P0 implementation checklist (next sprint)

- [ ] Replace `OrganizationPulseCore` metric grid with living pulse sculpture (diegetic, no KPI cards)
- [ ] Extend `commandCenterCameraZones` to 10 walkable wings inside one Scene Stack
- [ ] Remove wing `navigate()` — wings are camera zones, sub-rooms are hotspots
- [ ] Collapse `/admin/studio/mission-control` into HQ (single entry: Overview/Mission Control™)
- [ ] Register all P0 rooms in `STUDIO_WORLD_ROUTE_REGISTRY`
- [ ] Add `studio-command-center` Scene Stack manifest layers per wing

---

## Cost & Complexity Model

| Symbol | Generation cost (Fal/Scene Stack) | Typical scope |
|--------|--------------------------------|---------------|
| $ | < 10 scene layers | Diegetic UI swap in existing shell |
| $$ | 10–30 layers | One room environment + installations |
| $$$ | 30+ layers | Full wing rebuild + interactive systems |

| Complexity | Meaning |
|------------|---------|
| S | Diegetic UI / camera zone addition only |
| M | Single room environment |
| L | Multi-room wing with data bindings |
| XL | Continuous HQ campus (Command Center V5) |

---

## Appendix A — Complete Module Inventory (191 routes)

Columns: **Route · UI Pattern · Room · Building · Wing · Reuse · Cost · Complexity · Priority**

| Route | UI Pattern | Room | Building | Wing | Reuse | Cost | Complexity | Priority |
|-------|-----------|------|----------|------|-------|------|------------|----------|
| /admin/studio/executive-ai-director | scrollable AdminStudioStageShell — dashboard/ca… | Intelligence Nexus™ | Executive Operations Headquarters™ | Global AI Wing™ | 20% | $$$ | L | P0 |
| /admin/studio/analytics | scrollable AdminStudioStageShell — dashboard/ca… | Performance Observatory™ | Executive Operations Headquarters™ | Intelligence Wing™ | 20% | $$$ | L | P0 |
| /admin/studio/world/command-center | unclassified | Mission Control Room™ | Executive Operations Headquarters™ | Mission Control™ | 35% | $$$ | M | P0 |
| /admin/studio/chief-of-staff | scrollable AdminStudioStageShell — dashboard/ca… | Chief Of Staff Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/executive-timeline | scrollable AdminStudioStageShell — dashboard/ca… | Executive Timeline Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/executive-organization | scrollable AdminStudioStageShell — dashboard/ca… | Executive Organization Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-inheritance | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Inheritance Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/company-maturity-engine | scrollable AdminStudioStageShell — dashboard/ca… | Company Maturity Engine Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/brand-architect | scrollable AdminStudioStageShell — dashboard/ca… | Brand Architect Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/experience-architect | scrollable AdminStudioStageShell — dashboard/ca… | Experience Architect Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/digital-architect | scrollable AdminStudioStageShell — dashboard/ca… | Digital Architect Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/growth-architect | scrollable AdminStudioStageShell — dashboard/ca… | Growth Architect Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/company-genome | scrollable AdminStudioStageShell — dashboard/ca… | Company Genome Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/architect-studio | scrollable AdminStudioStageShell — dashboard/ca… | Architect Studio Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/campus-evolution-engine | scrollable AdminStudioStageShell — dashboard/ca… | Campus Evolution Engine Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/founder-walk | scrollable AdminStudioStageShell — dashboard/ca… | Founder Walk Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/remembrance-garden | scrollable AdminStudioStageShell — dashboard/ca… | Remembrance Garden Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/founders-promise | scrollable AdminStudioStageShell — dashboard/ca… | Founders Promise Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/executive-framework | scrollable AdminStudioStageShell — dashboard/ca… | Executive Framework Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/leadership-manifesto-framework | scrollable AdminStudioStageShell — dashboard/ca… | Leadership Manifesto Framework Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/chief-brand-officer | scrollable AdminStudioStageShell — dashboard/ca… | Chief Brand Officer Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/chief-experience-officer | scrollable AdminStudioStageShell — dashboard/ca… | Chief Experience Officer Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/chief-digital-officer | scrollable AdminStudioStageShell — dashboard/ca… | Chief Digital Officer Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/chief-technology-officer | scrollable AdminStudioStageShell — dashboard/ca… | Chief Technology Officer Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/chief-growth-officer | scrollable AdminStudioStageShell — dashboard/ca… | Chief Growth Officer Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/executive-council | scrollable AdminStudioStageShell — dashboard/ca… | Executive Council Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-intelligence | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Intelligence Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-autonomy-framework | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Autonomy Framework Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-delegation-engine | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Delegation Engine Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-workflow-orchestration | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Workflow Orchestration Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-self-improvement | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Self Improvement Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-governance-safeguards | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Governance Safeguards Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-maturity-model | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Maturity Model Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/leadership-modes | scrollable AdminStudioStageShell — dashboard/ca… | Leadership Modes Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/company-onboarding-intelligence | scrollable AdminStudioStageShell — dashboard/ca… | Company Onboarding Intelligence Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/arrival-experience | scrollable AdminStudioStageShell — dashboard/ca… | Arrival Experience Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/executive-apprenticeship-founder-calibration | scrollable AdminStudioStageShell — dashboard/ca… | Executive Apprenticeship Founder Calibration Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/organizational-apprenticeship | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Apprenticeship Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/concierge-layer | scrollable AdminStudioStageShell — dashboard/ca… | Concierge Layer Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/executive-command-center | scrollable AdminStudioStageShell — dashboard/ca… | Executive Command Bridge™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| STUDIO_OVERVIEW_PATH | unclassified | Studio Overview Room™ | Executive Operations Headquarters™ | Executive District™ | 35% | $$$ | M | P0 |
| /admin/studio/creative-director | scrollable AdminStudioStageShell — dashboard/ca… | Daily Briefing Room™ | Executive Operations Headquarters™ | Executive District™ | 20% | $$$ | M | P0 |
| /admin/studio/company-health-index | scrollable AdminStudioStageShell — dashboard/ca… | Financial Observatory™ | Executive Operations Headquarters™ | Finance Wing™ | 20% | $$$ | M | P0 |
| /admin/studio/organization-pulse | scrollable AdminStudioStageShell — dashboard/ca… | Organization Pulse Core™ | Executive Operations Headquarters™ | Mission Control™ | 20% | $$$ | M | P0 |
| /admin/studio/content-brain | scrollable AdminStudioStageShell — dashboard/ca… | Content Brain Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/design-dna-canon | scrollable AdminStudioStageShell — dashboard/ca… | Design Dna Canon Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/creative-director | scrollable AdminStudioStageShell — dashboard/ca… | Creative Director Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/show-bible | scrollable AdminStudioStageShell — dashboard/ca… | Show Bible Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/prompt-library | scrollable AdminStudioStageShell — dashboard/ca… | Prompt Library Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/ai-studio | scrollable AdminStudioStageShell — dashboard/ca… | Ai Studio Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/shows | scrollable AdminStudioStageShell — dashboard/ca… | Shows Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/ai-orchestrator | scrollable AdminStudioStageShell — dashboard/ca… | Ai Orchestrator Room™ | Creative Direction Studio™ | Story Table Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/recent-generations | unclassified | Recent Generations Room™ | Creative Direction Studio™ | Story Table Wing™ | 35% | $$$ | M | P1 |
| /admin/studio/distribution-engine | scrollable AdminStudioStageShell — dashboard/ca… | Distribution Engine Room™ | Headquarters™ | Distribution Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/distribution-network | scrollable AdminStudioStageShell — dashboard/ca… | Distribution Command Bridge™ | Headquarters™ | Distribution Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/campaign-orchestrator | scrollable AdminStudioStageShell — dashboard/ca… | Campaign Orchestrator Room™ | Headquarters™ | Distribution Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/publishing-queue | scrollable AdminStudioStageShell — dashboard/ca… | Publishing Queue Room™ | Headquarters™ | Distribution Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/calendar | unclassified | Calendar Room™ | Headquarters™ | Distribution Headquarters™ | 35% | $$$ | M | P1 |
| /admin/studio/social-accounts | scrollable AdminStudioStageShell — dashboard/ca… | Social Accounts Room™ | Headquarters™ | Distribution Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/scheduled | unclassified | Scheduled Room™ | Headquarters™ | Distribution Headquarters™ | 35% | $$$ | M | P1 |
| /admin/studio/legacy-system | scrollable AdminStudioStageShell — dashboard/ca… | Legacy System Room™ | Studio Archives™ | Museum Wing™ | 20% | $$$ | M | P1 |
| `${p(legacy-system/museum)}?tab=archives` | unclassified | Legacy Archives Room™ | Studio Archives™ | Museum Wing™ | 35% | $$$ | M | P1 |
| `${p(legacy-system/museum)}?tab=hall-of-fame` | unclassified | Legacy Hall Of Fame Room™ | Studio Archives™ | Museum Wing™ | 35% | $$$ | M | P1 |
| `${p(legacy-system/museum)}?tab=vault` | unclassified | Legacy Vault Of Firsts Room™ | Studio Archives™ | Museum Wing™ | 35% | $$$ | M | P1 |
| /admin/studio/campaign-engine | scrollable AdminStudioStageShell — dashboard/ca… | Campaign Engine Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/work-orchestration | scrollable AdminStudioStageShell — dashboard/ca… | Work Orchestration Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/director-mode | scrollable AdminStudioStageShell — dashboard/ca… | Director Mode Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/production-builder | scrollable AdminStudioStageShell — dashboard/ca… | Production Builder Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/production-studio | scrollable AdminStudioStageShell — dashboard/ca… | Production Studio Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/render-queue | scrollable AdminStudioStageShell — dashboard/ca… | Render Queue Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/screening-room | scrollable AdminStudioStageShell — dashboard/ca… | Screening Room Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/concierge-approval-flow | scrollable AdminStudioStageShell — dashboard/ca… | Concierge Approval Flow Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/content-packs | scrollable AdminStudioStageShell — dashboard/ca… | Content Packs Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/production | scrollable AdminStudioStageShell — dashboard/ca… | Production Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/ai-production-engine | scrollable AdminStudioStageShell — dashboard/ca… | Ai Production Engine Room™ | Headquarters™ | Operations Headquarters™ | 20% | $$$ | M | P1 |
| /admin/studio/drafts | unclassified | Drafts Room™ | Headquarters™ | Operations Headquarters™ | 35% | $$$ | M | P1 |
| /admin/studio/asset-director | scrollable AdminStudioStageShell — dashboard/ca… | Asset Director Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/blueprint-manager | scrollable AdminStudioStageShell — dashboard/ca… | Blueprint Manager Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/asset-factory | scrollable AdminStudioStageShell — dashboard/ca… | Asset Factory Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/studio-lot | scrollable AdminStudioStageShell — dashboard/ca… | Studio Lot Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/talent-agency | scrollable AdminStudioStageShell — dashboard/ca… | Talent Agency Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/casting | scrollable AdminStudioStageShell — dashboard/ca… | Casting Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/brand-assets | scrollable AdminStudioStageShell — dashboard/ca… | Brand Assets Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/asset-library | scrollable AdminStudioStageShell — dashboard/ca… | Asset Library Room™ | Studio Archives™ | Warehouse Wing™ | 20% | $$$ | M | P1 |
| /admin/studio/world/archives | unclassified | Studio Warehouse Room™ | Studio Archives™ | Warehouse Wing™ | 35% | $$$ | M | P1 |
| /admin/studio/world/archives?zone=museum-wing | unclassified | Studio Museum Room™ | Studio Archives™ | Warehouse Wing™ | 35% | $$$ | M | P1 |
| /admin/studio/studio-institute | scrollable AdminStudioStageShell — dashboard/ca… | Studio Institute Academy™ | Headquarters™ | Knowledge Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/strategy-engine | scrollable AdminStudioStageShell — dashboard/ca… | Strategy Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/reader-graph | scrollable AdminStudioStageShell — dashboard/ca… | Reader Graph Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/relationship-engine | scrollable AdminStudioStageShell — dashboard/ca… | Relationship Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/creator-marketplace | scrollable AdminStudioStageShell — dashboard/ca… | Creator Marketplace Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/ecosystem-marketplace | scrollable AdminStudioStageShell — dashboard/ca… | Commerce Pavilion™ | Studio Archives™ | Marketplace Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/knowledge-asset-engine | scrollable AdminStudioStageShell — dashboard/ca… | Knowledge Asset Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/knowledge-hub | scrollable AdminStudioStageShell — dashboard/ca… | Knowledge Library™ | Headquarters™ | Knowledge Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/memory-bible | scrollable AdminStudioStageShell — dashboard/ca… | Memory Bible Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/leadership-dna | scrollable AdminStudioStageShell — dashboard/ca… | Leadership Dna Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/tutorial-os | scrollable AdminStudioStageShell — dashboard/ca… | Tutorial Os Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/intelligence-engine | scrollable AdminStudioStageShell — dashboard/ca… | Intelligence Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/design-genome | scrollable AdminStudioStageShell — dashboard/ca… | Design Genome Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/audience-brain | scrollable AdminStudioStageShell — dashboard/ca… | Audience Brain Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/growth-network | scrollable AdminStudioStageShell — dashboard/ca… | Growth Network Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/labs | scrollable AdminStudioStageShell — dashboard/ca… | Labs Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/ai-media-network | scrollable AdminStudioStageShell — dashboard/ca… | Ai Media Network Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/ndxbook | scrollable AdminStudioStageShell — dashboard/ca… | Ndxbook Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/talent-network | scrollable AdminStudioStageShell — dashboard/ca… | Talent Network Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/marketplace | scrollable AdminStudioStageShell — dashboard/ca… | Commerce Pavilion™ | Studio Archives™ | Marketplace Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/business-model-engine | scrollable AdminStudioStageShell — dashboard/ca… | Business Model Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/ecosystem | scrollable AdminStudioStageShell — dashboard/ca… | Ecosystem Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/profession-brain | scrollable AdminStudioStageShell — dashboard/ca… | Profession Brain Library™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/expert-marketplace | scrollable AdminStudioStageShell — dashboard/ca… | Expert Marketplace Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/knowledge-commerce | scrollable AdminStudioStageShell — dashboard/ca… | Knowledge Commerce Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/professional-trust-framework | scrollable AdminStudioStageShell — dashboard/ca… | Professional Trust Framework Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/organization-genome | scrollable AdminStudioStageShell — dashboard/ca… | Organization Genome Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/memory-engine | scrollable AdminStudioStageShell — dashboard/ca… | Memory Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/wisdom-capture | scrollable AdminStudioStageShell — dashboard/ca… | Wisdom Capture Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/shadow-mode | scrollable AdminStudioStageShell — dashboard/ca… | Shadow Mode Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/organization-digital-twin | unclassified | Organization Digital Twin Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/business-simulation-lab | unclassified | Business Simulation Lab Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/knowledge-confidence | unclassified | Knowledge Confidence Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/legacy-vault | unclassified | Legacy Vault Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/ambient-awareness | unclassified | Ambient Awareness Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/anticipation-engine | unclassified | Anticipation Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/founder-cognitive-load | unclassified | Founder Cognitive Load Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/presence-engine | unclassified | Presence Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/cross-organization-intelligence | unclassified | Cross Organization Intelligence Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/relationship-memory | unclassified | Relationship Memory Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/predictive-organization | unclassified | Predictive Organization Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/autonomous-preparation | unclassified | Autonomous Preparation Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/organizational-consciousness | unclassified | Organizational Consciousness Room™ | Headquarters™ | Intelligence Headquarters™ | 35% | $$$ | L | P2 |
| /admin/studio/world-knowledge-engine | scrollable AdminStudioStageShell — dashboard/ca… | World Knowledge Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/founder-operating-system | scrollable AdminStudioStageShell — dashboard/ca… | Founder Operating System Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/innovation-lab | scrollable AdminStudioStageShell — dashboard/ca… | Innovation Lab Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/organization-operating-manual | scrollable AdminStudioStageShell — dashboard/ca… | Organization Operating Manual Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/legacy-network | scrollable AdminStudioStageShell — dashboard/ca… | Legacy Network Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/studio-intelligence-architecture | scrollable AdminStudioStageShell — dashboard/ca… | Studio Intelligence Architecture Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/model-orchestrator | scrollable AdminStudioStageShell — dashboard/ca… | Model Orchestrator Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/studio-foundation-models | scrollable AdminStudioStageShell — dashboard/ca… | Studio Foundation Models Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/knowledge-registry | scrollable AdminStudioStageShell — dashboard/ca… | Knowledge Registry Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/documentation-governance | scrollable AdminStudioStageShell — dashboard/ca… | Documentation Governance Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/system-registry | scrollable AdminStudioStageShell — dashboard/ca… | Systems Dock™ | Executive Operations Headquarters™ | Operations Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/component-registry | scrollable AdminStudioStageShell — dashboard/ca… | Component Registry Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/design-token-engine | scrollable AdminStudioStageShell — dashboard/ca… | Design Token Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/interaction-engine | scrollable AdminStudioStageShell — dashboard/ca… | Interaction Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/event-bus | scrollable AdminStudioStageShell — dashboard/ca… | Event Bus Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/automation-registry | scrollable AdminStudioStageShell — dashboard/ca… | Automation Registry Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/prompt-registry | scrollable AdminStudioStageShell — dashboard/ca… | Prompt Registry Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/policy-engine | scrollable AdminStudioStageShell — dashboard/ca… | Policy Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/permission-engine | scrollable AdminStudioStageShell — dashboard/ca… | Permission Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/workspace-runtime | scrollable AdminStudioStageShell — dashboard/ca… | Workspace Runtime Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/plugin-sdk | scrollable AdminStudioStageShell — dashboard/ca… | Plugin Sdk Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/workflow-engine | scrollable AdminStudioStageShell — dashboard/ca… | Workflow Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/state-engine | scrollable AdminStudioStageShell — dashboard/ca… | State Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/asset-registry | scrollable AdminStudioStageShell — dashboard/ca… | Asset Registry Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/experience-engine | scrollable AdminStudioStageShell — dashboard/ca… | Experience Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/qa-headquarters | scrollable AdminStudioStageShell — dashboard/ca… | Infrastructure Observatory™ | Executive Operations Headquarters™ | System Health Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/qa-inspector | scrollable AdminStudioStageShell — dashboard/ca… | Qa Inspector Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/qa-simulation-engine | scrollable AdminStudioStageShell — dashboard/ca… | Qa Simulation Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/ai-red-team | scrollable AdminStudioStageShell — dashboard/ca… | Ai Red Team Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/executive-trust-dashboard | scrollable AdminStudioStageShell — dashboard/ca… | Executive Trust Dashboard Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/time-machine | scrollable AdminStudioStageShell — dashboard/ca… | Time Machine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/predictive-qa | scrollable AdminStudioStageShell — dashboard/ca… | Predictive Qa Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/self-healing-engine | scrollable AdminStudioStageShell — dashboard/ca… | Self Healing Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/decision-audit | scrollable AdminStudioStageShell — dashboard/ca… | Decision Audit Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/confidence-engine | scrollable AdminStudioStageShell — dashboard/ca… | Confidence Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/organizational-guardian | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Guardian Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/design-compliance-engine | scrollable AdminStudioStageShell — dashboard/ca… | Design Compliance Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/prompt-qa | scrollable AdminStudioStageShell — dashboard/ca… | Prompt Qa Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/experience-qa | scrollable AdminStudioStageShell — dashboard/ca… | Experience Qa Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/visual-diff-engine | scrollable AdminStudioStageShell — dashboard/ca… | Visual Diff Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/accessibility-auditor | scrollable AdminStudioStageShell — dashboard/ca… | Accessibility Auditor Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/performance-monitor | scrollable AdminStudioStageShell — dashboard/ca… | Infrastructure Observatory™ | Executive Operations Headquarters™ | System Health Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/regression-engine | scrollable AdminStudioStageShell — dashboard/ca… | Regression Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/release-readiness | scrollable AdminStudioStageShell — dashboard/ca… | Release Readiness Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/engineering-excellence-dashboard | scrollable AdminStudioStageShell — dashboard/ca… | Infrastructure Observatory™ | Executive Operations Headquarters™ | System Health Wing™ | 20% | $$$ | L | P2 |
| /admin/studio/identity-graph | scrollable AdminStudioStageShell — dashboard/ca… | Identity Graph Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/professional-profile | scrollable AdminStudioStageShell — dashboard/ca… | Professional Profile Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/skill-graph | scrollable AdminStudioStageShell — dashboard/ca… | Skill Graph Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/role-intelligence | scrollable AdminStudioStageShell — dashboard/ca… | Role Intelligence Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/organizational-hierarchy | scrollable AdminStudioStageShell — dashboard/ca… | Organizational Hierarchy Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/identity-timeline | scrollable AdminStudioStageShell — dashboard/ca… | Identity Timeline Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/succession-mode | scrollable AdminStudioStageShell — dashboard/ca… | Succession Mode Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/governance | scrollable AdminStudioStageShell — dashboard/ca… | Governance Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/studio-intelligence | scrollable AdminStudioStageShell — dashboard/ca… | Studio Intelligence Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/simulation-engine | scrollable AdminStudioStageShell — dashboard/ca… | Simulation Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/vision-engine | scrollable AdminStudioStageShell — dashboard/ca… | Vision Engine Room™ | Headquarters™ | Intelligence Headquarters™ | 20% | $$$ | L | P2 |
| /admin/studio/business-discovery-blueprint | scrollable AdminStudioStageShell — dashboard/ca… | Business Discovery Expedition™ | Expedition Hub™ | Discovery Atrium™ | 20% | $$$ | M | P2 |
| /admin/studio/organization-inauguration | scrollable AdminStudioStageShell — dashboard/ca… | Organization Inauguration Room™ | Executive Operations Headquarters™ | Systems Dock™ | 20% | $$$ | M | P2 |
| /admin/studio/world/expedition-hub | unclassified | Expansion Center Atrium™ | Expedition Hub™ | Discovery Atrium™ | 35% | $$$ | M | P2 |
| /admin/studio-os | unclassified | Workspace Settings Room™ | Executive Operations Headquarters™ | Systems Dock™ | 35% | $$$ | M | P2 |
| /admin/studio/content-brain/brand-brain | unclassified | Brand Config Room™ | Executive Operations Headquarters™ | Systems Dock™ | 35% | $$$ | M | P2 |
| /admin/studio-os | unclassified | Platform Settings Room™ | Executive Operations Headquarters™ | Systems Dock™ | 35% | $$$ | M | P2 |

> **Machine-readable source:** `src/studio-os-core/studio-world/migration-audit.ts` — `STUDIO_WORLD_MIGRATION_AUDIT` + `getMigrationAuditSummary()`.


---

## Appendix B — Unmapped Routes (137 pages without registry entry)

Any `page.tsx` not in `STUDIO_WORLD_ROUTE_REGISTRY` (76 entries) still resolves via:

1. Longest-prefix world path match  
2. Flagship entry fallback  
3. Campus Map Atrium (`/admin/studio/overview`)

**Action:** Extend registry as each room ships — target 191/191 mapped before V5 complete.

---

## Appendix C — References

| Artifact | Path |
|----------|------|
| V4 architectural law | `docs/studio-os/STUDIO_WORLD_ARCHITECTURE_V4.md` |
| Route registry | `src/studio-os-core/studio-world/route-registry.ts` |
| Feature lexicon | `src/studio-os-core/studio-world/feature-lexicon.ts` |
| Command Center room (current) | `src/components/admin/studio/command-center/StudioCommandCenterRoom.tsx` |
| Webpage shell (forbidden default) | `src/components/admin/studio/AdminStudioStageShell.tsx` |
| Nav module directory | `src/utils/adminStudioNavigation.ts` |
| Migration audit (V5) | `src/studio-os-core/studio-world/migration-audit.ts` |

---

*End of Studio World™ V5 Architecture Migration Report*
