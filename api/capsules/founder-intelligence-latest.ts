import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serveCapsuleLatestDownload } from '../_lib/serveCapsuleLatest.js';

/** GET /api/capsules/founder-intelligence-latest — permanent /founder-intelligence/latest with versioned filename */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  serveCapsuleLatestDownload(req, res, {
    releaseManifestRelative: 'api/_lib/founder-intelligence-capsule-release.json',
    latestZipPublicPath: 'downloads/founder-intelligence-capsules/latest.zip',
    fallbackArtifact: 'Founder_Intelligence_Capsule_v1.0.0.zip',
  });
}
