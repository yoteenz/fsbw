import { useState } from 'react';
import { useLeadershipDnaState } from '../../../../hooks/useLeadershipDnaState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ApprovalIntelligencePanel,
  ChiefOfStaffIntegrationPanel,
  CreativeTastePanel,
  CrossCompanyPanel,
  DashboardPanel,
  DecisionJournalPanel,
  DelegationEnginePanel,
  FeedbackIntelligencePanel,
  FounderProfilePanel,
  InstitutionalLeadershipPanel,
  KnowledgeGraphPanel,
  LeadershipDnaHeader,
  LeadershipPrinciplesPanel,
  LeadershipSimulatorPanel,
  LeadershipTimelinePanel,
  RiskIntelligencePanel,
  WritingIntelligencePanel,
} from './LeadershipDnaPanels';

type LdnaTab = 'overview' | 'profile' | 'decisions' | 'intelligence' | 'simulator' | 'integration';

const TABS: { id: LdnaTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'profile', label: 'FOUNDER PROFILE' },
  { id: 'decisions', label: 'DECISIONS' },
  { id: 'intelligence', label: 'INTELLIGENCE' },
  { id: 'simulator', label: 'SIMULATOR' },
  { id: 'integration', label: 'CoS · KG' },
];

export function LeadershipDnaWorkspace() {
  const [tab, setTab] = useState<LdnaTab>('overview');
  const { store, activeSection, setActiveSection, evaluateAlignment } = useLeadershipDnaState();

  const panelProps = {
    store,
    activeSection,
    onSectionChange: setActiveSection,
    evaluateAlignment,
  };

  const renderTab = () => {
    switch (tab) {
      case 'profile':
        return (
          <>
            <FounderProfilePanel {...panelProps} />
            <LeadershipPrinciplesPanel store={store} />
          </>
        );
      case 'decisions':
        return (
          <>
            <DecisionJournalPanel store={store} />
            <LeadershipTimelinePanel store={store} />
            <InstitutionalLeadershipPanel store={store} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <ApprovalIntelligencePanel store={store} />
            <CreativeTastePanel store={store} />
            <WritingIntelligencePanel store={store} />
            <DelegationEnginePanel store={store} />
            <RiskIntelligencePanel store={store} />
            <FeedbackIntelligencePanel store={store} />
          </>
        );
      case 'simulator':
        return (
          <>
            <LeadershipSimulatorPanel store={store} />
            <CrossCompanyPanel store={store} />
          </>
        );
      case 'integration':
        return (
          <>
            <ChiefOfStaffIntegrationPanel store={store} evaluateAlignment={evaluateAlignment} />
            <KnowledgeGraphPanel store={store} />
          </>
        );
      case 'overview':
        return (
          <>
            <DashboardPanel store={store} />
            <FounderProfilePanel {...panelProps} />
            <LeadershipPrinciplesPanel store={store} />
            <DecisionJournalPanel store={store} />
            <ChiefOfStaffIntegrationPanel store={store} evaluateAlignment={evaluateAlignment} />
            <p
              className="text-[6px] font-futura uppercase p-2 border mb-3"
              style={{
                fontWeight: 515,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                color: ADMIN_STUDIO_THEME.textSecondary,
                background: 'rgba(124,58,237,0.04)',
              }}
            >
              INTELLIGENCE · SIMULATOR · KG · FULL PROFILE — USE THE TABS ABOVE
            </p>
          </>
        );
    }
  };

  return (
    <div className="leadership-dna-root">
      <LeadershipDnaHeader />

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
