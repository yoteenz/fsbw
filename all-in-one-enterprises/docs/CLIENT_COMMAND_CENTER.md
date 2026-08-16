# All In One — Client Command Center

**Sprint:** 12 — Customer Command Center · Portal IA · Attention Engine  
**Status:** Demo complete (`ClientCommandCenterService` in `src/all-in-one/portal/`)  
**Last updated:** 2026-08-15

---

## Purpose

The **Client Command Center** is the carrier customer’s primary home at `/all-in-one/portal`. It replaces the Sprint 01–11 “flat dashboard” with a **role-aware, organization-scoped operating surface** that answers three questions on every visit:

1. **What should I do next?** — deterministic next-action hero
2. **What needs my attention?** — deduplicated attention list
3. **How is my business doing?** — health summaries without false confidence

Shippers receive a slim command-center slice on `/portal` with a handoff to `/shipper/*`. Deep domain UIs (Road Ready, Dispatch, Insurance, etc.) remain on their existing routes — the command center **aggregates and routes**, it does not replace division modules.

---

## Information architecture

### Top-level portal zones

| Zone | Route prefix | Purpose |
|------|--------------|---------|
| **Command Center** | `/portal` | Home — next action, attention, health, quick actions |
| **My Business** | `/portal/business`, `/portal/business/summary`, `/portal/road-ready`, `/portal/fleet`, `/portal/insurance`, `/portal/calendar`, `/portal/renewals` | Company profile, compliance, fleet, insurance |
| **Operations** | `/portal/operations`, `/portal/dispatch`, `/portal/brokerage` | Loads, offers, POD, brokerage carrier network |
| **Money** | `/portal/money`, `/portal/billing`, `/portal/quotes`, `/portal/factoring`, `/portal/brokerage/payments` | **Separate financial domains** — never combined |
| **Documents** | `/portal/documents`, `/portal/vault` | Requested docs, vault, expiring items |
| **Communication** | `/portal/communication`, `/portal/notifications` | Messages, notification digest |
| **Account** | `/portal/requests`, `/portal/services`, `/portal/activity`, `/portal/team`, `/portal/search`, `/portal/settings` | Service requests, team roster, timeline, search |

See **`CLIENT_INFORMATION_ARCHITECTURE.md`** for full route mapping and navigation hierarchy.

### Composition model

`getClientCommandCenterView()` assembles a single **`ClientCommandCenterView`** from domain demo actions. The view is **read-only aggregation** — mutations happen on destination routes (vault upload, dispatch POD, billing pay, etc.).

```
DemoStore + PortalContext
  → collectAttentionCandidates()
  → aggregateAttentionItems()     // clientAttentionEngine
  → selectNextAction()            // clientNextActionEngine
  → build*Summary() per module    // fleet, ops, money, documents, …
  → ClientCommandCenterView
```

Module builders are wrapped in try/catch; failures set `moduleErrors.{fleet|operations|money}` without crashing the home page.

---

## Dashboard composition (`/portal`)

### Header band

- **Greeting** — time-of-day + contact first name from `PortalContext`
- **Business status chip** — `GOOD` · `N ITEMS NEED ATTENTION` · `REVIEW NEEDED` derived from attention count
- **Customer type label** — Owner-Operator, Fleet, Motor Carrier, Shipper (`clientTypeDisplay`)

### Primary columns (carrier)

| Block | Component | Data source |
|-------|-----------|-------------|
| Notification digest | `NotificationDigest` | Unread + urgent + document-request counts |
| Next action hero | `NextActionHero` | `selectNextAction()` — single CTA |
| All caught up | `AllCaughtUpBanner` | Shown when `allCaughtUp === true` |
| Attention center | `AttentionCenter` | Up to 12 deduplicated items |
| Road Ready hero | `RoadReadyHero` | Setup/verified progress, attention count |
| Business health grid | `BusinessHealthGrid` | Documents, renewals, insurance, fleet, billing |
| Current load hero | `CurrentLoadHero` | Active dispatch load (if any) |
| Fleet preview | Inline cards | Up to 4 power units with Road Ready tone |
| Money summary cards | `MoneySummaryCards` | **Separate cards per domain** |
| Today / Upcoming | Sidebar | Calendar pickups/deliveries + compliance calendar |
| Quick actions | `QuickActionsBar` | Role-filtered shortcuts |
| Documents snapshot | Sidebar link | Needed / under review counts |
| Activity preview | Sidebar | Last 4 customer-visible events |

### Shipper home (`/portal` when `portalKind === 'shipper'`)

