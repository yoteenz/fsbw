import { Link } from 'react-router-dom';
import type { ChiefDigitalOfficerStore, ChiefDigitalOfficerWorkspaceId } from '../../../../studio-os-core/chief-digital-officer/types';
import { CDO_CONNECTED_SYSTEMS } from '../../../../studio-os-core/chief-digital-officer/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipDnaPath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioChiefTechnologyOfficerPath,
} from '../../../../utils/adminStudioRoutes';
import {
  CHIEF_DIGITAL_OFFICER_STYLES,
  CDO,
  cdoDarkHeader,
  cdoLabel,
  cdoLiveDot,
  cdoPanel,
  cdoSectionTitle,
  cdoValue,
  scoreColor,
  severityColor,
  statusColor,
  trendIcon,
} from './chiefDigitalOfficerTheme';

type Props = {
  store: ChiefDigitalOfficerStore;
  onSelectWorkspace: (id: ChiefDigitalOfficerWorkspaceId) => void;
};

export function ChiefDigitalOfficerHeader() {
  return (
    <>
      <style>{CHIEF_DIGITAL_OFFICER_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...cdoDarkHeader, borderTop: `3px solid ${CDO.indigo}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CHIEF DIGITAL OFFICER
        </p>
        <p style={{ ...cdoLabel, color: '#94A3B8' }}>
          <span style={cdoLiveDot} />
          LIFELONG GUARDIAN OF THE DIGITAL ECOSYSTEM · V1.0 · INVISIBLE TECHNOLOGY
        </p>
        <p style={{ ...cdoLabel, color: '#CBD5E1', marginTop: 4 }}>
          CLARITY · SIMPLICITY · LONGEVITY · CRAFTSMANSHIP · ORGANIZATIONAL INTELLIGENCE
        </p>
      </header>
    </>
  );
}

export function CdoDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>CHIEF DIGITAL OFFICER · DIGITAL HEALTH</p>
      <p style={{ ...cdoLabel, color: CDO.indigo, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...cdoLabel, color: CDO.indigo, marginTop: 4 }}>
        {store.companyName} · PLATFORM {d.platformHealthTrend.toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['DIGITAL', `${d.digitalHealthPct}%`],
          ['ARCHITECTURE', `${d.architectureScorePct}%`],
          ['REVIEWS', `${d.pendingReviews}`],
          ['ALERTS', `${d.protectionAlerts}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CDO.panelBorder }}>
            <p style={{ ...cdoValue, fontSize: '12px' }}>{val}</p>
            <p style={cdoLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadershipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>LEADERSHIP PHILOSOPHY · TECHNOLOGY SERVES MISSION</p>
      {store.leadershipPhilosophy.map((line) => (
        <p key={line} style={{ ...cdoLabel, color: CDO.indigo }}>· {line}</p>
      ))}
      <p style={{ ...cdoSectionTitle, marginTop: 12 }}>PRIMARY RESPONSIBILITIES</p>
      {store.primaryResponsibilities.map((line) => (
        <p key={line} style={{ ...cdoLabel, color: CDO.indigo }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveCompassPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cdoPanel, background: CDO.labBg }}>
      <p style={cdoSectionTitle}>EXECUTIVE COMPASS · BEFORE EVERY RECOMMENDATION</p>
      <div className="cdo-compass">&ldquo;{store.executiveCompass}&rdquo;</div>
    </section>
  );
}

export function DigitalGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>DIGITAL GOVERNANCE · ARCHITECTURE REVIEW</p>
      {store.digitalGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: statusColor(g.status), fontFamily: '"Futura PT Medium"' }}>
            {g.status.toUpperCase()} · {g.architectureScore}% · {g.category}
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{g.initiative}</p>
        </div>
      ))}
    </section>
  );
}

export function DigitalAlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>DIGITAL ALIGNMENT ENGINE</p>
      {store.digitalAlignment.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: scoreColor(a.digitalHealthScore), fontFamily: '"Futura PT Medium"' }}>
            HEALTH {a.digitalHealthScore}% · ARCH {a.architectureScore}% · {a.confidence}% confidence
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{a.initiative}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>RISKS: {a.technicalRisks}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>SCALABILITY: {a.futureScalability}</p>
          <p style={{ ...cdoLabel, fontSize: '5px', color: CDO.indigo }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function DigitalIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>DIGITAL INTELLIGENCE · PLATFORM MONITORING</p>
      {store.digitalIntelligence.map((i) => (
        <div key={i.id} className="py-1 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: scoreColor(i.score), fontFamily: '"Futura PT Medium"' }}>
            {i.dimension} · {i.score}% {trendIcon(i.trend)}
          </p>
        </div>
      ))}
    </section>
  );
}

