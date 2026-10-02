# Studio World — Business & Marketing Audit (Forensic Audit1)

## Scope

How businesses **discover**, **connect**, **market**, **hire**, and **collaborate** inside fsbw evidence — not invented product design.

---

## B2B (company ↔ company)

| Capability | Evidence | Status | Spatial implication |
|------------|----------|--------|---------------------|
| Multi-tenant organizations | `studio_world_organizations`, memberships migration | SCHEMA + API | Tenant **properties** / HQ instances |
| Agency clients under org | `studio_world_clients` | SCHEMA + API | Client **suites** or tagged projects |
| Partner / agency onboarding | `api/_lib/partnerOnboarding/`, `/__studio-world/partner-agency` | IMPLEMENTED (debug) | **B2B reception** / partner desk |
| Cross-organization intelligence | `cross-organization-intelligence/`, `/admin/studio-os/cross-org-intelligence` | PARTIAL (portfolio) | **Network lounge** (metaphor) or UI-only |
| Expert / Legacy Network marketplace | `expert-marketplace/`, `legacy-network/` | PARTIAL | **Marketplace pavilion** (registry) |
| Ecosystem / creator marketplace | `ecosystem-marketplace/`, `creator-marketplace/` | PARTIAL | **Public market district** |
| Production cost / budget governance | `studio_world_production_budgets`, reservations RPC | SCHEMA + API | **Finance office** (optional metaphor) |
| Organization invitations | `studio_world_organization_invitations` | SCHEMA | **Guest pass / threshold** |

**Missing layers (evidence gap):** unified **business directory** UI, verified **cross-tenant visit** flows, public **company profile** storefront in world nav.

---

## B2C / business-to-resident / visitor

| Capability | Evidence | Status | Spatial implication |
|------------|----------|--------|---------------------|
| Social publishing to external audiences | `docs/STUDIO_SOCIAL_PUBLISHING.md`, `social-accounts` route | PARTIAL | Distribution HQ — **outbound**, not in-world ads |
| Shows / content packs | route-registry `shows`, `content-packs` | PARTIAL | **Theater / workshop** |
| Resident cast roles for clients | `cast_role_contracts`, casting.ts | IMPLEMENTED | **Casting studio** |
| Expert capture / institute | public `/studio-institute`, `/expert-capture` | IMPLEMENTED | **Academy** — adjacent product |
| Frontal Slayer lounge / shop | `/lobby/lounge`, shop routes | FS product | **Not SW** — separate mansion |

**Missing:** in-world **resident-targeted promotions**, **visitor guest passes** as product (only partial metaphors).

---

## Tenancy & entitlements

| Item | Evidence |
|------|----------|
| Org slug + type | `studio_world_organizations` |
| Membership roles | `studio_world_organization_memberships` |
| Entitlement keys | `studio_world_entitlements` |
| Operator active org preference | `studio_world_operator_preferences` |
| Company routes | `useCompanyRoute()`, `/admin/studio/companies/{slug}/...` |

**Spatial implication:** entitlements likely gate **districts**, **department packs**, **generation**, **immersive shells** — not fully wired in route-registry.

---

## Marketing systems (existing code)

| Module / route | Path | Role |
|----------------|------|------|
| Distribution Network | `distribution-network` | HQ wing |
| Distribution Engine | `distribution-engine/` | Ops |
| Campaign Engine / Orchestrator | `campaign-engine/`, `campaign-orchestrator/` | Planning |
| Growth Network / Architect | `growth-network/`, `growth-architect/` | Growth |
| AI Media Network | `ai-media-network/` | Media ops |
| Publishing queue | `publishing-queue` | Dock metaphor |
| Social accounts | `social-accounts` | Connector UI |
| Brand Architect / assets | `brand-architect`, `brand-assets` | Brand vault |
| Monetization architecture | `monetization-architecture/` | Department packs + payroll canon |
| API stub | `api/studio-world/v1/campaigns.ts` | Public API surface (verify usage) |

---

## Discovery & directory

