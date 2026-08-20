import { VirtualProductionWorkspace } from '../../../components/admin/studio/virtual-production/VirtualProductionWorkspace';
import { useVirtualProductionBoard } from '../../../hooks/useVirtualProductionBoard';
import { useReferencePackBoard } from '../../../hooks/useReferencePackBoard';

/** Debug route wrapper — enables local demo fallback when API proxy unavailable. */
export default function VirtualProductionDebugBoardPage() {
  const board = useVirtualProductionBoard('frontal-slayer', true);
  const refPack = useReferencePackBoard('frontal-slayer', true);

  return (
    <VirtualProductionWorkspace
      campaign={board.campaign}
      shots={board.shots}
      tab={board.tab}
      onTabChange={board.setTab}
      loading={board.loading}
      error={board.error}
      identityGateStatus={refPack.board?.identityGateStatus ?? 'blocked'}
      referencePackBoard={refPack.board}
      referencePackLoading={refPack.loading}
      referencePackError={refPack.error}
      referencePackActions={{
        packReady: Boolean(refPack.board?.packId),
        busySlot: refPack.busySlot,
        readyToLock: refPack.readyToLock,
        onUpload: refPack.uploadSlot,
        onApprove: refPack.approveSlot,
        onReject: refPack.rejectSlot,
        onSetAnchor: refPack.setAnchor,
        onLock: refPack.lockPack,
        onUploadFrontAsAnchor: refPack.uploadFrontAsAnchor,
      }}
      onSeedCanon={() => {
        void board.seedCanonCampaign001().then(() => refPack.refresh());
      }}
    />
  );
}
