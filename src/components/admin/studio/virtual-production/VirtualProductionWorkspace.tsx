import type { ShotRow } from '../../../../services/studio/virtualProduction/api';
import type { VirtualProductionMode } from '../../../../studio-os-core/virtual-production';
import './virtual-production.css';

const TABS = [
  'overview',
  'canon',
  'story',
  'storyboard',
  'shots',
  'production',
  'qc',
  'edit',
  'deliverables',
  'history',
] as const;

type Tab = (typeof TABS)[number];

function qcLabel(qcSummary: Record<string, unknown>): string {
  const overall = String(qcSummary.overall ?? 'not_reviewed');
  return overall.replace(/_/g, ' ').toUpperCase();
}

function qcClass(qcSummary: Record<string, unknown>): string {
  const overall = String(qcSummary.overall ?? '');
  if (overall.includes('fail')) return 'vp-qc-fail';
  if (overall.includes('warning')) return 'vp-qc-warning';
  if (overall === 'pass') return 'vp-qc-pass';
  return 'vp-qc-pending';
}

function ShotCard({ shot }: { shot: ShotRow }) {
  const needsRepair =
    shot.approval_state === 'repair_required' ||
    String(shot.qc_summary?.overall ?? '').includes('fail') ||
    String(shot.qc_summary?.overall ?? '').includes('warning');

  return (
    <article className="vp-shot-card" data-shot={shot.shot_key}>
      <div className="vp-shot-thumb" aria-hidden>
        <span className="vp-shot-key">{shot.shot_key.toUpperCase()}</span>
      </div>
      <div className="vp-shot-body">
        <h3>{shot.shot_key.toUpperCase()}</h3>
        <p className="vp-shot-desc">{shot.description ?? 'No description'}</p>
        <div className="vp-shot-meta">
          <span className={`vp-qc-badge ${qcClass(shot.qc_summary)}`}>{qcLabel(shot.qc_summary)}</span>
          <span className="vp-mode-badge">{shot.production_mode ?? '—'}</span>
        </div>
        {needsRepair && (
          <button type="button" className="vp-repair-btn">
            REPAIR →
          </button>
        )}
      </div>
    </article>
  );
}

function ProductionModeSelector({
  value,
  onChange,
}: {
  value: VirtualProductionMode;
  onChange: (mode: VirtualProductionMode) => void;
}) {
  const modes: Array<{ id: VirtualProductionMode; title: string; desc: string }> = [
    {
      id: 'director',
      title: 'DIRECTOR',
      desc: 'Fast multi-scene production. Best for social, lifestyle, narrative and high-volume campaigns.',
    },
    {
      id: 'precision',
      title: 'PRECISION',
      desc: 'Shot-by-shot control. Best for exact products, exact characters and hero production.',
    },
    {
      id: 'hybrid',
      title: 'HYBRID',
      desc: 'Direct fast. Repair precisely. Director production with Precision replacement for weak shots.',
    },
  ];

  return (
    <div className="vp-mode-selector">
      <p className="vp-mode-heading">HOW SHOULD STUDIO WORLD PRODUCE THIS?</p>
      <div className="vp-mode-grid">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`vp-mode-card ${value === m.id ? 'vp-mode-active' : ''}`}
            onClick={() => onChange(m.id)}
          >
            <strong>{m.title}</strong>
            <span>{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export type VirtualProductionWorkspaceProps = {
  orgId?: string;
  campaign: Record<string, unknown> | null;
  shots: ShotRow[];
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  loading?: boolean;
  error?: string | null;
  onSeedReference?: () => void;
};

export function VirtualProductionWorkspace({
  campaign,
  shots,
  tab,
  onTabChange,
  loading,
  error,
  onSeedReference,
}: VirtualProductionWorkspaceProps) {
  const productionMode = (campaign?.production_mode as VirtualProductionMode) ?? 'hybrid';
  const brandName =
    (campaign?.studio_vp_brands as { display_name?: string } | undefined)?.display_name ??
    'Brand';

  return (
    <div className="vp-workspace">
      <header className="vp-header">
        <div>
          <p className="vp-kicker">STUDIO WORLD · VIRTUAL PRODUCTION OS</p>
          <h1>{String(campaign?.name ?? 'Production Board')}</h1>
          <div className="vp-header-meta">
            <span>{brandName}</span>
            <span>{String(productionMode).toUpperCase()} MODE</span>
            <span>{String(campaign?.lifecycle_status ?? '—').replace(/_/g, ' ').toUpperCase()}</span>
          </div>
        </div>
        {onSeedReference && (
          <button type="button" className="vp-seed-btn" onClick={onSeedReference} disabled={loading}>
            Seed Reference Campaign
          </button>
        )}
      </header>

      <nav className="vp-tabs" aria-label="Campaign workspace">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? 'vp-tab-active' : ''}
            onClick={() => onTabChange(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </nav>

      {error && <p className="vp-error">{error}</p>}
      {loading && <p className="vp-loading">Loading production state…</p>}

      {tab === 'production' && (
        <section className="vp-production-view">
          <ProductionModeSelector value={productionMode} onChange={() => undefined} />
          <div className="vp-shot-grid">
            {shots.map((shot) => (
              <ShotCard key={shot.id} shot={shot} />
            ))}
          </div>
        </section>
      )}

      {tab === 'overview' && (
        <section className="vp-panel">
          <h2>Campaign Overview</h2>
          <p>{String(campaign?.objective ?? '[Setup required]')}</p>
          <dl className="vp-dl">
            <dt>Creative Brief</dt>
            <dd>{String(campaign?.creative_brief ?? '[Setup required]')}</dd>
            <dt>Approval</dt>
            <dd>{String(campaign?.approval_state ?? 'draft').replace(/_/g, ' ')}</dd>
          </dl>
        </section>
      )}

      {tab === 'qc' && (
        <section className="vp-panel">
          <h2>Quality Control</h2>
          <p>Structured QC categories: identity, product, environment, wardrobe, prop, anatomy, motion, camera, lighting, continuity, text/logo, audio, brand, overall.</p>
          <div className="vp-shot-grid vp-qc-grid">
            {shots.map((shot) => (
              <ShotCard key={shot.id} shot={shot} />
            ))}
          </div>
        </section>
      )}

      {!['production', 'overview', 'qc'].includes(tab) && (
        <section className="vp-panel vp-placeholder">
          <h2>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>
          <p>Foundation architecture ready — {tab} surface ships in next sprint increment.</p>
        </section>
      )}
    </div>
  );
}

export { ProductionModeSelector };
