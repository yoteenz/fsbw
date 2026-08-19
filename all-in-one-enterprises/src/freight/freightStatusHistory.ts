import type { SupabaseClient } from '@supabase/supabase-js';

export async function recordLoadStatusTransition(
  supabase: SupabaseClient | null,
  loadId: string,
  fromStatus: string,
  toStatus: string,
  actorUserId?: string,
  note?: string,
  actorLabel?: string,
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('aio_load_status_history').insert({
    load_id: loadId,
    from_status: fromStatus,
    to_status: toStatus,
    actor_user_id: actorUserId ?? null,
    actor_label: actorLabel,
    note,
  });

  if (error) {
    console.error('[freight] status history insert failed', { loadId, code: error.code });
  }
}
