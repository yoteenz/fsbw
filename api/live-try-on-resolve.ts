export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { liveTryOnStorageLookupJob } from './_lib/liveTryOnBatchManifest.js';
import { jobToSelections, storageObjectExists } from './_lib/liveTryOnBatchGenerate.js';
import {
  activeLiveTryOnPhotoModel,
  liveTryOnOverlayPublicUrlsForModel,
  liveTryOnOverlayStoragePath,
  liveTryOnPortraitPublicUrlsForModel,
  parseLiveTryOnPhotoModel,
  type LiveTryOnAngle,
  type LiveTryOnPhotoModel,
} from './_lib/liveTryOnOverlay.js';
import { wigPreviewManifestHashLiveColorTier } from './_lib/wigPreviewSelectionHash.js';

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

const ANGLES: LiveTryOnAngle[] = ['left', 'front', 'right'];

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

  const body = parseBody(req);
  const color = readString(body, 'color', '');
  if (!color) {
    res.status(400).json({ error: 'color is required' });
    return;
  }

  const job = liveTryOnStorageLookupJob({
    unitKey: readString(body, 'unitKey', 'NOIR'),
    color,
  });
  const selections = jobToSelections(job);
  const manifestHash = wigPreviewManifestHashLiveColorTier(selections);
  const photoModel: LiveTryOnPhotoModel =
    parseLiveTryOnPhotoModel(readString(body, 'photoModel', '')) || activeLiveTryOnPhotoModel();

  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
  const unitKey = job.unitKey;

  if (!supabaseUrl) {
    res.status(503).json({ error: 'SUPABASE_URL not configured' });
    return;
  }

  const overlayPaths = Object.fromEntries(
    ANGLES.map((angle) => [
      angle,
      liveTryOnOverlayStoragePath(promptVersion, unitKey, manifestHash, photoModel, angle),
    ])
  ) as Record<LiveTryOnAngle, string>;

  try {
    const hasByAngle = Object.fromEntries(
      await Promise.all(
        ANGLES.map(async (angle) => [angle, await storageObjectExists(bucket, overlayPaths[angle])] as const)
      )
    ) as Record<LiveTryOnAngle, boolean>;

    const publicOverlays = liveTryOnOverlayPublicUrlsForModel(
      supabaseUrl,
      bucket,
      promptVersion,
      unitKey,
      manifestHash,
      photoModel
    );
    const publicPortraits = liveTryOnPortraitPublicUrlsForModel(
      supabaseUrl,
      bucket,
      promptVersion,
      unitKey,
      manifestHash,
      photoModel
    );

    if (!hasByAngle.front) {
      res.status(200).json({
        ok: true,
        ready: false,
        manifestHash,
        color: job.color,
        unitKey,
        photoModel,
        lookupNote: 'Studio batch uses default NOIR build (24", 200%, 13X6) per catalog color.',
      });
      return;
    }

    const t = Date.now();
    const overlayUrls: [string, string, string] = [
      hasByAngle.left ? `${publicOverlays.left}?t=${t}` : `${publicOverlays.front}?t=${t}`,
      `${publicOverlays.front}?t=${t}`,
      hasByAngle.right ? `${publicOverlays.right}?t=${t}` : `${publicOverlays.front}?t=${t}`,
    ];

    res.status(200).json({
      ok: true,
      ready: true,
      manifestHash,
      color: job.color,
      unitKey,
      photoModel,
      overlayUrls,
      partial: !(hasByAngle.left && hasByAngle.right),
      portraitUrls: publicPortraits,
    });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Resolve failed',
      manifestHash,
      color: job.color,
    });
  }
}
