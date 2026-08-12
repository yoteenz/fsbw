import type { SupabaseClient } from '@supabase/supabase-js';

export async function writeTrendAuditLog(
  supabase: SupabaseClient,
  params: {
    actorEmail: string | null;
    action: string;
    entityType: string;
    entityId: string;
    changeSummary?: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from('trend_audit_log').insert({
      actor_email: params.actorEmail,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      change_summary: params.changeSummary ?? null,
      details: params.details ?? {},
    });
  } catch {
    /* best-effort */
  }
}
