import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  CONTINUOUS_SCALE_LABELS,
  worldHealthClass,
} from '../../../../studio-os-core/mission-control';
import {
  ATLAS_CONSTRUCTION_PHASE_LABELS,
  ATLAS_ENGINE_LABELS,
  ATLAS_TRAVEL_LABELS,
  ATLAS_ZOOM_LABELS,
  MASTER_PLAN_PHASE_LABELS,
  RESERVE_LAND_PRESETS,
  activityGlowClass,
  fogOpacity,
  forecastHorizonLabel,
  getBuildingMemory,
  livingSignalClass,
  planPhaseProgress,
  formatFutureAnalysisLines,
  commitSummaryLines,
  type AtlasNode,
} from '../../../../studio-os-core/studio-world-atlas';
import { orbSignalClass, resolveOrbSignalForNode } from '../../../../studio-os-core/orb-recommendations';
import { useStudioWorldAtlas } from '../../../../hooks/useStudioWorldAtlas';
import { useStudioWorldExperienceOptional } from '../global-experience';
import { PresenceGated } from '../progressive-presence/PresenceGated';
import { AtlasSpatialShell } from './AtlasSpatialShell';
import { useAtlasAssembly } from './useAtlasAssembly';
import { useMissionControl } from '../../../../hooks/useMissionControl';
import { MissionControlLayers } from './MissionControlLayers';
import { STUDIO_WORLD_ATLAS_STYLES } from './studioWorldAtlasTheme';

const FORECAST_HORIZONS = [1, 3, 5, 10] as const;

