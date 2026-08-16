# Bookkeeping Autopilot Architecture

Refinement 04A — All In One Enterprises Inc.

## Objective

**Automate the routine. Surface the exceptions. Require human review only where judgment is needed.**

## Pipeline

```
Connected Financial Data → Automatic Ingestion → Normalization → Trucking Classification
→ Document Matching → Load/Truck Matching → Reconciliation → Exception Detection
→ Report Preparation → Human Approval → Report Delivery
```

## Domain layer

| Module | Path | Role |
|--------|------|------|
| Types | `src/bookkeeping/autopilot/autopilotTypes.ts` | Connections, transactions, periods, exceptions |
| Financial providers | `src/bookkeeping/autopilot/financialDataProvider.ts` | `FinancialDataProvider`, Demo + Plaid stub |
| Classification | `src/bookkeeping/autopilot/classificationEngine.ts` | `classifyBookkeepingTransaction()` |
| Document matching | `src/bookkeeping/autopilot/documentMatching.ts` | `matchDocumentToTransaction()` |
| Reconciliation | `src/bookkeeping/autopilot/reconciliationEngine.ts` | Account + factoring reconciliation |
| Exceptions | `src/bookkeeping/autopilot/exceptionQueue.ts` | Dashboard metrics, ready-to-close logic |
| Chart of accounts | `src/bookkeeping/autopilot/chartOfAccounts.ts` | Trucking categories + merchant rules |

## Demo store (v22)

Autopilot seed data lives in `src/demo/autopilotSeed.ts` and upgrades from demo store v21.

## Staff UX

Office route: `/office/bookkeeping/autopilot` — exception-first command center.

## Customer UX

Portal route: `/portal/bookkeeping` — progress, connected accounts, clarification digest.

## Safety

- No unsupervised accounting close
- Configurable confidence thresholds
- Closed-period protection (staff approval required)
- Provider tokens server-only (not in demo client payloads)

## Service boundaries preserved

Autopilot does not perform tax preparation, payroll processing, money transmission, or factoring.
