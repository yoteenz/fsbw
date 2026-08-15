# All In One — Brokerage Security

**Sprint:** 10 · **Last updated:** 2026-08-15

---

## Scope

Security rules for the **brokerage workflow** — capability gate, shipper portal, carrier offers, financial visibility, carrier payables, and payment-instruction fraud risks. Complements **`SECURITY_FOUNDATION.md`** and **`FACTORING_SECURITY.md`**.

Sprint 10: **demo store only** for brokerage mutations. Production RLS policies are planned, not yet applied to brokerage tables.

---

## Fraud risks

### Double brokering / unauthorized reassignment

- Carrier accepts offer on load A — staff must not silently reassign to another carrier without audit trail
- `coverageHistory[]` and offer status transitions provide demo audit; production requires immutable events

### Payment instruction fraud

Highest-risk area for brokerage software:

| Risk | Sprint 10 control |
|------|-------------------|
| Carrier bank detail change before pay | **No bank fields stored** — no ACH/wire in forms |
| Fraudulent remit-to on rate con | Template labeled **DEVELOPMENT TEMPLATE — NOT FOR PRODUCTION USE** |
| Intercepted carrier payment | `paymentDestinationProtected` flag on payable when factoring assignment on file |
| Shipper pays wrong entity | Shipper invoices demo-only — no live payment rails |

### Rate manipulation

- Quote and offer **revisions** are append-only arrays — no silent overwrite of `freightChargeMinor` or `carrierPayMinor`
- Margin visible to **broker finance/ops only** — reduces cross-party social engineering

### Identity / org spoofing

- Carrier offer response checks `profile.organizationId === orgId` in `respondCarrierOffer()`
- Production: all queries filter by `organizationId` + membership — URL ids insufficient

---

## Payment instructions

Sprint 10 **does not**:

- Collect or store bank account, routing, or wire instructions
- Issue production rate confirmations or shipper invoices for legal tender
- Process shipper freight payments through Sprint 07 Stripe demo

Future production requirements (checklist only — not legal advice):

- Verified carrier payment profiles with change-control workflow
- Dual approval on payment destination changes when `factoringAssignmentOnFile`
- Rate confirmation PDF from attorney-approved template
- Clear payee identity on `BSI-*` documents

See **`BROKERAGE_ACTIVATION.md`** for readiness items.

---

## Financial visibility

Enforced in `brokerageRules.ts`:

| Data | Shipper | Carrier | Broker staff |
|------|---------|---------|--------------|
| Shipper freight charge | ✓ | — | ✓ |
| Carrier pay | — | ✓ | ✓ |
| Gross margin | — | — | ✓ |
| Internal notes on shipper profile | — | — | ✓ |
| Coverage history (internal) | — | — | ✓ |
| Customer-visible issues | ✓ (when flagged) | ✓ (when flagged) | ✓ |

UI enforcement:

- `ShipperQuoteDetailPage` — explicit note: carrier pay and margin not shown
- `CarrierBrokerageOffersPage` — shipper charge and margin not shown
- Office finance pages — full financials

Production API must enforce the same — UI hiding alone is insufficient.

---

## Org isolation

### Shipper data

- `ShipmentRequest`, `BrokerageFreightQuote`, `BrokerageShipperInvoice` scoped by `shipperOrganizationId`
- Shipper portal uses `getShipperOrganizationId()` / session org — demo defaults to `client-e`

### Carrier data

- `CarrierOffer` visible to carrier org linked via `carrierNetworkProfileId` or `carrierOrganizationId`
- Carrier cannot read other carriers' offers on same load

### Brokerage loads

- `Load.sourceType === 'brokerage'` — filter separately from dispatch loads in office queues
- `shipperOrganizationId` + `brokerageCarrierOrganizationId` may differ — both memberships required for respective portal views

### Cross-division

- Dispatch specialists: **read** brokerage loads only when coordinating shared carrier client — no write to brokerage financials by default
- Factoring specialists: **read** carrier payables with factoring flags — no edit to shipper charge

---

## Protected changes

Fields requiring **broker staff** (or elevated role) in production:

| Entity | Field | Customer write |
|--------|-------|----------------|
| `BrokerageCapabilityState` | `capability`, readiness statuses | — |
| `BrokerageFreightQuote` | status transitions post-`sent` | Accept/decline own quotes only |
| `CarrierOffer` | create, withdraw, revise | Accept/decline own offers only |
| `BrokerageLoadFinancials` | `confirmedShipperChargeMinor`, `confirmedCarrierPayMinor` | — |
| `BrokerageShipperInvoice` | create, void, amount fields | Read own |
| `CarrierPayable` | status, amounts when `paymentDestinationProtected` | Read own status |
| `BrokerageRateConfirmation` | send, accept | — |
| `ShipperProfile` | `internalNotes`, status | Limited self-service onboarding |

Locked states (demo rules):

- `isShipperInvoiceLocked('paid')` — invoice financial fields immutable
- `isCarrierPayableLocked('paid_future')` — payable immutable

---

## Sensitive data boundaries

### Collected in Sprint 10 (demo)

| Data | Classification | Handling |
|------|----------------|----------|
| Shipper/c carrier business contact info | Business confidential | Org-scoped |
| Quote and offer amounts | Financial sensitive | Role-filtered visibility |
| USDOT / MC on carrier network | Business confidential | Staff verification workflow |
| POD/BOL vault references | Business confidential | Org-scoped + load membership |

### Not collected (mandatory)

| Data | Status |
|------|--------|
| Bank account / routing | **Not stored** |
| Credit card for freight pay | **Not stored** on brokerage invoices |
| SSN / EIN (brokerage onboarding) | **Not stored** — follow Road Ready boundaries |
| Production broker bond / authority credentials | Readiness checklist only — not in demo store |

---

## Capability gate security

- `disabled` — hide or block brokerage mutations in production UI
- `demo` — fictional label on all surfaces (`DEMO_BROKERAGE_LABEL`)
- `prelaunch` / `active` — require completed readiness checklist + founder authorization; **not** automatic on code deploy

Staff cannot flip to `active` without Super Admin / Administrator in production role model.

---

## Notifications

Brokerage notifications must not leak cross-party amounts:

- Shipper: "Freight quote available" — link to quote, no carrier pay
- Carrier: offer notifications — carrier pay only
- Staff: shipment request submitted — lane summary, no margin until quoted

Category: `brokerage` — separate preference toggle from `factoring` and `billing`.

---

## Audit requirements

Production should emit `ActivityEvent` for:

- Quote sent / accepted / converted
- Offer sent / accepted / declined
- Rate confirmation sent
- Shipper invoice issued
- Carrier payable approved / paid reported
- Capability mode change
- Payment destination protection flag set

Demo: selective entries in `activity[]` (e.g. `SHIPPER_INVOICE_CREATED`).

---

## Related docs

- **`BROKERAGE_ACTIVATION.md`** — readiness before `active`
- **`BROKERAGE_FINANCIAL_DOMAIN.md`** — document boundaries
- **`AUTHORIZATION_MATRIX.md`** — role matrix
- **`FACTORING_SECURITY.md`** — remittance parallels on HF-* workflow
