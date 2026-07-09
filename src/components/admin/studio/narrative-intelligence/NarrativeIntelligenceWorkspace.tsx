import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  XNI_DEMO_BRAND_LABELS,
  XNI_NARRATIVE_TYPE_LABELS,
  XNI_NARRATIVE_TYPES,
  XNI_ROOM_PATH_LABELS,
  approveNarrativeBlueprint,
  submitBlueprintForApproval,
  type XniReadyView,
  type XniRoomPath,
} from '../../../../studio-os-core/genesis';
import { useNarrativeIntelligenceState } from '../../../../hooks/useNarrativeIntelligenceState';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/narrative-intelligence';
const ACCENT = '#0D9488';

const WING_NAV: { slug: XniRoomPath; label: string; ring: 'core' | 'engines' | 'playground' }[] = [
  { slug: 'narrative-intelligence', label: 'Narrative Arrival', ring: 'core' },
  { slug: 'production-genome', label: 'Production Genome Registry™', ring: 'core' },
  { slug: 'narrative-blueprints', label: 'Narrative Blueprint Registry™', ring: 'core' },
  { slug: 'episode-engine', label: 'Episode Generator™', ring: 'engines' },
  { slug: 'campaign-engine', label: 'Campaign Generator™', ring: 'engines' },
  { slug: 'course-engine', label: 'Course Generator™', ring: 'engines' },
  { slug: 'launch-engine', label: 'Launch Generator™', ring: 'engines' },
  { slug: 'commercial-engine', label: 'Commercial Generator™', ring: 'engines' },
  { slug: 'narrative-playground', label: 'Narrative Playground™', ring: 'playground' },
];

