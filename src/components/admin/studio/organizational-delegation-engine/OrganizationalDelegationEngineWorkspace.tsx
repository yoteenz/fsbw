import { useState } from 'react';
import { useOrganizationalDelegationState } from '../../../../hooks/useOrganizationalDelegationState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  CollaborativeExecutionPanel,
  ConnectedSystemsPanel,
  DelegationGovernancePanel,
  DelegationLearningPanel,
  DelegationPhilosophyPanel,
  DelegationPlanningPanel,
  DelegationTypesPanel,
  DelegationVisibilityPanel,
  ExecutiveAccountabilityPanel,
  ExecutiveAssignmentPanel,
  OdeDashboardPanel,
  OrganizationalDelegationHeader,
  OutcomeDelegationsPanel,
  RecommendedDelegationsPanel,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './OrganizationalDelegationEnginePanels';

type OdeTab = 'delegate' | 'assign' | 'plan' | 'visibility' | 'dashboard' | 'connect';

const TABS: { id: OdeTab; label: string }[] = [
  { id: 'delegate', label: 'DELEGATE · OUTCOMES' },
  { id: 'assign', label: 'EXECUTE · ASSIGN' },
  { id: 'plan', label: 'PLAN · GOVERN' },
  { id: 'visibility', label: 'VISIBILITY · LEARN' },
  { id: 'dashboard', label: 'DASHBOARD · ACCOUNT' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function OrganizationalDelegationEngineWorkspace() {
  const [tab, setTab] = useState<OdeTab>('delegate');
  const { store, selectWorkspace } = useOrganizationalDelegationState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'assign':
        return (
          <>
            <ExecutiveAssignmentPanel {...panelProps} />
            <CollaborativeExecutionPanel {...panelProps} />
          </>
        );
      case 'plan':
        return (
          <>
            <DelegationPlanningPanel {...panelProps} />
            <DelegationGovernancePanel {...panelProps} />
          </>
        );
      case 'visibility':
        return (
          <>
            <DelegationVisibilityPanel {...panelProps} />
            <DelegationLearningPanel {...panelProps} />
          </>
        );
      case 'dashboard':
        return (
          <>
            <OdeDashboardPanel {...panelProps} />
            <ExecutiveAccountabilityPanel {...panelProps} />
            <RecommendedDelegationsPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'delegate':
      default:
        return (
          <>
            <OdeDashboardPanel {...panelProps} />
            <DelegationPhilosophyPanel {...panelProps} />
            <DelegationTypesPanel {...panelProps} />
            <OutcomeDelegationsPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ExecutiveAssignmentPanel {...panelProps} />
            <DelegationPlanningPanel {...panelProps} />
            <CollaborativeExecutionPanel {...panelProps} />
            <DelegationGovernancePanel {...panelProps} />
            <DelegationVisibilityPanel {...panelProps} />
            <DelegationLearningPanel {...panelProps} />
            <ExecutiveAccountabilityPanel {...panelProps} />
            <RecommendedDelegationsPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="organizational-delegation-engine-root">
      <OrganizationalDelegationHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#7C3AED' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#7C3AED' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(124,58,237,0.06)' : 'white',
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
