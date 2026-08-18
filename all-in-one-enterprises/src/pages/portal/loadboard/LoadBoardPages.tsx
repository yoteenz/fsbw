import { FormEvent, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatMoney } from '../../../billing/money';
import { useDemoStore } from '../../../demo/useDemoStore';
import { resolveOrganizationId } from '../../../portal/organizationContext';
import { getTruckProfiles } from '../../../demo/dispatchActions';
import {
  deleteSavedSearch,
  getPublication,
  runLoadBoardSearch,
  saveLoadSearch,
  submitCarrierLoadBoardOffer,
} from '../../../freight/loadBoardActions';
import { searchPublishedLoads } from '../../../freight/freightSearchService';
import type { CarrierLoadBoardResult, LoadBoardSearchFilters } from '../../../freight/freightTypes';
import { aioPaths } from '../../../utils/paths';

const EQUIPMENT = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Power Only'];

function useCarrierOrgId() {
  const store = useDemoStore();
  const location = useLocation();
  return resolveOrganizationId(store, resolvePortalKindSafe(location.pathname));
}

function resolvePortalKindSafe(pathname: string) {
  return pathname.startsWith('/shipper') ? 'shipper' as const : 'carrier' as const;
}

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

export function LoadBoardSearchPage() {
  const store = useDemoStore();
  const orgId = useCarrierOrgId();
  const navigate = useNavigate();
  const trucks = getTruckProfiles(orgId, store);
  const [filters, setFilters] = useState<LoadBoardSearchFilters>({
    originDeadheadMiles: 75,
  });
  const [tab, setTab] = useState<'new' | 'recent' | 'saved'>('new');

  const recent = (store.loadBoardRecentSearches ?? []).filter((r) => r.organizationId === orgId);
  const saved = (store.loadBoardSavedSearches ?? []).filter((s) => s.organizationId === orgId);

  const onSearch = (e?: FormEvent) => {
    e?.preventDefault();
    runLoadBoardSearch(orgId, filters, store);
    navigate(aioPaths.portalLoadBoardResults);
  };

  return (
    <div className="aio-load-board__shell">
      <aside className="aio-load-board__filters aio-desktop-only">
        <LoadBoardFilterForm filters={filters} setFilters={setFilters} trucks={trucks} onSubmit={onSearch} />
      </aside>
      <div className="aio-load-board__workspace">
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
                <button type="button" onClick={() => { runLoadBoardSearch(orgId, r.filters, store); navigate(aioPaths.portalLoadBoardResults); }}>
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
                  <button type="button" onClick={() => { runLoadBoardSearch(orgId, s.filters, store); navigate(aioPaths.portalLoadBoardResults); }}>Run</button>
                  <button type="button" onClick={() => deleteSavedSearch(s.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {tab === 'new' && (
          <button type="button" className="aio-btn aio-btn--gold aio-load-board__search-btn" onClick={() => onSearch()}>
            Search AIO Loads
          </button>
        )}
        <p className="aio-prototype-note">Demo data — carrier view never includes shipper rate or AIO margin.</p>
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
  const store = useDemoStore();
  const orgId = useCarrierOrgId();
  const recent = store.loadBoardRecentSearches?.find((r) => r.organizationId === orgId);
  const filters = recent?.filters ?? { originDeadheadMiles: 75 };
  const response = useMemo(() => searchPublishedLoads(store, orgId, filters), [store, orgId, filters, store.loadBoardPublications, store.loads]);

  return (
    <div className="aio-load-board__shell">
      <div className="aio-load-board__results">
        <header>
          <Link to={aioPaths.portalLoadBoard} className="aio-office-link">← New search</Link>
          <h2>{response.totalCount} AIO loads</h2>
        </header>
        <button
          type="button"
          className="aio-btn aio-btn--outline-dark aio-btn--sm"
          onClick={() => saveLoadSearch(orgId, `${filters.originCity ?? 'Any'} → ${filters.destinationCity ?? 'Any'}`, filters)}
        >
          Save search
        </button>
        <div className="aio-load-board__cards">
          {response.results.map((r) => (
            <LoadBoardCard key={r.loadId} result={r} />
          ))}
          {response.results.length === 0 && <p className="aio-load-board__empty">No published loads match these filters.</p>}
        </div>
      </div>
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
      </div>
      <Link to={aioPaths.portalLoadBoardLoad(result.loadId)} className="aio-btn aio-btn--gold aio-btn--sm">View load</Link>
    </article>
  );
}

export function LoadBoardDetailPage() {
  const { loadId = '' } = useParams();
  const store = useDemoStore();
  const orgId = useCarrierOrgId();
  const load = store.loads.find((l) => l.id === loadId);
  const pub = getPublication(loadId, store);
  const [offerAmount, setOfferAmount] = useState('');
  const [note, setNote] = useState('');

  const result = useMemo(() => {
    if (!load || !pub) return null;
    return searchPublishedLoads(store, orgId, { originDeadheadMiles: 75 }).results.find((r) => r.loadId === loadId) ?? null;
  }, [load, pub, store, orgId, loadId]);

  if (!load || !pub || !result) {
    return <p className="aio-load-board__empty">Load not available on the AIO Load Board.</p>;
  }

  const submitOffer = () => {
    const minor = Math.round(parseFloat(offerAmount) * 100);
    if (!minor || minor <= 0) return;
    submitCarrierLoadBoardOffer(loadId, orgId, minor, note);
    setOfferAmount('');
  };

  return (
    <div className="aio-load-board-detail">
      <Link to={aioPaths.portalLoadBoardResults} className="aio-office-link">← Results</Link>
      <h2>{result.loadNumber}</h2>
      <LoadBoardCard result={result} />
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
      {pub.bookingMode === 'submit_offer' && (
        <section className="aio-load-board-detail__panel">
          <h3>Submit offer</h3>
          <label>Your rate ($)<input type="number" step="50" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} /></label>
          <label>Note<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></label>
          <button type="button" className="aio-btn aio-btn--gold" onClick={submitOffer}>Submit offer to AIO</button>
        </section>
      )}
      {pub.bookingMode === 'instant_book' && (
        <button type="button" className="aio-btn aio-btn--gold" disabled title="Instant book requires carrier qualification — demo">
          Request instant book
        </button>
      )}
    </div>
  );
}

export function LoadBoardMyLoadsPage() {
  const store = useDemoStore();
  const orgId = useCarrierOrgId();
  const offers = (store.carrierLoadBoardOffers ?? []).filter((o) => o.carrierOrganizationId === orgId);
  const booked = store.loads.filter((l) => l.brokerageCarrierOrganizationId === orgId || offers.some((o) => o.loadId === l.id && o.status === 'accepted'));

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
              {load?.loadNumber} — {formatMoney(o.offerAmountMinor)} · {o.status}
            </div>
          );
        })}
      </section>
      <section>
        <h3>Booked / active</h3>
        {booked.map((l) => (
          <Link key={l.id} to={aioPaths.portalLoadBoardLoad(l.id)} className="aio-load-board-card">
            {l.loadNumber} · {l.originCity} → {l.destinationCity}
          </Link>
        ))}
      </section>
      <Link to={aioPaths.portalDispatchLoads} className="aio-btn aio-btn--outline">Managed dispatch loads →</Link>
    </div>
  );
}

