/**
 * Serve latest capsule ZIP with versioned download filename (permanent URL unchanged).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'node:fs';
import path from 'node:path';

export type CapsuleLatestServeConfig = {
  releaseManifestRelative: string;
  latestZipPublicPath: string;
  fallbackArtifact: string;
};

type ReleaseManifest = {
  artifact?: string;
  currentVersion?: string;
  validationStatus?: string;
};

function resolveReleaseManifest(relativePath: string): ReleaseManifest | null {
  const manifestPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as ReleaseManifest;
  } catch {
    return null;
  }
}

function contentDispositionFilename(artifact: string): string {
  const safe = artifact.replace(/[^\w.\-()+]/g, '_');
  return `attachment; filename="${safe}"`;
}

export function serveCapsuleLatestDownload(
  req: VercelRequest,
  res: VercelResponse,
  config: CapsuleLatestServeConfig,
): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const release = resolveReleaseManifest(config.releaseManifestRelative);
  const artifact = release?.artifact?.trim() || config.fallbackArtifact;
  const zipPath = path.join(process.cwd(), 'public', config.latestZipPublicPath);

  if (!fs.existsSync(zipPath)) {
    res.status(503).json({ error: 'Capsule artifact not available' });
    return;
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', contentDispositionFilename(artifact));
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.setHeader('X-Capsule-Version', release?.currentVersion ?? 'unknown');
  res.setHeader('X-Capsule-Artifact', artifact);

  if (req.method === 'HEAD') {
    res.setHeader('Content-Length', String(fs.statSync(zipPath).size));
    res.status(200).end();
    return;
  }

  res.status(200).send(fs.readFileSync(zipPath));
}
