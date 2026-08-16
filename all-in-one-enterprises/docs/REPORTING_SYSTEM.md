# Reporting System (Management)

## Report Definitions

`ReportDefinition` in `managementTypes.ts` · standard library in `managementReports.ts`.

Categories: Executive, Financial, Sales, Services, Customers, Dispatch, Brokerage, Factoring, Insurance, Communications, Team, Compliance, Data Quality.

## Route

`/debug/all-in-one/office/reports`

## Features

- Filter by period (inherited from management context)
- CSV export (`managementExport.ts`) — receivables aging, respects filters
- Saved report configs (`managementSavedReports` in demo store) — filter presets only
- Scheduled report **foundation** — no external email delivery in Sprint 17

## Security

Export requires `reports.export`. Fields omitted when user lacks source permission.

## Charts

Waterfall (financial), funnel (sales), aging buckets. Tabular equivalents provided for accessibility.
