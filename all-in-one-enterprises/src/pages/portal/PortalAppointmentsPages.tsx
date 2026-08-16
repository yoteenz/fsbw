import { Link, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  cancelAppointment,
  getAppointment,
  getOrgAppointments,
  requestReschedule,
} from '../../demo/appointmentActions';
import { resolveOrganizationId, resolvePortalKind } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';

function groupAppointments(appts: ReturnType<typeof getOrgAppointments>) {
  const now = Date.now();
  return {
    upcoming: appts.filter((a) => ['confirmed', 'pending_confirmation'].includes(a.status) && new Date(a.scheduledStart).getTime() >= now),
    requested: appts.filter((a) => a.status === 'requested' || a.status === 'pending_confirmation'),
    past: appts.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status) || new Date(a.scheduledStart).getTime() < now),
  };
}

export function PortalAppointmentsListPage() {
  const store = useDemoStore();
  const location = useLocation();
  const orgId = resolveOrganizationId(store, resolvePortalKind(location.pathname));
  const appts = getOrgAppointments(orgId, store);
  const groups = groupAppointments(appts);

  return (
    <div className="aio-cc-page">
      <Link to={aioPaths.portal} className="aio-portal-back">← Command Center</Link>
      <h1>Appointments</h1>
      <Link to={aioPaths.schedule} className="aio-btn aio-btn--gold aio-btn--sm">Request Consultation</Link>
      {(['upcoming', 'requested', 'past'] as const).map((key) => {
        const list = groups[key];
        if (!list.length) return null;
        const title = { upcoming: 'Upcoming', requested: 'Requested', past: 'Past' }[key];
        return (
          <section key={key} className="aio-cc-panel">
            <h2>{title}</h2>
            {list.map((a) => {
              const type = store.appointmentTypes?.find((t) => t.id === a.appointmentTypeId);
              return (
                <Link key={a.id} to={aioPaths.portalAppointment(a.id)} className="aio-portal-request-card">
                  <div>
                    <strong>{type?.name ?? 'Consultation'}</strong>
                    <br />
                    <small>{new Date(a.scheduledStart).toLocaleString(undefined, { timeZone: a.timezone })}</small>
                  </div>
                  <span className="aio-badge aio-badge--progress">{a.status.replace(/_/g, ' ')}</span>
                </Link>
              );
            })}
          </section>
        );
      })}
      {appts.length === 0 && <p className="aio-empty-state__text">No appointments yet.</p>}
    </div>
  );
}

export function PortalAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const store = useDemoStore();
  const location = useLocation();
  const orgId = resolveOrganizationId(store, resolvePortalKind(location.pathname));
  const appt = appointmentId ? getAppointment(appointmentId, store) : undefined;

  if (!appt || (appt.organizationId && appt.organizationId !== orgId)) {
    return (
      <div className="aio-cc-page">
        <p>Appointment not found.</p>
        <Link to={aioPaths.portalAppointments}>← Appointments</Link>
      </div>
    );
  }

  const type = store.appointmentTypes?.find((t) => t.id === appt.appointmentTypeId);

  return (
    <div className="aio-cc-page">
      <Link to={aioPaths.portalAppointments} className="aio-portal-back">← Appointments</Link>
      <h1>{type?.name ?? 'Appointment'}</h1>
      <p>{new Date(appt.scheduledStart).toLocaleString(undefined, { timeZone: appt.timezone })} ({appt.timezone})</p>
      <p className="aio-badge aio-badge--progress">{appt.status.replace(/_/g, ' ')}</p>
      {appt.customerReason && <p><strong>Your reason:</strong> {appt.customerReason}</p>}
      <div className="aio-inline-actions">
        {['confirmed', 'pending_confirmation'].includes(appt.status) && (
          <>
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => requestReschedule(appt.id)}>Request Reschedule</button>
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => cancelAppointment(appt.id, 'Customer cancelled')}>Cancel</button>
          </>
        )}
        <Link to={aioPaths.portalMessages} className="aio-btn aio-btn--outline">Message About Appointment</Link>
      </div>
    </div>
  );
}