export function LoadBoardFleetPage() {
  const store = useDemoStore();
  const orgId = useCarrierOrgId();
  const trucks = getTruckProfiles(orgId, store);
  return (
    <div className="aio-load-board-fleet">
      <h2>My Trucks</h2>
      <p>Select a truck when searching to improve match scoring.</p>
      {trucks.map((t) => (
        <div key={t.id} className="aio-load-board-card">
          <strong>{t.nickname}</strong>
          <p>{t.trailerType ?? 'Equipment TBD'} · {t.nextAvailableCity ?? '—'}, {t.nextAvailableState ?? ''}</p>
          <p>Status: {t.availability.replace(/_/g, ' ')}</p>
        </div>
      ))}
      <Link to={aioPaths.portalFleet} className="aio-btn aio-btn--outline">Full fleet →</Link>
    </div>
  );
}

export function LoadBoardMapPage() {
  return (
    <div className="aio-load-board-map">
      <h2>Map mode</h2>
      <p className="aio-load-board__empty">Map visualization is not connected — no live GPS or external map provider in demo mode.</p>
      <p>Use load search filters for geographic lanes. Search-this-area will ship when authorized map data exists.</p>
    </div>
  );
}

export function LoadBoardSavedPage() {
  const store = useDemoStore();
  const orgId = useCarrierOrgId();
  const saved = (store.loadBoardSavedSearches ?? []).filter((s) => s.organizationId === orgId);
  const navigate = useNavigate();
  return (
    <div className="aio-load-board-saved">
      <h2>Saved searches</h2>
      {saved.map((s) => (
        <div key={s.id} className="aio-load-board-card">
          <strong>{s.label}</strong>
          <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => { runLoadBoardSearch(orgId, s.filters, store); navigate(aioPaths.portalLoadBoardResults); }}>Run</button>
        </div>
      ))}
      <Link to={aioPaths.portalLoadBoard} className="aio-btn aio-btn--outline">New search</Link>
    </div>
  );
}
