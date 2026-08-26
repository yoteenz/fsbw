#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [resultsPath, localCount, remoteCount, historyStatus, remoteOnly, localOnly] = process.argv.slice(2);

const data = existsSync(resultsPath)
  ? JSON.parse(readFileSync(resultsPath, 'utf8'))
  : { project: 'nnnljnhtmseagotvgxxt' };

data.migrationHistory = {
  localCount: Number(localCount),
  remoteCount: Number(remoteCount),
  historyStatus,
  remoteOnly: remoteOnly ? remoteOnly.split(' ').filter(Boolean) : [],
  localOnly: localOnly ? localOnly.split(' ').filter(Boolean) : [],
};

writeFileSync(resultsPath, `${JSON.stringify(data, null, 2)}\n`);
