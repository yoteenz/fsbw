import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createOperatingAuthorityDraft } from '../../src/studio-os-core/workflow-journal/aio/profile.js';
import { createMemory, openJournal, putInvite, saveJournal } from '../../src/studio-os-core/workflow-journal/server.js';
import type { JournalDocument } from '../../src/studio-os-core/workflow-journal/types.js';

/**
 * Pilot boundary. This process memory is not durable storage and is not deployed.
 * The migration in supabase/migrations is prepared and was not applied.
 */
const memory = createMemory();
const reviewToken = 'wj-review-aio-operating-authority';

function ensureSeed(): void {
  if (memory.invites.length) return;
  putInvite(memory, {
    id: 'inv-aio-review',
    organizationId: 'all-in-one',
    expertLabel: 'Permitting lead',
    workflowId: 'operating-authority-application',
    token: reviewToken,
    expiresAt: '2027-01-01T00:00:00.000Z',
    revokedAt: null,
  });
  memory.documents.push(createOperatingAuthorityDraft());
}

function readBody(req: VercelRequest): Record<string, unknown> {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  return {};
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  ensureSeed();
  const nowIso = new Date().toISOString();
  const token = String(req.headers['x-workflow-journal-token'] ?? '');
  if (!token) return res.status(401).json({ error: 'Invite token required.', persistence: 'process_memory', durable: false });

  if (req.method === 'GET') {
    const opened = openJournal({ memory, token, nowIso });
    if (!opened.ok) return res.status(opened.status).json({ error: opened.error, durable: false });
    return res.status(200).json({ document: opened.document, durable: false, persistence: 'process_memory' });
  }

  if (req.method === 'POST') {
    const body = readBody(req);
    const document = body.document as JournalDocument | undefined;
    if (!document?.id) return res.status(400).json({ error: 'Document required.', durable: false });
    const saved = saveJournal({ memory, token, nowIso, document });
    if (!saved.ok) return res.status(saved.status).json({ error: saved.error, durable: false });
    return res.status(200).json({
      document: saved.document,
      durable: false,
      persistence: 'process_memory',
      label: 'Saved in this server process only. It will disappear when the process restarts.',
    });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
