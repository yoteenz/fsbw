# All In One — Client Information Architecture

**Sprint:** 12 — Portal navigation · Route map · Role experiences  
**Status:** Implemented in `AIOPortalLayout`, `AllInOneRoutes`, `aioPaths`  
**Last updated:** 2026-08-15

---

## Design principles

1. **Command center first** — `/portal` is home; every secondary page links back via `BackToCommandCenter`
2. **Domain modules stay put** — Sprint 05–11 routes (Road Ready, Dispatch, Insurance, etc.) are linked, not merged
3. **Financial separation** — Money zone surfaces billing, factoring, and brokerage payables as distinct destinations
4. **Role-aware visibility** — Same routes; content gated by `PortalContext` (billing, money, quick actions)
5. **Legacy compatibility** — All pre-Sprint-12 deep links continue to work

---

## Primary navigation (carrier)

Sidebar sections in `AIOPortalLayout` (`carrierNav`):

| Section | Items | Primary route |
|---------|-------|---------------|
| **HOME** | Command Center | `/all-in-one/portal` |
| **MY BUSINESS** | My Business, Road Ready, Fleet, Insurance, Calendar, Renewals | `/portal/business` … `/portal/renewals` |
| **OPERATIONS** | Operations, Dispatch, Brokerage | `/portal/operations` … `/portal/brokerage` |
| **MONEY** | Money, Billing, Factoring | `/portal/money` … `/portal/factoring` |
| **DOCUMENTS** | Documents, Vault | `/portal/documents`, `/portal/vault` |
| **COMMUNICATION** | Messages, Notifications | `/portal/communication`, `/portal/notifications` |
| **ACCOUNT** | Service Requests, Team, Settings | `/portal/requests`, `/portal/team`, `/portal/settings` |

### Mobile primary nav (carrier only)

Fixed bottom bar — five tabs:

| Tab | Route | Maps to section |
|-----|-------|-----------------|
| Home | `/portal` | Command Center |
| Business | `/portal/business` | My Business hub |
| Ops | `/portal/operations` | Operations hub |
| Money | `/portal/money` | Money hub |
| More | `/portal/services` | Services center + sidebar overflow |

---

## Secondary navigation (hub pages)

Sprint 12 adds **hub pages** that summarize a zone and deep-link into existing modules:

| Hub route | Page component | Deep links |
|-----------|----------------|------------|
| `/portal/business` | `BusinessProfilePage` | Road Ready, insurance policy, service list |
| `/portal/business/summary` | `BusinessSummaryPage` | Print-friendly health + money snapshot |
| `/portal/operations` | `OperationsCenterPage` | Dispatch home, load hero, brokerage |
| `/portal/money` | `MoneyCenterPage` | Billing, quotes, factoring, carrier payables |
| `/portal/documents` | `DocumentCenterPage` | Vault, requested uploads, expiring |
| `/portal/communication` | `CommunicationHubPage` | Messages, notifications, open requests |
| `/portal/requests` | `ServiceRequestsCenterPage` | Active service requests list |
| `/portal/services` | `ServicesCenterPage` | Enrolled + available All In One services |
| `/portal/activity` | `ActivityTimelinePage` | Customer-visible activity stream |
| `/portal/team` | `TeamPage` | Organization members (read-only demo) |
| `/portal/search` | `PortalSearchPage` | Cross-portal search placeholder |

Hub pages consume **`useClientCommandCenter()`** — same view model as home for consistency.

---

## Complete route map

Base prefix: **`/all-in-one`**. Paths below are relative to that base (canonical in `src/all-in-one/utils/paths.ts`).

### Sprint 12 — Command Center & hubs

| Path | Purpose |
|------|---------|
| `/portal` | Client Command Center home |
| `/portal/business` | Company profile + active services |
| `/portal/business/summary` | Printable business summary |
| `/portal/operations` | Dispatch + load operations hub |
| `/portal/money` | Financial domains hub (separate cards) |
| `/portal/documents` | Document status hub |
| `/portal/communication` | Messages + notifications hub |
| `/portal/requests` | Service requests list center |
| `/portal/services` | Services enrollment center |
| `/portal/activity` | Activity timeline |
| `/portal/team` | Team roster |
| `/portal/search` | Portal search |

