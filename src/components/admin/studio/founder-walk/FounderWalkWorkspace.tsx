import { useState } from 'react';
import { useFounderWalkState } from '../../../../hooks/useFounderWalkState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  CampusIntegrationPanel,
  ConnectedSystemsPanel,
  DayOnePathPanel,
  FamilyLegacyPanel,
  FounderTimelinePanel,
  FounderWalkHeader,
  FutureGenerationsPanel,
  LivingLandscapePanel,
  LivingPathwayPanel,
  MemoryIntelligencePanel,
  MemoryMarkersPanel,
  OrganizationalConnectionsPanel,
  PortfolioLegacyPanel,
  RecommendedNextStepsPanel,
  ReflectionSpacesPanel,
  WalkDashboardPanel,
  WalkPhilosophyPanel,
  WorkspaceSelectorPanel,
} from './FounderWalkPanels';

type FwTab = 'walk' | 'memory' | 'reflect' | 'legacy' | 'timeline' | 'connect';

const TABS: { id: FwTab; label: string }[] = [
  { id: 'walk', label: 'WALK · PATHWAY' },
  { id: 'memory', label: 'MEMORY · MARKERS' },
  { id: 'reflect', label: 'REFLECT · LANDSCAPE' },
  { id: 'legacy', label: 'LEGACY · GENERATIONS' },
  { id: 'timeline', label: 'TIMELINE · TIME' },
  { id: 'connect', label: 'CONNECT · CAMPUS' },
];

export function FounderWalkWorkspace() {
  const [tab, setTab] = useState<FwTab>('walk');
  const { store, selectWorkspace, setTimelineEra } = useFounderWalkState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace, onSetTimelineEra: setTimelineEra };

  const renderTab = () => {
    switch (tab) {
      case 'memory':
        return (
          <>
            <MemoryMarkersPanel {...panelProps} />
            <MemoryIntelligencePanel {...panelProps} />
            <OrganizationalConnectionsPanel {...panelProps} />
          </>
        );
      case 'reflect':
        return (
          <>
            <ReflectionSpacesPanel {...panelProps} />
            <LivingLandscapePanel {...panelProps} />
          </>
        );
      case 'legacy':
        return (
          <>
            <FutureGenerationsPanel {...panelProps} />
            <FamilyLegacyPanel {...panelProps} />
            <PortfolioLegacyPanel {...panelProps} />
          </>
        );
      case 'timeline':
        return (
          <>
            <FounderTimelinePanel {...panelProps} />
            <DayOnePathPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <CampusIntegrationPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'walk':
      default:
        return (
          <>
            <WalkDashboardPanel {...panelProps} />
            <WalkPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <DayOnePathPanel {...panelProps} />
            <LivingPathwayPanel {...panelProps} />
            <MemoryMarkersPanel {...panelProps} />
            <ReflectionSpacesPanel {...panelProps} />
            <LivingLandscapePanel {...panelProps} />
            <FutureGenerationsPanel {...panelProps} />
            <FounderTimelinePanel {...panelProps} />
            <CampusIntegrationPanel {...panelProps} />
            <MemoryIntelligencePanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="founder-walk-root">
      <FounderWalkHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#78716C' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#78716C' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(120,113,108,0.06)' : 'white',
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
