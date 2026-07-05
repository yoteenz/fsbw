import { useState } from 'react';
import { useReaderGraphState } from '../../../../hooks/useReaderGraphState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  BehaviorIntelligencePanel,
  CommunityClustersPanel,
  ConnectedSystemsPanel,
  CreatorMarketplacePanel,
  CrossCompanyRelationshipsPanel,
  GraphVisualizationPanel,
  KnowledgeInterestsPanel,
  PrivacyControlsPanel,
  ReaderGraphDashboardPanel,
  ReaderGraphHeader,
  ReaderIntelligencePanel,
  ReaderJourneyPanel,
  ReaderListPanel,
  ReaderProfilePanel,
  ReaderTimelinePanel,
  RelationshipHealthPanel,
  RelationshipPhilosophyPanel,
  RelationshipRecommendationsPanel,
  RelationshipSimulationPanel,
  WorkspaceReaderSelector,
} from './ReaderGraphPanels';

type RgTab = 'dashboard' | 'readers' | 'graph' | 'interests' | 'intelligence' | 'timeline';

const TABS: { id: RgTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'readers', label: 'READERS · JOURNEY' },
  { id: 'graph', label: 'GRAPH · COMMUNITIES' },
  { id: 'interests', label: 'INTERESTS · BEHAVIOR' },
  { id: 'intelligence', label: 'INTELLIGENCE · RECS' },
  { id: 'timeline', label: 'TIMELINE · PRIVACY' },
];

export function ReaderGraphWorkspace() {
  const [tab, setTab] = useState<RgTab>('dashboard');
  const {
    store,
    selectedReader,
    workspaceReaders,
    readerHealth,
    readerTimeline,
    readerInterests,
    readerBehavior,
    readerSignals,
    readerRecommendations,
    selectWorkspace,
    selectReader,
    setGraphZoom,
  } = useReaderGraphState();

  const panelProps = {
    store,
    selectedReader,
    workspaceReaders,
    readerHealth,
    readerTimeline,
    readerInterests,
    readerBehavior,
    readerSignals,
    readerRecommendations,
    onSelectWorkspace: selectWorkspace,
    onSelectReader: selectReader,
    onSetGraphZoom: setGraphZoom,
  };

  const renderTab = () => {
    switch (tab) {
      case 'readers':
        return (
          <>
            <ReaderListPanel {...panelProps} />
            <ReaderProfilePanel {...panelProps} />
            <ReaderJourneyPanel {...panelProps} />
            <RelationshipHealthPanel {...panelProps} />
          </>
        );
      case 'graph':
        return (
          <>
            <GraphVisualizationPanel {...panelProps} />
            <CommunityClustersPanel {...panelProps} />
            <CrossCompanyRelationshipsPanel {...panelProps} />
          </>
        );
      case 'interests':
        return (
          <>
            <KnowledgeInterestsPanel {...panelProps} />
            <BehaviorIntelligencePanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <ReaderIntelligencePanel {...panelProps} />
            <RelationshipRecommendationsPanel {...panelProps} />
            <CreatorMarketplacePanel {...panelProps} />
            <RelationshipSimulationPanel {...panelProps} />
          </>
        );
      case 'timeline':
        return (
          <>
            <ReaderTimelinePanel {...panelProps} />
            <PrivacyControlsPanel {...panelProps} />
            <RelationshipPhilosophyPanel />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <ReaderGraphDashboardPanel {...panelProps} />
            <WorkspaceReaderSelector {...panelProps} />
            <ReaderListPanel {...panelProps} />
            <ReaderProfilePanel {...panelProps} />
            <RelationshipHealthPanel {...panelProps} />
            <GraphVisualizationPanel {...panelProps} />
            <CommunityClustersPanel {...panelProps} />
            <ReaderIntelligencePanel {...panelProps} />
            <RelationshipRecommendationsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="reader-graph-root">
      <ReaderGraphHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#E11D48' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#E11D48' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(225,29,72,0.06)' : 'white',
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
