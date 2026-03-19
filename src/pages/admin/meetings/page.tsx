import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminMeetings } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

const MEETING_TABS = ['DAY', 'WEEK'] as const;

export default function AdminMeetings() {
  useRequireAdminPageAccess();
  const [selectedDate, setSelectedDate] = useState('2024-01-20');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const defaultMeetings = [
    { id: 1, time: '9:00 AM', client: 'Sarah Johnson', type: 'Consultation', duration: '60 min', status: 'Confirmed', notes: 'Initial consultation for custom wig' },
    { id: 2, time: '11:30 AM', client: 'Maria Garcia', type: 'Fitting', duration: '45 min', status: 'Confirmed', notes: 'Final fitting and adjustments' },
    { id: 3, time: '2:00 PM', client: 'Ashley Brown', type: 'Color Match', duration: '30 min', status: 'Pending', notes: 'Color matching session' },
    { id: 4, time: '4:00 PM', client: 'Jennifer Davis', type: 'Delivery', duration: '30 min', status: 'Confirmed', notes: 'Product delivery and styling tips' },
  ];
  const [meetings, setMeetings] = useState(defaultMeetings);

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
          if (r.meetings.length > 0) setMeetings(r.meetings as typeof defaultMeetings);
        })
        .catch(() => {});
    }
  }, []);

  const handleEditMeeting = (meetingId: number) => {
    alert(`Edit meeting ${meetingId}`);
  };

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
            {/* Main card */}
            <div
              className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)', maxHeight: 'calc(100vh - 140px)' }}
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
                  <path d="M7.5 6V1M17.5 6V1M21.5 17V21.5H3.5V18.5M21.363 8.5H3.352M0.5 18.25V18.5H18.4L18.55 18.25L18.784 17.759C20.5722 14.0007 21.5 9.89102 21.5 5.729V3.5H3.5V5.628C3.50004 9.82218 2.55784 13.9628 0.743 17.744L0.5 18.25Z" stroke="#EB1C24"/>
                </svg>
              </div>
              <div className="flex-shrink-0" style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Cards above tabs */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{meetings.length}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>TODAY</p>
                  </div>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{meetings.filter(m => m.status === 'Confirmed').length}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>CONFIRMED</p>
                  </div>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{meetings.filter(m => m.status === 'Pending').length}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>PENDING</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {MEETING_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setViewMode(tab.toLowerCase() as 'day' | 'week')}
                    className="py-3 px-2 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: viewMode === tab.toLowerCase() ? '#EB1C24' : '#808080',
                      border: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        borderBottom: viewMode === tab.toLowerCase() ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              {/* Scrollable area: date, meetings list, quick schedule */}
              <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '8px', boxSizing: 'border-box' }}>
                <div className="px-5 pb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border"
                  style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                />
              </div>

              <h3 className="px-5" style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>TODAY&apos;S MEETINGS</h3>
              <div className="overflow-y-auto px-5 pb-4" style={{ maxHeight: '220px', paddingTop: '2px' }}>
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="py-3"
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24' }}>{meeting.time}</span>
                        <span className="ml-2 px-2 py-0.5 rounded" style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          backgroundColor: meeting.status === 'Confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                          color: meeting.status === 'Confirmed' ? '#16a34a' : '#ca8a04',
                        }}>
                          {meeting.status}
                        </span>
                        <p className="mt-1" style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000' }}>{meeting.client.toUpperCase()}</p>
                        <p className="mt-0.5" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{meeting.type} • {meeting.duration}</p>
                        <p className="mt-0.5" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{meeting.notes}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEditMeeting(meeting.id)}
                          className="px-2 py-1 border"
                          style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', color: '#808080' }}
                        >
                          EDIT
                        </button>
                        <button className="px-2 py-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', backgroundColor: '#EB1C24', color: '#fff', border: 'none' }}>
                          DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '12px', paddingTop: '12px', marginLeft: '20px', marginRight: '20px' }}>
                <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '10px' }}>QUICK SCHEDULE</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 p-3 border" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', color: '#000' }}>
                    <span style={{ color: '#EB1C24' }}>●</span> CONSULTATION
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 border" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', color: '#000' }}>
                    <span style={{ color: '#EB1C24' }}>●</span> FITTING
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 border" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', color: '#000' }}>
                    <span style={{ color: '#EB1C24' }}>●</span> COLOR MATCH
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 border" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb', color: '#000' }}>
                    <span style={{ color: '#EB1C24' }}>●</span> DELIVERY
                  </button>
                </div>
              </div>
              </div>
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                onClick={() => alert('Quick schedule')}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={pageActionButtonStyle}
              >
                QUICK SCHEDULE
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}

