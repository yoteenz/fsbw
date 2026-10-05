# AIO Canonical Product Graph (F01–F18)

Machine-readable source: `AIO_CANONICAL_PRODUCT_GRAPH.json`.

## Target customer IA (navigation containers)

| Container | Canonical families |
|-----------|-------------------|
| MY OFFICE | F05 |
| MY BUSINESS | F03, F04, F12 (+ fleet profile surfaces) |
| OPERATIONS | F07, F08, F09, F14, F15 |
| FINANCES | F10, F11, F13 |
| VAULT | F16 |
| INBOX | F17 |
| SERVICES | F06 |
| ACCOUNT | F18 |

Public entry: **F01**, **F02**. Auth layout supports F02/F18.

## Family summaries

| ID | Family | Primary route anchors (current) | Role projections |
|----|--------|--------------------------------|------------------|
| F01 | Entry | `/`, `about`, `contact` | — |
| F02 | Get Started | `get-started`, `roadmap`, `service-plan`, `request/submit` | — |
| F03 | Start Your Business | `start-your-business/*` | — |
| F04 | Road Ready | `road-ready`, `portal/road-ready` | — |
| F05 | My Office | `portal` (index), `activity`, `search` | Maps legacy Client Command Center |
| F06 | Services | `services/*`, `portal/services`, `portal/requests` | — |
| F07 | Operations | `portal/operations`, `portal/dispatch/*`, `office/dispatch/*` | AIO Office |
| F08 | Load Board | `portal/load-board/*` | Carrier |
| F09 | Brokerage | `portal/brokerage/*`, `shipper/*`, `office/brokerage/*` | Shipper, Carrier, Office |
| F10 | Finances | `portal/money`, `portal/billing/*`, `portal/quotes/*` | — |
| F11 | Factoring | `portal/factoring/*`, `office/factoring/*` | — |
| F12 | Insurance | `portal/insurance/*`, `office/insurance/*` | — |
| F13 | Bookkeeping | `portal/bookkeeping`, `office/bookkeeping/*` | — |
| F14 | FleetCare | `portal/fleetcare/*`, `provider/fleetcare/*`, `office/fleetcare/*` | Provider |
| F15 | DriverLink | `portal/driverlink/*`, `driver/driverlink/*`, `office/driverlink/*` | Driver, Company |
| F16 | Vault | `portal/vault/*`, `portal/documents`, `office/documents/vault/*` | — |
| F17 | Inbox | `portal/messages/*`, `notifications`, `appointments/*`, `office/inbox` | — |
| F18 | Account | `portal/settings/*`, `team`, auth routes | — |

## Node types

See `AIO_NODE_TYPE_MAP.json`. Routes are classified as PARENT/CHILD/DETAIL/INTERNAL_TOOL/etc.—not all routes are top-level product pages.

## Visual freeze

No family-specific visual expression in implementation until graph + functional waves complete (`AIO_IMPLEMENTATION_WAVES.md`).
