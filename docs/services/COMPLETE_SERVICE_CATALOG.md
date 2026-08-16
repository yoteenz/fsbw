# Complete Service Catalog — All In One Enterprises

Canonical source: `all-in-one-enterprises/src/services/catalog/serviceCatalog.ts`

## Discovery categories

| Category ID | Title |
|-------------|-------|
| `start-my-business` | Start My Business |
| `get-road-ready` | Get Road Ready |
| `permits-taxes-compliance` | Permits, Taxes & Compliance |
| `safety-drivers` | Safety & Drivers |
| `operate-my-business` | Operate My Business |
| `move-freight` | Move Freight |
| `manage-my-money` | Manage My Money |

## Services (summary)

Each entry includes: slug, category, fulfillment type (nullable until configured), activation status, pricing model, jurisdiction dependency, renewal interval, Road Ready applicability, workflow template slug.

### Business formation
- `llc-formation-assistance`, `corporation-formation-assistance`, `ein-assistance`, `trucking-business-startup`, `business-setup-consultation`

### Authorities & road ready
- `usdot-registration`, `operating-authority-assistance`, `authority-maintenance`, `boc-3-assistance`
- `ucr-registration`, `ucr-renewal`, `hvut-form-2290`, `irp-apportioned-registration`, `ifta-fuel-tax-assistance`
- `tag-services`, `title-services`, `commercial-auto-liability`
- `drug-alcohol-consortium`, `fmcsa-clearinghouse-assistance`, `eld-services`

### Compliance
- `ifta-filing`, `road-tax-assistance`, `mcs-150-biennial-update`, `trip-permits`, `temporary-permits`, `renewals`, `compliance-support`

### Safety & drivers
- `driver-qualification-files`, `dot-compliance-support`, `dot-audit-support`, `new-entrant-audit-support`, `safety-compliance-programs`

### Operations & freight
- Dispatch, insurance, brokerage services (unchanged slugs)

### Financial
- Bookkeeping tiers, `books-rescue`, factoring (partner), `payroll-services`, `tax-preparation`

## Pricing

Configured services use `starting_at` (bookkeeping) or `quote_required` / `contact_us`. No invented government or partner fees.

## Missing icon assets

See `MISSING_ICON_SLOTS` in `serviceCatalog.ts`: ucr, hvut, mcs150, consortium, clearinghouse, dq-files, dot-audit, eld, title, tags, payroll, tax-prep, safety.
