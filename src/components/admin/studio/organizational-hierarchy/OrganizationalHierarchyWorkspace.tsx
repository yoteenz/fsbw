import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationalHierarchyState } from '../../../../hooks/useOrganizationalHierarchyState';
import {
  HIERARCHY_LINK_LABELS,
  HIERARCHY_NODE_LABELS,
  ORGANIZATIONAL_HIERARCHY_ACCENT,
  ORGANIZATIONAL_HIERARCHY_PHILOSOPHY,
  STRUCTURE_TYPE_LABELS,
  getSelectedNode,
  queryOrganizationalHierarchy,
  refreshOrganizationalHierarchy,
  selectHierarchyNode,
} from '../../../../studio-os-core/organizational-hierarchy';
import {
  adminStudioRoleIntelligencePath,
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

type HierarchyTab = 'overview' | 'structure' | 'connections' | 'intelligence' | 'sources';

const TABS: { id: HierarchyTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'structure', label: 'STRUCTURE' },
  { id: 'connections', label: 'CONNECTIONS' },
  { id: 'intelligence', label: 'STUDIO INTELLIGENCE™' },
  { id: 'sources', label: 'SOURCES' },
];

const SEVERITY_COLOR: Record<string, string> = {
  info: '#0F766E',
  watch: '#F59E0B',
  attention: '#F97316',
};

const NODE_TYPE_ORDER = [
  'founder',
  'executive',
  'department',
  'team',
  'manager',
  'employee',
  'contractor',
  'partner',
  'advisor',
  'shared-service',
  'organization',
  'location',
  'project-team',
] as const;

