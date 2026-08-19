#!/usr/bin/env bash
# Record a gate status into .ci/aio-validation-results.json
set -euo pipefail

KEY="${1:?usage: aio-record-result.sh KEY STATUS [detail]}"
STATUS="${2:?usage: aio-record-result.sh KEY STATUS [detail]}"
DETAIL="${3:-}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESULTS="${AIO_CI_RESULTS_PATH:-$ROOT/.ci/aio-validation-results.json}"
mkdir -p "$(dirname "$RESULTS")"

node - <<NODE "$RESULTS" "$KEY" "$STATUS" "$DETAIL"
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const [path, key, status, detail] = process.argv.slice(2);
const data = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { project: 'nnnljnhtmseagotvgxxt' };
data[key] = status;
if (detail) data[`${key}Detail`] = detail;
writeFileSync(path, JSON.stringify(data, null, 2));
NODE

echo "Recorded $KEY=$STATUS"
