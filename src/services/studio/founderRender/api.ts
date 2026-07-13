import { apiFetch, ensureApiAccessToken, adminApiAuthErrorMessage } from '../../../utils/api';
import type { ConstructionPlan } from '../../../studio-os-core/blueprint-author/construction-plan-schema';
import type { FounderRenderDiagnostics, FounderRenderJobStatus } from '../../../studio-os-core/founder-render/contract';

export type FounderRenderGenerateResponse = {
  ok: boolean;
  jobId?: string;
  status?: FounderRenderJobStatus;
  error?: string;
  code?: string;
  missingRole?: string;
  artifactIntent?: string;
  modelRoute?: string;
  providerModel?: string;
  promptVersion?: string;
  blueprintRevision?: number;
};

export type FounderRenderStatusResponse = {
  ok: boolean;
  jobId?: string;
  status?: FounderRenderJobStatus;
  previewArtifactUrl?: string | null;
  failureReason?: string | null;
  blueprintRevision?: number;
  currentBlueprintRevision?: number;
  isStale?: boolean;
  modelRoute?: string | null;
  providerModel?: string | null;
  promptVersion?: string;
  approvalStatus?: string;
  diagnostics?: FounderRenderDiagnostics | null;
  error?: string;
  code?: string;
};

export async function requestFounderRenderGenerate(input: {
  plan: ConstructionPlan;
  revisionNote?: string | null;
}): Promise<FounderRenderGenerateResponse> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return { ok: false, error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'), code: 'MISSING_TOKEN' };
  }

  const res = await apiFetch('/api/admin/founder-render-generate', {
    method: 'POST',
    body: { plan: input.plan, revisionNote: input.revisionNote ?? null },
  });
  const text = await res.text();
  let data: FounderRenderGenerateResponse = { ok: false };
  try {
    data = text ? (JSON.parse(text) as FounderRenderGenerateResponse) : { ok: false };
  } catch {
    const snippet = text.trim().slice(0, 200);
    data = {
      ok: false,
      error: snippet
        ? `Founder render failed (${res.status}): ${snippet}`
        : `Founder render failed (${res.status})`,
      code: 'FOUNDER_RENDER_NON_JSON',
    };
  }
  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? `Founder render failed (${res.status})`,
      code: data.code ?? 'FOUNDER_RENDER_HTTP_ERROR',
      missingRole: data.missingRole,
    };
  }
  return data;
}

export async function pollFounderRenderStatus(
  jobId: string,
  currentBlueprintRevision: number,
  options?: { signal?: AbortSignal; onProgress?: (status: FounderRenderJobStatus) => void }
): Promise<FounderRenderStatusResponse> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (options?.signal?.aborted) {
      return { ok: false, error: 'Aborted', code: 'ABORTED' };
    }
    const token = await ensureApiAccessToken();
    if (!token) {
      return { ok: false, error: 'Sign in required', code: 'MISSING_TOKEN' };
    }
    const qs = new URLSearchParams({
      jobId,
      currentBlueprintRevision: String(currentBlueprintRevision),
    });
    const res = await apiFetch(`/api/admin/founder-render-status?${qs.toString()}`, { method: 'GET' });
    const text = await res.text();
    let data: FounderRenderStatusResponse = { ok: false };
    try {
      data = text ? (JSON.parse(text) as FounderRenderStatusResponse) : { ok: false };
    } catch {
      return { ok: false, error: `Status poll failed (${res.status})` };
    }
    if (!res.ok) return { ok: false, error: data.error ?? `Status poll failed (${res.status})`, code: data.code };

    if (data.status) options?.onProgress?.(data.status);

    if (data.status === 'ready' || data.status === 'approved' || data.status === 'failed' || data.status === 'stale') {
      return data;
    }

    await new Promise((r) => setTimeout(r, 2500));
  }
  return { ok: false, error: 'Founder render timed out', code: 'TIMEOUT' };
}

export async function requestFounderRenderApprove(input: {
  jobId: string;
  currentBlueprintRevision: number;
  materialSet: string;
  lightingProfile: string;
  cameraProfile: string;
}): Promise<{ ok: boolean; error?: string; code?: string }> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return { ok: false, error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'), code: 'MISSING_TOKEN' };
  }

  const res = await apiFetch('/api/admin/founder-render-approve', {
    method: 'POST',
    body: input,
  });
  const text = await res.text();
  let data: { ok: boolean; error?: string; code?: string } = { ok: false };
  try {
    data = text ? (JSON.parse(text) as { ok: boolean; error?: string; code?: string }) : { ok: false };
  } catch {
    return { ok: false, error: `Approval failed (${res.status})` };
  }
  if (!res.ok) return { ok: false, error: data.error ?? `Approval failed (${res.status})`, code: data.code };
  return data;
}
