import { useState, useCallback, useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { ADMIN_DASHBOARD_WORKERS } from '../../../utils/adminWorkersDashboard';
import { appendJobApplication, type JobApplication } from '../../../utils/jobApplicationsStorage';
import { clearAppAuth } from '../../../utils/adminAuth';
import RoleCardSectionHeader from '../../../components/RoleCardSectionHeader';

const MAX_RESUME_BYTES = 1.5 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  currentLocation: '',
  linkedInUrl: '',
  portfolioUrl: '',
  otherLinks: '',
  requiredEducation: '',
  yearsExperience: '',
  skillsAndExperience: '',
  coverLetter: '',
};

/** Match checkout shipping/contact fields: square corners, Futura PT Book, gray text. */
const checkoutLabelStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000000',
  display: 'block',
  marginBottom: '4px',
  textTransform: 'uppercase',
};

const checkoutInputStyle: CSSProperties = {
  width: '100%',
  height: '36px',
  padding: '8px',
  border: '1.3px solid #000000',
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  backgroundColor: '#FFFFFF',
  color: '#808080',
  boxSizing: 'border-box',
  borderRadius: '0',
  outline: 'none',
};

const checkoutTextareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '100px',
  padding: '8px',
  border: '1.3px solid #000000',
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  backgroundColor: '#FFFFFF',
  color: '#808080',
  boxSizing: 'border-box',
  borderRadius: '0',
  outline: 'none',
  resize: 'vertical' as const,
};

const checkoutSelectStyle: CSSProperties = {
  ...checkoutInputStyle,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000000' stroke-width='1.2'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '28px',
};

/** Apply form: applicant education (above years of experience). */
const REQUIRED_EDUCATION_OPTIONS = [
  'HIGH SCHOOL / GED OR EQUIVALENT',
  'SOME COLLEGE (NO DEGREE)',
  'ASSOCIATE DEGREE',
  "BACHELOR'S DEGREE",
  "MASTER'S DEGREE",
  'JD / LAW DEGREE',
  'DOCTORATE / PROFESSIONAL (E.G. PHD, MD)',
  'CERTIFICATION / LICENSE ONLY (COSMETOLOGY, MUA, ETC.)',
  'OTHER — SEE COVER LETTER',
] as const;

