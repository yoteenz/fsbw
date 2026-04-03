import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import {
  getAdminMeetings,
  patchAdminMeeting,
  postAdminConsultQuote,
  postAdminMeetingClientAlert,
} from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
  endOfMonth,
  generateMockMeetingsForRange,
  loadLocalMeetings,
  normalizeApiMeeting,
  parseISODateLocal,
  startOfMonth,
  type AdminMeeting,
} from '../../../utils/adminMeetingsMock';

const UNIT_OPTIONS = [
  { id: 'NOIR', label: 'NOIR' },
  { id: 'BLANCO', label: 'BLANCO' },
  { id: 'SOFT WAVE', label: 'SOFT WAVE' },
  { id: 'SOFT CURL', label: 'SOFT CURL' },
  { id: 'BEACH WAVE', label: 'BEACH WAVE' },
  { id: 'OCEAN CURL', label: 'OCEAN CURL' },
] as const;

const SUB_PAGE_OPTIONS = [
  'LENGTH',
  'COLOR',
  'DENSITY',
  'CAP SIZE',
  'HAIRLINE',
  'LACE',
  'TEXTURE',
  'STYLING',
  'ADD-ONS',
] as const;

const EDIT_REASONS = [
  'SCHEDULE CONFLICT',
  'CLIENT REQUEST',
  'STAFF AVAILABILITY',
  'WEATHER / EMERGENCY',
  'OTHER',
] as const;

const CALENDAR_LEFT_ARROW_SRC = '/assets/calendar-left-arrow.svg';
const CALENDAR_RIGHT_ARROW_SRC = '/assets/calendar-right-arrow.svg';

const BOOKING_ADDON_LABEL_BY_ID: Record<string, string> = {
  braids: 'BRAIDS',
  'brow-clean': 'BROW SCULPTING',
  'brow-tint': 'BROW TINT',
  makeup: 'MAKEUP',
  'mink-lashes': 'MINK LASHES',
  'clean-lace': 'CLEAN LACE',
  travel: 'TRAVEL FEE',
};

const BOOKING_ADDON_LABELS = new Set<string>([
  'BRAIDS',
  'BROW SCULPTING',
  'BROW TINT',
  'MAKEUP',
  'MINK LASHES',
  'CLEAN LACE',
  'TRAVEL FEE',
]);

const BOOKING_ADDON_ORDER = [
  'CLEAN LACE',
  'BRAIDS',
  'BROW SCULPTING',
  'BROW TINT',
  'MAKEUP',
  'MINK LASHES',
  'TRAVEL FEE',
] as const;

function formatHeaderDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt
      .toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      .toUpperCase();
  } catch {
    return dateStr;
  }
}

