# Experience Studio™ — Canonical Product Specification

**Product ID:** `experience-studio`  
**Version:** 1.0.0-spec  
**Status:** Awaiting Approval  
**Authority:** Golden Product™ · Reference Implementation™  
**Date:** 2026-07-07  
**Governance:** Product Starter Pack v2.0.0 · Design Governance v1.0.0

---

> **Experience Studio™ is an AI Creative Operating System — not a website builder.**  
> Users collaborate with an elite Creative Director. They never edit HTML or drag random widgets.

---

## Table of Contents

| § | Section |
|---|---------|
| §1 | Product Vision |
| §2 | Product Philosophy |
| §3 | User Experience (End-to-End) |
| §4 | User Journey Maps |
| §5 | Information Architecture |
| §6 | Screen Inventory |
| §7 | Design Application |
| §8 | Design DNA™ |
| §9 | Experience DNA™ |
| §10 | Workspace DNA™ |
| §11 | AI Creative Director™ |
| §12 | Interaction Model |
| §13 | Motion · Remix · Iteration |
| §14 | Reference Implementation™ |
| §15 | Golden Product™ |
| §16 | Technical Architecture |
| §17 | Data Model |
| §18 | Publishing & Experience Management |

---

## §1 — Product Vision

### Mission

> **Eliminate traditional page builders.** Replace them with an intelligent, collaborative experience creation environment where every organization authors world-class digital experiences through conversation, creative direction, and governed design — not technical configuration.

### Vision

Within three years, Experience Studio™ is the **default way** organizations create every customer-facing and internal digital experience — from websites to stores to portals to apps — inside Studio OS. Users describe intent; Studio Intelligence™ assembles professional results. The builder inspires confidence. The output inspires customers.

### Purpose

Experience Studio™ exists to:

1. **Prove** the Studio OS thesis — Organizational Intelligence Platform, not SaaS dashboard
2. **Validate** Design Governance, Product Operating Procedure, and Reference Implementation patterns
3. **Replace** page-builder mental models with **experience authoring**
4. **Unify** design, brand, technology, marketing, and accessibility in one creative environment
5. **Generate** publishable experiences across 13+ experience types

### Product Philosophy (Summary)

See §2 for full principles. Core belief: **Design experiences — not pages.**

### Design Ethics

| Ethic | Rule |
|-------|------|
| **Agency** | Users own their work — AI proposes, never silently mutates |
| **Accessibility** | WCAG 2.2 AA minimum — not a post-launch patch |
| **Honesty** | AI explains recommendations — no black-box design |
| **Restraint** | Premium default — no decoration theater |
| **Inclusion** | Life & Culture Preferences™ respected — no assumptions |
| **Governance** | Design canon inherited — organizational atmosphere within bounds |
| **Transparency** | Confidence levels visible — escalation paths clear |

### Target Audience

| Segment | Role | Need |
|---------|------|------|
| **Founders & executives** | Decision makers | Brand presence without agency dependency |
| **Creative directors** | Quality owners | Governed creative control at scale |
| **Marketing leaders** | Campaign owners | Landing pages · stores · portals fast |
| **Operations managers** | Internal tools | Dashboards · portals · booking without IT backlog |
| **Studio OS administrators** | Platform owners | Reference Implementation validation |

### Personas

#### Persona 1 — Executive Founder (Primary)

| Attribute | Detail |
|-----------|--------|
| **Name** | Alexandra · salon empire founder |
| **Goal** | Launch premium website + booking without learning Webflow |
| **Frustration** | Agencies expensive · DIY builders feel cheap |
| **Studio context** | Enters from HQ Creative Wing · expects ceremony |
| **Success** | Published experience in one session · proud to share |

#### Persona 2 — Creative Director (Primary)

| Attribute | Detail |
|-----------|--------|
| **Name** | Marcus · agency creative lead |
| **Goal** | Maintain brand canon while moving fast |
| **Frustration** | Developers interpret designs wrong |
| **Success** | Design DNA™ enforces canon · Remix™ iterates in seconds |

#### Persona 3 — Marketing Operator (Secondary)

| Attribute | Detail |
|-----------|--------|
| **Name** | Priya · growth marketer |
| **Goal** | Landing pages for campaigns · fast iteration |
| **Frustration** | Waiting on engineering for every A/B variant |
| **Success** | Remix™ + publish pipeline without code |

#### Anti-Personas

| Anti-Persona | Why not |
|--------------|---------|
| **Full-stack developer** | Wants raw HTML/CSS control — use external tools |
| **WordPress power user** | Expects plugin ecosystem — not our model |
| **Template-only user** | Wants zero creative input — too passive for our philosophy |

### Business Value

| Value | Mechanism |
|-------|-----------|
| **Reduced agency spend** | AI Creative Director™ replaces partial agency work |
| **Faster time-to-market** | Interview → canvas → publish in one environment |
| **Brand consistency** | Design DNA™ + Design Genome™ enforce canon |
| **Platform stickiness** | Experiences authored inside HQ — not exported |
| **OS proof** | Reference Implementation drives Studio OS adoption |

### Competitive Landscape

#### What We Are NOT

| Product / Pattern | Rejection rationale |
|-------------------|---------------------|
| **WordPress / Wix / Squarespace** | Page-builder mental model · plugin chaos · SaaS gray |
| **Webflow** | Technical complexity masquerading as visual |
| **Framer** | Designer-tool isolation — not organizational intelligence |
| **Figma-only workflows** | Design without governed publish pipeline |
| **Shopify theme editors** | Commerce-first · not experience-first |
| **Generic AI site generators** | No governance · no DNA · no HQ integration |

