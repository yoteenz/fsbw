import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminPending, getAdminReviews, getAdminPendingQueue, patchAdminPendingQueue } from '../../../utils/api';
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
import {
  approveOrderFormSubmission,
  declineOrderFormSubmission,
  fingerprintSignedOrderFormFields,
  orderFormMatchesPreviouslyApprovedFingerprint,
} from '../../../utils/signedOrderFormsStorage';
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
  listPendingMockAffiliateDeclined,
  listPendingMockAffiliateForAdmin,
  listPendingMockAffiliateVisible,
  listPendingMockReviewsVisible,
  PENDING_MOCK_AFFILIATE_UPDATED_EVENT,
  PENDING_MOCK_REVIEWS_UPDATED_EVENT,
  type PendingMockAffiliateItem,
  type PendingMockReview,
} from '../../../utils/adminPendingMockQueues';
import { AdminReviewStyleCard } from '../../../components/admin/AdminReviewStyleCard';
import { compactRegionCodeForReviewHeader } from '../../../utils/usAddressStateDisplay';
import {
  serverAffiliateRowToPendingMock,
  serverDbReviewToPendingMock,
  serverOrderFormRowToStored,
  serverReviewSupplementalToPendingMock,
} from '../../../utils/serverPendingQueueMappers';
import { getPerUserKey, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { getPointsMultiplier } from '../../../constants/tiers';
import {
  accountReviewThumbnailFromProductTitle,
  formatReviewSubmittedDateTimeLine,
} from '../../../utils/accountReviewProductThumbnail';

const PENDING_TABS = ['OVERVIEW', 'REVIEWS', 'FORMS', 'AFFILIATE'] as const;

/** Match Account → Reviews product image column */
const ACCOUNT_REVIEWS_MODAL_THUMB_PX = 102;
const ACCOUNT_REVIEWS_MODAL_STAR_PX = 9.11;
const ACCOUNT_REVIEWS_MODAL_MEDIA_FRAME_PX = 50;
const NOIR_REVIEW_STAR_FILLED_SRC = '/assets/NOIR/filled-star.png';
const NOIR_REVIEW_STAR_OUTLINE_SRC = '/assets/NOIR/star-symbol.png';

/** Pending review modal: show photos/videos under date line even when only counts exist (matches list card). */
function pendingReviewModalDisplayMedia(rv: PendingMockReview): { photoUrls: string[]; videoUrls: string[] } {
  const existingP = (rv.photoUrls || []).filter(Boolean);
  const existingV = (rv.videoUrls || []).filter(Boolean);
  if (existingP.length > 0 || existingV.length > 0) {
    return { photoUrls: existingP, videoUrls: existingV };
  }
  const pCount = rv.photoCount ?? 0;
  const vCount = rv.videoCount ?? 0;
  if (pCount <= 0 && vCount <= 0) return { photoUrls: [], videoUrls: [] };
  const h = String(rv.id || '0').replace(/\W/g, '').slice(0, 12) || '0';
  const photoUrls = Array.from({ length: Math.max(0, pCount) }, (_, i) =>
    `https://picsum.photos/seed/baw-pend-modal-${h}-p${i}/200/200`
  );
  const videoUrls = Array.from({ length: Math.max(0, vCount) }, () =>
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  return { photoUrls, videoUrls };
}

/** Avatar + left column right, date left — symmetric nudge inside list cards. */
const PENDING_CARD_CONTENT_NUDGE_PX = 6;

const rowStyle = {
  borderBottom: '1px solid #e5e7eb' as const,
};

type PendingAdminModal =
  | { kind: 'form'; item: StoredSignedOrderForm }
  | { kind: 'review'; item: PendingMockReview }
  | { kind: 'affiliate'; item: PendingMockAffiliateItem };

type AffiliateDeclineTarget = { mockId: string; serverId?: string };

const DEFAULT_CLIENT_PROFILE_THUMB = '/assets/profile-thumb.png';

function normalizeEmailKey(email: string): string {
  return (email || '').trim().toLowerCase();
}

function orderPriceUsdForForm(form: StoredSignedOrderForm): number {
  const email = normalizeEmailKey(form.email);
  let priceUsd = 0;
  const normOrderNum = (s: string) =>
    s
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
      .replace(/^ORDER\s+/i, '');
  try {
    if (email && typeof window !== 'undefined') {
      const raw = localStorage.getItem(`userOrders_${email}`);
      if (raw) {
        const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
        const lists = [...(data.activeOrders || []), ...(data.pastOrders || [])];
        const formOrderId = (form.orderId || '').trim();
        const formNum = normOrderNum(String(form.orderNumber || ''));
        const row = lists.find((o) => {
          const oid = String((o as { id?: string }).id || '').trim();
          if (formOrderId && oid === formOrderId) return true;
          const onum = normOrderNum(String((o as { orderNumber?: string }).orderNumber || ''));
          return formNum && onum && onum === formNum;
        }) as
          | {
              lineItems?: Array<{ productName?: string; subtotal?: number }>;
              productName?: string;
              total?: number;
              subtotal?: number;
            }
          | undefined;
        if (row?.lineItems && Array.isArray(row.lineItems) && row.lineItems.length > 0) {
          for (const li of row.lineItems) {
            const sub = Number(li.subtotal);
            if (Number.isFinite(sub) && sub > 0) priceUsd += Math.round(sub);
          }
        } else if (row) {
          const t = Number(row.subtotal ?? row.total);
          if (Number.isFinite(t) && t > 0) priceUsd = Math.round(t);
        }
      }
    }
  } catch {
    /* ignore */
  }
  return priceUsd;
}

function orderSummaryForPendingForm(form: StoredSignedOrderForm): {
  line: string;
  priceUsd: number;
  formFingerprint: string;
} {
  const priceUsd = orderPriceUsdForForm(form);
  const fp = fingerprintSignedOrderFormFields(form.formFields);
  const preApproved = orderFormMatchesPreviouslyApprovedFingerprint(form.email, form.id, fp);
  const priceBit = priceUsd > 0 ? `$${priceUsd.toLocaleString()}` : '';
  const statusBit = preApproved ? 'PRE-APPROVED COPY' : 'ORIGINAL COPY';
  const grayLine = priceBit ? `${priceBit} · ${statusBit}` : statusBit;
  return { line: grayLine, priceUsd, formFingerprint: fp };
}

function affiliateProductKey(item: PendingMockAffiliateItem): string {
  return (item.productName || '').trim().toUpperCase() || 'PRODUCT';
}

function socialSubmissionLabel(platform: string | undefined): string {
  const p = (platform || '').trim().toUpperCase();
  if (p === 'INSTAGRAM') return 'INSTAGRAM REEL';
  if (p === 'TIKTOK') return 'TIKTOK POST';
  if (p === 'TWITTER' || p === 'X') return 'TWITTER POST';
  if (p === 'YOUTUBE') return 'YOUTUBE SHORT';
  if (p === 'FACEBOOK') return 'FACEBOOK POST';
  if (p) return `${p} POST`;
  return 'SOCIAL TAG';
}

function affiliateProductKindLine(item: PendingMockAffiliateItem): string {
  const prod = affiliateProductKey(item);
  if (item.kind === 'photo') return `${prod} PHOTO`;
  if (item.kind === 'video') return `${prod} VIDEO`;
  return `${prod} ${socialSubmissionLabel(item.platform)}`;
}

function productNameForOrderId(clientEmail: string, orderId: string): string {
  const em = normalizeEmailKey(clientEmail);
  const oid = (orderId || '').trim();
  if (!em || !oid || typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem(`userOrders_${em}`);
    if (!raw) return '';
    const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
    const lists = [...(data.activeOrders || []), ...(data.pastOrders || [])];
    const row = lists.find((o) => String((o as { id?: string }).id || '') === oid) as
      | { productName?: string }
      | undefined;
    return String(row?.productName || '').trim().toUpperCase();
  } catch {
    return '';
  }
}

function affiliateSubmittedCountsLine(
  email: string,
  productKey: string,
  contentByOrder: Record<string, { photos?: unknown[]; videos?: unknown[]; socials?: unknown[] }> | null
): string {
  const em = normalizeEmailKey(email);
  const pk = (productKey || '').trim().toUpperCase();
  if (!em || !pk) return '';
  let photos = 0;
  let videos = 0;
  let socials = 0;
  if (contentByOrder && typeof contentByOrder === 'object') {
    for (const [orderId, slice] of Object.entries(contentByOrder)) {
      if (!slice || typeof slice !== 'object') continue;
      const orderProduct = productNameForOrderId(em, orderId);
      if (orderProduct && orderProduct !== pk) continue;
      for (const p of slice.photos || []) {
        const row = p as { status?: string };
        const st = String(row.status || '').toLowerCase();
        if (st !== 'approved' && st !== 'pending') continue;
        photos += 1;
      }
      for (const v of slice.videos || []) {
        const row = v as { status?: string };
        const st = String(row.status || '').toLowerCase();
        if (st !== 'approved' && st !== 'pending') continue;
        videos += 1;
      }
      for (const s of slice.socials || []) {
        const row = s as { status?: string };
        const st = String(row.status || '').toLowerCase();
        if (st !== 'approved' && st !== 'pending') continue;
        socials += 1;
      }
    }
  }
  if (photos === 0 && videos === 0 && socials === 0) {
    const demo: Record<string, { p: number; v: number; s: number }> = {
      'sarah.j@email.com|NOIR': { p: 2, v: 1, s: 3 },
      'maria.r@email.com|SOFT WAVE': { p: 1, v: 2, s: 1 },
      'jordan.lee@email.com|BUNDLES': { p: 3, v: 0, s: 2 },
      'mock4@test.com|SOFT WAVE': { p: 0, v: 1, s: 0 },
    };
    const hit = demo[`${em}|${pk}`];
    if (hit) {
      photos = hit.p;
      videos = hit.v;
      socials = hit.s;
    }
  }
  const parts: string[] = [];
  parts.push(`${photos} ${photos === 1 ? 'PHOTO' : 'PHOTOS'}.`);
  parts.push(`${videos} ${videos === 1 ? 'VIDEO' : 'VIDEOS'}.`);
  parts.push(`${socials} ${socials === 1 ? 'SOCIAL TAG' : 'SOCIAL TAGS'}.`);
  return parts.join(' ');
}

function regionCodeFromSignedFormFields(formFields: Record<string, string> | undefined): string {
  if (!formFields || typeof formFields !== 'object') return '';
  const raw = String(formFields.state || formFields.billingState || '').trim();
  if (!raw) return '';
  const u = raw.toUpperCase();
  if (/^[A-Z]{2}$/.test(u)) return u;
  return (compactRegionCodeForReviewHeader(u) || '').trim().toUpperCase();
}

function loadAffiliateContentMapForEmail(email: string): Record<string, { photos?: unknown[]; videos?: unknown[]; socials?: unknown[] }> | null {
  const em = normalizeEmailKey(email);
  if (!em || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getPerUserKey(PER_USER_KEYS.affiliateSubmittedContent, em));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, { photos?: unknown[]; videos?: unknown[]; socials?: unknown[] }>)
      : null;
  } catch {
    return null;
  }
}

