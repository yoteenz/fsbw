# Integration Research Registry

Documents verified vs unverified future integrations. **Not legal determination.**

## Records

Stored in demo seed (`integrationResearchRecords`) and documented here.

| Provider / Category | API Verified | Sandbox | Notes |
|---------------------|-------------|---------|-------|
| FMCSA public data | No | No | Adapter boundary + demo only; verify official access before live |
| Payment processor | No | No | Commercial agreement required |
| QuickBooks / Xero | No | No | Not implemented Sprint 18 |
| Plaid / banking | No | No | Not in scope |
| Load boards (live) | No | No | Demo search/import only |
| ELD telematics | No | No | Customer authorization required |

## Provider requirement states

AVAILABLE, RESEARCH_REQUIRED, COMMERCIAL_AGREEMENT_REQUIRED, LICENSE_AUTHORITY_REVIEW_REQUIRED, CUSTOMER_AUTHORIZATION_REQUIRED, API_ACCESS_REQUIRED, MANUAL_ONLY, NOT_SUPPORTED

## Updating research

When official documentation confirms API access, update `IntegrationResearchRecord` with evidence URL and `lastResearchedAt` — do not claim API exists without source.
