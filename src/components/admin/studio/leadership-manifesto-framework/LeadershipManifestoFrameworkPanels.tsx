import { Link } from 'react-router-dom';
import type { LeadershipManifestoFrameworkStore, LeadershipManifestoFrameworkWorkspaceId } from '../../../../studio-os-core/leadership-manifesto-framework/types';
import { LEADERSHIP_MANIFESTO_CONNECTED_SYSTEMS } from '../../../../studio-os-core/leadership-manifesto-framework/constants';
import {
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioExecutiveFrameworkPath,
  adminStudioFoundersPromisePath,
  adminStudioLeadershipDnaPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  LEADERSHIP_MANIFESTO_FRAMEWORK_STYLES,
  LMF,
  lmfDarkHeader,
  lmfLabel,
  lmfLiveDot,
  lmfPanel,
  lmfSectionTitle,
  lmfValue,
  readinessColor,
  scoreColor,
  statusColor,
} from './leadershipManifestoFrameworkTheme';

type Props = {
  store: LeadershipManifestoFrameworkStore;
  onSelectWorkspace: (id: LeadershipManifestoFrameworkWorkspaceId) => void;
};

export function LeadershipManifestoFrameworkHeader() {
  return (
    <>
      <style>{LEADERSHIP_MANIFESTO_FRAMEWORK_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...lmfDarkHeader, borderTop: `3px solid ${LMF.indigo}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          LEADERSHIP MANIFESTO FRAMEWORK
        </p>
        <p style={{ ...lmfLabel, color: '#C7D2FE' }}>
          <span style={lmfLiveDot} />
          CONSTITUTIONAL FOUNDATION · LIVING ORGANIZATIONAL DNA · WISDOM OVER AUTHORITY
        </p>
        <p style={{ ...lmfLabel, color: '#E0E7FF', marginTop: 4 }}>
          EVERY EXECUTIVE INHERITS SHARED PRINCIPLES · DEVELOPS DISCIPLINE-SPECIFIC EXPERTISE
        </p>
      </header>
    </>
  );
}

export function ManifestoDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>MANIFESTO ORGANIZATION · DASHBOARD</p>
      <p style={{ ...lmfLabel, color: LMF.indigo, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...lmfLabel, color: LMF.indigo, marginTop: 4 }}>{store.companyName}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['MANIFESTOS', `${d.activeManifestos}`],
          ['INHERITED', `${d.inheritedExecutives}`],
          ['NON-NEGOTIABLES', `${d.nonNegotiables}`],
          ['HEALTH', `${d.manifestoHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: LMF.panelBorder }}>
            <p style={{ ...lmfValue, fontSize: '12px' }}>{val}</p>
            <p style={lmfLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...lmfLabel, marginTop: 8 }}>
        ORGANIZATIONAL WISDOM: {d.organizationalWisdomPct}% · FUTURE EXECUTIVES: {d.futureExecutivesPrepared}
      </p>
    </section>
  );
}

export function ManifestoPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>MANIFESTO PHILOSOPHY · CONSISTENT LEADERSHIP</p>
      {store.manifestoPhilosophy.map((line) => (
        <p key={line} style={{ ...lmfLabel, color: LMF.indigo }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveIdentityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...lmfPanel, background: LMF.manifestoBg }}>
      <p style={lmfSectionTitle}>EXECUTIVE IDENTITY · PURPOSE · STEWARDSHIP</p>
      {store.executiveIdentities.map((e) => (
        <div key={e.id} className="py-2 border-b mb-2" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '7px', color: readinessColor(e.status), fontFamily: '"Futura PT Medium"' }}>
            {e.executiveTitle} · {e.status.toUpperCase()}
          </p>
          <p style={{ ...lmfLabel, fontSize: '6px', color: LMF.indigo }}>{e.organizationalPurpose}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>MISSION: {e.leadershipMission}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>STAKEHOLDERS: {e.primaryStakeholders}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>STEWARDSHIP: {e.areasOfStewardship}</p>
        </div>
      ))}
    </section>
  );
}

export function LeadershipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>LEADERSHIP PHILOSOPHY · WISDOM OVER AUTHORITY</p>
      {store.leadershipPhilosophy.map((p) => (
        <div key={p.id} className="py-1 border-b" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '6px', color: LMF.indigo, fontFamily: '"Futura PT Medium"' }}>{p.dimension}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>{p.principle}</p>
        </div>
      ))}
    </section>
  );
}

export function CoreBeliefsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>CORE BELIEFS · WHAT WE VALUE</p>
      {store.coreBeliefs.map((b) => (
        <p key={b.id} style={{ ...lmfLabel, color: LMF.indigo }}>
          · [{b.category.toUpperCase()}] {b.belief}
        </p>
      ))}
    </section>
  );
}

export function NonNegotiablesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...lmfPanel, borderLeft: `4px solid ${LMF.indigo}` }}>
      <p style={lmfSectionTitle}>NON-NEGOTIABLES · NEVER COMPROMISE</p>
      {store.nonNegotiables.map((n) => (
        <div key={n.id} className="py-1 border-b" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '6px', color: LMF.indigo, fontFamily: '"Futura PT Medium"' }}>{n.principle}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>{n.description}</p>
        </div>
      ))}
    </section>
  );
}

