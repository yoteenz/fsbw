import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import {
  STAFF_BUCKETS,
  clientStatusLine,
  packetCompleteness,
  sortStaffQueue,
  staffBucket,
  staffNextAction,
  staffStatusLine,
} from '../iftaDerive';
import { companyName } from '../iftaRouteHelpers';
import { daysUntil, formatShortDate, quarterLabel } from '../iftaDates';

export function IftaStaffQueuePage() {
  const store = useDemoStore();
  const now = new Date();
  const cases = sortStaffQueue(store.iftaQuarters ?? [], now);
  const filing = cases.filter((q) => {
    const b = staffBucket(q, now);
    return b !== 'COMPLETE';
  });

  return (
    <>
      <header className="ifta-staff-header">
        <div>
          <h1>Fuel tax queue</h1>
          <p style={{ margin: 0, color: 'var(--ifta-stone)', fontSize: '0.9rem' }}>
            {filing.length} open quarter{cases.length !== filing.length ? ` · ${cases.length} total enrolled` : ''}
          </p>
        </div>
        <div className="ifta-workspace-bar">
          {STAFF_BUCKETS.filter((b) => b.id !== 'COMPLETE').map((b) => (
            <span key={b.id} className="ifta-workspace-chip">
              {b.label}
            </span>
          ))}
        </div>
      </header>

      <div style={{ overflowX: 'auto' }}>
        <table className="ifta-queue-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Quarter</th>
              <th>Due</th>
              <th>Bucket</th>
              <th>Packet</th>
              <th>Client ⇄ staff</th>
              <th>Next</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((q) => {
              const pct = packetCompleteness(q, now).pct;
              const key = `${q.year}-Q${q.quarter}`;
              return (
                <tr key={q.id}>
                  <td>
                    <Link to={aioPaths.officeWorkspaceIftaCase(q.organizationId, key)}>{companyName(store, q.organizationId)}</Link>
                  </td>
                  <td>{quarterLabel(q)}</td>
                  <td>
                    {formatShortDate(q.dueDate)} · {Math.max(0, daysUntil(q.dueDate, now))}d
                  </td>
                  <td>{STAFF_BUCKETS.find((b) => b.id === staffBucket(q, now))?.label}</td>
                  <td>{pct}%</td>
                  <td style={{ fontSize: '0.78rem' }}>
                    <div>{clientStatusLine(q, now)}</div>
                    <div>{staffStatusLine(q, now)}</div>
                  </td>
                  <td>{staffNextAction(q, now)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
