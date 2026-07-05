import { Link } from 'react-router-dom';
import type { ChiefTechnologyOfficerStore, ChiefTechnologyOfficerWorkspaceId } from '../../../../studio-os-core/chief-technology-officer/types';
import { CTO_CONNECTED_SYSTEMS } from '../../../../studio-os-core/chief-technology-officer/constants';
import {
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioFoundersPromisePath,
  adminStudioLeadershipDnaPath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioChiefGrowthOfficerPath,
} from '../../../../utils/adminStudioRoutes';
import {
  CHIEF_TECHNOLOGY_OFFICER_STYLES,
  CTO,
  ctoDarkHeader,
  ctoLabel,
  ctoLiveDot,
  ctoPanel,
  ctoSectionTitle,
  ctoValue,
  scoreColor,
  severityColor,
  statusColor,
  trendIcon,
} from './chiefTechnologyOfficerTheme';

type Props = {
  store: ChiefTechnologyOfficerStore;
  onSelectWorkspace: (id: ChiefTechnologyOfficerWorkspaceId) => void;
};

export function ChiefTechnologyOfficerHeader() {
  return (
    <>
      <style>{CHIEF_TECHNOLOGY_OFFICER_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ctoDarkHeader, borderTop: `3px solid ${CTO.blue}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CHIEF TECHNOLOGY OFFICER
        </p>
        <p style={{ ...ctoLabel, color: '#94A3B8' }}>
          <span style={ctoLiveDot} />
          LIFELONG GUARDIAN OF ENGINEERING · V1.0 · BUILT TO LAST
        </p>
        <p style={{ ...ctoLabel, color: '#CBD5E1', marginTop: 4 }}>
          RESILIENCE · SECURITY · MAINTAINABILITY · DECADES OF GROWTH
        </p>
      </header>
    </>
  );
}

export function CtoDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>CHIEF TECHNOLOGY OFFICER · ENGINEERING HEALTH</p>
      <p style={{ ...ctoLabel, color: CTO.blue, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...ctoLabel, color: CTO.blue, marginTop: 4 }}>
        {store.companyName} · RELIABILITY {d.reliabilityTrend.toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['ENGINEERING', `${d.engineeringHealthPct}%`],
          ['STABILITY', `${d.platformStabilityPct}%`],
          ['REVIEWS', `${d.pendingReviews}`],
          ['ALERTS', `${d.protectionAlerts}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CTO.panelBorder }}>
            <p style={{ ...ctoValue, fontSize: '12px' }}>{val}</p>
            <p style={ctoLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadershipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>LEADERSHIP PHILOSOPHY · INVISIBLE EXCELLENCE</p>
      {store.leadershipPhilosophy.map((line) => (
        <p key={line} style={{ ...ctoLabel, color: CTO.blue }}>· {line}</p>
      ))}
      <p style={{ ...ctoSectionTitle, marginTop: 12 }}>PRIMARY RESPONSIBILITIES</p>
      {store.primaryResponsibilities.map((line) => (
        <p key={line} style={{ ...ctoLabel, color: CTO.blue }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveCompassPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ctoPanel, background: CTO.opsBg }}>
      <p style={ctoSectionTitle}>EXECUTIVE COMPASS · BEFORE EVERY RECOMMENDATION</p>
      <div className="cto-compass">&ldquo;{store.executiveCompass}&rdquo;</div>
    </section>
  );
}

export function TechnologyGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>TECHNOLOGY GOVERNANCE · ARCHITECTURAL REVIEW</p>
      {store.technologyGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '6px', color: statusColor(g.status), fontFamily: '"Futura PT Medium"' }}>
            {g.status.toUpperCase()} · {g.architectureScore}% · {g.category}
          </p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{g.initiative}</p>
        </div>
      ))}
    </section>
  );
}

export function EngineeringAlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>ENGINEERING ALIGNMENT ENGINE</p>
      {store.engineeringAlignment.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '6px', color: scoreColor(a.engineeringHealth), fontFamily: '"Futura PT Medium"' }}>
            HEALTH {a.engineeringHealth}% · {a.confidence}% confidence
          </p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{a.initiative}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>RISK: {a.technicalRisk}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>RESILIENCE: {a.systemResilience}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>READINESS: {a.futureReadiness}</p>
          <p style={{ ...ctoLabel, fontSize: '5px', color: CTO.blue }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function EngineeringIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>ENGINEERING INTELLIGENCE · CONTINUOUS MONITORING</p>
      {store.engineeringIntelligence.map((i) => (
        <div key={i.id} className="py-1 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '6px', color: scoreColor(i.score), fontFamily: '"Futura PT Medium"' }}>
            {i.dimension} · {i.score}% {trendIcon(i.trend)}
          </p>
        </div>
      ))}
    </section>
  );
}

