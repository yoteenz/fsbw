import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleIntelligenceState } from '../../../../hooks/useRoleIntelligenceState';
import {
  DECISION_AUTHORITY_LABELS,
  ROLE_EVOLUTION_LABELS,
  ROLE_INTELLIGENCE_ACCENT,
  ROLE_INTELLIGENCE_PHILOSOPHY,
  ROLE_TEMPLATE_LABELS,
  getSelectedRole,
  queryRoleIntelligence,
  refreshRoleIntelligence,
  selectRole,
} from '../../../../studio-os-core/role-intelligence';
import {
  adminStudioSkillGraphPath,
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

type RoleTab = 'overview' | 'roles' | 'evolution' | 'intelligence' | 'sources';

const TABS: { id: RoleTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'roles', label: 'ROLES' },
  { id: 'evolution', label: 'ROLE EVOLUTION™' },
  { id: 'intelligence', label: 'STUDIO INTELLIGENCE™' },
  { id: 'sources', label: 'SOURCES' },
];

const SEVERITY_COLOR: Record<string, string> = {
  info: '#0369A1',
  watch: '#F59E0B',
  attention: '#F97316',
};

export function RoleIntelligenceWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RoleTab>('overview');
  const [searchQuery, setSearchQuery] = useState('project manager');
  const { profile, refresh } = useRoleIntelligenceState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ROLE INTELLIGENCE™ LOADING — MAPPING ACTUAL RESPONSIBILITIES
      </p>
    );
  }

  const selected = getSelectedRole(profile);
  const searchHits = queryRoleIntelligence(searchQuery, profile, 8);

  const handleSelect = (id: string) => {
    selectRole(profile.organizationId, id);
    refresh();
    setTab('roles');
  };

  const handleRefresh = () => {
    refreshRoleIntelligence(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 166 · ROLE INTELLIGENCE™ · UNDERSTAND WORK, NOT TITLES"
        title={profile.companyName.toUpperCase()}
        subtitle="Two people with the same title may perform completely different work. Studio OS understands actual responsibilities."
        progressPct={profile.intelligenceScore}
        stats={[
          { label: 'ROLES', value: `${profile.rolesDefined}` },
          { label: 'PEOPLE', value: `${profile.peopleMapped}` },
          { label: 'GAPS', value: `${profile.titleWorkGaps}` },
          { label: 'AI PAIRS', value: `${profile.aiCounterpartsActive}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.intelligenceScore} size={56} label="RI" accent={ROLE_INTELLIGENCE_ACCENT} />
        <div>
          {ROLE_INTELLIGENCE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="WORK — NOT TITLES">
        <p className="text-[6px] font-futura" style={{ color: ROLE_INTELLIGENCE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRoleLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="ROLE TEMPLATES">
        {Object.entries(ROLE_TEMPLATE_LABELS).map(([key, label]) => {
          const role = profile.roles.find((r) => r.roleKey === key);
          if (!role) return null;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(role.id)}
              className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer"
            >
              <p className="text-[6px] font-futura" style={{ color: ROLE_INTELLIGENCE_ACCENT, fontWeight: 515 }}>
                · {label}
                {role.titleVsWorkGap ? ' · TITLE GAP' : ''}
              </p>
            </button>
          );
        })}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ PREVIEW">
        {profile.insights.slice(0, 3).map((i) => (
          <p key={i.id} className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[i.severity] ?? ADMIN_STUDIO_THEME.textSecondary }}>
            · {i.insight}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('intelligence')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ROLE_INTELLIGENCE_ACCENT, color: ROLE_INTELLIGENCE_ACCENT }}>
        STUDIO INTELLIGENCE™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioSkillGraphPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SKILL GRAPH →
      </button>
      <button type="button" onClick={() => navigate(adminStudioProfessionalProfilePath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROFESSIONAL PROFILE →
      </button>
    </ExecutivePageShell>
  );

  const renderRoles = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SEARCH ROLES & RESPONSIBILITIES">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roles, responsibilities, workflows…"
          className="w-full text-[7px] font-futura uppercase px-2 py-1 mb-2 border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((h) => (
          <button
            key={`${h.type}-${h.id}`}
            type="button"
            onClick={() => h.type === 'role' && handleSelect(h.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: ROLE_INTELLIGENCE_ACCENT, fontWeight: 515 }}>
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
          <ExecutiveSecondaryCard title={`${selected.title.toUpperCase()} · ROLE DEFINITION`}>
            <p className="text-[6px] font-futura mb-2" style={{ color: ROLE_INTELLIGENCE_ACCENT, fontWeight: 515 }}>
              {selected.department} · {selected.decisionAuthorityLabel} · {selected.evolutionStageLabel}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {selected.actualWorkSummary}
            </p>
            {selected.titleVsWorkGap ? (
              <p className="text-[6px] font-futura mb-2" style={{ color: '#F59E0B', fontWeight: 515 }}>
                TITLE GAP: {selected.titleVsWorkGap}
              </p>
            ) : null}
            {selected.peopleNames.length ? (
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                <span style={{ fontWeight: 515 }}>PEOPLE:</span> {selected.peopleNames.join(', ')}
              </p>
            ) : null}
          </ExecutiveSecondaryCard>

          <ExecutiveFocusPanel title="RESPONSIBILITIES">
            {selected.responsibilities.map((r) => (
              <p key={r} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {r}
              </p>
            ))}
          </ExecutiveFocusPanel>

          <ExecutiveFocusPanel title="DAILY WORKFLOWS">
            {selected.dailyWorkflows.map((w) => (
              <div key={w.id} className="mb-2">
                <p className="text-[6px] font-futura" style={{ color: ROLE_INTELLIGENCE_ACCENT, fontWeight: 515 }}>
                  {w.label} ({w.frequency})
                </p>
                {w.steps.map((s) => (
                  <p key={s} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    → {s}
                  </p>
                ))}
              </div>
            ))}
          </ExecutiveFocusPanel>

          <ExecutiveFocusPanel title="DECISION AUTHORITY">
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {DECISION_AUTHORITY_LABELS[selected.decisionAuthority]} — scope:
            </p>
            {selected.authorityScope.map((s) => (
              <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {s}
              </p>
            ))}
          </ExecutiveFocusPanel>

          <ExecutiveFocusPanel title="REQUIRED SKILLS · BRAINS · DOCUMENTS · AUTOMATIONS">
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>SKILLS:</span> {selected.requiredSkills.join(' · ')}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>BRAINS:</span> {selected.relatedProfessionBrains.join(' · ')}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>DOCUMENTS:</span> {selected.requiredDocuments.join(' · ')}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>AUTOMATIONS:</span> {selected.requiredAutomations.join(' · ')}
            </p>
          </ExecutiveFocusPanel>

          <ExecutiveFocusPanel title="PERFORMANCE METRICS · LEARNING">
            {selected.performanceMetrics.map((m) => (
              <p key={m.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {m.label}: {m.current} (target {m.target})
              </p>
            ))}
            {selected.learningRequirements.map((l) => (
              <p key={l} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {l}
              </p>
            ))}
          </ExecutiveFocusPanel>

          <ExecutiveFocusPanel title="AI EMPLOYEE COUNTERPARTS">
            {selected.aiCounterparts.map((a) => (
              <div key={a.id} className="mb-2">
                <p className="text-[6px] font-futura" style={{ color: ROLE_INTELLIGENCE_ACCENT, fontWeight: 515 }}>
                  {a.name}
                </p>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {a.capabilities.join(' · ')} · oversight: {a.humanOversight}
                </p>
              </div>
            ))}
          </ExecutiveFocusPanel>
        </>
      ) : null}
    </ExecutivePageShell>
  );

  const renderEvolution = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ROLE EVOLUTION™ — AS ORGANIZATIONS GROW">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.evolutionEventsTotal} evolution events tracked. Studio Intelligence™ continuously updates role definitions.
        </p>
        {profile.roles.map((role) => (
          <div key={role.id} className="mb-3">
            <button type="button" onClick={() => handleSelect(role.id)} className="bg-transparent border-0 cursor-pointer p-0 text-left">
              <p className="text-[6px] font-futura" style={{ color: ROLE_INTELLIGENCE_ACCENT, fontWeight: 515 }}>
                {role.title} — {ROLE_EVOLUTION_LABELS[role.evolutionStage]} ({role.evolutionScore}%)
              </p>
            </button>
            {role.evolutionEvents.map((e) => (
              <p key={e.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {e.title} — {e.description}
              </p>
            ))}
          </div>
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
      <button type="button" onClick={handleRefresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ROLE_INTELLIGENCE_ACCENT, color: ROLE_INTELLIGENCE_ACCENT }}>
        REFRESH ROLE INTELLIGENCE →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="role-intelligence" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ROLE_INTELLIGENCE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ROLE_INTELLIGENCE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(3,105,161,0.06)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'roles' && renderRoles()}
      {tab === 'evolution' && renderEvolution()}
      {tab === 'intelligence' && renderIntelligence()}
      {tab === 'sources' && renderSources()}
    </div>
  );
}
