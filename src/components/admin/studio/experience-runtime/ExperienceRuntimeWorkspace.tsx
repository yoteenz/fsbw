import { Link, useParams } from 'react-router-dom';
import type { RefObject } from 'react';
import React from 'react';
import {
  XER_DEMO_BRAND_LABELS,
  XER_ROOM_PATH_LABELS,
  XER_SCENE_NODE_IDS,
  XER_SHARED_SCENE_ID,
  type XeeBrandDna,
  type XerReadyView,
  type XerRoomPath,
} from '../../../../studio-os-core/genesis';
import { useExperienceRuntimeState } from '../../../../hooks/useExperienceRuntimeState';
import { useExperienceRuntimeAssembly } from '../../../../hooks/useExperienceRuntimeAssembly';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/experience-runtime';

const WING_NAV: { slug: XerRoomPath; label: string; ring: 'runtime' | 'systems' | 'tools' }[] = [
  { slug: 'experience-runtime', label: 'Runtime Arrival', ring: 'runtime' },
  { slug: 'runtime', label: 'Runtime Overview', ring: 'runtime' },
  { slug: 'runtime-engine', label: 'Runtime Engine', ring: 'systems' },
  { slug: 'runtime-cache', label: 'Runtime Cache', ring: 'systems' },
  { slug: 'runtime-registry', label: 'Runtime Registry', ring: 'systems' },
  { slug: 'runtime-state', label: 'Runtime State', ring: 'systems' },
  { slug: 'runtime-preview', label: 'Runtime Preview', ring: 'tools' },
  { slug: 'runtime-playground', label: 'Runtime Playground', ring: 'tools' },
];

