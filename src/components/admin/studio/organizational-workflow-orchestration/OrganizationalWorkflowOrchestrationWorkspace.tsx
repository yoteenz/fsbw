import { useState } from 'react';
import { useOrganizationalWorkflowOrchestrationState } from '../../../../hooks/useOrganizationalWorkflowOrchestrationState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  ChiefOfStaffCoordinationPanel,
  ConnectedSystemsPanel,
  CrossFunctionalCoordinationPanel,
  LivingWorkflowPanel,
  OrganizationalAdaptationPanel,
  OrganizationalWorkflowOrchestrationHeader,
  OwfDashboardPanel,
  RecommendedNextStepsPanel,
  RecommendedOptimizationsPanel,
  WorkflowIntelligencePanel,
  WorkflowMemoryPanel,
  WorkflowPhilosophyPanel,
  WorkflowSimulationPanel,
  WorkflowTransparencyPanel,
  WorkspaceSelectorPanel,
} from './OrganizationalWorkflowOrchestrationPanels';

type OwfTab = 'orchestrate' | 'coordinate' | 'living' | 'transparency' | 'memory' | 'connect';

const TABS: { id: OwfTab; label: string }[] = [
  { id: 'orchestrate', label: 'ORCHESTRATE · TYPES' },
  { id: 'coordinate', label: 'COORDINATE · INTEL' },
  { id: 'living', label: 'LIVING · COS' },
  { id: 'transparency', label: 'TRANSPARENCY · ADAPT' },
  { id: 'memory', label: 'MEMORY · SIMULATE' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function OrganizationalWorkflowOrchestrationWorkspace() {
  const [tab, setTab] = useState<OwfTab>('orchestrate');
  const { store, selectWorkspace } = useOrganizationalWorkflowOrchestrationState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'coordinate':
        return (
          <>
            <CrossFunctionalCoordinationPanel {...panelProps} />
            <WorkflowIntelligencePanel {...panelProps} />
          </>
        );
      case 'living':
        return (
          <>
            <LivingWorkflowPanel {...panelProps} />
            <ChiefOfStaffCoordinationPanel {...panelProps} />
          </>
        );
      case 'transparency':
        return (
          <>
            <WorkflowTransparencyPanel {...panelProps} />
            <OrganizationalAdaptationPanel {...panelProps} />
          </>
        );
      case 'memory':
        return (
          <>
            <WorkflowMemoryPanel {...panelProps} />
            <WorkflowSimulationPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <OwfDashboardPanel {...panelProps} />
            <RecommendedOptimizationsPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'orchestrate':
        return (
          <>
            <OwfDashboardPanel {...panelProps} />
            <WorkflowPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />

            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              ADDITIONAL SECTIONS ON OTHER TABS — OPEN TABS FOR FULL DETAIL
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="organizational-workflow-orchestration-root">
      <OrganizationalWorkflowOrchestrationHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0EA5E9' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0EA5E9' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(14,165,233,0.06)' : 'white',
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
