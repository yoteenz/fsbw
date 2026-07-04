import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../../layouts/PageActionsBelowCard';
import { useAdminStudioProductionBuilder } from '../../../../hooks/useAdminStudioProductionBuilderState';
import { useAdminStudioContentPack } from '../../../../hooks/useAdminStudioEditableState';
import { ProductionBuilderDepartmentBar } from './ProductionBuilderDepartmentBar';
import { ProductionBuilderAssetLibrary } from './ProductionBuilderAssetLibrary';
import { ProductionBuilderSceneCanvas } from './ProductionBuilderSceneCanvas';
import { ProductionBuilderInspector } from './ProductionBuilderInspector';
import { ProductionBuilderBrandPreviews } from './ProductionBuilderBrandPreviews';
import { ProductionBuilderRelatedContent } from './ProductionBuilderRelatedContent';
import { pbActionBtnStyle } from './productionBuilderTheme';

export function ProductionBuilderWorkspace() {
  const [searchParams] = useSearchParams();
  const packId = searchParams.get('packId') ?? undefined;
  const { pack } = useAdminStudioContentPack(packId);
  const packTitle = pack?.title;

  const {
    draft,
    activeScene,
    setActiveSceneId,
    assembledPrompt,
    updateDraftMeta,
    applyAssetDrop,
    addScene,
    removeScene,
    reorderScenes,
    toggleOutputType,
    loadTemplate,
    saveDraft,
    duplicateDraft,
    toggleFavorite,
    archiveDraft,
    setPromptOverride,
    buildProduction,
    generationOutputs,
  } = useAdminStudioProductionBuilder(packId, packTitle);

  const onAssetDragStart = useCallback(() => {}, []);

  return (
    <div>
      <ProductionBuilderDepartmentBar departmentStatus={draft.departmentStatus} />

      <div
        className="flex flex-col gap-3 mb-3 lg:grid"
        style={{
          gridTemplateColumns: 'minmax(140px, 22%) minmax(0, 1fr) minmax(160px, 26%)',
          minHeight: 'min(72vh, 640px)',
        }}
      >
        <ProductionBuilderAssetLibrary onAssetDragStart={onAssetDragStart} />
        <ProductionBuilderSceneCanvas
          draft={draft}
          activeScene={activeScene}
          scenes={draft.scenes}
          onSelectScene={setActiveSceneId}
          onAddScene={addScene}
          onRemoveScene={removeScene}
          onReorderScenes={reorderScenes}
          onAssetDrop={applyAssetDrop}
        />
        <ProductionBuilderInspector
          draft={draft}
          activeScene={activeScene}
          assembledPrompt={assembledPrompt}
          generationOutputs={generationOutputs}
          onUpdateMeta={updateDraftMeta}
          onToggleOutput={toggleOutputType}
          onLoadTemplate={loadTemplate}
          onPromptChange={setPromptOverride}
        />
      </div>

      <ProductionBuilderBrandPreviews selection={activeScene?.selection ?? {}} />
      <ProductionBuilderRelatedContent />

      <PageActionsBelowCard>
        <button type="button" onClick={saveDraft} style={pageActionButtonStyle}>
          SAVE DRAFT
        </button>
        <button type="button" onClick={duplicateDraft} style={pageActionButtonStyle}>
          DUPLICATE
        </button>
        <button type="button" onClick={() => loadTemplate('slay-report')} style={pageActionButtonStyle}>
          TEMPLATE
        </button>
        <button type="button" onClick={toggleFavorite} style={pageActionButtonStyle}>
          {draft.favorite ? 'UNFAVORITE' : 'FAVORITE'}
        </button>
        <button type="button" onClick={archiveDraft} style={pageActionButtonStyle}>
          {draft.archived ? 'UNARCHIVE' : 'ARCHIVE'}
        </button>
        <button
          type="button"
          onClick={saveDraft}
          style={pageActionButtonStyle}
          title={draft.versionHistory[0] ? `LAST: ${draft.versionHistory[0].savedAt}` : 'NO VERSIONS YET'}
        >
          VERSION HISTORY ({draft.versionHistory.length})
        </button>
        <button
          type="button"
          onClick={buildProduction}
          style={{ ...pageActionButtonStyle, ...pbActionBtnStyle, fontSize: '10px', fontWeight: 600 }}
        >
          BUILD PRODUCTION
        </button>
      </PageActionsBelowCard>
    </div>
  );
}