### Preserved — Road Ready & compliance (Sprint 05–06)

| Path | Purpose |
|------|---------|
| `/portal/onboarding` | Road Ready 10-step onboarding |
| `/portal/road-ready` | Road Ready persistent home |
| `/portal/fleet` | Fleet list |
| `/portal/fleet/vehicles/:vehicleId` | Vehicle detail |
| `/portal/vault` | Document Vault |
| `/portal/vault/:documentId` | Vault document detail |
| `/portal/calendar` | Compliance Calendar |
| `/portal/renewals` | Renewal Center |
| `/portal/notifications` | Notification Center |
| `/portal/settings/notifications` | Notification preferences |
| `/portal/settings` | Account settings |

### Preserved — Billing (Sprint 07)

| Path | Purpose |
|------|---------|
| `/portal/quotes` | Service quotes |
| `/portal/quotes/:quoteId` | Quote detail |
| `/portal/billing` | Billing Center |
| `/portal/billing/invoices/:invoiceId` | Invoice detail |
| `/portal/billing/pay/:invoiceId` | Pay invoice |
| `/portal/billing/receipts/:receiptId` | Receipt |

### Preserved — Dispatch (Sprint 08)

| Path | Purpose |
|------|---------|
| `/portal/dispatch` | Dispatch home |
| `/portal/dispatch/onboarding` | Dispatch enrollment |
| `/portal/dispatch/loads` | Loads list |
| `/portal/dispatch/loads/:loadId` | Load detail (POD, BOL) |
| `/portal/dispatch/history` | Completed loads |

### Preserved — Factoring (Sprint 09)

| Path | Purpose |
|------|---------|
| `/portal/factoring` | Factoring home |
| `/portal/factoring/application` | Enrollment application |
| `/portal/factoring/ready` | Ready loads |
| `/portal/factoring/submissions/:submissionId` | Submission detail |
| `/portal/factoring/history` | History |
| `/portal/factoring/invoices/:invoiceId` | Freight invoice print |

### Preserved — Brokerage carrier (Sprint 10)

| Path | Purpose |
|------|---------|
| `/portal/brokerage` | Carrier brokerage home |
| `/portal/brokerage/offers` | Load offers |
| `/portal/brokerage/loads/:loadId` | Brokerage load |
| `/portal/brokerage/payments` | Carrier payables |

### Preserved — Insurance (Sprint 11)

| Path | Purpose |
|------|---------|
| `/portal/insurance` | Insurance Center |
| `/portal/insurance/request` | Request assistance |
| `/portal/insurance/requests/:requestId` | Request detail |
| `/portal/insurance/policies/:policyId` | Policy detail |
| `/portal/insurance/certificates` | COI list |
| `/portal/insurance/certificates/new` | Request COI |
| `/portal/insurance/renewals` | Insurance renewals |

### Preserved — Service requests

| Path | Purpose |
|------|---------|
| `/portal/requests/:requestId` | Request detail + timeline |

### Shipper portal (separate tree)

| Path | Purpose |
|------|---------|
| `/shipper` | Shipper home |
| `/shipper/onboarding` | Shipper onboarding |
| `/shipper/shipments` | Shipments list |
| `/shipper/shipments/new` | New shipment request |
| `/shipper/shipments/:loadId` | Shipment detail |
| `/shipper/quotes` | Freight quotes |
| `/shipper/quotes/:quoteId` | Quote review |
| `/shipper/billing` | Shipper invoices |
| `/shipper/billing/invoices/:invoiceId` | Invoice detail |

Shipper layout reuses `AIOPortalLayout` with `shipperNav` — no carrier bottom nav.

---

## Legacy route compatibility

