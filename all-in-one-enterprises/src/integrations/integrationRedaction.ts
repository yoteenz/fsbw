/** Centralized secret / credential redaction for logs and errors */

const SECRET_PATTERNS: RegExp[] = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /api[_-]?key[=:\s]+["']?[A-Za-z0-9\-._~+/]+/gi,
  /secret[=:\s]+["']?[A-Za-z0-9\-._~+/]+/gi,
  /password[=:\s]+["']?[^\s"']+/gi,
  /token[=:\s]+["']?[A-Za-z0-9\-._~+/]+/gi,
  /authorization[=:\s]+["']?[^\s"']+/gi,
  /\b\d{13,19}\b/g,
  /\b\d{3,4}\b(?=.*cvv)/gi,
];

export function redactSecrets(input: string): string {
  let out = input;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, '[REDACTED]');
  }
  return out;
}

export function sanitizeProviderError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return redactSecrets(raw).slice(0, 500);
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const lower = k.toLowerCase();
    if (lower === 'authorization' || lower.includes('api-key') || lower.includes('token')) {
      safe[k] = '[REDACTED]';
    } else {
      safe[k] = v;
    }
  }
  return safe;
}

export function maskCredentialHint(value: string): string {
  if (value.length <= 4) return '****';
  return `****${value.slice(-4)}`;
}
