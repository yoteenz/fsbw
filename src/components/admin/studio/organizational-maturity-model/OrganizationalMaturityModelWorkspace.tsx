import { useState } from 'react';
import { useOrganizationalMaturityModelState } from '../../../../hooks/useOrganizationalMaturityModelState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  AdaptiveExperiencePanel,
  AutonomyProgressionPanel,
  CampusProgressionPanel,
  CompanyOnboardingPanel,
  ConnectedSystemsPanel,
  ExecutiveReadinessPanel,
  GrowthRoadmapPanel,
  MaturityPhilosophyPanel,
  OiMaturityIntegrationPanel,
  OmmDashboardPanel,
  OrganizationalAssessmentsPanel,
  OrganizationalMaturityModelHeader,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './OrganizationalMaturityModelPanels';

type OmmTab = 'stages' | 'adaptive' | 'autonomy' | 'assess' | 'onboard' | 'connect';

const TABS: { id: OmmTab; label: string }[] = [
  { id: 'stages', label: 'STAGES · PHILOSOPHY' },
  { id: 'adaptive', label: 'ADAPTIVE · EXECUTIVES' },
  { id: 'autonomy', label: 'AUTONOMY · CAMPUS' },
  { id: 'assess', label: 'ASSESS · ROADMAP' },
  { id: 'onboard', label: 'ONBOARD · INTELLIGENCE' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function OrganizationalMaturityModelWorkspace() {
  const [tab, setTab] = useState<OmmTab>('stages');
  const { store, selectWorkspace } = useOrganizationalMaturityModelState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'adaptive':
        return (
          <>
            <AdaptiveExperiencePanel {...panelProps} />
            <ExecutiveReadinessPanel {...panelProps} />
          </>
        );
      case 'autonomy':
        return (
          <>
            <AutonomyProgressionPanel {...panelProps} />
            <CampusProgressionPanel {...panelProps} />
          </>
        );
      case 'assess':
        return (
          <>
            <OrganizationalAssessmentsPanel {...panelProps} />
            <GrowthRoadmapPanel {...panelProps} />
          </>
        );
      case 'onboard':
        return (
          <>
            <CompanyOnboardingPanel {...panelProps} />
            <OiMaturityIntegrationPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <OmmDashboardPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'stages':
        return (
          <>
            <OmmDashboardPanel {...panelProps} />
            <MaturityPhilosophyPanel {...panelProps} />
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
    <div className="organizational-maturity-model-root">
      <OrganizationalMaturityModelHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(217,119,6,0.06)' : 'white',
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
