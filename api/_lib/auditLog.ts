import { getSupabaseAdmin } from './supabase';

export type AuditAction =
  | 'profile.update'
  | 'order.update'
  | 'cart.update'
  | 'wishlist.update'
  | 'review.update'
  | 'meeting.create'
  | 'meeting.update'
  | 'meeting.delete'
  | 'meeting.client_alert'
  | 'notification.create'
  | 'app_config.upsert'
  | 'newsletter.send'
  | 'consult_quote.create'
  | 'pending_order_form.approve'
  | 'pending_order_form.decline'
  | 'pending_affiliate.approve'
  | 'pending_affiliate.decline'
  | 'pending_review_supplemental.approve'
  | 'pending_review_supplemental.decline'
  | 'reviews.publish'
  | 'reviews.reject';

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
