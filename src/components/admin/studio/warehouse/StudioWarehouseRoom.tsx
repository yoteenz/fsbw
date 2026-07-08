import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { ensureProjectGenome, resolveActiveProjectGenome } from '../../../../studio-os-core/project-genome';
import { getSceneStackStation } from '../../../../studio-os-core/scene-stack';
import type { SceneStackHotspotBounds, SceneStackLayerId } from '../../../../studio-os-core/scene-stack';
import { isWarehouseCameraZoneId } from '../../../../studio-os-core/studio-warehouse/campus-nav';
import { useAdminStudioWarehouse } from '../../../../hooks/useAdminStudioWarehouseState';
import { useAdminStudioMuseum } from '../../../../hooks/useAdminStudioMuseumState';
import { useSceneStack } from '../../../../hooks/useSceneStack';
import { useCdsImmersion } from '../../../../hooks/useCdsImmersion';
import { useDepartmentRoomExit } from '../../studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { SceneStackViewport } from '../../studio-os/creative-direction-studio/SceneStackViewport';
import { CDS_GENESIS_INTERACTION_STYLES } from '../../studio-os/creative-direction-studio/cdsInteractionLayerTheme';
import { CDS_IMMERSION_STYLES } from '../../studio-os/creative-direction-studio/cdsImmersionTheme';
import { DEPARTMENT_SLICE_STYLES } from '../../studio-os/department-vertical-slice/departmentSliceTheme';
import { STUDIO_WAREHOUSE_SUBTITLE } from '../../../../utils/adminStudioWarehouseDemo';
import { WarehouseGalleryFloor } from './WarehouseGalleryFloor';
import { WarehouseInspectorConsole } from './WarehouseInspectorConsole';
import { WarehouseArchitecturalDirectory } from './WarehouseArchitecturalDirectory';
import { MuseumWingInteractions } from './MuseumWingInteractions';
import { FutureExpansionInteractions, InnovationHallInteractions } from './InnovationHallInteractions';
import { resolveWarehouseOrbPersonality } from './warehouseOrbPersonality';
import { WAREHOUSE_DESTINATION_STYLES } from './warehouseDestinationTheme';
import type { WarehouseCameraZoneId } from '../../../../studio-os-core/studio-warehouse';
import { districtForWarehouseZone } from '../../../../studio-os-core/studio-warehouse';
import {
  getWarehouseZone,
  WAREHOUSE_CAMERA_ZONES,
  warehouseZonePanVw,
  warehouseZoneWing,
} from './warehouseCameraZones';

const DEPARTMENT_ID = 'studio-warehouse';

const MARKETPLACE_IMPORT_OPTIONS = [
  'Import Entire Workspace™',
  'Only Lighting',
  'Only Furniture',
  'Only Materials',
  'Only Environment',
  'Only Atmosphere',
  'Everything',
];

function hotspotStyle(bounds: SceneStackHotspotBounds): CSSProperties {
  return {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  };
}

/**
 * Studio Warehouse™ — parent destination for Studio World™ campus.
 * Museum Wing™ and Hall of Innovation™ are districts — not separate pages.
 */
