import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { getAdminClients } from '../../../utils/api';
import { getAdminNotifications, postAdminNotification } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

type NotifEntry = { userId: string; items: Array<{ id?: string; text?: string; read?: boolean; createdAt?: string }>; updatedAt?: string };

export default function AdminNotifications() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [list, setList] = useState<NotifEntry[]>([]);
  const [clients, setClients] = useState<Array<{ id?: string; email?: string; firstName?: string; lastName?: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (!currentUser?.email || !isAdminEmail(currentUser.email) || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    Promise.all([getAdminNotifications(), getAdminClients()])
      .then(([notifs, res]) => {
        setList(Array.isArray(notifs) ? (notifs as NotifEntry[]) : []);
        const clientList = res?.clients ?? [];
        setClients(Array.isArray(clientList) ? clientList : []);
        if (clientList?.length && !selectedUserId) setSelectedUserId((clientList[0] as { id?: string }).id || '');
      })
      .catch(() => {
        setList([]);
        setClients([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
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
      setList(Array.isArray(updated) ? (updated as NotifEntry[]) : []);
    } catch (e) {
      setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Send failed' });
    } finally {
      setSending(false);
    }
  };

  const selectedClient = clients.find((c) => (c as { id?: string }).id === selectedUserId);
  const selectedNotifs = list.find((n) => n.userId === selectedUserId)?.items ?? [];

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
          title="NOTIFICATIONS"
          showBack
          onBack={() => navigate('/admin/dashboard')}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: '200px' }}
            >
              <div className="px-5 pt-4 pb-2">
                <h2 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', margin: 0 }}>SEND NOTIFICATION</h2>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {feedback && (
                <div
                  className="mx-5 mb-3 px-3 py-2 text-sm"
                  style={{
                    backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: feedback.type === 'success' ? '#166534' : '#b91c1c',
                  }}
                >
                  {feedback.msg}
                </div>
              )}

              {loading ? (
                <p className="px-5 py-6 text-gray-500 text-sm">Loading...</p>
              ) : (
                <>
                  <div className="px-5 space-y-3">
                    <label className="block text-xs text-gray-700" style={{ fontFamily: '"Futura PT Medium"' }}>User</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      style={{ fontFamily: '"Futura PT Book"' }}
                    >
                      <option value="">Select a client</option>
                      {clients.map((c) => (
                        <option key={(c as { id?: string }).id} value={(c as { id?: string }).id}>
                          {(c as { email?: string }).email} {((c as { firstName?: string }).firstName || (c as { lastName?: string }).lastName) ? `(${(c as { firstName?: string }).firstName} ${(c as { lastName?: string }).lastName})` : ''}
                        </option>
                      ))}
                    </select>
                    <label className="block text-xs text-gray-700 mt-2" style={{ fontFamily: '"Futura PT Medium"' }}>Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      style={{ fontFamily: '"Futura PT Book"' }}
                    />
                    <button
                      type="button"
                      disabled={sending || !selectedUserId || !message.trim()}
                      onClick={handleSend}
                      className="w-full py-2 text-sm font-medium rounded border border-black text-black disabled:opacity-50"
                      style={{ fontFamily: '"Futura PT Medium"' }}
                    >
                      {sending ? 'Sending...' : 'Send notification'}
                    </button>
                  </div>

                  {selectedClient && selectedNotifs.length > 0 && (
                    <>
                      <div className="px-5 pt-6 pb-1">
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#000', fontSize: '11px', margin: 0 }}>RECENT FOR THIS USER</h3>
                      </div>
                      <div className="px-5 pb-4 space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
