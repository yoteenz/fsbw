import { useState } from 'react';
import { useCampaignEngineState } from '../../../../hooks/useCampaignEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import { CampaignDeliverableStatsPanel } from './CampaignDeliverableStats';
import { CampaignWorkspaceTabs } from './CampaignWorkspaceTabs';
import { DeliverablesManagerPanel } from './DeliverablesManagerPanel';
import { NewsroomEditorPanel } from './NewsroomEditorPanel';
import {
  CampaignAnalyticsPanel,
  CampaignBuilderPanel,
  CampaignCalendarPanel,
  CampaignDashboardPanel,
  CampaignEngineHeader,
  CampaignExperimentsPanel,
  CampaignHierarchyPanel,
  CampaignLineagePanel,
  CampaignListPanel,
  CampaignPlaybooksPanel,
  CampaignRetrospectivesPanel,
  CampaignSimulationPanel,
  CampaignWorkspaceOverviewPanel,
  ConnectedSystemsPanel,
  CreatorRecommendationsPanel,
  DepartmentCoordinationPanel,
  WorkOrchestrationLinkPanel,
} from './CampaignEnginePanels';

type CeTab = 'dashboard' | 'campaign' | 'calendar' | 'intelligence' | 'learning';

const TABS: { id: CeTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'campaign', label: 'CAMPAIGNS' },
  { id: 'calendar', label: 'CALENDAR · COORDINATION' },
  { id: 'intelligence', label: 'INTELLIGENCE · ANALYTICS' },
  { id: 'learning', label: 'LEARNING · PLAYBOOKS' },
];

export function CampaignEngineWorkspace() {
  const [tab, setTab] = useState<CeTab>('dashboard');
  const {
    store,
    selectedCampaign,
    selectedDeliverable,
    workspaceCampaigns,
    campaignDeliverables,
    deliverableStatsByCampaign,
    selectWorkspace,
    selectCampaign,
    selectWorkspaceTab,
    viewCampaignDeliverables,
    selectDeliverable,
    setBuilderStep,
    applyDeliverableAction,
  } = useCampaignEngineState();

  const panelProps = {
    store,
    selectedCampaign,
    workspaceCampaigns,
    campaignDeliverables,
    deliverableStatsByCampaign,
    onSelectWorkspace: selectWorkspace,
    onSelectCampaign: selectCampaign,
    onViewDeliverables: viewCampaignDeliverables,
    onSetBuilderStep: setBuilderStep,
  };

  const renderWorkspaceTab = () => {
    if (!selectedCampaign) return null;
    switch (store.workspaceTab) {
      case 'deliverables':
        return (
          <>
            <CampaignDeliverableStatsPanel deliverables={campaignDeliverables} />
            <DeliverablesManagerPanel
              campaign={selectedCampaign}
              deliverables={campaignDeliverables}
              selectedDeliverableId={store.selectedDeliverableId}
              onSelectDeliverable={selectDeliverable}
            />
          </>
        );
      case 'calendar':
        return (
          <>
            <CampaignCalendarPanel {...panelProps} />
            <DepartmentCoordinationPanel {...panelProps} />
          </>
        );
      case 'research':
        return (
          <>
            <CreatorRecommendationsPanel {...panelProps} />
            <CampaignLineagePanel {...panelProps} />
            <WorkOrchestrationLinkPanel />
          </>
        );
      case 'analytics':
        return (
          <>
            <CampaignAnalyticsPanel {...panelProps} />
            <CampaignExperimentsPanel {...panelProps} />
            <CampaignSimulationPanel {...panelProps} />
          </>
        );
      case 'overview':
      default:
        return (
          <>
            <CampaignWorkspaceOverviewPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  const renderEngineTab = () => {
    switch (tab) {
      case 'campaign':
        return (
          <>
            <CampaignBuilderPanel {...panelProps} />
            <CampaignListPanel {...panelProps} />
            {selectedCampaign ? (
              <>
                <CampaignWorkspaceTabs activeTab={store.workspaceTab} onSelectTab={selectWorkspaceTab} />
                {renderWorkspaceTab()}
              </>
            ) : (
              <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
                SELECT A CAMPAIGN TO OPEN CAMPAIGN WORKSPACE · DELIVERABLES · REVIEW · PUBLISHING
              </StudioTabMoreHint>
            )}
          </>
        );
      case 'calendar':
        return (
          <>
            <CampaignCalendarPanel {...panelProps} />
            <DepartmentCoordinationPanel {...panelProps} />
            <CreatorRecommendationsPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <CampaignAnalyticsPanel {...panelProps} />
            <CampaignExperimentsPanel {...panelProps} />
            <CampaignSimulationPanel {...panelProps} />
          </>
        );
      case 'learning':
        return (
          <>
            <CampaignRetrospectivesPanel {...panelProps} />
            <CampaignPlaybooksPanel {...panelProps} />
            <CampaignHierarchyPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <CampaignDashboardPanel {...panelProps} />
            <CampaignListPanel {...panelProps} />
            {selectedCampaign ? (
              <>
                <CampaignWorkspaceTabs activeTab={store.workspaceTab} onSelectTab={selectWorkspaceTab} />
                {renderWorkspaceTab()}
              </>
            ) : null}
            {!selectedCampaign ? (
              <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
                EXECUTIVE OVERVIEW · SELECT A CAMPAIGN FOR DELIVERABLES MANAGER™
              </StudioTabMoreHint>
            ) : null}
          </>
        );
    }
  };

  return (
    <div className="campaign-engine-root">
      <CampaignEngineHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(217,119,6,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderEngineTab()}

      {selectedDeliverable && selectedCampaign ? (
        <NewsroomEditorPanel
          deliverable={selectedDeliverable}
          campaign={selectedCampaign}
          autoPublishEnabled={store.autoPublishEnabled}
          onClose={() => selectDeliverable(null)}
          onAction={(action) => applyDeliverableAction(selectedDeliverable.id, action)}
        />
      ) : null}
    </div>
  );
}
