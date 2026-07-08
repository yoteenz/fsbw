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

  useEffect(() => {
    document.body.classList.add('cds-v2-active');
    return () => document.body.classList.remove('cds-v2-active');
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

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <style>{CDS_V2_STYLES}</style>
      <div className={`cds-v2${reviewMode ? ' cds-v2--review-mode' : ''}`}>
        <div className="cds-v2__atmosphere" aria-hidden />

        <header className="cds-v2__hud">
          <button type="button" className="cds-v2__back" onClick={exitRoom} aria-label="Exit department">
            ←
          </button>
          <div className="cds-v2__identity">
            <p className="cds-v2__dept">{slice.pkg.definition.displayName}</p>
            <p className="cds-v2__project">{slice.project.name}</p>
          </div>
          <span className="cds-v2__pill">V2 · Living Atelier</span>
        </header>

        <div className="cds-v2__camera">
          <div
            className="cds-v2__camera-track"
            style={{ transform: `translate3d(-${cameraPan}vw, 0, 0)` }}
          >
            {/* Arrival Zone™ */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'arrival' ? ' is-active' : ''}${!arrivalComplete ? '' : ''}`}
              aria-label="Arrival Zone"
            >
              <div className="cds-v2__zone-horizon" aria-hidden />
              <div className="cds-v2__zone-wall" aria-hidden />
              <div
                className="cds-v2__zone-floor"
                style={{
                  background: `linear-gradient(180deg, ${slice.atmosphere.floorTone} 0%, rgba(8,7,6,0.55) 100%)`,
                }}
                aria-hidden
              />
              <div className="cds-v2__arrival-threshold">
                <div className="cds-v2__arrival-arch" aria-hidden />
                <p className="cds-v2__arrival-sign">Creative Direction Studio™</p>
                <p className="cds-v2__arrival-copy">
                  The atelier opens before you — not dumped on screen.
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
            </section>

            {/* Story Table™ + Orb™ */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'story-table' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Story Table"
            >
              <div className="cds-v2__zone-horizon" aria-hidden />
              <div className="cds-v2__zone-wall" aria-hidden />
              <div className="cds-v2__zone-floor" aria-hidden />
              <div className="cds-v2__story-table">
                <div className="cds-v2__orb-anchor">
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
            </section>

            {/* Living Mood Wall™ */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'mood-wall' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Living Mood Wall"
            >
              <div className="cds-v2__zone-horizon" aria-hidden />
              <div className="cds-v2__zone-floor" aria-hidden />
              <div className="cds-v2__mood-wall">
                <p className="cds-v2__mood-wall-label">Living Mood Wall™</p>
                <div className="cds-v2__mood-wall-grid">
                  {moodWall.wall.inspirations.length === 0 ? (
                    <div className="cds-v2__mood-tile" style={{ gridColumn: '1 / -1', aspectRatio: 'auto' }}>
                      Pin inspiration — the wall grows as you work.
                    </div>
                  ) : (
                    moodWall.wall.inspirations.map((item: MoodWallInspiration) => (
                      <div key={item.id} className="cds-v2__mood-tile">
                        <span>{item.title}</span>
                        <button
                          type="button"
                          onClick={() => moodWall.removeInspiration(item.id)}
                          style={{ fontSize: 5, alignSelf: 'flex-start' }}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="cds-v2__mood-add">
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
                    <p style={{ fontSize: 5, marginTop: 4, color: 'rgba(201,169,98,0.9)' }}>
                      AI · {moodWall.wall.aiSuggestions[0].summary}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Founder Notes™ desk */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'founder-notes' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Founder Notes Desk"
            >
              <div className="cds-v2__zone-horizon" aria-hidden />
              <div className="cds-v2__zone-floor" aria-hidden />
              <div className="cds-v2__notes-desk">
                <div className="cds-v2__desk-lamp" aria-hidden />
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
                      <div
                        key={note.id}
                        style={{
                          marginTop: 6,
                          fontSize: 5,
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          paddingTop: 4,
                        }}
                      >
                        <p>{note.body}</p>
                        <button type="button" onClick={() => founderNotes.pinNote(note.id)} style={{ fontSize: 5, marginRight: 6 }}>
                          Pin
                        </button>
                        <button type="button" onClick={() => founderNotes.removeNote(note.id)} style={{ fontSize: 5 }}>
                          Del
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Creative Pipeline™ wall board */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'pipeline-board' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Creative Pipeline Board"
            >
              <div className="cds-v2__zone-horizon" aria-hidden />
              <div className="cds-v2__zone-floor" aria-hidden />
              <div className="cds-v2__pipeline-wall">
                <div className="cds-v2__pipeline-scroll">
                  <CreativePipelineBoard
                    pipeline={pipeline}
                    setDisplayName={slice.pkg.definition.displayName}
                    onReviewModeChange={setReviewMode}
                  />
                </div>
              </div>
            </section>

            {/* Reference Library™ */}
            <section
              className={`cds-v2__zone-panel${activeZoneId === 'reference-library' ? ' is-active' : ''}${!arrivalComplete ? ' is-locked' : ''}`}
              aria-label="Reference Library"
            >
              <div className="cds-v2__zone-horizon" aria-hidden />
              <div className="cds-v2__zone-floor" aria-hidden />
              <p
                style={{
                  position: 'absolute',
                  top: '12%',
                  left: '8%',
                  fontSize: 6,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(201,169,98,0.9)',
                }}
              >
                Reference Library™
              </p>
              <div className="cds-v2__library">
                {libraryVolumes.map((shelf) => (
                  <div key={shelf.label} className="cds-v2__shelf-unit">
                    <p className="cds-v2__shelf-label">{shelf.label}</p>
                    {shelf.items.length === 0 ? (
                      <p className="cds-v2__volume" style={{ opacity: 0.55 }}>
                        Empty shelf — add references at the Mood Wall.
                      </p>
                    ) : (
                      shelf.items.map((item) => (
                        <div key={item.id} className="cds-v2__volume">
                          {item.title}
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
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
