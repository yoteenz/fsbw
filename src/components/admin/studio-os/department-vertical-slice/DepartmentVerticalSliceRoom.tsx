import { useMemo, useState } from 'react';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { zoneLabelForTeaching } from '../../../../studio-os-core/department-room';
import {
  resolveDepartmentOrbAmbientInsight,
  resolveDepartmentOrbGreeting,
} from '../../../../studio-os-core/studio-orb-runtime';
import { useDepartmentVerticalSlice } from '../../../../hooks/useDepartmentVerticalSlice';
import { useCreativeApprovalPipeline } from '../../../../hooks/useCreativeApprovalPipeline';
import { useLivingMoodWall } from '../../../../hooks/useLivingMoodWall';
import { useStudioFounderNotes } from '../../../../hooks/useStudioFounderNotesObject';
import type { WalkableZone } from '../../../../studio-os-core/department-room';
import type { MoodWallInspiration } from '../../../../studio-os-core/studio-objects/living-mood-wall';
import type { FounderNote } from '../../../../studio-os-core/studio-objects/founder-notes';
import { useDepartmentRoomExit } from './DepartmentGoldenBuildShell';
import { CreativeApprovalPipelinePanel } from './CreativeApprovalPipelinePanel';
import { DEPARTMENT_SLICE_STYLES } from './departmentSliceTheme';

type Props = {
  departmentId: string;
};

export function DepartmentVerticalSliceRoom({ departmentId }: Props) {
  const { workspaceId } = useWorkspace();
  const exitRoom = useDepartmentRoomExit();
  const slice = useDepartmentVerticalSlice(departmentId);
  const pipeline = useCreativeApprovalPipeline(departmentId, slice.project.projectId, workspaceId);
  const moodWall = useLivingMoodWall(departmentId, slice.project.projectId);
  const founderNotes = useStudioFounderNotes(departmentId, slice.project.projectId);

  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [reviewMode, setReviewMode] = useState(false);

  const orbCopy = useMemo(
    () => resolveDepartmentOrbGreeting(slice.pkg, slice.project),
    [slice.pkg, slice.project]
  );
  const orbInsight = useMemo(
    () => resolveDepartmentOrbAmbientInsight(slice.pkg, slice.activeZoneId),
    [slice.pkg, slice.activeZoneId]
  );

  const orbReviewSpeech = useMemo(() => {
    const stage = pipeline.activeReviewStage;
    if (!stage?.creativeReview) return null;
    return stage.creativeReview.orbIntro;
  }, [pipeline.activeReviewStage]);

  const zoneTeaching = slice.activeZone ? zoneLabelForTeaching(slice.activeZone) : '';

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <div className={`gb-immersive${reviewMode ? ' gb-immersive--review-mode' : ''}`}>
        <div className="gb-immersive__atmosphere" aria-hidden />

        <header className="gb-immersive__hud">
          <button type="button" className="gb-immersive__back" onClick={exitRoom} aria-label="Exit department">
            ←
          </button>
          <div className="gb-immersive__identity">
            <p className="gb-immersive__dept">{slice.pkg.definition.displayName}</p>
            <p className="gb-immersive__project">{slice.project.name}</p>
          </div>
          <span className="gb-immersive__pill">Golden Build™ · Director&apos;s Workflow</span>
        </header>

        <div className="gb-immersive__scene">
          <div className="gb-immersive__scene-pan">
            <div className="gb-immersive__scene-inner">
              <div className="gb-immersive__env-horizon" aria-hidden />
              <div className="gb-immersive__env-wall" aria-hidden />
              <div
                className="gb-immersive__env-floor"
                style={{
                  background: `linear-gradient(180deg, ${slice.atmosphere.floorTone} 0%, rgba(8,7,6,0.55) 100%)`,
                }}
                aria-hidden
              />

              <div className="gb-immersive__object gb-immersive__object--mood-wall">
                <p className="gb-immersive__object-label">Living Mood Wall™</p>
                <div className="gb-immersive__object-scroll">
                  <input
                    value={refTitle}
                    onChange={(e) => setRefTitle(e.target.value)}
                    placeholder="Title"
                    className="gb-immersive__input"
                  />
                  <input
                    value={refUrl}
                    onChange={(e) => setRefUrl(e.target.value)}
                    placeholder="Reference URL"
                    className="gb-immersive__input"
                  />
                  <button
                    type="button"
                    className="gb-immersive__btn"
                    onClick={() => {
                      if (!refTitle.trim() || !refUrl.trim()) return;
                      moodWall.addInspiration({ title: refTitle.trim(), sourceType: 'reference', url: refUrl.trim() });
                      setRefTitle('');
                      setRefUrl('');
                    }}
                  >
                    Add
                  </button>
                  {moodWall.wall.inspirations.map((item: MoodWallInspiration) => (
                    <div key={item.id} className="gb-immersive__mood-tile">
                      <p>{item.title}</p>
                      <button type="button" onClick={() => moodWall.removeInspiration(item.id)} style={{ fontSize: 5, marginTop: 2 }}>
                        Remove
                      </button>
                    </div>
                  ))}
                  {moodWall.wall.aiSuggestions[0] ? (
                    <p style={{ fontSize: 5, marginTop: 4, color: 'rgba(201,169,98,0.9)' }}>
                      AI · {moodWall.wall.aiSuggestions[0].summary}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="gb-immersive__object gb-immersive__object--notes">
                <p className="gb-immersive__object-label">Founder Notes™</p>
                <div className="gb-immersive__object-scroll">
                  <textarea
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    rows={2}
                    placeholder="Note or decision…"
                    className="gb-immersive__input"
                    style={{ resize: 'none' }}
                  />
                  <div className="gb-immersive__btn-row">
                    <button
                      type="button"
                      className="gb-immersive__btn"
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
                      className="gb-immersive__btn"
                      onClick={() => founderNotes.addNote('Voice placeholder', 'voice')}
                    >
                      Voice
                    </button>
                  </div>
                  {founderNotes.notes.map((note: FounderNote) => (
                    <div key={note.id} style={{ marginTop: 6, fontSize: 5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 4 }}>
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

              {slice.zones.map((zone: WalkableZone) => (
                <button
                  key={zone.id}
                  type="button"
                  className={`gb-immersive__zone${slice.activeZoneId === zone.id ? ' is-active' : ''}`}
                  style={{
                    left: `${50 + zone.position.x * 34}%`,
                    top: `${72 - zone.position.z * 14}%`,
                  }}
                  onClick={() => slice.setActiveZoneId(zone.id)}
                >
                  {zone.displayName.replace(/™/g, '')}
                </button>
              ))}

              <div className="gb-immersive__object gb-immersive__object--orb">
                <div className="gb-immersive__orb-sphere" aria-hidden title="Studio Orb" />
                <p className="gb-immersive__orb-speech">
                  {orbReviewSpeech ? (
                    <>
                      <span style={{ color: 'rgba(201,169,98,0.98)' }}>{orbReviewSpeech}</span>
                    </>
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

              <p className="gb-immersive__teaching">{zoneTeaching}</p>

              <div className="gb-immersive__object gb-immersive__object--console">
                <CreativeApprovalPipelinePanel
                  pipeline={pipeline}
                  setDisplayName={slice.pkg.definition.displayName}
                  onReviewModeChange={setReviewMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
