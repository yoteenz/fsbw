import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { isAyoteenzAdminAccount, getEffectiveTierName } from '../../../utils/adminAuth';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';

const TABS = ['ALL', 'REVIEWS', 'REWARDS', 'INVITES'] as const;

const SORT_OPTIONS = [
  'Most recent',
  'A to Z',
  'Z to A',
  'Most spent',
  'Least spent',
  'Alerts',
  'Standard',
  'Premium',
] as const;
type SortOption = typeof SORT_OPTIONS[number];

function sortOptionToLabel(opt: SortOption): string {
  return opt.toUpperCase().replace(/\s+/g, ' ');
}

/** e.g. "STANDARD SILVER", "PREMIUM RED" from membershipType + tier */
function getMembershipTierLabel(u: any): string {
  const membership = (u.membershipType || 'STANDARD').toString().toUpperCase();
  const tier = getEffectiveTierName(u);
  if (!tier) return membership;
  return `${membership} ${tier}`.toUpperCase();
}

/** Referral code = first initial + last initial + birth day (2 digits) + 2 digits derived from unique seed (e.g. email) so same name+day still get different codes. e.g. KA3047 */
function buildReferralCode(firstName: string, lastName: string, birthDay: number, uniqueSeed: string): string {
  const first = (firstName || '').trim().charAt(0).toUpperCase();
  const last = (lastName || '').trim().charAt(0).toUpperCase();
  const day = String(Math.min(31, Math.max(1, birthDay))).padStart(2, '0');
  let hash = 0;
  const str = (uniqueSeed || '').trim().toLowerCase();
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  const suffix = String(Math.abs(hash) % 100).padStart(2, '0');
  return first + last + day + suffix;
}

