import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import BrandExpiresDatePicker from '../../../../components/BrandExpiresDatePicker';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../../layouts/PageActionsBelowCard';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import {
  APPOINTMENT_SERVICE_OPTIONS,
  CONSULTATION_TYPE_LABEL,
  SCHEDULE_TIME_OPTIONS,
  appendLocalMeeting,
  upsertLocalMeeting,
  type AdminMeeting,
} from '../../../../utils/adminMeetingsMock';
import { postAdminMeeting } from '../../../../utils/api';
import { dispatchAdminMeetingsApiRefresh } from '../../../../hooks/useAdminMeetingsApiRefresh';

type ClientOption = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
};

function loadClientsFromRegistry(): ClientOption[] {
  try {
    const raw = localStorage.getItem('registeredUsers');
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .map((u: Record<string, unknown>) => {
        const email = String(u.email || '').trim().toLowerCase();
        if (!email) return null;
        const firstName = String(u.firstName || '').trim();
        const lastName = String(u.lastName || '').trim();
        const phone = u.phone != null ? String(u.phone) : undefined;
        let address: string | undefined;
        const da = u.defaultAddress as Record<string, string> | undefined;
        const sa = u.shippingAddress as Record<string, string> | undefined;
        const obj = da?.address || sa?.address ? da || sa : null;
        if (obj) {
          address = [obj.address, obj.city, [obj.state, obj.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
        } else if (typeof u.address === 'string') address = u.address;
        return { email, firstName, lastName, phone, address };
      })
      .filter(Boolean) as ClientOption[];
  } catch {
    return [];
  }
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function AdminMeetingsSchedule() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const kindParam = (searchParams.get('kind') || 'consultation').toLowerCase();
  const isConsultation = kindParam !== 'appointment';

  const prefilled = (location.state as { meeting?: AdminMeeting; anchorDate?: string } | null)?.meeting;
  const anchorDate = (location.state as { anchorDate?: string } | null)?.anchorDate;

  const [clients] = useState<ClientOption[]>(() => loadClientsFromRegistry());
  const [clientEmail, setClientEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailField, setEmailField] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(prefilled?.date || anchorDate || todayISO());
  const [time, setTime] = useState(prefilled?.time || '10:00 AM');
  const [notes, setNotes] = useState(prefilled?.notes || '');
  const [services, setServices] = useState<string[]>(prefilled?.services || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefilled) {
      setDate(prefilled.date);
      setTime(prefilled.time);
      setNotes(prefilled.notes || '');
      setServices(prefilled.services || []);
      setClientEmail(prefilled.clientEmail || '');
      setEmailField(prefilled.clientEmail || '');
      const parts = prefilled.client.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(' '));
      } else {
        setFirstName(prefilled.client);
        setLastName('');
      }
    }
  }, [prefilled]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.email === clientEmail),
    [clients, clientEmail]
  );

  useEffect(() => {
    if (!prefilled && selectedClient) {
      setFirstName(selectedClient.firstName);
      setLastName(selectedClient.lastName);
      setEmailField(selectedClient.email);
      setPhone(selectedClient.phone || '');
      setAddress(selectedClient.address || '');
    }
  }, [selectedClient, prefilled]);

  const toggleService = (s: string) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = emailField.trim().toLowerCase();
    if (!fn || !date || !time) return;
    if (!isConsultation && services.length === 0) return;

    setSaving(true);
    const clientName = `${fn} ${ln}`.trim().toUpperCase() || em.toUpperCase() || 'CLIENT';
    const typeLabel = isConsultation ? CONSULTATION_TYPE_LABEL : services.join(' + ');
    const id =
      prefilled && String(prefilled.id).startsWith('local-') ? prefilled.id : `local-${Date.now()}`;
    const meeting: AdminMeeting = {
      id,
      date,
      time,
      client: clientName,
      clientEmail: em || undefined,
      type: typeLabel,
      category: isConsultation ? 'consultation' : 'appointment',
      duration: isConsultation ? '60 MIN' : `${30 + services.length * 15} MIN`,
      status: 'Pending',
      notes: notes.trim() || (isConsultation ? 'Wig consult request' : `Services: ${services.join(', ')}`),
      services: isConsultation ? undefined : [...services],
    };
    if (prefilled && String(prefilled.id).startsWith('local-')) {
      upsertLocalMeeting(meeting);
    } else {
      appendLocalMeeting(meeting);
    }
    window.dispatchEvent(new Event('adminMeetingsUpdated'));
    try {
      await postAdminMeeting({
        clientEmail: em || undefined,
        clientName,
        meetingDate: date,
        meetingTime: time,
        type: typeLabel,
        durationMinutes: isConsultation ? 60 : 30 + services.length * 15,
        status: 'pending',
        notes: meeting.notes,
      });
      dispatchAdminMeetingsApiRefresh();
    } catch {
      /* API optional */
    }
    setSaving(false);
    navigate('/admin/meetings');
  };

  const pageTitle = isConsultation ? 'CONSULTATION' : 'APPOINTMENT';

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title={pageTitle}
          showBack
          onBack={() => navigate('/admin/meetings')}
          breadcrumbParentLabel="MEETINGS"
          breadcrumbParentPath="/admin/meetings"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)', maxHeight: 'calc(100vh - 140px)' }}
            >
              <div className="flex-shrink-0 px-4 pt-4 pb-2">
                <h2
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  {isConsultation ? 'SCHEDULE WIG CONSULT' : 'SCHEDULE APPOINTMENT'}
                </h2>
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '10px',
                    color: '#808080',
                    marginTop: '6px',
                    textTransform: 'uppercase',
                    lineHeight: 1.4,
                  }}
                >
                  {isConsultation
                    ? 'Consultation covers custom wig goals, measurements, and timeline.'
                    : 'Select install, beauty, or add-on services. Multiple selections allowed.'}
                </p>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4" style={{ paddingTop: '8px' }}>
                <label className="block mb-3" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                  LINK CLIENT (FROM CLIENTS OVERVIEW)
                  <select
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="mt-1 w-full border border-black bg-white"
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      padding: '8px 10px',
                      borderWidth: '1.3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <option value="">— WALK-IN / MANUAL —</option>
                    {clients.map((c) => (
                      <option key={c.email} value={c.email}>
                        {`${c.firstName} ${c.lastName}`.trim() || c.email} ({c.email})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <label className="block" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                    FIRST NAME
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full border p-2"
                      style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                    />
                  </label>
                  <label className="block" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                    LAST NAME
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full border p-2"
                      style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                    />
                  </label>
                </div>

                <label className="block mb-3" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                  EMAIL
                  <input
                    type="email"
                    value={emailField}
                    onChange={(e) => setEmailField(e.target.value)}
                    className="mt-1 w-full border p-2"
                    style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                  />
                </label>

                <label className="block mb-3" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                  PHONE
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full border p-2"
                    style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                  />
                </label>

                <label className="block mb-3" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                  ADDRESS / NOTES ADDRESS
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="mt-1 w-full border p-2 resize-none"
                    style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                  />
                </label>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <label className="block min-w-0" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                    DATE
                    <div className="mt-1 w-full min-w-0">
                      <BrandExpiresDatePicker
                        inline
                        monthLabelVariant="adminMeetings"
                        navArrowScale={17 / 22}
                        value={date}
                        onChange={setDate}
                        hideClearDate
                      />
                    </div>
                  </label>
                  <label className="block" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                    TIME
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1 w-full border border-black bg-white p-2"
                      style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderWidth: '1.3px' }}
                    >
                      {SCHEDULE_TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {!isConsultation && (
                  <div className="mb-3">
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', marginBottom: '8px' }}>
                      SERVICES (SELECT ANY)
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {APPOINTMENT_SERVICE_OPTIONS.map((s) => (
                        <label
                          key={s}
                          className="flex items-center gap-2 cursor-pointer border p-2"
                          style={{ borderColor: '#e5e7eb', fontFamily: '"Futura PT Book"', fontSize: '11px' }}
                        >
                          <input
                            type="checkbox"
                            checked={services.includes(s)}
                            onChange={() => toggleService(s)}
                            className="accent-red-600"
                          />
                          <span>{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <label className="block mb-2" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000' }}>
                  STAFF / CLIENT NOTES
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="mt-1 w-full border p-2 resize-none"
                    style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', textTransform: 'uppercase' }}
                  />
                </label>
              </div>
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                disabled={saving || !firstName.trim() || !date || !time || (!isConsultation && services.length === 0)}
                onClick={() => void handleSubmit()}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                style={pageActionButtonStyle}
              >
                {saving ? 'SAVING…' : 'SAVE TO CALENDAR'}
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}
