import { useState } from 'react';
import { useChiefDigitalOfficerState } from '../../../../hooks/useChiefDigitalOfficerState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ConciergeFounderBanner } from '../concierge-layer/ConciergeFounderBanner';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  AiEcosystemPanel,
  CdoDashboardPanel,
  ChiefDigitalOfficerHeader,
  ConnectedSystemsPanel,
  DailyBriefingPanel,
  DigitalAlignmentPanel,
  DigitalEvolutionPanel,
  DigitalGovernancePanel,
  DigitalIntelligencePanel,
  DigitalMemoryPanel,
  DigitalProtectionPanel,
  DigitalStudioPanel,
  ExecutiveCompassPanel,
  LeadershipPhilosophyPanel,
  RecommendationsPanel,
  SolutionArchitecturePanel,
  TechnologyCouncilPanel,
  WorkspaceSelectorPanel,
} from './ChiefDigitalOfficerPanels';

type CdoTab = 'digital' | 'govern' | 'intelligence' | 'architecture' | 'studio' | 'protect' | 'connect';

const TABS: { id: CdoTab; label: string }[] = [
  { id: 'digital', label: 'DIGITAL · HEALTH' },
  { id: 'govern', label: 'GOVERN · ALIGN' },
  { id: 'intelligence', label: 'INTELLIGENCE · EVOLVE' },
  { id: 'architecture', label: 'ARCHITECTURE · AI' },
  { id: 'studio', label: 'STUDIO · COUNCIL' },
  { id: 'protect', label: 'PROTECT · BRIEF' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function ChiefDigitalOfficerWorkspace() {
  const [tab, setTab] = useState<CdoTab>('digital');
  const { store, selectWorkspace } = useChiefDigitalOfficerState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'govern':
        return (
          <>
            <DigitalGovernancePanel {...panelProps} />
            <DigitalAlignmentPanel {...panelProps} />
            <RecommendationsPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <DigitalIntelligencePanel {...panelProps} />
            <DigitalEvolutionPanel {...panelProps} />
            <DigitalMemoryPanel {...panelProps} />
          </>
        );
      case 'architecture':
        return (
          <>
            <SolutionArchitecturePanel {...panelProps} />
            <AiEcosystemPanel {...panelProps} />
          </>
        );
      case 'studio':
        return (
          <>
            <DigitalStudioPanel {...panelProps} />
            <TechnologyCouncilPanel {...panelProps} />
          </>
        );
      case 'protect':
        return (
          <>
            <DigitalProtectionPanel {...panelProps} />
            <DailyBriefingPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'digital':
        return (
          <>
            <CdoDashboardPanel {...panelProps} />
            <ExecutiveCompassPanel {...panelProps} />
            <LeadershipPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />

            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              ADDITIONAL SECTIONS ON OTHER TABS — OPEN TABS FOR FULL DETAIL
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="chief-digital-officer-root">
      <ChiefDigitalOfficerHeader />
      <ConciergeFounderBanner conciergeId="digital-concierge" />
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
