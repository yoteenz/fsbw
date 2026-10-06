# CI connectivity precheck

| Step | Script | Checks |
|------|--------|--------|
| Pooler precheck (pre-link) | `aio-ci-pooler-precheck.mjs` | DNS + TCP to pooler:5432, transport guards |
| SQL precheck (post-link) | `aio-db-connectivity-preflight.mjs` | `select 1` via psql session pooler |

Failure classes: `AIO_SUPABASE_POOLER_DNS_FAILURE`, `AIO_SUPABASE_POOLER_TCP_FAILURE`, `AIO_SUPABASE_DIRECT_HOST_GUARD`, `AIO_SUPABASE_TRANSACTION_MODE_GUARD`.
