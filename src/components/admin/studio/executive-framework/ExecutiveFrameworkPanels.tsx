import { Link } from 'react-router-dom';
import type { ExecutiveFrameworkStore, ExecutiveFrameworkWorkspaceId } from '../../../../studio-os-core/executive-framework/types';
import { EXECUTIVE_FRAMEWORK_CONNECTED_SYSTEMS } from '../../../../studio-os-core/executive-framework/constants';
import {
  adminStudioArchitectStudioPath,
  adminStudioBrandArchitectPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioDigitalArchitectPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipDnaPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioExecutiveCouncilPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalAutonomyFrameworkPath,
  adminStudioLeadershipManifestoFrameworkPath,
} from '../../../../utils/adminStudioRoutes';
import {
  EXECUTIVE_FRAMEWORK_STYLES,
  EF,
  efDarkHeader,
  efLabel,
  efLiveDot,
  efPanel,
  efSectionTitle,
  efValue,
  scoreColor,
  statusColor,
  trendIcon,
} from './executiveFrameworkTheme';

type Props = {
  store: ExecutiveFrameworkStore;
  onSelectWorkspace: (id: ExecutiveFrameworkWorkspaceId) => void;
};

export function ExecutiveFrameworkHeader() {
  return (
    <>
      <style>{EXECUTIVE_FRAMEWORK_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...efDarkHeader, borderTop: `3px solid ${EF.slate}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          EXECUTIVE FRAMEWORK
        </p>
        <p style={{ ...efLabel, color: '#94A3B8' }}>
          <span style={efLiveDot} />
          CONSTITUTIONAL FOUNDATION · COORDINATED LEADERSHIP · NOT ISOLATED ASSISTANTS
        </p>
        <p style={{ ...efLabel, color: '#CBD5E1', marginTop: 4 }}>
          PREMIUM · CALM · COLLABORATIVE · LEADERSHIP IS STEWARDSHIP
        </p>
      </header>
    </>
  );
}

export function FrameworkDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>EXECUTIVE ORGANIZATION · DASHBOARD</p>
      <p style={{ ...efLabel, color: EF.slate, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...efLabel, color: EF.slate, marginTop: 4 }}>{store.companyName}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['EXECUTIVES', `${d.activeExecutives}`],
          ['COLLABORATIONS', `${d.activeCollaborations}`],
          ['PIPELINE', `${d.recommendationPipeline}`],
          ['HEALTH', `${d.executiveHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: EF.panelBorder }}>
            <p style={{ ...efValue, fontSize: '12px' }}>{val}</p>
            <p style={efLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...efLabel, marginTop: 8 }}>
        ORGANIZATIONAL ALIGNMENT: {d.organizationalAlignmentPct}% · FUTURE ROLES: {d.futureRolesPrepared}
      </p>
    </section>
  );
}

export function ExecutivePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>EXECUTIVE PHILOSOPHY · EXPAND LEADERSHIP CAPACITY</p>
      {store.executivePhilosophy.map((line) => (
        <p key={line} style={{ ...efLabel, color: EF.slate }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveStandardsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>EXECUTIVE STANDARDS · TRUSTED ADVISORS</p>
      {store.executiveStandards.map((line) => (
        <p key={line} style={{ ...efLabel, color: EF.slate }}>· {line}</p>
      ))}
    </section>
  );
}

export function IdentityInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...efPanel, background: EF.execBg }}>
      <p style={efSectionTitle}>EXECUTIVE IDENTITY · INHERIT BEFORE RECOMMENDING</p>
      {store.identityInheritance.map((i) => (
        <div key={i.id} className="py-1 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '6px', color: statusColor(i.status), fontFamily: '"Futura PT Medium"' }}>
            {i.source} · {i.status.toUpperCase()}
          </p>
          <p style={{ ...efLabel, fontSize: '5px' }}>{i.note}</p>
        </div>
      ))}
    </section>
  );
}

export function DecisionFrameworkPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>DECISION FRAMEWORK · EVALUATE BEFORE RECOMMENDING</p>
      {store.decisionCriteria.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '5px', color: EF.slate, fontFamily: '"Futura PT Medium"' }}>{c.dimension}</p>
          <p style={{ ...efLabel, fontSize: '5px' }}>{c.description}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveCollaborationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...efPanel, borderLeft: `4px solid ${EF.slate}` }}>
      <p style={efSectionTitle}>EXECUTIVE COLLABORATION · SEEK ALIGNMENT FIRST</p>
      {store.collaborations.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '5px', color: statusColor(c.status) }}>
            {c.fromExecutive} → {c.toExecutive} · {c.status.toUpperCase()}
          </p>
          <p style={{ ...efLabel, fontSize: '5px' }}>{c.request}</p>
        </div>
      ))}
    </section>
  );
}