export function OrganizationalHierarchyWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<HierarchyTab>('overview');
  const [searchQuery, setSearchQuery] = useState('operations');
  const { profile, refresh } = useOrganizationalHierarchyState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATIONAL HIERARCHY™ LOADING — MAPPING HOW THE ORGANIZATION FUNCTIONS
      </p>
    );
  }

  const selected = getSelectedNode(profile);
  const searchHits = queryOrganizationalHierarchy(searchQuery, profile, 8);

  const handleSelect = (id: string) => {
    selectHierarchyNode(profile.organizationId, id);
    refresh();
    setTab('structure');
  };

  const handleRefresh = () => {
    refreshOrganizationalHierarchy(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 167 · ORGANIZATIONAL HIERARCHY™ · HOW ORGANIZATIONS ACTUALLY FUNCTION"
        title={profile.companyName.toUpperCase()}
        subtitle="Maps how every person, department, team, and organization connects — matrix lines, shared services, and approval routes included."
        progressPct={profile.hierarchyScore}
        stats={[
          { label: 'NODES', value: `${profile.nodesMapped}` },
          { label: 'LINKS', value: `${profile.linksMapped}` },
          { label: 'DEPTS', value: `${profile.departmentsCount}` },
          { label: 'MATRIX', value: `${profile.matrixAssignments}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.hierarchyScore} size={56} label="OH" accent={ORGANIZATIONAL_HIERARCHY_ACCENT} />
        <div>
          {ORGANIZATIONAL_HIERARCHY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="FUNCTION — NOT JUST ORG CHART">
        <p className="text-[6px] font-futura" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockHierarchyLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="HIERARCHY LAYERS">
        {NODE_TYPE_ORDER.map((type) => {
          const count = profile.nodes.filter((n) => n.nodeType === type).length;
          if (!count) return null;
          return (
            <p key={type} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              · {HIERARCHY_NODE_LABELS[type]}: {count}
            </p>
          );
        })}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="STRUCTURE SUPPORT">
        {profile.structureSupport
          .filter((s) => s.active)
          .map((s) => (
            <p key={s.structureType} className="text-[6px] font-futura mb-1" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT }}>
              · {s.structureTypeLabel}: {s.nodeCount} nodes
            </p>
          ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ PREVIEW">
        {profile.insights.slice(0, 3).map((i) => (
          <p key={i.id} className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[i.severity] ?? ADMIN_STUDIO_THEME.textSecondary }}>
            · {i.insight}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('intelligence')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ORGANIZATIONAL_HIERARCHY_ACCENT, color: ORGANIZATIONAL_HIERARCHY_ACCENT }}>
        STUDIO INTELLIGENCE™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioRoleIntelligencePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ROLE INTELLIGENCE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioIdentityGraphPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        IDENTITY GRAPH →
      </button>
    </ExecutivePageShell>
  );

  const renderStructure = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SEARCH HIERARCHY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people, departments, teams, routes…"
          className="w-full text-[7px] font-futura uppercase px-2 py-1 mb-2 border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((h) => (
          <button
            key={`${h.type}-${h.id}`}
            type="button"
            onClick={() => h.type === 'node' && handleSelect(h.id)}
            className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer"
          >
            <p className="text-[6px] font-futura" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT, fontWeight: 515 }}>
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
          <ExecutiveSecondaryCard title={`${selected.label.toUpperCase()} · HIERARCHY NODE`}>
            <p className="text-[6px] font-futura mb-2" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT, fontWeight: 515 }}>
              {selected.nodeTypeLabel}
              {selected.department ? ` · ${selected.department}` : ''}
              {selected.location ? ` · ${selected.location}` : ''}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {selected.summary}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>MANAGER:</span>{' '}
              {selected.managerName ?? 'No active manager'}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ fontWeight: 515 }}>STRUCTURES:</span>{' '}
              {selected.structureTypes.map((t) => STRUCTURE_TYPE_LABELS[t]).join(' · ')}
            </p>
          </ExecutiveSecondaryCard>

          <ExecutiveFocusPanel title="PARENT CONNECTIONS">
            {selected.parentIds.length ? (
              selected.parentIds.map((pid) => {
                const parent = profile.nodes.find((n) => n.id === pid);
                return parent ? (
                  <button key={pid} type="button" onClick={() => handleSelect(pid)} className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer">
                    <p className="text-[6px] font-futura" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT }}>
                      ↑ {parent.label} ({parent.nodeTypeLabel})
                    </p>
                  </button>
                ) : null;
              })
            ) : (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Root-level node
              </p>
            )}
          </ExecutiveFocusPanel>

          <ExecutiveFocusPanel title="CHILD CONNECTIONS">
            {selected.childIds.length ? (
              selected.childIds.map((cid) => {
                const child = profile.nodes.find((n) => n.id === cid);
                return child ? (
                  <button key={cid} type="button" onClick={() => handleSelect(cid)} className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer">
                    <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                      ↓ {child.label} ({child.nodeTypeLabel})
                    </p>
                  </button>
                ) : null;
              })
            ) : (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                No child nodes
              </p>
            )}
          </ExecutiveFocusPanel>
        </>
      ) : null}

      <ExecutiveFocusPanel title="ALL NODES BY TYPE">
        {NODE_TYPE_ORDER.map((type) => {
          const nodes = profile.nodes.filter((n) => n.nodeType === type);
          if (!nodes.length) return null;
          return (
            <div key={type} className="mb-2">
              <p className="text-[6px] font-futura mb-1" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT, fontWeight: 515 }}>
                {HIERARCHY_NODE_LABELS[type]}
              </p>
              {nodes.slice(0, 4).map((n) => (
                <button key={n.id} type="button" onClick={() => handleSelect(n.id)} className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer">
                  <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    · {n.label}{!n.managerName && n.nodeType === 'team' ? ' · NO MANAGER' : ''}
                  </p>
                </button>
              ))}
            </div>
          );
        })}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderConnections = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="APPROVAL ROUTES">
        {profile.approvalRoutes.map((r) => (
          <div key={r.id} className="mb-2">
            <p className="text-[6px] font-futura" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT, fontWeight: 515 }}>
              {r.label}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {r.steps.join(' → ')}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {r.reason}
            </p>
          </div>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="HIERARCHY LINKS">
        {profile.links.map((l) => (
          <div key={l.id} className="mb-2">
            <p className="text-[6px] font-futura" style={{ color: ORGANIZATIONAL_HIERARCHY_ACCENT, fontWeight: 515 }}>
              {l.fromLabel} → {l.toLabel}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {HIERARCHY_LINK_LABELS[l.linkType]} · strength {l.strength}% · {l.summary}
            </p>
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
      <button type="button" onClick={handleRefresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ORGANIZATIONAL_HIERARCHY_ACCENT, color: ORGANIZATIONAL_HIERARCHY_ACCENT }}>
        REFRESH HIERARCHY →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="organizational-hierarchy" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ORGANIZATIONAL_HIERARCHY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ORGANIZATIONAL_HIERARCHY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(15,118,110,0.06)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'structure' && renderStructure()}
      {tab === 'connections' && renderConnections()}
      {tab === 'intelligence' && renderIntelligence()}
      {tab === 'sources' && renderSources()}
    </div>
  );
}
