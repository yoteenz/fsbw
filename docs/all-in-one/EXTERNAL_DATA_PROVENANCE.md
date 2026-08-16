# External Data Provenance

Every imported external fact preserves:

| Field | Purpose |
|-------|---------|
| **source** | FMCSA_DATA, PROVIDER_DATA, CUSTOMER_PROVIDED, ALL_IN_ONE_VERIFIED, DEMO_DATA |
| **fetchedAt** | When data was retrieved |
| **externalRecordId** | Provider record identifier |
| **verificationStatus** | unverified, confirmed, disputed, demo |
| **freshness** | CURRENT, STALE, UNKNOWN |
| **providerStatusRaw** | Original provider enum (audit) |

## UI source badges

Staff/customer UI shows source badges — demo data must be unmistakable.

## Conflict handling

External vs internal conflicts do not silently overwrite. Policies: EXTERNAL_UPDATE_AVAILABLE, REVIEW_CONFLICT, SOURCE_OF_TRUTH_* per field.

## Canonical ownership

Documented per integration in sync policies (`integrationSync.ts`):

- Regulatory public data → external owner for official status
- Canonical Load → All In One after staff import
- Invoice export → All In One owns invoice; accounting owns posted classification (future)
