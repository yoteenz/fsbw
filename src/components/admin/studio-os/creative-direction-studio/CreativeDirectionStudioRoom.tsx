import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  resolveDepartmentOrbAmbientInsight,
  resolveDepartmentOrbGreeting,
} from '../../../../studio-os-core/studio-orb-runtime';
import { useDepartmentVerticalSlice } from '../../../../hooks/useDepartmentVerticalSlice';
import { useCreativeApprovalPipeline } from '../../../../hooks/useCreativeApprovalPipeline';
import { useLivingMoodWall } from '../../../../hooks/useLivingMoodWall';
import { useStudioFounderNotes } from '../../../../hooks/useStudioFounderNotesObject';
import { useSceneStack } from '../../../../hooks/useSceneStack';
import type { SceneStackHotspotBounds, SceneStackLayerId } from '../../../../studio-os-core/scene-stack';
import type { MoodWallInspiration } from '../../../../studio-os-core/studio-objects/living-mood-wall';
import type { FounderNote } from '../../../../studio-os-core/studio-objects/founder-notes';
import { getSceneStackStation } from '../../../../studio-os-core/scene-stack';
import { useDepartmentRoomExit } from '../department-vertical-slice/DepartmentGoldenBuildShell';
import { DEPARTMENT_SLICE_STYLES } from '../department-vertical-slice/departmentSliceTheme';
import { CreativePipelineBoard } from './CreativePipelineBoard';
import { SceneStackViewport } from './SceneStackViewport';
import { StoryTableSurface } from './StoryTableSurface';
import { ReviewChamberSurface } from './ReviewChamberSurface';
import { StudioOrbHost } from './StudioOrbHost';
import { CDS_GENESIS_INTERACTION_STYLES } from './cdsInteractionLayerTheme';
import { CDS_IMMERSION_STYLES } from './cdsImmersionTheme';
import { useCdsImmersion } from '../../../../hooks/useCdsImmersion';
import { useCreativeUniversalPipeline } from '../../../../hooks/useCreativeUniversalPipeline';
import { useStudioAlphaCost } from '../../../../hooks/useStudioAlphaCost';
import { StudioAlphaCostHud } from '../studio-alpha-cost/StudioAlphaCostHud';
import { SceneTray, STUDIO_NAVIGATION_STYLES, type SceneTrayEntry } from '../../studio/navigation';
import {
  CDS_CAMERA_ZONES,
  cdsZonePanVw,
  getCdsZone,
  type CdsCameraZoneId,
} from './cameraZones';

const DEPARTMENT_ID = 'creative-direction';

function hotspotStyle(bounds: SceneStackHotspotBounds): CSSProperties {
  return {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  };
}

