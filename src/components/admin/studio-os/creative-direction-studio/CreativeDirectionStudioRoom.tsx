import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  resolveDepartmentOrbAmbientInsight,
  resolveDepartmentOrbGreeting,
} from '../../../../studio-os-core/studio-orb-runtime';
import { useDepartmentVerticalSlice } from '../../../../hooks/useDepartmentVerticalSlice';
import { useCreativeApprovalPipeline } from '../../../../hooks/useCreativeApprovalPipeline';
import { useLivingMoodWall } from '../../../../hooks/useLivingMoodWall';
import { useStudioFounderNotes } from '../../../../hooks/useStudioFounderNotesObject';
import type { MoodWallInspiration } from '../../../../studio-os-core/studio-objects/living-mood-wall';
import type { FounderNote } from '../../../../studio-os-core/studio-objects/founder-notes';
import { useDepartmentRoomExit } from '../department-vertical-slice/DepartmentGoldenBuildShell';
import { DEPARTMENT_SLICE_STYLES } from '../department-vertical-slice/departmentSliceTheme';
import { CreativePipelineBoard } from './CreativePipelineBoard';
import { CDS_V2_STYLES } from './creativeDirectionStudioTheme';
import {
  CDS_AMBIENT_MOOD_TILES,
  CDS_LIBRARY_SPINE_DEFAULTS,
  CDS_STORY_PROJECTIONS,
} from './cdsEnvironmentalData';
import { CdsZoneShell } from './CdsZoneShell';
import {
  CDS_CAMERA_ZONES,
  cdsZonePanVw,
  getCdsZone,
  type CdsCameraZoneId,
} from './cameraZones';

const DEPARTMENT_ID = 'creative-direction';