export function DigitalEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>DIGITAL EVOLUTION · TECHNICALLY STRONGER EVERY YEAR</p>
      {store.digitalEvolution.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '5px', color: CDO.indigo }}>{e.category}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{e.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function SolutionArchitecturePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>SOLUTION ARCHITECTURE · BEFORE IMPLEMENTATION</p>
      {store.solutionArchitecture.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: statusColor(s.status), fontFamily: '"Futura PT Medium"' }}>
            {s.system} · {s.status.toUpperCase()}
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{s.focus}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>SCALABILITY: {s.scalability}</p>
        </div>
      ))}
    </section>
  );
}

export function AiEcosystemPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>AI ECOSYSTEM · BUSINESS OBJECTIVES ONLY</p>
      {store.aiEcosystem.map((a) => (
        <div key={a.id} className="py-1 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: statusColor(a.status), fontFamily: '"Futura PT Medium"' }}>
            {a.capability} · {a.status.toUpperCase()}
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{a.businessObjective}</p>
        </div>
      ))}
    </section>
  );
}

export function TechnologyCouncilPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cdoPanel, borderLeft: `4px solid ${CDO.indigo}` }}>
      <p style={cdoSectionTitle}>TECHNOLOGY COUNCIL · COLLABORATIVE DECISIONS</p>
      {store.technologyCouncil.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: CDO.indigo, fontFamily: '"Futura PT Medium"' }}>
            {c.executive} · {c.status.toUpperCase()}
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{c.collaboration}</p>
        </div>
      ))}
    </section>
  );
}

export function DigitalStudioPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cdoPanel, background: CDO.labBg }}>
      <p style={cdoSectionTitle}>DIGITAL STUDIO · PRODUCT INNOVATION LAB</p>
      {store.digitalStudio.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: CDO.indigo, fontFamily: '"Futura PT Medium"' }}>{s.element}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{s.description}</p>
          <p style={{ ...cdoLabel, fontSize: '5px', color: CDO.gray }}>{s.location}</p>
        </div>
      ))}
    </section>
  );
}

export function DigitalMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>DIGITAL MEMORY · TECHNICAL KNOWLEDGE</p>
      {store.digitalMemory.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '5px', color: CDO.indigo }}>{m.category} · {m.date}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{m.memory}</p>
        </div>
      ))}
    </section>
  );
}

export function DigitalProtectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>DIGITAL PROTECTION · BEFORE CUSTOMERS EXPERIENCE PROBLEMS</p>
      {store.digitalProtection.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '5px', color: severityColor(p.severity) }}>
            {p.alertType} · {p.severity.toUpperCase()}
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...cdoLabel, fontSize: '5px', color: CDO.indigo }}>→ {p.correction}</p>
        </div>
      ))}
    </section>
  );
}

export function DailyBriefingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cdoPanel, borderLeft: `4px solid ${CDO.indigo}` }}>
      <p style={cdoSectionTitle}>DAILY EXECUTIVE BRIEFING · DIGITAL ECOSYSTEM HEALTH</p>
      {store.dailyBriefing.map((b) => (
        <div key={b.id} className="py-1 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '5px', color: severityColor(b.priority === 'high' ? 'high' : b.priority === 'medium' ? 'medium' : 'low') }}>
            {b.category} · {b.priority.toUpperCase()}
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{b.summary}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>EXECUTIVE RECOMMENDATIONS · DIGITAL LEADERSHIP</p>
      {store.recommendations.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: CDO.panelBorder }}>
          <p style={{ ...cdoLabel, fontSize: '6px', color: CDO.indigo, fontFamily: '"Futura PT Medium"' }}>
            {r.confidence}% confidence
          </p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>{r.summary}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>CUSTOMER IMPACT: {r.customerImpact}</p>
          <p style={{ ...cdoLabel, fontSize: '5px' }}>COMPLEXITY: {r.implementationComplexity}</p>
          <p style={{ ...cdoLabel, fontSize: '5px', color: CDO.indigo }}>→ {r.recommendedAction}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ChiefDigitalOfficerWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>CDO WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CDO.indigo : CDO.panelBorder,
              color: store.activeWorkspaceId === id ? CDO.indigo : CDO.gray,
              background: store.activeWorkspaceId === id ? 'rgba(99,102,241,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...cdoLabel, color: CDO.indigo }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={cdoPanel}>
      <p style={cdoSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CDO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CDO.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...cdoLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...cdoLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...cdoLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...cdoLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...cdoLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...cdoLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...cdoLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...cdoLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...cdoLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...cdoLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...cdoLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...cdoLabel, color: CDO.indigo, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...cdoLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
      </div>
    </section>
  );
}
