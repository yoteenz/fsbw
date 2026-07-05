import { Link } from 'react-router-dom';
import type { ChiefBrandOfficerStore, ChiefBrandOfficerWorkspaceId } from '../../../../studio-os-core/chief-brand-officer/types';
import { CBO_CONNECTED_SYSTEMS } from '../../../../studio-os-core/chief-brand-officer/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipDnaPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioExecutiveCouncilPath,
} from '../../../../utils/adminStudioRoutes';
import {
  CHIEF_BRAND_OFFICER_STYLES,
  CBO,
  cboDarkHeader,
  cboLabel,
  cboLiveDot,
  cboPanel,
  cboSectionTitle,
  cboValue,
  scoreColor,
  severityColor,
  statusColor,
} from './chiefBrandOfficerTheme';

type Props = {
  store: ChiefBrandOfficerStore;
  onSelectWorkspace: (id: ChiefBrandOfficerWorkspaceId) => void;
};

export function ChiefBrandOfficerHeader() {
  return (
    <>
      <style>{CHIEF_BRAND_OFFICER_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...cboDarkHeader, borderTop: `3px solid ${CBO.violet}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CHIEF BRAND OFFICER
        </p>
        <p style={{ ...cboLabel, color: '#94A3B8' }}>
          <span style={cboLiveDot} />
          LIFELONG GUARDIAN OF IDENTITY · V2.0 · NOT LOGOS — MEANING
        </p>
        <p style={{ ...cboLabel, color: '#CBD5E1', marginTop: 4 }}>
          TIMELESSNESS · TRUST · CLARITY · MEMORABILITY · AUTHENTICITY
        </p>
      </header>
    </>
  );
}

export function CboDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>CHIEF BRAND OFFICER · BRAND STEWARD</p>
      <p style={{ ...cboLabel, color: CBO.violet, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...cboLabel, color: CBO.violet, marginTop: 4 }}>{store.companyName} · EQUITY {d.brandEquityTrend.toUpperCase()}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['BRAND HEALTH', `${d.brandHealthPct}%`],
          ['CONSISTENCY', `${d.consistencyScorePct}%`],
          ['REVIEWS', `${d.pendingReviews}`],
          ['ALERTS', `${d.protectionAlerts}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CBO.panelBorder }}>
            <p style={{ ...cboValue, fontSize: '12px' }}>{val}</p>
            <p style={cboLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadershipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>LEADERSHIP PHILOSOPHY · LIVING BRAND SYSTEMS</p>
      {store.leadershipPhilosophy.map((line) => (
        <p key={line} style={{ ...cboLabel, color: CBO.violet }}>· {line}</p>
      ))}
      <p style={{ ...cboSectionTitle, marginTop: 12 }}>PRIMARY RESPONSIBILITIES</p>
      {store.primaryResponsibilities.map((line) => (
        <p key={line} style={{ ...cboLabel, color: CBO.violet }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveCompassPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cboPanel, background: CBO.atelierBg }}>
      <p style={cboSectionTitle}>EXECUTIVE COMPASS · BEFORE EVERY RECOMMENDATION</p>
      <div className="cbo-compass">&ldquo;{store.executiveCompass}&rdquo;</div>
    </section>
  );
}

export function BrandGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>BRAND GOVERNANCE · ALIGNMENT REVIEW</p>
      {store.brandGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '6px', color: statusColor(g.status), fontFamily: '"Futura PT Medium"' }}>
            {g.status.toUpperCase()} · {g.alignmentScore}% · {g.category}
          </p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{g.initiative}</p>
        </div>
      ))}
    </section>
  );
}

export function BrandAlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>BRAND ALIGNMENT ENGINE · EVALUATE BEFORE APPROVING</p>
      {store.brandAlignment.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '6px', color: scoreColor(a.alignmentScore), fontFamily: '"Futura PT Medium"' }}>
            {a.alignmentScore}% · {a.confidence}% confidence · {a.initiative}
          </p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>STRENGTHS: {a.strengths}</p>
          {a.risks && <p style={{ ...cboLabel, fontSize: '5px', color: CBO.red }}>RISKS: {a.risks}</p>}
          {a.opportunities && <p style={{ ...cboLabel, fontSize: '5px' }}>OPPORTUNITIES: {a.opportunities}</p>}
          <p style={{ ...cboLabel, fontSize: '5px', color: CBO.violet }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function BrandIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>BRAND INTELLIGENCE · PROACTIVE MONITORING</p>
      {store.brandIntelligence.map((i) => (
        <div key={i.id} className="py-1 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '5px', color: statusColor(i.status) }}>{i.dimension} · {i.status.toUpperCase()}</p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{i.insight}</p>
          {i.recommendation && <p style={{ ...cboLabel, fontSize: '5px', color: CBO.violet }}>→ {i.recommendation}</p>}
        </div>
      ))}
    </section>
  );
}

