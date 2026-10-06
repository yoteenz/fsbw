#!/usr/bin/env node
/**
 * Parse Supabase CLI / Management API authorization failures (no guessing).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, 'aio-link-permission-catalog.json');

function loadCatalog() {
  return JSON.parse(readFileSync(CATALOG_PATH, 'utf8')).mappings ?? {};
}

/** Extract JSON objects from noisy CLI output. */
function extractJsonBlobs(text) {
  const blobs = [];
  const s = String(text ?? '');
  for (const m of s.matchAll(/\{[\s\S]*?\}/g)) {
    try {
      blobs.push(JSON.parse(m[0]));
    } catch {
      /* skip partial JSON */
    }
  }
  return blobs;
}

export function extractHttpStatus(text) {
  const s = String(text ?? '');
  const explicit = s.match(/\bHTTP\s+(\d{3})\b/i) ?? s.match(/\bstatus(?:Code)?\s*[:=]\s*(\d{3})\b/i);
  if (explicit) return Number(explicit[1]);
  if (/\b403\b/.test(s) && /forbidden|permission|unauthorized/i.test(s)) return 403;
  if (/\b401\b/.test(s) && /unauthorized/i.test(s)) return 401;
  return null;
}

export function extractEndpoint(text) {
  const s = String(text ?? '');
  const m =
    s.match(/\b(GET|POST|PUT|PATCH|DELETE)\s+(\/v1\/[^\s'"`]+)/i) ??
    s.match(/(\/v1\/projects\/[^\s'"`]+)/i);
  if (!m) return null;
  if (m[1] && m[2]) return `${m[1].toUpperCase()} ${m[2]}`;
  return m[1]?.startsWith('/v1/') ? `GET ${m[1]}` : null;
}

export function extractMissingPermissions(text) {
  const found = new Set();
  const s = String(text ?? '');

  for (const blob of extractJsonBlobs(s)) {
    const lists = [
      blob.missing_permissions,
      blob.missingPermissions,
      blob.required_permissions,
      blob.requiredPermissions,
    ].filter(Array.isArray);
    for (const list of lists) {
      for (const item of list) {
        if (typeof item === 'string' && item.trim()) found.add(item.trim());
      }
    }
    if (typeof blob.permission === 'string') found.add(blob.permission.trim());
    if (typeof blob.required_permission === 'string') found.add(blob.required_permission.trim());
  }

  for (const m of s.matchAll(/missing_permissions["\s:=\[]+([^\]\}"']+)/gi)) {
    const chunk = m[1];
    for (const part of chunk.split(/[,|\s]+/)) {
      const p = part.replace(/["'\]]/g, '').trim();
      if (p.includes(':') || p.includes('.')) found.add(p);
    }
  }

  for (const m of s.matchAll(/"missing_permissions"\s*:\s*\[([^\]]+)\]/gi)) {
    for (const q of m[1].matchAll(/"([^"]+)"/g)) {
      found.add(q[1]);
    }
  }

  return [...found];
}

export function mapPermissionsToUi(machinePermissions) {
  const catalog = loadCatalog();
  const ui = [];
  const levels = [];
  for (const id of machinePermissions) {
    const entry = catalog[id];
    if (entry) {
      ui.push(entry.ui_label);
      levels.push(entry.access_level);
    } else {
      ui.push(`UNMAPPED (${id})`);
      levels.push('UNKNOWN');
    }
  }
  return { ui_permissions: ui, required_access_levels: levels };
}

export function parseLinkAuthorizationDiagnostic(rawOutput) {
  const http_status = extractHttpStatus(rawOutput) ?? undefined;
  const endpoint = extractEndpoint(rawOutput) ?? undefined;
  const missing_permissions = extractMissingPermissions(rawOutput);
  const { ui_permissions, required_access_levels } = mapPermissionsToUi(missing_permissions);

  let classification = 'AIO_SUPABASE_LINK_PERMISSION_UNRESOLVED';
  if (missing_permissions.length > 0) {
    classification = 'AIO_SUPABASE_PAT_PERMISSION_MISSING';
  } else if (http_status === 403 || http_status === 401) {
    classification = 'AIO_SUPABASE_PAT_PERMISSION_MISSING';
  }

  return {
    classification,
    http_status: http_status ?? null,
    endpoint: endpoint ?? null,
    missing_permissions,
    ui_permissions,
    required_access_levels,
  };
}

export function isAuthorizationLinkFailure(combinedOutput) {
  const s = String(combinedOutput ?? '');
  if (/AIO_SUPABASE_PROJECT_LINK_FAILURE/i.test(s)) return true;
  if (extractMissingPermissions(s).length > 0) return true;
  const status = extractHttpStatus(s);
  if (status === 401 || status === 403) return true;
  return /unauthorized|forbidden|permission denied|invalid access token|missing_permissions/i.test(s);
}
