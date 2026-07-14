import { getAccessToken } from '../../../utils/api';
import { resolveEnvironmentPackageFeatureFlags } from '../../../studio-os-core/environment-asset-package/environment-package-feature-flags';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type EnvironmentPackageStatusResponse = {
  ok: boolean;
  package?: Record<string, unknown>;
  outputs?: Record<string, unknown>[];
  readiness?: Record<string, unknown>;
  jobs?: Record<string, unknown>[];
  health?: Record<string, unknown>;
  diagnostics?: Record<string, unknown>;
  error?: string;
  code?: string;
};

export async function migrateExperienceLabPackages(input: {
  lightPreviewUrl: string;
  darkPreviewUrl: string;
}): Promise<{ ok: boolean; migrated?: number; packageIds?: string[]; error?: string }> {
  const flags = resolveEnvironmentPackageFeatureFlags();
  if (!flags.enablePackagePersistence) return { ok: false, error: 'Persistence disabled' };

  const res = await fetch(`${API_BASE}/api/admin/environment-package-migrate`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return res.json() as Promise<{ ok: boolean; migrated?: number; packageIds?: string[]; error?: string }>;
}

export async function fetchEnvironmentPackageStatus(packageId: string): Promise<EnvironmentPackageStatusResponse> {
  const flags = resolveEnvironmentPackageFeatureFlags();
  if (!flags.enablePackagePersistence) return { ok: false, error: 'Persistence disabled' };

  const res = await fetch(
    `${API_BASE}/api/admin/environment-package-status?packageId=${encodeURIComponent(packageId)}`,
    { headers: await authHeaders() }
  );
  return res.json() as Promise<EnvironmentPackageStatusResponse>;
}

export async function approveEnvironmentPackageForProduction(input: {
  packageId: string;
  acceptEstimate: boolean;
}): Promise<{ ok: boolean; approvalId?: string; parentJobId?: string; error?: string; code?: string }> {
  const res = await fetch(`${API_BASE}/api/admin/environment-package-approve`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return res.json() as Promise<{ ok: boolean; approvalId?: string; parentJobId?: string; error?: string; code?: string }>;
}

export async function pollEnvironmentPackageWorker(packageId: string): Promise<{ ok: boolean; processed?: number; packageStatus?: string }> {
  const res = await fetch(`${API_BASE}/api/admin/environment-package-worker`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ packageId }),
  });
  return res.json() as Promise<{ ok: boolean; processed?: number; packageStatus?: string }>;
}

export async function promoteEnvironmentPackageToCanonical(packageId: string): Promise<{ ok: boolean; handoffId?: string | null; error?: string; code?: string }> {
  const res = await fetch(`${API_BASE}/api/admin/environment-package-promote`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ packageId }),
  });
  return res.json() as Promise<{ ok: boolean; handoffId?: string | null; error?: string; code?: string }>;
}
