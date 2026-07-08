import { useMemo, useState } from 'react';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { zoneLabelForTeaching } from '../../../../studio-os-core/department-room';
import {
  resolveDepartmentOrbAmbientInsight,
  resolveDepartmentOrbGreeting,
} from '../../../../studio-os-core/studio-orb-runtime';
import { useDepartmentVerticalSlice } from '../../../../hooks/useDepartmentVerticalSlice';
import { useStudioBuilderQueue } from '../../../../hooks/useStudioBuilderQueue';
import { useLivingMoodWall } from '../../../../hooks/useLivingMoodWall';
import { useStudioFounderNotes } from '../../../../hooks/useStudioFounderNotesObject';
import type { GenerationQueueItem } from '../../../../studio-os-core/studio-builder';
import type { WalkableZone } from '../../../../studio-os-core/department-room';
import type { MoodWallInspiration } from '../../../../studio-os-core/studio-objects/living-mood-wall';
import type { FounderNote } from '../../../../studio-os-core/studio-objects/founder-notes';
import { DEPARTMENT_SLICE_STYLES } from './departmentSliceTheme';

type Props = {
  departmentId: string;
};

const STATUS_LABEL: Record<string, string> = {
  queued: 'Queued',
  generating: 'Generating…',
  validating: 'Validating…',
  complete: 'Complete',
  failed: 'Failed',
};