export function CreativeDirectionStudioRoom() {
  const { workspaceId } = useWorkspace();
  const exitRoom = useDepartmentRoomExit();
  const slice = useDepartmentVerticalSlice(DEPARTMENT_ID);
  const stack = useSceneStack(DEPARTMENT_ID, slice.project.projectId, workspaceId);
  const pipeline = useCreativeApprovalPipeline(DEPARTMENT_ID, slice.project.projectId, workspaceId);
  const universal = useCreativeUniversalPipeline(DEPARTMENT_ID, slice.project.projectId);
  const moodWall = useLivingMoodWall(DEPARTMENT_ID, slice.project.projectId);
  const founderNotes = useStudioFounderNotes(DEPARTMENT_ID, slice.project.projectId);

  const [arrivalComplete, setArrivalComplete] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState<CdsCameraZoneId>('arrival');
  const [reviewMode, setReviewMode] = useState(false);
  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [noteBody, setNoteBody] = useState('');

  useEffect(() => {
    document.body.classList.add('cds-stack-active');
    document.body.classList.remove('cds-v2-active', 'cds-genesis-active');
    return () => {
      document.body.classList.remove('cds-stack-active');
    };
  }, []);

  const orbCopy = useMemo(
    () => resolveDepartmentOrbGreeting(slice.pkg, slice.project),
    [slice.pkg, slice.project]
  );
  const orbInsight = useMemo(() => {
    const creativeLine = universal.orbPrimaryLine;
    if (creativeLine && (activeZoneId === 'story-table' || activeZoneId === 'review-chamber')) return creativeLine;
    return resolveDepartmentOrbAmbientInsight(slice.pkg, activeZoneId) ?? '';
  }, [slice.pkg, activeZoneId, universal.orbPrimaryLine]);

  useEffect(() => {
    if (universal.pipeline.reviewChamberActive) {
      setActiveZoneId('review-chamber');
    }
  }, [universal.pipeline.reviewChamberActive]);

  const orbReviewSpeech = useMemo(() => {
    const stage = pipeline.activeReviewStage;
    if (!stage?.creativeReview) return null;
    return stage.creativeReview.orbIntro;
  }, [pipeline.activeReviewStage]);

  const activeZone = useMemo(() => getCdsZone(activeZoneId), [activeZoneId]);
  const cameraPan = cdsZonePanVw(activeZone);
  const stationSpec = useMemo(
    () => getSceneStackStation(DEPARTMENT_ID, activeZoneId),
    [activeZoneId]
  );
  const activeLayers = useMemo(
    () => stack.getLayerViews(activeZoneId),
    [stack, activeZoneId]
  );
  const compositeStatus = useMemo(
    () => stack.getCompositeStatus(activeZoneId),
    [stack, activeZoneId]
  );
  const activePipeline = useMemo(
    () => stack.getStationPipelineProgress(activeZoneId),
    [stack, activeZoneId]
  );
  const stackButtonBusy = stack.isStationPipelineActive(activeZoneId);
  const immersion = useCdsImmersion(true, stack.isAnyPipelineActive);

  const costSnapshot = useStudioAlphaCost({
    departmentId: DEPARTMENT_ID,
    projectId: slice.project.projectId,
    sceneId: activeZoneId,
    departmentDisplayName: slice.pkg.definition.displayName,
    sceneDisplayName: activeZone.label,
    layersComplete: activePipeline.layersComplete,
    layersTotal: activePipeline.layersTotal,
    pipelinePhase: activePipeline.phase,
    currentLayerId: activePipeline.currentLayerId,
    currentLayerLabel: activePipeline.currentLayerLabel,
  });

  const pipelineProgressPct = useMemo(() => {
    if (!activePipeline.layersTotal) return 0;
    return Math.round((activePipeline.layersComplete / activePipeline.layersTotal) * 100);
  }, [activePipeline]);

  const visibleNavZones = useMemo(
    () => CDS_CAMERA_ZONES.filter((z) => arrivalComplete || !z.requiresArrival),
    [arrivalComplete]
  );

  const sceneTrayEntries = useMemo(
    (): SceneTrayEntry[] =>
      visibleNavZones.map((zone) => ({
        id: zone.id,
        label: zone.label,
        shortLabel: zone.shortLabel,
        locked: zone.requiresArrival && !arrivalComplete,
      })),
    [arrivalComplete, visibleNavZones]
  );

  const goToZone = useCallback(
    (zoneId: CdsCameraZoneId) => {
      const zone = getCdsZone(zoneId);
      if (zone.requiresArrival && !arrivalComplete) return;
      setActiveZoneId(zoneId);
    },
    [arrivalComplete]
  );

  const completeArrival = useCallback(() => {
    setArrivalComplete(true);
    setActiveZoneId('story-table');
  }, []);

  const libraryVolumes = useMemo(() => {
    const items = moodWall.wall.inspirations;
    const shelves = ['Editorial', 'Luxury', 'Motion', 'Packaging'] as const;
    return shelves.map((label, i) => ({
      label,
      items: items.filter((_, idx) => idx % 4 === i).slice(0, 3),
    }));
  }, [moodWall.wall.inspirations]);

  const renderZoneInteractions = (zoneId: CdsCameraZoneId) => {
    const spec = getSceneStackStation(DEPARTMENT_ID, zoneId);
    const hotspots = spec?.hotspots ?? {};

    switch (zoneId) {
      case 'arrival':
        return (
          <div
            className="cds-genesis__hotspot cds-genesis__hotspot--ghost"
            style={hotspotStyle(hotspots.enter ?? { left: '28%', top: '62%', width: '44%', height: '12%' })}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {!arrivalComplete ? (
                <button type="button" className="cds-genesis__enter-btn" onClick={completeArrival}>
                  Step Into the Atelier →
                </button>
              ) : (
                <button type="button" className="cds-genesis__enter-btn" onClick={() => goToZone('story-table')}>
                  Continue to Story Table →
                </button>
              )}
            </div>
          </div>
        );

      case 'story-table':
        return (
          <>
            <div
              className="cds-genesis__hotspot cds-genesis__hotspot--ghost"
              style={hotspotStyle(hotspots.orb ?? { left: '35%', top: '8%', width: '30%', height: '18%' })}
            >
              <StudioOrbHost
                greeting={orbCopy.greeting}
                guidance={orbCopy.guidance}
                insight={orbInsight ?? ''}
                reviewSpeech={orbReviewSpeech}
                pipelineActive={stackButtonBusy}
                pipelineLayerLabel={activePipeline.currentLayerLabel}
                pipelineProgress={pipelineProgressPct}
              />
            </div>
            <div
              className="cds-genesis__hotspot cds-genesis__hotspot--ghost"
              style={hotspotStyle(hotspots.table ?? { left: '10%', top: '42%', width: '80%', height: '28%' })}
            >
              <StoryTableSurface
                project={slice.project}
                pipeline={pipeline}
                universal={universal}
                pipelineProgress={activePipeline}
                stackBusy={stackButtonBusy}
                moodPins={moodWall.wall.inspirations}
              />
            </div>
          </>
        );

      case 'review-chamber':
        return (
          <>
            <div
              className="cds-genesis__hotspot cds-genesis__hotspot--ghost"
              style={hotspotStyle(hotspots.orb ?? { left: '30%', top: '6%', width: '40%', height: '16%' })}
            >
              <StudioOrbHost
                greeting="Chairman of the Review Board™"
                guidance="Inspect finalists · compare tradeoffs · you retain final authority."
                insight={orbInsight ?? ''}
                pipelineActive={false}
              />
            </div>
            <div
              className="cds-genesis__hotspot cds-genesis__hotspot--ghost cds-review-chamber__embed"
              style={hotspotStyle({ left: '4%', top: '18%', width: '92%', height: '72%' })}
            >
              <ReviewChamberSurface universal={universal} />
            </div>
          </>
        );

      case 'mood-wall':
        return (
          <div
            className="cds-genesis__hotspot cds-diegetic__wall-embed"
            style={hotspotStyle(hotspots.console ?? { left: '6%', top: '66%', width: '88%', height: '22%' })}
          >
            <p className="cds-genesis__label">Pin to Living Mood Wall™</p>
            <div className="cds-genesis__mood-grid" style={{ marginBottom: 6 }}>
              {moodWall.wall.inspirations.map((item: MoodWallInspiration) => (
                <div key={item.id} className="cds-genesis__mood-tile">
                  <span>{item.title}</span>
                  <button
                    type="button"
                    onClick={() => moodWall.removeInspiration(item.id)}
                    style={{ fontSize: 4, marginTop: 3, background: 'none', border: 'none', color: 'rgba(201,169,98,0.7)' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <input
              value={refTitle}
              onChange={(e) => setRefTitle(e.target.value)}
              placeholder="Title"
              className="cds-genesis__input"
            />
            <input
              value={refUrl}
              onChange={(e) => setRefUrl(e.target.value)}
              placeholder="Reference URL"
              className="cds-genesis__input"
              style={{ marginTop: 4 }}
            />
            <button
              type="button"
              className="cds-genesis__btn"
              style={{ marginTop: 4 }}
              onClick={() => {
                if (!refTitle.trim() || !refUrl.trim()) return;
                moodWall.addInspiration({ title: refTitle.trim(), sourceType: 'reference', url: refUrl.trim() });
                setRefTitle('');
                setRefUrl('');
              }}
            >
              Pin to Wall
            </button>
          </div>
        );

      case 'founder-notes':
        return (
          <div
            className="cds-genesis__hotspot cds-diegetic__desk-embed"
            style={hotspotStyle(hotspots.desk ?? { left: '8%', top: '32%', width: '84%', height: '48%' })}
          >
            <p className="cds-genesis__label">Founder Notes™</p>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={2}
              placeholder="Note or decision…"
              className="cds-genesis__input"
              style={{ resize: 'none' }}
            />
            <div className="cds-genesis__btn-row">
              <button
                type="button"
                className="cds-genesis__btn"
                onClick={() => {
                  if (!noteBody.trim()) return;
                  founderNotes.addNote(noteBody.trim(), 'text');
                  setNoteBody('');
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="cds-genesis__btn"
                onClick={() => founderNotes.addNote('Voice placeholder', 'voice')}
              >
                Voice
              </button>
            </div>
            <div className="cds-genesis__desk-scroll">
              {founderNotes.notes.map((note: FounderNote) => (
                <div key={note.id} className="cds-genesis__shelf-row">
                  <p>{note.body}</p>
                  <button type="button" onClick={() => founderNotes.pinNote(note.id)} style={{ fontSize: 4, marginRight: 6 }}>
                    Pin
                  </button>
                  <button type="button" onClick={() => founderNotes.removeNote(note.id)} style={{ fontSize: 4 }}>
                    Del
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pipeline-board':
        return (
          <div
            className="cds-genesis__hotspot cds-diegetic__wall-embed"
            style={hotspotStyle(hotspots.wall ?? { left: '4%', top: '8%', width: '92%', height: '78%' })}
          >
            <div className="cds-genesis__pipeline-scroll">
              <CreativePipelineBoard
                pipeline={pipeline}
                setDisplayName={slice.pkg.definition.displayName}
                conceptApproved={universal.conceptApproved}
                universalPhaseLabel={universal.phaseLabel}
                onReviewModeChange={setReviewMode}
              />
            </div>
          </div>
        );

      case 'reference-library':
        return (
          <div
            className="cds-genesis__hotspot cds-diegetic__shelf-embed"
            style={hotspotStyle(hotspots.shelves ?? { left: '6%', top: '12%', width: '88%', height: '68%' })}
          >
            <p className="cds-genesis__label">Reference Library™</p>
            <div className="cds-genesis__library-scroll">
              {libraryVolumes.map((shelf) => (
                <div key={shelf.label} style={{ marginBottom: 8 }}>
                  <p className="cds-genesis__label" style={{ marginBottom: 4 }}>
                    {shelf.label}
                  </p>
                  {shelf.items.length === 0 ? (
                    <p style={{ fontSize: 5, opacity: 0.45 }}>Shelf draws from Mood Wall pins.</p>
                  ) : (
                    shelf.items.map((item) => (
                      <div key={item.id} className="cds-genesis__shelf-row">
                        {item.title}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <style>{CDS_GENESIS_INTERACTION_STYLES}</style>
      <style>{CDS_IMMERSION_STYLES}</style>
      <style>{STUDIO_NAVIGATION_STYLES}</style>
      <StudioAlphaCostHud snapshot={costSnapshot} />
      <div
        className={`cds-stack${reviewMode ? ' cds-genesis--review-mode' : ''}`}
        onPointerMove={immersion.onPointerMove}
        style={immersion.parallaxStyle}
      >
        <header className="cds-genesis__hud">
          <button type="button" className="cds-genesis__back" onClick={exitRoom} aria-label="Exit department">
            ←
          </button>
          <div className="cds-genesis__identity">
            <p className="cds-genesis__dept">{slice.pkg.definition.displayName}</p>
            <p className="cds-genesis__project">{slice.project.name}</p>
          </div>
          <button
            type="button"
            className={`cds-genesis__pill cds-genesis__pill-btn cds-genesis__stack-btn${stackButtonBusy ? ' is-building' : ''}`}
            onClick={() => void stack.ensureStation(activeZoneId)}
            disabled={stackButtonBusy}
            title="Golden Build™ Scene Stack™ — builds missing layers for this zone"
            aria-busy={stackButtonBusy}
          >
            {stackButtonBusy ? (
              <>
                <span className="cds-genesis__stack-spinner" aria-hidden />
                {activePipeline.currentLayerLabel
                  ? `${activePipeline.currentLayerLabel} ${activePipeline.layersComplete + 1}/${activePipeline.layersTotal}`
                  : `Building ${activePipeline.layersComplete}/${activePipeline.layersTotal}`}
              </>
            ) : (
              `Stack ${stack.readyStationCount}/${stack.totalStationCount}`
            )}
          </button>
        </header>

        <div className="cds-genesis__camera">
          <div
            className="cds-genesis__camera-track"
            style={{ transform: `translate3d(-${cameraPan}vw, 0, 0)` }}
          >
            {CDS_CAMERA_ZONES.map((zone) => {
              const locked = zone.requiresArrival && !arrivalComplete;
              const stackZoneId: CdsCameraZoneId =
                zone.id === 'review-chamber' ? 'story-table' : zone.id;
              const zoneLayers = stack.getLayerViews(stackZoneId);
              return (
                <section
                  key={zone.id}
                  className={`cds-genesis__zone-panel${activeZoneId === zone.id ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                  aria-label={zone.label}
                >
                  <SceneStackViewport
                    layers={zoneLayers}
                    status={stack.getCompositeStatus(stackZoneId)}
                    stationLabel={zone.label}
                    immersiveProfile={
                      zone.id === 'story-table' || zone.id === 'review-chamber' ? 'story-table' : 'default'
                    }
                    parallaxStyle={zone.id === activeZoneId ? immersion.parallaxStyle : undefined}
                    pipeline={
                      zone.id === activeZoneId ? stack.getStationPipelineProgress(zone.id) : undefined
                    }
                    sceneGraph={
                      zone.id === activeZoneId ? stack.getStationSceneGraph(stackZoneId) : undefined
                    }
                    debugView={stack.debugView}
                    onDebugToggle={stack.toggleDebugView}
                    onDebugLayerToggle={stack.toggleDebugViewLayer}
                    compilationHeadline={
                      zone.id === activeZoneId
                        ? stack.getStationCompileReport(stackZoneId)?.headline
                        : undefined
                    }
                    sceneIntegrityPct={
                      zone.id === activeZoneId
                        ? stack.getStationCompileReport(stackZoneId)?.sceneIntegrityPct
                        : undefined
                    }
                    onRegenerateLayer={(layerId) =>
                      void stack.regenerateLayer(zone.id, layerId as SceneStackLayerId)
                    }
                  />
                  <div className="cds-genesis__interaction-layer">{renderZoneInteractions(zone.id)}</div>
                </section>
              );
            })}
          </div>
        </div>

        <p className="cds-genesis__teaching">
          {activeZone.teaching}
          {stationSpec?.signatureLandmarkId ? ' · Signature Landmark™' : ''}
          {stackButtonBusy ? (
            <>
              {' · Scene Stack™ '}
              {activePipeline.currentLayerLabel
                ? `generating ${activePipeline.currentLayerLabel} (${activePipeline.layersComplete}/${activePipeline.layersTotal})`
                : `building (${activePipeline.layersComplete}/${activePipeline.layersTotal})`}
            </>
          ) : compositeStatus === 'partial' ? (
            ` · ${activeLayers.filter((l) => l.publicUrl).length} layers composed`
          ) : (
            ''
          )}
        </p>

        <SceneTray
          entries={sceneTrayEntries}
          activeId={activeZoneId}
          onSelect={(id) => goToZone(id as CdsCameraZoneId)}
          ariaLabel="Creative Direction Studio scenes and workspaces"
          className="cds-genesis__nav"
        />
      </div>
    </>
  );
}