function BuildingMarker({
  node,
  focusNodeId,
  onSelect,
  draggable,
  onDrag,
  mergeDraggable,
  onMergeDrag,
  orbSignalKind,
  healthClass,
}: {
  node: AtlasNode;
  focusNodeId: string;
  onSelect: (id: string) => void;
  draggable?: boolean;
  onDrag?: (planId: string, mapX: number, mapY: number) => void;
  orbSignalKind?: string;
  mergeDraggable?: boolean;
  onMergeDrag?: (buildingId: string, mapX: number, mapY: number) => void;
  healthClass?: string;
}) {
  const heightPx = 12 + node.extrusion * 48;
  const opacity = fogOpacity(node.unlocked, node.fogged);
  const signalClasses = (node.livingSignals ?? []).map(livingSignalClass);
  const surfaceRef = useRef<HTMLElement | null>(null);

  const pointerToMap = useCallback((clientX: number, clientY: number) => {
    const surface = surfaceRef.current?.closest('.swa__table-surface') as HTMLElement | null;
    if (!surface) return { mapX: node.mapX, mapY: node.mapY };
    const rect = surface.getBoundingClientRect();
    const mapX = ((clientX - rect.left) / rect.width) * 100;
    const mapY = ((clientY - rect.top) / rect.height) * 100;
    return { mapX, mapY };
  }, [node.mapX, node.mapY]);

  return (
    <button
      type="button"
      ref={(el) => {
        surfaceRef.current = el;
      }}
      className={[
        'swa__building',
        activityGlowClass(node.activity),
        node.fogged ? 'is-fogged' : '',
        node.hidden ? 'is-hidden' : '',
        node.id === focusNodeId ? 'is-focused' : '',
        node.isPlanned ? 'is-planned' : '',
        node.isConcept ? 'is-planned' : '',
        node.isParallelFuture && node.isConcept ? 'is-pf-inactive' : '',
        node.isParallelFuture && !node.isConcept ? 'is-pf-active' : '',
        mergeDraggable ? 'is-merge-draggable' : '',
        draggable && node.planId ? 'is-draggable' : '',
        orbSignalKind ?? '',
        healthClass ?? '',
        ...signalClasses,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: `${node.mapX}%`,
        top: `${node.mapY}%`,
        opacity,
      }}
      onClick={() => onSelect(node.id)}
      onPointerDown={(e) => {
        if (mergeDraggable && onMergeDrag && node.id.startsWith('pf-node-')) {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }
        if (!draggable || !node.planId || !onDrag) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (mergeDraggable && onMergeDrag && (e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
          const buildingId = node.id.replace('pf-node-', '');
          const { mapX, mapY } = pointerToMap(e.clientX, e.clientY);
          onMergeDrag(buildingId, mapX, mapY);
          return;
        }
        if (!draggable || !node.planId || !onDrag || !(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId))
          return;
        const { mapX, mapY } = pointerToMap(e.clientX, e.clientY);
        onDrag(node.planId, mapX, mapY);
      }}
      onPointerUp={(e) => {
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
      }}
      disabled={node.fogged && !node.unlocked}
      title={node.displayName}
      aria-label={node.displayName}
    >
      <div className="swa__extrusion" style={{ height: `${heightPx}px` }} />
      <span className="swa__building-label">{node.displayName}</span>
      <span className="swa__building-level">
        L{node.level}
        {node.planPhase ? ` · ${MASTER_PLAN_PHASE_LABELS[node.planPhase]}` : null}
        {!node.planPhase && node.constructionPhase && node.constructionPhase !== 'complete'
          ? ` · ${ATLAS_CONSTRUCTION_PHASE_LABELS[node.constructionPhase]}`
          : null}
      </span>
    </button>
  );
}

/**
 * Studio World Atlas™ — spatial holographic civilization projection.
 * Architecture first; information emerges through Progressive Presence™.
 */
export function StudioWorldAtlasRoom() {
  const navigate = useNavigate();
  const { workspace, workspaceId } = useWorkspace();
  const experience = useStudioWorldExperienceOptional();
  const { phase, isAlive } = useAtlasAssembly();
  const atlas = useStudioWorldAtlas({
    companyName: workspace.displayName,
    organizationId: workspaceId ?? 'frontal-slayer',
    liveRefreshMs: 45_000,
  });

  const [traveling, setTraveling] = useState(false);
  const [travelOverlay, setTravelOverlay] = useState<{
    message: string;
    cinematicClass: string;
  } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const mission = useMissionControl({
    visibleNodes: atlas.visibleNodes,
    focusNode: atlas.focusNode,
    atlasMapMode: atlas.view.mapMode,
    setMapMode: atlas.setMapMode,
    setTravelMode: atlas.setTravelMode,
    resolveTravel: atlas.resolveTravel,
    selectedNode: selectedNodeId
      ? atlas.catalog.find((n) => n.id === selectedNodeId) ?? atlas.focusNode
      : atlas.focusNode,
  });

  const healthByNodeId = useMemo(() => {
    const map = new Map<string, string>();
    mission.worldHealth.forEach((s) => map.set(s.nodeId, worldHealthClass(s.health)));
    return map;
  }, [mission.worldHealth]);

  const selectedNode = useMemo(
    () =>
      selectedNodeId
        ? atlas.catalog.find((n) => n.id === selectedNodeId) ?? atlas.focusNode
        : atlas.focusNode,
    [selectedNodeId, atlas.catalog, atlas.focusNode]
  );

  const selectedMemory = useMemo(
    () => getBuildingMemory(selectedNode.id, atlas.discovery.buildingMemories),
    [selectedNode.id, atlas.discovery.buildingMemories]
  );

  const roadPaths = useMemo(() => {
    const focus = atlas.focusNode;
    return atlas.visibleNodes
      .filter((n) => n.id !== focus.id)
      .map((n) => {
        const x1 = focus.mapX;
        const y1 = focus.mapY;
        const x2 = n.mapX;
        const y2 = n.mapY;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 4;
        return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
      });
  }, [atlas.focusNode, atlas.visibleNodes]);

  const handleSelect = useCallback(
    (nodeId: string) => {
      experience?.presence.expand('atlas-district-labels', 1);
      experience?.presence.expand('atlas-focus-annotation', 2);
      experience?.presence.revealLevel(1);
      setSelectedNodeId(nodeId);
      const node = atlas.catalog.find((n) => n.id === nodeId);
      if (!node) return;
      if (node.planId) atlas.setSelectedPlanId(node.planId);
      if (node.childIds.length > 0 && node.level < 6) {
        atlas.focusOn(nodeId);
      }
      if (nodeId.startsWith('discovery-') && node.fogged) {
        atlas.focusOn(nodeId);
      }
    },
    [atlas, experience]
  );

  const handleTravel = useCallback(
    async (nodeId?: string) => {
      const targetId = nodeId ?? selectedNode.id;
      if (selectedNode.isPlanned || selectedNode.isConcept) return;
      const resolution = atlas.resolveTravel(targetId);
      if (!resolution) return;
      const targetName = atlas.catalog.find((n) => n.id === targetId)?.displayName ?? 'destination';
      experience?.presence.expand('atlas-travel-journey', 2);
      setTraveling(true);
      setTravelOverlay({
        message: `${resolution.verb} ${targetName}…`,
        cinematicClass: resolution.cinematicClass.replace('atlas-travel-', ''),
      });
      await new Promise((r) => window.setTimeout(r, Math.max(600, resolution.transitionMs * 0.55)));
      await new Promise((r) => window.setTimeout(r, resolution.transitionMs * 0.45));
      navigate(resolution.path);
      setTraveling(false);
      setTravelOverlay(null);
      atlas.clearTravelingRoads();
    },
    [atlas, experience, navigate, selectedNode.id, selectedNode.isPlanned, selectedNode.isConcept]
  );

  const showPlanner = atlas.isMasterPlannerMode;
  const showParallelFutures = atlas.isParallelFuturesMode;
  const showFutureMerge = atlas.isFutureMergeMode;
  const labelsVisible = experience?.presence.isVisible('atlas-district-labels') ?? false;
  const plannerSurfacesVisible =
    showPlanner || showParallelFutures || showFutureMerge || experience?.presence.isVisible('atlas-planner-surfaces');

  return (
    <>
      <style>{STUDIO_WORLD_ATLAS_STYLES}</style>
      <div
        className={[
          'swa',
          'is-spatial',
          'is-mission-control',
          `is-assembly-${phase}`,
          isAlive ? 'is-assembly-alive' : '',
          !mission.navigationReady ? 'is-activating' : '',
          labelsVisible ? 'is-labels-visible' : '',
          showPlanner ? 'is-master-planner' : '',
          showParallelFutures ? 'is-parallel-futures' : '',
          showFutureMerge ? 'is-future-merge' : '',
          traveling ? 'is-traveling' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="application"
        aria-label="Mission Control"
      >
        <AtlasSpatialShell phase={phase} alive={isAlive}>
        <MissionControlLayers
          activation={mission.activation}
          navigationReady={mission.navigationReady}
          constellationStars={mission.constellationStars}
          worldHealth={mission.worldHealth}
          modeTableClass={mission.modeMapping.tableClass}
          modeAmbientClass={mission.modeMapping.ambientClass}
        />
        <header className="swa__hud">
          <button
            type="button"
            className="swa__back"
            onClick={() => navigate('/admin/studio/world/command-center')}
            aria-label="Return to Executive Atrium"
          >
            ←
          </button>
          <div className="swa__title-block">
            <p className="swa__eyebrow">STUDIO COMMAND CENTER™ · THE WORLD IS THE INTERFACE™</p>
            <p className="swa__title">MISSION CONTROL™</p>
            <p className="swa__zoom">
              {showFutureMerge
                ? 'FUTURE MERGE™ · MERGE LAB™'
                : showParallelFutures
                ? 'PARALLEL FUTURES™ · COMPARE BEFORE YOU BUILD'
                : showPlanner
                  ? 'MASTER PLANNER™ · PLANNING MODE'
                  : `ATLAS TABLE™ · ${CONTINUOUS_SCALE_LABELS[mission.continuousScale]}`}
            </p>
          </div>
          {atlas.focusNode.parentId ? (
            <button type="button" className="swa__zoom-out" onClick={atlas.zoomOut}>
              ZOOM OUT
            </button>
          ) : (
            <button type="button" className="swa__zoom-out" onClick={atlas.resetToWorld}>
              WORLD VIEW
            </button>
          )}
        </header>

        {mission.worldHealthLine && mission.navigationReady ? (
          <p className="swa__world-health-line">{mission.worldHealthLine}</p>
        ) : null}

        {mission.navigationReady ? (
          <span className="swa__scale-pill">{CONTINUOUS_SCALE_LABELS[mission.continuousScale]}</span>
        ) : null}

        <div className="swa__ticker" aria-live="polite">
          <PresenceGated elementId="atlas-world-ticker">
            <span className="swa__ticker-inner">
              {showFutureMerge
                ? `FUTURE MERGE™ · MERGE LAB™ · ${atlas.discovery.parallelFutures.length} FUTURES FLOATING`
                : showPlanner
                  ? showParallelFutures
                    ? `PARALLEL FUTURES™ · ${atlas.discovery.parallelFutures.length} VISIONS · DESIGN FIRST · BUILD SECOND`
                    : `MASTER PLANNER™ · ${atlas.discovery.masterPlan.length} RESERVED · SIMULATE BEFORE YOU GENERATE · ${atlas.worldForecast.narrative}`
                  : atlas.worldTicker}{' '}
              &nbsp;&nbsp;&nbsp;{' '}
              {showPlanner ? atlas.worldForecast.narrative : atlas.worldTicker}
            </span>
          </PresenceGated>
        </div>

        {!showPlanner ? (
          <PresenceGated elementId="atlas-engine-strip">
            <div className="swa__engine-strip" aria-hidden>
              {atlas.activeEngines.slice(0, 8).map((engine) => (
                <span key={engine} className="swa__engine-chip">
                  {ATLAS_ENGINE_LABELS[engine]}
                </span>
              ))}
            </div>
          </PresenceGated>
        ) : null}

        <PresenceGated elementId="atlas-breadcrumb-trail">
          <nav className="swa__breadcrumb" aria-label="Atlas focus trail">
            {atlas.breadcrumb.map((node, i) => (
              <button
                key={node.id}
                type="button"
                className={`swa__crumb${i === atlas.breadcrumb.length - 1 ? ' is-current' : ''}`}
                onClick={() => atlas.focusOn(node.id)}
              >
                {node.displayName}
              </button>
            ))}
          </nav>
        </PresenceGated>

        <PresenceGated elementId="atlas-focus-annotation">
        <aside className="swa__focus-panel" aria-live="polite">
          <p className="swa__focus-name">{selectedNode.displayName}</p>
          <p className="swa__focus-meta">
            {selectedNode.planPhase
              ? MASTER_PLAN_PHASE_LABELS[selectedNode.planPhase]
              : ATLAS_ZOOM_LABELS[selectedNode.level]}
            <br />
            {selectedNode.isConcept ? 'FUTURE VISION™ CONCEPT' : selectedNode.activity.toUpperCase()}
            {selectedNode.planPhase ? (
              <>
                <br />
                {planPhaseProgress(selectedNode.planPhase)}% TO OPERATIONAL™
              </>
            ) : null}
          </p>
          {showFutureMerge && atlas.liveMergeMetrics ? (
            <div className="swa__merge-live-metrics">
              <p className="swa__sim-score">LIVE COMPARISON™</p>
              {atlas.liveMergeMetricLines(atlas.liveMergeMetrics).map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          ) : null}
          {showFutureMerge && atlas.mergeDraftFuture?.genome ? (
            <div className="swa__merge-genome">
              <p className="swa__sim-score">FUTURE GENOME™</p>
              {atlas.formatGenomeLines(atlas.mergeDraftFuture.genome).map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          ) : null}
          {showFutureMerge && atlas.mergeHistory[0] ? (
            <div className="swa__merge-replay">
              <p className="swa__sim-score">VISUAL HISTORY™</p>
              {atlas.formatMergeReplay(atlas.mergeHistory[0]).split('\n').map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          ) : null}
          {showFutureMerge && atlas.mergeComments.length > 0 ? (
            <div className="swa__merge-comments">
              {atlas.mergeComments.slice(0, 2).map((c) => (
                <span key={c.id} style={{ display: 'block', opacity: 0.75, marginTop: 4 }}>
                  {c.authorName}: {c.text}
                </span>
              ))}
            </div>
          ) : null}
          {showParallelFutures && !showFutureMerge && atlas.activeParallelFuture ? (
            <div className="swa__pf-analysis">
              {formatFutureAnalysisLines(atlas.activeParallelFuture.analysis).map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          ) : null}
          {showParallelFutures && atlas.activeParallelFutureWalk ? (
            <div className="swa__sim-panel">
              <p className="swa__sim-score">FUTURE WALK™</p>
              {atlas.activeParallelFutureWalk.summary}
              {atlas.activeParallelFutureWalk.steps.slice(0, 3).map((step) => (
                <span key={step.order} style={{ display: 'block', opacity: 0.7, marginTop: 4 }}>
                  {step.order}. {step.buildingLabel} — {step.trafficLevel} traffic
                </span>
              ))}
            </div>
          ) : null}
          {showParallelFutures && atlas.parallelFutureCommitPreview ? (
            <div className="swa__pf-commit">
              {commitSummaryLines(atlas.parallelFutureCommitPreview).map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          ) : null}
          {atlas.selectedPlanBudget && (selectedNode.isPlanned || atlas.selectedPlan) && !showParallelFutures ? (
            <div className="swa__budget-line">
              GEN {atlas.selectedPlanBudget.generationCost} · BUILD {atlas.selectedPlanBudget.constructionCost}
              <br />
              BUDGET +{atlas.selectedPlanBudget.budgetImpactPct}% · EQUITY {atlas.selectedPlanBudget.projectedEquity}
              {atlas.selectedPlanBudget.marketplaceValue ? (
                <>
                  <br />
                  MARKETPLACE: {atlas.selectedPlanBudget.marketplaceValue}
                </>
              ) : null}
              <br />
              REUSE: {atlas.selectedPlanBudget.reuseOpportunities}
            </div>
          ) : null}
          {atlas.activeSimulation && selectedNode.planId === atlas.activeSimulation.planId ? (
            <div className="swa__sim-panel">
              <p className="swa__sim-score">SIMULATION {atlas.activeSimulation.placementScore}</p>
              {atlas.activeSimulation.summary}
              <br />
              <span style={{ opacity: 0.65 }}>{atlas.activeSimulation.navigationImpact}</span>
            </div>
          ) : null}
          {selectedMemory ? (
            <div className="swa__memory-block">
              BUILT {new Date(selectedMemory.constructedAt).toLocaleDateString()}
              <br />
              {selectedMemory.reason}
            </div>
          ) : null}
          {!selectedNode.isPlanned && !selectedNode.isConcept ? (
            <>
              {mission.navigationReady ? (
                <p className="swa__travel-preview">{mission.travelPreview.previewLine}</p>
              ) : null}
              <button
                type="button"
                className="swa__travel-btn"
                onClick={() => void handleTravel(selectedNode.id)}
                disabled={traveling || !mission.navigationReady || (selectedNode.fogged && !selectedNode.unlocked)}
              >
                {mission.travelLabels[mission.travelOption]} → {selectedNode.displayName}
              </button>
            </>
          ) : null}
          {plannerSurfacesVisible && showFutureMerge ? (
            <>
              <button
                type="button"
                className="swa__travel-btn is-primary"
                onClick={() => atlas.runFutureMerge()}
              >
                MERGE FUTURES™
              </button>
              <button
                type="button"
                className="swa__travel-btn"
                style={{ marginTop: 4 }}
                onClick={() => atlas.closeMergeLab()}
              >
                EXIT MERGE LAB™
              </button>
            </>
          ) : null}
          {showParallelFutures && !showFutureMerge && atlas.activeParallelFuture ? (
            <>
              <button
                type="button"
                className="swa__travel-btn"
                onClick={() => atlas.walkParallelFuture(atlas.activeParallelFuture!.id)}
              >
                SIMULATE THE FUTURE™
              </button>
              <button
                type="button"
                className="swa__travel-btn is-primary"
                style={{ marginTop: 4 }}
                onClick={() => atlas.approveParallelFuture(atlas.activeParallelFuture!.id)}
                disabled={atlas.discovery.committedFutureId === atlas.activeParallelFuture.id}
              >
                {atlas.discovery.committedFutureId === atlas.activeParallelFuture.id
                  ? 'COMMITTED — AWAITING GENERATION'
                  : 'APPROVE & COMMIT FUTURE →'}
              </button>
            </>
          ) : null}
          {showPlanner && !showParallelFutures && atlas.selectedPlan ? (
            <>
              <button
                type="button"
                className="swa__travel-btn"
                onClick={() => atlas.runSimulation(atlas.selectedPlan!.id)}
              >
                RUN SIMULATION MODE™
              </button>
              <button
                type="button"
                className="swa__travel-btn"
                style={{ marginTop: 4, opacity: 0.85 }}
                onClick={() => atlas.advancePlan(atlas.selectedPlan!.id)}
              >
                ADVANCE PHASE →
              </button>
            </>
          ) : null}
        </aside>
        </PresenceGated>

        {plannerSurfacesVisible && showFutureMerge ? (
          <aside className="swa__pf-comparison swa__merge-lab-panel" aria-label="Merge Lab ingredients">
            <p className="swa__planner-title">MERGE FUTURES™</p>
            {(atlas.discovery.activeMergeRecipe?.ingredients ?? []).map((ing) => (
              <p key={`${ing.label}-${ing.sourceFutureId}`} className="swa__planner-item" style={{ cursor: 'default' }}>
                {ing.label}
                <br />
                <span style={{ opacity: 0.55 }}>← {ing.sourceFutureLabel}</span>
              </p>
            ))}
            <p className="swa__planner-title" style={{ marginTop: 8 }}>
              CONFLICTS ({atlas.mergeConflicts.filter((c) => !c.resolved).length})
            </p>
            {atlas.mergeConflicts.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`swa__pf-row${c.resolved ? ' is-resolved' : ''}`}
                onClick={() => atlas.resolveMergeConflict(c.id)}
                title={c.recommendation}
              >
                {c.severity.toUpperCase()} · {c.kind.replace(/-/g, ' ')}
                <br />
                <span style={{ opacity: 0.7 }}>{c.description.slice(0, 60)}…</span>
              </button>
            ))}
            <p className="swa__planner-title" style={{ marginTop: 8 }}>
              COLLABORATORS
            </p>
            {atlas.mergeCollaborators.map((c) => (
              <p key={c.id} className="swa__planner-item" style={{ cursor: 'default', fontSize: 3 }}>
                {c.name} · {c.role.replace(/-/g, ' ')}
              </p>
            ))}
          </aside>
        ) : showParallelFutures && plannerSurfacesVisible ? (
          <aside className="swa__pf-comparison" aria-label="Parallel Futures comparison">
            <p className="swa__planner-title">SIDE-BY-SIDE COMPARISON™</p>
            {atlas.parallelFuturesComparison.map((row) => (
              <button
                key={row.futureId}
                type="button"
                className={`swa__pf-row${atlas.discovery.activeParallelFutureId === row.futureId ? ' is-active' : ''}`}
                onClick={() => atlas.selectParallelFuture(row.futureId)}
              >
                <strong>{row.label}</strong>
                <br />
                COST {row.buildCost} · {row.timelineMonths} MO
                <br />
                EQUITY {row.creativeEquity} · MKT {row.marketplaceValue}
                <br />
                NAV {row.navigationEfficiency}% · EXP {row.expansionFlexibility}% · REUSE {row.reusableAssetsPct}%
              </button>
            ))}
            <p className="swa__planner-title" style={{ marginTop: 8 }}>
              MASTER PLANNING LIBRARY™
            </p>
            {atlas.discovery.masterPlanningLibrary.slice(0, 6).map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="swa__planner-item"
                onClick={() => atlas.reviveLibraryFuture(entry.id)}
              >
                {entry.label} V{entry.version}
                <br />
                <span style={{ opacity: 0.55 }}>{entry.status.toUpperCase()}</span>
              </button>
            ))}
          </aside>
        ) : null}

        {showPlanner && !showParallelFutures && plannerSurfacesVisible ? (
          <aside className="swa__planner-panel" aria-label="Master Planner reservations">
            <p className="swa__planner-title">RESERVED LAND™</p>
            {atlas.discovery.masterPlan.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className="swa__planner-item"
                onClick={() => {
                  atlas.selectMasterPlan(plan);
                  setSelectedNodeId(`plan-${plan.id}`);
                }}
              >
                {plan.label}
                <br />
                <span style={{ opacity: 0.55 }}>
                  {MASTER_PLAN_PHASE_LABELS[plan.phase ?? 'reserved-land']}
                </span>
              </button>
            ))}
            <p className="swa__planner-title" style={{ marginTop: 8 }}>
              EXPANSION RECOMMENDATIONS™
            </p>
            {atlas.expansionRecommendations.map((rec) => (
              <p key={rec.id} className="swa__planner-item" style={{ cursor: 'default' }}>
                {rec.message}
              </p>
            ))}
          </aside>
        ) : null}

        {plannerSurfacesVisible && showFutureMerge ? (
          <aside className="swa__planner-toolbar" aria-label="Merge Lab tools">
            <p className="swa__planner-toolbar-title">MERGE LAB™</p>
            <p style={{ fontSize: 3, opacity: 0.75, margin: '0 0 6px', lineHeight: 1.4 }}>
              Drag merged buildings · campuses float above the table
            </p>
            <button type="button" className="swa__planner-btn is-primary" onClick={() => atlas.runFutureMerge()}>
              MERGE FUTURES™
            </button>
            <button type="button" className="swa__planner-btn" onClick={() => atlas.closeMergeLab()}>
              EXIT MERGE LAB™
            </button>
            <p className="swa__planner-toolbar-title" style={{ marginTop: 8 }}>
              VISUAL HISTORY™
            </p>
            {atlas.mergeHistory.slice(0, 3).map((entry) => (
              <p key={entry.id} className="swa__planner-item" style={{ cursor: 'default', fontSize: 3 }}>
                {entry.sourceLabels.join(' + ')} → {entry.resultLabel}
              </p>
            ))}
          </aside>
        ) : showParallelFutures && plannerSurfacesVisible ? (
          <aside className="swa__planner-toolbar" aria-label="Parallel Futures tools">
            <p className="swa__planner-toolbar-title">PARALLEL FUTURES™</p>
            {atlas.discovery.parallelFutures.filter((f) => !f.isMerged).map((future) => (
              <button
                key={future.id}
                type="button"
                className={`swa__planner-btn${atlas.discovery.activeParallelFutureId === future.id ? ' is-active' : ''}`}
                onClick={() => atlas.selectParallelFuture(future.id)}
              >
                {future.tagline} · {future.label}
              </button>
            ))}
            <button
              type="button"
              className="swa__planner-btn is-primary"
              style={{ marginTop: 8 }}
              onClick={() => atlas.openMergeLab()}
            >
              MERGE FUTURES™
            </button>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() => atlas.walkParallelFuture()}
            >
              SIMULATE THE FUTURE™
            </button>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() =>
                atlas.forkActiveParallelFuture(
                  `${atlas.activeParallelFuture?.label ?? 'Future'} Fork`
                )
              }
            >
              FORK VISION →
            </button>
          </aside>
        ) : showPlanner && plannerSurfacesVisible ? (
          <aside className="swa__planner-toolbar" aria-label="Master Planner tools">
            <p className="swa__planner-toolbar-title">RESERVE LAND™</p>
            {RESERVE_LAND_PRESETS.slice(0, 4).map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="swa__planner-btn"
                onClick={() => {
                  const plan = atlas.reserveLand(
                    preset.label,
                    preset.category,
                    40 + Math.random() * 20,
                    30 + Math.random() * 25
                  );
                  setSelectedNodeId(`plan-${plan.id}`);
                }}
              >
                + {preset.label}
              </button>
            ))}
            <p className="swa__planner-toolbar-title" style={{ marginTop: 8 }}>
              DISTRICT PLANNING™
            </p>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() => atlas.addDistrictFeature('plaza', 'Central Plaza™', 52, 48)}
            >
              + Plaza
            </button>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() => atlas.addDistrictFeature('transit-hub', 'Transit Hub™', 50, 58)}
            >
              + Transit Hub
            </button>
            <button
              type="button"
              className="swa__planner-btn"
              onClick={() => atlas.addDistrictFeature('skybridge', 'Skybridge™', 45, 35)}
            >
              + Skybridge
            </button>
            {atlas.selectedPlan ? (
              <button
                type="button"
                className="swa__planner-btn"
                onClick={() => atlas.addPlanAmenity(atlas.selectedPlan!.id, 'observation-tower')}
              >
                + Observation Tower
              </button>
            ) : null}
            <p className="swa__planner-toolbar-title" style={{ marginTop: 8 }}>
              WORLD FORECAST™
            </p>
            <div className="swa__forecast-row">
              {FORECAST_HORIZONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`swa__forecast-pill${atlas.discovery.forecastHorizon === y ? ' is-active' : ''}`}
                  onClick={() => atlas.changeForecastHorizon(y)}
                >
                  {forecastHorizonLabel(y)}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 3, opacity: 0.7, margin: '4px 0', lineHeight: 1.4 }}>
              {atlas.worldForecast.buildingCount} buildings · {atlas.worldForecast.districtCount} districts
            </p>
            <button
              type="button"
              className="swa__planner-btn is-primary"
              style={{ marginTop: 6 }}
              onClick={() => atlas.addVisionConcept('Experimental Headquarters™')}
            >
              + FUTURE VISION™ CONCEPT
            </button>
          </aside>
        ) : null}

        <PresenceGated elementId="atlas-orb-projections">
        <aside className="swa__orb" aria-label="Studio Orb world guide">
          <div className="swa__orb-sphere" aria-hidden />
          <p className="swa__orb-title">
            {showFutureMerge
              ? 'STUDIO ORB™ · DESIGN PARTNER'
              : showParallelFutures
              ? 'STUDIO ORB™ · STRATEGIC ADVISOR'
              : showPlanner
                ? 'STUDIO ORB™ · MASTER PLANNER'
                : 'STUDIO ORB™ · MISSION CONTROL'}
          </p>
          {!showPlanner && mission.navigationReady
            ? mission.orbLines.map((line) => (
                <p key={line.id} className="swa__orb-rec is-medium" style={{ cursor: 'default' }}>
                  {line.message}
                </p>
              ))
            : null}
          {!showPlanner && mission.navigationReady
            ? atlas.orbProactiveRecommendations.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  className={`swa__orb-rec is-${rec.priority === 'critical' ? 'high' : rec.priority}`}
                  onClick={() => {
                    if (rec.targetNodeId) {
                      atlas.focusOn(rec.targetNodeId);
                      setSelectedNodeId(rec.targetNodeId);
                    }
                  }}
                  title={rec.reasoning}
                >
                  {rec.title}
                </button>
              ))
            : null}
          {atlas.orbRecommendations.map((rec) => (
            <button
              key={rec.id}
              type="button"
              className={`swa__orb-rec is-${rec.priority}`}
              onClick={() => {
                atlas.focusOn(rec.targetNodeId);
                setSelectedNodeId(rec.targetNodeId);
              }}
            >
              {rec.message}
            </button>
          ))}
        </aside>
        </PresenceGated>

        <div className="swa__table-stage">
          <div className={`swa__table${atlas.view.transitionMs > 800 ? ' is-zooming' : ''} ${mission.modeMapping.tableClass}`}>
            <div className="swa__table-surface">
              <div className="swa__table-glow" aria-hidden />
              {showPlanner ? (
                <div
                  className="swa__expansion-zone"
                  style={{ left: '15%', top: '18%', width: '70%', height: '65%' }}
                  aria-hidden
                />
              ) : null}
              <svg className="swa__roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {roadPaths.map((d, i) => (
                  <path
                    key={`r-${i}`}
                    className={`swa__road${atlas.view.travelingRoads ? ' is-illuminated' : ''}`}
                    d={d}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {atlas.plannerRoadPaths.map((d, i) => (
                  <path
                    key={`p-${i}`}
                    className="swa__road is-potential"
                    d={d}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {atlas.orbJourneyRoadPaths.map((d, i) => (
                  <path
                    key={`j-${i}`}
                    className="swa__road is-orb-journey"
                    d={d}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
              <div className="swa__buildings">
                {atlas.visibleNodes.map((node) => {
                  const signal = resolveOrbSignalForNode(node.id, atlas.orbWorldSignals);
                  return (
                    <BuildingMarker
                      key={node.id}
                      node={node}
                      focusNodeId={selectedNodeId ?? atlas.focusNode.id}
                      onSelect={handleSelect}
                      draggable={showPlanner && !!node.planId}
                      onDrag={atlas.movePlanReservation}
                      mergeDraggable={
                        showFutureMerge &&
                        !!atlas.mergeDraftFuture &&
                        node.parallelFutureId === atlas.mergeDraftFuture.id
                      }
                      onMergeDrag={atlas.moveMergeBuilding}
                      orbSignalKind={signal ? orbSignalClass(signal.kind) : undefined}
                      healthClass={healthByNodeId.get(node.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {mission.navigationReady && !showPlanner ? (
          <PresenceGated elementId="atlas-mode-controls">
          <div className="swa__mode-rail swa__mc-mode-rail" role="tablist" aria-label="Mission Control visualization modes">
            {mission.missionModes.map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={mission.missionMode === mode}
                className={`swa__mode-pill${mission.missionMode === mode ? ' is-active' : ''}`}
                onClick={() => mission.selectMissionMode(mode)}
              >
                {mission.modeLabels[mode]}
              </button>
            ))}
          </div>
          </PresenceGated>
        ) : null}

        {mission.navigationReady && !showPlanner ? (
          <PresenceGated elementId="atlas-travel-controls">
          <div className="swa__travel-rail" role="group" aria-label="Architectural travel mode">
            {mission.travelOptions.map((mode) => (
              <button
                key={mode}
                type="button"
                className={`swa__travel-pill${mission.travelOption === mode ? ' is-active' : ''}`}
                onClick={() => mission.selectTravelOption(mode)}
              >
                {mission.travelLabels[mode]}
              </button>
            ))}
          </div>
          </PresenceGated>
        ) : null}

        <PresenceGated elementId="atlas-fog-legend">
        <p className="swa__fog-legend">
          {showPlanner
            ? `MASTER PLANNER™ · ${atlas.discovery.masterPlan.length} reserved · ${atlas.discovery.futureVisionConcepts.length} vision concepts`
            : `FOG OF DISCOVERY™ · ${atlas.discovery.discoveredNodeIds.length} revealed · ${atlas.discovery.collectibles.length} collectibles`}
        </p>
        </PresenceGated>

        {travelOverlay ? (
          <div
            className={`swa__travel-overlay is-${travelOverlay.cinematicClass}`}
            aria-live="assertive"
          >
            <div className="swa__travel-route" aria-hidden />
            <p className="swa__travel-msg">{travelOverlay.message}</p>
            <p className="swa__travel-collaborators">
              {ATLAS_TRAVEL_LABELS[atlas.view.travelMode]} · ROUTE ILLUMINATED
            </p>
          </div>
        ) : null}
        </AtlasSpatialShell>
      </div>
    </>
  );
}
