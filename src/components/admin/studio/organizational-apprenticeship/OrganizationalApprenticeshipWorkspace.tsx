import { useState } from 'react';
import { useOrganizationalApprenticeshipState } from '../../../../hooks/useOrganizationalApprenticeshipState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ApprenticeshipPhilosophyPanel,
  ChiefOfStaffMentorshipPanel,
  ConnectedSystemsPanel,
  FounderCalibrationPanel,
  FounderDashboardHighlightsPanel,
  FutureOpportunitiesPanel,
  GraduationPanel,
  GuidedLearningPanel,
  LearningLibraryPanel,
  OaDashboardPanel,
  OrganizationalApprenticesPanel,
  OrganizationalApprenticeshipHeader,
  OrganizationalCalibrationPanel,
  OrganizationalOathPanel,
  PracticeEnvironmentPanel,
  ShadowingObservationsPanel,
  TrustProgressionPanel,
  WorkspaceSelectorPanel,
} from './OrganizationalApprenticeshipPanels';

type OaTab = 'philosophy' | 'shadow' | 'practice' | 'trust' | 'library' | 'connect';

const TABS: { id: OaTab; label: string }[] = [
  { id: 'philosophy', label: 'PHILOSOPHY · APPRENTICES · OATH' },
  { id: 'shadow', label: 'CALIBRATION · SHADOW · QUESTIONS' },
  { id: 'practice', label: 'PRACTICE · CALIBRATION' },
  { id: 'trust', label: 'TRUST · MENTORSHIP' },
  { id: 'library', label: 'LIBRARY · GRADUATE' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function OrganizationalApprenticeshipWorkspace() {
  const [tab, setTab] = useState<OaTab>('philosophy');
  const { store, selectWorkspace } = useOrganizationalApprenticeshipState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'shadow':
        return (
          <>
            <FounderCalibrationPanel {...panelProps} />
            <ShadowingObservationsPanel {...panelProps} />
            <GuidedLearningPanel {...panelProps} />
          </>
        );
      case 'practice':
        return (
          <>
            <PracticeEnvironmentPanel {...panelProps} />
            <OrganizationalCalibrationPanel {...panelProps} />
          </>
        );
      case 'trust':
        return (
          <>
            <TrustProgressionPanel {...panelProps} />
            <ChiefOfStaffMentorshipPanel {...panelProps} />
          </>
        );
      case 'library':
        return (
          <>
            <LearningLibraryPanel {...panelProps} />
            <GraduationPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <OaDashboardPanel {...panelProps} />
            <FounderDashboardHighlightsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'philosophy':
      default:
        return (
          <>
            <OaDashboardPanel {...panelProps} />
            <ApprenticeshipPhilosophyPanel {...panelProps} />
            <OrganizationalOathPanel {...panelProps} />
            <OrganizationalApprenticesPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <FounderCalibrationPanel {...panelProps} />
            <ShadowingObservationsPanel {...panelProps} />
            <GuidedLearningPanel {...panelProps} />
            <PracticeEnvironmentPanel {...panelProps} />
            <OrganizationalCalibrationPanel {...panelProps} />
            <TrustProgressionPanel {...panelProps} />
            <ChiefOfStaffMentorshipPanel {...panelProps} />
            <LearningLibraryPanel {...panelProps} />
            <GraduationPanel {...panelProps} />
            <FounderDashboardHighlightsPanel {...panelProps} />
            <FutureOpportunitiesPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="organizational-apprenticeship-root">
      <OrganizationalApprenticeshipHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#155E75' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#155E75' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(21,94,117,0.06)' : 'white',
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
