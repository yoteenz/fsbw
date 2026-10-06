import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { resolvePortalContext } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';
import {
  aioDoingLine,
  blockingItems,
  clientOpenItems,
  clientStatusLine,
  effectiveState,
  nextItemLine,
  nextStepLine,
  packetCompleteness,
  templateVars,
} from '../iftaDerive';
import { daysUntil, formatShortDate, quarterLabel } from '../iftaDates';
import { primaryCta } from '../experience/iftaExperience';
import { defaultQuarterKeyForOrg, findOrgQuarter, orgHasIftaWorkspace } from '../iftaRouteHelpers';
import { IftaTaxDisplay } from './IftaTaxDisplay';

const TABS = ['PROGRESS', 'FUEL PURCHASES', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS'] as const;
type Tab = (typeof TABS)[number];

export function IftaClientFilingRoomPage() {
  const { quarterKey: quarterParam } = useParams<{ quarterKey?: string }>();
  const store = useDemoStore();
  const ctx = resolvePortalContext(store);
  const now = new Date();
  const [tab, setTab] = useState<Tab>('PROGRESS');

  const defaultKey = defaultQuarterKeyForOrg(store, ctx.organizationId, now);
  if (!orgHasIftaWorkspace(store, ctx.organizationId)) return null;

  if (!quarterParam && defaultKey) {
    return <Navigate to={aioPaths.portalWorkspaceIftaQuarter(defaultKey)} replace />;
  }

  const quarter = quarterParam ? findOrgQuarter(store, ctx.organizationId, quarterParam) : undefined;
  if (!quarter) {
    return (
      <div className="ifta-empty">
        <strong>Quarter not found</strong>
        <p>Select a valid quarter for {ctx.companyName}.</p>
      </div>
    );
  }

  const state = effectiveState(quarter, now);
  const pct = packetCompleteness(quarter, now);
  const vars = templateVars(quarter, now);
  const openItems = clientOpenItems(quarter, now);
  const blocking = blockingItems(quarter, now);
  const ctaRaw = primaryCta(state, 'CLIENT', vars);
  const cta =
    ctaRaw.includes('{') && blocking.length
      ? `Resolve ${blocking.length} item${blocking.length === 1 ? '' : 's'}`
      : ctaRaw.replace(/\{[^}]+\}/g, '').trim() || 'Continue filing';

  const tabBody = useMemo(() => {
    switch (tab) {
      case 'FUEL PURCHASES':
        return (
          <ul>
            {quarter.receipts.slice(0, 12).map((r) => (
              <li key={r.id}>
                {r.vendor ?? 'Receipt'} · {r.jurisdiction} · {r.receiptClass.replace(/_/g, ' ')}
              </li>
            ))}
            {quarter.receipts.length > 12 && <li>…{quarter.receipts.length - 12} more</li>}
          </ul>
        );
      case 'MILEAGE':
        return (
          <ul>
            {quarter.vehicles.map((v) => (
              <li key={v.id}>
                {v.unit} · {v.operated === false ? 'Not operated' : 'Operated'}
              </li>
            ))}
          </ul>
        );
      case 'VEHICLES':
        return (
          <ul>
            {quarter.vehicles.map((v) => (
              <li key={v.id}>
                {v.unit} — {v.description}
              </li>
            ))}
          </ul>
        );
      case 'JURISDICTIONS':
        return quarter.returnSummary ? (
          <ul>
            {quarter.returnSummary.lines.map((l) => (
              <li key={l.jurisdiction}>
                {l.jurisdiction}: {l.miles} mi · {l.taxPaidGallons} gal (read-only)
              </li>
            ))}
          </ul>
        ) : (
          <p className="ifta-tax-pending">Jurisdiction summary pending AIO preparation</p>
        );
      case 'DOCUMENTS':
        return quarter.vault ? (
          <p>Sealed in Vault: {quarter.vault.path.join(' / ')}</p>
        ) : (
          <p>No filed packet yet — upload receipts and send the quarter to AIO when ready.</p>
        );
      default:
        return (
          <div className="ifta-client-grid">
            <div>
              <div className="ifta-panel">
                <h3>Quarter status</h3>
                <p>{clientStatusLine(quarter, now)}</p>
                <p>
                  Due {formatShortDate(quarter.dueDate)} · {Math.max(0, daysUntil(quarter.dueDate, now))} days
                </p>
              </div>
              <div className="ifta-panel">
                <h3>Needs you</h3>
                {blocking.length === 0 ? <p>Nothing blocking — keep capturing fuel and miles.</p> : null}
                <ul>
                  {openItems.slice(0, 6).map((i) => (
                    <li key={i.id}>
                      <strong>{i.title}</strong> — {i.action}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ifta-panel">
                <h3>Filing readiness</h3>
                <p>
                  Receipts {pct.receipts.done}/{pct.receipts.total} · Mileage {pct.mileage.done}/{pct.mileage.total} ·
                  Vehicles {pct.vehicles.done}/{pct.vehicles.total}
                </p>
                <IftaTaxDisplay quarter={quarter} />
              </div>
            </div>
            <div>
              <div className="ifta-panel">
                <h3>AIO insight</h3>
                <p>{aioDoingLine(quarter, now, 'Jordan Lee')}</p>
                <p>{nextStepLine(quarter, now)}</p>
              </div>
              <div className="ifta-panel">
                <h3>Next action</h3>
                <p>{nextItemLine(quarter, now)}</p>
                <button type="button" className="ifta-cta" style={{ marginTop: '0.75rem' }}>
                  {cta}
                </button>
              </div>
              <div className="ifta-panel">
                <h3>Recent activity</h3>
                <ul>
                  {quarter.audit.slice(-4).map((a) => (
                    <li key={a.id}>
                      {a.actorName}: {a.action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
    }
  }, [tab, quarter, now, openItems, blocking, pct, cta]);

  return (
    <>
      <article className="ifta-client-hero">
        <div className="ifta-client-hero__scene" aria-hidden="true" />
        <div className="ifta-client-hero__body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <h1 className="ifta-quarter-title">IFTA filing room · {quarterLabel(quarter)}</h1>
            <span className="ifta-status-pill">{pct.pct}% ready</span>
          </div>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--ifta-stone)' }}>{clientStatusLine(quarter, now)}</p>
        </div>
      </article>

      <nav className="ifta-tabs" aria-label="Filing room sections">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`ifta-tab ${tab === t ? 'ifta-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {tabBody}
    </>
  );
}
