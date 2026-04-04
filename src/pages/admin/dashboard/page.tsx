import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import ActivityFeed from '../components/ActivityFeed';
import { getAdminDashboard, getAdminClients, getAdminPending, getAdminReviews, getAdminReferrals, getAdminMeetings } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail, getEffectiveTierName, isAyoteenzAdminAccount } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { getMockClientsForAyoteenz, getMockOrdersForClient, isClientNewsletterSubscribed } from '../clients/page';
import { isClientBlocked } from '../../../utils/blockedClients';
import { getClientUnreadPriorityMessage } from '../../../utils/priorityMessages';
import { buildRevenueOrdersList, getDepletedInventory, getOrdersStats, getTopProductBySales, getTotalStartingInventoryUnits } from '../../../utils/adminRevenueStats';
import { ADMIN_DASHBOARD_WORKERS } from '../../../utils/adminWorkersDashboard';
import {
  endOfMonth,
  generateMockMeetingsForRange,
  loadLocalMeetings,
  normalizeApiMeeting,
  startOfMonth,
  type AdminMeeting,
} from '../../../utils/adminMeetingsMock';

/** Items list fixed height (px) for all dashboard stat cards (scroll when content overflows). */
const DASHBOARD_CAPPED_STAT_ITEMS_MAX_PX = 103;

type WorkersDashboardStatItem = { label: string; value: string; color?: string };

/** Key metrics for WORKERS card (roster lives in `adminWorkersDashboard.ts`). Defined here to avoid named-export resolution issues in some bundlers. */
function buildWorkersDashboardSummaryItems(): WorkersDashboardStatItem[] {
  const list = ADMIN_DASHBOARD_WORKERS;
  const n = list.length;
  if (n === 0) {
    return [{ label: 'ROSTER', value: 'ADD STAFF IN UTIL', color: 'text-red-500' }];
  }

  const salaryCount = list.filter((w) => /salary/i.test(w.pay)).length;
  const hourlyCount = list.filter(
    (w) => !/salary/i.test(w.pay) && (/\$/.test(w.pay) || /\/\s*hr/i.test(w.pay))
  ).length;
  const otherCount = Math.max(0, n - salaryCount - hourlyCount);
  const payParts: string[] = [];
  if (hourlyCount > 0) payParts.push(`${hourlyCount} HOURLY`);
  if (salaryCount > 0) payParts.push(`${salaryCount} SALARY`);
  if (otherCount > 0) payParts.push(`${otherCount} OTHER`);
  const paySummary = payParts.length > 0 ? payParts.join(' · ') : 'SET PAY IN UTIL';

  const withContact = list.filter((w) => (w.contact || '').trim()).length;

  return [
    { label: 'ROSTER', value: `${n} ON TEAM`, color: 'text-red-500' },
    {
      label: 'POSITIONS',
      value: `${n} BRAND ROLES (CAREERS)`,
      color: 'text-gray-500',
    },
    { label: 'COMP', value: paySummary, color: 'text-gray-500' },
    { label: 'CONTACTS', value: `${withContact}/${n} ON FILE`, color: 'text-gray-500' },
    { label: 'DETAIL', value: 'WORKERS ROSTER · BRAND/CAREERS APPLY · TAP ROLE FOR APPS', color: 'text-red-500' },
  ];
}

// Mock data types and functions to replace Supabase imports
type DashboardStats = {
  activeClients: number;
  clientsWithDeliveredOrder?: number;
  referralCount: number;
  signUpsThisMonth?: number;
  totalRevenue?: number;
  totalOrders?: number;
  pendingForms?: number;
};

type Client = Record<string, unknown>;

type Booking = {
  status: string;
  appointment_date: string;
  service_name: string;
  client_name: string;
};

type Revenue = {
  transaction_date: string;
  amount: number;
  status: string;
};

type Notification = {
  id: number;
  text: string;
};

