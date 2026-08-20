import { VirtualProductionWorkspace } from '../../../../components/admin/studio/virtual-production/VirtualProductionWorkspace';
import { useVirtualProductionBoard } from '../../../../hooks/useVirtualProductionBoard';
import { useReferencePackBoard } from '../../../../hooks/useReferencePackBoard';

export default function AdminStudioVirtualProductionPage() {
  const board = useVirtualProductionBoard('frontal-slayer', false);
  const refPack = useReferencePackBoard('frontal-slayer', !board.loading);

  const identityGateStatus =
    refPack.board?.identityGateStatus ??
    (board.campaign?.identity_gate_status as 'blocked' | 'pass' | undefined) ??
    'blocked';

  return (
    <VirtualProductionWorkspace
      campaign={board.campaign}
      shots={board.shots}
      tab={board.tab}
      onTabChange={board.setTab}
      loading={board.loading}
      error={board.error}
      identityGateStatus={identityGateStatus}
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
