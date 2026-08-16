# BACKUP AND RESTORE — All In One (Sprint 23 update)

## Database

Supabase managed backups — frequency depends on plan. Status: **NOT_CONFIGURED** until project provisioned.

Display states: `ENABLED` | `NOT_CONFIGURED` | `PROVIDER_MANAGED` | `ERROR` | `UNKNOWN`

## Storage objects

Database backup **does not** include object storage files. Document separate storage durability/versioning when live.

## Restore procedure

1. Identify authorized initiator (infrastructure owner)
2. Target **non-production** for restore tests
3. Validate schema + RLS after restore
4. Post-restore security check
5. Never overwrite production for restore testing

## RPO / RTO

Business targets — not contractual guarantees unless infrastructure supports them.

## Incident

See `INCIDENT_RESPONSE.md` and `DEPLOYMENT_RUNBOOK.md` rollback section.
