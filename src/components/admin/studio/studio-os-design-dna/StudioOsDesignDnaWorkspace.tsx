import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DDNA_ROOM_PATH_LABELS,
  DDNA_SCENE_LAYER_LABELS,
  DDNA_TOKEN_CATEGORIES,
  type DdnaDepartmentTheme,
  type DdnaDesignToken,
  type DdnaRoomPath,
} from '../../../../studio-os-core/genesis';
import { useStudioOsDesignDnaState } from '../../../../hooks/useStudioOsDesignDnaState';
import { HQ, hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/design-dna';

const WING_NAV: { slug: DdnaRoomPath; label: string; ring: 'constitution' | 'engines' | 'systems' }[] = [
  { slug: 'design-dna', label: 'Design DNA™ Arrival', ring: 'constitution' },
  { slug: 'design-tokens', label: 'Design Token Registry™', ring: 'constitution' },
  { slug: 'department-themes', label: 'Department Theme Registry™', ring: 'constitution' },
  { slug: 'scene-templates', label: 'Scene Template Engine™', ring: 'engines' },
  { slug: 'component-library', label: 'Component Library™', ring: 'engines' },
  { slug: 'color-system', label: 'Color System™', ring: 'systems' },
  { slug: 'navigation-system', label: 'Cognitive Navigation Engine™', ring: 'systems' },
  { slug: 'motion-system', label: 'Motion & Animation Engine™', ring: 'systems' },
  { slug: 'icon-system', label: 'Icon System™', ring: 'systems' },
  { slug: 'lighting-system', label: 'Lighting Engine™', ring: 'systems' },
];

/**
 * Studio OS Design DNA™ — permanent visual operating system.
 * Constitutional design engine — not individual pages.
 */
export function StudioOsDesignDnaWorkspace() {
  const navigate = useNavigate();
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, selectDepartment, refresh } = useStudioOsDesignDnaState();

  const activeSlug = (roomSlug ?? 'design-dna') as DdnaRoomPath;
  const dept = view.activeDepartment;

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{
        background: view.sceneProfile.cssVariables['--studio-ddna-hero-gradient'] ??
          'linear-gradient(165deg, #f8f6f3 0%, #efeae4 30%, #f5f2ee 65%, #faf8f5 100%)',
      }}
      data-ddna-scene={view.sceneTemplate.templateId}
      data-ddna-department={view.activeDepartmentId}
    >
      <HqExperienceStyles />
      <DdnaStyles />
      <div className="ddna-dept-wash" aria-hidden style={{ background: view.sceneProfile.cssVariables['--studio-ddna-dept-wash'] }} />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3" style={hqGlassPanel}>
        <div>
          <p style={{ ...hqLabel, color: dept.primaryColor, margin: 0 }}>STUDIO OS DESIGN DNA™</p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', margin: '4px 0 0', color: HQ.black }}>
            {DDNA_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="ddna-btn" onClick={() => navigate('/admin/studio/design-token-engine')}>
            Design Token Engine →
          </button>
          <button type="button" className="ddna-btn primary" onClick={refresh} style={{ borderColor: dept.primaryColor, color: dept.primaryColor }}>
            Refresh DNA
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r border-black/5 bg-white/30 p-3 lg:block" aria-label="Design DNA wing">
          {(['constitution', 'engines', 'systems'] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p style={{ ...hqLabel, marginBottom: 6 }}>{ring}</p>
              {WING_NAV.filter((r) => r.ring === ring).map((room) => (
                <Link
                  key={room.slug}
                  to={`${BASE}/${room.slug}`}
                  className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: activeSlug === room.slug ? HQ.black : HQ.gray,
                    background: activeSlug === room.slug ? 'rgba(255,255,255,0.85)' : 'transparent',
                    borderLeft: activeSlug === room.slug ? `2px solid ${dept.primaryColor}` : '2px solid transparent',
                  }}
                >
                  {room.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex flex-1 flex-col gap-4 p-4">
          <ArchitectHeader note={view.orbArchitectNote} dept={dept} stats={view.stats} />

          {activeSlug === 'design-dna' && <ArrivalPanel view={view} onSelectDepartment={selectDepartment} />}
          {activeSlug === 'design-tokens' && <TokenRegistryPanel tokens={view.tokens} />}
          {activeSlug === 'department-themes' && (
            <DepartmentThemesPanel themes={view.departmentThemes} activeId={view.activeDepartmentId} onSelect={selectDepartment} />
          )}
          {activeSlug === 'scene-templates' && <SceneTemplatePanel template={view.sceneTemplate} />}
          {activeSlug === 'component-library' && <ComponentLibraryPanel components={view.components} />}
          {activeSlug === 'color-system' && <ColorSystemPanel dept={dept} themes={view.departmentThemes} />}
          {activeSlug === 'navigation-system' && <NavigationPanel rules={view.navigationRules} nav={view.sceneProfile.navigationContext} />}
          {activeSlug === 'motion-system' && (
            <MotionPanel motion={view.motionPresets} animation={view.animationHooks} dept={dept} />
          )}
          {activeSlug === 'icon-system' && <IconPanel treatments={view.iconTreatments} dept={dept} />}
          {activeSlug === 'lighting-system' && (
            <LightingPanel presets={view.lightingPresets} glass={view.glassMaterials} dept={dept} />
          )}

          <CssInheritancePanel cssPreview={view.cssPreview} constitutionLocked={view.constitutionLocked} />
        </main>
      </div>
    </div>
  );
}

function ArchitectHeader({
  note,
  dept,
  stats,
}: {
  note: string;
  dept: DdnaDepartmentTheme;
  stats: { complianceScore: number; tokenCount: number; departmentCount: number; componentCount: number };
}) {
  return (
    <section className="ddna-panel" style={{ borderLeft: `3px solid ${dept.primaryColor}` }}>
      <p style={{ ...hqLabel, color: dept.primaryColor }}>Design Architect · Orb Context</p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '13px', lineHeight: 1.6, margin: '8px 0', color: HQ.black }}>{note}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <StatChip label="Compliance" value={`${stats.complianceScore}%`} color={dept.primaryColor} />
        <StatChip label="Tokens" value={String(stats.tokenCount)} color={dept.accentColor} />
        <StatChip label="Departments" value={String(stats.departmentCount)} color={dept.secondaryColor} />
        <StatChip label="Components" value={String(stats.componentCount)} color={dept.primaryColor} />
      </div>
    </section>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded px-3 py-2" style={{ background: `${color}12`, border: `1px solid ${color}33` }}>
      <p style={{ ...hqLabel, margin: 0, color }}>{label}</p>
      <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '16px', margin: '2px 0 0' }}>{value}</p>
    </div>
  );
}

