# Studio World Production Governance Architecture

**Status:** IMPLEMENTED (foundational sprint)  
**Module:** `src/studio-os-core/production-governance/`  
**Server:** `api/_lib/productionGovernance/`  
**Debug route:** `/__studio-world/production-governance`

---

## Canonical Rules

> **THE OPERATOR IS NOT NECESSARILY THE BILLING OWNER.**

> **COMPLIMENTARY PLATFORM ACCESS DOES NOT IMPLY COMPLIMENTARY PRODUCTION COMPUTE.**

---

## Multi-Tenancy Model

```
PLATFORM
└── ORGANIZATION (billing + isolation boundary)
    ├── WORKSPACE / BRAND (slug, e.g. frontal-slayer)
    ├── CLIENT (agency-managed)
    └── PROJECT
        └── CAMPAIGN → SHOT / ASSET
```

Every production object resolves to exactly one **organization**. The **operator** (user) may differ from the **billing owner** (organization).

---

## Organizations

Table: `studio_world_organizations`

| Field | Purpose |
|-------|---------|
| slug | Stable tenant key (aligns with existing `org_id` text slugs) |
| organization_type | OWNER, AGENCY, CLIENT_ORG, PARTNER, etc. |
| status | active / inactive / suspended |

Extends (does not replace) `studio_os_org_memberships` — new multi-membership model in `studio_world_organization_memberships`.

---

## Membership vs Entitlement

| Concept | Answers |
|---------|---------|
| **Role** | What can this person do inside the organization? |
| **Entitlement** | What capabilities has the organization licensed? |

Roles: OWNER, ADMIN, PRODUCTION_DIRECTOR, PRODUCER, MARKETING_COLLABORATOR, REVIEWER, CLIENT, VIEWER

Entitlements: PLATFORM_ACCESS, PRODUCTION_ACCESS, IMAGE_GENERATION, VIDEO_GENERATION, etc.

Founding Production Partner = entitlement records with `source: FOUNDING_PARTNER` — not hardcoded individuals.

---

## Billing Ownership

Resolved server-side via `resolveBillingOwner({ organization })` → `billing_owner_id = organization.id`.

Never derived from `user_id`.

Gateway opt-in: `request.productionGovernance.enabled` on governed generation requests.

---

## Production Usage Ledger

Table: `studio_world_production_usage_events` — **append-only**

Lineage: operator, organization, client, project, campaign, shot, billing_owner, provider, model, operation_type, estimated/actual cost, cost_source, reservation_id, status.

Corrections via `studio_world_production_usage_adjustments` — never silent rewrites.

---

## Cost Reservations

Table: `studio_world_production_cost_reservations`

Flow: reserve estimated → pending → reconcile on completion/failure/release.

Prevents concurrent jobs from trivially bypassing hard budget limits.

---

## Budget Enforcement

Table: `studio_world_production_budgets`

Outcomes: ALLOWED, ALLOWED_WITH_WARNING, BLOCKED_BUDGET, BLOCKED_ENTITLEMENT, BLOCKED_PERMISSION, BUDGET_UNAVAILABLE

Structured machine-readable results from `evaluateProductionGovernance()`.

---

## Provider Governance

Governed execution path (extended):

```
REQUEST → AUTH → ORG CONTEXT → ENTITLEMENT → BILLING OWNER → BUDGET → PROVIDER → USAGE RECORD
```

Opt-in gateway hook: `api/_lib/productionGovernance/gateway-hook.ts`

---

## Data Isolation

All new tables: RLS enabled, **service_role only** (server-side authoritative).

No provider credentials or secret billing metadata exposed to clients.

---

## Agency / Client Relationship

`studio_world_clients` + `studio_world_projects` enable cost attribution queries by client/project/campaign.

**PRODUCTION COST** (internal/provider) is separate from future **CLIENT PRICE** (agency billing).

---

## Future Commercial Billing Extension

This sprint establishes:

- Usage ledger
- Entitlements
- Budgets
- Billing owner resolution

Does **not** implement Stripe, invoicing, markup, tax, or payouts.

---

## Debug & Testing

- Route: `/__studio-world/production-governance`
- API: `/api/admin/studio-production-governance`
- Seed: `POST { action: "seed_fixtures" }`
- Simulate: no paid provider calls
- Tests: `src/studio-os-core/production-governance/production-governance.test.ts` (6 canonical scenarios)

---

## Provider Migration Manifest (remaining bypass routes)

Still bypass governed gateway + production governance:

- `api/wig-preview/*`, `api/live-wig-*` (commerce)
- `api/admin/product-photography-generate.ts`
- `api/_lib/productAssetFactory/*`
- `api/_lib/liveTryOnStudio.ts`
- `api/admin/founder-render-generate.ts`
- `api/_lib/slayForecastBroadcast/providers/registry.ts`
- `api/_lib/site00Assts/*` (separate product)
- VP production jobs (schema ready, execution not wired)

Through gateway (governance opt-in available):

- `studio-builder-generate`, `studio-foundry-generate`, `studio-generate-asset`

---

## Extraction Note

When Studio World becomes its own repo, move:

- `src/studio-os-core/production-governance/`
- `api/_lib/productionGovernance/`
- `studio_world_*` migrations

Frontal Slayer remains reference tenant via slug `frontal-slayer`.