export function NarrativeIntelligenceWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, setPlayground, runPlaygroundPreview, refresh } = useNarrativeIntelligenceState();
  const activeSlug = (roomSlug ?? 'narrative-intelligence') as XniRoomPath;
  const preview = view.preview;

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden" style={{ background: '#F8F6F3' }} data-xni-brand={view.activeBrandId}>
      <HqExperienceStyles />
      <XniStyles />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ ...hqGlassPanel, borderColor: `${ACCENT}22` }}>
        <div>
          <p style={{ ...hqLabel, color: ACCENT, margin: 0 }}>NARRATIVE INTELLIGENCE™</p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', margin: '4px 0 0' }}>
            {XNI_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/studio-intelligence-layer" className="xni-btn">Studio Intelligence →</Link>
          <Link to="/admin/studio/brand-discovery-engine" className="xni-btn">Brand Discovery →</Link>
          <button type="button" className="xni-btn primary" style={{ borderColor: ACCENT, color: ACCENT }} onClick={refresh}>Refresh</button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white/20 p-3 lg:block" style={{ borderColor: `${ACCENT}15` }}>
          {(['core', 'engines', 'playground'] as const).map((ring) => (
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
            <ArrivalPanel view={view} setPlayground={setPlayground} />

            {(activeSlug === 'narrative-intelligence' || activeSlug === 'narrative-playground') && (
              <PlaygroundPanel view={view} runPreview={runPlaygroundPreview} onRefresh={refresh} />
            )}

            {(activeSlug === 'production-genome' || activeSlug === 'narrative-intelligence') && (
              <GenomePanel view={view} />
            )}

            {(activeSlug === 'narrative-blueprints' || activeSlug === 'narrative-intelligence') && (
              <BlueprintPanel view={view} onRefresh={refresh} />
            )}

            {activeSlug === 'episode-engine' && preview && (
              <section className="xni-panel">
                <p style={{ ...hqLabel }}>Episode Structure™</p>
                <p style={{ fontSize: '11px' }}>{preview.episodeStructure.title} · ~{preview.episodeStructure.estimatedRuntimeMin} min</p>
                {preview.episodeStructure.acts.map((act) => (
                  <div key={act.actId} className="mt-2 rounded p-2 text-[10px]" style={{ background: `${ACCENT}08` }}>
                    <strong>{act.label}</strong>
                    <ul className="mt-1 list-inside list-disc">{act.beats.map((b) => <li key={b}>{b}</li>)}</ul>
                  </div>
                ))}
              </section>
            )}

            {preview && activeSlug === 'narrative-playground' && (
              <>
                <SceneFlowPanel preview={preview} />
                <HqEnvironmentPanel preview={preview} />
                <AssetsPanel preview={preview} />
                <DistributionPanel preview={preview} />
              </>
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <GateSidebar view={view} onRefresh={refresh} />
          </aside>
        </main>
      </div>
    </div>
  );
}

function ArrivalPanel({
  view,
  setPlayground,
}: {
  view: XniReadyView;
  setPlayground: (p: Partial<import('../../../../studio-os-core/genesis').XniPlaygroundInput>) => void;
}) {
  return (
    <section className="xni-panel" style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <p style={{ ...hqLabel, color: ACCENT }}>Executive Creative Director Layer</p>
      <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{view.orbNote}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {view.demoBrandIds.map((id) => (
          <button key={id} type="button" className="xni-btn" style={{ borderColor: view.activeBrandId === id ? ACCENT : undefined }} onClick={() => setPlayground({ brandId: id, companyId: id })}>
            {XNI_DEMO_BRAND_LABELS[id]}
          </button>
        ))}
      </div>
    </section>
  );
}

function PlaygroundPanel({
  view,
  runPreview,
  onRefresh,
}: {
  view: XniReadyView;
  runPreview: (input?: Partial<import('../../../../studio-os-core/genesis').XniPlaygroundInput>) => void;
  onRefresh: () => void;
}) {
  const [topic, setTopic] = useState(view.playground.topic);
  return (
    <section className="xni-panel">
      <p style={{ ...hqLabel }}>Narrative Intelligence Playground™</p>
      <p style={{ fontSize: '10px', marginBottom: 8 }}>Enter a topic — preview Blueprint, Episode Structure, Scene Flow, Production Genome, HQ Environment, Assets, Distribution.</p>
      <input
        className="mb-2 w-full rounded border px-3 py-2 text-sm"
        style={{ borderColor: `${ACCENT}33` }}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Narrative topic…"
      />
      <div className="mb-2 flex flex-wrap gap-2">
        {XNI_NARRATIVE_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className="xni-btn"
            style={{ borderColor: view.playground.narrativeType === t ? ACCENT : undefined }}
            onClick={() => runPreview({ narrativeType: t })}
          >
            {XNI_NARRATIVE_TYPE_LABELS[t]}
          </button>
        ))}
      </div>
      <button type="button" className="xni-btn primary" style={{ borderColor: ACCENT }} onClick={() => { runPreview({ topic }); onRefresh(); }}>
        Generate Narrative Preview
      </button>
    </section>
  );
}

function GenomePanel({ view }: { view: XniReadyView }) {
  const g = view.activeProductionGenome;
  return (
    <section className="xni-panel">
      <p style={{ ...hqLabel }}>Production Genome Registry™</p>
      <div className="grid gap-2 sm:grid-cols-2 text-[10px]">
        <div><strong>Intro</strong><p>{g.intro}</p></div>
        <div><strong>Outro</strong><p>{g.outro}</p></div>
        <div><strong>Theme</strong><p>{g.themeMusic}</p></div>
        <div><strong>Editing</strong><p>{g.editingStyle}</p></div>
        <div><strong>Motion</strong><p>{g.motionStyle}</p></div>
        <div><strong>Camera</strong><p>{g.cameraStyle}</p></div>
        <div><strong>Visual</strong><p>{g.visualLanguage}</p></div>
        <div><strong>Presenter</strong><p>{g.presenterStyle}</p></div>
        <div><strong>Orb</strong><p>{g.orbBehavior}</p></div>
        <div><strong>Rhythm</strong><p>{g.episodeRhythm}</p></div>
      </div>
      <p style={{ fontSize: '9px', marginTop: 8 }}>Scene rules: {g.sceneSelectionRules.join(' · ')}</p>
    </section>
  );
}

function BlueprintPanel({ view, onRefresh }: { view: XniReadyView; onRefresh: () => void }) {
  const blueprints = view.blueprints.slice(0, 8);
  return (
    <section className="xni-panel">
      <p style={{ ...hqLabel }}>Narrative Blueprint Registry™</p>
      {blueprints.length === 0 && <p style={{ fontSize: '10px' }}>No blueprints yet — use the Playground to generate one.</p>}
      <div className="space-y-2">
        {blueprints.map((b) => (
          <div key={b.blueprintId} className="rounded border p-2 text-[10px]" style={{ borderColor: `${ACCENT}22` }}>
            <strong>{b.topic}</strong> · {b.narrativeType} · <span style={{ color: b.status === 'approved' ? ACCENT : '#808080' }}>{b.status}</span>
            <p style={{ fontSize: '9px' }}>{b.objective}</p>
            {b.status === 'draft' && (
              <button type="button" className="xni-btn mt-1" onClick={() => { submitBlueprintForApproval(b.blueprintId); onRefresh(); }}>Submit for approval</button>
            )}
            {b.status === 'pending-approval' && (
              <button type="button" className="xni-btn primary mt-1" style={{ borderColor: ACCENT }} onClick={() => { approveNarrativeBlueprint(b.blueprintId); onRefresh(); }}>Approve blueprint</button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SceneFlowPanel({ preview }: { preview: NonNullable<XniReadyView['preview']> }) {
  return (
    <section className="xni-panel">
      <p style={{ ...hqLabel }}>Scene Flow™</p>
      {preview.sceneFlow.moments.map((m) => (
        <div key={m.momentId} className="mb-1 text-[10px]">
          <strong>{m.arcStage}</strong> — {m.label} <span style={{ color: '#808080' }}>({m.transition})</span>
        </div>
      ))}
    </section>
  );
}

function HqEnvironmentPanel({ preview }: { preview: NonNullable<XniReadyView['preview']> }) {
  const env = preview.headquartersEnvironment;
  return (
    <section className="xni-panel">
      <p style={{ ...hqLabel }}>Headquarters Environment™</p>
      <p style={{ fontSize: '10px' }}>{env.room}</p>
      <p style={{ fontSize: '9px' }}>Atmosphere: {env.atmosphere} · Light: {env.lightingWash}</p>
      <p style={{ fontSize: '9px' }}>Focal: {env.focalObject} · Orb: {env.orbPlacement}</p>
    </section>
  );
}

function AssetsPanel({ preview }: { preview: NonNullable<XniReadyView['preview']> }) {
  return (
    <section className="xni-panel">
      <p style={{ ...hqLabel }}>Required Assets™</p>
      <ul className="list-inside list-disc text-[10px]">
        {preview.requiredAssets.map((a) => <li key={a}>{a}</li>)}
      </ul>
    </section>
  );
}

function DistributionPanel({ preview }: { preview: NonNullable<XniReadyView['preview']> }) {
  return (
    <section className="xni-panel">
      <p style={{ ...hqLabel }}>Distribution Plan™</p>
      {preview.distributionPlan.map((d) => (
        <div key={d.channelId} className="text-[10px]">
          <strong>{d.label}</strong> — {d.format} · {d.timing}
        </div>
      ))}
    </section>
  );
}

function GateSidebar({ view, onRefresh }: { view: XniReadyView; onRefresh: () => void }) {
  const gate = view.preview?.productionGate ?? { allowed: false, reason: 'Generate a preview to evaluate production gate.' };
  return (
    <section className="xni-panel sticky top-4">
      <p style={{ ...hqLabel, color: ACCENT }}>Production Gate</p>
      <p style={{ fontSize: '18px', fontFamily: '"Covered By Your Grace", sans-serif' }}>{gate.allowed ? 'OPEN' : 'CLOSED'}</p>
      <p style={{ fontSize: '10px' }}>{gate.reason}</p>
      {view.preview && !gate.allowed && view.preview.blueprint.status === 'draft' && (
        <button type="button" className="xni-btn mt-2 w-full" onClick={() => { submitBlueprintForApproval(view.preview!.blueprint.blueprintId); onRefresh(); }}>
          Submit for approval
        </button>
      )}
      {view.preview && view.preview.blueprint.status === 'pending-approval' && (
        <button type="button" className="xni-btn primary mt-2 w-full" style={{ borderColor: ACCENT }} onClick={() => { approveNarrativeBlueprint(view.preview!.blueprint.blueprintId); onRefresh(); }}>
          Approve blueprint
        </button>
      )}
      <p style={{ ...hqLabel, marginTop: 12 }}>AI Consumers</p>
      <ul className="text-[9px]">
        {view.consumerBindings.map((c) => (
          <li key={c.system} style={{ color: c.requiresApprovedBlueprint && !gate.allowed ? '#808080' : ACCENT }}>
            {c.status}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: '8px', marginTop: 8, color: '#808080' }}>
        Approved blueprints: {view.approvedBlueprints.length}
      </p>
    </section>
  );
}

function XniStyles() {
  return (
    <style>{`
      [data-xni-brand] .xni-panel {
        border-radius: 12px;
        border: 1px solid ${ACCENT}18;
        background: #ffffffcc;
        backdrop-filter: blur(12px);
        padding: 16px;
      }
      [data-xni-brand] .xni-btn {
        border: 1px solid ${ACCENT}33;
        background: transparent;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
      }
      [data-xni-brand] .xni-btn.primary { background: ${ACCENT}10; }
    `}</style>
  );
}
