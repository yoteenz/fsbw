#!/usr/bin/env node
// FRONTAL SLAYER environment isolation guard (proposed; not wired into the app in this sprint).
// Fails CLOSED when an environment points at the wrong Supabase project or the wrong Stripe mode.
// Prints only variable NAMES, project refs and key MODES — never a secret value or fragment.
//
// Usage (CI step, or `node env_guard.cjs` at server start in S0B-2):
//   APP_ENV=staging node env_guard.cjs
//   APP_ENV=production node env_guard.cjs
// Expected refs are configuration (not secrets):
//   FS_PRODUCTION_SUPABASE_REF=hyycomvcaqxxvyrfupes   FS_STAGING_SUPABASE_REF=<new staging ref>
'use strict';

const env = process.env;
const appEnv = (env.APP_ENV || env.VERCEL_ENV || '').trim().toLowerCase();
const problems = [];
const facts = [];

const PROD_REF = (env.FS_PRODUCTION_SUPABASE_REF || 'hyycomvcaqxxvyrfupes').trim();
const STAGING_REF = (env.FS_STAGING_SUPABASE_REF || '').trim();
const KNOWN_FOREIGN_REFS = { soocqbyjkxeubfjnuwvf: 'site00-staging (SITE00-owned)', nnnljnhtmseagotvgxxt: 'AIO Enterprises' };

function refFromUrl(u) {
  const m = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec((u || '').trim());
  return m ? m[1] : null;
}
function jwtRole(token) {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')).role || null;
  } catch { return null; }
}
function jwtRef(token) {
  try { return JSON.parse(Buffer.from(String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')).ref || null; } catch { return null; }
}
function stripeMode(key) {
  const k = String(key || '');
  if (k.startsWith('sk_live_') || k.startsWith('rk_live_') || k.startsWith('pk_live_')) return 'live';
  if (k.startsWith('sk_test_') || k.startsWith('rk_test_') || k.startsWith('pk_test_')) return 'test';
  return k ? 'unknown' : 'missing';
}

if (!['staging', 'preview', 'production', 'development'].includes(appEnv)) {
  problems.push(`APP_ENV/VERCEL_ENV must be one of staging|preview|production|development (got "${appEnv || 'unset'}")`);
}
const isProd = appEnv === 'production';
const expectedRef = isProd ? PROD_REF : STAGING_REF;

// --- Supabase project binding ---
for (const name of ['SUPABASE_URL', 'VITE_SUPABASE_URL']) {
  if (!env[name]) { problems.push(`${name} is missing`); continue; }
  const ref = refFromUrl(env[name]);
  facts.push(`${name} → project ref ${ref || 'unparseable'}`);
  if (!ref) problems.push(`${name} is not a https://<ref>.supabase.co URL`);
  else if (KNOWN_FOREIGN_REFS[ref]) problems.push(`${name} points at ${KNOWN_FOREIGN_REFS[ref]} — never valid for FRONTAL SLAYER`);
  else if (!isProd && ref === PROD_REF) problems.push(`${name} points at the PRODUCTION project in a non-production environment`);
  else if (expectedRef && ref !== expectedRef) problems.push(`${name} ref does not match the expected ${appEnv} ref`);
  else if (!isProd && !STAGING_REF) problems.push('FS_STAGING_SUPABASE_REF is not configured; cannot prove staging isolation');
}
// --- Keys belong to the same project and carry the right role ---
const keyChecks = [['SUPABASE_SERVICE_ROLE_KEY', 'service_role'], ['SUPABASE_ANON_KEY', 'anon'], ['VITE_SUPABASE_ANON_KEY', 'anon']];
for (const [name, role] of keyChecks) {
  if (!env[name]) { if (name !== 'VITE_SUPABASE_ANON_KEY') problems.push(`${name} is missing (server must fail closed, never fall back)`); continue; }
  const r = jwtRole(env[name]); const ref = jwtRef(env[name]);
  facts.push(`${name} present · role claim ${r || 'n/a (non-JWT key format)'} · ref ${ref || 'n/a'}`);
  if (r && r !== role) problems.push(`${name} carries role "${r}", expected "${role}"`);
  if (ref && expectedRef && ref !== expectedRef) problems.push(`${name} belongs to a different project than the ${appEnv} project`);
}
for (const name of Object.keys(env)) {
  if (name.startsWith('VITE_') && /SERVICE_ROLE|SECRET|WEBHOOK|PRIVATE/i.test(name)) problems.push(`${name}: privileged-looking variable exposed to the browser bundle`);
  if (name.startsWith('VITE_') && jwtRole(env[name]) === 'service_role') problems.push(`${name}: contains a service_role token — would ship to browsers`);
}
// --- Stripe mode ---
const sk = stripeMode(env.STRIPE_SECRET_KEY), pk = stripeMode(env.STRIPE_PUBLISHABLE_KEY || env.VITE_STRIPE_PUBLISHABLE_KEY);
facts.push(`STRIPE_SECRET_KEY mode ${sk} · publishable mode ${pk} · STRIPE_WEBHOOK_SECRET ${env.STRIPE_WEBHOOK_SECRET ? 'present' : 'missing'}`);
if (isProd && (sk === 'test' || pk === 'test')) problems.push('Production uses Stripe TEST keys');
if (!isProd && (sk === 'live' || pk === 'live')) problems.push('Non-production environment holds Stripe LIVE keys');
if (sk !== 'missing' && pk !== 'missing' && sk !== pk) problems.push('Stripe secret and publishable keys are from different modes');
if (env.ALLOW_LEGACY_CHECKOUT && isProd) problems.push('ALLOW_LEGACY_CHECKOUT is set in production');
// --- Outbound safety for staging ---
if (!isProd) {
  if (env.SITE_URL && /frontalslayer\.com/i.test(env.SITE_URL) && !/staging/i.test(env.SITE_URL)) problems.push('SITE_URL points at the production domain from a non-production environment (emails/links would leak to production)');
  if (env.RESEND_API_KEY && !env.EMAIL_SANDBOX_RECIPIENT) problems.push('Staging can send real email: set EMAIL_SANDBOX_RECIPIENT (proposed) or remove RESEND_API_KEY');
}

console.log(`[env_guard] APP_ENV=${appEnv || 'unset'}`);
for (const f of facts) console.log('  · ' + f);
if (problems.length) {
  console.error(`[env_guard] REFUSING TO START (${problems.length} problem${problems.length > 1 ? 's' : ''}):`);
  for (const p of problems) console.error('  ✗ ' + p);
  process.exit(1);
}
console.log('[env_guard] OK');
