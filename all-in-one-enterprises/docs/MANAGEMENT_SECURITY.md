# Management Security

## Permissions

| Permission | Access |
|------------|--------|
| `management.dashboard.read` | Command center home |
| `management.financial.read` | Financial command center |
| `management.sales.read` | Sales command center |
| `management.services.read` | Services command center |
| `management.dispatch.read` | Dispatch metrics |
| `management.brokerage.read` | Brokerage economics |
| `management.factoring.read` | Factoring assistance metrics |
| `management.insurance.read` | Insurance assistance metrics |
| `management.customers.read` | Customer command center |
| `management.communications.read` | Communications metrics |
| `management.team.read` | Team workload (no employee scores) |
| `management.deadlines.read` | Deadlines aggregation |
| `management.data_quality.read` | Data quality exceptions |
| `reports.read` | Reporting center |
| `reports.export` | CSV export |
| `reports.save` | Save report filter presets |
| `management.settings` | Management preferences |

## Role Bundles (demo)

- **owner / admin:** `MANAGEMENT_FULL`
- **manager:** operational management (no executive financial/brokerage/factoring unless separately granted)
- **billing_specialist:** finance view
- **dispatcher:** dispatch view only

## Boundaries

- No employee surveillance metrics
- Drill-down respects source authorization (`ManagementGate`)
- URL manipulation blocked by permission gates in UI

Implementation: `officeContext.ts` + `managementPermissions.ts`
