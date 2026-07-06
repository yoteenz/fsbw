import { VERSIONING_CAPABILITIES } from './constants';
import type { AssetVersionRecord, VersioningCapability } from './types';

const VERSION_META: Record<VersioningCapability, string> = {
  'current-version': 'Active version in production use — never overwritten.',
  'previous-versions': 'Full history of all prior versions preserved.',
  'approval-history': 'Who approved each version and when.',
  'change-log': 'Detailed change summary per version bump.',
  archive: 'Soft-archive superseded versions to Legacy Vault.',
  restore: 'Restore any previous version as current.',
  comparison: 'Side-by-side diff between any two versions.',
};

export function buildVersioningCapabilities(): { capability: VersioningCapability; description: string }[] {
  return VERSIONING_CAPABILITIES.map((capability) => ({
    capability,
    description: VERSION_META[capability],
  }));
}

export function buildVersionRecords(): AssetVersionRecord[] {
  return [
    {
      versionId: 'ver-logo-3-2',
      assetId: 'asset-logo-primary',
      version: '3.2.0',
      isCurrent: true,
      approvedBy: 'Founder',
      changeSummary: 'Updated accent color to match Design Token Engine v2.',
    },
    {
      versionId: 'ver-logo-3-1',
      assetId: 'asset-logo-primary',
      version: '3.1.0',
      isCurrent: false,
      approvedBy: 'Marketing Executive',
      changeSummary: 'Refined spacing for mobile nav.',
    },
    {
      versionId: 'ver-logo-3-0',
      assetId: 'asset-logo-primary',
      version: '3.0.0',
      isCurrent: false,
      approvedBy: 'Founder',
      changeSummary: 'Major rebrand — new typography lockup.',
      archivedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    },
    {
      versionId: 'ver-academy-2-1',
      assetId: 'asset-academy-intro-vid',
      version: '2.1.0',
      isCurrent: true,
      approvedBy: 'Institute Director',
      changeSummary: 'Updated welcome script for M93 Institute sync.',
    },
  ];
}

export function computeVersioningIntegrityPct(): number {
  return 99;
}

export function neverOverwritePolicy(): true {
  return true;
}