#### Differentiators

| Differentiator | Studio OS expression |
|----------------|---------------------|
| **Conversation before configuration** | Orb · Director · interview — not settings panels |
| **Design DNA™ blending** | 70/20/10 personality mix — not theme picker |
| **Governed component canon** | `comp-*` catalog — not widget marketplace |
| **HQ integration** | Creative Wing environment — not standalone app |
| **Multidisciplinary AI** | Creative Director + SEO + A11y + perf in one |
| **Experience types** | 13+ outputs — not "websites only" |
| **Reference Implementation** | Validates entire OS — not isolated product |

### Problems Solved

| Problem | Solution |
|---------|----------|
| Page builders overwhelm non-technical users | Interview + AI direction |
| Agencies are slow and expensive | AI Creative Director™ + Remix™ |
| Brand inconsistency across surfaces | Design DNA™ + Design Genome™ |
| Design-dev handoff breaks intent | Visual authoring with governed components |
| Accessibility is afterthought | A11y Consultant in AI team · Design Health™ |
| Marketing needs speed without risk | Remix™ + version history + approval gates |

### Success Metrics

| Metric | Baseline | Target (12 mo) | Measurement |
|--------|----------|----------------|-------------|
| Time to first publish | — | <60 min (guided) | Session analytics |
| Interview completion rate | — | ≥85% | Funnel |
| Design Health™ score at publish | — | ≥85 avg | Design Health™ |
| Remix™ usage per project | — | ≥3 iterations | Event tracking |
| AI proposal acceptance rate | — | ≥60% | Conversation Engine™ |
| Experience types used | — | ≥3 per org | Project metadata |
| Reference Implementation coverage | — | 100% governance artifacts exercised | Audit checklist |
| User confidence score (survey) | — | ≥4.5/5 | Post-session |

### North Star Metric

> **Published experiences per organization per quarter** that score Design Health™ PASS on first publish.

### Emotional Goals

| Emotion | Design lever | Anti-goal |
|---------|--------------|-----------|
| **Calm confidence** | White space · slow motion · Director tone | Anxiety · urgency theater |
| **Creative possibility** | Open canvas · Remix™ glow | Clutter · constraint |
| **Premium trust** | Marble · glass · editorial type | Cheap novelty |
| **Collaborative warmth** | AI explains · teaches | Robotic commands |
| **Executive clarity** | Metadata discipline · hierarchy | Dashboard noise |
| **Pride** | Publish ceremony · quality default | Shame · "good enough" |

**Reference:** [Design Language System™](../../design/DESIGN_LANGUAGE_SYSTEM.md) §2

### AI Philosophy

| Principle | Experience Studio expression |
|-----------|------------------------------|
| Intelligence as presence | Director dock · Orb — not sidebar chatbot |
| Human agency | Accept/reject every structural change |
| Teach don't tell | "Why?" explanations · alternatives offered |
| Confidence visible | Proposal strength indicated |
| Never silent mutation | All changes previewed |
| Multidisciplinary | One Director · many expert lenses |

### Future Opportunities

| Opportunity | Horizon |
|-------------|---------|
| Real-time collaboration | Multi-user canvas · presence |
| XR authoring | Spatial experience types |
| Marketplace templates | Creator Marketplace™ integration |
| Cross-org experience sharing | Multi-Organization Network™ |
| Voice-first authoring | Voice Mode™ full integration |
| Automated SEO + perf optimization | AI Performance Engineer |
| Experience analytics wing | HQ analytics integration |
| API-published headless experiences | Developer platform |

### Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Raw HTML/CSS editor | Violates philosophy — conversation before configuration |
| Plugin marketplace | Component canon governed via VDR |
| WordPress migration tool | Not our mental model (Phase 1) |
| General-purpose IDE | Studio OS product · not developer tool |
| Unrestricted AI generation | Governance gates required |
| White-label page builder reseller | OS extension · not standalone SaaS |

### Failure Conditions

| Condition | Consequence |
|-----------|-------------|
| Users feel they are "building pages" | Philosophy failure — redesign onboarding |
| AI silently changes published content | Trust failure — block launch |
| Design Health™ FAIL at scale | Governance failure — VDR required |
| Experience types feel identical | DNA system failure |
| Publish pipeline unreliable | Golden Product status revoked |
| Reference Implementation checklist incomplete | Blocks other flagship products |

---

## §2 — Product Philosophy

### Guiding Principles

| # | Principle | Expression |
|---|-----------|------------|
| 1 | **Design experiences — not pages** | Experience Type selection · narrative structure |
| 2 | **Conversation before configuration** | Interview · Director · dialogue precedes forms |
| 3 | **Visual before technical** | Canvas-first · inspect on demand |
| 4 | **AI augments creativity** | Proposes · teaches · never replaces ownership |
| 5 | **Simplicity through intelligence** | Complexity hidden · power revealed progressively |
| 6 | **Professional results without expertise** | Governed defaults · DNA blending |
| 7 | **Reduce cognitive load** | One primary action per moment |
| 8 | **Hide complexity until needed** | Inspectors dock · advanced in command palette |
| 9 | **Premium quality by default** | Design Health™ floor · luxury materials |
| 10 | **Inspire confidence** | Ceremonial entry · calm motion · clear undo |
| 11 | **Places over panels** | Creative Wing environment · not admin chrome |
| 12 | **Remix is iteration** | Fast exploration without commitment anxiety |
| 13 | **Governance enables speed** | Canon prevents decision fatigue |
| 14 | **Reference Implementation discipline** | Every capability proves the OS |

