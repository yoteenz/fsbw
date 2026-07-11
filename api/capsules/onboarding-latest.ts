import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serveCapsuleLatestDownload } from '../_lib/serveCapsuleLatest.js';

/** GET /api/capsules/onboarding-latest — permanent /onboarding/latest with versioned filename */
export default function handler(req: VercelRequest, res: VercelResponse): void {
  serveCapsuleLatestDownload(req, res, {
    releaseManifestRelative: 'api/_lib/onboarding-pack-release.json',
    latestZipPublicPath: 'downloads/onboarding-packs/latest.zip',
    fallbackArtifact: 'StudioOS_OnboardingPack_v1.0.0.zip',
  });
}
