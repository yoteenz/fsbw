#!/usr/bin/env node
/**
 * Pooler DNS + TCP precheck (no credentials in logs).
 */
import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  assertCiTransportAllowed,
  parsePoolerTemplateMeta,
  CI_POOLER_PORT,
  CI_DATABASE_TRANSPORT,
  resolvePoolerTemplate,
  ensurePoolerUrlFile,
} from './aio-ci-db-transport.mjs';
import { AIO_CANONICAL_PROJECT_REF, redactSecrets } from './aio-ci-db.mjs';

const RESULTS_PATH = process.env.AIO_CI_RESULTS_PATH ?? '.ci/aio-validation-results.json';

function record(classification, status, detail) {
  const data = existsSync(RESULTS_PATH) ? JSON.parse(readFileSync(RESULTS_PATH, 'utf8')) : { project: AIO_CANONICAL_PROJECT_REF };
  data.poolerPrecheck = { classification, status, detail, transport: CI_DATABASE_TRANSPORT, port: CI_POOLER_PORT };
  writeFileSync(RESULTS_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

async function tcpReachable(host, port, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.end();
      resolve(true);
    });
    socket.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

async function main() {
  console.log('=== Pooler transport precheck (session / IPv4) ===');
  ensurePoolerUrlFile();
  const { template } = resolvePoolerTemplate();
  const guard = assertCiTransportAllowed(template);
  if (!guard.ok) {
    console.error(`FAIL: ${guard.code}`);
    record(guard.code, 'FAIL', guard.message);
    process.exit(1);
  }

  const meta = parsePoolerTemplateMeta(template);
  console.log(`CI_DATABASE_TRANSPORT: ${CI_DATABASE_TRANSPORT}`);
  console.log(`CI_TARGET_HOST: ${meta.host}`);
  console.log(`CI_TARGET_PORT: ${meta.port}`);
  console.log(`CI_TARGET_DATABASE: ${meta.database}`);
  console.log(`CI_TARGET_USERNAME_PREFIX: ${meta.usernamePrefix}`);

  try {
    await lookup(meta.host);
  } catch (err) {
    const msg = redactSecrets(String(err.message ?? err));
    console.error(`FAIL: AIO_SUPABASE_POOLER_DNS_FAILURE — ${msg}`);
    record('AIO_SUPABASE_POOLER_DNS_FAILURE', 'FAIL', msg);
    process.exit(1);
  }
  console.log('DNS: PASS');

  const tcpOk = await tcpReachable(meta.host, meta.port);
  if (!tcpOk) {
    console.error('FAIL: AIO_SUPABASE_POOLER_TCP_FAILURE');
    record('AIO_SUPABASE_POOLER_TCP_FAILURE', 'FAIL', 'TCP connect failed');
    process.exit(1);
  }
  console.log('TCP: PASS');
  record('OK', 'PASS', 'dns_and_tcp');
  console.log('Pooler precheck: PASS');
}

main().catch((err) => {
  console.error(`FAIL: ${redactSecrets(err.message ?? String(err))}`);
  record('AIO_SUPABASE_POOLER_PRECHECK', 'FAIL', 'unexpected');
  process.exit(1);
});