- Command header + next action + attention (shipper quote candidates)
- Panel linking to **`/shipper`** dashboard — no Road Ready, fleet, or dispatch blocks

---

## Next-action engine

**Module:** `src/all-in-one/portal/clientNextActionEngine.ts`

Deterministic selection — **one** hero action per page load. Precedence (highest first):

| Rank | Condition | Typical category |
|------|-----------|------------------|
| 1 | Expired critical document | `documents` |
| 2 | Service request blocked by customer info | `services` |
| 3 | Load delivery / POD action | `dispatch` |
| 4 | Insurance/registration inside urgent window (≤7 days) | `insurance` / `renewals` |
| 5 | Carrier load offer requiring response | `dispatch` |
| 6 | Factoring package missing item | `factoring` |
| 7 | Renewal action | `renewals` |
| 8 | Open invoice past due / due soon | `billing` |
| 9 | Unread message requiring response | `messages` |
| 10 | Optional growth (low only) | `services` |

Implementation sorts filtered candidates by `sortScore + priority weight`, then maps to the aggregated attention item for CTA consistency.

See **`CLIENT_ATTENTION_ENGINE.md`** for candidate sources and dedupe keys.

---

## Attention aggregation

**Module:** `src/all-in-one/portal/clientAttentionEngine.ts`

1. **`collectAttentionCandidates()`** — domain-specific collectors in `clientCommandCenterService.ts` emit `RawAttentionCandidate[]`
2. **`aggregateAttentionItems()`** — merge by `dedupeKey`, union `affectedAreas`, keep higher priority copy
3. **Sort** — priority weight + deadline proximity (sooner deadlines rank higher among equals)

Attention list cap: **12 items** on the home view (full list available on domain pages).

---

## Deduplication

Every candidate carries a stable **`dedupeKey`**. Same key → one attention row.

| Key pattern | Example | Purpose |
|-------------|---------|---------|
| `insurance-expiry:{orgId}:{date}` | `insurance-expiry:client-b:2026-09-01` | Collapse policy + renewal calendar duplicates |
| `renewal:{renewalId}` | Non-insurance renewals | Per-renewal record |
| `doc-needed:{docId}` | Vault requested status | Upload CTA |
| `doc-expiry:{docId}` | Expiring current doc | Review CTA |
| `load-pod:{loadId}` | POD missing | Dispatch detail |
| `load-offer:{loadId}` | Awaiting carrier response | Offer review |
| `factoring-doc:{submissionId}` | Package incomplete | Submission detail |
| `invoice:{invoiceId}` | Due/past due | Billing invoice |
| `service-request:{requestId}` | Waiting on customer | Request detail |
| `rr:{itemId}` | Road Ready attention item | Road Ready home |
| `shipper-quote:{quoteId}` | Shipper pending quote | Shipper quote review |

When insurance renewal and active policy share the same expiration date, both emit `insurance-expiry:{orgId}:{date}` — user sees **one** row with merged affected areas (`Insurance`, `Renewals`, `Road Ready`).

---

## Customer types

Resolved in `resolvePortalContext()` from `Client.clientType` and `portalKind`:

| Type | `clientType` | Command center behavior |
|------|--------------|-------------------------|
| Owner-operator | `owner_operator` | Full carrier IA; Road Ready prominent |
| Fleet | `fleet` | Fleet summary + multi-unit cards |
| Motor carrier | `carrier` | Same as fleet path; label differs |
| Shipper | `shipper` | Quote attention only; handoff to `/shipper` |

Demo orgs (debug banner):

| Org | Scenario |
|-----|----------|
| client-a | Summit Ridge — new owner-operator |
| client-b | Heartland — active, mixed attention |
| client-c | Pioneer Fleet — admin/ops roles seeded |
| client-d | BlueLine — factoring in progress |
| client-f | Delta — active load / POD |
| client-g | RidgeLine — **all caught up** baseline |
| client-e | NorthStar Shipper — shipper portal |

---

## Role-aware modules

**Portal member role** (`DemoStore.portalMemberRole`) simulates production `aio_organization_memberships.role`.

| Role | Billing (`canViewBilling`) | Full money (`canViewFullMoney`) | Command center impact |
|------|---------------------------|--------------------------------|------------------------|
| `owner` | ✓ | ✓ | Full home + money cards |
| `admin` | ✓ | ✓ | Full home + money cards |
| `accounting` | ✓ | ✓ | Full home + money cards |
| `operations` | — | ✓ | Money without AIO invoice pay emphasis |
| `driver` | — | — | **No money module**; reduced quick actions |
| `viewer` | — | — | Read-oriented summaries |