### Alignment with Studio Constitution™

| Constitution principle | Experience Studio proof |
|------------------------|--------------------------|
| Organizational Intelligence Platform | AI Creative Director™ multidisciplinary team |
| Registry-driven objects | Projects · experiences · assets in System Registry™ |
| Premium immersive UX | Marble · glass · Creative Wing |
| Life & Culture Preferences™ | Interview respects culture · no assumptions |

---

## §3 — User Experience (End-to-End)

### 3.1 Onboarding

| Step | Experience | Component |
|------|------------|-----------|
| HQ arrival | User enters Creative Wing from Headquarters™ | Environmental storytelling |
| First visit | Orb Awakening optional · Director welcomes | `comp-studio-orb` |
| Capability intro | 30-second narrative — "not a page builder" | `comp-floating-panel` |
| Skip path | Returning users → project list directly | `comp-tabs` |

**Empty state:** Marble environment · single invitation card · no blank grid.

### 3.2 Workspace Entry

| Entry point | Context loaded |
|-------------|----------------|
| HQ Creative Wing | Org Design Genome™ · recent projects |
| Orb command | "Open Experience Studio" · last project |
| Deep link | `/admin/studio/experience-studio/{projectId}` |
| Notification | "Your experience is ready to review" |

### 3.3 Project Creation

```
Select Experience Type (13 cards)
    ↓
Interview (style · audience · feeling) — skippable for returning users
    ↓
Design DNA™ blend suggested from interview
    ↓
Canvas generated — Director narrates choices
    ↓
Builder workspace
```

### 3.4 AI Conversation Flow

See §11. Summary: every structural change flows through Director dialogue with accept/reject.

### 3.5 Canvas Interactions

| Action | Behavior |
|--------|----------|
| Click section | Select · inspector docks |
| Double-click text | `comp-editor-inline` |
| Drag section | Reorder with snap · undo available |
| Hover | Subtle affordance — not noisy handles |
| Right-click | `comp-context-menu` |
| Ask Director | Select + Orb or dock |

**Canvas occupies ≥85% viewport** on desktop.

### 3.6 Visual Editing

- Inline text editing
- Inspector for properties (spacing, emphasis — not raw CSS)
- Design DNA™ changes reflect live on canvas
- Experience DNA™ sliders update motion/glass/density

### 3.7 Design Iteration

| Method | Speed | Commitment |
|--------|-------|------------|
| Director dialogue | Medium | Per-proposal |
| Inspector tweaks | Fast | Immediate with undo |
| Remix™ chips | Instant | Preview before apply |
| Design DNA™ blend | Fast | Live canvas update |

### 3.8 Remix™ Workflow

1. User selects Remix™ chip (e.g., "More Luxury")
2. Canvas previews transformation — not committed
3. Director explains what changed
4. Accept · Try another · Revert

### 3.9 Collaboration (Future Phase)

| Feature | Phase |
|---------|-------|
| Comments on sections | v1.1 |
| Real-time co-editing | v2.0 |
| Approval workflows | v1.2 |
| Role-based edit locks | v1.1 |

### 3.10 Version History

| Capability | Detail |
|------------|--------|
| Auto-save | Every 30s · on blur |
| Named versions | User-created checkpoints |
| Compare | Side-by-side preview |
| Restore | One-click with confirmation |
| Audit | Who · when · what (AI vs human) |

### 3.11 Publishing

```
Draft → Preview → Design Health™ gate → Review (optional) → Publish → Live URL
```

| Gate | Requirement |
|------|-------------|
| Preview | Channel-appropriate |
| Design Health™ | ≥70 Preview · ≥85 Stable |
| Accessibility | No critical issues |
| Founder approval | Required for first org publish (configurable) |

### 3.12 Site / Experience Management

| Capability | Detail |
|------------|--------|
| Project list | All experiences by type · status |
| Duplicate | Fork with new DNA blend |
| Archive | Soft delete · restorable |
| Analytics link | Post-publish HQ widget |

### 3.13 Asset Management

| Asset type | Source |
|------------|--------|
| Images | Org media library · upload |
| Video | Embed · hosted |
| Brand assets | Design Genome™ |
| Templates | Template gallery |

### 3.14 Templates

| Template tier | Source |
|---------------|--------|
| Studio canon | Governed · Design Health™ pre-scored |
| Org saved | From published experiences |
| Industry | Profession Pack System™ (future) |
| AI generated | Director proposal · user save |

### 3.15 Design DNA™ · Experience DNA™ · Workspace DNA™

See §8 · §9 · §10.

### 3.16 AI Memory

| Scope | Content | Control |
|-------|---------|---------|
| Session | Current project context | Clears on exit |
| Project | Preferences · rejected proposals | Per-project |
| Org | Brand · tone · industry | HQ settings |
| Cross-session | Director learns preferences | Opt-in · exportable |

### 3.17 Exit Experience

| Exit | Behavior |
|------|----------|
| Save & return HQ | Ceremonial transition · project saved |
| Publish complete | Celebration subtle · analytics link |
| Abandon | Confirm · draft preserved |

### 3.18 Edge Cases

| Case | Behavior |
|------|----------|
| AI unavailable | Graceful degrade · manual editing full |
| Offline | Local draft · sync on reconnect |
| Large project | Virtualized canvas · lazy sections |
| Permission denied | Explain role · suggest admin |
| DNA conflict | Director explains tradeoff |
| Concurrent edit (future) | Lock notification |

