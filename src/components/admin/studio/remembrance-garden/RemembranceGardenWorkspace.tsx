import { useState } from 'react';
import { useRemembranceGardenState } from '../../../../hooks/useRemembranceGardenState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  CampusIntegrationPanel,
  ConnectedSystemsPanel,
  DedicationSpacesPanel,
  FamilyHeritagePanel,
  FutureGenerationsPanel,
  GardenDashboardPanel,
  GardenPhilosophyPanel,
  GratitudeMomentsPanel,
  LegacyLettersPanel,
  LivingSeasonsPanel,
  MemoryPreservationPanel,
  PortfolioRemembrancePanel,
  RecommendedNextStepsPanel,
  ReflectionSpacesPanel,
  RemembranceGardenHeader,
  WorkspaceSelectorPanel,
} from './RemembranceGardenPanels';

type RgTab = 'garden' | 'dedicate' | 'reflect' | 'legacy' | 'seasons' | 'connect';

const TABS: { id: RgTab; label: string }[] = [
  { id: 'garden', label: 'GARDEN · OVERVIEW' },
  { id: 'dedicate', label: 'DEDICATE · MEMORIALS' },
  { id: 'reflect', label: 'REFLECT · SPACES' },
  { id: 'legacy', label: 'LEGACY · LETTERS' },
  { id: 'seasons', label: 'SEASONS · ALIVE' },
  { id: 'connect', label: 'CONNECT · CAMPUS' },
];

export function RemembranceGardenWorkspace() {
  const [tab, setTab] = useState<RgTab>('garden');
  const { store, selectWorkspace, setSeason } = useRemembranceGardenState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace, onSetSeason: setSeason };

  const renderTab = () => {
    switch (tab) {
      case 'dedicate':
        return (
          <>
            <DedicationSpacesPanel {...panelProps} />
            <MemoryPreservationPanel {...panelProps} />
            <GratitudeMomentsPanel {...panelProps} />
          </>
        );
      case 'reflect':
        return (
          <>
            <ReflectionSpacesPanel {...panelProps} />
            <LivingSeasonsPanel {...panelProps} />
          </>
        );
      case 'legacy':
        return (
          <>
            <LegacyLettersPanel {...panelProps} />
            <FamilyHeritagePanel {...panelProps} />
            <FutureGenerationsPanel {...panelProps} />
            <PortfolioRemembrancePanel {...panelProps} />
          </>
        );
      case 'seasons':
        return (
          <>
            <LivingSeasonsPanel {...panelProps} />
            <GratitudeMomentsPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <CampusIntegrationPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'garden':
      default:
        return (
          <>
            <GardenDashboardPanel {...panelProps} />
            <GardenPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <DedicationSpacesPanel {...panelProps} />
            <MemoryPreservationPanel {...panelProps} />
            <ReflectionSpacesPanel {...panelProps} />
            <LivingSeasonsPanel {...panelProps} />
            <LegacyLettersPanel {...panelProps} />
            <FamilyHeritagePanel {...panelProps} />
            <FutureGenerationsPanel {...panelProps} />
            <GratitudeMomentsPanel {...panelProps} />
            <CampusIntegrationPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="remembrance-garden-root">
      <RemembranceGardenHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#6B9080' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#6B9080' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(107,144,128,0.06)' : 'white',
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
