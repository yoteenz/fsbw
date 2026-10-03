import type { ResidentId } from '../types';
import type { Season1IngestedVisualAsset, Season1PackageAssetStatus } from './season1-ingested-assets.generated';
import { SEASON1_INGESTED_VISUAL_ASSETS } from './season1-ingested-assets.generated';
import type { ResidentVisualAuthorityRecord, VisualAuthorityStatus } from './types';

export const INGEST2_SOURCE = 'P0.STUDIOWORLD.SEASON1.VISUAL-AUTHORITY.INGEST2';
export const INGEST2_IMPORTED_AT = '2026-10-03T17:54:00.000Z';

export function listIngestedAssetsForResident(
  residentId: ResidentId,
  category?: Season1IngestedVisualAsset['category']
): Season1IngestedVisualAsset[] {
  return SEASON1_INGESTED_VISUAL_ASSETS.filter(
    (a) => a.residentId === residentId && (category ? a.category === category : true)
  );
}

export function mapPackageStatusToAuthorityStatus(
  packageStatus: Season1PackageAssetStatus,
  authorityType: ResidentVisualAuthorityRecord['authorityType']
): VisualAuthorityStatus {
  if (authorityType === 'WORK_UNIFORM_REFERENCE') return 'CONCEPT_LOCKED_VISUAL_PENDING';
  switch (packageStatus) {
    case 'FOUNDER_APPROVED':
      return 'FOUNDER_APPROVED';
    case 'FOUNDER_APPROVED_REFERENCE':
      return 'FOUNDER_APPROVED';
    case 'ALTERNATE_MODE_REFERENCE':
      return 'FOUNDER_APPROVED';
    case 'REFERENCE_ONLY':
      return 'REFERENCE_ONLY';
    case 'CONCEPT_REFERENCE_ONLY':
      return 'CONCEPT_LOCKED_VISUAL_PENDING';
    default:
      return 'PROVISIONAL';
  }
}

export function bindAssetFields(
  record: ResidentVisualAuthorityRecord,
  asset: Season1IngestedVisualAsset
): ResidentVisualAuthorityRecord {
  return {
    ...record,
    assetId: asset.assetId,
    assetPath: asset.repoPath,
    assetUrl: asset.publicPath,
    sourcePackage: asset.sourcePackage,
    sourceFilename: asset.sourceFilename,
    source: INGEST2_SOURCE,
    importedAt: INGEST2_IMPORTED_AT,
    status: mapPackageStatusToAuthorityStatus(asset.packageStatus, record.authorityType),
    founderApproved:
      record.authorityType === 'WORK_UNIFORM_REFERENCE'
        ? false
        : asset.packageStatus === 'FOUNDER_APPROVED' ||
          asset.packageStatus === 'FOUNDER_APPROVED_REFERENCE' ||
          (asset.packageStatus === 'ALTERNATE_MODE_REFERENCE' &&
            (record.authorityType === 'ALTERNATE_MODE' || record.authorityType === 'GLAMOUR_OR_ALTERNATE_MODE')),
    notes: [record.notes, `Ingested from ${asset.organizedPath}`].filter(Boolean).join(' '),
  };
}

export { SEASON1_INGESTED_VISUAL_ASSETS };
