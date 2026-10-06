import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import {
  clientStatusLine,
  effectiveState,
  packetCompleteness,
  staffNextAction,
  staffStatusLine,
  templateVars,
} from '../iftaDerive';
import { primaryCta } from '../experience/iftaExperience';
import { companyName, findOrgQuarter, orgHasIftaWorkspace } from '../iftaRouteHelpers';
import { daysUntil, formatShortDate, quarterLabel } from '../iftaDates';
import { IftaTaxDisplay } from './IftaTaxDisplay';
import { RunFaqsPanel } from './RunFaqsPanel';

const STAFF_TABS = ['OVERVIEW', 'FUEL', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS', 'NOTES'] as const;
type StaffTab = (typeof STAFF_TABS)[number];

export function IftaStaffCasePage() {
  const { clientId = '', quarterKey = '' } = useParams<{ clientId: string; quarterKey: string }>();
  const store = useDemoStore();
  const now = new Date();
  const [tab, setTab] = useState<StaffTab>('OVERVIEW');

  if (!orgHasIftaWorkspace(store, clientId)) {
    return <Navigate to={aioPaths.officeWorkspaceIfta} replace />;
  }

  const quarter = findOrgQuarter(store, clientId, quarterKey);
  if (!quarter) {
    return (
      <div className="ifta-empty">
        <strong>Case not found</strong>
        <Link to={aioPaths.officeWorkspaceIfta}>← Fuel tax queue</Link>
      </div>
    );
  }

  const state = effectiveState(quarter, now);
  const pct = packetCompleteness(quarter, now);
  const vars = templateVars(quarter, now);
  const staffCta = primaryCta(state, 'FOUNDER_STAFF', vars);

  const body = useMemo(() => {
    if (tab === 'NOTES') {
      return (
        <div className="ifta-notes">
          <strong>Staff notes</strong> (not visible to client)
          <p style={{ margin: '0.5rem 0 0' }}>Jordan Lee · {formatShortDate(now.toISOString())}</p>
          <p>Reefer-lane receipt on Truck 02 — waiting on client confirmation. Unreadable GA photo needs retake.</p>
        </div>
      );
    }
    if (tab === 'FUEL') {
      return (
        <ul>
          {quarter.receipts.map((r) => (
            <li key={r.id}>
              {r.receiptClass} · {r.jurisdiction} · {r.vendor ?? '—'}
            </li>
          ))}
        </ul>
      );
    }
    if (tab === 'OVERVIEW') {
      return (
        <div className="ifta-staff-layout">
          <div>
            <div className="ifta-mirror" aria-label="Client staff mirror">
              <div>
                <strong>Client sees:</strong> {clientStatusLine(quarter, now)}
              </div>
              <div>
                <strong>You see:</strong> {staffStatusLine(quarter, now)}
              </div>
            </div>
            <div className="ifta-panel">
              <h3>Case identity</h3>
              <p>
                <code>{quarter.id}</code>
              </p>
              <p>
                Due {formatShortDate(quarter.dueDate)} · {Math.max(0, daysUntil(quarter.dueDate, now))} days · {pct.pct}%
                packet
              </p>
              <IftaTaxDisplay quarter={quarter} />
            </div>
            <div className="ifta-panel">
              <h3>Primary staff action</h3>
              <button type="button" className="ifta-cta">
                {staffCta}
              </button>
              <p style={{ marginTop: '0.75rem' }}>{staffNextAction(quarter, now)}</p>
            </div>
          </div>
          <aside>
            <RunFaqsPanel compact />
            <div className="ifta-panel" style={{ marginTop: '0.75rem' }}>
              <h3>Audit trail</h3>
              <ul>
                {quarter.audit.slice(-5).map((a) => (
                  <li key={a.id}>
                    {a.actorName}: {a.action}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      );
    }
    return <p className="ifta-panel">Tab content bound to canonical case record — expand in next fan-out sprint.</p>;
  }, [tab, quarter, now, pct, staffCta]);

  return (
    <>
      <p>
        <Link to={aioPaths.officeWorkspaceIfta}>← Fuel tax queue</Link>
      </p>
      <header className="ifta-staff-header">
        <div>
          <h1>
            {companyName(store, clientId)} · {quarterLabel(quarter)}
          </h1>
          <p style={{ margin: 0, color: 'var(--ifta-stone)' }}>{staffStatusLine(quarter, now)}</p>
        </div>
        <Link to={aioPaths.portalWorkspaceIftaQuarter(quarterKey)} className="ifta-cta ifta-cta--ghost" style={{ color: 'var(--ifta-ink)' }}>
          Open client filing room
        </Link>
      </header>

      <nav className="ifta-tabs" aria-label="Staff case sections">
        {STAFF_TABS.map((t) => (
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

      {body}
    </>
  );
}
