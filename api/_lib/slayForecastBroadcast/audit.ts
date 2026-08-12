import type { SupabaseClient } from '@supabase/supabase-js';
import { logBroadcastAudit } from './audit.js';

export async function logBroadcastAudit(
  supabase: SupabaseClient,
  entry: {
    actorEmail: string | null;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
  },
) {
  await supabase.from('slay_forecast_broadcast_audit_log').insert({
    actor_email: entry.actorEmail,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    details: entry.details ?? {},
  });
}
