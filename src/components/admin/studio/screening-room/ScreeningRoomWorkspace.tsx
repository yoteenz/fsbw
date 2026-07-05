import { useScreeningRoomState } from '../../../../hooks/useScreeningRoomState';
import {
  ScreeningActionBar,
  ScreeningCinematicPlayer,
  ScreeningComparePanel,
  ScreeningConciergeColumn,
  ScreeningMetadataPanel,
  ScreeningProductionSelector,
  ScreeningRoomAnimationStyles,
  ScreeningRoomConnectedSystems,
  ScreeningRoomTheaterShell,
  ScreeningRoomTitleBar,
  ScreeningVersionStrip,
} from './ScreeningRoomPanels';

export function ScreeningRoomWorkspace() {
  const {
    store,
    selectedProduction,
    currentVersion,
    compareVersions,
    selectProduction,
    selectVersion,
    toggleCompare,
    setCompareMode,
    setCompareField,
    setPlaying,
    runAction,
  } = useScreeningRoomState();

  const handleAction = (action: Parameters<typeof runAction>[0], note: string) => {
    if (action === 'compare') {
      setCompareMode(!store.compareMode);
    }
    runAction(action, note);
  };

  return (
    <>
      <ScreeningRoomAnimationStyles />
      <ScreeningRoomTheaterShell>
        <ScreeningRoomTitleBar store={store} />

        <div
          className="flex flex-col gap-0 lg:grid"
          style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(160px, 28%)' }}
        >
          <div>
            <ScreeningProductionSelector
              productions={store.productions}
              selectedId={store.selectedProductionId}
              onSelect={selectProduction}
            />

            <ScreeningCinematicPlayer
              version={currentVersion}
              playing={store.playerPlaying}
              onTogglePlay={setPlaying}
            />

            {selectedProduction && (
              <ScreeningVersionStrip
                production={selectedProduction}
                currentVersionId={store.currentVersionId}
                compareMode={store.compareMode}
                compareIds={store.compareVersionIds}
                onSelectVersion={selectVersion}
                onToggleCompare={toggleCompare}
              />
            )}

            {store.compareMode && (
              <ScreeningComparePanel
                versions={compareVersions}
                compareField={store.compareField}
                onSetField={setCompareField}
              />
            )}

            <ScreeningMetadataPanel version={currentVersion} />

            <ScreeningActionBar onAction={handleAction} lastAction={store.lastAction} />
          </div>

          <ScreeningConciergeColumn reviews={store.conciergeReviews} />
        </div>

        <ScreeningRoomConnectedSystems />
      </ScreeningRoomTheaterShell>
    </>
  );
}
