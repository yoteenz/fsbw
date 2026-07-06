import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdentityGraphState } from '../../../../hooks/useIdentityGraphState';
import {
  IDENTITY_GRAPH_ACCENT,
  IDENTITY_GRAPH_PHILOSOPHY,
  IDENTITY_TYPE_LABELS,
  RELATIONSHIP_EDGE_LABELS,
  getSelectedPerson,
  queryIdentityGraph,
  refreshIdentityGraph,
  selectIdentityPerson,
} from '../../../../studio-os-core/identity-graph';
import {
  adminStudioRelationshipMemoryPath,
  adminStudioOrganizationalGuardianPath,
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

type IdentityTab = 'overview' | 'people' | 'relationships' | 'graph' | 'sources';

const TABS: { id: IdentityTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'people', label: 'PEOPLE' },
  { id: 'relationships', label: 'RELATIONSHIPS' },
  { id: 'graph', label: 'GRAPH' },
  { id: 'sources', label: 'SOURCES' },
];

const TYPE_COLOR: Record<string, string> = {
  founder: '#7C3AED',
  employee: '#2563EB',
  customer: '#059669',
  expert: '#D97706',
  vendor: '#6B7280',
  partner: '#EC4899',
  investor: '#0891B2',
  advisor: '#8B5CF6',
  contractor: '#F59E0B',
  applicant: '#94A3B8',
};

