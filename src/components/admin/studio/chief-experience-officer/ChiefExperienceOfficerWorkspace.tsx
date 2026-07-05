import { useState } from 'react';
import { useChiefExperienceOfficerState } from '../../../../hooks/useChiefExperienceOfficerState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ConciergeFounderBanner } from '../concierge-layer/ConciergeFounderBanner';
import {
  CeoDashboardPanel,
  ChiefExperienceOfficerHeader,
  ConnectedSystemsPanel,
  DailyBriefingPanel,
  ExecutiveCompassPanel,
  ExperienceAlignmentPanel,
  ExperienceCouncilPanel,
  ExperienceEvolutionPanel,
  ExperienceGovernancePanel,
  ExperienceIntelligencePanel,
  ExperienceMemoryPanel,
  ExperienceProtectionPanel,
  ExperienceStudioPanel,
  JourneyIntelligencePanel,
  LeadershipPhilosophyPanel,
  RecommendationsPanel,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './ChiefExperienceOfficerPanels';

type CeoTab = 'experience' | 'govern' | 'journey' | 'studio' | 'protect' | 'connect';

const TABS: { id: CeoTab; label: string }[] = [
  { id: 'experience', label: 'EXPERIENCE · HEALTH' },
  { id: 'govern', label: 'GOVERN · ALIGN' },
  { id: 'journey', label: 'JOURNEY · INTELLIGENCE' },
  { id: 'studio', label: 'STUDIO · COUNCIL' },
  { id: 'protect', label: 'PROTECT · BRIEF' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function ChiefExperienceOfficerWorkspace() {
  const [tab, setTab] = useState<CeoTab>('experience');
  const { store, selectWorkspace } = useChiefExperienceOfficerState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'govern':
        return (
          <>
            <ExperienceGovernancePanel {...panelProps} />
            <ExperienceAlignmentPanel {...panelProps} />
            <RecommendationsPanel {...panelProps} />
          </>
        );
      case 'journey':
        return (
          <>
            <JourneyIntelligencePanel {...panelProps} />
            <ExperienceIntelligencePanel {...panelProps} />
            <ExperienceEvolutionPanel {...panelProps} />
            <ExperienceMemoryPanel {...panelProps} />
          </>
        );
      case 'studio':
        return (
          <>
            <ExperienceStudioPanel {...panelProps} />
            <ExperienceCouncilPanel {...panelProps} />
          </>
        );
      case 'protect':
        return (
          <>
            <ExperienceProtectionPanel {...panelProps} />
            <DailyBriefingPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'experience':
      default:
        return (
          <>
            <CeoDashboardPanel {...panelProps} />
            <ExecutiveCompassPanel {...panelProps} />
            <LeadershipPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <DailyBriefingPanel {...panelProps} />
            <ExperienceGovernancePanel {...panelProps} />
            <ExperienceAlignmentPanel {...panelProps} />
            <JourneyIntelligencePanel {...panelProps} />
            <ExperienceIntelligencePanel {...panelProps} />
            <ExperienceStudioPanel {...panelProps} />
            <ExperienceCouncilPanel {...panelProps} />
            <ExperienceProtectionPanel {...panelProps} />
            <ExperienceMemoryPanel {...panelProps} />
            <RecommendationsPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="chief-experience-officer-root">
      <ChiefExperienceOfficerHeader />
      <ConciergeFounderBanner conciergeId="experience-concierge" />
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
