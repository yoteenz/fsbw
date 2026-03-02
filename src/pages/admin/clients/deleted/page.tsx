import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '../../components/AdminHeader';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import { unblockClient } from '../../../../utils/blockedClients';

type DeletedUser = {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  deletedAt: string;
  deletedFrom?: string;
  blocked?: boolean;
  [key: string]: unknown;
};

function getDeletedPlatformLabel(deletedFrom?: string): string {
  const map: Record<string, string> = {
    'ios': 'IOS BROWSER',
    'safari-ios': 'SAFARI IOS',
    'chrome-ios': 'CHROME IOS',
    'firefox-ios': 'FIREFOX IOS',
    'chrome-desktop': 'CHROME DESKTOP',
    'safari-desktop': 'SAFARI DESKTOP',
    'firefox-desktop': 'FIREFOX DESKTOP',
    'edge-desktop': 'EDGE DESKTOP',
    'chrome-android': 'CHROME ANDROID',
    'firefox-android': 'FIREFOX ANDROID',
    'samsung-android': 'SAMSUNG ANDROID',
    'android': 'ANDROID BROWSER',
    'mobile': 'MOBILE',
    'desktop': 'DESKTOP',
    'unknown': 'UNKNOWN',
  };
  return map[(deletedFrom || 'unknown').toLowerCase()] ?? (deletedFrom || 'UNKNOWN').toUpperCase();
}

/** Mock deleted accounts for testing UI/logic when localStorage is empty - covers all platform types */
const MOCK_DELETED_USERS: DeletedUser[] = [
  {
    email: 'jane.doe@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'safari-ios',
  },
  {
    email: 'alex.taylor@example.com',
    firstName: 'Alex',
    lastName: 'Taylor',
    deletedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'safari-ios',
  },
  {
    email: 'chris.moore@example.com',
    firstName: 'Chris',
    lastName: 'Moore',
    deletedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'chrome-ios',
  },
  {
    email: 'rachel.green@example.com',
    firstName: 'Rachel',
    lastName: 'Green',
    deletedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'firefox-ios',
  },
  {
    email: 'michael.smith@example.com',
    firstName: 'Michael',
    lastName: 'Smith',
    deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'chrome-desktop',
  },
  {
    email: 'sarah.wilson@example.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    deletedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'safari-desktop',
  },
  {
    email: 'david.jones@example.com',
    firstName: 'David',
    lastName: 'Jones',
    deletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'firefox-desktop',
  },
  {
    email: 'emily.brown@example.com',
    firstName: 'Emily',
    lastName: 'Brown',
    deletedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'edge-desktop',
  },
  {
    email: 'james.wilson@example.com',
    firstName: 'James',
    lastName: 'Wilson',
    deletedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'chrome-android',
  },
  {
    email: 'olivia.martinez@example.com',
    firstName: 'Olivia',
    lastName: 'Martinez',
    deletedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'firefox-android',
  },
  {
    email: 'daniel.kim@example.com',
    firstName: 'Daniel',
    lastName: 'Kim',
    deletedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'samsung-android',
  },
  {
    email: 'megan.lee@example.com',
    firstName: 'Megan',
    lastName: 'Lee',
    deletedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    deletedFrom: 'android',
  },
];

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
  const [userToRestore, setUserToRestore] = useState<DeletedUser | null>(null);

  const loadDeleted = useCallback(() => {
    try {
      const raw = localStorage.getItem('deletedUsers');
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      const needsReseed = list.length === 0 || list.every((u: DeletedUser) => !u.deletedFrom);
      if (needsReseed) {
        localStorage.setItem('deletedUsers', JSON.stringify(MOCK_DELETED_USERS));
        list = MOCK_DELETED_USERS;
      }
      list = [...list].sort((a: DeletedUser, b: DeletedUser) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      setDeletedUsers(list);
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
      if (user.blocked) {
        unblockClient(email);
        loadDeleted();
        setExpandedEmail(null);
        return;
      }
      const deleted = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const restored = deleted.find((u: DeletedUser) => (u.email || '').toLowerCase() === email);
      if (!restored) return;
      const { deletedAt: _, deletedFrom: __, ...userWithoutDeletedAt } = restored;
      if (!registered.some((u: { email?: string }) => (u.email || '').toLowerCase() === email)) {
        registered.push(userWithoutDeletedAt);
      }
      const newDeleted = deleted.filter((u: DeletedUser) => (u.email || '').toLowerCase() !== email)
        .sort((a: DeletedUser, b: DeletedUser) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
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
          <AdminHeader title="DELETED" showBack onBack={() => window.history.back()} breadcrumbParentPath="/admin/clients" />
          <div className="pb-6 px-4">
            <div className="max-w-md mx-auto">
              {deletedUsers.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-sm border border-black p-6 text-center" style={{ borderWidth: '1.3px', minHeight: '560px' }}>
                  <p
                  style={{
                    fontSize: '11px',
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    color: '#808080',
                    margin: '0',
                    textTransform: 'uppercase'
                  }}
                >
                  NO ACCOUNTS HAVE BEEN DELETED.
                </p>
                </div>
              ) : (
                <div className="space-y-3" style={{ minHeight: '560px' }}>
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
                              <p className="font-medium truncate" style={{ color: '#EB1C24', fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '16px' }}>
                                {displayName(user)}
                              </p>
                              <p className="text-xs truncate" style={{ fontFamily: '"Futura PT Medium"', color: '#000000', marginTop: '3px' }}>{user.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {user.blocked ? 'BLOCKED: (SPAM/FRAUD)' : `DELETED: ${getDeletedPlatformLabel(user.deletedFrom)}`}
                              </p>
                              <p className="mt-1" style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px' }}>
                                {formatDeletedDate(user.deletedAt)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleExpand(email)}
                                className="px-3 py-1.5 border border-black text-xs font-medium hover:bg-gray-100"
                                style={{ borderWidth: '1.2px', color: '#000000', backgroundColor: '#FFFFFF' }}
                              >
                                {isExpanded ? 'HIDE' : 'VIEW'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setUserToRestore(user)}
                                className="px-3 py-1.5 border border-black text-xs font-medium hover:bg-gray-100"
                                style={{ borderWidth: '1.2px', color: '#EB1C24', backgroundColor: '#FFFFFF' }}
                              >
                                RESTORE
                              </button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200 text-left">
                              <p className="text-xs text-gray-600 mb-2 font-medium">FULL RECORD (READ-ONLY)</p>
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

      <ConfirmationModal
        isOpen={userToRestore !== null}
        onClose={() => setUserToRestore(null)}
        onConfirm={() => {
          if (userToRestore) {
            handleRestore(userToRestore);
            setUserToRestore(null);
          }
        }}
        title={userToRestore?.blocked ? 'UNBLOCK CLIENT?' : 'RESTORE ACCOUNT?'}
        message={
          userToRestore?.blocked ? (
            <>
              ARE YOU SURE YOU WANT TO UN-BAN THIS CLIENT?
              <br />
              THEY WILL BE ABLE TO MAKE PURCHASES AGAIN.
            </>
          ) : (
            <>
              ARE YOU SURE YOU WANT TO RESTORE THIS ACCOUNT?
              <br />
              THE USER WILL BE ABLE TO SIGN IN AGAIN.
            </>
          )
        }
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="restore-account-confirm"
      />
    </>
  );
}
