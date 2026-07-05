import { Link } from 'react-router-dom';
import type { BrandArchitectStore, BrandArchitectWorkspaceId } from '../../../../studio-os-core/brand-architect/types';
import { BRAND_ARCHITECT_CONNECTED_SYSTEMS } from '../../../../studio-os-core/brand-architect/constants';
import {
  adminStudioBusinessModelEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioLeadershipDnaPath,
  adminStudioMemoryBiblePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  BA,
  BRAND_ARCHITECT_STYLES,
  baDarkHeader,
  baLabel,
  baLiveDot,
  baPanel,
  baSectionTitle,
  baValue,
  scoreColor,
} from './brandArchitectTheme';

type Props = {
  store: BrandArchitectStore;
  onSelectWorkspace: (id: BrandArchitectWorkspaceId) => void;
};

export function BrandArchitectHeader() {
  return (
    <>
      <style>{BRAND_ARCHITECT_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...baDarkHeader, borderTop: `3px solid ${BA.rose}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          BRAND ARCHITECT
        </p>
        <p style={{ ...baLabel, color: '#94A3B8' }}>
          <span style={baLiveDot} />
          MEANING BEFORE COLORS · COHESIVE BRAND SYSTEMS · EXPERIENCE ARCHITECT HANDOFF
        </p>
        <p style={{ ...baLabel, color: '#CBD5E1', marginTop: 4 }}>
          IDENTITY · PERSONALITY · PHILOSOPHY · LANGUAGE · VISUAL SYSTEM · EMOTIONAL POSITIONING
        </p>
      </header>
    </>
  );
}

export function BrandDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND ARCHITECT · ACTIVE HQ</p>
      <p style={{ ...baLabel, color: BA.rose, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...baLabel, color: BA.rose, marginTop: 4 }}>{store.companyName} · {d.approvalStatus.replace(/-/g, ' ').toUpperCase()}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['BRAND HEALTH', `${d.brandHealthPct}%`],
          ['BLUEPRINT', `${d.blueprintCompletenessPct}%`],
          ['VERBAL IDENTITY', `${d.verbalIdentityPct}%`],
          ['VISUAL IDENTITY', `${d.visualIdentityPct}%`],
          ['BRAND SYSTEMS', `${d.systemsPct}%`],
          ['HANDOFF', store.experienceHandoff.status.toUpperCase()],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: BA.panelBorder }}>
            <p style={{ ...baValue, fontSize: '12px' }}>{val}</p>
            <p style={baLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BrandPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND PHILOSOPHY · MEANING FIRST</p>
      {store.brandPhilosophy.map((line) => (
        <p key={line} style={{ ...baLabel, color: BA.rose }}>· {line}</p>
      ))}
      <p style={{ ...baSectionTitle, marginTop: 8 }}>STRATEGIC INTENT</p>
      <p style={baLabel}>Why the company exists · who it serves · what it believes · how people should feel · what makes it unforgettable.</p>
    </section>
  );
}

export function BrandBlueprintPanel({ store }: Pick<Props, 'store'>) {
  const b = store.blueprint;
  const fields: [string, string | string[]][] = [
    ['PURPOSE', b.purpose],
    ['PROMISE', b.promise],
    ['POSITIONING', b.positioning],
    ['MISSION', b.mission],
    ['VISION', b.vision],
    ['VALUES', b.values],
    ['PERSONALITY', b.personality],
    ['ARCHETYPE', b.archetype],
    ['VOICE', b.voice],
    ['TONE', b.tone],
    ['COMMUNICATION PRINCIPLES', b.communicationPrinciples],
    ['BRAND PHILOSOPHY', b.brandPhilosophy],
    ['COMPETITIVE POSITIONING', b.competitivePositioning],
    ['EMOTIONAL POSITIONING', b.emotionalPositioning],
  ];
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND BLUEPRINT</p>
      {fields.map(([label, val]) => (
        <div key={label} className="mb-2 pb-1 border-b" style={{ borderColor: BA.panelBorder }}>
          <p style={{ ...baSectionTitle, fontSize: '7px' }}>{label}</p>
          {Array.isArray(val)
            ? val.map((v) => <p key={v} style={{ ...baLabel, fontSize: '5px' }}>· {v}</p>)
            : <p style={{ ...baLabel, fontSize: '5px', color: BA.slate }}>{val}</p>}
        </div>
      ))}
    </section>
  );
}

export function VerbalIdentityPanel({ store }: Pick<Props, 'store'>) {
  const v = store.verbalIdentity;
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>VERBAL IDENTITY</p>
      <p style={{ ...baLabel, color: BA.rose }}>{v.companyName} · {v.selectedTagline}</p>
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>TAGLINE EXPLORATION</p>
      {v.taglineOptions.map((t) => (
        <p key={t} style={{ ...baLabel, fontSize: '5px', color: t === v.selectedTagline ? BA.rose : BA.gray }}>· {t}</p>
      ))}
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>MESSAGING PILLARS</p>
      {v.messagingPillars.map((p) => <p key={p} style={{ ...baLabel, fontSize: '5px' }}>· {p}</p>)}
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>ELEVATOR PITCH</p>
      <p style={{ ...baLabel, fontSize: '5px' }}>{v.elevatorPitch}</p>
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>BRAND STORY · ORIGIN</p>
      <p style={{ ...baLabel, fontSize: '5px' }}>{v.brandStory}</p>
      <p style={{ ...baLabel, fontSize: '5px', marginTop: 4 }}>{v.originStory}</p>
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>MANIFESTO</p>
      <p style={{ ...baLabel, fontSize: '5px', color: BA.slate }}>{v.manifesto}</p>
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>VOCABULARY · RULES · STYLE</p>
      <div className="flex flex-wrap gap-1 mb-1">
        {v.brandVocabulary.map((w) => (
          <span key={w} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: BA.panelBorder }}>{w}</span>
        ))}
      </div>
      {v.communicationRules.map((r) => <p key={r} style={{ ...baLabel, fontSize: '5px' }}>· {r}</p>)}
      <p style={{ ...baLabel, fontSize: '5px', marginTop: 4 }}>{v.writingStyle}</p>
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>HEADLINE · CTA SYSTEMS</p>
      {v.headlineSystems.map((h) => <p key={h} style={{ ...baLabel, fontSize: '5px' }}>· {h}</p>)}
      {v.ctaSystems.map((c) => <p key={c} style={{ ...baLabel, fontSize: '5px', color: BA.rose }}>→ {c}</p>)}
    </section>
  );
}

export function VisualIdentityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>VISUAL IDENTITY</p>
      {store.visualIdentity.map((v) => (
        <div key={v.id} className="p-2 mb-1 border" style={{ borderColor: BA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{v.label}</p>
            <span className="text-[5px] font-futura" style={{ color: v.status === 'approved' ? BA.green : BA.rose }}>{v.status.toUpperCase()}</span>
          </div>
          <p style={{ ...baLabel, fontSize: '5px' }}>{v.direction}</p>
        </div>
      ))}
    </section>
  );
}

export function BrandSystemsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND SYSTEMS</p>
      {store.brandSystems.map((s) => (
        <div key={s.id} className="flex justify-between items-center py-1 border-b" style={{ borderColor: BA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{s.system}</p>
            <p style={{ ...baLabel, fontSize: '5px' }}>{s.description}</p>
          </div>
          <span className="text-[5px] font-futura px-1 border" style={{ borderColor: s.status === 'approved' ? BA.green : BA.panelBorder, color: s.status === 'approved' ? BA.green : BA.gray }}>
            {s.status.toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function CompetitiveIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>COMPETITIVE INTELLIGENCE</p>
      {store.competitiveIntel.map((c) => (
        <div key={c.id} className="p-2 mb-1 border" style={{ borderColor: BA.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{c.competitor}</p>
          <p style={{ ...baLabel, fontSize: '5px' }}>POSITIONING: {c.positioning}</p>
          <p style={{ ...baLabel, fontSize: '5px' }}>VISUAL: {c.visualDifferentiation}</p>
          <p style={{ ...baLabel, fontSize: '5px' }}>SATURATION: {c.saturation.toUpperCase()} · WHITESPACE: {c.whitespace}</p>
        </div>
      ))}
      <p style={{ ...baSectionTitle, marginTop: 8 }}>STAND APART OPPORTUNITIES</p>
      {store.competitiveOpportunities.map((o) => (
        <p key={o} style={{ ...baLabel, fontSize: '5px', color: BA.rose }}>· {o}</p>
      ))}
    </section>
  );
}

export function BrandSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND SIMULATION · BEFORE APPROVAL</p>
      {store.brandSimulations.map((s) => (
        <div key={s.id} className="p-2 mb-2 border" style={{ borderColor: BA.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: BA.rose }}>{s.label}</p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {[
              ['RECOGNITION', s.recognitionPct],
              ['MEMORABILITY', s.memorabilityPct],
              ['LUXURY', s.luxuryPerceptionPct],
              ['TRUST', s.trustPct],
              ['CLARITY', s.clarityPct],
              ['DIFFERENTIATION', s.differentiationPct],
            ].map(([label, pct]) => (
              <div key={label as string} className="text-center">
                <p style={{ ...baValue, fontSize: '10px', color: scoreColor(pct as number) }}>{pct}%</p>
                <p style={{ ...baLabel, fontSize: '4px' }}>{label}</p>
              </div>
            ))}
          </div>
          <p style={{ ...baLabel, fontSize: '5px', marginTop: 4 }}>EMOTIONAL: {s.emotionalResponse} · CONFIDENCE {s.confidencePct}%</p>
          {s.recommendations.map((r) => (
            <p key={r} style={{ ...baLabel, fontSize: '5px', color: BA.slate }}>→ {r}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function BrandHealthPanel({ store }: Pick<Props, 'store'>) {
  const h = store.brandHealth;
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND HEALTH · ORGANIZATIONAL SCORECARD</p>
      <p style={{ ...baValue, fontSize: '18px' }}>{h.overallPct}% OVERALL</p>
      <div className="grid grid-cols-2 gap-1 mt-2">
        {[
          ['COHERENCE', h.coherencePct],
          ['CONSISTENCY', h.consistencyPct],
          ['DIFFERENTIATION', h.differentiationPct],
          ['EMOTIONAL', h.emotionalResonancePct],
          ['SYSTEMS', h.systemCompletenessPct],
        ].map(([label, pct]) => (
          <div key={label as string} className="flex justify-between py-0.5">
            <span style={baLabel}>{label}</span>
            <span style={{ ...baLabel, color: scoreColor(pct as number) }}>{pct}%</span>
          </div>
        ))}
      </div>
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>STRENGTHS</p>
      {h.strengths.map((s) => <p key={s} style={{ ...baLabel, fontSize: '5px', color: BA.green }}>· {s}</p>)}
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>WEAKNESSES</p>
      {h.weaknesses.map((w) => <p key={w} style={{ ...baLabel, fontSize: '5px', color: BA.rose }}>· {w}</p>)}
    </section>
  );
}

export function BrandEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND EVOLUTION · ORGANIZATIONAL HISTORY</p>
      {store.brandEvolution.map((e) => (
        <div key={e.id} className="flex gap-2 py-1 border-b" style={{ borderColor: BA.panelBorder }}>
          <span style={{ ...baLabel, color: BA.rose, minWidth: 48 }}>{e.date}</span>
          <span style={{ ...baLabel, fontSize: '5px' }}>{e.label}</span>
          <span className="text-[4px] font-futura ml-auto" style={{ color: e.type === 'future' ? BA.gray : BA.slate }}>{e.type.toUpperCase()}</span>
        </div>
      ))}
      <p style={{ ...baSectionTitle, marginTop: 8 }}>FUTURE OPPORTUNITIES</p>
      {store.futureOpportunities.map((o) => (
        <p key={o} style={{ ...baLabel, fontSize: '5px', color: BA.rose }}>· {o}</p>
      ))}
    </section>
  );
}

export function ExperienceArchitectHandoffPanel({ store }: Pick<Props, 'store'>) {
  const h = store.experienceHandoff;
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>EXPERIENCE ARCHITECT HANDOFF · FUTURE VISION</p>
      <p style={{ ...baLabel, color: BA.rose }}>STATUS: {h.status.toUpperCase()} · Every downstream system inherits approved brand automatically.</p>
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>INHERITED SYSTEMS</p>
      {h.inheritedSystems.map((s) => (
        <p key={s} style={{ ...baLabel, fontSize: '5px' }}>· {s}</p>
      ))}
      <p style={{ ...baSectionTitle, fontSize: '7px', marginTop: 8 }}>DOWNSTREAM TARGETS</p>
      {h.downstreamTargets.map((t) => (
        <p key={t} style={{ ...baLabel, fontSize: '5px', color: BA.slate }}>→ {t}</p>
      ))}
      <p style={{ ...baLabel, fontSize: '5px', marginTop: 8, color: BA.gray }}>
        Once approved · identity transfers to Experience Architect · no disconnected assets · one coherent identity compounds forever.
      </p>
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: BrandArchitectWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>BRAND WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? BA.rose : BA.panelBorder,
              color: store.activeWorkspaceId === id ? BA.rose : BA.gray,
              background: store.activeWorkspaceId === id ? 'rgba(190,24,93,0.04)' : 'white',
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
    <section className="p-3 mb-3" style={baPanel}>
      <p style={baSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {BRAND_ARCHITECT_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: BA.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...baLabel, color: '#0369A1', fontSize: '6px' }}>→ COMPANY MATURITY ENGINE</Link>
        <Link to={adminStudioBusinessModelEnginePath()} style={{ ...baLabel, color: BA.slate, fontSize: '6px' }}>→ BUSINESS MODEL ENGINE</Link>
        <Link to={adminStudioMemoryBiblePath()} style={{ ...baLabel, color: '#9333EA', fontSize: '6px' }}>→ CREATIVE DNA · MEMORY BIBLE</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...baLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...baLabel, color: BA.slate, fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...baLabel, color: BA.accent, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
      </div>
    </section>
  );
}
