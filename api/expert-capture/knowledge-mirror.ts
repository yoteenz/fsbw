import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const body = req.body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) return body as Record<string, unknown>;
  return {};
}

function cors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Guest-Session-Id');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!hasSupabaseServiceRole()) {
    return res.status(503).json({ error: 'Knowledge mirror server storage not configured', offline: true });
  }

  const admin = getSupabaseAdminServiceRole();

  if (req.method === 'GET') {
    const programId = typeof req.query.programId === 'string' ? req.query.programId : '';
    if (!programId) return res.status(400).json({ error: 'Missing programId' });
    const { data, error } = await admin
      .from('expert_capture_knowledge_programs')
      .select('program_document')
      .eq('program_id', programId)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Program not found' });
    return res.status(200).json({ program: data.program_document });
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    const program = body.program as Record<string, unknown> | undefined;
    if (!program?.programId) return res.status(400).json({ error: 'Missing program' });

    const programId = String(program.programId);
    const { error } = await admin.from('expert_capture_knowledge_programs').upsert(
      {
        program_id: programId,
        profile_id: String(program.profileId ?? ''),
        company_id: String(program.companyId ?? ''),
        expert_name: String(program.expertName ?? 'Expert'),
        program_document: program,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'program_id' }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, serverConfirmed: true });
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
}