export function InstitutionalMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>EXECUTIVE MEMORY · INSTITUTIONAL WISDOM</p>
      {store.institutionalMemory.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '5px', color: EF.slate }}>{m.category} · {m.date}</p>
          <p style={{ ...efLabel, fontSize: '5px' }}>{m.memory}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveWorkspacesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...efPanel, background: EF.execBg }}>
      <p style={efSectionTitle}>EXECUTIVE WORKSPACES · ARCHITECT STUDIO</p>
      <div className="ef-leadership-grid">
        {store.executiveWorkspaces.map((w) => (
          <div key={w.id} className="ef-exec-card">
            <p style={{ ...efLabel, fontSize: '6px', color: EF.slate, fontFamily: '"Futura PT Medium"' }}>{w.executive}</p>
            <p style={{ ...efLabel, fontSize: '5px' }}>{w.office}</p>
            <p style={{ ...efLabel, fontSize: '5px' }}>
              {w.activePriorities} priorities · {w.pendingRecommendations} recs
            </p>
            <p style={{ ...efLabel, fontSize: '5px', color: EF.gray }}>{w.location}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AccountabilityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>EXECUTIVE ACCOUNTABILITY · CONTINUOUS IMPROVEMENT</p>
      {store.accountability.map((a) => (
        <div key={a.id} className="py-1 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '6px', color: scoreColor(a.score), fontFamily: '"Futura PT Medium"' }}>
            {a.executive} · {a.score}% {trendIcon(a.trend)}
          </p>
          <p style={{ ...efLabel, fontSize: '5px' }}>{a.metric}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendationPipelinePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>RECOMMENDATION PIPELINE · COMMUNICATION STANDARDS</p>
      <p style={{ ...efLabel, fontSize: '5px', marginBottom: 8 }}>
        Summary · reasoning · evidence · confidence · tradeoffs · alternatives · alignment · next step
      </p>
      {store.recommendationPipeline.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '6px', color: EF.slate, fontFamily: '"Futura PT Medium"' }}>
            {r.executive} · {r.confidence}% confidence · {r.alignmentScore}% aligned
          </p>
          <p style={{ ...efLabel, fontSize: '5px' }}>{r.summary}</p>
          {r.hasAlternatives && <p style={{ ...efLabel, fontSize: '5px', color: EF.gray }}>+ alternatives documented</p>}
        </div>
      ))}
    </section>
  );
}

export function LeadershipMapPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>LEADERSHIP MAP · RESPONSIBILITIES & AUTHORITY</p>
      {store.leadershipMap.map((l) => (
        <div key={l.id} className="py-2 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '6px', color: EF.slate, fontFamily: '"Futura PT Medium"' }}>
            {l.executive} · reports to {l.reportsTo}
          </p>
          <p style={{ ...efLabel, fontSize: '5px' }}>RESPONSIBILITY: {l.responsibility}</p>
          <p style={{ ...efLabel, fontSize: '5px' }}>AUTHORITY: {l.authority}</p>
        </div>
      ))}
    </section>
  );
}

export function FutureExecutivesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>FUTURE EXECUTIVE ORGANIZATION · INHERITS FRAMEWORK</p>
      {store.futureExecutives.map((f) => (
        <div key={f.id} className="py-1 border-b" style={{ borderColor: EF.panelBorder }}>
          <p style={{ ...efLabel, fontSize: '5px', color: EF.slate }}>
            {f.title} · {f.readiness.toUpperCase()} · {f.inheritsFramework ? 'INHERITS FRAMEWORK' : 'PENDING'}
          </p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalPrioritiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>ORGANIZATIONAL PRIORITIES</p>
      {store.organizationalPriorities.map((p) => (
        <p key={p} style={{ ...efLabel, color: EF.slate }}>· {p}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ExecutiveFrameworkWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>FRAMEWORK WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? EF.slate : EF.panelBorder,
              color: store.activeWorkspaceId === id ? EF.slate : EF.gray,
              background: store.activeWorkspaceId === id ? 'rgba(51,65,85,0.06)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...efLabel, color: EF.slate }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={efPanel}>
      <p style={efSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {EXECUTIVE_FRAMEWORK_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: EF.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...efLabel, color: EF.slate, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...efLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...efLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...efLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...efLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...efLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...efLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...efLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...efLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...efLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...efLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...efLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...efLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...efLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...efLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...efLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...efLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioArchitectStudioPath()} style={{ ...efLabel, color: '#CA8A04', fontSize: '6px' }}>→ ARCHITECT STUDIO</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...efLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
      </div>
    </section>
  );
}
