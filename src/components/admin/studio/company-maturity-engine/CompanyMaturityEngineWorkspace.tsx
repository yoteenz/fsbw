import { useState } from 'react';
import { useCompanyMaturityEngineState } from '../../../../hooks/useCompanyMaturityEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ArchitectRecommendationsPanel,
  CompanyMaturityEngineHeader,
  CompanyRoadmapPanel,
  CompanyStagePanel,
  CompanyTimelinePanel,
  ConnectedSystemsPanel,
  CosMaturityPanel,
  ExistingAssetInventoryPanel,
  HistoricalProgressPanel,
  IntegrationCenterPanel,
  MaturityAssessmentPanel,
  MaturityDashboardPanel,
  MaturityPhilosophyPanel,
  MaturityScorecardPanel,
  MaturitySimulationPanel,
  OnboardingPathsPanel,
  OrganizationalScanPanel,
  WorkspaceSelectorPanel,
} from './CompanyMaturityEnginePanels';

type CmeTab = 'dashboard' | 'assessment' | 'inventory' | 'roadmap' | 'timeline' | 'simulation';

const TABS: { id: CmeTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'assessment', label: 'ASSESSMENT · SCAN' },
  { id: 'inventory', label: 'INVENTORY · INTEGRATIONS' },
  { id: 'roadmap', label: 'ROADMAP · ARCHITECTS' },
  { id: 'timeline', label: 'TIMELINE · PROGRESS' },
  { id: 'simulation', label: 'SIMULATION · CoS' },
];

export function CompanyMaturityEngineWorkspace() {
  const [tab, setTab] = useState<CmeTab>('dashboard');
  const { store, selectWorkspace } = useCompanyMaturityEngineState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'assessment':
        return (
          <>
            <MaturityAssessmentPanel {...panelProps} />
            <MaturityScorecardPanel {...panelProps} />
            <OrganizationalScanPanel {...panelProps} />
            <CompanyStagePanel {...panelProps} />
          </>
        );
      case 'inventory':
        return (
          <>
            <ExistingAssetInventoryPanel {...panelProps} />
            <IntegrationCenterPanel {...panelProps} />
            <OnboardingPathsPanel {...panelProps} />
          </>
        );
      case 'roadmap':
        return (
          <>
            <ArchitectRecommendationsPanel {...panelProps} />
            <CompanyRoadmapPanel {...panelProps} />
          </>
        );
      case 'timeline':
        return (
          <>
            <CompanyTimelinePanel {...panelProps} />
            <HistoricalProgressPanel {...panelProps} />
          </>
        );
      case 'simulation':
        return (
          <>
            <MaturitySimulationPanel {...panelProps} />
            <CosMaturityPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <MaturityDashboardPanel {...panelProps} />
            <MaturityPhilosophyPanel {...panelProps} />
            <OnboardingPathsPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <MaturityScorecardPanel {...panelProps} />
            <MaturityAssessmentPanel {...panelProps} />
            <OrganizationalScanPanel {...panelProps} />
            <ArchitectRecommendationsPanel {...panelProps} />
            <CompanyRoadmapPanel {...panelProps} />
            <CompanyTimelinePanel {...panelProps} />
            <CosMaturityPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="company-maturity-engine-root">
      <CompanyMaturityEngineHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0369A1' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0369A1' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(3,105,161,0.06)' : 'white',
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