/** Normalize mock order date "MM-DD-YYYY" or "M/D/YYYY" to "YYYY-MM-DD" for revenue/transaction_date. */
function mockOrderDateToIso(dateStr: string): string {
  const parts = (dateStr || '').trim().split(/[-/]/);
  if (parts.length !== 3) return new Date().toISOString().slice(0, 10);
  const [m, d, y] = parts.map((p) => p.trim());
  const pad = (n: string) => n.padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Build full mock dashboard data from getMockClientsForAyoteenz + getMockOrdersForClient so admin cards track the same data/logic as the clients page. */
function buildMockDashboardData(): {
  stats: DashboardStats;
  clients: Client[];
  bookings: Booking[];
  revenue: Revenue[];
  notifications: Notification[];
  pendingReviews: number;
  orderForms: number;
  pendingItems: { label: string; value: string }[];
  totalReviews: number;
  averageRating: number;
  inviteeCount: number;
  meetings: Array<{ meetingDate?: string; meetingTime?: string; type?: string; clientName?: string }>;
} {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const mockClients = getMockClientsForAyoteenz();

  const activeClients = mockClients.length;
  const clientsWithDeliveredOrder = mockClients.filter(
    (c: any) => (c.ordersCount ?? 0) > (c.newCount ?? 0)
  ).length;
  const totalRevenue = mockClients.reduce((s: number, c: any) => s + (c.totalSpent ?? 0), 0);
  const totalOrders = mockClients.reduce((s: number, c: any) => s + (c.ordersCount ?? 0), 0);
  const referralCount = mockClients.filter(
    (c: any) => (c.invitesCount ?? 0) > 0 || (c as any).referralNumber
  ).length;
  const thirtyDaysAgo = now - 30 * day;
  const signUpsThisMonth = mockClients.filter(
    (c: any) => new Date(c.createdAt || 0).getTime() >= thirtyDaysAgo
  ).length;

  let pendingForms = 0;
  const allRevenueRows: { date: string; amount: number; status: string }[] = [];
  mockClients.forEach((c: any) => {
    const orders = getMockOrdersForClient(c);
    orders.forEach((o: any) => {
      const amt = o.amount ?? o.total ?? 0;
      const dateStr = o.date ? mockOrderDateToIso(o.date) : new Date().toISOString().slice(0, 10);
      const st = (o.status || '').toUpperCase();
      const status = st === 'AWAITING FORM' || st === 'IN PROGRESS' ? 'Pending' : 'Completed';
      if (st === 'AWAITING FORM') pendingForms += 1;
      allRevenueRows.push({ date: dateStr, amount: Number(amt), status });
    });
  });
  allRevenueRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const revenue = allRevenueRows.slice(0, 6).map((r) => ({
    transaction_date: r.date,
    amount: r.amount,
    status: r.status,
  }));

  const pendingReviews = mockClients.reduce((s: number, c: any) => s + (c.pendingReviews ?? 0), 0);
  const pendingItems = [
    { label: 'REVIEWS', value: String(pendingReviews) },
    { label: 'ORDER FORMS', value: String(pendingForms) },
    { label: 'TIER UPGRADES', value: '0' },
    { label: 'AFFILIATE', value: '0' },
  ];

  const totalReviews = mockClients.reduce((s: number, c: any) => s + (c.totalReviews ?? c.reviewsCount ?? 0), 0);
  const avgRating = activeClients > 0 ? 4.2 + (totalReviews % 10) * 0.02 : 0;
  const inviteeCount = mockClients.reduce((s: number, c: any) => s + (c.invitesCount ?? 0), 0);

  const serviceTypes = ['INSTALL', 'CONSULTATION', 'WIG & INSTALL', 'REINSTALL', 'VIRTUAL CLASS'];
  const bookings: Booking[] = [];
  const meetings: Array<{ meetingDate?: string; meetingTime?: string; type?: string; clientName?: string }> = [];
  mockClients
    .filter((c: any) => (c.bookingCount ?? 0) > 0)
    .slice(0, 8)
    .forEach((c: any, i: number) => {
      const d = new Date(now + (i + 1) * 2 * day);
      const dateStr = d.toISOString().slice(0, 10);
      const time = ['10:00', '14:30', '09:15', '16:45', '11:30', '13:00', '10:30', '15:00'][i % 8];
      const clientName = `${(c.firstName || '').trim()} ${(c.lastName || '').trim()}`.trim().toUpperCase() || (c.email || '').toUpperCase();
      const service = serviceTypes[i % serviceTypes.length];
      bookings.push({
        status: 'Scheduled',
        appointment_date: `${dateStr}T${time}:00`,
        service_name: service,
        client_name: clientName,
      });
      meetings.push({
        meetingDate: dateStr,
        meetingTime: time,
        type: service,
        clientName: clientName,
      });
    });

  return {
    stats: {
      activeClients,
      clientsWithDeliveredOrder,
      referralCount,
      signUpsThisMonth,
      totalRevenue,
      totalOrders,
      pendingForms,
    },
    clients: mockClients as Client[],
    bookings,
    revenue,
    notifications: [],
    pendingReviews,
    orderForms: pendingForms,
    pendingItems,
    totalReviews,
    averageRating: avgRating,
    inviteeCount,
    meetings,
  };
}

// Mock API – uses buildMockDashboardData() so fallback data is aligned with getMockClientsForAyoteenz and getMockOrdersForClient
const mockAPI = {
  setupDatabase: async () => Promise.resolve(),
  seedData: async () => Promise.resolve(),
  getDashboardData: async () => buildMockDashboardData(),
};

export default function AdminDashboard() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [notificationViewMode, setNotificationViewMode] = useState('list');
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    clients: Client[];
    bookings: Booking[];
    revenue: Revenue[];
    notifications: Notification[];
  } | null>(null);
  const [pendingData, setPendingData] = useState<{ pendingReviews: number; orderForms: number; pendingItems: { label: string; value: string }[] } | null>(null);
  const [reviewsData, setReviewsData] = useState<{ totalReviews: number; averageRating: number } | null>(null);
  const [_referralsData, setReferralsData] = useState<{ inviteeCount: number } | null>(null);
  const [apiMeetings, setApiMeetings] = useState<AdminMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data: from Supabase admin API when configured and admin, else mock
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        let currentUser: { email?: string } | null = null;
        try {
          const raw = localStorage.getItem('currentUser');
          currentUser = raw ? JSON.parse(raw) : null;
        } catch {
          /* ignore */
        }
        if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
          try {
            const [api, clientsFromClientsApi, pending, reviews, referrals, meetings] = await Promise.all([
              getAdminDashboard(),
              getAdminClients().then((r) => r.clients).catch(() => []),
              getAdminPending().catch(() => ({ pendingReviews: 0, orderForms: 0, pendingItems: [] })),
              getAdminReviews().catch(() => ({ reviews: [], averageRating: 0, totalReviews: 0 })),
              getAdminReferrals().catch(() => ({ log: [], totalEarned: 0, inviteeCount: 0, byReferrer: {} })),
              getAdminMeetings().catch(() => ({ meetings: [] })),
            ]);
            // Use same client list as admin clients page: only getAdminClients() (never api.clients) so tier counts always match overview
            let clientsList: Client[] = Array.isArray(clientsFromClientsApi) ? (clientsFromClientsApi as Client[]) : [];
            if (currentUser && isAyoteenzAdminAccount(currentUser)) {
              const mockClients = getMockClientsForAyoteenz();
              const mockByEmail = new Map(mockClients.map((m: any) => [(m.email || '').trim().toLowerCase(), m]));
              const existingEmails = new Set(clientsList.map((u: any) => (u.email || '').trim().toLowerCase()));
              const toAdd = mockClients.filter((m: any) => !existingEmails.has((m.email || '').trim().toLowerCase()));
              clientsList = clientsList.map((u: any) => {
                const fresh = mockByEmail.get((u.email || '').trim().toLowerCase());
                return fresh ? { ...u, ...fresh } : u;
              });
              if (toAdd.length > 0) clientsList = [...clientsList, ...toAdd];
            }
            setDashboardData({
              stats: {
                activeClients: api.stats.activeClients ?? 0,
                clientsWithDeliveredOrder: api.stats.clientsWithDeliveredOrder ?? 0,
                referralCount: api.stats.referralCount ?? 0,
                signUpsThisMonth: api.stats.signUpsThisMonth ?? 0,
                totalRevenue: api.stats.totalRevenue ?? 0,
                totalOrders: api.stats.totalOrders ?? 0,
                pendingForms: api.stats.pendingForms ?? 0,
              },
              clients: clientsList,
              bookings: (api.bookings ?? []).map((b) => ({
                status: b.status ?? '',
                appointment_date: b.appointment_date ?? '',
                service_name: b.service_name ?? '',
                client_name: b.client_name ?? '',
              })),
              revenue: (api.revenue ?? []).map((r) => ({
                transaction_date: r.date,
                amount: r.amount,
                status: r.status,
              })),
              notifications: api.notifications ?? [],
            });
            setPendingData({
              pendingReviews: pending.pendingReviews ?? 0,
              orderForms: pending.orderForms ?? 0,
              pendingItems: pending.pendingItems ?? [],
            });
            setReviewsData({ totalReviews: reviews.totalReviews ?? 0, averageRating: reviews.averageRating ?? 0 });
            setReferralsData({ inviteeCount: referrals.inviteeCount ?? 0 });
            const meetingRows = Array.isArray(meetings.meetings) ? meetings.meetings : [];
            const normalizedMeetings = meetingRows
              .map((row) => normalizeApiMeeting(row as Record<string, unknown>))
              .filter(Boolean) as AdminMeeting[];
            setApiMeetings(normalizedMeetings);
            return;
          } catch {
            /* fall through to mock */
          }
        }
        await mockAPI.setupDatabase();
        await mockAPI.seedData();
        const data = await mockAPI.getDashboardData();
        setDashboardData({
          stats: data.stats,
          clients: data.clients,
          bookings: data.bookings,
          revenue: data.revenue,
          notifications: data.notifications,
        });
        setPendingData({
          pendingReviews: data.pendingReviews ?? 0,
          orderForms: data.orderForms ?? 0,
          pendingItems: data.pendingItems ?? [],
        });
        setReviewsData({ totalReviews: data.totalReviews ?? 0, averageRating: data.averageRating ?? 0 });
        setReferralsData({ inviteeCount: data.inviteeCount ?? 0 });
        // Keep meetings source aligned with Admin Meetings page (mock+api+local merge),
        // so dashboard card does not drift to a dashboard-only fallback list.
        setApiMeetings([]);
      } catch (err) {
        console.error('Failed to initialize dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US')}`;
  };

  // Helper function to format currency for K format
  const formatCurrencyK = (amount: number) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000).toLocaleString('en-US')}K`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/marble-half.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="bg-white/60 backdrop-blur-sm border border-black px-6 py-4" style={{ borderWidth: '1.3px' }}>
          <p className="text-sm font-bold" style={{ textTransform: 'uppercase' }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/marble-half.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="bg-white/60 backdrop-blur-sm border border-red-500 px-6 py-4" style={{ borderWidth: '1.3px' }}>
          <p className="text-sm font-bold text-red-500" style={{ textTransform: 'uppercase' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, clients, revenue } = dashboardData;

  // Same logic as clients overview page: exclude blocked clients so tier counts match the overview (overview filters with !isClientBlocked)
  const visibleClients = clients.filter((c: any) => !isClientBlocked(c));
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime();
  const clientTiers = (() => {
    const acc: Record<string, number> = { Standard: 0, Premium: 0, Silver: 0, Red: 0, Black: 0, emailMarketing: 0 };
    for (const client of visibleClients) {
      const c = client as { membershipType?: string; tier?: string; currentTierName?: string; email?: string };
      const membership = (c.membershipType || 'STANDARD').toString().toUpperCase();
      if (membership === 'PREMIUM') acc.Premium += 1;
      else acc.Standard += 1;
      const spendTier = getEffectiveTierName(c);
      if (spendTier === 'SILVER') acc.Silver += 1;
      else if (spendTier === 'RED') acc.Red += 1;
      else if (spendTier === 'BLACK') acc.Black += 1;
      if (isClientNewsletterSubscribed(c)) acc.emailMarketing += 1;
    }
    return acc;
  })();
  const newAccountsFromList = visibleClients.filter(
    (c: any) => (c.createdAt ? new Date(c.createdAt).getTime() : 0) >= thirtyDaysAgo
  ).length;
  const referralsFromList = visibleClients.reduce((s: number, c: any) => s + (c.invitesCount ?? 0), 0);
  const canComputeDeliveredFromList = visibleClients.length > 0 && visibleClients.every(
    (c: any) => c.ordersCount != null || c.newCount != null
  );
  const clientsWithDeliveredFromList = visibleClients.filter(
    (c: any) => (c.ordersCount ?? 0) > (c.newCount ?? 0)
  ).length;

  // Calculate quarterly revenue
  const currentYear = new Date().getFullYear();
  const quarterlyRevenue = revenue
    .filter(r => new Date(r.transaction_date).getFullYear() === currentYear)
    .reduce((acc, r) => {
      const quarter = Math.floor(new Date(r.transaction_date).getMonth() / 3) + 1;
      acc[`Q${quarter}`] = (acc[`Q${quarter}`] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

  // Calculate current year revenue for header count
  const currentYearRevenue = revenue
    .filter(r => new Date(r.transaction_date).getFullYear() === currentYear)
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate actual taxes paid on completed orders
  const taxesPaid = revenue
    .filter(r => r.status === 'Completed')
    .reduce((sum, r) => sum + (r.amount * 0.15), 0); // 15% tax rate on completed transactions

  // Calculate net income (gross revenue minus business expenses)
  const businessExpenses = currentYearRevenue * 0.35; // 35% for inventory, overhead, taxes, etc.
  const netIncome = currentYearRevenue - businessExpenses;
  const quarterlyNetIncome = Math.max(0, netIncome); // Ensure non-negative

  // Revenue card: inventory & orders received from same source as admin revenue page (localStorage orders + depletion)
  const revenueOrdersList = buildRevenueOrdersList();
  const depletedInv = getDepletedInventory(revenueOrdersList);
  const revenueOrderStats = getOrdersStats(revenueOrdersList, stats.totalRevenue ?? currentYearRevenue ?? 0);
  const totalStartingUnits = getTotalStartingInventoryUnits();
  const topProductBySales = getTopProductBySales(revenueOrdersList);
  const topProductDisplay =
    topProductBySales != null ? `${topProductBySales.label} (${topProductBySales.count})` : '—';

  // Helper function to format date without year (M/D format)
  const formatDateWithoutYear = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // getMonth() returns 0-based month
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const BOOKING_ADDON_LABEL_BY_ID: Record<string, string> = {
    braids: 'BRAIDS',
    'brow-clean': 'BROW SCULPTING',
    'brow-tint': 'BROW TINT',
    makeup: 'MAKEUP',
    'mink-lashes': 'MINK LASHES',
    'clean-lace': 'CLEAN LACE',
    travel: 'TRAVEL FEE',
  };

  const normalizeBookingAddonLabel = (raw: unknown): string | null => {
    const upper = String(raw || '')
      .trim()
      .toUpperCase()
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ');
    if (!upper) return null;
    if (upper === 'BROW CLEAN' || upper === 'BROW-CLEAN') return 'BROW SCULPTING';
    if (upper === 'BROW TINTING' || upper === 'BROW-TINT') return 'BROW TINT';
    if (upper === 'MINK LASH' || upper === 'MINK-LASHES') return 'MINK LASHES';
    if (upper === 'TRAVEL' || upper === 'TRAVEL-FEE') return 'TRAVEL FEE';
    if (upper === 'CLEAN LACE') return 'CLEAN LACE';
    if (
      upper === 'BRAIDS' ||
      upper === 'BROW SCULPTING' ||
      upper === 'BROW TINT' ||
      upper === 'MAKEUP' ||
      upper === 'MINK LASHES' ||
      upper === 'TRAVEL FEE'
    ) {
      return upper;
    }
    return null;
  };

  const formatDashboardMeetingServiceLabel = (meeting: AdminMeeting): string => {
    const meta = (meeting.metadata && typeof meeting.metadata === 'object' ? meeting.metadata : {}) as Record<string, unknown>;
    const addonLabels: string[] = [];

    const addonIds = Array.isArray(meta.bookingAddonIds)
      ? meta.bookingAddonIds.filter((id): id is string => typeof id === 'string')
      : [];
    for (const id of addonIds) {
      const label = BOOKING_ADDON_LABEL_BY_ID[id];
      if (label) addonLabels.push(label);
    }

    // Fallback token parse for older rows that only store text in `type`.
    const tokens = String(meeting.type || '')
      .split(/[+,|]/)
      .map((token) => token.trim())
      .filter(Boolean);
    for (const token of tokens) {
      const label = normalizeBookingAddonLabel(token);
      if (label) addonLabels.push(label);
    }

    const dedupedAddons: string[] = [];
    const seen = new Set<string>();
    for (const addon of addonLabels) {
      if (seen.has(addon)) continue;
      seen.add(addon);
      dedupedAddons.push(addon);
    }

    if (dedupedAddons.length === 0) return 'INSTALL';
    if (dedupedAddons.length === 1) return `INSTALL: ${dedupedAddons[0]}`;
    return `INSTALL: ${dedupedAddons[0]} (${dedupedAddons.length - 1})`;
  };

  const formatDashboardConsultServiceLabel = (meeting: AdminMeeting): string => {
    const meta = (meeting.metadata && typeof meeting.metadata === 'object'
      ? meeting.metadata
      : {}) as Record<string, unknown>;
    const candidates = [
      meta.hairOption,
      meta.bookingHairOption,
      meta.consultHairOption,
      meeting.type,
      meeting.notes,
    ];
    for (const candidate of candidates) {
      const upper = String(candidate || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');
      if (!upper) continue;
      if (upper.includes('WIG + INSTALL') || upper.includes('WIG+INSTALL') || upper.includes('INSTALL')) {
        return 'CONSULT: WIG + INSTALL';
      }
      if (upper.includes('WIG ONLY')) return 'CONSULT: WIG ONLY';
    }
    return 'CONSULT: WIG ONLY';
  };

  const toIsoMeetingDateTime = (date: string, time: string): string => {
    const raw = String(time || '').trim();
    const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampm) {
      let h = parseInt(ampm[1], 10);
      const mm = ampm[2];
      const ap = ampm[3].toUpperCase();
      if (ap === 'PM' && h !== 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
      return `${date}T${String(h).padStart(2, '0')}:${mm}:00`;
    }
    const twentyFour = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (twentyFour) {
      const hh = String(Math.min(23, Math.max(0, parseInt(twentyFour[1], 10)))).padStart(2, '0');
      const mm = twentyFour[2];
      const ss = twentyFour[3] || '00';
      return `${date}T${hh}:${mm}:${ss}`;
    }
    return `${date}T00:00:00`;
  };

  // Keep dashboard MEETINGS card sourced from the exact same meeting pipeline as Admin Meetings:
  // deterministic monthly mocks + API rows + local scheduled rows (local overrides).
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const meetingsRangeStart = startOfMonth(todayIso);
  const meetingsRangeEnd = endOfMonth(todayIso);

  const mergedMeetingsForDashboard = (() => {
    const mock = generateMockMeetingsForRange(meetingsRangeStart, meetingsRangeEnd);
    const local = loadLocalMeetings().filter((m) => m.date >= meetingsRangeStart && m.date <= meetingsRangeEnd);
    const byId = new Map<string, AdminMeeting>();
    for (const m of mock) byId.set(m.id, m);
    for (const m of apiMeetings) {
      if (m.date >= meetingsRangeStart && m.date <= meetingsRangeEnd) byId.set(m.id, m);
    }
    for (const m of local) byId.set(m.id, m);
    return [...byId.values()].sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return a.time.localeCompare(b.time);
    });
  })();

  const completedMeetingsTotal = mergedMeetingsForDashboard.filter((m) => {
    const status = String(m.status || '').toLowerCase();
    return status === 'completed' || status === 'confirmed';
  }).length;

  // Client header count = total clients who have at least one delivered order (same list as card; when list has ordersCount/newCount use it, else API stats)
  const clientsWithDeliveredCount = canComputeDeliveredFromList ? clientsWithDeliveredFromList : (stats.clientsWithDeliveredOrder ?? 0);
  const referralCountDisplay = referralsFromList;
  const pendingReviewsCount = pendingData?.pendingReviews ?? 0;
  const orderFormsCount = pendingData?.orderForms ?? 0;
  const totalReviewsCount = reviewsData?.totalReviews ?? 0;
  const averageRatingDisplay = reviewsData?.averageRating ?? 0;

  const unreadPriorityMessagesTotal = visibleClients.reduce((sum: number, c: any) => {
    const u = getClientUnreadPriorityMessage(c);
    return sum + (u?.unreadCount ?? 0);
  }, 0);

  // PENDING card: use API pendingItems when available so counts match admin Pending page
  const basePendingCardItems =
    (pendingData?.pendingItems?.length ?? 0) > 0
      ? pendingData!.pendingItems.map((p) => ({
          label: p.label,
          value: p.value,
          color: (p.label.includes('ORDER FORMS') || p.label.includes('REVIEWS')) ? ('text-red-500' as const) : ('text-gray-500' as const),
        }))
      : [
          { label: 'REVIEWS', value: String(pendingReviewsCount), color: 'text-gray-500' as const },
          { label: 'ORDER FORMS', value: String(orderFormsCount), color: 'text-red-500' as const },
          { label: 'TIER UPGRADES', value: '0', color: 'text-red-500' as const },
          { label: 'AFFILIATE', value: '0', color: 'text-gray-500' as const },
        ];

  const pendingCardItems = (() => {
    if (basePendingCardItems.some((p) => p.label.toUpperCase().includes('MESSAGES'))) {
      return basePendingCardItems;
    }
    const messagesRow = {
      label: 'MESSAGES',
      value: String(unreadPriorityMessagesTotal),
      color: (unreadPriorityMessagesTotal > 0 ? 'text-red-500' : 'text-gray-500') as 'text-red-500' | 'text-gray-500',
    };
    const affiliateIdx = basePendingCardItems.findIndex((p) => p.label.toUpperCase().includes('AFFILIATE'));
    if (affiliateIdx === -1) return [...basePendingCardItems, messagesRow];
    return [
      ...basePendingCardItems.slice(0, affiliateIdx + 1),
      messagesRow,
      ...basePendingCardItems.slice(affiliateIdx + 1),
    ];
  })();

  // Dashboard meetings card now uses same upstream data model as Admin Meetings page.
  const upcomingBookingsForCard = mergedMeetingsForDashboard
    .filter((m) => {
      if (m.category === 'consultation') return false;
      if (m.date < todayIso) return false;
      const status = String(m.status || '').toLowerCase();
      if (status === 'canceled' || status === 'cancelled') return false;
      return true;
    })
    .map((m) => ({
      date: m.date,
      appointment_date: toIsoMeetingDateTime(m.date, m.time),
      service_name: formatDashboardMeetingServiceLabel(m),
      client_name: m.client || '',
    }));

  const recentMeetingsForCard = mergedMeetingsForDashboard
    .filter((m) => {
      const status = String(m.status || '').toLowerCase();
      return status !== 'canceled' && status !== 'cancelled';
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
    .slice(0, 5)
    .map((m) => ({
      date: m.date,
      appointment_date: toIsoMeetingDateTime(m.date, m.time),
      service_name:
        m.category === 'consultation'
          ? formatDashboardConsultServiceLabel(m)
          : formatDashboardMeetingServiceLabel(m),
      client_name: m.client || '',
    }));

  const endOfThisWeekIso = (() => {
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayOfWeek = end.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    end.setDate(end.getDate() + daysUntilSunday);
    const y = end.getFullYear();
    const m = String(end.getMonth() + 1).padStart(2, '0');
    const d = String(end.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  const todayUpcomingBookingsCount = upcomingBookingsForCard.filter((m) => m.date === todayIso).length;
  const weekUpcomingBookingsCount = upcomingBookingsForCard.filter((m) => m.date >= todayIso && m.date <= endOfThisWeekIso).length;
  const monthUpcomingBookingsCount = upcomingBookingsForCard.filter((m) => m.date >= todayIso && m.date <= meetingsRangeEnd).length;

  const meetingsCardTicker = [
    `${todayUpcomingBookingsCount} UPCOMING BOOKINGS SCHEDULED TODAY.`,
    `${weekUpcomingBookingsCount} UPCOMING BOOKINGS SCHEDULED THIS WEEK.`,
    `${monthUpcomingBookingsCount} UPCOMING BOOKINGS SCHEDULED THIS MONTH.`,
  ]
    .join(' ')
    .concat(
      ` ${todayUpcomingBookingsCount} UPCOMING BOOKINGS SCHEDULED TODAY. ${weekUpcomingBookingsCount} UPCOMING BOOKINGS SCHEDULED THIS WEEK. ${monthUpcomingBookingsCount} UPCOMING BOOKINGS SCHEDULED THIS MONTH.`
    );

  const statsData = [
    {
      title: 'CLIENTS',
      count: clientsWithDeliveredCount,
      items: [
        { label: 'NEW ACCOUNTS', value: String(newAccountsFromList), color: 'text-red-500' },
        { label: 'EMAIL MARKETING', value: String(clientTiers.emailMarketing ?? 0), color: 'text-gray-500' },
        { label: 'STANDARD MEMBERS', value: String(clientTiers.Standard ?? 0), color: 'text-black' },
        { label: 'PREMIUM MEMBERS', value: String(clientTiers.Premium ?? 0), color: 'text-red-500' },
        { label: 'REFERRALS', value: String(referralCountDisplay), color: 'text-gray-500' }
      ],
      actions: [
        { label: 'Preferences', action: 'preferences' },
        { label: 'Settings', action: 'settings' }
      ],
      tiers: [
        { label: 'BLACK', value: String(clientTiers.Black ?? 0), color: 'text-black' },
        { label: 'RED', value: String(clientTiers.Red ?? 0), color: 'text-red-500' },
        { label: 'SILVER', value: String(clientTiers.Silver ?? 0), color: 'text-gray-500' }
      ]
    },

    {
      title: 'REVENUE',
      count: formatCurrencyK(stats.totalRevenue ?? currentYearRevenue),
      items: [
        { label: 'INVENTORY', value: `${depletedInv.totalUnits}/${totalStartingUnits}`, color: 'text-gray-500' },
        { label: 'ORDERS RECEIVED', value: String(revenueOrderStats.unfulfilledCount), color: 'text-red-500' },
        { label: 'QUARTERLY SALES', value: formatCurrencyK(quarterlyNetIncome), color: 'text-gray-500' },
        { label: 'TAX DEDUCTIONS', value: formatCurrency(Math.round(taxesPaid)), color: 'text-gray-500' },
        { label: 'TOP PRODUCT', value: topProductDisplay, color: 'text-gray-500' }
      ],
      highlight: 'PERFORMANCE STRONG - ON TRACK TO EXCEED TARGETS',
      tiers: [
        { label: 'Q1', value: `${Math.round((quarterlyRevenue.Q1 || 0) / 1000).toLocaleString('en-US')}K`, color: 'text-red-500' },
        { label: 'Q2', value: `${Math.round((quarterlyRevenue.Q2 || 0) / 1000).toLocaleString('en-US')}K`, color: 'text-red-500' },
        { label: 'Q3', value: `${Math.round((quarterlyRevenue.Q3 || 0) / 1000).toLocaleString('en-US')}K`, color: 'text-red-500' },
        { label: 'Q4', value: `${Math.round((quarterlyRevenue.Q4 || 0) / 1000).toLocaleString('en-US')}K`, color: 'text-red-500' }
      ]
    },

    {
      title: 'PENDING',
      count: (revenue.filter(r => r.status === 'Pending').length + pendingReviewsCount + orderFormsCount).toString(),
      items: pendingCardItems,
      activity: (revenue.filter(r => r.status === 'Pending').length > 0 || pendingReviewsCount > 0 || orderFormsCount > 0) ? 'URGENT: REVIEWS AND APPROVALS REQUIRE ATTENTION' : 'ALL APPROVALS UP TO DATE'
    },

    {
      title: 'MEETINGS',
      count: completedMeetingsTotal,
      items: recentMeetingsForCard.map((booking) => {
        const rawService = String(booking.service_name || '').toUpperCase().trim();
        const colonIdx = rawService.indexOf(':');
        const installLabel = colonIdx >= 0 ? rawService.slice(0, colonIdx).trim() : (rawService || 'INSTALL');
        const addonsText = colonIdx >= 0 ? rawService.slice(colonIdx + 1).trim() : '';
        const dateAndClient = `${formatDateWithoutYear(booking.appointment_date || '')} ${booking.client_name || ''}`.trim();
        return {
          // Renders as "INSTALL:" in black via StatsCard's `label: value` pattern.
          label: installLabel || 'INSTALL',
          value: dateAndClient,
          color: 'text-black' as const,
          valueColor: 'text-gray-500' as const,
          valueParts: addonsText
            ? [
                { text: addonsText, color: 'text-gray-500' as const },
                { text: dateAndClient ? ` ${dateAndClient}` : '', color: 'text-red-500' as const }
              ]
            : [{ text: dateAndClient, color: 'text-red-500' as const }],
        };
      }),
      highlight: meetingsCardTicker
    },

    {
      title: 'REVIEWS',
      count: averageRatingDisplay > 0 ? averageRatingDisplay.toFixed(1) : '—',
      items: [
        { label: 'TOTAL REVIEWS', value: String(totalReviewsCount), color: 'text-gray-500' },
        { label: 'PHOTOS/VIDEOS', value: '34', color: 'text-red-500' },
        { label: 'REVIEWS PER MONTH', value: '18', color: 'text-gray-500' },
        { label: 'POSITIVE SENTIMENT', value: '94%', color: 'text-gray-500' }
      ],
      activity: totalReviewsCount > 0 ? 'EXCELLENT CLIENT FEEDBACK - HIGH SATISFACTION RATINGS' : 'EXCELLENT CLIENT FEEDBACK - HIGH SATISFACTION RATINGS'
    },

    (() => {
      const SPECIAL_OFFER_CONFIG_KEY = 'specialOfferAdminConfig';
      const defaultSpecialOfferConfig = () => ({
        unitId: 'noir',
        length: '24"',
        density: '200%',
        texture: 'SILKY',
        lace: '13X6',
        hairline: 'NATURAL',
        color: 'OFF BLACK',
        styling: 'NONE',
        addOns: [] as string[],
        thumbnailDataUrl: '',
        startDate: new Date().toISOString().slice(0, 10)
      });

      const getMarketingActivity = (): string => {
        try {
          if (typeof window === 'undefined') return 'CONFIGURE SPECIAL OFFER – PRODUCT, OPTIONS, THUMBNAIL & START DATE';
          let raw = localStorage.getItem(SPECIAL_OFFER_CONFIG_KEY);
          let c: { unitId?: string; startDate?: string; length?: string; density?: string; lace?: string; color?: string; texture?: string; hairline?: string; styling?: string; addOns?: string[] } | null = null;
          if (raw) {
            try {
              c = JSON.parse(raw);
            } catch {
              raw = null;
            }
          }
          if (!raw || !c?.unitId || !c?.startDate) {
            const seed = defaultSpecialOfferConfig();
            localStorage.setItem(SPECIAL_OFFER_CONFIG_KEY, JSON.stringify(seed));
            c = seed;
          }
          const unitNames: Record<string, string> = { noir: 'NOIR', blanco: 'BLANCO', 'soft-wave': 'SOFT WAVE', 'beach-wave': 'BEACH WAVE', 'soft-curl': 'SOFT CURL', 'ocean-curl': 'OCEAN CURL' };
          const unitName = unitNames[c.unitId!] || (c.unitId || '').toUpperCase().replace(/-/g, ' ');
          const start = new Date((c.startDate || '') + 'T12:00:00');
          const end = new Date(start);
          end.setDate(end.getDate() + 60);
          const untilStr = `${end.getMonth() + 1}/${end.getDate()}`;
          const length = c.length || '24"';
          const density = c.density || '200%';
          const lace = c.lace || '13X6';
          const color = c.color || 'OFF BLACK';
          const parts = [`${length} ${density} DENSITY`, `${lace} LACE`, `${color} COLOR`];
          if (c.texture && c.texture !== 'SILKY') parts.push(`${c.texture} TEXTURE`);
          if (c.hairline && c.hairline !== 'NATURAL') parts.push(`${c.hairline} HAIRLINE`);
          if (c.styling && c.styling !== 'NONE') parts.push(`${c.styling} STYLING`);
          if (Array.isArray(c.addOns) && c.addOns.length > 0) parts.push(c.addOns.join(' + ') + ' ADD-ONS');
          return `SPECIAL UNTIL ${untilStr}: ${unitName} - ${parts.join(', ')}`;
        } catch {
          return 'CONFIGURE SPECIAL OFFER – PRODUCT, OPTIONS, THUMBNAIL & START DATE';
        }
      };
      return {
        title: 'MARKETING',
        count: '',
        items: [
          { label: 'AFFILIATE', value: 'Campaign stats', color: 'text-red-500' },
          { label: 'CHALLENGES', value: 'Slay & more', color: 'text-gray-500' },
          { label: 'SPECIAL OFFERS', value: 'Special offer config', color: 'text-red-500' },
          { label: 'ALERTS', value: 'Send notifications', color: 'text-red-500' }
        ],
        activity: getMarketingActivity()
      };
    })(),

    {
      title: 'REFERRALS',
      count: referralCountDisplay,
      items: [
        { label: 'INVITEES', value: String(referralCountDisplay), color: 'text-gray-500' },
        { label: 'CODE STATUS', value: 'Active/Inactive', color: 'text-red-500' },
        { label: 'EARNINGS TRACKING', value: 'Digital cash', color: 'text-gray-500' },
        { label: 'VIEW DETAILS', value: 'Referrals', color: 'text-red-500' }
      ],
      activity: 'REFERRAL PROGRAM - TRACK INVITEES & EARNINGS'
    },

    {
      title: 'BRAND',
      count: '94%',
      items: [
        { label: 'CLIENT RETENTION', value: '94%', color: 'text-gray-500' },
        { label: 'REFERRAL RATE', value: '23%', color: 'text-gray-500' },
        { label: 'REPEAT BOOKINGS', value: '78%', color: 'text-gray-500' },
        { label: 'GROWTH RATE', value: '+15%', color: 'text-gray-500' },
        { label: 'ANALYTICS', value: 'Clicks by source', color: 'text-red-500' }
      ],
      highlight: 'BRAND GROWTH STRONG - EXCELLENT CLIENT RETENTION'
    },

    {
      title: 'WORKERS',
      count: ADMIN_DASHBOARD_WORKERS.length,
      items: buildWorkersDashboardSummaryItems(),
      activity: 'ROSTER + APPLICANTS (BRAND → CAREERS). TAP EACH ROLE CARD TO REVIEW APPLICATIONS.'
    },

    {
      title: 'BACKEND',
      count: '',
      items: [
        { label: 'AUDIT LOG', value: 'Profile & order trail', color: 'text-red-500' },
        { label: 'AUTH USERS', value: 'List & manage', color: 'text-red-500' },
        { label: 'DISABLE / RESET', value: 'Account actions', color: 'text-gray-500' }
      ],
      activity: 'AUDIT TRAIL & MANAGE AUTH USERS'
    }
  ];

  // Handle card click navigation
  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case 'CLIENTS':
        navigate('/admin/clients');
        break;
      case 'REVENUE':
        navigate('/admin/revenue');
        break;
      case 'PENDING':
        navigate('/admin/pending');
        break;
      case 'MEETINGS':
        navigate('/admin/meetings');
        break;
      case 'REVIEWS':
        navigate('/admin/reviews');
        break;
      case 'MARKETING':
        navigate('/admin/marketing');
        break;
      case 'BRAND':
        navigate('/admin/brand');
        break;
      case 'REFERRALS':
        navigate('/admin/referrals');
        break;
      case 'WORKERS':
        navigate('/admin/workers');
        break;
      case 'BACKEND':
        navigate('/admin/backend');
        break;
      default:
        break;
    }
  };

  return (
    <>
    <div className="min-h-screen" style={{
      position: 'relative'
    }}>
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Scrollable Content */}
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader title="DASHBOARD" showAccountIcon />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto" style={{ minHeight: 'calc(100dvh - 160px)' }}>
            <div className="grid grid-cols-2 gap-4 items-start">
              {statsData.map((stat, index) => (
                <StatsCard
                  key={index}
                  data={stat}
                  onCardClick={handleCardClick}
                  itemsMaxHeightPx={stat.title === 'MEETINGS' ? undefined : DASHBOARD_CAPPED_STAT_ITEMS_MAX_PX}
                />
              ))}
            </div>
            
            <div className="mt-6">
              <RecentActivity onViewModeChange={setNotificationViewMode} />
            </div>
            
            {notificationViewMode === 'list' && (
              <div className="mt-6">
                <ActivityFeed />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

