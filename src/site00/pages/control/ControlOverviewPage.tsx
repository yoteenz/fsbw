import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { CtrlRoomCommandCenter } from '../../components/ecosystem/CtrlRoomCommandCenter';
import { useEcosystemData } from '../../hooks/useEcosystemData';

export default function ControlOverviewPage() {
  const data = useEcosystemData();

  return (
    <EcosystemShell>
      <CtrlRoomCommandCenter
        now={data.now}
        activeBuilds={data.activeBuilds}
        attention={data.attention}
        recentSignals={data.recentSignals}
        upNext={data.upNext}
        quickLaunch={data.quickLaunch}
        allClear={data.allClear}
      />
    </EcosystemShell>
  );
}
