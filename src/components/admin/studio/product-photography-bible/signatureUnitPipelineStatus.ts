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
  const masterHero =
    unit.photographyStatus === 'approved'
      ? 'Approved'
      : unit.photographyStatus === 'reference'
        ? 'Pending'
        : unit.photographyStatus === 'pending-review'
          ? 'Pending'
          : 'Missing';

  const transparentMaster =
    factoryJob?.transparentMasterUrl || factoryJob?.stage === 'ready-for-review' || factoryJob?.stage === 'published'
      ? 'Generated'
      : factoryJob && factoryJob.stage !== 'failed'
        ? 'Pending'
        : 'Pending';

  const mediaKit =
    unit.mediaKitStatus === 'complete'
      ? 'Complete'
      : unit.mediaKitStatus === 'partial'
        ? 'Prepared'
        : 'Empty';

  const smartAssets = derivativeCount > 0 ? 'Generated' : 'Pending';

  const assetFactory =
    factoryJob?.stage === 'ready-for-review' || factoryJob?.stage === 'published'
      ? 'Ready'
      : factoryJob && factoryJob.stage !== 'failed' && factoryJob.stage !== 'waiting'
        ? 'Processing'
        : 'Needs Processing';

  return {
    creativeDna: 'Inherited v1.0',
    masterHero,
    transparentMaster,
    mediaKit,
    smartAssets,
    assetFactory,
  };
}
