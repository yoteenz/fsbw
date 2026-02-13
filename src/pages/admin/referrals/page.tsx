import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';

type ReferralEntry = {
  referrerEmail: string;
  referredEmail: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  status: string;
  date: string;
};

export default function AdminReferralsPage() {
  const [log, setLog] = useState<ReferralEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('referralEarnings');
      const data = raw ? JSON.parse(raw) : [];
      setLog(Array.isArray(data) ? data : []);
    } catch {
      setLog([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmed = log.filter(e => e.status === 'confirmed');
  const totalEarned = confirmed.reduce((sum, e) => sum + (e.amount || 0), 0);
  const inviteeCount = confirmed.length;
  const byReferrer = confirmed.reduce((acc, e) => {
    const email = (e.referrerEmail || '').trim().toLowerCase();
    if (!acc[email]) acc[email] = { count: 0, earned: 0 };
    acc[email].count += 1;
    acc[email].earned += e.amount || 0;
    return acc;
  }, {} as Record<string, { count: number; earned: number }>);

  return (
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
      <div className="relative z-10">
        <AdminHeader title="REFERRALS" showBack onBack={() => window.history.back()} />
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {loading ? (
              <div className="bg-white/60 backdrop-blur-sm border border-black px-4 py-6" style={{ borderWidth: '1.4px' }}>
                <p className="text-sm font-futura uppercase">Loading referral data...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.4px' }}>
                    <p className="text-xs font-futura uppercase text-gray-500 mb-1">Total invitees</p>
                    <p className="text-xl font-covered-by-your-grace" style={{ color: '#EB1C24' }}>{inviteeCount}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.4px' }}>
                    <p className="text-xs font-futura uppercase text-gray-500 mb-1">Total paid out</p>
                    <p className="text-xl font-covered-by-your-grace" style={{ color: '#EB1C24' }}>${totalEarned}</p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm border border-black mb-4" style={{ borderWidth: '1.4px' }}>
                  <h3 className="font-futura font-bold uppercase text-black border-b border-gray-200 px-4 py-3" style={{ fontSize: '11px' }}>
                    By referrer
                  </h3>
                  <div className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                    {Object.entries(byReferrer).length === 0 ? (
                      <p className="px-4 py-6 text-sm font-futura text-gray-500">No referral earnings yet.</p>
                    ) : (
                      Object.entries(byReferrer).map(([email, { count, earned }]) => (
                        <div key={email} className="px-4 py-3 flex justify-between items-center">
                          <span className="text-xs font-futura text-black truncate flex-1 mr-2">{email}</span>
                          <span className="text-xs font-futura text-gray-500">Invitees: {count}</span>
                          <span className="text-xs font-futura" style={{ color: '#EB1C24' }}>${earned}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm border border-black" style={{ borderWidth: '1.4px' }}>
                  <h3 className="font-futura font-bold uppercase text-black border-b border-gray-200 px-4 py-3" style={{ fontSize: '11px' }}>
                    Recent referral activity
                  </h3>
                  <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    {confirmed.length === 0 ? (
                      <p className="px-4 py-6 text-sm font-futura text-gray-500">No confirmed referrals yet.</p>
                    ) : (
                      [...confirmed]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 20)
                        .map((e, i) => (
                          <div key={i} className="px-4 py-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-futura text-black truncate">Referrer: {e.referrerEmail}</p>
                                <p className="text-xs font-futura text-gray-500 truncate">Referred: {e.referredEmail || '—'}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-futura" style={{ color: '#EB1C24' }}>${e.amount}</p>
                                <p className="text-xs font-futura text-gray-400">
                                  {e.orderNumber || e.orderId || '—'}
                                </p>
                                <p className="text-xs font-futura text-gray-400">
                                  {e.date ? new Date(e.date).toLocaleDateString() : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
