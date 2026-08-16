# ENVIRONMENT MATRIX — All In One

**Last updated:** 2026-08-16

| Dimension | Local | Demo/Preview | Staging | Production |
|-----------|-------|--------------|---------|------------|
| `AIO_ENVIRONMENT` | `local` | `demo` | `staging` | `production` |
| Data mode default | `demo` | `demo` | `supabase` | `supabase` |
| Auth mode | `demo` | `demo` | `supabase` | `supabase` |
| Storage mode | `demo` | `demo` | `supabase` | `supabase` |
| Supabase project | none | none | **dedicated staging** | **dedicated production** |
| Real customer PII | no | no | no (fictional fixtures) | yes (when launched) |
| Demo banner | optional | yes | STAGING badge | hidden |
| Demo reset | allowed | allowed | controlled | **blocked** |
| Public index | n/a | noindex | noindex | Sprint 24 gate |
| Payments | demo | demo | sandbox | merchant (when approved) |
| Email/SMS | none | none | sandbox | production (when approved) |

## Isolation rules

1. Staging ≠ Production database/auth/storage
2. All In One ≠ Frontal Slayer (any layer)
3. Staging webhooks must not mutate production
4. Production must not use demo auth/data/storage modes

## Verification

```bash
npm run validate:env
npm run migrate:verify
npm run secret-scan
```
