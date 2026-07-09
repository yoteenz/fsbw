import { Link, useParams } from 'react-router-dom';
import {
  XEE_DEMO_BRAND_LABELS,
  XEE_ROOM_PATH_LABELS,
  XEE_SHARED_SCENE_ID,
  type XeeBrandDna,
  type XeeRoomPath,
} from '../../../../studio-os-core/genesis';
import { useExperienceEngineDnaState } from '../../../../hooks/useExperienceEngineDnaState';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/experience-engine';

const WING_NAV: { slug: XeeRoomPath; label: string; ring: 'engine' | 'registries' | 'playground' }[] = [
  { slug: 'experience-engine', label: 'Engine Arrival', ring: 'engine' },
  { slug: 'brand-dna', label: 'Brand Registry™', ring: 'registries' },
  { slug: 'department-dna', label: 'Department Registry™', ring: 'registries' },
  { slug: 'scene-dna', label: 'Scene Registry™', ring: 'registries' },
  { slug: 'component-dna', label: 'Component Registry™', ring: 'registries' },
  { slug: 'motion-dna', label: 'Motion Registry™', ring: 'registries' },
  { slug: 'interaction-dna', label: 'Interaction Registry™', ring: 'registries' },
  { slug: 'theme-playground', label: 'Experience Playground™', ring: 'playground' },
];

export function ExperienceEngineDnaWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, setPlayground, refresh } = useExperienceEngineDnaState();
  const activeSlug = (roomSlug ?? 'experience-engine') as XeeRoomPath;
  const profile = view.experienceProfile;
  const brand = profile.brand;

  const switchBrand = (brandId: string) => {
    setPlayground({
      brandId,
      departmentId: 'headquarters',
      sceneId: XEE_SHARED_SCENE_ID,
      motionDnaId: `motion-${brandId}`,
      orbPersonality: 'brand-default',
    });
  };

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{ background: profile.cssVariables['--xee-ambient-gradient'] }}
      data-xee-scene={profile.scene.sceneId}
      data-xee-brand={profile.brandId}
    >
      <HqExperienceStyles />
      <XeeStyles />
      <div className="xee-dept-wash" aria-hidden style={{ background: profile.cssVariables['--xee-dept-wash'] }} />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ ...hqGlassPanel, borderColor: `${brand.colorSystem.primary}22` }}>
        <div>
          <p style={{ ...hqLabel, color: brand.colorSystem.primary, margin: 0 }}>EXPERIENCE ENGINE™</p>
          <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, margin: '4px 0 0', color: brand.colorSystem.textPrimary }}>
            {XEE_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/design-dna" className="xee-btn">
            Studio OS Design DNA →
          </Link>
          <button type="button" className="xee-btn primary" style={{ borderColor: brand.colorSystem.primary, color: brand.colorSystem.primary }} onClick={refresh}>
            Refresh Engine
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white/20 p-3 lg:block" style={{ borderColor: `${brand.colorSystem.primary}15` }}>
          {(['engine', 'registries', 'playground'] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p style={{ ...hqLabel, marginBottom: 6, color: brand.colorSystem.textSecondary }}>{ring}</p>
              {WING_NAV.filter((r) => r.ring === ring).map((room) => (
                <Link
                  key={room.slug}
                  to={`${BASE}/${room.slug}`}
                  className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
                  style={{
                    fontFamily: brand.typography.labelFont,
                    fontSize: brand.typography.labelSize,
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

        <main className="flex flex-1 flex-col gap-4 p-4">
          <section className="xee-panel" style={{ borderLeft: `3px solid ${brand.colorSystem.primary}` }}>
            <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Experience Generator</p>
            <p style={{ fontFamily: brand.typography.bodyFont, fontSize: brand.typography.bodySize, color: brand.colorSystem.textPrimary, lineHeight: 1.6 }}>{view.orbNote}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {view.demoBrandIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="xee-btn"
                  style={{
                    borderColor: view.playground.brandId === id ? brand.colorSystem.primary : brand.glassStyle.border,
                    background: view.playground.brandId === id ? `${brand.colorSystem.primary}12` : brand.glassStyle.panelBackground,
                    color: brand.colorSystem.textPrimary,
                  }}
                  onClick={() => switchBrand(id)}
                >
                  {XEE_DEMO_BRAND_LABELS[id]}
                </button>
              ))}
            </div>
          </section>

          {activeSlug === 'experience-engine' && <ArrivalPanel view={view} onSwitchBrand={switchBrand} />}
          {activeSlug === 'brand-dna' && <BrandRegistryPanel brands={view.brands} activeId={view.playground.brandId} onSelect={switchBrand} textColor={brand.colorSystem.textPrimary} />}
          {activeSlug === 'department-dna' && <DepartmentPanel departments={view.departments} brand={brand} />}
          {activeSlug === 'scene-dna' && <ScenePanel scenes={view.scenes} />}
          {activeSlug === 'component-dna' && <ComponentPanel components={view.components} brand={brand} />}
          {activeSlug === 'motion-dna' && <MotionPanel motions={view.motions} brand={brand} />}
          {activeSlug === 'interaction-dna' && <InteractionPanel interactions={view.interactions} brand={brand} />}
          {(activeSlug === 'theme-playground' || activeSlug === 'experience-engine') && (
            <ExperiencePlayground
              view={view}
              setPlayground={setPlayground}
              switchBrand={switchBrand}
            />
          )}

          <CssPanel cssPreview={view.cssPreview} textColor={brand.colorSystem.textSecondary} />
        </main>
      </div>
    </div>
  );
}

function ArrivalPanel({
  view,
  onSwitchBrand,
}: {
  view: ReturnType<typeof useExperienceEngineDnaState>['view'];
  onSwitchBrand: (id: string) => void;
}) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel }}>Layered inheritance</p>
      <p style={{ fontSize: '13px', lineHeight: 1.65 }}>
        Studio OS never hardcodes brand styles. Every experience generates from Brand DNA → Department DNA → Scene DNA →
        Component DNA → Motion DNA → Interaction DNA.
      </p>
      <p style={{ ...hqLabel, marginTop: 12 }}>Demonstration brands</p>
      <div className="flex flex-wrap gap-2">
        {view.demoBrandIds.map((id) => (
          <button key={id} type="button" className="xee-btn" onClick={() => onSwitchBrand(id)}>
            {XEE_DEMO_BRAND_LABELS[id]}
          </button>
        ))}
      </div>
    </section>
  );
}

