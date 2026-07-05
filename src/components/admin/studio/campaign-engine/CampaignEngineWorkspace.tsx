import { useState } from 'react';
import { useCampaignEngineState } from '../../../../hooks/useCampaignEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
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
  CampaignWorkspacePanel,
  ConnectedSystemsPanel,
  WorkOrchestrationLinkPanel,
  DistributionEngineLinkPanel,
  CreatorRecommendationsPanel,
  DeliverablesPanel,
  DepartmentCoordinationPanel,
  WorkspaceCampaignSelector,
} from './CampaignEnginePanels';

type CeTab = 'dashboard' | 'campaign' | 'calendar' | 'intelligence' | 'learning';

const TABS: { id: CeTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'campaign', label: 'CAMPAIGN · BUILDER' },
  { id: 'calendar', label: 'CALENDAR · COORDINATION' },
  { id: 'intelligence', label: 'INTELLIGENCE · ANALYTICS' },
  { id: 'learning', label: 'LEARNING · PLAYBOOKS' },
];

export function CampaignEngineWorkspace() {
  const [tab, setTab] = useState<CeTab>('dashboard');
  const {
    store,
    selectedCampaign,
    workspaceCampaigns,
    campaignDeliverables,
    selectWorkspace,
    selectCampaign,
    setBuilderStep,
  } = useCampaignEngineState();

  const panelProps = {
    store,
    selectedCampaign,
    workspaceCampaigns,
    campaignDeliverables,
    onSelectWorkspace: selectWorkspace,
    onSelectCampaign: selectCampaign,
    onSetBuilderStep: setBuilderStep,
  };

  const renderTab = () => {
    switch (tab) {
      case 'campaign':
        return (
          <>
            <CampaignBuilderPanel {...panelProps} />
            <CampaignListPanel {...panelProps} />
            <CampaignWorkspacePanel {...panelProps} />
            <DeliverablesPanel {...panelProps} />
            <CampaignLineagePanel {...panelProps} />
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
            <WorkspaceCampaignSelector {...panelProps} />
            <CampaignListPanel {...panelProps} />
            <CampaignWorkspacePanel {...panelProps} />
            <DeliverablesPanel {...panelProps} />
            <CampaignAnalyticsPanel {...panelProps} />
            <CampaignExperimentsPanel {...panelProps} />
            <DepartmentCoordinationPanel {...panelProps} />
            <CampaignLineagePanel {...panelProps} />
            <WorkOrchestrationLinkPanel />
            <DistributionEngineLinkPanel />
            <ConnectedSystemsPanel />
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

      {renderTab()}
    </div>
  );
}
