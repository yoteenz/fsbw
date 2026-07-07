import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { InspirationSourceType, MoodBoardSectionId } from '../../../../studio-os-core/creative-direction-studio/types';
import {
  CREATIVE_CONCIERGE_LABELS,
  MOOD_BOARD_SECTION_LABELS,
} from '../../../../studio-os-core/creative-direction-studio/types';
import { useCreativeDirectionStudio } from '../../../../hooks/useCreativeDirectionStudio';
import {
  adminStudioNdxbookCreativeDirectionPath,
  adminStudioNdxbookNewsroomDepartmentPath,
} from '../../../../utils/adminStudioRoutes';
import { NR, nrLabel, nrPanel, nrSectionTitle } from '../ndxbook-newsroom/ndxbookNewsroomTheme';

const COMMAND_HINTS = [
  "Let's change the direction.",
  'This is not luxurious enough.',
  'Make it feel like Apple introducing Vision Pro.',
  'Generate three stronger concepts.',
  'Show luxury references.',
  'Start over.',
];

const SOURCE_TYPES: InspirationSourceType[] = [
  'instagram-reel',
  'tiktok',
  'pinterest',
  'behance',
  'packaging',
  'luxury-campaign',
  'ui-screenshot',
  'youtube',
  'photography',
];

type Props = {
  projectId?: string;
  compact?: boolean;
  currentDepartment?: string;
  showProductionLink?: boolean;
};

