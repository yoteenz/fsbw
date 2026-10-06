import { isSupabaseMode } from '../../config/dataMode';
import { getAioSupabase } from '../../data/supabase/client';
import { approveMigrationBatch } from '../../demo/archiveMigrationActions';
import { refreshMigrationBatchCacheFromSupabase } from '../repositories/migrationBatchCache';

export async function approveMigrationBatchForOffice(input: {
  batchId: string;
  staffId: string;
  matchResolved: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseMode()) {
    if (!input.matchResolved) {
      return { ok: false, error: 'Client match must be resolved before approval' };
    }
    approveMigrationBatch(input.batchId, input.staffId);
    return { ok: true };
  }

  const supabase = getAioSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.access_token) {
    return { ok: false, error: 'Sign in as staff to approve migration' };
  }

  const res = await fetch('/api/aio/client-migration/approve-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      batchId: input.batchId,
      matchResolved: input.matchResolved,
    }),
  });

  const payload = (await res.json()) as { ok?: boolean; error?: string };
  if (!res.ok) {
    return { ok: false, error: payload.error ?? 'Approve migration failed' };
  }

  await refreshMigrationBatchCacheFromSupabase();
  return { ok: true };
}
