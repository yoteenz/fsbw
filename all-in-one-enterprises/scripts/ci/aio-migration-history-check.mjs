#!/usr/bin/env node
/**
 * Record migration history check results (fail-closed fields).
 * Accepts legacy positional args OR JSON on stdin (preferred from shell).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const resultsPath = process.argv[2] ?? process.env.AIO_CI_RESULTS_PATH ?? '.ci/aio-validation-results.json';

let payload;
if (!process.stdin.isTTY) {
  const raw = readFileSync(0, 'utf8').trim();
  if (raw.startsWith('{')) {
    payload = JSON.parse(raw);
  }
}

if (!payload) {
  const [, , localCount, remoteCount, historyStatus, remoteOnly, localOnly] = process.argv;
  payload = {
    localCount: Number(localCount),
    remoteCount: remoteCount === '' || remoteCount === 'null' ? null : Number(remoteCount),
    historyStatus,
    remoteOnly: remoteOnly ? remoteOnly.split(' ').filter(Boolean) : [],
    localOnly: localOnly ? localOnly.split(' ').filter(Boolean) : [],
    remoteQueryStatus: historyStatus === 'PENDING' ? 'PENDING' : undefined,
  };
}

const data = existsSync(resultsPath)
  ? JSON.parse(readFileSync(resultsPath, 'utf8'))
  : { project: 'nnnljnhtmseagotvgxxt' };

data.migrationHistory = {
  localCount: payload.localCount,
  remoteCount: payload.remoteCount ?? null,
  historyStatus: payload.historyStatus,
  remoteQueryStatus: payload.remoteQueryStatus ?? (payload.historyStatus === 'PENDING' ? 'PENDING' : undefined),
  connectionStatus: payload.connectionStatus,
  remoteMethod: payload.remoteMethod,
  remoteOnly: payload.remoteOnly ?? [],
  localOnly: payload.localOnly ?? [],
};

writeFileSync(resultsPath, `${JSON.stringify(data, null, 2)}\n`);
