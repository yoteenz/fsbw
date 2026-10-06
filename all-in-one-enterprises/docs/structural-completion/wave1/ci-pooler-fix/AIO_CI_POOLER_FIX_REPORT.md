# AIO CI Supavisor session pooler fix

**Sprint:** P0.AIO.SUPABASE-CI-IPV4-POOLER-CONNECTION-FIX1

## Problem

GitHub Actions runners often lack IPv6 routes to `db.<ref>.supabase.co`. Supabase CLI `link` / `db push` failed with `network is unreachable`.

## Fix

1. Pin Supabase CLI **2.119.0** (pooler-aware `link`; do **not** use `--skip-pooler`).
2. Canonical CI transport: **SUPAVISOR_SESSION** on port **5432**.
3. Derive pooler template `aws-0-us-west-2.pooler.supabase.com` (AIO project region) or override via `AIO_SUPABASE_POOLER_HOST` / `AIO_SUPABASE_POOLER_URL`.
4. Precheck DNS + TCP before link; guards reject direct db host and port 6543.
5. Export percent-encoded `AIO_CI_DB_URL` for `migration list` and `db push --db-url`.

## Secrets

Reuse `SUPABASE_DB_PASSWORD`. No token rotation required for this fix.
