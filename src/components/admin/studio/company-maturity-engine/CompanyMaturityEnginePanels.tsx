import { Link } from 'react-router-dom';
import type { CompanyMaturityEngineStore, CompanyMaturityWorkspaceId } from '../../../../studio-os-core/company-maturity-engine/types';
import { COMPANY_MATURITY_CONNECTED_SYSTEMS, COMPANY_STAGES, INTEGRATION_PLATFORMS } from '../../../../studio-os-core/company-maturity-engine/constants';
import {
  adminStudioChiefOfStaffPath,
  adminStudioKnowledgeAssetEnginePath,
  adminStudioLeadershipDnaPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioBrandArchitectPath,
  adminStudioSimulationEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  COMPANY_MATURITY_ENGINE_STYLES,
  CME,
  cmeDarkHeader,
  cmeLabel,
  cmeLiveDot,
  cmePanel,
  cmeSectionTitle,
  cmeValue,
  scoreColor,
} from './companyMaturityEngineTheme';

type Props = {
  store: CompanyMaturityEngineStore;
  onSelectWorkspace: (id: CompanyMaturityWorkspaceId) => void;
};

export function CompanyMaturityEngineHeader() {
  return (
    <>
      <style>{COMPANY_MATURITY_ENGINE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...cmeDarkHeader, borderTop: `3px solid ${CME.sky}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          COMPANY MATURITY ENGINE
        </p>
        <p style={{ ...cmeLabel, color: '#94A3B8' }}>
          <span style={cmeLiveDot} />
          UNIVERSAL ONBOARDING · ORGANIZATIONAL UNDERSTANDING · MEET FOUNDERS WHERE THEY ARE
        </p>
        <p style={{ ...cmeLabel, color: '#CBD5E1', marginTop: 4 }}>
          BUILD NEW · IMPORT EXISTING · SAME BLUEPRINT · PRESERVE THE PAST · ACCELERATE THE FUTURE
        </p>
      </header>
    </>
  );
}

export function MaturityDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>COMPANY MATURITY · ACTIVE HQ</p>
      <p style={{ ...cmeLabel, color: CME.sky, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...cmeLabel, color: CME.sky, marginTop: 4 }}>{store.companyName} · {store.companyStage.replace(/-/g, ' ').toUpperCase()}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['OVERALL MATURITY', `${d.overallMaturityPct}%`],
          ['CONFIDENCE', `${d.assessmentConfidencePct}%`],
          ['DOMAINS', d.domainsAssessed],
          ['ROADMAP', d.roadmapItems],
          ['ORG HEALTH', `${d.organizationalHealthPct}%`],
          ['PATH', store.onboardingPath === 'import-existing' ? 'IMPORT' : 'BUILD NEW'],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CME.panelBorder }}>
            <p style={{ ...cmeValue, fontSize: '12px' }}>{val}</p>
            <p style={cmeLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MaturityPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>MATURITY PHILOSOPHY · NOT ONBOARDING · UNDERSTANDING</p>
      {store.maturityPhilosophy.map((line) => (
        <p key={line} style={{ ...cmeLabel, color: CME.sky }}>· {line}</p>
      ))}
    </section>
  );
}

export function OnboardingPathsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>COMPANY ONBOARDING · TWO PATHS</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['BUILD A NEW COMPANY', 'build-new', 'Start fresh · inherit organizational genetics · same blueprint'],
          ['IMPORT EXISTING COMPANY', 'import-existing', 'Preserve assets · assess maturity · intelligent roadmap'],
        ].map(([title, path, desc]) => (
          <div
            key={path}
            className="p-2 border"
            style={{
              borderColor: store.onboardingPath === path ? CME.sky : CME.panelBorder,
              background: store.onboardingPath === path ? 'rgba(3,105,161,0.04)' : 'white',
            }}
          >
            <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: store.onboardingPath === path ? CME.sky : CME.gray }}>{title}</p>
            <p style={{ ...cmeLabel, fontSize: '5px' }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CompanyStagePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>EXISTING COMPANY ASSESSMENT · CURRENT STAGE</p>
      <div className="flex flex-wrap gap-1">
        {COMPANY_STAGES.map((s) => (
          <span
            key={s.id}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: store.companyStage === s.id ? CME.sky : CME.panelBorder,
              color: store.companyStage === s.id ? CME.sky : CME.gray,
              background: store.companyStage === s.id ? 'rgba(3,105,161,0.06)' : 'white',
            }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: CompanyMaturityWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>COMPANY WORKSPACE</p>
      <div className="flex gap-1 flex-wrap">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? CME.sky : CME.panelBorder,
              color: store.activeWorkspaceId === ws ? CME.sky : CME.gray,
              background: store.activeWorkspaceId === ws ? 'rgba(3,105,161,0.06)' : 'white',
            }}
          >
            {ws.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ExistingAssetInventoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>EXISTING ASSET INVENTORY · PRESERVE & BUILD</p>
      {store.existingAssets.map((a) => (
        <div key={a.id} className="py-1 border-b" style={{ borderColor: CME.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: a.status === 'present' ? CME.green : a.status === 'partial' ? CME.sky : CME.gray }}>
            {a.category.toUpperCase()} · {a.label} · {a.status.toUpperCase()}
          </p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>{a.notes}</p>
        </div>
      ))}
    </section>
  );
}

export function IntegrationCenterPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>INTEGRATION CENTER · ORGANIZATIONAL CONTINUITY</p>
      {store.integrations.map((i) => (
        <div key={i.id} className="py-1 border-b" style={{ borderColor: CME.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {i.platform} · {i.category} · {i.status.replace(/-/g, ' ').toUpperCase()}
          </p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>{i.purpose}</p>
        </div>
      ))}
      <p style={{ ...cmeLabel, marginTop: 8, fontSize: '5px' }}>FUTURE: {INTEGRATION_PLATFORMS.slice(0, 8).join(' · ')} · …</p>
    </section>
  );
}

export function MaturityAssessmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>MATURITY ASSESSMENT · {store.domainScores.length} DOMAINS</p>
      {store.domainScores.map((d) => (
        <div key={d.domain} className="py-2 border-b" style={{ borderColor: CME.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(d.scorePct) }}>
            {d.label} · {d.scorePct}% · CONF {d.confidencePct}%
          </p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>STRENGTH: {d.strength}</p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>WEAKNESS: {d.weakness}</p>
          <p style={{ ...cmeLabel, fontSize: '5px', color: CME.sky }}>→ {d.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalScanPanel({ store }: Pick<Props, 'store'>) {
  const diag = store.diagnostic;
  const sections: [string, string[]][] = [
    ['STRENGTHS', diag.strengths],
    ['RISKS', diag.risks],
    ['KNOWLEDGE GAPS', diag.knowledgeGaps],
    ['MISSING SYSTEMS', diag.missingSystems],
    ['BOTTLENECKS', diag.bottlenecks],
    ['AUTOMATION OPPORTUNITIES', diag.automationOpportunities],
    ['FUTURE RECOMMENDATIONS', diag.futureRecommendations],
  ];
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>ORGANIZATIONAL SCAN · BASELINE HEALTH REPORT</p>
      {sections.map(([title, items]) => (
        <div key={title} className="mb-2">
          <p style={{ ...cmeSectionTitle, fontSize: '7px' }}>{title}</p>
          {items.map((item) => (
            <p key={item} style={{ ...cmeLabel, fontSize: '5px' }}>· {item}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function ArchitectRecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>ARCHITECT RECOMMENDATIONS · PERSONALIZED ROADMAP</p>
      {store.architectRecs.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: CME.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: a.action === 'skip' ? CME.green : a.action === 'optimize' ? CME.sky : CME.accent }}>
            {a.architect} · {a.action.toUpperCase()} · {a.confidencePct}%
          </p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>{a.rationale}</p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>TRIGGER: {a.maturityTrigger}</p>
        </div>
      ))}
    </section>
  );
}

export function CompanyRoadmapPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>COMPANY ROADMAP · IMPLEMENTATION SEQUENCE</p>
      {store.roadmap.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: CME.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(r.confidencePct) }}>
            #{r.sequence} · {r.title} · {r.priority.toUpperCase()}
          </p>
          <p style={cmeLabel}>EFFORT: {r.effort.toUpperCase()} · IMPACT: {r.impact}</p>
          {r.dependencies.length > 0 && <p style={{ ...cmeLabel, fontSize: '5px' }}>DEPS: {r.dependencies.join(' · ')}</p>}
        </div>
      ))}
    </section>
  );
}

export function CompanyTimelinePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>COMPANY TIMELINE · ORGANIZATIONAL HISTORY</p>
      {store.timeline.map((e) => (
        <div key={e.id} className="py-1 border-b flex gap-2" style={{ borderColor: CME.panelBorder }}>
          <span style={{ ...cmeLabel, color: CME.sky, minWidth: 48, fontSize: '5px' }}>{e.date}</span>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{e.label}</p>
            <p style={{ ...cmeLabel, fontSize: '5px' }}>{e.type.toUpperCase()}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function MaturitySimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>SIMULATION · COMPARE IMPLEMENTATION PATHS</p>
      {store.simulations.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: CME.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(s.confidencePct) }}>
            {s.label} · +{s.maturityImprovementPct}% · {s.confidencePct}%
          </p>
          <p style={cmeLabel}>PATH: {s.path}</p>
          <p style={cmeLabel}>IMPACT: {s.organizationalImpact}</p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>EFFORT: {s.effort} · RESOURCES: {s.resources}</p>
          {s.risks.map((r) => <p key={r} style={{ ...cmeLabel, fontSize: '5px', color: CME.red }}>RISK: {r}</p>)}
        </div>
      ))}
      <Link
        to={adminStudioSimulationEnginePath()}
        style={{ ...cmeLabel, color: CME.sky, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN SIMULATION ENGINE
      </Link>
    </section>
  );
}

export function CosMaturityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cmePanel, borderLeft: `4px solid ${CME.sky}` }}>
      <p style={cmeSectionTitle}>CHIEF OF STAFF · MATURITY MONITORING</p>
      {store.cosAlerts.map((a) => (
        <div key={a.id} className="py-1 border-b" style={{ borderColor: CME.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: a.trend === 'declining' ? CME.red : a.trend === 'plateauing' ? CME.slate : CME.green }}>
            {a.domain} · {a.trend.toUpperCase()}
          </p>
          <p style={{ ...cmeLabel, fontSize: '5px' }}>{a.message}</p>
          <p style={{ ...cmeLabel, fontSize: '5px', color: CME.sky }}>→ {a.recommendation}</p>
        </div>
      ))}
      <Link
        to={adminStudioChiefOfStaffPath()}
        style={{ ...cmeLabel, color: CME.sky, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function HistoricalProgressPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>HISTORICAL PROGRESS · MATURITY OVER TIME</p>
      {store.historicalProgress.map((h) => (
        <div key={h.date} className="py-1 flex justify-between border-b" style={{ borderColor: CME.panelBorder }}>
          <span style={cmeLabel}>{h.date}</span>
          <span style={{ ...cmeValue, fontSize: '11px', color: scoreColor(h.overallPct) }}>{h.overallPct}%</span>
        </div>
      ))}
      <p style={{ ...cmeSectionTitle, marginTop: 8 }}>FUTURE PROJECTIONS</p>
      {store.futureProjections.map((p) => (
        <p key={p} style={{ ...cmeLabel, fontSize: '5px', color: CME.sky }}>· {p}</p>
      ))}
    </section>
  );
}

export function MaturityScorecardPanel({ store }: Pick<Props, 'store'>) {
  const top = [...store.domainScores].sort((a, b) => b.scorePct - a.scorePct).slice(0, 5);
  const bottom = [...store.domainScores].sort((a, b) => a.scorePct - b.scorePct).slice(0, 5);
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>ORGANIZATIONAL SCORECARD · STRENGTHS & OPPORTUNITIES</p>
      <p style={{ ...cmeSectionTitle, fontSize: '7px' }}>TOP STRENGTHS</p>
      {top.map((d) => (
        <p key={d.domain} style={{ ...cmeLabel, fontSize: '5px', color: CME.green }}>{d.label} {d.scorePct}%</p>
      ))}
      <p style={{ ...cmeSectionTitle, fontSize: '7px', marginTop: 8 }}>GROWTH OPPORTUNITIES</p>
      {bottom.map((d) => (
        <p key={d.domain} style={{ ...cmeLabel, fontSize: '5px', color: CME.sky }}>{d.label} {d.scorePct}% · {d.growthOpportunity}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={cmePanel}>
      <p style={cmeSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {COMPANY_MATURITY_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CME.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...cmeLabel, color: CME.sky, fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...cmeLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INHERITANCE</Link>
        <Link to={adminStudioKnowledgeAssetEnginePath()} style={{ ...cmeLabel, color: '#0D9488', fontSize: '6px' }}>→ KNOWLEDGE ASSET ENGINE</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...cmeLabel, color: '#BE185D', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioSimulationEnginePath()} style={{ ...cmeLabel, color: CME.slate, fontSize: '6px' }}>→ SIMULATION ENGINE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...cmeLabel, color: CME.accent, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
      </div>
    </section>
  );
}
