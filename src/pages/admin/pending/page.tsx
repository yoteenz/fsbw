import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminPending, getAdminReviews } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import {
  countPendingOrderAuthorizationFormsForAdmin,
  listPendingOrderAuthorizationFormsForAdmin,
  pendingFormShowsViewFormAction,
  PENDING_ORDER_FORMS_UPDATED_EVENT,
} from '../../../utils/pendingOrderAuthorizationForms';
import type { StoredSignedOrderForm } from '../../../utils/signedOrderFormsStorage';
import { approveOrderFormSubmission, declineOrderFormSubmission } from '../../../utils/signedOrderFormsStorage';
import { SignedOrderFormPdfPanel } from '../../../components/SignedOrderFormPdfPanel';
import { useSignedOrderFormPdf, signedOrderFormPdfFileName } from '../../../hooks/useSignedOrderFormPdf';
import { seedPendingTestOrderFormsIfNeeded } from '../../../utils/mockSignedOrderFormForApproval';
import {
  approvePendingMockAffiliate,
  approvePendingMockReview,
  countPendingMockAffiliate,
  countPendingMockReviews,
  declinePendingMockAffiliate,
  declinePendingMockReview,
  listPendingMockAffiliateVisible,
  listPendingMockReviewsVisible,
  PENDING_MOCK_AFFILIATE_UPDATED_EVENT,
  PENDING_MOCK_REVIEWS_UPDATED_EVENT,
  type PendingMockAffiliateItem,
  type PendingMockReview,
} from '../../../utils/adminPendingMockQueues';
import { AdminReviewStyleCard } from '../../../components/admin/AdminReviewStyleCard';
import {
  compactRegionCodeForReviewHeader,
  regionParenLabelFromAddressLine,
  usStateAbbrevFromAddressLine,
} from '../../../utils/usAddressStateDisplay';
import { getMockClientsForAyoteenz } from '../clients/page';

const PENDING_TABS = ['OVERVIEW', 'REVIEWS', 'FORMS', 'AFFILIATE'] as const;

const rowStyle = {
  borderBottom: '1px solid #e5e7eb' as const,
};

type PendingAdminModal = { kind: 'form'; item: StoredSignedOrderForm } | { kind: 'review'; item: PendingMockReview };

const DEFAULT_CLIENT_PROFILE_THUMB = '/assets/profile-thumb.png';

function normalizeEmailKey(email: string): string {
  return (email || '').trim().toLowerCase();
}

function orderSummaryForPendingForm(form: StoredSignedOrderForm): { line: string; priceUsd: number } {
  const email = normalizeEmailKey(form.email);
  let priceUsd = 0;
  const parts: string[] = [];
  try {
    if (email && form.orderId && typeof window !== 'undefined') {
      const raw = localStorage.getItem(`userOrders_${email}`);
      if (raw) {
        const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
        const lists = [...(data.activeOrders || []), ...(data.pastOrders || [])];
        const row = lists.find((o) => String((o as { id?: string }).id || '') === form.orderId) as
          | {
              lineItems?: Array<{ productName?: string; subtotal?: number }>;
              productName?: string;
              total?: number;
              subtotal?: number;
            }
          | undefined;
        if (row?.lineItems && Array.isArray(row.lineItems) && row.lineItems.length > 0) {
          for (const li of row.lineItems) {
            const name = String(li.productName || 'ITEM').trim().toUpperCase();
            const sub = Number(li.subtotal);
            if (Number.isFinite(sub) && sub > 0) priceUsd += Math.round(sub);
            parts.push(name);
          }
        } else if (row) {
          const name = String(row.productName || 'ORDER').trim().toUpperCase();
          parts.push(name);
          const t = Number(row.subtotal ?? row.total);
          if (Number.isFinite(t) && t > 0) priceUsd = Math.round(t);
        }
      }
    }
  } catch {
    /* ignore */
  }
  if (parts.length === 0) {
    parts.push('ORDER AUTHORIZATION');
  }
  const line = `${parts.join(' · ')}${priceUsd > 0 ? ` · $${priceUsd.toLocaleString()}` : ''}`;
  return { line, priceUsd };
}

