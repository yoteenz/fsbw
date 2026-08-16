# All In One — Management Command Center

**Sprint 17** · Management intelligence layer (read/analysis only)

## Purpose

The Management Command Center answers operational and financial questions from one screen without manually combining CRM, billing, workflows, dispatch, brokerage, factoring, insurance, communications, and appointments.

**Route:** `/debug/all-in-one/office/management`

Management **consumes** canonical systems. It does not own customers, invoices, loads, leads, or workflows.

## Information Architecture

| Area | Route |
|------|--------|
| Executive Overview | `/office/management` |
| Financial | `/office/management/financial` |
| Sales / CRM | `/office/management/sales` |
| Services | `/office/management/services` |
| Customers | `/office/management/customers` |
| Dispatch | `/office/management/dispatch` |
| Brokerage | `/office/management/brokerage` |
| Factoring | `/office/management/factoring` |
| Insurance | `/office/management/insurance` |
| Communications | `/office/management/communications` |
| Team / Workload | `/office/management/team` |
| Deadlines | `/office/management/deadlines` |
| Data Quality | `/office/management/data-quality` |
| Reports | `/office/reports` |
| Settings | `/office/settings/management` |

## Attention Engine

`ManagementAttentionEngine` derives deterministic items from canonical conditions (overdue receivables, stalled workflows, missing PODs, margin review, etc.). Severity: `info` · `watch` · `action` · `urgent`.

Acknowledgement does not alter underlying records. Drill-down links to canonical source records.

## Role Views

- **Owner/Admin:** full management + financial + reports export
- **Manager:** operational management (no executive financial by default on brokerage/factoring unless role includes finance permissions)
- **Finance (billing specialist):** financial command center + reports export
- **Dispatcher:** dispatch operational view only

Permissions: `management.*`, `reports.*` — see `MANAGEMENT_SECURITY.md`.

## Filters

Global period: Today · Week · Month · Quarter · Year · Custom. Optional comparison vs previous period (no misleading % when prior = 0).

Financial metrics declare date basis (payment date vs invoice date).

## Drill-Down

Every aggregate links to filtered lists or canonical records (Client 360, CRM, billing, dispatch, communications).

## Module Location

- `src/all-in-one/management/` — types, metric registry, query layer, attention engine, data quality, export
- `src/all-in-one/office/pages/ManagementPages.tsx` — UI command centers

## Boundaries

- No GAAP / net profit / AI forecasts / business health score
- Service revenue ≠ collected cash ≠ pass-through
- Brokerage gross margin ≠ net profit
- Factoring invoice face value ≠ company revenue