function ArrivalPanel({
  view,
  onSelectDepartment,
}: {
  view: ReturnType<typeof useStudioOsDesignDnaState>['view'];
  onSelectDepartment: (id: string) => void;
}) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Constitutional Promise</p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', lineHeight: 1.65 }}>
        Studio OS should never be redesigned. Every future Headquarters, department, and scene inherits this Design DNA™ —
        generated from registries, never manually styled.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {view.recommendations.map((r) => (
          <div key={r.recommendationId} className="rounded-lg bg-white/50 p-3" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ ...hqLabel, color: view.activeDepartment.primaryColor }}>{r.title}</p>
            <p style={{ fontSize: '11px', fontFamily: '"Futura PT Book"', marginTop: 6 }}>{r.reason}</p>
          </div>
        ))}
      </div>
      <p style={{ ...hqLabel, marginTop: 16 }}>Preview Department Atmosphere</p>
      <div className="flex flex-wrap gap-2">
        {view.departmentThemes.slice(0, 8).map((d) => (
          <button
            key={d.departmentId}
            type="button"
            className="ddna-btn"
            style={{ borderColor: d.primaryColor, color: d.primaryColor }}
            onClick={() => onSelectDepartment(d.departmentId)}
          >
            {d.officialName}
          </button>
        ))}
      </div>
    </section>
  );
}