function FormPendingClientAvatar({
  email,
  clientLabel,
  photoUrl,
}: {
  email: string;
  clientLabel: string;
  photoUrl?: string;
}) {
  const nav = useNavigate();
  const [imgError, setImgError] = useState(false);
  const primary = (photoUrl || '').trim();
  const src =
    !imgError && primary && (primary.startsWith('http') || primary.startsWith('/') || primary.startsWith('data:'))
      ? primary
      : DEFAULT_CLIENT_PROFILE_THUMB;
  const em = email.trim();
  return (
    <button
      type="button"
      onClick={() => {
        if (!em) return;
        nav(`/admin/clients/overview?email=${encodeURIComponent(em)}&returnTo=pending`);
      }}
      className="p-0 border-0 bg-transparent cursor-pointer"
      style={{ lineHeight: 0 }}
      aria-label={`Open client details for ${clientLabel}`}
      disabled={!em}
    >
      <div
        className="rounded-full shrink-0 overflow-hidden"
        style={{ width: '44px', height: '44px', border: '0.8px solid #000' }}
        aria-hidden
      >
        <img
          src={src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => {
            if (primary) setImgError(true);
          }}
        />
      </div>
    </button>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', margin: '16px 0 8px' }}>{children}</h3>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2" style={rowStyle}>
      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{label}</span>
      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{value}</span>
    </div>
  );
}

