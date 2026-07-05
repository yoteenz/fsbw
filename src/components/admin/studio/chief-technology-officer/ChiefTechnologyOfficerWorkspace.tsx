import { useState } from 'react';
import { useChiefTechnologyOfficerState } from '../../../../hooks/useChiefTechnologyOfficerState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ConciergeFounderBanner } from '../concierge-layer/ConciergeFounderBanner';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  ChiefTechnologyOfficerHeader,
  ConnectedSystemsPanel,
  CtoDashboardPanel,
  DailyBriefingPanel,
  EngineeringAlignmentPanel,
  EngineeringCouncilPanel,
  EngineeringEvolutionPanel,
  EngineeringIntelligencePanel,
  EngineeringMemoryPanel,
  ExecutiveCompassPanel,
  LeadershipPhilosophyPanel,
  PlatformArchitecturePanel,
  RecommendationsPanel,
  TechnologyGovernancePanel,
  TechnologyOpsCenterPanel,
  TechnologyProtectionPanel,
  WorkspaceSelectorPanel,
} from './ChiefTechnologyOfficerPanels';

type CtoTab = 'engineering' | 'govern' | 'intelligence' | 'platform' | 'ops' | 'protect' | 'connect';

const TABS: { id: CtoTab; label: string }[] = [
  { id: 'engineering', label: 'ENGINEERING · HEALTH' },
  { id: 'govern', label: 'GOVERN · ALIGN' },
  { id: 'intelligence', label: 'INTELLIGENCE · EVOLVE' },
  { id: 'platform', label: 'PLATFORM · ARCH' },
  { id: 'ops', label: 'OPS · COUNCIL' },
  { id: 'protect', label: 'PROTECT · BRIEF' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function ChiefTechnologyOfficerWorkspace() {
  const [tab, setTab] = useState<CtoTab>('engineering');
  const { store, selectWorkspace } = useChiefTechnologyOfficerState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'govern':
        return (
          <>
            <TechnologyGovernancePanel {...panelProps} />
            <EngineeringAlignmentPanel {...panelProps} />
            <RecommendationsPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <EngineeringIntelligencePanel {...panelProps} />
            <EngineeringEvolutionPanel {...panelProps} />
            <EngineeringMemoryPanel {...panelProps} />
          </>
        );
      case 'platform':
        return <PlatformArchitecturePanel {...panelProps} />;
      case 'ops':
        return (
          <>
            <TechnologyOpsCenterPanel {...panelProps} />
            <EngineeringCouncilPanel {...panelProps} />
          </>
        );
      case 'protect':
        return (
          <>
            <TechnologyProtectionPanel {...panelProps} />
            <DailyBriefingPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'engineering':
        return (
          <>
            <CtoDashboardPanel {...panelProps} />
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
    <div className="chief-technology-officer-root">
      <ChiefTechnologyOfficerHeader />
      <ConciergeFounderBanner conciergeId="technology-concierge" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#2563EB' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#2563EB' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(37,99,235,0.06)' : 'white',
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