export function IdentityGraphWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<IdentityTab>('overview');
  const [searchQuery, setSearchQuery] = useState('founder');
  const { profile, refresh } = useIdentityGraphState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        IDENTITY GRAPH™ LOADING — MAPPING PEOPLE AS FIRST-CLASS CITIZENS
      </p>
    );
  }

  const selected = getSelectedPerson(profile);
  const searchHits = queryIdentityGraph(searchQuery, profile, 8);

  const handleSelectPerson = (id: string) => {
    selectIdentityPerson(profile.organizationId, id);
    refresh();
    setTab('people');
  };

  const handleRefresh = () => {
    refreshIdentityGraph(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 163 · IDENTITY GRAPH™ · FOUNDATIONAL PEOPLE INTELLIGENCE"
        title={profile.companyName.toUpperCase()}
        subtitle="Every identity becomes a living profile — relationships, expertise, responsibilities, history, and organizational context. People are first-class citizens."
        progressPct={profile.graphScore}
        stats={[
          { label: 'PEOPLE', value: `${profile.peopleCount}` },
          { label: 'RELATIONSHIPS', value: `${profile.relationshipCount}` },
          { label: 'IDENTITY TYPES', value: `${profile.identityTypesRepresented}` },
          { label: 'DEPARTMENTS', value: `${profile.departmentsMapped}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.graphScore} size={56} label="IG" accent={IDENTITY_GRAPH_ACCENT} />
        <div>
          {IDENTITY_GRAPH_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PEOPLE FIRST — ORGANIZATIONS BUILT FROM PEOPLE">
        <p className="text-[6px] font-futura" style={{ color: IDENTITY_GRAPH_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockIdentityLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="IDENTITY CLUSTERS">
        {profile.clusters.slice(0, 6).map((c) => (
          <p key={c.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {c.label}: {c.personCount} people · {c.relationshipCount} relationships
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="GRAPH DOMAINS">
        {profile.domainStatuses.slice(0, 4).map((d) => (
          <p key={d.domain} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {d.label}: {d.score}% — {d.summary}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('people')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: IDENTITY_GRAPH_ACCENT, color: IDENTITY_GRAPH_ACCENT }}>
        EXPLORE PEOPLE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioRelationshipMemoryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        RELATIONSHIP MEMORY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioOrganizationalGuardianPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATIONAL GUARDIAN →
      </button>
    </ExecutivePageShell>
  );

  const renderPeople = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SEARCH PEOPLE">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people, roles, expertise…"
          className="w-full text-[7px] font-futura uppercase px-2 py-1 mb-2 border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((h) => (
          <button
            key={`${h.type}-${h.id}`}
            type="button"
            onClick={() => h.type === 'person' && handleSelectPerson(h.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: IDENTITY_GRAPH_ACCENT, fontWeight: 515 }}>
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
          <p className="text-[6px] font-futura mb-2" style={{ color: TYPE_COLOR[selected.identityType] ?? IDENTITY_GRAPH_ACCENT, fontWeight: 515 }}>
            {selected.identityTypeLabel} · {selected.role} · {selected.department}
          </p>
          <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {selected.personalSummary}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>SKILLS:</span> {selected.skills.join(' · ')}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>RESPONSIBILITIES:</span> {selected.responsibilities.join(' · ')}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>GOALS:</span> {selected.goals.join(' · ')}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>COMMUNICATION:</span> {selected.communicationPreferences.join(' · ')}
          </p>
          {selected.lifeCulturePreferences.length > 0 ? (
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>LIFE & CULTURE™:</span> {selected.lifeCulturePreferences.map((l) => l.preference).join(' · ')}
            </p>
          ) : null}
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Trust {selected.trustScore}% · {selected.relationshipCount} relationships · Permissions: {selected.permissions}
          </p>
        </ExecutiveSecondaryCard>
      ) : null}

      <ExecutiveFocusPanel title="ALL IDENTITIES">
        {profile.people.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectPerson(p.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
            style={{ opacity: p.id === profile.selectedPersonId ? 1 : 0.85 }}
          >
            <p className="text-[6px] font-futura" style={{ color: TYPE_COLOR[p.identityType] ?? IDENTITY_GRAPH_ACCENT, fontWeight: 515 }}>
              {p.displayName} · {IDENTITY_TYPE_LABELS[p.identityType]}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {p.role} · {p.department}
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderRelationships = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RELATIONSHIP TYPES">
        {Object.entries(RELATIONSHIP_EDGE_LABELS).map(([key, label]) => {
          const count = profile.relationships.filter((r) => r.edgeType === key).length;
          if (!count) return null;
          return (
            <p key={key} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {label}: {count} edges
            </p>
          );
        })}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="RELATIONSHIP EDGES">
        {profile.relationships.slice(0, 12).map((e) => (
          <div key={e.id} className="mb-2">
            <p className="text-[6px] font-futura" style={{ color: IDENTITY_GRAPH_ACCENT, fontWeight: 515 }}>
              {e.fromPersonName} → {e.toPersonName}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {e.edgeTypeLabel} · strength {e.strength}% · {e.summary}
            </p>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGraph = () => (
    <ExecutivePageShell>
      <ExecutiveSecondaryCard title="IDENTITY GRAPH™ — DOMAIN HEALTH">
        <div className="grid grid-cols-2 gap-2">
          {profile.domainStatuses.map((d) => (
            <div key={d.domain} className="py-2 px-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <p className="text-[7px] font-futura mb-1" style={{ color: IDENTITY_GRAPH_ACCENT, fontWeight: 515 }}>
                {d.score}%
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {d.label} · {d.count}
              </p>
            </div>
          ))}
        </div>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="ORGANIZATIONAL CONTEXT">
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.peopleCount} living profiles connected through {profile.relationshipCount} relationship edges.
        </p>
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Studio Intelligence™ understands reports-to, works-with, mentors, collaborates-with, ownership, clients served, teams, and organizations.
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSources = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SYNCED INTELLIGENCE SOURCES">
        {profile.syncedSources.map((s) => (
          <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {s}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="IDENTITY TYPES SUPPORTED">
        {Object.entries(IDENTITY_TYPE_LABELS).map(([key, label]) => (
          <p key={key} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
            {profile.people.some((p) => p.identityType === key) ? ' ✓' : ''}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={handleRefresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: IDENTITY_GRAPH_ACCENT, color: IDENTITY_GRAPH_ACCENT }}>
        REFRESH IDENTITY GRAPH →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="identity-graph" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? IDENTITY_GRAPH_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? IDENTITY_GRAPH_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(124,58,237,0.06)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'people' && renderPeople()}
      {tab === 'relationships' && renderRelationships()}
      {tab === 'graph' && renderGraph()}
      {tab === 'sources' && renderSources()}
    </div>
  );
}
