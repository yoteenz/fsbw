import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getCtrlRoomPayload, getProvisioningPayload } from '../_lib/site00Production/service.js';
import { updateServiceConnectionState } from '../_lib/site00Production/seedDemo.js';

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
 * SITE 00 client production API (signed-in clients)
 * GET ?action=provisioning|ctrl-room
 * POST action=connect-service (dev adapter — records verified connection state only)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const action = String(req.query.action ?? 'provisioning');
      switch (action) {
        case 'provisioning': {
          const slug = String(req.query.projectSlug ?? '');
          if (!slug) return res.status(400).json({ error: 'projectSlug required' });
          return res.status(200).json(await getProvisioningPayload(slug));
        }
        case 'ctrl-room':
          return res.status(200).json(await getCtrlRoomPayload(user.email));
        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      const body = parseBody(req) ?? {};
      const action = String(body.action ?? '');

      if (action === 'connect-service') {
        const projectId = String(body.projectId ?? '');
        const providerKey = String(body.providerKey ?? '');
        const connectionState = String(body.connectionState ?? 'CONNECTED');
        if (!projectId || !providerKey) {
          return res.status(400).json({ error: 'projectId and providerKey required' });
        }
        return res.status(200).json(await updateServiceConnectionState(projectId, providerKey, connectionState, 'CLIENT'));
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
