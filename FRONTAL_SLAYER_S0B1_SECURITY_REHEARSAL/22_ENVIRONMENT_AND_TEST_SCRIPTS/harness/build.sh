#!/usr/bin/env bash
# Usage: build.sh <dbname>  — creates an isolated local database with the live-equivalent baseline.
set -euo pipefail
DB="$1"; SQL="$(dirname "$0")/../sql"; PSQL="psql -h /tmp/fsrehearsal_pg1 -U postgres -v ON_ERROR_STOP=1 -q"
createdb -h /tmp/fsrehearsal_pg1 -U postgres "$DB"
for f in 00_supabase_emulation 01_tables 02a_hairstyle_live 02b_functions_live 03_policies_grants 04_function_acls_live 05_fixtures; do
  $PSQL -d "$DB" -f "$SQL/$f.sql"
done
echo "built $DB"
