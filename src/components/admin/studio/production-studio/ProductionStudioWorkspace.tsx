import { useProductionStudioState } from '../../../../hooks/useProductionStudioState';
import {
  ProductionStudioAssetsPanel,
  ProductionStudioCanvas,
  ProductionStudioConnectedSystemsPanel,
  ProductionStudioHeader,
  ProductionStudioIntelligencePanel,
  ProductionStudioPhilosophyPanel,
  ProductionStudioQueuePanel,
} from './ProductionStudioPanels';
import { PS_VISUAL } from './productionStudioTheme';

export function ProductionStudioWorkspace() {
  const {
    store,
    selectedJob,
    filteredJobs,
    selectJob,
    setQueueFilter,
    overrideAsset,
    resetAssetOverride,
    advanceStage,
  } = useProductionStudioState();

  return (
    <div
      className="production-studio-root"
      style={{
        backgroundImage: PS_VISUAL.cinematicGlow,
        minHeight: 'min(80vh, 720px)',
      }}
    >
      <ProductionStudioHeader store={store} />

      <div
        className="flex flex-col gap-3 mb-3 lg:grid"
        style={{
          gridTemplateColumns: 'minmax(140px, 22%) minmax(0, 1fr) minmax(160px, 26%)',
          minHeight: 'min(68vh, 560px)',
        }}
      >
        <ProductionStudioQueuePanel
          store={store}
          selectedJob={selectedJob}
          filteredJobs={filteredJobs}
          onSelectJob={selectJob}
          onSetQueueFilter={setQueueFilter}
        />
        <ProductionStudioCanvas selectedJob={selectedJob} onAdvanceStage={advanceStage} />
        <ProductionStudioIntelligencePanel
          selectedJob={selectedJob}
          onOverrideAsset={overrideAsset}
          onResetOverride={resetAssetOverride}
        />
      </div>

      <ProductionStudioAssetsPanel selectedJob={selectedJob} />
      <ProductionStudioPhilosophyPanel store={store} />
      <ProductionStudioConnectedSystemsPanel />
    </div>
  );
}
