import { useState } from 'react';
import { useEcosystemMarketplaceState } from '../../../../hooks/useEcosystemMarketplaceState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AssetDiscoveryPanel,
  AssetEvolutionPanel,
  AssetProfilePanel,
  CategoriesPanel,
  CollaborationPanel,
  CommunityContributionsPanel,
  CompatibilityCenterPanel,
  ConnectedSystemsPanel,
  CosIntegrationPanel,
  CrossCompanyLearningPanel,
  EcosystemMarketplaceHeader,
  FeaturedAssetsPanel,
  IndustryCollectionsPanel,
  InheritanceIntegrationPanel,
  InstalledAssetsPanel,
  MarketplaceDashboardPanel,
  MarketplaceIntelligencePanel,
  MarketplacePhilosophyPanel,
  OrganizationalReputationPanel,
  VerifiedMarketplacePanel,
  WorkspaceSelectorPanel,
} from './EcosystemMarketplacePanels';

type EmTab = 'dashboard' | 'assets' | 'inheritance' | 'intelligence' | 'community' | 'installed';

const TABS: { id: EmTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'assets', label: 'ASSETS · PROFILES' },
  { id: 'inheritance', label: 'INHERITANCE · COMPAT' },
  { id: 'intelligence', label: 'INTELLIGENCE · RECS' },
  { id: 'community', label: 'COMMUNITY · VERIFIED' },
  { id: 'installed', label: 'INSTALLED · LEARNING' },
];

export function EcosystemMarketplaceWorkspace() {
  const [tab, setTab] = useState<EmTab>('dashboard');
  const {
    store,
    selectedAsset,
    workspaceAssets,
    assetInheritance,
    assetSimulation,
    assetEvolution,
    selectWorkspace,
    selectAsset,
  } = useEcosystemMarketplaceState();

  const panelProps = {
    store,
    selectedAsset,
    workspaceAssets,
    assetInheritance,
    assetSimulation,
    assetEvolution,
    onSelectWorkspace: selectWorkspace,
    onSelectAsset: selectAsset,
  };

  const renderTab = () => {
    switch (tab) {
      case 'assets':
        return (
          <>
            <FeaturedAssetsPanel {...panelProps} />
            <AssetDiscoveryPanel {...panelProps} />
            <AssetProfilePanel {...panelProps} />
            <CategoriesPanel {...panelProps} />
            <AssetEvolutionPanel {...panelProps} />
          </>
        );
      case 'inheritance':
        return (
          <>
            <AssetProfilePanel {...panelProps} />
            <InheritanceIntegrationPanel {...panelProps} />
            <CompatibilityCenterPanel {...panelProps} />
            <CosIntegrationPanel />
          </>
        );
      case 'intelligence':
        return (
          <>
            <MarketplaceIntelligencePanel {...panelProps} />
            <IndustryCollectionsPanel {...panelProps} />
            <OrganizationalReputationPanel {...panelProps} />
          </>
        );
      case 'community':
        return (
          <>
            <CommunityContributionsPanel {...panelProps} />
            <VerifiedMarketplacePanel {...panelProps} />
            <CollaborationPanel {...panelProps} />
          </>
        );
      case 'installed':
        return (
          <>
            <InstalledAssetsPanel {...panelProps} />
            <CrossCompanyLearningPanel {...panelProps} />
            <AssetEvolutionPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <MarketplaceDashboardPanel {...panelProps} />
            <MarketplacePhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <FeaturedAssetsPanel {...panelProps} />
            <AssetProfilePanel {...panelProps} />
            <InheritanceIntegrationPanel {...panelProps} />
            <CompatibilityCenterPanel {...panelProps} />
            <MarketplaceIntelligencePanel {...panelProps} />
            <IndustryCollectionsPanel {...panelProps} />
            <InstalledAssetsPanel {...panelProps} />
            <VerifiedMarketplacePanel {...panelProps} />
            <CrossCompanyLearningPanel {...panelProps} />
            <CosIntegrationPanel />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="ecosystem-marketplace-root">
      <EcosystemMarketplaceHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(79,70,229,0.06)' : 'white',
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
