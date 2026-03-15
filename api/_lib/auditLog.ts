import { getSupabaseAdmin } from './supabase';

export type AuditAction = 'profile.update' | 'order.update' | 'cart.update' | 'wishlist.update' | 'review.update' | 'meeting.create' | 'meeting.update' | 'meeting.delete' | 'notification.create';

export async function writeAuditLog(params: {
  actorId: string | null;
  actorEmail: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('audit_log').insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId ?? null,
      details: params.details ?? {},
    });
  } catch {
    /* ignore */
  }
}