export default function AdminPending() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = usePersistentQueryState<(typeof PENDING_TABS)[number]>({
    queryKey: 'tab',
    storageKey: 'adminPendingActiveTab',
    defaultValue: 'OVERVIEW',
    allowedValues: PENDING_TABS,
  });
  const [pendingReviews, setPendingReviews] = useState(0);
  const [orderForms, setOrderForms] = useState(0);
  const [pendingItems, setPendingItems] = useState<{ label: string; value: string }[]>([]);
  const [reviewBreakdown, setReviewBreakdown] = useState<{
    total: number;
    withPhotos: number;
    withVideos: number;
    textOnly: number;
  }>({ total: 0, withPhotos: 0, withVideos: 0, textOnly: 0 });
  const [pendingAuthFormsBump, setPendingAuthFormsBump] = useState(0);
  const [mockQueuesBump, setMockQueuesBump] = useState(0);
  const [adminReviewModal, setAdminReviewModal] = useState<PendingAdminModal | null>(null);
  const [showDeclineReasonModal, setShowDeclineReasonModal] = useState(false);
  const [declineReasonDraft, setDeclineReasonDraft] = useState('');
  const [affiliateDeclineTargetId, setAffiliateDeclineTargetId] = useState<string | null>(null);

  const openClientFromPending = useCallback(
    (email: string) => {
      const e = email.trim();
      if (!e) return;
      navigate(`/admin/clients/overview?email=${encodeURIComponent(e)}&returnTo=pending`);
    },
    [navigate]
  );

  const sessionUserPhotoByEmail = useMemo(() => {
    void pendingAuthFormsBump;
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const u = JSON.parse(raw) as { email?: string; profileImage?: string; avatar?: string };
      const em = (u.email || '').trim().toLowerCase();
      const photo = (u.profileImage || u.avatar || '').trim();
      if (!em) return null;
      return { email: em, photo: photo || undefined };
    } catch {
      return null;
    }
  }, [pendingAuthFormsBump]);

  const profilePhotoUrlForFormEmail = useCallback(
    (email: string) => {
      const key = normalizeEmailKey(email);
      if (sessionUserPhotoByEmail?.email === key) return sessionUserPhotoByEmail.photo;
      return undefined;
    },
    [sessionUserPhotoByEmail]
  );

  const regionLineForFormClient = useCallback((email: string, name: string) => {
    const key = normalizeEmailKey(email);
    const mock = getMockClientsForAyoteenz().find((c: { email?: string }) => normalizeEmailKey(c.email || '') === key);
    const addr = mock && typeof mock === 'object' && 'address' in mock ? String((mock as { address?: string }).address || '') : '';
    const paren = regionParenLabelFromAddressLine(addr);
    const abbr = usStateAbbrevFromAddressLine(addr);
    const code = (abbr || (paren ? compactRegionCodeForReviewHeader(paren) : '') || '').trim().toUpperCase();
    return `${name.trim().toUpperCase()}${code ? ` · ${code}` : ''}`;
  }, []);

  const renderAffiliateRow = (item: PendingMockAffiliateItem) => {
    const cap = (item.caption || '').trim() || 'AFFILIATE SUBMISSION';
    const body =
      item.kind === 'social'
        ? `${String(item.platform || '').toUpperCase()} — ${String(item.handle || '').toUpperCase()}`
        : item.kind === 'video'
          ? 'VIDEO SUBMISSION — TAP PHOTOS BELOW TO EXPAND.'
          : 'PHOTO SUBMISSION — TAP PHOTOS BELOW TO EXPAND.';
    const photoUrls = item.kind === 'photo' && item.imageSrc ? [item.imageSrc] : [];
    const videoUrls =
      item.kind === 'video' && item.imageSrc
        ? ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4']
        : [];
    const photos = item.kind === 'photo' ? 1 : 0;
    const videos = item.kind === 'video' ? 1 : 0;

    return (
      <AdminReviewStyleCard
        key={item.id}
        client={item.client}
        clientEmail={item.email}
        clientProfilePhotoUrl={item.clientProfilePhotoUrl}
        clientRegionParen={item.clientRegionParen}
        clientRegionCode={item.clientRegionCode}
        productLine={cap}
        bodyText={body}
        date={item.date}
        rating={5}
        photos={photos}
        videos={videos}
        photoUrls={photoUrls}
        videoUrls={videoUrls}
        verifiedPurchase={false}
        showStars={false}
        statusLabel="PENDING"
        onOpenClientDetails={openClientFromPending}
      >
        <div className="flex gap-2 flex-wrap" style={{ marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => approvePendingMockAffiliate(item.id)}
            style={{
              flex: 1,
              minWidth: '100px',
              fontFamily: '"Futura PT Medium"',
              fontSize: '10px',
              color: '#fff',
              background: '#EB1C24',
              border: '1.3px solid #000',
              padding: '8px 10px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            APPROVE
          </button>
          <button
            type="button"
            onClick={() => {
              setAffiliateDeclineTargetId(item.id);
              setDeclineReasonDraft('');
              setShowDeclineReasonModal(true);
            }}
            style={{
              flex: 1,
              minWidth: '100px',
              fontFamily: '"Futura PT Medium"',
              fontSize: '10px',
              color: '#EB1C24',
              background: '#fff',
              border: '1.3px solid #000',
              padding: '8px 10px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            DECLINE
          </button>
        </div>
      </AdminReviewStyleCard>
    );
  };

  const pendingAuthFormsCount = useMemo(() => {
    void pendingAuthFormsBump;
    return countPendingOrderAuthorizationFormsForAdmin();
  }, [pendingAuthFormsBump]);

  const pendingAuthFormsList = useMemo(() => {
    void pendingAuthFormsBump;
    return listPendingOrderAuthorizationFormsForAdmin();
  }, [pendingAuthFormsBump]);

  const mockReviewsPendingCount = useMemo(() => {
    void mockQueuesBump;
    return countPendingMockReviews();
  }, [mockQueuesBump]);

  const mockAffiliatePendingCount = useMemo(() => {
    void mockQueuesBump;
    return countPendingMockAffiliate();
  }, [mockQueuesBump]);

  const pendingMockReviewsList = useMemo(() => {
    void mockQueuesBump;
    return listPendingMockReviewsVisible();
  }, [mockQueuesBump]);

  const pendingMockAffiliateList = useMemo(() => {
    void mockQueuesBump;
    return listPendingMockAffiliateVisible();
  }, [mockQueuesBump]);

  useEffect(() => {
    const bump = () => setPendingAuthFormsBump((n) => n + 1);
    window.addEventListener(PENDING_ORDER_FORMS_UPDATED_EVENT, bump);
    window.addEventListener('signedOrderFormsUpdated', bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(PENDING_ORDER_FORMS_UPDATED_EVENT, bump);
      window.removeEventListener('signedOrderFormsUpdated', bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  useEffect(() => {
    seedPendingTestOrderFormsIfNeeded();
  }, []);

  useEffect(() => {
    const bump = () => setMockQueuesBump((n) => n + 1);
    window.addEventListener(PENDING_MOCK_REVIEWS_UPDATED_EVENT, bump);
    window.addEventListener(PENDING_MOCK_AFFILIATE_UPDATED_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(PENDING_MOCK_REVIEWS_UPDATED_EVENT, bump);
      window.removeEventListener(PENDING_MOCK_AFFILIATE_UPDATED_EVENT, bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      Promise.all([getAdminPending(), getAdminReviews()])
        .then(([pending, reviewsRes]) => {
          const apiPending = pending.pendingReviews;
          const fromList = (reviewsRes.reviews as Array<Record<string, unknown>>).filter(
            (r) => String(r.status || '').toLowerCase() === 'pending'
          ).length;
          const pendingCount = fromList > 0 ? fromList : apiPending;

          setPendingReviews(pendingCount);
          setOrderForms(pending.orderForms);
          setReviewBreakdown(
            fromList > 0
              ? (() => {
                  const pendingRows = (reviewsRes.reviews as Array<Record<string, unknown>>).filter(
                    (r) => String(r.status || '').toLowerCase() === 'pending'
                  );
                  let withPhotos = 0;
                  let withVideos = 0;
                  let textOnly = 0;
                  for (const r of pendingRows) {
                    const p = r.photos;
                    const photoN = Array.isArray(p) ? p.length : Number(p) || 0;
                    const vidN = Number(r.videos) || 0;
                    if (photoN > 0) withPhotos += 1;
                    if (vidN > 0) withVideos += 1;
                    if (photoN === 0 && vidN === 0) textOnly += 1;
                  }
                  return {
                    total: pendingRows.length,
                    withPhotos,
                    withVideos,
                    textOnly,
                  };
                })()
              : pending.pendingReviewBreakdown
          );
          const localForms = countPendingOrderAuthorizationFormsForAdmin();
          setPendingItems(
            pending.pendingItems.length
              ? pending.pendingItems.map((row, i) => {
                  if (i === 0) return { ...row, value: String(pendingCount) };
                  if (row.label === 'ORDER FORMS') return { ...row, value: String(localForms) };
                  return row;
                })
              : [
                  { label: 'PENDING REVIEWS', value: String(pendingCount) },
                  { label: 'ORDER FORMS', value: String(localForms) },
                  { label: 'TIER UPGRADES', value: '0' },
                  { label: 'AFFILIATE REQUESTS', value: '0' },
                  { label: 'REFUND REQUESTS', value: '0' },
                  { label: 'SYSTEM ALERTS', value: '0' },
                ]
          );
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const t = (searchParams.get('tab') || '').toLowerCase();
    if (t === 'reviews') {
      setActiveTab('REVIEWS');
    }
  }, [searchParams]);

  const displayItems = useMemo(() => {
    const base =
      pendingItems.length > 0
        ? pendingItems
        : [
            { label: 'PENDING REVIEWS', value: String(pendingReviews) },
            { label: 'ORDER FORMS', value: String(orderForms) },
            { label: 'TIER UPGRADES', value: '0' },
            { label: 'AFFILIATE REQUESTS', value: '0' },
            { label: 'REFUND REQUESTS', value: '0' },
            { label: 'SYSTEM ALERTS', value: '0' },
          ];
    return base.map((row) => {
      if (row.label === 'ORDER FORMS') return { ...row, value: String(pendingAuthFormsCount) };
      if (row.label === 'PENDING REVIEWS') {
        const n = Number.parseInt(String(row.value), 10);
        const api = Number.isFinite(n) ? n : 0;
        return { ...row, value: String(api + mockReviewsPendingCount) };
      }
      if (row.label === 'AFFILIATE REQUESTS') {
        const n = Number.parseInt(String(row.value), 10);
        const api = Number.isFinite(n) ? n : 0;
        return { ...row, value: String(api + mockAffiliatePendingCount) };
      }
      return row;
    });
  }, [pendingItems, pendingReviews, orderForms, pendingAuthFormsCount, mockReviewsPendingCount, mockAffiliatePendingCount]);

  const formModalTarget = adminReviewModal?.kind === 'form' ? adminReviewModal.item : null;
  const {
    url: formReviewPdfUrl,
    loading: formReviewPdfLoading,
    error: formReviewPdfError,
  } = useSignedOrderFormPdf(formModalTarget);

  const downloadFormReviewPdf = useCallback(() => {
    if (!formReviewPdfUrl || !formModalTarget) return;
    const a = document.createElement('a');
    a.href = formReviewPdfUrl;
    a.download = signedOrderFormPdfFileName(formModalTarget);
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [formReviewPdfUrl, formModalTarget]);

  const closeAdminReviewModal = useCallback(() => {
    setAdminReviewModal(null);
    setShowDeclineReasonModal(false);
    setDeclineReasonDraft('');
    setAffiliateDeclineTargetId(null);
  }, []);

  const closeDeclineReasonOnly = useCallback(() => {
    setShowDeclineReasonModal(false);
    setDeclineReasonDraft('');
    setAffiliateDeclineTargetId(null);
  }, []);

  const submitDecline = useCallback(() => {
    if (affiliateDeclineTargetId) {
      declinePendingMockAffiliate(affiliateDeclineTargetId, declineReasonDraft);
      closeDeclineReasonOnly();
      return;
    }
    if (!adminReviewModal) return;
    if (adminReviewModal.kind === 'form') {
      declineOrderFormSubmission(adminReviewModal.item, declineReasonDraft);
    } else {
      declinePendingMockReview(adminReviewModal.item.id, declineReasonDraft);
    }
    closeAdminReviewModal();
  }, [
    affiliateDeclineTargetId,
    adminReviewModal,
    declineReasonDraft,
    closeAdminReviewModal,
    closeDeclineReasonOnly,
  ]);

  const modalTitle = (() => {
    if (!adminReviewModal) return '';
    if (adminReviewModal.kind === 'form') return 'REVIEW ORDER FORM';
    return 'REVIEW CLIENT REVIEW';
  })();

  const declineModalTitle = (() => {
    if (affiliateDeclineTargetId) return 'DECLINE AFFILIATE SUBMISSION';
    if (!adminReviewModal) return '';
    if (adminReviewModal.kind === 'form') return 'DECLINE ORDER FORM';
    return 'DECLINE REVIEW';
  })();

  const onApproveClick = () => {
    if (!adminReviewModal) return;
    if (adminReviewModal.kind === 'form') {
      approveOrderFormSubmission(adminReviewModal.item);
    } else {
      approvePendingMockReview(adminReviewModal.item.id);
    }
    closeAdminReviewModal();
  };

  const formsRows = [
    { label: 'INCOMPLETE FORMS', value: '5' },
    { label: 'MISSING INFO', value: '3' },
    { label: 'PENDING APPROVAL', value: '2' },
    { label: 'REQUIRES FOLLOW-UP', value: '1' },
  ];
  const tierRows = [
    { label: 'STANDARD TO PREMIUM', value: '12' },
    { label: 'PREMIUM TO VIP', value: '8' },
    { label: 'VIP TO BLACK TIER', value: '3' },
    { label: 'PENDING PAYMENT', value: '5' },
  ];
  const affiliateReqRows = [
    { label: 'NEW APPLICANTS', value: '23' },
    { label: 'DOCUMENTATION', value: '15' },
    { label: 'BACKGROUND CHECK', value: '9' },
    { label: 'APPROVED PENDING', value: '12' },
  ];
  const refundRows = [
    { label: 'PRODUCT ISSUES', value: '2' },
    { label: 'SERVICE COMPLAINTS', value: '1' },
    { label: 'PROCESSING TIME', value: '2-3 days' },
    { label: 'TOTAL AMOUNT', value: '$1,250' },
  ];
  const affiliateQueueRows = [
    { label: 'CONTENT SUBMISSIONS', value: '18' },
    { label: 'PHOTO REVIEW', value: '11' },
    { label: 'VIDEO REVIEW', value: '4' },
    { label: 'SOCIAL TAGS', value: '7' },
    { label: 'POINTS PAYOUT QUEUE', value: '3' },
  ];

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
          title="PENDING"
          showBack
          onBack={() => window.history.back()}
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

              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                <div
                  className="text-center py-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderRadius: '4px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: '10px',
                  }}
                >
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>
                    {pendingReviews + mockReviewsPendingCount}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    PENDING REVIEWS
                  </p>
                </div>
                <div
                  className="text-center py-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderRadius: '4px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: '10px',
                  }}
                >
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>
                    {pendingAuthFormsCount}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    ORDER FORMS
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {PENDING_TABS.map((tab) => (
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
                    maxHeight: '380px',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                  {activeTab === 'OVERVIEW' && (
                    <>
                      <SectionTitle>PENDING ITEMS</SectionTitle>
                      <div className="space-y-0">
                        {displayItems.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>REVIEWS · PENDING BY TYPE</SectionTitle>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px', lineHeight: 1.35 }}>
                        ALIGNS WITH <span style={{ color: '#000' }}>ADMIN → REVIEWS</span> &amp; <span style={{ color: '#000' }}>CLIENT → REVIEWS</span> WHEN API DATA LOADS.
                      </p>
                      <div className="space-y-0">
                        <DataRow label="PENDING (ALL)" value={String(reviewBreakdown.total + mockReviewsPendingCount)} />
                        <DataRow label="WITH PHOTOS" value={String(reviewBreakdown.withPhotos)} />
                        <DataRow label="WITH VIDEOS" value={String(reviewBreakdown.withVideos)} />
                        <DataRow label="TEXT ONLY" value={String(reviewBreakdown.textOnly)} />
                      </div>

                      <SectionTitle>ORDER FORMS</SectionTitle>
                      <div className="space-y-0">
                        {formsRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>TIER UPGRADES</SectionTitle>
                      <div className="space-y-0">
                        {tierRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>AFFILIATE REQUESTS</SectionTitle>
                      <div className="space-y-0">
                        {affiliateReqRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>REFUND REQUESTS</SectionTitle>
                      <div className="space-y-0">
                        {refundRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>AFFILIATE QUEUE</SectionTitle>
                      <div className="space-y-0">
                        {affiliateQueueRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'REVIEWS' && (
                    <>
                      {pendingMockReviewsList.length === 0 ? (
                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
                          NO REVIEWS PENDING APPROVAL.
                        </p>
                      ) : (
                        pendingMockReviewsList.map((r) => (
                          <AdminReviewStyleCard
                            key={r.id}
                            client={r.client}
                            clientEmail={r.email}
                            productLine={r.product}
                            bodyText={r.excerpt}
                            date={r.date}
                            rating={r.rating}
                            photos={0}
                            videos={0}
                            verifiedPurchase
                            statusLabel="PENDING"
                            footerLinkLabel="VIEW REVIEW"
                            onFooterLinkClick={() => setAdminReviewModal({ kind: 'review', item: r })}
                            onOpenClientDetails={openClientFromPending}
                          />
                        ))
                      )}
                    </>
                  )}

                  {activeTab === 'FORMS' && (
                    <>
                      {pendingAuthFormsList.length === 0 ? (
                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
                          NO FORMS PENDING APPROVAL.
                        </p>
                      ) : (
                        pendingAuthFormsList.map((f) => {
                          const nameRaw =
                            `${String(f.formFields?.firstName || '').trim()} ${String(f.formFields?.lastName || '').trim()}`.trim() || '—';
                          const nameUpper = nameRaw.toUpperCase();
                          const orderPlacedDate = (() => {
                            try {
                              return new Date(f.signedAt).toLocaleDateString(undefined, { dateStyle: 'short' });
                            } catch {
                              return '—';
                            }
                          })();
                          const { line: orderContentsLine } = orderSummaryForPendingForm(f);
                          const showView = pendingFormShowsViewFormAction(f);
                          const photoForClient = profilePhotoUrlForFormEmail(f.email);
                          return (
                            <div key={`${f.email}-${f.id}`} className="py-3" style={rowStyle}>
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1 flex flex-col">
                                  <FormPendingClientAvatar email={f.email} clientLabel={nameUpper} photoUrl={photoForClient} />
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '11px',
                                      color: '#000',
                                      margin: '8px 0 0',
                                      lineHeight: 1.35,
                                    }}
                                  >
                                    {regionLineForFormClient(f.email, nameRaw)}
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '11px',
                                      color: '#EB1C24',
                                      margin: '6px 0 0',
                                    }}
                                  >
                                    {String(f.orderNumber || '').toUpperCase()}
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '11px',
                                      color: '#808080',
                                      margin: '6px 0 0',
                                    }}
                                  >
                                    {orderContentsLine}
                                  </p>
                                  {showView ? (
                                    <button
                                      type="button"
                                      onClick={() => setAdminReviewModal({ kind: 'form', item: f })}
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        fontSize: '11px',
                                        color: '#EB1C24',
                                        fontWeight: 500,
                                        margin: '10px 0 0',
                                        padding: 0,
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                      }}
                                    >
                                      VIEW FORM
                                    </button>
                                  ) : (
                                    <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', color: '#808080', margin: '10px 0 0' }}>
                                      SIGNED · PENDING VERIFY
                                    </p>
                                  )}
                                </div>
                                <span
                                  style={{
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '11px',
                                    color: '#000',
                                    flexShrink: 0,
                                    textAlign: 'right',
                                  }}
                                >
                                  {orderPlacedDate}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </>
                  )}

                  {activeTab === 'AFFILIATE' && (
                    <>
                      {pendingMockAffiliateList.length === 0 ? (
                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
                          NO AFFILIATE SUBMISSIONS PENDING APPROVAL.
                        </p>
                      ) : (
                        <>
                          <SectionTitle>PHOTOS</SectionTitle>
                          {pendingMockAffiliateList.filter((x) => x.kind === 'photo').map(renderAffiliateRow)}
                          <SectionTitle>VIDEOS</SectionTitle>
                          {pendingMockAffiliateList.filter((x) => x.kind === 'video').map(renderAffiliateRow)}
                          <SectionTitle>SOCIAL LINKS</SectionTitle>
                          {pendingMockAffiliateList.filter((x) => x.kind === 'social').map(renderAffiliateRow)}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                onClick={() => navigate('/admin/reviews')}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={pageActionButtonStyle}
              >
                REVIEW PENDING ITEMS
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>

      {adminReviewModal && !showDeclineReasonModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
          onClick={closeAdminReviewModal}
          role="presentation"
        >
          <div
            className="flex flex-col items-stretch sm:items-center"
            style={{ width: '100%', maxWidth: 'min(520px, 100%)', gap: '12px', padding: '0 12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-4 overflow-hidden bg-white"
              style={{
                maxWidth: '520px',
                width: '100%',
                alignSelf: 'center',
                maxHeight: 'min(78vh, 720px)',
                border: '1.3px solid black',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
              role="dialog"
              aria-labelledby="pending-admin-review-title"
            >
              <div className="flex justify-between items-center flex-shrink-0" style={{ marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                <p id="pending-admin-review-title" style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase', fontWeight: 500 }}>
                  {modalTitle}
                </p>
                <button type="button" onClick={closeAdminReviewModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Close">
                  <img
                    src="/assets/close-icon.svg"
                    alt=""
                    style={{
                      width: '18px',
                      height: '18px',
                      display: 'block',
                      filter:
                        'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)',
                    }}
                  />
                </button>
              </div>
              <div className="flex-1 min-h-0 flex flex-col overflow-auto" style={{ paddingBottom: '12px' }}>
                {adminReviewModal.kind === 'form' ? (
                  <SignedOrderFormPdfPanel url={formReviewPdfUrl} loading={formReviewPdfLoading} error={formReviewPdfError} />
                ) : (
                  <div style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', lineHeight: 1.45 }}>
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: '0 0 8px', textTransform: 'uppercase' }}>
                      {adminReviewModal.item.client}
                    </p>
                    <p style={{ margin: '0 0 6px', color: '#808080', fontSize: '10px' }}>{adminReviewModal.item.email}</p>
                    <p style={{ margin: '0 0 6px', textTransform: 'uppercase' }}>{adminReviewModal.item.product}</p>
                    <p style={{ margin: '0 0 6px' }}>{adminReviewModal.item.excerpt}</p>
                    <p style={{ margin: 0, color: '#808080', fontSize: '10px' }}>
                      {adminReviewModal.item.rating} STARS · {adminReviewModal.item.date}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap" style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onApproveClick}
                  disabled={adminReviewModal.kind === 'form' && formReviewPdfLoading}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#fff',
                    background: '#EB1C24',
                    border: '1.3px solid #000',
                    padding: '8px 10px',
                    cursor: adminReviewModal.kind === 'form' && formReviewPdfLoading ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  APPROVE
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeclineReasonModal(true)}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    background: '#fff',
                    border: '1.3px solid #000',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  DECLINE
                </button>
              </div>
            </div>
            {adminReviewModal.kind === 'form' ? (
              <button
                type="button"
                onClick={downloadFormReviewPdf}
                disabled={!formReviewPdfUrl || formReviewPdfLoading}
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '10px',
                  color: '#EB1C24',
                  background: '#fff',
                  border: '1.3px solid #000',
                  padding: '8px 12px',
                  cursor: formReviewPdfUrl && !formReviewPdfLoading ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase',
                  alignSelf: 'center',
                  width: '100%',
                  maxWidth: '520px',
                }}
              >
                SAVE / DOWNLOAD PDF
              </button>
            ) : null}
          </div>
        </div>
      )}

      {showDeclineReasonModal && (adminReviewModal || affiliateDeclineTargetId) && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          onClick={() => closeDeclineReasonOnly()}
          role="presentation"
        >
          <div
            className="bg-white p-4 mx-4"
            style={{ maxWidth: '400px', width: '100%', border: '1.3px solid #000' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="decline-reason-title"
          >
            <p id="decline-reason-title" style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', margin: '0 0 12px', textTransform: 'uppercase' }}>
              {declineModalTitle}
            </p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '0 0 8px' }}>
              OPTIONAL REASON (SHOWN TO OPS / YOUR RECORDS):
            </p>
            <textarea
              value={declineReasonDraft}
              onChange={(e) => setDeclineReasonDraft(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                border: '1px solid #e5e7eb',
                fontFamily: '"Futura PT Book"',
                fontSize: '11px',
                padding: '8px',
                boxSizing: 'border-box',
                marginBottom: '12px',
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={submitDecline}
                style={{
                  flex: 1,
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '10px',
                  color: '#fff',
                  background: '#EB1C24',
                  border: '1.3px solid #000',
                  padding: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                CONFIRM DECLINE
              </button>
              <button
                type="button"
                onClick={() => closeDeclineReasonOnly()}
                style={{
                  flex: 1,
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '10px',
                  color: '#000',
                  background: '#fff',
                  border: '1.3px solid #000',
                  padding: '8px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
