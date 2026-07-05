import { Link } from 'react-router-dom';
import type { ExperienceArchitectStore, ExperienceArchitectWorkspaceId } from '../../../../studio-os-core/experience-architect/types';
import { EXPERIENCE_ARCHITECT_CONNECTED_SYSTEMS } from '../../../../studio-os-core/experience-architect/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioDigitalArchitectPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  EA,
  EXPERIENCE_ARCHITECT_STYLES,
  eaDarkHeader,
  eaLabel,
  eaLiveDot,
  eaPanel,
  eaSectionTitle,
  eaValue,
  frictionColor,
  scoreColor,
} from './experienceArchitectTheme';

type Props = {
  store: ExperienceArchitectStore;
  onSelectWorkspace: (id: ExperienceArchitectWorkspaceId) => void;
};

export function ExperienceArchitectHeader() {
  return (
    <>
      <style>{EXPERIENCE_ARCHITECT_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...eaDarkHeader, borderTop: `3px solid ${EA.cyan}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          EXPERIENCE ARCHITECT
        </p>
        <p style={{ ...eaLabel, color: '#94A3B8' }}>
          <span style={eaLiveDot} />
          EMOTIONAL DESIGN · EVERY TOUCHPOINT · OPTIMIZE FOR MEMORABILITY
        </p>
        <p style={{ ...eaLabel, color: '#CBD5E1', marginTop: 4 }}>
          NOT UI DESIGN · HOW PEOPLE FEEL FROM DISCOVERY TO LEGACY
        </p>
      </header>
    </>
  );
}

export function ExperienceDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE ARCHITECT · ACTIVE HQ</p>
      <p style={{ ...eaLabel, color: EA.cyan, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...eaLabel, color: EA.cyan, marginTop: 4 }}>{store.companyName} · {d.approvalStatus.replace(/-/g, ' ').toUpperCase()}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['EXPERIENCE HEALTH', `${d.experienceHealthPct}%`],
          ['JOURNEY', `${d.journeyCompletenessPct}%`],
          ['EMOTIONAL', `${d.emotionalCoherencePct}%`],
          ['RELATIONSHIP', `${d.relationshipImpactPct}%`],
          ['CROSS-CHANNEL', `${d.crossChannelConsistencyPct}%`],
          ['HANDOFF', store.digitalHandoff.status.toUpperCase()],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: EA.panelBorder }}>
            <p style={{ ...eaValue, fontSize: '12px' }}>{val}</p>
            <p style={eaLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ExperiencePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE PHILOSOPHY · MEMORABILITY OVER USABILITY</p>
      {store.experiencePhilosophy.map((line) => (
        <p key={line} style={{ ...eaLabel, color: EA.cyan }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExperienceBlueprintPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE BLUEPRINT · COMPLETE JOURNEY</p>
      {store.blueprintStages.map((s) => (
        <div key={s.id} className="p-2 mb-1 border" style={{ borderColor: EA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{s.label}</p>
            <span className="text-[5px] font-futura" style={{ color: s.status === 'approved' ? EA.green : EA.cyan }}>{s.status.toUpperCase()}</span>
          </div>
          <p style={{ ...eaLabel, fontSize: '5px' }}>EMOTIONAL: {s.emotionalGoal}</p>
          <p style={{ ...eaLabel, fontSize: '5px', color: EA.slate }}>IDENTITY: {s.identityReinforcement}</p>
        </div>
      ))}
    </section>
  );
}

export function JourneyMapPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>CUSTOMER JOURNEY MAP · TOUCHPOINTS</p>
      {store.journeyTouchpoints.map((t) => (
        <div key={t.id} className="p-2 mb-1 border" style={{ borderColor: EA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{t.touchpoint}</p>
            <span className="text-[5px] font-futura" style={{ color: t.dropOffRisk === 'high' ? EA.red : t.dropOffRisk === 'medium' ? EA.slate : EA.green }}>
              DROP-OFF {t.dropOffRisk.toUpperCase()}
            </span>
          </div>
          <p style={{ ...eaLabel, fontSize: '5px' }}>{t.stage} · {t.entryPoint ? 'ENTRY POINT' : 'TOUCHPOINT'}</p>
          <div className="flex gap-2 mt-1">
            <span style={{ ...eaLabel, fontSize: '5px', color: frictionColor(t.frictionScore) }}>FRICTION {t.frictionScore}</span>
            <span style={{ ...eaLabel, fontSize: '5px', color: scoreColor(t.delightScore) }}>DELIGHT {t.delightScore}</span>
            {t.trustBuilder && <span style={{ ...eaLabel, fontSize: '5px', color: EA.green }}>TRUST</span>}
            {t.relationshipMilestone && <span style={{ ...eaLabel, fontSize: '5px', color: EA.cyan }}>MILESTONE</span>}
          </div>
          <p style={{ ...eaLabel, fontSize: '5px', marginTop: 4, color: EA.cyan }}>→ {t.relationshipEngineLink}</p>
        </div>
      ))}
    </section>
  );
}

export function EmotionalArchitecturePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EMOTIONAL ARCHITECTURE · DESIGNED PROGRESSION</p>
      {store.emotionalArchitecture.map((e, i) => (
        <div key={e.id} className="flex gap-2 py-1 items-start">
          {i > 0 && <span style={{ ...eaLabel, color: EA.gray, fontSize: '8px' }}>↓</span>}
          <div className="flex-1 p-1 border" style={{ borderColor: EA.panelBorder }}>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: EA.cyan }}>{e.emotion}</p>
            <p style={{ ...eaLabel, fontSize: '5px' }}>{e.description}</p>
            <p style={{ ...eaLabel, fontSize: '5px', color: EA.slate }}>OUTCOME: {e.designedOutcome}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function ExperienceSystemsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE SYSTEMS · PHILOSOPHIES & FRAMEWORKS</p>
      {store.experienceSystems.map((s) => (
        <div key={s.id} className="flex justify-between items-center py-1 border-b" style={{ borderColor: EA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{s.system}</p>
            <p style={{ ...eaLabel, fontSize: '5px' }}>{s.philosophy}</p>
          </div>
          <span className="text-[5px] font-futura px-1 border" style={{ borderColor: s.status === 'approved' ? EA.green : EA.panelBorder, color: s.status === 'approved' ? EA.green : EA.gray }}>
            {s.status.toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function MicroExperienceLibraryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>MICRO-EXPERIENCE LIBRARY · EVERY SMALL INTERACTION</p>
      {store.microExperiences.map((m) => (
        <div key={m.id} className="p-2 mb-1 border" style={{ borderColor: EA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{m.label}</p>
            <span className="text-[5px] font-futura" style={{ color: m.status === 'approved' ? EA.green : EA.cyan }}>{m.status.toUpperCase()}</span>
          </div>
          <p style={{ ...eaLabel, fontSize: '5px' }}>{m.category} · {m.identityReinforcement}</p>
        </div>
      ))}
    </section>
  );
}

export function ExperienceSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE SIMULATION · BEFORE IMPLEMENTATION</p>
      {store.simulations.map((s) => (
        <div key={s.id} className="p-2 mb-2 border" style={{ borderColor: EA.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: EA.cyan }}>{s.persona}</p>
          <p style={{ ...eaLabel, fontSize: '5px' }}>{s.channel}</p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {[
              ['FRICTION', s.frictionPct, true],
              ['CLARITY', s.clarityPct, false],
              ['EMOTION', s.emotionScore, false],
              ['TRUST', s.trustPct, false],
              ['CONFIDENCE', s.confidencePct, false],
            ].map(([label, pct, invert]) => (
              <div key={label as string} className="text-center">
                <p style={{ ...eaValue, fontSize: '10px', color: invert ? frictionColor(pct as number) : scoreColor(pct as number) }}>{pct}%</p>
                <p style={{ ...eaLabel, fontSize: '4px' }}>{label}</p>
              </div>
            ))}
          </div>
          {s.recommendations.map((r) => (
            <p key={r} style={{ ...eaLabel, fontSize: '5px', color: EA.slate }}>→ {r}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function ExperienceIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE INTELLIGENCE · STUDIO INTELLIGENCE FEEDS</p>
      {store.intelligenceAlerts.map((a) => (
        <div key={a.id} className="p-2 mb-1 border" style={{ borderColor: EA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{a.category}</p>
            <span className="text-[5px] font-futura" style={{ color: a.priority === 'critical' ? EA.red : a.priority === 'high' ? EA.slate : EA.gray }}>{a.priority.toUpperCase()}</span>
          </div>
          <p style={{ ...eaLabel, fontSize: '5px' }}>{a.signal}</p>
          <p style={{ ...eaLabel, fontSize: '5px', color: EA.cyan }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function CrossChannelPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>CROSS-CHANNEL EXPERIENCE · UNIFIED IDENTITY</p>
      {store.crossChannel.map((c) => (
        <div key={c.id} className="flex justify-between items-center py-1 border-b" style={{ borderColor: EA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{c.channel}</p>
            <p style={{ ...eaLabel, fontSize: '5px' }}>{c.notes}</p>
          </div>
          <div className="text-right">
            <p style={{ ...eaValue, fontSize: '10px', color: scoreColor(c.consistencyPct) }}>{c.consistencyPct}%</p>
            <span className="text-[4px] font-futura" style={{ color: c.status === 'unified' ? EA.green : c.status === 'partial' ? EA.cyan : EA.red }}>{c.status.toUpperCase()}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export function ExperienceStandardsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE STANDARDS · MEASURABLE QUALITY</p>
      {store.experienceStandards.map((s) => (
        <div key={s.id} className="p-2 mb-1 border" style={{ borderColor: EA.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{s.standard}</p>
          <p style={{ ...eaLabel, fontSize: '5px' }}>{s.metric} · TARGET: {s.target}</p>
          <span className="text-[5px] font-futura" style={{ color: s.status === 'active' ? EA.green : EA.cyan }}>{s.status.toUpperCase()}</span>
        </div>
      ))}
    </section>
  );
}

export function FrictionAnalysisPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>FRICTION ANALYSIS · DROP-OFF POINTS</p>
      {store.frictionAnalysis.map((f) => (
        <p key={f} style={{ ...eaLabel, fontSize: '5px', color: EA.red }}>· {f}</p>
      ))}
      <p style={{ ...eaSectionTitle, marginTop: 8 }}>RETENTION OPPORTUNITIES</p>
      {store.retentionOpportunities.map((r) => (
        <p key={r} style={{ ...eaLabel, fontSize: '5px', color: EA.cyan }}>· {r}</p>
      ))}
    </section>
  );
}

export function DigitalArchitectHandoffPanel({ store }: Pick<Props, 'store'>) {
  const h = store.digitalHandoff;
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>DIGITAL ARCHITECT HANDOFF · FUTURE VISION</p>
      <p style={{ ...eaLabel, color: EA.cyan }}>STATUS: {h.status.toUpperCase()} · Digital Architect never invents experiences — builds approved system faithfully.</p>
      <p style={{ ...eaSectionTitle, fontSize: '7px', marginTop: 8 }}>INHERITED ASSETS</p>
      {h.inheritedAssets.map((a) => (
        <p key={a} style={{ ...eaLabel, fontSize: '5px' }}>· {a}</p>
      ))}
      <p style={{ ...eaSectionTitle, fontSize: '7px', marginTop: 8 }}>DOWNSTREAM TARGETS</p>
      {h.downstreamTargets.map((t) => (
        <p key={t} style={{ ...eaLabel, fontSize: '5px', color: EA.slate }}>→ {t}</p>
      ))}
      <Link
        to={adminStudioDigitalArchitectPath()}
        style={{ ...eaLabel, color: '#6366F1', fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN DIGITAL ARCHITECT
      </Link>
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ExperienceArchitectWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>EXPERIENCE WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? EA.cyan : EA.panelBorder,
              color: store.activeWorkspaceId === id ? EA.cyan : EA.gray,
              background: store.activeWorkspaceId === id ? 'rgba(8,145,178,0.04)' : 'white',
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
    <section className="p-3 mb-3" style={eaPanel}>
      <p style={eaSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {EXPERIENCE_ARCHITECT_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: EA.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioBrandArchitectPath()} style={{ ...eaLabel, color: '#BE185D', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...eaLabel, color: '#0369A1', fontSize: '6px' }}>→ COMPANY MATURITY ENGINE</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...eaLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...eaLabel, color: '#7C3AED', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...eaLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...eaLabel, color: EA.slate, fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...eaLabel, color: EA.accent, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
      </div>
    </section>
  );
}
