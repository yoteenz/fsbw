import { useState } from 'react';
import { useBrandArchitectState } from '../../../../hooks/useBrandArchitectState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  BrandArchitectHeader,
  BrandBlueprintPanel,
  BrandDashboardPanel,
  BrandEvolutionPanel,
  BrandHealthPanel,
  BrandPhilosophyPanel,
  BrandSimulationPanel,
  BrandSystemsPanel,
  CompetitiveIntelligencePanel,
  ConnectedSystemsPanel,
  ExperienceArchitectHandoffPanel,
  VerbalIdentityPanel,
  VisualIdentityPanel,
  WorkspaceSelectorPanel,
} from './BrandArchitectPanels';

type BaTab = 'dashboard' | 'blueprint' | 'verbal' | 'visual' | 'systems' | 'intelligence';

const TABS: { id: BaTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'blueprint', label: 'BLUEPRINT · PHILOSOPHY' },
  { id: 'verbal', label: 'VERBAL IDENTITY' },
  { id: 'visual', label: 'VISUAL IDENTITY' },
  { id: 'systems', label: 'BRAND SYSTEMS' },
  { id: 'intelligence', label: 'COMPETITIVE · SIMULATION · HANDOFF' },
];

export function BrandArchitectWorkspace() {
  const [tab, setTab] = useState<BaTab>('dashboard');
  const { store, selectWorkspace } = useBrandArchitectState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'blueprint':
        return (
          <>
            <BrandPhilosophyPanel {...panelProps} />
            <BrandBlueprintPanel {...panelProps} />
          </>
        );
      case 'verbal':
        return <VerbalIdentityPanel {...panelProps} />;
      case 'visual':
        return <VisualIdentityPanel {...panelProps} />;
      case 'systems':
        return (
          <>
            <BrandSystemsPanel {...panelProps} />
            <BrandHealthPanel {...panelProps} />
            <BrandEvolutionPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <CompetitiveIntelligencePanel {...panelProps} />
            <BrandSimulationPanel {...panelProps} />
            <ExperienceArchitectHandoffPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <BrandDashboardPanel {...panelProps} />
            <BrandPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <BrandBlueprintPanel {...panelProps} />
            <VerbalIdentityPanel {...panelProps} />
            <VisualIdentityPanel {...panelProps} />
            <BrandSystemsPanel {...panelProps} />
            <BrandHealthPanel {...panelProps} />
            <CompetitiveIntelligencePanel {...panelProps} />
            <BrandSimulationPanel {...panelProps} />
            <BrandEvolutionPanel {...panelProps} />
            <ExperienceArchitectHandoffPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="brand-architect-root">
      <BrandArchitectHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#BE185D' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#BE185D' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(190,24,93,0.06)' : 'white',
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