function pointsOnAffiliateContentSlice(slice: { photos?: unknown[]; videos?: unknown[]; socials?: unknown[] } | null | undefined): number {
  if (!slice || typeof slice !== 'object') return 0;
  let sum = 0;
  for (const row of [...(slice.photos || []), ...(slice.videos || []), ...(slice.socials || [])]) {
    const p = Number((row as { points?: unknown }).points);
    if (Number.isFinite(p) && p > 0) sum += Math.round(p);
  }
  return sum;
}

function pendingAffiliatePointsForItem(item: PendingMockAffiliateItem): number {
  const em = normalizeEmailKey(item.email);
  const oid = (item.orderId || '').trim();
  if (!em || !oid) return 0;
  const map = loadAffiliateContentMapForEmail(em);
  if (!map) return 0;
  const slice = map[oid];
  return pointsOnAffiliateContentSlice(slice);
}

function pendingPointsFromReviewsCounts(photoN: number, videoN: number): number {
  const base = photoN * 400 + videoN * 600;
  const { multiplier } = getPointsMultiplier('SILVER', null);
  return Math.round(base * multiplier);
}

function pendingPointsFromForms(forms: StoredSignedOrderForm[]): number {
  let sum = 0;
  for (const f of forms) {
    const usd = orderPriceUsdForForm(f);
    if (usd <= 0) continue;
    const { multiplier } = getPointsMultiplier('SILVER', null);
    sum += Math.round(usd * multiplier);
  }
  return sum;
}

