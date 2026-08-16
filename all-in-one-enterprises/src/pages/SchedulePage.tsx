import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  bookPublicAppointment,
  getAppointmentTypes,
  getAvailableSlots,
  holdSlot,
} from '../demo/appointmentActions';
import { aioPaths } from '../utils/paths';

const SESSION_KEY = 'aio-schedule-session';

function sessionKey(): string {
  if (typeof window === 'undefined') return SESSION_KEY;
  let key = sessionStorage.getItem(SESSION_KEY);
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, key);
  }
  return key;
}

export function SchedulePage() {
  const types = getAppointmentTypes();
  const [step, setStep] = useState(1);
  const [typeId, setTypeId] = useState(types[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<{ start: string; end: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [bookedId, setBookedId] = useState<string | null>(null);

  const slots = useMemo(
    () => (typeId && date ? getAvailableSlots(typeId, date, sessionKey()) : []),
    [typeId, date],
  );

  const selectedType = types.find((t) => t.id === typeId);

  const onBook = () => {
    if (!slot || !name.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    const result = bookPublicAppointment({
      appointmentTypeId: typeId,
      slotStart: slot.start,
      slotEnd: slot.end,
      sessionKey: sessionKey(),
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      reason: reason.trim() || undefined,
    });
    if (!result.ok) {
      setError(result.error);
      setSlot(null);
      return;
    }
    setBookedId(result.appointment.id);
    setStep(5);
  };

  if (bookedId) {
    return (
      <div className="aio-public-page aio-schedule">
        <h1>Request Received</h1>
        <p>Your consultation request is <strong>pending confirmation</strong>. All In One will confirm your appointment shortly.</p>
        <p className="aio-muted">No external calendar event was created — this is in-app scheduling only (DEMO).</p>
        <Link to={aioPaths.home} className="aio-btn aio-btn--gold">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="aio-public-page aio-schedule">
      <header className="aio-schedule__hero">
        <h1>LET&apos;S GET YOU MOVING.</h1>
        <p>Choose what you need help with and find a time that works.</p>
      </header>

      {step === 1 && (
        <section className="aio-portal-panel">
          <h2>What do you need help with?</h2>
          <div className="aio-schedule-types">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`aio-schedule-type ${typeId === t.id ? 'aio-schedule-type--active' : ''}`}
                onClick={() => { setTypeId(t.id); setStep(2); }}
              >
                <strong>{t.name}</strong>
                <span>{t.durationMinutes} min</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step >= 2 && selectedType && (
        <p className="aio-muted">Selected: {selectedType.name}</p>
      )}

      {step === 2 && (
        <section className="aio-portal-panel">
          <h2>Choose a date</h2>
          <input
            type="date"
            className="aio-input"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => { setDate(e.target.value); setSlot(null); }}
            aria-label="Appointment date"
          />
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => setStep(3)}>Continue</button>
        </section>
      )}

      {step === 3 && (
        <section className="aio-portal-panel">
          <h2>Choose a time</h2>
          {slots.length === 0 ? (
            <p className="aio-empty-state__text">No slots available this day — try another date.</p>
          ) : (
            <div className="aio-schedule-slots">
              {slots.map((s) => (
                <button
                  key={s.start}
                  type="button"
                  className={`aio-chip ${slot?.start === s.start ? 'aio-chip--active' : ''}`}
                  onClick={() => {
                    holdSlot(typeId, s.start, s.end, sessionKey());
                    setSlot({ start: s.start, end: s.end });
                    setStep(4);
                  }}
                >
                  {new Date(s.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </button>
              ))}
            </div>
          )}
          <button type="button" className="aio-btn aio-btn--outline" onClick={() => setStep(2)}>Back</button>
        </section>
      )}

      {step === 4 && slot && (
        <section className="aio-portal-panel">
          <h2>Your information</h2>
          <label className="aio-label">Name *<input className="aio-input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label className="aio-label">Email<input className="aio-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="aio-label">Phone<input className="aio-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <label className="aio-label">Brief reason<textarea className="aio-textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
          {error && <p className="aio-comm-provider-warn">{error}</p>}
          <div className="aio-inline-actions">
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => setStep(3)}>Back</button>
            <button type="button" className="aio-btn aio-btn--gold" onClick={onBook}>Request Appointment</button>
          </div>
          <p className="aio-muted">Appointment is not confirmed until All In One approves the slot.</p>
        </section>
      )}
    </div>
  );
}