export function DecisionFrameworkPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>DECISION FRAMEWORK · EVALUATE BEFORE RECOMMENDING</p>
      {store.decisionEvaluations.map((d) => (
        <div key={d.id} className="py-1 border-b" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '6px', color: LMF.indigo, fontFamily: '"Futura PT Medium"' }}>{d.dimension}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>{d.description}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveCompassPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...lmfPanel, background: LMF.manifestoBg }}>
      <p style={lmfSectionTitle}>EXECUTIVE COMPASS · UNIQUE DISCIPLINE QUESTIONS</p>
      {store.executiveCompasses.map((c) => (
        <div key={c.id} className="py-2 border-b mb-2" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '6px', color: LMF.indigo, fontFamily: '"Futura PT Medium"' }}>
            {c.executive} · {c.discipline.toUpperCase()}
          </p>
          <p style={{ ...lmfLabel, fontSize: '6px', fontStyle: 'italic', color: LMF.accent }}>
            &ldquo;{c.compassQuestion}&rdquo;
          </p>
        </div>
      ))}
    </section>
  );
}

export function ExcellencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>DEFINITION OF EXCELLENCE · PURSUE CONSISTENTLY</p>
      {store.excellenceDefinitions.map((e) => (
        <div key={e.id} className="py-2 border-b mb-2" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '6px', color: LMF.indigo, fontFamily: '"Futura PT Medium"' }}>{e.executive}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>EXCEPTIONAL: {e.exceptional}</p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>AVERAGE: {e.average}</p>
          <p style={{ ...lmfLabel, fontSize: '5px', color: '#CA8A04' }}>WARNING: {e.warningSigns}</p>
          <p style={{ ...lmfLabel, fontSize: '5px', color: LMF.red }}>FAILURE: {e.failureIndicators}</p>
        </div>
      ))}
    </section>
  );
}

export function CommunicationStandardsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>COMMUNICATION STANDARDS · EXPLAIN WHY</p>
      {store.communicationStandards.map((s) => (
        <p key={s.id} style={{ ...lmfLabel, color: LMF.indigo }}>· {s.description}</p>
      ))}
    </section>
  );
}

export function CollaborationPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>COLLABORATION PHILOSOPHY · ORGANIZATIONAL SUCCESS FIRST</p>
      {store.collaborationPhilosophy.map((p) => (
        <p key={p.id} style={{ ...lmfLabel, color: LMF.indigo }}>· {p.principle}</p>
      ))}
    </section>
  );
}

export function LearningPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>LEARNING PHILOSOPHY · ORGANIZATION BECOMES WISER</p>
      {store.learningSources.map((l) => (
        <div key={l.id} className="py-1 border-b" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '6px', color: statusColor(l.status), fontFamily: '"Futura PT Medium"' }}>
            {l.source} · {l.status.toUpperCase()}
          </p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>{l.contribution}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderRelationshipPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>FOUNDER RELATIONSHIP · STRENGTHEN · NEVER REPLACE</p>
      {store.founderRelationship.map((f) => (
        <p key={f.id} style={{ ...lmfLabel, color: LMF.indigo }}>· {f.description}</p>
      ))}
    </section>
  );
}

export function LegacyCommitmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>LEGACY COMMITMENT · PRESERVE FOR FUTURE GENERATIONS</p>
      {store.legacyCommitments.map((l) => (
        <p key={l.id} style={{ ...lmfLabel, color: LMF.indigo }}>· {l.commitment}</p>
      ))}
    </section>
  );
}

export function ManifestoInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>MANIFESTO INHERITANCE · ALL FUTURE EXECUTIVES</p>
      {store.manifestoInheritance.map((m) => (
        <div key={m.id} className="py-1 border-b flex justify-between" style={{ borderColor: LMF.panelBorder }}>
          <p style={{ ...lmfLabel, fontSize: '6px', color: readinessColor(m.readiness), fontFamily: '"Futura PT Medium"' }}>
            {m.executiveTitle}
          </p>
          <p style={{ ...lmfLabel, fontSize: '5px' }}>
            {m.inheritsFramework ? 'INHERITS' : 'PENDING'} · {m.customizedManifesto ? 'CUSTOMIZED' : 'TEMPLATE'} · {m.readiness.toUpperCase()}
          </p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...lmfLabel, color: LMF.indigo }}>→ {step}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: { id: LeadershipManifestoFrameworkWorkspaceId; label: string }[] = [
    { id: 'ndxbook', label: 'NDXBOOK' },
    { id: 'frontal-slayer', label: 'FRONTAL SLAYER' },
    { id: 'studio-os', label: 'STUDIO OS' },
    { id: 'portfolio', label: 'PORTFOLIO' },
  ];
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>WORKSPACE · {store.activeWorkspaceId.toUpperCase()}</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onSelectWorkspace(w.id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              borderColor: store.activeWorkspaceId === w.id ? LMF.indigo : LMF.panelBorder,
              color: store.activeWorkspaceId === w.id ? LMF.indigo : LMF.gray,
              background: store.activeWorkspaceId === w.id ? 'rgba(67,56,202,0.06)' : 'white',
            }}
          >
            {w.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {LEADERSHIP_MANIFESTO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: LMF.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...lmfLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...lmfLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...lmfLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...lmfLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...lmfLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...lmfLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...lmfLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...lmfLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...lmfLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}

export function ManifestoHealthPanel({ store }: Pick<Props, 'store'>) {
  const pct = store.dashboard.manifestoHealthPct;
  return (
    <section className="p-3 mb-3" style={lmfPanel}>
      <p style={lmfSectionTitle}>MANIFESTO HEALTH · ORGANIZATIONAL DNA</p>
      <p style={{ ...lmfValue, color: scoreColor(pct) }}>{pct}%</p>
      <p style={lmfLabel}>Unified leadership consistency · stewardship · integrity · learning velocity</p>
    </section>
  );
}
