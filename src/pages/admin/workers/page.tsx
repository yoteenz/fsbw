import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '../components/AdminHeader';
import RoleCardSectionHeader from '../../../components/RoleCardSectionHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { ADMIN_DASHBOARD_WORKERS } from '../../../utils/adminWorkersDashboard';
import {
  getJobApplicationsForJob,
  removeJobApplication,
  countApplicationsForJob,
  type JobApplication,
} from '../../../utils/jobApplicationsStorage';

function isPlaceholderHire(name: string): boolean {
  return /placeholder/i.test((name || '').trim());
}

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function AdminWorkersPage() {
  useRequireAdminPageAccess();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [, setAppsVersion] = useState(0);

  const refreshApps = useCallback(() => setAppsVersion((v) => v + 1), []);

  useEffect(() => {
    const onUpdated = () => refreshApps();
    window.addEventListener('jobApplicationsUpdated', onUpdated);
    window.addEventListener('storage', onUpdated);
    return () => {
      window.removeEventListener('jobApplicationsUpdated', onUpdated);
      window.removeEventListener('storage', onUpdated);
    };
  }, [refreshApps]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedJobId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dismissApplicant = (applicationId: string) => {
    removeJobApplication(applicationId);
    refreshApps();
  };

  const toggleCard = (jobId: string) => {
    setExpandedJobId((id) => (id === jobId ? null : jobId));
  };

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
            {ADMIN_DASHBOARD_WORKERS.map((w) => {
              const appCount = countApplicationsForJob(w.id);
              const isOpen = expandedJobId === w.id;
              const applicants: JobApplication[] = isOpen ? getJobApplicationsForJob(w.id) : [];
              const openingsLabel =
                w.openings === 1 ? '1 OPENING AVAILABLE' : `${w.openings} OPENINGS AVAILABLE`;

              return (
                <div
                  key={w.id}
                  className="bg-white/60 backdrop-blur-sm border border-black shadow-lg overflow-hidden"
                  style={{ borderWidth: '1.3px' }}
                >
                  <div className="relative">
                    {isOpen ? (
                      <button
                        type="button"
                        aria-label="Close"
                        onClick={() => setExpandedJobId(null)}
                        className="absolute top-2 right-2 z-20 w-9 h-9 flex items-center justify-center text-2xl leading-none text-black hover:text-red-600 bg-white/90 border border-black"
                        style={{ borderWidth: '1.3px' }}
                      >
                        ×
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => toggleCard(w.id)}
                      className={`w-full text-left bg-transparent px-4 pt-4 pb-3 cursor-pointer hover:bg-white/40 transition-colors uppercase border-b border-black/20 ${
                        isOpen ? 'pr-12' : ''
                      }`}
                      style={{ textTransform: 'uppercase' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 text-left">
                          <RoleCardSectionHeader title={w.role} className={isOpen ? 'pr-10' : ''} />
                          <p
                            className="text-[9px] font-futura text-gray-500 tracking-wide mt-1.5 mb-0"
                            style={{ fontWeight: 600 }}
                          >
                            {openingsLabel}
                          </p>
                          <p
                            className="text-[10px] font-futura text-gray-700 mt-1.5 leading-snug uppercase"
                            style={{ fontWeight: 500 }}
                          >
                            {isPlaceholderHire(w.name) ? (
                              <span className="text-gray-600 uppercase">
                                OPEN — SET HIRE NAME IN ROSTER FILE (CURRENT: {w.name})
                              </span>
                            ) : (
                              <span className="uppercase">
                                <span className="text-black font-medium">HIRE: </span>
                                {w.name}
                              </span>
                            )}
                          </p>
                          <p className="text-[9px] font-futura text-red-600 mt-2 font-medium uppercase">
                            {appCount === 0
                              ? 'NO APPLICATIONS YET — TAP FOR DETAILS'
                              : `${appCount} APPLICATION(S) — TAP TO REVIEW`}
                          </p>
                        </div>
                      </div>
                    </button>
                    <dl
                      className="space-y-2 text-left uppercase px-4 pb-4 pt-1"
                      style={{ textTransform: 'uppercase' }}
                    >
                      <div>
                        <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                          HOURS
                        </dt>
                        <dd className="text-[10px] font-futura text-gray-700 mt-0.5">{w.scheduledHours}</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                          PAY
                        </dt>
                        <dd className="text-[10px] font-futura text-gray-700 mt-0.5">{w.pay}</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                          ABOUT THE ROLE
                        </dt>
                        <dd className="text-[10px] font-futura text-gray-700 mt-0.5 leading-snug">{w.aboutTheRole}</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                          REQUIRED EDUCATION
                        </dt>
                        <dd className="text-[10px] font-futura text-gray-700 mt-0.5 leading-snug">{w.requiredEducation}</dd>
                      </div>
                      {w.contact ? (
                        <div>
                          <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                            CONTACT
                          </dt>
                          <dd className="text-[10px] font-futura text-gray-700 mt-0.5 break-all">{w.contact}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-[9px] font-futura text-black font-medium" style={{ fontWeight: 600 }}>
                          JOB DUTIES
                        </dt>
                        <dd className="mt-1">
                          <ul className="list-disc pl-4 space-y-1 text-[10px] font-futura text-gray-700">
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
                          <ul className="list-disc pl-4 space-y-1 text-[10px] font-futura text-gray-700">
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
                          <dd className="text-[10px] font-futura text-gray-700 mt-0.5">{w.notes}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {isOpen ? (
                      <div
                        className="px-4 pb-4 pt-0 border-t border-black/25 normal-case bg-white/40"
                        style={{ textTransform: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p
                          className="text-[9px] font-futura text-gray-500 uppercase tracking-wide pt-3 mb-1"
                          style={{ fontWeight: 600 }}
                        >
                          APPLICATIONS
                        </p>
                        <RoleCardSectionHeader title={w.role} />
                        <p className="text-[10px] font-futura text-gray-600 mb-4">
                          {applicants.length} submission(s). Data is stored in this browser (
                          <code className="text-[9px]">localStorage: brandJobApplications_v1</code>) until you add a
                          backend.
                        </p>

                        {applicants.length === 0 ? (
                          <p className="text-sm font-futura text-gray-700 py-2">No applications for this position yet.</p>
                        ) : (
                          <ul className="space-y-4">
                            {applicants.map((a) => (
                              <li
                                key={a.id}
                                className="border border-black p-3 bg-white/80"
                                style={{ borderWidth: '1.3px' }}
                              >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div>
                                    <p className="text-[11px] font-futura font-bold text-black">{a.fullName}</p>
                                    <p className="text-[10px] font-futura text-gray-700">{a.email}</p>
                                    <p className="text-[10px] font-futura text-gray-700">{a.phone}</p>
                                    {a.currentLocation ? (
                                      <p className="text-[10px] font-futura text-gray-800 mb-1">
                                        <span className="font-semibold">Location: </span>
                                        {a.currentLocation}
                                      </p>
                                    ) : null}
                                    <p className="text-[9px] font-futura text-gray-500 mt-1">
                                      Submitted {formatSubmittedAt(a.submittedAt)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => dismissApplicant(a.id)}
                                    className="text-[9px] font-futura uppercase text-red-600 shrink-0 border border-red-600 px-2 py-1"
                                    style={{ borderWidth: '1.3px' }}
                                  >
                                    Remove
                                  </button>
                                </div>
                                {a.educationLevel ? (
                                  <p className="text-[10px] font-futura text-gray-800 mb-1">
                                    <span className="font-semibold">Education: </span>
                                    {a.educationLevel}
                                  </p>
                                ) : null}
                                {a.yearsExperience ? (
                                  <p className="text-[10px] font-futura text-gray-800 mb-1">
                                    <span className="font-semibold">Experience: </span>
                                    {a.yearsExperience}
                                  </p>
                                ) : null}
                                {a.skillsAndExperience ? (
                                  <div className="mb-2">
                                    <p className="text-[9px] font-futura font-semibold text-black mb-0.5">
                                      SKILLS &amp; EXPERIENCE
                                    </p>
                                    <p className="text-[10px] font-futura text-gray-800 whitespace-pre-wrap">
                                      {a.skillsAndExperience}
                                    </p>
                                  </div>
                                ) : null}
                                {a.linkedInUrl ? (
                                  <p className="text-[10px] font-futura mb-1 break-all">
                                    <span className="font-semibold">LinkedIn: </span>
                                    <a
                                      href={a.linkedInUrl}
                                      className="text-red-600 underline"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {a.linkedInUrl}
                                    </a>
                                  </p>
                                ) : null}
                                {a.portfolioUrl ? (
                                  <p className="text-[10px] font-futura mb-1 break-all">
                                    <span className="font-semibold">Portfolio: </span>
                                    <a
                                      href={a.portfolioUrl}
                                      className="text-red-600 underline"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {a.portfolioUrl}
                                    </a>
                                  </p>
                                ) : null}
                                {a.otherLinks ? (
                                  <p className="text-[10px] font-futura mb-1 break-all">
                                    <span className="font-semibold">Other links: </span>
                                    {a.otherLinks}
                                  </p>
                                ) : null}
                                {a.resumeFileName ? (
                                  <p className="text-[10px] font-futura mb-2">
                                    <span className="font-semibold">Résumé file: </span>
                                    {a.resumeFileName}
                                    {a.resumeDataUrl ? (
                                      <>
                                        {' '}
                                        <a
                                          href={a.resumeDataUrl}
                                          download={a.resumeFileName || 'resume'}
                                          className="text-red-600 underline"
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Open / download
                                        </a>
                                      </>
                                    ) : (
                                      <span className="text-gray-500"> (file not stored — quota)</span>
                                    )}
                                  </p>
                                ) : null}
                                <div>
                                  <p className="text-[9px] font-futura font-semibold text-black mb-0.5">COVER LETTER</p>
                                  <p className="text-[10px] font-futura text-gray-800 whitespace-pre-wrap">
                                    {a.coverLetter}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