export default function BrandCareersPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState<'SHOP' | 'TOOLS' | 'BRAND'>('BRAND');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';
    } catch {
      return false;
    }
  });

  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitDone, setSubmitDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeJob = applyJobId ? ADMIN_DASHBOARD_WORKERS.find((w) => w.id === applyJobId) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !applyJobId) return;
      setApplyJobId(null);
      setSubmitting(false);
      setSubmitError(null);
      setSubmitDone(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyJobId]);

  useEffect(() => {
    const onCart = (e: CustomEvent<number>) => setCartCount(e.detail);
    const onStorage = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
      } catch {
        setCartCount(0);
      }
    };
    window.addEventListener('cartCountUpdated', onCart as EventListener);
    window.addEventListener('cartUpdated', onStorage);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cartCountUpdated', onCart as EventListener);
      window.removeEventListener('cartUpdated', onStorage);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const openApply = (jobId: string) => {
    setApplyJobId(jobId);
    setForm(emptyForm);
    setResumeFile(null);
    setSubmitError(null);
    setSubmitDone(false);
  };

  const closeApply = () => {
    setApplyJobId(null);
    setSubmitting(false);
    setSubmitError(null);
    setSubmitDone(false);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeJob) return;
      setSubmitError(null);
      const fn = form.fullName.trim();
      const em = form.email.trim();
      const ph = form.phone.trim();
      const cl = form.coverLetter.trim();
      if (!fn || !em || !ph || !cl) {
        setSubmitError('Please fill in name, email, phone, and cover letter.');
        return;
      }
      if (!form.requiredEducation.trim()) {
        setSubmitError('Please select your required education level.');
        return;
      }
      setSubmitting(true);
      let resumeDataUrl: string | undefined;
      let resumeFileName = '';
      try {
        if (resumeFile) {
          if (resumeFile.size > MAX_RESUME_BYTES) {
            setSubmitError(`Resume must be under ${Math.round(MAX_RESUME_BYTES / (1024 * 1024))} MB for this demo save.`);
            setSubmitting(false);
            return;
          }
          resumeFileName = resumeFile.name;
          resumeDataUrl = await readFileAsDataUrl(resumeFile);
        }
        const payload: Omit<JobApplication, 'id' | 'submittedAt'> = {
          jobId: activeJob.id,
          role: activeJob.role,
          fullName: fn,
          email: em,
          phone: ph,
          currentLocation: form.currentLocation.trim(),
          skillsAndExperience: form.skillsAndExperience.trim(),
          linkedInUrl: form.linkedInUrl.trim(),
          portfolioUrl: form.portfolioUrl.trim(),
          otherLinks: form.otherLinks.trim(),
          yearsExperience: form.yearsExperience.trim(),
          coverLetter: cl,
          resumeFileName,
          resumeDataUrl,
        };
        appendJobApplication(payload);
        window.dispatchEvent(new CustomEvent('jobApplicationsUpdated'));
        setSubmitDone(true);
        setTimeout(() => {
          closeApply();
        }, 2200);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Submit failed. Try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [activeJob, form, resumeFile]
  );

  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleBack = () => {
    if (applyJobId) {
      closeApply();
      return;
    }
    navigate(-1);
  };
  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      clearAppAuth();
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
    }
    navigate('/sign-in');
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
      <div className="relative z-10 uppercase" style={{ textTransform: 'uppercase' }}>
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {applyJobId && !showMobileMenu ? (
                <button
                  type="button"
                  onClick={closeApply}
                  className="cursor-pointer"
                  style={{
                    height: '15px !important',
                    width: '21px !important',
                    padding: '0 !important',
                    border: 'none !important',
                    background: 'none !important',
                  }}
                >
                  <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                </button>
              ) : showMobileMenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                    className="cursor-pointer"
                    style={{
                      height: '15px !important',
                      width: '21px !important',
                      padding: '0 !important',
                      border: 'none !important',
                      background: 'none !important',
                      transform: 'translateX(4px)',
                    }}
                  >
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')}
                    className="cursor-pointer"
                    style={{
                      height: '21px !important',
                      width: '21px !important',
                      padding: '0 !important',
                      border: 'none !important',
                      background: 'none !important',
                      transform: 'translateX(2px)',
                    }}
                  >
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="cursor-pointer"
                    style={{
                      height: '15px !important',
                      width: '21px !important',
                      padding: '0 !important',
                      border: 'none !important',
                      background: 'none !important',
                    }}
                  >
                    <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                  </button>
                  <button type="button" className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img alt="Search" width="16" height="15" src="/assets/search-icon.svg" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => {
                      try {
                        const signedIn = localStorage.getItem('isSignedIn') === 'true';
                        if (signedIn) {
                          const currentUser = localStorage.getItem('currentUser');
                          if (currentUser) {
                            const user = JSON.parse(currentUser);
                            const isPremium =
                              user?.membershipType === 'PREMIUM' || user?.membershipType === 'Premium';
                            navigate(isPremium ? '/' : '/home/shop');
                            return;
                          }
                        }
                        navigate('/home/shop');
                      } catch {
                        navigate('/home/shop');
                      }
                    }}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
              ) : applyJobId ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400' }}>BRAND &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>APPLY</span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400' }}>BRAND &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>CAREERS</span>
                </>
              )}
            </p>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                  width="17"
                  height="18"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={handleMobileMenuToggle}
                  style={{ marginTop: '2px' }}
                >
                  <path
                    d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>

          {showMobileMenu ? (
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
              style={{
                borderWidth: '1.3px',
                minWidth: '100%',
                maxWidth: 'none',
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                minHeight: '560px',
              }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
              <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                {(['SHOP', 'TOOLS', 'BRAND'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMobileMenuActiveTab(tab)}
                    style={{
                      fontFamily: mobileMenuActiveTab === tab ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === tab ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === tab ? '1px solid #EB1C24' : 'none',
                      border: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {mobileMenuActiveTab === 'TOOLS' ? (
                    <div
                      className="flex cursor-pointer"
                      onClick={() => navigate('/tools/gift-card')}
                      role="button"
                    >
                      <span
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '14px',
                          color: 'black',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          transform: 'translateX(13px)',
                        }}
                      >
                        GIFT CARD
                      </span>
                    </div>
                  ) : mobileMenuActiveTab === 'BRAND' ? (
                    <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                  ) : (
                    [
                      { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                      { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                      { label: 'BUILD-A-WIG', hasArrow: false },
                      { label: 'ORDER AUTHORIZATION FORM', hasArrow: false },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontFamily: '"Futura PT Book"',
                              fontSize: '14px',
                              color: 'black',
                              fontWeight: '500',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              transform: 'translateX(13px)',
                            }}
                            onClick={() => {
                              if (item.isExpandable) {
                                if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                  navigate('/shop/units');
                                } else {
                                  handleMobileMenuItemToggle(item.label);
                                }
                              } else if (item.label === 'BUILD-A-WIG') navigate('/build-a-wig');
                              else if (item.label === 'ORDER AUTHORIZATION FORM') navigate('/shop/order-form');
                            }}
                          >
                            {item.label}
                          </span>
                          {item.hasArrow && (
                            <img
                              src="/assets/NOIR/closed-arrow.svg"
                              alt=""
                              style={{
                                width: '16px',
                                height: '16px',
                                transform: mobileMenuExpandedItems.includes(item.label)
                                  ? 'translateX(-11px) translateY(-4px) rotate(90deg)'
                                  : 'translateX(-11px) translateY(-4px) rotate(0deg)',
                                cursor: 'pointer',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.isExpandable) handleMobileMenuItemToggle(item.label);
                              }}
                            />
                          )}
                        </div>
                        {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                          <div className="ml-5 mt-2 flex flex-col gap-2">
                            {item.subItems.map((subItem, subIndex) => (
                              <span
                                key={subIndex}
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  fontSize: '14px',
                                  color: '#EB1C24',
                                  fontWeight: '500',
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                }}
                                onClick={() => {
                                  if (subItem === 'STRAIGHT') navigate('/units/straight');
                                  else if (subItem === 'WAVY') navigate('/units/wavy');
                                  else if (subItem === 'CURLY') navigate('/units/curly');
                                }}
                              >
                                {subItem}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                <span
                  onClick={handleMobileMenuSignInToggle}
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '14px',
                    color: '#EB1C24',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                </span>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <SocialMenuIcons />
              </div>
              </div>
            </div>
          ) : null}

          {!showMobileMenu && !applyJobId && (
            <div className="flex flex-col gap-5 mb-5">
              {ADMIN_DASHBOARD_WORKERS.map((job) => {
                const openingsLabel =
                  job.openings === 1 ? '1 OPENING AVAILABLE' : `${job.openings} OPENINGS AVAILABLE`;
                return (
                  <div key={job.id} className="flex flex-col gap-2">
                    <div
                      className="border border-black bg-white/60 backdrop-blur-sm p-4 w-full"
                      style={{ borderWidth: '1.3px' }}
                    >
                      <RoleCardSectionHeader title={job.role} />
                      <p
                        className="text-[9px] font-futura text-gray-600 tracking-wide mb-3 mt-1"
                        style={{ fontWeight: 600 }}
                      >
                        {openingsLabel}
                      </p>
                      <div className="space-y-3 text-[10px] font-futura text-gray-800">
                        <section>
                          <p className="text-[9px] font-futura text-black font-medium mb-1" style={{ fontWeight: 600 }}>
                            ABOUT THE ROLE
                          </p>
                          <p className="leading-snug">{job.aboutTheRole}</p>
                        </section>
                        <section>
                          <p className="text-[9px] font-futura text-black font-medium mb-1" style={{ fontWeight: 600 }}>
                            HOURS
                          </p>
                          <p className="leading-snug">{job.scheduledHours}</p>
                        </section>
                        <section>
                          <p className="text-[9px] font-futura text-black font-medium mb-1" style={{ fontWeight: 600 }}>
                            PAY
                          </p>
                          <p className="leading-snug">{job.pay}</p>
                        </section>
                        <section>
                          <p className="text-[9px] font-futura text-black font-medium mb-1" style={{ fontWeight: 600 }}>
                            REQUIRED EDUCATION
                          </p>
                          <p className="leading-snug">{job.requiredEducation}</p>
                        </section>
                        <section>
                          <p className="text-[9px] font-futura text-black font-medium mb-1" style={{ fontWeight: 600 }}>
                            JOB DUTIES
                          </p>
                          <ul className="list-disc pl-4 space-y-1">
                            {job.jobDuties.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </section>
                        <section>
                          <p className="text-[9px] font-futura text-black font-medium mb-1" style={{ fontWeight: 600 }}>
                            DAILY TASKS
                          </p>
                          <ul className="list-disc pl-4 space-y-1">
                            {job.dailyTasks.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </section>
                        {job.notes ? (
                          <section>
                            <p className="text-[9px] font-futura text-black font-medium mb-1" style={{ fontWeight: 600 }}>
                              NOTES
                            </p>
                            <p className="leading-snug">{job.notes}</p>
                          </section>
                        ) : null}
                      </div>
                    </div>
                    <div className="px-0" style={{ marginTop: '2px', transform: 'translateY(-2px)' }}>
                      <button
                        type="button"
                        onClick={() => openApply(job.id)}
                        className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 uppercase"
                        style={{
                          borderWidth: '1.3px',
                          color: '#EB1C24',
                          fontFamily: '"Futura PT Medium"',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        APPLY
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!showMobileMenu && applyJobId && activeJob ? (
            <div className="flex flex-col gap-2 w-full mb-5">
            <div
              className="border border-black flex flex-col bg-white/60 backdrop-blur-sm w-full menu-toggle-card overflow-hidden"
              style={{ borderWidth: '1.3px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              <div
                className="relative flex flex-col flex-1 min-h-0 px-5 pt-6 pb-4"
                style={{ paddingTop: '20px' }}
              >
                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeApply}
                  className="absolute top-3 right-3 z-10 flex items-center justify-center p-2 border-0 bg-transparent cursor-pointer"
                >
                  <img
                    src="/assets/close-icon.svg"
                    alt=""
                    width={16}
                    height={16}
                    style={{
                      width: '16px',
                      height: '16px',
                      display: 'block',
                      flexShrink: 0,
                      objectFit: 'contain',
                      filter:
                        'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)',
                    }}
                  />
                </button>
                <div className="flex-1 overflow-y-auto min-h-0 pr-1" style={{ paddingTop: '8px' }}>
                  <RoleCardSectionHeader
                    title={`Apply — ${activeJob.role}`}
                    className="pr-12"
                  />
                  <p
                    className="mt-2 mb-4"
                    style={{
                      ...checkoutLabelStyle,
                      color: '#6b7280',
                      fontSize: '9px',
                      lineHeight: 1.4,
                      marginBottom: '16px',
                    }}
                  >
                    Attach a résumé (PDF/DOC), portfolio or website, LinkedIn, and a short cover letter. Equal opportunity
                    employer.
                  </p>
                  {submitDone ? (
                    <p className="text-sm font-futura text-green-700 py-6" style={{ fontFamily: '"Futura PT Book"' }}>
                      Application received. Thank you.
                    </p>
                  ) : (
                    <form
                      id="careers-apply-form"
                      onSubmit={handleSubmit}
                      className="flex flex-col"
                      style={{ gap: '12px' }}
                    >
                      <label>
                        <span style={checkoutLabelStyle}>
                          FULL NAME<span style={{ color: '#EB1C24' }}>*</span>
                        </span>
                        <input
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutInputStyle}
                          value={form.fullName}
                          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>
                          EMAIL<span style={{ color: '#EB1C24' }}>*</span>
                        </span>
                        <input
                          type="email"
                          className="careers-apply-checkout-field mt-1 block"
                          style={{ ...checkoutInputStyle, textTransform: 'uppercase' }}
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value.toUpperCase() }))}
                          required
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>
                          PHONE<span style={{ color: '#EB1C24' }}>*</span>
                        </span>
                        <input
                          type="tel"
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutInputStyle}
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>CURRENT LOCATION</span>
                        <input
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutInputStyle}
                          value={form.currentLocation}
                          onChange={(e) => setForm((f) => ({ ...f, currentLocation: e.target.value }))}
                          placeholder="CITY, STATE OR REGION"
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>LINKEDIN (URL)</span>
                        <input
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutInputStyle}
                          value={form.linkedInUrl}
                          onChange={(e) => setForm((f) => ({ ...f, linkedInUrl: e.target.value }))}
                          placeholder="HTTPS://"
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>PORTFOLIO / WEBSITE (URL)</span>
                        <input
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutInputStyle}
                          value={form.portfolioUrl}
                          onChange={(e) => setForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
                          placeholder="HTTPS://"
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>OTHER LINKS (BEHANCE, VIMEO, DRIVE, ETC.)</span>
                        <input
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutInputStyle}
                          value={form.otherLinks}
                          onChange={(e) => setForm((f) => ({ ...f, otherLinks: e.target.value }))}
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>
                          REQUIRED EDUCATION<span style={{ color: '#EB1C24' }}>*</span>
                        </span>
                        <select
                          className="careers-apply-checkout-field mt-1 block w-full"
                          style={checkoutSelectStyle}
                          value={form.requiredEducation}
                          onChange={(e) => setForm((f) => ({ ...f, requiredEducation: e.target.value }))}
                          required
                        >
                          <option value="" disabled>
                            SELECT ONE
                          </option>
                          {REQUIRED_EDUCATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>YEARS OF RELEVANT EXPERIENCE</span>
                        <input
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutInputStyle}
                          value={form.yearsExperience}
                          onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))}
                          placeholder="E.G. 3+"
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>SKILLS &amp; EXPERIENCE</span>
                        <textarea
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutTextareaStyle}
                          value={form.skillsAndExperience}
                          onChange={(e) => setForm((f) => ({ ...f, skillsAndExperience: e.target.value }))}
                          rows={4}
                          placeholder="SUMMARIZE KEY SKILLS, TOOLS, AND RELEVANT BACKGROUND."
                        />
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>
                          RÉSUMÉ (PDF/DOC — OPTIONAL BUT RECOMMENDED, MAX ~1.5MB)
                        </span>
                        <div
                          className="mt-1 flex items-center"
                          style={{
                            width: '100%',
                            minHeight: '36px',
                            padding: '6px 8px',
                            border: '1.3px solid #000000',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf"
                            className="w-full text-[10px] cursor-pointer"
                            style={{
                              fontFamily: '"Futura PT Book"',
                              fontSize: '10px',
                              color: '#808080',
                            }}
                            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                          />
                        </div>
                      </label>
                      <label>
                        <span style={checkoutLabelStyle}>
                          COVER LETTER<span style={{ color: '#EB1C24' }}>*</span>
                        </span>
                        <textarea
                          className="careers-apply-checkout-field mt-1 block"
                          style={checkoutTextareaStyle}
                          value={form.coverLetter}
                          onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
                          required
                          rows={5}
                          placeholder="WHY THIS ROLE AND WHAT YOU BRING TO FRONTAL SLAYER / BUILD-A-WIG."
                        />
                      </label>
                      {submitError ? (
                        <p
                          className="text-[9px]"
                          style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', textTransform: 'uppercase' }}
                        >
                          {submitError}
                        </p>
                      ) : null}
                    </form>
                  )}
                </div>
              </div>
            </div>
            {!submitDone ? (
              <div className="px-0 w-full" style={{ marginTop: '2px', transform: 'translateY(-2px)' }}>
                <button
                  type="submit"
                  form="careers-apply-form"
                  disabled={submitting}
                  className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {submitting ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
                </button>
              </div>
            ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
