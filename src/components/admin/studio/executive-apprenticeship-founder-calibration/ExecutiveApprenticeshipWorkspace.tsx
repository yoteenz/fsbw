import { useState } from 'react';
import { useExecutiveApprenticeshipState } from '../../../../hooks/useExecutiveApprenticeshipState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ApprenticeshipPhilosophyPanel,
  CalibrationEnginePanel,
  ChiefOfStaffMentorshipPanel,
  ConnectedSystemsPanel,
  EafDashboardPanel,
  ExecutiveApprenticeshipHeader,
  ExecutiveGraduationPanel,
  FounderCalibrationPanel,
  FounderDashboardHighlightsPanel,
  FutureOpportunitiesPanel,
  LearningConversationsPanel,
  LearningLibraryPanel,
  PracticeModePanel,
  ShadowingObservationsPanel,
  SoftApprovalPanel,
  TrustProgressionPanel,
  WorkspaceSelectorPanel,
} from './ExecutiveApprenticeshipPanels';

type EafTab = 'philosophy' | 'shadow' | 'engine' | 'trust' | 'mentorship' | 'connect';

const TABS: { id: EafTab; label: string }[] = [
  { id: 'philosophy', label: 'PHILOSOPHY · CALIBRATION' },
  { id: 'shadow', label: 'SHADOW · CONVERSATIONS' },
  { id: 'engine', label: 'ENGINE · PRACTICE' },
  { id: 'trust', label: 'TRUST · SOFT APPROVAL' },
  { id: 'mentorship', label: 'MENTOR · LIBRARY · GRADUATE' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function ExecutiveApprenticeshipWorkspace() {
  const [tab, setTab] = useState<EafTab>('philosophy');
  const { store, selectWorkspace } = useExecutiveApprenticeshipState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'shadow':
        return (
          <>
            <ShadowingObservationsPanel {...panelProps} />
            <LearningConversationsPanel {...panelProps} />
          </>
        );
      case 'engine':
        return (
          <>
            <CalibrationEnginePanel {...panelProps} />
            <PracticeModePanel {...panelProps} />
          </>
        );
      case 'trust':
        return (
          <>
            <TrustProgressionPanel {...panelProps} />
            <SoftApprovalPanel {...panelProps} />
          </>
        );
      case 'mentorship':
        return (
          <>
            <ChiefOfStaffMentorshipPanel {...panelProps} />
            <LearningLibraryPanel {...panelProps} />
            <ExecutiveGraduationPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <EafDashboardPanel {...panelProps} />
            <FounderDashboardHighlightsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'philosophy':
      default:
        return (
          <>
            <EafDashboardPanel {...panelProps} />
            <ApprenticeshipPhilosophyPanel {...panelProps} />
            <FounderCalibrationPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ShadowingObservationsPanel {...panelProps} />
            <LearningConversationsPanel {...panelProps} />
            <CalibrationEnginePanel {...panelProps} />
            <PracticeModePanel {...panelProps} />
            <TrustProgressionPanel {...panelProps} />
            <SoftApprovalPanel {...panelProps} />
            <ChiefOfStaffMentorshipPanel {...panelProps} />
            <LearningLibraryPanel {...panelProps} />
            <ExecutiveGraduationPanel {...panelProps} />
            <FounderDashboardHighlightsPanel {...panelProps} />
            <FutureOpportunitiesPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="executive-apprenticeship-root">
      <ExecutiveApprenticeshipHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#7C3AED' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#7C3AED' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(124,58,237,0.06)' : 'white',
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
