#!/usr/bin/env bash
# Verify AIO freight schema + RLS enablement (postgres direct — no secret echo).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aio-constants.sh
source "$SCRIPT_DIR/aio-constants.sh"

ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT"

RESULTS="${AIO_CI_RESULTS_PATH:-.ci/aio-validation-results.json}"
mkdir -p "$(dirname "$RESULTS")"

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "FAIL: SUPABASE_DB_PASSWORD required"
  exit 1
fi

export PGPASSWORD="$SUPABASE_DB_PASSWORD"
PGHOST="db.${AIO_CANONICAL_PROJECT_REF}.supabase.co"
PGPORT=5432
PGUSER=postgres
PGDATABASE=postgres

REQUIRED_TABLES=(
  aio_organizations
  aio_dispatch_loads
  aio_brokerage_load_financials
  aio_brokerage_load_financial_revisions
  aio_carrier_offers
  aio_load_board_publications
  aio_load_board_saved_searches
  aio_load_status_history
  aio_shipment_requests
  aio_brokerage_freight_quotes
  aio_brokerage_quote_pricing_drafts
  aio_brokerage_shipper_invoices
  aio_brokerage_bookkeeping_handoffs
  aio_documents
)

RLS_TABLES=(
  aio_shipment_requests
  aio_brokerage_freight_quotes
  aio_brokerage_quote_pricing_drafts
  aio_brokerage_load_financials
  aio_carrier_offers
  aio_brokerage_bookkeeping_handoffs
  aio_dispatch_loads
)

echo "=== Schema verification ==="
missing=()
for t in "${REQUIRED_TABLES[@]}"; do
  exists="$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -tAc \
    "select count(*) from information_schema.tables where table_schema='public' and table_name='${t}';")"
  exists="$(echo "$exists" | tr -d '[:space:]')"
  if [[ "$exists" != "1" ]]; then
    missing+=("$t")
    echo "MISSING: $t"
  else
    echo "OK: $t"
  fi
done

echo ""
echo "=== RLS enablement ==="
rls_off=()
for t in "${RLS_TABLES[@]}"; do
  enabled="$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -tAc \
    "select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='${t}';")"
  enabled="$(echo "$enabled" | tr -d '[:space:]')"
  if [[ "$enabled" == "t" ]]; then
    echo "RLS ON: $t"
  else
    echo "RLS OFF: $t"
    rls_off+=("$t")
  fi
done

unset PGPASSWORD

schema_status="PASS"
rls_status="PASS"
[[ ${#missing[@]} -gt 0 ]] && schema_status="FAIL"
[[ ${#rls_off[@]} -gt 0 ]] && rls_status="FAIL"

node - <<NODE "$RESULTS" "$schema_status" "$rls_status" "${missing[*]:-}" "${rls_off[*]:-}"
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const [path, schema, rls, missingStr, rlsOffStr] = process.argv.slice(2);
const data = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { project: 'nnnljnhtmseagotvgxxt' };
data.schema = schema;
data.rlsEnablement = rls;
data.schemaDetail = {
  missing: missingStr ? missingStr.split(' ') : [],
  rlsOff: rlsOffStr ? rlsOffStr.split(' ') : [],
};
writeFileSync(path, JSON.stringify(data, null, 2));
NODE

if [[ "$schema_status" != "PASS" || "$rls_status" != "PASS" ]]; then
  echo "Schema/RLS verification: FAIL"
  exit 1
fi

echo "Schema + RLS enablement: PASS"
