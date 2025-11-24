
import { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';

export default function AdminClientsAccount() {
  const [activeTab, setActiveTab] = useState('profile');

  // Mock client data
  const clientData = {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    status: 'Active',
    membershipType: 'Premium',
    joinDate: '2023-05-15',
    totalOrders: 3,
    totalSpent: 2340,
    lastOrder: '2024-01-15'
  };

  const orderHistory = [
    {
      id: '#001',
      date: '2024-01-15',
      product: 'Premium NOIR Wig',
      amount: 860,
      status: 'Completed'
    },
    {
      id: '#002',
      date: '2023-12-20',
      product: 'Body Wave 24"',
      amount: 720,
      status: 'Completed'
    },
    {
      id: '#003',
      date: '2023-10-10',
      product: 'Silky Straight 20"',
      amount: 760,
      status: 'Completed'
    }
  ];

  const appointments = [
    {
      date: '2024-01-20',
      time: '2:00 PM',
      type: 'Consultation',
      status: 'Scheduled'
    },
    {
      date: '2024-01-05',
      time: '10:30 AM',
      type: 'Fitting',
      status: 'Completed'
    }
  ];

  const handleEditClient = () => {
    alert('Edit client functionality');
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
        <AdminHeader title="CLIENT DETAILS" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {/* Client Account Content */}
            <div className="bg-white/60 backdrop-blur-sm border border-black p-6" style={{ borderWidth: '1.4px' }}>
              {/* Client Header */}
              <div className="bg-white border border-gray-200 p-4 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-lg font-bold" style={{ color: '#EB1C24' }}>{clientData.name}</h2>
                      {clientData.membershipType === 'Premium' && (
                        <i className="ri-vip-crown-line text-lg" style={{ color: '#EB1C24' }}></i>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{clientData.email}</p>
                    <p className="text-sm text-gray-600">{clientData.phone}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded ${
                    clientData.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {clientData.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>{clientData.totalOrders}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>${clientData.totalSpent}</p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>{clientData.membershipType}</p>
                    <p className="text-xs text-gray-600">Membership</p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'profile' 
                      ? 'border-b-2 border-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'orders' 
                      ? 'border-b-2 border-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'appointments' 
                      ? 'border-b-2 border-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`}
                >
                  Appointments
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 p-4">
                    <h3 className="font-bold mb-4">Personal Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">{clientData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{clientData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{clientData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{clientData.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Join Date:</span>
                        <span className="font-medium">{clientData.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orderHistory.map((order, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{order.product}</h4>
                          <p className="text-xs text-gray-600">{order.id} - {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm" style={{ color: '#EB1C24' }}>${order.amount}</p>
                          <p className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-3">
                  {appointments.map((appointment, index) => (
                    <div key={index} className="bg-white border border-gray-200 p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-sm">{appointment.type}</h4>
                          <p className="text-xs text-gray-600">{appointment.date} at {appointment.time}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
