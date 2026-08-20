/**
 * Virtual Production OS — client API
 */

import { apiFetch } from '../../../utils/api';
import { PRODUCTION_PROVIDERS } from '../../../studio-os-core/virtual-production';

/** Safari/WebKit throws "The string did not match the expected pattern." on Response.json() when body is HTML. */
async function parseVpJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const raw = await res.text();
  const trimmed = raw.trim();

  if (!trimmed) {
    if (!res.ok) throw new Error(`Virtual Production API ${res.status}`);
    return {} as T;
  }

  const looksJson =
    /application\/json/i.test(contentType) || trimmed.startsWith('{') || trimmed.startsWith('[');

  if (!looksJson) {
    if (/DEPLOYMENT_DISABLED|Payment required/i.test(trimmed)) {
      throw new Error(
        'Vercel API is unavailable (deployment disabled). Refresh after the dev server restarts — VP now uses a local API on preview.',
      );
    }
    if (/^<!DOCTYPE|^<html/i.test(trimmed)) {
      throw new Error(
        'Virtual Production API is not reachable (received HTML instead of JSON). Sign in as admin and refresh.',
      );
    }
    throw new Error(trimmed.slice(0, 160) || `Virtual Production API ${res.status}`);
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error('Virtual Production API returned invalid JSON');
  }
}

function throwVpApiError(res: Response, data: { error?: string; code?: string }) {
  if (res.status === 401 || data.code === 'MISSING_TOKEN') {
    throw new Error('Sign in as an admin to use Virtual Production.');
  }
  if (data.code === 'NOT_ADMIN') {
    throw new Error('Your account does not have Virtual Production admin access.');
  }
  throw new Error(data.error ?? `Virtual Production API ${res.status}`);
}

async function vpFetch<T>(
  path: string,
  init?: Omit<RequestInit, 'body'> & { body?: Record<string, unknown> }
): Promise<T> {
  const { body, ...fetchInit } = init ?? {};
  const res = await apiFetch(path, {
    ...fetchInit,
    ...(body !== undefined ? { body } : {}),
  });
  const json = await parseVpJson<T & { error?: string; code?: string }>(res);
  if (!res.ok) throwVpApiError(res, json);
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
  duration_seconds?: number;
  identity_criticality?: string;
  product_criticality?: string;
  environment_criticality?: string;
  metadata?: Record<string, unknown>;
};

export async function seedReferenceTenant(orgId = 'frontal-slayer') {
  return vpFetch<{ ok: boolean; brandId: string; campaignId: string }>(
    '/api/admin/studio-virtual-production',
    { method: 'POST', body: { action: 'seed_reference', org_id: orgId } }
  );
}

export async function seedFsCanonCampaign001(orgId = 'frontal-slayer') {
  return vpFetch<{
    ok: boolean;
    brandId: string;
    campaignId: string;
    characterId: string;
    referencePackId: string;
    shotIds: string[];
  }>('/api/admin/studio-virtual-production', {
    method: 'POST',
    body: { action: 'seed_fs_canon_campaign001', org_id: orgId },
  });
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
      body: {
        action: 'create_campaign',
        org_id: input.orgId ?? 'frontal-slayer',
        brand_id: input.brandId,
        name: input.name,
        production_mode: input.productionMode,
        objective: input.objective,
      },
    }
  );
}

export async function exportDirectorPackage(orgId: string, campaignId: string) {
  return vpFetch<{ ok: boolean; markdown: string }>(
    '/api/admin/studio-virtual-production',
    {
      method: 'POST',
      body: {
        action: 'export_director_package',
        org_id: orgId,
        campaign_id: campaignId,
      },
    }
  );
}

export function getLocalProviders() {
  return PRODUCTION_PROVIDERS;
}

// ─── Reference Pack V1 operator API ─────────────────────────────────────────

