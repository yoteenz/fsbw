import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serveCapsuleLatestDownload } from '../_lib/serveCapsuleLatest.js';

/** GET /api/capsules/context-latest — permanent /context/latest with versioned filename */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  serveCapsuleLatestDownload(req, res, {
    releaseManifestRelative: 'api/_lib/context-capsule-release.json',
    latestZipPublicPath: 'downloads/context-capsules/latest.zip',
    fallbackArtifact: 'StudioOS_ContextCapsule_v0.3.1.zip',
  });
}
