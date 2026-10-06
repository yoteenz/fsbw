#!/usr/bin/env node
/**
 * Sanitize Supabase link / Management API debug output for CI artifacts.
 * Never emit raw tokens, passwords, or full DSNs.
 */
import { redactSecrets } from './aio-ci-db.mjs';

const EXTRA_PATTERNS = [
  /\bsbp_[a-zA-Z0-9]{20,}\b/g,
  /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g,
  /Authorization:\s*Bearer\s+\S+/gi,
  /"access_token"\s*:\s*"[^"]+"/gi,
  /"refresh_token"\s*:\s*"[^"]+"/gi,
  /postgresql:\/\/[^\s'"]+@/gi,
  /postgres:\/\/[^\s'"]+@/gi,
  /(SUPABASE_ACCESS_TOKEN|SUPABASE_DB_PASSWORD|AIO_SUPABASE_SERVICE_ROLE_KEY)\s*=\s*\S+/gi,
];

export function sanitizeLinkDebugOutput(text) {
  let out = redactSecrets(String(text ?? ''));
  for (const re of EXTRA_PATTERNS) {
    out = out.replace(re, '[REDACTED]');
  }
  return out;
}

/** Fail if sanitized output still looks like a secret leak. */
export function scanSanitizedForLeaks(text, options = {}) {
  const knownPasswords = options.knownPasswords ?? [];
  const leaks = [];
  const s = String(text ?? '');

  if (/\bsbp_[a-zA-Z0-9]{16,}\b/.test(s)) leaks.push('sbp_pat_prefix');
  if (/Bearer\s+[a-zA-Z0-9._-]{20,}/i.test(s)) leaks.push('bearer_token');
  if (/postgresql:\/\/[^[\s]+:[^@\s]+@/.test(s)) leaks.push('postgresql_dsn_password');
  if (/\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+\./.test(s)) leaks.push('jwt_pattern');

  for (const pw of knownPasswords) {
    if (pw && pw.length > 3 && s.includes(pw)) leaks.push('known_password_literal');
  }

  return { pass: leaks.length === 0, leaks };
}
