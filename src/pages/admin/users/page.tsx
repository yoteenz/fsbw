import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { getAdminUsers, postAdminUserAction } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';

type AuthUser = { id: string; email: string; created_at?: string; last_sign_in_at?: string; banned_until?: string; email_confirmed_at?: string };

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 50;

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
    setLoading(true);
    getAdminUsers(page, perPage)
      .then((r) => {
        setUsers(r.users);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load users');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const handleDisable = async (userId: string) => {
    if (!confirm('Disable this user? They will not be able to sign in until re-enabled.')) return;
    setActionFeedback(null);
    try {
      await postAdminUserAction('disable', { userId });
      setActionFeedback({ type: 'success', msg: 'User disabled.' });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned_until: 'banned' } : u)));
    } catch (e) {
      setActionFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Action failed' });
    }
  };

  const handleEnable = async (userId: string) => {
    setActionFeedback(null);
    try {
      await postAdminUserAction('enable', { userId });
      setActionFeedback({ type: 'success', msg: 'User re-enabled.' });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned_until: undefined } : u)));
    } catch (e) {
      setActionFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Action failed' });
    }
  };

  const handlePasswordReset = async (user: AuthUser) => {
    const email = user.email || '';
    if (!email) return;
    if (!confirm(`Send password reset email to ${email}?`)) return;
    setActionFeedback(null);
    try {
      await postAdminUserAction('trigger-password-reset', { email });
      setActionFeedback({ type: 'success', msg: 'Password reset email sent.' });
    } catch (e) {
      setActionFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Action failed' });
    }
  };

  const formatDate = (s: string | undefined) => (s ? new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—');

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
          title="USERS"
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
              <div className="flex justify-between items-center px-4 pt-4 pb-2">
                <h2 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', margin: 0 }}>AUTH USERS</h2>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {actionFeedback && (
                <div
                  className="mx-4 mb-3 px-3 py-2 text-sm"
                  style={{
                    backgroundColor: actionFeedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: actionFeedback.type === 'success' ? '#166534' : '#b91c1c',
                  }}
                >
                  {actionFeedback.msg}
                </div>
              )}

              {loading ? (
                <p className="px-4 py-6 text-gray-500 text-sm">Loading users...</p>
              ) : error ? (
                <p className="px-4 py-6 text-red-600 text-sm">{error}</p>
              ) : users.length === 0 ? (
                <p className="px-4 py-6 text-gray-500 text-sm">No users found.</p>
              ) : (
                <div className="px-4 pb-4 space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="border border-gray-200 rounded p-3"
                      style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                    >
                      <p className="font-medium text-black text-xs truncate" style={{ fontFamily: '"Futura PT Demi"' }}>{u.email || '—'}</p>
                      <p className="text-gray-500 text-xs mt-1">Created: {formatDate(u.created_at)}</p>
                      {u.last_sign_in_at && <p className="text-gray-500 text-xs">Last sign-in: {formatDate(u.last_sign_in_at)}</p>}
                      {u.banned_until && <p className="text-red-600 text-xs mt-1">Disabled</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {u.banned_until ? (
                          <button
                            type="button"
                            onClick={() => handleEnable(u.id)}
                            className="text-xs px-2 py-1 border border-gray-400 rounded"
                            style={{ fontFamily: '"Futura PT Medium"' }}
                          >
                            Re-enable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDisable(u.id)}
                            className="text-xs px-2 py-1 border border-red-500 text-red-600 rounded"
                            style={{ fontFamily: '"Futura PT Medium"' }}
                          >
                            Disable
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePasswordReset(u)}
                          className="text-xs px-2 py-1 border border-gray-400 rounded"
                          style={{ fontFamily: '"Futura PT Medium"' }}
                        >
                          Send password reset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && users.length >= perPage && (
                <div className="flex justify-center gap-2 px-4 pb-4">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="text-xs px-3 py-1 border border-gray-400 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs self-center">Page {page}</span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="text-xs px-3 py-1 border border-gray-400 rounded"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
