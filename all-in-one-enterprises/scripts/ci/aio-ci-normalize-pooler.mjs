#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { DEFAULT_POOLER_URL_PATH } from './aio-ci-db.mjs';
import {
  assertCiTransportAllowed,
  buildSessionPoolerTemplate,
  ensurePoolerUrlFile,
} from './aio-ci-db-transport.mjs';

const poolerPath = process.env.AIO_POOLER_URL_PATH ?? DEFAULT_POOLER_URL_PATH;

if (existsSync(poolerPath)) {
  const t = readFileSync(poolerPath, 'utf8').trim();
  const guard = assertCiTransportAllowed(t);
  if (!guard.ok) {
    writeFileSync(poolerPath, `${buildSessionPoolerTemplate()}\n`);
    console.log('Normalized pooler-url to SUPAVISOR_SESSION (port 5432)');
  }
}

ensurePoolerUrlFile({ poolerPath });
