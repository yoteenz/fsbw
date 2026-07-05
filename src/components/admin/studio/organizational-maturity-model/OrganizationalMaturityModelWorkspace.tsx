import { useState } from 'react';
import { useOrganizationalMaturityModelState } from '../../../../hooks/useOrganizationalMaturityModelState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AdaptiveExperiencePanel,
  AutonomyProgressionPanel,
  CampusProgressionPanel,
  CompanyOnboardingPanel,
  ConnectedSystemsPanel,
  ExecutiveReadinessPanel,
  GrowthRoadmapPanel,
  MaturityDimensionsPanel,
  MaturityPhilosophyPanel,
  OiMaturityIntegrationPanel,
  OmmDashboardPanel,
  OrganizationalAssessmentsPanel,
  OrganizationalMaturityModelHeader,
  OrganizationalStagesPanel,
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
      default:
        return (
          <>
            <OmmDashboardPanel {...panelProps} />
            <MaturityPhilosophyPanel {...panelProps} />
            <OrganizationalStagesPanel {...panelProps} />
            <MaturityDimensionsPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <AdaptiveExperiencePanel {...panelProps} />
            <ExecutiveReadinessPanel {...panelProps} />
            <AutonomyProgressionPanel {...panelProps} />
            <CampusProgressionPanel {...panelProps} />
            <OrganizationalAssessmentsPanel {...panelProps} />
            <GrowthRoadmapPanel {...panelProps} />
            <CompanyOnboardingPanel {...panelProps} />
            <OiMaturityIntegrationPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
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