export function BrandEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>BRAND EVOLUTION · INTENTIONAL NOT REACTIVE</p>
      {store.brandEvolution.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '5px', color: CBO.violet }}>{e.category} · {e.intent.toUpperCase()}</p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{e.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function BrandCouncilPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cboPanel, borderLeft: `4px solid ${CBO.violet}` }}>
      <p style={cboSectionTitle}>BRAND COUNCIL · COLLABORATIVE DECISIONS</p>
      {store.brandCouncil.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '6px', color: CBO.violet, fontFamily: '"Futura PT Medium"' }}>
            {c.executive} · {c.status.toUpperCase()}
          </p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{c.collaboration}</p>
        </div>
      ))}
    </section>
  );
}

export function CreativeReviewStudioPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cboPanel, background: CBO.atelierBg }}>
      <p style={cboSectionTitle}>CREATIVE REVIEW STUDIO · LUXURY ATELIER</p>
      {store.creativeReviewStudio.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '6px', color: CBO.violet, fontFamily: '"Futura PT Medium"' }}>{s.element}</p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{s.description}</p>
          <p style={{ ...cboLabel, fontSize: '5px', color: CBO.gray }}>{s.location}</p>
        </div>
      ))}
    </section>
  );
}

export function BrandMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>BRAND MEMORY · INSTITUTIONAL KNOWLEDGE</p>
      {store.brandMemory.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '5px', color: CBO.violet }}>{m.category} · {m.date}</p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{m.memory}</p>
        </div>
      ))}
    </section>
  );
}

export function BrandProtectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>BRAND PROTECTION · DRIFT DETECTION</p>
      {store.brandProtection.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '5px', color: severityColor(p.severity) }}>
            {p.alertType} · {p.severity.toUpperCase()}
          </p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...cboLabel, fontSize: '5px', color: CBO.violet }}>→ {p.correction}</p>
        </div>
      ))}
    </section>
  );
}

export function DailyBriefingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cboPanel, borderLeft: `4px solid ${CBO.violet}` }}>
      <p style={cboSectionTitle}>DAILY EXECUTIVE BRIEFING · BRAND HEALTH</p>
      {store.dailyBriefing.map((b) => (
        <div key={b.id} className="py-1 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '5px', color: severityColor(b.priority === 'high' ? 'high' : b.priority === 'medium' ? 'medium' : 'low') }}>
            {b.category} · {b.priority.toUpperCase()}
          </p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{b.summary}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>EXECUTIVE RECOMMENDATIONS · GLOBAL CBO COMMUNICATION</p>
      {store.recommendations.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: CBO.panelBorder }}>
          <p style={{ ...cboLabel, fontSize: '6px', color: scoreColor(r.alignmentScore), fontFamily: '"Futura PT Medium"' }}>
            {r.confidence}% confidence · {r.alignmentScore}% aligned
          </p>
          <p style={{ ...cboLabel, fontSize: '5px' }}>{r.summary}</p>
          <p style={{ ...cboLabel, fontSize: '5px', color: CBO.violet }}>→ {r.recommendedAction}</p>
          {r.hasTradeoffs && <p style={{ ...cboLabel, fontSize: '5px', color: CBO.gray }}>Tradeoffs documented</p>}
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ChiefBrandOfficerWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>CBO WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CBO.violet : CBO.panelBorder,
              color: store.activeWorkspaceId === id ? CBO.violet : CBO.gray,
              background: store.activeWorkspaceId === id ? 'rgba(124,58,237,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...cboLabel, color: CBO.violet }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={cboPanel}>
      <p style={cboSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CBO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CBO.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...cboLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...cboLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...cboLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...cboLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...cboLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...cboLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...cboLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...cboLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...cboLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...cboLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...cboLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...cboLabel, color: CBO.violet, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...cboLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...cboLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...cboLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...cboLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
      </div>
    </section>
  );
}
