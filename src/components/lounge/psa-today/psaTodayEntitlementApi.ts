import type { PSAEpisodeEntitlement, PSAWatchSession } from './types';
import { apiFetch } from '../../../utils/api';

export async function fetchPsaEntitlements(episodeId?: string): Promise<{
  entitlements: PSAEpisodeEntitlement[];
  activeEntitlement: PSAEpisodeEntitlement | null;
} | null> {
  const qs = episodeId ? `?episodeId=${encodeURIComponent(episodeId)}` : '';
  const res = await apiFetch(`/api/psa-today/entitlements${qs}`);
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return (await res.json()) as {
    entitlements: PSAEpisodeEntitlement[];
    activeEntitlement: PSAEpisodeEntitlement | null;
  };
}

export async function redeemPsaEpisode(params: {
  episodeId: string;
  contentId: string;
  ticketCost: number;
  contentTitle?: string;
  includedWatches?: number;
  accessDurationYears?: number;
}): Promise<
  | { balance: number; entitlement: PSAEpisodeEntitlement; alreadyActive?: boolean }
  | { error: string; balance?: number }
> {
  const res = await apiFetch('/api/psa-today/redeem', { method: 'POST', body: params });
  const data = (await res.json()) as {
    balance?: number;
    entitlement?: PSAEpisodeEntitlement;
    alreadyActive?: boolean;
    error?: string;
  };
  if (!res.ok) return { error: data.error || 'Redeem failed', balance: data.balance };
  if (!data.entitlement) return { error: 'Missing entitlement', balance: data.balance };
  return { balance: data.balance ?? 0, entitlement: data.entitlement, alreadyActive: data.alreadyActive };
}

export async function startPsaWatchSessionApi(params: {
  episodeId: string;
  entitlementId: string;
  qualificationThresholdSeconds: number;
}): Promise<PSAWatchSession | null> {
  const res = await apiFetch('/api/psa-today/watch-session', { method: 'POST', body: params });
  if (!res.ok) return null;
  const data = (await res.json()) as { session?: PSAWatchSession };
  return data.session ?? null;
}

export async function syncPsaWatchSessionApi(params: {
  sessionId: string;
  actualWatchedSeconds: number;
  consumeIfQualified?: boolean;
}): Promise<{
  session: PSAWatchSession;
  entitlement: PSAEpisodeEntitlement;
  watchConsumed: boolean;
} | null> {
  const res = await apiFetch('/api/psa-today/watch-session', { method: 'PATCH', body: params });
  if (!res.ok) return null;
  return (await res.json()) as {
    session: PSAWatchSession;
    entitlement: PSAEpisodeEntitlement;
    watchConsumed: boolean;
  };
}

export async function closePsaWatchSessionApi(sessionId: string): Promise<PSAWatchSession | null> {
  const res = await apiFetch('/api/psa-today/watch-session', { method: 'DELETE', body: { sessionId } });
  if (!res.ok) return null;
  const data = (await res.json()) as { session?: PSAWatchSession };
  return data.session ?? null;
}
