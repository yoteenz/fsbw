import { IMMUNE_PRODUCTION_PROJECT_REF } from '../../../src/studio-os-core/immune-system/constants.js';

export function resolveSupabaseProjectRef(): string | null {
  const explicit = process.env.SUPABASE_PROJECT_REF?.trim();
  if (explicit) return explicit;
  const url = process.env.SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const ref = host.split('.')[0];
    return ref || null;
  } catch {
    return null;
  }
}

export function getAllowedSupabaseProjectRefs(): string[] {
  const extra = process.env.IMMUNE_ALLOWED_PROJECT_REFS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  return [IMMUNE_PRODUCTION_PROJECT_REF, ...extra];
}

export function resolveImmuneEnvironment(): string {
  return process.env.VERCEL_ENV?.trim() || process.env.NODE_ENV?.trim() || 'development';
}

export function isImmuneAutoRepairEnabled(): boolean {
  const flag = process.env.IMMUNE_SYSTEM_AUTO_REPAIR?.trim();
  return flag === '1' || flag === 'true';
}

export function isImmuneProductionTargetVerified(): boolean {
  const ref = resolveSupabaseProjectRef();
  if (!ref) return false;
  return getAllowedSupabaseProjectRefs().includes(ref);
}
