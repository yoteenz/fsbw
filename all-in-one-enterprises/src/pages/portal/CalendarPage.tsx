import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getCalendarEvents, getOrganizationId } from '../../demo/vaultActions';
import { DEADLINE_TYPE_LABELS } from '../../calendar/calendarConfig';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { VAULT_CATEGORIES } from '../../vault/vaultConfig';
import { aioPaths } from '../../utils/paths';

type ViewMode = 'upcoming' | 'agenda' | 'month';

export function CalendarPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const [view, setView] = useState<ViewMode>('upcoming');
  const [category, setCategory] = useState('');

  const events = useMemo(() => {
    let list = getCalendarEvents(orgId, store).filter((e) => !e.complete);
    if (category) list = list.filter((e) => e.category === category);
    return list;
  }, [orgId, category, store.documents, store.renewals, store.deadlines]);

  const upcoming = events.slice(0, 12);
  const nextItem = events[0];

  return (
    <div className="aio-calendar">
      <header className="aio-calendar__header">
        <h1>Compliance Calendar</h1>
        <p>Unified timeline for expirations, renewals, filings, and service deadlines — derived from your verified documents and active renewals.</p>
      </header>

      <div className="aio-calendar-toolbar">
        <div className="aio-calendar-view-tabs" role="tablist">
          {(['upcoming', 'agenda', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={view === v ? 'aio-calendar-view-tabs__active' : ''}
              onClick={() => setView(v)}
            >
              {v === 'upcoming' ? 'Upcoming' : v === 'agenda' ? 'Agenda' : 'Month'}
            </button>
          ))}
        </div>
        <select className="aio-intake-input" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {VAULT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {events.length === 0 ? (
        <div className="aio-empty-state">
          <p className="aio-empty-state__text">No upcoming deadlines tracked yet.</p>
          <Link to={aioPaths.portalVault}>Upload documents to the Vault →</Link>
        </div>
      ) : view === 'month' ? (
        <section className="aio-calendar-month">
          <p className="aio-prototype-note">Month view — simplified list grouped by date (full grid on desktop in a future release).</p>
          <ul className="aio-calendar-list">
            {events.map((ev) => (
              <CalendarEventRow key={ev.id} event={ev} />
            ))}
          </ul>
        </section>
      ) : (
        <ul className="aio-calendar-list">
          {(view === 'upcoming' ? upcoming : events).map((ev) => (
            <CalendarEventRow key={ev.id} event={ev} />
          ))}
        </ul>
      )}

      {events.length > 0 && !events.some((e) => e.state === 'overdue' || e.state === 'due_soon') && (
        <p className="aio-vault-caught-up">
          You&apos;re all caught up on urgent deadlines.
          {nextItem && <> Next upcoming: {nextItem.title} — {formatDaysRemaining(nextItem.dueDate)}.</>}
        </p>
      )}
    </div>
  );
}

function CalendarEventRow({ event }: { event: ReturnType<typeof getCalendarEvents>[0] }) {
  const stateClass =
    event.state === 'overdue' || event.state === 'due_today'
      ? 'aio-badge--alert'
      : event.state === 'due_soon'
        ? 'aio-badge--needed'
        : 'aio-badge--progress';

  return (
    <li className="aio-calendar-event">
      <div className="aio-calendar-event__date">
        <time dateTime={event.dueDate}>{event.dueDate}</time>
        <span className={`aio-badge ${stateClass}`}>{formatDaysRemaining(event.dueDate)}</span>
      </div>
      <div className="aio-calendar-event__body">
        <strong>{event.title}</strong>
        <p>{DEADLINE_TYPE_LABELS[event.deadlineType] ?? event.deadlineType} · {event.source.replace(/_/g, ' ')}</p>
        <div className="aio-calendar-event__actions">
          {event.documentId && (
            <Link to={aioPaths.portalVaultDocument(event.documentId)} className="aio-btn aio-btn--outline aio-btn--sm">View Document</Link>
          )}
          {event.renewalId && (
            <Link to={aioPaths.portalRenewals} className="aio-btn aio-btn--gold aio-btn--sm">Review Renewal</Link>
          )}
          {event.serviceRequestId && (
            <Link to={aioPaths.portalRequest(event.serviceRequestId)} className="aio-btn aio-btn--outline aio-btn--sm">Service Request</Link>
          )}
          <Link to={aioPaths.contact} className="aio-btn aio-btn--outline aio-btn--sm">Message All In One</Link>
        </div>
      </div>
    </li>
  );
}
