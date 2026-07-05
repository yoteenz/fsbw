import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../workspace/storage';
import { tryGetStudioOsAuthProvider } from './provider';
import type { StudioOsOrgMembership } from './types';

let cachedMembership: StudioOsOrgMembership | null = null;
let resolvePromise: Promise<StudioOsOrgMembership> | null = null;

function readEnvPortfolioOwnerEmails(): string[] {
  const raw =
    (typeof import.meta !== 'undefined' &&
      (import.meta as { env?: { VITE_PORTFOLIO_OWNER_EMAILS?: string } }).env?.VITE_PORTFOLIO_OWNER_EMAILS) ||
    '';
  return String(raw)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function buildEnvFallbackMembership(email: string): StudioOsOrgMembership {
  const envOwners = readEnvPortfolioOwnerEmails();
  const isPortfolioOwner = envOwners.includes(email);
  return {
    workspaceId: STUDIO_OS_DEFAULT_WORKSPACE_ID,
    isPortfolioOwner,
    source: 'env-fallback',
  };
}

function buildDefaultMembership(): StudioOsOrgMembership {
  return {
    workspaceId: STUDIO_OS_DEFAULT_WORKSPACE_ID,
    isPortfolioOwner: false,
    source: 'default',
  };
}

async function fetchMembershipFromApi(accessToken: string): Promise<StudioOsOrgMembership | null> {
  const base =
    (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE) ||
    '';
  const url = `${base.replace(/\/$/, '')}/api/admin/studio-os-membership`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      workspaceId?: string;
      isPortfolioOwner?: boolean;
    };
    if (!data.workspaceId) return null;
    return {
      workspaceId: data.workspaceId,
      isPortfolioOwner: Boolean(data.isPortfolioOwner),
      source: 'supabase',
    };
  } catch {
    return null;
  }
}

/** Resolve organization membership from Supabase (via API) with env/default fallback. */
export async function resolveOrgMembership(accessToken?: string): Promise<StudioOsOrgMembership> {
  const provider = tryGetStudioOsAuthProvider();
  const user = provider?.getCurrentUser() ?? null;
  const email = user?.email?.trim().toLowerCase() ?? '';

  if (accessToken) {
    const remote = await fetchMembershipFromApi(accessToken);
    if (remote) {
      cachedMembership = remote;
      return remote;
    }
  }

  if (email && provider) {
    if (provider.isPortfolioOwnerEmail(email)) {
      cachedMembership = {
        workspaceId: STUDIO_OS_DEFAULT_WORKSPACE_ID,
        isPortfolioOwner: true,
        source: 'env-fallback',
      };
      return cachedMembership;
    }
    cachedMembership = buildEnvFallbackMembership(email);
    return cachedMembership;
  }

  cachedMembership = buildDefaultMembership();
  return cachedMembership;
}

export function ensureOrgMembershipResolved(accessToken?: string): Promise<StudioOsOrgMembership> {
  if (cachedMembership?.source === 'supabase') {
    return Promise.resolve(cachedMembership);
  }
  if (!resolvePromise) {
    resolvePromise = resolveOrgMembership(accessToken).finally(() => {
      resolvePromise = null;
    });
  }
  return resolvePromise;
}

export function getCachedOrgMembership(): StudioOsOrgMembership {
  return cachedMembership ?? buildDefaultMembership();
}

export function clearOrgMembershipCache(): void {
  cachedMembership = null;
}
