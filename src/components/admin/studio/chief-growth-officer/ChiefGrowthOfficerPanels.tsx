import { Link } from 'react-router-dom';
import type { ChiefGrowthOfficerStore, ChiefGrowthOfficerWorkspaceId } from '../../../../studio-os-core/chief-growth-officer/types';
import { CGO_CONNECTED_SYSTEMS } from '../../../../studio-os-core/chief-growth-officer/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioCampaignEnginePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioCreatorMarketplacePath,
  adminStudioDigitalArchitectPath,
  adminStudioDistributionEnginePath,
  adminStudioExecutiveFrameworkPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipDnaPath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  CHIEF_GROWTH_OFFICER_STYLES,
  CGO,
  cgoDarkHeader,
  cgoLabel,
  cgoLiveDot,
  cgoPanel,
  cgoSectionTitle,
  cgoValue,
  scoreColor,
  severityColor,
  statusColor,
  trendIcon,
} from './chiefGrowthOfficerTheme';

type Props = {
  store: ChiefGrowthOfficerStore;
  onSelectWorkspace: (id: ChiefGrowthOfficerWorkspaceId) => void;
};

export function ChiefGrowthOfficerHeader() {
  return (
    <>
      <style>{CHIEF_GROWTH_OFFICER_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...cgoDarkHeader, borderTop: `3px solid ${CGO.emerald}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CHIEF GROWTH OFFICER
        </p>
        <p style={{ ...cgoLabel, color: '#94A3B8' }}>
          <span style={cgoLiveDot} />
          LIFELONG GUARDIAN OF SUSTAINABLE GROWTH · V1.0 · STRONGER NOT BIGGER
        </p>
        <p style={{ ...cgoLabel, color: '#CBD5E1', marginTop: 4 }}>
          INTENTIONAL · MEASURABLE · ETHICAL · RELATIONSHIP-DRIVEN
        </p>
      </header>
    </>
  );
}

export function CgoDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>CHIEF GROWTH OFFICER · GROWTH HEALTH</p>
      <p style={{ ...cgoLabel, color: CGO.emerald, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...cgoLabel, color: CGO.emerald, marginTop: 4 }}>
        {store.companyName} · TRAJECTORY {d.growthTrajectory.toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['GROWTH', `${d.growthHealthPct}%`],
          ['RELATIONSHIP', `${d.relationshipHealthPct}%`],
          ['REVIEWS', `${d.pendingReviews}`],
          ['ALERTS', `${d.protectionAlerts}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CGO.panelBorder }}>
            <p style={{ ...cgoValue, fontSize: '12px' }}>{val}</p>
            <p style={cgoLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadershipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>LEADERSHIP PHILOSOPHY · EXTRAORDINARY VALUE</p>
      {store.leadershipPhilosophy.map((line) => (
        <p key={line} style={{ ...cgoLabel, color: CGO.emerald }}>· {line}</p>
      ))}
      <p style={{ ...cgoSectionTitle, marginTop: 12 }}>PRIMARY RESPONSIBILITIES</p>
      {store.primaryResponsibilities.map((line) => (
        <p key={line} style={{ ...cgoLabel, color: CGO.emerald }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveCompassPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cgoPanel, background: CGO.labBg }}>
      <p style={cgoSectionTitle}>EXECUTIVE COMPASS · BEFORE EVERY RECOMMENDATION</p>
      <div className="cgo-compass">&ldquo;{store.executiveCompass}&rdquo;</div>
    </section>
  );
}

export function GrowthGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>GROWTH GOVERNANCE · GROWTH REVIEW</p>
      {store.growthGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '6px', color: statusColor(g.status), fontFamily: '"Futura PT Medium"' }}>
            {g.status.toUpperCase()} · {g.growthScore}% · {g.category}
          </p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{g.initiative}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthAlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>GROWTH ALIGNMENT ENGINE</p>
      {store.growthAlignment.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '6px', color: scoreColor(a.growthHealth), fontFamily: '"Futura PT Medium"' }}>
            HEALTH {a.growthHealth}% · {a.confidence}% confidence
          </p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{a.initiative}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>BRAND: {a.brandImpact}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>RELATIONSHIP: {a.relationshipImpact}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>RISK: {a.risk}</p>
          <p style={{ ...cgoLabel, fontSize: '5px', color: CGO.emerald }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>GROWTH INTELLIGENCE · CONTINUOUS MONITORING</p>
      {store.growthIntelligence.map((i) => (
        <div key={i.id} className="py-1 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '6px', color: scoreColor(i.score), fontFamily: '"Futura PT Medium"' }}>
            {i.dimension} · {i.score}% {trendIcon(i.trend)}
          </p>
        </div>
      ))}
    </section>
  );
}

