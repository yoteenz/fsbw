import { useState } from 'react';
import { useGrowthArchitectState } from '../../../../hooks/useGrowthArchitectState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ConnectedSystemsPanel,
  ExpansionArchitectPanel,
  GoToMarketPanel,
  GrowthArchitectHeader,
  GrowthBlueprintPanel,
  GrowthDashboardPanel,
  GrowthExperimentsPanel,
  GrowthInitiativesPanel,
  GrowthIntelligencePanel,
  GrowthLifecyclePanel,
  GrowthOrchestrationPanel,
  GrowthPhilosophyPanel,
  GrowthSimulationPanel,
  LaunchCalendarPanel,
  MarketIntelligencePanel,
  WorkspaceSelectorPanel,
} from './GrowthArchitectPanels';

type GaTab = 'dashboard' | 'blueprint' | 'initiatives' | 'intelligence' | 'orchestration' | 'expansion';

const TABS: { id: GaTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'blueprint', label: 'BLUEPRINT · LIFECYCLE' },
  { id: 'initiatives', label: 'INITIATIVES · GTM' },
  { id: 'intelligence', label: 'INTELLIGENCE · SIMULATION' },
  { id: 'orchestration', label: 'ORCHESTRATION · EXPERIMENTS' },
  { id: 'expansion', label: 'EXPANSION · MARKET' },
];

export function GrowthArchitectWorkspace() {
  const [tab, setTab] = useState<GaTab>('dashboard');
  const { store, selectWorkspace } = useGrowthArchitectState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'blueprint':
        return (
          <>
            <GrowthPhilosophyPanel {...panelProps} />
            <GrowthBlueprintPanel {...panelProps} />
            <GrowthLifecyclePanel {...panelProps} />
          </>
        );
      case 'initiatives':
        return (
          <>
            <GrowthInitiativesPanel {...panelProps} />
            <GoToMarketPanel {...panelProps} />
            <LaunchCalendarPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <GrowthIntelligencePanel {...panelProps} />
            <GrowthSimulationPanel {...panelProps} />
          </>
        );
      case 'orchestration':
        return (
          <>
            <GrowthOrchestrationPanel {...panelProps} />
            <GrowthExperimentsPanel {...panelProps} />
          </>
        );
      case 'expansion':
        return (
          <>
            <MarketIntelligencePanel {...panelProps} />
            <ExpansionArchitectPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <GrowthDashboardPanel {...panelProps} />
            <GrowthPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <GrowthBlueprintPanel {...panelProps} />
            <GrowthLifecyclePanel {...panelProps} />
            <GrowthInitiativesPanel {...panelProps} />
            <LaunchCalendarPanel {...panelProps} />
            <GrowthIntelligencePanel {...panelProps} />
            <GrowthSimulationPanel {...panelProps} />
            <GrowthOrchestrationPanel {...panelProps} />
            <GrowthExperimentsPanel {...panelProps} />
            <ExpansionArchitectPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="growth-architect-root">
      <GrowthArchitectHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#059669' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#059669' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(5,150,105,0.06)' : 'white',
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
