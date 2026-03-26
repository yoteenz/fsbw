import AdminHeader from '../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { ADMIN_DASHBOARD_WORKERS } from '../../../utils/adminWorkersDashboard';

function isPlaceholderHire(name: string): boolean {
  return /placeholder/i.test((name || '').trim());
}

export default function AdminWorkersPage() {
  useRequireAdminPageAccess();
  const total = ADMIN_DASHBOARD_WORKERS.length;
  const brandPositionSummary = ADMIN_DASHBOARD_WORKERS.map((w) => w.role).join(' · ');

  return (
    <div className="min-h-screen relative">
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
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <AdminHeader title="WORKERS" showAccountIcon />
        <div className="pb-8 px-4">
          <div className="max-w-md mx-auto space-y-4" style={{ minHeight: 'calc(100dvh - 160px)' }}>
            <div
              className="text-[10px] text-gray-700 font-futura text-left leading-snug space-y-2 normal-case"
              style={{ fontWeight: 500 }}
            >
              <p>
                <span className="text-black font-medium">Brand roster ({total} positions).</span> Each card is the{' '}
                <span className="text-black font-medium">job role</span> your business needs — not the hire name.
                Replace placeholder hire names in{' '}
                <code className="text-[9px] bg-white/80 px-1 rounded">src/utils/adminWorkersDashboard.ts</code>.
              </p>
              <p className="text-[9px] text-gray-600 leading-relaxed normal-case">{brandPositionSummary}</p>
            </div>

            {ADMIN_DASHBOARD_WORKERS.map((w, index) => (
              <div
                key={w.id}
                className="bg-white/60 backdrop-blur-sm border border-black p-4 shadow-lg"
                style={{ borderWidth: '1.3px' }}
              >
                <div className="flex items-start justify-between gap-2 border-b border-black/20 pb-2 mb-3">
                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className="text-[9px] font-futura text-gray-500 tracking-wide mb-1"
                      style={{ fontWeight: 600 }}
                    >
                      POSITION {index + 1} / {total}
                    </p>
                    <h2
                      className="text-red-500 font-bold text-base tracking-wide"
                      style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#EB1C24' }}
                    >
                      {w.role}
                    </h2>
                    <p
                      className="text-[10px] font-futura text-gray-700 mt-1.5 normal-case leading-snug"
                      style={{ fontWeight: 500 }}
                    >
                      {isPlaceholderHire(w.name) ? (
                        <span className="text-gray-600">
                          OPEN — SET HIRE NAME IN ROSTER FILE (CURRENT: {w.name})
                        </span>
                      ) : (
                        <span>
                          <span className="text-black font-medium">HIRE: </span>
                          {w.name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <dl className="space-y-2 text-left">
                  <div>
                    <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                      HOURS
                    </dt>
                    <dd className="text-[10px] font-futura text-gray-700 mt-0.5 normal-case">{w.scheduledHours}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                      PAY
                    </dt>
                    <dd className="text-[10px] font-futura text-gray-700 mt-0.5 normal-case">{w.pay}</dd>
                  </div>
                  {w.contact ? (
                    <div>
                      <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                        CONTACT
                      </dt>
                      <dd className="text-[10px] font-futura text-gray-700 mt-0.5 break-all normal-case">
                        {w.contact}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                      JOB DUTIES
                    </dt>
                    <dd className="mt-1">
                      <ul className="list-disc pl-4 space-y-1 text-[10px] font-futura text-gray-700 normal-case">
                        {w.jobDuties.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                      DAILY TASKS
                    </dt>
                    <dd className="mt-1">
                      <ul className="list-disc pl-4 space-y-1 text-[10px] font-futura text-gray-700 normal-case">
                        {w.dailyTasks.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  {w.notes ? (
                    <div>
                      <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                        NOTES
                      </dt>
                      <dd className="text-[10px] font-futura text-gray-700 mt-0.5 normal-case">{w.notes}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
