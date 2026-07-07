import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentityTimelineState } from '../../../../hooks/useIdentityTimelineState';
import {
  IDENTITY_TIMELINE_ACCENT,
  IDENTITY_TIMELINE_EVENT_LABELS,
  IDENTITY_TIMELINE_PHILOSOPHY,
  getSelectedTimeline,
  queryIdentityTimeline,
  refreshIdentityTimeline,
  selectTimelinePerson,
} from '../../../../studio-os-core/identity-timeline';
import {
  adminStudioOrganizationalHierarchyPath,
  adminStudioProfessionalProfilePath,
} from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type TimelineTab = 'overview' | 'journeys' | 'events' | 'intelligence' | 'sources';

const TABS: { id: TimelineTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'journeys', label: 'JOURNEYS' },
  { id: 'events', label: 'EVENTS' },
  { id: 'intelligence', label: 'STUDIO INTELLIGENCE™' },
  { id: 'sources', label: 'SOURCES' },
];

const SEVERITY_COLOR: Record<string, string> = {
  info: '#9333EA',
  watch: '#F59E0B',
  celebration: '#10B981',
};

export function IdentityTimelineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TimelineTab>('overview');
  const [searchQuery, setSearchQuery] = useState('founder');
  const { profile, refresh } = useIdentityTimelineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        IDENTITY TIMELINE™ LOADING — PRESERVING PROFESSIONAL STORIES
      </p>
    );
  }

  const selected = getSelectedTimeline(profile);
  const searchHits = queryIdentityTimeline(searchQuery, profile, 8);

  const handleSelect = (personId: string) => {
    selectTimelinePerson(profile.organizationId, personId);
    refresh();
    setTab('journeys');
  };

  const handleRefresh = () => {
    refreshIdentityTimeline(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 168 · IDENTITY TIMELINE™ · PERMANENT PROFESSIONAL JOURNEYS"
        title={profile.companyName.toUpperCase()}
        subtitle="Every person has a permanent Identity Timeline™ documenting their journey inside Studio OS — not just the organization."
        progressPct={profile.timelineScore}
        stats={[
          { label: 'PEOPLE', value: `${profile.peopleWithTimelines}` },
          { label: 'EVENTS', value: `${profile.totalEvents}` },
          { label: 'MENTORS', value: `${profile.mentorshipTotal}` },
          { label: 'KNOWLEDGE', value: `${profile.knowledgeAssetsTotal}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.timelineScore} size={56} label="IT" accent={IDENTITY_TIMELINE_ACCENT} />
        <div>
          {IDENTITY_TIMELINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PERMANENT RECORD — INDIVIDUAL STORY">
        <p className="text-[6px] font-futura" style={{ color: IDENTITY_TIMELINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockTimelineLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="TOP CONTRIBUTOR">
        <p className="text-[6px] font-futura" style={{ color: IDENTITY_TIMELINE_ACCENT, fontWeight: 515 }}>
          {profile.topContributorName} — organization's leading contributor this year
        </p>
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ PREVIEW">
        {profile.insights.slice(0, 3).map((i) => (
          <p key={i.id} className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[i.severity] ?? ADMIN_STUDIO_THEME.textSecondary }}>
            · {i.insight}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('intelligence')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: IDENTITY_TIMELINE_ACCENT, color: IDENTITY_TIMELINE_ACCENT }}>
        STUDIO INTELLIGENCE™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioProfessionalProfilePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROFESSIONAL PROFILE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioOrganizationalHierarchyPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATIONAL HIERARCHY →
      </button>
    </ExecutivePageShell>
  );

  const renderJourneys = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SEARCH TIMELINES">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people, events, milestones…"
          className="w-full text-[7px] font-futura uppercase px-2 py-1 mb-2 border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((h) => (
          <button
            key={`${h.type}-${h.id}`}
            type="button"
            onClick={() => h.type === 'person' && handleSelect(h.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: IDENTITY_TIMELINE_ACCENT, fontWeight: 515 }}>
              {h.label}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {h.matchReason}
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>

      {selected ? (
        <>
          <ExecutiveSecondaryCard title={`${selected.displayName.toUpperCase()} · IDENTITY TIMELINE™`}>
            <p className="text-[6px] font-futura mb-2" style={{ color: IDENTITY_TIMELINE_ACCENT, fontWeight: 515 }}>
              {selected.role} · {selected.department} · journey {selected.journeyScore}%
              {selected.topContributorThisYear ? ' · TOP CONTRIBUTOR' : ''}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {selected.headline}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>PERMANENT EVENTS:</span> {selected.eventsCount}
            </p>
          </ExecutiveSecondaryCard>

          <ExecutiveFocusPanel title="JOURNEY STATS">
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · Mentored: {selected.stats.mentorshipCount}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · Knowledge published: {selected.stats.knowledgeAssetsPublished}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · Brain contributions: {selected.stats.brainContributions}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · Expert sessions: {selected.stats.expertSessions}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · Promotions: {selected.stats.promotions} · Awards: {selected.stats.awards}
            </p>
          </ExecutiveFocusPanel>

          <ExecutiveFocusPanel title="TIMELINE — NEWEST FIRST">
            {selected.events.map((evt) => (
              <div key={evt.id} className="mb-2">
                <p className="text-[6px] font-futura" style={{ color: IDENTITY_TIMELINE_ACCENT, fontWeight: 515 }}>
                  {evt.eventTypeLabel} — {evt.title}
                </p>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {evt.description}
                </p>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {new Date(evt.occurredAt).toLocaleDateString()} · impact {evt.impactScore}% · PERMANENT
                </p>
              </div>
            ))}
          </ExecutiveFocusPanel>
        </>
      ) : null}

      <ExecutiveFocusPanel title="ALL PEOPLE">
        {profile.timelines.map((t) => (
          <button key={t.personId} type="button" onClick={() => handleSelect(t.personId)} className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {t.displayName} — {t.eventsCount} events{t.topContributorThisYear ? ' · TOP CONTRIBUTOR' : ''}
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderEvents = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EVENT TYPES">
        {Object.entries(IDENTITY_TIMELINE_EVENT_LABELS).map(([key, label]) => {
          const count = profile.timelines.reduce(
            (s, t) => s + t.events.filter((e) => e.eventType === key).length,
            0
          );
          if (!count) return null;
          return (
            <p key={key} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {label}: {count}
            </p>
          );
        })}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="RECENT PERMANENT EVENTS">
        {profile.timelines
          .flatMap((t) => t.events.slice(0, 2).map((e) => ({ person: t.displayName, event: e })))
          .slice(0, 12)
          .map(({ person, event: evt }) => (
            <p key={evt.id} className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · <span style={{ fontWeight: 515 }}>{person}</span> — {evt.eventTypeLabel}: {evt.title}
            </p>
          ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderIntelligence = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ INSIGHTS">
        {profile.insights.map((i) => (
          <div key={i.id} className="mb-3">
            <p className="text-[6px] font-futura" style={{ color: SEVERITY_COLOR[i.severity], fontWeight: 515 }}>
              [{i.severity.toUpperCase()}] {i.insight}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              → {i.recommendedAction}
            </p>
          </div>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="DOMAIN COVERAGE">
        {profile.domainStatuses.map((d) => (
          <p key={d.domain} className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · <span style={{ fontWeight: 515 }}>{d.label}</span> ({d.score}%): {d.summary}
          </p>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSources = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="INTELLIGENCE DOMAINS">
        {profile.domainStatuses.map((d) => (
          <p key={d.domain} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {d.label}: {d.score}% — {d.count} mapped
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="SYNCED SOURCES">
        {profile.syncedSources.map((s) => (
          <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {s}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={handleRefresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: IDENTITY_TIMELINE_ACCENT, color: IDENTITY_TIMELINE_ACCENT }}>
        REFRESH IDENTITY TIMELINE →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="identity-timeline" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? IDENTITY_TIMELINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? IDENTITY_TIMELINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(147,51,234,0.06)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'journeys' && renderJourneys()}
      {tab === 'events' && renderEvents()}
      {tab === 'intelligence' && renderIntelligence()}
      {tab === 'sources' && renderSources()}
    </div>
  );
}
