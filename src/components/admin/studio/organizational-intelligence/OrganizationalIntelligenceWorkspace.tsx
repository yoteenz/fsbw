import { useState } from 'react';
import { useOrganizationalIntelligenceState } from '../../../../hooks/useOrganizationalIntelligenceState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ConciergeFounderBanner } from '../concierge-layer/ConciergeFounderBanner';
import {
  RecommendedNextStepsPanel,
  ConnectedSystemsPanel,
  ContinuousLearningPanel,
  CrossSystemIntelligencePanel,
  DecisionIntelligencePanel,
  ExecutiveIntegrationPanel,
  FounderIntelligencePanel,
  InstitutionalMemoryPanel,
  IntelligenceCenterPanel,
  IntelligencePhilosophyPanel,
  OiDashboardPanel,
  OrganizationalCuriosityPanel,
  OrganizationalForecastingPanel,
  OrganizationalIntelligenceHeader,
  OrganizationalReasoningPanel,
  OrganizationalReflectionPanel,
  OrganizationalWisdomPanel,
  WorkspaceSelectorPanel,
} from './OrganizationalIntelligencePanels';

type OiTab = 'mind' | 'reason' | 'decide' | 'wisdom' | 'forecast' | 'connect';

const TABS: { id: OiTab; label: string }[] = [
  { id: 'mind', label: 'MIND · LEARN' },
  { id: 'reason', label: 'REASON · CONNECT' },
  { id: 'decide', label: 'DECIDE · REFLECT' },
  { id: 'wisdom', label: 'WISDOM · MEMORY' },
  { id: 'forecast', label: 'FORECAST · CENTER' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function OrganizationalIntelligenceWorkspace() {
  const [tab, setTab] = useState<OiTab>('mind');
  const { store, selectWorkspace } = useOrganizationalIntelligenceState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'reason':
        return (
          <>
            <OrganizationalReasoningPanel {...panelProps} />
            <CrossSystemIntelligencePanel {...panelProps} />
            <OrganizationalCuriosityPanel {...panelProps} />
          </>
        );
      case 'decide':
        return (
          <>
            <DecisionIntelligencePanel {...panelProps} />
            <OrganizationalReflectionPanel {...panelProps} />
            <ExecutiveIntegrationPanel {...panelProps} />
          </>
        );
      case 'wisdom':
        return (
          <>
            <OrganizationalWisdomPanel {...panelProps} />
            <InstitutionalMemoryPanel {...panelProps} />
            <FounderIntelligencePanel {...panelProps} />
          </>
        );
      case 'forecast':
        return (
          <>
            <OrganizationalForecastingPanel {...panelProps} />
            <IntelligenceCenterPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'mind':
        return (
          <>
            <OiDashboardPanel {...panelProps} />
            <IntelligencePhilosophyPanel {...panelProps} />
            <ContinuousLearningPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <p
              className="text-[6px] font-futura uppercase p-2 border mb-3"
              style={{
                fontWeight: 515,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                color: ADMIN_STUDIO_THEME.textSecondary,
                background: 'rgba(79,70,229,0.04)',
              }}
            >
              REASONING · WISDOM · FORECASTING · EXECUTIVE INTEGRATION — USE THE TABS ABOVE
            </p>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="organizational-intelligence-root">
      <OrganizationalIntelligenceHeader />
      <ConciergeFounderBanner conciergeId="knowledge-concierge" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(79,70,229,0.06)' : 'white',
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