export function DepartmentVerticalSliceRoom({ departmentId }: Props) {
  const { workspaceId } = useWorkspace();
  const slice = useDepartmentVerticalSlice(departmentId);
  const queue = useStudioBuilderQueue(departmentId, slice.project.projectId, workspaceId);
  const moodWall = useLivingMoodWall(departmentId, slice.project.projectId);
  const founderNotes = useStudioFounderNotes(departmentId, slice.project.projectId);

  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const orbCopy = useMemo(
    () => resolveDepartmentOrbGreeting(slice.pkg, slice.project),
    [slice.pkg, slice.project]
  );
  const orbInsight = useMemo(
    () => resolveDepartmentOrbAmbientInsight(slice.pkg, slice.activeZoneId),
    [slice.pkg, slice.activeZoneId]
  );

  const environmentItem = queue.items.find((i: GenerationQueueItem) => i.productionGroupId === 'environment');
  const isGenerating = environmentItem?.status === 'generating' || environmentItem?.status === 'validating';

  const onGenerateEnvironment = async () => {
    setShowPreview(false);
    await queue.generateProductionGroup('environment');
  };

  const zoneTeaching = slice.activeZone ? zoneLabelForTeaching(slice.activeZone) : '';

  const moodWallSection = (
    <section className="gb-room__mood-wall" aria-label="Living Mood Wall">
      <p className="gb-room__label">Living Mood Wall™</p>
      <input
        value={refTitle}
        onChange={(e) => setRefTitle(e.target.value)}
        placeholder="Inspiration title"
        className="gb-room__input"
      />
      <input
        value={refUrl}
        onChange={(e) => setRefUrl(e.target.value)}
        placeholder="URL or reference"
        className="gb-room__input"
      />
      <button
        type="button"
        className="gb-room__btn gb-room__btn--block"
        onClick={() => {
          if (!refTitle.trim() || !refUrl.trim()) return;
          moodWall.addInspiration({ title: refTitle.trim(), sourceType: 'reference', url: refUrl.trim() });
          setRefTitle('');
          setRefUrl('');
        }}
      >
        Add Inspiration
      </button>
      {moodWall.wall.inspirations.map((item: MoodWallInspiration) => (
        <div key={item.id} className="gb-room__mood-tile">
          <p style={{ fontSize: '8px' }}>{item.title}</p>
          <p style={{ fontSize: '6px', opacity: 0.6, wordBreak: 'break-all' }}>{item.url}</p>
          <button type="button" onClick={() => moodWall.removeInspiration(item.id)} style={{ fontSize: '6px', marginTop: 4 }}>
            Delete
          </button>
        </div>
      ))}
      {moodWall.wall.aiSuggestions[0] ? (
        <div style={{ marginTop: 8, fontSize: '7px', opacity: 0.85 }}>
          <p style={{ color: 'rgba(201,169,98,0.95)' }}>AI · {moodWall.wall.aiSuggestions[0].summary}</p>
          <ul style={{ paddingLeft: 12, marginTop: 4 }}>
            {moodWall.wall.aiSuggestions[0].concepts.map((c: string) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );

  const notesSection = (
    <section className="gb-room__notes-rail" aria-label="Founder Notes">
      <p className="gb-room__label">Founder Notes™</p>
      <textarea
        value={noteBody}
        onChange={(e) => setNoteBody(e.target.value)}
        rows={2}
        placeholder="Quick note, decision, or reminder…"
        className="gb-room__input"
        style={{ resize: 'vertical', minHeight: 48 }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
        <button
          type="button"
          className="gb-room__btn"
          onClick={() => {
            if (!noteBody.trim()) return;
            founderNotes.addNote(noteBody.trim(), 'text');
            setNoteBody('');
          }}
        >
          Save Note
        </button>
        <button
          type="button"
          className="gb-room__btn"
          onClick={() => founderNotes.addNote('Voice note placeholder — record in Sprint 002', 'voice')}
        >
          Voice Placeholder
        </button>
      </div>
      {founderNotes.notes.map((note: FounderNote) => (
        <div key={note.id} style={{ marginTop: 8, fontSize: '7px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
          <p>{note.body}</p>
          <p style={{ opacity: 0.55, marginTop: 2 }}>
            {note.kind.toUpperCase()} · {note.status.toUpperCase()}
          </p>
          <button type="button" onClick={() => founderNotes.pinNote(note.id)} style={{ fontSize: '6px', marginRight: 8 }}>
            Pin
          </button>
          <button type="button" onClick={() => founderNotes.removeNote(note.id)} style={{ fontSize: '6px' }}>
            Remove
          </button>
        </div>
      ))}
    </section>
  );

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <div
        className="gb-room"
        style={{
          background: slice.atmosphere.ambientGradient,
          ...slice.atmosphere.cssVars,
        }}
      >
        <div className="gb-room__sky" aria-hidden />

        <header className="gb-room__hud">
          <div>
            <p className="gb-room__label">{slice.pkg.definition.displayName} · Golden Build™</p>
            <h1 className="gb-room__title">{slice.project.name}</h1>
            <p style={{ fontSize: '7px', letterSpacing: '0.08em', opacity: 0.72, maxWidth: 320 }}>
              {slice.pkg.definition.identity.purpose}
            </p>
          </div>
          <div className="gb-room__meta">
            <p>WHERE · {slice.activeZone?.displayName ?? 'Arrival'}</p>
            <p>PROJECT · {slice.project.name}</p>
            <p>GEN · {environmentItem?.status ? STATUS_LABEL[environmentItem.status] : 'Ready'}</p>
          </div>
        </header>

        <div className="gb-room__canvas">
          <div className="gb-room__space-col">
            <div className="gb-room__space">
              <div className="gb-room__vanishing" aria-hidden />
              <div className="gb-room__floor-plane" style={{ background: slice.atmosphere.floorTone }} aria-hidden />

              {slice.zones.map((zone: WalkableZone) => (
                <button
                  key={zone.id}
                  type="button"
                  className={`gb-room__zone${slice.activeZoneId === zone.id ? ' is-active' : ''}`}
                  style={{
                    left: `${50 + zone.position.x * 36}%`,
                    top: `${46 - zone.position.z * 22}%`,
                  }}
                  onClick={() => slice.setActiveZoneId(zone.id)}
                >
                  {zone.displayName.replace(/™/g, '')}
                </button>
              ))}

              <div className="gb-room__orb" aria-hidden title="Studio Orb" />
              <p className="gb-room__orb-caption">
                {orbCopy.greeting}
                <br />
                <span style={{ opacity: 0.75 }}>{orbCopy.guidance}</span>
                <br />
                <span style={{ color: 'rgba(201,169,98,0.95)' }}>{orbInsight}</span>
              </p>
            </div>

            <p className="gb-room__teaching">{zoneTeaching}</p>

            {environmentItem?.previewUrl ? (
              <div style={{ margin: '8px 4px 0', fontSize: '7px' }}>
                {!showPreview ? (
                  <button type="button" className="gb-room__preview-link" onClick={() => setShowPreview(true)}>
                    Environment preview ready — tap to load
                  </button>
                ) : (
                  <a
                    href={environmentItem.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gb-room__preview-link"
                  >
                    Open generated environment (new tab)
                  </a>
                )}
              </div>
            ) : null}

            <div className="md:hidden">
              {moodWallSection}
              {notesSection}
            </div>
          </div>

          <div className="gb-room__rail-col hidden md:flex">
            {moodWallSection}
            {notesSection}
          </div>
        </div>

        <footer className="gb-room__console" aria-label="Generation Queue">
          <div className="gb-room__console-inner">
            <p className="gb-room__label">Production Console · Generation Queue™</p>
            {queue.items.length === 0 ? (
              <p style={{ fontSize: '7px', marginTop: 4, opacity: 0.7 }}>No production jobs yet.</p>
            ) : (
              queue.items.map((item: GenerationQueueItem) => (
                <div key={item.id} className="gb-room__queue-row">
                  <span>{item.displayName}</span>
                  <span>{STATUS_LABEL[item.status] ?? item.status}</span>
                  {item.status === 'failed' ? (
                    <button type="button" onClick={() => queue.retryItem(item.id)} style={{ fontSize: '7px' }}>
                      Retry
                    </button>
                  ) : null}
                </div>
              ))
            )}
            <button
              type="button"
              className="gb-room__btn gb-room__btn--block"
              disabled={isGenerating}
              onClick={onGenerateEnvironment}
            >
              {isGenerating ? 'Generating Environment…' : 'Generate Environment™'}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