export function EngineeringEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>ENGINEERING EVOLUTION · SIMPLER EVERY YEAR</p>
      {store.engineeringEvolution.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '5px', color: CTO.blue }}>{e.category}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{e.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function PlatformArchitecturePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>PLATFORM ARCHITECTURE · DECADES NOT QUARTERS</p>
      {store.platformArchitecture.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '6px', color: statusColor(p.status), fontFamily: '"Futura PT Medium"' }}>
            {p.domain} · {p.status.toUpperCase()}
          </p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{p.focus}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>LONGEVITY: {p.longevity}</p>
        </div>
      ))}
    </section>
  );
}

export function EngineeringCouncilPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ctoPanel, borderLeft: `4px solid ${CTO.blue}` }}>
      <p style={ctoSectionTitle}>ENGINEERING COUNCIL · COLLABORATIVE DECISIONS</p>
      {store.engineeringCouncil.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '6px', color: CTO.blue, fontFamily: '"Futura PT Medium"' }}>
            {c.executive} · {c.status.toUpperCase()}
          </p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{c.collaboration}</p>
        </div>
      ))}
    </section>
  );
}

export function TechnologyOpsCenterPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ctoPanel, background: CTO.opsBg }}>
      <p style={ctoSectionTitle}>TECHNOLOGY OPERATIONS CENTER · MISSION CONTROL</p>
      {store.technologyOpsCenter.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '6px', color: CTO.blue, fontFamily: '"Futura PT Medium"' }}>{s.element}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{s.description}</p>
          <p style={{ ...ctoLabel, fontSize: '5px', color: CTO.gray }}>{s.location}</p>
        </div>
      ))}
    </section>
  );
}

export function EngineeringMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>ENGINEERING MEMORY · ACCUMULATED WISDOM</p>
      {store.engineeringMemory.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '5px', color: CTO.blue }}>{m.category} · {m.date}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{m.memory}</p>
        </div>
      ))}
    </section>
  );
}

export function TechnologyProtectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>TECHNOLOGY PROTECTION · BEFORE ORGANIZATIONAL PROBLEMS</p>
      {store.technologyProtection.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '5px', color: severityColor(p.severity) }}>
            {p.alertType} · {p.severity.toUpperCase()}
          </p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...ctoLabel, fontSize: '5px', color: CTO.blue }}>→ {p.correction}</p>
        </div>
      ))}
    </section>
  );
}

export function DailyBriefingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ctoPanel, borderLeft: `4px solid ${CTO.blue}` }}>
      <p style={ctoSectionTitle}>DAILY EXECUTIVE BRIEFING · TECHNOLOGY ORGANIZATION</p>
      {store.dailyBriefing.map((b) => (
        <div key={b.id} className="py-1 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '5px', color: severityColor(b.priority === 'high' ? 'high' : b.priority === 'medium' ? 'medium' : 'low') }}>
            {b.category} · {b.priority.toUpperCase()}
          </p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{b.summary}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>EXECUTIVE RECOMMENDATIONS · ENGINEERING LEADERSHIP</p>
      {store.recommendations.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: CTO.panelBorder }}>
          <p style={{ ...ctoLabel, fontSize: '6px', color: CTO.blue, fontFamily: '"Futura PT Medium"' }}>
            {r.confidence}% confidence
          </p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>{r.summary}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>IMPACT: {r.organizationalImpact}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>COMPLEXITY: {r.implementationComplexity}</p>
          <p style={{ ...ctoLabel, fontSize: '5px' }}>RISK: {r.risk}</p>
          <p style={{ ...ctoLabel, fontSize: '5px', color: CTO.blue }}>→ {r.recommendedAction}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ChiefTechnologyOfficerWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>CTO WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CTO.blue : CTO.panelBorder,
              color: store.activeWorkspaceId === id ? CTO.blue : CTO.gray,
              background: store.activeWorkspaceId === id ? 'rgba(37,99,235,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...ctoLabel, color: CTO.blue }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={ctoPanel}>
      <p style={ctoSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CTO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CTO.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...ctoLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...ctoLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...ctoLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...ctoLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...ctoLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...ctoLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...ctoLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...ctoLabel, color: CTO.blue, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...ctoLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
      </div>
    </section>
  );
}
