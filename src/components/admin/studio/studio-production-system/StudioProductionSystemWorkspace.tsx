import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  XPS_DEMO_BRAND_LABELS,
  XPS_PLATFORM_LABELS,
  XPS_PLATFORMS,
  XPS_PRODUCTION_STAGE_LABELS,
  XPS_ROOM_PATH_LABELS,
  authorizeAssetGeneration,
  saveProductionPackage,
  runPostPublicationEvolution,
  type XcosControlRoomOverlay,
  type XpsControlRoomProduction,
  type XpsReadyView,
  type XpsRoomPath,
} from '../../../../studio-os-core/genesis';
import { useStudioProductionSystemState } from '../../../../hooks/useStudioProductionSystemState';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/studio-production';
const ACCENT = '#7C3AED';

const WING_NAV: { slug: XpsRoomPath; label: string; ring: 'core' | 'departments' | 'control' }[] = [
  { slug: 'studio-production', label: 'Production Arrival', ring: 'core' },
  { slug: 'creative-executive', label: 'Creative Executive™', ring: 'core' },
  { slug: 'showrunner', label: 'Showrunner™', ring: 'core' },
  { slug: 'story-department', label: 'Story Department™', ring: 'departments' },
  { slug: 'casting', label: 'Casting™', ring: 'departments' },
  { slug: 'production-design', label: 'Production Design™', ring: 'departments' },
  { slug: 'lighting', label: 'Lighting™', ring: 'departments' },
  { slug: 'camera', label: 'Camera™', ring: 'departments' },
  { slug: 'audio', label: 'Sound™', ring: 'departments' },
  { slug: 'music', label: 'Music™', ring: 'departments' },
  { slug: 'editorial', label: 'Editorial™', ring: 'departments' },
  { slug: 'post-production', label: 'Post Production™', ring: 'departments' },
  { slug: 'quality-control', label: 'Quality Control™', ring: 'departments' },
  { slug: 'distribution', label: 'Distribution™', ring: 'departments' },
  { slug: 'production-control-room', label: 'Production Control Room™', ring: 'control' },
  { slug: 'production-playground', label: 'Production Playground™', ring: 'control' },
];

