import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import StatsCard from '../components/StatsCard';

export default function AdminClients() {
  const navigate = useNavigate();
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<any[]>([]);

  const loadData = useCallback(() => {
    try {
      let reg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (!Array.isArray(reg)) reg = [];
      const currentUserRaw = localStorage.getItem('currentUser');
      const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
      if (currentUser?.email && !reg.some((u: any) => (u.email || '').toLowerCase() === (currentUser.email || '').toLowerCase())) {
        reg = [...reg, currentUser];
        localStorage.setItem('registeredUsers', JSON.stringify(reg));
      }
      const del = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
      setRegisteredUsers(reg);
      setDeletedUsers(Array.isArray(del) ? del : []);
    } catch {
      setRegisteredUsers([]);
      setDeletedUsers([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onStorage = () => loadData();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onStorage);
    };
  }, [loadData]);

  const activeCount = registeredUsers.length;
  const deletedCount = deletedUsers.length;
  const totalEver = activeCount + deletedCount;
  const premiumCount = registeredUsers.filter((u: any) => (u.membershipType || '').toUpperCase() === 'PREMIUM').length;
  const standardCount = registeredUsers.filter((u: any) => (u.membershipType || '').toUpperCase() === 'STANDARD').length;
  const now = Date.now();
  const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
  const newThisMonth = registeredUsers.filter((u: any) => {
    const created = u.createdAt ? new Date(u.createdAt).getTime() : 0;
    return created && created >= now - oneMonthMs;
  }).length;

  const clientStats = [
    {
      title: 'TOTAL CLIENTS',
      count: String(totalEver),
      items: [
        { label: 'ACTIVE CLIENTS', value: String(activeCount), color: 'text-gray-500' },
        { label: 'DELETED', value: String(deletedCount), color: deletedCount > 0 ? 'text-red-500' : 'text-gray-500' },
        { label: 'NEW THIS MONTH', value: String(newThisMonth), color: 'text-red-500' },
        { label: 'PREMIUM', value: String(premiumCount), color: 'text-red-500' }
      ],
      highlight: deletedCount > 0 ? `${deletedCount} DELETED – VIEW BELOW` : 'LIVE DATA FROM REGISTERED & DELETED ACCOUNTS',
      tiers: [
        { label: 'PREMIUM', value: String(premiumCount), color: 'text-red-500' },
        { label: 'STANDARD', value: String(standardCount), color: 'text-gray-500' }
      ]
    },
    {
      title: 'MEMBERSHIP TIERS',
      count: '2',
      items: [
        { label: 'PREMIUM', value: `${premiumCount} clients`, color: 'text-red-500' },
        { label: 'STANDARD', value: `${standardCount} clients`, color: 'text-gray-500' }
      ],
      highlight: 'LIVE DATA FROM REGISTERED ACCOUNTS'
    },
    {
      title: 'DELETED ACCOUNTS',
      count: String(deletedCount),
      items: [
        { label: 'TOTAL DELETED', value: String(deletedCount), color: deletedCount > 0 ? 'text-red-500' : 'text-gray-500' }
      ],
      activity: 'USE BUTTON BELOW TO VIEW AND RESTORE'
    }
  ];

  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case 'TOTAL CLIENTS':
        navigate('/admin/clients/account');
        break;
      case 'MEMBERSHIP TIERS':
        navigate('/admin/clients/account');
        break;
      case 'DELETED ACCOUNTS':
        navigate('/admin/clients/deleted');
        break;
      default:
        break;
    }
  };

  return (
    <>
    <div className="min-h-screen" style={{
      position: 'relative'
    }}>
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Scrollable Content */}
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader title="CLIENTS" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {clientStats.map((stat, index) => (
                <StatsCard key={index} data={stat} onCardClick={handleCardClick} />
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/clients/deleted')}
                className="w-full py-3 border border-black bg-white/60 backdrop-blur-sm font-medium hover:bg-white/80 transition-colors text-sm"
                style={{ borderWidth: '1.3px', color: '#EB1C24', textTransform: 'uppercase' }}
              >
                View deleted accounts
              </button>
            </div>

            {/* Client list: all registered users (email + OAuth). Stored per browser – sign in with each account in this browser to see them here. */}
            <div className="mt-6 bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.3px' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#EB1C24' }}>All active clients ({registeredUsers.length})</h3>
              <p className="text-xs text-gray-600 mb-3">List is per browser. To see an OAuth account (e.g. yoteenz@gmail.com), sign in with Google or Facebook in this same browser once, then sign back in as admin.</p>
              {registeredUsers.length === 0 ? (
                <p className="text-sm text-gray-600">No registered clients yet.</p>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {registeredUsers.map((u: any) => (
                    <li key={u.email || u.id} className="text-sm border-b border-gray-200 pb-2 last:border-0">
                      <span className="font-medium">{(u.firstName || '') + ' ' + (u.lastName || '')}</span>
                      {((u.firstName || u.lastName) && (u.email || u.authProvider)) && ' · '}
                      <span className="text-gray-700">{u.email || '(no email)'}</span>
                      {u.authProvider && (
                        <span className="ml-1 text-xs" style={{ color: '#EB1C24' }}>({u.authProvider})</span>
                      )}
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {(u.membershipType || 'STANDARD')} · joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}