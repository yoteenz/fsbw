#!/usr/bin/env bash
# AIO Supabase production validation — shared constants (no secrets).
set -euo pipefail

export AIO_CANONICAL_PROJECT_REF="nnnljnhtmseagotvgxxt"
export FS_FORBIDDEN_PROJECT_REF="hyycomvcaqxxvyrfupes"
export AIO_SUPABASE_URL="https://${AIO_CANONICAL_PROJECT_REF}.supabase.co"
# Pooler session mode (IPv4-compatible for GitHub Actions). Override host via AIO_SUPABASE_POOLER_HOST secret.
export AIO_SUPABASE_POOLER_REGION="${AIO_SUPABASE_POOLER_REGION:-us-west-2}"
export AIO_SUPABASE_POOLER_HOST="${AIO_SUPABASE_POOLER_HOST:-aws-0-us-west-2.pooler.supabase.com}"
export AIO_CI_DATABASE_TRANSPORT="${AIO_CI_DATABASE_TRANSPORT:-SUPAVISOR_SESSION}"
export AIO_CI_POOLER_PORT="${AIO_CI_POOLER_PORT:-5432}"
export SUPABASE_CLI_VERSION="${SUPABASE_CLI_VERSION:-2.119.0}"