export function CreativeDirectionStudioRoom() {
  const { workspaceId } = useWorkspace();
  const exitRoom = useDepartmentRoomExit();
  const slice = useDepartmentVerticalSlice(DEPARTMENT_ID);
  const pipeline = useCreativeApprovalPipeline(DEPARTMENT_ID, slice.project.projectId, workspaceId);
  const moodWall = useLivingMoodWall(DEPARTMENT_ID, slice.project.projectId);
  const founderNotes = useStudioFounderNotes(DEPARTMENT_ID, slice.project.projectId);

  const [arrivalComplete, setArrivalComplete] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState<CdsCameraZoneId>('arrival');
  const [reviewMode, setReviewMode] = useState(false);
  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [ambientTick, setAmbientTick] = useState(0);

  useEffect(() => {
    document.body.classList.add('cds-v2-active');
    return () => document.body.classList.remove('cds-v2-active');
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setAmbientTick((t) => t + 1), 12000);
    return () => window.clearInterval(id);
  }, []);

  const orbCopy = useMemo(
    () => resolveDepartmentOrbGreeting(slice.pkg, slice.project),
    [slice.pkg, slice.project]
  );
  const orbInsight = useMemo(
    () => resolveDepartmentOrbAmbientInsight(slice.pkg, activeZoneId),
    [slice.pkg, activeZoneId]
  );

  const orbReviewSpeech = useMemo(() => {
    const stage = pipeline.activeReviewStage;
    if (!stage?.creativeReview) return null;
    return stage.creativeReview.orbIntro;
  }, [pipeline.activeReviewStage]);

  const activeZone = useMemo(() => getCdsZone(activeZoneId), [activeZoneId]);
  const cameraPan = cdsZonePanVw(activeZone);

  const visibleNavZones = useMemo(
    () => CDS_CAMERA_ZONES.filter((z) => arrivalComplete || !z.requiresArrival),
    [arrivalComplete]
  );

  const pipelineLive = pipeline.progress.percent > 0 && pipeline.progress.percent < 100;

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
      userItems: items.filter((_, idx) => idx % 4 === i).slice(0, 3),
      defaultSpines: CDS_LIBRARY_SPINE_DEFAULTS[label] ?? [],
    }));
  }, [moodWall.wall.inspirations]);

  const showAmbientMood = moodWall.wall.inspirations.length === 0;

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <style>{CDS_V2_STYLES}</style>
      <div className={`cds-v2${reviewMode ? ' cds-v2--review-mode' : ''}`} data-ambient={ambientTick}>
        <div className="cds-v2__atmosphere" aria-hidden />

        <header className="cds-v2__hud">
          <button type="button" className="cds-v2__back" onClick={exitRoom} aria-label="Exit department">
            ←
          </button>
          <div className="cds-v2__identity">
            <p className="cds-v2__dept">{slice.pkg.definition.displayName}</p>
            <p className="cds-v2__project">{slice.project.name}</p>
          </div>
          <span className="cds-v2__pill">Env Pass V1</span>
        </header>

        <div className="cds-v2__camera">
          <div
            className="cds-v2__camera-track"
            style={{ transform: `translate3d(-${cameraPan}vw, 0, 0)` }}
          >
            {/* Arrival Zone™ — Hero: The Orb™ */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'arrival' ? ' is-active' : ''}`}
              aria-label="Arrival Zone"
            >
              <CdsZoneShell lightTone="rgba(201, 169, 98, 0.2)">
                <div className="cds-v2__arrival-threshold">
                  <div className="cds-v2__arrival-arch" aria-hidden>
                    <div className="cds-v2__arrival-orb-hero">
                      <div className="cds-v2__arrival-orb-glow" aria-hidden />
                      <div className="cds-v2__arrival-orb-ring" aria-hidden />
                      <div className="cds-v2__arrival-orb-sphere" aria-hidden title="Studio Orb" />
                    </div>
                  </div>
                  <p className="cds-v2__arrival-sign">Creative Direction Studio™</p>
                  <p className="cds-v2__arrival-copy">
                    World-class creative decisions happen here.
                    <br />
                    Step forward when ready.
                  </p>
                  {!arrivalComplete ? (
                    <button type="button" className="cds-v2__enter-btn" onClick={completeArrival}>
                      Step Into the Atelier →
                    </button>
                  ) : (
                    <button type="button" className="cds-v2__enter-btn" onClick={() => goToZone('story-table')}>
                      Continue to Story Table →
                    </button>
                  )}
                </div>
                <div className="cds-v2__arrival-peek" aria-hidden />
              </CdsZoneShell>
            </section>

            {/* Story Table™ — Hero: floating creative altar */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'story-table' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Story Table"
            >
              <CdsZoneShell lightTone="rgba(201, 169, 98, 0.16)">
                <div className="cds-v2__story-table">
                  <div className="cds-v2__orb-anchor">
                    <div className="cds-v2__orb-spotlight" aria-hidden />
                    <div className="cds-v2__orb-sphere" aria-hidden title="Studio Orb" />
                    <p className="cds-v2__orb-speech">
                      {orbReviewSpeech ? (
                        <span style={{ color: 'rgba(201,169,98,0.98)' }}>{orbReviewSpeech}</span>
                      ) : (
                        <>
                          {orbCopy.greeting}
                          <br />
                          <span style={{ opacity: 0.75 }}>{orbCopy.guidance}</span>
                          <br />
                          <span style={{ color: 'rgba(201,169,98,0.95)' }}>{orbInsight}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="cds-v2__table-projections" aria-hidden>
                    {CDS_STORY_PROJECTIONS.map((label, i) => (
                      <span
                        key={label}
                        className="cds-v2__table-projection"
                        style={{ '--p-i': i } as React.CSSProperties}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="cds-v2__table-float" aria-hidden />
                  <div className="cds-v2__table-surface">
                    <div className="cds-v2__table-chips">
                      <span className="cds-v2__table-chip">
                        {slice.project.activeBranchName ?? 'Main Direction'}
                      </span>
                      {slice.project.tone.slice(0, 2).map((t) => (
                        <span key={t} className="cds-v2__table-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CdsZoneShell>
            </section>

            {/* Living Mood Wall™ — Hero: editorial wall */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'mood-wall' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Living Mood Wall"
            >
              <CdsZoneShell lightTone="rgba(180, 150, 100, 0.14)">
                <div className="cds-v2__mood-wall">
                  <div className="cds-v2__mood-wall-frame">
                    <div className="cds-v2__mood-wall-header">
                      <p className="cds-v2__mood-wall-label">Living Mood Wall™</p>
                      <span className="cds-v2__mood-wall-scale">Editorial · 30ft</span>
                    </div>
                    <div className="cds-v2__mood-wall-grid">
                      {showAmbientMood
                        ? CDS_AMBIENT_MOOD_TILES.map((tile, i) => (
                            <div
                              key={tile.id}
                              className="cds-v2__mood-tile cds-v2__mood-tile--ambient"
                              style={
                                {
                                  '--tile-i': i,
                                  '--tile-accent': tile.accent,
                                } as React.CSSProperties
                              }
                            >
                              <span className="cds-v2__mood-tile-cat">{tile.category}</span>
                              <span className="cds-v2__mood-tile-title">{tile.title}</span>
                            </div>
                          ))
                        : moodWall.wall.inspirations.map((item: MoodWallInspiration, i) => (
                            <div
                              key={item.id}
                              className="cds-v2__mood-tile cds-v2__mood-tile--user"
                              style={{ '--tile-i': i } as React.CSSProperties}
                            >
                              <span className="cds-v2__mood-tile-title">{item.title}</span>
                              <button
                                type="button"
                                className="cds-v2__mood-tile-remove"
                                onClick={() => moodWall.removeInspiration(item.id)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="cds-v2__mood-console">
                    <span className="cds-v2__mood-console-label">Pin to wall</span>
                    <input
                      value={refTitle}
                      onChange={(e) => setRefTitle(e.target.value)}
                      placeholder="Title"
                      className="cds-v2__input"
                    />
                    <input
                      value={refUrl}
                      onChange={(e) => setRefUrl(e.target.value)}
                      placeholder="Reference URL"
                      className="cds-v2__input"
                    />
                    <button
                      type="button"
                      className="cds-v2__btn"
                      onClick={() => {
                        if (!refTitle.trim() || !refUrl.trim()) return;
                        moodWall.addInspiration({ title: refTitle.trim(), sourceType: 'reference', url: refUrl.trim() });
                        setRefTitle('');
                        setRefUrl('');
                      }}
                    >
                      Pin to Wall
                    </button>
                    {moodWall.wall.aiSuggestions[0] ? (
                      <p style={{ fontSize: 5, marginTop: 4, color: 'rgba(201,169,98,0.85)' }}>
                        AI · {moodWall.wall.aiSuggestions[0].summary}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CdsZoneShell>
            </section>

            {/* Founder Notes™ — Hero: executive desk */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'founder-notes' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Founder Notes Desk"
            >
              <CdsZoneShell lightTone="rgba(255, 220, 160, 0.1)">
                <div className="cds-v2__notes-desk">
                  <div className="cds-v2__desk-scene">
                    <div className="cds-v2__desk-lamp" aria-hidden>
                      <div className="cds-v2__desk-lamp-shade" />
                      <div className="cds-v2__desk-lamp-beam" />
                    </div>
                    <div className="cds-v2__desk-props" aria-hidden>
                      <div className="cds-v2__desk-prop-coffee" title="Coffee" />
                      <div className="cds-v2__desk-prop-tablet" title="Glass tablet" />
                      <div className="cds-v2__desk-prop-recorder" title="Voice recorder" />
                    </div>
                    <div className="cds-v2__desk-notebook" aria-hidden />
                    <div className="cds-v2__desk-surface">
                      <p className="cds-v2__desk-label">Founder Notes™</p>
                      <textarea
                        value={noteBody}
                        onChange={(e) => setNoteBody(e.target.value)}
                        rows={2}
                        placeholder="Note or decision…"
                        className="cds-v2__input"
                        style={{ resize: 'none' }}
                      />
                      <div className="cds-v2__btn-row">
                        <button
                          type="button"
                          className="cds-v2__btn"
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
                          className="cds-v2__btn"
                          onClick={() => founderNotes.addNote('Voice placeholder', 'voice')}
                        >
                          Voice
                        </button>
                      </div>
                      <div className="cds-v2__desk-scroll">
                        {founderNotes.notes.map((note: FounderNote) => (
                          <div key={note.id} className="cds-v2__desk-note-row">
                            <p>{note.body}</p>
                            <div className="cds-v2__desk-note-actions">
                              <button type="button" onClick={() => founderNotes.pinNote(note.id)}>
                                Pin
                              </button>
                              <button type="button" onClick={() => founderNotes.removeNote(note.id)}>
                                Del
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CdsZoneShell>
            </section>

            {/* Creative Pipeline™ — Hero: mission control wall */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'pipeline-board' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Creative Pipeline Board"
            >
              <CdsZoneShell lightTone="rgba(120, 200, 140, 0.08)">
                <div className="cds-v2__pipeline-wall">
                  <div className="cds-v2__pipeline-frame">
                    <div className="cds-v2__pipeline-status-lights" aria-hidden>
                      <span className={`cds-v2__pipeline-light${pipelineLive ? ' is-live' : ''}`} />
                      <span className={`cds-v2__pipeline-light${pipeline.progress.percent === 100 ? ' is-live' : ''}`} />
                      <span className="cds-v2__pipeline-light" />
                    </div>
                    <div className="cds-v2__pipeline-scroll">
                      <CreativePipelineBoard
                        pipeline={pipeline}
                        setDisplayName={slice.pkg.definition.displayName}
                        onReviewModeChange={setReviewMode}
                      />
                    </div>
                  </div>
                </div>
              </CdsZoneShell>
            </section>

            {/* Reference Library™ — Hero: luxury archive */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'reference-library' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Reference Library"
            >
              <CdsZoneShell lightTone="rgba(160, 140, 110, 0.1)">
                <div className="cds-v2__library-zone">
                  <p className="cds-v2__library-header">Reference Library™</p>
                  <div className="cds-v2__library">
                    {libraryVolumes.map((shelf) => (
                      <div key={shelf.label} className="cds-v2__shelf-unit">
                        <p className="cds-v2__shelf-label">{shelf.label}</p>
                        <div className="cds-v2__shelf-drawer">
                          {shelf.userItems.length === 0
                            ? shelf.defaultSpines.map((spine) => (
                                <div
                                  key={spine.id}
                                  className="cds-v2__volume-spine"
                                  style={{ '--spine-tone': spine.tone } as React.CSSProperties}
                                >
                                  {spine.title}
                                </div>
                              ))
                            : shelf.userItems.map((item) => (
                                <div key={item.id} className="cds-v2__volume-spine cds-v2__volume-spine--user">
                                  {item.title}
                                </div>
                              ))}
                          {shelf.userItems.length === 0 && shelf.defaultSpines.length === 0 ? (
                            <p className="cds-v2__shelf-empty">Empty shelf — add references at the Mood Wall.</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CdsZoneShell>
            </section>
          </div>
        </div>

        <p className="cds-v2__teaching">{activeZone.teaching}</p>

        <nav className="cds-v2__nav" aria-label="Department zones">
          {visibleNavZones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`cds-v2__nav-btn${activeZoneId === zone.id ? ' is-active' : ''}`}
              onClick={() => goToZone(zone.id)}
              disabled={zone.requiresArrival && !arrivalComplete}
            >
              {zone.shortLabel}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
