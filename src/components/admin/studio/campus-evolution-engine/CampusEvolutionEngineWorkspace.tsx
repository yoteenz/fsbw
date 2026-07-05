import { useState } from 'react';
import { useCampusEvolutionEngineState } from '../../../../hooks/useCampusEvolutionEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ArchitecturalProgressionPanel,
  ArchitecturalSimulationPanel,
  BrandInheritancePanel,
  CampusDashboardPanel,
  CampusEvolutionHeader,
  CampusIntelligencePanel,
  CampusPhilosophyPanel,
  CompanyMemoryPanel,
  ConnectedSystemsPanel,
  CultureProfilePanel,
  DayOnePanel,
  EarnedSpacesPanel,
  LivingEnvironmentPanel,
  LivingMuseumPanel,
  OrganicEvolutionPanel,
  PortfolioCampusPanel,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './CampusEvolutionEnginePanels';

type CeTab = 'dashboard' | 'progression' | 'spaces' | 'memory' | 'culture' | 'simulation';

const TABS: { id: CeTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD · OVERVIEW' },
  { id: 'progression', label: 'PROGRESSION · EVOLUTION' },
  { id: 'spaces', label: 'SPACES · CONSTRUCTION' },
  { id: 'memory', label: 'MEMORY · MUSEUM' },
  { id: 'culture', label: 'CULTURE · PORTFOLIO' },
  { id: 'simulation', label: 'SIMULATION · INTELLIGENCE' },
];

export function CampusEvolutionEngineWorkspace() {
  const [tab, setTab] = useState<CeTab>('dashboard');
  const { store, selectWorkspace, focusStage } = useCampusEvolutionEngineState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace, onFocusStage: focusStage };

  const renderTab = () => {
    switch (tab) {
      case 'progression':
        return (
          <>
            <DayOnePanel {...panelProps} />
            <ArchitecturalProgressionPanel {...panelProps} />
            <OrganicEvolutionPanel {...panelProps} />
          </>
        );
      case 'spaces':
        return (
          <>
            <EarnedSpacesPanel {...panelProps} />
            <LivingEnvironmentPanel {...panelProps} />
          </>
        );
      case 'memory':
        return (
          <>
            <CompanyMemoryPanel {...panelProps} />
            <LivingMuseumPanel {...panelProps} />
          </>
        );
      case 'culture':
        return (
          <>
            <BrandInheritancePanel {...panelProps} />
            <CultureProfilePanel {...panelProps} />
            <PortfolioCampusPanel {...panelProps} />
          </>
        );
      case 'simulation':
        return (
          <>
            <ArchitecturalSimulationPanel {...panelProps} />
            <CampusIntelligencePanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <CampusDashboardPanel {...panelProps} />
            <CampusPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ArchitecturalProgressionPanel {...panelProps} />
            <EarnedSpacesPanel {...panelProps} />
            <OrganicEvolutionPanel {...panelProps} />
            <CompanyMemoryPanel {...panelProps} />
            <LivingMuseumPanel {...panelProps} />
            <BrandInheritancePanel {...panelProps} />
            <LivingEnvironmentPanel {...panelProps} />
            <CampusIntelligencePanel {...panelProps} />
            <ArchitecturalSimulationPanel {...panelProps} />
            <PortfolioCampusPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="campus-evolution-root">
      <CampusEvolutionHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(13,148,136,0.06)' : 'white',
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
