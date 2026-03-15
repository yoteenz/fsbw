import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { getAdminAuditLog } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';

type AuditEntry = { id: string; actorEmail?: string; action: string; resourceType: string; resourceId?: string; details?: unknown; createdAt: string };

export default function AdminAudit() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    getAdminAuditLog(100, 0)
      .then((list) => {
        setEntries(Array.isArray(list) ? list : []);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load audit log');
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return s;
    }
  };

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
          title="AUDIT LOG"
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
                <h2 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', margin: 0 }}>AUDIT TRAIL</h2>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {loading ? (
                <p className="px-4 py-6 text-gray-500 text-sm">Loading audit log...</p>
              ) : error ? (
                <p className="px-4 py-6 text-red-600 text-sm">{error}</p>
              ) : entries.length === 0 ? (
                <p className="px-4 py-6 text-gray-500 text-sm">No audit entries yet. Profile and order updates will appear here.</p>
              ) : (
                <div className="px-4 pb-4 space-y-2 max-h-[60vh] overflow-y-auto">
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
                      {e.details && typeof e.details === 'object' && Object.keys(e.details as object).length > 0 && (
                        <pre className="mt-1 text-gray-500 overflow-x-auto whitespace-pre-wrap break-words" style={{ fontSize: '10px' }}>
                          {JSON.stringify(e.details)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
