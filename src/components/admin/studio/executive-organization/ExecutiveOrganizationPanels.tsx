import { Link } from 'react-router-dom';
import type { ExecutiveOrganizationStore, ExecutiveHeadquarters, DepartmentHeadquarters } from '../../../../studio-os-core/executive-organization/types';
import type { ExecutiveId } from '../../../../studio-os-core/executive-organization/types';
import { adminStudioChiefOfStaffPath, adminStudioLeadershipDnaPath } from '../../../../utils/adminStudioRoutes';
import {
  EXECUTIVE_ORGANIZATION_STYLES,
  EO,
  eoDarkHeader,
  eoLabel,
  eoLiveDot,
  eoPanel,
  eoSectionTitle,
  eoValue,
  scoreColor,
} from './executiveOrganizationTheme';

type Props = {
  store: ExecutiveOrganizationStore;
  selectedExecutive: ExecutiveHeadquarters | null;
  selectedDepartment: DepartmentHeadquarters | null;
  onSelectExecutive: (id: ExecutiveId) => void;
  onSelectDepartment: (id: string) => void;
};

export function ExecutiveOrganizationHeader() {
  return (
    <>
      <style>{EXECUTIVE_ORGANIZATION_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...eoDarkHeader, borderTop: `3px solid ${EO.teal}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          EXECUTIVE ORGANIZATION
        </p>
        <p style={{ ...eoLabel, color: '#94A3B8' }}>
          <span style={eoLiveDot} />
          LIVING LEADERSHIP TEAM · DEPARTMENTS · TEAMS · WORKERS · ONE ORGANIZATION
        </p>
        <p style={{ ...eoLabel, color: '#CBD5E1', marginTop: 4 }}>
          FOUNDER LEADS · CHIEF OF STAFF COORDINATES · STUDIO INTELLIGENCE ADVISES · EVERYONE EXECUTES TOGETHER
        </p>
      </header>
    </>
  );
}

export function OrganizationDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>EXECUTIVE ORGANIZATION · HQ</p>
      <p style={{ ...eoLabel, color: EO.accent, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['EXECUTIVES', d.executiveCount],
          ['DEPARTMENTS', d.departmentCount],
          ['TEAMS', d.teamCount],
          ['WORKERS', d.workerCount],
          ['COLLABORATIONS', d.activeCollaborations],
          ['ORG HEALTH', `${d.overallOrgHealthPct}%`],
          ['CULTURE', `${d.cultureMaturityPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: EO.panelBorder }}>
            <p style={{ ...eoValue, fontSize: '13px' }}>{val}</p>
            <p style={eoLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OrgHierarchyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>ORGANIZATIONAL HIERARCHY</p>
      <div className="flex flex-col items-center gap-0">
        {store.hierarchyLevels.map((level, i) => (
          <div key={level.level} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-2" style={{ background: EO.teal }} /> : null}
            <div
              className="w-full px-2 py-1 text-[7px] font-futura text-center border"
              style={{
                borderColor: level.level === 'chief-of-staff' ? EO.teal : EO.panelBorder,
                background: level.level === 'chief-of-staff' ? 'rgba(13,148,136,0.08)' : 'white',
                fontWeight: 515,
              }}
            >
              {level.label}
              <p style={{ ...eoLabel, fontSize: '5px', margin: '2px 0 0' }}>{level.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExecutiveRosterPanel({ store, selectedExecutive, onSelectExecutive }: Pick<Props, 'store' | 'selectedExecutive' | 'onSelectExecutive'>) {
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>EXECUTIVE LEADERSHIP · SELECT HQ</p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {store.executives.filter((e) => e.id !== 'chief-of-staff').map((exec) => (
          <button
            key={exec.id}
            type="button"
            onClick={() => onSelectExecutive(exec.id)}
            className="p-2 text-left border"
            style={{
              borderColor: selectedExecutive?.id === exec.id ? EO.teal : EO.panelBorder,
              background: selectedExecutive?.id === exec.id ? 'rgba(13,148,136,0.06)' : 'white',
            }}
          >
            <p style={{ ...eoLabel, color: EO.teal, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{exec.title.toUpperCase()}</p>
            <p style={eoLabel}>{exec.department.toUpperCase()} · HEALTH {exec.departmentHealthPct}%</p>
            <p style={{ ...eoLabel, fontSize: '5px' }}>WORKLOAD {exec.teamWorkloadPct}% · PENDING {exec.pendingApprovals}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ExecutiveHeadquartersPanel({ selectedExecutive }: Pick<Props, 'selectedExecutive'>) {
  if (!selectedExecutive) return null;
  const e = selectedExecutive;
  return (
    <section className="p-3 mb-3" style={{ ...eoPanel, borderLeft: `4px solid ${EO.teal}` }}>
      <p style={eoSectionTitle}>EXECUTIVE HEADQUARTERS · {e.title.toUpperCase()}</p>
      <p style={eoLabel}>MISSION · {e.mission}</p>
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>PRIORITIES</p>
      {e.currentPriorities.map((p) => (
        <p key={p} style={eoLabel}>· {p}</p>
      ))}
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>INITIATIVES</p>
      {e.activeInitiatives.map((i) => (
        <p key={i} style={eoLabel}>· {i}</p>
      ))}
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>METRICS</p>
      {e.departmentMetrics.map((m) => (
        <p key={m.label} style={eoLabel}>{m.label} · {m.value}</p>
      ))}
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>STUDIO INTELLIGENCE</p>
      {e.studioIntelligenceRecommendations.map((r) => (
        <p key={r} style={{ ...eoLabel, color: EO.indigo }}>· {r}</p>
      ))}
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>RECENT DECISIONS</p>
      {e.recentDecisions.map((d) => (
        <p key={d} style={eoLabel}>· {d}</p>
      ))}
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>KNOWLEDGE GROWTH</p>
      {e.knowledgeGrowth.map((k) => (
        <p key={k} style={{ ...eoLabel, color: EO.green }}>· {k}</p>
      ))}
    </section>
  );
}

export function ExecutivePersonalityPanel({ selectedExecutive }: Pick<Props, 'selectedExecutive'>) {
  if (!selectedExecutive) return null;
  const p = selectedExecutive.personality;
  const sections: [string, string[]][] = [
    ['COMMUNICATION', p.communicationStyle],
    ['LEADERSHIP', p.leadershipStyle],
    ['STRENGTHS', p.strengths],
    ['PREFERENCES', p.preferences],
    ['DECISION TENDENCIES', p.decisionTendencies],
    ['EXPERTISE', p.expertise],
    ['EXPERIENCE', p.institutionalExperience],
    ['DNA ALIGNMENT', p.dnaAlignment],
  ];
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>EXECUTIVE PERSONALITY · NOT ROBOTIC</p>
      {sections.map(([title, items]) => (
        <div key={title} className="mt-2">
          <p style={{ ...eoSectionTitle, fontSize: '7px' }}>{title}</p>
          {items.map((item) => (
            <p key={item} style={eoLabel}>· {item}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function ExecutiveScorecardPanel({ selectedExecutive }: Pick<Props, 'selectedExecutive'>) {
  if (!selectedExecutive) return null;
  const s = selectedExecutive.scorecard;
  const dims: [string, number][] = [
    ['QUALITY', s.quality],
    ['SPEED', s.speed],
    ['INNOVATION', s.innovation],
    ['COMMUNICATION', s.communication],
    ['LEADERSHIP', s.leadership],
    ['RESOURCES', s.resourceUtilization],
    ['KNOWLEDGE', s.knowledgeContribution],
    ['COLLABORATION', s.crossFunctionalCollaboration],
  ];
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>EXECUTIVE SCORECARD · {s.overallPct}% OVERALL</p>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {dims.map(([label, val]) => (
          <div key={label} className="p-1 border text-center" style={{ borderColor: EO.panelBorder }}>
            <p style={{ ...eoValue, fontSize: '12px', color: scoreColor(val) }}>{val}%</p>
            <p style={{ ...eoLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DepartmentHeadquartersPanel({ store, selectedDepartment, onSelectDepartment }: Pick<Props, 'store' | 'selectedDepartment' | 'onSelectDepartment'>) {
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>DEPARTMENT HEADQUARTERS</p>
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {store.departments.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelectDepartment(d.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: selectedDepartment?.id === d.id ? EO.teal : EO.panelBorder,
              color: selectedDepartment?.id === d.id ? EO.teal : EO.gray,
            }}
          >
            {d.name}
          </button>
        ))}
      </div>
      {selectedDepartment ? (
        <>
          <p style={{ ...eoLabel, color: EO.teal, fontFamily: '"Futura PT Medium"' }}>{selectedDepartment.name} · HEALTH {selectedDepartment.healthPct}%</p>
          <p style={eoLabel}>CAPACITY {selectedDepartment.capacityPct}% · BACKLOG {selectedDepartment.backlogCount}</p>
          <p style={{ ...eoSectionTitle, marginTop: 8 }}>OBJECTIVES</p>
          {selectedDepartment.objectives.map((o) => (
            <p key={o} style={eoLabel}>· {o}</p>
          ))}
          <p style={{ ...eoSectionTitle, marginTop: 8 }}>QUARTERLY OKRs</p>
          {selectedDepartment.quarterlyObjectives.map((o) => (
            <p key={o} style={eoLabel}>· {o}</p>
          ))}
          {selectedDepartment.keyResults.map((kr) => (
            <p key={kr} style={{ ...eoLabel, color: EO.indigo }}>KR · {kr}</p>
          ))}
          <p style={{ ...eoSectionTitle, marginTop: 8 }}>TEAMS</p>
          {selectedDepartment.teams.map((t) => (
            <p key={t.id} style={eoLabel}>{t.name} · {t.workerIds.length} workers · {t.skills.join(' · ')}</p>
          ))}
          <p style={{ ...eoSectionTitle, marginTop: 8 }}>CROSS-FUNCTIONAL</p>
          {selectedDepartment.crossFunctionalPartners.map((p) => (
            <p key={p} style={eoLabel}>· {p}</p>
          ))}
        </>
      ) : null}
    </section>
  );
}

export function DepartmentPlaybooksPanel({ selectedDepartment }: Pick<Props, 'selectedDepartment'>) {
  if (!selectedDepartment) return null;
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>DEPARTMENT PLAYBOOK · {selectedDepartment.name}</p>
      <p style={{ ...eoSectionTitle, fontSize: '7px' }}>STANDARDS</p>
      {selectedDepartment.playbookStandards.map((s) => (
        <p key={s} style={eoLabel}>· {s}</p>
      ))}
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>CHECKLISTS</p>
      {selectedDepartment.playbookChecklists.map((c) => (
        <p key={c} style={eoLabel}>· {c}</p>
      ))}
      <p style={{ ...eoSectionTitle, marginTop: 8 }}>COMPLETED MILESTONES</p>
      {selectedDepartment.completedMilestones.map((m) => (
        <p key={m} style={{ ...eoLabel, color: EO.green }}>· {m}</p>
      ))}
    </section>
  );
}

export function WorkerArchitecturePanel({ store, selectedDepartment }: Pick<Props, 'store' | 'selectedDepartment'>) {
  const workers = selectedDepartment
    ? store.workers.filter((w) => w.departmentId === selectedDepartment.id)
    : store.workers.slice(0, 8);
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>WORKER ARCHITECTURE</p>
      {workers.map((w) => (
        <div key={w.id} className="p-2 mb-1 border" style={{ borderColor: EO.panelBorder }}>
          <p style={{ ...eoLabel, color: EO.accent, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{w.name.toUpperCase()} · {w.type.replace('-', ' ').toUpperCase()}</p>
          <p style={eoLabel}>{w.role} · {w.skills.join(' · ')}</p>
          <p style={{ ...eoLabel, fontSize: '6px' }}>AVAIL {w.availabilityPct}% · PERF {w.performancePct}% · CAP {w.capacityPct}%</p>
        </div>
      ))}
    </section>
  );
}

export function CollaborationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>EXECUTIVE COLLABORATION · AUTOMATIC</p>
      {store.collaborations.map((c) => {
        const from = store.executives.find((e) => e.id === c.fromExecutiveId);
        const to = store.executives.find((e) => e.id === c.toExecutiveId);
        return (
          <div key={c.id} className="p-2 mb-1 border" style={{ borderColor: c.status === 'complete' ? EO.green : EO.panelBorder }}>
            <p style={{ ...eoLabel, color: EO.teal, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
              {from?.title.toUpperCase()} → {to?.title.toUpperCase()}
            </p>
            <p style={eoLabel}>{c.request}</p>
            <p style={{ ...eoLabel, fontSize: '6px' }}>{c.status.toUpperCase()} · {c.automated ? 'AUTOMATED' : 'MANUAL'}</p>
          </div>
        );
      })}
      <Link to={adminStudioChiefOfStaffPath()} style={{ ...eoLabel, color: EO.gold, display: 'inline-block', marginTop: 6 }}>
        → CHIEF OF STAFF COORDINATES ALL
      </Link>
    </section>
  );
}

export function OrganizationalMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>ORGANIZATIONAL MEMORY · DEPARTMENT KNOWLEDGE</p>
      {store.organizationalMemory.map((m) => (
        <div key={m.id} className="p-2 mb-1 border" style={{ borderColor: EO.panelBorder }}>
          <p style={{ ...eoLabel, color: EO.indigo, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
            {m.type.toUpperCase().replace('-', ' ')} · {m.title.toUpperCase()}
          </p>
          <p style={eoLabel}>{m.detail}</p>
          {m.transferable ? <p style={{ ...eoLabel, color: EO.green, fontSize: '6px' }}>TRANSFERABLE ACROSS TEAMS</p> : null}
        </div>
      ))}
    </section>
  );
}

export function ExecutiveMeetingsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...eoPanel, borderLeft: `4px solid ${EO.gold}` }}>
      <p style={eoSectionTitle}>EXECUTIVE MEETINGS · CoS MODERATED</p>
      <p style={eoLabel}>Studio Intelligence prepares agendas · founder joins when appropriate</p>
      {store.meetings.map((m) => (
        <div key={m.id} className="p-2 mb-1 border" style={{ borderColor: EO.panelBorder }}>
          <p style={{ ...eoLabel, color: EO.accent, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{m.title}</p>
          <p style={eoLabel}>{m.schedule} · FOUNDER · {m.founderAttendance.replace('-', ' ').toUpperCase()}</p>
          <p style={{ ...eoLabel, fontSize: '6px' }}>AGENDA · {m.agenda.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function OrgGraphPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>ORGANIZATIONAL GRAPH</p>
      {store.orgGraph.map((node) => (
        <div key={node.id} className="py-1 border-b" style={{ borderColor: '#eee' }}>
          <p style={{ ...eoLabel, color: EO.accent, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
            {node.label} · {node.type.toUpperCase()}
          </p>
          {node.connections.length > 0 ? (
            <p style={{ ...eoLabel, fontSize: '6px' }}>→ {node.connections.join(' · ')}</p>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function CompanyCulturePanel({ store }: Pick<Props, 'store'>) {
  const c = store.companyCulture;
  const sections: [string, string[]][] = [
    ['MISSION', [c.mission]],
    ['VISION', [c.vision]],
    ['VALUES', c.values],
    ['LEADERSHIP PRINCIPLES', c.leadershipPrinciples],
    ['BRAND PHILOSOPHY', c.brandPhilosophy],
    ['DECISION PHILOSOPHY', c.decisionPhilosophy],
    ['OPERATING PRINCIPLES', c.operatingPrinciples],
    ['TRADITIONS', c.traditions],
  ];
  return (
    <section className="p-3 mb-3" style={{ ...eoPanel, borderLeft: `4px solid ${EO.indigo}` }}>
      <p style={eoSectionTitle}>COMPANY CULTURE · INSTITUTIONAL NOT TRIBAL</p>
      {sections.map(([title, items]) => (
        <div key={title} className="mt-2">
          <p style={{ ...eoSectionTitle, fontSize: '7px' }}>{title}</p>
          {items.map((item) => (
            <p key={item} style={eoLabel}>· {item}</p>
          ))}
        </div>
      ))}
      <Link to={adminStudioLeadershipDnaPath()} style={{ ...eoLabel, color: EO.indigo, display: 'inline-block', marginTop: 6 }}>
        → LEADERSHIP DNA
      </Link>
    </section>
  );
}

export function ExecutiveSuccessionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eoPanel}>
      <p style={eoSectionTitle}>EXECUTIVE SUCCESSION · NO KNOWLEDGE LOST</p>
      <p style={eoLabel}>Future executives inherit department history · standards · performance · philosophy</p>
      {store.successionPackages.slice(0, 4).map((pkg) => {
        const exec = store.executives.find((e) => e.id === pkg.executiveId);
        return (
          <div key={pkg.executiveId} className="p-2 mb-1 border" style={{ borderColor: EO.panelBorder }}>
            <p style={{ ...eoLabel, color: EO.teal, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{exec?.title.toUpperCase()}</p>
            <p style={{ ...eoLabel, fontSize: '6px' }}>
              INHERITS · HISTORY · KNOWLEDGE · STANDARDS · PERFORMANCE · PHILOSOPHY
            </p>
            <p style={{ ...eoLabel, fontSize: '6px' }}>{pkg.organizationalContext.join(' · ')}</p>
          </div>
        );
      })}
    </section>
  );
}

export function ChiefOfStaffCoordinationPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...eoPanel, borderLeft: `4px solid ${EO.gold}` }}>
      <p style={eoSectionTitle}>LEADERSHIP TEAM COORDINATION</p>
      <p style={eoLabel}>Executives never operate independently · one leadership team · CoS coordinates · founder leads</p>
      <Link to={adminStudioChiefOfStaffPath()} style={{ ...eoLabel, color: EO.gold, fontFamily: '"Futura PT Medium"' }}>
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}