### 3.19 Empty States

| State | Treatment |
|-------|-----------|
| No projects | Experience type cards · Director invitation |
| Empty canvas | Suggested first section from Director |
| No assets | Upload prompt · stock suggestion |
| No templates | "Start with interview" path |

### 3.20 Loading States

| State | Treatment |
|-------|-----------|
| Canvas generation | `comp-progress-system` · Director narrates |
| AI thinking | Orb presence · dock typing indicator |
| Publish | Progress pipeline · cancel safe |
| Asset upload | Inline progress · retry |

### 3.21 Error States

| Error | Message | Recovery |
|-------|---------|----------|
| Save failed | "Draft preserved locally" | Retry · export |
| Publish failed | Specific reason | Fix · retry |
| AI timeout | "Director needs a moment" | Retry · manual |
| Validation | Inline · Director explains | Guided fix |

### 3.22 Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard | Full workflow · command palette |
| Screen reader | Landmarks · live regions for AI |
| Contrast | AA on glass — per Design Language |
| Motion | `prefers-reduced-motion` |
| Touch | 44px targets · bottom sheets mobile |
| Cognitive | One primary action · plain language |

### 3.23 Success States

| Success | Treatment |
|---------|-----------|
| First section added | Subtle glow · Director encouragement |
| Interview complete | Transition ceremony |
| Design Health™ PASS | Score reveal · pride moment |
| Publish | Quiet celebration · share link |

---

## §4 — User Journey Maps

### Journey 1 — First-Time Founder (Happy Path)

```
HQ Creative Wing → Orb welcome → Experience type (Website)
    → Interview (Luxury · Hair Brand · Inspired)
    → Design DNA™ suggested (70/20/10)
    → Canvas generated → Director explains
    → Edit headline inline → Remix "More Editorial"
    → Accept → Design Health™ preview
    → Publish → Live URL → Return HQ
```

| Step | Emotion | AI role |
|------|---------|---------|
| Arrival | Wonder | Welcome narrative |
| Interview | Curiosity | Clarifying questions |
| Canvas reveal | Delight | Explains choices |
| Remix | Playfulness | Explains diff |
| Publish | Pride | Confirms quality |

### Journey 2 — Creative Director (Iteration Path)

```
Open existing project → Version history
    → Adjust Design DNA™ blend
    → Director critiques hierarchy
    → Inspector fine-tune
    → Design Health™ 92 → Publish update
```

### Journey 3 — Recovery (AI Failure)

```
Director timeout mid-proposal
    → "Continue manually" prompt
    → Inspector available
    → Retry Director
    → Resume thread from timeline
```

### Journey 4 — Exit Without Publish

```
Edit session → Save auto → Return HQ
    → Draft in project list
    → Notification next day "Continue your experience"
```

---

## §5 — Information Architecture

### Navigation Structure

```
Experience Studio™
├── Projects (default)
│   ├── Active
│   ├── Drafts
│   └── Archived
├── Create (+ Experience Type entry)
├── Templates
├── Assets
├── Published
│   └── Analytics links
└── Settings (product-scoped only)
    ├── Default DNA preferences
    ├── Publish defaults
    └── AI memory preferences
```

### Routes

| Route | Screen | Auth |
|-------|--------|------|
| `/admin/studio/experience-studio` | Project list / entry | required |
| `/admin/studio/experience-studio/new` | Experience type selection | required |
| `/admin/studio/experience-studio/new/{type}` | Interview | required |
| `/admin/studio/experience-studio/{projectId}` | Workspace | required |
| `/admin/studio/experience-studio/{projectId}/publish` | Publish pipeline | required |
| `/admin/studio/experience-studio/{projectId}/versions` | Version history | required |
| `/admin/studio/experience-studio/assets` | Asset library | required |
| `/admin/studio/experience-studio/templates` | Template gallery | required |

**Note:** Current implementation uses `/admin/studio/digital-architect` — migration to `experience-studio` route planned (see Implementation Readiness).

### Objects

| Object ID | Name | Registry |
|-----------|------|----------|
| `es-project` | Experience Project | System Registry™ |
| `es-experience` | Published Experience | System Registry™ |
| `es-asset` | Media Asset | System Registry™ |
| `es-template` | Experience Template | System Registry™ |
| `es-version` | Version Snapshot | System Registry™ |
| `es-dna-profile` | DNA Blend Profile | Design Genome™ |

### Relationships

```
Organization (1) ──→ (N) Projects
Project (1) ──→ (1) Experience Type
Project (1) ──→ (N) Versions
Project (1) ──→ (N) Assets
Project (1) ──→ (1) DNA Profile
Published Experience (1) ──→ (1) Project
Template (N) ──→ (1) Experience Type
```

### Permissions

| Role | Create | Edit | Publish | Delete | Admin |
|------|--------|------|---------|--------|-------|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Creative Lead | ✓ | ✓ | ✓ | | |
| Editor | | ✓ | | | |
| Viewer | | | | | |
| AI Director | propose | propose | | | |

### Workspaces

