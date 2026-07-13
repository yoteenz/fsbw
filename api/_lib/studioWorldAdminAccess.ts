/**
 * Server-side Studio World admin access — canonical department generation gate.
 */

const FOUNDER_EMAIL = 'kateenaarmstrong@gmail.com';

export function readEnvPortfolioOwners(): string[] {
  const raw =
    (typeof process !== 'undefined' && process.env?.ADMIN_PORTFOLIO_OWNER_EMAILS) ||
    (typeof process !== 'undefined' && process.env?.PORTFOLIO_OWNER_EMAILS) ||
    '';
  return String(raw)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isStudioWorldAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const envOwners = readEnvPortfolioOwners();
  return normalized === FOUNDER_EMAIL || envOwners.includes(normalized);
}

export function assertStudioWorldAdminAccess(email: string): { ok: true } | { ok: false; code: string; message: string } {
  if (!isStudioWorldAdminEmail(email)) {
    return {
      ok: false,
      code: 'STUDIO_WORLD_ADMIN_REQUIRED',
      message: 'Canonical Studio World department generation requires Admin Founder or authorized Studio World administrator.',
    };
  }
  return { ok: true };
}

export function assertCanonicalGenerationRequest(input: {
  email: string;
  operation: 'generate' | 'batch' | 'publish' | 'list';
  organizationId?: string | null;
}): { ok: true } | { ok: false; code: string; message: string } {
  const admin = assertStudioWorldAdminAccess(input.email);
  if (!admin.ok) return admin;

  if (input.organizationId && input.organizationId !== 'studio-world' && !input.organizationId.startsWith('studio-world-')) {
    return {
      ok: false,
      code: 'CANONICAL_NOT_TENANT_OWNED',
      message: 'Canonical departments cannot be generated for organization tenants.',
    };
  }

  return { ok: true };
}
