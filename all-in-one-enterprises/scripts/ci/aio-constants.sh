#!/usr/bin/env bash
# AIO Supabase production validation — shared constants (no secrets).
set -euo pipefail

export AIO_CANONICAL_PROJECT_REF="nnnljnhtmseagotvgxxt"
export FS_FORBIDDEN_PROJECT_REF="hyycomvcaqxxvyrfupes"
export AIO_SUPABASE_URL="https://${AIO_CANONICAL_PROJECT_REF}.supabase.co"
export SUPABASE_CLI_VERSION="${SUPABASE_CLI_VERSION:-2.23.4}"
