export const config = { maxDuration: 120 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminFounder } from '../_lib/adminAuth.js';
import { writeAuditLog } from '../_lib/auditLog.js';
import {
  runLiveTryOnBatchStep,
  type LiveTryOnBatchJob,
  type LiveTryOnBatchStep,
} from '../_lib/liveTryOnBatchGenerate.js';
import { parseLiveTryOnPhotoModel, type LiveTryOnAngle } from '../_lib/liveTryOnOverlay.js';

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

function readString(obj: Record<string, unknown>, key: string, fallback = ''): string {
  const v = obj[key];
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function readStringArray(obj: Record<string, unknown>, key: string): string[] {
  const v = obj[key];
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim().toUpperCase()).filter(Boolean);
}

function readStep(obj: Record<string, unknown>): LiveTryOnBatchStep | null {
  const s = readString(obj, 'step', '').toLowerCase();
  if (s === 'portrait' || s === 'overlay') return s;
  return null;
}

function readAngle(obj: Record<string, unknown>): LiveTryOnAngle | null {
  const a = readString(obj, 'angle', '').toLowerCase();
  if (a === 'left' || a === 'front' || a === 'right') return a;
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const admin = await requireAdminFounder(req);
  if (!admin) {
    res.status(403).json({ error: 'Forbidden — founder admin required for try-on batch' });
    return;
  }

  const body = parseBody(req);
  const step = readStep(body);
  const angle = readAngle(body);
  const photoModel = parseLiveTryOnPhotoModel(readString(body, 'photoModel', 'nbp')) || 'nbp';
  const forceRegenerate = body.forceRegenerate === true;

  if (!step || !angle) {
    res.status(400).json({
      error: 'step (portrait|overlay) and angle (left|front|right) are required',
    });
    return;
  }

  const job: LiveTryOnBatchJob = {
    unitKey: readString(body, 'unitKey', 'NOIR').toUpperCase(),
    length: readString(body, 'length', '24"'),
    density: readString(body, 'density', '200%'),
    lace: readString(body, 'lace', '13X6'),
    texture: readString(body, 'texture', 'SILKY'),
    color: readString(body, 'color', ''),
    hairline: readString(body, 'hairline', 'NATURAL'),
    styling: readString(body, 'styling', 'NONE'),
    addOns: readStringArray(body, 'addOns'),
  };

  if (!job.color) {
    res.status(400).json({ error: 'color is required' });
    return;
  }

  try {
    const result = await runLiveTryOnBatchStep({
      job,
      step,
      angle,
      photoModel,
      forceRegenerate,
    });

    if (!result.skipped) {
      try {
        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: 'live_try_on.batch_step',
          resourceType: 'live_try_on_overlay',
          resourceId: `${result.manifestHash}:${photoModel}:${angle}:${step}`,
          details: { color: job.color, unitKey: job.unitKey, step, angle, photoModel },
        });
      } catch {
        /* ignore */
      }
    }

    res.status(200).json({ ok: true, ...result, job });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Batch step failed';
    const code = msg === 'COLOR_PREVIEW_MISSING' || msg === 'PORTRAIT_MISSING' ? msg : undefined;
    res.status(code ? 409 : 500).json({ error: msg, step, angle, photoModel });
  }
}
