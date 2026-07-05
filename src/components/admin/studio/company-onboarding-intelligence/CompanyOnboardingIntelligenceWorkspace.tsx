import { useState } from 'react';
import { useCompanyOnboardingIntelligenceState } from '../../../../hooks/useCompanyOnboardingIntelligenceState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  CampusGenerationPanel,
  ChiefOfStaffWelcomePanel,
  CoiDashboardPanel,
  CompanyOnboardingIntelligenceHeader,
  RecommendedNextStepsPanel,
  ConnectedSystemsPanel,
  FounderWalkPanel,
  OnboardingPhilosophyPanel,
  OnboardingRecommendationsPanel,
  OrganizationBlueprintPanel,
  OrganizationalConfidencePanel,
  OrganizationalDiscoveryPanel,
  OrganizationalInterviewPanel,
  WorkspaceSelectorPanel,
} from './CompanyOnboardingIntelligencePanels';

type CoiTab = 'journeys' | 'interview' | 'recommend' | 'campus' | 'welcome' | 'connect';

const TABS: { id: CoiTab; label: string }[] = [
  { id: 'journeys', label: 'PHILOSOPHY · JOURNEYS' },
  { id: 'interview', label: 'INTERVIEW · DISCOVERY' },
  { id: 'recommend', label: 'RECOMMEND · BLUEPRINT' },
  { id: 'campus', label: 'CAMPUS · CONFIDENCE' },
  { id: 'welcome', label: 'WELCOME · WALK' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function CompanyOnboardingIntelligenceWorkspace() {
  const [tab, setTab] = useState<CoiTab>('journeys');
  const { store, selectWorkspace } = useCompanyOnboardingIntelligenceState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'interview':
        return (
          <>
            <OrganizationalInterviewPanel {...panelProps} />
            <OrganizationalDiscoveryPanel {...panelProps} />
          </>
        );
      case 'recommend':
        return (
          <>
            <OnboardingRecommendationsPanel {...panelProps} />
            <OrganizationBlueprintPanel {...panelProps} />
          </>
        );
      case 'campus':
        return (
          <>
            <CampusGenerationPanel {...panelProps} />
            <OrganizationalConfidencePanel {...panelProps} />
          </>
        );
      case 'welcome':
        return (
          <>
            <ChiefOfStaffWelcomePanel {...panelProps} />
            <FounderWalkPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <CoiDashboardPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'journeys':
        return (
          <>
            <CoiDashboardPanel {...panelProps} />
            <OnboardingPhilosophyPanel {...panelProps} />
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
    <div className="company-onboarding-intelligence-root">
      <CompanyOnboardingIntelligenceHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(13,148,136,0.06)' : 'white',
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
