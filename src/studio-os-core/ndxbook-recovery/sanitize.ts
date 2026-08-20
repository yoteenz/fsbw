/**
 * Secret exclusion for portable handoff packages.
 */

const SECRET_KEY_PATTERN =
  /token|secret|password|encrypted|api[_-]?key|oauth|credential|private[_-]?key|access[_-]?key/i;

const SECRET_VALUE_PATTERN =
  /^(sk-|pk_|Bearer\s|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.|EAA[A-Za-z0-9]+)/;

export function isSecretKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

export function looksLikeSecretValue(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 8) return false;
  return SECRET_VALUE_PATTERN.test(trimmed);
}

export function sanitizeForHandoff<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForHandoff(item)) as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isSecretKey(k)) continue;
      if (looksLikeSecretValue(v)) continue;
      out[k] = sanitizeForHandoff(v);
    }
    return out as T;
  }
  if (looksLikeSecretValue(value)) return '[REDACTED]' as T;
  return value;
}

export function assertHandoffHasNoSecrets(payload: unknown): { ok: true } | { ok: false; path: string } {
  const walk = (node: unknown, path: string): { ok: true } | { ok: false; path: string } => {
    if (node === null || node === undefined) return { ok: true };
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        const r = walk(node[i], `${path}[${i}]`);
        if (!r.ok) return r;
      }
      return { ok: true };
    }
    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (isSecretKey(k)) return { ok: false, path: `${path}.${k}` };
        if (looksLikeSecretValue(v)) return { ok: false, path: `${path}.${k}` };
        const r = walk(v, `${path}.${k}`);
        if (!r.ok) return r;
      }
      return { ok: true };
    }
    if (looksLikeSecretValue(node)) return { ok: false, path };
    return { ok: true };
  };
  return walk(payload, '$');
}