export function CreativeDirectionStrip({
  projectId,
  compact = true,
  currentDepartment,
  showProductionLink = true,
}: Props) {
  const { snapshot } = useCreativeDirectionStudio(projectId);
  if (!snapshot) return null;

  return (
    <div
      className="mb-3 p-2 border flex flex-wrap items-center gap-2 justify-between"
      style={{ borderColor: NR.panelBorder, background: 'rgba(99,102,241,0.05)' }}
    >
      <div>
        <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.indigo, fontSize: '6px' }}>
          CREATIVE DIRECTION STUDIO™ · ABOVE PRODUCTION ENGINE
        </p>
        <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, fontSize: '7px' }}>
          {snapshot.branchName.toUpperCase()} · {snapshot.northStar.slice(0, compact ? 72 : 140)}
          {(compact ? snapshot.northStar.length : 0) > 72 ? '…' : ''}
        </p>
        {!compact ? (
          <p style={{ ...nrLabel, fontSize: '6px', marginTop: 2 }}>
            {snapshot.referenceCount} references · {snapshot.openNotes} direction notes · Tone ·{' '}
            {snapshot.tone.join(' / ')}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        <Link
          to={adminStudioNdxbookCreativeDirectionPath()}
          className="px-2 py-1 text-[6px] font-futura border"
          style={{ borderColor: NR.indigo, color: NR.indigo }}
        >
          OPEN CREATIVE DIRECTION STUDIO →
        </Link>
        {showProductionLink && currentDepartment ? (
          <Link
            to={adminStudioNdxbookNewsroomDepartmentPath(currentDepartment)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{ borderColor: NR.panelBorder, color: NR.gray }}
          >
            BACK TO {currentDepartment.toUpperCase()}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function CreativeDirectionStudioWorkspace({ projectId, currentDepartment }: Props) {
  const cds = useCreativeDirectionStudio(projectId);
  const [command, setCommand] = useState('');
  const [impactOpen, setImpactOpen] = useState<ReturnType<typeof cds.runCommand>>(null);
  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [refType, setRefType] = useState<InspirationSourceType>('instagram-reel');

  const branch = cds.activeBranch;
  const project = cds.project;

  if (!project || !branch) {
    return <p style={nrLabel}>Loading Creative Direction Studio…</p>;
  }

  const onRunCommand = () => {
    const text = command.trim();
    if (!text) return;
    const result = cds.runCommand(text, currentDepartment);
    setImpactOpen(result);
    setCommand('');
  };

  const onAddReference = () => {
    if (!refTitle.trim() || !refUrl.trim()) return;
    cds.addReference({ title: refTitle.trim(), sourceType: refType, url: refUrl.trim() });
    setRefTitle('');
    setRefUrl('');
  };

  return (
    <div className="creative-direction-studio-root space-y-3">
      <header className="p-3 border" style={{ ...nrPanel, borderLeft: `4px solid ${NR.indigo}` }}>
        <p style={nrSectionTitle}>CREATIVE DIRECTION STUDIO™</p>
        <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, fontSize: '8px' }}>
          {project.name}
        </p>
        <p style={{ ...nrLabel, fontSize: '6px', marginTop: 4 }}>
          Canonical creative intent · lives above Studio Production Engine · continuous · never locked after creation.
        </p>
      </header>

      <section className="p-3 border" style={nrPanel}>
        <p style={nrSectionTitle}>CREATIVE TIMELINES · PARALLEL BRANCHES</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {project.branches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => cds.activateBranch(b.id)}
              className="px-2 py-1 text-[6px] font-futura border"
              style={{
                borderColor: b.id === project.activeBranchId ? NR.black : NR.panelBorder,
                color: b.id === project.activeBranchId ? NR.black : NR.indigo,
                background: b.id === project.activeBranchId ? 'rgba(15,23,42,0.06)' : 'transparent',
              }}
            >
              {b.name.toUpperCase()}
            </button>
          ))}
          <button
            type="button"
            onClick={() => cds.newBranch('New Direction', 'general')}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{ borderColor: NR.panelBorder, color: NR.gray }}
          >
            ＋ BRANCH
          </button>
        </div>
      </section>

      <section className="p-3 border" style={nrPanel}>
        <p style={nrSectionTitle}>STUDIO ORB · CREATIVE COMMANDS</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {COMMAND_HINTS.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => setCommand(hint)}
              className="px-1.5 py-0.5 border text-left"
              style={{ ...nrLabel, fontSize: '5px', borderColor: NR.panelBorder, color: NR.indigo }}
            >
              {hint}
            </button>
          ))}
        </div>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          rows={2}
          placeholder="Type naturally — Studio Orb understands creative intent…"
          className="w-full mt-2 p-2 text-[6px] font-futura border"
          style={{ borderColor: NR.panelBorder }}
        />
        <button
          type="button"
          disabled={!command.trim()}
          onClick={onRunCommand}
          className="mt-2 px-3 py-1.5 text-[6px] font-futura border"
          style={{ borderColor: NR.black, color: NR.black }}
        >
          RUN CREATIVE COMMAND
        </button>
        {branch.aiSuggestions[0] ? (
          <div className="mt-2 p-2 border" style={{ borderColor: NR.indigo }}>
            <p style={{ ...nrLabel, color: NR.indigo, fontSize: '6px' }}>{branch.aiSuggestions[0].summary}</p>
            <ul style={{ ...nrLabel, fontSize: '5px', paddingLeft: 12, marginTop: 4 }}>
              {branch.aiSuggestions[0].concepts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="p-3 border" style={nrPanel}>
          <p style={nrSectionTitle}>CREATIVE BRIEF · VISION · NORTH STAR</p>
          <p style={{ ...nrLabel, marginTop: 6 }}>
            <strong>Objective · </strong>
            {branch.brief.objective}
          </p>
          <p style={nrLabel}>
            <strong>Audience · </strong>
            {branch.brief.audience}
          </p>
          <p style={nrLabel}>
            <strong>Vision · </strong>
            {branch.vision}
          </p>
          <p style={nrLabel}>
            <strong>North Star · </strong>
            {branch.northStar}
          </p>
          <p style={nrLabel}>
            <strong>Tone · </strong>
            {branch.brief.tone.join(' · ')}
          </p>
        </section>

        <section className="p-3 border" style={nrPanel}>
          <p style={nrSectionTitle}>ADD INSPIRATION · ANY STAGE</p>
          <input
            value={refTitle}
            onChange={(e) => setRefTitle(e.target.value)}
            placeholder="Title · e.g. Apple Vision Pro launch frame"
            className="w-full text-[6px] border px-2 py-1 mt-1"
            style={{ borderColor: NR.panelBorder }}
          />
          <input
            value={refUrl}
            onChange={(e) => setRefUrl(e.target.value)}
            placeholder="URL or paste link"
            className="w-full text-[6px] border px-2 py-1 mt-1"
            style={{ borderColor: NR.panelBorder }}
          />
          <select
            value={refType}
            onChange={(e) => setRefType(e.target.value as InspirationSourceType)}
            className="w-full text-[6px] border px-1 py-1 mt-1"
            style={{ borderColor: NR.panelBorder }}
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/-/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onAddReference}
            className="mt-2 w-full py-1.5 text-[6px] font-futura border"
            style={{ borderColor: NR.indigo, color: NR.indigo }}
          >
            DROP REFERENCE · AUTO-ANALYZE
          </button>
        </section>
      </div>

      <section className="p-3 border" style={nrPanel}>
        <p style={nrSectionTitle}>LIVING MOOD BOARD</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 mt-2">
          {(Object.keys(MOOD_BOARD_SECTION_LABELS) as MoodBoardSectionId[]).map((sectionId) => (
            <div key={sectionId} className="p-2 border min-h-[64px]" style={{ borderColor: NR.panelBorder }}>
              <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', fontSize: '5px', color: NR.black }}>
                {MOOD_BOARD_SECTION_LABELS[sectionId].toUpperCase()}
              </p>
              {(branch.moodBoard.sections[sectionId] ?? []).slice(0, 4).map((chip) => (
                <p key={chip} style={{ ...nrLabel, fontSize: '5px', marginTop: 2 }}>
                  · {chip}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="p-3 border max-h-72 overflow-y-auto" style={nrPanel}>
          <p style={nrSectionTitle}>INSPIRATION LIBRARY · EXTRACTED INTELLIGENCE</p>
          {branch.references.length === 0 ? (
            <p style={{ ...nrLabel, fontSize: '6px' }}>Drop Instagram Reels, packaging, luxury campaigns — Studio Intelligence extracts structured creative knowledge.</p>
          ) : (
            branch.references.map((ref) => (
              <div key={ref.id} className="mt-2 p-2 border" style={{ borderColor: NR.panelBorder }}>
                <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.black, fontSize: '6px' }}>
                  {ref.title} · {ref.sourceType.replace(/-/g, ' ')}
                </p>
                <p style={{ ...nrLabel, fontSize: '5px' }}>
                  Mood · {ref.analysis.mood.join(' · ')} · Palette · {ref.analysis.colorPalette.join(' ')}
                </p>
                <p style={{ ...nrLabel, fontSize: '5px' }}>
                  Motion · {ref.analysis.motion[0]} · Luxury · {ref.analysis.luxuryCues[0]}
                </p>
              </div>
            ))
          )}
        </section>

        <section className="p-3 border max-h-72 overflow-y-auto" style={nrPanel}>
          <p style={nrSectionTitle}>CREATIVE DIRECTION NOTES</p>
          {branch.notes.length === 0 ? (
            <p style={{ ...nrLabel, fontSize: '6px' }}>Founder notes from production departments sync here as creative direction notes.</p>
          ) : (
            branch.notes.map((note) => (
              <div key={note.id} className="mt-2 p-2 border" style={{ borderColor: NR.panelBorder }}>
                <p style={{ ...nrLabel, fontSize: '6px' }}>{note.body}</p>
                <p style={{ ...nrLabel, fontSize: '5px', color: NR.indigo }}>
                  {CREATIVE_CONCIERGE_LABELS[note.assignedConcierge]}
                  {note.departmentOrigin ? ` · from ${note.departmentOrigin}` : ''}
                </p>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="p-3 border" style={nrPanel}>
        <p style={nrSectionTitle}>DIRECTION TIMELINE · VERSION HISTORY</p>
        {project.directionTimeline.slice(0, 8).map((ev) => (
          <p key={ev.id} style={{ ...nrLabel, fontSize: '5px', marginTop: 4 }}>
            {new Date(ev.createdAt).toLocaleString()} · {ev.type.toUpperCase()} · {ev.label} — {ev.detail}
          </p>
        ))}
      </section>

      {impactOpen?.impact ? (
        <div className="p-3 border" style={{ ...nrPanel, borderColor: NR.gold }}>
          <p style={{ ...nrSectionTitle, color: NR.gold }}>DIRECTION CHANGE · DOWNSTREAM IMPACT</p>
          <p style={{ ...nrLabel, fontSize: '6px' }}>{impactOpen.impact.summary}</p>
          <p style={{ ...nrLabel, fontSize: '6px', marginTop: 4 }}>
            Affected · {impactOpen.impact.affectedDepartments.join(' · ')}
          </p>
          <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
            {impactOpen.impact.options.map((opt) => (
              <div key={opt.id} className="p-2 border" style={{ borderColor: NR.panelBorder }}>
                <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', fontSize: '6px' }}>{opt.label.toUpperCase()}</p>
                <p style={{ ...nrLabel, fontSize: '5px' }}>{opt.detail}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setImpactOpen(null)} className="mt-2 text-[6px] underline" style={{ color: NR.indigo }}>
            Dismiss
          </button>
        </div>
      ) : null}

      <p style={{ ...nrLabel, fontSize: '6px' }}>
        Every production department reads this direction before work begins.{' '}
        <Link to={adminStudioNdxbookNewsroomDepartmentPath('discover')} style={{ color: NR.indigo }}>
          Enter Discover Department →
        </Link>
      </p>
    </div>
  );
}
