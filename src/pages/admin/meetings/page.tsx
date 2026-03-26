import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { getAdminMeetings } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import {
  addDaysISO,
  endOfMonth,
  endOfYear,
  generateMockMeetingsForRange,
  loadLocalMeetings,
  normalizeApiMeeting,
  startOfMonth,
  startOfWeekMonday,
  startOfYear,
  type AdminMeeting,
} from '../../../utils/adminMeetingsMock';

const MEETING_TABS = ['DAY', 'WEEK', 'MONTH', 'YEAR'] as const;
type ViewMode = 'day' | 'week' | 'month' | 'year';

function formatHeaderDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  } catch {
    return dateStr;
  }
}

function monthYearLabel(dateStr: string): string {
  try {
    const [y, m] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, 1);
    return dt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase();
  } catch {
    return dateStr;
  }
}

function yearLabel(dateStr: string): string {
  try {
    return String(parseISOParts(dateStr).y);
  } catch {
    return dateStr;
  }
}

function parseISOParts(dateStr: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { y, m, d };
}

export default function AdminMeetings() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [apiMeetings, setApiMeetings] = useState<AdminMeeting[]>([]);
  const [localTick, setLocalTick] = useState(0);

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
          if (norm.length > 0) setApiMeetings(norm);
        })
        .catch(() => {});
    }
  }, []);

  const range = useMemo(() => {
    if (viewMode === 'day') {
      return { start: selectedDate, end: selectedDate, label: formatHeaderDate(selectedDate) };
    }
    if (viewMode === 'week') {
      const start = startOfWeekMonday(selectedDate);
      const end = addDaysISO(start, 6);
      return {
        start,
        end,
        label: `${formatHeaderDate(start)} — ${formatHeaderDate(end)}`,
      };
    }
    if (viewMode === 'month') {
      return {
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
        label: monthYearLabel(selectedDate),
      };
    }
    return {
      start: startOfYear(selectedDate),
      end: endOfYear(selectedDate),
      label: yearLabel(selectedDate),
    };
  }, [viewMode, selectedDate]);

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
      return timeToSortKey(a.time) - timeToSortKey(b.time);
    });
  }, [range.start, range.end, apiMeetings, localTick]);

  const stats = useMemo(() => {
    const total = mergedMeetings.length;
    const confirmed = mergedMeetings.filter((m) => m.status === 'Confirmed').length;
    const pending = mergedMeetings.filter((m) => m.status === 'Pending').length;
    return { total, confirmed, pending };
  }, [mergedMeetings]);

  const listTitle =
    viewMode === 'day'
      ? "TODAY'S MEETINGS"
      : viewMode === 'week'
        ? 'THIS WEEK'
        : viewMode === 'month'
          ? 'THIS MONTH'
          : 'THIS YEAR';

  const statPeriodLabel =
    viewMode === 'day' ? 'IN DAY' : viewMode === 'week' ? 'IN WEEK' : viewMode === 'month' ? 'IN MONTH' : 'IN YEAR';

  const openSchedule = (kind: 'consultation' | 'appointment') => {
    navigate(`/admin/meetings/schedule?kind=${kind}`, { state: { anchorDate: selectedDate } });
  };

  const openEdit = (m: AdminMeeting) => {
    const kind = m.category === 'consultation' ? 'consultation' : 'appointment';
    navigate(`/admin/meetings/schedule?kind=${kind}`, { state: { meeting: m, anchorDate: m.date } });
  };

  useEffect(() => {
    const onFocus = () => refreshLocal();
    const onMeetingsUpdated = () => refreshLocal();
    window.addEventListener('focus', onFocus);
    window.addEventListener('adminMeetingsUpdated', onMeetingsUpdated);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('adminMeetingsUpdated', onMeetingsUpdated);
    };
  }, [refreshLocal]);

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
                height: 'calc(100dvh - 160px)',
                maxHeight: 'calc(100vh - 140px)',
              }}
            >
              <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4 flex-shrink-0" style={{ marginBottom: 0 }}>
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                  <path d="M7.5 6V1M17.5 6V1M21.5 17V21.5H3.5V18.5M21.363 8.5H3.352M0.5 18.25V18.5H18.4L18.55 18.25L18.784 17.759C20.5722 14.0007 21.5 9.89102 21.5 5.729V3.5H3.5V5.628C3.50004 9.82218 2.55784 13.9628 0.743 17.744L0.5 18.25Z" stroke="#EB1C24" />
                </svg>
              </div>
              <div className="flex-shrink-0" style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              <div className="px-5 pb-3 flex-shrink-0">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{stats.total}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>{statPeriodLabel}</p>
                  </div>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{stats.confirmed}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>CONFIRMED</p>
                  </div>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{stats.pending}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>PENDING</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5 flex-shrink-0">
                {MEETING_TABS.map((tab) => {
                  const mode = tab.toLowerCase() as ViewMode;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className="py-3 px-2 font-medium transition-colors"
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: viewMode === mode ? '#EB1C24' : '#808080',
                        border: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          borderBottom: viewMode === mode ? '1px solid #EB1C24' : '1px solid transparent',
                          paddingBottom: '4px',
                        }}
                      >
                        {tab}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ padding: '8px', boxSizing: 'border-box' }}>
                <div className="px-5 pb-2 flex-shrink-0">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-3 border"
                    style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                  />
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', marginTop: '6px', textTransform: 'uppercase' }}>
                    {viewMode === 'month' && 'PICK ANY DAY IN THE MONTH TO SCOPE THE LIST.'}
                    {viewMode === 'year' && 'PICK ANY DAY IN THE YEAR TO SCOPE THE LIST.'}
                    {viewMode === 'week' && 'WEEK RUNS MON — SUN CONTAINING THE DATE ABOVE.'}
                    {viewMode === 'day' && range.label}
                  </p>
                  {viewMode !== 'day' && (
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', marginTop: '4px' }}>{range.label}</p>
                  )}
                </div>

                <h3 className="px-5 flex-shrink-0" style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>
                  {listTitle}
                </h3>
                <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-2" style={{ paddingTop: '2px' }}>
                  {mergedMeetings.length === 0 ? (
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', textAlign: 'center', padding: '16px' }}>
                      NO MEETINGS IN THIS RANGE.
                    </p>
                  ) : (
                    mergedMeetings.map((meeting, idx) => {
                      const showDateChip = viewMode !== 'day' && (idx === 0 || mergedMeetings[idx - 1].date !== meeting.date);
                      return (
                        <div key={meeting.id}>
                          {showDateChip && (
                            <div
                              className="py-2 mt-1"
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                color: '#000',
                                borderBottom: '1px solid #e5e7eb',
                              }}
                            >
                              {formatHeaderDate(meeting.date)}
                            </div>
                          )}
                          <div className="py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24' }}>{meeting.time}</span>
                                <span
                                  className="ml-2 px-2 py-0.5 rounded"
                                  style={{
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '10px',
                                    backgroundColor:
                                      meeting.status === 'Confirmed'
                                        ? 'rgba(34,197,94,0.15)'
                                        : meeting.status === 'Canceled'
                                          ? 'rgba(107,114,128,0.15)'
                                          : 'rgba(234,179,8,0.15)',
                                    color:
                                      meeting.status === 'Confirmed'
                                        ? '#16a34a'
                                        : meeting.status === 'Canceled'
                                          ? '#6b7280'
                                          : '#ca8a04',
                                  }}
                                >
                                  {meeting.status}
                                </span>
                                <span
                                  className="ml-2 px-2 py-0.5 rounded"
                                  style={{
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '9px',
                                    backgroundColor: meeting.category === 'consultation' ? 'rgba(235,28,36,0.12)' : 'rgba(0,0,0,0.06)',
                                    color: meeting.category === 'consultation' ? '#EB1C24' : '#374151',
                                  }}
                                >
                                  {meeting.category === 'consultation' ? 'CONSULT' : 'APPT'}
                                </span>
                                <p className="mt-1" style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000' }}>{meeting.client}</p>
                                <p className="mt-0.5" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{meeting.type} • {meeting.duration}</p>
                                <p className="mt-0.5" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{meeting.notes}</p>
                              </div>
                              <div className="flex flex-col gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openEdit(meeting)}
                                  className="px-2 py-1 border"
                                  style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', color: '#808080' }}
                                >
                                  EDIT
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div
                  className="flex-shrink-0"
                  style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '12px', marginLeft: '12px', marginRight: '12px', paddingBottom: '4px' }}
                >
                  <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '10px' }}>QUICK SCHEDULE</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => openSchedule('consultation')}
                      className="flex items-center justify-center gap-2 p-3 border"
                      style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#000', borderWidth: '1.3px', color: '#000' }}
                    >
                      <span style={{ color: '#EB1C24' }}>●</span>
                      CONSULTATION (WIG CONSULT)
                    </button>
                    <button
                      type="button"
                      onClick={() => openSchedule('appointment')}
                      className="flex items-center justify-center gap-2 p-3 border"
                      style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#000', borderWidth: '1.3px', color: '#000' }}
                    >
                      <span style={{ color: '#EB1C24' }}>●</span>
                      APPOINTMENT (INSTALL, BROWS, LASHES, TRAVEL, BRAIDS, MAKEUP…)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function timeToSortKey(t: string): number {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}
