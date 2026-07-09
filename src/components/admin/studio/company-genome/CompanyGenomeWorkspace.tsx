import { useState } from 'react';
import { useCompanyGenomeState } from '../../../../hooks/useCompanyGenomeState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  CompanyGenomeHeader,
  ConnectedSystemsPanel,
  CrossCompanyGeneticsPanel,
  GeneticEvolutionPanel,
  GeneticLayersPanel,
  GeneticRelationshipsPanel,
  GenomeDashboardPanel,
  GenomeIntelligencePanel,
  GenomePhilosophyPanel,
  GenomeSimulationPanel,
  GenomeVisualizationPanel,
  KnowledgeFlowPanel,
  OrganizationalFingerprintPanel,
  OrganizationalHealthPanel,
  ResiliencePanel,
  WorkspaceSelectorPanel,
} from './CompanyGenomePanels';
import {
  BusinessEventsPanel,
  BusinessGenomeDashboardPanel,
  BusinessVisualizationSelector,
  GrowthLoopPanel,
  renderBusinessVisualization,
} from './BusinessGenomePanels';

type CgTab = 'business' | 'dashboard' | 'genetic' | 'health' | 'evolution' | 'relationships' | 'intelligence';

const TABS: { id: CgTab; label: string }[] = [
  { id: 'business', label: 'BUSINESS GENOME · LIVING' },
  { id: 'dashboard', label: 'GENETIC DASHBOARD' },
  { id: 'genetic', label: 'GENETIC MAP · LAYERS' },
  { id: 'health', label: 'HEALTH · RESILIENCE' },
  { id: 'evolution', label: 'EVOLUTION · TIMELINE' },
  { id: 'relationships', label: 'RELATIONSHIPS · FLOW' },
  { id: 'intelligence', label: 'INTELLIGENCE · SIMULATION' },
];

export function CompanyGenomeWorkspace() {
  const [tab, setTab] = useState<CgTab>('business');
  const {
    store,
    businessStore,
    businessConsult,
    selectedBusinessSystem,
    visualizationFlows,
    selectWorkspace,
    setZoomLevel,
    setVisualization,
    selectSystem,
  } = useCompanyGenomeState();

  const panelProps = { store, onSelectWorkspace: selectWorkspace, onSetZoomLevel: setZoomLevel };
  const businessProps = {
    businessStore,
    dashboard: businessConsult.dashboard,
    selectedSystem: selectedBusinessSystem,
    visualizationFlows,
    onSetVisualization: setVisualization,
    onSelectSystem: selectSystem,
  };

  const renderTab = () => {
    switch (tab) {
      case 'business':
        return (
          <>
            <BusinessGenomeDashboardPanel {...businessProps} />
            <GrowthLoopPanel {...businessProps} />
            <BusinessVisualizationSelector {...businessProps} />
            {renderBusinessVisualization(businessProps)}
            <BusinessEventsPanel {...businessProps} />
          </>
        );
      case 'genetic':
        return (
          <>
            <GenomeVisualizationPanel {...panelProps} />
            <GeneticLayersPanel {...panelProps} />
            <OrganizationalFingerprintPanel {...panelProps} />
          </>
        );
      case 'health':
        return (
          <>
            <OrganizationalHealthPanel {...panelProps} />
            <ResiliencePanel {...panelProps} />
          </>
        );
      case 'evolution':
        return (
          <>
            <GeneticEvolutionPanel {...panelProps} />
            <CrossCompanyGeneticsPanel {...panelProps} />
          </>
        );
      case 'relationships':
        return (
          <>
            <GeneticRelationshipsPanel {...panelProps} />
            <KnowledgeFlowPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <GenomeIntelligencePanel {...panelProps} />
            <GenomeSimulationPanel {...panelProps} />
          </>
        );
      case 'dashboard':
        return (
          <>
            <GenomeDashboardPanel {...panelProps} />
            <GenomePhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              GENETIC LAYERS ON OTHER TABS · BUSINESS GENOME ON FIRST TAB
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="company-genome-root">
      <CompanyGenomeHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#9333EA' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#9333EA' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(147,51,234,0.06)' : 'white',
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
