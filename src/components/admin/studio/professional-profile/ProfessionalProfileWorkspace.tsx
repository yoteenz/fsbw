import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfessionalProfileState } from '../../../../hooks/useProfessionalProfileState';
import {
  PROFESSIONAL_PROFILE_ACCENT,
  PROFESSIONAL_PROFILE_PHILOSOPHY,
  TIMELINE_EVENT_LABELS,
  getSelectedProfessionalProfile,
  queryProfessionalProfiles,
  refreshProfessionalProfile,
  selectProfessionalProfile,
} from '../../../../studio-os-core/professional-profile';
import {
  adminStudioIdentityGraphPath,
  adminStudioProfessionBrainPath,
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

type ProfileTab = 'overview' | 'profiles' | 'timeline' | 'portfolio' | 'sources';

const TABS: { id: ProfileTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'profiles', label: 'PROFILES' },
  { id: 'timeline', label: 'PROFESSIONAL TIMELINE™' },
  { id: 'portfolio', label: 'PORTFOLIO' },
  { id: 'sources', label: 'SOURCES' },
];

const TIMELINE_COLOR: Record<string, string> = {
  promotion: '#2563EB',
  project: '#0D9488',
  award: '#D97706',
  certification: '#7C3AED',
  'leadership-role': '#DC2626',
  'skill-learned': '#059669',
  'business-founded': '#7C3AED',
  'profession-brain-created': '#0891B2',
  'marketplace-product-published': '#EC4899',
};

