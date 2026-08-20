/**
 * Structured observability — never log secrets.
 */

export type VirtualProductionLogEvent =
  | 'campaign_created'
  | 'production_job_created'
  | 'provider_selected'
  | 'generation_requested'
  | 'generation_succeeded'
  | 'generation_failed'
  | 'asset_imported'
  | 'qc_submitted'
  | 'repair_created'
  | 'approval_changed'
  | 'supersession_applied'
  | 'assembly_updated';

export type VirtualProductionLogPayload = {
  event: VirtualProductionLogEvent;
  orgId: string;
  campaignId?: string;
  shotId?: string;
  providerId?: string;
  jobKey?: string;
  errorCategory?: string;
  timestamp: string;
};

const SECRET_PATTERN = /(api[_-]?key|secret|token|password|authorization)/i;

export function sanitizeLogPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (SECRET_PATTERN.test(key)) {
      out[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      out[key] = sanitizeLogPayload(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function logVirtualProductionEvent(
  event: VirtualProductionLogEvent,
  payload: Omit<VirtualProductionLogPayload, 'event' | 'timestamp'> & Record<string, unknown>
): void {
  const entry: VirtualProductionLogPayload = {
    event,
    orgId: payload.orgId,
    campaignId: payload.campaignId,
    shotId: payload.shotId,
    providerId: payload.providerId,
    jobKey: payload.jobKey,
    errorCategory: payload.errorCategory,
    timestamp: new Date().toISOString(),
  };

  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
    console.info('[studio-vp]', JSON.stringify(sanitizeLogPayload({ ...entry, ...payload })));
  }
}
