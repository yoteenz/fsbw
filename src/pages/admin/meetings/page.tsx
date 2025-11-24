
import { useState } from 'react';
import AdminHeader from '../components/AdminHeader';

export default function AdminMeetings() {
  const [selectedDate, setSelectedDate] = useState('2024-01-20');
  const [viewMode, setViewMode] = useState('day');

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

  const handleNewMeeting = () => {
    alert('Schedule new meeting functionality');
  };

  const handleEditMeeting = (meetingId: number) => {
    alert(`Edit meeting ${meetingId}`);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('https://www.dropbox.com/scl/fi/u4m42t2levejhysa3mnby/Marble-Floor.jpg?rlkey=j87posj7qo7fed7v6vihe09kr&st=uzmjl2p3&dl=1')`,
          backgroundSize: '500% auto',
          backgroundPosition: 'right 140%',
          backgroundRepeat: 'repeat-y'
        }}
      ></div>
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        <AdminHeader title="MEETING SCHEDULER" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {/* Meetings Content */}
            <div className="bg-white/60 backdrop-blur-sm border border-black p-6" style={{ borderWidth: '1.4px' }}>
              <h2 className="text-center text-xl font-bold mb-6" style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24' }}>
                Meeting Scheduler
              </h2>
              
              {/* Date Selector */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Schedule for {selectedDate}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('day')}
                      className={`px-3 py-1 text-xs ${viewMode === 'day' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'} border`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-1 text-xs ${viewMode === 'week' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'} border`}
                    >
                      Week
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 text-sm"
                />
              </div>

              {/* Meeting Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 p-3 text-center">
                  <p className="text-xl font-bold" style={{ color: '#EB1C24' }}>{meetings.length}</p>
                  <p className="text-xs text-gray-600">Today's Meetings</p>
                </div>
                <div className="bg-white border border-gray-200 p-3 text-center">
                  <p className="text-xl font-bold text-green-600">{meetings.filter(m => m.status === 'Confirmed').length}</p>
                  <p className="text-xs text-gray-600">Confirmed</p>
                </div>
                <div className="bg-white border border-gray-200 p-3 text-center">
                  <p className="text-xl font-bold text-yellow-600">{meetings.filter(m => m.status === 'Pending').length}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>

              {/* Meeting List */}
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white border border-gray-200 p-4" style={{ borderWidth: '1px' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-sm">{meeting.time}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            meeting.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            meeting.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{meeting.client}</h4>
                        <p className="text-xs text-gray-600 mb-1">{meeting.type} • {meeting.duration}</p>
                        <p className="text-xs text-gray-500">{meeting.notes}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMeeting(meeting.id)}
                          className="text-xs px-2 py-1 border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button className="text-xs px-2 py-1 text-white" style={{ backgroundColor: '#EB1C24' }}>
                          Details
                        </button>
                      </div>
                    </div>
                    
                    {/* Meeting Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="flex space-x-3 text-xs">
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500">
                          <i className="ri-phone-line"></i>
                          <span>Call</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500">
                          <i className="ri-message-line"></i>
                          <span>Message</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500">
                          <i className="ri-map-pin-line"></i>
                          <span>Location</span>
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {meeting.type === 'Consultation' && <i className="ri-chat-3-line"></i>}
                        {meeting.type === 'Fitting' && <i className="ri-scissors-line"></i>}
                        {meeting.type === 'Color Match' && <i className="ri-palette-line"></i>}
                        {meeting.type === 'Delivery' && <i className="ri-truck-line"></i>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Schedule */}
              <div className="mt-6 bg-gray-50 border border-gray-200 p-4">
                <h3 className="font-bold mb-3">Quick Schedule</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 bg-white hover:bg-gray-50">
                    <i className="ri-chat-3-line" style={{ color: '#EB1C24' }}></i>
                    <span className="text-sm">Consultation</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 bg-white hover:bg-gray-50">
                    <i className="ri-scissors-line" style={{ color: '#EB1C24' }}></i>
                    <span className="text-sm">Fitting</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 bg-white hover:bg-gray-50">
                    <i className="ri-palette-line" style={{ color: '#EB1C24' }}></i>
                    <span className="text-sm">Color Match</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 bg-white hover:bg-gray-50">
                    <i className="ri-truck-line" style={{ color: '#EB1C24' }}></i>
                    <span className="text-sm">Delivery</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