export function StudioWarehouseRoom() {
  const { workspaceId } = useWorkspace();
  const exitRoom = useDepartmentRoomExit();
  const [searchParams] = useSearchParams();
  const wh = useAdminStudioWarehouse();
  const museum = useAdminStudioMuseum();

  useEffect(() => {
    ensureProjectGenome(DEPARTMENT_ID);
  }, []);

  const project = useMemo(() => resolveActiveProjectGenome(DEPARTMENT_ID), []);
  const stack = useSceneStack(DEPARTMENT_ID, project.projectId, workspaceId);

  const [searchDraft, setSearchDraft] = useState('');

  useEffect(() => {
    document.body.classList.add('wh-world-active');
    document.body.classList.remove('cds-stack-active', 'cds-genesis-active');
    return () => document.body.classList.remove('wh-world-active');
  }, []);

  useEffect(() => {
    const zoneParam = searchParams.get('zone');
    if (zoneParam && isWarehouseCameraZoneId(zoneParam)) {
      wh.setArrivalComplete(true);
      wh.setActiveZoneId(zoneParam);
    }
    const workspaceIdParam = searchParams.get('workspace');
    const slot = searchParams.get('slot');
    if (workspaceIdParam && slot) {
      const recipe = wh.sceneRecipes.find((r) => r.workspaceId === workspaceIdParam);
      const ingredient = recipe?.ingredients.find((i) =>
        i.role.toLowerCase().includes(slot.toLowerCase())
      );
      wh.enterLiveAssembly({
        workspaceId: workspaceIdParam,
        workspaceName: recipe?.workspaceName ?? workspaceIdParam,
        slotRole: slot,
        currentAssetId: ingredient?.assetId ?? '',
      });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps -- deep link once

  const activeZone = useMemo(() => getWarehouseZone(wh.activeZoneId), [wh.activeZoneId]);
  const activeWing = warehouseZoneWing(wh.activeZoneId);
  const cameraPan = warehouseZonePanVw(activeZone);
  const orbPersonality = useMemo(() => resolveWarehouseOrbPersonality(activeWing), [activeWing]);

  const activeLayers = useMemo(
    () => stack.getLayerViews(wh.activeZoneId),
    [stack, wh.activeZoneId]
  );
  const compositeStatus = useMemo(
    () => stack.getCompositeStatus(wh.activeZoneId),
    [stack, wh.activeZoneId]
  );
  const activePipeline = useMemo(
    () => stack.getStationPipelineProgress(wh.activeZoneId),
    [stack, wh.activeZoneId]
  );
  const stackButtonBusy = stack.isStationPipelineActive(wh.activeZoneId);
  const immersion = useCdsImmersion(true, stack.isAnyPipelineActive);

  const zoneAssets = useMemo(() => {
    const district = districtForWarehouseZone(wh.activeZoneId);
    if (!district) return [];
    return wh.catalog.filter((a) => a.districtId === district && !a.archived);
  }, [wh.activeZoneId, wh.catalog]);

  const campusTitle = useMemo(() => {
    if (activeWing === 'legacy') return 'Studio Warehouse™ · Museum Wing™';
    if (activeWing === 'innovation') return 'Studio Warehouse™ · Hall of Innovation™';
    if (activeWing === 'expansion') return 'Studio Warehouse™ · Future Expansion™';
    return 'Studio Warehouse™';
  }, [activeWing]);

  const goToZone = useCallback(
    (zoneId: WarehouseCameraZoneId) => {
      const zone = getWarehouseZone(zoneId);
      if (zone.requiresArrival && !wh.arrivalComplete) return;
      wh.setActiveZoneId(zoneId);
    },
    [wh]
  );

  const renderZoneInteractions = (zoneId: WarehouseCameraZoneId) => {
    const spec = getSceneStackStation(DEPARTMENT_ID, zoneId);
    const hotspots = spec?.hotspots ?? {};
    const zone = getWarehouseZone(zoneId);

    switch (zoneId) {
      case 'threshold':
        return (
          <div
            className="wh-world__hotspot wh-world__hotspot--ghost"
            style={hotspotStyle(hotspots.enter ?? { left: '24%', top: '58%', width: '52%', height: '14%' })}
          >
            {!wh.arrivalComplete ? (
              <button type="button" className="wh-world__enter-btn" onClick={wh.completeArrival}>
                Cross the Threshold™ →
              </button>
            ) : (
              <button type="button" className="wh-world__enter-btn" onClick={() => goToZone('central-atrium')}>
                Enter Central Atrium™ →
              </button>
            )}
          </div>
        );

      case 'central-atrium':
        return (
          <>
            <div
              className="wh-world__hotspot"
              style={hotspotStyle(hotspots.compass ?? { left: '32%', top: '38%', width: '36%', height: '22%' })}
            >
              <div className="wh-world__glass-embed" style={{ textAlign: 'center' }}>
                <p className="wh-world__label">Orientation™</p>
                <p className="wh-world__registry-count">{wh.snapshot.totalAssets}</p>
                <p className="wh-world__hint">Objects on floor · Asset Registry™ embedded</p>
              </div>
            </div>
            <div
              className="wh-world__hotspot"
              style={hotspotStyle(hotspots.registry ?? { left: '6%', top: '68%', width: '88%', height: '18%' })}
            >
              <div className="wh-world__glass-embed">
                <p className="wh-world__label">Scene Recipe™</p>
                {wh.sceneRecipes.slice(0, 2).map((recipe) => (
                  <div key={recipe.workspaceId} style={{ marginBottom: 6 }}>
                    <p style={{ fontSize: 5, color: '#c9a962' }}>{recipe.workspaceName}</p>
                    {recipe.ingredients.slice(0, 3).map((ing) => (
                      <div key={ing.role} className="wh-world__recipe-row">
                        <span>{ing.role}</span>
                        <span style={{ textAlign: 'right', opacity: 0.7 }}>{ing.assetName}</span>
                        <button
                          type="button"
                          className="wh-world__btn"
                          onClick={() =>
                            wh.openReplaceFlow({
                              workspaceId: recipe.workspaceId,
                              workspaceName: recipe.workspaceName,
                              slotRole: ing.role,
                              currentAssetId: ing.assetId,
                            })
                          }
                        >
                          Replace
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case 'marketplace-imports':
        return (
          <>
            <div
              className="wh-world__hotspot"
              style={hotspotStyle(hotspots.dock ?? { left: '8%', top: '42%', width: '84%', height: '36%' })}
            >
              <div className="wh-world__glass-embed">
                <p className="wh-world__label">Marketplace Imports™</p>
                <p className="wh-world__hint">Purchased assets arrive naturally — choose what enters production.</p>
                {MARKETPLACE_IMPORT_OPTIONS.map((opt) => (
                  <button key={opt} type="button" className="wh-world__btn" style={{ marginRight: 4, marginBottom: 4 }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="wh-world__hotspot wh-world__hotspot--ghost"
              style={{ left: '12%', top: '78%', width: '76%', height: '12%' }}
            >
              <button type="button" className="wh-world__walkway-btn" onClick={() => goToZone('museum-wing')}>
                Walk Into Museum Wing™ →
              </button>
            </div>
          </>
        );

      case 'museum-wing':
        return <MuseumWingInteractions museum={museum} hotspots={hotspots} />;

      case 'hall-of-innovation':
        return (
          <InnovationHallInteractions
            hotspots={hotspots}
            onContinueToExpansion={() => goToZone('future-expansion-wings')}
          />
        );

      case 'future-expansion-wings':
        return <FutureExpansionInteractions hotspots={hotspots} />;

      default:
        if (!zone.districtId) return null;
        return (
          <>
            <div
              className="wh-world__hotspot wh-world__hotspot--ghost"
              style={hotspotStyle(hotspots.floor ?? { left: '4%', top: '48%', width: '92%', height: '36%' })}
            >
              <WarehouseGalleryFloor
                zone={zone}
                assets={zoneAssets}
                selectedAssetId={wh.selectedAssetId}
                previewRotation={wh.previewRotation}
                previewZoom={wh.previewZoom}
                onSelectAsset={wh.setSelectedAssetId}
              />
            </div>
            <div
              className="wh-world__hotspot"
              style={{ left: '4%', top: '8%', width: '92%', height: '32%' }}
            >
              <div className="wh-world__glass-embed">
                <input
                  className="wh-world__search-input"
                  placeholder='Try: "white marble" · "Story Table lighting"'
                  value={searchDraft}
                  onChange={(e) => {
                    setSearchDraft(e.target.value);
                    wh.setSearchQuery(e.target.value);
                  }}
                  aria-label="Warehouse search"
                />
                <WarehouseInspectorConsole
                  asset={wh.selectedAsset}
                  recommendReuse={wh.selectedAsset ? wh.recommendReuseFor(wh.selectedAsset) : false}
                  onFavorite={() => wh.selectedAsset && wh.toggleFavorite(wh.selectedAsset.id)}
                  onArchive={() => wh.selectedAsset && wh.archiveAsset(wh.selectedAsset.id)}
                  onRotate={wh.rotatePreview}
                  onZoom={wh.zoomPreview}
                  onResetPreview={wh.resetPreview}
                  onApply={
                    wh.replaceContext
                      ? () => wh.selectedAsset && wh.applyReplacement(wh.selectedAsset.id)
                      : undefined
                  }
                  applyLabel={
                    wh.replaceContext
                      ? `Retrieve for ${wh.replaceContext.workspaceName}`
                      : undefined
                  }
                />
              </div>
            </div>
          </>
        );
    }
  };

  const worldClass =
    activeWing === 'legacy'
      ? 'wh-world is-legacy-wing'
      : activeWing === 'innovation'
        ? 'wh-world is-innovation-wing'
        : 'wh-world';

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <style>{CDS_GENESIS_INTERACTION_STYLES}</style>
      <style>{CDS_IMMERSION_STYLES}</style>
      <style>{WAREHOUSE_DESTINATION_STYLES}</style>
      <div className={worldClass} onPointerMove={immersion.onPointerMove} style={immersion.parallaxStyle}>
        <header className="wh-world__hud">
          <button type="button" className="wh-world__back" onClick={exitRoom} aria-label="Exit warehouse">
            ←
          </button>
          <div className="wh-world__identity">
            <p className="wh-world__title">{campusTitle}</p>
            <p className="wh-world__sub">{STUDIO_WAREHOUSE_SUBTITLE}</p>
          </div>
          <button
            type="button"
            className={`wh-world__pill-btn${stackButtonBusy ? ' is-building' : ''}`}
            onClick={() => void stack.ensureStation(wh.activeZoneId)}
            disabled={stackButtonBusy}
            title="Scene Stack™ — assembles this gallery room"
            aria-busy={stackButtonBusy}
          >
            {stackButtonBusy ? (
              <>
                <span className="wh-world__stack-spinner" aria-hidden />
                {activePipeline.currentLayerLabel ?? 'Building'}…
              </>
            ) : (
              `Stack ${stack.readyStationCount}/${stack.totalStationCount}`
            )}
          </button>
        </header>

        <WarehouseArchitecturalDirectory
          activeZoneId={wh.activeZoneId}
          arrivalComplete={wh.arrivalComplete}
          onSelectZone={goToZone}
        />

        <aside className="wh-world__orb-courier" aria-label="Studio Orb courier">
          <p className="wh-world__orb-courier-role" style={{ color: orbPersonality.accent }}>
            Studio Orb™ · {orbPersonality.role}
          </p>
          <p className="wh-world__orb-courier-quote">{orbPersonality.greeting}</p>
        </aside>

        <div className="wh-world__camera">
          <div
            className="wh-world__camera-track"
            style={{ transform: `translate3d(-${cameraPan}vw, 0, 0)` }}
          >
            {WAREHOUSE_CAMERA_ZONES.map((zone) => {
              const locked = zone.requiresArrival && !wh.arrivalComplete;
              const isActive = wh.activeZoneId === zone.id;
              const zoneLayers = isActive ? stack.getLayerViews(zone.id) : [];
              return (
                <section
                  key={zone.id}
                  className={`wh-world__zone-panel${isActive ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                  aria-label={zone.label}
                >
                  {isActive ? (
                    <SceneStackViewport
                      layers={zoneLayers}
                      status={stack.getCompositeStatus(zone.id)}
                      stationLabel={zone.label}
                      parallaxStyle={immersion.parallaxStyle}
                      pipeline={stack.getStationPipelineProgress(zone.id)}
                      onRegenerateLayer={(layerId) =>
                        void stack.regenerateLayer(zone.id, layerId as SceneStackLayerId)
                      }
                    />
                  ) : (
                    <div className="wh-world__zone-shell" aria-hidden />
                  )}
                  {isActive ? (
                    <div className="wh-world__interaction-layer">{renderZoneInteractions(zone.id)}</div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>

        <p className="wh-world__teaching">
          {activeZone.teaching}
          {wh.replaceContext ? (
            <>
              {' · Live Assembly™ — retrieving '}
              {wh.replaceContext.slotRole} for {wh.replaceContext.workspaceName}
            </>
          ) : stackButtonBusy ? (
            <>
              {' · Scene Stack™ '}
              {activePipeline.currentLayerLabel
                ? `generating ${activePipeline.currentLayerLabel}`
                : 'assembling gallery shell'}
            </>
          ) : compositeStatus === 'partial' ? (
            ` · ${activeLayers.filter((l) => l.publicUrl).length} layers locked`
          ) : (
            ''
          )}
        </p>

        {wh.replaceContext && wh.replaceCandidates.length > 0 ? (
          <nav className="wh-world__workspace-bar" aria-label="Workspace retrieval">
            <p style={{ color: '#c9a962', marginBottom: 4, fontSize: 5 }}>Compatible Objects</p>
            {wh.replaceCandidates.slice(0, 4).map((a) => (
              <button
                key={a.id}
                type="button"
                className="wh-world__btn"
                style={{ display: 'block', width: '100%', marginBottom: 4 }}
                onClick={() => {
                  wh.setSelectedAssetId(a.id);
                  wh.applyReplacement(a.id);
                }}
              >
                {a.name}
              </button>
            ))}
            <button type="button" className="wh-world__btn" onClick={() => wh.setReplaceContext(null)}>
              Cancel
            </button>
          </nav>
        ) : null}
      </div>
    </>
  );
}