| Legacy pattern | Resolution |
|----------------|------------|
| `/debug/all-in-one/*` | Redirect → `/all-in-one/*` |
| `/debug/all-in-one/portal/factoring` | → `/all-in-one/portal/factoring` |
| `/debug/all-in-one/office/factoring` | → `/all-in-one/office/factoring` |
| Pre-Sprint-12 bookmarks to `/portal/road-ready`, `/portal/dispatch`, etc. | **Unchanged** — still valid |
| `/portal` as “dashboard” | Now Command Center; old dashboard widgets replaced by aggregated view |

No Sprint 12 route **removed** existing module paths. Office routes (`/office/*`) unchanged.

Registered in `src/routes/StudioDebugRoutes.tsx` before catch-all `App` route.

---

## Role-specific experiences

Same URL space for all membership roles; **content** differs via `PortalContext`:

| Surface | owner / admin | accounting | operations | driver | viewer |
|---------|---------------|------------|------------|--------|--------|
| Command Center home | Full | Full | Full | No money cards | Read-only summaries |
| `/portal/money` | All domain cards | All domain cards | Receivables + payables | “Not available” message | Limited |
| `/portal/billing` | Linked from money | Linked | — | Hidden from money hub | — |
| Quick actions — Add Vehicle | ✓ | ✓ | ✓ | — | ✓ |
| Quick actions — POD / dispatch | ✓ | ✓ | ✓ | — | — |
| Team page | View roster | View roster | View roster | View roster | View roster |

Production: enforce with RLS + API field filters, not UI-only hiding.

---

## Organization switching

### Demo mode — `AIODebugBanner`

| Control | Store field | Effect |
|---------|-------------|--------|
| Organization `<select>` | `portalClientId` | Switches carrier command center org |
| Role `<select>` | `portalMemberRole` | Simulates membership role |
| **Shipper Org** button | `shipperPortalOrgId = client-e` | Jumps shipper context |
| **Portal →** link | — | Navigates to `/portal` |

Demo org list (carrier select excludes shipper-only client-e):

- **A** Summit Ridge · **B** Heartland · **C** Pioneer Fleet · **D** BlueLine · **F** Delta · **G** RidgeLine (caught up)

APIs: `setPortalOrganization()`, `setPortalMemberRole()`, `setShipperOrganization()` in `organizationContext.ts`.

### Production target

- Org switcher in portal header (multi-membership users)
- `resolveOrganizationId()` reads session + selected org
- All command center queries scoped to active `organizationId`
- Shipper vs carrier **portal kind** from org type or explicit `/shipper` entry — not mixed in one nav tree

---

## Portal kind resolution

```typescript
resolvePortalKind(pathname):
  pathname includes '/shipper' → 'shipper'
  else → 'carrier'
```

`getClientCommandCenterView(store, portalKind)` uses kind for:

- Shipper: quote attention only; no Road Ready / fleet / dispatch summaries
- Carrier: full aggregation

---

## CTA resolution pattern

Attention and next-action items carry **`ctaHref`** from `aioPaths.*` — always deep-link to the **smallest correct surface**:

| Need | CTA destination |
|------|-----------------|
| Upload document | `/portal/vault/:documentId` |
| POD | `/portal/dispatch/loads/:loadId` |
| Insurance expiry | `/portal/insurance/policies/:policyId` |
| Renewal | `/portal/renewals` |
| Invoice | `/portal/billing/invoices/:invoiceId` |
| Factoring docs | `/portal/factoring/submissions/:submissionId` |
| Shipper quote | `/shipper/quotes/:quoteId` |

Hub pages are for **browse and summarize**; CTAs skip hubs when a detail page exists.

---

## Related documentation

- **`CLIENT_COMMAND_CENTER.md`** — dashboard composition and engines
- **`CLIENT_ATTENTION_ENGINE.md`** — attention rules
- **`DEBUG_ARCHITECTURE.md`** — debug routes and demo store v12
- **`AUTHORIZATION_MATRIX.md`** — Sprint 12 portal role matrix