/** 20 mock clients for ayoteenz admin only – mix of Standard/Premium, spend, bookings, alerts for testing sort tags. */
function getMockClientsForAyoteenz(): any[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mockRows: Array<{
    id: string; email: string; firstName: string; lastName: string; membershipType: string; createdAt: string;
    totalSpent: number; ordersCount: number; newCount: number; alertCount: number; bookingCount: number;
    birthDay: number; invitesCount: number; status: string;
    reviewsCount: number; photosCount: number; videosCount: number; tagsCount: number;
    totalReviews: number; reviewsWithPhotosVideos: number; pendingReviews: number;
    currentTierName?: string;
  }> = [
    /* totalSpent = realistic sums of product prices (NOIR ~740–920, BLANCO ~820, SOFT WAVE ~980, SOFT CURL ~780–1200, multi-unit ~1575–2220) */
    { id: 'mock-1', email: 'mock1@test.com', firstName: 'Zara', lastName: 'Adams', membershipType: 'PREMIUM', createdAt: new Date(now - 2 * day).toISOString(), totalSpent: 4195, ordersCount: 5, newCount: 1, alertCount: 2, bookingCount: 3, birthDay: 15, invitesCount: 4, status: 'ACTIVE', reviewsCount: 3, photosCount: 5, videosCount: 1, tagsCount: 8, totalReviews: 5, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED' },
    { id: 'mock-2', email: 'mock2@test.com', firstName: 'Amy', lastName: 'Brooks', membershipType: 'STANDARD', createdAt: new Date(now - 10 * day).toISOString(), totalSpent: 1490, ordersCount: 2, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 3, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER' },
    { id: 'mock-3', email: 'mock3@test.com', firstName: 'Quinn', lastName: 'Chen', membershipType: 'PREMIUM', createdAt: new Date(now - 1 * day).toISOString(), totalSpent: 3100, ordersCount: 4, newCount: 2, alertCount: 1, bookingCount: 2, birthDay: 22, invitesCount: 2, status: 'ACTIVE', reviewsCount: 2, photosCount: 4, videosCount: 2, tagsCount: 6, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'BLACK' },
    { id: 'mock-4', email: 'mock4@test.com', firstName: 'Diana', lastName: 'Foster', membershipType: 'STANDARD', createdAt: new Date(now - 45 * day).toISOString(), totalSpent: 1575, ordersCount: 3, newCount: 0, alertCount: 1, bookingCount: 1, birthDay: 8, invitesCount: 1, status: 'INACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 3, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'SILVER' },
    { id: 'mock-5', email: 'mock5@test.com', firstName: 'Evan', lastName: 'Garcia', membershipType: 'PREMIUM', createdAt: new Date(now - 5 * day).toISOString(), totalSpent: 5820, ordersCount: 8, newCount: 1, alertCount: 3, bookingCount: 4, birthDay: 30, invitesCount: 7, status: 'ACTIVE', reviewsCount: 5, photosCount: 9, videosCount: 3, tagsCount: 12, totalReviews: 8, reviewsWithPhotosVideos: 6, pendingReviews: 2, currentTierName: 'BLACK' },
    { id: 'mock-6', email: 'mock6@test.com', firstName: 'Fiona', lastName: 'Hayes', membershipType: 'STANDARD', createdAt: new Date(now - 90 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 11, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER' },
    { id: 'mock-7', email: 'mock7@test.com', firstName: 'Grant', lastName: 'Ingram', membershipType: 'PREMIUM', createdAt: new Date(now - 3 * day).toISOString(), totalSpent: 2100, ordersCount: 3, newCount: 0, alertCount: 0, bookingCount: 2, birthDay: 27, invitesCount: 3, status: 'ACTIVE', reviewsCount: 2, photosCount: 3, videosCount: 1, tagsCount: 4, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED' },
    { id: 'mock-8', email: 'mock8@test.com', firstName: 'Hannah', lastName: 'Jones', membershipType: 'STANDARD', createdAt: new Date(now - 14 * day).toISOString(), totalSpent: 1520, ordersCount: 2, newCount: 1, alertCount: 2, bookingCount: 1, birthDay: 5, invitesCount: 1, status: 'ACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 2, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 1, currentTierName: 'SILVER' },
    { id: 'mock-9', email: 'mock9@test.com', firstName: 'Ivan', lastName: 'Kim', membershipType: 'PREMIUM', createdAt: new Date(now - 7 * day).toISOString(), totalSpent: 6710, ordersCount: 6, newCount: 2, alertCount: 1, bookingCount: 5, birthDay: 19, invitesCount: 5, status: 'INACTIVE', reviewsCount: 4, photosCount: 7, videosCount: 2, tagsCount: 10, totalReviews: 6, reviewsWithPhotosVideos: 5, pendingReviews: 1, currentTierName: 'BLACK' },
    { id: 'mock-10', email: 'mock10@test.com', firstName: 'Julia', lastName: 'Lee', membershipType: 'STANDARD', createdAt: new Date(now - 21 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 12, invitesCount: 0, status: 'ACTIVE', reviewsCount: 0, photosCount: 1, videosCount: 0, tagsCount: 1, totalReviews: 1, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'SILVER' },
    { id: 'mock-11', email: 'mock11@test.com', firstName: 'Kyle', lastName: 'Martinez', membershipType: 'PREMIUM', createdAt: new Date(now - 4 * day).toISOString(), totalSpent: 3900, ordersCount: 5, newCount: 1, alertCount: 2, bookingCount: 3, birthDay: 25, invitesCount: 2, status: 'ACTIVE', reviewsCount: 3, photosCount: 4, videosCount: 1, tagsCount: 7, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED' },
    { id: 'mock-12', email: 'mock12@test.com', firstName: 'Luna', lastName: 'Nguyen', membershipType: 'STANDARD', createdAt: new Date(now - 60 * day).toISOString(), totalSpent: 2100, ordersCount: 4, newCount: 0, alertCount: 1, bookingCount: 2, birthDay: 7, invitesCount: 4, status: 'INACTIVE', reviewsCount: 2, photosCount: 3, videosCount: 1, tagsCount: 5, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED' },
    { id: 'mock-13', email: 'mock13@test.com', firstName: 'Marcus', lastName: 'Owen', membershipType: 'PREMIUM', createdAt: new Date(now - 1 * day).toISOString(), totalSpent: 5120, ordersCount: 7, newCount: 3, alertCount: 4, bookingCount: 6, birthDay: 14, invitesCount: 9, status: 'ACTIVE', reviewsCount: 6, photosCount: 10, videosCount: 4, tagsCount: 14, totalReviews: 9, reviewsWithPhotosVideos: 7, pendingReviews: 2, currentTierName: 'BLACK' },
    { id: 'mock-14', email: 'mock14@test.com', firstName: 'Nina', lastName: 'Patel', membershipType: 'STANDARD', createdAt: new Date(now - 30 * day).toISOString(), totalSpent: 1520, ordersCount: 2, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 20, invitesCount: 0, status: 'ACTIVE', reviewsCount: 1, photosCount: 1, videosCount: 0, tagsCount: 2, totalReviews: 1, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER' },
    { id: 'mock-15', email: 'mock15@test.com', firstName: 'Oscar', lastName: 'Quinn', membershipType: 'PREMIUM', createdAt: new Date(now - 6 * day).toISOString(), totalSpent: 4400, ordersCount: 5, newCount: 1, alertCount: 1, bookingCount: 4, birthDay: 9, invitesCount: 3, status: 'INACTIVE', reviewsCount: 3, photosCount: 5, videosCount: 1, tagsCount: 8, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED' },
    { id: 'mock-16', email: 'mock16@test.com', firstName: 'Paula', lastName: 'Rivera', membershipType: 'STANDARD', createdAt: new Date(now - 120 * day).toISOString(), totalSpent: 3200, ordersCount: 6, newCount: 0, alertCount: 2, bookingCount: 2, birthDay: 28, invitesCount: 2, status: 'ACTIVE', reviewsCount: 2, photosCount: 4, videosCount: 0, tagsCount: 6, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED' },
    { id: 'mock-17', email: 'mock17@test.com', firstName: 'Ryan', lastName: 'Scott', membershipType: 'PREMIUM', createdAt: new Date(now - 2 * day).toISOString(), totalSpent: 1900, ordersCount: 3, newCount: 0, alertCount: 0, bookingCount: 1, birthDay: 4, invitesCount: 1, status: 'ACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 3, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 1, currentTierName: 'SILVER' },
    { id: 'mock-18', email: 'mock18@test.com', firstName: 'Sara', lastName: 'Torres', membershipType: 'STANDARD', createdAt: new Date(now - 8 * day).toISOString(), totalSpent: 1100, ordersCount: 2, newCount: 1, alertCount: 3, bookingCount: 1, birthDay: 16, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER' },
    { id: 'mock-19', email: 'mock19@test.com', firstName: 'Tyler', lastName: 'Upton', membershipType: 'PREMIUM', createdAt: new Date(now - 12 * day).toISOString(), totalSpent: 7200, ordersCount: 9, newCount: 2, alertCount: 2, bookingCount: 7, birthDay: 23, invitesCount: 6, status: 'ACTIVE', reviewsCount: 5, photosCount: 8, videosCount: 2, tagsCount: 11, totalReviews: 7, reviewsWithPhotosVideos: 6, pendingReviews: 2, currentTierName: 'BLACK' },
    { id: 'mock-20', email: 'mock20@test.com', firstName: 'Uma', lastName: 'Vance', membershipType: 'STANDARD', createdAt: new Date(now - 3 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 1, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER' },
  ];
  return mockRows.map((row) => ({
    ...row,
    referralNumber: buildReferralCode(row.firstName, row.lastName, row.birthDay, row.email),
  }));
}

const DETAILS_TABS = ['profile', 'orders', 'appointments'] as const;

export default function AdminClients() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('Most recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<typeof DETAILS_TABS[number]>('profile');

  // Sync selectedClientEmail from URL (e.g. when redirected from /admin/clients/account?email=...)
  useEffect(() => {
    if (emailFromUrl) setSelectedClientEmail(emailFromUrl);
  }, [emailFromUrl]);

  const loadData = useCallback(() => {
    try {
      let reg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (!Array.isArray(reg)) reg = [];
      const currentUserRaw = localStorage.getItem('currentUser');
      const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
      if (currentUser?.email && !reg.some((u: any) => (u.email || '').toLowerCase() === (currentUser.email || '').toLowerCase())) {
        reg = [...reg, currentUser];
        localStorage.setItem('registeredUsers', JSON.stringify(reg));
      }
      // Ayoteenz admin only: merge 20 mock clients so all sort tags can be tested
      if (currentUser && isAyoteenzAdminAccount(currentUser)) {
        const mockClients = getMockClientsForAyoteenz();
        const mockByEmail = new Map(mockClients.map((m: any) => [(m.email || '').toLowerCase(), m]));
        const existingEmails = new Set((reg || []).map((u: any) => (u.email || '').toLowerCase()));
        const toAdd = mockClients.filter((m: any) => !existingEmails.has((m.email || '').toLowerCase()));
        // Refresh existing mock clients so they get latest fields (referralNumber, birthDay, etc.)
        reg = reg.map((u: any) => {
          const fresh = mockByEmail.get((u.email || '').toLowerCase());
          return fresh ? { ...u, ...fresh } : u;
        });
        if (toAdd.length > 0) {
          reg = [...reg, ...toAdd];
        }
        if (toAdd.length > 0 || mockByEmail.size > 0) {
          localStorage.setItem('registeredUsers', JSON.stringify(reg));
        }
      }
      setRegisteredUsers(reg);
    } catch {
      setRegisteredUsers([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onStorage = () => loadData();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onStorage);
    };
  }, [loadData]);

  // Selected client and order history for details view (toggle on main card)
  const { selectedClient, selectedOrderHistory } = (() => {
    const email = (selectedClientEmail || '').trim().toLowerCase();
    if (!email) return { selectedClient: null, selectedOrderHistory: [] };
    const found = registeredUsers.find((u: any) => (u.email || '').toLowerCase() === email);
    let orderHistory: any[] = [];
    try {
      const raw = localStorage.getItem(`userOrders_${email}`);
      const data = raw ? JSON.parse(raw) : null;
      const active = data?.activeOrders || [];
      const past = data?.pastOrders || [];
      orderHistory = [...active, ...past].map((o: any, i: number) => ({
        id: `#${String(i + 1).padStart(3, '0')}`,
        date: o.date || o.createdAt || '—',
        product: o.items?.[0]?.name || o.productName || 'Order',
        amount: Number(o.total) || 0,
        status: (o.status || 'COMPLETED').toUpperCase(),
      }));
    } catch {
      // ignore
    }
    return { selectedClient: found || null, selectedOrderHistory: orderHistory };
  })();

  const selectedName = selectedClient
    ? ([(selectedClient.firstName || '').trim(), (selectedClient.lastName || '').trim()].filter(Boolean).join(' ') || selectedClient.email || '—').toUpperCase()
    : '—';
  const selectedMembershipType = (selectedClient?.membershipType || 'STANDARD').toUpperCase();
  const selectedTotalOrders = selectedClient?.ordersCount ?? selectedOrderHistory.length;
  const selectedTotalSpent = selectedClient?.totalSpent ?? selectedOrderHistory.reduce((s: number, o: any) => s + (o.amount || 0), 0);
  const selectedJoinDate = selectedClient?.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';

  const appointments = [
    { date: '2024-01-20', time: '2:00 PM', type: 'CONSULTATION', status: 'SCHEDULED' },
    { date: '2024-01-05', time: '10:30 AM', type: 'FITTING', status: 'COMPLETED' },
  ];

  // NEW / ORDERS / CHARGES: from mock fields (ayoteenz mock clients) or from userOrders_${email} for real users
  // NEW = orders not yet delivered; ORDERS = total orders (excluding canceled) in progress or completed
  // CHARGES = total spend (excluding canceled orders)
  const getClientRow = (u: any, index: number) => {
    const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '—').toUpperCase();
    let newCount = u.newCount;
    let ordersCount = u.ordersCount;
    let charges = u.totalSpent;
    try {
      const email = (u.email || '').trim().toLowerCase();
      if (email) {
        const raw = localStorage.getItem(`userOrders_${email}`);
        const data = raw ? JSON.parse(raw) : null;
        const active = data?.activeOrders || [];
        const past = data?.pastOrders || [];
        const all = [...active, ...past];
        if (all.length > 0) {
          const nonCanceled = all.filter((o: any) => (o.status || '').toUpperCase() !== 'CANCELED' && !o.canceledAt);
          const notDelivered = nonCanceled.filter((o: any) => (o.status || '').toUpperCase() !== 'DELIVERED' && !o.deliveredAt);
          if (ordersCount == null) ordersCount = nonCanceled.length;
          charges = nonCanceled.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
          if (newCount == null) newCount = notDelivered.length;
        }
      }
    } catch {
      // ignore
    }
    return { index: index + 1, name, newCount: newCount ?? 0, ordersCount: ordersCount ?? 0, charges: charges ?? 0 };
  };

  // INVITES tab: referral number + status + invites count (from mock or computed from name/birthDay/email, else localStorage)
  const getInvitesRow = (u: any, index: number) => {
    const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '—').toUpperCase();
    let referralNumber = u.referralNumber;
    let status = u.status;
    let invitesCount = u.invitesCount;
    if (referralNumber == null || status == null || invitesCount == null) {
      try {
        const email = (u.email || '').trim().toLowerCase();
        if (email) {
          const refData = localStorage.getItem(`userInvites_${email}`);
          const statusRaw = localStorage.getItem(`userStatus_${email}`);
          // Prefer computed code (no phone) when we have name + birthDay + email; only then fall back to stored
          if (referralNumber == null && u.firstName != null && u.lastName != null && u.birthDay != null) {
            referralNumber = buildReferralCode(u.firstName, u.lastName, Number(u.birthDay), u.email || u.id || '');
          }
          // Ayoteenz admin: always use new formula (never stored phone-based code); use defaults if profile missing name/birthDay so we get KA30xx
          if (referralNumber == null && isAyoteenzAdminAccount(u)) {
            referralNumber = buildReferralCode(
              u.firstName || 'K',
              u.lastName || 'A',
              u.birthDay ?? 30,
              u.email || u.id || ''
            );
          }
          if (referralNumber == null) referralNumber = localStorage.getItem(`userReferralCode_${email}`) || null;
          if (referralNumber == null) referralNumber = '—';
          if (status == null) {
            const s = (statusRaw || 'ACTIVE').toUpperCase();
            status = s === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
          }
          if (invitesCount == null) {
            const data = refData ? JSON.parse(refData) : null;
            invitesCount = Array.isArray(data) ? data.length : (data?.count ?? 0);
          }
        }
      } catch {
        // ignore
      }
    }
    const statusDisplay = (status ?? 'ACTIVE').toString().toUpperCase();
    return { index: index + 1, name, referralNumber: referralNumber ?? '—', status: statusDisplay === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', invitesCount: invitesCount ?? 0 };
  };

  // REWARDS tab: reviews, photos, videos, tags (from mock or localStorage – affiliate-submitted content)
  const getRewardsRow = (u: any, index: number) => {
    const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '—').toUpperCase();
    let reviewsCount = u.reviewsCount;
    let photosCount = u.photosCount;
    let videosCount = u.videosCount;
    let tagsCount = u.tagsCount;
    if (reviewsCount == null || photosCount == null || videosCount == null || tagsCount == null) {
      try {
        const email = (u.email || '').trim().toLowerCase();
        if (email) {
          const rev = localStorage.getItem(`userAffiliateReviews_${email}`);
          const ph = localStorage.getItem(`userAffiliatePhotos_${email}`);
          const v = localStorage.getItem(`userAffiliateVideos_${email}`);
          const t = localStorage.getItem(`userAffiliateTags_${email}`);
          const toCount = (raw: string | null) => {
            if (raw == null) return 0;
            try {
              const parsed = JSON.parse(raw);
              return Array.isArray(parsed) ? parsed.length : (Number(raw) || 0);
            } catch {
              return Number(raw) || 0;
            }
          };
          if (reviewsCount == null) reviewsCount = toCount(rev);
          if (photosCount == null) photosCount = toCount(ph);
          if (videosCount == null) videosCount = toCount(v);
          if (tagsCount == null) tagsCount = toCount(t);
        }
      } catch {
        // ignore
      }
    }
    return {
      index: index + 1,
      name,
      reviewsCount: reviewsCount ?? 0,
      photosCount: photosCount ?? 0,
      videosCount: videosCount ?? 0,
      tagsCount: tagsCount ?? 0,
    };
  };

  // REVIEWS tab: total submitted reviews, reviews with photos/videos, pending (waiting approval)
  const getReviewsTabRow = (u: any, index: number) => {
    const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '—').toUpperCase();
    let totalReviews = u.totalReviews;
    let reviewsWithPhotosVideos = u.reviewsWithPhotosVideos;
    let pendingReviews = u.pendingReviews;
    if (totalReviews == null || reviewsWithPhotosVideos == null || pendingReviews == null) {
      try {
        const email = (u.email || '').trim().toLowerCase();
        if (email) {
          const raw = localStorage.getItem(`userSubmittedReviews_${email}`);
          if (raw) {
            const data = JSON.parse(raw);
            const list = Array.isArray(data) ? data : (data?.reviews || []);
            if (totalReviews == null) totalReviews = list.length;
            if (reviewsWithPhotosVideos == null) {
              reviewsWithPhotosVideos = list.filter((r: any) => r?.hasPhoto || r?.hasVideo).length;
            }
            if (pendingReviews == null) {
              pendingReviews = list.filter((r: any) => r?.status === 'pending' || r?.pending).length;
            }
          }
        }
      } catch {
        // ignore
      }
    }
    return {
      index: index + 1,
      name,
      totalReviews: totalReviews ?? 0,
      reviewsWithPhotosVideos: reviewsWithPhotosVideos ?? 0,
      pendingReviews: pendingReviews ?? 0,
    };
  };

  // Sort/filter clients based on sortOption
  const sortedClients = (() => {
    let list = [...registeredUsers];
    const membership = (u: any) => ((u.membershipType || 'STANDARD') + '').toUpperCase();
    if (sortOption === 'Standard') {
      list = list.filter((u) => membership(u) === 'STANDARD');
    } else if (sortOption === 'Premium') {
      list = list.filter((u) => membership(u) === 'PREMIUM');
    }
    const name = (u: any) => [(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || (u.email || '');
    const charges = (u: any) => u.totalSpent ?? (() => { try { const raw = localStorage.getItem(`userOrders_${(u.email || '').trim().toLowerCase()}`); const d = raw ? JSON.parse(raw) : null; const all = [...(d?.activeOrders || []), ...(d?.pastOrders || [])]; return all.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0); } catch { return 0; } })();
    const created = (u: any) => (u.createdAt ? new Date(u.createdAt).getTime() : 0);
    const alertCount = (u: any) => u.alertCount ?? 0;
    if (sortOption === 'A to Z') {
      list.sort((a, b) => name(a).localeCompare(name(b), undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'Z to A') {
      list.sort((a, b) => name(b).localeCompare(name(a), undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'Most spent') {
      list.sort((a, b) => charges(b) - charges(a));
    } else if (sortOption === 'Least spent') {
      list.sort((a, b) => charges(a) - charges(b));
    } else if (sortOption === 'Alerts') {
      list.sort((a, b) => alertCount(b) - alertCount(a));
    } else {
      // Most recent: newest first
      list.sort((a, b) => created(b) - created(a));
    }
    return list;
  })();

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
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
          <AdminHeader title={selectedClientEmail ? 'DETAILS' : 'OVERVIEW'} showBack breadcrumbParentLabel="CLIENTS" breadcrumbParentPath="/admin/dashboard" />

          <div className="pb-6 px-4">
            <div className="max-w-md mx-auto">
              {/* Single main card – client list (reference structure) */}
              <div
                className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
                style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
              >
                {/* CLIENTS header (concierge-style): text left, icon right; when details view: X close on right; card header always "CLIENTS" */}
                <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4" style={{ marginBottom: 0 }}>
                  {selectedClientEmail ? (
                    <>
                      <h2
                        className="flex-1"
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          color: '#EB1C24',
                          fontSize: '12px',
                          fontWeight: 500,
                          margin: 0,
                          textTransform: 'uppercase',
                          textAlign: 'left',
                        }}
                      >
                        CLIENTS
                      </h2>
                      <button
                        type="button"
                        onClick={() => { setSelectedClientEmail(null); setDetailsTab('profile'); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        aria-label="Close"
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt="Close"
                          style={{
                            width: '16px',
                            height: '16px',
                            filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)',
                          }}
                        />
                      </button>
                    </>
                  ) : (
                    <>
                  <h2
                    className="flex-1"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '12px',
                      fontWeight: 500,
                      margin: 0,
                      textTransform: 'uppercase',
                      textAlign: 'left',
                    }}
                  >
                    CLIENTS
                  </h2>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ flexShrink: 0, marginLeft: '8px' }}
                  >
                    <path
                      d="M10 3C9.60218 3 9.22064 3.15804 8.93934 3.43934C8.65804 3.72064 8.5 4.10218 8.5 4.5C8.5 4.89782 8.65804 5.27936 8.93934 5.56066C9.22064 5.84196 9.60218 6 10 6C10.3978 6 10.7794 5.84196 11.0607 5.56066C11.342 5.27936 11.5 4.89782 11.5 4.5C11.5 4.10218 11.342 3.72064 11.0607 3.43934C10.7794 3.15804 10.3978 3 10 3ZM7.5 4.5C7.5 3.83696 7.76339 3.20107 8.23223 2.73223C8.70107 2.26339 9.33696 2 10 2C10.663 2 11.2989 2.26339 11.7678 2.73223C12.2366 3.20107 12.5 3.83696 12.5 4.5C12.5 5.16304 12.2366 5.79893 11.7678 6.26777C11.2989 6.73661 10.663 7 10 7C9.33696 7 8.70107 6.73661 8.23223 6.26777C7.76339 5.79893 7.5 5.16304 7.5 4.5ZM15.5 4C15.2348 4 14.9804 4.10536 14.7929 4.29289C14.6054 4.48043 14.5 4.73478 14.5 5C14.5 5.26522 14.6054 5.51957 14.7929 5.70711C14.9804 5.89464 15.2348 6 15.5 6C15.7652 6 16.0196 5.89464 16.2071 5.70711C16.3946 5.51957 16.5 5.26522 16.5 5C16.5 4.73478 16.3946 4.48043 16.2071 4.29289C16.0196 4.10536 15.7652 4 15.5 4ZM13.5 5C13.5 4.46957 13.7107 3.96086 14.0858 3.58579C14.4609 3.21071 14.9696 3 15.5 3C16.0304 3 16.5391 3.21071 16.9142 3.58579C17.2893 3.96086 17.5 4.46957 17.5 5C17.5 5.53043 17.2893 6.03914 16.9142 6.41421C16.5391 6.78929 16.0304 7 15.5 7C14.9696 7 14.4609 6.78929 14.0858 6.41421C13.7107 6.03914 13.5 5.53043 13.5 5ZM3.5 5C3.5 4.73478 3.60536 4.48043 3.79289 4.29289C3.98043 4.10536 4.23478 4 4.5 4C4.76522 4 5.01957 4.10536 5.20711 4.29289C5.39464 4.48043 5.5 4.73478 5.5 5C5.5 5.26522 5.39464 5.51957 5.20711 5.70711C5.01957 5.89464 4.76522 6 4.5 6C4.23478 6 3.98043 5.89464 3.79289 5.70711C3.60536 5.51957 3.5 5.26522 3.5 5ZM4.5 3C3.96957 3 3.46086 3.21071 3.08579 3.58579C2.71071 3.96086 2.5 4.46957 2.5 5C2.5 5.53043 2.71071 6.03914 3.08579 6.41421C3.46086 6.78929 3.96957 7 4.5 7C5.03043 7 5.53914 6.78929 5.91421 6.41421C6.28929 6.03914 6.5 5.53043 6.5 5C6.5 4.46957 6.28929 3.96086 5.91421 3.58579C5.53914 3.21071 5.03043 3 4.5 3ZM5.1 14.998L5 15C4.46957 15 3.96086 14.7893 3.58579 14.4142C3.21071 14.0391 3 13.5304 3 13V9.25C3 9.1837 3.02634 9.12011 3.07322 9.07322C3.12011 9.02634 3.1837 9 3.25 9H5.014C5.054 8.633 5.184 8.292 5.379 8H3.25C2.56 8 2 8.56 2 9.25V13C1.99995 13.4281 2.09154 13.8513 2.2686 14.2411C2.44566 14.6309 2.7041 14.9782 3.02655 15.2599C3.34901 15.5415 3.728 15.7508 4.13807 15.8738C4.54813 15.9968 4.97978 16.0307 5.404 15.973C5.26965 15.6592 5.16779 15.3325 5.1 14.998ZM14.596 15.973C14.728 15.991 14.8627 16 15 16C15.7956 16 16.5587 15.6839 17.1213 15.1213C17.6839 14.5587 18 13.7956 18 13V9.25C18 8.56 17.44 8 16.75 8H14.621C14.817 8.292 14.946 8.633 14.986 9H16.75C16.8163 9 16.8799 9.02634 16.9268 9.07322C16.9737 9.12011 17 9.1837 17 9.25V13C17.0001 13.2711 16.945 13.5394 16.8382 13.7886C16.7314 14.0377 16.575 14.2626 16.3786 14.4495C16.1822 14.6363 15.9498 14.7813 15.6956 14.8756C15.4415 14.9699 15.1708 15.0116 14.9 14.998C14.8322 15.3325 14.7303 15.6592 14.596 15.973ZM7.25 8C6.56 8 6 8.56 6 9.25V14C6 15.0609 6.42143 16.0783 7.17157 16.8284C7.92172 17.5786 8.93913 18 10 18C11.0609 18 12.0783 17.5786 12.8284 16.8284C13.5786 16.0783 14 15.0609 14 14V9.25C14 8.56 13.44 8 12.75 8H7.25ZM7 9.25C7 9.1837 7.02634 9.12011 7.07322 9.07322C7.12011 9.02634 7.1837 9 7.25 9H12.75C12.8163 9 12.8799 9.02634 12.9268 9.07322C12.9737 9.12011 13 9.1837 13 9.25V14C13 14.7956 12.6839 15.5587 12.1213 16.1213C11.5587 16.6839 10.7956 17 10 17C9.20435 17 8.44129 16.6839 7.87868 16.1213C7.31607 15.5587 7 14.7956 7 14V9.25Z"
                      fill="#EB1C24"
                    />
                  </svg>
                    </>
                  )}
                </div>
                {/* Gray underline – same inset as content below */}
                <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '12px' }} />

                {selectedClientEmail ? (
                  /* Details view: profile, orders, appointments */
                  <div className="px-4 pb-6">
                    {selectedClient ? (
                      <>
                        <div className="bg-white border border-gray-200 p-4 mb-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <h2 className="text-lg font-bold" style={{ color: '#EB1C24' }}>{selectedName}</h2>
                                {selectedMembershipType === 'PREMIUM' && (
                                  <i className="ri-vip-crown-line text-lg" style={{ color: '#EB1C24' }} />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{(selectedClient?.email || '').toUpperCase()}</p>
                              <p className="text-sm text-gray-600">{(selectedClient?.phone || '—').toUpperCase()}</p>
                            </div>
                            <span className="px-3 py-1 text-xs rounded bg-green-100 text-green-800">ACTIVE</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>{selectedTotalOrders}</p>
                              <p className="text-xs text-gray-600">ORDERS</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>${selectedTotalSpent.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">TOTAL SPENT</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold" style={{ color: '#EB1C24' }}>{selectedMembershipType}</p>
                              <p className="text-xs text-gray-600">MEMBERSHIP</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex mb-6 border-b border-gray-200">
                          {DETAILS_TABS.map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setDetailsTab(tab)}
                              className={`px-4 py-2 text-sm font-medium ${detailsTab === tab ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
                            >
                              {tab.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        {detailsTab === 'profile' && (
                          <div className="space-y-4">
                            <div className="bg-white border border-gray-200 p-4">
                              <h3 className="font-bold mb-4">PERSONAL INFORMATION</h3>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">FULL NAME:</span>
                                  <span className="font-medium">{selectedName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">EMAIL:</span>
                                  <span className="font-medium">{(selectedClient?.email || '').toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">PHONE:</span>
                                  <span className="font-medium">{(selectedClient?.phone || '—').toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">ADDRESS:</span>
                                  <span className="font-medium">{(selectedClient?.address || '—').toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">JOIN DATE:</span>
                                  <span className="font-medium">{selectedJoinDate}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {detailsTab === 'orders' && (
                          <div className="space-y-3">
                            {selectedOrderHistory.length === 0 ? (
                              <div className="bg-white border border-gray-200 p-4 text-center text-sm text-gray-600">NO ORDERS YET</div>
                            ) : (
                              selectedOrderHistory.map((order: any, index: number) => (
                                <div key={index} className="bg-white border border-gray-200 p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-sm">{(order.product || '').toUpperCase()}</h4>
                                      <p className="text-xs text-gray-600">{order.id} - {order.date}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-sm" style={{ color: '#EB1C24' }}>${order.amount.toLocaleString()}</p>
                                      <p className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{order.status}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        {detailsTab === 'appointments' && (
                          <div className="space-y-3">
                            {appointments.map((appointment: any, index: number) => (
                              <div key={index} className="bg-white border border-gray-200 p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium text-sm">{appointment.type}</h4>
                                    <p className="text-xs text-gray-600">{appointment.date} AT {appointment.time}</p>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded ${appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                    {appointment.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-white border border-gray-200 p-6 text-center">
                        <p className="text-sm text-gray-600">CLIENT NOT FOUND</p>
                        <p className="text-xs text-gray-500 mt-2">{selectedClientEmail}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                {/* Tabs: ALL, REVIEWS, REWARDS, INVITES – same padding as content */}
                <div className="flex px-5">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className="flex-1 py-3 font-medium transition-colors"
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: activeTab === tab ? '#EB1C24' : '#808080',
                        border: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          borderBottom: activeTab === tab ? '1px solid #EB1C24' : '1px solid transparent',
                          paddingBottom: '4px',
                          marginLeft: tab === 'REVIEWS' ? '-6px' : undefined,
                        }}
                      >
                        {tab}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Sort + Column headers on same row – same line width as tabs */}
                <div
                  className="grid gap-2 px-5 py-2 font-medium text-black items-center min-w-0"
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '11px',
                    gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem',
                    marginTop: '8px',
                    marginLeft: '-4px',
                  }}
                >
                  <div className="relative" style={{ paddingLeft: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSortDropdown((v) => !v)}
                      className="flex items-center gap-1.5 text-black hover:text-gray-800 transition-colors"
                  >
                    <span>{sortOptionToLabel(sortOption)}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                        className="flex-shrink-0"
                        style={{ transform: showSortDropdown ? 'rotate(180deg)' : 'none', color: '#EB1C24', marginLeft: '-2px' }}
                    >
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showSortDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        aria-hidden="true"
                        onClick={() => setShowSortDropdown(false)}
                      />
                      <div
                          className="absolute left-0 mt-1 py-1 bg-white border border-black shadow-lg z-20 min-w-[120px]"
                        style={{ borderWidth: '1.3px' }}
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setSortOption(opt);
                              setShowSortDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                            style={{
                              fontFamily: '"Futura PT Book"',
                              color: sortOption === opt ? '#EB1C24' : '#000',
                              fontWeight: sortOption === opt ? 500 : 400,
                            }}
                          >
                            {sortOptionToLabel(opt)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                  {activeTab === 'INVITES' ? (
                    <>
                      <div className="text-center">REFERRAL</div>
                      <div className="text-center">STATUS</div>
                      <div className="text-center">INVITES</div>
                    </>
                  ) : activeTab === 'REWARDS' ? (
                    <>
                      <div className="text-center">PHOTOS</div>
                      <div className="text-center">VIDEOS</div>
                      <div className="text-center">TAGS</div>
                    </>
                  ) : activeTab === 'REVIEWS' ? (
                    <>
                      <div className="text-center">TOTAL</div>
                      <div className="text-center">MEDIA</div>
                      <div className="text-center">PENDING</div>
                    </>
                  ) : (
                    <>
                  <div className="text-center">NEW</div>
                  <div className="text-center">ORDERS</div>
                  <div className="text-center">CHARGES</div>
                    </>
                  )}
                </div>

                {/* Client rows – same line width as tabs */}
                <div className="overflow-y-auto overflow-x-hidden min-w-0" style={{ maxHeight: '380px' }}>
                  {registeredUsers.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                      NO REGISTERED CLIENTS YET. LIST IS PER BROWSER.
                    </div>
                  ) : sortedClients.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-gray-500">
                      NO CLIENTS MATCH THIS FILTER.
                    </div>
                  ) : activeTab === 'INVITES' ? (
                    sortedClients.map((u: any, i: number) => {
                      const row = getInvitesRow(u, i);
                      return (
                        <div
                          key={u.email || u.id || i}
                          className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-5 py-3 text-sm items-center ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedClientEmail(u.email || null)}
                            className="min-w-0 text-left w-full bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ paddingLeft: '8px' }}
                          >
                            <span className="font-medium block truncate" style={{ fontSize: '12px', color: '#EB1C24' }}>
                              {row.index}. {row.name}
                            </span>
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000' }}>{row.referralNumber}</div>
                          <div className="text-center" style={{ fontFamily: row.status === 'ACTIVE' ? '"Futura PT Book"' : '"Futura PT Medium"', fontSize: '11px', color: row.status === 'ACTIVE' ? '#EB1C24' : '#808080' }}>{row.status}</div>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.invitesCount !== 0 && row.invitesCount !== '0') ? '#EB1C24' : '#000000' }}>
                            {row.invitesCount}
                          </div>
                        </div>
                      );
                    })
                  ) : activeTab === 'REVIEWS' ? (
                    sortedClients.map((u: any, i: number) => {
                      const row = getReviewsTabRow(u, i);
                      return (
                        <div
                          key={u.email || u.id || i}
                          className={`grid gap-2 px-5 py-3 text-sm items-center ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedClientEmail(u.email || null)}
                            className="min-w-0 text-left w-full bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ paddingLeft: '8px' }}
                          >
                            <span className="font-medium block truncate" style={{ fontSize: '12px', color: '#EB1C24' }}>
                              {row.index}. {row.name}
                            </span>
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.totalReviews !== 0 && row.totalReviews !== '0') ? '#EB1C24' : '#000000' }}>{row.totalReviews}</div>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.reviewsWithPhotosVideos !== 0 && row.reviewsWithPhotosVideos !== '0') ? '#EB1C24' : '#000000' }}>{row.reviewsWithPhotosVideos}</div>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.pendingReviews !== 0 && row.pendingReviews !== '0') ? '#EB1C24' : '#000000' }}>{row.pendingReviews}</div>
                        </div>
                      );
                    })
                  ) : activeTab === 'REWARDS' ? (
                    sortedClients.map((u: any, i: number) => {
                      const row = getRewardsRow(u, i);
                      return (
                        <div
                          key={u.email || u.id || i}
                          className={`grid gap-2 px-5 py-3 text-sm items-center ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedClientEmail(u.email || null)}
                            className="min-w-0 text-left w-full bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ paddingLeft: '8px' }}
                          >
                            <span className="font-medium block truncate" style={{ fontSize: '12px', color: '#EB1C24' }}>
                              {row.index}. {row.name}
                            </span>
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.photosCount !== 0 && row.photosCount !== '0') ? '#EB1C24' : '#000000' }}>{row.photosCount}</div>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.videosCount !== 0 && row.videosCount !== '0') ? '#EB1C24' : '#000000' }}>{row.videosCount}</div>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.tagsCount !== 0 && row.tagsCount !== '0') ? '#EB1C24' : '#000000' }}>{row.tagsCount}</div>
                        </div>
                      );
                    })
                  ) : (
                    sortedClients.map((u: any, i: number) => {
                      const row = getClientRow(u, i);
                      return (
                        <div
                          key={u.email || u.id || i}
                          className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-5 py-3 text-sm items-center ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedClientEmail(u.email || null)}
                            className="min-w-0 text-left w-full bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ paddingLeft: '8px' }}
                          >
                            <span className="font-medium block truncate" style={{ fontSize: '12px', color: '#EB1C24' }}>
                              {row.index}. {row.name}
                            </span>
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.newCount !== 0 && row.newCount !== '0') ? '#EB1C24' : '#000000' }}>{row.newCount}</div>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: '#000000' }}>{row.ordersCount}</div>
                          <div className="text-center" style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080' }}>
                            ${row.charges.toLocaleString()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                  </>
                )}
              </div>

              {!selectedClientEmail && (
              <button
                type="button"
                onClick={() => navigate('/admin/clients/deleted')}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={{ ...pageActionButtonStyle, marginTop: '12px' }}
              >
                  VIEW DELETED ACCOUNTS
              </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
