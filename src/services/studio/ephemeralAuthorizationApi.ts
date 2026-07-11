import { apiFetch, ensureApiAccessToken } from '../../utils/api';
import type { EphemeralCompileAuthGrant } from '../../studio-os-core/creative-production/ephemeral-compile-auth-session';

export type IssueEphemeralAuthPayload = {
  compileRunId: string;
  previewSessionId: string;
  organizationId: string;
  departmentId: string;
  stationId: string;
  projectId: string;
};

export async function requestExperienceLabEphemeralAuthorization(
  payload: IssueEphemeralAuthPayload
): Promise<{ ok: true; grant: EphemeralCompileAuthGrant } | { ok: false; error: string; code?: string }> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return { ok: false, error: 'Sign in required to issue ephemeral compile authorization', code: 'MISSING_TOKEN' };
  }

  const res = await apiFetch('/api/admin/experience-lab-ephemeral-authorization', {
    method: 'POST',
    body: payload,
  });

  const text = await res.text();
  let data: { ok?: boolean; grant?: EphemeralCompileAuthGrant; error?: string; code?: string } = {};
  try {
    data = text ? (JSON.parse(text) as typeof data) : {};
  } catch {
    return { ok: false, error: `Authorization issue failed (${res.status})`, code: 'AUTH_ISSUE_PARSE' };
  }

  if (!res.ok || !data.ok || !data.grant) {
    return {
      ok: false,
      error: data.error ?? `Authorization issue failed (${res.status})`,
      code: data.code,
    };
  }

  return { ok: true, grant: data.grant };
}
