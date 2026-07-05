import { useState } from 'react';
import { useChiefOfStaffState } from '../../../../hooks/useChiefOfStaffState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ConciergeFounderBanner } from '../concierge-layer/ConciergeFounderBanner';
import {
  ChiefOfStaffHeader,
  CrossWorkspacePanel,
  DashboardSummaryPanel,
  DecisionLearningPanel,
  DecisionRoutingPanel,
  DepartmentStatusPanel,
  ExecutiveCoachingPanel,
  ExecutiveInboxPanel,
  ExecutiveMemoryPanel,
  LeadershipTimelinePanel,
  LeadershipDnaLinkPanel,
  StrategyEngineLinkPanel,
  CampaignEngineLinkPanel,
  WorkOrchestrationLinkPanel,
  DistributionEngineLinkPanel,
  ReaderGraphLinkPanel,
  RelationshipEngineLinkPanel,
  CreatorMarketplaceLinkPanel,
  EcosystemMarketplaceLinkPanel,
  KnowledgeAssetEngineLinkPanel,
  CompanyMaturityEngineLinkPanel,
  BrandArchitectLinkPanel,
  ExperienceArchitectLinkPanel,
  DigitalArchitectLinkPanel,
  GrowthArchitectLinkPanel,
  CompanyGenomeLinkPanel,
  ArchitectStudioLinkPanel,
  CampusEvolutionEngineLinkPanel,
  FounderWalkLinkPanel,
  RemembranceGardenLinkPanel,
  FoundersPromiseLinkPanel,
  ExecutiveFrameworkLinkPanel,
  LeadershipManifestoFrameworkLinkPanel,
  ChiefBrandOfficerLinkPanel,
  ChiefExperienceOfficerLinkPanel,
  ChiefDigitalOfficerLinkPanel,
  ChiefTechnologyOfficerLinkPanel,
  ChiefGrowthOfficerLinkPanel,
  ExecutiveCouncilLinkPanel,
  OrganizationalIntelligenceLinkPanel,
  OrganizationalAutonomyFrameworkLinkPanel,
  OrganizationalDelegationEngineLinkPanel,
  OrganizationalWorkflowOrchestrationLinkPanel,
  OrganizationalSelfImprovementLinkPanel,
  OrganizationalGovernanceSafeguardsLinkPanel,
  OrganizationalMaturityModelLinkPanel,
  LeadershipModesLinkPanel,
  CompanyOnboardingIntelligenceLinkPanel,
  ArrivalExperienceLinkPanel,
  ExecutiveApprenticeshipLinkPanel,
  StudioInstituteLinkPanel,
  OrganizationalApprenticeshipLinkPanel,
  ConciergeLayerLinkPanel,
  MorningBriefingPanel,
  OrgHierarchyPanel,
  StudioIntelligencePanel,
} from './ChiefOfStaffPanels';

type CosTab = 'dashboard' | 'inbox' | 'organization' | 'learning' | 'portfolio';

const TABS: { id: CosTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'inbox', label: 'INBOX' },
  { id: 'organization', label: 'ORGANIZATION' },
  { id: 'learning', label: 'LEARNING' },
  { id: 'portfolio', label: 'PORTFOLIO' },
];

