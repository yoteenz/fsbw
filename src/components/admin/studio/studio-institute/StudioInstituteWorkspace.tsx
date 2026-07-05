import { useState } from 'react';
import { useStudioInstituteState } from '../../../../hooks/useStudioInstituteState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  AdaptiveCurriculumPanel,
  ConnectedSystemsPanel,
  ConciergeMentorsPanel,
  DailyLearningPanel,
  FutureOpportunitiesPanel,
  ImmersiveLearningPanel,
  InstituteCampusPanel,
  InstitutePhilosophyPanel,
  KnowledgeCompoundingPanel,
  LearningCommunitiesPanel,
  NdxbookIntegrationPanel,
  OrganizationFirstEducationPanel,
  OrganizationalCertificationPanel,
  SchoolsOfExcellencePanel,
  SiDashboardPanel,
  StudioInstituteHeader,
  WorkspaceSelectorPanel,
} from './StudioInstitutePanels';

type SiTab = 'philosophy' | 'schools' | 'curriculum' | 'certify' | 'campus' | 'connect';

const TABS: { id: SiTab; label: string }[] = [
  { id: 'philosophy', label: 'PHILOSOPHY · COMMUNITIES' },
  { id: 'schools', label: 'SCHOOLS · CONCIERGE MENTORS' },
  { id: 'curriculum', label: 'CURRICULUM · IMMERSIVE' },
  { id: 'certify', label: 'CERTIFY · COMPOUND' },
  { id: 'campus', label: 'CAMPUS · DAILY · NDXBOOK' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function StudioInstituteWorkspace() {
  const [tab, setTab] = useState<SiTab>('philosophy');
  const { store, selectWorkspace } = useStudioInstituteState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'schools':
        return (
          <>
            <SchoolsOfExcellencePanel {...panelProps} />
            <ConciergeMentorsPanel {...panelProps} />
          </>
        );
      case 'curriculum':
        return (
          <>
            <OrganizationFirstEducationPanel {...panelProps} />
            <AdaptiveCurriculumPanel {...panelProps} />
            <ImmersiveLearningPanel {...panelProps} />
          </>
        );
      case 'certify':
        return (
          <>
            <OrganizationalCertificationPanel {...panelProps} />
            <KnowledgeCompoundingPanel {...panelProps} />
          </>
        );
      case 'campus':
        return (
          <>
            <InstituteCampusPanel {...panelProps} />
            <DailyLearningPanel {...panelProps} />
            <NdxbookIntegrationPanel {...panelProps} />
            <FutureOpportunitiesPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <SiDashboardPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'philosophy':
        return (
          <>
            <SiDashboardPanel {...panelProps} />
            <InstitutePhilosophyPanel {...panelProps} />
            <LearningCommunitiesPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />

            <StudioTabMoreHint accent="rgba(133,77,14,0.04)">
              SCHOOLS · CURRICULUM · CERTIFICATION · CAMPUS · NDXBOOK — USE THE TABS ABOVE
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="studio-institute-root">
      <StudioInstituteHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#854D0E' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#854D0E' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(133,77,14,0.06)' : 'white',
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
