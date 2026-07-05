import { useState } from 'react';
import { useRelationshipEngineState } from '../../../../hooks/useRelationshipEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  CommunicationOrchestrationPanel,
  CommunityEnginePanel,
  ConnectedSystemsPanel,
  CosIntegrationPanel,
  InstitutionalLearningPanel,
  LifecycleStagesPanel,
  LoyaltyIntelligencePanel,
  NextBestActionPanel,
  PortfolioRelationshipsPanel,
  RecognitionEnginePanel,
  RelationshipDashboardPanel,
  RelationshipEngineHeader,
  RelationshipHealthPanel,
  RelationshipIntelligencePanel,
  RelationshipListPanel,
  RelationshipSimulationPanel,
  RelationshipTimelinePanel,
  RelationshipWorkspacePanel,
  WorkspaceRelationshipSelector,
} from './RelationshipEnginePanels';

type ReTab = 'dashboard' | 'relationships' | 'actions' | 'community' | 'intelligence' | 'learning';

const TABS: { id: ReTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'relationships', label: 'RELATIONSHIPS · HEALTH' },
  { id: 'actions', label: 'ACTIONS · TIMELINE' },
  { id: 'community', label: 'COMMUNITY · COMMS' },
  { id: 'intelligence', label: 'INTELLIGENCE · SIM' },
  { id: 'learning', label: 'LEARNING · PORTFOLIO' },
];

export function RelationshipEngineWorkspace() {
  const [tab, setTab] = useState<ReTab>('dashboard');
  const {
    store,
    selectedRelationship,
    workspaceRelationships,
    relationshipHealth,
    relationshipActions,
    relationshipTimeline,
    relationshipSignals,
    relationshipLoyalty,
    selectWorkspace,
    selectRelationship,
  } = useRelationshipEngineState();

  const panelProps = {
    store,
    selectedRelationship,
    workspaceRelationships,
    relationshipHealth,
    relationshipActions,
    relationshipTimeline,
    relationshipSignals,
    relationshipLoyalty,
    onSelectWorkspace: selectWorkspace,
    onSelectRelationship: selectRelationship,
  };

  const renderTab = () => {
    switch (tab) {
      case 'relationships':
        return (
          <>
            <RelationshipListPanel {...panelProps} />
            <RelationshipWorkspacePanel {...panelProps} />
            <RelationshipHealthPanel {...panelProps} />
            <LifecycleStagesPanel />
          </>
        );
      case 'actions':
        return (
          <>
            <NextBestActionPanel {...panelProps} />
            <RelationshipTimelinePanel {...panelProps} />
            <RecognitionEnginePanel {...panelProps} />
            <LoyaltyIntelligencePanel {...panelProps} />
          </>
        );
      case 'community':
        return (
          <>
            <CommunityEnginePanel {...panelProps} />
            <CommunicationOrchestrationPanel {...panelProps} />
            <CosIntegrationPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <RelationshipIntelligencePanel {...panelProps} />
            <RelationshipSimulationPanel {...panelProps} />
          </>
        );
      case 'learning':
        return (
          <>
            <InstitutionalLearningPanel {...panelProps} />
            <PortfolioRelationshipsPanel {...panelProps} />
          </>
        );
      case 'dashboard':
        return (
          <>
            <RelationshipDashboardPanel {...panelProps} />
            <WorkspaceRelationshipSelector {...panelProps} />
            <RelationshipListPanel {...panelProps} />
            <RelationshipWorkspacePanel {...panelProps} />
            <NextBestActionPanel {...panelProps} />
            <RelationshipHealthPanel {...panelProps} />
            <CommunityEnginePanel {...panelProps} />
            <CosIntegrationPanel {...panelProps} />
            <RecognitionEnginePanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="relationship-engine-root">
      <RelationshipEngineHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#059669' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#059669' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(5,150,105,0.06)' : 'white',
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
