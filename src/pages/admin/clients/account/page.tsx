import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { isAyoteenzAdminAccount } from '../../../../utils/adminAuth';
import { formatBirthday } from '../../../../utils/formatBirthday';
import { getMockClientsForAyoteenz } from '../page';

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
                        <div className="bg-white border border-gray-200 p-4 text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>
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
