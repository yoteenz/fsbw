import { useState } from 'react';
import { useKnowledgeAssetEngineState } from '../../../../hooks/useKnowledgeAssetEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AssetProfilePanel,
  AssetTypesPanel,
  ConnectedSystemsPanel,
  CosIntegrationPanel,
  ExecutiveIntelligencePanel,
  KnowledgeAcademyPanel,
  KnowledgeDashboardPanel,
  KnowledgeAssetEngineHeader,
  KnowledgeEvolutionPanel,
  KnowledgeHealthPanel,
  KnowledgeInheritancePanel,
  KnowledgeIntelligencePanel,
  KnowledgeLibraryPanel,
  KnowledgeLineagePanel,
  KnowledgeMaturityPanel,
  KnowledgePhilosophyPanel,
  KnowledgeRelationshipsPanel,
  KnowledgeRevenuePanel,
  KnowledgeTransformationPanel,
  SingleSourceOfTruthPanel,
  WorkspaceSelectorPanel,
} from './KnowledgeAssetEnginePanels';

type KaeTab = 'dashboard' | 'library' | 'lineage' | 'intelligence' | 'academy' | 'health';

const TABS: { id: KaeTab; label: string }[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'library', label: 'LIBRARY · PROFILES' },
  { id: 'lineage', label: 'LINEAGE · SSOT' },
  { id: 'intelligence', label: 'INTELLIGENCE · REVENUE' },
  { id: 'academy', label: 'ACADEMY · EXECUTIVE' },
  { id: 'health', label: 'HEALTH · INHERIT' },
];

export function KnowledgeAssetEngineWorkspace() {
  const [tab, setTab] = useState<KaeTab>('dashboard');
  const {
    store,
    selectedAsset,
    workspaceAssets,
    assetSsot,
    assetEvolution,
    assetMaturity,
    assetLineage,
    assetRelationships,
    assetTransformations,
    assetIntelligence,
    assetRevenue,
    selectWorkspace,
    selectAsset,
  } = useKnowledgeAssetEngineState();

  const panelProps = {
    store,
    selectedAsset,
    workspaceAssets,
    assetSsot,
    assetEvolution,
    assetMaturity,
    assetLineage,
    assetRelationships,
    assetTransformations,
    assetIntelligence,
    assetRevenue,
    onSelectWorkspace: selectWorkspace,
    onSelectAsset: selectAsset,
  };

  const renderTab = () => {
    switch (tab) {
      case 'library':
        return (
          <>
            <KnowledgeLibraryPanel {...panelProps} />
            <AssetProfilePanel {...panelProps} />
            <AssetTypesPanel {...panelProps} />
            <KnowledgeMaturityPanel {...panelProps} />
          </>
        );
      case 'lineage':
        return (
          <>
            <AssetProfilePanel {...panelProps} />
            <SingleSourceOfTruthPanel {...panelProps} />
            <KnowledgeLineagePanel {...panelProps} />
            <KnowledgeEvolutionPanel {...panelProps} />
            <KnowledgeRelationshipsPanel {...panelProps} />
            <KnowledgeTransformationPanel {...panelProps} />
          </>
        );
      case 'intelligence':
        return (
          <>
            <KnowledgeIntelligencePanel {...panelProps} />
            <KnowledgeRevenuePanel {...panelProps} />
            <KnowledgeTransformationPanel {...panelProps} />
          </>
        );
      case 'academy':
        return (
          <>
            <KnowledgeAcademyPanel {...panelProps} />
            <ExecutiveIntelligencePanel {...panelProps} />
          </>
        );
      case 'health':
        return (
          <>
            <KnowledgeHealthPanel {...panelProps} />
            <KnowledgeInheritancePanel {...panelProps} />
            <KnowledgeEvolutionPanel {...panelProps} />
          </>
        );
      case 'dashboard':
      default:
        return (
          <>
            <KnowledgeDashboardPanel {...panelProps} />
            <KnowledgePhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <KnowledgeLibraryPanel {...panelProps} />
            <AssetProfilePanel {...panelProps} />
            <SingleSourceOfTruthPanel {...panelProps} />
            <KnowledgeEvolutionPanel {...panelProps} />
            <KnowledgeLineagePanel {...panelProps} />
            <KnowledgeMaturityPanel {...panelProps} />
            <KnowledgeIntelligencePanel {...panelProps} />
            <KnowledgeAcademyPanel {...panelProps} />
            <KnowledgeHealthPanel {...panelProps} />
            <CosIntegrationPanel />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="knowledge-asset-engine-root">
      <KnowledgeAssetEngineHeader />

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