export function ProfessionalProfileWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [searchQuery, setSearchQuery] = useState('founder');
  const { profile, refresh } = useProfessionalProfileState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROFESSIONAL PROFILE™ LOADING — EVOLVING CAREER IDENTITIES
      </p>
    );
  }

  const selected = getSelectedProfessionalProfile(profile);
  const searchHits = queryProfessionalProfiles(searchQuery, profile, 8);

  const handleSelect = (id: string) => {
    selectProfessionalProfile(profile.organizationId, id);
    refresh();
    setTab('profiles');
  };

  const handleRefresh = () => {
    refreshProfessionalProfile(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 164 · PROFESSIONAL PROFILE™ · LIVING CAREER IDENTITIES"
        title={profile.companyName.toUpperCase()}
        subtitle="Dynamic professional identities that evolve throughout careers — not snapshots frozen in time."
        progressPct={profile.registryScore}
        stats={[
          { label: 'PROFILES', value: `${profile.profilesCount}` },
          { label: 'TIMELINE', value: `${profile.timelineEventsTotal}` },
          { label: 'BRAINS', value: `${profile.brainsLinked}` },
          { label: 'CERTS', value: `${profile.certificationsEarned}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="PP" accent={PROFESSIONAL_PROFILE_ACCENT} />
        <div>
          {PROFESSIONAL_PROFILE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="DYNAMIC — NOT FROZEN">
        <p className="text-[6px] font-futura" style={{ color: PROFESSIONAL_PROFILE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockProfessionalLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="PROFILE DOMAINS">
        {profile.domainStatuses.map((d) => (
          <p key={d.domain} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {d.label}: {d.score}% — {d.summary}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('timeline')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PROFESSIONAL_PROFILE_ACCENT, color: PROFESSIONAL_PROFILE_ACCENT }}>
        PROFESSIONAL TIMELINE™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioIdentityGraphPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        IDENTITY GRAPH →
      </button>
      <button type="button" onClick={() => navigate(adminStudioProfessionBrainPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROFESSION BRAIN →
      </button>
    </ExecutivePageShell>
  );

  const renderProfiles = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SEARCH PROFESSIONAL PROFILES">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills, roles, certifications…"
          className="w-full text-[7px] font-futura uppercase px-2 py-1 mb-2 border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((h) => (
          <button
            key={`${h.type}-${h.id}`}
            type="button"
            onClick={() => h.type === 'profile' && handleSelect(h.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: PROFESSIONAL_PROFILE_ACCENT, fontWeight: 515 }}>
              {h.label}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {h.matchReason}
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>

      {selected ? (
        <ExecutiveSecondaryCard title={`${selected.displayName.toUpperCase()} · LIVING PROFILE`}>
          <p className="text-[6px] font-futura mb-2" style={{ color: PROFESSIONAL_PROFILE_ACCENT, fontWeight: 515 }}>
            Evolution {selected.evolutionScore}% · {selected.currentRole} · {selected.department}
          </p>
          <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {selected.headline}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>SKILLS:</span> {selected.skills.slice(0, 6).join(' · ')}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>BRAINS:</span>{' '}
            {selected.professionBrains.map((b) => `${b.label} (${b.maturityPct}%)`).join(' · ') || 'None'}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>CERTIFICATIONS:</span>{' '}
            {selected.certifications.map((c) => c.name).join(' · ') || 'In progress'}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>COMMUNICATION:</span> {selected.communicationStyle.join(' · ')}
          </p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>WORK PREFERENCES:</span>{' '}
            {selected.workPreferences.map((w) => w.preference).join(' · ') || 'Learning through observation'}
          </p>
        </ExecutiveSecondaryCard>
      ) : null}

      <ExecutiveFocusPanel title="ALL PROFESSIONAL PROFILES">
        {profile.profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelect(p.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: PROFESSIONAL_PROFILE_ACCENT, fontWeight: 515 }}>
              {p.displayName} · evolution {p.evolutionScore}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {p.currentRole} · {p.timelineEventCount} timeline events
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTimeline = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROFESSIONAL TIMELINE™ — CAREER GROWTH">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Promotions · Projects · Awards · Certifications · Leadership · Skills · Businesses · Brains · Marketplace
        </p>
        {(selected ?? profile.profiles[0])?.professionalTimeline.map((event) => (
          <div key={event.id} className="mb-3 pl-2" style={{ borderLeft: `2px solid ${TIMELINE_COLOR[event.eventType] ?? PROFESSIONAL_PROFILE_ACCENT}` }}>
            <p className="text-[6px] font-futura" style={{ color: TIMELINE_COLOR[event.eventType] ?? PROFESSIONAL_PROFILE_ACCENT, fontWeight: 515 }}>
              {TIMELINE_EVENT_LABELS[event.eventType]} · {new Date(event.occurredAt).toLocaleDateString()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {event.title}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {event.description}
            </p>
          </div>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="TIMELINE EVENT TYPES">
        {Object.entries(TIMELINE_EVENT_LABELS).map(([key, label]) => {
          const count = profile.profiles.reduce(
            (s, p) => s + p.professionalTimeline.filter((e) => e.eventType === key).length,
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
    </ExecutivePageShell>
  );

  const renderPortfolio = () => (
    <ExecutivePageShell>
      {selected ? (
        <>
          <ExecutiveFocusPanel title="PORTFOLIO & PROJECTS">
            {selected.portfolio.map((item) => (
              <p key={item.id} className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · [{item.type.toUpperCase()}] {item.title} — {item.summary}
              </p>
            ))}
            {selected.projects.map((proj) => (
              <p key={proj.id} className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · [PROJECT] {proj.title} — {proj.outcome}
              </p>
            ))}
          </ExecutiveFocusPanel>
          <ExecutiveFocusPanel title="MENTORSHIP & LEADERSHIP">
            {selected.mentorship.map((m) => (
              <p key={m.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {m.role === 'mentor' ? 'Mentors' : 'Mentored by'} {m.counterpart} — {m.focus}
              </p>
            ))}
            {selected.leadershipHistory.map((l) => (
              <p key={l.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {l.title} ({l.period}) — {l.impact}
              </p>
            ))}
          </ExecutiveFocusPanel>
          <ExecutiveFocusPanel title="ACADEMY & LEARNING">
            {selected.academyProgress.map((a) => (
              <p key={a.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {a.title}: {a.progressPct}% · {a.status}
              </p>
            ))}
          </ExecutiveFocusPanel>
        </>
      ) : null}
    </ExecutivePageShell>
  );

  const renderSources = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SYNCED SOURCES">
        {profile.syncedSources.map((s) => (
          <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {s}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={handleRefresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PROFESSIONAL_PROFILE_ACCENT, color: PROFESSIONAL_PROFILE_ACCENT }}>
        REFRESH PROFESSIONAL PROFILES →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="professional-profile" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? PROFESSIONAL_PROFILE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? PROFESSIONAL_PROFILE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(13,148,136,0.06)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'profiles' && renderProfiles()}
      {tab === 'timeline' && renderTimeline()}
      {tab === 'portfolio' && renderPortfolio()}
      {tab === 'sources' && renderSources()}
    </div>
  );
}
