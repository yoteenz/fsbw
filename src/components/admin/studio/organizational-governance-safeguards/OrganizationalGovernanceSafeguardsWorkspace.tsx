import { useState } from 'react';
import { useOrganizationalGovernanceSafeguardsState } from '../../../../hooks/useOrganizationalGovernanceSafeguardsState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ApprovalFrameworkPanel,
  ConnectedSystemsPanel,
  ConstitutionalElementsPanel,
  ContinuousGovernancePanel,
  DecisionSafeguardsPanel,
  EthicalPrinciplesPanel,
  ExecutiveSafeguardsPanel,
  GovernancePhilosophyPanel,
  GovernancePoliciesPanel,
  GovernanceSimulationsPanel,
  GovernanceTransparencyPanel,
  OrganizationalGovernanceSafeguardsHeader,
  OgsDashboardPanel,
  RecommendedNextStepsPanel,
  RiskIntelligencePanel,
  WorkspaceSelectorPanel,
} from './OrganizationalGovernanceSafeguardsPanels';

type OgsTab = 'constitution' | 'policies' | 'safeguards' | 'simulate' | 'transparency' | 'connect';

const TABS: { id: OgsTab; label: string }[] = [
  { id: 'constitution', label: 'CONSTITUTION · PHILOSOPHY' },
  { id: 'policies', label: 'POLICIES · ETHICS' },
  { id: 'safeguards', label: 'SAFEGUARDS · RISK' },
  { id: 'simulate', label: 'SIMULATE · APPROVE' },
  { id: 'transparency', label: 'TRANSPARENCY · EVOLVE' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function OrganizationalGovernanceSafeguardsWorkspace() {
  const [tab, setTab] = useState<OgsTab>('constitution');
  const { store, selectWorkspace } = useOrganizationalGovernanceSafeguardsState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'policies':
        return (
          <>
            <GovernancePoliciesPanel {...panelProps} />
            <EthicalPrinciplesPanel {...panelProps} />
          </>
        );
      case 'safeguards':
        return (
          <>
            <DecisionSafeguardsPanel {...panelProps} />
            <ExecutiveSafeguardsPanel {...panelProps} />
            <RiskIntelligencePanel {...panelProps} />
          </>
        );
      case 'simulate':
        return (
          <>
            <GovernanceSimulationsPanel {...panelProps} />
            <ApprovalFrameworkPanel {...panelProps} />
          </>
        );
      case 'transparency':
        return (
          <>
            <GovernanceTransparencyPanel {...panelProps} />
            <ContinuousGovernancePanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <OgsDashboardPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'constitution':
      default:
        return (
          <>
            <OgsDashboardPanel {...panelProps} />
            <GovernancePhilosophyPanel {...panelProps} />
            <ConstitutionalElementsPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <GovernancePoliciesPanel {...panelProps} />
            <EthicalPrinciplesPanel {...panelProps} />
            <DecisionSafeguardsPanel {...panelProps} />
            <ExecutiveSafeguardsPanel {...panelProps} />
            <RiskIntelligencePanel {...panelProps} />
            <GovernanceSimulationsPanel {...panelProps} />
            <ApprovalFrameworkPanel {...panelProps} />
            <GovernanceTransparencyPanel {...panelProps} />
            <ContinuousGovernancePanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="organizational-governance-safeguards-root">
      <OrganizationalGovernanceSafeguardsHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#475569' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#475569' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(71,85,105,0.06)' : 'white',
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
