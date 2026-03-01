import { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';

const MEETING_TABS = ['DAY', 'WEEK'] as const;

export default function AdminMeetings() {
  const [selectedDate, setSelectedDate] = useState('2024-01-20');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const meetings = [
    {
      id: 1,
      time: '9:00 AM',
      client: 'Sarah Johnson',
      type: 'Consultation',
      duration: '60 min',
      status: 'Confirmed',
      notes: 'Initial consultation for custom wig'
    },
    {
      id: 2,
      time: '11:30 AM',
      client: 'Maria Garcia',
      type: 'Fitting',
      duration: '45 min',
      status: 'Confirmed',
      notes: 'Final fitting and adjustments'
    },
    {
      id: 3,
      time: '2:00 PM',
      client: 'Ashley Brown',
      type: 'Color Match',
      duration: '30 min',
      status: 'Pending',
      notes: 'Color matching session'
    },
    {
      id: 4,
      time: '4:00 PM',
      client: 'Jennifer Davis',
      type: 'Delivery',
      duration: '30 min',
      status: 'Confirmed',
      notes: 'Product delivery and styling tips'
    }
  ];

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
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4" style={{ marginBottom: 0 }}>
                <h2
                  className="flex-1"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  MEETINGS
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '8px' }}>
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" fill="#EB1C24" />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              <div className="flex px-5">
                {MEETING_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setViewMode(tab.toLowerCase() as 'day' | 'week')}
                    className="flex-1 py-3 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
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

              <div className="px-5 pb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border"
                  style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', borderColor: '#e5e7eb' }}
                />
              </div>

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

              <h3 className="px-5" style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>TODAY&apos;S MEETINGS</h3>
              <div className="overflow-y-auto px-5 pb-4" style={{ maxHeight: '220px' }}>
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

            <button
              type="button"
              onClick={() => alert('Quick schedule')}
              className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
              style={{ ...pageActionButtonStyle, marginTop: '14px' }}
            >
              QUICK SCHEDULE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

