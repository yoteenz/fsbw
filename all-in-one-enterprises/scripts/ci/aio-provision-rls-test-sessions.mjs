#!/usr/bin/env node
/**
 * Obtain short-lived role JWTs for live RLS validation via Supabase Auth sign-in.
 * Uses email/password GitHub secrets — never prints tokens to stdout.
 * Writes AIO_RLS_TEST_*_JWT and AIO_RLS_TEST_SHIPPER_A_ORG to GITHUB_ENV when present.
 */
import { appendFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;

/** @type {Array<{ envJwt: string; emailKey: string; passwordKey: string; orgEnv?: string }>} */
const ROLES = [
  {
    envJwt: 'AIO_RLS_TEST_SHIPPER_A_JWT',
    emailKey: 'AIO_RLS_TEST_SHIPPER_A_EMAIL',
    passwordKey: 'AIO_RLS_TEST_SHIPPER_A_PASSWORD',
    orgEnv: 'AIO_RLS_TEST_SHIPPER_A_ORG',
  },
  {
    envJwt: 'AIO_RLS_TEST_SHIPPER_B_JWT',
    emailKey: 'AIO_RLS_TEST_SHIPPER_B_EMAIL',
    passwordKey: 'AIO_RLS_TEST_SHIPPER_B_PASSWORD',
  },
  {
    envJwt: 'AIO_RLS_TEST_CARRIER_A_JWT',
    emailKey: 'AIO_RLS_TEST_CARRIER_A_EMAIL',
    passwordKey: 'AIO_RLS_TEST_CARRIER_A_PASSWORD',
  },
  {
    envJwt: 'AIO_RLS_TEST_STAFF_JWT',
    emailKey: 'AIO_RLS_TEST_STAFF_EMAIL',
    passwordKey: 'AIO_RLS_TEST_STAFF_PASSWORD',
  },
];

function appendGithubEnv(key, value) {
  const ghEnv = process.env.GITHUB_ENV;
  if (!ghEnv) return;
  appendFileSync(ghEnv, `${key}=${value}\n`);
}

function hasJwt(envJwt) {
  return Boolean(process.env[envJwt]?.trim());
}

async function signInRole({ envJwt, emailKey, passwordKey, orgEnv }) {
  if (hasJwt(envJwt)) {
    console.log(`${envJwt}: already set (skipping sign-in)`);
    return true;
  }

  const email = process.env[emailKey]?.trim();
  const password = process.env[passwordKey]?.trim();
  if (!email || !password) {
    console.log(`${envJwt}: BLOCKED (missing ${emailKey} / ${passwordKey})`);
    return false;
  }

  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    console.error(`${envJwt}: sign-in failed (${error?.message ?? 'no session'})`);
    return false;
  }

  process.env[envJwt] = data.session.access_token;
  appendGithubEnv(envJwt, data.session.access_token);
  console.log(`${envJwt}: obtained via Auth sign-in`);

  if (orgEnv && !process.env[orgEnv]?.trim()) {
    const authed = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    });
    const { data: memberships } = await authed
      .from('aio_organization_memberships')
      .select('organization_id')
      .eq('status', 'active')
      .limit(1);
    const orgId = memberships?.[0]?.organization_id;
    if (orgId) {
      process.env[orgEnv] = String(orgId);
      appendGithubEnv(orgEnv, String(orgId));
      console.log(`${orgEnv}: resolved from membership`);
    }
  }

  return true;
}

async function main() {
  if (!url || !anonKey) {
    console.error('FAIL: AIO_STAGING_SUPABASE_URL and anon key required');
    process.exit(1);
  }

  let obtained = 0;
  for (const role of ROLES) {
    if (await signInRole(role)) obtained += 1;
  }

  const required = ['AIO_RLS_TEST_SHIPPER_A_JWT', 'AIO_RLS_TEST_CARRIER_A_JWT', 'AIO_RLS_TEST_STAFF_JWT'];
  const missingRequired = required.filter((k) => !hasJwt(k));
  if (missingRequired.length > 0) {
    console.log(`RLS session provisioning: partial (${obtained}/${ROLES.length}) — missing ${missingRequired.join(', ')}`);
    process.exit(0);
  }

  if (!hasJwt('AIO_RLS_TEST_SHIPPER_B_JWT')) {
    console.log('RLS session provisioning: shipper B JWT unavailable — role matrix may skip');
  }

  console.log(`RLS session provisioning: complete (${obtained}/${ROLES.length} roles)`);
}

main().catch((err) => {
  console.error('RLS session provisioning failed:', err.message);
  process.exit(1);
});
