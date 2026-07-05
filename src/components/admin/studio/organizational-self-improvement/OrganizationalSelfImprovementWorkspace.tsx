import { useState } from 'react';
import { useOrganizationalSelfImprovementState } from '../../../../hooks/useOrganizationalSelfImprovementState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  ChiefOfStaffImprovementPanel,
  ConnectedSystemsPanel,
  ContinuousLearningPanel,
  CrossFunctionalImprovementPanel,
  ImprovementGovernancePanel,
  ImprovementOpportunitiesPanel,
  ImprovementPhilosophyPanel,
  MaturityDimensionsPanel,
  OrganizationalExperimentsPanel,
  OrganizationalSelfImprovementHeader,
  OsiDashboardPanel,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './OrganizationalSelfImprovementPanels';

type OsiTab = 'reflect' | 'improve' | 'experiment' | 'learn' | 'maturity' | 'connect';

const TABS: { id: OsiTab; label: string }[] = [
  { id: 'reflect', label: 'REFLECT · DOMAINS' },
  { id: 'improve', label: 'IMPROVE · CROSS' },
  { id: 'experiment', label: 'EXPERIMENT · GOVERN' },
  { id: 'learn', label: 'LEARN · CAPTURE' },
  { id: 'maturity', label: 'MATURITY · COS' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function OrganizationalSelfImprovementWorkspace() {
  const [tab, setTab] = useState<OsiTab>('reflect');
  const { store, selectWorkspace } = useOrganizationalSelfImprovementState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'improve':
        return (
          <>
            <CrossFunctionalImprovementPanel {...panelProps} />
            <ImprovementOpportunitiesPanel {...panelProps} />
          </>
        );
      case 'experiment':
        return (
          <>
            <OrganizationalExperimentsPanel {...panelProps} />
            <ImprovementGovernancePanel {...panelProps} />
          </>
        );
      case 'learn':
        return <ContinuousLearningPanel {...panelProps} />;
      case 'maturity':
        return (
          <>
            <MaturityDimensionsPanel {...panelProps} />
            <ChiefOfStaffImprovementPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <OsiDashboardPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'reflect':
        return (
          <>
            <OsiDashboardPanel {...panelProps} />
            <ImprovementPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ImprovementGovernancePanel {...panelProps} />

            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              ADDITIONAL SECTIONS ON OTHER TABS — OPEN TABS FOR FULL DETAIL
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="organizational-self-improvement-root">
      <OrganizationalSelfImprovementHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#10B981' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#10B981' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(16,185,129,0.06)' : 'white',
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
