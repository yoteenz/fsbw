import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationOperatingManualState } from '../../../../hooks/useOrganizationOperatingManualState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  MANUAL_DOCUMENT_LABELS,
  OPERATING_MANUAL_ACCENT,
  OPERATING_MANUAL_PHILOSOPHY,
  SYNC_TRIGGER_LABELS,
} from '../../../../studio-os-core/organization-operating-manual';
import { resolveNaturalLanguageQuery } from '../../../../studio-os-core/organization-operating-manual/searchable-organization';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type ManualTab = 'overview' | 'library' | 'search' | 'sync';

const TABS: { id: ManualTab; label: string }[] = [
  { id: 'overview', label: 'MANUAL OVERVIEW' },
  { id: 'library', label: 'DOCUMENTATION LIBRARY' },
  { id: 'search', label: 'SEARCHABLE ORGANIZATION' },
  { id: 'sync', label: 'LIVE SYNCHRONIZATION' },
];

const EXAMPLE_QUESTIONS = [
  'How do we onboard clients?',
  'What is our refund policy?',
  'How do approvals work?',
  "What's our customer service philosophy?",
];

export function OrganizationOperatingManualWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ManualTab>('overview');
  const { profile, refresh, searchQuery, setSearchQuery } = useOrganizationOperatingManualState();

  const searchResult = useMemo(() => {
    if (!profile || !searchQuery.trim()) return null;
    return resolveNaturalLanguageQuery(searchQuery, profile.organizationId, profile.documents, profile.searchableQa, profile.companyName);
  }, [profile, searchQuery]);

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATION OPERATING MANUAL™ LOADING — ONE HANDBOOK · ALWAYS CURRENT
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 120 · ORGANIZATION OPERATING MANUAL™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="The living operating manual — automatically generated, organized, and continuously updated."
        progressPct={profile.manualCompletenessScore}
        stats={[
          { label: 'COMPLETENESS', value: `${profile.manualCompletenessScore}%` },
          { label: 'SECTIONS', value: `${profile.documentsGenerated}` },
          { label: 'CURRENT', value: `${profile.documentsCurrent}` },
          { label: 'Q&A READY', value: `${profile.searchableAnswers}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.manualCompletenessScore} size={56} label="MANUAL" accent={OPERATING_MANUAL_ACCENT} />
        <div>
          {OPERATING_MANUAL_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · OPERATING MANUAL UPDATES">
        <p className="text-[6px] font-futura" style={{ color: OPERATING_MANUAL_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockManualLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="AUTOMATIC DOCUMENTATION · 21 SECTIONS">
        <div className="grid grid-cols-2 gap-2">
          {profile.documents.slice(0, 8).map((d) => (
            <p key={d.id} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {d.label}: <span style={{ color: d.current ? OPERATING_MANUAL_ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>{d.current ? 'CURRENT' : 'SYNCING'}</span>
            </p>
          ))}
        </div>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: OPERATING_MANUAL_ACCENT, color: OPERATING_MANUAL_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH OPERATING MANUAL
      </button>
    </ExecutivePageShell>
  );

  const renderLibrary = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DOCUMENTATION LIBRARY · EVERYTHING SYNCHRONIZED AUTOMATICALLY">
        {profile.documents.map((d) => (
          <ExecutiveSecondaryCard key={d.id} title={d.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: OPERATING_MANUAL_ACCENT }}>
              {d.summary} · Source: {d.sourceModule}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {d.content.slice(0, 220)}…
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSearch = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SEARCHABLE ORGANIZATION · ASK QUESTIONS NATURALLY">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="How do we onboard clients?"
          className="w-full mb-3 px-2 py-1 text-[7px] font-futura uppercase border bg-white/60"
          style={{ borderColor: OPERATING_MANUAL_ACCENT, color: OPERATING_MANUAL_ACCENT }}
        />
        <ExecutiveSecondaryCard title="EXAMPLE QUESTIONS">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setSearchQuery(q)}
              className="block w-full text-left mb-2 text-[6px] font-futura"
              style={{ color: ADMIN_STUDIO_THEME.textSecondary }}
            >
              {q}
            </button>
          ))}
        </ExecutiveSecondaryCard>
        {searchResult ? (
          <ExecutiveSecondaryCard title={`ANSWER · ${searchResult.confidencePct}% CONFIDENCE`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: OPERATING_MANUAL_ACCENT, fontWeight: 515 }}>
              {searchResult.question}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {searchResult.answer}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Source: {MANUAL_DOCUMENT_LABELS[searchResult.sourceDocumentType]}
            </p>
          </ExecutiveSecondaryCard>
        ) : null}
        {profile.searchableQa.map((qa) => (
          <ExecutiveSecondaryCard key={qa.id} title={qa.question.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {qa.answer.slice(0, 180)}…
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSync = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="LIVE SYNCHRONIZATION · NO DUPLICATE · NO OUTDATED">
        {profile.syncEvents.map((event) => (
          <ExecutiveSecondaryCard key={event.id} title={`${SYNC_TRIGGER_LABELS[event.trigger].toUpperCase()} · SYNC`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: OPERATING_MANUAL_ACCENT }}>
              {event.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Updated: {event.documentsUpdated.join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="organization-operating-manual" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? OPERATING_MANUAL_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? OPERATING_MANUAL_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'library' && renderLibrary()}
      {tab === 'search' && renderSearch()}
      {tab === 'sync' && renderSync()}
    </div>
  );
}
