import { useState } from 'react';
import { useChiefGrowthOfficerState } from '../../../../hooks/useChiefGrowthOfficerState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ConciergeFounderBanner } from '../concierge-layer/ConciergeFounderBanner';
import {
  ChiefGrowthOfficerHeader,
  ConnectedSystemsPanel,
  CgoDashboardPanel,
  DailyBriefingPanel,
  ExecutiveCompassPanel,
  GrowthAlignmentPanel,
  GrowthCouncilPanel,
  GrowthEvolutionPanel,
  GrowthGovernancePanel,
  GrowthIntelligencePanel,
  GrowthLaboratoryPanel,
  GrowthMemoryPanel,
  GrowthProtectionPanel,
  LeadershipPhilosophyPanel,
  RecommendationsPanel,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './ChiefGrowthOfficerPanels';

type CgoTab = 'growth' | 'govern' | 'intelligence' | 'laboratory' | 'protect' | 'connect';

const TABS: { id: CgoTab; label: string }[] = [
  { id: 'growth', label: 'GROWTH · HEALTH' },
  { id: 'govern', label: 'GOVERN · ALIGN' },
  { id: 'intelligence', label: 'INTELLIGENCE · EVOLVE' },
  { id: 'laboratory', label: 'LABORATORY · COUNCIL' },
  { id: 'protect', label: 'PROTECT · BRIEF' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function ChiefGrowthOfficerWorkspace() {
  const [tab, setTab] = useState<CgoTab>('growth');
  const { store, selectWorkspace } = useChiefGrowthOfficerState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'govern':
        return (
          <>
            <GrowthGovernancePanel {...panelProps} />
            <GrowthAlignmentPanel {...panelProps} />
            <RecommendationsPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <GrowthIntelligencePanel {...panelProps} />
            <GrowthEvolutionPanel {...panelProps} />
            <GrowthMemoryPanel {...panelProps} />
          </>
        );
      case 'laboratory':
        return (
          <>
            <GrowthLaboratoryPanel {...panelProps} />
            <GrowthCouncilPanel {...panelProps} />
          </>
        );
      case 'protect':
        return (
          <>
            <GrowthProtectionPanel {...panelProps} />
            <DailyBriefingPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'growth':
      default:
        return (
          <>
            <CgoDashboardPanel {...panelProps} />
            <ExecutiveCompassPanel {...panelProps} />
            <LeadershipPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <DailyBriefingPanel {...panelProps} />
            <GrowthGovernancePanel {...panelProps} />
            <GrowthAlignmentPanel {...panelProps} />
            <GrowthIntelligencePanel {...panelProps} />
            <GrowthEvolutionPanel {...panelProps} />
            <GrowthLaboratoryPanel {...panelProps} />
            <GrowthCouncilPanel {...panelProps} />
            <GrowthProtectionPanel {...panelProps} />
            <GrowthMemoryPanel {...panelProps} />
            <RecommendationsPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="chief-growth-officer-root">
      <ChiefGrowthOfficerHeader />
      <ConciergeFounderBanner conciergeId="growth-concierge" />
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
