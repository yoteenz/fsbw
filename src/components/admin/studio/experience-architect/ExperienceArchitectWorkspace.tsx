import { useState } from 'react';
import { useExperienceArchitectState } from '../../../../hooks/useExperienceArchitectState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ConnectedSystemsPanel,
  CrossChannelPanel,
  DigitalArchitectHandoffPanel,
  EmotionalArchitecturePanel,
  ExperienceBlueprintPanel,
  ExperienceArchitectHeader,
  ExperienceDashboardPanel,
  ExperienceIntelligencePanel,
  ExperiencePhilosophyPanel,
  ExperienceSimulationPanel,
  ExperienceStandardsPanel,
  ExperienceSystemsPanel,
  FrictionAnalysisPanel,
  JourneyMapPanel,
  MicroExperienceLibraryPanel,
  WorkspaceSelectorPanel,
} from './ExperienceArchitectPanels';

type EaTab = 'dashboard' | 'blueprint' | 'journey' | 'systems' | 'simulation' | 'intelligence';

const TABS: { id: EaTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'blueprint', label: 'BLUEPRINT · EMOTIONAL' },
  { id: 'journey', label: 'JOURNEY MAP · CHANNELS' },
  { id: 'systems', label: 'SYSTEMS · MICRO' },
  { id: 'simulation', label: 'SIMULATION · STANDARDS' },
  { id: 'intelligence', label: 'INTELLIGENCE · HANDOFF' },
];

export function ExperienceArchitectWorkspace() {
  const [tab, setTab] = useState<EaTab>('dashboard');
  const { store, selectWorkspace } = useExperienceArchitectState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'blueprint':
        return (
          <>
            <ExperiencePhilosophyPanel {...panelProps} />
            <ExperienceBlueprintPanel {...panelProps} />
            <EmotionalArchitecturePanel {...panelProps} />
          </>
        );
      case 'journey':
        return (
          <>
            <JourneyMapPanel {...panelProps} />
            <CrossChannelPanel {...panelProps} />
            <FrictionAnalysisPanel {...panelProps} />
          </>
        );
      case 'systems':
        return (
          <>
            <ExperienceSystemsPanel {...panelProps} />
            <MicroExperienceLibraryPanel {...panelProps} />
            <ExperienceStandardsPanel {...panelProps} />
          </>
        );
      case 'simulation':
        return (
          <>
            <ExperienceSimulationPanel {...panelProps} />
            <ExperienceStandardsPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <ExperienceIntelligencePanel {...panelProps} />
            <FrictionAnalysisPanel {...panelProps} />
            <DigitalArchitectHandoffPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <ExperienceDashboardPanel {...panelProps} />
            <ExperiencePhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ExperienceBlueprintPanel {...panelProps} />
            <JourneyMapPanel {...panelProps} />
            <EmotionalArchitecturePanel {...panelProps} />
            <ExperienceSystemsPanel {...panelProps} />
            <MicroExperienceLibraryPanel {...panelProps} />
            <ExperienceSimulationPanel {...panelProps} />
            <ExperienceIntelligencePanel {...panelProps} />
            <CrossChannelPanel {...panelProps} />
            <ExperienceStandardsPanel {...panelProps} />
            <FrictionAnalysisPanel {...panelProps} />
            <DigitalArchitectHandoffPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="experience-architect-root">
      <ExperienceArchitectHeader />
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
