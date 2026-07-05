import { useState } from 'react';
import { useArchitectStudioState } from '../../../../hooks/useArchitectStudioState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ArchitectCollaborationPanel,
  ArchitectStudioHeader,
  ArchitectStudiosPanel,
  CollaborationForumPanel,
  ConnectedSystemsPanel,
  EvolutionWallPanel,
  ImmersiveCampusPanel,
  InnovationLabPanel,
  LivingWorkspacesPanel,
  PersonalizationPanel,
  PortfolioCampusPanel,
  RecommendedNextStepsPanel,
  StudioDashboardPanel,
  StudioIntelligencePanel,
  StudioPhilosophyPanel,
} from './ArchitectStudioPanels';

type AsTab = 'dashboard' | 'campus' | 'studios' | 'forum' | 'evolution' | 'innovation';

const TABS: { id: AsTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD · OVERVIEW' },
  { id: 'campus', label: 'CAMPUS · SPATIAL NAV' },
  { id: 'studios', label: 'STUDIOS · LIVING' },
  { id: 'forum', label: 'FORUM · COLLABORATION' },
  { id: 'evolution', label: 'EVOLUTION WALL' },
  { id: 'innovation', label: 'INNOVATION · INTELLIGENCE' },
];

export function ArchitectStudioWorkspace() {
  const [tab, setTab] = useState<AsTab>('dashboard');
  const { store, selectWorkspace, setSpatialMode, focusStudio } = useArchitectStudioState();
  const panelProps = {
    store,
    onSelectWorkspace: selectWorkspace,
    onSetSpatialMode: setSpatialMode,
    onFocusStudio: focusStudio,
  };

  const renderTab = () => {
    switch (tab) {
      case 'campus':
        return (
          <>
            <ImmersiveCampusPanel {...panelProps} />
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
            <StudioDashboardPanel {...panelProps} />
            <StudioPhilosophyPanel {...panelProps} />
            <ImmersiveCampusPanel {...panelProps} />
            <ArchitectStudiosPanel {...panelProps} />
            <CollaborationForumPanel {...panelProps} />
            <LivingWorkspacesPanel {...panelProps} />
            <ArchitectCollaborationPanel {...panelProps} />
            <EvolutionWallPanel {...panelProps} />
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
