# ROUTE MIGRATION — Legacy host → Standalone

| Legacy (FS host) | Standalone |
|------------------|------------|
| `/all-in-one` | `/` |
| `/all-in-one/services` | `/services` |
| `/all-in-one/get-started` | `/get-started` |
| `/all-in-one/portal` | `/portal` |
| `/all-in-one/portal/road-ready` | `/portal/road-ready` |
| `/all-in-one/office` | `/office` |
| `/all-in-one/office/crm` | `/office/crm` |
| `/all-in-one/office/management` | `/office/management` |
| `/all-in-one/office/system/qa` | `/office/system/qa` |
| `/all-in-one/office/system/data` | `/office/system/data` |
| `/debug/all-in-one/*` | Redirect to `/all-in-one/*` (FS legacy) → moved notice |

Full manifest: `src/qa/routeManifest.ts` (paths use empty base prefix).
