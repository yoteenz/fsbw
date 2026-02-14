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
      const reg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const del = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
      setRegisteredUsers(Array.isArray(reg) ? reg : []);
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
          </div>
        </div>
      </div>
    </div>
    </>
  );
}