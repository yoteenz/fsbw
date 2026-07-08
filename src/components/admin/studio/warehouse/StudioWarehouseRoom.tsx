import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { ensureProjectGenome, resolveActiveProjectGenome } from '../../../../studio-os-core/project-genome';
import { getSceneStackStation } from '../../../../studio-os-core/scene-stack';
import type { SceneStackHotspotBounds, SceneStackLayerId } from '../../../../studio-os-core/scene-stack';
import { isWarehouseCameraZoneId, getSceneTrayZoneIds, resolveArchitecturalDestination } from '../../../../studio-os-core/studio-warehouse/campus-nav';
import { useAdminStudioWarehouse } from '../../../../hooks/useAdminStudioWarehouseState';
import { useAdminStudioMuseum } from '../../../../hooks/useAdminStudioMuseumState';
import { useSceneStack } from '../../../../hooks/useSceneStack';
import { useCdsImmersion } from '../../../../hooks/useCdsImmersion';
import { useStudioAlphaCost } from '../../../../hooks/useStudioAlphaCost';
import { StudioAlphaCostHud } from '../../studio-os/studio-alpha-cost/StudioAlphaCostHud';
import { useDepartmentRoomExit } from '../../studio-os/department-vertical-slice/DepartmentGoldenBuildShell';
import { SceneStackViewport } from '../../studio-os/creative-direction-studio/SceneStackViewport';
import { CDS_GENESIS_INTERACTION_STYLES } from '../../studio-os/creative-direction-studio/cdsInteractionLayerTheme';
import { CDS_IMMERSION_STYLES } from '../../studio-os/creative-direction-studio/cdsImmersionTheme';
import { DEPARTMENT_SLICE_STYLES } from '../../studio-os/department-vertical-slice/departmentSliceTheme';
import { STUDIO_ARCHIVES_SUBTITLE } from '../../../../utils/adminStudioWarehouseDemo';
import { WarehouseArchitecturalAssetShelf } from './WarehouseArchitecturalAssetShelf';
import { WarehouseInspectionStage } from './WarehouseInspectionStage';
import { WarehouseCollapsibleInspector } from './WarehouseCollapsibleInspector';
import { WarehouseCompareMode } from './WarehouseCompareMode';
import {
  ArchitecturalFrameStatusStrip,
  ArchitecturalNavigationRail,
  ARCHITECTURAL_NAV_STYLES,
  DISTRICT_THEME_STYLES,
} from '../architectural-navigation';
import { SceneTray, STUDIO_NAVIGATION_STYLES, type SceneTrayEntry } from '../navigation';
import { PresenceGated, PROGRESSIVE_PRESENCE_STYLES } from '../progressive-presence';
import { useProgressivePresence } from '../../../../hooks/useProgressivePresence';
import { useArchitecturalNavigationRail } from '../../../../hooks/useArchitecturalNavigationRail';
import {
  livingArchitectureClassForDistrict,
  effectiveCampusTier,
  useStudioWorld,
} from '../../../../hooks/useStudioWorld';
import {
  LivingArchitectureLayer,
  LIVING_ARCHITECTURE_STYLES,
} from '../living-architecture';
import {
  DistrictEcologyLayer,
  DISTRICT_ECOLOGY_STYLES,
} from '../living-district-ecology';
import {
  LivingCivilizationLayer,
  LIVING_CIVILIZATION_STYLES,
} from '../living-civilization';
import {
  CivilizationEventsLayer,
  CIVILIZATION_EVENTS_STYLES,
} from '../civilization-events';
import {
  buildWarehouseContextualWings,
  buildWarehouseFrameStatus,
  districtCssClass,
  resolveWarehouseDistrictTheme,
  resolveWarehouseLocationStack,
} from '../../../../studio-os-core/architectural-navigation';
import { MuseumWingInteractions } from './MuseumWingInteractions';
import { FutureExpansionInteractions, InnovationHallInteractions } from './InnovationHallInteractions';
import { OrientationAtriumInteractions } from './OrientationAtriumInteractions';
import {
  ArchivesServiceBayInteractions,
  BlueprintArchiveInteractions,
  GenomeVaultInteractions,
  MarketplacePavilionInteractions,
  WarehouseWingLobbyInteractions,
} from './ArchivesWingInteractions';
import { resolveWarehouseOrbPersonality } from './warehouseOrbPersonality';
import { WAREHOUSE_DESTINATION_STYLES } from './warehouseDestinationTheme';
import { WAREHOUSE_CAMPUS_STYLES } from './warehouseCampusTheme';
import { WAREHOUSE_FRAME_STYLES } from './warehouseFrameTheme';
import type { WarehouseCameraZoneId } from '../../../../studio-os-core/studio-warehouse';
import { districtForWarehouseZone, industrialWingForZone, isGalleryZone } from '../../../../studio-os-core/studio-warehouse';
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
 * Studio Archives™ — flagship headquarters inside Studio World™.
 * Warehouse Wing™, Museum Wing™, Genome Vault™, Blueprint Archive™, and Marketplace Pavilion™ — one campus.
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
    const base = wh.catalog.filter((a) => a.districtId === district && !a.archived);
    if (wh.searchQuery.trim()) {
      return wh.searchResults.map((r) => r.asset).filter((a) => a.districtId === district);
    }
    return base;
  }, [wh.activeZoneId, wh.catalog, wh.searchQuery, wh.searchResults]);

  const industrialWing = useMemo(() => industrialWingForZone(wh.activeZoneId), [wh.activeZoneId]);
  const galleryMode = isGalleryZone(wh.activeZoneId);
  const navRail = useArchitecturalNavigationRail();
  const presence = useProgressivePresence(DEPARTMENT_ID);
  const overlaysEarned =
    presence.state.expandedElements.has('world-health-expanded') || presence.state.revealedLevel >= 3;
  const {
    architecture: livingArchitecture,
    ecology: livingEcology,
    civilization: livingCivilization,
    events: civilizationEvents,
  } = useStudioWorld(wh.catalog);

  const navLocation = useMemo(
    () => resolveWarehouseLocationStack(wh.activeZoneId, wh.arrivalComplete),
    [wh.activeZoneId, wh.arrivalComplete]
  );

  const contextualWings = useMemo(
    () => buildWarehouseContextualWings(wh.arrivalComplete),
    [wh.arrivalComplete]
  );

  const orbPersonality = useMemo(
    () =>
      resolveWarehouseOrbPersonality(
        activeWing,
        livingArchitecture,
        livingEcology,
        livingCivilization,
        civilizationEvents
      ),
    [activeWing, livingArchitecture, livingEcology, livingCivilization, civilizationEvents]
  );

  const frameStatus = useMemo(
    () =>
      buildWarehouseFrameStatus({
        activeZoneId: wh.activeZoneId,
        arrivalComplete: wh.arrivalComplete,
        stackLabel: activeZone.label,
        pipelinePhase: activePipeline.phase,
        layersComplete: activePipeline.layersComplete,
        layersTotal: activePipeline.layersTotal,
        orbRole: orbPersonality.role,
        livingArchitecture,
        livingEcology,
        livingCivilization,
        civilizationEvents,
      }),
    [
      wh.activeZoneId,
      wh.arrivalComplete,
      activeZone.label,
      activePipeline,
      orbPersonality.role,
      livingArchitecture,
      livingEcology,
      livingCivilization,
      civilizationEvents,
    ]
  );

  const districtThemeId = useMemo(
    () => resolveWarehouseDistrictTheme(wh.activeZoneId),
    [wh.activeZoneId]
  );
  const districtClass = districtCssClass(districtThemeId);
  const livingClass = livingArchitectureClassForDistrict(districtThemeId, livingArchitecture);
  const livingTier = effectiveCampusTier(districtThemeId, {
    architecture: livingArchitecture,
    ecology: livingEcology,
  });
  const ecologyBalanced = livingEcology.ecosystemBalance >= 55;
  const civilizationSelfBalancing = livingCivilization.health.selfBalancing;
  const eventsActive = civilizationEvents.activeEvents.length > 0;

  const campusTitle = useMemo(() => {
    if (industrialWing) {
      return `Industrial Design Campus™ · ${industrialWing.label}`;
    }
    if (activeWing === 'legacy') return 'Studio Archives™ · Museum Wing™';
    if (activeWing === 'innovation') return 'Studio Archives™ · Hall of Innovation™';
    if (activeWing === 'genome') return 'Studio Archives™ · Company Genome Vault™';
    if (activeWing === 'blueprint') return 'Studio Archives™ · Blueprint Archive™';
    if (activeWing === 'marketplace') return 'Studio Archives™ · Marketplace Pavilion™';
    if (activeWing === 'expansion') return 'Studio Archives™ · Future Expansion™';
    if (activeWing === 'atrium') return 'Studio Archives™ · Orientation Atrium™';
    if (activeWing === 'warehouse') return 'Industrial Design Campus™ · Warehouse Wing™';
    return 'Industrial Design Campus™';
  }, [activeWing, industrialWing]);

  const costSnapshot = useStudioAlphaCost({
    departmentId: DEPARTMENT_ID,
    projectId: project.projectId,
    sceneId: wh.activeZoneId,
    departmentDisplayName: campusTitle,
    sceneDisplayName: activeZone.label,
    layersComplete: activePipeline.layersComplete,
    layersTotal: activePipeline.layersTotal,
    pipelinePhase: activePipeline.phase,
    currentLayerId: activePipeline.currentLayerId,
    currentLayerLabel: activePipeline.currentLayerLabel,
  });

  const goToZone = useCallback(
    (zoneId: WarehouseCameraZoneId) => {
      const zone = getWarehouseZone(zoneId);
      if (zone.requiresArrival && !wh.arrivalComplete) return;
      wh.setActiveZoneId(zoneId);
    },
    [wh]
  );

  const activeDestinationId = useMemo(
    () => resolveArchitecturalDestination(wh.activeZoneId),
    [wh.activeZoneId]
  );

  const museumSceneTrayEntries = useMemo((): SceneTrayEntry[] => {
    const base: SceneTrayEntry[] = [
      { id: 'legacy-hall', label: 'Legacy Hall™', shortLabel: 'Legacy' },
      { id: 'time-machine', label: 'Time Machine™', shortLabel: 'Time' },
      { id: 'memory-sphere', label: 'Memory Sphere™', shortLabel: 'Sphere' },
    ];
    const exhibitEntries = museum.exhibits.map((ex) => ({
      id: ex.id,
      label: ex.title,
      shortLabel: ex.title.length > 14 ? `${ex.title.slice(0, 12)}…` : ex.title,
    }));
    return [...base, ...exhibitEntries];
  }, [museum.exhibits]);

  const sceneTrayEntries = useMemo((): SceneTrayEntry[] => {
    if (activeDestinationId === 'museum-wing') return museumSceneTrayEntries;
    return getSceneTrayZoneIds(activeDestinationId).map((zoneId) => {
      const zone = getWarehouseZone(zoneId);
      return {
        id: zoneId,
        label: zone.label,
        shortLabel: zone.shortLabel,
        locked: zone.requiresArrival && !wh.arrivalComplete,
      };
    });
  }, [activeDestinationId, museumSceneTrayEntries, wh.arrivalComplete]);

  const sceneTrayActiveId = useMemo(() => {
    if (wh.activeZoneId !== 'museum-wing') return wh.activeZoneId;
    if (museum.viewMode === 'time-machine') return 'time-machine';
    if (museum.viewMode === 'memory-sphere') return 'memory-sphere';
    if (museum.selectedExhibitId && museum.viewMode === 'exhibits') return museum.selectedExhibitId;
    return 'legacy-hall';
  }, [museum.selectedExhibitId, museum.viewMode, wh.activeZoneId]);

  const onSceneTraySelect = useCallback(
    (entryId: string) => {
      if (wh.activeZoneId === 'museum-wing' || activeDestinationId === 'museum-wing') {
        if (entryId === 'legacy-hall') {
          museum.setViewMode('exhibits');
          museum.setHistorianContext('enter');
          return;
        }
        if (entryId === 'time-machine') {
          museum.setViewMode('time-machine');
          museum.setHistorianContext('timeline');
          return;
        }
        if (entryId === 'memory-sphere') {
          museum.setViewMode('memory-sphere');
          museum.setHistorianContext('idle');
          return;
        }
        museum.selectExhibit(entryId);
        return;
      }
      if (isWarehouseCameraZoneId(entryId)) goToZone(entryId);
    },
    [activeDestinationId, goToZone, museum, wh.activeZoneId]
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
                Enter Grand Entrance™ →
              </button>
            ) : (
              <button type="button" className="wh-world__enter-btn" onClick={() => goToZone('central-atrium')}>
                Enter Orientation Atrium™ →
              </button>
            )}
          </div>
        );

      case 'central-atrium':
        return (
          <OrientationAtriumInteractions
            wh={wh}
            costSnapshot={costSnapshot}
            hotspots={hotspots}
            onEnterWarehouse={() => goToZone('warehouse-wing')}
            onEnterMuseum={() => goToZone('museum-wing')}
          />
        );

      case 'warehouse-wing':
        return (
          <WarehouseWingLobbyInteractions
            hotspots={hotspots}
            onEnterGalleries={() => goToZone('environment-gallery')}
          />
        );

      case 'company-genome-vault':
        return (
          <GenomeVaultInteractions
            hotspots={hotspots}
            onEnterBlueprints={() => goToZone('blueprint-archive')}
          />
        );

      case 'blueprint-archive':
        return (
          <BlueprintArchiveInteractions
            hotspots={hotspots}
            onEnterMarketplace={() => goToZone('marketplace-imports')}
          />
        );

      case 'generation-bay':
        return (
          <ArchivesServiceBayInteractions
            label="Generation Bay™"
            hint="Active asset production — Scene Stack™ assembly queue for new objects."
            hotspot={hotspotStyle(hotspots.bay ?? { left: '8%', top: '40%', width: '84%', height: '44%' })}
          />
        );

      case 'asset-restoration':
        return (
          <ArchivesServiceBayInteractions
            label="Asset Restoration™"
            hint="Repair, refine, and revalidate archived assets before remounting to workspaces."
            hotspot={hotspotStyle(hotspots.workshop ?? { left: '10%', top: '42%', width: '80%', height: '42%' })}
          />
        );

      case 'marketplace-imports':
        return (
          <MarketplacePavilionInteractions
            hotspots={hotspots}
            importOptions={MARKETPLACE_IMPORT_OPTIONS}
            onEnterMuseum={() => goToZone('museum-wing')}
          />
        );

      case 'museum-wing':
        return <MuseumWingInteractions museum={museum} hotspots={hotspots} />;

      case 'hall-of-innovation':
        return (
          <InnovationHallInteractions
            hotspots={hotspots}
            livingArchitecture={livingArchitecture}
            livingEcology={livingEcology}
            onContinueToExpansion={() => goToZone('company-genome-vault')}
          />
        );

      case 'future-expansion-wings':
        return (
          <FutureExpansionInteractions
            livingArchitecture={livingArchitecture}
            livingEcology={livingEcology}
          />
        );

      default:
        if (!zone.districtId) return null;
        return (
          <div className={`wh-campus${wh.inspectorOpen ? ' is-inspector-open' : ''}`}>
            <header className="wh-campus__frame wh-campus__frame--command">
              <div className="wh-campus__command">
                <input
                  className="wh-campus__search-input"
                  placeholder='Try: "white marble" · "Story Table lighting"'
                  value={searchDraft}
                  onChange={(e) => {
                    setSearchDraft(e.target.value);
                    wh.setSearchQuery(e.target.value);
                  }}
                  aria-label="Warehouse search"
                />
                <div className="wh-campus__toolbar">
                  <button
                    type="button"
                    className={`wh-campus__toolbar-btn${wh.inspectorOpen ? ' is-active' : ''}`}
                    onClick={wh.toggleInspector}
                  >
                    Inspector
                  </button>
                  <button
                    type="button"
                    className={`wh-campus__toolbar-btn${wh.interactionMode === 'compare' ? ' is-active' : ''}`}
                    onClick={() =>
                      wh.interactionMode === 'compare' ? wh.exitCompareMode() : wh.enterCompareMode()
                    }
                  >
                    Compare
                  </button>
                </div>
              </div>
            </header>

            <section className="wh-campus__frame wh-campus__frame--stage">
              <div className="wh-campus__frame-body">
                {wh.interactionMode === 'compare' && wh.compareAssets.length > 0 ? (
                  <WarehouseCompareMode
                    assets={wh.compareAssets}
                    onRemove={wh.toggleCompareAsset}
                    onClear={wh.clearCompare}
                  />
                ) : (
                  <WarehouseInspectionStage
                    asset={wh.selectedAsset}
                    previewRotation={wh.previewRotation}
                    previewZoom={wh.previewZoom}
                    inspectionActive={wh.interactionMode === 'inspect' && Boolean(wh.selectedAsset)}
                    onRotate={wh.rotatePreview}
                    onZoom={wh.zoomPreview}
                    onResetPreview={wh.resetPreview}
                    onOpenInspector={wh.openInspector}
                  />
                )}
              </div>
            </section>

            <footer className="wh-campus__frame wh-campus__frame--shelf">
              <p className="wh-campus__shelf-header">Architectural Asset Shelf™</p>
              <div className="wh-campus__shelf-body">
                <WarehouseArchitecturalAssetShelf
                  assets={zoneAssets}
                  selectedAssetId={wh.selectedAssetId}
                  compareAssetIds={wh.compareAssetIds}
                  compareMode={wh.interactionMode === 'compare'}
                  transitioningAssetId={wh.transitioningAssetId}
                  onSelectAsset={wh.selectAssetForInspection}
                  onToggleCompare={wh.toggleCompareAsset}
                />
              </div>
            </footer>

            <aside className="wh-campus__frame wh-campus__frame--inspector">
              <WarehouseCollapsibleInspector
                open={wh.inspectorOpen}
                asset={wh.selectedAsset}
                catalog={wh.catalog}
                recommendReuse={wh.selectedAsset ? wh.recommendReuseFor(wh.selectedAsset) : false}
                onClose={wh.closeInspector}
                onFavorite={() => wh.selectedAsset && wh.toggleFavorite(wh.selectedAsset.id)}
                onArchive={() => wh.selectedAsset && wh.archiveAsset(wh.selectedAsset.id)}
                onSelectRelated={(assetId) => {
                  const related = wh.catalog.find((a) => a.id === assetId);
                  if (related) {
                    const relatedZone = WAREHOUSE_CAMERA_ZONES.find((z) => z.districtId === related.districtId);
                    if (relatedZone && relatedZone.id !== wh.activeZoneId) {
                      goToZone(relatedZone.id);
                    }
                    wh.selectAssetForInspection(assetId);
                  }
                }}
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
            </aside>
          </div>
        );
    }
  };

  const worldClass =
    industrialWing?.id === 'asset-gallery'
      ? 'wh-world is-asset-gallery-wing'
      : industrialWing?.id === 'material-library'
        ? 'wh-world is-material-library-wing'
        : industrialWing?.id === 'blueprint-hall'
          ? 'wh-world is-blueprint-hall-wing'
          : industrialWing?.id === 'prototype-vault'
            ? 'wh-world is-prototype-vault-wing'
            : industrialWing?.id === 'innovation-gallery'
              ? 'wh-world is-innovation-gallery-wing'
              : activeWing === 'legacy'
                ? 'wh-world is-legacy-wing'
                : activeWing === 'innovation'
                  ? 'wh-world is-innovation-wing'
                  : activeWing === 'genome'
                    ? 'wh-world is-genome-wing'
                    : activeWing === 'blueprint'
                      ? 'wh-world is-blueprint-wing'
                      : activeWing === 'marketplace'
                        ? 'wh-world is-marketplace-wing'
                        : activeWing === 'atrium'
                          ? 'wh-world is-atrium-wing'
                          : 'wh-world';

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <style>{CDS_GENESIS_INTERACTION_STYLES}</style>
      <style>{CDS_IMMERSION_STYLES}</style>
      <style>{WAREHOUSE_DESTINATION_STYLES}</style>
      <style>{WAREHOUSE_FRAME_STYLES}</style>
      <style>{ARCHITECTURAL_NAV_STYLES}</style>
      <style>{DISTRICT_THEME_STYLES}</style>
      <style>{LIVING_ARCHITECTURE_STYLES}</style>
      <style>{DISTRICT_ECOLOGY_STYLES}</style>
      <style>{LIVING_CIVILIZATION_STYLES}</style>
      <style>{CIVILIZATION_EVENTS_STYLES}</style>
      <style>{WAREHOUSE_CAMPUS_STYLES}</style>
      <style>{STUDIO_NAVIGATION_STYLES}</style>
      <style>{PROGRESSIVE_PRESENCE_STYLES}</style>
      <StudioAlphaCostHud snapshot={costSnapshot} />
      <div
        className={`${worldClass} ${districtClass} ${livingClass}${ecologyBalanced ? ' sw-ecology--balanced' : ''}${civilizationSelfBalancing ? ' sw-civilization--self-balancing' : ''}${eventsActive ? ' sw-events--active' : ''}${galleryMode ? ' wh-world--campus-gallery' : ''}${wh.inspectorOpen ? ' wh-world--inspector-open' : ''}${navRail.mode === 'hidden' ? ' wh-world--rail-hidden' : ''}`}
        data-living-tier={livingTier > 0 ? livingTier : undefined}
        data-ecology-tier={livingTier > 0 ? livingTier : undefined}
        onPointerMove={immersion.onPointerMove}
        style={immersion.parallaxStyle}
      >
        <header className="wh-world__hud">
          <button type="button" className="wh-world__back" onClick={exitRoom} aria-label="Exit Studio Archives">
            ←
          </button>
          <div className="wh-world__identity">
            <p className="wh-world__title">{campusTitle}</p>
            <p className="wh-world__sub">{STUDIO_ARCHIVES_SUBTITLE}</p>
            <PresenceGated elementId="frame-status-strip" presence={presence}>
              <ArchitecturalFrameStatusStrip status={frameStatus} districtThemeId={districtThemeId} />
            </PresenceGated>
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

        <ArchitecturalNavigationRail
          mode={navRail.mode}
          districtThemeId={districtThemeId}
          location={navLocation}
          frameStatus={frameStatus}
          contextualWings={contextualWings}
          activeRoomId={activeDestinationId}
          livingArchitecture={livingArchitecture}
          livingEcology={livingEcology}
          livingCivilization={livingCivilization}
          civilizationEvents={civilizationEvents}
          roomId={DEPARTMENT_ID}
          onSelectRoom={(roomId) => goToZone(roomId as WarehouseCameraZoneId)}
          onCycleMode={navRail.cycleMode}
        />

        <div className={overlaysEarned ? 'is-presence-earned' : undefined}>
          <LivingArchitectureLayer
            snapshot={livingArchitecture}
            districtThemeId={districtThemeId}
            showMonument={presence.isVisible('living-architecture-monument')}
          />
        </div>

        <div className={overlaysEarned ? 'is-presence-earned' : undefined}>
          <DistrictEcologyLayer
            ecology={livingEcology}
            districtThemeId={districtThemeId}
            compact={!presence.isVisible('ecology-synergy-flows')}
          />
        </div>

        <div className={overlaysEarned ? 'is-presence-earned' : undefined}>
          <LivingCivilizationLayer
            civilization={livingCivilization}
            districtThemeId={districtThemeId}
            compact={!presence.isVisible('civilization-economies')}
          />
        </div>

        <div className={overlaysEarned ? 'is-presence-earned' : undefined}>
          <CivilizationEventsLayer events={civilizationEvents} compact />
        </div>

        <PresenceGated elementId="orb-courier-message" presence={presence}>
          <aside className="wh-world__orb-courier" aria-label="Studio Orb courier">
            <p className="wh-world__orb-courier-role" style={{ color: orbPersonality.accent }}>
              Studio Orb™ · {orbPersonality.role}
            </p>
            <p className="wh-world__orb-courier-quote">{orbPersonality.greeting}</p>
          </aside>
        </PresenceGated>

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
          {galleryMode && industrialWing
            ? `${industrialWing.tagline} · Select a pedestal — asset travels to inspection stage`
            : activeZone.teaching}
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

        <SceneTray
          entries={sceneTrayEntries}
          activeId={sceneTrayActiveId}
          onSelect={onSceneTraySelect}
          ariaLabel="Scenes and workspaces in this destination"
        />

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
