
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { isAyoteenzAdminAccount } from '../../../../utils/adminAuth';
import { formatBirthday } from '../../../../utils/formatBirthday';

function getMockClientsForAyoteenz(): any[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    { id: 'mock-1', email: 'mock1@test.com', firstName: 'Zara', lastName: 'Adams', membershipType: 'PREMIUM', totalSpent: 4200, ordersCount: 5, createdAt: new Date(now - 2 * day).toISOString() },
    { id: 'mock-2', email: 'mock2@test.com', firstName: 'Amy', lastName: 'Brooks', membershipType: 'STANDARD', totalSpent: 890, ordersCount: 2, createdAt: new Date(now - 10 * day).toISOString() },
    { id: 'mock-3', email: 'mock3@test.com', firstName: 'Quinn', lastName: 'Chen', membershipType: 'PREMIUM', totalSpent: 3100, ordersCount: 4, createdAt: new Date(now - 1 * day).toISOString() },
    { id: 'mock-4', email: 'mock4@test.com', firstName: 'Diana', lastName: 'Foster', membershipType: 'STANDARD', totalSpent: 1500, ordersCount: 3, createdAt: new Date(now - 45 * day).toISOString() },
    { id: 'mock-5', email: 'mock5@test.com', firstName: 'Evan', lastName: 'Garcia', membershipType: 'PREMIUM', totalSpent: 5800, ordersCount: 8, createdAt: new Date(now - 5 * day).toISOString() },
    { id: 'mock-6', email: 'mock6@test.com', firstName: 'Fiona', lastName: 'Hayes', membershipType: 'STANDARD', totalSpent: 420, ordersCount: 1, createdAt: new Date(now - 90 * day).toISOString() },
    { id: 'mock-7', email: 'mock7@test.com', firstName: 'Grant', lastName: 'Ingram', membershipType: 'PREMIUM', totalSpent: 2100, ordersCount: 3, createdAt: new Date(now - 3 * day).toISOString() },
    { id: 'mock-8', email: 'mock8@test.com', firstName: 'Hannah', lastName: 'Jones', membershipType: 'STANDARD', totalSpent: 1200, ordersCount: 2, createdAt: new Date(now - 14 * day).toISOString() },
    { id: 'mock-9', email: 'mock9@test.com', firstName: 'Ivan', lastName: 'Kim', membershipType: 'PREMIUM', totalSpent: 6700, ordersCount: 6, createdAt: new Date(now - 7 * day).toISOString() },
    { id: 'mock-10', email: 'mock10@test.com', firstName: 'Julia', lastName: 'Lee', membershipType: 'STANDARD', totalSpent: 650, ordersCount: 1, createdAt: new Date(now - 21 * day).toISOString() },
    { id: 'mock-11', email: 'mock11@test.com', firstName: 'Kyle', lastName: 'Martinez', membershipType: 'PREMIUM', totalSpent: 3900, ordersCount: 5, createdAt: new Date(now - 4 * day).toISOString() },
    { id: 'mock-12', email: 'mock12@test.com', firstName: 'Luna', lastName: 'Nguyen', membershipType: 'STANDARD', totalSpent: 2100, ordersCount: 4, createdAt: new Date(now - 60 * day).toISOString() },
    { id: 'mock-13', email: 'mock13@test.com', firstName: 'Marcus', lastName: 'Owen', membershipType: 'PREMIUM', totalSpent: 5100, ordersCount: 7, createdAt: new Date(now - 1 * day).toISOString() },
    { id: 'mock-14', email: 'mock14@test.com', firstName: 'Nina', lastName: 'Patel', membershipType: 'STANDARD', totalSpent: 780, ordersCount: 2, createdAt: new Date(now - 30 * day).toISOString() },
    { id: 'mock-15', email: 'mock15@test.com', firstName: 'Oscar', lastName: 'Quinn', membershipType: 'PREMIUM', totalSpent: 4400, ordersCount: 5, createdAt: new Date(now - 6 * day).toISOString() },
    { id: 'mock-16', email: 'mock16@test.com', firstName: 'Paula', lastName: 'Rivera', membershipType: 'STANDARD', totalSpent: 3200, ordersCount: 6, createdAt: new Date(now - 120 * day).toISOString() },
    { id: 'mock-17', email: 'mock17@test.com', firstName: 'Ryan', lastName: 'Scott', membershipType: 'PREMIUM', totalSpent: 1900, ordersCount: 3, createdAt: new Date(now - 2 * day).toISOString() },
    { id: 'mock-18', email: 'mock18@test.com', firstName: 'Sara', lastName: 'Torres', membershipType: 'STANDARD', totalSpent: 1100, ordersCount: 2, createdAt: new Date(now - 8 * day).toISOString() },
    { id: 'mock-19', email: 'mock19@test.com', firstName: 'Tyler', lastName: 'Upton', membershipType: 'PREMIUM', totalSpent: 7200, ordersCount: 9, createdAt: new Date(now - 12 * day).toISOString() },
    { id: 'mock-20', email: 'mock20@test.com', firstName: 'Uma', lastName: 'Vance', membershipType: 'STANDARD', totalSpent: 340, ordersCount: 1, createdAt: new Date(now - 3 * day).toISOString() },
  ];
}

