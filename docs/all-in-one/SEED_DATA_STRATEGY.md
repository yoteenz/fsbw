# All In One — Seed Data Strategy (Sprint 20)

## Seed types

| Type | Purpose | When |
|------|---------|------|
| **Demo** | Full fictional Sprint 01–19 world | Debug review `/all-in-one` |
| **Test** | Minimal deterministic fixtures | Automated RLS/auth tests |
| **Production reference** | Roles, permissions, service config | Dedicated DB first deploy |

## Demo seed

- Source: `src/all-in-one/demo/demoSeed.ts` + domain seeds
- Version: **20** (`AIO_DEMO_SCHEMA_VERSION`)
- Stable IDs: `client-a` … `client-g` for authorization tests
- Reset: Debug banner → Reset Demo Data

## Test seed

- Manifest: `src/all-in-one/data/seeds/testSeedManifest.ts`
- Orgs A/B, cross-org invoice, restricted factoring scenarios
- UUIDs fixed for snapshot stability

## Production reference seed

- Source: `src/all-in-one/data/seeds/productionReferenceSeed.ts`
- **No fictional customers**
- Roles: OWNER, ADMIN, MANAGER, OPERATIONS, DISPATCHER, FINANCE, CRM, SECURITY, CUSTOMER
- Permissions per `AUTHORIZATION_MATRIX.md`

## Privacy

All fixture PII is fictional. No real DOT, email, or phone numbers.

## Do not

- Auto-seed production with demo customers
- Hardcode production row IDs in migrations
