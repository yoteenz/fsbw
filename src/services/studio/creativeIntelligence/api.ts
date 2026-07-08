import {
  adminApiAuthErrorMessage,
  apiFetch,
  ensureApiAccessToken,
} from '../../../utils/api';
import type {
  CreativeIntelligenceDecision,
  FounderIntentInput,
  LearningSignalInput,
} from '../../../studio-os-core/creative-intelligence-engine/types';

type ApiError = { ok: false; error: string; code?: string };

async function cieFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T | ApiError> {
  const token = await ensureApiAccessToken();
  if (!token) {
    return {
      ok: false,
      error: adminApiAuthErrorMessage(401, 'Sign in required', 'MISSING_TOKEN'),
      code: 'MISSING_TOKEN',
    };
  }

  const res = await apiFetch(path, {
    method: init?.method ?? 'GET',
    body: init?.body,
  });
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return { ok: false, error: `CIE request failed (${res.status})` };
  }
  if (!res.ok) {
    return {
      ok: false,
      error:
        adminApiAuthErrorMessage(
          res.status,
          typeof data.error === 'string' ? data.error : undefined,
          typeof data.code === 'string' ? data.code : undefined
        ) ||
        (typeof data.error === 'string' ? data.error : undefined) ||
        `CIE request failed (${res.status})`,
      code: typeof data.code === 'string' ? data.code : undefined,
    };
  }
  return data as T;
}

export async function evaluateCreativeIntelligence(
  intent: FounderIntentInput
): Promise<{ ok: true; decision: CreativeIntelligenceDecision } | ApiError> {
  return cieFetch('/api/admin/studio-creative-intelligence', {
    method: 'POST',
    body: { action: 'evaluate', intent, org_id: intent.org_id },
  });
}

export async function getCreativeIntelligenceDecision(
  decisionId: string,
  orgId = 'frontal-slayer'
): Promise<{ ok: true; decision: CreativeIntelligenceDecision } | ApiError> {
  return cieFetch(
    `/api/admin/studio-creative-intelligence?decision_id=${encodeURIComponent(decisionId)}&org_id=${encodeURIComponent(orgId)}`
  );
}

export async function recordCreativeLearningSignal(
  signal: LearningSignalInput
): Promise<{ ok: true; signal_id: string; genome_hint: string } | ApiError> {
  return cieFetch('/api/admin/studio-creative-intelligence', {
    method: 'POST',
    body: { ...signal, action: 'learning' },
  });
}

/** Kernel adapter for runCreativeIntelligenceGate */
export async function evaluateForKernelGate(
  intent: FounderIntentInput
): Promise<{ ok: boolean; decision?: CreativeIntelligenceDecision; error?: string; code?: string }> {
  const result = await evaluateCreativeIntelligence(intent);
  if (!result.ok) {
    return { ok: false, error: result.error, code: result.code };
  }
  return { ok: true, decision: result.decision };
}
