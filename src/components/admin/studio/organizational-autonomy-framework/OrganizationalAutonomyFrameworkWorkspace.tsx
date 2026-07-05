import { useState } from 'react';
import { useOrganizationalAutonomyState } from '../../../../hooks/useOrganizationalAutonomyState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AutonomousActionsPanel,
  AutonomousWorkflowsPanel,
  AutonomyGovernancePanel,
  AutonomyLevelsPanel,
  AutonomyPhilosophyPanel,
  AutonomyUpgradesPanel,
  ConnectedSystemsPanel,
  ExecutiveCoordinationPanel,
  FounderPermissionsPanel,
  LearningLoopPanel,
  OafDashboardPanel,
  OrganizationalAutonomyHeader,
  RecommendedNextStepsPanel,
  TrustEnginePanel,
  WorkspaceSelectorPanel,
} from './OrganizationalAutonomyFrameworkPanels';

type OafTab = 'autonomy' | 'govern' | 'execute' | 'transparency' | 'dashboard' | 'connect';

const TABS: { id: OafTab; label: string }[] = [
  { id: 'autonomy', label: 'AUTONOMY · TRUST' },
  { id: 'govern', label: 'GOVERN · PERMISSIONS' },
  { id: 'execute', label: 'EXECUTE · WORKFLOWS' },
  { id: 'transparency', label: 'TRANSPARENCY · LEARN' },
  { id: 'dashboard', label: 'DASHBOARD · UPGRADE' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function OrganizationalAutonomyFrameworkWorkspace() {
  const [tab, setTab] = useState<OafTab>('autonomy');
  const { store, selectWorkspace } = useOrganizationalAutonomyState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'govern':
        return (
          <>
            <AutonomyGovernancePanel {...panelProps} />
            <FounderPermissionsPanel {...panelProps} />
            <TrustEnginePanel {...panelProps} />
          </>
        );
      case 'execute':
        return (
          <>
            <ExecutiveCoordinationPanel {...panelProps} />
            <AutonomousWorkflowsPanel {...panelProps} />
          </>
        );
      case 'transparency':
        return (
          <>
            <AutonomousActionsPanel {...panelProps} />
            <LearningLoopPanel {...panelProps} />
          </>
        );
      case 'dashboard':
        return (
          <>
            <OafDashboardPanel {...panelProps} />
            <AutonomyUpgradesPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'autonomy':
      default:
        return (
          <>
            <OafDashboardPanel {...panelProps} />
            <AutonomyPhilosophyPanel {...panelProps} />
            <AutonomyLevelsPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <AutonomyGovernancePanel {...panelProps} />
            <FounderPermissionsPanel {...panelProps} />
            <TrustEnginePanel {...panelProps} />
            <ExecutiveCoordinationPanel {...panelProps} />
            <AutonomousWorkflowsPanel {...panelProps} />
            <AutonomousActionsPanel {...panelProps} />
            <LearningLoopPanel {...panelProps} />
            <AutonomyUpgradesPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="organizational-autonomy-framework-root">
      <OrganizationalAutonomyHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(13,148,136,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
