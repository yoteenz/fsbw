import { Link } from 'react-router-dom';
import type { ChiefExperienceOfficerStore, ChiefExperienceOfficerWorkspaceId } from '../../../../studio-os-core/chief-experience-officer/types';
import { CEO_CONNECTED_SYSTEMS } from '../../../../studio-os-core/chief-experience-officer/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipDnaPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioExecutiveCouncilPath,
} from '../../../../utils/adminStudioRoutes';
import {
  CHIEF_EXPERIENCE_OFFICER_STYLES,
  CEO,
  ceoDarkHeader,
  ceoLabel,
  ceoLiveDot,
  ceoPanel,
  ceoSectionTitle,
  ceoValue,
  scoreColor,
  severityColor,
  statusColor,
  trendIcon,
} from './chiefExperienceOfficerTheme';

type Props = {
  store: ChiefExperienceOfficerStore;
  onSelectWorkspace: (id: ChiefExperienceOfficerWorkspaceId) => void;
};

export function ChiefExperienceOfficerHeader() {
  return (
    <>
      <style>{CHIEF_EXPERIENCE_OFFICER_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ceoDarkHeader, borderTop: `3px solid ${CEO.cyan}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CHIEF EXPERIENCE OFFICER
        </p>
        <p style={{ ...ceoLabel, color: '#94A3B8' }}>
          <span style={ceoLiveDot} />
          LIFELONG GUARDIAN OF CUSTOMER EXPERIENCE · V2.0 · HUMANITY
        </p>
        <p style={{ ...ceoLabel, color: '#CBD5E1', marginTop: 4 }}>
          TRUST · DELIGHT · CONFIDENCE · LOYALTY · EMPATHY · BELONGING
        </p>
      </header>
    </>
  );
}

export function CeoDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>CHIEF EXPERIENCE OFFICER · EXPERIENCE HEALTH</p>
      <p style={{ ...ceoLabel, color: CEO.cyan, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...ceoLabel, color: CEO.cyan, marginTop: 4 }}>
        {store.companyName} · RELATIONSHIP {d.relationshipHealthTrend.toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['EXPERIENCE', `${d.experienceHealthPct}%`],
          ['TRUST', `${d.trustScorePct}%`],
          ['REVIEWS', `${d.pendingReviews}`],
          ['FRICTION', `${d.frictionAlerts}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CEO.panelBorder }}>
            <p style={{ ...ceoValue, fontSize: '12px' }}>{val}</p>
            <p style={ceoLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadershipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>LEADERSHIP PHILOSOPHY · HOW CUSTOMERS FEEL</p>
      {store.leadershipPhilosophy.map((line) => (
        <p key={line} style={{ ...ceoLabel, color: CEO.cyan }}>· {line}</p>
      ))}
      <p style={{ ...ceoSectionTitle, marginTop: 12 }}>PRIMARY RESPONSIBILITIES</p>
      {store.primaryResponsibilities.map((line) => (
        <p key={line} style={{ ...ceoLabel, color: CEO.cyan }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveCompassPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ceoPanel, background: CEO.labBg }}>
      <p style={ceoSectionTitle}>EXECUTIVE COMPASS · BEFORE EVERY RECOMMENDATION</p>
      <div className="ceo-compass">&ldquo;{store.executiveCompass}&rdquo;</div>
    </section>
  );
}

export function ExperienceGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>EXPERIENCE GOVERNANCE · ALIGNMENT REVIEW</p>
      {store.experienceGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '6px', color: statusColor(g.status), fontFamily: '"Futura PT Medium"' }}>
            {g.status.toUpperCase()} · {g.experienceScore}% · {g.category}
          </p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{g.initiative}</p>
        </div>
      ))}
    </section>
  );
}

export function ExperienceAlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>EXPERIENCE ALIGNMENT ENGINE</p>
      {store.experienceAlignment.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '6px', color: scoreColor(a.experienceScore), fontFamily: '"Futura PT Medium"' }}>
            EXP {a.experienceScore}% · TRUST {a.trustScore}% · {a.confidence}% confidence
          </p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{a.initiative}</p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>FRICTION: {a.frictionAnalysis}</p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>EMOTIONAL: {a.emotionalAlignment}</p>
          <p style={{ ...ceoLabel, fontSize: '5px', color: CEO.cyan }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function JourneyIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>CUSTOMER JOURNEY INTELLIGENCE</p>
      {store.journeyIntelligence.map((j) => (
        <div key={j.id} className="py-1 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '5px', color: statusColor(j.status) }}>{j.stage} · {j.status.toUpperCase()}</p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{j.insight}</p>
          {j.opportunity && <p style={{ ...ceoLabel, fontSize: '5px', color: CEO.cyan }}>→ {j.opportunity}</p>}
        </div>
      ))}
    </section>
  );
}

