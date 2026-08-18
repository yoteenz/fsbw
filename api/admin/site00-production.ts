import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  approveBrief,
  decideApproval,
  generateBriefForDeliverable,
  getApprovalsPayload,
  getDashboardPayload,
  getProjectWorkspace,
  getProjectsPayload,
  getStudioPayload,
  ensureDemoProjectSeeded,
  updateServiceConnectionState,
} from '../_lib/site00Production/service.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * SITE 00 Admin Production OS API (admin-only)
 * GET ?action=dashboard|studio|approvals|projects|project
 * POST action=bootstrap-demo|approve-brief|decide-approval|generate-brief|update-service-connection|set-project-phase
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) return res.status(auth.failure.status).json({ error: auth.failure.error });

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'dashboard');
      switch (action) {
        case 'dashboard':
          return res.status(200).json(await getDashboardPayload());
        case 'studio':
          return res.status(200).json(await getStudioPayload(String(req.query.projectId ?? '') || undefined));
        case 'approvals':
          return res.status(200).json(await getApprovalsPayload(String(req.query.category ?? 'ALL')));
        case 'projects':
          return res.status(200).json(await getProjectsPayload());
        case 'project': {
          const projectId = String(req.query.projectId ?? '');
          const section = String(req.query.section ?? 'overview');
          if (!projectId) return res.status(400).json({ error: 'projectId required' });
          return res.status(200).json(await getProjectWorkspace(projectId, section));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const action = String(body.action ?? req.query.action ?? '');

      switch (action) {
        case 'bootstrap-demo':
          return res.status(200).json(await ensureDemoProjectSeeded());
        case 'approve-brief': {
          const briefId = String(body.briefId ?? '');
          if (!briefId) return res.status(400).json({ error: 'briefId required' });
          return res.status(200).json(await approveBrief(briefId, auth.user.id));
        }
        case 'decide-approval': {
          const approvalId = String(body.approvalId ?? '');
          const decision = String(body.decision ?? 'APPROVE');
          if (!approvalId) return res.status(400).json({ error: 'approvalId required' });
          return res.status(200).json(
            await decideApproval(approvalId, decision, auth.user.id, body.notes ? String(body.notes) : undefined),
          );
        }
        case 'generate-brief': {
          const projectId = String(body.projectId ?? '');
          const deliverableKey = String(body.deliverableKey ?? 'homepage_visual_direction');
          if (!projectId) return res.status(400).json({ error: 'projectId required' });
          return res.status(200).json(await generateBriefForDeliverable(projectId, deliverableKey));
        }
        case 'update-service-connection': {
          const projectId = String(body.projectId ?? '');
          const providerKey = String(body.providerKey ?? '');
          const connectionState = String(body.connectionState ?? 'CONNECTED');
          if (!projectId || !providerKey) {
            return res.status(400).json({ error: 'projectId and providerKey required' });
          }
          return res.status(200).json(await updateServiceConnectionState(projectId, providerKey, connectionState, 'ADMIN'));
        }
        case 'set-project-phase': {
          const projectId = String(body.projectId ?? '');
          const phase = String(body.phase ?? '');
          if (!projectId || !phase) return res.status(400).json({ error: 'projectId and phase required' });
          const { getSupabaseAdmin } = await import('../_lib/supabase.js');
          const { refreshProjectDerivedState } = await import('../_lib/site00Production/seedDemo.js');
          const supabase = getSupabaseAdmin();
          await supabase.from('site00_projects').update({ current_phase: phase }).eq('id', projectId);
          return res.status(200).json(await refreshProjectDerivedState(projectId));
        }
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
