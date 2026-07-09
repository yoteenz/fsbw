import { Link, useParams } from 'react-router-dom';
import {
  XSIL_DEMO_COMPANY_LABELS,
  XSIL_ROOM_PATH_LABELS,
  compileExperienceEnvironment,
  learnTasteFromFeedback,
  reviewCanonCandidate,
  type XsilReadyView,
  type XsilRoomPath,
} from '../../../../studio-os-core/genesis';
import { useStudioIntelligenceLayerState } from '../../../../hooks/useStudioIntelligenceLayerState';
import { useExecutiveIntelligence } from '../../../../hooks/useExecutiveIntelligence';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/studio-intelligence-layer';

const WING_NAV: { slug: XsilRoomPath; label: string; ring: 'core' | 'intelligence' | 'playgrounds' }[] = [
  { slug: 'studio-intelligence-layer', label: 'Intelligence Arrival', ring: 'core' },
  { slug: 'intelligence', label: 'Executive Intelligence', ring: 'core' },
  { slug: 'company-operating-manual', label: 'Operating Manual™', ring: 'core' },
  { slug: 'decision-dna', label: 'Decision DNA™', ring: 'intelligence' },
  { slug: 'taste-genome', label: 'Taste Genome™', ring: 'intelligence' },
  { slug: 'canon-engine', label: 'Canon Engine™', ring: 'intelligence' },
  { slug: 'experience-compiler', label: 'Experience Compiler™', ring: 'intelligence' },
  { slug: 'audience-dna', label: 'Audience DNA™', ring: 'intelligence' },
  { slug: 'product-dna', label: 'Product DNA™', ring: 'intelligence' },
  { slug: 'creative-genome', label: 'Creative Genome™', ring: 'intelligence' },
  { slug: 'decision-dna-playground', label: 'Decision DNA Playground™', ring: 'playgrounds' },
  { slug: 'audience-dna-playground', label: 'Audience DNA Playground™', ring: 'playgrounds' },
  { slug: 'brand-dna-playground', label: 'Brand DNA Playground™', ring: 'playgrounds' },
  { slug: 'experience-playground', label: 'Experience Playground™', ring: 'playgrounds' },
  { slug: 'creative-genome-explorer', label: 'Creative Genome Explorer™', ring: 'playgrounds' },
  { slug: 'canon-review-workspace', label: 'Canon Review Workspace™', ring: 'playgrounds' },
];

const ACCENT = '#6366F1';

export function StudioIntelligenceLayerWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, setCompany, refresh } = useStudioIntelligenceLayerState();
  const activeSlug = (roomSlug ?? 'studio-intelligence-layer') as XsilRoomPath;
  const company = view.activeCompany;

  const switchCompany = (companyId: string) => setCompany({ companyId: companyId as (typeof view.demoCompanyIds)[number] });

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden" style={{ background: '#F8F6F3' }} data-xsil-company={company.companyId}>
      <HqExperienceStyles />
      <XsilStyles />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ ...hqGlassPanel, borderColor: `${ACCENT}22` }}>
        <div>
          <p style={{ ...hqLabel, color: ACCENT, margin: 0 }}>STUDIO INTELLIGENCE LAYER™</p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', margin: '4px 0 0' }}>
            {XSIL_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/narrative-intelligence" className="xsil-btn">Narrative Intelligence →</Link>
          <Link to="/admin/studio/brand-discovery-engine" className="xsil-btn">Brand Discovery →</Link>
          <Link to="/admin/studio/experience-runtime" className="xsil-btn">Experience Runtime →</Link>
          <button type="button" className="xsil-btn primary" style={{ borderColor: ACCENT, color: ACCENT }} onClick={refresh}>Refresh</button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white/20 p-3 lg:block" style={{ borderColor: `${ACCENT}15` }}>
          {(['core', 'intelligence', 'playgrounds'] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p style={{ ...hqLabel, marginBottom: 6, color: '#808080' }}>{ring}</p>
              {WING_NAV.filter((r) => r.ring === ring).map((room) => (
                <Link
                  key={room.slug}
                  to={`${BASE}/${room.slug}`}
                  className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
                  style={{
                    color: activeSlug === room.slug ? '#1A1A1A' : '#808080',
                    background: activeSlug === room.slug ? `${ACCENT}10` : 'transparent',
                    borderLeft: activeSlug === room.slug ? `2px solid ${ACCENT}` : '2px solid transparent',
                  }}
                >
                  {room.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <ArrivalPanel view={view} switchCompany={switchCompany} />

            {(activeSlug === 'intelligence' || activeSlug === 'studio-intelligence-layer') && (
              <ExecutivePanel view={view} />
            )}
            {(activeSlug === 'company-operating-manual' || activeSlug === 'studio-intelligence-layer') && (
              <ManualPanel view={view} />
            )}
            {(activeSlug === 'decision-dna' || activeSlug === 'decision-dna-playground') && (
              <DecisionPanel view={view} />
            )}
            {(activeSlug === 'taste-genome') && <TastePanel view={view} onRefresh={refresh} />}
            {(activeSlug === 'canon-engine' || activeSlug === 'canon-review-workspace') && (
              <CanonPanel view={view} onRefresh={refresh} />
            )}
            {(activeSlug === 'experience-compiler' || activeSlug === 'experience-playground') && (
              <CompilerPanel view={view} onRefresh={refresh} />
            )}
            {(activeSlug === 'audience-dna' || activeSlug === 'audience-dna-playground') && (
              <AudiencePanel view={view} />
            )}
            {activeSlug === 'product-dna' && <ProductPanel view={view} />}
            {(activeSlug === 'creative-genome' || activeSlug === 'creative-genome-explorer') && (
              <CreativePanel view={view} />
            )}
            {activeSlug === 'brand-dna-playground' && (
              <section className="xsil-panel">
                <p style={{ ...hqLabel }}>Brand DNA Playground™</p>
                <p style={{ fontSize: '11px' }}>Strategic Brand DNA lives in Brand Discovery Engine™. Switch company context here, then open the full playground.</p>
                <Link to="/admin/studio/brand-discovery-engine/brand-playground" className="xsil-btn primary mt-3 inline-block" style={{ borderColor: ACCENT }}>
                  Open Brand DNA Playground →
                </Link>
              </section>
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <ExecutiveSidebar view={view} />
          </aside>
        </main>
      </div>
    </div>
  );
}

function ArrivalPanel({ view, switchCompany }: { view: XsilReadyView; switchCompany: (id: string) => void }) {
  return (
    <section className="xsil-panel" style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <p style={{ ...hqLabel, color: ACCENT }}>Executive Intelligence Platform</p>
      <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{view.orbNote}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {view.demoCompanyIds.map((id) => (
          <button key={id} type="button" className="xsil-btn" style={{ borderColor: view.activeCompany.companyId === id ? ACCENT : undefined }} onClick={() => switchCompany(id)}>
            {XSIL_DEMO_COMPANY_LABELS[id]}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '9px', marginTop: 8, color: '#808080' }}>
        Foundation traits: {view.foundationTraits.join(' · ')}
      </p>
    </section>
  );
}

function ExecutivePanel({ view }: { view: XsilReadyView }) {
  const { evaluate } = useExecutiveIntelligence(view.activeCompany.companyId);
  const rec = evaluate({ mission: 'Launch next executive initiative', artifactSummary: view.activeCompany.mission });
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Executive Intelligence™</p>
      <p style={{ fontSize: '11px' }}>{rec.summary}</p>
      <p style={{ fontSize: '10px', marginTop: 8 }}><strong>Action:</strong> {rec.recommendedAction}</p>
      <ul className="mt-2 list-inside list-disc text-[9px]">
        {rec.rationale.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </section>
  );
}

function ManualPanel({ view }: { view: XsilReadyView }) {
  const m = view.operatingManual;
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Company Operating Manual™</p>
      <p style={{ fontSize: '11px' }}>{m.operatingPhilosophy}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[10px]">
        <div><strong>SOPs</strong><p>{m.sops.map((s) => s.title).join(', ')}</p></div>
        <div><strong>Quality</strong><p>{m.qualityStandards.join(' · ')}</p></div>
        <div><strong>Automation</strong><p>{m.automationRules.map((r) => `${r.action} (${r.mode})`).join(', ')}</p></div>
        <div><strong>Escalation</strong><p>{m.escalationPaths.map((e) => e.riskClass).join(', ')}</p></div>
      </div>
    </section>
  );
}

function DecisionPanel({ view }: { view: XsilReadyView }) {
  const d = view.decisionDna;
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Decision DNA™ · Decision Intelligence Engine™</p>
      <div className="grid gap-2 sm:grid-cols-2 text-[10px]">
        <div>Risk: {d.riskTolerance.value}/100</div>
        <div>Speed/Quality: {d.speedQualityBias.value}/100</div>
        <div>Luxury: {d.luxuryAffordabilityBias.value}/100</div>
        <div>Innovation: {d.innovationConventionBias.value}/100</div>
      </div>
      <p style={{ fontSize: '10px', marginTop: 8 }}>Principles: {d.learnedPrinciples.join(' · ')}</p>
      <p style={{ fontSize: '10px' }}>Avoid: {d.antiPatterns.join(' · ')}</p>
    </section>
  );
}

function TastePanel({ view, onRefresh }: { view: XsilReadyView; onRefresh: () => void }) {
  const t = view.tasteGenome;
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Taste Genome™ · Taste Learning Engine™</p>
      <p style={{ fontSize: '11px' }}>Luxury {t.luxuryLevel}/100 · {t.typography.join(', ')}</p>
      <button type="button" className="xsil-btn mt-2" onClick={() => { learnTasteFromFeedback(view.activeCompany.companyId, 'Sample pattern', true); onRefresh(); }}>
        Simulate taste approval
      </button>
    </section>
  );
}

function CanonPanel({ view, onRefresh }: { view: XsilReadyView; onRefresh: () => void }) {
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Canon Engine™ · Canon Review Workspace™</p>
      <div className="mt-2 space-y-2">
        {view.canonCandidates.map((c) => (
          <div key={c.candidateId} className="rounded border p-2 text-[10px]" style={{ borderColor: `${ACCENT}22` }}>
            <strong>{c.title}</strong> · {c.proposedClass} · {c.status}
            {c.status === 'pending' && (
              <button type="button" className="xsil-btn ml-2" onClick={() => { reviewCanonCandidate(c.candidateId, 'approved'); onRefresh(); }}>
                Approve
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CompilerPanel({ view, onRefresh }: { view: XsilReadyView; onRefresh: () => void }) {
  const m = view.compileManifest;
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Experience Compiler™</p>
      <button type="button" className="xsil-btn primary" style={{ borderColor: ACCENT }} onClick={() => { compileExperienceEnvironment({ companyId: view.activeCompany.companyId, mission: 'HQ arrival compile' }); onRefresh(); }}>
        Compile environment
      </button>
      <p style={{ fontSize: '10px', marginTop: 8 }}>Manifest: {m.manifestId}</p>
      <p style={{ fontSize: '9px' }}>Layers: {m.layersUsed.join(' → ')}</p>
      <ul className="mt-2 list-inside list-disc text-[9px]">
        {m.explainTrace.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  );
}

function AudiencePanel({ view }: { view: XsilReadyView }) {
  const a = view.audienceDna;
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Audience DNA™ · Audience Intelligence Engine™</p>
      <p style={{ fontSize: '11px' }}>{a.segmentName} — {a.psychographics}</p>
      <p style={{ fontSize: '10px', marginTop: 4 }}>Transformation: {a.desiredTransformation}</p>
    </section>
  );
}

function ProductPanel({ view }: { view: XsilReadyView }) {
  const p = view.productDna;
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Product DNA™ · Product Intelligence Engine™</p>
      <p style={{ fontSize: '11px' }}>{p.productName} — {p.emotionalPromise}</p>
      <p style={{ fontSize: '10px' }}>Lifecycle: {p.lifecycle} · {p.launchStrategy}</p>
    </section>
  );
}

function CreativePanel({ view }: { view: XsilReadyView }) {
  return (
    <section className="xsil-panel">
      <p style={{ ...hqLabel }}>Creative Genome™ · Creative Knowledge Graph™</p>
      <div className="mt-2 space-y-2">
        {view.creativeNodes.map((n) => (
          <div key={n.nodeId} className="rounded p-2 text-[10px]" style={{ background: `${ACCENT}08` }}>
            <strong>{n.title}</strong> · {n.nodeType} · {n.approvalStatus}
            <p style={{ fontSize: '9px' }}>{n.tags.join(', ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExecutiveSidebar({ view }: { view: XsilReadyView }) {
  const rec = view.executiveRecommendation;
  return (
    <section className="xsil-panel sticky top-4">
      <p style={{ ...hqLabel, color: ACCENT }}>Executive Recommendation</p>
      <p style={{ fontSize: '18px', fontFamily: '"Covered By Your Grace", sans-serif' }}>{rec.confidence}/100</p>
      <p style={{ fontSize: '10px', textTransform: 'uppercase' }}>{rec.requiresFounderApproval ? 'Founder approval required' : 'Recommend only'}</p>
      <div className="mt-3 space-y-2 text-[9px]">
        <div><strong>Brand</strong><p>{rec.brandImpact}</p></div>
        <div><strong>Audience</strong><p>{rec.audienceImpact}</p></div>
        <div><strong>Product</strong><p>{rec.productImpact}</p></div>
        <div><strong>Platform</strong><p>{rec.platformImpact}</p></div>
      </div>
      <p style={{ ...hqLabel, marginTop: 12 }}>Consumers</p>
      <ul className="text-[9px]">
        {view.consumerBindings.map((c) => <li key={c.system}>{c.status}</li>)}
      </ul>
    </section>
  );
}

function XsilStyles() {
  return (
    <style>{`
      [data-xsil-company] .xsil-panel {
        border-radius: 12px;
        border: 1px solid ${ACCENT}18;
        background: #ffffffcc;
        backdrop-filter: blur(12px);
        padding: 16px;
      }
      [data-xsil-company] .xsil-btn {
        border: 1px solid ${ACCENT}33;
        background: transparent;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
      }
      [data-xsil-company] .xsil-btn.primary { background: ${ACCENT}10; }
    `}</style>
  );
}
