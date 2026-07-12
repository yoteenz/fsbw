export const config = {
  maxDuration: 60,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  runProductAssetBackgroundRemoval,
  downloadUrlToBuffer,
} from '../_lib/productAssetFactory/ideogramCutout.js';
import { uploadStudioBuilderAssetBytes, STUDIO_BUILDER_PREFIX } from '../_lib/studioBuilderGeneration.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      const o = JSON.parse(req.body) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * POST /api/admin/scene-stack-asset-cleanup
 * Governed background removal for verified asset production pipeline candidates only.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ error, code });
  }

  const body = parseBody(req);
  const sourceUrl = String(body?.sourceUrl || '').trim();
  const assetCandidateId = String(body?.assetCandidateId || '').trim();
  const layerId = String(body?.layerId || '').trim();
  const stationId = String(body?.stationId || 'unknown').trim();
  const projectId = String(body?.projectId || 'unknown').trim();

  if (!sourceUrl.startsWith('http')) {
    return res.status(400).json({ error: 'sourceUrl required', code: 'INVALID_SOURCE' });
  }
  if (!assetCandidateId) {
    return res.status(400).json({ error: 'assetCandidateId required', code: 'INVALID_CANDIDATE' });
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return res.status(503).json({ error: 'FAL_KEY not configured', code: 'PROVIDER_UNAVAILABLE' });
  }

  try {
    const masterBuf = await downloadUrlToBuffer(sourceUrl);
    const removal = await runProductAssetBackgroundRemoval(falKey, masterBuf, { strict: false });
    const safe = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, '_');
    const storagePath = `${STUDIO_BUILDER_PREFIX}/verified-cleanup/${safe(stationId)}/${safe(projectId)}/${safe(assetCandidateId)}/${Date.now()}.png`;
    const upload = await uploadStudioBuilderAssetBytes(removal.buffer, storagePath, 'image/png');
    if (!upload.ok || !upload.publicUrl) {
      return res.status(500).json({ error: upload.error ?? 'Upload failed', code: 'CLEANUP_UPLOAD_FAILED' });
    }

    return res.status(200).json({
      ok: true,
      cleanedUrl: upload.publicUrl,
      storagePath: upload.storagePath,
      method: removal.method,
      layerId,
      assetCandidateId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Background cleanup failed';
    return res.status(500).json({ error: msg, code: 'CLEANUP_FAILED' });
  }
}
