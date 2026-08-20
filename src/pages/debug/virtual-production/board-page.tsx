import { VirtualProductionWorkspace } from '../../../components/admin/studio/virtual-production/VirtualProductionWorkspace';
import { useVirtualProductionBoard } from '../../../hooks/useVirtualProductionBoard';

/** Debug route wrapper — enables local demo fallback when API proxy unavailable. */
export default function VirtualProductionDebugBoardPage() {
  const board = useVirtualProductionBoard('frontal-slayer', true);

  return (
    <VirtualProductionWorkspace
      campaign={board.campaign}
      shots={board.shots}
      tab={board.tab}
      onTabChange={board.setTab}
      loading={board.loading}
      error={board.error}
      onSeedCanon={() => void board.seedCanonCampaign001()}
    />
  );
}