| Signal | Evidence | Status |
|--------|----------|--------|
| Living Knowledge Graph bible | `STUDIO_WORLD_LIVING_KNOWLEDGE_GRAPH_BIBLE.md` | DOC_ONLY |
| Knowledge Core / Codex | `knowledge-core`, `studio-world-codex/` | PARTIAL |
| Global atlas / world graph | `global-atlas/`, `public/studio-os/world-graph/graph.json` | PARTIAL |
| Expansion Center | `expansion-center` route | Onboarding discovery |
| Business Discovery Blueprint | `business-discovery-blueprint/` | Org onboarding |

**Gap:** single **business discovery** surface combining marketplace + directory + B2B intros — **INFERENCE** from brainstorm, not one implemented page.

---

## Networking & collaboration

| Signal | Evidence |
|--------|----------|
| Executive Council | `executive-council/` + chamber route |
| Meeting system canon | `docs/studio-world/006_MEETING_SYSTEM.md` |
| Resident internal requests | life-os domain (runtime) |
| Cross-org intelligence | studio-os-core module |

---

## Services market

| Signal | Evidence |
|--------|----------|
| Partner onboarding | B2B services |
| Expert marketplace | Knowledge services |
| Profession Brain + Knowledge Commerce | Service monetization canon |
| SITE 00 production OS | Client production services (`site00_production_*`) — **SITE00**, not SW HQ |

---

## Casting / talent

| Signal | Evidence |
|--------|----------|
| Casting Studio route | route-registry |
| Resident cast contracts | DB + `casting.ts` |
| Talent Theater / Talent Agency routes | route-registry |
| Character Lab | VP tooling — **not** same as SW-RESIDENT-* |

---

## Events & public presence

| Signal | Evidence |
|--------|----------|
| Inauguration Ceremony Hall | route-registry |
| Screening Theater / Shows Theater | CDS + marketing |
| Innovation expeditions hall | route-registry |
| Organization inauguration module | `organization-inauguration/` |

---

## Promotional surfaces

| Type | Evidence |
|------|----------|
| Immersive department renders | `studio_world_department_renders` |
| Hero objects / sculptures | `hero-objects/` |
| Experience Lab environment stills | `src/assets/studio-world/experience-lab/` |

---

## Summary

Studio World **already encodes** a **marketing and B2B layer** primarily as:

1. **HQ spatial wings** (Distribution, Brand, Campaign, Marketplace pavilion).
2. **Studio OS core modules** (distribution, campaign, growth, monetization, expert/ecosystem marketplaces).
3. **Postgres tenancy** (orgs, clients, entitlements, projects).
4. **Partner onboarding API** (B2B).

What is **not** fully surfaced: a cohesive **in-world business economy UI** connecting discovery → visit → hire → promote — many pieces exist separately.

Spatial implications: **public market district**, **company showroom**, **networking atrium**, **casting studio**, **event halls** are **BENEFITS_FROM_SPACE** or **REQUIRES_LITERAL_SPACE** — see `STUDIO_WORLD_SPATIAL_REQUIREMENT_MATRIX.md`.

---

## Cross-company interaction matrix (evidence-backed)

| Interaction | Purpose | Implementation | Visibility | Access | Spatial need |
|-------------|---------|----------------|------------|--------|--------------|
| Company ↔ Company | Partner services, marketplace | partnerOnboarding, ecosystem-marketplace | B2B | Org membership | Market / showroom |
| Company ↔ Resident | Cast roles, client work | cast_role_contracts, access_grants | Org + client | Entitlements | Casting studio, client wing |
| Company ↔ Client character | VP / client personas | character-lab, virtual-production | Client scoped | Client id | VP stages |
| Resident ↔ Resident | Social, work, romance | life-os relationships, pairing | Org internal | Resident | Third places, offices |
| Human user ↔ Company | HQ operations | /admin/studio, org context | Admin | FS admin auth | Full HQ |
| Human user ↔ Resident | Founder brief, interventions | return-brief, interventions table | Founder privileged | Founder | Observatory / office |
| Tenant ↔ Public world | Discovery, events | marketplace, inauguration, shows | Mixed | PUBLIC/TENANT | Public district |
| SITE00 ↔ SW org | Brand → operating company | NDXBOOK handoff, production API | Pipeline | Founder | Arrival / expedition |
