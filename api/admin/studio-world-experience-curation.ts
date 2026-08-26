import type { VercelRequest, VercelResponse } from '@vercel/node';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { requireAdmin } from '../_lib/adminAuth.js';
import {
  executeCurationAction,
  startCurationReviewSession,
} from '../../src/studio-os-core/route-intelligence/experience-curation/curation-actions.ts';
import {
  loadExperienceCurationStore,
  saveExperienceCurationStore,
} from '../../src/studio-os-core/route-intelligence/experience-curation/override-store.ts';
import type { CurationActionType } from '../../src/studio-os-core/route-intelligence/types.ts';

/**
 * POST /api/admin/studio-world-experience-curation
 * Body: { projectId, action, targetId?, targetIds?, reason?, value?, payload?, sessionId?, confirmProtectedDemotion? }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const repoRoot = process.cwd();
  const manifestPath = join(repoRoot, 'public/studio-world/studio-world-design-route-manifest.json');
  if (!existsSync(manifestPath)) {
    return res.status(503).json({ error: 'Manifest not compiled — run npm run compile:design-pages' });
  }

  const body = req.body ?? {};
  const projectId = typeof body.projectId === 'string' ? body.projectId.trim() : '';
  const action = typeof body.action === 'string' ? (body.action as CurationActionType) : undefined;
  if (!projectId || !action) {
    return res.status(400).json({ error: 'projectId and action required' });
  }

  let sessionId = typeof body.sessionId === 'string' ? body.sessionId : undefined;
  if (body.startSession) {
    let store = loadExperienceCurationStore(repoRoot);
    const { store: s, session } = startCurationReviewSession(store, projectId, admin.email ?? 'FOUNDER');
    saveExperienceCurationStore(repoRoot, s);
    sessionId = session.sessionId;
  }

  const result = executeCurationAction(repoRoot, {
    projectId,
    action,
    targetId: typeof body.targetId === 'string' ? body.targetId : undefined,
    targetIds: Array.isArray(body.targetIds) ? body.targetIds : undefined,
    reviewer: admin.email ?? 'FOUNDER',
    reason: typeof body.reason === 'string' ? body.reason : undefined,
    value: typeof body.value === 'string' ? body.value : undefined,
    payload: body.payload && typeof body.payload === 'object' ? body.payload : undefined,
    sessionId,
    notes: typeof body.notes === 'string' ? body.notes : undefined,
    confirmProtectedDemotion: body.confirmProtectedDemotion === true,
  });

  if (!result.ok) {
    return res.status(400).json({ error: result.error, bundle: result.bundle });
  }

  return res.status(200).json({
    ok: true,
    sessionId,
    bundle: result.bundle,
    receipt: result.receipt,
    reviewReceipt: result.reviewReceipt,
    lockReceipt: result.lockReceipt,
  });
}
