import { VirtualProductionWorkspace } from '../../../../components/admin/studio/virtual-production/VirtualProductionWorkspace';
import { useVirtualProductionBoard } from '../../../../hooks/useVirtualProductionBoard';

export default function AdminStudioVirtualProductionPage() {
  const board = useVirtualProductionBoard('frontal-slayer', false);

  return (
    <VirtualProductionWorkspace
      campaign={board.campaign}
      shots={board.shots}
      tab={board.tab}
      onTabChange={board.setTab}
      loading={board.loading}
      error={board.error}
      onSeedReference={() => void board.seedReference()}
    />
  );
}
