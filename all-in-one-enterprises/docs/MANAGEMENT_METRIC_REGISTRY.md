# Management Metric Registry

Central registry: `src/all-in-one/management/managementMetricRegistry.ts`

Each metric includes: key, label, description, source, date basis, inclusions, exclusions, permission, drill-down, format.

## Core Financial Metrics

| Key | Label | Date Basis |
|-----|-------|------------|
| `collected_service_revenue` | Collected Service Revenue | Payment date |
| `collected_cash` | Collected Cash | Payment date |
| `pass_through_collected` | Pass-Through Collected | Payment date |
| `outstanding_receivables` | Outstanding Receivables | Invoice state |

**Collected Service Revenue:** All In One service fee portion of succeeded payments. Excludes government/third-party pass-through.

## Operations Metrics

| Key | Label |
|-----|-------|
| `active_customers` | Active Customers |
| `active_service_requests` | Active Service Requests |
| `open_sales_opportunities` | Open Sales Opportunities |
| `active_loads` | Active Loads |
| `management_attention` | Management Attention |
| `estimated_pipeline_value` | Estimated Pipeline Value (estimate only) |
| `brokerage_gross_margin` | Brokerage Gross Margin |

Calculations live in `managementQueryLayer.ts` and `managementFinancial.ts` — do not duplicate in UI components.

## Explainer

Financial metrics support **What does this mean?** in UI via `MetricExplainer` + registry `description`.
