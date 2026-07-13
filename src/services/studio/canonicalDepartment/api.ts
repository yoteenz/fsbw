import { apiFetch, ensureApiAccessToken, adminApiAuthErrorMessage } from '../../../utils/api';
import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import type { CanonicalQueueSnapshot } from '../../../studio-os-core/canonical-studio-world/canonical-department-queue';

export type CanonicalQueueSubmitResponse = {
  ok: boolean;
  batchId?: string;
  queuedJobIds?: string[];
  queue?: CanonicalQueueSnapshot;
  code?: string;
  message?: string;
  error?: string;
};

export async function fetchCanonicalDepartmentQueue(): Promise<{ ok: boolean; queue?: CanonicalQueueSnapshot; error?: string }> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return { ok: false, error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN') };
  }

  const res = await apiFetch('/api/admin/canonical-department-generation?view=queue', { method: 'GET' });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; queue?: CanonicalQueueSnapshot; message?: string };
  if (!res.ok) {
    return { ok: false, error: data.message ?? `Queue fetch failed (${res.status})` };
  }
  return { ok: true, queue: data.queue };
}

export async function pollCanonicalDepartmentQueue(): Promise<{ ok: boolean; queue?: CanonicalQueueSnapshot; error?: string }> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return { ok: false, error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN') };
  }

  const res = await apiFetch('/api/admin/canonical-department-generation', {
    method: 'POST',
    body: { action: 'queue-status' },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; queue?: CanonicalQueueSnapshot; message?: string };
  if (!res.ok) {
    return { ok: false, error: data.message ?? `Queue poll failed (${res.status})` };
  }
  return { ok: true, queue: data.queue };
}

export async function submitCanonicalDepartmentQueue(input: {
  departmentIds: CanonicalMainDepartmentId[];
  confirmed: boolean;
}): Promise<CanonicalQueueSubmitResponse> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return { ok: false, error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'), code: 'MISSING_TOKEN' };
  }

  const res = await apiFetch('/api/admin/canonical-department-generation', {
    method: 'POST',
    body: { action: 'queue', departmentIds: input.departmentIds, confirmed: input.confirmed },
  });
  const data = (await res.json().catch(() => ({}))) as CanonicalQueueSubmitResponse;
  if (!res.ok) {
    return {
      ok: false,
      error: data.message ?? data.error ?? `Queue submit failed (${res.status})`,
      code: data.code,
    };
  }
  return data;
}
