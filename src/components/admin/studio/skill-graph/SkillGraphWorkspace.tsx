import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkillGraphState } from '../../../../hooks/useSkillGraphState';
import {
  SKILL_CATEGORY_LABELS,
  SKILL_GRAPH_ACCENT,
  SKILL_GRAPH_PHILOSOPHY,
  SKILL_RELATIONSHIP_LABELS,
  getSelectedSkill,
  querySkillGraph,
  refreshSkillGraph,
  selectSkill,
} from '../../../../studio-os-core/skill-graph';
import {
  adminStudioProfessionalProfilePath,
  adminStudioIdentityGraphPath,
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

type SkillTab = 'overview' | 'skills' | 'relationships' | 'intelligence' | 'sources';

const TABS: { id: SkillTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'relationships', label: 'RELATIONSHIPS' },
  { id: 'intelligence', label: 'STUDIO INTELLIGENCE™' },
  { id: 'sources', label: 'SOURCES' },
];


const SEVERITY_COLOR: Record<string, string> = {
  info: '#6366F1',
  watch: '#F59E0B',
  attention: '#F97316',
  urgent: '#EF4444',
};

export function SkillGraphWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SkillTab>('overview');
  const [searchQuery, setSearchQuery] = useState('seo');
  const { profile, refresh } = useSkillGraphState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SKILL GRAPH™ LOADING — MAPPING ORGANIZATIONAL CAPABILITIES
      </p>
    );
  }

  const selected = getSelectedSkill(profile);
  const searchHits = querySkillGraph(searchQuery, profile, 8);

  const handleSelect = (id: string) => {
    selectSkill(profile.organizationId, id);
    refresh();
    setTab('skills');
  };

  const handleRefresh = () => {
    refreshSkillGraph(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 165 · SKILL GRAPH™ · ORGANIZATIONAL CAPABILITY INTELLIGENCE"
        title={profile.companyName.toUpperCase()}
        subtitle="Who knows what. Who can teach it. Who needs help. Who should collaborate. Skills as searchable assets."
        progressPct={profile.graphScore}
        stats={[
          { label: 'SKILLS', value: `${profile.skillsTracked}` },
          { label: 'MENTORS', value: `${profile.mentorsAvailable}` },
          { label: 'GAPS', value: `${profile.gapsDetected}` },
          { label: 'CATEGORIES', value: `${profile.categoriesRepresented}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.graphScore} size={56} label="SG" accent={SKILL_GRAPH_ACCENT} />
        <div>
          {SKILL_GRAPH_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="SEARCHABLE ASSETS — KNOWLEDGE VISIBLE">
        <p className="text-[6px] font-futura" style={{ color: SKILL_GRAPH_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockSkillLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ PREVIEW">
        {profile.insights.slice(0, 3).map((i) => (
          <p key={i.id} className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[i.severity] ?? ADMIN_STUDIO_THEME.textSecondary }}>
            · {i.insight}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('intelligence')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: SKILL_GRAPH_ACCENT, color: SKILL_GRAPH_ACCENT }}>
        STUDIO INTELLIGENCE™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioProfessionalProfilePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROFESSIONAL PROFILE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioIdentityGraphPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        IDENTITY GRAPH →
      </button>
    </ExecutivePageShell>
  );

  const renderSkills = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SEARCH SKILLS">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills, people, departments…"
          className="w-full text-[7px] font-futura uppercase px-2 py-1 mb-2 border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((h) => (
          <button
            key={`${h.type}-${h.id}`}
            type="button"
            onClick={() => h.type === 'skill' && handleSelect(h.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: SKILL_GRAPH_ACCENT, fontWeight: 515 }}>
              {h.label}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {h.matchReason}
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>

      {selected ? (
        <ExecutiveSecondaryCard title={`${selected.name.toUpperCase()} · SKILL NODE`}>
          <p className="text-[6px] font-futura mb-2" style={{ color: SKILL_GRAPH_ACCENT, fontWeight: 515 }}>
            {selected.categoryLabel} · demand {selected.demandScore}% · gap {selected.gapSeverity}
          </p>
          <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            {selected.description}
          </p>
          <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ fontWeight: 515 }}>HOLDERS:</span> {selected.holderCount} · experts {selected.expertCount} · mentors {selected.mentorCount}
          </p>
          {selected.holders.map((h) => (
            <p key={h.personId} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {h.personName} ({h.proficiency}) — {h.department}
              {h.canTeach ? ' · CAN TEACH' : ''}{h.needsHelp ? ' · NEEDS HELP' : ''}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      ) : null}

      <ExecutiveFocusPanel title="SKILL CATEGORIES">
        {Object.entries(SKILL_CATEGORY_LABELS).map(([key, label]) => {
          const count = profile.skills.filter((s) => s.category === key).length;
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

  const renderRelationships = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SKILL RELATIONSHIPS">
        {profile.relationships.map((r) => (
          <div key={r.id} className="mb-2">
            <p className="text-[6px] font-futura" style={{ color: SKILL_GRAPH_ACCENT, fontWeight: 515 }}>
              {r.fromSkillName} → {r.toSkillName}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {r.relationshipTypeLabel} · strength {r.strength}% · {r.summary}
            </p>
          </div>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="RELATIONSHIP TYPES">
        {Object.entries(SKILL_RELATIONSHIP_LABELS).map(([key, label]) => {
          const count = profile.relationships.filter((r) => r.relationshipType === key).length;
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
      <ExecutiveFocusPanel title="DEPARTMENT SKILL SUMMARIES">
        {profile.departmentSummaries.map((d) => (
          <p key={d.department} className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · <span style={{ fontWeight: 515 }}>{d.department}</span>: {d.skillCount} skills · {d.expertCount} experts · {d.gapCount} gaps
            {d.missingSkills.length ? ` · missing: ${d.missingSkills.join(', ')}` : ''}
          </p>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSources = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="GRAPH DOMAINS">
        {profile.domainStatuses.map((d) => (
          <p key={d.domain} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {d.label}: {d.score}% — {d.summary}
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
      <button type="button" onClick={handleRefresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: SKILL_GRAPH_ACCENT, color: SKILL_GRAPH_ACCENT }}>
        REFRESH SKILL GRAPH →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="skill-graph" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? SKILL_GRAPH_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? SKILL_GRAPH_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(225,29,72,0.06)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'skills' && renderSkills()}
      {tab === 'relationships' && renderRelationships()}
      {tab === 'intelligence' && renderIntelligence()}
      {tab === 'sources' && renderSources()}
    </div>
  );
}
