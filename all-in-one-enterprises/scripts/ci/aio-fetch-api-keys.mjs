#!/usr/bin/env node
/**
 * Fetch AIO Supabase anon + service_role keys via Management API.
 * Never prints secret values — writes masked names to stdout and optional GITHUB_ENV.
 */
import { writeFileSync, appendFileSync, readFileSync, existsSync } from 'node:fs';

const AIO_REF = 'nnnljnhtmseagotvgxxt';
const FS_REF = 'hyycomvcaqxxvyrfupes';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_ID;

if (!token) {
  console.error('FAIL: SUPABASE_ACCESS_TOKEN not set');
  process.exit(1);
}

if (projectRef !== AIO_REF) {
  console.error(`FAIL: SUPABASE_PROJECT_ID must be ${AIO_REF}`);
  process.exit(1);
}

if (projectRef === FS_REF) {
  console.error(`FAIL: forbidden Frontal Slayer project ${FS_REF}`);
  process.exit(1);
}

const url = `https://api.supabase.com/v1/projects/${AIO_REF}/api-keys`;
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
});

if (!res.ok) {
  console.error(`FAIL: Management API api-keys returned HTTP ${res.status}`);
  process.exit(1);
}

/** @type {Array<{ name: string; api_key: string }>} */
const keys = await res.json();
const anon = keys.find((k) => k.name === 'anon')?.api_key;
const service = keys.find((k) => k.name === 'service_role')?.api_key;

if (!anon) {
  console.error('FAIL: anon key not returned from Management API');
  process.exit(1);
}

const supabaseUrl = `https://${AIO_REF}.supabase.co`;

function appendGithubEnv(key, value) {
  const ghEnv = process.env.GITHUB_ENV;
  if (!ghEnv) return;
  appendFileSync(ghEnv, `${key}=${value}\n`);
}

process.env.AIO_STAGING_SUPABASE_URL = supabaseUrl;
process.env.VITE_AIO_SUPABASE_URL = supabaseUrl;
process.env.AIO_STAGING_SUPABASE_ANON_KEY = anon;
process.env.VITE_AIO_SUPABASE_ANON_KEY = anon;

appendGithubEnv('AIO_STAGING_SUPABASE_URL', supabaseUrl);
appendGithubEnv('VITE_AIO_SUPABASE_URL', supabaseUrl);
appendGithubEnv('AIO_STAGING_SUPABASE_ANON_KEY', anon);
appendGithubEnv('VITE_AIO_SUPABASE_ANON_KEY', anon);

if (service) {
  process.env.AIO_SUPABASE_SERVICE_ROLE_KEY = service;
  appendGithubEnv('AIO_SUPABASE_SERVICE_ROLE_KEY', service);
}

const resultsPath = process.env.AIO_CI_RESULTS_PATH ?? '.ci/aio-validation-results.json';
let results = { project: AIO_REF };
if (existsSync(resultsPath)) {
  try {
    results = JSON.parse(readFileSync(resultsPath, 'utf8'));
  } catch {
    results = { project: AIO_REF };
  }
}

results.apiKeys = {
  anon: service ? 'FETCHED' : 'FETCHED_ANON_ONLY',
  serviceRole: service ? 'FETCHED' : 'MISSING',
};
writeFileSync(resultsPath, JSON.stringify(results, null, 2));

console.log('API keys: anon=FETCHED service_role=' + (service ? 'FETCHED' : 'MISSING'));
console.log('Supabase URL configured (project ref only): ' + AIO_REF);
