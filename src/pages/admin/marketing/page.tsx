import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { getAdminClients, getAdminNotifications, postAdminNotification } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

const MARKETING_TABS = ['AFFILIATE', 'CHALLENGES', 'OFFERS', 'ALERTS'] as const;

type NotifEntry = { userId: string; items: Array<{ id?: string; text?: string; read?: boolean; createdAt?: string }>; updatedAt?: string };

// Per-tab placeholder stats (sales & orders from that marketing option) – can be wired to API later
const TAB_STATS: Record<typeof MARKETING_TABS[number], { sales: number; orders: number }> = {
  AFFILIATE: { sales: 0, orders: 0 },
  CHALLENGES: { sales: 0, orders: 0 },
  OFFERS: { sales: 0, orders: 0 },
  ALERTS: { sales: 0, orders: 0 },
};

export default function AdminMarketing() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof MARKETING_TABS[number]>('AFFILIATE');

  // Messages (notifications) state
  const [notifList, setNotifList] = useState<NotifEntry[]>([]);
  const [clients, setClients] = useState<Array<{ id?: string; email?: string; firstName?: string; lastName?: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (activeTab !== 'MESSAGES' || !currentUser?.email || !isAdminEmail(currentUser.email) || !isSupabaseConfigured()) {
      return;
    }
    setLoadingNotifs(true);
    Promise.all([getAdminNotifications(), getAdminClients()])
      .then(([notifs, res]) => {
        setNotifList(Array.isArray(notifs) ? (notifs as NotifEntry[]) : []);
        const clientList = res?.clients ?? [];
        setClients(Array.isArray(clientList) ? clientList : []);
        if (clientList?.length && !selectedUserId) setSelectedUserId((clientList[0] as { id?: string }).id || '');
      })
      .catch(() => {
        setNotifList([]);
        setClients([]);
      })
      .finally(() => setLoadingNotifs(false));
  }, [activeTab]);

  const handleSendNotif = async () => {
    if (!selectedUserId || !message.trim()) {
      setFeedback({ type: 'error', msg: 'Select a user and enter a message.' });
      return;
    }
    setSending(true);
    setFeedback(null);
    try {
      await postAdminNotification(selectedUserId, message.trim());
      setFeedback({ type: 'success', msg: 'Notification sent.' });
      setMessage('');
      const updated = await getAdminNotifications();
      setNotifList(Array.isArray(updated) ? (updated as NotifEntry[]) : []);
    } catch (e) {
      setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Send failed' });
    } finally {
      setSending(false);
    }
  };

  const stats = TAB_STATS[activeTab];
  const selectedClient = clients.find((c) => (c as { id?: string }).id === selectedUserId);
  const selectedNotifs = notifList.find((n) => n.userId === selectedUserId)?.items ?? [];

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
          title="MARKETING"
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
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
                  MARKETING
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '8px' }}>
                  <path d="M11 3v10h2V3h-2zm0 12v4h2v-4h-2zM3 7h2v10H3V7zm14 0h2v10h-2V7zM7 3v4h2V3H7zm8 0v4h2V3h-2z" fill="#EB1C24" />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Stats banner: sales & orders for this tab's marketing option */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4">
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>${stats.sales.toLocaleString()}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>SALES</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{stats.orders}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>ORDERS</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 px-5">
                {MARKETING_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="py-3 px-2 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: activeTab === tab ? '#EB1C24' : '#808080',
                      border: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        borderBottom: activeTab === tab ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px' }}>
                {activeTab === 'AFFILIATE' && (
                  <div className="py-4">
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>
                      Affiliate program stats and settings. Sales and orders attributed to affiliate campaigns appear above.
                    </p>
                  </div>
                )}

                {activeTab === 'CHALLENGES' && (
                  <div className="py-4">
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>
                      Slay Challenge and other campaigns. Sales and orders from challenges appear above.
                    </p>
                  </div>
                )}

                {activeTab === 'OFFERS' && (
                  <div className="py-4 space-y-3">
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>
                      Configure special offers (product, options, thumbnail, start date). Sales and orders from offers appear above.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/marketing/offers')}
                      className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                      style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', textTransform: 'uppercase' }}
                    >
                      CONFIGURE SPECIAL OFFER
                    </button>
                  </div>
                )}

                {activeTab === 'ALERTS' && (
                  <div className="py-2">
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>SEND NOTIFICATION</h3>
                    {feedback && (
                      <div
                        className="mb-3 px-3 py-2 text-sm"
                        style={{
                          backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: feedback.type === 'success' ? '#166534' : '#b91c1c',
                        }}
                      >
                        {feedback.msg}
                      </div>
                    )}
                    {loadingNotifs ? (
                      <p className="text-gray-500 text-sm">Loading...</p>
                    ) : (
                      <>
                        <label className="block text-xs text-gray-700 mt-2" style={{ fontFamily: '"Futura PT Medium"' }}>User</label>
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3"
                          style={{ fontFamily: '"Futura PT Book"' }}
                        >
                          <option value="">Select a client</option>
                          {clients.map((c) => (
                            <option key={(c as { id?: string }).id} value={(c as { id?: string }).id}>
                              {(c as { email?: string }).email} {((c as { firstName?: string }).firstName || (c as { lastName?: string }).lastName) ? `(${(c as { firstName?: string }).firstName} ${(c as { lastName?: string }).lastName})` : ''}
                            </option>
                          ))}
                        </select>
                        <label className="block text-xs text-gray-700" style={{ fontFamily: '"Futura PT Medium"' }}>Message</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Enter notification text..."
                          rows={3}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1 mb-3"
                          style={{ fontFamily: '"Futura PT Book"' }}
                        />
                        <button
                          type="button"
                          disabled={sending || !selectedUserId || !message.trim()}
                          onClick={handleSendNotif}
                          className="w-full py-2 text-sm font-medium rounded border border-black text-black disabled:opacity-50"
                          style={{ fontFamily: '"Futura PT Medium"' }}
                        >
                          {sending ? 'Sending...' : 'Send notification'}
                        </button>
                        {selectedClient && selectedNotifs.length > 0 && (
                          <>
                            <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#000', fontSize: '11px', marginTop: '16px', marginBottom: '6px' }}>RECENT FOR THIS USER</h3>
                            <div className="space-y-2">
                              {selectedNotifs.slice(-10).reverse().map((item, i) => (
                                <div key={item.id || i} className="border border-gray-200 rounded p-2 text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                                  {item.text || '—'}
                                  {item.createdAt && <p className="text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
