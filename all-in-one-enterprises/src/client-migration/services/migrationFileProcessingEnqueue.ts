import { getAioSupabase } from '../../data/supabase/client';

/** Fire durable server processing — job continues if the browser closes. */
export async function enqueueMigrationBatchFileProcessing(input: {
  batchFileId: string;
  batchId: string;
  organizationId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getAioSupabase();
  if (!supabase) return { ok: false, error: 'Backend is not configured.' };

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { ok: false, error: 'Staff session required.' };

  try {
    const res = await fetch('/api/aio/client-migration/process-batch-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: payload.error ?? `Processing failed (${res.status})` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach migration processing service.' };
  }
}