export function StudioProductionSystemWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, setPlayground, runPlaygroundPreview, refresh } = useStudioProductionSystemState();
  const activeSlug = (roomSlug ?? 'studio-production') as XpsRoomPath;
  const activeProduction = view.controlRoom[0];

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden" style={{ background: '#F8F6F3' }} data-xps-brand={view.activeBrandId}>
      <HqExperienceStyles />
      <XpsStyles />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ ...hqGlassPanel, borderColor: `${ACCENT}22` }}>
        <div>
          <p style={{ ...hqLabel, color: ACCENT, margin: 0 }}>STUDIO PRODUCTION SYSTEM™</p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', margin: '4px 0 0' }}>
            {XPS_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/narrative-intelligence" className="xps-btn">Narrative Intelligence →</Link>
          <Link to="/admin/studio/creative-operating-system" className="xps-btn">Creative Organization →</Link>
          <Link to="/admin/studio/studio-intelligence-layer" className="xps-btn">Studio Intelligence →</Link>
          <button type="button" className="xps-btn primary" style={{ borderColor: ACCENT, color: ACCENT }} onClick={refresh}>Refresh</button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white/20 p-3 lg:block" style={{ borderColor: `${ACCENT}15` }}>
          {(['core', 'departments', 'control'] as const).map((ring) => (
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

            {(activeSlug === 'production-playground' || activeSlug === 'studio-production') && (
              <PlaygroundPanel view={view} runPreview={runPlaygroundPreview} onRefresh={refresh} />
            )}

            {(activeSlug === 'production-control-room' || activeSlug === 'studio-production') && (
              <ControlRoomPanel productions={view.controlRoom} organizationOverlay={view.organizationOverlay} onRefresh={refresh} />
            )}

            {activeSlug !== 'production-control-room' && activeSlug !== 'production-playground' && activeSlug !== 'studio-production' && activeProduction && (
              <DepartmentPanel slug={activeSlug} production={activeProduction} />
            )}

            {view.preview && activeSlug === 'production-playground' && (
              <PreviewPanels preview={view.preview} />
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <GateSidebar view={view} production={activeProduction} onRefresh={refresh} />
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
  view: XpsReadyView;
  setPlayground: (p: Partial<import('../../../../studio-os-core/genesis').XpsPlaygroundInput>) => void;
}) {
  return (
    <section className="xps-panel" style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <p style={{ ...hqLabel, color: ACCENT }}>AI Production Company</p>
      <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{view.orbNote}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {view.demoBrandIds.map((id) => (
          <button key={id} type="button" className="xps-btn" style={{ borderColor: view.activeBrandId === id ? ACCENT : undefined }} onClick={() => setPlayground({ brandId: id, companyId: id })}>
            {XPS_DEMO_BRAND_LABELS[id]}
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
  view: XpsReadyView;
  runPreview: (input?: Partial<import('../../../../studio-os-core/genesis').XpsPlaygroundInput>) => void;
  onRefresh: () => void;
}) {
  const [topic, setTopic] = useState(view.playground.topic);
  const [audience, setAudience] = useState(view.playground.audience);
  const [goal, setGoal] = useState(view.playground.goal);
  const [emotion, setEmotion] = useState(view.playground.desiredEmotion);

  return (
    <section className="xps-panel">
      <p style={{ ...hqLabel }}>Production Playground™</p>
      <p style={{ fontSize: '10px', marginBottom: 8 }}>Enter production brief — generate Narrative Blueprint™, Production Team™, workflow, virtual set, assets, and publishing plan.</p>
      <input className="mb-2 w-full rounded border px-3 py-2 text-sm" style={{ borderColor: `${ACCENT}33` }} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
      <input className="mb-2 w-full rounded border px-3 py-2 text-sm" style={{ borderColor: `${ACCENT}33` }} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Audience" />
      <input className="mb-2 w-full rounded border px-3 py-2 text-sm" style={{ borderColor: `${ACCENT}33` }} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal" />
      <input className="mb-2 w-full rounded border px-3 py-2 text-sm" style={{ borderColor: `${ACCENT}33` }} value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="Desired emotion" />
      <div className="mb-2 flex flex-wrap gap-2">
        {XPS_PLATFORMS.map((p) => (
          <button key={p} type="button" className="xps-btn" style={{ borderColor: view.playground.platform === p ? ACCENT : undefined }} onClick={() => runPreview({ platform: p })}>
            {XPS_PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>
      <button type="button" className="xps-btn primary" style={{ borderColor: ACCENT }} onClick={() => { runPreview({ topic, audience, goal, desiredEmotion: emotion }); onRefresh(); }}>
        Assemble Production Company
      </button>
    </section>
  );
}

function ControlRoomPanel({
  productions,
  organizationOverlay,
  onRefresh,
}: {
  productions: XpsControlRoomProduction[];
  organizationOverlay?: XcosControlRoomOverlay;
  onRefresh: () => void;
}) {
  if (productions.length === 0) {
    return (
      <section className="xps-panel">
        <p style={{ ...hqLabel }}>Production Control Room™</p>
        <p style={{ fontSize: '10px' }}>No active productions — use Production Playground to assemble a production company.</p>
        {organizationOverlay && <OrganizationOverlaySection overlay={organizationOverlay} />}
      </section>
    );
  }

  return (
    <section className="xps-panel">
      <p style={{ ...hqLabel, color: ACCENT }}>Production Control Room™</p>
      {organizationOverlay && <OrganizationOverlaySection overlay={organizationOverlay} />}
      <div className="space-y-3 mt-3">
        {productions.map((prod) => (
          <div key={prod.package.packageId} className="rounded border p-3" style={{ borderColor: `${ACCENT}22` }}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <strong style={{ fontSize: '12px' }}>{prod.package.topic}</strong>
                <p style={{ fontSize: '9px', color: '#808080' }}>{prod.currentStageLabel} · {prod.package.platform}</p>
              </div>
              <span style={{ fontSize: '9px', color: ACCENT }}>{prod.pendingApprovals.length} approvals pending</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3 text-[9px]">
              <div><strong>Departments</strong><p>{prod.assignedDepartments.length}</p></div>
              <div><strong>Assets</strong><p>{prod.assets.filter((a) => a.status === 'ready').length}/{prod.assets.length} ready</p></div>
              <div><strong>Blockers</strong><p>{prod.blockingIssues.filter((i) => i.severity === 'blocker').length}</p></div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {prod.timeline.slice(0, 5).map((t) => (
                <span key={t.eventId} className="rounded px-2 py-1 text-[8px]" style={{ background: t.status === 'active' ? `${ACCENT}15` : '#f0f0f0' }}>
                  {t.label}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="xps-btn"
                onClick={() => {
                  const updated = {
                    ...prod.package,
                    approvals: authorizeAssetGeneration(prod.package.approvals),
                    updatedAt: new Date().toISOString(),
                  };
                  saveProductionPackage(updated);
                  onRefresh();
                }}
              >
                Authorize asset generation
              </button>
              <button
                type="button"
                className="xps-btn"
                onClick={() => {
                  const updated = {
                    ...prod.package,
                    currentStage: 'published' as const,
                    performance: { completionRate: 0.68, ctaRate: 0.09, watchThrough: 0.57, notes: ['Post-publication review'] },
                    updatedAt: new Date().toISOString(),
                  };
                  saveProductionPackage(updated);
                  runPostPublicationEvolution(updated);
                  onRefresh();
                }}
              >
                Run evolution cycle
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OrganizationOverlaySection({ overlay }: { overlay: XcosControlRoomOverlay }) {
  return (
    <div className="mb-4 rounded border p-3 text-[9px]" style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}06` }}>
      <p style={{ ...hqLabel, color: ACCENT }}>Creative Organization — {overlay.orgStateLabel}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        <div><strong>Executive Board</strong><p>{overlay.executiveBoard.filter((e) => e.status === 'active').length} active</p></div>
        <div><strong>Founder Decisions</strong><p>{overlay.pendingFounderDecisions} pending</p></div>
        <div><strong>Creative Memory</strong><p>{overlay.memoryCount} records</p></div>
        <div><strong>Creative Economy</strong><p>{overlay.economyAssetCount} assets</p></div>
      </div>
      <p style={{ marginTop: 8 }}>Studio Intelligence: {overlay.studioIntelligenceStatus} · Institute links: {overlay.instituteLinkCount}</p>
      {overlay.evolutionInsights.length > 0 && (
        <p style={{ marginTop: 4 }}>Latest evolution: {overlay.evolutionInsights[0].recommendation}</p>
      )}
      {overlay.recentMemory.length > 0 && (
        <p style={{ marginTop: 4 }}>Recent memory: {overlay.recentMemory[0].summary}</p>
      )}
    </div>
  );
}

function DepartmentPanel({ slug, production }: { slug: XpsRoomPath; production: XpsControlRoomProduction }) {
  const dept = production.assignedDepartments.find((d) => d.departmentId === slug || d.departmentId.replace('-department', '') === slug);
  return (
    <section className="xps-panel">
      <p style={{ ...hqLabel }}>{XPS_ROOM_PATH_LABELS[slug]}</p>
      {dept ? (
        <>
          <p style={{ fontSize: '11px' }}>Specialist: {dept.specialist} · Status: {dept.status}</p>
          <ul className="mt-2 list-inside list-disc text-[10px]">
            {dept.outputs.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </>
      ) : (
        <p style={{ fontSize: '10px' }}>Department not assigned to active production.</p>
      )}
    </section>
  );
}

function PreviewPanels({ preview }: { preview: NonNullable<XpsReadyView['preview']> }) {
  return (
    <>
      <section className="xps-panel">
        <p style={{ ...hqLabel }}>Production Team™</p>
        <div className="grid gap-1 sm:grid-cols-2">
          {preview.productionTeam.map((d) => (
            <div key={d.departmentId} className="text-[9px] rounded p-2" style={{ background: `${ACCENT}08` }}>
              <strong>{d.label}</strong> · {d.specialist}
            </div>
          ))}
        </div>
      </section>
      <section className="xps-panel">
        <p style={{ ...hqLabel }}>Virtual Set™</p>
        <p style={{ fontSize: '10px' }}>{preview.virtualSet.room}</p>
        <p style={{ fontSize: '9px' }}>{preview.virtualSet.environment} · {preview.virtualSet.atmosphere}</p>
      </section>
      <section className="xps-panel">
        <p style={{ ...hqLabel }}>Asset Checklist™</p>
        <ul className="list-inside list-disc text-[9px]">
          {preview.assetChecklist.slice(0, 8).map((a) => <li key={a.assetId}>{a.label} — {a.status}</li>)}
        </ul>
      </section>
      <section className="xps-panel">
        <p style={{ ...hqLabel }}>Publishing Plan™</p>
        {preview.publishingPlan.map((p) => (
          <div key={p.platform} className="text-[9px]">{p.label} — {p.format} · {p.status}</div>
        ))}
      </section>
    </>
  );
}

function GateSidebar({
  view,
  production,
  onRefresh,
}: {
  view: XpsReadyView;
  production?: XpsControlRoomProduction;
  onRefresh: () => void;
}) {
  const gate = view.preview?.productionGate ?? { allowed: false, reason: 'Assemble a production to evaluate gates.' };
  const pkg = production?.package ?? view.preview?.productionPackage;

  return (
    <section className="xps-panel sticky top-4">
      <p style={{ ...hqLabel, color: ACCENT }}>Production Gate</p>
      <p style={{ fontSize: '18px', fontFamily: '"Covered By Your Grace", sans-serif' }}>{gate.allowed ? 'OPEN' : 'CLOSED'}</p>
      <p style={{ fontSize: '10px' }}>{gate.reason}</p>
      {pkg && (
        <p style={{ fontSize: '9px', marginTop: 8 }}>Stage: {XPS_PRODUCTION_STAGE_LABELS[pkg.currentStage]}</p>
      )}
      {pkg && !gate.allowed && (
        <button
          type="button"
          className="xps-btn primary mt-2 w-full"
          style={{ borderColor: ACCENT }}
          onClick={() => {
            saveProductionPackage({
              ...pkg,
              approvals: authorizeAssetGeneration(pkg.approvals),
              updatedAt: new Date().toISOString(),
            });
            onRefresh();
          }}
        >
          Authorize production
        </button>
      )}
      <p style={{ ...hqLabel, marginTop: 12 }}>AI Consumers</p>
      <ul className="text-[9px]">
        {view.consumerBindings.map((c) => <li key={c.system}>{c.status}</li>)}
      </ul>
    </section>
  );
}

function XpsStyles() {
  return (
    <style>{`
      [data-xps-brand] .xps-panel {
        border-radius: 12px;
        border: 1px solid ${ACCENT}18;
        background: #ffffffcc;
        backdrop-filter: blur(12px);
        padding: 16px;
      }
      [data-xps-brand] .xps-btn {
        border: 1px solid ${ACCENT}33;
        background: transparent;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
      }
      [data-xps-brand] .xps-btn.primary { background: ${ACCENT}10; }
    `}</style>
  );
}
