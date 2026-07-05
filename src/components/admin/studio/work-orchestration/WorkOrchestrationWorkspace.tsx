import { useState } from 'react';
import { useWorkOrchestrationState } from '../../../../hooks/useWorkOrchestrationState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ActivitiesPanel,
  CapacityIntelligencePanel,
  ConnectedSystemsPanel,
  CosOrchestrationPanel,
  DependencyEnginePanel,
  DynamicPrioritizationPanel,
  ExecutiveQueuePanel,
  FounderWorkspacePanel,
  IntelligentWorkGenerationPanel,
  KnowledgeIntegrationPanel,
  OperationalHealthPanel,
  OrchestrationDashboardPanel,
  TimelineEnginePanel,
  WorkHierarchyPanel,
  WorkOrchestrationHeader,
  WorkPackagesPanel,
} from './WorkOrchestrationPanels';

type WoTab = 'orchestration' | 'packages' | 'capacity' | 'founder' | 'timeline' | 'health';

const TABS: { id: WoTab; label: string }[] = [
  { id: 'orchestration', label: 'ORCHESTRATION' },
  { id: 'packages', label: 'WORK PACKAGES' },
  { id: 'capacity', label: 'CAPACITY · QUEUE' },
  { id: 'founder', label: 'FOUNDER' },
  { id: 'timeline', label: 'TIMELINE' },
  { id: 'health', label: 'HEALTH · LEARNING' },
];

export function WorkOrchestrationWorkspace() {
  const [tab, setTab] = useState<WoTab>('orchestration');
  const {
    store,
    selectedPackage,
    packageActivities,
    workspacePackages,
    selectWorkspace,
    selectPackage,
    setTimelineZoom,
  } = useWorkOrchestrationState();

  const panelProps = {
    store,
    selectedPackage,
    workspacePackages,
    packageActivities,
    onSelectWorkspace: selectWorkspace,
    onSelectPackage: selectPackage,
    onSetTimelineZoom: setTimelineZoom,
  };

  const renderTab = () => {
    switch (tab) {
      case 'packages':
        return (
          <>
            <WorkPackagesPanel {...panelProps} />
            <ActivitiesPanel {...panelProps} />
            <DependencyEnginePanel {...panelProps} />
            <IntelligentWorkGenerationPanel {...panelProps} />
          </>
        );
      case 'capacity':
        return (
          <>
            <CapacityIntelligencePanel {...panelProps} />
            <ExecutiveQueuePanel {...panelProps} />
            <DynamicPrioritizationPanel {...panelProps} />
            <CosOrchestrationPanel {...panelProps} />
          </>
        );
      case 'founder':
        return (
          <>
            <FounderWorkspacePanel {...panelProps} />
            <CosOrchestrationPanel {...panelProps} />
          </>
        );
      case 'timeline':
        return (
          <>
            <TimelineEnginePanel {...panelProps} />
            <WorkHierarchyPanel {...panelProps} />
          </>
        );
      case 'health':
        return (
          <>
            <OperationalHealthPanel {...panelProps} />
            <KnowledgeIntegrationPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'orchestration':
        return (
          <>
            <OrchestrationDashboardPanel {...panelProps} />
            <FounderWorkspacePanel {...panelProps} />
            <WorkPackagesPanel {...panelProps} />
            <CosOrchestrationPanel {...panelProps} />
            <DependencyEnginePanel {...panelProps} />
            <CapacityIntelligencePanel {...panelProps} />
            <ExecutiveQueuePanel {...panelProps} />
            <OperationalHealthPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="work-orchestration-root">
      <WorkOrchestrationHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0891B2' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0891B2' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(8,145,178,0.06)' : 'white',
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