function pendingPointsFromAffiliateItems(items: PendingMockAffiliateItem[]): number {
  let sum = 0;
  for (const it of items) {
    sum += pendingAffiliatePointsForItem(it);
  }
  return sum;
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
  const [affiliateDeclineTarget, setAffiliateDeclineTarget] = useState<AffiliateDeclineTarget | null>(null);
  const [serverQueues, setServerQueues] = useState<{
    orderForms: unknown[];
    affiliate: unknown[];
    reviewSupplemental: unknown[];
    dbReviews: unknown[];
  } | null>(null);
  const [serverQueueBump, setServerQueueBump] = useState(0);

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

  const serverFormsList = useMemo(() => {
    void serverQueueBump;
    if (!serverQueues?.orderForms?.length) return [];
    return (serverQueues.orderForms as Record<string, unknown>[])
      .map((row) => serverOrderFormRowToStored(row))
      .filter((x): x is StoredSignedOrderForm => Boolean(x));
  }, [serverQueues, serverQueueBump]);

  const pendingAuthFormsMerged = useMemo(() => {
    const server = serverFormsList;
    const serverOrderIds = new Set(server.map((s) => s.orderId).filter(Boolean) as string[]);
    const localExtra = pendingAuthFormsList.filter((l) => {
      if (l.serverQueueId) return false;
      if (l.orderId && serverOrderIds.has(l.orderId)) return false;
      return true;
    });
    return server.length ? [...server, ...localExtra] : pendingAuthFormsList;
  }, [serverFormsList, pendingAuthFormsList]);

  const serverDbReviewsMapped = useMemo(() => {
    void serverQueueBump;
    if (!serverQueues?.dbReviews?.length) return [];
    return (serverQueues.dbReviews as Record<string, unknown>[]).map(serverDbReviewToPendingMock);
  }, [serverQueues, serverQueueBump]);

  const serverReviewSuppMapped = useMemo(() => {
    void serverQueueBump;
    if (!serverQueues?.reviewSupplemental?.length) return [];
    return (serverQueues.reviewSupplemental as Record<string, unknown>[]).map(serverReviewSupplementalToPendingMock);
  }, [serverQueues, serverQueueBump]);

  const pendingReviewsMerged = useMemo(() => {
    if (!serverQueues) return pendingMockReviewsList;
    return [...serverDbReviewsMapped, ...serverReviewSuppMapped, ...pendingMockReviewsList];
  }, [serverQueues, serverDbReviewsMapped, serverReviewSuppMapped, pendingMockReviewsList]);

  const serverAffiliateMapped = useMemo(() => {
    void serverQueueBump;
    if (!serverQueues?.affiliate?.length) return [];
    return (serverQueues.affiliate as Record<string, unknown>[])
      .map((row) => serverAffiliateRowToPendingMock(row))
      .filter((x): x is PendingMockAffiliateItem => Boolean(x));
  }, [serverQueues, serverQueueBump]);

  const pendingAffiliateMerged = useMemo(() => {
    if (!serverQueues) return pendingMockAffiliateList;
    return [...serverAffiliateMapped, ...pendingMockAffiliateList];
  }, [serverQueues, serverAffiliateMapped, pendingMockAffiliateList]);

  const affiliateDeclinedByClientProduct = useMemo(() => {
    void mockQueuesBump;
    const map = new Map<string, PendingMockAffiliateItem[]>();
    for (const d of listPendingMockAffiliateDeclined()) {
      const key = `${normalizeEmailKey(d.email)}|${affiliateProductKey(d)}`;
      const arr = map.get(key) || [];
      arr.push(d);
      map.set(key, arr);
    }
    return map;
  }, [mockQueuesBump]);

  const reviewsTabCount = serverQueues ? pendingReviewsMerged.length : pendingReviews + mockReviewsPendingCount;
  const formsTabCount = serverQueues ? pendingAuthFormsMerged.length : pendingAuthFormsCount;
  const affiliateTabCount = serverQueues ? pendingAffiliateMerged.length : mockAffiliatePendingCount;

  const pendingSummaryMetrics = useMemo(() => {
    void mockQueuesBump;
    void serverQueueBump;
    void pendingAuthFormsBump;

    const reviewsList = pendingReviewsMerged;
    let photoSlots = 0;
    let videoSlots = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    for (const r of reviewsList) {
      const p = r.photoCount ?? (r.photoUrls?.length || 0);
      const v = r.videoCount ?? (r.videoUrls?.length || 0);
      photoSlots += p;
      videoSlots += v;
      const rt = Number(r.rating);
      if (Number.isFinite(rt) && rt > 0) {
        ratingSum += rt;
        ratingCount += 1;
      }
    }
    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;
    const positivePct =
      ratingCount > 0 ? Math.round((avgRating / 5) * 100) : 0;

    const formsList = pendingAuthFormsMerged;
    let newFormsCount = 0;
    for (const f of formsList) {
      const fp = fingerprintSignedOrderFormFields(f.formFields);
      const pre = orderFormMatchesPreviouslyApprovedFingerprint(f.email, f.id, fp);
      if (!pre) newFormsCount += 1;
    }
    const affList = pendingAffiliateMerged;
    const allAffiliateHistory = listPendingMockAffiliateForAdmin();
    const firstAffiliateRowIdByEmail = new Map<string, string>();
    for (let i = allAffiliateHistory.length - 1; i >= 0; i--) {
      const row = allAffiliateHistory[i];
      const em = normalizeEmailKey(row.email);
      if (!em || firstAffiliateRowIdByEmail.has(em)) continue;
      firstAffiliateRowIdByEmail.set(em, row.id);
    }
    let newAffiliateContent = 0;
    for (const it of affList) {
      const em = normalizeEmailKey(it.email);
      if (!em) continue;
      const firstId = firstAffiliateRowIdByEmail.get(em);
      if (!firstAffiliateRowIdByEmail.has(em) || firstId === it.id) newAffiliateContent += 1;
    }
    const reviewPts = pendingPointsFromReviewsCounts(photoSlots, videoSlots);
    const formPts = pendingPointsFromForms(formsList);
    const affPts = pendingPointsFromAffiliateItems(affList);
    const totalPointsOverview = reviewPts + formPts + affPts;

    let formSpendUsd = 0;
    for (const f of formsList) {
      formSpendUsd += orderPriceUsdForForm(f);
    }

    return {
      overview: {
        totalPoints: totalPointsOverview,
        totalSpendUsd: formSpendUsd,
      },
      reviews: {
        positivePct,
        totalReviews: reviewsList.length,
      },
      forms: {
        newForms: newFormsCount,
        totalForms: formsList.length,
      },
      affiliate: {
        newContent: newAffiliateContent,
        totalContent: affList.length,
      },
    };
  }, [
    pendingReviewsMerged,
    pendingAuthFormsMerged,
    pendingAffiliateMerged,
    mockQueuesBump,
    serverQueueBump,
    pendingAuthFormsBump,
    serverQueues,
  ]);

  const summaryPanelPair = useMemo(() => {
    const o = pendingSummaryMetrics.overview;
    const r = pendingSummaryMetrics.reviews;
    const f = pendingSummaryMetrics.forms;
    const a = pendingSummaryMetrics.affiliate;
    if (activeTab === 'OVERVIEW') {
      return [
        { value: String(o.totalPoints), label: 'TOTAL POINTS' },
        {
          value: o.totalSpendUsd > 0 ? `$${o.totalSpendUsd.toLocaleString()}` : '$0',
          label: 'TOTAL SPEND',
        },
      ] as const;
    }
    if (activeTab === 'REVIEWS') {
      return [
        { value: `${r.positivePct}%`, label: 'POSITIVE SENTIMENT' },
        { value: String(r.totalReviews), label: 'TOTAL REVIEWS' },
      ] as const;
    }
    if (activeTab === 'FORMS') {
      return [
        { value: String(f.newForms), label: 'NEW FORMS' },
        { value: String(f.totalForms), label: 'TOTAL FORMS' },
      ] as const;
    }
    return [
      { value: String(a.newContent), label: 'NEW CONTENT' },
      { value: String(a.totalContent), label: 'TOTAL CONTENT' },
    ] as const;
  }, [activeTab, pendingSummaryMetrics]);

  const refreshServerQueues = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    getAdminPendingQueue()
      .then((q) => {
        setServerQueues(q);
        setServerQueueBump((n) => n + 1);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    refreshServerQueues();
    const t = setInterval(refreshServerQueues, 12000);
    return () => clearInterval(t);
  }, [refreshServerQueues]);

  const renderAffiliateRow = useCallback(
    (item: PendingMockAffiliateItem) => {
      const prodFromOrder =
        item.orderId && item.email ? productNameForOrderId(item.email, item.orderId) : '';
      const pkStored = affiliateProductKey(item);
      const effectiveProduct = pkStored !== 'PRODUCT' ? pkStored : prodFromOrder || 'PRODUCT';
      const grayLine = affiliateProductKindLine({ ...item, productName: effectiveProduct });
      const contentMap = loadAffiliateContentMapForEmail(item.email);
      const countsBody = affiliateSubmittedCountsLine(item.email, effectiveProduct, contentMap);
      const photoUrls = item.kind === 'photo' && item.imageSrc ? [item.imageSrc] : [];
      const videoUrls =
        item.kind === 'video'
          ? item.videoDataUrl
            ? [item.videoDataUrl]
            : item.imageSrc
              ? [item.imageSrc]
              : ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4']
          : [];
      const photos = item.kind === 'photo' ? 1 : 0;
      const videos = item.kind === 'video' ? 1 : 0;
      const declinedKey = `${normalizeEmailKey(item.email)}|${effectiveProduct}`;
      const declinedSiblings = affiliateDeclinedByClientProduct.get(declinedKey) || [];

      const rejectedBlock =
        declinedSiblings.length > 0 ? (
          <div style={{ marginTop: '12px' }}>
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '10px',
                color: '#000',
                margin: '0 0 6px',
                textTransform: 'uppercase',
              }}
            >
              REJECTED CONTENT
            </p>
            {declinedSiblings.map((d) => (
              <p
                key={d.id}
                style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#EB1C24', margin: '0 0 4px' }}
              >
                {(d.adminDeclineReason || '').trim() || 'NO REASON PROVIDED'}
              </p>
            ))}
          </div>
        ) : null;

      return (
        <div key={item.serverId ? `${item.id}-srv-${item.serverId}` : item.id}>
          <AdminReviewStyleCard
            client={item.client}
            clientEmail={item.email}
            clientProfilePhotoUrl={item.clientProfilePhotoUrl}
            clientRegionParen={item.clientRegionParen}
            clientRegionCode={item.clientRegionCode}
            productLine={grayLine}
            bodyText={countsBody}
            bodyFontSize="10px"
            date={item.date}
            rating={5}
            photos={photos}
            videos={videos}
            photoUrls={photoUrls}
            videoUrls={videoUrls}
            verifiedPurchase={false}
            showStars={false}
            mediaPresentation="inline"
            contentNudgePx={PENDING_CARD_CONTENT_NUDGE_PX}
            afterMedia={rejectedBlock}
            footerLinkLabel="VIEW CONTENT"
            onFooterLinkClick={() => setAdminReviewModal({ kind: 'affiliate', item })}
            onOpenClientDetails={openClientFromPending}
          />
        </div>
      );
    },
    [openClientFromPending, refreshServerQueues, affiliateDeclinedByClientProduct]
  );

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
      if (serverQueues) {
        if (row.label === 'ORDER FORMS') return { ...row, value: String(formsTabCount) };
        if (row.label === 'PENDING REVIEWS') return { ...row, value: String(reviewsTabCount) };
        if (row.label === 'AFFILIATE REQUESTS') return { ...row, value: String(affiliateTabCount) };
      }
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
  }, [
    pendingItems,
    pendingReviews,
    orderForms,
    pendingAuthFormsCount,
    mockReviewsPendingCount,
    mockAffiliatePendingCount,
    serverQueues,
    formsTabCount,
    reviewsTabCount,
    affiliateTabCount,
  ]);

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
    setAffiliateDeclineTarget(null);
  }, []);

  const closeDeclineReasonOnly = useCallback(() => {
    setShowDeclineReasonModal(false);
    setDeclineReasonDraft('');
    setAffiliateDeclineTarget(null);
  }, []);

  const submitDecline = useCallback(() => {
    if (affiliateDeclineTarget) {
      const { mockId, serverId } = affiliateDeclineTarget;
      if (serverId) {
        void patchAdminPendingQueue({
          type: 'affiliate',
          id: serverId,
          decision: 'decline',
          reason: declineReasonDraft,
        }).then(() => refreshServerQueues());
      } else {
        declinePendingMockAffiliate(mockId, declineReasonDraft);
      }
      closeDeclineReasonOnly();
      if (adminReviewModal?.kind === 'affiliate') closeAdminReviewModal();
      return;
    }
    if (!adminReviewModal) return;
    if (adminReviewModal.kind === 'form') {
      const f = adminReviewModal.item;
      if (f.serverQueueId) {
        void patchAdminPendingQueue({
          type: 'order_form',
          id: f.serverQueueId,
          decision: 'decline',
          reason: declineReasonDraft,
        }).then(() => refreshServerQueues());
      } else {
        declineOrderFormSubmission(f, declineReasonDraft);
      }
    } else {
      const r = adminReviewModal.item;
      if (r.serverType === 'db_review' && r.serverId) {
        void patchAdminPendingQueue({
          type: 'db_review',
          id: r.serverId,
          decision: 'decline',
          reason: declineReasonDraft,
        }).then(() => refreshServerQueues());
      } else if (r.serverType === 'review_supplemental' && r.serverId) {
        void patchAdminPendingQueue({
          type: 'review_supplemental',
          id: r.serverId,
          decision: 'decline',
          reason: declineReasonDraft,
        }).then(() => refreshServerQueues());
      } else {
        declinePendingMockReview(r.id, declineReasonDraft);
      }
    }
    closeAdminReviewModal();
  }, [
    affiliateDeclineTarget,
    adminReviewModal,
    declineReasonDraft,
    closeAdminReviewModal,
    closeDeclineReasonOnly,
    refreshServerQueues,
  ]);

  const modalTitle = (() => {
    if (!adminReviewModal) return '';
    if (adminReviewModal.kind === 'form') {
      const fn = String(adminReviewModal.item.formFields?.firstName || '').trim();
      const ln = String(adminReviewModal.item.formFields?.lastName || '').trim();
      const nm = `${fn} ${ln}`.trim().toUpperCase();
      return nm || 'ORDER FORM';
    }
    if (adminReviewModal.kind === 'affiliate') {
      return adminReviewModal.item.client.trim().toUpperCase() || 'AFFILIATE';
    }
    return adminReviewModal.item.client.trim().toUpperCase() || 'REVIEW';
  })();

  const declineModalTitle = (() => {
    if (affiliateDeclineTarget) return 'REJECT AFFILIATE SUBMISSION';
    if (!adminReviewModal) return '';
    if (adminReviewModal.kind === 'form') return 'REJECT ORDER FORM';
    return 'REJECT REVIEW';
  })();

  const onApproveClick = () => {
    if (!adminReviewModal) return;
    if (adminReviewModal.kind === 'affiliate') {
      const it = adminReviewModal.item;
      if (it.serverType === 'affiliate' && it.serverId) {
        void patchAdminPendingQueue({ type: 'affiliate', id: it.serverId, decision: 'approve' }).then(() =>
          refreshServerQueues()
        );
      } else {
        approvePendingMockAffiliate(it.id);
      }
      closeAdminReviewModal();
      return;
    }
    if (adminReviewModal.kind === 'form') {
      const f = adminReviewModal.item;
      if (f.serverQueueId) {
        void patchAdminPendingQueue({ type: 'order_form', id: f.serverQueueId, decision: 'approve' }).then(() =>
          refreshServerQueues()
        );
      } else {
        approveOrderFormSubmission(f);
      }
    } else {
      const r = adminReviewModal.item;
      if (r.serverType === 'db_review' && r.serverId) {
        void patchAdminPendingQueue({ type: 'db_review', id: r.serverId, decision: 'approve' }).then(() =>
          refreshServerQueues()
        );
      } else if (r.serverType === 'review_supplemental' && r.serverId) {
        void patchAdminPendingQueue({ type: 'review_supplemental', id: r.serverId, decision: 'approve' }).then(() =>
          refreshServerQueues()
        );
      } else {
        approvePendingMockReview(r.id);
      }
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
                {summaryPanelPair.map((panel) => (
                  <div
                    key={panel.label}
                    className="text-center py-3"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      borderRadius: '4px',
                      minHeight: '80px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      paddingBottom: '10px',
                      paddingLeft: '6px',
                      paddingRight: '6px',
                    }}
                  >
                    <p
                      className="font-covered-by-your-grace text-xl"
                      style={{
                        color: '#EB1C24',
                        fontSize: panel.value.length > 10 ? '18px' : '24px',
                        lineHeight: 1.1,
                        wordBreak: 'break-word',
                      }}
                    >
                      {panel.value}
                    </p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px', lineHeight: 1.2 }}>
                      {panel.label}
                    </p>
                  </div>
                ))}
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
                        <DataRow label="PENDING (ALL)" value={String(serverQueues ? reviewsTabCount : reviewBreakdown.total + mockReviewsPendingCount)} />
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
                      {pendingReviewsMerged.length === 0 ? (
                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
                          NO REVIEWS PENDING APPROVAL.
                        </p>
                      ) : (
                        pendingReviewsMerged.map((r) => (
                          <AdminReviewStyleCard
                            key={r.id}
                            client={r.client}
                            clientEmail={r.email}
                            clientProfilePhotoUrl={r.clientProfilePhotoUrl}
                            clientRegionParen={r.clientRegionParen}
                            clientRegionCode={r.clientRegionCode}
                            productLine={r.product}
                            bodyText={r.excerpt}
                            date={r.date}
                            rating={r.rating}
                            photos={r.photoCount ?? (r.photoUrls?.length ? r.photoUrls.length : 0)}
                            videos={r.videoCount ?? (r.videoUrls?.length ? r.videoUrls.length : 0)}
                            photoUrls={r.photoUrls}
                            videoUrls={r.videoUrls}
                            verifiedPurchase
                            mediaPresentation="inline"
                            contentNudgePx={PENDING_CARD_CONTENT_NUDGE_PX}
                            hideMediaRowWhenEmpty
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
                      {pendingAuthFormsMerged.length === 0 ? (
                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
                          NO FORMS PENDING APPROVAL.
                        </p>
                      ) : (
                        pendingAuthFormsMerged.map((f) => {
                          const nameRaw =
                            `${String(f.formFields?.firstName || '').trim()} ${String(f.formFields?.lastName || '').trim()}`.trim() || '—';
                          const nameUpper = nameRaw.toUpperCase();
                          const formState = regionCodeFromSignedFormFields(f.formFields);
                          const clientLine = `${nameUpper}${formState ? ` · ${formState}` : ''}`;
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
                                <div
                                  className="min-w-0 flex-1 flex flex-col"
                                  style={{ marginLeft: PENDING_CARD_CONTENT_NUDGE_PX }}
                                >
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
                                    {clientLine}
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
                                        margin: '6px 0 0',
                                        padding: 0,
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        display: 'block',
                                        textAlign: 'left',
                                        width: '100%',
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
                                    marginRight: PENDING_CARD_CONTENT_NUDGE_PX,
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
                      {pendingAffiliateMerged.length === 0 ? (
                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', margin: '12px 0', textAlign: 'center' }}>
                          NO AFFILIATE SUBMISSIONS PENDING APPROVAL.
                        </p>
                      ) : (
                        <>
                          <SectionTitle>PHOTOS</SectionTitle>
                          {pendingAffiliateMerged.filter((x) => x.kind === 'photo').map(renderAffiliateRow)}
                          <SectionTitle>VIDEOS</SectionTitle>
                          {pendingAffiliateMerged.filter((x) => x.kind === 'video').map(renderAffiliateRow)}
                          <SectionTitle>SOCIAL LINKS</SectionTitle>
                          {pendingAffiliateMerged.filter((x) => x.kind === 'social').map(renderAffiliateRow)}
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
            style={{
              width: '100%',
              maxWidth: adminReviewModal.kind === 'form' ? 'min(440px, calc(100vw - 24px))' : 'min(520px, 100%)',
              gap: '10px',
              padding: '12px 12px max(12px, env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={adminReviewModal.kind === 'form' ? 'p-3 overflow-hidden bg-white' : 'p-4 overflow-hidden bg-white'}
              style={{
                maxWidth: adminReviewModal.kind === 'form' ? '440px' : '520px',
                width: '100%',
                alignSelf: 'center',
                maxHeight:
                  adminReviewModal.kind === 'form'
                    ? 'min(62dvh, 560px)'
                    : 'min(78vh, 720px)',
                border: '1.3px solid black',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
              role="dialog"
              aria-labelledby="pending-admin-review-title"
            >
              <div
                className="flex justify-between items-center flex-shrink-0"
                style={{
                  marginBottom: adminReviewModal.kind === 'form' ? '8px' : '12px',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: adminReviewModal.kind === 'form' ? '6px' : '8px',
                }}
              >
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
                  <SignedOrderFormPdfPanel
                    url={formReviewPdfUrl}
                    loading={formReviewPdfLoading}
                    error={formReviewPdfError}
                    variant="adminModal"
                  />
                ) : adminReviewModal.kind === 'affiliate' ? (
                  (() => {
                    const it = adminReviewModal.item;
                    const prodFromOrder =
                      it.orderId && it.email ? productNameForOrderId(it.email, it.orderId) : '';
                    const pkStored = affiliateProductKey(it);
                    const effectiveProduct = pkStored !== 'PRODUCT' ? pkStored : prodFromOrder || 'PRODUCT';
                    const grayLine = affiliateProductKindLine({ ...it, productName: effectiveProduct });
                    const contentMap = loadAffiliateContentMapForEmail(it.email);
                    const countsBody = affiliateSubmittedCountsLine(it.email, effectiveProduct, contentMap);
                    const photoUrls = it.kind === 'photo' && it.imageSrc ? [it.imageSrc] : [];
                    const videoUrls =
                      it.kind === 'video'
                        ? it.videoDataUrl
                          ? [it.videoDataUrl]
                          : it.imageSrc
                            ? [it.imageSrc]
                            : ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4']
                        : [];
                    const consultFrame = {
                      width: '50px',
                      height: '50px',
                      background: '#f3f4f6',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 0 0 1.1px #000000',
                      boxSizing: 'border-box' as const,
                      overflow: 'hidden',
                    };
                    return (
                      <div style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', lineHeight: 1.45 }}>
                        <p style={{ margin: '0 0 8px', color: '#808080', fontSize: '10px', textTransform: 'uppercase' }}>{grayLine}</p>
                        <p style={{ margin: '0 0 10px', fontSize: '10px', textTransform: 'uppercase' }}>{countsBody}</p>
                        {it.kind === 'social' ? (
                          <p style={{ margin: '0 0 10px', fontSize: '10px' }}>
                            {String(it.platform || '').toUpperCase()} — {String(it.handle || '').toUpperCase()}
                          </p>
                        ) : null}
                        {(photoUrls.length > 0 || videoUrls.length > 0) && (
                          <div className="flex flex-wrap" style={{ gap: '8px' }}>
                            {photoUrls.map((src, i) => (
                              <a key={`am-p-${i}`} href={src} target="_blank" rel="noopener noreferrer" style={{ ...consultFrame, display: 'block' }}>
                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              </a>
                            ))}
                            {videoUrls.map((src, i) => (
                              <div key={`am-v-${i}`} style={consultFrame}>
                                <video src={src} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    const rv = adminReviewModal.item;
                    const thumbSrc = accountReviewThumbnailFromProductTitle(rv.product);
                    const starN = Math.min(5, Math.max(1, Math.round(Number(rv.rating)) || 1));
                    const dateTimeLine = formatReviewSubmittedDateTimeLine(rv.submittedAtIso, rv.date);
                    const { photoUrls: modalPhotoUrls, videoUrls: modalVideoUrls } = pendingReviewModalDisplayMedia(rv);
                    const modalMediaFrame = {
                      width: `${ACCOUNT_REVIEWS_MODAL_MEDIA_FRAME_PX}px`,
                      height: `${ACCOUNT_REVIEWS_MODAL_MEDIA_FRAME_PX}px`,
                      background: '#f3f4f6',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 0 0 1.1px #000000',
                      boxSizing: 'border-box' as const,
                      overflow: 'hidden',
                    };
                    const starStroke = 'drop-shadow(0 0 0 1px black)';
                    return (
                  <div style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', lineHeight: 1.45 }}>
                    <div className="flex items-start gap-3" style={{ marginBottom: '12px' }}>
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: `${ACCOUNT_REVIEWS_MODAL_THUMB_PX}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginTop: '-6px',
                        }}
                      >
                        <img
                          src={thumbSrc}
                          alt=""
                          style={{
                            width: `${ACCOUNT_REVIEWS_MODAL_THUMB_PX}px`,
                            height: `${ACCOUNT_REVIEWS_MODAL_THUMB_PX}px`,
                            objectFit: 'contain',
                            display: 'block',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/natural front.png';
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            gap: '2px',
                            marginTop: '8px',
                            marginBottom: '4px',
                            justifyContent: 'center',
                          }}
                        >
                          {[0, 1, 2, 3, 4].map((i) => {
                            const filled = i < starN;
                            return (
                              <img
                                key={i}
                                src={filled ? NOIR_REVIEW_STAR_FILLED_SRC : NOIR_REVIEW_STAR_OUTLINE_SRC}
                                alt=""
                                style={{
                                  width: `${ACCOUNT_REVIEWS_MODAL_STAR_PX}px`,
                                  height: `${ACCOUNT_REVIEWS_MODAL_STAR_PX}px`,
                                  objectFit: 'contain',
                                  filter: starStroke,
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0" style={{ paddingTop: '2px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: '#808080',
                        margin: '0 0 8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {rv.product}
                    </p>
                    <p style={{ margin: '0 0 6px' }}>{rv.excerpt}</p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        color: '#EB1C24',
                        margin: 0,
                        textTransform: 'uppercase',
                      }}
                    >
                      {dateTimeLine}
                    </p>
                    {modalPhotoUrls.length > 0 || modalVideoUrls.length > 0 ? (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {modalPhotoUrls.map((src, i) => (
                          <a
                            key={`rv-ph-${i}`}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...modalMediaFrame, display: 'block' }}
                          >
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </a>
                        ))}
                        {modalVideoUrls.map((src, i) => (
                          <div key={`rv-vd-${i}`} style={modalMediaFrame}>
                            <video
                              src={src}
                              controls
                              playsInline
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                      </div>
                    </div>
                  </div>
                    );
                  })()
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap" style={{ width: '100%', maxWidth: '520px', alignSelf: 'center' }}>
                <button
                  type="button"
                  onClick={onApproveClick}
                  disabled={adminReviewModal.kind === 'form' && formReviewPdfLoading}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    color: '#EB1C24',
                    background: '#fff',
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
                  onClick={() => {
                    if (adminReviewModal.kind === 'affiliate') {
                      const it = adminReviewModal.item;
                      setAffiliateDeclineTarget({ mockId: it.id, serverId: it.serverId });
                    }
                    setDeclineReasonDraft('');
                    setShowDeclineReasonModal(true);
                  }}
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
                  REJECT
                </button>
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

      {showDeclineReasonModal && (adminReviewModal || affiliateDeclineTarget) && (
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
                CONFIRM REJECT
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