Rules in `organizationContext.ts`:

- `roleCanViewBilling` — owner, admin, accounting
- `roleCanViewFullMoney` — owner, admin, accounting, operations

Quick actions omit “Add Vehicle” for drivers; dispatch/POD shortcuts require owner, admin, or operations.

**Team page** (`/portal/team`) lists `organizationMembers` filtered by current org — read-only in demo.

---

## Financial domain separation (mandatory)

**Financial domains are never combined.** `MoneySummaryView` exposes separate optional fields:

- `aioBalanceDueMinor` — Sprint 07 service billing
- `freightReceivablesInProcessMinor` — factoring-ready freight invoices
- `brokeragePayablesMinor` — carrier payables (brokerage)
- `factoringInProcessMinor` — open submissions in flight

There is **no** `totalMoney` or rolled-up balance. `MoneyCenterPage` repeats the rule in UI copy. Unit test enforces absence of combined total field.

Insurance premiums and partner-reported quotes remain **outside** money cards — see **`FINANCIAL_BOUNDARIES.md`**.

---

## Mobile behavior

**Layout:** `AIOPortalLayout`

| Feature | Behavior |
|---------|----------|
| Bottom nav (carrier) | Home · Business · Ops · Money · More (`/portal/services`) |
| Sidebar | Collapsible overlay via mobile menu button |
| Section labels | HOME · MY BUSINESS · OPERATIONS · MONEY · DOCUMENTS · COMMUNICATION · ACCOUNT |
| Unread bar | Top strip when notifications unread |
| Touch targets | Command center cards and CTAs sized for one-thumb use |

Shipper portal uses shipper nav only — no carrier bottom nav.

Evaluators (`runExpirationEvaluation`, `runBillingEvaluation`) run once on layout mount — not per navigation.

---

## Authorization

### Demo mode

- Role and org switching via **`AIODebugBanner`** — not a security boundary
- `portalClientId` / `shipperPortalOrgId` select organization context
- `portalMemberRole` gates billing/money visibility client-side

### Production target

- Membership role from `aio_organization_memberships.role`
- RLS scopes all aggregations by `organization_id`
- Route guards (`CustomerRouteGuard`) — UX only; server must enforce
- Internal notes, margin, and staff-only fields **never** enter `ClientCommandCenterView`

See **`AUTHORIZATION_MATRIX.md`** (Sprint 12 portal roles) and **`SECURITY_FOUNDATION.md`**.

---

## Performance

### Demo (Sprint 12)

- Single synchronous pass over in-memory `DemoStore` on each `useClientCommandCenter()` render
- Attention collectors short-circuit shipper path (quotes only)
- Road Ready attention capped at 8 candidates before aggregation
- Document expiry window: skip items >45 days out
- Renewal attention: skip items >60 days out
- Invoice attention: skip items due >14 days out
- Module errors isolated — partial dashboard always renders

### Production recommendations

- Materialize attention rows in a server job or on domain write (same dedupe keys)
- Cache `ClientCommandCenterView` per org with TTL invalidation on entity change
- Paginate activity preview; keep home attention at ≤12
- Do not run expiration/billing evaluators only in browser — use cron (see **`NOTIFICATION_SYSTEM.md`**)

---

## Key files

| File | Role |
|------|------|
| `portal/clientCommandCenterService.ts` | View assembly + candidate collection |
| `portal/clientAttentionEngine.ts` | Dedupe + sort |
| `portal/clientNextActionEngine.ts` | Next-action precedence |
| `portal/clientCommandCenterTypes.ts` | View + context types |
| `portal/organizationContext.ts` | Org, role, portal kind |
| `portal/useClientCommandCenter.ts` | React hook |
| `pages/PortalPage.tsx` | Home layout |
| `pages/portal/ClientPortalPages.tsx` | Secondary center pages |
| `components/CommandCenterComponents.tsx` | Shared UI blocks |
| `layouts/AIOPortalLayout.tsx` | Nav + mobile chrome |
| `demo/commandCenterSeed.ts` | v12 seed: roles + members |
| `portal/clientCommandCenter.test.ts` | Dedupe, role, money boundary tests |

---

## Related documentation

- **`CLIENT_INFORMATION_ARCHITECTURE.md`** — navigation and routes
- **`CLIENT_ATTENTION_ENGINE.md`** — attention rules in depth
- **`ROAD_READY_SYSTEM.md`** — Road Ready integration
- **`NOTIFICATION_SYSTEM.md`** — parallel notification dedupe
- **`FINANCIAL_BOUNDARIES.md`** — money domain separation