Per [Workspace DNA™](#10--workspace-dna) — multi-org isolation via M76.5.

### Future Scalability

| Dimension | Approach |
|-----------|----------|
| 10K+ projects | Pagination · search · archive |
| Multi-region publish | CDN · edge |
| Headless API | Experience document export |
| Marketplace templates | Creator Marketplace™ |
| Collaboration | Real-time layer |

---

## §6 — Screen Inventory

### `scr-es-001` — Experience Entry

| Field | Value |
|-------|-------|
| **Purpose** | Select experience type · begin creation |
| **Route** | `/admin/studio/experience-studio/new` |
| **Entry** | Projects "+" · HQ wing · Orb |
| **Exit** | Interview (type selected) · Projects (cancel) |
| **Dependencies** | Org profile · Design Genome™ |

**Primary:** Select experience type  
**Secondary:** Browse templates · resume draft  
**AI:** Director suggests type from HQ context  
**Desktop:** 4-column card grid · Orb bottom  
**Tablet:** 2-column grid  
**Mobile:** Single column scroll · bottom sheet detail  
**A11y:** Cards keyboard-selectable · hints as descriptions

---

### `scr-es-002` — Creative Interview

| Field | Value |
|-------|-------|
| **Purpose** | Capture style · audience · feeling intent |
| **Route** | `/admin/studio/experience-studio/new/{type}` |
| **Entry** | Entry screen type selection |
| **Exit** | Workspace (canvas generation) |
| **Dependencies** | Experience type · interview constants |

**Primary:** Complete interview steps  
**Secondary:** Skip (returning users) · ask Director  
**AI:** Clarifying questions per ambiguous answers  
**Desktop:** Centered `comp-floating-panel` · progress top  
**Tablet:** Full-width panel  
**Mobile:** Full-screen steps  
**A11y:** Progress announced · skip link visible

---

### `scr-es-003` — Authoring Workspace (Primary)

| Field | Value |
|-------|-------|
| **Purpose** | Core creative environment |
| **Route** | `/admin/studio/experience-studio/{projectId}` |
| **Entry** | Interview complete · project list |
| **Exit** | Publish · projects · HQ |
| **Dependencies** | Project document · DNA profiles · Conversation Engine™ |

**Primary:** Edit canvas · collaborate with Director  
**Secondary:** Remix™ · DNA panels · assets · versions  
**AI:** Full Creative Director capabilities  
**Desktop:** Canvas 85% · floating docks  
**Tablet:** Stacked · drawer inspector  
**Mobile:** Canvas full · bottom sheet panels  
**A11y:** Focus order canvas → inspector → director

---

### `scr-es-004` — Project List

| Field | Value |
|-------|-------|
| **Purpose** | Manage all experience projects |
| **Route** | `/admin/studio/experience-studio` |
| **Entry** | HQ · nav · Orb |
| **Exit** | Workspace · new project |
| **Dependencies** | Project index |

**Primary:** Open project · create new  
**Secondary:** Archive · duplicate · search  
**AI:** "Continue where you left off" suggestion  
**Desktop:** Table + preview cards  
**Tablet:** Card list  
**Mobile:** Card list · swipe actions  
**A11y:** Sortable table headers · action menus labeled

---

### `scr-es-005` — Asset Library

| Field | Value |
|-------|-------|
| **Purpose** | Manage media assets |
| **Route** | `/admin/studio/experience-studio/assets` |
| **Entry** | Workspace · nav |
| **Exit** | Workspace (asset selected) |
| **Dependencies** | Media storage |

**Primary:** Upload · select asset  
**Secondary:** Delete · organize · search  
**AI:** Suggest crops · alt text  
**Desktop:** Grid + inspector  
**Tablet:** Grid  
**Mobile:** List · upload camera  
**A11y:** Alt text required · upload progress announced

---

### `scr-es-006` — Template Gallery

| Field | Value |
|-------|-------|
| **Purpose** | Browse and apply templates |
| **Route** | `/admin/studio/experience-studio/templates` |
| **Entry** | Entry screen · nav |
| **Exit** | Workspace (template applied) |
| **Dependencies** | Template registry |

**Primary:** Preview · apply template  
**Secondary:** Save as template · filter by type  
**AI:** Recommend template from interview  
**Desktop:** Masonry grid  
**Tablet:** 2-column  
**Mobile:** Single column  
**A11y:** Preview described · apply confirms

---

### `scr-es-007` — Publish Pipeline

| Field | Value |
|-------|-------|
| **Purpose** | Preview · validate · publish experience |
| **Route** | `/admin/studio/experience-studio/{projectId}/publish` |
| **Entry** | Workspace publish action |
| **Exit** | Live URL · workspace · HQ |
| **Dependencies** | Design Health™ · publish service |

**Primary:** Preview · publish  
**Secondary:** Run QA · share preview link  
**AI:** Pre-publish checklist narration  
**Desktop:** Split preview + checklist  
**Tablet:** Tabbed preview/checklist  
**Mobile:** Full preview · checklist sheet  
**A11y:** Checklist items announced · blockers clear

---

### `scr-es-008` — Version History

| Field | Value |
|-------|-------|
| **Purpose** | Review · compare · restore versions |
| **Route** | `/admin/studio/experience-studio/{projectId}/versions` |
| **Entry** | Workspace |
| **Exit** | Workspace (restored) |
| **Dependencies** | Version store |

**Primary:** Compare · restore  
**Secondary:** Name version · export  
**AI:** Summarize changes between versions  
**Desktop:** Timeline + side-by-side  
**Tablet:** Timeline list  
**Mobile:** List · single preview  
**A11y:** Timeline navigable · restore confirms

---

### `scr-es-009` — Product Settings

| Field | Value |
|-------|-------|
| **Purpose** | Product-scoped preferences (not global design) |
| **Route** | `/admin/studio/experience-studio/settings` |
| **Entry** | Nav |
| **Exit** | Previous screen |
| **Dependencies** | Org settings |

**Primary:** Save preferences  
**Secondary:** Reset AI memory  
**AI:** Explain setting implications  
**Desktop:** Form in `comp-inspector-panel`  
**Tablet/Mobile:** Full page form  
**A11y:** Labels · descriptions on all fields

---

## §7 — Design Application

> **This section describes composition and product atmosphere — not a parallel design system.**  
> Global rules inherit from [Studio Design Constitution™](../../design/STUDIO_DESIGN_CONSTITUTION.md).

### Governance Inheritance

| Artifact | Application in Experience Studio |
|----------|----------------------------------|
| **Studio Design Constitution™** | Full compliance · Golden Product validates |
| **Design Language System™** | Creative Wing atmosphere · calm confidence |
| **Component Catalog™** | All chrome via `comp-*` — see COMPONENT_USAGE_MAP.md |
| **Design Registry™** | v1.0.0 declared · compliance row on launch |
| **Design Revision Framework™** | 5 proposed components via VDR-100 series |

### Composition Layout

| Zone | Viewport budget | Component |
|------|-----------------|-----------|
| Environment (marble) | 100% background | HQ Creative Wing continuity |
| Canvas | ≥85% focus area | `comp-canvas` |
| Chrome combined | ≤15% | `comp-toolbar` + metadata |
| Director dock | Right-lower ephemeral | `comp-floating-dock` |
| Orb | Bottom-center | `comp-studio-orb` |

### Product Atmosphere Tokens

Product-scoped tokens (within constitutional bounds):

| Token | Role | Inherits from |
|-------|------|---------------|
| `--es-brand` | Org accent | Design DNA™ / Design Genome™ |
| `--es-studio-red` | Studio OS canon | `token-color` |
| `--es-marble` | Environment | HQ Creative Wing |
| `--es-glass` | Panel fill | `token-glass` |
| `--es-glass-edge` | Borders | `token-glass` |

**Rule:** Tokens express atmosphere — not global canon overrides.

### Design Health™ Targets

| Phase | Target |
|-------|--------|
| Prototype | ≥70 (Preview WARNING acceptable) |
| Launch | ≥85 PASS |
| Golden Product certification | ≥90 sustained |

---

## §8 — Design DNA™

### Purpose

Design DNA™ defines **brand personality** through blendable archetypes — not theme pickers. Studio Intelligence™ generates experiences matching the blend.

### Personality Archetypes

| ID | Label | Character | Typical use |
|----|-------|-----------|-------------|
| `luxury` | Luxury™ | Rich materials · generous space · gold accents | Premium brands |
| `editorial` | Editorial™ | Strong typography · magazine rhythm | Content-first |
| `minimal` | Minimal™ | Restraint · whitespace · precision | Tech · SaaS avoidance |
| `executive` | Executive™ | Authority · clarity · confidence | B2B · professional services |
| `hospitality` | Hospitality™ | Warmth · welcome · service | Hotels · restaurants |
| `organic` | Organic™ | Natural tones · soft shapes | Wellness · eco |
| `interactive` | Interactive™ | Motion · engagement · delight | Campaigns · youth |
| `gaming` | Gaming™ | Energy · depth · dynamic | Entertainment |
| `museum` | Museum™ | Contemplative · archival · spacious | Culture · education |
| `boutique` | Boutique™ | Intimate · curated · personal | Small luxury brands |
| `modern` | Modern™ | Clean lines · Studio red accent | Default Studio |
| `glass` | Glass™ | Transparency · layers · depth | Tech luxury |

### Blending Model

Users distribute **100 points** across personalities:

```
Example: 70% Luxury™ + 20% Editorial™ + 10% Interactive™
```

| Rule | Detail |
|------|--------|
| Minimum per active | 5% |
| Maximum per personality | 80% |
| Active personalities | 1–4 |
| AI suggestion | From interview answers |
| Live preview | Canvas updates on slider change |

### AI Generation Behavior

| Blend | Generated characteristics |
|-------|--------------------------|
| Luxury-dominant | Wide margins · serif display · muted palette |
| Editorial-dominant | Strong hierarchy · pull quotes · grid rhythm |
| Interactive-dominant | Micro-motion · hover states · scroll narrative |

### Integration

| System | Role |
|--------|------|
| Design DNA Canon™ (M84) | Protected customer rooms |
| Design Genome™ (M85) | Org-level persistence |
| Design Token Engine™ | Token resolution |
| Experience Studio resolver | Canvas token mapping |

---

## §9 — Experience DNA™

### Purpose

Experience DNA™ controls **how the experience feels in motion and space** — not brand personality (that's Design DNA™).

### Sliders

| Slider | Low (0) | High (100) | Effect |
|--------|---------|------------|--------|
| **Motion** | Static · calm | Dynamic · energetic | Transition speed |
| **Depth** | Flat | Layered parallax | Z-axis expression |
| **Lighting** | Even · soft | Dramatic · directional | Shadows · highlights |
| **Glass** | Solid panels | Maximum frosted | Material opacity |
| **Animation** | None | Expressive | Entrance · hover |
| **Navigation** | Hidden · minimal | Persistent · guided | Nav visibility |
| **Spatial Density** | Spacious | Information-rich | Content packing |
| **Visual Hierarchy** | Subtle | Bold contrast | Focal emphasis |
| **Storytelling** | Direct | Narrative scroll | Environmental story |
| **Transitions** | Instant | Ceremonial | Phase changes |
| **Interaction** | Passive viewing | Hands-on exploration | Click/hover density |
| **AI Collaboration** | AI-silent | AI-proactive | Suggestion frequency |

### Defaults (New Project)

Aligned with existing implementation constants — starting point moderated by interview.

### Workspace Behavior

| Slider value | Workspace expression |
|--------------|---------------------|
| High glass | More frosted docks · lighter chrome |
| Low density | Canvas breathing room · fewer panels |
| High storytelling | Scroll-linked sections · chapter narrative |

### Environmental Storytelling

High storytelling + High lighting → cinematic entry sequences · chapter-based canvas.

---

## §10 — Workspace DNA™

### Purpose

Workspace DNA™ defines **per-organization experiential genome** — how Studio OS feels for this org across all products.

### Scope

| Layer | Governed by |
|-------|-------------|
| Multi-org isolation | M76.5 Multi-Organization Workspace™ |
| Org visual memory | M85 Design Genome™ |
| Product workspace | Experience Studio session |
| User preferences | Personalization DNA™ (M89.5) |

### Experience Studio Expression

| Aspect | Workspace DNA behavior |
|--------|------------------------|
| Entry ceremony | Org arrival preference (full · skip) |
| Default DNA blend | From Design Genome™ |
| Director tone | Org culture settings |
| Panel layout | Remembered dock positions |
| Template library | Org-scoped + Studio canon |

### Multi-Workspace

Organizations with multiple brands (ecosystem) get isolated project spaces per brand — shared OS canon · separate DNA profiles.

---

## §11 — AI Creative Director™

### Role

Studio Intelligence™ functions as a **multidisciplinary creative team** in one conversational presence.

### Team Lenses

| Role | Responsibility |
|------|----------------|
| **Creative Director** | Overall vision · cohesion · narrative |
| **Art Director** | Visual composition · hierarchy |
| **UX Designer** | Flow · usability · cognitive load |
| **UI Designer** | Component selection · spacing |
| **Developer** | Feasibility · performance implications |
| **Brand Strategist** | DNA alignment · voice |
| **Marketing Director** | Conversion · CTA placement |
| **SEO Specialist** | Structure · metadata · discoverability |
| **Accessibility Consultant** | WCAG · inclusive design |
| **Performance Engineer** | Load · bundle · render |

### Behaviors

| Behavior | Rule |
|----------|------|
| Explain recommendations | Always — "why this layout" |
| Teach users | Inline education · not condescension |
| Offer alternatives | ≥2 options for structural changes |
| Ask clarifying questions | When confidence <60% |
| Respect ownership | User name on all commits |
| Never silent modify | Preview → accept/reject |

### Approval Boundaries

| Action | AI proposes | AI executes | User approval |
|--------|-------------|-------------|---------------|
| Layout restructure | ✓ | ✗ | Required |
| Copy rewrite | ✓ | ✓ inline | Implicit accept |
| DNA blend change | ✓ | ✗ | Required |
| Publish | ✓ | ✗ | Required |
| Delete project | ✗ | ✗ | Human only |
| Asset upload | ✓ | ✗ | Required |

### Conversation Flow

```
Intent (voice/text/selection)
    ↓
Context assembly (project · DNA · screen · genome)
    ↓
Multidisciplinary reasoning
    ↓
Proposal card(s) with confidence + explanation
    ↓
Accept · Reject · "Why?" · "Show alternative"
    ↓
Execute (if approved) → Conversation Timeline
    ↓
Design Health™ update (if visual change)
```

### Integration

| System | Integration |
|--------|-------------|
| Conversation Engine™ | Turn management · routing |
| Command Dock | Command submission |
| Voice Mode™ | Transcript merge |
| Knowledge Registry™ | Grounding · org docs |
| Design Health™ | Critique scoring |

---

## §12 — Interaction Model

| Layer | Priority | Pattern |
|-------|----------|---------|
| 1 | Conversation | Orb · Director · dialogue |
| 2 | Direct manipulation | Canvas click · drag · inline edit |
| 3 | Precision | Inspector dock · on demand |
| 4 | Power user | Command palette · keyboard shortcuts |

**Forgiveness:** Undo · revert · Remix preview · version restore — never trap.

---

## §13 — Motion · Remix · Iteration

### Motion (inherits `token-motion`)

| Event | Duration | Easing |
|-------|----------|--------|
| Panel slide-in | 280ms | ease-out |
| Remix preview | 400ms | ease-in-out |
| Canvas section add | 320ms | spring-soft |
| Publish success | 600ms | ceremonial |
| Reduced motion | instant | per a11y |

### Remix™

13 quick-transform options (from existing constants) — preview before apply · Director explains delta.

---

## §14 — Reference Implementation™

Experience Studio™ intentionally exercises:

| Capability | Validation method |
|------------|-------------------|
| Studio Constitution™ | Registry objects · premium UX |
| Master Specification™ | M131 · M55 · M84 · M85 milestones |
| Knowledge Registry™ | Module doc · searchable |
| System Registry™ | Project · experience registration |
| Studio Design Constitution™ | Full inheritance |
| Design Language System™ | Creative Wing atmosphere |
| Design Registry™ | Version compliance |
| Component Catalog™ | 25+ components mapped |
| Design Revision Framework™ | 5 VDR proposals |
| Product Starter Pack™ | First POP v2.0.0 product |
| Studio Orb™ | Primary intelligence entry |
| Design DNA™ | Personality blending |
| Experience DNA™ | Slider system |
| Workspace DNA™ | Multi-org isolation |
| Conversation-First UX™ | Director-primary flows |
| Architecture Validator™ | Module doc gate |
| Design Health™ | In-product scoring |
| QA Framework™ | QA_TEMPLATE compliance |
| Product Governance™ | designCompliance block |

---

## §15 — Golden Product™

### Proving Ground Rules

| Rule | Detail |
|------|--------|
| New Orb capabilities | Ship in Experience Studio first |
| New catalog components | VDR ratified here first |
| New Design Registry versions | Validated here before platform |
| New motion language | Prototype here |
| New AI collaboration patterns | Reference here |
| New accessibility patterns | Benchmark here |

### Graduation Criteria

A capability **graduates** from Experience Studio to platform when:

1. Design Health™ PASS for 2 release cycles
2. Product Review Board documents pattern
3. VDR or DR filed (as appropriate)
4. Component Catalog or Master Spec updated
5. At least one other product inherits successfully

---

## §16 — Technical Architecture

### Module Stack

```
┌─────────────────────────────────────────────────────────┐
│ UI: components/admin/studio/experience-studio/          │
├─────────────────────────────────────────────────────────┤
│ Session: studio-os-core/experience-studio/              │
├─────────────────────────────────────────────────────────┤
│ Architecture: studio-os-core/digital-architect/ (M55)   │
├─────────────────────────────────────────────────────────┤
│ DNA: design-dna-canon/ (M84) · design-genome/ (M85)     │
├─────────────────────────────────────────────────────────┤
│ Intelligence: conversation-engine/ · studio-intelligence│
├─────────────────────────────────────────────────────────┤
│ Platform: registry · HQ · release-channel · validators  │
└─────────────────────────────────────────────────────────┘
```

### Key Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| `experience-studio` | `studio-os-core/experience-studio/` | Session · interview · DNA · Remix · health |
| `digital-architect` | `studio-os-core/digital-architect/` | IA · ecosystem · handoff (preserved) |
| `design-dna-canon` | `studio-os-core/design-dna-canon/` | M84 canon |
| `design-genome` | `studio-os-core/design-genome/` | M85 org memory |
| `conversation-engine` | `studio-os-core/conversation-engine/` | AI turns |
| `experience-publish` | `studio-os-core/experience-publish/` | **New** — publish pipeline |

### Milestones

| M# | Module | Status |
|----|--------|--------|
| M55 | digital-architect | implemented |
| M84 | design-dna-canon | implemented |
| M85 | design-genome | implemented |
| M89.x | conversation/orb/voice | implemented |
| M131 | experience-studio | spec complete · implementation pending |
| M76.5 | workspace-dna | partial |

### Release Channel

Preview → Beta → Stable per CA-001.

### Dependencies

| Dependency | Required |
|------------|----------|
| Conversation Engine™ | yes |
| Studio Orb™ | yes |
| Design Token Engine™ | yes |
| Design Governance v1.0.0 | yes |
| Digital Architect™ | yes (preserved) |

---

## §17 — Data Model

### Core Entities

#### `ExperienceProject`

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | PK |
| `orgId` | uuid | Tenant |
| `experienceType` | enum | 13 types |
| `title` | string | |
| `status` | draft \| review \| published \| archived | |
| `designDna` | DNA blend map | Sum = 100 |
| `experienceDna` | slider map | See §9 |
| `document` | ExperienceDocument | Canvas content |
| `createdAt` | ISO8601 | |
| `updatedAt` | ISO8601 | |

#### `ExperienceDocument`

| Field | Type | Notes |
|-------|------|-------|
| `sections` | Section[] | Ordered content blocks |
| `metadata` | object | SEO · OG tags |
| `themeSnapshot` | tokens | Point-in-time DNA resolution |

#### `PublishedExperience`

| Field | Type | Notes |
|-------|------|-------|
| `projectId` | uuid | FK |
| `url` | string | Live URL |
| `publishedAt` | ISO8601 | |
| `designHealthScore` | number | At publish |
| `channel` | enum | preview/beta/stable |

### Storage

| Data | Store | Key pattern |
|------|-------|-------------|
| Session (transition) | localStorage | `studioOs_experienceStudioSession_v1` |
| Projects (production) | Supabase + local cache | `studioOs_es_project_{id}` |
| Versions | Supabase | `es_version_{id}` |
| Assets | Media storage | org-scoped |

---

## §18 — Publishing & Experience Management

### Publish Pipeline

```
1. Design Health™ scan
2. Accessibility check
3. SEO metadata validation
4. Preview render
5. User confirmation
6. CDN deploy
7. Registry registration
8. HQ notification
```

### Experience Types (Output Taxonomy)

| Type | Output | Phase |
|------|--------|-------|
| Website | Multi-page site | v1.0 |
| Landing Page | Single page | v1.0 |
| Store | Commerce experience | v1.1 |
| Client Portal | Auth-gated portal | v1.1 |
| Dashboard | Internal executive surface | v1.2 |
| Mobile App | React Native shell / PWA | v2.0 |
| Desktop App | Electron / Tauri | v2.0 |
| Academy | Learning journey | v1.2 |
| Marketplace | Two-sided platform | v2.0 |
| Booking | Appointment flow | v1.1 |
| Interactive | Immersive scroll | v1.1 |
| Internal Tool | Operations UI | v1.2 |
| Custom | AI-defined structure | v1.0 |

---

## Appendix — Experience Types (Entry Cards)

Aligned with existing `EXPERIENCE_ENTRY_CARDS` constants — 13 types + custom.

---

*Experience Studio™ Product Specification v1.0.0-spec — the canonical blueprint.*