/** Module link panels — only mount on LEARNING tab to keep dashboard responsive on mobile. */
function ConnectedModuleLinkPanels() {
  return (
    <>
      <LeadershipDnaLinkPanel />
      <StrategyEngineLinkPanel />
      <CampaignEngineLinkPanel />
      <WorkOrchestrationLinkPanel />
      <DistributionEngineLinkPanel />
      <ReaderGraphLinkPanel />
      <RelationshipEngineLinkPanel />
      <CreatorMarketplaceLinkPanel />
      <EcosystemMarketplaceLinkPanel />
      <KnowledgeAssetEngineLinkPanel />
      <CompanyMaturityEngineLinkPanel />
      <BrandArchitectLinkPanel />
      <ExperienceArchitectLinkPanel />
      <DigitalArchitectLinkPanel />
      <GrowthArchitectLinkPanel />
      <CompanyGenomeLinkPanel />
      <ArchitectStudioLinkPanel />
      <CampusEvolutionEngineLinkPanel />
      <FounderWalkLinkPanel />
      <RemembranceGardenLinkPanel />
      <FoundersPromiseLinkPanel />
      <ExecutiveFrameworkLinkPanel />
      <LeadershipManifestoFrameworkLinkPanel />
      <ChiefBrandOfficerLinkPanel />
      <ChiefExperienceOfficerLinkPanel />
      <ChiefDigitalOfficerLinkPanel />
      <ChiefTechnologyOfficerLinkPanel />
      <ChiefGrowthOfficerLinkPanel />
      <ExecutiveCouncilLinkPanel />
      <OrganizationalIntelligenceLinkPanel />
      <OrganizationalAutonomyFrameworkLinkPanel />
      <OrganizationalDelegationEngineLinkPanel />
      <OrganizationalWorkflowOrchestrationLinkPanel />
      <OrganizationalSelfImprovementLinkPanel />
      <OrganizationalGovernanceSafeguardsLinkPanel />
      <OrganizationalMaturityModelLinkPanel />
      <LeadershipModesLinkPanel />
      <CompanyOnboardingIntelligenceLinkPanel />
      <ArrivalExperienceLinkPanel />
      <ExecutiveApprenticeshipLinkPanel />
      <StudioInstituteLinkPanel />
      <OrganizationalApprenticeshipLinkPanel />
      <ConciergeLayerLinkPanel />
    </>
  );
}

export function ChiefOfStaffWorkspace() {
  const [tab, setTab] = useState<CosTab>('dashboard');
  const {
    store,
    escalatedItems,
    founderApprove,
    founderReject,
    founderReturn,
    updateDelegation,
  } = useChiefOfStaffState();

  const panelProps = {
    store,
    escalatedItems,
    onApprove: founderApprove,
    onReject: founderReject,
    onReturn: founderReturn,
    onDelegationChange: updateDelegation,
  };

  const renderTab = () => {
    switch (tab) {
      case 'inbox':
        return (
          <>
            <ExecutiveInboxPanel {...panelProps} />
            <DecisionRoutingPanel />
          </>
        );
      case 'organization':
        return (
          <>
            <OrgHierarchyPanel store={store} />
            <DepartmentStatusPanel store={store} onDelegationChange={updateDelegation} />
            <ExecutiveCoachingPanel store={store} />
          </>
        );
      case 'learning':
        return (
          <>
            <DecisionLearningPanel store={store} />
            <ExecutiveMemoryPanel store={store} />
            <ConnectedModuleLinkPanels />
            <LeadershipTimelinePanel store={store} />
          </>
        );
      case 'portfolio':
        return (
          <>
            <CrossWorkspacePanel store={store} />
            <StudioIntelligencePanel store={store} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <MorningBriefingPanel store={store} />
            <DashboardSummaryPanel store={store} />
            <ExecutiveInboxPanel {...panelProps} />
            <OrgHierarchyPanel store={store} />
            <DepartmentStatusPanel store={store} onDelegationChange={updateDelegation} />
            <DecisionRoutingPanel />
            <p
              className="text-[6px] font-futura uppercase p-2 border mb-3"
              style={{
                fontWeight: 515,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                color: ADMIN_STUDIO_THEME.textSecondary,
                background: 'rgba(15,23,42,0.04)',
              }}
            >
              MORE MODULE LINKS · DECISION LEARNING · EXECUTIVE MEMORY · TIMELINE — OPEN THE LEARNING TAB
            </p>
          </>
        );
    }
  };

  return (
    <div className="chief-of-staff-root">
      <ChiefOfStaffHeader />
      <ConciergeFounderBanner conciergeId="chief-concierge" />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0F172A' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0F172A' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(15,23,42,0.06)' : 'white',
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
