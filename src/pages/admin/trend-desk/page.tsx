import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { apiFetch } from '../../../utils/api';

type TrendCandidate = {
  id: string;
  canonical_label: string;
  primary_category: string;
  current_momentum: string;
  signal_strength: string | null;
  editorial_confidence: string | null;
  source_layer_coverage: string[];
  status: string;
  is_demo: boolean;
  updated_at: string;
};

type DeskOverview = {
  activeCandidates: number;
  momentumCounts: Record<string, number>;
  candidates: TrendCandidate[];
};

const TABS = ['OVERVIEW', 'ADD SIGNAL', 'CANDIDATE'] as const;

export default function AdminTrendDeskPage() {
  useRequireAdminPageAccess();
  const [tab, setTab] = useState<(typeof TABS)[number]>('OVERVIEW');
  const [overview, setOverview] = useState<DeskOverview | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ candidate: TrendCandidate; rawSignals: unknown[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [signalForm, setSignalForm] = useState({
    sourceType: 'editorial',
    sourceProvider: 'Manual Editorial',
    observedAt: new Date().toISOString().slice(0, 16),
    category: 'texture',
    title: '',
    summary: '',
    candidateName: '',
    candidateLabel: '',
    isDemo: true,
  });

  const loadOverview = useCallback(async () => {
    const res = await apiFetch('/api/admin/trend-desk');
    if (!res.ok) return;
    const data = (await res.json()) as { overview: DeskOverview };
    setOverview(data.overview);
  }, []);

  const loadDetail = useCallback(async (candidateId: string) => {
    const res = await apiFetch(`/api/admin/trend-desk?candidateId=${encodeURIComponent(candidateId)}`);
    if (!res.ok) return;
    setDetail((await res.json()) as { candidate: TrendCandidate; rawSignals: unknown[] });
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const postAction = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/admin/trend-desk', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setMessage('Saved.');
      await loadOverview();
      if (selectedId) await loadDetail(selectedId);
      return data;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error');
      return null;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader title="TREND DESK" showBack onBack={() => window.history.back()} />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <p className="text-xs tracking-widest text-white/50 -mt-2">
          FS TREND INTELLIGENCE — V1 · MANUAL EVIDENCE WORKFLOW
        </p>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`px-3 py-1 border text-xs tracking-wider ${tab === t ? 'border-red-500 text-red-400' : 'border-white/20 text-white/70'}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            className="px-3 py-1 border border-white/20 text-xs tracking-wider text-white/70"
            disabled={busy}
            onClick={() => void postAction({ action: 'seed_demo_workflow' })}
          >
            SEED DEMO WORKFLOW
          </button>
        </div>

        {message ? <p className="text-sm text-red-300">{message}</p> : null}

        {tab === 'OVERVIEW' && overview ? (
          <section className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="ACTIVE CANDIDATES" value={String(overview.activeCandidates)} />
              {Object.entries(overview.momentumCounts).map(([k, v]) => (
                <Stat key={k} label={k.toUpperCase()} value={String(v)} />
              ))}
            </div>
            <div className="space-y-2">
              {overview.candidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left border border-white/10 p-3 hover:border-red-500/40"
                  onClick={() => {
                    setSelectedId(c.id);
                    setTab('CANDIDATE');
                  }}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium tracking-wide">{c.canonical_label}</span>
                    <span className="text-xs text-white/50">{c.primary_category.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {c.current_momentum.toUpperCase()} · {c.signal_strength ?? '—'} ·{' '}
                    {c.source_layer_coverage.join(' · ').toUpperCase() || 'NO LAYERS'}
                    {c.is_demo ? ' · DEMO' : ''}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {tab === 'ADD SIGNAL' ? (
          <section className="border border-white/10 p-4 space-y-3 max-w-xl">
            <h2 className="text-sm tracking-widest text-white/70">ADD SIGNAL</h2>
            {(['sourceType', 'sourceProvider', 'observedAt', 'category', 'title', 'summary', 'candidateName', 'candidateLabel'] as const).map(
              (field) => (
                <label key={field} className="block text-xs uppercase tracking-wider text-white/50">
                  {field}
                  <input
                    className="mt-1 w-full bg-black border border-white/20 px-2 py-1 text-sm text-white"
                    value={signalForm[field]}
                    onChange={(e) => setSignalForm((s) => ({ ...s, [field]: e.target.value }))}
                  />
                </label>
              ),
            )}
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={signalForm.isDemo}
                onChange={(e) => setSignalForm((s) => ({ ...s, isDemo: e.target.checked }))}
              />
              Mark as demo/fixture data
            </label>
            <button
              type="button"
              disabled={busy}
              className="border border-red-500/50 px-3 py-2 text-xs tracking-wider"
              onClick={() =>
                void postAction({
                  action: 'ingest_signal',
                  input: {
                    sourceType: signalForm.sourceType,
                    sourceProvider: signalForm.sourceProvider,
                    observedAt: new Date(signalForm.observedAt).toISOString(),
                    category: signalForm.category,
                    title: signalForm.title,
                    summary: signalForm.summary,
                    isDemo: signalForm.isDemo,
                    createCandidate: signalForm.candidateLabel
                      ? {
                          name: signalForm.candidateName || signalForm.candidateLabel,
                          canonicalLabel: signalForm.candidateLabel,
                          primaryCategory: signalForm.category,
                        }
                      : undefined,
                  },
                })
              }
            >
              INGEST EVIDENCE
            </button>
          </section>
        ) : null}

        {tab === 'CANDIDATE' && detail ? (
          <section className="space-y-4">
            <header>
              <h2 className="text-lg tracking-wide">{detail.candidate.canonical_label}</h2>
              <p className="text-xs text-white/60">
                {detail.candidate.status.toUpperCase()} · {detail.candidate.current_momentum.toUpperCase()}
              </p>
            </header>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                label="WATCHLIST"
                disabled={busy}
                onClick={() => void postAction({ action: 'update_candidate_status', candidateId: selectedId, status: 'watchlist' })}
              />
              <ActionButton
                label="APPROVE SIGNAL"
                disabled={busy}
                onClick={() =>
                  void postAction({
                    action: 'approve_signal',
                    candidateId: selectedId,
                    publicSummary: `We are tracking ${detail.candidate.canonical_label} across multiple source layers.`,
                  })
                }
              />
              <ActionButton
                label="DISMISS"
                disabled={busy}
                onClick={() =>
                  void postAction({
                    action: 'update_candidate_status',
                    candidateId: selectedId,
                    status: 'dismissed',
                    dismissReason: 'insufficient_evidence',
                  })
                }
              />
            </div>
            <div>
              <h3 className="text-xs tracking-widest text-white/50 mb-2">EVIDENCE TIMELINE</h3>
              <ul className="space-y-2">
                {(detail.rawSignals as Array<{ observed_at: string; title: string; summary: string; source_type: string }>).map(
                  (s) => (
                    <li key={`${s.observed_at}-${s.title}`} className="border border-white/10 p-2 text-sm">
                      <div className="text-xs text-white/50">
                        {new Date(s.observed_at).toLocaleDateString()} · {s.source_type.toUpperCase()}
                      </div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-white/70 text-xs mt-1">{s.summary}</div>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 p-3">
      <div className="text-[10px] tracking-widest text-white/50">{label}</div>
      <div className="text-xl mt-1">{value}</div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="border border-white/20 px-3 py-1 text-xs tracking-wider hover:border-red-500/40"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