function monthMatrix(anchorISO: string): { label: string; iso: string; inMonth: boolean }[][] {
  const start = parseISODateLocal(startOfMonth(anchorISO));
  const end = parseISODateLocal(endOfMonth(anchorISO));
  const firstDow = start.getDay();
  const pad = firstDow === 0 ? 6 : firstDow - 1;
  const weeks: { label: string; iso: string; inMonth: boolean }[][] = [];
  let cur = new Date(start);
  cur.setDate(cur.getDate() - pad);
  for (let w = 0; w < 6; w++) {
    const row: { label: string; iso: string; inMonth: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const y = cur.getFullYear();
      const mo = String(cur.getMonth() + 1).padStart(2, '0');
      const da = String(cur.getDate()).padStart(2, '0');
      const iso = `${y}-${mo}-${da}`;
      const inMonth = cur >= start && cur <= end;
      row.push({ label: String(cur.getDate()), iso, inMonth });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
}

function tierPremium(m: AdminMeeting): boolean {
  const meta = m.metadata || {};
  const t = String(meta.tier || '').toLowerCase();
  return t === 'premium' || m.notes.toUpperCase().includes('PREMIUM');
}

function tierLabelColor(m: AdminMeeting): string {
  return tierPremium(m) ? '#000000' : '#808080';
}

function normalizeInstallKindLabel(raw: unknown): 'NEW INSTALL' | 'RE-INSTALL' | null {
  const upper = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
  if (!upper) return null;
  if (upper === 'NEW INSTALL' || upper === 'INSTALLS' || upper === 'INSTALL') return 'NEW INSTALL';
  if (upper === 'RE INSTALL' || upper === 'RE-INSTALL' || upper === 'REINSTALL' || upper === 'RE-INSTALLS') {
    return 'RE-INSTALL';
  }
  return null;
}

function normalizeBookingAddonLabel(raw: unknown): string | null {
  const upper = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
  if (!upper) return null;
  if (BOOKING_ADDON_LABELS.has(upper)) return upper;
  if (upper === 'BROW CLEAN' || upper === 'BROW-CLEAN') return 'BROW SCULPTING';
  if (upper === 'BROW TINTING' || upper === 'BROW-TINT') return 'BROW TINT';
  if (upper === 'MINK LASH' || upper === 'MINK-LASHES' || upper === 'MINK LASHES') return 'MINK LASHES';
  if (upper === 'TRAVEL' || upper === 'TRAVEL-FEE') return 'TRAVEL FEE';
  if (upper === 'CLEAN LACE') return 'CLEAN LACE';
  return null;
}

function orderedUniqueAddons(addons: string[]): string[] {
  const set = new Set(addons);
  const ordered = BOOKING_ADDON_ORDER.filter((label) => set.has(label));
  const extras = [...set].filter((label) => !ordered.includes(label as (typeof BOOKING_ADDON_ORDER)[number]));
  return [...ordered, ...extras];
}

function formatBookingServiceType(m: AdminMeeting): string {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;

  const addonLabels: string[] = [];
  const addonIds = Array.isArray(meta.bookingAddonIds)
    ? meta.bookingAddonIds.filter((id): id is string => typeof id === 'string')
    : [];
  addonIds.forEach((id) => {
    const label = BOOKING_ADDON_LABEL_BY_ID[id];
    if (label) addonLabels.push(label);
  });

  const tokenSource = `${String(m.type || '')} · ${String(m.notes || '')}`;
  const tokens = tokenSource
    .split(/[·:+|,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  let installKind = normalizeInstallKindLabel(meta.bookingInstallKind ?? meta.installKind ?? '');
  tokens.forEach((tok) => {
    if (!installKind) {
      const parsedInstall = normalizeInstallKindLabel(tok);
      if (parsedInstall) installKind = parsedInstall;
    }
    const addonLabel = normalizeBookingAddonLabel(tok);
    if (addonLabel) addonLabels.push(addonLabel);
  });

  const uniqueAddons = orderedUniqueAddons(addonLabels);
  if (installKind && uniqueAddons.length > 0) return `${installKind}: ${uniqueAddons.join(', ')}`;
  if (installKind) return installKind;
  if (uniqueAddons.length > 0) return `NEW INSTALL: ${uniqueAddons.join(', ')}`;

  const fallback = String(m.type || '').trim().toUpperCase();
  return fallback || 'NEW INSTALL';
}

function consultInspo(m: AdminMeeting): string[] {
  const meta = m.metadata || {};
  const arr = meta.inspoFileNames;
  return Array.isArray(arr) ? arr.map(String) : [];
}

/** Match rewards / tier-benefits close control (brand red). */
const CLOSE_ICON_RED_FILTER =
  'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)';

function groupMeetingsByClientEmail(rows: AdminMeeting[]): { email: string; rows: AdminMeeting[] }[] {
  return rows.reduce<{ email: string; rows: AdminMeeting[] }[]>((acc, m) => {
    const em = (m.clientEmail || 'UNKNOWN').toLowerCase();
    let g = acc.find((x) => x.email === em);
    if (!g) {
      g = { email: em, rows: [] };
      acc.push(g);
    }
    g.rows.push(m);
    return acc;
  }, []);
}

export default function AdminMeetingsHub() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<'bookings' | 'consults'>('bookings');
  const [calendarAnchor, setCalendarAnchor] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [apiMeetings, setApiMeetings] = useState<AdminMeeting[]>([]);
  const [localTick, setLocalTick] = useState(0);
  const [viewAllMode, setViewAllMode] = useState<'bookings' | 'consults' | null>(null);
  const [quoteMeeting, setQuoteMeeting] = useState<AdminMeeting | null>(null);
  const [editMeeting, setEditMeeting] = useState<AdminMeeting | null>(null);
  const [quoteUnit, setQuoteUnit] = useState<string>(UNIT_OPTIONS[0].id);
  const [quoteSub, setQuoteSub] = useState<string>(SUB_PAGE_OPTIONS[0]);
  const [quoteMessage, setQuoteMessage] = useState(
    'BASED ON YOUR INSPO AND NOTES, THESE SELECTIONS WILL GIVE YOU THE CLOSEST MATCH TO YOUR GOAL LOOK.'
  );
  const [quoteBreakdown, setQuoteBreakdown] = useState('BASE UNIT … $580\nLENGTH 24" … INCLUDED\n');
  const [quoteSending, setQuoteSending] = useState(false);
  const [showSendQuoteConfirm, setShowSendQuoteConfirm] = useState(false);
  const [editReason, setEditReason] = useState<string>(EDIT_REASONS[0]);
  const [editMessage, setEditMessage] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [hubNotice, setHubNotice] = useState<string | null>(null);

  const refreshLocal = useCallback(() => setLocalTick((t) => t + 1), []);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminMeetings()
        .then((r) => {
          const rows = Array.isArray(r.meetings) ? r.meetings : [];
          const norm = rows
            .map((row) => normalizeApiMeeting(row as Record<string, unknown>))
            .filter(Boolean) as AdminMeeting[];
          setApiMeetings(norm);
        })
        .catch(() => {});
    }
  }, []);

  const range = useMemo(() => {
    const start = startOfMonth(calendarAnchor);
    const end = endOfMonth(calendarAnchor);
    return { start, end };
  }, [calendarAnchor]);

  const mergedMeetings = useMemo(() => {
    const mock = generateMockMeetingsForRange(range.start, range.end);
    const local = loadLocalMeetings().filter((m) => m.date >= range.start && m.date <= range.end);
    const byId = new Map<string, AdminMeeting>();
    for (const m of mock) byId.set(m.id, m);
    for (const m of apiMeetings) {
      if (m.date >= range.start && m.date <= range.end) byId.set(m.id, m);
    }
    for (const m of local) byId.set(m.id, m);
    return [...byId.values()].sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return a.time.localeCompare(b.time);
    });
  }, [range.start, range.end, apiMeetings, localTick]);

  const appointmentMeetings = useMemo(
    () => mergedMeetings.filter((m) => m.category !== 'consultation'),
    [mergedMeetings]
  );

  const consultMeetings = useMemo(() => {
    const list = mergedMeetings.filter((m) => m.category === 'consultation');
    return [...list].sort((a, b) => {
      const pa = tierPremium(a) ? 0 : 1;
      const pb = tierPremium(b) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.date.localeCompare(a.date);
    });
  }, [mergedMeetings]);

  const completedBookingsCount = useMemo(
    () =>
      appointmentMeetings.filter((m) => {
        const s = String(m.status || '').toLowerCase();
        return s === 'completed' || s === 'confirmed';
      }).length,
    [appointmentMeetings]
  );

  const completedConsultsCount = useMemo(
    () =>
      consultMeetings.filter((m) => {
        const s = String(m.status || '').toLowerCase();
        return s === 'completed' || s === 'confirmed';
      }).length,
    [consultMeetings]
  );

  const apptDates = useMemo(() => {
    const s = new Set<string>();
    for (const m of appointmentMeetings) s.add(m.date);
    return s;
  }, [appointmentMeetings]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDay) return appointmentMeetings;
    return appointmentMeetings.filter((m) => m.date === selectedDay);
  }, [appointmentMeetings, selectedDay]);

  const sortedAppointmentsList = useMemo(() => {
    return [...appointmentsForSelectedDay].sort((a, b) => {
      const pa = tierPremium(a) ? 0 : 1;
      const pb = tierPremium(b) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
    });
  }, [appointmentsForSelectedDay]);

  const openClientAccount = (m: AdminMeeting) => {
    const em = (m.clientEmail || '').trim();
    if (em) navigate(`/admin/clients?email=${encodeURIComponent(em.toLowerCase())}`);
    else setHubNotice('NO CLIENT EMAIL ON FILE FOR THIS ROW.');
  };

  const handleConfirmSendQuote = async () => {
    if (!quoteMeeting) return;
    const email = (quoteMeeting.clientEmail || '').trim().toLowerCase();
    if (!email) {
      setHubNotice('CLIENT EMAIL REQUIRED TO SEND QUOTE.');
      setShowSendQuoteConfirm(false);
      return;
    }
    setQuoteSending(true);
    try {
      const parts = quoteBreakdown.split('\n').filter(Boolean);
      const breakdown = parts.map((line) => {
        const [label, rest] = line.includes('…') ? line.split('…').map((s) => s.trim()) : [line, ''];
        return { label, value: rest };
      });
      await postAdminConsultQuote({
        clientEmail: email,
        unitKey: quoteUnit,
        selections: { unit: quoteUnit, subPage: quoteSub },
        priceBreakdown: breakdown,
        adminMessage: quoteMessage,
        thumbnailSrc: '/assets/NOIR/noir-thumb.png',
      });
      setQuoteMeeting(null);
      setShowSendQuoteConfirm(false);
      setHubNotice('QUOTE SENT — CLIENT ALERT CREATED.');
    } catch (e) {
      setHubNotice(e instanceof Error ? e.message.toUpperCase() : 'SEND FAILED');
    } finally {
      setQuoteSending(false);
    }
  };

  const submitEditMeeting = async (action: 'reschedule' | 'cancel') => {
    if (!editMeeting) return;
    const uuid = /^[0-9a-f-]{36}$/i.test(editMeeting.id);
    setEditSubmitting(true);
    try {
      if (uuid) {
        await patchAdminMeeting(editMeeting.id, {
          notes: `${editMeeting.notes}\nADMIN: ${editReason} — ${editMessage}`.slice(0, 1200),
          status: 'scheduled',
        });
      }
      const email = editMeeting.clientEmail?.trim().toLowerCase();
      const uid = editMeeting.userId?.trim();
      let doneNotice = 'UPDATE RECORDED.';
      if (isSupabaseConfigured() && (email || uid)) {
        try {
          await postAdminMeetingClientAlert({
            meetingId: editMeeting.id,
            reason: editReason,
            message: editMessage,
            action,
            ...(uid ? { userId: uid } : {}),
            ...(email ? { clientEmail: email } : {}),
          });
          doneNotice = 'UPDATE SENT — CLIENT ALERT ADDED.';
        } catch (alertErr) {
          setHubNotice(
            alertErr instanceof Error
              ? `${alertErr.message.toUpperCase()} (NOTES SAVED)`
              : 'ALERT FAILED (NOTES SAVED)'
          );
          setEditMeeting(null);
          setEditMessage('');
          refreshLocal();
          return;
        }
      } else if (isSupabaseConfigured()) {
        doneNotice = 'NOTES SAVED — ADD CLIENT EMAIL ON MEETING TO SEND ALERTS.';
      }
      setEditMeeting(null);
      setEditMessage('');
      setHubNotice(doneNotice);
      refreshLocal();
    } catch (e) {
      setHubNotice(e instanceof Error ? e.message.toUpperCase() : 'UPDATE FAILED');
    } finally {
      setEditSubmitting(false);
    }
  };

  const monthLabel = useMemo(() => {
    const [y, m] = calendarAnchor.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase();
  }, [calendarAnchor]);

  const calWeeks = useMemo(() => monthMatrix(calendarAnchor), [calendarAnchor]);

  const viewAllGroups = useMemo(
    () =>
      viewAllMode
        ? groupMeetingsByClientEmail(viewAllMode === 'bookings' ? appointmentMeetings : consultMeetings)
        : [],
    [viewAllMode, appointmentMeetings, consultMeetings]
  );

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
          title="MEETINGS"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden min-h-0"
              style={{
                borderWidth: '1.3px',
                minHeight: 'calc(100dvh - 160px)',
              }}
            >
              <div className="flex items-center justify-between -mt-1 pb-1 px-5 pt-4" style={{ marginBottom: 0 }}>
                <h2
                  className="flex-1"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    marginLeft: '6px',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  MEETINGS
                </h2>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />
              {viewAllMode ? (
                <div
                  className="flex-shrink-0 px-5 pb-2 flex items-center justify-between -mt-1"
                  style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 0 }}
                >
                  <h2
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '12px',
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {viewAllMode === 'bookings' ? 'VIEW ALL BOOKINGS' : 'VIEW ALL CONSULTS'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setViewAllMode(null)}
                    aria-label="Close view all"
                    style={{
                      padding: 0,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      lineHeight: 0,
                    }}
                  >
                    <img
                      src="/assets/close-icon.svg"
                      alt=""
                      width={16}
                      height={16}
                      style={{ display: 'block', filter: CLOSE_ICON_RED_FILTER }}
                    />
                  </button>
                </div>
              ) : (
                <div className="flex-shrink-0 px-5 pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                      <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', lineHeight: 1 }}>
                        {completedBookingsCount}
                      </p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                        TOTAL BOOKED
                      </p>
                    </div>
                    <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                      <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', lineHeight: 1 }}>
                        {completedConsultsCount}
                      </p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                        TOTAL CONSULTED
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-8">
                    <button
                      type="button"
                      onClick={() => setMainTab('bookings')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'bookings' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'bookings' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      BOOKINGS
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainTab('consults')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'consults' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'consults' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      CONSULTS
                    </button>
                  </div>
                </div>
              )}

              {hubNotice && (
                <div className="px-5 py-2" style={{ background: 'rgba(235,28,36,0.08)' }}>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', margin: 0, color: '#000' }}>{hubNotice}</p>
                  <button type="button" onClick={() => setHubNotice(null)} style={{ fontSize: '9px', marginTop: '4px' }}>
                    DISMISS
                  </button>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3" style={{ maxHeight: 'calc(100dvh - 240px)' }}>
                {viewAllMode ? (
                  <>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '0 0 12px 0' }}>
                      GROUPED BY CLIENT EMAIL (CURRENT MONTH RANGE).
                    </p>
                    <div className="space-y-3">
                      {viewAllGroups.map((g) => (
                        <div key={g.email} style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: 0 }}>{g.email}</p>
                          {g.rows.map((m) => (
                            <p key={m.id} style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#555', margin: '4px 0 0 0' }}>
                              {m.date} {m.time} — {m.category === 'appointment' ? formatBookingServiceType(m) : m.type}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                ) : mainTab === 'bookings' ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          const s = parseISODateLocal(startOfMonth(calendarAnchor));
                          s.setMonth(s.getMonth() - 1);
                          const y = s.getFullYear();
                          const mo = String(s.getMonth() + 1).padStart(2, '0');
                          setCalendarAnchor(`${y}-${mo}-01`);
                        }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px' }}
                        aria-label="Previous month"
                      >
                        <img src={CALENDAR_LEFT_ARROW_SRC} alt="" width={17} height={17} draggable={false} />
                      </button>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px' }}>{monthLabel}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const s = parseISODateLocal(startOfMonth(calendarAnchor));
                          s.setMonth(s.getMonth() + 1);
                          const y = s.getFullYear();
                          const mo = String(s.getMonth() + 1).padStart(2, '0');
                          setCalendarAnchor(`${y}-${mo}-01`);
                        }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px' }}
                        aria-label="Next month"
                      >
                        <img src={CALENDAR_RIGHT_ARROW_SRC} alt="" width={18} height={18} draggable={false} />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-1" style={{ fontSize: '8px', color: '#808080' }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {calWeeks.flat().map((cell) => {
                        const hasAppt = apptDates.has(cell.iso);
                        return (
                          <button
                            key={cell.iso}
                            type="button"
                            onClick={() => setSelectedDay(cell.iso)}
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '10px',
                              padding: '6px 0',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              background: hasAppt ? '#fff' : '#f3f4f6',
                              color: hasAppt ? '#EB1C24' : '#9ca3af',
                              cursor: 'pointer',
                            }}
                          >
                            {cell.label}
                          </button>
                        );
                      })}
                    </div>
                    {selectedDay && (
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', marginBottom: '8px' }}>
                        {formatHeaderDate(selectedDay)}
                      </p>
                    )}
                    {sortedAppointmentsList.length === 0 ? (
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '11px',
                          color: '#808080',
                          textAlign: 'center',
                          padding: '16px',
                        }}
                      >
                        YOU DON&apos;T HAVE ANY APPOINTMENTS.
                      </p>
                    ) : (
                      sortedAppointmentsList.map((m) => (
                        <div
                          key={m.id}
                          className="mb-3 cursor-pointer"
                          style={{
                            background: '#fff',
                            border: '1px solid #d1d5db',
                            borderRadius: '0',
                            padding: '10px',
                          }}
                          onClick={() => openClientAccount(m)}
                          role="presentation"
                        >
                          <div className="flex justify-between gap-2 items-start">
                            <div className="min-w-0 flex-1">
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', margin: 0 }}>
                                {m.client}{' '}
                                <span style={{ color: tierLabelColor(m) }}>
                                  · {tierPremium(m) ? 'PREMIUM' : 'STANDARD'}
                                </span>
                              </p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#555', margin: '4px 0 0' }}>
                                {formatBookingServiceType(m)}
                              </p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: '4px 0 0' }}>
                                {formatHeaderDate(m.date)} · {m.time} · {m.duration}
                              </p>
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: '6px 0 0' }}>
                                PAID STATUS: SEE ORDER IN CLIENT ACCOUNT
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditMeeting(m);
                              }}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                              aria-label="Edit meeting"
                            >
                              <img src="/assets/edit-meeting-icon.svg" alt="" width={22} height={22} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    {consultMeetings.length === 0 ? (
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', textAlign: 'center' }}>
                        NO CONSULT ROWS IN THIS MONTH RANGE. SYNC FROM CHECKOUT OR EXPAND MOCK DATA.
                      </p>
                    ) : (
                      consultMeetings.map((m) => {
                        const meta = m.metadata || {};
                        const hair = String(meta.hairOption || m.notes || '—');
                        const notes = String(meta.consultNotes || '').trim() || m.notes;
                        const imgs = consultInspo(m);
                        return (
                          <div
                            key={m.id}
                            className="mb-3 cursor-pointer"
                            style={{
                              background: '#fff',
                              border: '1px solid #d1d5db',
                              borderRadius: '0',
                              padding: '10px',
                            }}
                            onClick={() => openClientAccount(m)}
                            role="presentation"
                          >
                            <div className="flex justify-between gap-2 items-start">
                              <div className="min-w-0 flex-1">
                                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', margin: 0, color: '#EB1C24' }}>
                                  {m.client}{' '}
                                  <span style={{ color: tierLabelColor(m) }}>
                                    · {tierPremium(m) ? 'PREMIUM' : 'STANDARD'}
                                  </span>
                                </p>
                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', margin: '6px 0 0' }}>{hair}</p>
                                {imgs.length > 0 && (
                                  <div className="flex gap-1.5 flex-wrap mt-2">
                                    {imgs.slice(0, 4).map((src, i) => (
                                      <div
                                        key={i}
                                        style={{
                                          width: '40px',
                                          height: '40px',
                                          background: '#f3f4f6',
                                          border: '3px solid #FFFFFF',
                                          boxShadow: '0 0 0 1.1px #000000',
                                          boxSizing: 'border-box',
                                          overflow: 'hidden',
                                        }}
                                      >
                                        <img
                                          src={src}
                                          alt=""
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block',
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginTop: '8px' }}>
                                  {notes}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuoteMeeting(m);
                                }}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                                aria-label="Send quote"
                              >
                                <img src="/assets/quote-icon.svg" alt="" width={26} height={26} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="w-full px-0 md:px-0" style={{ marginTop: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMainTab('bookings');
                    setViewAllMode((m) => (m === 'bookings' ? null : 'bookings'));
                  }}
                  className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  VIEW ALL BOOKINGS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMainTab('consults');
                    setViewAllMode((m) => (m === 'consults' ? null : 'consults'));
                  }}
                  className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  VIEW ALL CONSULTS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {quoteMeeting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setQuoteMeeting(null)}
          role="presentation"
        >
          <div
            className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-4 border border-black"
            style={{ borderWidth: '1.3px' }}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24' }}>SEND CONSULT QUOTE</p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px' }}>{quoteMeeting.client}</p>
            <label className="block mt-3" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
              UNIT
              <select
                className="w-full mt-1 p-2 border text-[10px]"
                value={quoteUnit}
                onChange={(e) => setQuoteUnit(e.target.value)}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
              SUB-PAGE SELECTIONS (FIRST PASS)
              <select
                className="w-full mt-1 p-2 border text-[10px]"
                value={quoteSub}
                onChange={(e) => setQuoteSub(e.target.value)}
              >
                {SUB_PAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
              MESSAGE
              <textarea
                className="w-full mt-1 p-2 border text-[10px]"
                rows={3}
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
              />
            </label>
            <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
              PRICE BREAKDOWN (ONE LINE PER ROW, USE … BETWEEN LABEL AND VALUE)
              <textarea
                className="w-full mt-1 p-2 border text-[10px] font-mono"
                rows={5}
                value={quoteBreakdown}
                onChange={(e) => setQuoteBreakdown(e.target.value)}
              />
            </label>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: '8px' }}>
              CONSULT CODE (INITIALS + 3 DIGITS) IS GENERATED SERVER-SIDE; $40 OFF; EXPIRES 72H AFTER SEND. APPLY AT CHECKOUT (PIPELINE TBD).
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="flex-1 py-2 border border-black text-[10px]"
                onClick={() => setQuoteMeeting(null)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="flex-1 py-2 border border-black text-[10px]"
                style={{ color: '#EB1C24' }}
                disabled={quoteSending}
                onClick={() => setShowSendQuoteConfirm(true)}
              >
                {quoteSending ? '…' : 'SEND ALERT'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showSendQuoteConfirm}
        onClose={() => setShowSendQuoteConfirm(false)}
        onConfirm={() => void handleConfirmSendQuote()}
        title="SEND ALERT?"
        message="CLIENT WILL SEE AN ALERT WITH VIEW QUOTE (CONSULT OFFER)."
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="send-consult-quote-confirm"
      />

      {editMeeting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setEditMeeting(null)}
          role="presentation"
        >
          <div
            className="bg-white w-full max-w-md p-4 border border-black"
            style={{ borderWidth: '1.3px' }}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px' }}>EDIT MEETING</p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>ORDER / ROW: {editMeeting.id}</p>
            <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
              REASON
              <select
                className="w-full mt-1 p-2 border text-[10px]"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              >
                {EDIT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
              MESSAGE TO CLIENT
              <textarea
                className="w-full mt-1 p-2 border text-[10px]"
                rows={3}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
              />
            </label>
            <div className="flex flex-col gap-2 mt-3">
              <button
                type="button"
                className="py-2 border border-black text-[10px]"
                disabled={editSubmitting}
                onClick={() => void submitEditMeeting('reschedule')}
              >
                RESCHEDULE APPOINTMENT (NOTIFY CLIENT)
              </button>
              <button
                type="button"
                className="py-2 border border-black text-[10px]"
                disabled={editSubmitting}
                onClick={() => void submitEditMeeting('cancel')}
              >
                CANCEL APPOINTMENT (NOTIFY CLIENT)
              </button>
              <button type="button" className="py-2 border border-gray-300 text-[10px]" onClick={() => setEditMeeting(null)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
