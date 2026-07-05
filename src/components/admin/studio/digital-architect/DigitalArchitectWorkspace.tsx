import { useState } from 'react';
import { useDigitalArchitectState } from '../../../../hooks/useDigitalArchitectState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AiFeatureArchitectPanel,
  ApplicationArchitecturePanel,
  ConnectedSystemsPanel,
  DesignSystemPanel,
  DeveloperHandoffPanel,
  DigitalArchitectHeader,
  DigitalDashboardPanel,
  DigitalPhilosophyPanel,
  DigitalSimulationPanel,
  EcosystemBuilderPanel,
  ExperienceGalleryPanel,
  ExperienceInheritancePanel,
  HybridArchitecturePanel,
  ImmersivePreviewPanel,
  ImplementationRoadmapPanel,
  IntegrationCenterPanel,
  LaunchArchitectHandoffPanel,
  RecommendationEnginePanel,
  SolutionArchitecturePanel,
  WorkspaceSelectorPanel,
} from './DigitalArchitectPanels';

type DaTab = 'dashboard' | 'gallery' | 'architecture' | 'systems' | 'simulation' | 'handoff';

const TABS: { id: DaTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'gallery', label: 'GALLERY · PREVIEW' },
  { id: 'architecture', label: 'ARCHITECTURE · INHERITANCE' },
  { id: 'systems', label: 'DESIGN SYSTEM · AI' },
  { id: 'simulation', label: 'SIMULATION · ROADMAP' },
  { id: 'handoff', label: 'HANDOFF · INTEGRATIONS' },
];

export function DigitalArchitectWorkspace() {
  const [tab, setTab] = useState<DaTab>('dashboard');
  const { store, selectWorkspace } = useDigitalArchitectState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'gallery':
        return (
          <>
            <ExperienceGalleryPanel {...panelProps} />
            <HybridArchitecturePanel {...panelProps} />
            <RecommendationEnginePanel {...panelProps} />
            <ImmersivePreviewPanel {...panelProps} />
          </>
        );
      case 'architecture':
        return (
          <>
            <SolutionArchitecturePanel {...panelProps} />
            <ExperienceInheritancePanel {...panelProps} />
            <ApplicationArchitecturePanel {...panelProps} />
            <EcosystemBuilderPanel {...panelProps} />
          </>
        );
      case 'systems':
        return (
          <>
            <DesignSystemPanel {...panelProps} />
            <AiFeatureArchitectPanel {...panelProps} />
          </>
        );
      case 'simulation':
        return (
          <>
            <DigitalSimulationPanel {...panelProps} />
            <ImplementationRoadmapPanel {...panelProps} />
            <DeveloperHandoffPanel {...panelProps} />
          </>
        );
      case 'handoff':
        return (
          <>
            <LaunchArchitectHandoffPanel {...panelProps} />
            <IntegrationCenterPanel {...panelProps} />
            <DeveloperHandoffPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <DigitalDashboardPanel {...panelProps} />
            <DigitalPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <RecommendationEnginePanel {...panelProps} />
            <ExperienceGalleryPanel {...panelProps} />
            <ImmersivePreviewPanel {...panelProps} />
            <ExperienceInheritancePanel {...panelProps} />
            <SolutionArchitecturePanel {...panelProps} />
            <DesignSystemPanel {...panelProps} />
            <ApplicationArchitecturePanel {...panelProps} />
            <DigitalSimulationPanel {...panelProps} />
            <ImplementationRoadmapPanel {...panelProps} />
            <LaunchArchitectHandoffPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="digital-architect-root">
      <DigitalArchitectHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#6366F1' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#6366F1' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(99,102,241,0.06)' : 'white',
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