export type ReferencePackBoardResponse = {
  ok: boolean;
  pack: { id: string; locked?: boolean; locked_at?: string | null } | null;
  slots: Array<{
    slot: string;
    label: string;
    record: {
      state: string;
      approvedAssetId?: string;
      approvedMediaUrl?: string;
      candidateAssetId?: string;
      candidateMediaUrl?: string;
      notes?: string;
    };
  }>;
  primaryAnchor: {
    assetId: string;
    mediaUrl?: string;
    source?: string;
    providerId?: string;
  } | null;
  rejectedCount?: number;
  campaignIdentityGate?: {
    evaluated?: { status: 'blocked' | 'pass' };
  };
};

export async function getReferencePackBoard(orgId = 'frontal-slayer') {
  return vpFetch<ReferencePackBoardResponse>(
    `/api/admin/studio-virtual-production?action=reference_pack_board&org_id=${encodeURIComponent(orgId)}`
  );
}

export async function uploadReferencePackSlot(input: {
  orgId?: string;
  packId: string;
  slot: string;
  imageDataUrl: string;
  autoApprove?: boolean;
}) {
  return vpFetch<{
    ok: boolean;
    publicUrl: string;
    asset: { id: string };
  }>('/api/admin/studio-virtual-production', {
    method: 'POST',
    body: {
      action: 'reference_pack_upload_and_assign',
      org_id: input.orgId ?? 'frontal-slayer',
      pack_id: input.packId,
      slot: input.slot,
      image_data_url: input.imageDataUrl,
      auto_approve: input.autoApprove ?? false,
    },
  });
}

export async function approveReferencePackSlotClient(input: {
  orgId?: string;
  packId: string;
  slot: string;
  assetId: string;
  mediaUrl?: string;
}) {
  return vpFetch<{ ok: boolean }>('/api/admin/studio-virtual-production', {
    method: 'POST',
    body: {
      action: 'reference_pack_approve_slot',
      org_id: input.orgId ?? 'frontal-slayer',
      pack_id: input.packId,
      slot: input.slot,
      asset_id: input.assetId,
      media_url: input.mediaUrl,
      qc: [
        { category: 'identity', status: 'pass', notes: 'MANUAL IDENTITY QC — operator approved' },
        { category: 'overall', status: 'pass' },
      ],
    },
  });
}

export async function rejectReferencePackSlotClient(input: {
  orgId?: string;
  packId: string;
  slot: string;
  candidateAssetId: string;
  reason?: string;
}) {
  return vpFetch<{ ok: boolean }>('/api/admin/studio-virtual-production', {
    method: 'POST',
    body: {
      action: 'reference_pack_reject_slot',
      org_id: input.orgId ?? 'frontal-slayer',
      pack_id: input.packId,
      slot: input.slot,
      candidate_asset_id: input.candidateAssetId,
      reason: input.reason ?? 'Identity QC — rejected by operator',
      qc: [{ category: 'identity', status: 'fail', notes: 'MANUAL IDENTITY QC' }],
    },
  });
}

export async function setReferencePackAnchorClient(input: {
  orgId?: string;
  packId: string;
  assetId: string;
  mediaUrl?: string;
}) {
  return vpFetch<{ ok: boolean }>('/api/admin/studio-virtual-production', {
    method: 'POST',
    body: {
      action: 'reference_pack_set_anchor',
      org_id: input.orgId ?? 'frontal-slayer',
      pack_id: input.packId,
      asset_id: input.assetId,
      media_url: input.mediaUrl,
      source: 'operator_designated',
      provider_id: 'upload',
    },
  });
}

export async function lockReferencePackV1Client(input: { orgId?: string; packId: string }) {
  return vpFetch<{ ok: boolean }>('/api/admin/studio-virtual-production', {
    method: 'POST',
    body: {
      action: 'reference_pack_lock_v1',
      org_id: input.orgId ?? 'frontal-slayer',
      pack_id: input.packId,
    },
  });
}
