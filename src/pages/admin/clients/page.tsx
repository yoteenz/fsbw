import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { isAyoteenzAdminAccount, getEffectiveTierName } from '../../../utils/adminAuth';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import summaryIcon from '../../../assets/icons/summary-icon.svg?url';
import { blockClient, isClientBlocked } from '../../../utils/blockedClients';
import { clientHasUnreadPriorityMessages, getLastUnreadPriorityMessageTime } from '../../../utils/priorityMessages';
import { formatBirthday } from '../../../utils/formatBirthday';

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

/** Tier display label and color for profile: "Silver tier", "Black tier", "Red tier" with matching color */
function getTierDisplayLabelAndColor(u: any): { label: string; color: string } {
  const tier = getEffectiveTierName(u);
  const membership = (u?.membershipType || 'STANDARD').toString().toUpperCase();
  if (tier === 'SILVER') return { label: 'Silver tier', color: '#808080' };
  if (tier === 'BLACK') return { label: 'Black tier', color: '#000000' };
  if (tier === 'RED') return { label: 'Red tier', color: '#EB1C24' };
  return { label: membership === 'PREMIUM' ? 'Premium' : 'Standard', color: '#808080' };
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

/** Product image path for order summary */
function getProductImage(productName: string): string {
  switch ((productName || '').toUpperCase()) {
    case 'BLANCO': return '/assets/2D BLANCO FRONT.png';
    case 'SOFT WAVE':
    case 'BEACH WAVE': return '/assets/2D WAVY FRONT.png';
    case 'SOFT CURL':
    case 'OCEAN CURL': return '/assets/2D CURLY FRONT.png';
    case 'NOIR':
    default: return '/assets/natural front.png';
  }
}

/** Hair origin by product */
function getHairOrigin(productName: string): string {
  switch ((productName || '').toUpperCase()) {
    case 'NOIR': return 'CAMBODIAN';
    case 'BLANCO': return 'RUSSIAN';
    case 'SOFT CURL': return 'FILIPINO';
    case 'OCEAN CURL': return 'VIETNAMESE';
    case 'SOFT WAVE': return 'INDIAN';
    case 'BEACH WAVE': return 'INDONESIAN';
    default: return 'CAMBODIAN';
  }
}

/** Detail lines for product options (cap size first, then non-default) */
function getNonDefaultDetailLines(productName: string, options: Record<string, string> | undefined): string[] {
  const fmt = (label: string, value: string) => `${label}: ${value.toLowerCase()}`;
  const opts = options ? Object.fromEntries(Object.entries(options).filter(([k]) => !k.startsWith('_'))) : {};
  const name = (productName || '').toUpperCase();
  const lines: string[] = [];
  const capSize = opts.capSize || 'M';
  lines.push(fmt('cap size', capSize.replace(/\//g, ' / ')));
  if (Object.keys(opts).length === 0 && !options) return lines;
  const defaultDensity = name === 'BLANCO' ? '250%' : '200%';
  if (opts.density && opts.density !== defaultDensity) lines.push(fmt('density', opts.density));
  if (opts.lace && opts.lace !== '13X6') lines.push(fmt('lace', opts.lace));
  let color = opts.color;
  const isDefaultColor = name === 'BLANCO' ? (color === 'PLATINUM') : (color === 'OFF BLACK');
  if (color && !isDefaultColor) lines.push(fmt('color', color));
  if (opts.hairline && opts.hairline !== 'NATURAL') lines.push(fmt('hairline', opts.hairline));
  const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
  if (opts.styling && opts.styling !== 'NONE' && hairStylingOptions.includes(opts.styling)) lines.push(fmt('styling', opts.styling));
  if (opts.addOns) lines.push(fmt('add-ons', opts.addOns));
  return lines;
}

/** 20 mock clients for ayoteenz admin only – mix of Standard/Premium, spend, bookings, alerts for testing sort tags. */
function getMockClientsForAyoteenz(): any[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mockRows: Array<{
    id: string; email: string; firstName: string; lastName: string; membershipType: string; createdAt: string;
    totalSpent: number; ordersCount: number; newCount: number; alertCount: number; bookingCount: number;
    birthDay: number; birthMonth: number; birthYear: number; invitesCount: number; status: string;
    reviewsCount: number; photosCount: number; videosCount: number; tagsCount: number;
    totalReviews: number; reviewsWithPhotosVideos: number; pendingReviews: number;
    currentTierName?: string; phone?: string; address?: string;
  }> = [
    /* totalSpent = realistic sums of product prices (NOIR ~740–920, BLANCO ~820, SOFT WAVE ~980, SOFT CURL ~780–1200, multi-unit ~1575–2220) */
    { id: 'mock-1', email: 'mock1@test.com', firstName: 'Zara', lastName: 'Adams', membershipType: 'PREMIUM', createdAt: new Date(now - 2 * day).toISOString(), totalSpent: 4195, ordersCount: 5, newCount: 1, alertCount: 2, bookingCount: 3, birthDay: 15, birthMonth: 3, birthYear: 1989, invitesCount: 4, status: 'ACTIVE', reviewsCount: 3, photosCount: 5, videosCount: 1, tagsCount: 8, totalReviews: 5, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED', phone: '(555) 201-3401', address: '124 OAK ST, LOS ANGELES, CA 90012', facebook: '@FRONTALSLAYER', instagram: '@ZARAADAMS' },
    { id: 'mock-2', email: 'mock2@test.com', firstName: 'Amy', lastName: 'Brooks', membershipType: 'STANDARD', createdAt: new Date(now - 10 * day).toISOString(), totalSpent: 1490, ordersCount: 2, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 3, birthMonth: 7, birthYear: 1992, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 302-4512', address: '89 MAPLE AVE, BROOKLYN, NY 11201', instagram: '@AMYBROOKS' },
    { id: 'mock-3', email: 'mock3@test.com', firstName: 'Quinn', lastName: 'Chen', membershipType: 'PREMIUM', createdAt: new Date(now - 1 * day).toISOString(), totalSpent: 3100, ordersCount: 4, newCount: 2, alertCount: 1, bookingCount: 2, birthDay: 22, birthMonth: 11, birthYear: 1985, invitesCount: 2, status: 'ACTIVE', reviewsCount: 2, photosCount: 4, videosCount: 2, tagsCount: 6, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'BLACK', phone: '(555) 403-5623', address: '256 PINE RD, HOUSTON, TX 77002', tiktok: '@QUINNCHEN' },
    { id: 'mock-4', email: 'mock4@test.com', firstName: 'Diana', lastName: 'Foster', membershipType: 'STANDARD', createdAt: new Date(now - 45 * day).toISOString(), totalSpent: 1575, ordersCount: 3, newCount: 0, alertCount: 1, bookingCount: 1, birthDay: 8, birthMonth: 2, birthYear: 1991, invitesCount: 1, status: 'INACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 3, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 504-6734', address: '17 ELM ST, CHICAGO, IL 60601' },
    { id: 'mock-5', email: 'mock5@test.com', firstName: 'Evan', lastName: 'Garcia', membershipType: 'PREMIUM', createdAt: new Date(now - 5 * day).toISOString(), totalSpent: 5820, ordersCount: 8, newCount: 1, alertCount: 3, bookingCount: 4, birthDay: 30, birthMonth: 8, birthYear: 1989, invitesCount: 7, status: 'ACTIVE', reviewsCount: 5, photosCount: 9, videosCount: 3, tagsCount: 12, totalReviews: 8, reviewsWithPhotosVideos: 6, pendingReviews: 2, currentTierName: 'BLACK', phone: '(555) 605-7845', address: '432 CEDAR LN, MIAMI, FL 33101' },
    { id: 'mock-6', email: 'mock6@test.com', firstName: 'Fiona', lastName: 'Hayes', membershipType: 'STANDARD', createdAt: new Date(now - 90 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 11, birthMonth: 5, birthYear: 1994, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 706-8956', address: '91 BIRCH WAY, SEATTLE, WA 98101' },
    { id: 'mock-7', email: 'mock7@test.com', firstName: 'Grant', lastName: 'Ingram', membershipType: 'PREMIUM', createdAt: new Date(now - 3 * day).toISOString(), totalSpent: 2100, ordersCount: 3, newCount: 0, alertCount: 0, bookingCount: 2, birthDay: 27, birthMonth: 9, birthYear: 1987, invitesCount: 3, status: 'ACTIVE', reviewsCount: 2, photosCount: 3, videosCount: 1, tagsCount: 4, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED', phone: '(555) 807-9067', address: '203 WILLOW DR, ATLANTA, GA 30301' },
    { id: 'mock-8', email: 'mock8@test.com', firstName: 'Hannah', lastName: 'Jones', membershipType: 'STANDARD', createdAt: new Date(now - 14 * day).toISOString(), totalSpent: 1520, ordersCount: 2, newCount: 1, alertCount: 2, bookingCount: 1, birthDay: 5, birthMonth: 12, birthYear: 1990, invitesCount: 1, status: 'ACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 2, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 1, currentTierName: 'SILVER', phone: '(555) 908-0178', address: '65 CHERRY BLVD, BOSTON, MA 02101' },
    { id: 'mock-9', email: 'mock9@test.com', firstName: 'Ivan', lastName: 'Kim', membershipType: 'PREMIUM', createdAt: new Date(now - 7 * day).toISOString(), totalSpent: 6710, ordersCount: 6, newCount: 2, alertCount: 1, bookingCount: 5, birthDay: 19, birthMonth: 4, birthYear: 1986, invitesCount: 5, status: 'INACTIVE', reviewsCount: 4, photosCount: 7, videosCount: 2, tagsCount: 10, totalReviews: 6, reviewsWithPhotosVideos: 5, pendingReviews: 1, currentTierName: 'BLACK', phone: '(555) 109-1289', address: '378 SPRUCE ST, DENVER, CO 80201' },
    { id: 'mock-10', email: 'mock10@test.com', firstName: 'Julia', lastName: 'Lee', membershipType: 'STANDARD', createdAt: new Date(now - 21 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 12, birthMonth: 1, birthYear: 1993, invitesCount: 0, status: 'ACTIVE', reviewsCount: 0, photosCount: 1, videosCount: 0, tagsCount: 1, totalReviews: 1, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 210-2390', address: '52 ASH AVE, PHOENIX, AZ 85001' },
    { id: 'mock-11', email: 'mock11@test.com', firstName: 'Kyle', lastName: 'Martinez', membershipType: 'PREMIUM', createdAt: new Date(now - 4 * day).toISOString(), totalSpent: 3900, ordersCount: 5, newCount: 1, alertCount: 2, bookingCount: 3, birthDay: 25, birthMonth: 6, birthYear: 1988, invitesCount: 2, status: 'ACTIVE', reviewsCount: 3, photosCount: 4, videosCount: 1, tagsCount: 7, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED', phone: '(555) 321-3401', address: '419 WALNUT PL, DETROIT, MI 48201' },
    { id: 'mock-12', email: 'mock12@test.com', firstName: 'Luna', lastName: 'Nguyen', membershipType: 'STANDARD', createdAt: new Date(now - 60 * day).toISOString(), totalSpent: 2100, ordersCount: 4, newCount: 0, alertCount: 1, bookingCount: 2, birthDay: 7, birthMonth: 10, birthYear: 1995, invitesCount: 4, status: 'INACTIVE', reviewsCount: 2, photosCount: 3, videosCount: 1, tagsCount: 5, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED', phone: '(555) 432-4512', address: '186 HICKORY LN, DALLAS, TX 75201' },
    { id: 'mock-13', email: 'mock13@test.com', firstName: 'Marcus', lastName: 'Owen', membershipType: 'PREMIUM', createdAt: new Date(now - 1 * day).toISOString(), totalSpent: 5120, ordersCount: 7, newCount: 3, alertCount: 4, bookingCount: 6, birthDay: 14, birthMonth: 2, birthYear: 1984, invitesCount: 9, status: 'ACTIVE', reviewsCount: 6, photosCount: 10, videosCount: 4, tagsCount: 14, totalReviews: 9, reviewsWithPhotosVideos: 7, pendingReviews: 2, currentTierName: 'BLACK', phone: '(555) 543-5623', address: '721 MAGNOLIA DR, SAN FRANCISCO, CA 94102' },
    { id: 'mock-14', email: 'mock14@test.com', firstName: 'Nina', lastName: 'Patel', membershipType: 'STANDARD', createdAt: new Date(now - 30 * day).toISOString(), totalSpent: 1520, ordersCount: 2, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 20, birthMonth: 8, birthYear: 1991, invitesCount: 0, status: 'ACTIVE', reviewsCount: 1, photosCount: 1, videosCount: 0, tagsCount: 2, totalReviews: 1, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 654-6734', address: '94 DOGWOOD ST, PHILADELPHIA, PA 19101' },
    { id: 'mock-15', email: 'mock15@test.com', firstName: 'Oscar', lastName: 'Quinn', membershipType: 'PREMIUM', createdAt: new Date(now - 6 * day).toISOString(), totalSpent: 4400, ordersCount: 5, newCount: 1, alertCount: 1, bookingCount: 4, birthDay: 9, birthMonth: 11, birthYear: 1989, invitesCount: 3, status: 'INACTIVE', reviewsCount: 3, photosCount: 5, videosCount: 1, tagsCount: 8, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED', phone: '(555) 765-7845', address: '553 POPLAR RD, SAN DIEGO, CA 92101' },
    { id: 'mock-16', email: 'mock16@test.com', firstName: 'Paula', lastName: 'Rivera', membershipType: 'STANDARD', createdAt: new Date(now - 120 * day).toISOString(), totalSpent: 3200, ordersCount: 6, newCount: 0, alertCount: 2, bookingCount: 2, birthDay: 28, birthMonth: 7, birthYear: 1983, invitesCount: 2, status: 'ACTIVE', reviewsCount: 2, photosCount: 4, videosCount: 0, tagsCount: 6, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED', phone: '(555) 876-8956', address: '268 SYCAMORE AVE, AUSTIN, TX 78701' },
    { id: 'mock-17', email: 'mock17@test.com', firstName: 'Ryan', lastName: 'Scott', membershipType: 'PREMIUM', createdAt: new Date(now - 2 * day).toISOString(), totalSpent: 1900, ordersCount: 3, newCount: 0, alertCount: 0, bookingCount: 1, birthDay: 4, birthMonth: 5, birthYear: 1990, invitesCount: 1, status: 'ACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 3, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 1, currentTierName: 'SILVER', phone: '(555) 987-9067', address: '135 CHESTNUT WAY, PORTLAND, OR 97201' },
    { id: 'mock-18', email: 'mock18@test.com', firstName: 'Sara', lastName: 'Torres', membershipType: 'STANDARD', createdAt: new Date(now - 8 * day).toISOString(), totalSpent: 1100, ordersCount: 2, newCount: 1, alertCount: 3, bookingCount: 1, birthDay: 16, birthMonth: 9, birthYear: 1992, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 098-0178', address: '602 BEECH BLVD, NASHVILLE, TN 37201' },
    { id: 'mock-19', email: 'mock19@test.com', firstName: 'Tyler', lastName: 'Upton', membershipType: 'PREMIUM', createdAt: new Date(now - 12 * day).toISOString(), totalSpent: 7200, ordersCount: 9, newCount: 2, alertCount: 2, bookingCount: 7, birthDay: 23, birthMonth: 12, birthYear: 1987, invitesCount: 6, status: 'ACTIVE', reviewsCount: 5, photosCount: 8, videosCount: 2, tagsCount: 11, totalReviews: 7, reviewsWithPhotosVideos: 6, pendingReviews: 2, currentTierName: 'BLACK', phone: '(555) 109-1289', address: '847 OAK PARK DR, CHARLOTTE, NC 28201' },
    { id: 'mock-20', email: 'mock20@test.com', firstName: 'Uma', lastName: 'Vance', membershipType: 'STANDARD', createdAt: new Date(now - 3 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 1, birthMonth: 4, birthYear: 1996, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 210-2390', address: '319 LAUREL ST, MINNEAPOLIS, MN 55401' },
  ];
  const min = 60 * 1000;
  return mockRows.map((row) => {
    const isPremium = (row.membershipType || '').toString().toUpperCase() === 'PREMIUM';
    const hasUnread = (row.alertCount ?? 0) > 0;
    const hasOrders = (row.ordersCount ?? 0) > 0;
    // lastUnreadPriorityMessageAt: Premium clients with unread messages (for Alerts sort)
    const lastUnreadPriorityMessageAt =
      isPremium && hasUnread
        ? new Date(now - (5 - Math.min(row.alertCount ?? 1, 4)) * min).toISOString()
        : undefined;
    // lastOrderIssueAt: order-related issues (missing form, refund, shipping delay, etc.) - any client with orders + alerts
    const lastOrderIssueAt =
      hasOrders && hasUnread
        ? new Date(now - (4 - Math.min((row.alertCount ?? 1) % 4, 3)) * min).toISOString() // variety for sort order
        : undefined;
    return {
      ...row,
      referralNumber: buildReferralCode(row.firstName, row.lastName, row.birthDay, row.email),
      lastUnreadPriorityMessageAt,
      lastOrderIssueAt,
    };
  });
}

const MOCK_PRODUCTS = ['NOIR', 'BLANCO', 'SOFT WAVE', 'SOFT CURL', 'BEACH WAVE', 'OCEAN CURL'];

/** Mock orders for mock clients when localStorage has no userOrders data. Uses client's ordersCount, totalSpent, newCount. */
function getMockOrdersForClient(client: any): Array<{ id: string; date: string; product: string; amount: number; status: string }> {
  const count = client?.ordersCount ?? 0;
  const totalSpent = client?.totalSpent ?? 0;
  const newCount = client?.newCount ?? 0;
  if (count <= 0) return [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const orders: Array<{ id: string; date: string; product: string; amount: number; status: string }> = [];
  const avgAmount = count > 0 ? Math.round(totalSpent / count) : 0;
  const amounts = Array.from({ length: count }, (_, i) => {
    const variance = (i % 3 === 0 ? 80 : i % 3 === 1 ? -60 : 40);
    return Math.max(580, Math.min(1200, avgAmount + variance));
  });
  const sum = amounts.reduce((a, b) => a + b, 0);
  amounts[0] += totalSpent - sum;
  for (let i = 0; i < count; i++) {
    const isDelivered = i >= newCount;
    const daysAgo = count - i + Math.floor(i / 2);
    const orderDate = new Date(now - daysAgo * day);
    orders.push({
      id: `#${String(i + 1).padStart(3, '0')}`,
      date: orderDate.toLocaleDateString(undefined, { dateStyle: 'medium' }),
      product: MOCK_PRODUCTS[i % MOCK_PRODUCTS.length],
      amount: amounts[i],
      status: isDelivered ? 'DELIVERED' : 'IN PROGRESS',
    });
  }
  return orders.reverse();
}

const DETAILS_TABS = ['orders', 'appointments', 'reviews', 'messages'] as const;

export default function AdminClients() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('Most recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<typeof DETAILS_TABS[number]>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [profilePhotoError, setProfilePhotoError] = useState(false);

  // Sync selectedClientEmail from URL (e.g. when redirected from /admin/clients/account?email=...)
  useEffect(() => {
    if (emailFromUrl) setSelectedClientEmail(emailFromUrl);
  }, [emailFromUrl]);

  // Reset expanded order when switching away from orders tab
  useEffect(() => {
    if (detailsTab !== 'orders') setExpandedOrderId(null);
  }, [detailsTab]);

  // Reset profile photo error when switching clients
  useEffect(() => {
    setProfilePhotoError(false);
  }, [selectedClientEmail]);

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
      // Filter out blocked clients
      reg = reg.filter((u: any) => !isClientBlocked(u));
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

  // Selected client, order history (simplified), and raw orders (full objects for expand view)
  const { selectedClient, selectedOrderHistory, selectedRawOrders } = (() => {
    const email = (selectedClientEmail || '').trim().toLowerCase();
    if (!email) return { selectedClient: null, selectedOrderHistory: [], selectedRawOrders: [] };
    const found = registeredUsers.find((u: any) => (u.email || '').toLowerCase() === email);
    let orderHistory: any[] = [];
    let rawOrders: any[] = [];
    try {
      const raw = localStorage.getItem(`userOrders_${email}`);
      const data = raw ? JSON.parse(raw) : null;
      const active = data?.activeOrders || [];
      const past = data?.pastOrders || [];
      if (active.length > 0 || past.length > 0) {
        rawOrders = [...active, ...past].map((o: any, i: number) => ({ ...o, id: o.id || `order-${i}` }));
        orderHistory = rawOrders.map((o: any) => ({
          id: o.id,
          date: o.date || o.createdAt || '—',
          product: o.items?.[0]?.name || o.productName || 'Order',
          amount: Number(o.total) || 0,
          status: (o.status || 'COMPLETED').toUpperCase(),
        }));
      } else if (found && /^mock\d+@test\.com$/i.test(email)) {
        const mockList = getMockOrdersForClient(found);
        orderHistory = mockList;
        rawOrders = mockList.map((m: any, i: number) => ({
          id: m.id,
          orderNumber: `ORDER #${m.id.replace(/^#/, '')}`,
          date: m.date,
          status: m.status,
          productName: m.product,
          productImage: getProductImage(m.product),
          total: m.amount,
          items: 1,
        }));
      }
    } catch {
      // ignore
    }
    return { selectedClient: found || null, selectedOrderHistory: orderHistory, selectedRawOrders: rawOrders };
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
  // NEW = orders not yet delivered; ORDERS = only delivered orders (NEW orders don't count until delivered)
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
          const delivered = nonCanceled.filter((o: any) => (o.status || '').toUpperCase() === 'DELIVERED' || !!o.deliveredAt);
          if (ordersCount == null) ordersCount = delivered.length;
          charges = nonCanceled.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
          if (newCount == null) newCount = notDelivered.length;
        }
      }
    } catch {
      // ignore
    }
    return { index: index + 1, name, newCount: newCount ?? 0, ordersCount: ordersCount ?? 0, charges: charges ?? 0 };
  };

  // INVITES tab: referral number + status (referral code active = has completed purchase) + invites (count who used code to make purchase)
  const getInvitesRow = (u: any, index: number) => {
    const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '—').toUpperCase();
    let referralNumber = u.referralNumber;
    let status: string;
    let invitesCount: number;
    try {
      const email = (u.email || '').trim().toLowerCase();
      if (email) {
        // Referral code
        if (referralNumber == null && u.firstName != null && u.lastName != null && u.birthDay != null) {
          referralNumber = buildReferralCode(u.firstName, u.lastName, Number(u.birthDay), u.email || u.id || '');
        }
        if (referralNumber == null && isAyoteenzAdminAccount(u)) {
          referralNumber = buildReferralCode(u.firstName || 'K', u.lastName || 'A', u.birthDay ?? 30, u.email || u.id || '');
        }
        if (referralNumber == null) referralNumber = localStorage.getItem(`userReferralCode_${email}`) || null;
        if (referralNumber == null) referralNumber = '—';

        // STATUS = referral code active if user has completed a purchase (at least one DELIVERED order)
        const ordersRaw = localStorage.getItem(`userOrders_${email}`);
        const ordersData = ordersRaw ? JSON.parse(ordersRaw) : null;
        const allOrders = [...(ordersData?.activeOrders || []), ...(ordersData?.pastOrders || [])];
        const hasDelivered = allOrders.some((o: any) => (o.status || '').toUpperCase() === 'DELIVERED' || !!o.deliveredAt);
        status = allOrders.length > 0 ? (hasDelivered ? 'ACTIVE' : 'INACTIVE') : ((u.totalSpent ?? 0) > 0 ? 'ACTIVE' : 'INACTIVE');

        // INVITES = count of people who used this user's referral code to make a purchase (referralEarnings with status confirmed)
        const earningsRaw = localStorage.getItem('referralEarnings');
        const earnings = earningsRaw ? JSON.parse(earningsRaw) : [];
        invitesCount = Array.isArray(earnings)
          ? earnings.filter((e: any) => (e.referrerEmail || '').trim().toLowerCase() === email && (e.status || '').toLowerCase() === 'confirmed').length
          : (u.invitesCount ?? 0);
      } else {
        status = u.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        invitesCount = u.invitesCount ?? 0;
      }
    } catch {
      status = (u.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
      invitesCount = u.invitesCount ?? 0;
    }
    return { index: index + 1, name, referralNumber: referralNumber ?? '—', status: (status ?? 'INACTIVE').toString().toUpperCase(), invitesCount: invitesCount ?? 0 };
  };

  // Referral status + code for details view (same logic as INVITES tab)
  const { selectedReferralStatus, selectedReferralCode } = selectedClient
    ? (() => { const r = getInvitesRow(selectedClient, 0); return { selectedReferralStatus: r.status, selectedReferralCode: r.referralNumber }; })()
    : { selectedReferralStatus: 'INACTIVE', selectedReferralCode: '—' };
  const selectedTierLabel = selectedClient ? getMembershipTierLabel(selectedClient) : '—';
  const selectedTierDisplay = selectedClient ? getTierDisplayLabelAndColor(selectedClient) : { label: '—', color: '#808080' };
  const selectedBirthday = formatBirthday(selectedClient);
  const selectedPrimaryAddress = selectedClient
    ? (() => {
        const c = selectedClient as any;
        const primary = c.defaultAddress || c.shippingAddress;
        if (primary && typeof primary === 'object' && (primary.address || primary.city)) {
          const parts = [
            primary.address,
            [primary.city, primary.state, primary.zip].filter(Boolean).join(', '),
            primary.country,
          ].filter(Boolean);
          return parts.join('\n').toUpperCase() || '—';
        }
        if (c.address && typeof c.address === 'string') return c.address.toUpperCase();
        return '—';
      })()
    : '—';

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
    if (sortOption === 'A to Z') {
      list.sort((a, b) => name(a).localeCompare(name(b), undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'Z to A') {
      list.sort((a, b) => name(b).localeCompare(name(a), undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'Most spent') {
      list.sort((a, b) => charges(b) - charges(a));
    } else if (sortOption === 'Least spent') {
      list.sort((a, b) => charges(a) - charges(b));
    } else if (sortOption === 'Alerts') {
      list = list.filter((u) => clientHasUnreadPriorityMessages(u));
      list.sort((a, b) => getLastUnreadPriorityMessageTime(b) - getLastUnreadPriorityMessageTime(a));
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
                        {selectedName}
                      </h2>
                      <button
                        type="button"
                        onClick={() => { setSelectedClientEmail(null); setDetailsTab('orders'); setExpandedOrderId(null); }}
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
                <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

                {selectedClientEmail ? (
                  /* Details view: profile, orders, appointments */
                  <div className="px-4 pb-6" style={{ paddingTop: '10px' }}>
                    {selectedClient ? (
                      <>
                        {/* Circular profile area centered above the tab bar */}
                        <div className="flex justify-center mb-4">
                          <div
                            className="relative rounded-full flex items-center justify-center overflow-hidden shrink-0"
                            style={{
                              width: '100px',
                              height: '100px',
                              backgroundColor: '#FFFFFF',
                              border: '1.3px solid #000',
                            }}
                          >
                            {(() => {
                              const c = selectedClient as any;
                              const photoSrc = c?.profileImage || c?.photo || c?.profilePhoto || c?.avatar || '/assets/profile-thumb.png';
                              return !profilePhotoError ? (
                                <img
                                  src={photoSrc}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={() => setProfilePhotoError(true)}
                                />
                              ) : null;
                            })()}
                            <div
                              className="absolute inset-0 flex items-center justify-center font-futura font-bold text-lg"
                              style={{ backgroundColor: 'transparent', color: '#000000', zIndex: !profilePhotoError ? -1 : 0 }}
                            >
                              {[(selectedClient?.firstName || '').trim().charAt(0), (selectedClient?.lastName || '').trim().charAt(0)].filter(Boolean).join('').toUpperCase() || '?'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 mb-6">
                          <div className="flex flex-col items-center text-center mb-4">
                            <span
                              className="inline-block px-3 py-1 text-xs rounded mb-2"
                              style={{
                                backgroundColor: selectedReferralStatus === 'ACTIVE' ? 'rgba(235, 28, 36, 0.15)' : '#f3f4f6',
                                color: selectedReferralStatus === 'ACTIVE' ? '#EB1C24' : '#808080',
                              }}
                            >
                              {selectedReferralStatus}
                            </span>
                            <p className="mb-1" style={{ fontFamily: '"Futura PT Book"', color: selectedTierDisplay.color, fontSize: '10px' }}>{selectedTierDisplay.label}</p>
                            <p style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px' }}>{selectedReferralCode}</p>
                          </div>
                          <div className="flex justify-center">
                            <div className="grid grid-cols-3 gap-4 text-center w-fit">
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{selectedTotalOrders}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>ORDERS</p>
                              </div>
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>${selectedTotalSpent.toLocaleString()}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>TOTAL SPENT</p>
                              </div>
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{selectedMembershipType}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>MEMBERSHIP</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Rewards section: photos, videos, tags */}
                        {selectedClient && (
                          <div className="bg-white border border-gray-200 p-4 mb-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{getRewardsRow(selectedClient, 0).photosCount}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>PHOTOS</p>
                              </div>
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{getRewardsRow(selectedClient, 0).videosCount}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>VIDEOS</p>
                              </div>
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{getRewardsRow(selectedClient, 0).tagsCount}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>TAGS</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="bg-white border border-gray-200 p-4 mb-6">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px' }}>JOIN DATE:</span>
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>{selectedJoinDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px' }}>EMAIL:</span>
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>{(selectedClient?.email || '').toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px' }}>BIRTHDAY:</span>
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>{selectedBirthday}</span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px' }}>PHONE:</span>
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>{(selectedClient?.phone || '—').toUpperCase()}</span>
                            </div>
                            {(['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin'] as const).map((key) => {
                              const val = (selectedClient as any)?.[key];
                              if (!val || String(val).trim() === '') return null;
                              const label = key.toLowerCase() + ':';
                              return (
                                <div key={key} className="flex justify-between">
                                  <span style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px' }}>{label}</span>
                                  <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>{String(val).trim().toUpperCase()}</span>
                                </div>
                              );
                            })}
                            <div className="flex justify-between items-start">
                              <span style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px' }}>ADDRESS:</span>
                              <span className="text-right" style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', maxWidth: '60%' }}>
                                {selectedPrimaryAddress === '—' ? (
                                  '—'
                                ) : (
                                  selectedPrimaryAddress.split('\n').map((line, i) => (
                                    <span key={i}>
                                      {i > 0 && <br />}
                                      {line}
                                    </span>
                                  ))
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center gap-8 mb-6">
                          {DETAILS_TABS.map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setDetailsTab(tab)}
                              className="py-3 font-medium transition-colors"
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '11px',
                                color: detailsTab === tab ? '#EB1C24' : '#808080',
                                border: 'none',
                                paddingBottom: '4px',
                                background: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-block',
                                  borderBottom: detailsTab === tab ? '1px solid #EB1C24' : '1px solid transparent',
                                  paddingBottom: '4px'
                                }}
                              >
                                {tab.toUpperCase()}
                              </span>
                            </button>
                          ))}
                        </div>
                        {detailsTab === 'orders' && (
                          <div className="space-y-3">
                            {selectedOrderHistory.length === 0 ? (
                              <div className="bg-white border border-gray-200 p-4 text-center text-sm text-gray-600">NO ORDERS YET</div>
                            ) : expandedOrderId ? (() => {
                              const expandedOrder = selectedRawOrders.find((o: any) => o.id === expandedOrderId);
                              if (!expandedOrder) return null;
                              const orderAmount = (expandedOrder.subtotal != null ? expandedOrder.subtotal : expandedOrder.total) ?? 0;
                              const orderProducts = expandedOrder.lineItems && expandedOrder.lineItems.length > 0
                                ? expandedOrder.lineItems.map((line: any, i: number) => ({
                                    id: `${expandedOrder.id}-product-${i}`,
                                    name: line.productName,
                                    image: getProductImage(line.productName),
                                    price: line.subtotal != null ? line.subtotal : orderAmount / expandedOrder.lineItems.length,
                                    options: line.options
                                  }))
                                : Array.from({ length: expandedOrder.items ?? 1 }, (_, i) => ({
                                    id: `${expandedOrder.id}-product-${i}`,
                                    name: expandedOrder.productName || 'Order',
                                    image: expandedOrder.productImage || getProductImage(expandedOrder.productName || ''),
                                    price: orderAmount / (expandedOrder.items ?? 1),
                                    options: undefined as Record<string, string> | undefined
                                  }));
                              const discounts = (expandedOrder as any).discounts || [];
                              const subtotal = (expandedOrder as any).subtotal ?? expandedOrder.total;
                              const hasDiscounts = discounts.length > 0 || (subtotal != null && subtotal > (expandedOrder.total ?? 0));
                              return (
                                <div className="bg-white border border-gray-200 p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>
                                      {(expandedOrder.orderNumber || expandedOrder.id || 'ORDER').toString().replace(/^ORDER\s*/i, 'ORDER #')}
                                    </h3>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedOrderId(null)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                      aria-label="Close"
                                    >
                                      <img src="/assets/close-icon.svg" alt="Close" style={{ width: '16px', height: '16px', filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
                                    </button>
                                  </div>
                                  <div className="relative overflow-x-auto mb-4" style={{ minHeight: '140px' }}>
                                    <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
                                      {orderProducts.map((product: any) => {
                                        const opts = product.options || {};
                                        const lengthVal = opts.length || '24"';
                                        const nonDefaultDetails = getNonDefaultDetailLines(product.name, opts);
                                        return (
                                          <div key={product.id} className="flex-shrink-0" style={{ width: '120px', textAlign: 'center' }}>
                                            <img src={product.image} alt={product.name} style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                                            <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '16px', color: '#000', marginTop: '4px', textTransform: 'uppercase' }}>{product.name.replace(/WIG/gi, '').trim()}</p>
                                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#EB1C24', marginTop: '2px', textTransform: 'uppercase' }}>{`${lengthVal} RAW ${getHairOrigin(product.name)}`}</p>
                                            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', color: '#808080', marginTop: '4px' }}>${product.price.toLocaleString()}</p>
                                            {nonDefaultDetails.length > 0 && (
                                              <div style={{ marginTop: '4px', textAlign: 'center' }}>
                                                {nonDefaultDetails.map((line: string, idx: number) => (
                                                  <div key={idx} style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#000', marginTop: idx === 0 ? 0 : '2px', textTransform: 'uppercase' }}>{line}</div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div style={{ marginBottom: '16px' }}>
                                    <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                                      <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>ORDER SUMMARY</h4>
                                      <img src={summaryIcon} alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div className="flex justify-between">
                                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER DATE</span>
                                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{expandedOrder.date || '—'}</span>
                                      </div>
                                      {hasDiscounts && subtotal != null && subtotal > (expandedOrder.total ?? 0) && (
                                        <div className="flex justify-between">
                                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>SUBTOTAL</span>
                                          <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>${subtotal.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {discounts.map((d: any, i: number) => (
                                        <div key={i} className="flex justify-between">
                                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>{d.label || 'DISCOUNT'}</span>
                                          <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#EB1C24', textTransform: 'uppercase' }}>
                                            {typeof d.amount === 'number' && d.amount < 0 ? `-$${Math.abs(d.amount).toLocaleString()}` : d.amount}
                                          </span>
                                        </div>
                                      ))}
                                      {discounts.length === 0 && (expandedOrder as any).discountApplied != null && (expandedOrder as any).discountApplied !== 0 && (
                                        <div className="flex justify-between">
                                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>DISCOUNT APPLIED</span>
                                          <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#EB1C24', textTransform: 'uppercase' }}>-${Math.abs((expandedOrder as any).discountApplied).toLocaleString()}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER TOTAL</span>
                                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>${(expandedOrder.total ?? 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER NUMBER</span>
                                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{(expandedOrder.orderNumber || expandedOrder.id || '—').toString().replace(/^ORDER\s+/i, '')}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedClient && (
                                    <div>
                                      <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                                        <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>SHIPPING</h4>
                                        <img src="/assets/ship-icon.svg" alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                                          {selectedClient.firstName || ''} {selectedClient.lastName || ''}
                                        </p>
                                        {(() => {
                                          const addr = (selectedClient.address || '').toUpperCase();
                                          if (!addr) return null;
                                          const parts = addr.split(', ');
                                          if (parts.length >= 3) {
                                            return (
                                              <>
                                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{parts[0]}</p>
                                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{parts.slice(1).join(', ')}</p>
                                              </>
                                            );
                                          }
                                          return <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{addr}</p>;
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })() : (
                              selectedOrderHistory.map((order: any, index: number) => (
                                <div
                                  key={order.id || index}
                                  className="bg-white border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => setExpandedOrderId(order.id)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedOrderId(order.id); } }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-sm">{(order.product || '').toUpperCase()}</h4>
                                      <p className="text-xs text-gray-600">{(selectedRawOrders.find((o: any) => o.id === order.id)?.orderNumber || order.id || '')} - {order.date}</p>
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
                        {detailsTab === 'reviews' && selectedClient && (
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{getReviewsTabRow(selectedClient, 0).totalReviews}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>TOTAL</p>
                              </div>
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{getReviewsTabRow(selectedClient, 0).reviewsWithPhotosVideos}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>MEDIA</p>
                              </div>
                              <div>
                                <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '16px' }}>{getReviewsTabRow(selectedClient, 0).pendingReviews}</p>
                                <p className="text-xs" style={{ fontFamily: '"Futura PT Book"', color: '#000000' }}>PENDING</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {detailsTab === 'messages' && selectedClient && (() => {
                          const email = (selectedClient.email || '').trim().toLowerCase();
                          let messages: Array<{ id: string; message: string; timestamp?: string; type?: string; subject?: string }> = [];
                          try {
                            const priorityRaw = localStorage.getItem('adminPriorityMessages');
                            const priorityList = priorityRaw ? JSON.parse(priorityRaw) : [];
                            if (Array.isArray(priorityList)) {
                              messages = priorityList
                                .filter((m: any) => (m.userId || m.userEmail || '').toLowerCase() === email)
                                .map((m: any) => ({ id: m.id || '', message: m.message || '', timestamp: m.timestamp, type: m.type || 'priority' }));
                            }
                            const supportKey = `userSupportMessages_${email}`;
                            const supportRaw = localStorage.getItem(supportKey);
                            const supportList = supportRaw ? JSON.parse(supportRaw) : [];
                            if (Array.isArray(supportList)) {
                              supportList.forEach((m: any) => {
                                messages.push({
                                  id: m.id || `support-${messages.length}`,
                                  message: m.message || m.body || m.content || '',
                                  timestamp: m.timestamp || m.date,
                                  type: 'support',
                                  subject: m.subject,
                                });
                              });
                            }
                            messages.sort((a, b) => {
                              const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                              const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                              return tb - ta;
                            });
                          } catch {
                            // ignore
                          }
                          return (
                            <div className="bg-white border border-gray-200 p-4">
                              <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', marginBottom: '12px' }}>MESSAGES / SUPPORT</h3>
                              {messages.length === 0 ? (
                                <p className="text-sm font-futura py-4" style={{ color: '#808080' }}>NO MESSAGES OR SUPPORT EMAILS YET.</p>
                              ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {messages.map((m) => (
                                    <div key={m.id} className="py-3 border-b border-gray-100 last:border-0">
                                      {m.subject && (
                                        <p className="font-futura text-xs font-medium mb-1" style={{ color: '#EB1C24' }}>{m.subject.toUpperCase()}</p>
                                      )}
                                      <p className="font-futura text-xs" style={{ color: '#000' }}>{m.message}</p>
                                      {m.timestamp && (
                                        <p className="font-futura text-xs mt-1" style={{ color: '#808080' }}>
                                          {new Date(m.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
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
                    marginTop: '7px',
                    marginLeft: '-4px',
                  }}
                >
                  <div className="relative" style={{ paddingLeft: '10px' }}>
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
                          className="absolute left-0 py-1 bg-white border border-black shadow-lg z-20 min-w-[120px]"
                        style={{ borderWidth: '1.3px', marginTop: '7px' }}
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
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>REFERRAL</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>STATUS</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>INVITES</div>
                    </>
                  ) : activeTab === 'REWARDS' ? (
                    <>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>PHOTOS</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>VIDEOS</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>TAGS</div>
                    </>
                  ) : activeTab === 'REVIEWS' ? (
                    <>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>TOTAL</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>MEDIA</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>PENDING</div>
                    </>
                  ) : (
                    <>
                  <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>NEW</div>
                  <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>ORDERS</div>
                  <div className="flex justify-center w-full" style={{ textAlign: 'center' }}>CHARGES</div>
                    </>
                  )}
                </div>

                {/* Client rows – same line width as tabs */}
                <div className="overflow-y-auto overflow-x-hidden min-w-0" style={{ maxHeight: '380px', paddingTop: '2px' }}>
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
                          className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-5 py-3 text-sm items-start ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px', paddingTop: '10px' }}
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
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', marginTop: '2px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', textAlign: 'center' }}>{row.referralNumber}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: row.status === 'ACTIVE' ? '"Futura PT Book"' : '"Futura PT Medium"', fontSize: '11px', color: row.status === 'ACTIVE' ? '#EB1C24' : '#808080', textAlign: 'center' }}>{row.status}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.invitesCount !== 0 && row.invitesCount !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>
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
                          className={`grid gap-2 px-5 py-3 text-sm items-start ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px', paddingTop: '10px' }}
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
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', marginTop: '2px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.totalReviews !== 0 && row.totalReviews !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>{row.totalReviews}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.reviewsWithPhotosVideos !== 0 && row.reviewsWithPhotosVideos !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>{row.reviewsWithPhotosVideos}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.pendingReviews !== 0 && row.pendingReviews !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>{row.pendingReviews}</div>
                        </div>
                      );
                    })
                  ) : activeTab === 'REWARDS' ? (
                    sortedClients.map((u: any, i: number) => {
                      const row = getRewardsRow(u, i);
                      return (
                        <div
                          key={u.email || u.id || i}
                          className={`grid gap-2 px-5 py-3 text-sm items-start ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px', paddingTop: '10px' }}
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
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', marginTop: '2px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.photosCount !== 0 && row.photosCount !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>{row.photosCount}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.videosCount !== 0 && row.videosCount !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>{row.videosCount}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.tagsCount !== 0 && row.tagsCount !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>{row.tagsCount}</div>
                        </div>
                      );
                    })
                  ) : (
                    sortedClients.map((u: any, i: number) => {
                      const row = getClientRow(u, i);
                      return (
                        <div
                          key={u.email || u.id || i}
                          className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-5 py-3 text-sm items-start ${i === sortedClients.length - 1 ? '' : 'border-b border-gray-100'}`}
                          style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px', paddingTop: '10px' }}
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
                            <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', marginTop: '2px' }}>
                              {getMembershipTierLabel(u)}
                            </span>
                          </button>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.newCount !== 0 && row.newCount !== '0') ? '#EB1C24' : '#000000', textAlign: 'center' }}>{row.newCount}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: '#000000', textAlign: 'center' }}>{row.ordersCount}</div>
                          <div className="flex justify-center w-full" style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', textAlign: 'center' }}>
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

              {selectedClientEmail && selectedClient && (
                <button
                  type="button"
                  onClick={() => setShowBlockConfirm(true)}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={{ ...pageActionButtonStyle, marginTop: '14px' }}
                >
                  BLOCK CLIENT
                </button>
              )}
              {!selectedClientEmail && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/clients/deleted')}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={{ ...pageActionButtonStyle, marginTop: '14px' }}
                >
                  VIEW DELETED ACCOUNTS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={() => {
          if (selectedClient) {
            const allReg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            blockClient(selectedClient, Array.isArray(allReg) ? allReg : []);
            loadData();
            setSelectedClientEmail(null);
            setShowBlockConfirm(false);
            navigate('/admin/clients');
          }
        }}
        title="BLOCK CLIENT?"
        message="YOU WILL BAN THIS CLIENT AND ANY SIMILAR ACCOUNTS."
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="block-client-confirm"
      />
    </>
  );
}
