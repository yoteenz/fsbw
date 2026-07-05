import { useState } from 'react';
import { useOrganizationalInheritanceState } from '../../../../hooks/useOrganizationalInheritanceState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  CrossCompanyLearningPanel,
  CompanyMaturityEngineLinkPanel,
  DepartmentInheritancePanel,
  ExecutiveInheritancePanel,
  GeneticBlendingPanel,
  InheritanceBuilderPanel,
  InheritanceDashboardPanel,
  InheritancePlatformChainPanel,
  InheritanceRecommendationsPanel,
  InheritanceSimulatorPanel,
  InheritanceSourcesPanel,
  InheritanceWizardPanel,
  InstitutionalLibraryPanel,
  KnowledgeAncestryPanel,
  MarketplacePreparedPanel,
  OrganizationalEvolutionPanel,
  OrgTimelinePanel,
  OrganizationalInheritanceHeader,
} from './OrganizationalInheritancePanels';

type OiTab = 'platform' | 'builder' | 'simulator' | 'library' | 'ancestry' | 'evolution';

const TABS: { id: OiTab; label: string }[] = [
  { id: 'platform', label: 'PLATFORM' },
  { id: 'builder', label: 'BUILDER · BLEND' },
  { id: 'simulator', label: 'SIMULATOR' },
  { id: 'library', label: 'LIBRARY' },
  { id: 'ancestry', label: 'ANCESTRY · TIMELINE' },
  { id: 'evolution', label: 'EVOLUTION · MARKETPLACE' },
];

export function OrganizationalInheritanceWorkspace() {
  const [tab, setTab] = useState<OiTab>('platform');
  const {
    store,
    selectLibraryItem,
    selectBlendPlan,
    setCategoryAction,
    setWizardSource,
  } = useOrganizationalInheritanceState();

  const panelProps = {
    store,
    onSelectLibraryItem: selectLibraryItem,
    onSelectBlendPlan: selectBlendPlan,
    onSetCategoryAction: setCategoryAction,
    onSetWizardSource: setWizardSource,
  };

  const renderTab = () => {
    switch (tab) {
      case 'builder':
        return (
          <>
            <InheritanceWizardPanel {...panelProps} />
            <InheritanceBuilderPanel {...panelProps} />
            <GeneticBlendingPanel {...panelProps} />
            <DepartmentInheritancePanel {...panelProps} />
            <ExecutiveInheritancePanel {...panelProps} />
          </>
        );
      case 'simulator':
        return (
          <>
            <InheritanceSimulatorPanel {...panelProps} />
            <InheritanceRecommendationsPanel {...panelProps} />
          </>
        );
      case 'library':
        return (
          <>
            <InstitutionalLibraryPanel {...panelProps} />
            <InheritanceSourcesPanel {...panelProps} />
          </>
        );
      case 'ancestry':
        return (
          <>
            <KnowledgeAncestryPanel {...panelProps} />
            <OrgTimelinePanel {...panelProps} />
          </>
        );
      case 'evolution':
        return (
          <>
            <OrganizationalEvolutionPanel {...panelProps} />
            <CrossCompanyLearningPanel {...panelProps} />
            <CompanyMaturityEngineLinkPanel />
            <MarketplacePreparedPanel {...panelProps} />
          </>
        );
      case 'platform':
        return (
          <>
            <InheritanceDashboardPanel {...panelProps} />
            <CompanyMaturityEngineLinkPanel />
            <InheritancePlatformChainPanel />

            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              ADDITIONAL SECTIONS ON OTHER TABS — OPEN TABS FOR FULL DETAIL
            </StudioTabMoreHint>
          </>
        );
    }
  };

  return (
    <div className="organizational-inheritance-root">
      <OrganizationalInheritanceHeader />

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
