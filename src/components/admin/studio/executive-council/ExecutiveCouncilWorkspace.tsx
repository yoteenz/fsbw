import { useState } from 'react';
import { useExecutiveCouncilState } from '../../../../hooks/useExecutiveCouncilState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ConnectedSystemsPanel,
  CouncilChamberPanel,
  CouncilDashboardPanel,
  CouncilIntelligencePanel,
  CouncilPhilosophyPanel,
  CouncilResponsibilitiesPanel,
  CouncilSimulationsPanel,
  CosFacilitationPanel,
  DecisionSynthesisPanel,
  ExecutiveCouncilHeader,
  ExecutiveCouncilOathPanel,
  ExecutiveDebatePanel,
  ExecutiveTransparencyPanel,
  FounderParticipationPanel,
  HealthyDisagreementPanel,
  MeetingModesPanel,
  OrganizationalLearningPanel,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './ExecutiveCouncilPanels';

type EcTab = 'council' | 'debate' | 'synthesis' | 'modes' | 'learning' | 'connect';

const TABS: { id: EcTab; label: string }[] = [
  { id: 'council', label: 'COUNCIL · CHAMBER' },
  { id: 'debate', label: 'DEBATE · DISAGREE' },
  { id: 'synthesis', label: 'SYNTHESIS · TRANSPARENCY' },
  { id: 'modes', label: 'MODES · SIMULATION' },
  { id: 'learning', label: 'LEARNING · INTELLIGENCE' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function ExecutiveCouncilWorkspace() {
  const [tab, setTab] = useState<EcTab>('council');
  const { store, selectWorkspace } = useExecutiveCouncilState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'debate':
        return (
          <>
            <ExecutiveDebatePanel {...panelProps} />
            <HealthyDisagreementPanel {...panelProps} />
            <CosFacilitationPanel {...panelProps} />
          </>
        );
      case 'synthesis':
        return (
          <>
            <DecisionSynthesisPanel {...panelProps} />
            <ExecutiveTransparencyPanel {...panelProps} />
            <FounderParticipationPanel {...panelProps} />
          </>
        );
      case 'modes':
        return (
          <>
            <MeetingModesPanel {...panelProps} />
            <CouncilSimulationsPanel {...panelProps} />
          </>
        );
      case 'learning':
        return (
          <>
            <OrganizationalLearningPanel {...panelProps} />
            <CouncilIntelligencePanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'council':
      default:
        return (
          <>
            <CouncilDashboardPanel {...panelProps} />
            <CouncilPhilosophyPanel {...panelProps} />
            <ExecutiveCouncilOathPanel {...panelProps} />
            <CouncilChamberPanel {...panelProps} />
            <CouncilResponsibilitiesPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ExecutiveDebatePanel {...panelProps} />
            <HealthyDisagreementPanel {...panelProps} />
            <CosFacilitationPanel {...panelProps} />
            <DecisionSynthesisPanel {...panelProps} />
            <ExecutiveTransparencyPanel {...panelProps} />
            <MeetingModesPanel {...panelProps} />
            <CouncilSimulationsPanel {...panelProps} />
            <OrganizationalLearningPanel {...panelProps} />
            <FounderParticipationPanel {...panelProps} />
            <CouncilIntelligencePanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="executive-council-root">
      <ExecutiveCouncilHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#B45309' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#B45309' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(180,83,9,0.06)' : 'white',
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