export function GrowthEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>GROWTH EVOLUTION · STRONGER NOT SIMPLY LARGER</p>
      {store.growthEvolution.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '5px', color: CGO.emerald }}>{e.category}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{e.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthCouncilPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cgoPanel, borderLeft: `4px solid ${CGO.emerald}` }}>
      <p style={cgoSectionTitle}>GROWTH COUNCIL · COLLABORATIVE DECISIONS</p>
      {store.growthCouncil.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '6px', color: CGO.emerald, fontFamily: '"Futura PT Medium"' }}>
            {c.executive} · {c.status.toUpperCase()}
          </p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{c.collaboration}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthLaboratoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cgoPanel, background: CGO.labBg }}>
      <p style={cgoSectionTitle}>GROWTH LABORATORY · INNOVATION & STRATEGY</p>
      {store.growthLaboratory.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '6px', color: CGO.emerald, fontFamily: '"Futura PT Medium"' }}>{s.element}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{s.description}</p>
          <p style={{ ...cgoLabel, fontSize: '5px', color: CGO.gray }}>{s.location}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>GROWTH MEMORY · ACCUMULATED INTELLIGENCE</p>
      {store.growthMemory.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '5px', color: CGO.emerald }}>{m.category} · {m.date}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{m.memory}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthProtectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>GROWTH PROTECTION · BEFORE LONG-TERM DAMAGE</p>
      {store.growthProtection.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '5px', color: severityColor(p.severity) }}>
            {p.alertType} · {p.severity.toUpperCase()}
          </p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...cgoLabel, fontSize: '5px', color: CGO.emerald }}>→ {p.correction}</p>
        </div>
      ))}
    </section>
  );
}

export function DailyBriefingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cgoPanel, borderLeft: `4px solid ${CGO.emerald}` }}>
      <p style={cgoSectionTitle}>DAILY EXECUTIVE BRIEFING · GROWTH TRAJECTORY</p>
      {store.dailyBriefing.map((b) => (
        <div key={b.id} className="py-1 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '5px', color: severityColor(b.priority === 'high' ? 'high' : b.priority === 'medium' ? 'medium' : 'low') }}>
            {b.category} · {b.priority.toUpperCase()}
          </p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{b.summary}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>EXECUTIVE RECOMMENDATIONS · GROWTH LEADERSHIP</p>
      {store.recommendations.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: CGO.panelBorder }}>
          <p style={{ ...cgoLabel, fontSize: '6px', color: CGO.emerald, fontFamily: '"Futura PT Medium"' }}>
            {r.confidence}% confidence
          </p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>{r.summary}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>CUSTOMER: {r.customerImpact}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>BRAND: {r.brandImpact}</p>
          <p style={{ ...cgoLabel, fontSize: '5px' }}>FINANCIAL: {r.financialImplications}</p>
          <p style={{ ...cgoLabel, fontSize: '5px', color: CGO.emerald }}>→ {r.recommendedAction}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ChiefGrowthOfficerWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>CGO WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CGO.emerald : CGO.panelBorder,
              color: store.activeWorkspaceId === id ? CGO.emerald : CGO.gray,
              background: store.activeWorkspaceId === id ? 'rgba(5,150,105,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...cgoLabel, color: CGO.emerald }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={cgoPanel}>
      <p style={cgoSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CGO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CGO.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...cgoLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...cgoLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...cgoLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...cgoLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...cgoLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...cgoLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...cgoLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...cgoLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...cgoLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...cgoLabel, color: '#334155', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...cgoLabel, color: '#334155', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...cgoLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...cgoLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...cgoLabel, color: '#059669', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...cgoLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...cgoLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...cgoLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...cgoLabel, color: CGO.emerald, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
      </div>
    </section>
  );
}