function BrandRegistryPanel({
  brands,
  activeId,
  onSelect,
  textColor,
}: {
  brands: XeeBrandDna[];
  activeId: string;
  onSelect: (id: string) => void;
  textColor: string;
}) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel }}>Brand Registry™ · {brands.length} profiles</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <button
            key={b.brandId}
            type="button"
            className="xee-dept-card text-left"
            style={{ borderColor: activeId === b.brandId ? b.colorSystem.primary : undefined }}
            onClick={() => onSelect(b.brandId)}
          >
            <div className="mb-2 flex gap-2">
              <span className="h-4 w-4 rounded-full" style={{ background: b.colorSystem.primary }} />
              <span className="h-4 w-4 rounded-full" style={{ background: b.colorSystem.secondary }} />
              <span className="h-4 w-4 rounded-full" style={{ background: b.colorSystem.accent }} />
            </div>
            <p style={{ ...hqLabel, color: b.colorSystem.primary }}>{b.officialName}</p>
            <p style={{ fontSize: '10px', color: textColor, marginTop: 4 }}>{b.identity.philosophy}</p>
            <p style={{ fontSize: '9px', marginTop: 6 }}>Voice: {b.writingVoice.tone}</p>
            <p style={{ fontSize: '9px' }}>Orb: {b.orbOverrides.personality}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function DepartmentPanel({ departments, brand }: { departments: ReturnType<typeof useExperienceEngineDnaState>['view']['departments']; brand: XeeBrandDna }) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Department Registry™ · {brand.officialName}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {departments.map((d) => (
          <div key={d.departmentDnaId} className="rounded-lg p-3" style={{ background: brand.glassStyle.panelBackground, border: brand.glassStyle.border }}>
            <p style={{ ...hqLabel, color: d.departmentColor }}>{d.officialName}</p>
            <p style={{ fontSize: '10px', color: brand.colorSystem.textSecondary }}>{d.ambientMood} · {d.animationPersonality}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScenePanel({ scenes }: { scenes: ReturnType<typeof useExperienceEngineDnaState>['view']['scenes'] }) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel }}>Scene Registry™</p>
      {scenes.map((s) => (
        <div key={s.sceneId} className="mt-2 rounded-lg bg-white/40 p-3">
          <p style={{ ...hqLabel }}>{s.officialName}</p>
          <p style={{ fontSize: '10px' }}>Template: {s.layoutTemplateId} · Shared: {s.sharedAcrossBrands ? 'yes' : 'no'}</p>
          <ul className="mt-2 list-inside list-disc text-[9px]">
            {s.environmentalRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function ComponentPanel({ components, brand }: { components: ReturnType<typeof useExperienceEngineDnaState>['view']['components']; brand: XeeBrandDna }) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel }}>Component Registry™ · {brand.officialName}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {components.map((c) => (
          <div key={c.componentDnaId} className="rounded p-2 text-[10px]" style={{ background: brand.glassStyle.panelBackground }}>
            <strong>{c.officialName}</strong> — {c.variant}
          </div>
        ))}
      </div>
    </section>
  );
}

function MotionPanel({ motions, brand }: { motions: ReturnType<typeof useExperienceEngineDnaState>['view']['motions']; brand: XeeBrandDna }) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel }}>Motion Registry™</p>
      {motions.map((m) => (
        <div key={m.motionDnaId} className="mb-2 rounded p-3" style={{ background: brand.glassStyle.panelBackground }}>
          <p style={{ ...hqLabel }}>{m.presetName}</p>
          <p style={{ fontSize: '10px' }}>{m.entrance} · {m.hover}</p>
        </div>
      ))}
    </section>
  );
}

