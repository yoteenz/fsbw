import { useState } from 'react';
import { useDistributionEngineState } from '../../../../hooks/useDistributionEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AudienceAdaptationPanel,
  ChannelOptimizationPanel,
  ConnectedSystemsPanel,
  CreatorMarketplacePanel,
  CrossCompanyDistributionPanel,
  DistributionCalendarPanel,
  DistributionDashboardPanel,
  DistributionEngineHeader,
  DistributionHealthPanel,
  DistributionHierarchyPanel,
  DistributionIntelligencePanel,
  DistributionLineagePanel,
  DistributionSimulationPanel,
  DistributionStrategiesPanel,
  EvergreenEnginePanel,
  FeedbackLoopPanel,
  KnowledgeAdaptationPanel,
  KnowledgeAssetsPanel,
  KnowledgeCollectionsPanel,
  PerformanceIntelligencePanel,
  WorkspaceAssetSelector,
} from './DistributionEnginePanels';

type DeTab = 'dashboard' | 'assets' | 'calendar' | 'intelligence' | 'performance' | 'lineage';

const TABS: { id: DeTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'assets', label: 'ASSETS · CHANNELS' },
  { id: 'calendar', label: 'CALENDAR · EVERGREEN' },
  { id: 'intelligence', label: 'INTELLIGENCE · SIMULATION' },
  { id: 'performance', label: 'PERFORMANCE · LEARNING' },
  { id: 'lineage', label: 'LINEAGE · COLLECTIONS' },
];

export function DistributionEngineWorkspace() {
  const [tab, setTab] = useState<DeTab>('dashboard');
  const {
    store,
    selectedAsset,
    workspaceAssets,
    assetAdaptations,
    assetPerformance,
    selectWorkspace,
    selectAsset,
  } = useDistributionEngineState();

  const panelProps = {
    store,
    selectedAsset,
    workspaceAssets,
    assetAdaptations,
    assetPerformance,
    onSelectWorkspace: selectWorkspace,
    onSelectAsset: selectAsset,
  };

  const renderTab = () => {
    switch (tab) {
      case 'assets':
        return (
          <>
            <KnowledgeAssetsPanel {...panelProps} />
            <KnowledgeAdaptationPanel {...panelProps} />
            <DistributionStrategiesPanel {...panelProps} />
            <ChannelOptimizationPanel {...panelProps} />
            <AudienceAdaptationPanel {...panelProps} />
            <CreatorMarketplacePanel {...panelProps} />
          </>
        );
      case 'calendar':
        return (
          <>
            <DistributionCalendarPanel {...panelProps} />
            <EvergreenEnginePanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <DistributionIntelligencePanel {...panelProps} />
            <DistributionSimulationPanel {...panelProps} />
          </>
        );
      case 'performance':
        return (
          <>
            <PerformanceIntelligencePanel {...panelProps} />
            <FeedbackLoopPanel {...panelProps} />
            <DistributionHealthPanel {...panelProps} />
          </>
        );
      case 'lineage':
        return (
          <>
            <DistributionLineagePanel {...panelProps} />
            <KnowledgeCollectionsPanel {...panelProps} />
            <CrossCompanyDistributionPanel {...panelProps} />
            <DistributionHierarchyPanel />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <DistributionDashboardPanel {...panelProps} />
            <WorkspaceAssetSelector {...panelProps} />
            <KnowledgeAssetsPanel {...panelProps} />
            <DistributionIntelligencePanel {...panelProps} />
            <DistributionCalendarPanel {...panelProps} />
            <EvergreenEnginePanel {...panelProps} />
            <PerformanceIntelligencePanel {...panelProps} />
            <DistributionHealthPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="distribution-engine-root">
      <DistributionEngineHeader />

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
