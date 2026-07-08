import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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
    await queue.generateProductionGroup('environment');
  };

  const zoneTeaching = slice.activeZone ? zoneLabelForTeaching(slice.activeZone) : '';

  return (
    <>
      <style>{DEPARTMENT_SLICE_STYLES}</style>
      <div
        className="dept-slice-root"
        style={{
          background: slice.atmosphere.ambientGradient,
          ...slice.atmosphere.cssVars,
        }}
      >
        <header className="px-4 pt-4 pb-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="dept-slice-label">{slice.pkg.definition.displayName}</p>
            <h1 className="dept-slice-title">{slice.project.name}</h1>
            <p style={{ fontSize: '8px', letterSpacing: '0.1em', opacity: 0.75, maxWidth: 420 }}>
              {slice.pkg.definition.identity.purpose}
            </p>
          </div>
          <div className="text-right" style={{ fontSize: '7px', letterSpacing: '0.1em', opacity: 0.7 }}>
            <p>WHERE · {slice.activeZone?.displayName ?? 'Arrival'}</p>
            <p>PROJECT · {slice.project.name}</p>
            <p>GENERATING · {environmentItem?.status ? STATUS_LABEL[environmentItem.status] : 'Ready'}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-4 pb-4">
          <section className="lg:col-span-7 dept-slice-panel">
            <p className="dept-slice-label">Environment Shell™</p>
            <div className="dept-slice-perspective mt-2">
              <div className="dept-slice-hero-wall" />
              <div className="dept-slice-floor" style={{ background: slice.atmosphere.floorTone }} />
              <div className="dept-slice-orb-center" aria-hidden title="Studio Orb" />
              {slice.zones.map((zone: WalkableZone) => (
                <button
                  key={zone.id}
                  type="button"
                  className={`dept-slice-zone-btn${slice.activeZoneId === zone.id ? ' is-active' : ''}`}
                  style={{
                    left: `${50 + zone.position.x * 38}%`,
                    top: `${50 - zone.position.z * 28}%`,
                  }}
                  onClick={() => slice.setActiveZoneId(zone.id)}
                >
                  {zone.displayName.replace(/™/g, '')}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '7px', marginTop: 10, opacity: 0.8, letterSpacing: '0.06em' }}>{zoneTeaching}</p>
            {environmentItem?.previewUrl ? (
              <img
                src={environmentItem.previewUrl}
                alt="Generated environment preview"
                className="dept-slice-env-preview"
              />
            ) : null}
          </section>

          <aside className="lg:col-span-5 space-y-3">
            <div className="dept-slice-panel">
              <p className="dept-slice-label">Studio Orb™</p>
              <p style={{ fontSize: '9px', marginTop: 6, lineHeight: 1.5 }}>{orbCopy.greeting}</p>
              <p style={{ fontSize: '7px', marginTop: 6, opacity: 0.75 }}>{orbCopy.guidance}</p>
              <p style={{ fontSize: '7px', marginTop: 8, color: 'rgba(201,169,98,0.95)' }}>{orbInsight}</p>
            </div>

            <div className="dept-slice-panel">
              <p className="dept-slice-label">Generation Queue™</p>
              {queue.items.length === 0 ? (
                <p style={{ fontSize: '7px', marginTop: 6, opacity: 0.7 }}>No production jobs yet.</p>
              ) : (
                queue.items.map((item: GenerationQueueItem) => (
                  <div key={item.id} className="dept-slice-queue-row">
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
                className={`dept-slice-generate-btn mt-3${isGenerating ? ' is-busy' : ''}`}
                disabled={isGenerating}
                onClick={onGenerateEnvironment}
              >
                {isGenerating ? 'Generating Environment…' : 'Generate Environment™'}
              </button>
            </div>

            {(slice.activeZone?.type === 'hero' || slice.activeZoneId === 'mood-wall') && (
              <div className="dept-slice-panel">
                <p className="dept-slice-label">Living Mood Wall™</p>
                <input
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  placeholder="Inspiration title"
                  className="w-full mt-2 px-2 py-1 text-[8px] bg-transparent border border-white/20"
                />
                <input
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  placeholder="URL or reference"
                  className="w-full mt-1 px-2 py-1 text-[8px] bg-transparent border border-white/20"
                />
                <button
                  type="button"
                  className="dept-slice-generate-btn mt-2"
                  onClick={() => {
                    if (!refTitle.trim() || !refUrl.trim()) return;
                    moodWall.addInspiration({ title: refTitle.trim(), sourceType: 'reference', url: refUrl.trim() });
                    setRefTitle('');
                    setRefUrl('');
                  }}
                >
                  Add Inspiration
                </button>
                {moodWall.wall.inspirations.map((item: MoodWallInspiration, index: number) => (
                  <div
                    key={item.id}
                    className="dept-slice-mood-card"
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex === null || dragIndex === index) return;
                      moodWall.moveInspiration(dragIndex, index);
                      setDragIndex(null);
                    }}
                  >
                    <p style={{ fontSize: '8px' }}>{item.title}</p>
                    <p style={{ fontSize: '6px', opacity: 0.6 }}>{item.url}</p>
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
              </div>
            )}

            {(slice.activeZone?.id.includes('founder') || slice.activeZoneId === 'founder-review') && (
              <div className="dept-slice-panel">
                <p className="dept-slice-label">Founder Notes™</p>
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  rows={2}
                  placeholder="Quick note, decision, or reminder…"
                  className="w-full mt-2 px-2 py-1 text-[8px] bg-transparent border border-white/20"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    className="dept-slice-generate-btn"
                    style={{ width: 'auto', padding: '6px 10px' }}
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
                    className="dept-slice-generate-btn"
                    style={{ width: 'auto', padding: '6px 10px' }}
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
              </div>
            )}
          </aside>
        </div>

        <footer className="px-4 pb-4" style={{ fontSize: '7px', opacity: 0.65 }}>
          <p>
            Studio OS Alpha · Vertical Slice · Department engine validates production pipeline.{' '}
            <Link to="/admin/studio/overview" style={{ color: 'rgba(201,169,98,0.95)' }}>
              Exit to Studio Overview
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}
