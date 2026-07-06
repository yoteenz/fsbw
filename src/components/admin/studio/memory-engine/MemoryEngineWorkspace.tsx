import { useState } from 'react';
import { useMemoryEngineState } from '../../../../hooks/useMemoryEngineState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  MEMORY_ENGINE_PHILOSOPHY,
  MEMORY_RECORD_TYPES,
  recallOrganizationalMemory,
} from '../../../../studio-os-core/memory-engine';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type MemoryTab = 'overview' | 'records' | 'projects' | 'recall' | 'lessons' | 'recommendations';

const TABS: { id: MemoryTab; label: string }[] = [
  { id: 'overview', label: 'MEMORY OVERVIEW' },
  { id: 'records', label: 'ORGANIZATIONAL MEMORY' },
  { id: 'projects', label: 'PROJECT ARCHIVES' },
  { id: 'recall', label: 'RECALL ENGINE' },
  { id: 'lessons', label: 'LESSONS & PATTERNS' },
  { id: 'recommendations', label: 'COMPOUNDING' },
];

export function MemoryEngineWorkspace() {
  const [tab, setTab] = useState<MemoryTab>('overview');
  const [recallQuery, setRecallQuery] = useState('pricing campaign experiment');
  const { profile, refresh } = useMemoryEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MEMORY ENGINE™ LOADING — SYNCING ORGANIZATIONAL HISTORY
      </p>
    );
  }

  const recall = recallOrganizationalMemory(recallQuery, profile.records, profile.projectArtifacts);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 96 · MEMORY ENGINE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Knowledge explains why something works. Memory proves whether it actually worked."
        progressPct={profile.memoryDepthScore}
        stats={[
          { label: 'RECORDS', value: String(profile.records.length) },
          { label: 'DEPTH', value: `${profile.memoryDepthScore}%` },
          { label: 'PROJECTS', value: String(profile.totalProjectsArchived) },
          { label: 'LESSONS', value: String(profile.totalLessonsCaptured) },
        ]}
      />
      {MEMORY_ENGINE_PHILOSOPHY.slice(1, 3).map((line) => (
        <ExecutiveSecondaryCard key={line} title="PHILOSOPHY">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {line}
          </p>
        </ExecutiveSecondaryCard>
      ))}
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.accent, color: ADMIN_STUDIO_THEME.accent }}
      >
        SYNC MEMORY
      </button>
    </ExecutivePageShell>
  );

  const renderRecords = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`MEMORY TYPES · ${MEMORY_RECORD_TYPES.length} CATEGORIES`}>
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {MEMORY_RECORD_TYPES.join(' · ')}
        </p>
      </ExecutiveFocusPanel>
      {profile.records.slice(0, 8).map((r) => (
        <ExecutiveSecondaryCard key={r.id} title={`${r.type.toUpperCase()} · ${r.title}`}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {r.outcome.toUpperCase()} · {r.summary.slice(0, 120)}
            {r.wouldRepeat !== undefined ? ` · Repeat: ${r.wouldRepeat ? 'yes' : 'no'}` : ''}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderProjects = () => (
    <ExecutivePageShell>
      {profile.projectArtifacts.length === 0 ? (
        <ExecutiveSecondaryCard title="NO COMPLETED PROJECT ARTIFACTS YET">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Completed projects auto-generate lessons learned · best practices · mistakes to avoid · recommendations · future improvements.
          </p>
        </ExecutiveSecondaryCard>
      ) : (
        profile.projectArtifacts.map((a) => (
          <ExecutiveFocusPanel key={a.projectId} title={a.projectTitle.toUpperCase()}>
            <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: '#92704A' }}>
              LESSONS LEARNED
            </p>
            {a.lessonsLearned.map((l) => (
              <p key={l} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {l}
              </p>
            ))}
            <p className="text-[6px] font-futura uppercase mb-1 mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              BEST PRACTICES
            </p>
            {a.bestPractices.slice(0, 2).map((b) => (
              <p key={b} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {b}
              </p>
            ))}
          </ExecutiveFocusPanel>
        ))
      )}
    </ExecutivePageShell>
  );

  const renderRecall = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="HAVE WE DONE THIS BEFORE?">
        <input
          value={recallQuery}
          onChange={(e) => setRecallQuery(e.target.value)}
          className="w-full mb-2 px-2 py-1 text-[6px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          placeholder="Query organizational memory…"
        />
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Matches: {recall.matchCount} · Prior experience: {recall.hasPriorExperience ? 'YES' : 'NO'}
        </p>
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          What happened: {recall.whatHappened}
        </p>
        <p className="text-[6px] font-futura" style={{ color: '#92704A' }}>
          Recommend: {recall.recommendation.replace(/-/g, ' ').toUpperCase()} — {recall.recommendationReason}
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderLessons = () => (
    <ExecutivePageShell>
      {profile.records
        .filter((r) => r.type === 'lesson' || r.type === 'failure' || r.type === 'success')
        .slice(0, 6)
        .map((r) => (
          <ExecutiveSecondaryCard key={r.id} title={r.title}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {r.type.toUpperCase()} · {r.summary.slice(0, 100)}
            </p>
          </ExecutiveSecondaryCard>
        ))}
    </ExecutivePageShell>
  );

  const renderRecommendations = () => (
    <ExecutivePageShell>
      {profile.compoundingRecommendations.map((r) => (
        <ExecutiveSecondaryCard key={r.id} title={r.title}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {r.category.replace(/-/g, ' ').toUpperCase()} · {r.confidencePct}% · {r.rationale.slice(0, 120)}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'records':
        return renderRecords();
      case 'projects':
        return renderProjects();
      case 'recall':
        return renderRecall();
      case 'lessons':
        return renderLessons();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="memory-engine" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(146,112,74,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
