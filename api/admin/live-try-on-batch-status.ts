export const config = { maxDuration: 60 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminFounder } from '../_lib/adminAuth.js';
import {
  listMissingLiveTryOnBatchSteps,
  type LiveTryOnBatchJob,
} from '../_lib/liveTryOnBatchGenerate.js';
import { LIVE_TRY_ON_PHOTO_MODELS, parseLiveTryOnPhotoModel } from '../_lib/liveTryOnOverlay.js';

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

  const compareBoth = body.compareModels === true;
  const single = parseLiveTryOnPhotoModel(readString(body, 'photoModel', 'nbp'));
  const photoModels = compareBoth ? [...LIVE_TRY_ON_PHOTO_MODELS] : [single || 'nbp'];

  try {
    const status = await listMissingLiveTryOnBatchSteps(job, photoModels);
    res.status(200).json({
      ok: true,
      ...status,
      photoModels,
      complete: status.missing.length === 0,
      job,
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Status check failed' });
  }
}
