import { useRenderQueueState } from '../../../../hooks/useRenderQueueState';
import {
  RenderIntelligencePanel,
  RenderJobDetail,
  RenderJobList,
  RenderPipelineStrip,
  RenderQueueAnimationStyles,
  RenderQueueConnectedSystems,
  RenderQueueControls,
  RenderQueueHeader,
} from './RenderQueuePanels';
import { RQ_VISUAL, rqPanelStyle } from './renderQueueTheme';

export function RenderQueueWorkspace() {
  const {
    store,
    selectedRender,
    activeRenders,
    selectRender,
    pause,
    resume,
    cancel,
    duplicate,
    setPriority,
    toggleBatchMode,
    toggleBatchSelect,
    runBatch,
  } = useRenderQueueState();

  return (
    <div className="render-queue-root studio-room-production-floor">
      <RenderQueueAnimationStyles />
      <RenderQueueHeader store={store} />
      <RenderQueueControls
        batchMode={store.batchMode}
        selectedCount={store.selectedBatchIds.length}
        onToggleBatchMode={toggleBatchMode}
        onRunBatch={runBatch}
      />
      <RenderPipelineStrip job={selectedRender} />

      <div
        className="flex flex-col gap-3 mb-3 lg:grid lg:items-stretch"
        style={{
          gridTemplateColumns: 'minmax(140px, 24%) minmax(0, 1fr) minmax(160px, 26%)',
        }}
      >
        <RenderJobList
          store={store}
          activeRenders={activeRenders}
          selectedRender={selectedRender}
          batchMode={store.batchMode}
          onSelectRender={selectRender}
          onToggleBatchSelect={toggleBatchSelect}
        />
        {selectedRender ? (
          <RenderJobDetail
            job={selectedRender}
            selectedRender={selectedRender}
            onPause={pause}
            onResume={resume}
            onCancel={cancel}
            onDuplicate={duplicate}
            onSetPriority={setPriority}
          />
        ) : (
          <main className="p-6 flex items-center justify-center" style={{ ...rqPanelStyle, background: RQ_VISUAL.glassDeep }}>
            <p style={{ color: '#808080', fontSize: '7px', fontFamily: '"Futura PT Book"' }}>SELECT A RENDER TO INSPECT THE PIPELINE</p>
          </main>
        )}
        <RenderIntelligencePanel alerts={store.intelligenceAlerts} />
      </div>

      <RenderQueueConnectedSystems />
    </div>
  );
}
