import { Link } from 'react-router-dom';
import type { RefObject } from 'react';
import React from 'react';
import {
  XELAB_PANEL_IDS,
  XELAB_PANEL_LABELS,
  XELAB_SWITCHER_OPTIONS,
  XELAB_TEST_SCENARIOS,
  XER_DEMO_BRAND_LABELS,
  XER_SCENE_NODE_IDS,
  XER_SHARED_SCENE_ID,
  type XeeBrandDna,
  type XelabPanelId,
  type XelabReadyView,
  type XelabScenarioId,
  type XerRuntimeBootReport,
  type XerRuntimeGraph,
} from '../../../../studio-os-core/genesis';
import { useExperienceLabState } from '../../../../hooks/useExperienceLabState';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';
import { StudioBootGate } from '../studio-boot/StudioBootGate';

export function ExperienceLabWorkspace() {
  return (
    <StudioBootGate through="experience-runtime" diagnosticsWhenReady={false}>
      <ExperienceLabWorkspaceContent />
    </StudioBootGate>
  );
}

function ExperienceLabWorkspaceContent() {
  const {
    view,
    graph,
    bootReport,
    sceneRef,
    loadScenario,
    setBrand,
    setDepartment,
    setScene,
    setSwitchers,
    setPanel,
    refresh,
    switchCount,
    bootBlocked,
  } = useExperienceLabState();

  const brand = graph?.brand;
  const activePanel = view.selection.activePanel;

  if (bootBlocked || !brand) {
    return (
      <div className="min-h-[calc(100vh-120px)] p-4" data-xelab data-xelab-boot="diagnostics">
        <RuntimeBootDiagnostics bootReport={bootReport} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{ background: graph.cssVariables['--xer-ambient-gradient'] ?? brand.colorSystem.background }}
      data-xelab
      data-xelab-brand={graph.brandId}
    >
      <HqExperienceStyles />
      <LabStyles brand={brand} />

      <header
        className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ ...hqGlassPanel, borderColor: `${brand.colorSystem.primary}22` }}
      >
        <div>
          <p style={{ ...hqLabel, color: brand.colorSystem.primary, margin: 0 }}>EXPERIENCE LAB™</p>
          <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, margin: '4px 0 0', color: brand.colorSystem.textPrimary }}>
            {view.scenarioLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/experience-runtime" className="xelab-btn">Experience Runtime →</Link>
          <Link to="/admin/studio/experience-engine" className="xelab-btn">Experience Engine →</Link>
          <button type="button" className="xelab-btn primary" style={{ borderColor: brand.colorSystem.primary, color: brand.colorSystem.primary }} onClick={refresh}>
            Refresh Lab
          </button>
        </div>
      </header>

      <div className="relative z-10 flex flex-col gap-4 p-4">
        <section className="xelab-panel" style={{ borderLeft: `3px solid ${brand.colorSystem.primary}` }}>
          <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Test Scenarios</p>
          <p style={{ fontSize: '11px', color: brand.colorSystem.textSecondary, marginBottom: 8 }}>{view.orbNote}</p>
          <div className="flex flex-wrap gap-2">
            {XELAB_TEST_SCENARIOS.map((s) => (
              <button
                key={s.scenarioId}
                type="button"
                className="xelab-btn"
                style={{
                  borderColor: view.selection.scenarioId === s.scenarioId ? brand.colorSystem.primary : undefined,
                  background: view.selection.scenarioId === s.scenarioId ? `${brand.colorSystem.primary}12` : undefined,
                }}
                onClick={() => loadScenario(s.scenarioId as XelabScenarioId)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '9px', marginTop: 8, color: brand.colorSystem.textSecondary }}>
            Live switches: {switchCount} · Scene: {XER_SHARED_SCENE_ID} · Nodes: {XER_SCENE_NODE_IDS.length} fixed
          </p>
        </section>

        <SwitcherBar
          view={view}
          brand={brand}
          setBrand={setBrand}
          setDepartment={setDepartment}
          setScene={setScene}
          setSwitchers={setSwitchers}
        />

        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <LabScenePreview view={view} graph={graph} sceneRef={sceneRef} brand={brand} />
          </div>

          <aside className="w-full shrink-0 xl:w-96">
            <nav className="mb-3 flex flex-wrap gap-1">
              {XELAB_PANEL_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="xelab-btn text-[8px]"
                  style={{
                    borderColor: activePanel === id ? brand.colorSystem.primary : undefined,
                    background: activePanel === id ? `${brand.colorSystem.primary}10` : undefined,
                  }}
                  onClick={() => setPanel(id)}
                >
                  {XELAB_PANEL_LABELS[id].replace('™', '')}
                </button>
              ))}
            </nav>
            <PanelContent panel={activePanel} view={view} graph={graph} brand={brand} bootReport={bootReport} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function SwitcherBar({
  view,
  brand,
  setBrand,
  setDepartment,
  setScene,
  setSwitchers,
}: {
  view: XelabReadyView;
  brand: XeeBrandDna;
  setBrand: (id: string) => void;
  setDepartment: (id: string) => void;
  setScene: (id: string) => void;
  setSwitchers: (p: Partial<typeof view.selection.switchers>) => void;
}) {
  const sw = view.selection.switchers;
  return (
    <section className="xelab-panel">
      <p style={{ ...hqLabel }}>Live Switchers</p>
      <div className="grid gap-3 text-[9px] sm:grid-cols-2 lg:grid-cols-3">
        <SwitcherGroup label="Brand" options={XELAB_SWITCHER_OPTIONS.brand} value={view.selection.brandId} onChange={setBrand} labels={XER_DEMO_BRAND_LABELS as Record<string, string>} brand={brand} />
        <SwitcherGroup label="Department" options={XELAB_SWITCHER_OPTIONS.department} value={view.selection.departmentId} onChange={setDepartment} brand={brand} />
        <SwitcherGroup label="Scene" options={XELAB_SWITCHER_OPTIONS.scene} value={view.selection.sceneId} onChange={setScene} brand={brand} />
        <SwitcherGroup label="Theme" options={XELAB_SWITCHER_OPTIONS.theme} value={sw.themeVariant} onChange={(v) => setSwitchers({ themeVariant: v as typeof sw.themeVariant })} brand={brand} />
        <SwitcherGroup label="Orb" options={XELAB_SWITCHER_OPTIONS.orb} value={sw.orbVariant} onChange={(v) => setSwitchers({ orbVariant: v as typeof sw.orbVariant })} brand={brand} />
        <SwitcherGroup label="Lighting" options={XELAB_SWITCHER_OPTIONS.lighting} value={sw.lightingVariant} onChange={(v) => setSwitchers({ lightingVariant: v as typeof sw.lightingVariant })} brand={brand} />
        <SwitcherGroup label="Particle" options={XELAB_SWITCHER_OPTIONS.particle} value={sw.particleVariant} onChange={(v) => setSwitchers({ particleVariant: v as typeof sw.particleVariant })} brand={brand} />
        <SwitcherGroup label="Typography" options={XELAB_SWITCHER_OPTIONS.typography} value={sw.typographyVariant} onChange={(v) => setSwitchers({ typographyVariant: v as typeof sw.typographyVariant })} brand={brand} />
        <SwitcherGroup label="Animation" options={XELAB_SWITCHER_OPTIONS.animation} value={sw.animationVariant} onChange={(v) => setSwitchers({ animationVariant: v as typeof sw.animationVariant })} brand={brand} />
      </div>
    </section>
  );
}

function SwitcherGroup({
  label,
  options,
  value,
  onChange,
  labels,
  brand,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  labels?: Record<string, string>;
  brand: XeeBrandDna;
}) {
  return (
    <div>
      <p style={{ ...hqLabel, marginBottom: 4, color: brand.colorSystem.textSecondary }}>{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className="xelab-btn text-[8px]"
            style={{ borderColor: value === opt ? brand.colorSystem.primary : undefined }}
            onClick={() => onChange(opt)}
          >
            {labels?.[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function LabScenePreview({
  view,
  graph,
  sceneRef,
  brand,
}: {
  view: XelabReadyView;
  graph: XerRuntimeGraph;
  sceneRef: RefObject<HTMLDivElement | null>;
  brand: XeeBrandDna;
}) {
  return (
    <section className="xelab-panel">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Live Runtime Assembly — {view.scenarioHeroLabel}</p>
      <p style={{ fontSize: '10px', color: brand.colorSystem.textSecondary, marginBottom: 12 }}>
        Identical infrastructure ({XER_SHARED_SCENE_ID}). Only inherited Brand / Department / Component / Motion / Interaction DNA changes.
      </p>
      <div
        ref={sceneRef as React.Ref<HTMLDivElement>}
        className="xelab-scene overflow-hidden rounded-xl border"
        style={{
          border: brand.glassStyle.border,
          background: brand.glassStyle.panelBackground,
          backdropFilter: `blur(${brand.glassStyle.backdropBlur})`,
          color: brand.colorSystem.textPrimary,
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
          </div>
        </div>
        <div className="flex min-h-[280px]">
          <aside className="hidden w-40 shrink-0 border-r p-3 sm:block" style={{ borderColor: `${brand.colorSystem.primary}15` }} data-xer-node="node-navigation-rail">
            <div className="rounded px-2 py-1.5 text-[9px] uppercase" style={{ fontFamily: brand.typography.labelFont, borderLeft: `2px solid ${graph.department.departmentColor}` }}>
              {graph.department.officialName}
            </div>
          </aside>
          <div className="flex flex-1 flex-col p-4" data-xer-node="node-hero-environment">
            <div
              className="mb-4 flex min-h-[100px] items-center justify-center rounded-lg border border-dashed"
              style={{ borderColor: `${brand.colorSystem.accent}55`, background: `${brand.colorSystem.primary}08` }}
              data-xer-node="node-primary-focal-object"
            >
              <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, textAlign: 'center', padding: '0 16px' }}>
                {view.scenarioHeroLabel}
              </p>
            </div>
            <p style={{ fontFamily: brand.typography.bodyFont, fontSize: brand.typography.bodySize, color: brand.colorSystem.textSecondary }}>
              {brand.writingVoice.sampleGreeting}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3" data-xer-node="node-capability-panels">
              {graph.scene.capabilityPanels.map((cap) => (
                <div key={cap} className="rounded-lg p-2 text-[9px]" style={{ background: brand.glassStyle.panelStrong, border: brand.glassStyle.border }}>
                  {cap}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end" data-xer-node="node-orb-mount">
              <div className="rounded-full px-3 py-2 text-[9px]" style={{ background: `${brand.orbOverrides.glowColor}33`, border: `1px solid ${brand.orbOverrides.glowColor}` }}>
                Orb · {brand.orbOverrides.personality}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelContent({
  panel,
  view,
  graph,
  brand,
  bootReport,
}: {
  panel: XelabPanelId;
  view: XelabReadyView;
  graph: XerRuntimeGraph;
  brand: XeeBrandDna;
  bootReport: XerRuntimeBootReport;
}) {
  const insp = view.inspector;
  const perf = graph.performance;

  if (panel === 'runtime-status') {
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Runtime Status™</p>
        <BootInspectorSection bootReport={bootReport} />
        <div className="mt-2 grid gap-2 text-[10px]">
          <div>Graph: {graph.graphId}</div>
          <div>Brand: {graph.brandId} · Dept: {graph.departmentId}</div>
          <div>Assembly: {perf.assemblyMs}ms · Cache: {perf.cacheHit ? 'HIT' : 'MISS'}</div>
          <div>Overrides: {perf.overrideCount} · Tokens: {perf.tokenCount}</div>
        </div>
      </section>
    );
  }

  if (panel === 'brand-dna') {
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Brand DNA™</p>
        <p style={{ fontSize: '10px' }}>{brand.officialName}</p>
        <p style={{ fontSize: '9px', marginTop: 4 }}>{brand.identity.philosophy}</p>
        <p style={{ fontSize: '9px' }}>Primary: {brand.colorSystem.primary} · Particles: {brand.particles}</p>
      </section>
    );
  }

  if (panel === 'platform-dna') {
    const p = insp?.platformDna;
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Platform DNA™</p>
        <p style={{ fontSize: '10px' }}>{p?.platformDnaId ?? bootReport.resolvedVersions.platformDna}</p>
        <ul className="mt-2 list-inside list-disc text-[9px]">
          {(p?.routeAnatomy ?? []).slice(0, 4).map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>
    );
  }

  if (panel === 'department-dna') {
    const d = insp?.departmentDna;
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Department DNA™</p>
        <p style={{ fontSize: '10px' }}>{d?.officialName ?? graph.department.officialName}</p>
        <p style={{ fontSize: '9px' }}>{d?.sceneIdentity ?? graph.department.sceneIdentity} · {d?.ambientMood ?? graph.department.ambientMood}</p>
      </section>
    );
  }

  if (panel === 'scene-dna') {
    const s = insp?.sceneDna;
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Scene DNA™</p>
        <p style={{ fontSize: '10px' }}>{s?.officialName ?? graph.scene.officialName}</p>
        <p style={{ fontSize: '9px' }}>Template: {s?.layoutTemplateId ?? graph.scene.layoutTemplateId}</p>
      </section>
    );
  }

  if (panel === 'component-dna') {
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Component DNA™</p>
        <ul className="text-[9px]">
          {(insp?.componentDna ?? graph.components).map((c) => (
            <li key={c.componentDnaId}>{c.componentId} · {c.variant}</li>
          ))}
        </ul>
      </section>
    );
  }

  if (panel === 'motion-dna') {
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Motion DNA™</p>
        <p style={{ fontSize: '10px' }}>{graph.motion.presetName}</p>
        <p style={{ fontSize: '9px' }}>{graph.motion.entrance} · {graph.motion.transition}</p>
      </section>
    );
  }

  if (panel === 'interaction-dna') {
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Interaction DNA™</p>
        <p style={{ fontSize: '9px' }}>Hover: {graph.interaction.hover}</p>
        <p style={{ fontSize: '9px' }}>Focus: {graph.interaction.focus}</p>
      </section>
    );
  }

  if (panel === 'performance') {
    return (
      <section className="xelab-panel">
        <p style={{ ...hqLabel }}>Performance™</p>
        <div className="grid gap-2 text-[10px]">
          <div>Assembly: {perf.assemblyMs}ms</div>
          <div>Nodes: {perf.graphNodeCount}</div>
          <div>Brand switches: {perf.brandSwitchCount}</div>
          <div>Last: {perf.lastAssembledAt}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="xelab-panel">
      <p style={{ ...hqLabel }}>Runtime Inspector™</p>
      <BootInspectorSection bootReport={bootReport} />
      {insp ? (
        <>
          <p style={{ fontSize: '9px' }}>Tokens: {Object.keys(insp.resolvedTokens).length}</p>
          <p style={{ fontSize: '9px' }}>Overrides: {insp.activeOverrides.length}</p>
          <ul className="mt-2 max-h-48 overflow-auto text-[8px]">
            {insp.renderNodes.map((n) => (
              <li key={n.nodeId}>{n.nodeId} · {n.role} · {n.variant}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function BootInspectorSection({ bootReport }: { bootReport: XerRuntimeBootReport }) {
  const v = bootReport.resolvedVersions;
  return (
    <div className="mt-2 grid gap-1 border-t pt-2 text-[9px]" style={{ borderColor: '#00000012' }}>
      <p style={{ ...hqLabel, marginBottom: 4 }}>Runtime Boot Inspector</p>
      <div>Brand: {bootReport.resolved.brandId}</div>
      <div>Department: {bootReport.resolved.departmentId}</div>
      <div>Scene: {bootReport.resolved.sceneId}</div>
      <div>Template: {v.templateId}</div>
      <div>Platform DNA: {v.platformDna}</div>
      <div>Brand DNA: {v.brandDna}</div>
      <div>Department DNA: {v.departmentDna}</div>
      <div>Scene DNA: {v.sceneDna}</div>
      <div>State DNA: {v.stateDna}</div>
      <div>Design DNA: {v.designDna}</div>
      {bootReport.missingObjects.length > 0 && (
        <div style={{ color: '#eb1c24' }}>Missing: {bootReport.missingObjects.join(', ')}</div>
      )}
      {bootReport.fallbacksUsed.length > 0 && (
        <div>Fallbacks: {bootReport.fallbacksUsed.join(' · ')}</div>
      )}
      {bootReport.warnings.length > 0 && (
        <ul className="mt-1 list-inside list-disc text-[8px]" style={{ color: '#666' }}>
          {bootReport.warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}
    </div>
  );
}

function RuntimeBootDiagnostics({
  bootReport,
  onRetry,
}: {
  bootReport: XerRuntimeBootReport;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 rounded-xl border border-red-200 bg-white p-6 shadow-sm">
      <div>
        <p style={{ ...hqLabel, color: '#eb1c24', margin: 0 }}>Runtime Boot Diagnostics</p>
        <p style={{ fontSize: '12px', color: '#555', marginTop: 8 }}>
          Experience Lab could not assemble the live preview safely. Bundled DNA fallbacks are active — tap retry to re-seed registries on this device.
        </p>
      </div>
      <BootInspectorSection bootReport={bootReport} />
      <button
        type="button"
        className="xelab-btn self-start"
        onClick={onRetry}
        style={{ borderColor: '#eb1c24', color: '#eb1c24', padding: '8px 12px' }}
      >
        Retry Boot
      </button>
    </div>
  );
}

function LabStyles({ brand }: { brand: XeeBrandDna }) {
  return (
    <style>{`
      [data-xelab] .xelab-panel {
        border-radius: 12px;
        border: 1px solid ${brand.colorSystem.primary}18;
        background: ${brand.glassStyle.panelBackground};
        backdrop-filter: blur(12px);
        padding: 16px;
      }
      [data-xelab] .xelab-btn {
        border: 1px solid ${brand.colorSystem.primary}33;
        background: transparent;
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        cursor: pointer;
      }
      [data-xelab] .xelab-btn.primary { background: ${brand.colorSystem.primary}10; }
    `}</style>
  );
}
