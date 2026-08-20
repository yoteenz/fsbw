/**
 * Virtual Production OS — client API
 */

import { PRODUCTION_PROVIDERS } from '../../../studio-os-core/virtual-production';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function vpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

export type CampaignSummary = {
  id: string;
  campaign_key: string;
  name: string;
  production_mode: string;
  lifecycle_status: string;
  approval_state: string;
};

export type ShotRow = {
  id: string;
  shot_key: string;
  sort_order: number;
  description?: string;
  approval_state: string;
  qc_summary: Record<string, unknown>;
  production_mode?: string;
  provider_id?: string;
  metadata?: Record<string, unknown>;
};

export async function seedReferenceTenant(orgId = 'frontal-slayer') {
  return vpFetch<{ ok: boolean; brandId: string; campaignId: string }>(
    '/api/admin/studio-virtual-production',
    { method: 'POST', body: JSON.stringify({ action: 'seed_reference', org_id: orgId }) }
  );
}

export async function listCampaigns(orgId = 'frontal-slayer') {
  return vpFetch<{ ok: boolean; campaigns: CampaignSummary[] }>(
    `/api/admin/studio-virtual-production?action=campaigns&org_id=${encodeURIComponent(orgId)}`
  );
}

export async function getProductionBoard(orgId: string, campaignId: string) {
  return vpFetch<{ ok: boolean; campaign: Record<string, unknown>; shots: ShotRow[] }>(
    `/api/admin/studio-virtual-production?action=board&org_id=${encodeURIComponent(orgId)}&campaign_id=${encodeURIComponent(campaignId)}`
  );
}

export async function createCampaign(input: {
  orgId?: string;
  brandId: string;
  name: string;
  productionMode: string;
  objective?: string;
}) {
  return vpFetch<{ ok: boolean; campaign: Record<string, unknown> }>(
    '/api/admin/studio-virtual-production',
    {
      method: 'POST',
      body: JSON.stringify({
        action: 'create_campaign',
        org_id: input.orgId ?? 'frontal-slayer',
        brand_id: input.brandId,
        name: input.name,
        production_mode: input.productionMode,
        objective: input.objective,
      }),
    }
  );
}

export async function exportDirectorPackage(orgId: string, campaignId: string) {
  return vpFetch<{ ok: boolean; markdown: string }>(
    '/api/admin/studio-virtual-production',
    {
      method: 'POST',
      body: JSON.stringify({
        action: 'export_director_package',
        org_id: orgId,
        campaign_id: campaignId,
      }),
    }
  );
}

export function getLocalProviders() {
  return PRODUCTION_PROVIDERS;
}
