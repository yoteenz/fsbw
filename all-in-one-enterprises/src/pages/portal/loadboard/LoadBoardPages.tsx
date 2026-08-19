import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatMoney } from '../../../billing/money';
import { useDemoStore } from '../../../demo/useDemoStore';
import { getTruckProfiles } from '../../../demo/dispatchActions';
import { getPublication } from '../../../freight/loadBoardActions';
import { getActiveLoadBoardFilters } from '../../../freight/loadBoardSessionFilters';
import type { CarrierLoadBoardResult, LoadBoardSearchFilters, SavedLoadSearch, RecentLoadSearch } from '../../../freight/freightTypes';
import { useFreightRepository } from '../../../freight/useFreightRepository';
import { isFreightDemoMode } from '../../../freight/freightRepository';
import { aioPaths } from '../../../utils/paths';
import { LoadMapPanel } from './LoadMapPanel';
import type { LoadMapData } from '../../../freight/freightRepositoryTypes';

const EQUIPMENT = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Power Only'];

export function LoadBoardLayout() {
  const location = useLocation();
  const nav = [
    { label: 'Loads', href: aioPaths.portalLoadBoard },
    { label: 'My Loads', href: aioPaths.portalLoadBoardMyLoads },
    { label: 'Fleet', href: aioPaths.portalLoadBoardFleet },
    { label: 'Map', href: aioPaths.portalLoadBoardMap },
    { label: 'More', href: aioPaths.portalLoadBoardSaved },
  ];
  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <div className="aio-load-board">
      <header className="aio-load-board__header">
        <div>
          <p className="aio-load-board__eyebrow">AIO Brokerage</p>
          <h1 className="aio-load-board__title">Load Board</h1>
          <p className="aio-load-board__subtitle">Freight distributed by All In One — not a third-party marketplace.</p>
        </div>
      </header>
      <nav className="aio-load-board__mobile-nav aio-mobile-only" aria-label="Load board">
        {nav.map((item) => (
          <Link key={item.href} to={item.href} className={isActive(item.href) ? 'is-active' : ''}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

function useActiveFilters(): LoadBoardSearchFilters {
  return getActiveLoadBoardFilters();
}

export function LoadBoardSearchPage() {
  const store = useDemoStore();
  const { repository, orgId, userId, error: repoError } = useFreightRepository();
  const navigate = useNavigate();
  const trucks = getTruckProfiles(orgId, store);
  const [filters, setFilters] = useState<LoadBoardSearchFilters>({ originDeadheadMiles: 75 });
  const [tab, setTab] = useState<'new' | 'recent' | 'saved'>('new');
  const [recent, setRecent] = useState<RecentLoadSearch[]>([]);
  const [saved, setSaved] = useState<SavedLoadSearch[]>([]);

  useEffect(() => {
    void repository.listRecentSearches(orgId, userId).then((r) => {
      if (r.ok) setRecent(r.data);
    });
    void repository.listSavedSearches(orgId, userId).then((r) => {
      if (r.ok) setSaved(r.data);
    });
  }, [repository, orgId, userId]);

  const onSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    await repository.recordRecentSearch(orgId, userId, filters);
    navigate(aioPaths.portalLoadBoardResults);
  };

  const runSaved = async (f: LoadBoardSearchFilters) => {
    await repository.recordRecentSearch(orgId, userId, f);
    navigate(aioPaths.portalLoadBoardResults);
  };

  return (
    <div className="aio-load-board__shell">
      <aside className="aio-load-board__filters aio-desktop-only">
        <LoadBoardFilterForm filters={filters} setFilters={setFilters} trucks={trucks} onSubmit={onSearch} />
      </aside>
      <div className="aio-load-board__workspace">
        {repoError && (
          <div className="aio-load-board__error" role="alert">{repoError}</div>
        )}
        <div className="aio-load-board__tabs">
          {(['new', 'recent', 'saved'] as const).map((t) => (
            <button key={t} type="button" className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>
              {t === 'new' ? 'New Search' : t === 'recent' ? 'Recent' : 'Saved'}
            </button>
          ))}
        </div>
        {tab === 'new' && (
          <div className="aio-mobile-only">
            <LoadBoardFilterForm filters={filters} setFilters={setFilters} trucks={trucks} onSubmit={onSearch} />
          </div>
        )}
        {tab === 'recent' && (
          <ul className="aio-load-board__saved-list">
            {recent.length === 0 && <li className="aio-load-board__empty">No recent searches yet.</li>}
            {recent.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => void runSaved(r.filters)}>
                  {r.filters.originCity ?? 'Any origin'} → {r.filters.destinationCity ?? 'Any destination'}
                  <span>{new Date(r.searchedAt).toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {tab === 'saved' && (
          <ul className="aio-load-board__saved-list">
            {saved.length === 0 && <li className="aio-load-board__empty">Save a lane search from results.</li>}
            {saved.map((s) => (
              <li key={s.id}>
                <strong>{s.label}</strong>
                <div className="aio-load-board__saved-actions">
                  <button type="button" onClick={() => void runSaved(s.filters)}>Run</button>
                  <button type="button" onClick={() => void repository.deleteSavedSearch(s.id).then(() => setSaved((prev) => prev.filter((x) => x.id !== s.id)))}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {tab === 'new' && (
          <button type="button" className="aio-btn aio-btn--gold aio-load-board__search-btn" onClick={() => void onSearch()}>
            Search AIO Loads
          </button>
        )}
        {isFreightDemoMode() && (
          <p className="aio-prototype-note">Demo data — carrier view never includes shipper rate or AIO margin.</p>
        )}
      </div>
    </div>
  );
}

function LoadBoardFilterForm({
  filters,
  setFilters,
  trucks,
  onSubmit,
}: {
  filters: LoadBoardSearchFilters;
  setFilters: (f: LoadBoardSearchFilters) => void;
  trucks: ReturnType<typeof getTruckProfiles>;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form className="aio-load-board__filter-form" onSubmit={onSubmit}>
      <label>Origin city<input value={filters.originCity ?? ''} onChange={(e) => setFilters({ ...filters, originCity: e.target.value })} /></label>
      <label>Origin state<input maxLength={2} value={filters.originState ?? ''} onChange={(e) => setFilters({ ...filters, originState: e.target.value.toUpperCase() })} /></label>
      <label>Destination city<input value={filters.destinationCity ?? ''} onChange={(e) => setFilters({ ...filters, destinationCity: e.target.value })} /></label>
      <label>Destination state<input maxLength={2} value={filters.destinationState ?? ''} onChange={(e) => setFilters({ ...filters, destinationState: e.target.value.toUpperCase() })} /></label>
      <label>Origin deadhead (mi)<input type="number" value={filters.originDeadheadMiles ?? 75} onChange={(e) => setFilters({ ...filters, originDeadheadMiles: Number(e.target.value) })} /></label>
      <label>Equipment
        <select value={filters.equipmentType ?? ''} onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value || undefined })}>
          <option value="">Any</option>
          {EQUIPMENT.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
        </select>
      </label>
      <label>Trailer length (ft)<input type="number" value={filters.trailerLengthFt ?? ''} onChange={(e) => setFilters({ ...filters, trailerLengthFt: e.target.value ? Number(e.target.value) : undefined })} /></label>
      <label>Min carrier rate ($)<input type="number" step="50" onChange={(e) => setFilters({ ...filters, minCarrierRateMinor: e.target.value ? Number(e.target.value) * 100 : undefined })} /></label>
      <label>Min true RPM (¢)<input type="number" onChange={(e) => setFilters({ ...filters, minTrueRpmMinor: e.target.value ? Number(e.target.value) : undefined })} /></label>
      <label>Max post age (hrs)<input type="number" value={filters.maxPostAgeHours ?? ''} onChange={(e) => setFilters({ ...filters, maxPostAgeHours: e.target.value ? Number(e.target.value) : undefined })} /></label>
      <label>Search for truck
        <select value={filters.truckProfileId ?? ''} onChange={(e) => setFilters({ ...filters, truckProfileId: e.target.value || undefined })}>
          <option value="">Any truck</option>
          {trucks.map((t) => <option key={t.id} value={t.id}>{t.nickname}</option>)}
        </select>
      </label>
      <button type="submit" className="aio-btn aio-btn--gold">Run search</button>
    </form>
  );
}

export function LoadBoardResultsPage() {
  const { repository, orgId, userId } = useFreightRepository();
  const filters = useActiveFilters();
  const [response, setResponse] = useState<{ results: CarrierLoadBoardResult[]; totalCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveWithAlerts, setSaveWithAlerts] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void repository.searchPublishedLoads(orgId, filters).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setResponse(r.data);
        setError(null);
      } else {
        setResponse(null);
        setError(r.error.message);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [repository, orgId, filters]);

  const saveSearch = async () => {
    await repository.saveSearch(
      orgId,
      userId,
      `${filters.originCity ?? 'Any'} → ${filters.destinationCity ?? 'Any'}`,
      filters,
      saveWithAlerts,
    );
  };

  if (loading) return <p className="aio-load-board__empty">Searching AIO loads…</p>;

  if (error) {
    return (
      <div className="aio-load-board__error" role="alert">
        <strong>We couldn&apos;t load available freight.</strong>
        <p>{error}</p>
        <Link to={aioPaths.portalLoadBoard} className="aio-btn aio-btn--outline-dark aio-btn--sm">Try again</Link>
      </div>
    );
  }

  const results = response?.results ?? [];

  return (
    <div className="aio-load-board__shell">
      <div className="aio-load-board__results">
        <header>
          <Link to={aioPaths.portalLoadBoard} className="aio-office-link">← New search</Link>
          <h2>{response?.totalCount ?? 0} AIO loads</h2>
        </header>
        <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={() => void saveSearch()}>
          Save search
        </button>
        <label className="aio-check aio-load-board__save-alert">
          <input type="checkbox" checked={saveWithAlerts} onChange={(e) => setSaveWithAlerts(e.target.checked)} />
          Alert me when new loads match
        </label>
        <div className="aio-load-board__cards">
          {results.map((r) => (
            <LoadBoardCard key={r.loadId} result={r} />
          ))}
          {results.length === 0 && <p className="aio-load-board__empty">No published loads match these filters.</p>}
        </div>
      </div>
      <aside className="aio-load-board__context-rail aio-desktop-only">
        {results[0] && (
          <section className="aio-load-board-detail__panel">
            <h3>Selected context</h3>
            <p>{results[0].loadNumber}</p>
            {results[0].matchScore && <p>{results[0].matchScore.label}</p>}
          </section>
        )}
      </aside>
    </div>
  );
}

function LoadBoardCard({ result }: { result: CarrierLoadBoardResult }) {
  return (
    <article className="aio-load-board-card">
      <div className="aio-load-board-card__route">
        <strong>{result.originCity}, {result.originState}</strong>
        <span>→</span>
        <strong>{result.destinationCity}, {result.destinationState}</strong>
      </div>
      <div className="aio-load-board-card__metrics">
        <span>{formatMoney(result.carrierRateMinor)}</span>
        <span>Loaded {formatMoney(result.loadedRpmMinor)}/mi</span>
        <span>True {formatMoney(result.trueRpmMinor)}/mi</span>
        <span>{result.loadedMiles} mi · DH {result.pickupDeadheadMiles}</span>
      </div>
      <div className="aio-load-board-card__meta">
        <span>{result.equipmentType}{result.trailerLengthFt ? ` · ${result.trailerLengthFt}'` : ''}</span>
        <span>Pickup {result.pickupDate}</span>
        {result.matchScore && result.matchScore.band !== 'insufficient_data' && (
          <span className="aio-load-board-card__score">{result.matchScore.label} ({result.matchScore.score})</span>
        )}
        {result.maintenanceWarning && (
          <span className="aio-load-board-card__maintenance">Maintenance attention</span>
        )}
      </div>
      <Link to={aioPaths.portalLoadBoardLoad(result.loadId)} className="aio-btn aio-btn--gold aio-btn--sm">View load</Link>
    </article>
  );
}

export function LoadBoardDetailPage() {
  const { loadId = '' } = useParams();
  const store = useDemoStore();
  const { repository, orgId } = useFreightRepository();
  const filters = useActiveFilters();
  const [offerAmount, setOfferAmount] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<CarrierLoadBoardResult | null>(null);
  const [bookingMode, setBookingMode] = useState<string>('submit_offer');
  const [offerError, setOfferError] = useState<string | null>(null);

  useEffect(() => {
    void repository.searchPublishedLoads(orgId, filters).then((r) => {
      if (r.ok) {
        setResult(r.data.results.find((x) => x.loadId === loadId) ?? null);
      }
    });
    if (isFreightDemoMode()) {
      const pub = getPublication(loadId, store);
      if (pub) setBookingMode(pub.bookingMode);
    } else {
      void repository.getPublication(loadId).then((r) => {
        if (r.ok && r.data) setBookingMode(r.data.bookingMode);
      });
    }
  }, [repository, orgId, loadId, filters, store]);

  if (!result) {
    return <p className="aio-load-board__empty">Load not available on the AIO Load Board.</p>;
  }

  const submitOffer = async () => {
    const minor = Math.round(parseFloat(offerAmount) * 100);
    if (!minor || minor <= 0) return;
    const r = await repository.submitCarrierOffer(loadId, orgId, minor, note);
    if (r.ok) {
      setOfferAmount('');
      setOfferError(null);
    } else {
      setOfferError(r.error.message);
    }
  };

  return (
    <div className="aio-load-board-detail">
      <Link to={aioPaths.portalLoadBoardResults} className="aio-office-link">← Results</Link>
      <h2>{result.loadNumber}</h2>
      <LoadBoardCard result={result} />
      {result.maintenanceWarning && (
        <section className="aio-load-board-detail__panel aio-load-board-detail__maintenance">
          <h3>Maintenance attention</h3>
          <p>{result.maintenanceWarning.message}</p>
          {result.maintenanceWarning.serviceDueInMiles != null && (
            <p>PM due in ~{result.maintenanceWarning.serviceDueInMiles.toLocaleString()} mi</p>
          )}
          <ul>{result.maintenanceWarning.actions.map((a) => <li key={a}>{a}</li>)}</ul>
          <Link to={aioPaths.portalFleetCare} className="aio-btn aio-btn--outline-dark aio-btn--sm">View FleetCare</Link>
        </section>
      )}
      {result.matchScore && (
        <section className="aio-load-board-detail__panel">
          <h3>Why this matches</h3>
          <p>{result.matchScore.label}</p>
          <ul>{result.matchScore.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      )}
      {result.profitEstimate && (
        <section className="aio-load-board-detail__panel">
          <h3>Profit estimate</h3>
          <p>{result.profitEstimate.assumptionsNote}</p>
          <dl>
            <dt>Est. fuel</dt><dd>{formatMoney(result.profitEstimate.estimatedFuelMinor)}</dd>
            <dt>Est. operating cost</dt><dd>{formatMoney(result.profitEstimate.estimatedOperatingCostMinor)}</dd>
            <dt>Est. profit</dt><dd>{formatMoney(result.profitEstimate.estimatedProfitMinor)}</dd>
          </dl>
        </section>
      )}
      {bookingMode === 'submit_offer' && (
        <section className="aio-load-board-detail__panel">
          <h3>Submit offer</h3>
          {offerError && <p className="aio-load-board__error">{offerError}</p>}
          <label>Your rate ($)<input type="number" step="50" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} /></label>
          <label>Note<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></label>
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => void submitOffer()}>Submit offer to AIO</button>
        </section>
      )}
      {bookingMode === 'instant_book' && (
        <button type="button" className="aio-btn aio-btn--gold" disabled title="Instant book requires carrier qualification — demo">
          Request instant book
        </button>
      )}
    </div>
  );
}

export function LoadBoardMyLoadsPage() {
  const store = useDemoStore();
  const { repository, orgId } = useFreightRepository();
  const [offers, setOffers] = useState<import('../../../freight/freightTypes').CarrierLoadBoardOffer[]>([]);

  useEffect(() => {
    void repository.listCarrierOffers(orgId).then((r) => {
      if (r.ok) setOffers(r.data);
    });
  }, [repository, orgId]);

  const booked = isFreightDemoMode()
    ? store.loads.filter((l) => l.brokerageCarrierOrganizationId === orgId || offers.some((o) => o.loadId === l.id && o.status === 'accepted'))
    : [];

  return (
    <div className="aio-load-board-my">
      <h2>My Loads</h2>
      <section>
        <h3>Offers submitted</h3>
        {offers.length === 0 && <p className="aio-load-board__empty">No offers yet.</p>}
        {offers.map((o) => {
          const load = store.loads.find((l) => l.id === o.loadId);
          return (
            <div key={o.id} className="aio-load-board-card">
              {load?.loadNumber ?? o.loadId} — {formatMoney(o.offerAmountMinor)} · {o.status}
            </div>
          );
        })}
      </section>
      {isFreightDemoMode() && (
        <section>
          <h3>Booked / active</h3>
          {booked.map((l) => (
            <Link key={l.id} to={aioPaths.portalLoadBoardLoad(l.id)} className="aio-load-board-card">
              {l.loadNumber} · {l.originCity} → {l.destinationCity}
            </Link>
          ))}
        </section>
      )}
      <Link to={aioPaths.portalDispatchLoads} className="aio-btn aio-btn--outline">Managed dispatch loads →</Link>
    </div>
  );
}

export function LoadBoardFleetPage() {
  const store = useDemoStore();
  const { orgId } = useFreightRepository();
  const trucks = getTruckProfiles(orgId, store);
  return (
    <div className="aio-load-board-fleet">
      <h2>My Trucks</h2>
      <p>Select a truck when searching to improve match scoring and FleetCare warnings.</p>
      {trucks.map((t) => (
        <div key={t.id} className="aio-load-board-card">
          <strong>{t.nickname}</strong>
          <p>{t.trailerType ?? 'Equipment TBD'} · {t.nextAvailableCity ?? '—'}, {t.nextAvailableState ?? ''}</p>
          <p>Status: {t.availability.replace(/_/g, ' ')}</p>
          {t.currentOdometerMiles != null && t.nextPmOdometerMiles != null && (
            <p>Odometer {t.currentOdometerMiles.toLocaleString()} · PM @ {t.nextPmOdometerMiles.toLocaleString()} mi</p>
          )}
        </div>
      ))}
      <Link to={aioPaths.portalFleet} className="aio-btn aio-btn--outline">Full fleet →</Link>
    </div>
  );
}

export function LoadBoardMapPage() {
  const { repository, orgId } = useFreightRepository();
  const [mapData, setMapData] = useState<LoadMapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMap = useCallback(() => {
    setLoading(true);
    void (repository.getLoadMapData
      ? repository.getLoadMapData(orgId)
      : repository.searchPublishedLoads(orgId, { originDeadheadMiles: 500 })
    ).then((r) => {
      if (r.ok && 'loads' in r.data) {
        setMapData(r.data as LoadMapData);
        setError(null);
      } else if (r.ok && 'results' in r.data) {
        setMapData({ loads: [], trucks: [] });
        setError(null);
      } else if (!r.ok) {
        setMapData(null);
        setError(r.error.message);
      }
      setLoading(false);
    });
  }, [repository, orgId]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  return (
    <div className="aio-load-board-map">
      <h2>Map mode</h2>
      <p className="aio-prototype-note">City/metro-level geography from stored coordinates or cache — not live GPS unless ELD connected.</p>
      <LoadMapPanel
        mapData={mapData}
        loading={loading}
        error={error}
        onSearchThisArea={() => navigate(aioPaths.portalLoadBoardResults)}
      />
    </div>
  );
}

export function LoadBoardSavedPage() {
  const { repository, orgId, userId } = useFreightRepository();
  const [saved, setSaved] = useState<SavedLoadSearch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void repository.listSavedSearches(orgId, userId).then((r) => {
      if (r.ok) setSaved(r.data);
    });
  }, [repository, orgId, userId]);

  return (
    <div className="aio-load-board-saved">
      <h2>Saved searches</h2>
      {saved.map((s) => (
        <div key={s.id} className="aio-load-board-card">
          <strong>{s.label}</strong>
          <button
            type="button"
            className="aio-btn aio-btn--gold aio-btn--sm"
            onClick={() => {
              void repository.recordRecentSearch(orgId, userId, s.filters).then(() => navigate(aioPaths.portalLoadBoardResults));
            }}
          >
            Run
          </button>
        </div>
      ))}
      <Link to={aioPaths.portalLoadBoard} className="aio-btn aio-btn--outline">New search</Link>
    </div>
  );
}
