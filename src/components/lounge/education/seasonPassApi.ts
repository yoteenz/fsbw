import { apiFetch } from '../../../utils/api';
import type { SeasonPassEntitlement } from '../../../content/education/types';

export type SeasonPassStateResponse = {
  seasonPasses: SeasonPassEntitlement[];
};

export async function fetchSeasonPassEntitlements(): Promise<SeasonPassStateResponse | null> {
  const res = await apiFetch('/api/education/season-pass/entitlements');
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return (await res.json()) as SeasonPassStateResponse;
}

export async function syncSeasonPassGrants(seasonId?: string): Promise<{ grantedEpisodeIds: string[] } | null> {
  const res = await apiFetch('/api/education/season-pass/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seasonId ? { seasonId } : {}),
  });
  if (!res.ok) return null;
  return (await res.json()) as { grantedEpisodeIds: string[] };
}

export async function redeemSeasonPass(params: {
  seasonId: string;
  ticketCost: number;
}): Promise<
  | { ok: true; balance: number; seasonPass: SeasonPassEntitlement; grantedEpisodeIds?: string[] }
  | { error: string; balance?: number }
> {
  const res = await apiFetch('/api/education/season-pass/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    return {
      error: String(data.error ?? 'Redeem failed'),
      balance: typeof data.balance === 'number' ? data.balance : undefined,
    };
  }
  return data as {
    ok: true;
    balance: number;
    seasonPass: SeasonPassEntitlement;
    grantedEpisodeIds?: string[];
  };
}
