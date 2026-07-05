import { Link } from 'react-router-dom';
import type { LeadershipModeId, LeadershipModesStore, LeadershipModesWorkspaceId } from '../../../../studio-os-core/leadership-modes/types';
import { LM_CONNECTED_SYSTEMS } from '../../../../studio-os-core/leadership-modes/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioCampusEvolutionEnginePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioOrganizationalAutonomyFrameworkPath,
  adminStudioOrganizationalDelegationEnginePath,
  adminStudioOrganizationalGovernanceSafeguardsPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalMaturityModelPath,
  adminStudioOrganizationalSelfImprovementPath,
  adminStudioOrganizationalWorkflowOrchestrationPath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  LEADERSHIP_MODES_STYLES,
  LM,
  lmDarkHeader,
  lmLabel,
  lmLiveDot,
  lmPanel,
  lmSectionTitle,
  lmValue,
  modeColor,
} from './leadershipModesTheme';

type Props = {
  store: LeadershipModesStore;
  onSelectWorkspace: (id: LeadershipModesWorkspaceId) => void;
  onSelectMode: (id: LeadershipModeId) => void;
};

export function LeadershipModesHeader() {
  return (
    <>
      <style>{LEADERSHIP_MODES_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...lmDarkHeader, borderTop: `3px solid ${LM.indigo}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          LEADERSHIP MODES
        </p>
        <p style={{ ...lmLabel, color: '#C7D2FE' }}>
          <span style={lmLiveDot} />
          FOUNDER & EXECUTIVE MODE · V1.0 · HOW DO YOU WANT TO LEAD TODAY?
        </p>
        <p style={{ ...lmLabel, color: '#E0E7FF', marginTop: 4 }}>
          SAME ORGANIZATION · DIFFERENT PERSPECTIVE · ZERO CONTEXT LOST
        </p>
      </header>
    </>
  );
}

export function LmDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...lmPanel, background: LM.missionBg }}>
      <p style={lmSectionTitle}>LEADERSHIP DASHBOARD · ACTIVE PERSPECTIVE</p>
      <p style={{ ...lmLabel, color: LM.indigo, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...lmLabel, color: LM.indigo, marginTop: 4 }}>
        {store.companyName} · ACTIVE {d.activeModeLabel} · RECOMMENDED {d.recommendedModeLabel}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['DETECTION', `${d.detectionConfidencePct}%`],
          ['TRANSITIONS', `${d.transitionsToday}`],
          ['BRIEFING', d.briefingReady ? 'READY' : 'PENDING'],
          ['CAMPUS', 'LIVE'],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: LM.panelBorder }}>
            <p style={{ ...lmValue, fontSize: '12px' }}>{val}</p>
            <p style={lmLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...lmLabel, color: LM.stone, marginTop: 8 }}>CAMPUS: {d.campusAmbiance}</p>
    </section>
  );
}

export function LeadershipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>LEADERSHIP PHILOSOPHY · ADAPT TO THE FOUNDER</p>
      {store.leadershipPhilosophy.map((line) => (
        <p key={line} style={{ ...lmLabel, color: LM.indigo }}>· {line}</p>
      ))}
    </section>
  );
}

export function LeadershipModesPanel({ store, onSelectMode }: Pick<Props, 'store' | 'onSelectMode'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>LEADERSHIP MODES · SWITCH INSTANTLY</p>
      {store.leadershipModes.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectMode(m.id)}
              className="px-2 py-1 text-[6px] font-futura border"
              style={{
                fontWeight: 515,
                borderColor: store.activeModeId === m.id ? modeColor(m.id) : LM.panelBorder,
                color: store.activeModeId === m.id ? modeColor(m.id) : LM.gray,
                background: store.activeModeId === m.id ? `${modeColor(m.id)}14` : 'white',
              }}
            >
              {store.activeModeId === m.id ? '● ' : ''}{m.label}
            </button>
            <p style={{ ...lmLabel, color: modeColor(m.id), fontFamily: '"Futura PT Medium"', fontSize: '6px' }}>{m.tagline}</p>
          </div>
          {m.priorities.map((p) => (
            <p key={p} style={{ ...lmLabel, color: LM.stone }}>· {p}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function ModeDetectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>AUTOMATIC MODE DETECTION · STUDIO INTELLIGENCE</p>
      {store.modeDetections.map((d) => (
        <div key={d.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <p style={{ ...lmLabel, fontSize: '6px', color: modeColor(d.recommendedMode), fontFamily: '"Futura PT Medium"' }}>
            → {d.recommendedMode.toUpperCase()} MODE · {d.confidence}% · {d.overrideAllowed ? 'OVERRIDE OK' : 'LOCKED'}
          </p>
          <p style={lmLabel}>SIGNAL: {d.signal}</p>
        </div>
      ))}
    </section>
  );
}

export function AdaptiveInterfacePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>ADAPTIVE INTERFACE · FAMILIAR · DIFFERENT PRIORITIES</p>
      {store.adaptiveInterface.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <p style={{ ...lmLabel, fontSize: '6px', color: modeColor(a.currentMode), fontFamily: '"Futura PT Medium"' }}>
            {a.area.toUpperCase()} · {a.currentMode.toUpperCase()} MODE
          </p>
          <p style={lmLabel}>{a.adjustment}</p>
        </div>
      ))}
    </section>
  );
}

export function ChiefOfStaffBriefingsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>CHIEF OF STAFF · MODE-SPECIFIC BRIEFINGS</p>
      {store.chiefOfStaffBriefings.map((b) => (
        <div key={b.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <p style={{ ...lmLabel, fontSize: '6px', color: modeColor(b.mode), fontFamily: '"Futura PT Medium"' }}>
            {b.mode.toUpperCase()} MODE · {b.briefingType.toUpperCase()}
          </p>
          <p style={lmLabel}>{b.summary}</p>
          <p style={{ ...lmLabel, color: LM.stone }}>ANTICIPATES: {b.anticipates}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveBehaviorPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>EXECUTIVE BEHAVIOR · COMMUNICATION ADAPTS</p>
      {store.executiveBehaviors.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <p style={{ ...lmLabel, fontSize: '6px', color: modeColor(e.mode), fontFamily: '"Futura PT Medium"' }}>
            {e.executive.toUpperCase()} · {e.mode.toUpperCase()} · {e.communicationStyle.toUpperCase()}
          </p>
          <p style={lmLabel}>{e.example}</p>
        </div>
      ))}
    </section>
  );
}

export function OiModeIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>ORGANIZATIONAL INTELLIGENCE · MODE RECOMMENDATIONS</p>
      {store.oiModeIntegration.map((o) => (
        <div key={o.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <p style={{ ...lmLabel, fontSize: '6px', color: modeColor(o.recommendation), fontFamily: '"Futura PT Medium"' }}>
            RECOMMEND {o.recommendation.toUpperCase()} MODE
          </p>
          <p style={lmLabel}>EVAL: {o.evaluation}</p>
          <p style={{ ...lmLabel, color: LM.indigo }}>{o.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function CampusTransformationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>CAMPUS TRANSFORMATION · ALIVE · SAME ARCHITECTURE</p>
      {store.campusTransformations.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <p style={{ ...lmLabel, fontSize: '6px', color: modeColor(c.mode), fontFamily: '"Futura PT Medium"' }}>
            {c.mode.toUpperCase()} MODE · {c.ambiance.toUpperCase()}
          </p>
          <p style={lmLabel}>SPACES: {c.spaces}</p>
          <p style={{ ...lmLabel, color: LM.stone }}>FEELING: {c.feeling}</p>
        </div>
      ))}
    </section>
  );
}

export function LeadershipTransitionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>LEADERSHIP TRANSITIONS · ZERO CONTEXT LOST</p>
      {store.leadershipTransitions.map((t) => (
        <div key={t.id} className="py-2 border-b" style={{ borderColor: LM.panelBorder }}>
          <p style={{ ...lmLabel, fontSize: '6px', color: LM.indigo, fontFamily: '"Futura PT Medium"' }}>
            {t.fromMode.toUpperCase()} → {t.toMode.toUpperCase()} · {t.instant ? 'INSTANT' : 'GRADUAL'}
          </p>
          <p style={lmLabel}>PRESERVED: {t.preserved.join(' · ')}</p>
        </div>
      ))}
      <p style={{ ...lmLabel, color: LM.stone, marginTop: 8 }}>SWITCHING MODES = CHANGING PERSPECTIVES · NOT DIFFERENT SOFTWARE</p>
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...lmLabel, color: LM.indigo }}>· {step}</p>
      ))}
      {store.futureOpportunities.map((opp) => (
        <p key={opp} style={{ ...lmLabel, color: LM.stone }}>FUTURE: {opp}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: LeadershipModesWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>WORKSPACE · LEADERSHIP CONTEXT</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? LM.indigo : LM.panelBorder,
              color: store.activeWorkspaceId === id ? LM.indigo : LM.gray,
              background: store.activeWorkspaceId === id ? 'rgba(79,70,229,0.08)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={lmPanel}>
      <p style={lmSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {LM_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: LM.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalMaturityModelPath()} style={{ ...lmLabel, color: '#D97706', fontSize: '6px' }}>→ ORGANIZATIONAL MATURITY MODEL</Link>
        <Link to={adminStudioOrganizationalGovernanceSafeguardsPath()} style={{ ...lmLabel, color: '#475569', fontSize: '6px' }}>→ ORGANIZATIONAL GOVERNANCE & SAFEGUARDS</Link>
        <Link to={adminStudioOrganizationalSelfImprovementPath()} style={{ ...lmLabel, color: '#10B981', fontSize: '6px' }}>→ ORGANIZATIONAL SELF-IMPROVEMENT</Link>
        <Link to={adminStudioOrganizationalWorkflowOrchestrationPath()} style={{ ...lmLabel, color: '#0EA5E9', fontSize: '6px' }}>→ ORGANIZATIONAL WORKFLOW ORCHESTRATION</Link>
        <Link to={adminStudioOrganizationalDelegationEnginePath()} style={{ ...lmLabel, color: '#7C3AED', fontSize: '6px' }}>→ ORGANIZATIONAL DELEGATION ENGINE</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...lmLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...lmLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...lmLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...lmLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...lmLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...lmLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...lmLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...lmLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...lmLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...lmLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...lmLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...lmLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...lmLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...lmLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioCampusEvolutionEnginePath()} style={{ ...lmLabel, color: '#CA8A04', fontSize: '6px' }}>→ CAMPUS EVOLUTION ENGINE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...lmLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...lmLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}