export function ExperienceRuntimeWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, setSelection, refresh } = useExperienceRuntimeState();
  const activeSlug = (roomSlug ?? 'experience-runtime') as XerRoomPath;
  const graph = view.runtimeGraph;
  const brand = graph.brand;
  const inspector = view.inspector;

  const { ref: sceneRef, switchBrandLive, switchCount, graph: liveGraph } = useExperienceRuntimeAssembly({
    brandId: view.selection.brandId,
    departmentId: view.selection.departmentId,
    sceneId: view.selection.sceneId,
    motionDnaId: view.selection.motionDnaId,
  });

  const displayGraph = liveGraph ?? graph;

  const switchBrand = (brandId: string) => {
    const nextGraph = switchBrandLive(brandId);
    setSelection({
      brandId,
      motionDnaId: `motion-${brandId}`,
    });
    const portal = document.querySelector('[data-gb-scroll-owner="portal"]') as HTMLElement | null;
    const workspaceRoot = portal?.querySelector('[data-xer-workspace-root]') as HTMLElement | null;
    if (workspaceRoot && nextGraph) {
      for (const [key, value] of Object.entries(nextGraph.cssVariables)) {
        workspaceRoot.style.setProperty(key, value);
      }
      workspaceRoot.setAttribute('data-xer-brand', nextGraph.brandId);
    }
  };

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{ background: displayGraph.cssVariables['--xer-ambient-gradient'] }}
      data-xer-workspace-root
      data-xer-runtime
      data-xer-brand={displayGraph.brandId}
    >
      <HqExperienceStyles />
      <XerStyles />
      <div className="xer-dept-wash" aria-hidden style={{ background: graph.cssVariables['--xer-dept-wash'] }} />

      <header
        className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ ...hqGlassPanel, borderColor: `${brand.colorSystem.primary}22` }}
      >
        <div>
          <p style={{ ...hqLabel, color: brand.colorSystem.primary, margin: 0 }}>EXPERIENCE RUNTIME™</p>
          <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, margin: '4px 0 0', color: brand.colorSystem.textPrimary }}>
            {XER_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/experience-engine" className="xer-btn">
            Experience Engine →
          </Link>
          <button type="button" className="xer-btn primary" style={{ borderColor: brand.colorSystem.primary, color: brand.colorSystem.primary }} onClick={refresh}>
            Refresh Runtime
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white/20 p-3 lg:block" style={{ borderColor: `${brand.colorSystem.primary}15` }}>
          {(['runtime', 'systems', 'tools'] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p style={{ ...hqLabel, marginBottom: 6, color: brand.colorSystem.textSecondary }}>{ring}</p>
              {WING_NAV.filter((r) => r.ring === ring).map((room) => (
                <Link
                  key={room.slug}
                  to={`${BASE}/${room.slug}`}
                  className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
                  style={{
                    fontFamily: brand.typography.labelFont,
                    color: activeSlug === room.slug ? brand.colorSystem.textPrimary : brand.colorSystem.textSecondary,
                    background: activeSlug === room.slug ? brand.glassStyle.panelStrong : 'transparent',
                    borderLeft: activeSlug === room.slug ? `2px solid ${brand.colorSystem.primary}` : '2px solid transparent',
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
            <section className="xer-panel" style={{ borderLeft: `3px solid ${brand.colorSystem.primary}` }}>
              <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Experience Runtime™</p>
              <p style={{ fontFamily: brand.typography.bodyFont, fontSize: brand.typography.bodySize, color: brand.colorSystem.textPrimary, lineHeight: 1.6 }}>
                {view.orbNote}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {view.demoBrandIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="xer-btn"
                    style={{
                      borderColor: view.selection.brandId === id ? brand.colorSystem.primary : brand.glassStyle.border,
                      background: view.selection.brandId === id ? `${brand.colorSystem.primary}12` : brand.glassStyle.panelBackground,
                    }}
                    onClick={() => switchBrand(id)}
                  >
                    {XER_DEMO_BRAND_LABELS[id]}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '9px', marginTop: 8, color: brand.colorSystem.textSecondary }}>
                Live switches: {switchCount} · Assembly: {displayGraph.performance.assemblyMs}ms · Cache: {displayGraph.performance.cacheHit ? 'hit' : 'miss'}
              </p>
            </section>

            {(activeSlug === 'experience-runtime' || activeSlug === 'runtime' || activeSlug === 'runtime-engine') && (
              <EnginePanel view={view} brand={brand} />
            )}
            {activeSlug === 'runtime-cache' && <CachePanel view={view} brand={brand} />}
            {activeSlug === 'runtime-registry' && <RegistryPanel view={view} brand={brand} />}
            {activeSlug === 'runtime-state' && <StatePanel view={view} brand={brand} />}
            {(activeSlug === 'runtime-preview' || activeSlug === 'runtime-playground' || activeSlug === 'experience-runtime') && (
              <RuntimePlayground view={view} sceneRef={sceneRef} switchBrand={switchBrand} brand={brand} graph={displayGraph} />
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <RuntimeInspector inspector={inspector} brand={brand} showOnRooms={activeSlug !== 'runtime-cache'} />
          </aside>
        </main>
      </div>
    </div>
  );
}

function EnginePanel({ view }: { view: XerReadyView; brand: XeeBrandDna }) {
  const g = view.runtimeGraph;
  return (
    <section className="xer-panel">
      <p style={{ ...hqLabel }}>Runtime Engine · Assembly Pipeline</p>
      <pre className="mt-2 overflow-auto rounded bg-black/5 p-3 text-[9px]" style={{ fontFamily: 'monospace' }}>
        {`Platform DNA → Brand DNA → Department DNA → Scene DNA → Component DNA → Motion DNA → Interaction DNA → State DNA → Runtime Assembly → Rendered Experience`}
      </pre>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[10px]">
        <div>DNAResolver™ · ThemeResolver™ · SceneAssembler™</div>
        <div>ComponentAssembler™ · MotionAssembler™ · InteractionAssembler™</div>
        <div>Graph nodes: {g.renderNodes.length}</div>
        <div>Tokens: {g.performance.tokenCount}</div>
      </div>
    </section>
  );
}

function CachePanel({ view, brand }: { view: XerReadyView; brand: XeeBrandDna }) {
  const stats = view.runtimeGraph.performance;
  const cache = view.runtimeGraph;
  return (
    <section className="xer-panel">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Runtime Cache™</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3 text-[10px]">
        <div className="rounded p-2" style={{ background: brand.glassStyle.panelBackground }}>
          Assembly: {stats.assemblyMs}ms
        </div>
        <div className="rounded p-2" style={{ background: brand.glassStyle.panelBackground }}>
          Cache: {stats.cacheHit ? 'HIT' : 'MISS'}
        </div>
        <div className="rounded p-2" style={{ background: brand.glassStyle.panelBackground }}>
          Overrides: {stats.overrideCount}
        </div>
      </div>
      <p style={{ fontSize: '9px', marginTop: 8, color: brand.colorSystem.textSecondary }}>
        Graph ID: {cache.graphId}
      </p>
    </section>
  );
}

function RegistryPanel({ view }: { view: XerReadyView; brand: XeeBrandDna }) {
  const p = view.platformDna;
  return (
    <section className="xer-panel">
      <p style={{ ...hqLabel }}>Runtime Registry · Platform DNA™</p>
      <p style={{ fontSize: '10px' }}>{p.platformDnaId} · {p.sceneGraphContract}</p>
      <ul className="mt-2 list-inside list-disc text-[9px]">
        {p.routeAnatomy.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </section>
  );
}

function StatePanel({ view, brand }: { view: XerReadyView; brand: XeeBrandDna }) {
  return (
    <section className="xer-panel">
      <p style={{ ...hqLabel }}>State DNA™ · {view.stateDna.stateDnaId}</p>
      <div className="mt-2 grid gap-2">
        {view.inspector.stateSlots.map((slot) => (
          <div key={slot.slotId} className="rounded p-2 text-[10px]" style={{ background: brand.glassStyle.panelBackground }}>
            <strong>{slot.label}</strong>
            <p style={{ fontSize: '9px', marginTop: 4 }}>Node: {slot.nodeId} · Scope: {slot.persistenceScope}</p>
            <p style={{ fontSize: '9px' }}>Value: {view.inspector.sessionState[slot.slotId] ?? (slot.defaultValue || '—')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RuntimePlayground({
  view,
  sceneRef,
  switchBrand,
  brand,
  graph,
}: {
  view: XerReadyView;
  sceneRef: RefObject<HTMLDivElement | null>;
  switchBrand: (id: string) => void;
  brand: XeeBrandDna;
  graph: XerReadyView['runtimeGraph'];
}) {
  const sessionNote = view.inspector.sessionState['slot-header-note'] ?? '';

  return (
    <section className="xer-panel">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Runtime Playground™ — live brand switch, stable graph</p>
      <p style={{ fontSize: '11px', color: brand.colorSystem.textSecondary, marginBottom: 12 }}>
        Same scene template ({XER_SHARED_SCENE_ID}). Node IDs fixed ({XER_SCENE_NODE_IDS.length} nodes). Brand DNA patches at runtime — no reload, no layout regeneration.
      </p>

      <div
        ref={sceneRef as React.Ref<HTMLDivElement>}
        className="xer-scene-demo overflow-hidden rounded-xl border"
        style={{
          border: brand.glassStyle.border,
          background: brand.glassStyle.panelBackground,
          backdropFilter: `blur(${brand.glassStyle.backdropBlur})`,
          color: brand.colorSystem.textPrimary,
          transition: graph.cssVariables['--xer-motion-timing'] ? `all ${brand.motion.timingMs}ms ${brand.motion.easing}` : undefined,
        }}
      >
        <div className="flex border-b px-4 py-3" style={{ borderColor: `${brand.colorSystem.primary}22` }} data-xer-node="node-executive-header">
          <div className="flex-1">
            <p style={{ fontFamily: brand.typography.labelFont, fontSize: brand.typography.labelSize, textTransform: 'uppercase', letterSpacing: '0.12em', color: brand.colorSystem.primary }}>
              {brand.navigationStyle.breadcrumbStyle}
            </p>
            <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, marginTop: 4 }}>
              {graph.department.officialName}
            </p>
            {sessionNote ? (
              <p style={{ fontSize: '10px', marginTop: 4, color: brand.colorSystem.textSecondary }}>State preserved: {sessionNote}</p>
            ) : null}
          </div>
          <button type="button" className="xer-btn primary" style={{ borderColor: brand.colorSystem.primary, color: brand.colorSystem.primary }}>
            Primary Action
          </button>
        </div>

        <div className="flex min-h-[280px]">
          <aside className="hidden w-44 shrink-0 border-r p-3 sm:block" style={{ borderColor: `${brand.colorSystem.primary}15` }} data-xer-node="node-navigation-rail">
            {graph.renderNodes
              .filter((n) => n.role === 'navigation-rail')
              .map((n) => (
                <div key={n.nodeId} className="mb-1 rounded px-2 py-1.5 text-[9px] uppercase" style={{ fontFamily: brand.typography.labelFont, borderLeft: `2px solid ${graph.department.departmentColor}` }}>
                  {graph.department.officialName}
                </div>
              ))}
          </aside>

          <div className="flex flex-1 flex-col p-4" data-xer-node="node-hero-environment">
            <div
              className="mb-4 flex min-h-[100px] items-center justify-center rounded-lg border border-dashed"
              style={{ borderColor: `${brand.colorSystem.accent}55`, background: `${brand.colorSystem.primary}08` }}
              data-xer-node="node-primary-focal-object"
            >
              <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, textAlign: 'center', padding: '0 16px' }}>
                {graph.scene.heroObject}
              </p>
            </div>
            <p style={{ fontFamily: brand.typography.bodyFont, fontSize: brand.typography.bodySize, marginBottom: 16, color: brand.colorSystem.textSecondary }}>
              {brand.writingVoice.sampleGreeting}
            </p>
            <div className="grid gap-3 sm:grid-cols-3" data-xer-node="node-capability-panels">
              {graph.scene.capabilityPanels.map((cap) => (
                <div key={cap} className="rounded-lg p-3" style={{ background: brand.glassStyle.panelStrong, border: brand.glassStyle.border }}>
                  <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>{cap}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t px-4 py-2 text-[9px] uppercase" style={{ borderColor: `${brand.colorSystem.primary}15`, color: brand.colorSystem.textSecondary }} data-xer-node="node-footer-ribbon">
          <span>{graph.interaction.approval}</span>
          <span className="rounded-full px-3 py-1" style={{ background: `${brand.orbOverrides.glowColor}33` }} data-xer-node="node-orb-mount">
            Orb: {brand.orbOverrides.variant}
          </span>
        </footer>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {view.demoBrandIds.map((id) => (
          <button key={id} type="button" className="xer-btn" onClick={() => switchBrand(id)}>
            Live switch → {XER_DEMO_BRAND_LABELS[id]}
          </button>
        ))}
      </div>
    </section>
  );
}

function RuntimeInspector({
  inspector,
  brand,
  showOnRooms,
}: {
  inspector: XerReadyView['inspector'];
  brand: XeeBrandDna;
  showOnRooms: boolean;
}) {
  if (!showOnRooms) return null;

  return (
    <section className="xer-panel sticky top-4 max-h-[calc(100vh-160px)] overflow-y-auto">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Runtime Inspector™</p>

      <InspectorBlock title="Platform DNA" items={inspector.platformDna.routeAnatomy} brand={brand} />
      <InspectorBlock title="Brand DNA" items={[inspector.brandDna.officialName, inspector.brandDna.identity.philosophy]} brand={brand} />
      <InspectorBlock title="Department DNA" items={[inspector.departmentDna.officialName, inspector.departmentDna.ambientMood]} brand={brand} />
      <InspectorBlock title="Scene DNA" items={[inspector.sceneDna.officialName, inspector.sceneDna.layoutTemplateId]} brand={brand} />
      <InspectorBlock title="Components" items={inspector.componentDna.map((c) => `${c.officialName} (${c.variant})`)} brand={brand} />

      <p style={{ ...hqLabel, marginTop: 12 }}>Resolved Tokens</p>
      <pre className="max-h-32 overflow-auto rounded bg-black/5 p-2 text-[8px]" style={{ fontFamily: 'monospace' }}>
        {Object.entries(inspector.resolvedTokens)
          .slice(0, 12)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')}
      </pre>

      <p style={{ ...hqLabel, marginTop: 12 }}>Active Overrides ({inspector.activeOverrides.length})</p>
      {inspector.activeOverrides.length === 0 ? (
        <p style={{ fontSize: '9px', color: brand.colorSystem.textSecondary }}>No governed overrides — Studio OS baseline</p>
      ) : (
        inspector.activeOverrides.map((o) => (
          <p key={o.overrideId} style={{ fontSize: '9px', marginBottom: 4 }}>
            {o.layer}.{o.fieldPath}: {o.value}
          </p>
        ))
      )}

      <p style={{ ...hqLabel, marginTop: 12 }}>Performance</p>
      <div className="grid gap-1 text-[9px]">
        <span>Assembly: {inspector.performance.assemblyMs}ms</span>
        <span>Nodes: {inspector.performance.graphNodeCount}</span>
        <span>Tokens: {inspector.performance.tokenCount}</span>
        <span>Brand switches: {inspector.performance.brandSwitchCount}</span>
        <span>Cache: {inspector.performance.cacheHit ? 'hit' : 'miss'}</span>
      </div>
    </section>
  );
}

function InspectorBlock({ title, items, brand }: { title: string; items: string[]; brand: XeeBrandDna }) {
  return (
    <div className="mt-3">
      <p style={{ ...hqLabel, fontSize: '8px', color: brand.colorSystem.textSecondary }}>{title}</p>
      <ul className="mt-1 list-inside list-disc text-[9px]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function XerStyles() {
  return (
    <style>{`
      .xer-panel {
        background: var(--xer-glass-panel, rgba(255,255,255,0.55));
        backdrop-filter: blur(var(--xer-glass-blur, 12px));
        border: var(--xer-glass-border, 1.3px solid rgba(0,0,0,0.12));
        border-radius: 12px;
        padding: 16px;
      }
      .xer-btn {
        font-family: "Futura PT Medium", sans-serif;
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        padding: 8px 14px;
        border: 1.3px solid rgba(0,0,0,0.2);
        background: rgba(255,255,255,0.6);
        border-radius: 2px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        color: inherit;
        position: relative;
        z-index: 2;
        pointer-events: auto;
      }
      .xer-dept-wash {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
    `}</style>
  );
}
