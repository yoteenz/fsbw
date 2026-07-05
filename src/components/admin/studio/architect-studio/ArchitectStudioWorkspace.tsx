import { useState } from 'react';
import { useArchitectStudioState } from '../../../../hooks/useArchitectStudioState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AmbientActivityPanel,
  ArchitectCollaborationPanel,
  ArchitectStudioHeader,
  ArchitectStudiosPanel,
  CollaborationForumPanel,
  ConnectedSystemsPanel,
  EvolutionWallPanel,
  ExecutiveAvailabilityPanel,
  ExecutiveConversationsPanel,
  ExecutivePresencePanel,
  HeadquartersBriefingPanel,
  HeadquartersCulturePanel,
  HeadquartersPhilosophyPanel,
  ImmersiveCampusPanel,
  InnovationLabPanel,
  LivingArchitecturePanel,
  LivingWorkspacesPanel,
  MemorySpacesPanel,
  MorningArrivalPanel,
  OrganizationalRhythmPanel,
  PersonalizationPanel,
  PortfolioCampusPanel,
  RecommendedNextStepsPanel,
  StudioDashboardPanel,
  StudioIntelligencePanel,
  StudioPhilosophyPanel,
} from './ArchitectStudioPanels';

type AsTab = 'arrival' | 'presence' | 'dashboard' | 'campus' | 'studios' | 'forum' | 'evolution' | 'innovation';

const TABS: { id: AsTab; label: string }[] = [
  { id: 'arrival', label: 'ARRIVAL · BRIEFING' },
  { id: 'presence', label: 'PRESENCE · ACTIVITY' },
  { id: 'dashboard', label: 'DASHBOARD · OVERVIEW' },
  { id: 'campus', label: 'CAMPUS · SPATIAL NAV' },
  { id: 'studios', label: 'STUDIOS · LIVING' },
  { id: 'forum', label: 'FORUM · COLLABORATION' },
  { id: 'evolution', label: 'EVOLUTION · MEMORY' },
  { id: 'innovation', label: 'INNOVATION · INTELLIGENCE' },
];

export function ArchitectStudioWorkspace() {
  const [tab, setTab] = useState<AsTab>('arrival');
  const { store, selectWorkspace, setSpatialMode, focusStudio } = useArchitectStudioState();
  const panelProps = {
    store,
    onSelectWorkspace: selectWorkspace,
    onSetSpatialMode: setSpatialMode,
    onFocusStudio: focusStudio,
  };

  const renderTab = () => {
    switch (tab) {
      case 'arrival':
        return (
          <>
            <MorningArrivalPanel {...panelProps} />
            <HeadquartersBriefingPanel {...panelProps} />
            <HeadquartersPhilosophyPanel {...panelProps} />
            <OrganizationalRhythmPanel {...panelProps} />
          </>
        );
      case 'presence':
        return (
          <>
            <ExecutivePresencePanel {...panelProps} />
            <ExecutiveAvailabilityPanel {...panelProps} />
            <AmbientActivityPanel {...panelProps} />
            <ExecutiveConversationsPanel {...panelProps} />
            <HeadquartersCulturePanel {...panelProps} />
          </>
        );
      case 'campus':
        return (
          <>
            <ImmersiveCampusPanel {...panelProps} />
            <LivingArchitecturePanel {...panelProps} />
            <PortfolioCampusPanel {...panelProps} />
            <PersonalizationPanel {...panelProps} />
          </>
        );
      case 'studios':
        return (
          <>
            <ArchitectStudiosPanel {...panelProps} />
            <LivingWorkspacesPanel {...panelProps} />
          </>
        );
      case 'forum':
        return (
          <>
            <CollaborationForumPanel {...panelProps} />
            <ArchitectCollaborationPanel {...panelProps} />
          </>
        );
      case 'evolution':
        return (
          <>
            <EvolutionWallPanel {...panelProps} />
            <MemorySpacesPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
          </>
        );
      case 'innovation':
        return (
          <>
            <InnovationLabPanel {...panelProps} />
            <StudioIntelligencePanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <MorningArrivalPanel {...panelProps} />
            <HeadquartersBriefingPanel {...panelProps} />
            <StudioDashboardPanel {...panelProps} />
            <StudioPhilosophyPanel {...panelProps} />
            <ExecutivePresencePanel {...panelProps} />
            <ImmersiveCampusPanel {...panelProps} />
            <ArchitectStudiosPanel {...panelProps} />
            <CollaborationForumPanel {...panelProps} />
            <LivingWorkspacesPanel {...panelProps} />
            <AmbientActivityPanel {...panelProps} />
            <ArchitectCollaborationPanel {...panelProps} />
            <EvolutionWallPanel {...panelProps} />
            <MemorySpacesPanel {...panelProps} />
            <InnovationLabPanel {...panelProps} />
            <StudioIntelligencePanel {...panelProps} />
            <PortfolioCampusPanel {...panelProps} />
            <PersonalizationPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="architect-studio-root">
      <ArchitectStudioHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#CA8A04' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#CA8A04' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(202,138,4,0.06)' : 'white',
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
