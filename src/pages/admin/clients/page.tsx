import { useState, useEffect, useCallback, useRef, useLayoutEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { isAyoteenzAdminAccount, getEffectiveTierName, isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { useAdminMeetingsApiRefresh } from '../../../hooks/useAdminMeetingsApiRefresh';
import {
  getAdminClients,
  getAdminOrders,
  getAdminCart,
  getAdminWishlist,
  getAdminActivity,
  getAdminReviews,
  exportClientsCsv,
} from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import summaryIcon from '../../../assets/icons/summary-icon.svg?url';
import { blockClient, isClientBlocked } from '../../../utils/blockedClients';
import { clientHasUnreadPriorityMessages, getLastUnreadPriorityMessageTime, isOrderUnfulfilled } from '../../../utils/priorityMessages';
import { formatBirthday } from '../../../utils/formatBirthday';
import { formatCountryDisplay } from '../../../utils/formatCountry';
import ImageViewerModal from '../../../components/ImageViewerModal';
import { isNewsletterOptIn } from '../../../utils/newsletterOptIn';
import { schedulePushCartWishlistToCloud } from '../../../utils/pushCartWishlistToCloud';
import { readLocalActivityForEmail, trackActivity } from '../../../utils/activity';
import { socialStorageToHttpsUrl, type SocialPlatform } from '../../../utils/socialLinks';
import {
  compareAdminMeetingsNewestFirst,
  listAggregatedAdminMeetingsForClientDetails,
  type AdminMeeting
} from '../../../utils/adminMeetingsMock';
import { AdminMeetingClientPanel, AdminMeetingClientPanelShell } from '../../../utils/adminMeetingClientPanels';

const TABS = ['ALL', 'REVIEWS', 'REWARDS', 'INVITES'] as const;

const SORT_OPTIONS = [
  'Most recent',
  'Alerts',
  'A to Z',
  'Z to A',
  'Most spent',
  'Least spent',
  'International',
  'Socials',
  'Photos',
  'Videos',
  'Tags',
  'Reviews',
  'Active',
  'Inactive',
  'Standard',
  'Premium',
  'Silver',
  'Red',
  'Black',
] as const;
type SortOption = typeof SORT_OPTIONS[number];

function sortOptionToLabel(opt: SortOption): string {
  return opt.toUpperCase().replace(/\s+/g, ' ');
}

function formatPhoneWithHyphens(value: unknown): string {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 10);
  if (!digits) return '—';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** e.g. "STANDARD SILVER", "PREMIUM RED" from membershipType + tier */
function getMembershipTierLabel(u: any): string {
  const membership = (u.membershipType || 'STANDARD').toString().toUpperCase();
  const tier = getEffectiveTierName(u);
  if (!tier) return membership;
  return `${membership} ${tier}`.toUpperCase();
}

/** Build a single searchable string for a client (names, email, membership, tier, products, sort-related tags) */
function getClientSearchableText(u: any): string {
  const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '').toLowerCase();
  const email = (u.email || '').toString().trim().toLowerCase();
  const membership = (u.membershipType || 'STANDARD').toString().toLowerCase();
  const tier = (getEffectiveTierName(u) || '').toLowerCase();
  const tierLabel = getMembershipTierLabel(u).toLowerCase();
  const parts = [name, email, membership, tier, tierLabel];
  if (membership === 'premium') parts.push('premium');
  if (membership === 'standard') parts.push('standard');
  if (tier) parts.push(tier);
  if (isClientNewsletterSubscribed(u)) parts.push('newsletter');
  if (isClientInternational(u)) parts.push('international');
  if (isClientHasSocials(u)) parts.push('socials');
  if (clientHasUnreadPriorityMessages(u)) parts.push('alerts');
  try {
    const emailKey = (u?.email || '').toString().trim().toLowerCase();
    if (/^mock\d+@test\.com$/i.test(emailKey)) {
      const mockOrders = getMockOrdersForClient(u);
      mockOrders.forEach((o: any) => {
        if (o.product) parts.push(String(o.product).toLowerCase());
        if (o.lineItems) o.lineItems.forEach((line: any) => { if (line.productName) parts.push(String(line.productName).toLowerCase()); });
      });
    } else if (emailKey) {
      const raw = localStorage.getItem(`userOrders_${emailKey}`);
      const data = raw ? JSON.parse(raw) : null;
      const orders = [...(data?.activeOrders || []), ...(data?.pastOrders || [])];
      orders.forEach((o: any) => {
        if (o.productName) parts.push(String(o.productName).toLowerCase());
        (o.lineItems || []).forEach((line: any) => { if (line.productName) parts.push(String(line.productName).toLowerCase()); });
        (o.items || []).forEach((item: any) => { if (item?.name) parts.push(String(item.name).toLowerCase()); });
      });
    }
  } catch {
    /* ignore */
  }
  return parts.filter(Boolean).join(' ');
}

/** Tier display label and color for profile: "Silver tier rewards", "Black tier rewards", "Red tier rewards" with matching color */
function getTierDisplayLabelAndColor(u: any): { label: string; color: string } {
  const tier = getEffectiveTierName(u);
  const membership = (u?.membershipType || 'STANDARD').toString().toUpperCase();
  if (tier === 'SILVER') return { label: 'Silver tier rewards', color: '#808080' };
  if (tier === 'BLACK') return { label: 'Black tier rewards', color: '#000000' };
  if (tier === 'RED') return { label: 'Red tier rewards', color: '#EB1C24' };
  return { label: membership === 'PREMIUM' ? 'Premium rewards' : 'Standard rewards', color: '#808080' };
}

/** Check if client is subscribed to the email newsletter (profile `notificationNewsletter` + legacy keys). Exported for admin dashboard. */
export function isClientNewsletterSubscribed(u: any): boolean {
  return isNewsletterOptIn(u as Record<string, unknown>);
}

/** Check if client is international (non-USA). Uses defaultAddress/shippingAddress country or parses address string (5 parts = last is country). */
function isClientInternational(u: any): boolean {
  if (!u) return false;
  let country = (u.defaultAddress?.country || u.shippingAddress?.country || '').toString().trim().toUpperCase();
  if (!country && u.address && typeof u.address === 'string') {
    const parts = u.address.split(',').map((s: string) => s.trim());
    if (parts.length >= 5) country = (parts[4] || '').toUpperCase();
  }
  if (!country) return false;
  if (country === 'US' || country === 'USA' || /^UNITED\s*STATES/i.test(country)) return false;
  return true;
}

const PROFILE_SOCIAL_KEYS = ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin'] as const;

/** Check if client has at least one profile social (facebook, instagram, etc.). Socials come from what the client entered at sign-up or added/edited on their account profile settings page. Same condition as client details personal info. When the client is the logged-in user, merges currentUser from localStorage so the latest profile is used. */
function isClientHasSocials(u: any): boolean {
  if (!u) return false;
  let source: any = u;
  try {
    const currentUserRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('currentUser') : null;
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    const uEmail = (u.email || '').toString().trim().toLowerCase();
    const cuEmail = (currentUser?.email || '').toString().trim().toLowerCase();
    if (currentUser && uEmail && uEmail === cuEmail) {
      source = { ...u, ...currentUser };
    }
  } catch {
    /* ignore */
  }
  return PROFILE_SOCIAL_KEYS.some((key) => {
    const val = source[key];
    return val != null && val !== '' && String(val).trim() !== '';
  });
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

/** Processing timeline from order date (e.g. "JANUARY 15TH - FEBRUARY 12TH"). Parses various date formats. */
function calculateProcessingTimeline(orderDateStr: string, processingTime: string): string {
  try {
    let orderDate: Date;
    const parsed = new Date(orderDateStr);
    if (!isNaN(parsed.getTime())) {
      orderDate = parsed;
    } else {
      const parts = (orderDateStr || '').split(/[-\/]/).map(Number);
      const [month, day, year] = parts.length >= 3 ? parts : [1, 1, new Date().getFullYear()];
      orderDate = new Date(year, month - 1, day);
    }
    let minWeeks = 6, maxWeeks = 8;
    if (processingTime && /4/.test(processingTime)) { minWeeks = 4; maxWeeks = 6; }
    else if (processingTime && /10/.test(processingTime)) { minWeeks = 6; maxWeeks = 10; }
    const minDate = new Date(orderDate); minDate.setDate(minDate.getDate() + minWeeks * 7);
    const maxDate = new Date(orderDate); maxDate.setDate(maxDate.getDate() + maxWeeks * 7);
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const getSuffix = (d: number) => { if (d >= 11 && d <= 13) return 'TH'; const n = d % 10; return n === 1 ? 'ST' : n === 2 ? 'ND' : n === 3 ? 'RD' : 'TH'; };
    const minM = monthNames[minDate.getMonth()], maxM = monthNames[maxDate.getMonth()];
    const minD = minDate.getDate(), maxD = maxDate.getDate();
    return minM === maxM ? `${minM} ${minD}${getSuffix(minD)} - ${maxD}${getSuffix(maxD)}` : `${minM} ${minD}${getSuffix(minD)} - ${maxM} ${maxD}${getSuffix(maxD)}`;
  } catch {
    return processingTime || '6-8 WEEKS';
  }
}

/** End date of completion range for "DUE BY APRIL 6TH". Uses same parsing as calculateProcessingTimeline. */
function getDueByEndDate(orderDateStr: string, processingTime: string): string {
  try {
    let orderDate: Date;
    const parsed = new Date(orderDateStr);
    if (!isNaN(parsed.getTime())) {
      orderDate = parsed;
    } else {
      const parts = (orderDateStr || '').split(/[-\/]/).map(Number);
      const [month, day, year] = parts.length >= 3 ? parts : [1, 1, new Date().getFullYear()];
      orderDate = new Date(year, month - 1, day);
    }
    let maxWeeks = 8;
    if (processingTime && /4/.test(processingTime)) maxWeeks = 6;
    else if (processingTime && /10/.test(processingTime)) maxWeeks = 10;
    const maxDate = new Date(orderDate);
    maxDate.setDate(maxDate.getDate() + maxWeeks * 7);
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const getSuffix = (d: number) => { if (d >= 11 && d <= 13) return 'TH'; const n = d % 10; return n === 1 ? 'ST' : n === 2 ? 'ND' : n === 3 ? 'RD' : 'TH'; };
    const d = maxDate.getDate();
    return `${monthNames[maxDate.getMonth()]} ${d}${getSuffix(d)}`;
  } catch {
    return '';
  }
}

/** Format delivered timestamp as "DELIVERED MARCH 15TH, 2026". */
function formatDeliveredOn(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const getSuffix = (n: number) => { if (n >= 11 && n <= 13) return 'TH'; const x = n % 10; return x === 1 ? 'ST' : x === 2 ? 'ND' : x === 3 ? 'RD' : 'TH'; };
    const day = d.getDate();
    return `DELIVERED ${monthNames[d.getMonth()]} ${day}${getSuffix(day)}`;
  } catch {
    return '';
  }
}
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

/** Base price by product (matches build-a-wig and CartDropdown) */
function getProductBasePrice(productName: string): number {
  switch ((productName || '').toUpperCase()) {
    case 'NOIR': return 740;
    case 'BLANCO': return 820;
    case 'SOFT CURL':
    case 'OCEAN CURL': return 780;
    case 'SOFT WAVE':
    case 'BEACH WAVE': return 760;
    default: return 740;
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

/** One client per email (first occurrence wins). Stops duplicate rows from showing in client overview. */
function dedupeClientsByEmail(clients: any[]): any[] {
  const norm = (e: string) => (e || '').trim().toLowerCase();
  const seen = new Set<string>();
  return clients.filter((u: any) => {
    const e = norm(u.email || '');
    if (seen.has(e)) return false;
    seen.add(e);
    return true;
  });
}

/** 20 mock clients for ayoteenz admin only – mix of Standard/Premium, spend, bookings, alerts for testing sort tags. Most names are female to reflect a hair/wig brand client base. Exported for admin dashboard tier counts. */
export function getMockClientsForAyoteenz(): any[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mockRows: Array<{
    id: string; email: string; firstName: string; lastName: string; membershipType: string; createdAt: string;
    totalSpent: number; ordersCount: number; newCount: number; alertCount: number; bookingCount: number;
    birthDay: number; birthMonth: number; birthYear: number; invitesCount: number; status: string;
    reviewsCount: number; photosCount: number; videosCount: number; tagsCount: number;
    totalReviews: number; reviewsWithPhotosVideos: number; pendingReviews: number;
    currentTierName?: string; phone?: string; address?: string;
    facebook?: string; instagram?: string; twitter?: string; tiktok?: string; youtube?: string; linkedin?: string;
    newsletterSubscribed?: boolean;
  }> = [
    /* totalSpent = realistic sums of product prices (NOIR ~740–920, BLANCO ~820, SOFT WAVE ~980, SOFT CURL ~780–1200, multi-unit ~1575–2220) */
    { id: 'mock-1', email: 'mock1@test.com', firstName: 'Zara', lastName: 'Adams', membershipType: 'PREMIUM', createdAt: new Date(now - 2 * day).toISOString(), totalSpent: 4195, ordersCount: 5, newCount: 1, alertCount: 2, bookingCount: 3, birthDay: 15, birthMonth: 3, birthYear: 1989, invitesCount: 4, status: 'ACTIVE', reviewsCount: 3, photosCount: 5, videosCount: 1, tagsCount: 8, totalReviews: 5, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED', phone: '(555) 201-3401', address: '124 OAK ST, LOS ANGELES, CA 90012', facebook: '@ZARAADAMS', instagram: '@ZARAADAMS', newsletterSubscribed: true },
    { id: 'mock-2', email: 'mock2@test.com', firstName: 'Amy', lastName: 'Brooks', membershipType: 'STANDARD', createdAt: new Date(now - 10 * day).toISOString(), totalSpent: 1490, ordersCount: 2, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 3, birthMonth: 7, birthYear: 1992, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 302-4512', address: '89 MAPLE AVE, BROOKLYN, NY 11201', instagram: '@AMYBROOKS' },
    { id: 'mock-3', email: 'mock3@test.com', firstName: 'Quinn', lastName: 'Chen', membershipType: 'PREMIUM', createdAt: new Date(now - 1 * day).toISOString(), totalSpent: 3100, ordersCount: 4, newCount: 2, alertCount: 1, bookingCount: 2, birthDay: 22, birthMonth: 11, birthYear: 1985, invitesCount: 2, status: 'ACTIVE', reviewsCount: 2, photosCount: 4, videosCount: 2, tagsCount: 6, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'BLACK', phone: '(555) 403-5623', address: '256 PINE RD, HOUSTON, TX 77002', tiktok: '@QUINNCHEN', newsletterSubscribed: true },
    { id: 'mock-4', email: 'mock4@test.com', firstName: 'Diana', lastName: 'Foster', membershipType: 'STANDARD', createdAt: new Date(now - 45 * day).toISOString(), totalSpent: 1575, ordersCount: 3, newCount: 0, alertCount: 1, bookingCount: 1, birthDay: 8, birthMonth: 2, birthYear: 1991, invitesCount: 1, status: 'INACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 3, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 504-6734', address: '17 ELM ST, CHICAGO, IL 60601' },
    { id: 'mock-5', email: 'mock5@test.com', firstName: 'Elena', lastName: 'Garcia', membershipType: 'PREMIUM', createdAt: new Date(now - 5 * day).toISOString(), totalSpent: 5820, ordersCount: 8, newCount: 1, alertCount: 3, bookingCount: 4, birthDay: 30, birthMonth: 8, birthYear: 1989, invitesCount: 7, status: 'ACTIVE', reviewsCount: 5, photosCount: 9, videosCount: 3, tagsCount: 12, totalReviews: 8, reviewsWithPhotosVideos: 6, pendingReviews: 2, currentTierName: 'BLACK', phone: '(555) 605-7845', address: '432 CEDAR LN, MIAMI, FL 33101', newsletterSubscribed: true },
    { id: 'mock-6', email: 'mock6@test.com', firstName: 'Fiona', lastName: 'Hayes', membershipType: 'STANDARD', createdAt: new Date(now - 90 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 11, birthMonth: 5, birthYear: 1994, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 706-8956', address: '91 BIRCH WAY, SEATTLE, WA 98101' },
    { id: 'mock-7', email: 'mock7@test.com', firstName: 'Grace', lastName: 'Ingram', membershipType: 'PREMIUM', createdAt: new Date(now - 3 * day).toISOString(), totalSpent: 2100, ordersCount: 3, newCount: 0, alertCount: 0, bookingCount: 2, birthDay: 27, birthMonth: 9, birthYear: 1987, invitesCount: 3, status: 'ACTIVE', reviewsCount: 2, photosCount: 3, videosCount: 1, tagsCount: 4, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED', phone: '(555) 807-9067', address: '203 WILLOW DR, ATLANTA, GA 30301' },
    { id: 'mock-8', email: 'mock8@test.com', firstName: 'Hannah', lastName: 'Jones', membershipType: 'STANDARD', createdAt: new Date(now - 14 * day).toISOString(), totalSpent: 1520, ordersCount: 2, newCount: 1, alertCount: 2, bookingCount: 1, birthDay: 5, birthMonth: 12, birthYear: 1990, invitesCount: 1, status: 'ACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 2, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 1, currentTierName: 'SILVER', phone: '(555) 908-0178', address: '65 CHERRY BLVD, BOSTON, MA 02101', newsletterSubscribed: true },
    { id: 'mock-9', email: 'mock9@test.com', firstName: 'Ivy', lastName: 'Kim', membershipType: 'PREMIUM', createdAt: new Date(now - 7 * day).toISOString(), totalSpent: 6710, ordersCount: 6, newCount: 2, alertCount: 1, bookingCount: 5, birthDay: 19, birthMonth: 4, birthYear: 1986, invitesCount: 5, status: 'INACTIVE', reviewsCount: 4, photosCount: 7, videosCount: 2, tagsCount: 10, totalReviews: 6, reviewsWithPhotosVideos: 5, pendingReviews: 1, currentTierName: 'BLACK', phone: '(555) 109-1289', address: '378 SPRUCE ST, DENVER, CO 80201' },
    { id: 'mock-10', email: 'mock10@test.com', firstName: 'Julia', lastName: 'Lee', membershipType: 'STANDARD', createdAt: new Date(now - 21 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 12, birthMonth: 1, birthYear: 1993, invitesCount: 0, status: 'ACTIVE', reviewsCount: 0, photosCount: 1, videosCount: 0, tagsCount: 1, totalReviews: 1, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 210-2390', address: '52 ASH AVE, PHOENIX, AZ 85001' },
    { id: 'mock-11', email: 'mock11@test.com', firstName: 'Keira', lastName: 'Martinez', membershipType: 'PREMIUM', createdAt: new Date(now - 4 * day).toISOString(), totalSpent: 3900, ordersCount: 5, newCount: 1, alertCount: 2, bookingCount: 3, birthDay: 25, birthMonth: 6, birthYear: 1988, invitesCount: 2, status: 'ACTIVE', reviewsCount: 3, photosCount: 4, videosCount: 1, tagsCount: 7, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED', phone: '(555) 321-3401', address: '419 WALNUT PL, DETROIT, MI 48201', newsletterSubscribed: true },
    { id: 'mock-12', email: 'mock12@test.com', firstName: 'Luna', lastName: 'Nguyen', membershipType: 'STANDARD', createdAt: new Date(now - 60 * day).toISOString(), totalSpent: 2100, ordersCount: 4, newCount: 0, alertCount: 1, bookingCount: 2, birthDay: 7, birthMonth: 10, birthYear: 1995, invitesCount: 4, status: 'INACTIVE', reviewsCount: 2, photosCount: 3, videosCount: 1, tagsCount: 5, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED', phone: '(555) 432-4512', address: '186 HICKORY LN, DALLAS, TX 75201' },
    { id: 'mock-13', email: 'mock13@test.com', firstName: 'Maya', lastName: 'Owen', membershipType: 'PREMIUM', createdAt: new Date(now - 1 * day).toISOString(), totalSpent: 5120, ordersCount: 7, newCount: 3, alertCount: 4, bookingCount: 6, birthDay: 14, birthMonth: 2, birthYear: 1984, invitesCount: 9, status: 'ACTIVE', reviewsCount: 6, photosCount: 10, videosCount: 4, tagsCount: 14, totalReviews: 9, reviewsWithPhotosVideos: 7, pendingReviews: 2, currentTierName: 'BLACK', phone: '(555) 543-5623', address: '721 MAGNOLIA DR, SAN FRANCISCO, CA 94102' },
    { id: 'mock-14', email: 'mock14@test.com', firstName: 'Nina', lastName: 'Patel', membershipType: 'STANDARD', createdAt: new Date(now - 30 * day).toISOString(), totalSpent: 1520, ordersCount: 2, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 20, birthMonth: 8, birthYear: 1991, invitesCount: 0, status: 'ACTIVE', reviewsCount: 1, photosCount: 1, videosCount: 0, tagsCount: 2, totalReviews: 1, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 654-6734', address: '94 DOGWOOD ST, PHILADELPHIA, PA 19101' },
    { id: 'mock-15', email: 'mock15@test.com', firstName: 'Olivia', lastName: 'Quinn', membershipType: 'PREMIUM', createdAt: new Date(now - 6 * day).toISOString(), totalSpent: 4400, ordersCount: 5, newCount: 1, alertCount: 1, bookingCount: 4, birthDay: 9, birthMonth: 11, birthYear: 1989, invitesCount: 3, status: 'INACTIVE', reviewsCount: 3, photosCount: 5, videosCount: 1, tagsCount: 8, totalReviews: 4, reviewsWithPhotosVideos: 3, pendingReviews: 1, currentTierName: 'RED', phone: '(555) 765-7845', address: '553 POPLAR RD, SAN DIEGO, CA 92101' },
    { id: 'mock-16', email: 'mock16@test.com', firstName: 'Paula', lastName: 'Rivera', membershipType: 'STANDARD', createdAt: new Date(now - 120 * day).toISOString(), totalSpent: 3200, ordersCount: 6, newCount: 0, alertCount: 2, bookingCount: 2, birthDay: 28, birthMonth: 7, birthYear: 1983, invitesCount: 2, status: 'ACTIVE', reviewsCount: 2, photosCount: 4, videosCount: 0, tagsCount: 6, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED', phone: '(555) 876-8956', address: '268 SYCAMORE AVE, AUSTIN, TX 78701' },
    { id: 'mock-17', email: 'mock17@test.com', firstName: 'Reese', lastName: 'Scott', membershipType: 'PREMIUM', createdAt: new Date(now - 2 * day).toISOString(), totalSpent: 1900, ordersCount: 3, newCount: 0, alertCount: 0, bookingCount: 1, birthDay: 4, birthMonth: 5, birthYear: 1990, invitesCount: 1, status: 'ACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 3, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 1, currentTierName: 'SILVER', phone: '(555) 987-9067', address: '135 CHESTNUT WAY, PORTLAND, OR 97201' },
    { id: 'mock-18', email: 'mock18@test.com', firstName: 'Sara', lastName: 'Torres', membershipType: 'STANDARD', createdAt: new Date(now - 8 * day).toISOString(), totalSpent: 1100, ordersCount: 2, newCount: 1, alertCount: 3, bookingCount: 1, birthDay: 16, birthMonth: 9, birthYear: 1992, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 098-0178', address: '602 BEECH BLVD, NASHVILLE, TN 37201' },
    { id: 'mock-19', email: 'mock19@test.com', firstName: 'Tessa', lastName: 'Upton', membershipType: 'PREMIUM', createdAt: new Date(now - 12 * day).toISOString(), totalSpent: 7200, ordersCount: 9, newCount: 2, alertCount: 2, bookingCount: 7, birthDay: 23, birthMonth: 12, birthYear: 1987, invitesCount: 6, status: 'ACTIVE', reviewsCount: 5, photosCount: 8, videosCount: 2, tagsCount: 11, totalReviews: 7, reviewsWithPhotosVideos: 6, pendingReviews: 2, currentTierName: 'BLACK', phone: '(555) 109-1289', address: '847 OAK PARK DR, CHARLOTTE, NC 28201' },
    { id: 'mock-20', email: 'mock20@test.com', firstName: 'Uma', lastName: 'Vance', membershipType: 'STANDARD', createdAt: new Date(now - 3 * day).toISOString(), totalSpent: 740, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 1, birthMonth: 4, birthYear: 1996, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '(555) 210-2390', address: '319 LAUREL ST, MINNEAPOLIS, MN 55401' },
    /* Dedicated invites/referral test account – ACTIVE code, 5 invites, easy to find in INVITES tab */
    { id: 'mock-invites', email: 'mock21@test.com', firstName: 'Invites', lastName: 'Demo', membershipType: 'PREMIUM', createdAt: new Date(now - 5 * day).toISOString(), totalSpent: 2200, ordersCount: 3, newCount: 0, alertCount: 0, bookingCount: 1, birthDay: 15, birthMonth: 6, birthYear: 1990, invitesCount: 5, status: 'ACTIVE', reviewsCount: 1, photosCount: 2, videosCount: 0, tagsCount: 3, totalReviews: 1, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'RED', phone: '(555) 555-0100', address: '100 REFERRAL LN, TEST CITY, TC 12345' },
    /* Mock clients from different countries/regions – for address/country display */
    { id: 'mock-22', email: 'mock22@test.com', firstName: 'Yuki', lastName: 'Tanaka', membershipType: 'STANDARD', createdAt: new Date(now - 15 * day).toISOString(), totalSpent: 1480, ordersCount: 2, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 18, birthMonth: 5, birthYear: 1991, invitesCount: 0, status: 'ACTIVE', reviewsCount: 1, photosCount: 1, videosCount: 0, tagsCount: 1, totalReviews: 1, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '+81 3-1234-5678', address: '2-1-1 SHIBUYA, SHIBUYA-KU, TOKYO, 150-0002, JAPAN' },
    { id: 'mock-23', email: 'mock23@test.com', firstName: 'Sienna', lastName: 'Okonkwo', membershipType: 'PREMIUM', createdAt: new Date(now - 8 * day).toISOString(), totalSpent: 2100, ordersCount: 3, newCount: 1, alertCount: 0, bookingCount: 1, birthDay: 7, birthMonth: 11, birthYear: 1988, invitesCount: 2, status: 'ACTIVE', reviewsCount: 2, photosCount: 2, videosCount: 0, tagsCount: 4, totalReviews: 2, reviewsWithPhotosVideos: 1, pendingReviews: 0, currentTierName: 'RED', phone: '+234 1 234 5678', address: '12 ADEMOLA ST, VICTORIA ISLAND, LAGOS, 101001, NIGERIA' },
    { id: 'mock-24', email: 'mock24@test.com', firstName: 'Liam', lastName: 'O\'Brien', membershipType: 'STANDARD', createdAt: new Date(now - 22 * day).toISOString(), totalSpent: 1100, ordersCount: 1, newCount: 0, alertCount: 0, bookingCount: 0, birthDay: 14, birthMonth: 3, birthYear: 1993, invitesCount: 0, status: 'INACTIVE', reviewsCount: 0, photosCount: 0, videosCount: 0, tagsCount: 0, totalReviews: 0, reviewsWithPhotosVideos: 0, pendingReviews: 0, currentTierName: 'SILVER', phone: '+353 1 234 5678', address: '15 GRAFTON ST, DUBLIN 2, DUBLIN, D02 XY45, IRELAND' },
    { id: 'mock-25', email: 'mock25@test.com', firstName: 'Camila', lastName: 'Silva', membershipType: 'PREMIUM', createdAt: new Date(now - 4 * day).toISOString(), totalSpent: 3200, ordersCount: 4, newCount: 0, alertCount: 1, bookingCount: 2, birthDay: 25, birthMonth: 9, birthYear: 1989, invitesCount: 1, status: 'ACTIVE', reviewsCount: 2, photosCount: 3, videosCount: 1, tagsCount: 5, totalReviews: 3, reviewsWithPhotosVideos: 2, pendingReviews: 0, currentTierName: 'RED', phone: '+55 11 2345-6789', address: 'AV PAULISTA 1000, BELA VISTA, SAO PAULO, 01310-100, BRAZIL' },
  ];
  const min = 60 * 1000;
  const MOCK_CARD_BRANDS = ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'DISCOVER'] as const;
  const MOCK_CARD_PREFIXES: Record<string, string> = { VISA: '4', MASTERCARD: '5', AMERICAN_EXPRESS: '3', DISCOVER: '6' };
  return mockRows.map((row, idx) => {
    const isPremium = (row.membershipType || '').toString().toUpperCase() === 'PREMIUM';
    const hasUnread = (row.alertCount ?? 0) > 0;
    const hasOrders = (row.ordersCount ?? 0) > 0;
    const cardBrand = MOCK_CARD_BRANDS[idx % MOCK_CARD_BRANDS.length];
    const prefix = MOCK_CARD_PREFIXES[cardBrand] || '4';
    const last4 = String(1000 + (row.birthDay * 7 + idx) % 9000).slice(-4);
    const midLen = cardBrand === 'AMERICAN_EXPRESS' ? 8 : 10;
    const cardNumber = prefix + '2424242424'.slice(0, midLen) + last4;
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
    // lastNewOrderAt: most recent in-progress order (for Alerts sort when client has new orders but no messages/issues)
    const lastNewOrderAt =
      hasOrders && (row.newCount ?? 0) > 0
        ? new Date(now - (3 - Math.min((row.newCount ?? 1) % 4, 2)) * min).toISOString()
        : undefined;
    const addrStr = (row.address || '').toString().trim();
    const addrParts = addrStr ? addrStr.split(', ').map((s: string) => s.trim()) : [];
    const defaultAddress = addrParts.length >= 3
      ? addrParts.length >= 5
        ? { address: addrParts[0], city: addrParts[1], state: addrParts[2], zip: addrParts[3], country: addrParts[4] }
        : addrParts.length >= 4
        ? { address: addrParts[0], city: addrParts[1], state: addrParts[2], zip: addrParts[3], country: 'US' }
        : {
            address: addrParts[0],
            city: addrParts[1],
            state: (addrParts[2].match(/^[A-Za-z]{2}/) || [addrParts[2]])[0],
            zip: addrParts[2].replace(/^[A-Za-z]{2}\s*/, '').trim() || addrParts[2],
            country: 'US',
          }
      : undefined;
    return {
      ...row,
      defaultAddress,
      referralNumber: buildReferralCode(row.firstName, row.lastName, row.birthDay, row.email),
      lastUnreadPriorityMessageAt,
      lastOrderIssueAt,
      lastNewOrderAt,
      subscriptionDuration: isPremium ? ([3, 6, 12][row.birthDay % 3] as number) : undefined,
      defaultPaymentMethod: { cardBrand, cardNumber },
    };
  });
}

const MOCK_PRODUCTS = ['NOIR', 'BLANCO', 'SOFT WAVE', 'SOFT CURL', 'BEACH WAVE', 'OCEAN CURL'];

/** Add-on price variations (flexible cap +$40, length/density/color, etc.) for realistic order totals */
const MOCK_ADDON_VARIATIONS = [0, 40, 50, 100, 20, 60, 80];

/** Mock orders for mock clients when localStorage has no userOrders data. Uses client's ordersCount, totalSpent, newCount. Prices reflect actual product base prices + add-ons. No order goes below product base price. Exported for admin dashboard mock data consistency. */
export type MockOrderSingle = { id: string; date: string; product: string; amount: number; status: string };
export type MockOrderMulti = { id: string; date: string; status: string; lineItems: Array<{ productName: string; subtotal: number; options?: Record<string, string> }>; total: number };
export type MockOrder = MockOrderSingle | MockOrderMulti;
export function getMockOrdersForClient(client: any): MockOrder[] {
  const email = (client?.email || '').toString().trim().toLowerCase();
  if (email === 'mock13@test.com') {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const statuses = ['AWAITING FORM', 'IN PROGRESS', 'SHIPPED', 'DELIVERED'] as const;
    const products = ['NOIR', 'BLANCO', 'SOFT WAVE', 'SOFT CURL'];
    const amounts = [820, 940, 1100, 780];
    const singleOrders: MockOrderSingle[] = statuses.map((status, i) => {
      const orderDate = new Date(now - (90 - i * 20) * day);
      const dateStr = `${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}-${orderDate.getFullYear()}`;
      return {
        id: `#${String(i + 1).padStart(3, '0')}`,
        date: dateStr,
        product: products[i],
        amount: amounts[i],
        status,
      };
    });
    const multiOrders: MockOrderMulti[] = [
      {
        id: '#005',
        date: (() => { const d = new Date(now - 5 * day); return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`; })(),
        status: 'IN PROGRESS',
        lineItems: [
          { productName: 'NOIR', subtotal: 740, options: { length: '24"' } },
          { productName: 'BLANCO', subtotal: 820, options: { length: '24"' } },
        ],
        total: 1560,
      },
      {
        id: '#006',
        date: (() => { const d = new Date(now - 3 * day); return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`; })(),
        status: 'AWAITING FORM',
        lineItems: [
          { productName: 'NOIR', subtotal: 740, options: { length: '24"' } },
          { productName: 'BLANCO', subtotal: 820, options: { length: '24"' } },
          { productName: 'SOFT WAVE', subtotal: 760, options: { length: '24"' } },
        ],
        total: 2320,
      },
      {
        id: '#007',
        date: (() => { const d = new Date(now - 1 * day); return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`; })(),
        status: 'SHIPPED',
        lineItems: MOCK_PRODUCTS.map((name) => ({
          productName: name,
          subtotal: getProductBasePrice(name),
          options: { length: '24"' } as Record<string, string>,
        })),
        total: MOCK_PRODUCTS.reduce((sum, name) => sum + getProductBasePrice(name), 0),
      },
    ];
    return [...singleOrders, ...multiOrders];
  }
  const count = client?.ordersCount ?? 0;
  const totalSpent = client?.totalSpent ?? 0;
  const newCount = client?.newCount ?? 0;
  if (count <= 0) return [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const basePrices: number[] = [];
  const addons: number[] = [];
  for (let i = 0; i < count; i++) {
    const product = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
    basePrices.push(getProductBasePrice(product));
    addons.push(MOCK_ADDON_VARIATIONS[i % MOCK_ADDON_VARIATIONS.length]);
  }
  const totalBase = basePrices.reduce((a, b) => a + b, 0);
  const totalAddon = addons.reduce((a, b) => a + b, 0);
  const sum = totalBase + totalAddon;
  let diff = totalSpent - sum;
  let amounts: number[];
  if (diff >= 0) {
    const addonShare = totalAddon > 0 ? (i: number) => addons[i] / totalAddon : () => 1 / count;
    amounts = basePrices.map((b, i) => b + addons[i] + Math.round(diff * addonShare(i)));
  } else if (totalAddon > 0) {
    const scale = Math.max(0, (totalAddon + diff) / totalAddon);
    amounts = basePrices.map((b, i) => Math.round(b + addons[i] * scale));
  } else {
    amounts = basePrices.map((b, i) => b + addons[i]);
  }
  for (let i = 0; i < count; i++) {
    amounts[i] = Math.max(basePrices[i], Math.round(amounts[i]));
  }
  const orders: Array<{ id: string; date: string; product: string; amount: number; status: string }> = [];
  const statusProgression = ['AWAITING FORM', 'IN PROGRESS', 'SHIPPED'] as const;
  for (let i = 0; i < count; i++) {
    const isDelivered = i >= newCount;
    const daysAgo = 30 + (count - 1 - i) * 25;
    const orderDate = new Date(now - daysAgo * day);
    const dateStr = `${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}-${orderDate.getFullYear()}`;
    let status: string;
    if (isDelivered) {
      status = 'DELIVERED';
    } else {
      const statusIndex = newCount - 1 - i;
      status = statusIndex <= 2 ? statusProgression[statusIndex] : 'IN PROGRESS';
    }
    orders.push({
      id: `#${String(i + 1).padStart(3, '0')}`,
      date: dateStr,
      product: MOCK_PRODUCTS[i % MOCK_PRODUCTS.length],
      amount: amounts[i],
      status,
    });
  }
  return orders.reverse();
}

const DETAILS_TABS = ['activity', 'orders', 'appointments', 'messages'] as const;
const PERSONAL_SECTION_TABS = ['details', 'cart', 'wishlist'] as const;

/** Supabase Auth user ids are UUIDs; local-only mock rows use strings like mock-1. */
function isSupabaseUserId(id: unknown): id is string {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

const MAYA_OWEN_MOCK_EMAIL = 'mock13@test.com';

/** Mock activity for Maya Owen (mock13@test.com) – all event types for demo. Newest first. */
function getMockActivityForMayaOwen(): Array<{ id: string; eventType: string; payload?: Record<string, unknown>; createdAt: string }> {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const ts = (offsetMs: number) => new Date(now - offsetMs).toISOString();
  return [
    { id: 'mock-act-1', eventType: 'sign_out', payload: {}, createdAt: ts(5 * 60 * 1000) },
    { id: 'mock-act-2', eventType: 'view_page', payload: { page: '/account' }, createdAt: ts(12 * 60 * 1000) },
    { id: 'mock-act-3', eventType: 'profile_update', payload: { field: 'phone' }, createdAt: ts(25 * 60 * 1000) },
    { id: 'mock-act-4', eventType: 'redeem_points', payload: { points: 500, reward: '10% off' }, createdAt: ts(1 * hour) },
    { id: 'mock-act-5', eventType: 'add_review', payload: { productName: 'NOIR', rating: 5 }, createdAt: ts(2 * hour) },
    { id: 'mock-act-6', eventType: 'checkout_complete', payload: { orderId: 'ORD-007', total: 920 }, createdAt: ts(3 * hour) },
    { id: 'mock-act-7', eventType: 'checkout_start', payload: { cartItems: 1 }, createdAt: ts(3 * hour + 15 * 60 * 1000) },
    { id: 'mock-act-8', eventType: 'place_order', payload: { orderId: 'ORD-007', productName: 'BLANCO', total: 920 }, createdAt: ts(4 * hour) },
    { id: 'mock-act-9', eventType: 'remove_from_cart', payload: { productName: 'SOFT CURL' }, createdAt: ts(5 * hour) },
    { id: 'mock-act-10', eventType: 'add_to_cart', payload: { productName: 'BLANCO' }, createdAt: ts(5 * hour + 30 * 60 * 1000) },
    { id: 'mock-act-11', eventType: 'view_product', payload: { productName: 'BLANCO', path: '/straight/blanco' }, createdAt: ts(6 * hour) },
    { id: 'mock-act-12', eventType: 'add_to_wishlist', payload: { productName: 'OCEAN CURL' }, createdAt: ts(8 * hour) },
    { id: 'mock-act-13', eventType: 'remove_from_wishlist', payload: { productName: 'SOFT WAVE' }, createdAt: ts(10 * hour) },
    { id: 'mock-act-14', eventType: 'cancel_order', payload: { orderId: 'ORD-006' }, createdAt: ts(1 * day) },
    { id: 'mock-act-15', eventType: 'view_page', payload: { page: '/admin/dashboard' }, createdAt: ts(1 * day + 2 * hour) },
    { id: 'mock-act-16', eventType: 'view_product', payload: { productName: 'NOIR', path: '/straight/noir' }, createdAt: ts(1 * day + 4 * hour) },
    { id: 'mock-act-17', eventType: 'view_product', payload: { productName: 'SOFT CURL', path: '/curly/soft-curl' }, createdAt: ts(1 * day + 5 * hour) },
    { id: 'mock-act-18', eventType: 'add_to_cart', payload: { productName: 'NOIR' }, createdAt: ts(1 * day + 6 * hour) },
    { id: 'mock-act-19', eventType: 'sign_in', payload: {}, createdAt: ts(1 * day + 8 * hour) },
    { id: 'mock-act-20', eventType: 'view_page', payload: { page: '/' }, createdAt: ts(2 * day) },
    { id: 'mock-act-21', eventType: 'view_page', payload: { page: '/products' }, createdAt: ts(2 * day + 1 * hour) },
    { id: 'mock-act-22', eventType: 'add_to_wishlist', payload: { productName: 'BEACH WAVE' }, createdAt: ts(2 * day + 3 * hour) },
    { id: 'mock-act-23', eventType: 'place_order', payload: { orderId: 'ORD-005', productName: 'NOIR', total: 780 }, createdAt: ts(3 * day) },
    { id: 'mock-act-24', eventType: 'checkout_complete', payload: { orderId: 'ORD-005', total: 780 }, createdAt: ts(3 * day) },
    { id: 'mock-act-25', eventType: 'add_review', payload: { productName: 'BLANCO', rating: 4 }, createdAt: ts(4 * day) },
    { id: 'mock-act-26', eventType: 'profile_update', payload: { field: 'shipping_address' }, createdAt: ts(5 * day) },
    { id: 'mock-act-27', eventType: 'sign_out', payload: {}, createdAt: ts(5 * day + 2 * hour) },
    { id: 'mock-act-28', eventType: 'sign_in', payload: {}, createdAt: ts(6 * day) },
  ];
}

export default function AdminClients() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const globalSearchQuery = (searchParams.get('q') || '').trim();
  const emailFromUrl = searchParams.get('email') || '';
  const returnTo = (searchParams.get('returnTo') || '').trim().toLowerCase();
  const meetingsReturnTab = searchParams.get('meetingsTab') === 'consults' ? 'consults' : 'bookings';
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('Most recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<typeof DETAILS_TABS[number]>('activity');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showCancelOrderConfirm, setShowCancelOrderConfirm] = useState(false);
  const [profilePhotoError, setProfilePhotoError] = useState(false);
  const [showEnlargedProfileImage, setShowEnlargedProfileImage] = useState(false);
  const [rewardsExpand, setRewardsExpand] = useState<'photos' | 'videos' | 'tags' | null>(null);
  const [reviewsExpand, setReviewsExpand] = useState<'total' | 'media' | 'pending' | null>(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerUrls, setMediaViewerUrls] = useState<string[]>([]);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [showInvitesPopup, setShowInvitesPopup] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [adminOrdersByUserId, setAdminOrdersByUserId] = useState<Record<string, { activeOrders: unknown[]; pastOrders: unknown[] }>>({});
  const [adminCartByUserId, setAdminCartByUserId] = useState<Record<string, unknown[]>>({});
  const [adminWishlistByUserId, setAdminWishlistByUserId] = useState<Record<string, unknown[]>>({});
  const [adminActivityByUserId, setAdminActivityByUserId] = useState<Record<string, Array<{ id: string; eventType: string; payload?: unknown; createdAt: string }>>>({});
  const [adminReviewCountsByEmail, setAdminReviewCountsByEmail] = useState<Record<string, { total: number; media: number; pending: number }>>({});
  const [cartWishlistLoading] = useState(false);
  /** Bump when `adminMeetingsScheduled` may change (same browser as admin meetings). */
  const [adminMeetingsTick, setAdminMeetingsTick] = useState(0);
  /** Supabase/API meetings merged into client APPOINTMENTS tab (same source as meetings hub). */
  const [apiMeetingsForClientDetails, setApiMeetingsForClientDetails] = useState<AdminMeeting[]>([]);
  const [clientDetailsConsultPhotoPreviewSrc, setClientDetailsConsultPhotoPreviewSrc] = useState<string | null>(null);
  const [personalSectionTab, setPersonalSectionTab] = useState<typeof PERSONAL_SECTION_TABS[number]>('details');
  const [exportingCsv, setExportingCsv] = useState(false);
  const [adminClientsApiError, setAdminClientsApiError] = useState<'forbidden' | 'service_unavailable' | null>(null);

  /** Overview list is a max-height scroll region; preserve its scrollTop when opening/closing details. */
  const clientsListScrollElRef = useRef<HTMLDivElement | null>(null);
  const clientsListScrollTopRestoreRef = useRef(0);

  const openClientDetails = useCallback((email: string | null | undefined) => {
    const e = (email || '').trim();
    if (!e) return;
    clientsListScrollTopRestoreRef.current = clientsListScrollElRef.current?.scrollTop ?? 0;
    setSelectedClientEmail(e);
  }, []);

  const closeClientDetails = useCallback(() => {
    if (returnTo === 'meetings') {
      navigate(`/admin/meetings?tab=${meetingsReturnTab}`);
      return;
    }
    if (returnTo === 'reviews') {
      navigate('/admin/reviews');
      return;
    }
    setSelectedClientEmail(null);
    setDetailsTab('activity');
    setExpandedOrderId(null);
  }, [navigate, returnTo, meetingsReturnTab]);

  useLayoutEffect(() => {
    if (selectedClientEmail != null) return;
    const el = clientsListScrollElRef.current;
    if (!el) return;
    el.scrollTop = clientsListScrollTopRestoreRef.current;
  }, [selectedClientEmail]);

  // Sync selectedClientEmail from URL (e.g. when redirected from /admin/clients/account?email=...)
  useEffect(() => {
    if (emailFromUrl) setSelectedClientEmail(emailFromUrl);
  }, [emailFromUrl]);
  useEffect(() => {
    if (!selectedClientEmail || registeredUsers.length === 0) return;
    const selectedNorm = selectedClientEmail.trim().toLowerCase();
    const exists = registeredUsers.some((u: any) => ((u?.email || '').toString().trim().toLowerCase() === selectedNorm));
    if (!exists) {
      setSelectedClientEmail(null);
    }
  }, [selectedClientEmail, registeredUsers]);

  // Reset expanded order when switching away from orders tab
  useEffect(() => {
    if (detailsTab !== 'orders') setExpandedOrderId(null);
  }, [detailsTab]);

  // Reset profile photo error when switching clients
  useEffect(() => {
    setProfilePhotoError(false);
    setShowEnlargedProfileImage(false);
  }, [selectedClientEmail]);
  useEffect(() => {
    setRewardsExpand(null);
    setReviewsExpand(null);
  }, [selectedClientEmail]);
  useEffect(() => {
    setShowInvitesPopup(false);
  }, [selectedClientEmail]);
  useEffect(() => {
    setPersonalSectionTab('details');
  }, [selectedClientEmail]);

  /** Viewing your own client row: debounced push local cart/wishlist to Supabase so admin GET tabs match this browser. */
  useEffect(() => {
    const e = (selectedClientEmail || '').trim().toLowerCase();
    if (!e) return;
    try {
      const curRaw = localStorage.getItem('currentUser');
      const cur = curRaw ? JSON.parse(curRaw) : null;
      if ((cur?.email || '').trim().toLowerCase() === e) {
        schedulePushCartWishlistToCloud();
      }
    } catch {
      /* ignore */
    }
  }, [selectedClientEmail]);

  /** Same user on this device: re-emit cart/wishlist snapshots so POST /api/activity can populate server activity (mirrors cart/wishlist nudge). */
  useEffect(() => {
    const e = (selectedClientEmail || '').trim().toLowerCase();
    if (!e) return;
    let cur = '';
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      cur = (u?.email || '').trim().toLowerCase();
    } catch {
      return;
    }
    if (cur !== e) return;
    const t = window.setTimeout(() => {
      try {
        const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const wish = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        const c = Array.isArray(cart) ? cart.length : 0;
        const w = Array.isArray(wish) ? wish.length : 0;
        if (c > 0) trackActivity('cart_snapshot', { itemCount: c, source: 'admin_client_details_self' });
        if (w > 0) trackActivity('wishlist_snapshot', { itemCount: w, source: 'admin_client_details_self' });
      } catch {
        /* ignore */
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [selectedClientEmail]);

  useEffect(() => {
    const bump = () => setAdminMeetingsTick((n) => n + 1);
    window.addEventListener('storage', bump);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener('storage', bump);
      window.removeEventListener('focus', bump);
    };
  }, []);

  /** `/api/admin/meetings` — refetch on focus/storage/sign-in like meetings hub (cohesive with backend). */
  useAdminMeetingsApiRefresh(setApiMeetingsForClientDetails);

  const loadData = useCallback(() => {
    try {
      let reg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (!Array.isArray(reg)) reg = [];
      const beforeDedupe = reg.length;
      reg = dedupeClientsByEmail(reg);
      if (reg.length !== beforeDedupe) {
        localStorage.setItem('registeredUsers', JSON.stringify(reg));
      }
      const currentUserRaw = localStorage.getItem('currentUser');
      const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
      if (currentUser?.email && !reg.some((u: any) => (u.email || '').toLowerCase() === (currentUser.email || '').toLowerCase())) {
        reg = [...reg, currentUser];
        localStorage.setItem('registeredUsers', JSON.stringify(reg));
      }
      // Ayoteenz admin only: merge mock clients so all sort tags can be tested (same email normalization as dashboard)
      const norm = (e: string) => (e || '').trim().toLowerCase();
      if (currentUser && isAyoteenzAdminAccount(currentUser)) {
        const mockClients = getMockClientsForAyoteenz();
        const mockByEmail = new Map(mockClients.map((m: any) => [norm(m.email || ''), m]));
        const existingEmails = new Set((reg || []).map((u: any) => norm(u.email || '')));
        const toAdd = mockClients.filter((m: any) => !existingEmails.has(norm(m.email || '')));
        reg = reg.map((u: any) => {
          const fresh = mockByEmail.get(norm(u.email || ''));
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

      // Admin + Supabase: fetch all clients from API (same source as dashboard so tier counts match)
      if (currentUser && currentUser.email && isAdminEmail(currentUser.email) && isSupabaseConfigured()) {
        getAdminClients()
          .then((result) => {
            const list = Array.isArray(result.clients) ? result.clients : [];
            const apiError = result.error;
            if (apiError) {
              setAdminClientsApiError(apiError);
            } else {
              setAdminClientsApiError(null);
            }
            // API returns ALL clients (profiles + auth users without profile) from Supabase – single source of truth for all browsers
            if (list.length > 0) {
              let fromApi = dedupeClientsByEmail(list as any[]);
              const mockClients = getMockClientsForAyoteenz();
              const mockByEmail = new Map(mockClients.map((m: any) => [norm(m.email || ''), m]));
              const existingEmails = new Set(fromApi.map((u: any) => norm(u.email || '')));
              const toAdd = mockClients.filter((m: any) => !existingEmails.has(norm(m.email || '')));
              fromApi = fromApi.map((u: any) => {
                const fresh = mockByEmail.get(norm(u.email || ''));
                return fresh ? { ...u, ...fresh } : u;
              });
              if (toAdd.length > 0) fromApi = [...fromApi, ...toAdd];
              fromApi = fromApi.filter((u: any) => !isClientBlocked(u));
              setRegisteredUsers(fromApi);
            } else {
              // API returned empty: still show local registeredUsers (e.g. new accounts) plus mock for ayoteenz
              let fallback = list as any[];
              try {
                const localReg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                fallback = dedupeClientsByEmail(Array.isArray(localReg) ? localReg : []);
                if (currentUser && isAyoteenzAdminAccount(currentUser)) {
                  const mockClients = getMockClientsForAyoteenz();
                  const mockByEmail = new Map(mockClients.map((m: any) => [norm(m.email || ''), m]));
                  const existingFallback = new Set(fallback.map((u: any) => norm(u.email || '')));
                  const toAddMock = mockClients.filter((m: any) => !existingFallback.has(norm(m.email || '')));
                  fallback = fallback.map((u: any) => {
                    const fresh = mockByEmail.get(norm(u.email || ''));
                    return fresh ? { ...u, ...fresh } : u;
                  });
                  if (toAddMock.length > 0) fallback = [...fallback, ...toAddMock];
                }
              } catch (_) {}
              setRegisteredUsers(fallback.filter((u: any) => !isClientBlocked(u)));
            }
          })
          .catch(() => {
            setAdminClientsApiError(null);
            if (currentUser && isAyoteenzAdminAccount(currentUser)) {
              try {
                const localReg = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const fallback = dedupeClientsByEmail(Array.isArray(localReg) ? localReg : []);
                const mockClients = getMockClientsForAyoteenz();
                const existingFallback = new Set(fallback.map((u: any) => norm(u.email || '')));
                const toAddMock = mockClients.filter((m: any) => !existingFallback.has(norm(m.email || '')));
                setRegisteredUsers([...fallback, ...toAddMock].filter((u: any) => !isClientBlocked(u)));
              } catch (_) {
                setRegisteredUsers(getMockClientsForAyoteenz().filter((u: any) => !isClientBlocked(u)));
              }
            }
          });
      }
    } catch {
      setRegisteredUsers([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (globalSearchQuery) setClientSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  useEffect(() => {
    const onStorage = () => loadData();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onStorage);
    };
  }, [loadData]);

  // When selected client has Supabase id, fetch their orders/cart/wishlist from API
  const selectedClientForOrders = registeredUsers.find(
    (u: any) => (u.email || '').toLowerCase() === (selectedClientEmail || '').trim().toLowerCase()
  );
  useEffect(() => {
    const id = selectedClientForOrders?.id as string | undefined;
    if (!id || !isSupabaseUserId(id) || adminOrdersByUserId[id]) return;
    getAdminOrders(id)
      .then((data) => setAdminOrdersByUserId((prev) => ({ ...prev, [id]: data })))
      .catch(() => {});
  }, [selectedClientForOrders?.id]);
  useEffect(() => {
    const id = selectedClientForOrders?.id as string | undefined;
    if (!id || !isSupabaseUserId(id) || adminCartByUserId[id] !== undefined) return;
    getAdminCart(id)
      .then((data) => setAdminCartByUserId((prev) => ({ ...prev, [id]: data.items || [] })))
      .catch(() => setAdminCartByUserId((prev) => ({ ...prev, [id as string]: [] })));
  }, [selectedClientForOrders?.id]);
  useEffect(() => {
    const id = selectedClientForOrders?.id as string | undefined;
    if (!id || !isSupabaseUserId(id) || adminWishlistByUserId[id] !== undefined) return;
    getAdminWishlist(id)
      .then((data) => setAdminWishlistByUserId((prev) => ({ ...prev, [id]: data.items || [] })))
      .catch(() => setAdminWishlistByUserId((prev) => ({ ...prev, [id as string]: [] })));
  }, [selectedClientForOrders?.id]);
  useEffect(() => {
    const id = selectedClientForOrders?.id as string | undefined;
    if (!id || !isSupabaseUserId(id) || adminActivityByUserId[id] !== undefined) return;
    getAdminActivity(id)
      .then((list) => setAdminActivityByUserId((prev) => ({ ...prev, [id]: list })))
      .catch(() => setAdminActivityByUserId((prev) => ({ ...prev, [id as string]: [] })));
  }, [selectedClientForOrders?.id]);

  // Server-backed review metrics by email (cross-browser/device consistency).
  useEffect(() => {
    getAdminReviews()
      .then((data) => {
        const rows = Array.isArray(data?.reviews) ? data.reviews : [];
        const next: Record<string, { total: number; media: number; pending: number }> = {};
        for (const r of rows as Array<Record<string, unknown>>) {
          const email = (r.email || '').toString().trim().toLowerCase();
          if (!email) continue;
          if (!next[email]) next[email] = { total: 0, media: 0, pending: 0 };
          next[email].total += 1;
          const photoN = Array.isArray(r.photos) ? r.photos.length : Number(r.photos) || 0;
          const videoN = Number(r.videos) || 0;
          if (photoN > 0 || videoN > 0) next[email].media += 1;
          const status = (r.status || '').toString().trim().toLowerCase();
          if (status === 'pending') next[email].pending += 1;
        }
        setAdminReviewCountsByEmail(next);
      })
      .catch(() => {});
  }, []);

  // Selected client, order history (simplified), and raw orders (full objects for expand view)
  const { selectedClient, selectedOrderHistory, selectedRawOrders } = (() => {
    const email = (selectedClientEmail || '').trim().toLowerCase();
    if (!email) return { selectedClient: null, selectedOrderHistory: [], selectedRawOrders: [] };
    let found = registeredUsers.find((u: any) => (u.email || '').toLowerCase() === email);
    if (found) {
      try {
        const currentUserRaw = localStorage.getItem('currentUser');
        const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
        const cuEmail = (currentUser?.email || '').toString().trim().toLowerCase();
        if (currentUser && email === cuEmail) {
          const preservedId = found?.id;
          found = { ...found, ...currentUser };
          if (isSupabaseUserId(preservedId)) {
            (found as { id?: string }).id = preservedId;
          }
        }
      } catch {
        /* ignore */
      }
    }
    let orderHistory: any[] = [];
    let rawOrders: any[] = [];
    // Use orders from Supabase when this client has id and we fetched admin orders
    const adminOrders = found?.id ? adminOrdersByUserId[found.id as string] : null;
    if (adminOrders && (adminOrders.activeOrders.length > 0 || adminOrders.pastOrders.length > 0)) {
      rawOrders = [...adminOrders.activeOrders, ...adminOrders.pastOrders].map((o: any, idx: number) => ({
        ...o,
        id: o.id || `order-${idx}`,
      }));
      const orderSortTime = (o: any) => {
        const t = o.updatedAt ?? o.updated_at ?? o.date ?? o.createdAt ?? o.placedAt;
        if (!t) return 0;
        try {
          return new Date(t).getTime();
        } catch {
          return 0;
        }
      };
      rawOrders.sort((a: any, b: any) => orderSortTime(b) - orderSortTime(a));
      orderHistory = rawOrders.map((o: any) => ({
        id: o.id,
        date: o.date || o.createdAt || '—',
        product: o.items?.[0]?.name || o.productName || 'Order',
        amount: Number(o.total) || 0,
        status: (o.status || 'COMPLETED').toUpperCase(),
      }));
    } else {
    try {
      const raw = localStorage.getItem(`userOrders_${email}`);
      const data = raw ? JSON.parse(raw) : null;
      const active = data?.activeOrders || [];
      const past = data?.pastOrders || [];
      if (active.length > 0 || past.length > 0) {
        rawOrders = [...active, ...past].map((o: any, idx: number) => ({ ...o, id: o.id || `order-${idx}` }));
        const orderSortTime = (o: any) => {
          const t = o.updatedAt ?? o.updated_at ?? o.date ?? o.createdAt ?? o.placedAt;
          if (!t) return 0;
          try { return new Date(t).getTime(); } catch { return 0; }
        };
        rawOrders.sort((a: any, b: any) => orderSortTime(b) - orderSortTime(a));
        orderHistory = rawOrders.map((o: any) => ({
          id: o.id,
          date: o.date || o.createdAt || '—',
          product: o.items?.[0]?.name || o.productName || 'Order',
          amount: Number(o.total) || 0,
          status: (o.status || 'COMPLETED').toUpperCase(),
        }));
      } else if (found && /^mock\d+@test\.com$/i.test(email)) {
        const mockList = getMockOrdersForClient(found);
        orderHistory = mockList.map((m: any) => ({
          id: m.id,
          date: m.date,
          product: m.lineItems?.[0]?.productName ?? m.product,
          amount: m.total ?? m.amount,
          status: m.status,
        }));
        rawOrders = mockList.map((m: any, i: number) => {
          const pm = found?.defaultPaymentMethod;
          const brand = (pm?.cardBrand || 'VISA').toString().replace(/_/g, ' ');
          const last4 = pm?.cardNumber ? String(pm.cardNumber).replace(/\D/g, '').slice(-4) : String(1000 + i).slice(-4);
          const isDelivered = (m.status || '').toUpperCase() === 'DELIVERED' || (m.status || '').toUpperCase() === 'SHIPPED';
          const trackingNum = isDelivered ? `9405${String(5011899223 + (found?.birthDay ?? 1) * 1000 + i).padStart(10, '0')}${String(19784123 + i).padStart(8, '0')}` : undefined;
          const hasLineItems = m.lineItems && Array.isArray(m.lineItems) && m.lineItems.length > 0;
          const lineItems = hasLineItems ? m.lineItems.map((line: any) => ({ productName: line.productName, subtotal: line.subtotal ?? line.amount, options: line.options ?? { length: '24"' } })) : [{ productName: m.product, subtotal: m.amount, options: { length: '24"' } }];
          const total = hasLineItems ? (m.total ?? lineItems.reduce((s: number, l: any) => s + (l.subtotal ?? 0), 0)) : m.amount;
          const base: Record<string, any> = {
            id: m.id,
            orderNumber: `ORDER #${m.id.replace(/^#/, '')}`,
            date: m.date,
            status: m.status,
            productName: lineItems[0]?.productName ?? m.product,
            productImage: getProductImage(lineItems[0]?.productName ?? m.product),
            total,
            items: lineItems.length,
            lineItems,
            processingTime: '6-8 WEEKS',
            trackingNumber: trackingNum,
            trackingCarrier: 'USPS',
            confirmationNumber: `X${String(i + 1).padStart(1)}R${m.id.replace(/\D/g, '').slice(-2)}S${String(i + 1)}`,
            pointsEarned: Math.round(total),
            tier: found?.currentTierName || getEffectiveTierName(found) || 'SILVER',
            paymentMethod: `${brand} ENDING IN ${last4}`,
          };
          if (isDelivered) {
            const orderDate = m.date ? new Date(m.date) : new Date();
            base.deliveredAt = !isNaN(orderDate.getTime()) ? orderDate.getTime() : Date.now();
          }
          if (i % 4 === 0) base.discountCode = ['WELCOME10', 'WIG20', 'PREMIUM15', 'NEWYEAR25'][Math.floor(i / 4) % 4];
          if (i % 4 === 1) base.giftCard = `GC-${String(4000 + i).padStart(4, '0')}-${String(1000 + i * 37).slice(-4)}`;
          if (i % 4 === 3) {
            base.discountCode = 'VIP20';
            base.giftCard = `GC-${String(5000 + i).padStart(4, '0')}-${String(2000 + i * 11).slice(-4)}`;
          }
          if (base.discountCode || base.giftCard) {
            let s = 0;
            if (base.discountCode) s += Math.round(total * 0.12);
            if (base.giftCard) s += 50;
            base.savings = s;
            base.subtotal = total + s;
          }
          return base;
        });
        const orderSortTime = (o: any) => {
          const t = o.updatedAt ?? o.updated_at ?? o.date ?? o.createdAt ?? o.placedAt;
          if (!t) return 0;
          try { return new Date(t).getTime(); } catch { return 0; }
        };
        rawOrders.sort((a: any, b: any) => orderSortTime(b) - orderSortTime(a));
      }
    } catch {
      // ignore
    }
    }
    return { selectedClient: found || null, selectedOrderHistory: orderHistory, selectedRawOrders: rawOrders };
  })();

  /** Lifetime loyalty points from orders (pointsEarned or rounded subtotal/total per order); else profile loyaltyPoints. */
  const selectedTotalLoyaltyPointsEarned = (() => {
    if (!selectedClient) return 0;
    let sum = 0;
    for (const o of selectedRawOrders) {
      const ord = o as Record<string, unknown>;
      const pe = ord.pointsEarned;
      if (typeof pe === 'number' && !Number.isNaN(pe)) {
        sum += pe;
        continue;
      }
      const sub = ord.subtotal != null ? Number(ord.subtotal) : Number(ord.total);
      if (typeof sub === 'number' && !Number.isNaN(sub)) sum += Math.round(sub);
    }
    if (sum > 0) return sum;
    const lp = Number((selectedClient as { loyaltyPoints?: number }).loyaltyPoints);
    if (!Number.isNaN(lp) && lp > 0) return Math.round(lp);
    return 0;
  })();

  const selectedClientProfilePhotoSrc = selectedClient
    ? String(
        (selectedClient as any).profileImage ||
          (selectedClient as any).photo ||
          (selectedClient as any).profilePhoto ||
          (selectedClient as any).avatar ||
          '/assets/profile-thumb.png',
      )
    : '';
  const selectedMembershipType = (selectedClient?.membershipType || 'STANDARD').toUpperCase();
  const selectedTotalOrders = selectedOrderHistory.length;
  const selectedTotalSpent = selectedOrderHistory.reduce((s: number, o: any) => s + (o.amount || 0), 0);
  const selectedJoinDate = selectedClient?.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';

  /**
   * Bookings + consults for this client (same merged source as /admin/meetings: mock + API + localStorage drafts).
   * Consult rows appear here under APPOINTMENTS so client details match the meetings hub per client.
   */
  const appointments = useMemo(() => {
    const email = (selectedClientEmail || '').trim().toLowerCase();
    if (!email || !selectedClient) return [];
    return listAggregatedAdminMeetingsForClientDetails(apiMeetingsForClientDetails)
      .filter((m) => String(m.clientEmail || '').trim().toLowerCase() === email)
      .sort(compareAdminMeetingsNewestFirst);
  }, [selectedClient, selectedClientEmail, adminMeetingsTick, apiMeetingsForClientDetails]);

  // NEW / ORDERS / CHARGES: NEW = unfulfilled orders (not shipped, delivered, or fulfilled yet) — see isOrderUnfulfilled
  const getClientRow = (u: any, index: number) => {
    const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '—').toUpperCase();
    let newCount: number | null = null;
    let ordersCount: number | null = null;
    let charges: number | null = null;
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
          ordersCount = nonCanceled.length;
          charges = nonCanceled.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
          newCount = all.filter((o: any) => isOrderUnfulfilled(o as Record<string, unknown>)).length;
        } else if (/^mock\d+@test\.com$/i.test(email)) {
          const mockOrders = getMockOrdersForClient(u);
          ordersCount = mockOrders.length;
          newCount = mockOrders.filter((o: any) => isOrderUnfulfilled(o as Record<string, unknown>)).length;
          charges = mockOrders.reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);
        }
      }
    } catch {
      // ignore
    }
    return {
      index: index + 1,
      name,
      newCount: newCount ?? u.newCount ?? 0,
      ordersCount: ordersCount ?? u.ordersCount ?? 0,
      charges: charges ?? u.totalSpent ?? 0,
    };
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

        // STATUS = referral code active if user has completed a purchase (at least one DELIVERED or SHIPPED order)
        const ordersRaw = localStorage.getItem(`userOrders_${email}`);
        const ordersData = ordersRaw ? JSON.parse(ordersRaw) : null;
        const allOrders = [...(ordersData?.activeOrders || []), ...(ordersData?.pastOrders || [])];
        let hasDelivered: boolean;
        if (allOrders.length > 0) {
          hasDelivered = allOrders.some((o: any) => (o.status || '').toUpperCase() === 'DELIVERED' || (o.status || '').toUpperCase() === 'SHIPPED' || !!o.deliveredAt);
        } else if (/^mock\d+@test\.com$/i.test(email)) {
          const mockOrders = getMockOrdersForClient(u);
          hasDelivered = mockOrders.some((o: any) => (o.status || '').toUpperCase() === 'DELIVERED' || (o.status || '').toUpperCase() === 'SHIPPED');
        } else {
          hasDelivered = (u.totalSpent ?? 0) > 0;
        }
        status = hasDelivered ? 'ACTIVE' : 'INACTIVE';

        // INVITES = count of people who used this user's referral code to make a purchase (referralEarnings with status confirmed)
        const earningsRaw = localStorage.getItem('referralEarnings');
        const earnings = earningsRaw ? JSON.parse(earningsRaw) : [];
        invitesCount = Array.isArray(earnings)
          ? earnings.filter((e: any) => (e.referrerEmail || '').trim().toLowerCase() === email && (e.status || '').toLowerCase() === 'confirmed').length
          : (u.invitesCount ?? 0);
        // Mock users: use their mock invitesCount when no referralEarnings entries exist (so INVITES tab is testable)
        if (/^mock\d+@test\.com$/i.test(email) && invitesCount === 0 && (u.invitesCount ?? 0) > 0) {
          invitesCount = u.invitesCount ?? 0;
        }
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
  const { selectedReferralStatus, selectedReferralCode, selectedInvitesCount } = selectedClient
    ? (() => { const r = getInvitesRow(selectedClient, 0); return { selectedReferralStatus: r.status, selectedReferralCode: r.referralNumber, selectedInvitesCount: r.invitesCount }; })()
    : { selectedReferralStatus: 'INACTIVE', selectedReferralCode: '—', selectedInvitesCount: 0 };

  // Invites popup: rows = people who used this client's referral code (date used, user name, that user's invite count, that user's spent)
  const invitesDetailRows = (() => {
    const email = (selectedClientEmail || '').trim().toLowerCase();
    if (!email || !selectedClient) return [];
    try {
      const earningsRaw = localStorage.getItem('referralEarnings');
      const earnings = earningsRaw ? JSON.parse(earningsRaw) : [];
      const confirmed = Array.isArray(earnings)
        ? earnings.filter((e: any) => (e.referrerEmail || '').trim().toLowerCase() === email && (e.status || '').toLowerCase() === 'confirmed')
        : [];
      const rows: Array<{ dateUsed: string; userName: string; inviteCount: number; spent: number }> = [];
      for (const e of confirmed) {
        const referredEmail = (e.referredEmail || e.inviteeEmail || e.email || '').trim().toLowerCase();
        const usedAt = e.usedAt ?? e.used_at ?? e.date ?? e.createdAt ?? e.confirmedAt;
        const dateStr = usedAt ? (() => { try { return new Date(usedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }); } catch { return '—'; } })() : '—';
        const referredUser = referredEmail ? registeredUsers.find((u: any) => (u.email || '').toLowerCase() === referredEmail) : null;
        const name = referredUser ? ([(referredUser.firstName || '').trim(), (referredUser.lastName || '').trim()].filter(Boolean).join(' ') || referredUser.email || '—').toUpperCase() : (referredEmail || '—').toUpperCase();
        const inviteCount = referredUser ? getInvitesRow(referredUser, 0).invitesCount : 0;
        const spent = referredUser ? getClientRow(referredUser, 0).charges : 0;
        rows.push({ dateUsed: dateStr, userName: name, inviteCount, spent });
      }
      // Mock users: if no referralEarnings entries but client has invitesCount, show mock rows so popup is testable
      if (rows.length === 0 && selectedInvitesCount > 0 && /^mock\d+@test\.com$/i.test(email)) {
        const mockNames = ['ALEX BROWN', 'JORDAN LEE', 'SAM WILSON', 'RILEY MARTINEZ', 'JAMIE GARCIA'];
        const mockSpent = [740, 1520, 2100, 890, 3200];
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        for (let i = 0; i < Math.min(selectedInvitesCount, 5); i++) {
          const d = new Date(now - (30 + i * 14) * day);
          rows.push({
            dateUsed: d.toLocaleDateString(undefined, { dateStyle: 'medium' }),
            userName: mockNames[i % mockNames.length],
            inviteCount: i % 3,
            spent: mockSpent[i % mockSpent.length],
          });
        }
      }
      return rows;
    } catch {
      return [];
    }
  })();

  const selectedTierDisplay = selectedClient ? getTierDisplayLabelAndColor(selectedClient) : { label: '—', color: '#808080' };
  const selectedMembershipDuration = selectedClient && (selectedClient as any).membershipType?.toString().toUpperCase() === 'PREMIUM'
    ? (() => {
        const c = selectedClient as any;
        const raw = c.subscriptionDuration ?? c.membershipDuration ?? c.subscriptionMonths;
        if (raw != null) {
          const n = typeof raw === 'number' ? raw : parseInt(String(raw).replace(/\D/g, ''), 10);
          if (n === 3) return '3 MONTHS';
          if (n === 6) return '6 MONTHS';
          if (n === 12) return '12 MONTHS';
        }
        const unlocked = c.unlockedDiscounts as string[] | undefined;
        if (Array.isArray(unlocked)) {
          if (unlocked.some((d: string) => /12month/i.test(d))) return '12 MONTHS';
          if (unlocked.some((d: string) => /6month/i.test(d))) return '6 MONTHS';
          if (unlocked.some((d: string) => /3month/i.test(d))) return '3 MONTHS';
        }
        return null;
      })()
    : null;
  const selectedBirthday = (() => {
    if (!selectedClient) return '—';
    const email = ((selectedClient as any).email || '').toString().trim().toLowerCase();
    const hasBirthday = (obj: any) =>
      !!(
        obj &&
        (
          (typeof obj.birthday === 'string' && obj.birthday.trim()) ||
          (typeof obj.birthDate === 'string' && obj.birthDate.trim()) ||
          (obj.birthMonth != null && obj.birthDay != null)
        )
      );
    if (hasBirthday(selectedClient)) return formatBirthday(selectedClient);
    try {
      const currentRaw = localStorage.getItem('currentUser');
      const current = currentRaw ? JSON.parse(currentRaw) : null;
      const currentEmail = (current?.email || '').toString().trim().toLowerCase();
      if (email && current && currentEmail === email && hasBirthday(current)) {
        return formatBirthday(current);
      }
    } catch {
      // ignore
    }
    const fallback = registeredUsers.find((u: any) => ((u?.email || '').toString().trim().toLowerCase() === email));
    if (fallback && hasBirthday(fallback)) return formatBirthday(fallback);
    return formatBirthday(selectedClient);
  })();
  const selectedPrimaryAddress = selectedClient
    ? (() => {
        const c = selectedClient as any;
        const primary = c.defaultAddress || c.shippingAddress;
        if (primary && typeof primary === 'object' && (primary.address || primary.city)) {
          const parts = [
            primary.address,
            [primary.city, [primary.state, primary.zip].filter(Boolean).join(' ')].filter(Boolean).join(', '),
            formatCountryDisplay(primary.country),
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

  /** Get affiliate-submitted photos/videos/socials for client details expand view. For mock clients with a count but no localStorage data, returns mock content so the panel matches the count. Socials = platform + link (like account/affiliate page). */
  const getAffiliateMediaForClient = (u: any): { photos: string[]; videos: string[]; socials: Array<{ platform: string; link: string }> } => {
    const toList = (raw: string | null): string[] => {
      if (raw == null) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((x: any) => (typeof x === 'string' ? x : x?.url ?? x?.src ?? x?.tag ?? String(x))).filter(Boolean);
      } catch {
        return [];
      }
    };
    const toSocialsList = (raw: string | null): Array<{ platform: string; link: string }> => {
      if (raw == null) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((x: any) => ({
          platform: typeof x?.platform === 'string' ? x.platform : (x?.network ?? 'LINK'),
          link: typeof x?.link === 'string' ? x.link : (x?.url ?? String(x ?? '')),
        })).filter((s: { platform: string; link: string }) => s.platform && s.link);
      } catch {
        return [];
      }
    };
    const email = (u?.email || '').trim().toLowerCase();
    if (!email) return { photos: [], videos: [], socials: [] };
    const photos = toList(localStorage.getItem(`userAffiliatePhotos_${email}`));
    const videos = toList(localStorage.getItem(`userAffiliateVideos_${email}`));
    const socials = toSocialsList(localStorage.getItem(`userAffiliateSocials_${email}`));
    const isMock = /^mock\d+@test\.com$/i.test(email);
    const photosCount = u?.photosCount ?? 0;
    const videosCount = u?.videosCount ?? 0;
    const tagsCount = u?.tagsCount ?? 0;
    const MOCK_PHOTO_PLACEHOLDERS = ['/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png'];
    const MOCK_VIDEO_PLACEHOLDERS = ['/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png'];
    const MOCK_SOCIALS: Array<{ platform: string; link: string }> = [
      { platform: 'Instagram', link: 'https://instagram.com/ayoteenz' },
      { platform: 'TikTok', link: 'https://tiktok.com/@ayoteenz' },
      { platform: 'YouTube', link: 'https://youtube.com/@ayoteenz' },
      { platform: 'Twitter', link: 'https://x.com/ayoteenz' },
      { platform: 'Facebook', link: 'https://facebook.com/ayoteenz' },
    ];
    return {
      photos: isMock && photos.length === 0 && photosCount > 0 ? MOCK_PHOTO_PLACEHOLDERS.slice(0, Math.min(photosCount, MOCK_PHOTO_PLACEHOLDERS.length)) : photos,
      videos: isMock && videos.length === 0 && videosCount > 0 ? MOCK_VIDEO_PLACEHOLDERS.slice(0, Math.min(videosCount, MOCK_VIDEO_PLACEHOLDERS.length)) : videos,
      socials: isMock && socials.length === 0 && tagsCount > 0 ? MOCK_SOCIALS.slice(0, Math.min(tagsCount, MOCK_SOCIALS.length)) : socials,
    };
  };

  /** Shared frame style for affiliate photos/videos – white border + black outline, sized so 3 fit per row (same mock asset as account/affiliate page). */
  const affiliateFrameStyle = {
    position: 'relative' as const,
    padding: '1px',
    border: '3px solid white',
    boxShadow: '0 0 0 1.1px black',
    boxSizing: 'border-box' as const,
    width: '88px',
    height: '88px',
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden' as const,
  };

  // REVIEWS tab: total submitted reviews, reviews with photos/videos, pending (waiting approval)
  const getReviewsTabRow = (u: any, index: number) => {
    const name = ([(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || u.email || '—').toUpperCase();
    let totalReviews = u.totalReviews;
    let reviewsWithPhotosVideos = u.reviewsWithPhotosVideos;
    let pendingReviews = u.pendingReviews;
    const email = (u?.email || '').toString().trim().toLowerCase();
    const serverCounts = email ? adminReviewCountsByEmail[email] : null;
    if (serverCounts) {
      totalReviews = serverCounts.total;
      reviewsWithPhotosVideos = serverCounts.media;
      pendingReviews = serverCounts.pending;
    }
    if ((totalReviews == null || reviewsWithPhotosVideos == null || pendingReviews == null) && !serverCounts) {
      try {
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

  /** Affiliate tab submissions only: userAffiliatePhotos/Videos/Tags (not profile mock/API counts unless mock@test demo row). */
  const countAffiliateSubmitted = (u: any, kind: 'photos' | 'videos' | 'tags'): number => {
    const email = (u?.email || '').toString().trim().toLowerCase();
    if (!email) return 0;
    const storageKey =
      kind === 'photos'
        ? `userAffiliatePhotos_${email}`
        : kind === 'videos'
          ? `userAffiliateVideos_${email}`
          : `userAffiliateTags_${email}`;
    let n = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw != null && raw !== '') {
        try {
          const parsed = JSON.parse(raw);
          n = Array.isArray(parsed) ? parsed.length : Number(raw) || 0;
        } catch {
          n = Number(raw) || 0;
        }
      }
    } catch {
      /* ignore */
    }
    if (n > 0) return n;
    if (/^mock\d+@test\.com$/i.test(email)) {
      if (kind === 'photos') return Number(u?.photosCount) || 0;
      if (kind === 'videos') return Number(u?.videosCount) || 0;
      return Number(u?.tagsCount) || 0;
    }
    return 0;
  };

  /** Reviews left via Account → Reviews (`userSubmittedReviews_*`), not affiliate gallery. Mock@test uses totalReviews for demo. */
  const countAccountSubmittedReviews = (u: any): number => {
    const email = (u?.email || '').toString().trim().toLowerCase();
    if (!email) return 0;
    const server = adminReviewCountsByEmail[email];
    if (server) return server.total;
    try {
      const raw = localStorage.getItem(`userSubmittedReviews_${email}`);
      if (raw) {
        const data = JSON.parse(raw);
        const list = Array.isArray(data) ? data : (data?.reviews || []);
        if (Array.isArray(list) && list.length > 0) return list.length;
      }
    } catch {
      /* ignore */
    }
    if (/^mock\d+@test\.com$/i.test(email) && u?.totalReviews != null) return Number(u.totalReviews) || 0;
    return 0;
  };

  // Sort/filter clients based on sortOption
  const sortedClients = (() => {
    let list = [...registeredUsers];
    const membership = (u: any) => ((u.membershipType || 'STANDARD') + '').toUpperCase();
    if (sortOption === 'Standard') {
      list = list.filter((u) => membership(u) === 'STANDARD');
    } else if (sortOption === 'Premium') {
      list = list.filter((u) => membership(u) === 'PREMIUM');
    } else if (sortOption === 'Silver') {
      list = list.filter((u) => (getEffectiveTierName(u) || '').toUpperCase() === 'SILVER');
    } else if (sortOption === 'Red') {
      list = list.filter((u) => (getEffectiveTierName(u) || '').toUpperCase() === 'RED');
    } else if (sortOption === 'Black') {
      list = list.filter((u) => (getEffectiveTierName(u) || '').toUpperCase() === 'BLACK');
    }
    const name = (u: any) => [(u.firstName || '').trim(), (u.lastName || '').trim()].filter(Boolean).join(' ') || (u.email || '');
    const charges = (u: any) => getClientRow(u, 0).charges;
    const created = (u: any) => (u.createdAt ? new Date(u.createdAt).getTime() : 0);
    if (sortOption === 'A to Z') {
      list.sort((a, b) => name(a).localeCompare(name(b), undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'Z to A') {
      list.sort((a, b) => name(b).localeCompare(name(a), undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'Most spent') {
      list.sort((a, b) => charges(b) - charges(a));
    } else if (sortOption === 'Least spent') {
      list.sort((a, b) => charges(a) - charges(b));
    } else if (sortOption === 'International') {
      list = list.filter((u) => isClientInternational(u));
      list.sort((a, b) => created(b) - created(a));
    } else if (sortOption === 'Socials') {
      list = list.filter((u) => isClientHasSocials(u));
      list.sort((a, b) => created(b) - created(a));
    } else if (sortOption === 'Photos') {
      list = list.filter((u) => countAffiliateSubmitted(u, 'photos') > 0);
      list.sort((a, b) => {
        const diff = countAffiliateSubmitted(b, 'photos') - countAffiliateSubmitted(a, 'photos');
        return diff !== 0 ? diff : created(b) - created(a);
      });
    } else if (sortOption === 'Videos') {
      list = list.filter((u) => countAffiliateSubmitted(u, 'videos') > 0);
      list.sort((a, b) => {
        const diff = countAffiliateSubmitted(b, 'videos') - countAffiliateSubmitted(a, 'videos');
        return diff !== 0 ? diff : created(b) - created(a);
      });
    } else if (sortOption === 'Tags') {
      list = list.filter((u) => countAffiliateSubmitted(u, 'tags') > 0);
      list.sort((a, b) => {
        const diff = countAffiliateSubmitted(b, 'tags') - countAffiliateSubmitted(a, 'tags');
        return diff !== 0 ? diff : created(b) - created(a);
      });
    } else if (sortOption === 'Reviews') {
      list = list.filter((u) => countAccountSubmittedReviews(u) > 0);
      list.sort((a, b) => {
        const diff = countAccountSubmittedReviews(b) - countAccountSubmittedReviews(a);
        return diff !== 0 ? diff : created(b) - created(a);
      });
    } else if (sortOption === 'Active') {
      list = list.filter((u) => getInvitesRow(u, 0).status === 'ACTIVE');
      list.sort((a, b) => created(b) - created(a));
    } else if (sortOption === 'Inactive') {
      list = list.filter((u) => getInvitesRow(u, 0).status === 'INACTIVE');
      list.sort((a, b) => created(b) - created(a));
    } else if (sortOption === 'Alerts') {
      // Unread priority / order issues / new-order counts (see priorityMessages) plus ALL-tab NEW when definitions differ
      list = list.filter((u) => clientHasUnreadPriorityMessages(u) || getClientRow(u, 0).newCount > 0);
      const alertTime = (u: any) => getLastUnreadPriorityMessageTime(u);
      list.sort((a, b) => {
        const diff = alertTime(b) - alertTime(a);
        return diff !== 0 ? diff : created(b) - created(a);
      });
    } else {
      // Most recent: newest first
      list.sort((a, b) => created(b) - created(a));
    }
    return list;
  })();

  const clientsFilteredBySearch = (() => {
    const q = (clientSearchQuery || '').trim().toLowerCase();
    if (!q) return sortedClients;
    return sortedClients.filter((u: any) => getClientSearchableText(u).includes(q));
  })();
  const totalClientsCount = registeredUsers.length;
  const totalMembersCount = registeredUsers.filter(
    (u: any) => ((u?.membershipType || 'STANDARD') + '').toUpperCase() === 'PREMIUM'
  ).length;
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
          <AdminHeader
            title={selectedClientEmail ? 'DETAILS' : 'OVERVIEW'}
            showBack
            breadcrumbParentLabel="CLIENTS"
            breadcrumbParentPath="/admin/dashboard"
            onBack={selectedClientEmail ? closeClientDetails : undefined}
            breadcrumbParentOnClick={() => navigate('/admin/dashboard')}
            externalSearchValue={clientSearchQuery}
            onExternalSearchChange={setClientSearchQuery}
            hideSearchIcon={!!selectedClientEmail}
            globalSearchTargetPath="/admin/clients"
          />

          <div className="pb-6 px-4">
            <div className="max-w-md mx-auto">
              {/* Banner when API returns 403 or 503 so admin knows why Supabase users are missing */}
              {adminClientsApiError === 'forbidden' && (
                <div className="mb-3 px-3 py-2 border border-black bg-amber-50" style={{ borderWidth: '1.3px', fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', textTransform: 'uppercase' }}>
                  Sign in with your Supabase account (same email as admin) to load all clients from Supabase. Right now the list is from this browser only.
                </div>
              )}
              {adminClientsApiError === 'service_unavailable' && (
                <div className="mb-3 px-3 py-2 border border-black bg-amber-50" style={{ borderWidth: '1.3px', fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', textTransform: 'uppercase' }}>
                  Set SUPABASE_SERVICE_ROLE_KEY in your API environment (e.g. Vercel) to show all clients from Supabase. Right now the list is from this browser only.
                </div>
              )}
              {/* Single main card – client list (reference structure) */}
              <div
                className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
                style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
              >
                {!selectedClientEmail ? (
                  <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px', marginTop: '10px' }} />
                ) : null}

                {selectedClientEmail ? (
                  /* Details view: profile, orders, appointments */
                  <div className="px-5 pb-6" style={{ paddingTop: '10px', position: 'relative' }}>
                    {selectedClient ? (
                      <div className="flex items-center justify-between mb-4" style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '12px',
                            color: '#EB1C24',
                            margin: 0,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            paddingRight: '8px',
                          }}
                        >
                          {`${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim().toUpperCase() || 'CLIENT DETAILS'}
                        </p>
                        <button
                          type="button"
                          onClick={closeClientDetails}
                          aria-label="Close client details"
                          style={{
                            padding: 0,
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            lineHeight: 0,
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src="/assets/close-icon.svg"
                            alt=""
                            width={16}
                            height={16}
                            style={{ display: 'block', filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }}
                          />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={closeClientDetails}
                        aria-label="Close client details"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '20px',
                          padding: 0,
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          lineHeight: 0,
                          zIndex: 2,
                        }}
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt=""
                          width={16}
                          height={16}
                          style={{ display: 'block', filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }}
                        />
                      </button>
                    )}
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
                              cursor: profilePhotoError ? 'default' : 'pointer',
                            }}
                            onClick={() => {
                              if (!profilePhotoError) setShowEnlargedProfileImage(true);
                            }}
                          >
                            {!profilePhotoError ? (
                                <img
                                  src={selectedClientProfilePhotoSrc}
                                  alt=""
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={() => setProfilePhotoError(true)}
                                />
                              ) : null}
                            <div
                              className="absolute inset-0 flex items-center justify-center font-futura font-bold text-lg"
                              style={{ backgroundColor: 'transparent', color: '#000000', zIndex: !profilePhotoError ? -1 : 0 }}
                            >
                              {[(selectedClient?.firstName || '').trim().charAt(0), (selectedClient?.lastName || '').trim().charAt(0)].filter(Boolean).join('').toUpperCase() || '?'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 mb-6">
                          <div className="mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 72px', alignItems: 'baseline', gap: '2px 0' }}>
                            <p style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '12px', margin: 0 }}>{selectedReferralCode}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
                              <span
                                className="inline-block px-3 py-1 text-xs rounded"
                                style={{
                                  backgroundColor: selectedReferralStatus === 'ACTIVE' ? 'rgba(235, 28, 36, 0.15)' : '#f3f4f6',
                                  color: selectedReferralStatus === 'ACTIVE' ? '#EB1C24' : '#808080',
                                  transform: 'scale(0.8)',
                                  transformOrigin: 'top right',
                                }}
                              >
                                {selectedReferralStatus}
                              </span>
                            </div>
                            {(() => {
                              const hasNewsletter = selectedClient && isClientNewsletterSubscribed(selectedClient);
                              const invitesCell = (
                                <div style={{ width: '100%', textAlign: 'right', paddingTop: '2px' }}>
                                  {selectedInvitesCount >= 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => setShowInvitesPopup(true)}
                                      className="cursor-pointer bg-transparent border-none p-0 w-full"
                                      style={{
                                        fontFamily: '"Futura PT Demi"',
                                        color: '#808080',
                                        fontSize: '10px',
                                        margin: 0,
                                        padding: 0,
                                        lineHeight: 1.2,
                                        textAlign: 'right',
                                        display: 'block',
                                        width: '100%',
                                      }}
                                    >
                                      {selectedInvitesCount === 1 ? '1 INVITE' : `${selectedInvitesCount} INVITES`}
                                    </button>
                                  ) : (
                                    <p style={{ fontFamily: '"Futura PT Medium"', color: '#000000', fontSize: '10px', margin: 0, lineHeight: 1.2, textAlign: 'right' }}>
                                      0 INVITES
                                    </p>
                                  )}
                                </div>
                              );
                              if (hasNewsletter) {
                                if (selectedMembershipDuration) {
                                  return (
                                    <>
                                      <p style={{ fontFamily: selectedTierDisplay.label === 'Silver tier' ? '"Futura PT Demi"' : '"Futura PT Medium"', color: selectedTierDisplay.color, fontSize: '10px', margin: 0, marginTop: '2px' }}>{selectedTierDisplay.label}</p>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', boxSizing: 'border-box' }}>{invitesCell}</div>
                                      <p style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '10px', margin: 0, marginTop: '2px' }}>{selectedMembershipDuration}</p>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
                                        {selectedClient && isClientNewsletterSubscribed(selectedClient) && (
                                          <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', margin: 0, marginTop: '2px', textAlign: 'right', width: '100%' }}>NEWSLETTER</p>
                                        )}
                                      </div>
                                    </>
                                  );
                                }
                                return (
                                  <>
                                    <p style={{ fontFamily: selectedTierDisplay.label === 'Silver tier' ? '"Futura PT Demi"' : '"Futura PT Medium"', color: selectedTierDisplay.color, fontSize: '10px', margin: 0, marginTop: '2px' }}>{selectedTierDisplay.label}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>{invitesCell}</div>
                                    <div />
                                    {selectedClient && isClientNewsletterSubscribed(selectedClient) && (
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%' }}>
                                        <p style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', margin: 0, marginTop: '2px', textAlign: 'right', width: '100%' }}>NEWSLETTER</p>
                                      </div>
                                    )}
                                  </>
                                );
                              }
                              return (
                                <>
                                  <p style={{ fontFamily: selectedTierDisplay.label === 'Silver tier' ? '"Futura PT Demi"' : '"Futura PT Medium"', color: selectedTierDisplay.color, fontSize: '10px', margin: 0, marginTop: '2px' }}>{selectedTierDisplay.label}</p>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%', boxSizing: 'border-box' }}>{invitesCell}</div>
                                  {selectedMembershipDuration && (
                                    <>
                                      <p style={{ fontFamily: '"Futura PT Medium"', color: '#808080', fontSize: '10px', margin: 0, marginTop: '2px' }}>{selectedMembershipDuration}</p>
                                      <div />
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          {/* CSS Grid: equal 1fr tracks + single columnGap — avoids table/subpixel asymmetry from td padding + col widths */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                              columnGap: '10px',
                              rowGap: 0,
                              width: '100%',
                              /* Space above red ORDERS / POINTS / TOTAL SPENT / MEMBERSHIP values: was 12px → 32px (+20px), then +24px → 56px (not between value and label) */
                              marginTop: '56px',
                              marginLeft: '-4px',
                              boxSizing: 'border-box',
                            }}
                          >
                            {(() => {
                              const cols = [
                                {
                                  value: selectedTotalOrders,
                                  label: 'ORDERS',
                                  valueColor: '#EB1C24',
                                },
                                {
                                  value: selectedTotalLoyaltyPointsEarned.toLocaleString(),
                                  label: 'POINTS',
                                  valueColor: '#EB1C24',
                                },
                                {
                                  value: `$${selectedTotalSpent.toLocaleString()}`,
                                  label: 'TOTAL SPENT',
                                  valueColor: '#EB1C24',
                                },
                                {
                                  value: selectedMembershipType,
                                  label: 'MEMBERSHIP',
                                  valueColor: (selectedMembershipType || '').toUpperCase() === 'PREMIUM' ? '#000000' : '#808080',
                                },
                              ] as const;
                              const cell = (col: (typeof cols)[number]) => (
                                <div
                                  key={col.label}
                                  style={{
                                    minWidth: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    width: '100%',
                                    textAlign: 'center',
                                  }}
                                >
                                  <p
                                    style={{
                                      fontWeight: 700,
                                      lineHeight: 1.2,
                                      color: col.valueColor,
                                      fontFamily: '"Futura PT Book"',
                                      fontSize: '13px',
                                      margin: 0,
                                      width: '100%',
                                      textAlign: 'center',
                                    }}
                                  >
                                    {col.value}
                                  </p>
                                  <p
                                    style={{
                                      lineHeight: 1.2,
                                      fontFamily: '"Futura PT Book"',
                                      color: '#000000',
                                      fontSize: '10px',
                                      margin: '4px 0 0 0',
                                      width: '100%',
                                      textAlign: 'center',
                                      wordBreak: 'break-word',
                                      overflowWrap: 'break-word',
                                    }}
                                  >
                                    {col.label}
                                  </p>
                                </div>
                              );
                              return (
                                <>
                                  {cell(cols[0])}
                                  <div
                                    style={{
                                      gridColumn: 'span 2',
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                      columnGap: '10px',
                                      transform: 'translateX(-8px)',
                                      minWidth: 0,
                                      boxSizing: 'border-box',
                                    }}
                                  >
                                    {cell(cols[1])}
                                    {cell(cols[2])}
                                  </div>
                                  {cell(cols[3])}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        {/* Rewards section: photos, videos, tags – tap to expand/collapse */}
                        {selectedClient && (() => {
                          const media = getAffiliateMediaForClient(selectedClient);
                          const toggle = (key: 'photos' | 'videos' | 'tags') => {
                            setRewardsExpand((prev) => (prev === key ? null : key));
                          };
                          return (
                            <div className="bg-white border border-gray-200 p-4 mb-6">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggle('photos')}
                                  className="text-center cursor-pointer border-0 bg-transparent p-0"
                                  style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px' }}
                                >
                                  <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '14px', margin: 0 }}>{media.photos.length}</p>
                                  <p style={{ margin: 0 }}>PHOTOS</p>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggle('videos')}
                                  className="text-center cursor-pointer border-0 bg-transparent p-0"
                                  style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px' }}
                                >
                                  <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '14px', margin: 0 }}>{media.videos.length}</p>
                                  <p style={{ margin: 0 }}>VIDEOS</p>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggle('tags')}
                                  className="text-center cursor-pointer border-0 bg-transparent p-0"
                                  style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px' }}
                                >
                                  <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '14px', margin: 0 }}>{media.socials.length}</p>
                                  <p style={{ margin: 0 }}>SOCIALS</p>
                                </button>
                              </div>
                              {rewardsExpand === 'photos' && media.photos.length > 0 && (
                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '10px', width: '284px', maxWidth: '100%' }}>
                                      {media.photos.map((url: string, i: number) => (
                                        <div
                                          key={i}
                                          role="button"
                                          tabIndex={0}
                                          onClick={() => {
                                            setMediaViewerUrls(media.photos);
                                            setMediaViewerIndex(i);
                                            setShowMediaViewer(true);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                              e.preventDefault();
                                              setMediaViewerUrls(media.photos);
                                              setMediaViewerIndex(i);
                                              setShowMediaViewer(true);
                                            }
                                          }}
                                          style={{ width: '88px', flexShrink: 0, position: 'relative', cursor: 'pointer' }}
                                        >
                                          <div style={affiliateFrameStyle}>
                                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:') || url.includes('gallery-mock') || url.includes('/assets/') ? (
                                              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                                            ) : (
                                              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-xs text-gray-500 p-2 break-all" style={{ width: '100%', height: '100%' }} onClick={(e) => e.stopPropagation()}>View</a>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {rewardsExpand === 'photos' && media.photos.length === 0 && (
                                <div className="mt-4 pt-4 flex justify-center" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <p className="text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>NO PHOTOS SUBMITTED YET.</p>
                                </div>
                              )}
                              {rewardsExpand === 'videos' && media.videos.length > 0 && (
                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '10px', width: '284px', maxWidth: '100%' }}>
                                      {media.videos.map((url: string, i: number) => {
                                        const isImageUrl = url.includes('gallery-mock') || url.includes('/assets/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:');
                                        return (
                                          <div
                                            key={i}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => {
                                              setMediaViewerUrls(media.videos.map((u: string) => (u.includes('gallery-mock') || u.includes('/assets/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(u) || u.startsWith('data:') ? u : '/assets/gallery-mock.png')));
                                              setMediaViewerIndex(i);
                                              setShowMediaViewer(true);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setMediaViewerUrls(media.videos.map((u: string) => (u.includes('gallery-mock') || u.includes('/assets/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(u) || u.startsWith('data:') ? u : '/assets/gallery-mock.png')));
                                                setMediaViewerIndex(i);
                                                setShowMediaViewer(true);
                                              }
                                            }}
                                            style={{ width: '88px', flexShrink: 0, position: 'relative', cursor: 'pointer' }}
                                          >
                                            <div style={affiliateFrameStyle}>
                                              {isImageUrl ? (
                                                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                                              ) : (
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#EB1C24' }} onClick={(e) => e.stopPropagation()}>Watch</a>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {rewardsExpand === 'videos' && media.videos.length === 0 && (
                                <div className="mt-4 pt-4 flex justify-center" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <p className="text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>NO VIDEOS SUBMITTED YET.</p>
                                </div>
                              )}
                              {rewardsExpand === 'tags' && media.socials.length > 0 && (
                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {media.socials.map((social: { platform: string; link: string }, i: number) => (
                                      <div key={i} style={{ position: 'relative' }}>
                                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', textTransform: 'uppercase', margin: '0 0 8px 0', fontWeight: 500 }}>
                                          {String(social.platform || 'LINK').toUpperCase()}:
                                        </p>
                                        <a
                                          href={social.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textDecoration: 'underline', wordBreak: 'break-all', display: 'block', marginBottom: 0, textTransform: 'uppercase' }}
                                        >
                                          {String(social.link || '').toUpperCase()}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {rewardsExpand === 'tags' && media.socials.length === 0 && (
                                <div className="mt-4 pt-4 flex justify-center" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <p className="text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>NO SOCIALS SUBMITTED YET.</p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {/* Reviews panel – below affiliate (Rewards) content; tap TOTAL / MEDIA / PENDING to expand like photos/videos/socials */}
                        {selectedClient && (() => {
                          const email = (selectedClient.email || '').trim().toLowerCase();
                          let reviewList: Array<{ id?: string; date?: string; createdAt?: string; submittedAt?: string; text?: string; rating?: number; hasPhoto?: boolean; hasVideo?: boolean; status?: string; pending?: boolean }> = [];
                          try {
                            const raw = email ? localStorage.getItem(`userSubmittedReviews_${email}`) : null;
                            if (raw) {
                              const data = JSON.parse(raw);
                              const list = Array.isArray(data) ? data : (data?.reviews || []);
                              const sortTime = (r: any) => {
                                const t = r.updatedAt ?? r.updated_at ?? r.date ?? r.createdAt ?? r.submittedAt;
                                if (!t) return 0;
                                try { return new Date(t).getTime(); } catch { return 0; }
                              };
                              reviewList = [...list].sort((a, b) => sortTime(b) - sortTime(a));
                            }
                          } catch {
                            // ignore
                          }
                          const row = getReviewsTabRow(selectedClient, 0);
                          const reviewListMedia = reviewList.filter((r: any) => r?.hasPhoto || r?.hasVideo);
                          const reviewListPending = reviewList.filter((r: any) => r?.status === 'pending' || r?.pending);
                          const reviewEmptyStyle = {
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                            fontSize: '11px',
                            color: '#808080',
                            textTransform: 'uppercase' as const,
                          };
                          const renderReviewCards = (list: typeof reviewList, heading: string) => (
                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', marginBottom: '8px', textTransform: 'uppercase' }}>{heading}</p>
                              <div style={{ paddingBottom: '24px' }}>
                                <div className="space-y-3 max-h-64 overflow-y-auto" style={{ paddingTop: '2px' }}>
                                {list.map((r: any, i: number) => {
                                  const dateStr = (r.updatedAt ?? r.updated_at ?? r.date ?? r.createdAt ?? r.submittedAt) || '—';
                                  const displayDate = typeof dateStr === 'string' ? (() => { try { return new Date(dateStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch { return dateStr; } })() : '—';
                                  return (
                                    <div key={r.id ?? i} className="py-3 border-b border-gray-100 last:border-0">
                                      <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', margin: 0 }}>{displayDate}</p>
                                      {(r.rating != null) && <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '2px 0 0 0' }}>Rating: {r.rating}</p>}
                                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', margin: (r.rating != null ? '2px' : '4px') + ' 0 0 0' }}>{r.text ?? r.message ?? r.content ?? '—'}</p>
                                      {(r.hasPhoto || r.hasVideo) && (
                                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#EB1C24', margin: '4px 0 0 0' }}>
                                          {(r.status === 'pending' || r.pending) ? 'PENDING' : 'APPROVED'}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                                </div>
                              </div>
                            </div>
                          );
                          return (
                            <div className="bg-white border border-gray-200 p-4 mb-6">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => setReviewsExpand((prev) => (prev === 'total' ? null : 'total'))}
                                  className="text-center cursor-pointer border-0 bg-transparent p-0"
                                  style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px' }}
                                >
                                  <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '14px', margin: 0 }}>{row.totalReviews}</p>
                                  <p style={{ margin: 0 }}>TOTAL</p>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReviewsExpand((prev) => (prev === 'media' ? null : 'media'))}
                                  className="text-center cursor-pointer border-0 bg-transparent p-0"
                                  style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px' }}
                                >
                                  <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '14px', margin: 0 }}>{row.reviewsWithPhotosVideos}</p>
                                  <p style={{ margin: 0 }}>MEDIA</p>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReviewsExpand((prev) => (prev === 'pending' ? null : 'pending'))}
                                  className="text-center cursor-pointer border-0 bg-transparent p-0"
                                  style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px' }}
                                >
                                  <p className="font-bold" style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '14px', margin: 0 }}>{row.pendingReviews}</p>
                                  <p style={{ margin: 0 }}>PENDING</p>
                                </button>
                              </div>
                              {reviewsExpand === 'total' && reviewList.length > 0 && renderReviewCards(reviewList, 'ALL REVIEWS (NEWEST FIRST)')}
                              {reviewsExpand === 'total' && reviewList.length === 0 && (
                                <div className="mt-4 pt-4 flex justify-center" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <p className="text-center" style={reviewEmptyStyle}>NO REVIEWS SUBMITTED YET.</p>
                                </div>
                              )}
                              {reviewsExpand === 'media' && reviewListMedia.length > 0 && renderReviewCards(reviewListMedia, 'REVIEWS WITH PHOTO OR VIDEO')}
                              {reviewsExpand === 'media' && reviewListMedia.length === 0 && (
                                <div className="mt-4 pt-4 flex justify-center" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <p className="text-center" style={reviewEmptyStyle}>NO REVIEWS WITH MEDIA.</p>
                                </div>
                              )}
                              {reviewsExpand === 'pending' && reviewListPending.length > 0 && renderReviewCards(reviewListPending, 'PENDING APPROVAL')}
                              {reviewsExpand === 'pending' && reviewListPending.length === 0 && (
                                <div className="mt-4 pt-4 flex justify-center" style={{ borderTop: '1px solid #e5e7eb' }}>
                                  <p className="text-center" style={reviewEmptyStyle}>NO PENDING REVIEWS.</p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {/* Client details section: DETAILS | Cart | Wishlist tabs – same spacing as marketing */}
                        <div className="bg-white border border-gray-200 p-4 mb-6">
                        <div
                          className="flex flex-wrap justify-center gap-[14px]"
                          style={{ marginBottom: '10px' }}
                        >
                          {PERSONAL_SECTION_TABS.map((tab) => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => setPersonalSectionTab(tab)}
                                className="py-3 px-2 font-medium transition-colors"
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '10px',
                                  color: personalSectionTab === tab ? '#EB1C24' : '#808080',
                                  border: 'none',
                                  paddingBottom: '4px',
                                  background: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <span
                                  style={{
                                    display: 'inline-block',
                                    borderBottom: personalSectionTab === tab ? '1px solid #EB1C24' : '1px solid transparent',
                                    paddingBottom: '4px'
                                  }}
                                >
                                  {tab.toUpperCase()}
                                </span>
                              </button>
                            ))}
                          </div>
                          {personalSectionTab === 'details' && (
                            <div className="flex flex-col gap-y-[9px] text-sm">
                              <div className="flex justify-between">
                                <span style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '11px' }}>JOIN DATE:</span>
                                <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px' }}>{selectedJoinDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '11px' }}>EMAIL:</span>
                                <span style={{ fontFamily: '"Futura PT Demi"', color: '#808080', fontSize: '10px' }}>{(selectedClient?.email || '').toUpperCase()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '11px' }}>BIRTHDAY:</span>
                                <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px' }}>{selectedBirthday}</span>
                              </div>
                              <div className="flex justify-between">
                                <span style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '11px' }}>PHONE:</span>
                                <span style={{ fontFamily: '"Futura PT Demi"', color: '#808080', fontSize: '10px' }}>
                                  {formatPhoneWithHyphens(
                                    (selectedClient as any)?.phoneNumber ||
                                    (selectedClient as any)?.phone_number ||
                                    (selectedClient as any)?.phone
                                  ).toUpperCase()}
                                </span>
                              </div>
                              {(['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin'] as const).map((key) => {
                                const val = (selectedClient as any)?.[key];
                                if (!val || String(val).trim() === '') return null;
                                const label = key.toLowerCase() + ':';
                                const url = socialStorageToHttpsUrl(key as SocialPlatform, String(val).trim());
                                const displayVal = String(val).trim().toUpperCase();
                                return (
                                  <div key={key} className="flex justify-between">
                                    <span style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '10px' }}>{label}</span>
                                    {url !== '#' ? (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px', textDecoration: 'none' }}
                                      >
                                        {displayVal}
                                      </a>
                                    ) : (
                                      <span style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '10px' }}>{displayVal}</span>
                                    )}
                                  </div>
                                );
                              })}
                              <div className="flex justify-between items-start">
                                <span style={{ fontFamily: '"Futura PT Book"', color: '#000000', fontSize: '11px' }}>ADDRESS:</span>
                                <span className="text-right" style={{ fontFamily: '"Futura PT Demi"', color: '#808080', fontSize: '10px', maxWidth: '60%', lineHeight: '13px' }}>
                                  {selectedPrimaryAddress === '—' ? (
                                    '—'
                                  ) : (
                                    (() => {
                                      const lines = selectedPrimaryAddress.split('\n');
                                      return lines.map((line: string, i: number) => (
                                        <span key={i}>
                                          {i > 0 && <br />}
                                          <span style={i === lines.length - 1 ? { fontFamily: '"Futura PT Medium"', color: '#EB1C24' } : undefined}>
                                            {line}
                                          </span>
                                        </span>
                                      ));
                                    })()
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                          {personalSectionTab === 'cart' && selectedClient && (() => {
                            const id = (selectedClientForOrders?.id || selectedClient.id) as string | undefined;
                            if (id && !isSupabaseUserId(id)) {
                              return (
                                <p className="text-center py-4" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}>CART SYNC USES SUPABASE ACCOUNTS (UUID). MOCK / LOCAL-ONLY CLIENTS HAVE NO CLOUD CART.</p>
                              );
                            }
                            const fetching = Boolean(id && isSupabaseUserId(id) && adminCartByUserId[id as string] === undefined);
                            if (fetching || (cartWishlistLoading && isSupabaseUserId(id))) {
                              return (
                                <p className="text-center py-4" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}>LOADING CART…</p>
                              );
                            }
                            const apiItems = id && adminCartByUserId[id] !== undefined ? adminCartByUserId[id] : [];
                            let list = Array.isArray(apiItems) ? apiItems : [];
                            if (list.length === 0 && selectedClient?.email) {
                              try {
                                const em = (selectedClient.email || '').trim().toLowerCase();
                                const curRaw = localStorage.getItem('currentUser');
                                const cur = curRaw ? JSON.parse(curRaw) : null;
                                if ((cur?.email || '').trim().toLowerCase() === em) {
                                  const raw = localStorage.getItem('cartItems');
                                  const loc = raw ? JSON.parse(raw) : [];
                                  if (Array.isArray(loc) && loc.length > 0) {
                                    list = loc;
                                  }
                                }
                              } catch {
                                /* ignore */
                              }
                            }
                            return list.length === 0 ? (
                              <p className="text-center py-4" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}>THIS CART IS EMPTY.</p>
                            ) : (
                              <div className="space-y-2">
                                {list.map((item: any, i: number) => (
                                  <div key={item?.id ?? i} className="flex justify-between items-center border-b border-gray-100 py-2">
                                    <span className="text-xs" style={{ fontFamily: '"Futura PT Book"' }}>{(item?.name ?? item?.productName ?? 'Item').toString().toUpperCase()}</span>
                                    {item?.price != null && <span className="text-xs text-gray-600">${Number(item.price).toLocaleString()}</span>}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                          {personalSectionTab === 'wishlist' && selectedClient && (() => {
                            const id = (selectedClientForOrders?.id || selectedClient.id) as string | undefined;
                            if (id && !isSupabaseUserId(id)) {
                              return (
                                <p className="text-center py-4" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}>WISHLIST SYNC USES SUPABASE ACCOUNTS (UUID). MOCK / LOCAL-ONLY CLIENTS HAVE NO CLOUD WISHLIST.</p>
                              );
                            }
                            const fetching = Boolean(id && isSupabaseUserId(id) && adminWishlistByUserId[id as string] === undefined);
                            if (fetching || (cartWishlistLoading && isSupabaseUserId(id))) {
                              return (
                                <p className="text-center py-4" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}>LOADING WISHLIST…</p>
                              );
                            }
                            const apiItems = id && adminWishlistByUserId[id] !== undefined ? adminWishlistByUserId[id] : [];
                            let list = Array.isArray(apiItems) ? apiItems : [];
                            if (list.length === 0 && selectedClient?.email) {
                              try {
                                const em = (selectedClient.email || '').trim().toLowerCase();
                                const curRaw = localStorage.getItem('currentUser');
                                const cur = curRaw ? JSON.parse(curRaw) : null;
                                if ((cur?.email || '').trim().toLowerCase() === em) {
                                  const raw = localStorage.getItem('wishlistItems');
                                  const loc = raw ? JSON.parse(raw) : [];
                                  if (Array.isArray(loc) && loc.length > 0) {
                                    list = loc;
                                  }
                                }
                              } catch {
                                /* ignore */
                              }
                            }
                            return list.length === 0 ? (
                              <p className="text-center py-4" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}>THIS WISHLIST IS EMPTY.</p>
                            ) : (
                              <div className="space-y-2">
                                {list.map((item: any, i: number) => (
                                  <div key={item?.id ?? i} className="flex justify-between items-center border-b border-gray-100 py-2">
                                    <span className="text-xs" style={{ fontFamily: '"Futura PT Book"' }}>{(item?.name ?? item?.productName ?? 'Item').toString().toUpperCase()}</span>
                                    {item?.price != null && <span className="text-xs text-gray-600">${Number(item.price).toLocaleString()}</span>}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        <div
                          className="flex flex-wrap justify-center gap-[14px]"
                          style={{ marginBottom: '10px' }}
                        >
                          {DETAILS_TABS.map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setDetailsTab(tab)}
                              className="py-3 px-2 font-medium transition-colors"
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
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
                        {detailsTab === 'activity' && selectedClient && (() => {
                          const isMayaOwen = (selectedClient.email || '').toString().trim().toLowerCase() === MAYA_OWEN_MOCK_EMAIL;
                          const id = selectedClient.id as string | undefined;
                          const activityFetching =
                            !isMayaOwen && Boolean(id && isSupabaseUserId(id) && adminActivityByUserId[id as string] === undefined);
                          if (activityFetching) {
                            return (
                              <div className="bg-white border border-gray-200 p-4 text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>LOADING ACTIVITY…</div>
                            );
                          }
                          const emailLower = (selectedClient.email || '').trim().toLowerCase();
                          let curEmailLower = '';
                          try {
                            const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
                            curEmailLower = (cu?.email || '').trim().toLowerCase();
                          } catch {
                            /* ignore */
                          }
                          const isSelfOnThisDevice = Boolean(emailLower && curEmailLower && emailLower === curEmailLower);

                          const sortActivityByTime = (a: { createdAt?: string }, b: { createdAt?: string }) => {
                            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return tb - ta;
                          };

                          let list = isMayaOwen ? getMockActivityForMayaOwen() : ((id ? adminActivityByUserId[id] : null) ?? []);

                          if (!isMayaOwen && isSelfOnThisDevice) {
                            const localBackup = readLocalActivityForEmail(emailLower);
                            list = [...list, ...localBackup].sort(sortActivityByTime);
                            try {
                              const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
                              const wish = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
                              const c = Array.isArray(cart) ? cart.length : 0;
                              const w = Array.isArray(wish) ? wish.length : 0;
                              if (c > 0 || w > 0) {
                                list = [
                                  {
                                    id: `baw_syn_device_bag_${c}_${w}`,
                                    eventType: 'device_bag_status',
                                    createdAt: new Date().toISOString(),
                                    payload: {
                                      cartItems: c,
                                      wishlistItems: w,
                                      source: 'this_browser_admin_preview',
                                    },
                                  },
                                  ...list,
                                ].sort(sortActivityByTime);
                              }
                            } catch {
                              /* ignore */
                            }
                          }

                          const formatEventLabel = (eventType: string, payload?: Record<string, unknown>) => {
                            const labels: Record<string, string> = {
                              sign_in: 'Signed in',
                              sign_out: 'Signed out',
                              sign_up: 'Signed up',
                              view_product: 'Viewed product',
                              add_to_cart: 'Added to cart',
                              add_to_wishlist: 'Added to wishlist',
                              remove_from_cart: 'Removed from cart',
                              remove_from_wishlist: 'Removed from wishlist',
                              place_order: 'Placed order',
                              cancel_order: 'Cancelled order',
                              add_review: 'Added review',
                              redeem_points: 'Redeemed points',
                              view_page: 'Viewed page',
                              profile_update: 'Updated profile',
                              checkout_start: 'Started checkout',
                              checkout_complete: 'Completed checkout',
                              cart_snapshot: 'Cart updated',
                              wishlist_snapshot: 'Wishlist updated',
                              cloud_sync: 'Synced cart/wishlist to cloud',
                              device_bag_status: 'Active on this device (bag / wishlist)',
                              membership_checkout_start: 'Membership Stripe checkout',
                              membership_upgrade_checkout: 'Membership upgrade checkout',
                              membership_stripe_return: 'Returned from Stripe (membership)',
                              open_cart_dropdown: 'Opened cart',
                              cart_navigate: 'Cart menu',
                              cart_item_updated: 'Saved customization (build-a-wig)',
                              save_for_later: 'Saved for later (bag)',
                              move_saved_to_cart: 'Moved saved item to bag',
                              remove_saved_item: 'Removed from saved for later',
                            };
                            let label = labels[eventType] || eventType.replace(/_/g, ' ');
                            if (eventType === 'device_bag_status' && payload) {
                              const c = payload.cartItems != null ? Number(payload.cartItems) : 0;
                              const w = payload.wishlistItems != null ? Number(payload.wishlistItems) : 0;
                              label += `: bag ${c} · wishlist ${w} (this browser localStorage)`;
                            }
                            if (eventType === 'profile_update' && payload?.section) {
                              label += ` (${String(payload.section)})`;
                            }
                            if (payload?.productName) label += `: ${String(payload.productName).toUpperCase()}`;
                            else if (eventType === 'view_page' && payload?.fullPath) label += `: ${String(payload.fullPath)}`;
                            else if (eventType === 'view_page' && payload?.path) label += `: ${String(payload.path)}${payload.search ? String(payload.search) : ''}`;
                            else if (payload?.page) label += `: ${String(payload.page)}`;
                            else if (
                              (eventType === 'cart_snapshot' || eventType === 'wishlist_snapshot') &&
                              payload?.itemCount != null
                            ) {
                              label += `: ${String(payload.itemCount)} items`;
                            } else if (payload?.orderId) label += ` #${String(payload.orderId).replace(/^#/, '')}`;
                            else if (payload?.method && eventType === 'sign_in') label += ` (${String(payload.method)})`;
                            else if (payload?.source && eventType === 'sign_up') label += ` (${String(payload.source)})`;
                            else if (payload?.destination && eventType === 'cart_navigate') label += `: ${String(payload.destination)}`;
                            const actSrc = payload?.source != null ? String(payload.source) : '';
                            if (
                              actSrc &&
                              eventType !== 'sign_up' &&
                              eventType !== 'device_bag_status' &&
                              ['view_product', 'add_to_cart', 'remove_from_cart', 'add_to_wishlist'].includes(eventType)
                            ) {
                              label += ` · ${actSrc.replace(/_/g, ' ')}`;
                            }
                            if (
                              actSrc &&
                              (eventType === 'cart_snapshot' || eventType === 'wishlist_snapshot') &&
                              actSrc === 'admin_client_details_self'
                            ) {
                              label += ' · admin preview nudge';
                            }
                            const qtyCh = payload?.change != null ? String(payload.change) : '';
                            if (qtyCh && (eventType === 'add_to_cart' || eventType === 'remove_from_cart')) {
                              label += ` (${qtyCh.replace(/_/g, ' ')})`;
                            }
                            const bawCtx = payload?.context != null ? String(payload.context) : '';
                            if (bawCtx && eventType === 'cart_item_updated') {
                              label += ` · ${bawCtx.replace(/_/g, ' ')}`;
                            }
                            return label;
                          };
                          return (
                            <div className="space-y-3">
                              {list.length === 0 ? (
                                <div className="bg-white border border-gray-200 p-4 text-center space-y-2">
                                  <div style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>NO ACTIVITY YET. EVENTS WILL APPEAR HERE AS THE CLIENT USES THE SITE.</div>
                                  {id && isSupabaseUserId(id) && !isMayaOwen ? (
                                    <div style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#a3a3a3', textTransform: 'none', lineHeight: 1.4 }}>
                                      Rows come from Supabase user_activity (POST /api/activity). Apply the migration if the table is missing. Failed POSTs are also appended in this browser and merged here when you open your own client on this device.
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div style={{ paddingBottom: '24px' }}>
                                  <div className="space-y-2 max-h-96 overflow-y-auto" style={{ paddingTop: '2px' }}>
                                  {list.map((evt) => {
                                    const createdAt = evt.createdAt ? new Date(evt.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' }) : '—';
                                    const payload = evt.payload && typeof evt.payload === 'object' ? evt.payload as Record<string, unknown> : undefined;
                                    const isLocalBackup = String(evt.id || '').startsWith('local_');
                                    const isDeviceSyn = String(evt.eventType || '') === 'device_bag_status';
                                    return (
                                      <div key={evt.id} className="bg-white border border-gray-200 p-3 flex flex-col gap-1">
                                        <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', color: '#000', margin: 0 }}>
                                          {formatEventLabel(evt.eventType, payload)}
                                        </p>
                                        {(isLocalBackup || isDeviceSyn) && (
                                          <p style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontSize: '9px', color: '#a3a3a3', margin: 0, textTransform: 'uppercase' }}>
                                            {isDeviceSyn ? 'Live preview · this browser only' : 'Saved after failed cloud POST · this browser'}
                                          </p>
                                        )}
                                        <p style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0 }}>{createdAt}</p>
                                        {payload && Object.keys(payload).length > 0 && (
                                          <pre className="text-left text-xs text-gray-500 mt-1 overflow-x-auto whitespace-pre-wrap break-words" style={{ fontFamily: '"Futura PT Book"', margin: 0 }}>{JSON.stringify(payload)}</pre>
                                        )}
                                      </div>
                                    );
                                  })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {detailsTab === 'orders' && (
                          <div className="space-y-3">
                            {selectedOrderHistory.length === 0 ? (
                              <div className="bg-white border border-gray-200 p-4 text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>NO ORDERS YET</div>
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
                              return (
                                <div className="bg-white border border-gray-200 p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>
                                      {(() => {
                                        const raw = (expandedOrder.orderNumber || expandedOrder.id || 'ORDER').toString();
                                        const num = raw.replace(/^ORDER\s*#?\s*/i, '').trim();
                                        return num ? `ORDER #${num}` : 'ORDER';
                                      })()}
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
                                  <div
                                    className="relative"
                                    style={{
                                      minHeight: '180px',
                                      height: 'auto',
                                      marginBottom: '20px',
                                      overflowX: orderProducts.length >= 3 ? 'auto' : 'hidden',
                                    }}
                                  >
                                    <div
                                      className="flex"
                                      style={{
                                        gap: '20px',
                                        minHeight: '180px',
                                        alignItems: 'flex-start',
                                        justifyContent: orderProducts.length === 1 ? 'center' : 'flex-start',
                                        paddingRight: orderProducts.length >= 3 ? '10px' : 0,
                                        marginLeft: orderProducts.length >= 2 ? '-10px' : 0,
                                      }}
                                    >
                                      {orderProducts.map((product: any) => {
                                        const opts = product.options || {};
                                        const lengthVal = opts.length || '24"';
                                        const nonDefaultDetails = getNonDefaultDetailLines(product.name, opts);
                                        return (
                                          <div
                                            key={product.id}
                                            className="flex-shrink-0"
                                            style={{
                                              width: '150px',
                                              minHeight: '150px',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              padding: '8px'
                                            }}
                                          >
                                            <img
                                              src={product.image}
                                              alt={product.name}
                                              style={{
                                                width: '120px',
                                                height: '120px',
                                                objectFit: 'contain'
                                              }}
                                            />
                                            <p
                                              style={{
                                                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                                fontSize: product.name === 'NOIR' ? '22px' : '21px',
                                                color: '#000000',
                                                marginTop: '4px',
                                                marginBottom: '0',
                                                textTransform: 'uppercase',
                                                textAlign: 'center',
                                                lineHeight: '1.1'
                                              }}
                                            >
                                              {product.name.replace(/WIG/gi, '').trim()}
                                            </p>
                                            <p
                                              style={{
                                                fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif',
                                                fontSize: '9px',
                                                color: '#EB1C24',
                                                marginTop: '3px',
                                                marginBottom: 0,
                                                textTransform: 'uppercase',
                                                textAlign: 'center',
                                                lineHeight: '1.1'
                                              }}
                                            >
                                              {`${lengthVal} RAW ${getHairOrigin(product.name)}`}
                                            </p>
                                            <p
                                              style={{
                                                fontFamily: '"Futura PT Demi", Futura, Inter, sans-serif',
                                                fontSize: '9px',
                                                color: '#808080',
                                                marginTop: '6px',
                                                marginBottom: 0,
                                                textTransform: 'uppercase',
                                                textAlign: 'center',
                                                lineHeight: '1.1'
                                              }}
                                            >
                                              ${product.price.toLocaleString()}
                                            </p>
                                            {nonDefaultDetails.length > 0 ? (
                                              <div style={{ marginTop: '4px', textAlign: 'center' }}>
                                                {nonDefaultDetails.map((line: string, idx: number) => (
                                                  <div
                                                    key={idx}
                                                    style={{
                                                      fontFamily: '"Futura PT Book", Futura, Inter, sans-serif',
                                                      fontSize: '9px',
                                                      color: '#000000',
                                                      marginTop: idx === 0 ? 0 : '4px',
                                                      marginBottom: 0,
                                                      textTransform: 'uppercase',
                                                      lineHeight: '1.2'
                                                    }}
                                                  >
                                                    {line}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div style={{ marginBottom: '24px' }}>
                                    <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                                      <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>ORDER SUMMARY</h4>
                                      <img src={summaryIcon} alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <div className="flex justify-between">
                                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER DATE</span>
                                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{expandedOrder.date || '—'}</span>
                                      </div>
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
                                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER NUMBER</span>
                                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{(expandedOrder.orderNumber || expandedOrder.id || '—').toString().replace(/^ORDER\s+/i, '')}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER TOTAL</span>
                                        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>${(expandedOrder.total ?? 0).toLocaleString()}</span>
                                      </div>
                                      {(() => {
                                        const subtotalVal = (expandedOrder as any).subtotal ?? subtotal;
                                        const totalVal = expandedOrder.total ?? 0;
                                        const explicitSavings = (expandedOrder as any).savings;
                                        const computedSavings = subtotalVal != null && subtotalVal > totalVal ? subtotalVal - totalVal : 0;
                                        const discountSum = discounts.reduce((sum: number, d: any) => sum + (typeof d.amount === 'number' && d.amount < 0 ? Math.abs(d.amount) : 0), 0);
                                        const savingsAmount = explicitSavings ?? computedSavings ?? discountSum;
                                        if (savingsAmount <= 0) return null;
                                        return (
                                          <div className="flex justify-between">
                                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>SAVINGS</span>
                                            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', textTransform: 'uppercase' }}>-${savingsAmount.toLocaleString()} USD</span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  {selectedClient && (
                                    <>
                                    <div style={{ marginTop: '24px' }}>
                                      <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                                        <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>SHIPPING</h4>
                                        <img src="/assets/ship-icon.svg" alt="" style={{ width: 12.75, height: 12.75, opacity: 1 }} />
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div className="flex justify-between">
                                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>COMPLETION TIMELINE</span>
                                          <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                            {expandedOrder.date ? calculateProcessingTimeline(expandedOrder.date, (expandedOrder as any).processingTime || '6-8 WEEKS') : ((expandedOrder as any).processingTime || '6-8 WEEKS')}
                                          </span>
                                        </div>
                                        {(expandedOrder as any).trackingNumber && (() => {
                                          const shipCountry = (selectedClient.defaultAddress || selectedClient.shippingAddress)?.country || '';
                                          const isDomestic = !shipCountry || /^US$|^USA$|^UNITED\s*STATES($|\s+OF\s+AMERICA)/i.test(String(shipCountry).trim());
                                          const trackingUrl = isDomestic ? `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${encodeURIComponent((expandedOrder as any).trackingNumber)}` : `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent((expandedOrder as any).trackingNumber)}`;
                                          return (
                                            <div className="flex justify-between">
                                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>TRACKING NUMBER</span>
                                              <a href={trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase', cursor: 'pointer' }}>
                                                {(expandedOrder as any).trackingNumber}
                                              </a>
                                            </div>
                                          );
                                        })()}
                                        {(() => {
                                          const shipCountry = (selectedClient.defaultAddress || selectedClient.shippingAddress)?.country || '';
                                          const isDomestic = !shipCountry || /^US$|^USA$|^UNITED\s*STATES($|\s+OF\s+AMERICA)/i.test(String(shipCountry).trim());
                                          return (
                                            <div className="flex justify-between">
                                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>CARRIER</span>
                                              <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{isDomestic ? 'DOMESTIC' : 'INTERNATIONAL'}</span>
                                            </div>
                                          );
                                        })()}
                                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                                          {(selectedClient.firstName || '')} {(selectedClient.lastName || '')}
                                        </p>
                                        {(() => {
                                          const addr = selectedClient.defaultAddress || selectedClient.shippingAddress;
                                          if (addr && typeof addr === 'object') {
                                            return (
                                              <>
                                                {(addr.address || '').trim() && <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{(addr.address || '').toUpperCase()}</p>}
                                                {[addr.city, addr.state, addr.zip].filter(Boolean).length > 0 && (
                                                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                                                    {[addr.city, [addr.state, addr.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ').toUpperCase()}
                                                  </p>
                                                )}
                                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                                                  {formatCountryDisplay(addr.country)}
                                                </p>
                                              </>
                                            );
                                          }
                                          const addrStr = (selectedClient.address || '').toString().toUpperCase();
                                          if (!addrStr) return null;
                                          const parts = addrStr.split(', ');
                                          if (parts.length >= 3) {
                                            return (
                                              <>
                                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{parts[0]}</p>
                                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{parts.slice(1).join(', ')}</p>
                                                <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{formatCountryDisplay((selectedClient.defaultAddress || selectedClient.shippingAddress)?.country)}</p>
                                              </>
                                            );
                                          }
                                          return (
                                            <>
                                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{addrStr}</p>
                                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{formatCountryDisplay((selectedClient.defaultAddress || selectedClient.shippingAddress)?.country)}</p>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                    <div style={{ marginTop: '24px' }}>
                                      <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                                        <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>PAYMENT</h4>
                                        <img src="/assets/payment-icon.svg" alt="" style={{ width: 14.25, height: 14.25, opacity: 1 }} />
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {(() => {
                                          let methodName = '';
                                          let last4 = '';
                                          let cardDigits = '';
                                          const fromOrder = (expandedOrder as any)?.paymentMethod;
                                          if (fromOrder) {
                                            const str = String(fromOrder);
                                            const endingMatch = str.match(/ENDING IN (\d+)/i);
                                            last4 = endingMatch ? endingMatch[1] : '';
                                            cardDigits = str.replace(/\D/g, '');
                                            let brandPart = str.replace(/\s*ENDING IN \d+.*$/i, '').trim().replace(/_/g, ' ');
                                            const bp = brandPart.toUpperCase();
                                            if (bp === 'EXPRESS' || bp === 'AMEX') methodName = 'AMERICAN EXPRESS';
                                            else if (bp === 'VISA' || bp === 'MASTERCARD' || bp === 'DISCOVER') methodName = bp;
                                            else if (brandPart) methodName = bp;
                                          }
                                          if (!methodName || !last4) {
                                            const def = selectedClient.defaultPaymentMethod;
                                            if (def && def.cardNumber) {
                                              cardDigits = String(def.cardNumber).replace(/\D/g, '');
                                              last4 = cardDigits.slice(-4);
                                              const b = (def.cardBrand || '').toUpperCase().replace(/_/g, ' ');
                                              if (b === 'EXPRESS' || b === 'AMEX') methodName = 'AMERICAN EXPRESS';
                                              else if (b === 'VISA' || b === 'MASTERCARD' || b === 'DISCOVER') methodName = b;
                                              else if (b) methodName = b;
                                            }
                                          }
                                          if (!methodName && cardDigits.length > 0) {
                                            const first = cardDigits.charAt(0);
                                            if (first === '4') methodName = 'VISA';
                                            else if (first === '5') methodName = 'MASTERCARD';
                                            else if (first === '3') methodName = 'AMERICAN EXPRESS';
                                            else if (first === '6') methodName = 'DISCOVER';
                                          }
                                          if (!methodName) methodName = 'CARD';
                                          if (!last4) last4 = '****';
                                          return (
                                            <div className="flex justify-between">
                                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>{methodName}</span>
                                              <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>ENDING IN {last4}</span>
                                            </div>
                                          );
                                        })()}
                                        {((expandedOrder as any).discountCode ?? (expandedOrder as any).discount_code ?? (expandedOrder as any).discount) && (
                                          <div className="flex justify-between">
                                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>DISCOUNT CODE</span>
                                            <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).discountCode ?? (expandedOrder as any).discount_code ?? (expandedOrder as any).discount).toUpperCase()}</span>
                                          </div>
                                        )}
                                        {((expandedOrder as any).giftCard ?? (expandedOrder as any).gift_card ?? (expandedOrder as any).giftCardNumber ?? (expandedOrder as any).giftCardCode) && (
                                          <div className="flex justify-between">
                                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>GIFT CARD</span>
                                            <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).giftCard ?? (expandedOrder as any).gift_card ?? (expandedOrder as any).giftCardNumber ?? (expandedOrder as any).giftCardCode).toUpperCase()}</span>
                                          </div>
                                        )}
                                        {((expandedOrder as any).referralCode ?? (expandedOrder as any).referral_code) && (
                                          <div className="flex justify-between">
                                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>REFERRAL CODE</span>
                                            <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{String((expandedOrder as any).referralCode ?? (expandedOrder as any).referral_code).toUpperCase()}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>CONFIRMATION EMAIL</span>
                                          <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{(selectedClient.email || '').toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>CONFIRMATION NUMBER</span>
                                          <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                            #{(() => {
                                              const raw = (expandedOrder.orderNumber || expandedOrder.id || '').toString();
                                              const orderNum = raw.replace(/^ORDER\s*#?\s*/i, '').trim();
                                              const key = orderNum ? (orderNum.startsWith('#') ? orderNum : `#${orderNum}`) : null;
                                              if (key) {
                                                try {
                                                  const orderConfirmations = JSON.parse(localStorage.getItem('orderConfirmations') || '{}');
                                                  const stored = orderConfirmations[key] || orderConfirmations[expandedOrder.orderNumber];
                                                  if (stored) return stored;
                                                } catch {}
                                              }
                                              const onOrder = (expandedOrder as any).confirmationNumber;
                                              if (onOrder) return onOrder;
                                              const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                              const seed = orderNum ? orderNum.replace(/\D/g, '') : '0';
                                              let hash = 0;
                                              for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                                              let gen = '';
                                              for (let i = 0; i < 6; i++) { gen += chars[Math.abs((hash + i) % chars.length)]; }
                                              return gen;
                                            })()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div style={{ marginTop: '24px' }}>
                                      <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                                        <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>REWARDS</h4>
                                        <img src="/assets/rewards-icon.svg" alt="" style={{ width: 15, height: 15, opacity: 1, filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div className="flex justify-between items-center">
                                          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                                            YOU&apos;VE EARNED <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{((expandedOrder as any).pointsEarned ?? selectedClient?.loyaltyPoints ?? (expandedOrder.subtotal != null ? expandedOrder.subtotal : expandedOrder.total) ?? 0).toLocaleString()}</span> LOYALTY POINTS{((expandedOrder as any).pointsEarned ?? selectedClient?.loyaltyPoints ?? (expandedOrder.subtotal != null ? expandedOrder.subtotal : expandedOrder.total) ?? 0) === 0 ? '.' : '!'}
                                          </p>
                                          <span style={{
                                            fontFamily: (() => { const t = ((expandedOrder as any).tier || selectedClient?.currentTierName || getEffectiveTierName(selectedClient) || 'SILVER').toString().toUpperCase(); return (t === 'RED' || t === 'BLACK') ? '"Futura PT Medium"' : '"Futura PT Demi"'; })(),
                                            fontSize: '10px',
                                            color: (() => { const t = ((expandedOrder as any).tier || selectedClient?.currentTierName || getEffectiveTierName(selectedClient) || 'SILVER').toString().toUpperCase(); if (t === 'RED') return '#EB1C24'; if (t === 'SILVER') return '#808080'; if (t === 'BLACK') return '#000000'; return '#808080'; })(),
                                            textTransform: 'uppercase'
                                          }}>
                                            {((expandedOrder as any).tier || selectedClient?.currentTierName || getEffectiveTierName(selectedClient) || 'SILVER').toString().toUpperCase()} TIER
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    </>
                                  )}
                                </div>
                              );
                            })(                            ) : (
                              selectedOrderHistory.map((order: any, index: number) => {
                                const rawOrder = selectedRawOrders.find((o: any) => o.id === order.id);
                                const itemCount = rawOrder?.items ?? (rawOrder?.lineItems?.length) ?? 1;
                                const firstItemImage = (() => {
                                  if (rawOrder?.lineItems?.[0]?.productName) {
                                    return getProductImage(rawOrder.lineItems[0].productName);
                                  }
                                  return rawOrder?.productImage || getProductImage((rawOrder?.productName || order?.productName || 'NOIR').toString());
                                })();
                                return (
                                <div
                                  key={order.id || index}
                                  className="bg-white border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => setExpandedOrderId(order.id)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedOrderId(order.id); } }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                                >
                                  {/* Thumbnail + items (same as account/orders page) */}
                                  <div className="flex flex-col items-center" style={{ flexShrink: 0, transform: 'translateX(-12px)' }}>
                                    <img
                                      src={firstItemImage}
                                      alt=""
                                      style={{
                                        width: '85px',
                                        height: '85px',
                                        objectFit: 'contain'
                                      }}
                                    />
                                    <p
                                      style={{
                                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                        color: '#EB1C24',
                                        fontSize: '12px',
                                        margin: '2px 0 0 0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
                                    </p>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: 'translate(-10px, -12px)' }}>
                                    <p className="text-xs" style={{ fontFamily: '"Covered By Your Grace", cursive', fontSize: '16px', color: '#000000', margin: 0, lineHeight: 1.25 }}>{order.date}</p>
                                    <div style={{ marginTop: '2px' }}>
                                      <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: 0 }}>{(() => {
                                        const raw = (rawOrder?.orderNumber || order.id || '').toString();
                                        const num = raw.replace(/^ORDER\s*#?\s*/i, '').trim() || raw.replace(/^#/, '');
                                        return num ? `ORDER #${num}` : '—';
                                      })()}</h4>
                                    </div>
                                    <p className="text-sm mt-1" style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: 0, marginTop: '2px', transform: 'translateY(-4px)' }}>${order.amount.toLocaleString()}</p>
                                    {(() => {
                                      const s = (order.status || '').toUpperCase();
                                      const isDelivered = s === 'DELIVERED';
                                      const deliveredTs = rawOrder?.deliveredAt ?? (order as any).deliveredAt;
                                      const orderDateStr = (rawOrder?.date ?? order.date) || '';
                                      const processingTime = rawOrder?.processingTime || '6-8 WEEKS';
                                      const dueBy = getDueByEndDate(orderDateStr, processingTime);
                                      if (isDelivered && deliveredTs != null) {
                                        const text = formatDeliveredOn(deliveredTs);
                                        return text ? <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#000000', margin: 0, marginTop: '-4px' }}>{text}</p> : null;
                                      }
                                      return dueBy ? <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#000000', margin: 0, marginTop: '-4px' }}>DUE {dueBy}</p> : null;
                                    })()}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, transform: 'translateX(-6px)' }}>
                                    {(() => {
                                      const s = (order.status || '').toUpperCase().replace(/\s+/g, ' ');
                                      const pillStyle: Record<string, string> = {
                                        height: '15px',
                                        padding: '0 6px',
                                        boxSizing: 'border-box',
                                        borderRadius: '2px',
                                        fontFamily: '"Futura PT Medium"',
                                        fontSize: '8px',
                                        ...(s === 'DELIVERED' ? { backgroundColor: 'rgba(235, 28, 36, 0.15)', color: '#EB1C24' }
                                          : s === 'SHIPPED' ? { backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#15803d' }
                                          : s === 'AWAITING FORM' || s === 'AWAITING ORDER FORM' ? { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#a16207' }
                                          : s === 'CANCELED' || s === 'CANCELLED' ? { backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' }
                                          : { backgroundColor: '#f3f4f6', color: '#808080' }),
                                      };
                                      const displayStatus = s === 'AWAITING ORDER FORM' ? 'AWAITING FORM' : order.status;
                                      return (
                                        <span className="admin-order-status-pill" style={pillStyle}>
                                          <span style={{ lineHeight: 1 }}>{displayStatus}</span>
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                                );
                              })
                            )}
                          </div>
                        )}
                        {detailsTab === 'appointments' && (
                          <div style={{ marginTop: '6px' }}>
                            {appointments.length === 0 ? (
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '11px',
                                  color: '#808080',
                                  textAlign: 'center',
                                  padding: '16px',
                                }}
                              >
                                NO APPOINTMENTS OR CONSULTS YET
                              </p>
                            ) : (
                              appointments.map((m) => (
                                <AdminMeetingClientPanelShell key={m.id}>
                                  <AdminMeetingClientPanel
                                    m={m}
                                    variant={m.category === 'consultation' ? 'consults' : 'bookings'}
                                    disableProfileNavigation
                                    hideProfileAvatar
                                    onProfileClick={() => {}}
                                    onActionClick={(e) => e.preventDefault()}
                                    actionAriaLabel=""
                                    onConsultPhotoClick={setClientDetailsConsultPhotoPreviewSrc}
                                  />
                                </AdminMeetingClientPanelShell>
                              ))
                            )}
                          </div>
                        )}
                        {detailsTab === 'messages' && selectedClient && (() => {
                          const email = (selectedClient.email || '').trim().toLowerCase();
                          let messages: Array<{ id: string; message: string; timestamp?: string | number; type?: string; subject?: string }> = [];
                          try {
                            const priorityRaw = localStorage.getItem('adminPriorityMessages');
                            const priorityList = priorityRaw ? JSON.parse(priorityRaw) : [];
                            if (Array.isArray(priorityList)) {
                              messages = priorityList
                                .filter((m: any) => String(m.userId || m.userEmail || '').toLowerCase() === email)
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
                              {messages.length === 0 ? (
                                <div className="text-center py-4">
                                  <p style={{ fontSize: '11px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', color: '#808080', textTransform: 'uppercase', margin: 0 }}>
                                    NO MESSAGES OR SUPPORT EMAILS YET.
                                  </p>
                                </div>
                              ) : (
                                <div style={{ paddingBottom: '24px' }}>
                                  <div className="space-y-3 max-h-64 overflow-y-auto" style={{ paddingTop: '2px' }}>
                                  {messages.map((m) => (
                                    <div key={String(m.id)} className="py-3 border-b border-gray-100 last:border-0">
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
                {/* Summary cards above tabs */}
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
                      {totalClientsCount}
                    </p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                      TOTAL CLIENTS
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
                      {totalMembersCount}
                    </p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                      TOTAL MEMBERS
                    </p>
                  </div>
                </div>
                {/* Tabs: ALL, REVIEWS, REWARDS, INVITES – same spacing as marketing page */}
                <div className="flex flex-wrap justify-center gap-[14px] px-5">
                  {TABS.map((tab) => (
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
                        cursor: 'pointer'
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
                  <div className="relative" style={{ paddingLeft: '10px', marginLeft: '6px' }}>
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
                          className="absolute left-0 py-1 bg-white border border-black shadow-lg z-20 min-w-[120px] max-h-60 overflow-y-auto"
                        style={{ borderWidth: '1.3px', marginTop: '7px' }}
                      >
                        {SORT_OPTIONS.filter((opt) => opt !== sortOption).map((opt) => (
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
                              color: '#000',
                              fontWeight: 400,
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
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>REFERRAL</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>STATUS</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>INVITES</div>
                    </>
                  ) : activeTab === 'REWARDS' ? (
                    <>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>PHOTOS</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>VIDEOS</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>TAGS</div>
                    </>
                  ) : activeTab === 'REVIEWS' ? (
                    <>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>TOTAL</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>MEDIA</div>
                      <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>PENDING</div>
                    </>
                  ) : (
                    <>
                  <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }} title="Unfulfilled orders — not shipped or delivered yet">NEW</div>
                  <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>ORDERS</div>
                  <div className="flex justify-center w-full" style={{ textAlign: 'center', marginLeft: '-6px' }}>CHARGES</div>
                    </>
                  )}
                </div>

                {/* Client rows – padding below scroll viewport (above card bottom) */}
                <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                  <div
                    ref={clientsListScrollElRef}
                    className="overflow-y-auto overflow-x-hidden min-w-0"
                    style={{
                      maxHeight: '380px',
                      paddingTop: '2px',
                      boxSizing: 'border-box',
                    }}
                  >
                  {registeredUsers.length === 0 ? (
                    <div className="px-5 py-8 text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>
                      NO REGISTERED CLIENTS YET. LIST IS PER BROWSER.
                    </div>
                  ) : clientsFilteredBySearch.length === 0 ? (
                    <div className="px-5 py-8 text-center" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>
                      {clientSearchQuery.trim() ? 'NO CLIENTS MATCH YOUR SEARCH.' : 'NO CLIENTS MATCH THIS FILTER.'}
                    </div>
                  ) : activeTab === 'INVITES' ? (
                    clientsFilteredBySearch.map((u: any, i: number) => {
                      const row = getInvitesRow(u, i);
                      return (
                        <div key={u.email || u.id || i} className="bg-white border border-gray-200 px-4 py-3 mb-2">
                          <div
                            className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-sm items-start"
                            style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                          >
                            <button
                              type="button"
                              onClick={() => openClientDetails(u.email)}
                              className="min-w-0 text-left w-full bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center"
                              style={{ paddingLeft: '8px' }}
                            >
                              <span className="font-medium block truncate" style={{ fontSize: '12px', color: '#EB1C24' }}>
                                {row.index}. {row.name}
                              </span>
                              <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', marginTop: '2px' }}>
                                {getMembershipTierLabel(u)}
                              </span>
                            </button>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', textAlign: 'right', marginRight: '2px' }}>{row.referralNumber}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: row.status === 'ACTIVE' ? '"Futura PT Book"' : '"Futura PT Medium"', fontSize: '11px', color: row.status === 'ACTIVE' ? '#EB1C24' : '#808080', textAlign: 'right', marginRight: '2px' }}>{row.status}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: Number(row.invitesCount) !== 0 ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>
                              {row.invitesCount}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : activeTab === 'REVIEWS' ? (
                    clientsFilteredBySearch.map((u: any, i: number) => {
                      const row = getReviewsTabRow(u, i);
                      return (
                        <div key={u.email || u.id || i} className="bg-white border border-gray-200 px-4 py-3 mb-2">
                          <div
                            className="grid gap-2 text-sm items-start"
                            style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                          >
                            <button
                              type="button"
                              onClick={() => openClientDetails(u.email)}
                              className="min-w-0 text-left w-full bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center"
                              style={{ paddingLeft: '8px' }}
                            >
                              <span className="font-medium block truncate" style={{ fontSize: '12px', color: '#EB1C24' }}>
                                {row.index}. {row.name}
                              </span>
                              <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', marginTop: '2px' }}>
                                {getMembershipTierLabel(u)}
                              </span>
                            </button>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: Number(row.totalReviews) !== 0 ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>{row.totalReviews}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: Number(row.reviewsWithPhotosVideos) !== 0 ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>{row.reviewsWithPhotosVideos}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: Number(row.pendingReviews) !== 0 ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>{row.pendingReviews}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : activeTab === 'REWARDS' ? (
                    clientsFilteredBySearch.map((u: any, i: number) => {
                      const row = getRewardsRow(u, i);
                      return (
                        <div key={u.email || u.id || i} className="bg-white border border-gray-200 px-4 py-3 mb-2">
                          <div
                            className="grid gap-2 text-sm items-start"
                            style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                          >
                            <button
                              type="button"
                              onClick={() => openClientDetails(u.email)}
                              className="min-w-0 text-left w-full bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center"
                              style={{ paddingLeft: '8px' }}
                            >
                              <span className="font-medium block truncate" style={{ fontSize: '12px', color: '#EB1C24' }}>
                                {row.index}. {row.name}
                              </span>
                              <span className={`block truncate ${(u.membershipType || '').toString().toUpperCase() === 'PREMIUM' ? 'text-black' : 'text-gray-500'}`} style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '13px', marginTop: '2px' }}>
                                {getMembershipTierLabel(u)}
                              </span>
                            </button>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: Number(row.photosCount) !== 0 ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>{row.photosCount}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: Number(row.videosCount) !== 0 ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>{row.videosCount}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: Number(row.tagsCount) !== 0 ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>{row.tagsCount}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    clientsFilteredBySearch.map((u: any, i: number) => {
                      const row = getClientRow(u, i);
                      return (
                        <div key={u.email || u.id || i} className="bg-white border border-gray-200 px-4 py-3 mb-2">
                          <div
                            className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-sm items-start"
                            style={{ gridTemplateColumns: '1fr 3.5rem 3.5rem 3.5rem', marginLeft: '-4px' }}
                          >
                            <button
                              type="button"
                              onClick={() => openClientDetails(u.email)}
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
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: (row.newCount !== 0 && row.newCount !== '0') ? '#EB1C24' : '#000000', textAlign: 'right', marginRight: '2px' }}>{row.newCount}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: '#000000', textAlign: 'right', marginRight: '2px' }}>{row.ordersCount}</div>
                            <div className="flex items-center justify-end w-full" style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', textAlign: 'right', marginRight: '2px' }}>
                              ${row.charges.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                </div>
                  </>
                )}
              </div>

              {selectedClientEmail && selectedClient && detailsTab === 'orders' && expandedOrderId && (() => {
                const expandedOrder = selectedRawOrders.find((o: any) => o.id === expandedOrderId);
                const status = (expandedOrder?.status || '').toUpperCase();
                const isCancellable = expandedOrder && status !== 'DELIVERED' && status !== 'SHIPPED' && status !== 'CANCELED';
                if (!isCancellable) return null;
                return (
                  <button
                    type="button"
                    onClick={() => setShowCancelOrderConfirm(true)}
                    className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                    style={{ ...pageActionButtonStyle, marginTop: '14px' }}
                  >
                    CANCEL ORDER
                  </button>
                );
              })()}
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
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/clients/deleted')}
                    className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                    style={{ ...pageActionButtonStyle, marginTop: '14px' }}
                  >
                    VIEW DELETED ACCOUNTS
                  </button>
                  {isSupabaseConfigured() && (
                    <button
                      type="button"
                      disabled={exportingCsv}
                      onClick={async () => {
                        setExportingCsv(true);
                        try {
                          const url = await exportClientsCsv();
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'clients-export.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch {
                          /* ignore */
                        } finally {
                          setExportingCsv(false);
                        }
                      }}
                      className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                      style={{ ...pageActionButtonStyle, marginTop: '14px' }}
                    >
                      {exportingCsv ? 'Exporting…' : 'EXPORT CSV'}
                    </button>
                  )}
                </>
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
            closeClientDetails();
            setShowBlockConfirm(false);
            if (returnTo === 'reviews') navigate('/admin/reviews');
            else if (returnTo !== 'meetings') navigate('/admin/clients');
          }
        }}
        title="BLOCK CLIENT?"
        message="YOU WILL BAN THIS CLIENT AND ANY SIMILAR ACCOUNTS."
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="block-client-confirm"
      />
      <ConfirmationModal
        isOpen={showCancelOrderConfirm}
        onClose={() => setShowCancelOrderConfirm(false)}
        onConfirm={() => {
          const email = (selectedClientEmail || '').trim().toLowerCase();
          if (!email || !expandedOrderId) {
            setShowCancelOrderConfirm(false);
            setExpandedOrderId(null);
            return;
          }
          try {
            const raw = localStorage.getItem(`userOrders_${email}`);
            const data = raw ? JSON.parse(raw) : null;
            if (data && (Array.isArray(data.activeOrders) || Array.isArray(data.pastOrders))) {
              const active = [...(data.activeOrders || [])];
              const past = [...(data.pastOrders || [])];
              const id = expandedOrderId;
              const inActiveIdx = active.findIndex((o: any) => (o.id || '').toString() === (id || '').toString());
              const inPastIdx = past.findIndex((o: any) => (o.id || '').toString() === (id || '').toString());
              const canceledOrder = { status: 'CANCELED', canceledAt: new Date().toISOString() };
              if (inActiveIdx >= 0) {
                const [order] = active.splice(inActiveIdx, 1);
                past.push({ ...order, ...canceledOrder });
              } else if (inPastIdx >= 0) {
                past[inPastIdx] = { ...past[inPastIdx], ...canceledOrder };
              }
              localStorage.setItem(`userOrders_${email}`, JSON.stringify({ ...data, activeOrders: active, pastOrders: past }));
            }
          } catch {
            // ignore
          }
          setExpandedOrderId(null);
          setShowCancelOrderConfirm(false);
        }}
        title="CANCEL ORDER?"
        message="THIS ORDER WILL BE MARKED AS CANCELLED AND REFUNDED."
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="cancel-order-confirm"
      />
      <ImageViewerModal
        isOpen={showMediaViewer}
        onClose={() => setShowMediaViewer(false)}
        images={mediaViewerUrls}
        currentIndex={mediaViewerIndex}
        onNavigate={setMediaViewerIndex}
      />
      {/* Enlarged profile image — same overlay + circular frame as Account → Profile */}
      {showEnlargedProfileImage && selectedClient && !profilePhotoError && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={() => setShowEnlargedProfileImage(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedClientProfilePhotoSrc}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '50%',
                border: '1.3px solid #000',
              }}
            />
          </div>
        </div>
      )}
      {clientDetailsConsultPhotoPreviewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setClientDetailsConsultPhotoPreviewSrc(null)}
          role="presentation"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              border: '1.3px solid #000',
              background: '#fff',
              padding: '10px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <img
              src={clientDetailsConsultPhotoPreviewSrc}
              alt="Consult submitted photo preview"
              style={{
                width: '100%',
                maxHeight: 'calc(90vh - 20px)',
                objectFit: 'contain',
                display: 'block',
                background: '#f3f4f6',
              }}
            />
          </div>
        </div>
      )}
      {showInvitesPopup && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
          onClick={() => setShowInvitesPopup(false)}
          aria-hidden="true"
        >
          <div
            className="p-4 overflow-hidden bg-white"
            style={{
              maxWidth: '360px',
              width: '90%',
              maxHeight: '85vh',
              border: '1.3px solid black',
              borderRadius: 0,
              transform: 'translateY(-6px)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center flex-shrink-0" style={{ marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase', fontWeight: 500, textAlign: 'left' }}>INVITE HISTORY</p>
              <button
                type="button"
                onClick={() => setShowInvitesPopup(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                aria-label="Close"
              >
                <img src="/assets/points-history.svg" alt="" style={{ width: '16px', height: '16px', flexShrink: 0, objectFit: 'contain', filter: 'invert(27%) sepia(98%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
              </button>
            </div>
            <div
              className="flex-1 min-h-0 flex flex-col"
              style={{
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingBottom: '24px',
                boxSizing: 'border-box',
                minHeight: 0,
              }}
            >
              <div
                className="overflow-y-auto flex-1 min-h-0"
                style={{
                  fontSize: '10px',
                  paddingTop: '8px',
                  boxSizing: 'border-box',
                }}
              >
              {invitesDetailRows.length === 0 ? (
                <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', margin: 0, textAlign: 'center', padding: '16px 0', textTransform: 'uppercase' }}>THERE ARE NO INVITES YET.</p>
              ) : (
                <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: '"Futura PT Book"' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '5px 10px', fontFamily: '"Futura PT Medium"', fontWeight: 500, color: '#000000', fontSize: '10px', textTransform: 'uppercase' }}>DATE USED</th>
                      <th style={{ textAlign: 'center', padding: '5px 10px', fontFamily: '"Futura PT Medium"', fontWeight: 500, color: '#000000', fontSize: '10px', textTransform: 'uppercase' }}>CLIENT</th>
                      <th style={{ textAlign: 'center', padding: '5px 10px', fontFamily: '"Futura PT Medium"', fontWeight: 500, color: '#000000', fontSize: '10px', textTransform: 'uppercase' }}>INVITES</th>
                      <th style={{ textAlign: 'right', padding: '5px 10px', fontFamily: '"Futura PT Medium"', fontWeight: 500, color: '#000000', fontSize: '10px', textTransform: 'uppercase' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitesDetailRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: '5px 10px', color: '#000000', fontSize: '10px', fontFamily: '"Futura PT Book"', textTransform: 'uppercase' }}>{row.dateUsed.toUpperCase()}</td>
                        <td style={{ padding: '5px 10px', color: '#808080', fontSize: '10px', fontFamily: '"Futura PT Medium"', textTransform: 'uppercase', textAlign: 'center' }}>{row.userName}</td>
                        <td style={{ padding: '5px 10px', color: row.inviteCount >= 1 ? '#EB1C24' : '#000000', fontSize: '10px', fontFamily: '"Futura PT Book"', textAlign: 'center' }}>{row.inviteCount}</td>
                        <td style={{ padding: '5px 10px', color: '#15803d', fontSize: '10px', fontFamily: '"Futura PT Medium"', textAlign: 'right' }}>+${row.spent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
