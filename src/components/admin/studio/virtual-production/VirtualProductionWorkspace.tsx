import type { ShotRow } from '../../../../services/studio/virtualProduction/api';
import type { VirtualProductionMode } from '../../../../studio-os-core/virtual-production';
import './virtual-production.css';

const OPERATOR_TABS = [
  'brief',
  'canon',
  'storyboard',
  'shots',
  'production',
  'qc',
  'assembly',
  'deliverables',
  'history',
] as const;

type Tab = (typeof OPERATOR_TABS)[number];

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
  const needsRepair = shot.approval_state === 'repair_required';

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
          <span className="vp-mode-badge">{(shot.production_mode ?? '—').toUpperCase()}</span>
          {shot.duration_seconds != null && (
            <span className="vp-mode-badge">{shot.duration_seconds}s</span>
          )}
        </div>
        <div className="vp-shot-criticality">
          {shot.identity_criticality && <span>ID {shot.identity_criticality.toUpperCase()}</span>}
          {shot.product_criticality && shot.product_criticality !== 'low' && (
            <span>PR {shot.product_criticality.toUpperCase()}</span>
          )}
        </div>
        <p className="vp-shot-provider">{shot.provider_id ?? '—'}</p>
        <div className="vp-shot-actions">
          <button type="button" className="vp-action-btn">OPEN</button>
          {needsRepair && (
            <button type="button" className="vp-repair-btn">
              REPAIR →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CampaignSummary({ shots }: { shots: ShotRow[] }) {
  const approved = shots.filter((s) => s.approval_state === 'approved').length;
  const repair = shots.filter((s) => s.approval_state === 'repair_required').length;
  const notReviewed = shots.filter(
    (s) => String(s.qc_summary?.overall ?? 'not_reviewed') === 'not_reviewed'
  ).length;

  return (
    <div className="vp-summary-row">
      <div className="vp-summary-chip">
        <strong>{shots.length}</strong> SHOTS
      </div>
      <div className="vp-summary-chip vp-qc-pass">
        <strong>{approved}</strong> APPROVED
      </div>
      <div className="vp-summary-chip vp-qc-fail">
        <strong>{repair}</strong> REPAIR
      </div>
      <div className="vp-summary-chip">
        <strong>{notReviewed}</strong> NOT REVIEWED
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
  onSeedCanon?: () => void;
  seedLabel?: string;
};

export function VirtualProductionWorkspace({
  campaign,
  shots,
  tab,
  onTabChange,
  loading,
  error,
  onSeedCanon,
  seedLabel = 'Initialize FS Canon + Campaign 001',
}: VirtualProductionWorkspaceProps) {
  const productionMode = (campaign?.production_mode as VirtualProductionMode) ?? 'hybrid';
  const brandName =
    (campaign?.studio_vp_brands as { display_name?: string } | undefined)?.display_name ??
    'FRONTAL SLAYER';
  const currentPhase = String(campaign?.current_phase ?? campaign?.lifecycle_status ?? '—')
    .replace(/_/g, ' ')
    .toUpperCase();

  return (
    <div className="vp-workspace">
      <header className="vp-header">
        <div>
          <p className="vp-kicker">STUDIO WORLD · CAMPAIGN OPERATOR</p>
          <h1>{String(campaign?.name ?? 'CAMPAIGN 001')}</h1>
          <div className="vp-header-meta">
            <span>{brandName}</span>
            <span>{String(productionMode).toUpperCase()}</span>
            <span>{currentPhase}</span>
            <span>{String(campaign?.director_external_status ?? '').replace(/_/g, ' ')}</span>
          </div>
        </div>
        {onSeedCanon && (
          <button type="button" className="vp-seed-btn" onClick={onSeedCanon} disabled={loading}>
            {seedLabel}
          </button>
        )}
      </header>

      <CampaignSummary shots={shots} />

      <nav className="vp-tabs" aria-label="Campaign workspace">
        {OPERATOR_TABS.map((t) => (
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

      {(tab === 'production' || tab === 'shots' || tab === 'qc') && (
        <section className="vp-production-view">
          <div className="vp-shot-grid">
            {shots.map((shot) => (
              <ShotCard key={shot.id} shot={shot} />
            ))}
          </div>
        </section>
      )}

      {tab === 'brief' && (
        <section className="vp-panel">
          <h2>Campaign Brief</h2>
          <dl className="vp-dl">
            <dt>Objective</dt>
            <dd>{String(campaign?.objective ?? '—')}</dd>
            <dt>Platform</dt>
            <dd>{String(campaign?.platform ?? '—')}</dd>
            <dt>Creative Brief</dt>
            <dd>{String(campaign?.creative_brief ?? '—')}</dd>
            <dt>Narrative</dt>
            <dd>{String(campaign?.narrative_concept ?? '—')}</dd>
            <dt>Treatment</dt>
            <dd>{String(campaign?.treatment ?? '—')}</dd>
            <dt>Format</dt>
            <dd>{JSON.stringify(campaign?.format ?? {})}</dd>
          </dl>
        </section>
      )}

      {tab === 'canon' && (
        <section className="vp-panel">
          <h2>Canon Attachment</h2>
          <pre className="vp-json">{JSON.stringify(campaign?.canon_snapshot ?? {}, null, 2)}</pre>
          <p className="vp-note">Reference Pack V1 — all Nia image slots: SETUP REQUIRED (text canon locked)</p>
        </section>
      )}

      {tab === 'storyboard' && (
        <section className="vp-panel">
          <h2>Storyboard / Keyframes</h2>
          <p>9 shots · keyframe state per shot in database. Workflow: SHOT → KEYFRAME → QC → APPROVAL → MOTION</p>
          <ul className="vp-shot-list">
            {shots.map((s) => (
              <li key={s.id}>
                {s.shot_key.toUpperCase()} — {s.description} ({s.approval_state})
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'assembly' && (
        <section className="vp-panel">
          <h2>Assembly V1</h2>
          <p>Timeline architecture ready — ordered shots with transitions. Final render: NOT READY (accurate state).</p>
        </section>
      )}

      {tab === 'deliverables' && (
        <section className="vp-panel">
          <h2>Deliverables</h2>
          <p>SOCIAL MASTER — 9:16 — Instagram Reels / TikTok</p>
          <p className="vp-note">Status: INCOMPLETE — awaiting approved assembly and QC pass. Not marked DELIVERED.</p>
        </section>
      )}

      {tab === 'history' && (
        <section className="vp-panel">
          <h2>Production History</h2>
          <p>Provider, model, reference-pack version, attempts, QC, repair count captured in production_jobs and generation_assets.</p>
        </section>
      )}
    </div>
  );
}

export type { Tab as VirtualProductionTab };
