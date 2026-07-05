import { useState } from 'react';
import { useArrivalExperienceState } from '../../../../hooks/useArrivalExperienceState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AeDashboardPanel,
  ArrivalExperienceHeader,
  ArrivalMemoryPanel,
  ArrivalPhilosophyPanel,
  ArrivalSequencePanel,
  ChiefConciergeArrivalWelcomePanel,
  ConciergeTeamIntroductionsPanel,
  ConnectedSystemsPanel,
  EnvironmentalStorytellingPanel,
  FinalMessagePanel,
  FirstConciergeBriefingPanel,
  FutureOpportunitiesPanel,
  HeadquartersTourPanel,
  OrganizationalRevealPanel,
  WorkspaceSelectorPanel,
} from './ArrivalExperiencePanels';

type AeTab = 'philosophy' | 'welcome' | 'tour' | 'briefing' | 'memory' | 'connect';

const TABS: { id: AeTab; label: string }[] = [
  { id: 'philosophy', label: 'PHILOSOPHY · SEQUENCE' },
  { id: 'welcome', label: 'WELCOME · CONCIERGE TEAM' },
  { id: 'tour', label: 'TOUR · REVEAL' },
  { id: 'briefing', label: 'STORY · BRIEFING' },
  { id: 'memory', label: 'MEMORY · HOME' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function ArrivalExperienceWorkspace() {
  const [tab, setTab] = useState<AeTab>('philosophy');
  const { store, selectWorkspace } = useArrivalExperienceState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'welcome':
        return (
          <>
            <ChiefConciergeArrivalWelcomePanel {...panelProps} />
            <ConciergeTeamIntroductionsPanel {...panelProps} />
          </>
        );
      case 'tour':
        return (
          <>
            <HeadquartersTourPanel {...panelProps} />
            <OrganizationalRevealPanel {...panelProps} />
          </>
        );
      case 'briefing':
        return (
          <>
            <EnvironmentalStorytellingPanel {...panelProps} />
            <FirstConciergeBriefingPanel {...panelProps} />
          </>
        );
      case 'memory':
        return (
          <>
            <ArrivalMemoryPanel {...panelProps} />
            <FinalMessagePanel {...panelProps} />
            <FutureOpportunitiesPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <AeDashboardPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'philosophy':
      default:
        return (
          <>
            <AeDashboardPanel {...panelProps} />
            <ArrivalPhilosophyPanel {...panelProps} />
            <ArrivalSequencePanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ChiefConciergeArrivalWelcomePanel {...panelProps} />
            <ConciergeTeamIntroductionsPanel {...panelProps} />
            <HeadquartersTourPanel {...panelProps} />
            <OrganizationalRevealPanel {...panelProps} />
            <EnvironmentalStorytellingPanel {...panelProps} />
            <FirstConciergeBriefingPanel {...panelProps} />
            <ArrivalMemoryPanel {...panelProps} />
            <FinalMessagePanel {...panelProps} />
            <FutureOpportunitiesPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="arrival-experience-root">
      <ArrivalExperienceHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0369A1' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0369A1' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(3,105,161,0.06)' : 'white',
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