export function ExperienceIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>EXPERIENCE INTELLIGENCE · UNIFIED HEALTH</p>
      {store.experienceIntelligence.map((i) => (
        <div key={i.id} className="py-1 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '6px', color: scoreColor(i.score), fontFamily: '"Futura PT Medium"' }}>
            {i.dimension} · {i.score}% {trendIcon(i.trend)}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ExperienceEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>EXPERIENCE EVOLUTION · MORE THOUGHTFUL AS WE GROW</p>
      {store.experienceEvolution.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '5px', color: CEO.cyan }}>{e.category}</p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{e.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function ExperienceCouncilPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ceoPanel, borderLeft: `4px solid ${CEO.cyan}` }}>
      <p style={ceoSectionTitle}>EXPERIENCE COUNCIL · COLLABORATIVE DECISIONS</p>
      {store.experienceCouncil.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '6px', color: CEO.cyan, fontFamily: '"Futura PT Medium"' }}>
            {c.executive} · {c.status.toUpperCase()}
          </p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{c.collaboration}</p>
        </div>
      ))}
    </section>
  );
}

export function ExperienceStudioPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ceoPanel, background: CEO.labBg }}>
      <p style={ceoSectionTitle}>EXPERIENCE STUDIO · HOSPITALITY INNOVATION LAB</p>
      {store.experienceStudio.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '6px', color: CEO.cyan, fontFamily: '"Futura PT Medium"' }}>{s.element}</p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{s.description}</p>
          <p style={{ ...ceoLabel, fontSize: '5px', color: CEO.gray }}>{s.location}</p>
        </div>
      ))}
    </section>
  );
}

export function ExperienceMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>EXPERIENCE MEMORY · INSTITUTIONAL KNOWLEDGE</p>
      {store.experienceMemory.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '5px', color: CEO.cyan }}>{m.category} · {m.date}</p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{m.memory}</p>
        </div>
      ))}
    </section>
  );
}

export function ExperienceProtectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>EXPERIENCE PROTECTION · BEFORE CONFIDENCE LOST</p>
      {store.experienceProtection.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '5px', color: severityColor(p.severity) }}>
            {p.alertType} · {p.severity.toUpperCase()}
          </p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...ceoLabel, fontSize: '5px', color: CEO.cyan }}>→ {p.correction}</p>
        </div>
      ))}
    </section>
  );
}

export function DailyBriefingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ceoPanel, borderLeft: `4px solid ${CEO.cyan}` }}>
      <p style={ceoSectionTitle}>DAILY EXECUTIVE BRIEFING · HOW CUSTOMERS EXPERIENCE US</p>
      {store.dailyBriefing.map((b) => (
        <div key={b.id} className="py-1 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '5px', color: severityColor(b.priority === 'high' ? 'high' : b.priority === 'medium' ? 'medium' : 'low') }}>
            {b.category} · {b.priority.toUpperCase()}
          </p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{b.summary}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>EXECUTIVE RECOMMENDATIONS · HOSPITALITY LEADERSHIP</p>
      {store.recommendations.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: CEO.panelBorder }}>
          <p style={{ ...ceoLabel, fontSize: '6px', color: CEO.cyan, fontFamily: '"Futura PT Medium"' }}>
            {r.confidence}% confidence
          </p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>{r.summary}</p>
          <p style={{ ...ceoLabel, fontSize: '5px' }}>CUSTOMER IMPACT: {r.customerImpact}</p>
          <p style={{ ...ceoLabel, fontSize: '5px', color: CEO.cyan }}>→ {r.recommendedAction}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ChiefExperienceOfficerWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>CEO WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CEO.cyan : CEO.panelBorder,
              color: store.activeWorkspaceId === id ? CEO.cyan : CEO.gray,
              background: store.activeWorkspaceId === id ? 'rgba(8,145,178,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...ceoLabel, color: CEO.cyan }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={ceoPanel}>
      <p style={ceoSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CEO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CEO.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...ceoLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...ceoLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...ceoLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...ceoLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...ceoLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...ceoLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...ceoLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...ceoLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...ceoLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...ceoLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...ceoLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...ceoLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...ceoLabel, color: CEO.cyan, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...ceoLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
      </div>
    </section>
  );
}
