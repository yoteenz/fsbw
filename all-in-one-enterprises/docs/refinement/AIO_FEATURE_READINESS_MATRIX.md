# AIO Feature Readiness Matrix

**Canonical answer:** “Is this AIO feature actually ready?”  
**Updated:** 2026-08-19  
**Validation:** `.github/workflows/aio-production-readiness.yml`

| Feature | Implementation | Live persistence | Golden path | RLS | Storage | Responsive | Efficiency | External dependency | Blocker | Final status |
|---------|----------------|------------------|-------------|-----|---------|------------|------------|---------------------|---------|--------------|
| Smart Intake | IMPLEMENTED | DEMO_ONLY | readiness test | N/A | N/A | viewport QA | save/resume tested | Topograph optional | — | PASS (demo) |
| Road Ready | IMPLEMENTED | DEMO_ONLY | readiness test | N/A | N/A | viewport QA | requirement engine | — | — | PASS (demo) |
| Business Formation | IMPLEMENTED | PARTIAL | name check test | N/A | N/A | — | — | State registry manual/API | — | DEFERRED EXTERNAL |
| Authorities | IMPLEMENTED | DEMO_ONLY | service catalog | N/A | N/A | — | — | FMCSA manual | — | PASS (demo) |
| Permits & Compliance | IMPLEMENTED | DEMO_ONLY | workflow tests | N/A | N/A | — | — | Government manual | — | DEFERRED EXTERNAL |
| Document Vault | IMPLEMENTED | DEMO_ONLY | documentVault.test | N/A | BLOCKED live | — | cross-org deny | Supabase repo not wired | live RLS | PASS (demo) |
| FleetCare | IMPLEMENTED | DEMO_ONLY | readiness test | N/A | N/A | — | tickets scoped | — | — | PASS (demo) |
| Mechanic Network | IMPLEMENTED | DEMO_ONLY | fleetcare ticket | N/A | N/A | — | — | Geo routing partial | — | PASS (demo) |
| DriverLink | IMPLEMENTED | DEMO_ONLY | readiness test | N/A | N/A | — | credential scope | FMCSA/CDL external | — | PASS (demo) |
| Load Board | IMPLEMENTED | PARTIAL_LIVE | freightGoldenPath + live suite | live tests | live tests | viewport QA | golden path | — | live creds | PASS (demo) / BLOCKED (live) |
| Brokerage | IMPLEMENTED | PARTIAL_LIVE | brokerageWorkflow | live tests | — | — | margin separation | — | live creds | PASS (demo) |
| Dispatch | IMPLEMENTED | DEMO_ONLY | dispatch readiness | N/A | N/A | — | lifecycle steps | — | — | PASS (demo) |
| Bookkeeping | IMPLEMENTED | DEMO_ONLY | autopilot + handoff | N/A | N/A | — | idempotent handoff | Bank feeds N/I | — | PASS (demo) |
| Factoring | IMPLEMENTED | DEMO_ONLY | factoring rules | N/A | N/A | — | partner language | Funding partner | — | DEFERRED EXTERNAL |
| Insurance | IMPLEMENTED | DEMO_ONLY | insurance calc | N/A | N/A | — | referral only | Insurer API N/I | — | DEFERRED EXTERNAL |
| Client Portal | IMPLEMENTED | DEMO_ONLY | clientCommandCenter | N/A | N/A | mobile QA | — | — | — | PASS (demo) |
| AIO Office | IMPLEMENTED | DEMO_ONLY | officeCommandCenter | N/A | N/A | desktop QA | work queues | — | — | PASS (demo) |
| Authentication | IMPLEMENTED | DEMO default | security tests | N/A | N/A | — | — | Supabase auth optional | — | PASS (demo) |
| Notifications | IMPLEMENTED | DEMO_ONLY | notification engine | N/A | N/A | — | org scoped | SMS/email N/I | — | PASS (demo) |
| Multilingual | PARTIAL | N/A | i18n parity test | N/A | N/A | — | — | Freight UI English | I18N-01 | PASS WITH NON-BLOCKING |
| RLS | PARTIAL | LIVE schema | freightRlsIntegration | live | — | — | — | JWT secrets | creds | BLOCKED without secrets |
| Storage | PARTIAL | LIVE schema | freightStorageSecurity | — | live | — | — | buckets migration | creds | BLOCKED without secrets |
| Demo isolation | IMPLEMENTED | N/A | check-isolation | — | — | — | — | — | — | PASS |

## Deep Supabase freight validation

Use separately (does not replace this matrix):

`.github/workflows/aio-supabase-production-validate.yml`

## Run locally

```bash
cd all-in-one-enterprises
TEST_SCOPE=full-platform node scripts/readiness/run-production-readiness.mjs
TEST_SCOPE=domain-select DOMAIN_SELECT=fleetcare npm run readiness:domain
```
