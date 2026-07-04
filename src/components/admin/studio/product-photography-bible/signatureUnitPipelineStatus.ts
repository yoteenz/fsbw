import type { SignatureUnitPhotographyRecord } from '../../../../utils/adminStudioProductPhotographyBibleDemo';
import type { ProductAssetFactoryJobRecord } from '../../../../studio-os/product-photography/ProductAssetFactory';

export type SignatureUnitPipelineStatus = {
  creativeDna: string;
  masterHero: string;
  transparentMaster: string;
  mediaKit: string;
  smartAssets: string;
  assetFactory: string;
};

export function deriveSignatureUnitPipelineStatus(
  unit: SignatureUnitPhotographyRecord,
  factoryJob: ProductAssetFactoryJobRecord | undefined,
  derivativeCount: number
): SignatureUnitPipelineStatus {
  const masterHero = factoryJob?.generatedMasterHeroUrl
    ? factoryJob.heroApproved
      ? 'Approved'
      : factoryJob.stage === 'awaiting-hero-approval' || factoryJob.stage === 'hero-generated'
        ? 'Awaiting Approval'
        : 'Generated'
    : unit.photographyStatus === 'pending-review'
      ? 'Awaiting Approval'
      : unit.photographyStatus === 'approved'
        ? 'Approved'
        : unit.photographyStatus === 'reference'
          ? 'Reference Only'
          : 'Not Generated';

  const transparentMaster =
    factoryJob?.transparentMasterUrl ||
    factoryJob?.stage === 'transparent-master-generated' ||
    factoryJob?.stage === 'ready-for-review' ||
    factoryJob?.stage === 'published'
      ? 'Generated'
      : factoryJob?.heroApproved
        ? 'Pending'
        : 'Blocked';

  const mediaKit =
    unit.mediaKitStatus === 'complete'
      ? 'Complete'
      : unit.mediaKitStatus === 'partial'
        ? 'Prepared'
        : 'Empty';

  const smartAssets = derivativeCount > 0 ? 'Generated' : factoryJob?.heroApproved ? 'Pending' : 'Blocked';

  const assetFactory =
    factoryJob?.stage === 'ready-for-review' || factoryJob?.stage === 'published'
      ? 'Ready'
      : factoryJob?.stage === 'awaiting-hero-approval' || factoryJob?.stage === 'hero-generated'
        ? 'Awaiting Hero Approval'
        : factoryJob && factoryJob.stage !== 'failed' && factoryJob.stage !== 'reference-ready'
          ? 'Processing'
          : 'Needs Master Hero';

  return {
    creativeDna: 'Inherited v1.0',
    masterHero,
    transparentMaster,
    mediaKit,
    smartAssets,
    assetFactory,
  };
}
