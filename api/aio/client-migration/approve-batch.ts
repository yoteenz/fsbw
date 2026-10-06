import { createClient } from '@supabase/supabase-js';
import { supabaseApproveMigrationBatch } from '../../../all-in-one-enterprises/src/client-migration/server/supabaseApproveMigration';
import { getAioSupabaseAnonUrl } from '../../../all-in-one-enterprises/src/client-migration/server/aioSupabaseAdmin';

export const config = {
  runtime: 'nodejs',
};

type Body = {
  batchId: string;
  matchResolved: boolean;
  idempotencyKey?: string;
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const cfg = getAioSupabaseAnonUrl();
  if (!cfg) return json({ error: 'Backend not configured' }, 503);

  const userClient = createClient(cfg.url, cfg.anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { data: staffRow } = await userClient
    .from('aio_internal_staff')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!staffRow) {
    return json({ error: 'Forbidden — staff only' }, 403);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!body.batchId) return json({ error: 'batchId required' }, 400);

  const result = await supabaseApproveMigrationBatch({
    batchId: body.batchId,
    matchResolved: Boolean(body.matchResolved),
    staffUserId: userData.user.id,
    idempotencyKey: body.idempotencyKey,
  });

  if (!result.ok) return json({ error: result.error }, 400);
  return json(result, 200);
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
