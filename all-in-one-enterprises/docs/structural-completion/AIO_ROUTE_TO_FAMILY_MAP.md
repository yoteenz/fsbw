# AIO Route → Family Map

Full forensic rows: `AIO_ROUTE_FORENSIC.json` (303 declarations).

## Mapping rules (forensic)

1. **Prefix wins** — `office/brokerage` → F09; `shipper/` → F09 SHIPPER projection.
2. **Portal index** → F05 My Office (not F01).
3. **Public marketing** → F01/F02 unless domain-specific public page (e.g. `services/factoring` → F11 public surface under F06 catalog).
4. **Layout-only routes** — Recorded but excluded from material node denominator when component is null or layout shell only.
5. **Legacy** — `client-portal` → F01 marketing alias for portal info.

## Target IA overlay (not immediate moves)

| Current cluster | Target container |
|-----------------|------------------|
| `portal` home, activity, search | MY OFFICE |
| `business`, `road-ready`, `fleet`, `insurance` | MY BUSINESS |
| `dispatch`, `load-board`, `brokerage`, `fleetcare`, `driverlink` | OPERATIONS |
| `money`, `billing`, `quotes`, `factoring`, `bookkeeping` | FINANCES |
| `vault`, `documents` | VAULT |
| `messages`, `notifications`, `appointments` | INBOX |
| `services`, `requests` | SERVICES |
| `settings`, `team` | ACCOUNT |

## Duplication note

The same logical path appears under `/`, `/desktop/…`, and `/mobile/…`. Canonical graph deduplicates to **one node per logical path** for completion scoring.
