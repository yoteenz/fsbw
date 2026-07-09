import { Link, useParams } from 'react-router-dom';
import {
  XBD_DEMO_BRAND_LABELS,
  XBD_PLAYGROUND_ASSET_LABELS,
  XBD_PLAYGROUND_ASSET_TYPES,
  XBD_ROOM_PATH_LABELS,
  advanceDiscoveryStep,
  generateElevationReport,
  runDiscoverySynthesis,
  updateDiscoveryInputs,
  type XbdBrandDnaRecord,
  type XbdReadyView,
  type XbdRoomPath,
} from '../../../../studio-os-core/genesis';
import { useBrandDiscoveryEngineState } from '../../../../hooks/useBrandDiscoveryEngineState';
import { useBrandIntelligence } from '../../../../hooks/useBrandIntelligence';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/brand-discovery-engine';

const WING_NAV: { slug: XbdRoomPath; label: string; ring: 'discovery' | 'intelligence' | 'applications' }[] = [
  { slug: 'brand-discovery-engine', label: 'Brand Discovery Arrival', ring: 'discovery' },
  { slug: 'brand-discovery', label: 'Brand Discovery Flow', ring: 'discovery' },
  { slug: 'brand-dna', label: 'Brand DNA Registry™', ring: 'discovery' },
  { slug: 'audience-discovery', label: 'Audience Discovery', ring: 'discovery' },
  { slug: 'brand-intelligence', label: 'Brand Intelligence Layer™', ring: 'intelligence' },
  { slug: 'brand-consistency', label: 'Brand Consistency Checker™', ring: 'intelligence' },
  { slug: 'brand-elevation', label: 'Brand Elevation Engine™', ring: 'intelligence' },
  { slug: 'packaging-intelligence', label: 'Packaging Strategy', ring: 'intelligence' },
  { slug: 'content-intelligence', label: 'Content Direction', ring: 'intelligence' },
  { slug: 'brand-applications', label: 'Brand Application Engine™', ring: 'applications' },
  { slug: 'brand-playground', label: 'Brand DNA Playground', ring: 'applications' },
];

export function BrandDiscoveryEngineWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, setPlayground, refresh } = useBrandDiscoveryEngineState();
  const activeSlug = (roomSlug ?? 'brand-discovery-engine') as XbdRoomPath;
  const brand = view.activeBrand;
  const colors = brand.colorSystem;

  const switchBrand = (brandId: string) => setPlayground({ brandId });

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{ background: colors.background }}
      data-xbd-brand={brand.brandId}
    >
      <HqExperienceStyles />
      <XbdStyles brand={brand} />

      <header
        className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ ...hqGlassPanel, borderColor: `${colors.primary}22`, background: `${colors.background}ee` }}
      >
        <div>
          <p style={{ ...hqLabel, color: colors.primary, margin: 0 }}>BRAND DISCOVERY ENGINE™</p>
          <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, margin: '4px 0 0', color: colors.textPrimary }}>
            {XBD_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/experience-engine" className="xbd-btn">
            Experience Engine →
          </Link>
          <Link to="/admin/studio/experience-runtime" className="xbd-btn">
            Experience Runtime →
          </Link>
          <button type="button" className="xbd-btn primary" style={{ borderColor: colors.primary, color: colors.primary }} onClick={refresh}>
            Refresh
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white/20 p-3 lg:block" style={{ borderColor: `${colors.primary}15` }}>
          {(['discovery', 'intelligence', 'applications'] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p style={{ ...hqLabel, marginBottom: 6, color: colors.textSecondary }}>{ring}</p>
              {WING_NAV.filter((r) => r.ring === ring).map((room) => (
                <Link
                  key={room.slug}
                  to={`${BASE}/${room.slug}`}
                  className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
                  style={{
                    fontFamily: brand.typography.labelFont,
                    color: activeSlug === room.slug ? colors.textPrimary : colors.textSecondary,
                    background: activeSlug === room.slug ? `${colors.primary}10` : 'transparent',
                    borderLeft: activeSlug === room.slug ? `2px solid ${colors.primary}` : '2px solid transparent',
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
            <ArrivalPanel view={view} brand={brand} switchBrand={switchBrand} />

            {(activeSlug === 'brand-discovery' || activeSlug === 'brand-discovery-engine') && (
              <DiscoveryFlowPanel view={view} brand={brand} onRefresh={refresh} />
            )}
            {(activeSlug === 'brand-dna' || activeSlug === 'brand-discovery-engine') && (
              <RegistryPanel view={view} brand={brand} />
            )}
            {(activeSlug === 'audience-discovery' || activeSlug === 'brand-discovery-engine') && (
              <AudiencePanel view={view} brand={brand} />
            )}
            {(activeSlug === 'brand-intelligence' || activeSlug === 'brand-consistency') && (
              <IntelligencePanel view={view} brand={brand} />
            )}
            {activeSlug === 'brand-elevation' && <ElevationPanel view={view} brand={brand} onRefresh={refresh} />}
            {activeSlug === 'packaging-intelligence' && <PackagingPanel view={view} brand={brand} />}
            {activeSlug === 'content-intelligence' && <ContentPanel view={view} brand={brand} />}
            {activeSlug === 'brand-applications' && <ApplicationsPanel view={view} brand={brand} />}
            {(activeSlug === 'brand-playground' || activeSlug === 'brand-discovery-engine') && (
              <PlaygroundPanel view={view} brand={brand} switchBrand={switchBrand} setPlayground={setPlayground} />
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <ConsistencyInspector view={view} brand={brand} />
          </aside>
        </main>
      </div>
    </div>
  );
}

function ArrivalPanel({
  view,
  brand,
  switchBrand,
}: {
  view: XbdReadyView;
  brand: XbdBrandDnaRecord;
  switchBrand: (id: string) => void;
}) {
  return (
    <section className="xbd-panel" style={{ borderLeft: `3px solid ${brand.colorSystem.primary}` }}>
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Brand DNA™ · Strategic Intelligence</p>
      <p style={{ fontFamily: brand.typography.bodyFont, fontSize: brand.typography.bodySize, color: brand.colorSystem.textPrimary, lineHeight: 1.6 }}>
        {view.orbNote}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {view.demoBrandIds.map((id) => (
          <button
            key={id}
            type="button"
            className="xbd-btn"
            style={{
              borderColor: view.playground.brandId === id ? brand.colorSystem.primary : `${brand.colorSystem.primary}33`,
              background: view.playground.brandId === id ? `${brand.colorSystem.primary}12` : 'transparent',
            }}
            onClick={() => switchBrand(id)}
          >
            {XBD_DEMO_BRAND_LABELS[id]}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '9px', marginTop: 8, color: brand.colorSystem.textSecondary }}>
        Active: {brand.brandName} · Luxury {brand.luxuryLevel}/100 · {brand.status}
      </p>
    </section>
  );
}

function DiscoveryFlowPanel({
  view,
  brand,
  onRefresh,
}: {
  view: XbdReadyView;
  brand: XbdBrandDnaRecord;
  onRefresh: () => void;
}) {
  const session = view.discoverySession;
  const steps = ['intake', 'interview', 'synthesis', 'review', 'complete'];

  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Brand Discovery Flow · Orb-led</p>
      <p style={{ fontSize: '11px', color: brand.colorSystem.textSecondary, fontStyle: 'italic' }}>
        Orb: "{session.orbPrompt}"
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {steps.map((s, i) => (
          <span
            key={s}
            className="rounded px-2 py-1 text-[9px] uppercase"
            style={{
              background: i <= session.stepIndex ? `${brand.colorSystem.primary}18` : `${brand.colorSystem.textSecondary}11`,
              color: i <= session.stepIndex ? brand.colorSystem.textPrimary : brand.colorSystem.textSecondary,
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="text-[10px]">
          Mission
          <input
            className="mt-1 w-full rounded border px-2 py-1 text-[11px]"
            defaultValue={session.inputs.founderAnswers.mission ?? ''}
            onBlur={(e) => {
              updateDiscoveryInputs({ founderAnswers: { ...session.inputs.founderAnswers, mission: e.target.value } });
              onRefresh();
            }}
          />
        </label>
        <label className="text-[10px]">
          Audience
          <input
            className="mt-1 w-full rounded border px-2 py-1 text-[11px]"
            defaultValue={session.inputs.audienceDetails}
            onBlur={(e) => {
              updateDiscoveryInputs({ audienceDetails: e.target.value });
              onRefresh();
            }}
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="xbd-btn" onClick={() => { advanceDiscoveryStep(); onRefresh(); }}>
          Next Step
        </button>
        <button type="button" className="xbd-btn primary" style={{ borderColor: brand.colorSystem.primary }} onClick={() => { runDiscoverySynthesis(); onRefresh(); }}>
          Synthesize Brand DNA
        </button>
      </div>
      {session.generatedDirections ? (
        <div className="mt-4 grid gap-2 text-[10px] sm:grid-cols-2">
          {Object.entries(session.generatedDirections).map(([k, v]) => (
            <div key={k} className="rounded p-2" style={{ background: `${brand.colorSystem.primary}08` }}>
              <strong>{k}</strong>
              <p style={{ marginTop: 4 }}>{v}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function RegistryPanel({ view, brand }: { view: XbdReadyView; brand: XbdBrandDnaRecord }) {
  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Brand DNA Registry™</p>
      <div className="mt-2 space-y-2">
        {view.brands.map((b) => (
          <div key={b.brandId} className="rounded border p-3 text-[10px]" style={{ borderColor: `${brand.colorSystem.primary}22` }}>
            <strong>{b.brandName}</strong>
            <span style={{ marginLeft: 8, color: brand.colorSystem.textSecondary }}>{b.status}</span>
            <p style={{ marginTop: 4 }}>{b.mission}</p>
            <p style={{ fontSize: '9px', color: brand.colorSystem.textSecondary }}>{b.positioning}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AudiencePanel({ view, brand }: { view: XbdReadyView; brand: XbdBrandDnaRecord }) {
  const a = brand.audienceProfile;
  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Audience Discovery Engine™</p>
      <p style={{ fontSize: '11px' }}>{view.directions.audienceProfile}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[10px]">
        <div><strong>Primary</strong><p>{a.primaryAudience}</p></div>
        <div><strong>Psychology</strong><p>{a.psychology}</p></div>
        <div><strong>Desire</strong><p>{a.customerDesire}</p></div>
        <div><strong>Signals</strong><p>{a.identitySignals.join(', ')}</p></div>
      </div>
    </section>
  );
}

function IntelligencePanel({ view, brand }: { view: XbdReadyView; brand: XbdBrandDnaRecord }) {
  const intel = view.intelligencePreview;
  const { score } = useBrandIntelligence(brand);
  const preview = score(view.playground.sampleArtifactSummary, view.playground.assetType);

  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Brand Intelligence Layer™</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3 text-[10px]">
        <Flag label="Matches DNA" ok={intel.matchesBrandDna} brand={brand} />
        <Flag label="Strengthens" ok={intel.strengthensBrand} brand={brand} />
        <Flag label="Audience fit" ok={intel.attractsAudience} brand={brand} />
        <Flag label="Premium enough" ok={intel.feelsPremiumEnough} brand={brand} />
        <Flag label="Positioning" ok={intel.supportsPositioning} brand={brand} />
        <Flag label="Contradicts" ok={!intel.contradictsBrand} brand={brand} />
      </div>
      <ul className="mt-3 list-inside list-disc text-[9px]">
        {intel.rationale.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p style={{ fontSize: '9px', marginTop: 8, color: brand.colorSystem.textSecondary }}>
        Live score: {preview.overallScore}/100 · {preview.status}
      </p>
    </section>
  );
}

function Flag({ label, ok, brand }: { label: string; ok: boolean; brand: XbdBrandDnaRecord }) {
  return (
    <div className="rounded p-2" style={{ background: ok ? `${brand.colorSystem.primary}10` : `${brand.colorSystem.textSecondary}11` }}>
      {label}: {ok ? '✓' : '—'}
    </div>
  );
}

function ElevationPanel({
  view,
  brand,
  onRefresh,
}: {
  view: XbdReadyView;
  brand: XbdBrandDnaRecord;
  onRefresh: () => void;
}) {
  const report = view.elevationReport;
  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Brand Elevation Engine™</p>
      <p style={{ fontSize: '11px' }}>Health: {report.overallHealth}/100</p>
      <button
        type="button"
        className="xbd-btn primary mt-2"
        style={{ borderColor: brand.colorSystem.primary }}
        onClick={() => { generateElevationReport(brand.brandId); onRefresh(); }}
      >
        Generate Report
      </button>
      <div className="mt-3 space-y-2">
        {report.findings.map((f) => (
          <div key={f.findingId} className="rounded p-2 text-[10px]" style={{ borderLeft: `3px solid ${brand.colorSystem.primary}` }}>
            <strong>{f.category}</strong> · {f.severity}
            <p>{f.summary}</p>
            <p style={{ fontSize: '9px', color: brand.colorSystem.textSecondary }}>{f.recommendation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PackagingPanel({ view, brand }: { view: XbdReadyView; brand: XbdBrandDnaRecord }) {
  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Packaging Strategy Engine™</p>
      <p style={{ fontSize: '11px' }}>{view.directions.packagingDirection}</p>
      <p style={{ fontSize: '10px', marginTop: 8 }}>{brand.packagingStyle}</p>
    </section>
  );
}

function ContentPanel({ view, brand }: { view: XbdReadyView; brand: XbdBrandDnaRecord }) {
  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Content Direction Engine™</p>
      <p style={{ fontSize: '11px' }}>{view.directions.contentDirection}</p>
      <p style={{ fontSize: '10px', marginTop: 8 }}>Website: {view.directions.websiteDirection}</p>
      <p style={{ fontSize: '10px', marginTop: 4 }}>HQ: {view.directions.headquartersDirection}</p>
      <p style={{ fontSize: '10px', fontStyle: 'italic', marginTop: 8 }}>"{brand.writingVoice.sampleLine}"</p>
    </section>
  );
}

function ApplicationsPanel({ view, brand }: { view: XbdReadyView; brand: XbdBrandDnaRecord }) {
  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel }}>Brand Application Engine™</p>
      <p style={{ fontSize: '10px', marginBottom: 8 }}>Strategic Brand DNA available to downstream Studio OS systems:</p>
      <ul className="space-y-1 text-[9px]">
        {view.consumerBindings.map((c) => (
          <li key={c.system} className="rounded px-2 py-1" style={{ background: `${brand.colorSystem.primary}08` }}>
            {c.status}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PlaygroundPanel({
  view,
  brand,
  switchBrand,
  setPlayground,
}: {
  view: XbdReadyView;
  brand: XbdBrandDnaRecord;
  switchBrand: (id: string) => void;
  setPlayground: (p: Partial<{ brandId: string; assetType: typeof view.playground.assetType }>) => void;
}) {
  const asset = view.playgroundAsset;
  return (
    <section className="xbd-panel">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Brand DNA Playground</p>
      <p style={{ fontSize: '11px', color: brand.colorSystem.textSecondary, marginBottom: 12 }}>
        Same asset type — different Brand DNA. Switch brand without redesigning from scratch.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {view.demoBrandIds.map((id) => (
          <button key={id} type="button" className="xbd-btn" onClick={() => switchBrand(id)}>
            {XBD_DEMO_BRAND_LABELS[id]}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1">
        {XBD_PLAYGROUND_ASSET_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className="xbd-btn text-[9px]"
            style={{
              borderColor: view.playground.assetType === t ? brand.colorSystem.primary : undefined,
            }}
            onClick={() => setPlayground({ assetType: t })}
          >
            {XBD_PLAYGROUND_ASSET_LABELS[t]}
          </button>
        ))}
      </div>
      <div
        className="overflow-hidden rounded-xl border p-6"
        style={{
          borderColor: `${asset.colorAccent}44`,
          background: `linear-gradient(135deg, ${brand.colorSystem.background}, ${asset.colorAccent}12)`,
          color: brand.colorSystem.textPrimary,
        }}
      >
        <p style={{ fontFamily: brand.typography.labelFont, fontSize: brand.typography.labelSize, textTransform: 'uppercase', letterSpacing: '0.12em', color: asset.colorAccent }}>
          {XBD_PLAYGROUND_ASSET_LABELS[asset.assetType]}
        </p>
        <p style={{ fontFamily: brand.typography.displayFont, fontSize: brand.typography.displaySize, marginTop: 8 }}>
          {asset.headline}
        </p>
        <p style={{ fontFamily: brand.typography.bodyFont, fontSize: brand.typography.bodySize, marginTop: 8, lineHeight: 1.5 }}>
          {asset.body}
        </p>
        <p style={{ fontSize: '10px', marginTop: 12, color: brand.colorSystem.textSecondary }}>{asset.visualCue}</p>
      </div>
    </section>
  );
}

function ConsistencyInspector({ view, brand }: { view: XbdReadyView; brand: XbdBrandDnaRecord }) {
  const c = view.consistencyPreview;
  const scores = [
    ['Brand', c.brandAlignment],
    ['Voice', c.voiceAlignment],
    ['Visual', c.visualAlignment],
    ['Audience', c.audienceFit],
    ['Luxury', c.luxuryFit],
    ['Positioning', c.positioningFit],
    ['Differentiation', c.differentiation],
  ] as const;

  return (
    <section className="xbd-panel sticky top-4">
      <p style={{ ...hqLabel, color: brand.colorSystem.primary }}>Brand Consistency Checker™</p>
      <p style={{ fontSize: '20px', fontFamily: brand.typography.displayFont, margin: '8px 0' }}>
        {c.overallScore}/100
      </p>
      <p style={{ fontSize: '10px', textTransform: 'uppercase', color: c.status === 'pass' ? brand.colorSystem.primary : brand.colorSystem.textSecondary }}>
        {c.status} · threshold {c.passThreshold}
      </p>
      <div className="mt-3 space-y-2">
        {scores.map(([label, val]) => (
          <div key={label}>
            <div className="flex justify-between text-[9px]">
              <span>{label}</span>
              <span>{val}</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-black/10">
              <div className="h-1 rounded-full" style={{ width: `${val}%`, background: brand.colorSystem.primary }} />
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-4 list-inside list-disc text-[9px]">
        {c.improvementNotes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </section>
  );
}

function XbdStyles({ brand }: { brand: XbdBrandDnaRecord }) {
  return (
    <style>{`
      [data-xbd-brand] .xbd-panel {
        border-radius: 12px;
        border: 1px solid ${brand.colorSystem.primary}18;
        background: ${brand.colorSystem.background}cc;
        backdrop-filter: blur(12px);
        padding: 16px;
      }
      [data-xbd-brand] .xbd-btn {
        border: 1px solid ${brand.colorSystem.primary}33;
        background: transparent;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-family: ${brand.typography.labelFont};
        cursor: pointer;
      }
      [data-xbd-brand] .xbd-btn.primary {
        background: ${brand.colorSystem.primary}10;
      }
    `}</style>
  );
}
