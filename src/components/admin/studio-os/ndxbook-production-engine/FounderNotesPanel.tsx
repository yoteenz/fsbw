import { useMemo, useState } from 'react';
import type { ProductionDepartmentId } from '../../../../studio-os-core/content-pipeline/departments';
import {
  PRODUCTION_CONCIERGE_LABELS,
  type FounderInstinctAnalysis,
  type FounderNote,
  type ProductionConciergeId,
} from '../../../../studio-os-core/ndxbook/founderNotes';
import { adminStudioNdxbookNewsroomDepartmentPath } from '../../../../utils/adminStudioRoutes';
import { useFounderNotes } from '../../../../hooks/useFounderNotes';
import type { NdxbookPage } from '../../../../studio-os-core/ndxbook/types';
import { NR, nrLabel, nrPanel, nrSectionTitle } from '../ndxbook-newsroom/ndxbookNewsroomTheme';

const QUICK_PROMPTS = [
  'This feels too generic. Make it more authoritative.',
  'The visual direction feels off-brand.',
  'Rewrite this hook.',
  'Make the caption less alarmist.',
  'Check if this claim needs legal review.',
];

const CONCIERGE_OPTIONS: ProductionConciergeId[] = [
  'brand',
  'editorial',
  'legal',
  'social-media',
  'visual-design',
  'strategy',
  'studio-orb',
];

const STATUS_COLOR: Record<FounderNote['status'], string> = {
  open: NR.gold,
  assigned: NR.indigo,
  'in-revision': '#6366F1',
  resolved: '#22C55E',
  'needs-founder-review': NR.accent,
  deferred: NR.gray,
};

type Props = {
  page: NdxbookPage | null;
  departmentId: ProductionDepartmentId;
  onNavigateDepartment?: (dept: ProductionDepartmentId) => void;
  onPageRefresh?: () => void;
  compact?: boolean;
};