function TokenRegistryPanel({ tokens }: { tokens: DdnaDesignToken[] }) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Design Token Registry™ · {tokens.length} tokens</p>
      {DDNA_TOKEN_CATEGORIES.map((cat) => {
        const group = tokens.filter((t) => t.category === cat);
        if (!group.length) return null;
        return (
          <div key={cat} className="mt-4">
            <p style={{ ...hqLabel, marginBottom: 8 }}>{cat}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.map((t) => (
                <div key={t.tokenId} className="rounded bg-white/45 px-3 py-2 text-[10px]" style={{ fontFamily: 'monospace' }}>
                  <span style={{ color: HQ.gray }}>{t.cssVariable}</span>
                  <br />
                  <span style={{ color: HQ.black }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function DepartmentThemesPanel({
  themes,
  activeId,
  onSelect,
}: {
  themes: DdnaDepartmentTheme[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Department Theme Registry™ · {themes.length} departments</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((d) => (
          <button
            key={d.departmentId}
            type="button"
            className="ddna-dept-card text-left"
            style={{
              borderColor: activeId === d.departmentId ? d.primaryColor : 'rgba(0,0,0,0.08)',
              boxShadow: activeId === d.departmentId ? `0 0 0 1px ${d.primaryColor}` : undefined,
            }}
            onClick={() => onSelect(d.departmentId)}
          >
            <div className="mb-2 flex gap-2">
              <span className="h-4 w-4 rounded-full" style={{ background: d.primaryColor }} />
              <span className="h-4 w-4 rounded-full" style={{ background: d.secondaryColor }} />
              <span className="h-4 w-4 rounded-full" style={{ background: d.accentColor }} />
            </div>
            <p style={{ ...hqLabel, color: d.primaryColor }}>{d.officialName}</p>
            <p style={{ fontSize: '9px', fontFamily: '"Futura PT Book"', marginTop: 4, color: HQ.gray }}>
              {d.sceneMood} · {d.motionStyle}
            </p>
            <p style={{ fontSize: '9px', marginTop: 4 }}>Orb: {d.orbVariant} · Particles: {d.particleSystem}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function SceneTemplatePanel({ template }: { template: ReturnType<typeof useStudioOsDesignDnaState>['view']['sceneTemplate'] }) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>{template.officialName}</p>
      <p style={{ fontSize: '11px', fontFamily: '"Futura PT Book"', marginBottom: 12 }}>
        Grid {template.gridColumns}col · max {template.maxContentWidthPx}px · hero {template.heroViewportPct}% · Orb persistent:{' '}
        {template.orbPersistent ? 'yes' : 'no'}
      </p>
      <ol className="space-y-2">
        {template.layers.map((layer) => (
          <li
            key={layer.layerId}
            className="flex items-start gap-3 rounded-lg bg-white/45 px-3 py-2"
            data-ddna-layer={layer.layerId}
          >
            <span style={{ ...hqLabel, minWidth: 24 }}>z{layer.zIndex}</span>
            <div>
              <p style={{ ...hqLabel }}>{DDNA_SCENE_LAYER_LABELS[layer.layerId]}</p>
              <p style={{ fontSize: '10px', fontFamily: '"Futura PT Book"', color: HQ.gray }}>{layer.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ComponentLibraryPanel({ components }: { components: ReturnType<typeof useStudioOsDesignDnaState>['view']['components'] }) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Component Library™ · {components.length} constitutional components</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {components.map((c) => (
          <div key={c.componentId} className="rounded-lg bg-white/50 p-3">
            <p style={{ ...hqLabel }}>{c.officialName}</p>
            <p style={{ fontSize: '10px', fontFamily: '"Futura PT Book"', marginTop: 4 }}>{c.description}</p>
            <p style={{ fontSize: '9px', color: HQ.gray, marginTop: 6 }}>Reuse {c.reuseScore}% · {c.tokenBindings.join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ColorSystemPanel({ dept, themes }: { dept: DdnaDepartmentTheme; themes: DdnaDepartmentTheme[] }) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Color System™ · Cognitive hierarchy</p>
      <p style={{ fontSize: '11px', fontFamily: '"Futura PT Book"', marginBottom: 12 }}>
        Department Color → Division Shade → Room Accent → Interactive State → Notification State
      </p>
      <div className="mb-4 flex flex-wrap gap-4">
        <ColorSwatch label="Primary" value={dept.primaryColor} />
        <ColorSwatch label="Secondary" value={dept.secondaryColor} />
        <ColorSwatch label="Accent" value={dept.accentColor} />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {themes.map((d) => (
          <div key={d.departmentId} className="mb-1 flex items-center gap-2 text-[9px]" style={{ fontFamily: 'monospace' }}>
            <span className="w-32 truncate">{d.officialName}</span>
            <span className="h-3 w-8 rounded" style={{ background: d.primaryColor }} />
            <span className="h-3 w-8 rounded" style={{ background: d.secondaryColor }} />
            <span className="h-3 w-8 rounded" style={{ background: d.accentColor }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ ...hqLabel }}>{label}</p>
      <div className="mt-1 h-10 w-20 rounded" style={{ background: value, border: '1px solid rgba(0,0,0,0.1)' }} />
      <p style={{ fontSize: '9px', fontFamily: 'monospace' }}>{value}</p>
    </div>
  );
}

function NavigationPanel({
  rules,
  nav,
}: {
  rules: ReturnType<typeof useStudioOsDesignDnaState>['view']['navigationRules'];
  nav: ReturnType<typeof useStudioOsDesignDnaState>['view']['sceneProfile']['navigationContext'];
}) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Cognitive Navigation Engine™</p>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <NavSwatch label="Department" value={nav.departmentColor} />
        <NavSwatch label="Division" value={nav.divisionShade} />
        <NavSwatch label="Room Accent" value={nav.roomAccent} />
      </div>
      {rules.map((r) => (
        <div key={r.ruleId} className="mb-2 rounded bg-white/45 px-3 py-2">
          <p style={{ ...hqLabel }}>{r.layer}</p>
          <p style={{ fontSize: '10px', fontFamily: '"Futura PT Book"' }}>{r.description}</p>
          <p style={{ fontSize: '9px', color: HQ.gray }}>{r.derivation}</p>
        </div>
      ))}
    </section>
  );
}

function NavSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded p-2" style={{ background: `${value}18`, border: `1px solid ${value}44` }}>
      <p style={{ ...hqLabel }}>{label}</p>
      <p style={{ fontSize: '10px', fontFamily: 'monospace' }}>{value}</p>
    </div>
  );
}

function MotionPanel({
  motion,
  animation,
  dept,
}: {
  motion: ReturnType<typeof useStudioOsDesignDnaState>['view']['motionPresets'];
  animation: ReturnType<typeof useStudioOsDesignDnaState>['view']['animationHooks'];
  dept: DdnaDepartmentTheme;
}) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Motion & Animation Engine™ · {dept.motionStyle}</p>
      {motion.map((m) => (
        <div key={m.presetId} className="mb-3 rounded bg-white/45 p-3">
          <p style={{ ...hqLabel }}>{m.name}</p>
          <p style={{ fontSize: '10px' }}>Enter: {m.entrance} · Hover: {m.hover}</p>
        </div>
      ))}
      <p style={{ ...hqLabel, marginTop: 12 }}>Animation Hooks</p>
      {animation.map((h) => (
        <div key={h.hookId} className="mb-1 text-[10px]" style={{ fontFamily: 'monospace' }}>
          {h.name} · {h.trigger} · {h.durationMs}ms · {h.layerTarget}
        </div>
      ))}
    </section>
  );
}

function IconPanel({
  treatments,
  dept,
}: {
  treatments: ReturnType<typeof useStudioOsDesignDnaState>['view']['iconTreatments'];
  dept: DdnaDepartmentTheme;
}) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Icon System™ · {dept.iconTreatment}</p>
      {treatments.map((t) => (
        <div key={t.treatmentId} className="mb-3 rounded bg-white/45 p-3">
          <p style={{ ...hqLabel }}>{t.name} ({t.style})</p>
          <p style={{ fontSize: '10px' }}>{t.colorRule}</p>
        </div>
      ))}
    </section>
  );
}

function LightingPanel({
  presets,
  glass,
  dept,
}: {
  presets: ReturnType<typeof useStudioOsDesignDnaState>['view']['lightingPresets'];
  glass: ReturnType<typeof useStudioOsDesignDnaState>['view']['glassMaterials'];
  dept: DdnaDepartmentTheme;
}) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Lighting & Glass Material Engine™</p>
      <p style={{ fontSize: '11px', marginBottom: 8 }}>Ambient: {dept.ambientLighting} · Glass: {dept.glassTint}</p>
      {presets.map((p) => (
        <div key={p.presetId} className="mb-2 rounded p-3" style={{ background: p.horizonGradient }}>
          <p style={{ ...hqLabel, color: HQ.black }}>{p.name}</p>
        </div>
      ))}
      <p style={{ ...hqLabel, marginTop: 12 }}>Glass Materials</p>
      {glass.map((g) => (
        <div key={g.materialId} className="mb-2 rounded px-3 py-2" style={{ background: g.background, backdropFilter: `blur(${g.backdropBlur})` }}>
          <p style={{ ...hqLabel }}>{g.name}</p>
          <p style={{ fontSize: '9px' }}>{g.legibilityRule}</p>
        </div>
      ))}
    </section>
  );
}

function CssInheritancePanel({ cssPreview, constitutionLocked }: { cssPreview: string; constitutionLocked: boolean }) {
  return (
    <section className="ddna-panel">
      <p style={{ ...hqLabel }}>Scene Inheritance Output · resolveDesignDnaSceneProfile()</p>
      <p style={{ fontSize: '10px', marginBottom: 8 }}>
        Constitution {constitutionLocked ? 'locked' : 'open'} — inject CSS variables on [data-ddna-scene] hosts
      </p>
      <pre className="max-h-48 overflow-auto rounded bg-black/5 p-3 text-[9px]" style={{ fontFamily: 'monospace' }}>
        {cssPreview}
      </pre>
    </section>
  );
}

function DdnaStyles() {
  return (
    <style>{`
      .ddna-panel {
        background: rgba(255,255,255,0.55);
        backdrop-filter: blur(12px);
        border: 1.3px solid rgba(0,0,0,0.08);
        border-radius: 12px;
        padding: 16px;
      }
      .ddna-btn {
        font-family: "Futura PT Medium", sans-serif;
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        padding: 8px 14px;
        border: 1.3px solid rgba(0,0,0,0.2);
        background: rgba(255,255,255,0.6);
        border-radius: 2px;
        cursor: pointer;
      }
      .ddna-btn.primary { background: rgba(255,255,255,0.85); }
      .ddna-dept-card {
        background: rgba(255,255,255,0.5);
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 10px;
        padding: 12px;
        cursor: pointer;
        transition: box-shadow 250ms ease;
      }
      .ddna-dept-wash {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
    `}</style>
  );
}
