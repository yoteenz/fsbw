import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  getAppointment,
  getAppointmentTypes,
  getAppointments,
  getUpcomingAppointments,
} from '../../demo/appointmentActions';
import { aioPaths } from '../../utils/paths';
import { hasOfficePermission, resolveOfficeStaffContext } from '../../office-core/officeContext';

function formatApptRange(start: string, end: string, tz: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleString(undefined, { timeZone: tz })} – ${e.toLocaleTimeString(undefined, { timeZone: tz, hour: 'numeric', minute: '2-digit' })} (${tz})`;
}

function AppointmentRow({ id }: { id: string }) {
  const store = useDemoStore();
  const appt = getAppointment(id, store);
  const type = appt ? store.appointmentTypes?.find((t) => t.id === appt.appointmentTypeId) : undefined;
  if (!appt) return null;
  const client = appt.organizationId ? store.clients.find((c) => c.id === appt.organizationId) : undefined;
  const lead = appt.leadId ? store.crmLeads?.find((l) => l.id === appt.leadId) : undefined;

  return (
    <Link to={aioPaths.officeAppointment(appt.id)} className="aio-comm-row">
      <div className="aio-comm-row__main">
        <strong>{appt.customerName}</strong>
        <span className="aio-comm-row__subject">{type?.name ?? 'Consultation'}</span>
        <small className="aio-muted">{client?.companyName ?? lead?.businessName ?? 'Prospect'}</small>
      </div>
      <div className="aio-comm-row__meta">
        <span className="aio-badge aio-badge--progress">{appt.status.replace(/_/g, ' ')}</span>
        <span className="aio-muted">{new Date(appt.scheduledStart).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}

export function OfficeAppointmentsPage() {
  const [filter, setFilter] = useState<'today' | 'week' | 'upcoming' | 'requested' | 'confirmed' | 'needs_action'>('upcoming');
  const store = useDemoStore();
  const appts = useMemo(() => {
    const all = getAppointments(store);
    const now = Date.now();
    const todayStr = new Date().toDateString();
    switch (filter) {
      case 'today':
        return all.filter((a) => new Date(a.scheduledStart).toDateString() === todayStr);
      case 'week': {
        const weekEnd = now + 7 * 86400000;
        return all.filter((a) => {
          const t = new Date(a.scheduledStart).getTime();
          return t >= now && t <= weekEnd;
        });
      }
      case 'requested':
        return all.filter((a) => a.status === 'requested' || a.status === 'pending_confirmation');
      case 'confirmed':
        return all.filter((a) => a.status === 'confirmed');
      case 'needs_action':
        return all.filter((a) => ['reschedule_requested', 'pending_confirmation'].includes(a.status));
      default:
        return getUpcomingAppointments(store);
    }
  }, [filter, store]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Appointments</h1>
        <p>Consultations and scheduled calls — separate from compliance calendar (DEMO).</p>
        <Link to={aioPaths.officeCommunications} className="aio-btn aio-btn--outline aio-btn--sm">Communications</Link>
      </header>
      <div className="aio-filter-row">
        {(['today', 'week', 'upcoming', 'requested', 'confirmed', 'needs_action'] as const).map((f) => (
          <button key={f} type="button" className={`aio-chip ${filter === f ? 'aio-chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <div className="aio-comm-list">
        {appts.length === 0 ? (
          <p className="aio-empty-state__text">No appointments in this view.</p>
        ) : (
          appts.map((a) => <AppointmentRow key={a.id} id={a.id} />)
        )}
      </div>
    </div>
  );
}

export function OfficeAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const [summary, setSummary] = useState('');

  const appt = appointmentId ? getAppointment(appointmentId, store) : undefined;
  const type = appt ? store.appointmentTypes?.find((t) => t.id === appt.appointmentTypeId) : undefined;
  const history = (store.appointmentStatusHistory ?? []).filter((h) => h.appointmentId === appointmentId);

  if (!appt) {
    return (
      <div className="aio-office-page">
        <p>Appointment not found.</p>
        <Link to={aioPaths.officeAppointments}>← Appointments</Link>
      </div>
    );
  }

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeAppointments} className="aio-portal-back">← Appointments</Link>
        <h1>{type?.name ?? 'Appointment'}</h1>
        <p>{appt.customerName} · {appt.status.replace(/_/g, ' ')}</p>
      </header>
      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Schedule</h2>
          <p>{formatApptRange(appt.scheduledStart, appt.scheduledEnd, appt.timezone)}</p>
          {appt.customerReason && <p><strong>Reason:</strong> {appt.customerReason}</p>}
          {appt.staffSummary && <p><strong>Staff summary:</strong> {appt.staffSummary}</p>}
          <div className="aio-inline-actions">
            {appt.status === 'pending_confirmation' && (
              <button type="button" className="aio-btn aio-btn--gold" onClick={() => confirmAppointment(appt.id, ctx.staffId)}>Confirm</button>
            )}
            {!['completed', 'cancelled', 'no_show'].includes(appt.status) && (
              <>
                <button type="button" className="aio-btn aio-btn--outline" onClick={() => cancelAppointment(appt.id)}>Cancel</button>
              </>
            )}
          </div>
        </div>
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">History</h2>
          <ul className="aio-list">
            {history.map((h) => (
              <li key={h.id}>{new Date(h.createdAt).toLocaleString()} — {h.toStatus}{h.note ? `: ${h.note}` : ''}</li>
            ))}
          </ul>
        </div>
      </div>
      {appt.status === 'confirmed' && (
        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Complete Appointment</h2>
          <textarea className="aio-textarea" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Internal summary…" />
          <button
            type="button"
            className="aio-btn aio-btn--gold"
            onClick={() => {
              completeAppointment(appt.id, summary, ctx.staffId);
              setSummary('');
            }}
          >
            Mark Completed
          </button>
        </section>
      )}
      {appt.leadId && (
        <p><Link to={aioPaths.officeCrmLead(appt.leadId)}>View related lead →</Link></p>
      )}
    </div>
  );
}

export function OfficeAppointmentsSettingsPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasOfficePermission(ctx, 'comm.settings.manage')) {
    return <div className="aio-office-page"><p>Permission denied.</p></div>;
  }
  const types = getAppointmentTypes(store);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Appointment Settings</h1>
        <p>Types, availability, business hours — no external calendar sync (DEMO).</p>
      </header>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Business Hours</h2>
        <p>{store.commSettings?.businessHoursStart ?? '09:00'} – {store.commSettings?.businessHoursEnd ?? '17:00'} ({store.appointmentSettings?.defaultTimezone})</p>
      </div>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Appointment Types</h2>
        <ul className="aio-list">
          {types.map((t) => (
            <li key={t.id}>{t.name} — {t.durationMinutes} min</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