export function FounderNotesPanel({
  page,
  departmentId,
  onNavigateDepartment,
  onPageRefresh,
  compact = false,
}: Props) {
  const notesApi = useFounderNotes(page, departmentId);
  const [draft, setDraft] = useState('');
  const [instinctFlag, setInstinctFlag] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [assignPick, setAssignPick] = useState<ProductionConciergeId>('studio-orb');

  const sortedNotes = useMemo(
    () => [...notesApi.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notesApi.notes]
  );

  const submitAnd = (after: (note: ReturnType<typeof notesApi.addNote>) => void) => {
    const body = draft.trim();
    if (!body) return;
    const note = notesApi.addNote(body, { instinctFlag });
    if (instinctFlag) notesApi.analyzeInstinct(note.id);
    after(note);
    setDraft('');
    setInstinctFlag(false);
  };

  const onRequestRevision = () => {
    const body = draft.trim() || 'Asset not ready for Review — founder requested revision.';
    const { targetDepartment } = notesApi.requestRevision(body);
    setDraft('');
    onNavigateDepartment?.(targetDepartment);
  };

  const showRevisionCta =
    departmentId === 'production' || departmentId === 'development' || departmentId === 'assembly';

  return (
    <aside className="mt-3 p-3 border" style={{ ...nrPanel, borderLeft: `4px solid ${NR.gold}` }}>
      <button
        type="button"
        className="w-full text-left flex items-center justify-between gap-2"
        onClick={() => setExpanded((v) => !v)}
      >
        <p style={nrSectionTitle}>FOUNDER NOTES</p>
        <span style={{ ...nrLabel, color: notesApi.blockingCount ? NR.accent : NR.gray }}>
          {notesApi.blockingCount > 0 ? `${notesApi.blockingCount} OPEN` : 'LUXURY DIRECTION'}
        </span>
      </button>

      {notesApi.blockingCount > 0 ? (
        <p style={{ ...nrLabel, color: NR.gold, marginTop: 6, fontSize: '6px' }}>
          Do not advance — {notesApi.blockingCount} unresolved note{notesApi.blockingCount === 1 ? '' : 's'} on this asset.
        </p>
      ) : null}

      {expanded ? (
        <>
          <div className="mt-2 flex flex-wrap gap-1">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setDraft(prompt)}
                className="px-1.5 py-0.5 border text-left"
                style={{ ...nrLabel, fontSize: '5px', borderColor: NR.panelBorder, color: NR.indigo }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Creative direction for this department…"
            className="w-full mt-2 p-2 text-[6px] font-futura border resize-y"
            style={{ borderColor: NR.panelBorder, color: NR.black }}
          />

          <label className="mt-2 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={instinctFlag}
              onChange={(e) => setInstinctFlag(e.target.checked)}
            />
            <span style={{ ...nrLabel, fontSize: '6px', color: NR.accent }}>Founder Instinct Flag · something feels off</span>
          </label>

          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => submitAnd((note) => notesApi.askOrb(note.id))}
              className="px-2 py-1 text-[6px] font-futura border"
              style={{ borderColor: NR.black, color: NR.black }}
            >
              ASK ORB TO FIX
            </button>
            <select
              value={assignPick}
              onChange={(e) => setAssignPick(e.target.value as ProductionConciergeId)}
              className="text-[6px] border px-1"
              style={{ borderColor: NR.panelBorder }}
            >
              {CONCIERGE_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {PRODUCTION_CONCIERGE_LABELS[id]}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => submitAnd((note) => notesApi.assignConcierge(note.id, assignPick))}
              className="px-2 py-1 text-[6px] font-futura border"
              style={{ borderColor: NR.indigo, color: NR.indigo }}
            >
              ASSIGN TO CONCIERGE
            </button>
          </div>

          {showRevisionCta ? (
            <button
              type="button"
              onClick={onRequestRevision}
              className="w-full mt-2 py-1.5 text-[6px] font-futura border"
              style={{ borderColor: NR.accent, color: NR.accent, background: 'rgba(220,38,38,0.04)' }}
            >
              REQUEST REVISION BEFORE REVIEW →
            </button>
          ) : null}

          {notesApi.instinctAnalyses[0] ? (
            <InstinctBlock analysis={notesApi.instinctAnalyses[0]!} />
          ) : null}

          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {sortedNotes.length === 0 ? (
              <p style={{ ...nrLabel, fontSize: '6px' }}>No notes yet — direct the asset anytime before formal Review.</p>
            ) : (
              sortedNotes.map((note) => (
                <FounderNoteCard
                  key={note.id}
                  note={note}
                  onAskOrb={() => notesApi.askOrb(note.id)}
                  onResolve={() => notesApi.setNoteStatus(note.id, 'resolved')}
                  onDefer={() => notesApi.setNoteStatus(note.id, 'deferred')}
                  onRevision={(revisionId, action, edited) => {
                    notesApi.decideRevision(note.id, revisionId, action, edited);
                    onPageRefresh?.();
                  }}
                  onGoToDepartment={
                    note.returnDepartmentId
                      ? () => onNavigateDepartment?.(note.returnDepartmentId!)
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </>
      ) : null}
    </aside>
  );
}

function InstinctBlock({ analysis }: { analysis: FounderInstinctAnalysis }) {
  return (
    <div className="mt-2 p-2 border" style={{ borderColor: NR.panelBorder, background: 'rgba(99,102,241,0.04)' }}>
      <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.indigo, fontSize: '6px' }}>
        STUDIO INTELLIGENCE · INSTINCT TRIAGE
      </p>
      <p style={{ ...nrLabel, fontSize: '6px', marginTop: 4 }}>{analysis.summary}</p>
      {analysis.insights.map((ins) => (
        <p key={ins.id} style={{ ...nrLabel, fontSize: '5px', marginTop: 4 }}>
          {ins.likelihood.toUpperCase()} · {ins.label} · {PRODUCTION_CONCIERGE_LABELS[ins.suggestedConcierge]}
        </p>
      ))}
    </div>
  );
}

function FounderNoteCard({
  note,
  onAskOrb,
  onResolve,
  onDefer,
  onRevision,
  onGoToDepartment,
}: {
  note: FounderNote;
  onAskOrb: () => void;
  onResolve: () => void;
  onDefer: () => void;
  onRevision: (revisionId: string, action: 'approve' | 'reject' | 'edit', edited?: string) => void;
  onGoToDepartment?: () => void;
}) {
  const pendingRevision = note.revisions.find((r) => r.status === 'pending');

  return (
    <div className="p-2 border" style={{ borderColor: NR.panelBorder }}>
      <div className="flex flex-wrap gap-1 justify-between">
        <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, fontSize: '6px' }}>
          {note.departmentId.toUpperCase()} · {new Date(note.createdAt).toLocaleString()}
        </p>
        <p style={{ ...nrLabel, color: STATUS_COLOR[note.status], fontSize: '5px' }}>{note.status.replace(/-/g, ' ').toUpperCase()}</p>
      </div>
      <p style={{ ...nrLabel, marginTop: 4, fontSize: '6px' }}>{note.body}</p>
      <p style={{ ...nrLabel, fontSize: '5px', marginTop: 2, color: NR.indigo }}>
        {note.author} · {PRODUCTION_CONCIERGE_LABELS[note.assignedConcierge]}
        {note.instinctFlag ? ' · INSTINCT' : ''}
      </p>

      {pendingRevision ? (
        <RevisionBlock revision={pendingRevision} onRevision={onRevision} />
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1">
        {note.status !== 'resolved' ? (
          <button type="button" onClick={onAskOrb} className="px-1 py-0.5 text-[5px] font-futura border" style={{ borderColor: NR.black, color: NR.black }}>
            ASK ORB
          </button>
        ) : null}
        {onGoToDepartment ? (
          <button type="button" onClick={onGoToDepartment} className="px-1 py-0.5 text-[5px] font-futura border" style={{ borderColor: NR.indigo, color: NR.indigo }}>
            GO TO DEPT
          </button>
        ) : null}
        <button type="button" onClick={onResolve} className="px-1 py-0.5 text-[5px] font-futura border" style={{ borderColor: '#22C55E', color: '#22C55E' }}>
          RESOLVE
        </button>
        <button type="button" onClick={onDefer} className="px-1 py-0.5 text-[5px] font-futura border" style={{ borderColor: NR.gray, color: NR.gray }}>
          DEFER
        </button>
      </div>
    </div>
  );
}

function RevisionBlock({
  revision,
  onRevision,
}: {
  revision: FounderNote['revisions'][number];
  onRevision: (revisionId: string, action: 'approve' | 'reject' | 'edit', edited?: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState(revision.suggestedVersion);

  return (
    <div className="mt-2 p-2 border" style={{ borderColor: NR.indigo, background: 'rgba(99,102,241,0.03)' }}>
      <p style={{ ...nrLabel, fontSize: '5px', color: NR.indigo }}>REVISION · {revision.field.toUpperCase()}</p>
      <p style={{ ...nrLabel, fontSize: '5px', marginTop: 2 }}>{revision.reason}</p>
      <p style={{ ...nrLabel, fontSize: '5px', marginTop: 4, color: NR.gray }}>ORIGINAL</p>
      <p style={{ ...nrLabel, fontSize: '5px', whiteSpace: 'pre-wrap' }}>{revision.originalVersion}</p>
      <p style={{ ...nrLabel, fontSize: '5px', marginTop: 4, color: NR.black }}>SUGGESTED</p>
      {editMode ? (
        <textarea
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          rows={3}
          className="w-full text-[5px] border p-1"
          style={{ borderColor: NR.panelBorder }}
        />
      ) : (
        <p style={{ ...nrLabel, fontSize: '5px', whiteSpace: 'pre-wrap' }}>{revision.suggestedVersion}</p>
      )}
      <div className="mt-1 flex flex-wrap gap-1">
        <button type="button" onClick={() => onRevision(revision.id, 'approve')} className="px-1 py-0.5 text-[5px] border" style={{ borderColor: '#22C55E', color: '#22C55E' }}>
          APPROVE
        </button>
        <button type="button" onClick={() => onRevision(revision.id, 'reject')} className="px-1 py-0.5 text-[5px] border" style={{ borderColor: NR.accent, color: NR.accent }}>
          REJECT
        </button>
        {editMode ? (
          <button type="button" onClick={() => onRevision(revision.id, 'edit', edited)} className="px-1 py-0.5 text-[5px] border" style={{ borderColor: NR.indigo, color: NR.indigo }}>
            SAVE EDIT
          </button>
        ) : (
          <button type="button" onClick={() => setEditMode(true)} className="px-1 py-0.5 text-[5px] border" style={{ borderColor: NR.indigo, color: NR.indigo }}>
            EDIT
          </button>
        )}
      </div>
    </div>
  );
}

/** Full founder notes brief for Review Department concierges. */
export function FounderNotesReviewBrief({
  page,
  departmentId,
}: {
  page: NdxbookPage | null;
  departmentId: ProductionDepartmentId;
}) {
  const { notes, instinctAnalyses } = useFounderNotes(page, departmentId);
  const unresolved = notes.filter((n) => !['resolved', 'deferred'].includes(n.status));
  const history = notes.filter((n) => n.revisions.length > 0);

  if (notes.length === 0) return null;

  return (
    <section className="mt-3 p-3 border" style={{ ...nrPanel, borderLeft: `4px solid ${NR.gold}` }}>
      <p style={nrSectionTitle}>FOUNDER NOTES · REVIEW BRIEF</p>
      <p style={{ ...nrLabel, fontSize: '6px' }}>
        Concierge board sees {notes.length} note{notes.length === 1 ? '' : 's'} · {unresolved.length} unresolved · {history.length} with revision history.
      </p>
      {unresolved.map((n) => (
        <p key={n.id} style={{ ...nrLabel, fontSize: '6px', marginTop: 4, color: NR.accent }}>
          · [{n.departmentId}] {n.body.slice(0, 100)}
        </p>
      ))}
      {instinctAnalyses[0] ? (
        <p style={{ ...nrLabel, fontSize: '5px', marginTop: 6, color: NR.indigo }}>
          Instinct triage · {instinctAnalyses[0].insights.map((i) => i.label).join(' · ')}
        </p>
      ) : null}
    </section>
  );
}

export function founderNotesDepartmentPath(dept: ProductionDepartmentId): string {
  return adminStudioNdxbookNewsroomDepartmentPath(dept);
}
