import { useState } from 'react';
import { useExecutiveFrameworkState } from '../../../../hooks/useExecutiveFrameworkState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  AccountabilityPanel,
  ConnectedSystemsPanel,
  DecisionFrameworkPanel,
  ExecutiveCollaborationPanel,
  ExecutiveFrameworkHeader,
  ExecutivePhilosophyPanel,
  ExecutiveStandardsPanel,
  ExecutiveWorkspacesPanel,
  FrameworkDashboardPanel,
  FutureExecutivesPanel,
  IdentityInheritancePanel,
  InstitutionalMemoryPanel,
  LeadershipMapPanel,
  OrganizationalPrioritiesPanel,
  RecommendationPipelinePanel,
  WorkspaceSelectorPanel,
} from './ExecutiveFrameworkPanels';

type EfTab = 'org' | 'identity' | 'decide' | 'collaborate' | 'workspace' | 'connect';

const TABS: { id: EfTab; label: string }[] = [
  { id: 'org', label: 'ORG · DASHBOARD' },
  { id: 'identity', label: 'IDENTITY · STANDARDS' },
  { id: 'decide', label: 'DECIDE · PIPELINE' },
  { id: 'collaborate', label: 'COLLABORATE · MEMORY' },
  { id: 'workspace', label: 'WORKSPACE · FUTURE' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function ExecutiveFrameworkWorkspace() {
  const [tab, setTab] = useState<EfTab>('org');
  const { store, selectWorkspace } = useExecutiveFrameworkState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'identity':
        return (
          <>
            <IdentityInheritancePanel {...panelProps} />
            <ExecutiveStandardsPanel {...panelProps} />
            <ExecutivePhilosophyPanel {...panelProps} />
          </>
        );
      case 'decide':
        return (
          <>
            <DecisionFrameworkPanel {...panelProps} />
            <RecommendationPipelinePanel {...panelProps} />
            <AccountabilityPanel {...panelProps} />
          </>
        );
      case 'collaborate':
        return (
          <>
            <ExecutiveCollaborationPanel {...panelProps} />
            <InstitutionalMemoryPanel {...panelProps} />
            <OrganizationalPrioritiesPanel {...panelProps} />
          </>
        );
      case 'workspace':
        return (
          <>
            <ExecutiveWorkspacesPanel {...panelProps} />
            <LeadershipMapPanel {...panelProps} />
            <FutureExecutivesPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'org':
        return (
          <>
            <FrameworkDashboardPanel {...panelProps} />
            <ExecutivePhilosophyPanel {...panelProps} />
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
    <div className="executive-framework-root">
      <ExecutiveFrameworkHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#334155' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#334155' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(51,65,85,0.06)' : 'white',
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
