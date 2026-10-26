#!/usr/bin/env bash
# OPERATOR-ONLY. Loads the schema-only export into the FRONTAL SLAYER STAGING project, then runs the env guard.
set -euo pipefail
: "${STAGING_DB_URL:?set STAGING_DB_URL for the FS staging project (never the production project)}"
: "${FS_STAGING_SUPABASE_REF:?set FS_STAGING_SUPABASE_REF}"
case "$STAGING_DB_URL" in *hyycomvcaqxxvyrfupes*|*soocqbyjkxeubfjnuwvf*) echo "REFUSING: target is production or SITE00 staging"; exit 1;; esac
case "$STAGING_DB_URL" in *"$FS_STAGING_SUPABASE_REF"*) ;; *) echo "REFUSING: STAGING_DB_URL does not match FS_STAGING_SUPABASE_REF"; exit 1;; esac
psql "$STAGING_DB_URL" -v ON_ERROR_STOP=1 -q -f "${1:-fs_schema_only.sql}"
echo "schema loaded into staging ref $FS_STAGING_SUPABASE_REF"
