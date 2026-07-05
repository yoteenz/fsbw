import { useState } from 'react';
import { useCreatorMarketplaceState } from '../../../../hooks/useCreatorMarketplaceState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AgencyModePanel,
  BrandDealEnginePanel,
  BrandDiscoveryPanel,
  BrandProfilePanel,
  CareerGraphPanel,
  CareerIntelligencePanel,
  CosIntegrationPanel,
  ConnectedSystemsPanel,
  CreatorAcademyPanel,
  CreatorDiscoveryPanel,
  CreatorMarketplaceHeader,
  CreatorOsPanel,
  CreatorPhilosophyPanel,
  CreatorProfilePanel,
  IntelligentMatchingPanel,
  MarketplaceDashboardPanel,
  MarketplaceIntelligencePanel,
  MarketplaceSimulationPanel,
  PaymentIntelligencePanel,
  RelationshipManagementPanel,
  TalentNetworkPanel,
  WorkspaceSelectorPanel,
} from './CreatorMarketplacePanels';

type CmTab = 'dashboard' | 'creators' | 'brands' | 'deals' | 'career' | 'intelligence' | 'education';

const TABS: { id: CmTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'creators', label: 'CREATORS · PROFILES' },
  { id: 'brands', label: 'BRANDS · MATCHING' },
  { id: 'deals', label: 'DEALS · CREATOR OS' },
  { id: 'career', label: 'CAREER · AGENCY' },
  { id: 'intelligence', label: 'INTELLIGENCE · SIM' },
  { id: 'education', label: 'EDUCATION · TALENT' },
];

export function CreatorMarketplaceWorkspace() {
  const [tab, setTab] = useState<CmTab>('dashboard');
  const {
    store,
    selectedCreator,
    selectedBrand,
    workspaceCreators,
    creatorMatches,
    creatorDeals,
    creatorOs,
    selectWorkspace,
    selectCreator,
    selectBrand,
  } = useCreatorMarketplaceState();

  const panelProps = {
    store,
    selectedCreator,
    selectedBrand,
    workspaceCreators,
    creatorMatches,
    creatorDeals,
    creatorOs,
    onSelectWorkspace: selectWorkspace,
    onSelectCreator: selectCreator,
    onSelectBrand: selectBrand,
  };

  const renderTab = () => {
    switch (tab) {
      case 'creators':
        return (
          <>
            <CreatorDiscoveryPanel {...panelProps} />
            <CreatorProfilePanel {...panelProps} />
            <CareerGraphPanel {...panelProps} />
            <PaymentIntelligencePanel {...panelProps} />
          </>
        );
      case 'brands':
        return (
          <>
            <BrandDiscoveryPanel {...panelProps} />
            <BrandProfilePanel {...panelProps} />
            <IntelligentMatchingPanel {...panelProps} />
            <RelationshipManagementPanel {...panelProps} />
          </>
        );
      case 'deals':
        return (
          <>
            <BrandDealEnginePanel {...panelProps} />
            <CreatorOsPanel {...panelProps} />
            <CosIntegrationPanel />
          </>
        );
      case 'career':
        return (
          <>
            <CareerGraphPanel {...panelProps} />
            <AgencyModePanel {...panelProps} />
            <CareerIntelligencePanel {...panelProps} />
            <PaymentIntelligencePanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <MarketplaceIntelligencePanel {...panelProps} />
            <MarketplaceSimulationPanel {...panelProps} />
            <IntelligentMatchingPanel {...panelProps} />
          </>
        );
      case 'education':
        return (
          <>
            <CreatorAcademyPanel {...panelProps} />
            <TalentNetworkPanel {...panelProps} />
            <CareerIntelligencePanel {...panelProps} />
          </>
        );
      case 'dashboard':
        return (
          <>
            <MarketplaceDashboardPanel {...panelProps} />
            <CreatorPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <CreatorDiscoveryPanel {...panelProps} previewLimit={6} />
            <IntelligentMatchingPanel {...panelProps} previewLimit={4} />
            <CosIntegrationPanel />
            <p
              className="text-[6px] font-futura uppercase p-2 border mb-3"
              style={{
                fontWeight: 515,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                color: ADMIN_STUDIO_THEME.textSecondary,
                background: 'rgba(37,99,235,0.04)',
              }}
            >
              PROFILES · DEALS · CAREER · INTELLIGENCE — USE THE TABS ABOVE
            </p>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="creator-marketplace-root">
      <CreatorMarketplaceHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#2563EB' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#2563EB' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(37,99,235,0.06)' : 'white',
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
