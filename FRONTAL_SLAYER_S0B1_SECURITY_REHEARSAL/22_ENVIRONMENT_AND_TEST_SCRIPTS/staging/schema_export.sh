#!/usr/bin/env bash
# OPERATOR-ONLY. Do not run until A1a, H2 and H3 are recorded (see 17_FOUNDER_APPROVAL_STATUS.md).
# Exports SCHEMA ONLY (no rows, no auth identities) from production for loading into the
# FRONTAL SLAYER staging project. Reads connection strings from the operator's own shell
# environment; never prints them. Output contains DDL only.
set -euo pipefail
: "${PROD_DB_URL:?set PROD_DB_URL in your shell (read-only role recommended); it is never echoed}"
OUT="${1:-fs_schema_only.sql}"
pg_dump "$PROD_DB_URL" --schema-only --no-owner --no-privileges \
  --schema=public --schema=supabase_migrations \
  --exclude-table-data='*' > "$OUT"
# Privileges are re-applied explicitly from 10_CANDIDATE_MIGRATIONS/V0 capture so ACL parity is checked, not assumed.
grep -c "CREATE TABLE" "$OUT" | xargs echo "tables exported:"
grep -ciE "INSERT INTO|COPY .* FROM stdin" "$OUT" | xargs echo "data statements (must be 0):"
