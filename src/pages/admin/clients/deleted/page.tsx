import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '../../components/AdminHeader';

type DeletedUser = {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  deletedAt: string;
  [key: string]: unknown;
};

function formatDeletedDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function displayName(u: DeletedUser) {
  const first = (u.firstName || '').trim();
  const last = (u.lastName || '').trim();
  if (first || last) return [first, last].filter(Boolean).join(' ').toUpperCase();
  return (u.email || 'Unknown').split('@')[0].toUpperCase();
}

export default function AdminDeletedAccounts() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const loadDeleted = useCallback(() => {
    try {
      const raw = localStorage.getItem('deletedUsers');
      const list = raw ? JSON.parse(raw) : [];
      setDeletedUsers(Array.isArray(list) ? list : []);
    } catch {
      setDeletedUsers([]);
    }
  }, []);

  useEffect(() => {
    loadDeleted();
  }, [loadDeleted]);

  const handleRestore = (user: DeletedUser) => {
    const email = (user.email || '').trim().toLowerCase();
    if (!email) return;
    try {
      const deleted = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const restored = deleted.find((u: DeletedUser) => (u.email || '').toLowerCase() === email);
      if (!restored) return;
      const { deletedAt: _, ...userWithoutDeletedAt } = restored;
      if (!registered.some((u: { email?: string }) => (u.email || '').toLowerCase() === email)) {
        registered.push(userWithoutDeletedAt);
      }
      const newDeleted = deleted.filter((u: DeletedUser) => (u.email || '').toLowerCase() !== email);
      localStorage.setItem('registeredUsers', JSON.stringify(registered));
      localStorage.setItem('deletedUsers', JSON.stringify(newDeleted));
      setDeletedUsers(newDeleted);
      setExpandedEmail(null);
    } catch (e) {
      console.error('Restore failed', e);
    }
  };

  const toggleExpand = (email: string) => {
    setExpandedEmail((prev) => (prev === email ? null : email));
  };

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
          <AdminHeader title="DELETED ACCOUNTS" showBack onBack={() => window.history.back()} />
          <div className="pb-6 px-4">
            <div className="max-w-md mx-auto">
              <p className="text-xs text-gray-600 mb-4" style={{ textTransform: 'uppercase' }}>
                Accounts deleted by users. Restore to make them able to sign in again.
              </p>
              {deletedUsers.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-sm border border-black p-6 text-center" style={{ borderWidth: '1.3px' }}>
                  <p className="text-sm" style={{ color: '#000' }}>No deleted accounts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deletedUsers.map((user) => {
                    const email = (user.email || '').trim().toLowerCase();
                    const isExpanded = expandedEmail === email;
                    return (
                      <div
                        key={email || Math.random()}
                        className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
                        style={{ borderWidth: '1.3px' }}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate" style={{ color: '#EB1C24' }}>
                                {displayName(user)}
                              </p>
                              <p className="text-xs text-gray-600 truncate">{user.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Deleted: {formatDeletedDate(user.deletedAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleExpand(email)}
                                className="px-3 py-1.5 border border-black text-xs font-medium hover:bg-gray-100"
                                style={{ borderWidth: '1.2px' }}
                              >
                                {isExpanded ? 'HIDE' : 'VIEW'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRestore(user)}
                                className="px-3 py-1.5 border border-black text-xs font-medium hover:bg-gray-100"
                                style={{ borderWidth: '1.2px', color: '#EB1C24' }}
                              >
                                RESTORE
                              </button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200 text-left">
                              <p className="text-xs text-gray-600 mb-2 font-medium">Full record (read-only)</p>
                              <pre className="text-[10px] bg-white/80 p-3 overflow-x-auto max-h-48 overflow-y-auto border border-gray-200">
                                {JSON.stringify(
                                  Object.fromEntries(
                                    Object.entries(user).filter(([k]) => k !== 'password')
                                  ),
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