function InteractionPanel({ interactions, brand }: { interactions: ReturnType<typeof useExperienceEngineDnaState>['view']['interactions']; brand: XeeBrandDna }) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel }}>Interaction Registry™</p>
      {interactions.map((i) => (
        <div key={i.interactionDnaId} className="rounded p-3 text-[10px]" style={{ background: brand.glassStyle.panelBackground }}>
          Hover: {i.hover} · Focus: {i.focus} · Approval: {i.approval}
        </div>
      ))}
    </section>
  );
}

function ExperiencePlayground({
  view,
  setPlayground,
  switchBrand,
}: {
  view: ReturnType<typeof useExperienceEngineDnaState>['view'];
  setPlayground: ReturnType<typeof useExperienceEngineDnaState>['setPlayground'];
  switchBrand: (id: string) => void;
}) {
  const p = view.experienceProfile;
  const brand = p.brand;
  const pg = view.playground;

  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Experience Playground™ — same scene template, different Brand DNA</p>
      <p style={{ fontSize: '11px', color: brand.colorSystem.textSecondary, marginBottom: 12 }}>
        Layout anatomy is identical. Only inherited DNA changes — validating multi-brand generation.
      </p>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        <Switcher label="Brand DNA" value={pg.brandId} options={view.demoBrandIds.map((id) => ({ value: id, label: XEE_DEMO_BRAND_LABELS[id] }))} onChange={(v) => switchBrand(v)} brand={brand} />
        <Switcher
          label="Department"
          value={pg.departmentId}
          options={view.departments.map((d) => ({ value: d.departmentId, label: d.officialName }))}
          onChange={(v) => setPlayground({ departmentId: v })}
          brand={brand}
        />
        <Switcher
          label="Scene"
          value={pg.sceneId}
          options={view.scenes.map((s) => ({ value: s.sceneId, label: s.officialName }))}
          onChange={(v) => setPlayground({ sceneId: v })}
          brand={brand}
        />
        <Switcher
          label="Component"
          value={pg.componentId}
          options={view.components.map((c) => ({ value: c.componentId, label: `${c.officialName} (${c.variant})` }))}
          onChange={(v) => setPlayground({ componentId: v })}
          brand={brand}
        />
        <Switcher
          label="Motion"
          value={pg.motionDnaId}
          options={view.motions.map((m) => ({ value: m.motionDnaId, label: m.presetName }))}
          onChange={(v) => setPlayground({ motionDnaId: v })}
          brand={brand}
        />
        <Switcher label="Lighting" value={pg.lightingPreset} options={[{ value: 'brand-default', label: brand.lighting.keyLight }]} onChange={(v) => setPlayground({ lightingPreset: v })} brand={brand} />
        <Switcher label="Material" value={pg.materialId} options={brand.materials.map((m, i) => ({ value: `mat-${i}`, label: m }))} onChange={(v) => setPlayground({ materialId: v })} brand={brand} />
        <Switcher label="Typography" value={pg.typographyScale} options={[{ value: 'brand-default', label: brand.typography.displayFont }]} onChange={(v) => setPlayground({ typographyScale: v })} brand={brand} />
        <Switcher label="Orb Personality" value={pg.orbPersonality} options={[{ value: 'brand-default', label: brand.orbOverrides.personality }]} onChange={(v) => setPlayground({ orbPersonality: v })} brand={brand} />
      </div>

      {/* Fixed scene template — layout never changes */}
      <div
        className="xee-scene-demo overflow-hidden rounded-xl border"
        style={{
          border: brand.glassStyle.border,
          background: brand.glassStyle.panelBackground,
          backdropFilter: `blur(${brand.glassStyle.backdropBlur})`,
          color: brand.colorSystem.textPrimary,
          transition: `all ${brand.motion.timingMs}ms ${brand.motion.easing}`,
        }}
      >
        <div className="flex border-b px-4 py-3" style={{ borderColor: `${brand.colorSystem.primary}22` }} data-xee-layer="executive-header">
          <div className="flex-1">
            <p style={{ fontFamily: brand.typography.labelFont, fontSize: brand.typography.labelSize, textTransform: 'uppercase', letterSpacing: '0.12em', color: brand.colorSystem.primary }}>
              {brand.navigationStyle.breadcrumbStyle}
            </p>
            <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, marginTop: 4 }}>
              {p.department.officialName}
            </p>
          </div>
          <button type="button" className="xee-btn primary" style={{ borderColor: brand.colorSystem.primary, color: brand.colorSystem.primary }}>
            Primary Action
          </button>
        </div>

        <div className="flex min-h-[320px]">
          <aside className="hidden w-44 shrink-0 border-r p-3 sm:block" style={{ borderColor: `${brand.colorSystem.primary}15` }} data-xee-layer="navigation-layer">
            {view.departments.slice(0, 4).map((d) => (
              <div
                key={d.departmentDnaId}
                className="mb-1 rounded px-2 py-1.5 text-[9px] uppercase"
                style={{
                  fontFamily: brand.typography.labelFont,
                  borderLeft: pg.departmentId === d.departmentId ? `2px solid ${d.departmentColor}` : '2px solid transparent',
                  background: pg.departmentId === d.departmentId ? `${d.departmentColor}15` : 'transparent',
                }}
              >
                {d.officialName}
              </div>
            ))}
          </aside>

          <div className="flex flex-1 flex-col p-4" data-xee-layer="hero-environment">
            <div
              className="mb-4 flex min-h-[120px] items-center justify-center rounded-lg border border-dashed"
              style={{ borderColor: `${brand.colorSystem.accent}55`, background: `${brand.colorSystem.primary}08` }}
              data-xee-layer="primary-focal-object"
            >
              <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, textAlign: 'center', padding: '0 16px' }}>
                {p.scene.heroObject}
              </p>
            </div>
            <p style={{ fontFamily: brand.typography.bodyFont, fontSize: brand.typography.bodySize, marginBottom: 16, color: brand.colorSystem.textSecondary }}>
              {brand.writingVoice.sampleGreeting}
            </p>
            <div className="grid gap-3 sm:grid-cols-3" data-xee-layer="capability-panels">
              {p.scene.capabilityPanels.map((cap) => (
                <div
                  key={cap}
                  className="rounded-lg p-3"
                  style={{
                    background: brand.glassStyle.panelStrong,
                    border: pg.componentId === 'capability-card' ? `1px solid ${brand.colorSystem.accent}` : brand.glassStyle.border,
                    boxShadow: pg.componentId === 'capability-card' ? `0 0 0 1px ${brand.colorSystem.primary}22` : undefined,
                  }}
                >
                  <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>{cap}</p>
                  <p style={{ fontSize: '9px', marginTop: 4, color: brand.colorSystem.textSecondary }}>{brand.materials[0]} · {deptLabel(p.department.ambientMood)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t px-4 py-2 text-[9px] uppercase" style={{ borderColor: `${brand.colorSystem.primary}15`, color: brand.colorSystem.textSecondary }} data-xee-layer="footer">
          <span>{p.interaction.approval}</span>
          <span
            className="rounded-full px-3 py-1"
            style={{ background: `${brand.orbOverrides.glowColor}33`, color: brand.colorSystem.textPrimary }}
            data-xee-layer="orb-layer"
          >
            Orb: {brand.orbOverrides.variant}
          </span>
        </footer>
      </div>
    </section>
  );
}

function deptLabel(s: string) {
  return s;
}

function Switcher({
  label,
  value,
  options,
  onChange,
  brand,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  brand: XeeBrandDna;
}) {
  return (
    <label className="block text-[9px] uppercase" style={{ fontFamily: brand.typography.labelFont, color: brand.colorSystem.textSecondary }}>
      {label}
      <select
        className="mt-1 w-full rounded border px-2 py-1.5 text-[10px]"
        style={{ background: brand.glassStyle.panelBackground, border: brand.glassStyle.border, color: brand.colorSystem.textPrimary }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CssPanel({ cssPreview, textColor }: { cssPreview: string; textColor: string }) {
  return (
    <section className="xee-panel">
      <p style={{ ...hqLabel, color: textColor }}>resolveExperienceProfile() output</p>
      <pre className="max-h-40 overflow-auto rounded bg-black/5 p-3 text-[9px]" style={{ fontFamily: 'monospace' }}>
        {cssPreview}
      </pre>
    </section>
  );
}

function XeeStyles() {
  return (
    <style>{`
      .xee-panel {
        background: var(--xee-glass-panel, rgba(255,255,255,0.55));
        backdrop-filter: blur(var(--xee-glass-blur, 12px));
        border: var(--xee-glass-border, 1.3px solid rgba(0,0,0,0.12));
        border-radius: 12px;
        padding: 16px;
      }
      .xee-btn {
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
      }
      .xee-dept-card {
        background: rgba(255,255,255,0.5);
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 10px;
        padding: 12px;
        cursor: pointer;
      }
      .xee-dept-wash {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
    `}</style>
  );
}
