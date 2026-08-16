# Financial Data Integrations

## Provider abstraction

`FinancialDataProvider` in `src/bookkeeping/autopilot/financialDataProvider.ts`

| Adapter | Status |
|---------|--------|
| DemoFinancialDataProvider | Active in Demo Mode |
| PlaidFinancialDataProvider | Stub — no network calls without credentials |
| FutureFinancialDataProvider | Placeholder |

## Accounting platform abstraction

`AccountingPlatformProvider` — Demo, QuickBooks Online stub, Xero stub.

**No browser automation** inside QBO or Xero.

## Connection model

`financial_connections` concept: organization, provider, institution, status, sync timestamps, error codes.

Statuses: PENDING, CONNECTED, SYNCING, ACTION_REQUIRED, DEGRADED, DISCONNECTED, ERROR

## Security

- Provider tokens server-only
- Webhook verification required when implemented
- Customer never submits bank passwords
- Manual CSV/statement upload fallback always supported

## Environment states

NOT_CONFIGURED, SANDBOX, PRODUCTION_PENDING, CONNECTED, DEGRADED, DISABLED

When not configured: Demo adapters only; internal label **INTEGRATION NOT CONFIGURED**.