export default function AdminClientsAccount() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [activeTab, setActiveTab] = useState('profile');
  const [client, setClient] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  const loadClient = useCallback(() => {
    const email = emailParam.trim().toLowerCase();
    if (!email) {
      setClient(null);
      setOrderHistory([]);
      return;
    }
    try {
      let reg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (!Array.isArray(reg)) reg = [];
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (currentUser && isAyoteenzAdminAccount(currentUser)) {
        const mockClients = getMockClientsForAyoteenz();
        const mockByEmail = new Map(mockClients.map((m: any) => [(m.email || '').toLowerCase(), m]));
        reg = reg.map((u: any) => {
          const fresh = mockByEmail.get((u.email || '').toLowerCase());
          return fresh ? { ...u, ...fresh } : u;
        });
        const toAdd = mockClients.filter((m: any) => !reg.some((u: any) => (u.email || '').toLowerCase() === (m.email || '').toLowerCase()));
        reg = [...reg, ...toAdd];
      }
      const found = reg.find((u: any) => (u.email || '').toLowerCase() === email);
      setClient(found || null);

      const raw = localStorage.getItem(`userOrders_${email}`);
      const data = raw ? JSON.parse(raw) : null;
      const active = data?.activeOrders || [];
      const past = data?.pastOrders || [];
      const all = [...active, ...past].map((o: any, i: number) => ({
        id: `#${String(i + 1).padStart(3, '0')}`,
        date: o.date || o.createdAt || '—',
        product: o.items?.[0]?.name || o.productName || 'Order',
        amount: Number(o.total) || 0,
        status: (o.status || 'COMPLETED').toUpperCase(),
      }));
      setOrderHistory(all);
    } catch {
      setClient(null);
      setOrderHistory([]);
    }
  }, [emailParam]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const name = client
    ? ([(client.firstName || '').trim(), (client.lastName || '').trim()].filter(Boolean).join(' ') || client.email || '—').toUpperCase()
    : '—';
  const membershipType = (client?.membershipType || 'STANDARD').toUpperCase();
  const totalOrders = client?.ordersCount ?? orderHistory.length;
  const totalSpent = client?.totalSpent ?? orderHistory.reduce((s: number, o: any) => s + (o.amount || 0), 0);
  const joinDate = client?.createdAt ? new Date(client.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';
  const appointments = [
    { date: '2024-01-20', time: '2:00 PM', type: 'CONSULTATION', status: 'SCHEDULED' },
    { date: '2024-01-05', time: '10:30 AM', type: 'FITTING', status: 'COMPLETED' },
  ];

  return (
    <>
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader title="CLIENT DETAILS" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white/60 backdrop-blur-sm border border-black p-6" style={{ borderWidth: '1.3px', minHeight: 'calc(100dvh - 160px)' }}>
              {!client && emailParam ? (
                <div className="bg-white border border-gray-200 p-6 text-center">
                  <p className="text-sm text-gray-600">CLIENT NOT FOUND</p>
                  <p className="text-xs text-gray-500 mt-2">{emailParam}</p>
                </div>
              ) : !emailParam ? (
                <div className="bg-white border border-gray-200 p-6 text-center">
                  <p className="text-sm text-gray-600">NO CLIENT SELECTED</p>
                </div>
              ) : (
                <>
                  <div className="bg-white border border-gray-200 p-4 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h2 className="text-lg font-bold" style={{ color: '#EB1C24' }}>{name}</h2>
                          {membershipType === 'PREMIUM' && (
                            <i className="ri-vip-crown-line text-lg" style={{ color: '#EB1C24' }} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{(client?.email || '').toUpperCase()}</p>
                        <p className="text-sm text-gray-600">{(client?.phone || '—').toUpperCase()}</p>
                      </div>
                      <span className="px-3 py-1 text-xs rounded bg-green-100 text-green-800">
                        ACTIVE
                      </span>
                    </div>
                
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>{totalOrders}</p>
                        <p className="text-xs text-gray-600">ORDERS</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>${totalSpent.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">TOTAL SPENT</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>{membershipType}</p>
                        <p className="text-xs text-gray-600">MEMBERSHIP</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex mb-6 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`px-4 py-2 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
                    >
                      PROFILE
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`px-4 py-2 text-sm font-medium ${activeTab === 'orders' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
                    >
                      ORDERS
                    </button>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className={`px-4 py-2 text-sm font-medium ${activeTab === 'appointments' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
                    >
                      APPOINTMENTS
                    </button>
                  </div>

                  {activeTab === 'profile' && (
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 p-4">
                        <h3 className="font-bold mb-4">PERSONAL INFORMATION</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">FULL NAME:</span>
                            <span className="font-medium">{name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">EMAIL:</span>
                            <span className="font-medium">{(client?.email || '').toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">BIRTHDAY:</span>
                            <span className="font-medium">{formatBirthday(client)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">PHONE:</span>
                            <span className="font-medium">{(client?.phone || '—').toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ADDRESS:</span>
                            <span className="font-medium">{(client?.address || '—').toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">JOIN DATE:</span>
                            <span className="font-medium">{joinDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="space-y-3">
                      {orderHistory.length === 0 ? (
                        <div className="bg-white border border-gray-200 p-4 text-center text-sm text-gray-600">
                          NO ORDERS YET
                        </div>
                      ) : (
                        orderHistory.map((order, index) => (
                          <div key={index} className="bg-white border border-gray-200 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-sm">{(order.product || '').toUpperCase()}</h4>
                                <p className="text-xs text-gray-600">{order.id} - {order.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm" style={{ color: '#EB1C24' }}>${order.amount.toLocaleString()}</p>
                                <p className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{order.status}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'appointments' && (
                    <div className="space-y-3">
                      {appointments.map((appointment, index) => (
                        <div key={index} className="bg-white border border-gray-200 p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-sm">{appointment.type}</h4>
                              <p className="text-xs text-gray-600">{appointment.date} AT {appointment.time}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
