import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { getAdminAuditLog, getAdminUsers, postAdminUserAction } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';

const BACKEND_TABS = ['AUDIT LOG', 'USERS'] as const;

type AuditEntry = { id: string; actorEmail?: string; action: string; resourceType: string; resourceId?: string; details?: unknown; createdAt: string };
type AuthUser = { id: string; email: string; created_at?: string; last_sign_in_at?: string; banned_until?: string; email_confirmed_at?: string };

export default function AdminBackend() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = usePersistentQueryState<typeof BACKEND_TABS[number]>({
    queryKey: 'tab',
    storageKey: 'adminBackendActiveTab',
    defaultValue: 'AUDIT LOG',
    allowedValues: BACKEND_TABS,
  });

  // Audit state
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
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
      setAuditLoading(false);
      setUsersLoading(false);
      return;
    }
    getAdminAuditLog(100, 0)
      .then((list) => {
        setEntries(Array.isArray(list) ? list : []);
        setAuditError(null);
      })
      .catch((e) => {
        setAuditError(e instanceof Error ? e.message : 'Failed to load audit log');
        setEntries([]);
      })
      .finally(() => setAuditLoading(false));
  }, []);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (!currentUser?.email || !isAdminEmail(currentUser.email) || !isSupabaseConfigured()) {
      setUsersLoading(false);
      return;
    }
    setUsersLoading(true);
    getAdminUsers(page, perPage)
      .then((r) => {
        setUsers(r.users);
        setUsersError(null);
      })
      .catch((e) => {
        setUsersError(e instanceof Error ? e.message : 'Failed to load users');
        setUsers([]);
      })
      .finally(() => setUsersLoading(false));
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
          title="BACKEND"
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
              <div className="flex-shrink-0 px-5 pb-2" style={{ marginTop: '10px' }} />

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {BACKEND_TABS.map((tab) => (
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

              <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                <div
                  className="overflow-y-auto"
                  style={{
                    maxHeight: '420px',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                {activeTab === 'AUDIT LOG' && (
                  <>
                    {auditLoading ? (
                      <p className="px-0 py-6 text-gray-500 text-sm">Loading audit log...</p>
                    ) : auditError ? (
                      <p className="px-0 py-6 text-red-600 text-sm">{auditError}</p>
                    ) : entries.length === 0 ? (
                      <p className="px-0 py-6 text-gray-500 text-sm">No audit entries yet. Profile and order updates will appear here.</p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {entries.map((e) => (
                          <div
                            key={e.id}
                            className="border border-gray-200 rounded p-2 text-xs"
                            style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                          >
                            <p className="font-medium text-black" style={{ fontFamily: '"Futura PT Demi"' }}>
                              {e.action} · {e.resourceType}
                              {e.resourceId ? ` (${String(e.resourceId).slice(0, 8)}…)` : ''}
                            </p>
                            {e.actorEmail && <p className="text-gray-600 mt-0.5">By: {e.actorEmail}</p>}
                            <p className="text-gray-500 mt-0.5">{formatDate(e.createdAt)}</p>
                            {e.details != null && typeof e.details === 'object' && Object.keys(e.details as object).length > 0 ? (
                              <pre className="mt-1 text-gray-500 overflow-x-auto whitespace-pre-wrap break-words" style={{ fontSize: '10px' }}>
                                {JSON.stringify(e.details)}
                              </pre>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'USERS' && (
                  <>
                    {actionFeedback && (
                      <div
                        className="mb-3 px-3 py-2 text-sm"
                        style={{
                          backgroundColor: actionFeedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                          color: actionFeedback.type === 'success' ? '#166534' : '#b91c1c',
                        }}
                      >
                        {actionFeedback.msg}
                      </div>
                    )}
                    {usersLoading ? (
                      <p className="py-6 text-gray-500 text-sm">Loading users...</p>
                    ) : usersError ? (
                      <p className="py-6 text-red-600 text-sm">{usersError}</p>
                    ) : users.length === 0 ? (
                      <p className="py-6 text-gray-500 text-sm">No users found.</p>
                    ) : (
                      <div className="space-y-3 mt-2">
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
                                <button type="button" onClick={() => handleEnable(u.id)} className="text-xs px-2 py-1 border border-gray-400 rounded" style={{ fontFamily: '"Futura PT Medium"' }}>
                                  Re-enable
                                </button>
                              ) : (
                                <button type="button" onClick={() => handleDisable(u.id)} className="text-xs px-2 py-1 border border-red-500 text-red-600 rounded" style={{ fontFamily: '"Futura PT Medium"' }}>
                                  Disable
                                </button>
                              )}
                              <button type="button" onClick={() => handlePasswordReset(u)} className="text-xs px-2 py-1 border border-gray-400 rounded" style={{ fontFamily: '"Futura PT Medium"' }}>
                                Send password reset
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!usersLoading && users.length >= perPage && (
                      <div className="flex justify-center gap-2 pt-4">
                        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-xs px-3 py-1 border border-gray-400 rounded disabled:opacity-50">
                          Previous
                        </button>
                        <span className="text-xs self-center">Page {page}</span>
                        <button type="button" onClick={() => setPage((p) => p + 1)} className="text-xs px-3 py-1 border border-gray-400 rounded">
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
