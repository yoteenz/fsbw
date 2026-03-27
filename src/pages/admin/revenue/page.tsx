/**
 * Admin Revenue page. All tabs use the same data source as the client overview:
 * - Orders: buildRevenueOrdersList() = localStorage userOrders_* (same keys as client overview).
 * - Overview totals/breakdown: getAdminRevenue() when Supabase is configured (else derived from orders).
 * - Products/Inventory: getDepletedInventory(orders) and Edit Inventory overrides.
 * - Payments: local membership rows + Supabase `membership_payments` (Stripe webhooks) when admin + API; fraud analysis runs on the order list.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminRevenue, getAdminMembershipPayments } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { buildRevenueOrdersList, getDepletedInventory, getOrdersStats, getProductSalesCounts, getTotalStartingInventoryUnits } from '../../../utils/adminRevenueStats';
import {
  buildMembershipPaymentsList,
  membershipPaymentsTotalUsd,
  mergeMembershipPaymentLists,
  type MembershipPaymentRecord,
} from '../../../utils/membershipPayments';
import { getSubscriptionDisplayName, isSubscriptionTierId } from '../../../constants/subscriptionPricing';

const REVENUE_TABS = ['OVERVIEW', 'ORDERS', 'PRODUCTS', 'PAYMENTS'] as const;

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

function calculateProcessingTimeline(orderDateStr: string, processingTime: string): string {
  try {
    let orderDate: Date;
    const parsed = new Date(orderDateStr);
    if (!isNaN(parsed.getTime())) orderDate = parsed;
    else {
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

/** Normalize to order-stage labels only: UNFULFILLED, FULFILLED, SHIPPED, DELIVERED, AWAITING FORM, CANCELED (no "placed", "preparing", etc.). */
function normalizeOrderStatusForDisplay(s: string): string {
  const status = (s || '').toUpperCase().replace(/\s+/g, ' ').trim();
  if (status === 'DELIVERED') return 'DELIVERED';
  if (status === 'SHIPPED') return 'SHIPPED';
  if (status === 'FULFILLED') return 'FULFILLED';
  if (status === 'AWAITING FORM' || status === 'AWAITING ORDER FORM') return 'AWAITING FORM';
  if (status === 'CANCELED' || status === 'CANCELLED') return 'CANCELED';
  if (status === 'UNFULFILLED') return 'UNFULFILLED';
  if (status && !['PLACED', 'PREPARING', 'IN PROGRESS', 'CONSTRUCTING', 'CONFIRMED', 'PENDING'].includes(status)) return status;
  return 'UNFULFILLED';
}

function getStatusPillStyle(s: string): Record<string, string> {
  const status = (s || '').toUpperCase().replace(/\s+/g, ' ');
  const base = { height: '15px', padding: '0 6px', boxSizing: 'border-box', borderRadius: '2px', fontFamily: '"Futura PT Medium"', fontSize: '8px' };
  if (status === 'DELIVERED') return { ...base, backgroundColor: 'rgba(235, 28, 36, 0.15)', color: '#EB1C24' };
  if (status === 'SHIPPED' || status === 'FULFILLED') return { ...base, backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#15803d' };
  if (status === 'AWAITING FORM' || status === 'AWAITING ORDER FORM') return { ...base, backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#a16207' };
  if (status === 'CANCELED' || status === 'CANCELLED') return { ...base, backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' };
  if (status === 'UNFULFILLED') return { ...base, backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#b45309' };
  return { ...base, backgroundColor: '#f3f4f6', color: '#808080' };
}

type RevenueOrder = {
  id: string;
  date: string;
  total?: number;
  amount?: number;
  status?: string;
  orderNumber?: string;
  lineItems?: Array<{ productName?: string; subtotal?: number; options?: Record<string, string> }>;
  items?: number;
  productName?: string;
  productImage?: string;
  subtotal?: number;
  processingTime?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  discounts?: Array<{ label?: string; amount?: number }>;
  discountApplied?: number;
  paymentMethod?: string;
  discountCode?: string;
  shippingAddress?: { address?: string; city?: string; state?: string; zip?: string; country?: string };
  userEmail?: string;
  [k: string]: unknown;
};

function AdminRevenueOrdersTab({
  orders,
  setOrders: _setOrders,
  refreshOrders: _refreshOrders,
  expandedOrderId,
  setExpandedOrderId,
  onCloseExpanded,
}: {
  orders: RevenueOrder[];
  setOrders: React.Dispatch<React.SetStateAction<RevenueOrder[]>>;
  refreshOrders: () => void;
  expandedOrderId: string | null;
  setExpandedOrderId: (id: string | null) => void;
  onCloseExpanded: () => void;
}) {
  const expandedOrder = useMemo(() => orders.find((o) => o.id === expandedOrderId) ?? null, [orders, expandedOrderId]);

  if (orders.length === 0) {
    return (
      <div className="py-4 text-center" style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>
        NO ORDERS YET
      </div>
    );
  }

  // When an order is expanded, show only that order (no list below)
  if (expandedOrderId && expandedOrder) {
    const order = expandedOrder;
    const orderAmount = order.total ?? order.amount ?? 0;
    const orderProducts = order.lineItems && order.lineItems.length > 0
      ? order.lineItems.map((line: any, i: number) => ({
          id: `${order.id}-product-${i}`,
          name: line.productName,
          image: getProductImage(line.productName || ''),
          price: line.subtotal ?? orderAmount / order.lineItems!.length,
          options: line.options,
        }))
      : Array.from({ length: order.items ?? 1 }, (_, i) => ({
          id: `${order.id}-product-${i}`,
          name: order.productName || 'Order',
          image: order.productImage || getProductImage(order.productName || ''),
          price: orderAmount / (order.items ?? 1),
          options: undefined as Record<string, string> | undefined,
        }));
    const discounts = order.discounts || [];

    return (
      <div className="space-y-3">
        <div key={order.id} className="bg-white border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px' }}>
                  ORDER #{(order.orderNumber || order.id || '').toString().replace(/^ORDER\s*#?\s*/i, '') || '—'}
                </h3>
                <button type="button" onClick={onCloseExpanded} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Close">
                  <img src="/assets/close-icon.svg" alt="Close" style={{ width: '16px', height: '16px', filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
                </button>
              </div>
              <div style={{ minHeight: '180px', marginBottom: '20px', overflowX: orderProducts.length >= 3 ? 'auto' : 'hidden' }}>
                <div className="flex" style={{ gap: '20px', minHeight: '180px', alignItems: 'flex-start', justifyContent: orderProducts.length === 1 ? 'center' : 'flex-start', paddingRight: orderProducts.length >= 3 ? 10 : 0 }}>
                  {orderProducts.map((product: { id: string; name: string; image: string; price: number; options?: Record<string, string> }) => (
                    <div key={product.id} className="flex-shrink-0" style={{ width: '150px', minHeight: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px' }}>
                      <img src={product.image} alt={product.name} style={{ width: 120, height: 120, objectFit: 'contain' }} />
                      <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '21px', color: '#000', marginTop: '4px', marginBottom: 0, textTransform: 'uppercase', textAlign: 'center' }}>{product.name.replace(/WIG/gi, '').trim()}</p>
                      <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', color: '#808080', marginTop: '6px', marginBottom: 0, textTransform: 'uppercase' }}>${product.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                  <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>ORDER SUMMARY</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER DATE</span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{order.date || '—'}</span>
                  </div>
                  {discounts.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>{d.label || 'DISCOUNT'}</span>
                      <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#EB1C24', textTransform: 'uppercase' }}>{typeof d.amount === 'number' && d.amount < 0 ? `-$${Math.abs(d.amount).toLocaleString()}` : d.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER NUMBER</span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{(order.orderNumber || order.id || '—').toString().replace(/^ORDER\s+/i, '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>ORDER TOTAL</span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>${(order.total ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <div className="flex items-center justify-between pb-1 border-b border-gray-200" style={{ marginBottom: '10px' }}>
                  <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#EB1C24', margin: 0, textTransform: 'uppercase' }}>SHIPPING</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>COMPLETION TIMELINE</span>
                    <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                      {order.date ? calculateProcessingTimeline(order.date, order.processingTime || '6-8 WEEKS') : (order.processingTime || '6-8 WEEKS')}
                    </span>
                  </div>
                  {(order as any).trackingNumber && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', textTransform: 'uppercase' }}>TRACKING NUMBER</span>
                      <a href={`https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${encodeURIComponent((order as any).trackingNumber)}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>{(order as any).trackingNumber}</a>
                    </div>
                  )}
                  {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                    <>
                      {order.shippingAddress.address && <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{(order.shippingAddress.address || '').toUpperCase()}</p>}
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>
                        {[order.shippingAddress.city, [order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ').toUpperCase()}
                      </p>
                      {order.shippingAddress.country && <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0, textTransform: 'uppercase' }}>{(order.shippingAddress.country || '').toUpperCase()}</p>}
                    </>
                  ) : (
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', margin: 0 }}>—</p>
                  )}
                </div>
              </div>
            </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const displayStatus = normalizeOrderStatusForDisplay(order.status || 'UNFULFILLED');
        const itemCount = order.lineItems?.length ?? order.items ?? 1;
        const firstImage = order.lineItems?.[0]?.productName
          ? getProductImage(order.lineItems[0].productName)
          : order.productImage || getProductImage((order.productName || 'NOIR').toString());
        const orderAmount = order.total ?? order.amount ?? 0;
        return (
          <div
            key={order.id}
            className="bg-white border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedOrderId(order.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedOrderId(order.id); } }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div className="flex flex-col items-center" style={{ flexShrink: 0, transform: 'translateX(-12px)' }}>
              <img src={firstImage} alt="" style={{ width: '85px', height: '85px', objectFit: 'contain' }} />
              <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24', fontSize: '12px', margin: '2px 0 0 0', textTransform: 'uppercase' }}>{itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}</p>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: 'translate(-10px, -12px)' }}>
              <p className="text-xs" style={{ fontFamily: '"Covered By Your Grace", cursive', fontSize: '16px', color: '#000000', margin: 0, lineHeight: 1.25 }}>{order.date}</p>
              <div style={{ marginTop: '2px' }}>
                <h4 style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: 0 }}>ORDER #{(order.orderNumber || order.id || '').toString().replace(/^ORDER\s*#?\s*/i, '').trim() || '—'}</h4>
              </div>
              <p className="text-sm mt-1" style={{ fontFamily: '"Futura PT Medium"', fontSize: '12px', color: '#808080', margin: 0, marginTop: '2px', transform: 'translateY(-4px)' }}>${orderAmount.toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, transform: 'translateX(-6px)' }}>
              <span className="admin-order-status-pill" style={getStatusPillStyle(displayStatus)}>
                <span style={{ lineHeight: 1 }}>{displayStatus}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminRevenue() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<typeof REVENUE_TABS[number]>(() => {
    if (tabParam === 'PRODUCTS') return 'PRODUCTS';
    if (tabParam === 'ORDERS') return 'ORDERS';
    return 'OVERVIEW';
  });
  useEffect(() => {
    if (tabParam === 'PRODUCTS') setActiveTab('PRODUCTS');
    else if (tabParam === 'ORDERS') setActiveTab('ORDERS');
    else if (tabParam === 'OVERVIEW' || tabParam === null) setActiveTab('OVERVIEW');
  }, [tabParam]);
  const [totalRevenue, setTotalRevenue] = useState(45700);
  const [totalOrders, setTotalOrders] = useState(53);
  const [breakdown, setBreakdown] = useState<{ month: string; value: number }[]>([]);
  const [orders, setOrders] = useState<RevenueOrder[]>(() => buildRevenueOrdersList() as RevenueOrder[]);
  const [localMembershipPayments, setLocalMembershipPayments] = useState<MembershipPaymentRecord[]>(() =>
    buildMembershipPaymentsList()
  );
  const [remoteMembershipPayments, setRemoteMembershipPayments] = useState<MembershipPaymentRecord[]>([]);
  const membershipPayments = useMemo(
    () => mergeMembershipPaymentLists(localMembershipPayments, remoteMembershipPayments),
    [localMembershipPayments, remoteMembershipPayments]
  );
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [addTrackingOrderId, setAddTrackingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const refreshRemoteMembershipPayments = React.useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const raw = localStorage.getItem('currentUser');
      const u = raw ? (JSON.parse(raw) as { email?: string }) : null;
      if (!u?.email || !isAdminEmail(u.email)) return;
      const rows = await getAdminMembershipPayments();
      setRemoteMembershipPayments(rows);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshOrders = () => {
    setOrders(buildRevenueOrdersList() as RevenueOrder[]);
    setLocalMembershipPayments(buildMembershipPaymentsList());
    void refreshRemoteMembershipPayments();
  };

  useEffect(() => {
    void refreshRemoteMembershipPayments();
  }, [refreshRemoteMembershipPayments]);

  useEffect(() => {
    const refreshLocal = () => setLocalMembershipPayments(buildMembershipPaymentsList());
    window.addEventListener('membershipPaymentsUpdated', refreshLocal);
    window.addEventListener('storage', refreshLocal);
    window.addEventListener('focus', refreshLocal);
    return () => {
      window.removeEventListener('membershipPaymentsUpdated', refreshLocal);
      window.removeEventListener('storage', refreshLocal);
      window.removeEventListener('focus', refreshLocal);
    };
  }, []);

  const expandedOrder = useMemo(() => orders.find((o) => o.id === expandedOrderId) ?? null, [orders, expandedOrderId]);

  const handleCopyOrder = (order: RevenueOrder | null) => {
    if (!order) return;
    const num = (order.orderNumber || order.id || '—').toString().replace(/^ORDER\s*#?\s*/i, '');
    const lines: string[] = [
      `ORDER #${num}`,
      `Date: ${order.date || '—'}`,
      `Total: $${(order.total ?? order.amount ?? 0).toLocaleString()}`,
      `Status: ${(order.status || '—').toUpperCase()}`,
      '',
      'ITEMS',
      ...(order.lineItems && order.lineItems.length > 0
        ? order.lineItems.map((l) => `  • ${(l.productName || 'Item').toUpperCase()} — $${(l.subtotal ?? 0).toLocaleString()}`)
        : [`  • ${(order.productName || 'Item').toUpperCase()} — $${(order.total ?? 0).toLocaleString()}`]),
      '',
      'SHIPPING',
    ];
    const addr = order.shippingAddress;
    if (addr && typeof addr === 'object') {
      if (addr.address) lines.push(`  ${addr.address}`);
      if (addr.city || addr.state || addr.zip) lines.push(`  ${[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}`);
      if (addr.country) lines.push(`  ${addr.country}`);
    } else lines.push('  —');
    if (order.trackingNumber) lines.push('', `Tracking: ${order.trackingNumber}`);
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => { /* copied */ }).catch(() => {});
  };

  const handleAddTracking = (order: RevenueOrder | null) => {
    if (!order) return;
    const tn = trackingInput.trim();
    if (!tn) return;
    if (order.userEmail) {
      try {
        const key = `userOrders_${order.userEmail}`;
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : { activeOrders: [], pastOrders: [] };
        const update = (list: RevenueOrder[]) => {
          const idx = list.findIndex((o: RevenueOrder) => o.id === order.id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], trackingNumber: tn, status: 'SHIPPED', trackingCarrier: 'USPS' };
          }
          return list;
        };
        data.activeOrders = update(data.activeOrders || []);
        data.pastOrders = update(data.pastOrders || []);
        localStorage.setItem(key, JSON.stringify(data));
        setTrackingInput('');
        setAddTrackingOrderId(null);
        refreshOrders();
        setExpandedOrderId(order.id);
        return;
      } catch {
        // fall through to local state update
      }
    }
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, trackingNumber: tn, status: 'SHIPPED', trackingCarrier: 'USPS' } : o));
    setTrackingInput('');
    setAddTrackingOrderId(null);
  };

  const depletedInventory = useMemo(() => getDepletedInventory(orders), [orders]);
  const ordersStats = useMemo(() => getOrdersStats(orders, totalRevenue), [orders, totalRevenue]);
  const inventoryTotal = depletedInventory.totalUnits;

  // Orders tab: only show awaiting form / unfulfilled (new) in main list; shipped + pending-with-tracking go to Pending card; delivered/fulfilled are on fulfilled orders page
  const unfulfilledOrders = useMemo(() => {
    return orders.filter((o) => {
      const norm = normalizeOrderStatusForDisplay(o.status || 'UNFULFILLED');
      return norm === 'AWAITING FORM' || norm === 'UNFULFILLED';
    });
  }, [orders]);
  const pendingOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = (o.status || '').toUpperCase().trim();
      const norm = normalizeOrderStatusForDisplay(o.status || 'UNFULFILLED');
      const hasTracking = !!(o as RevenueOrder & { trackingNumber?: string }).trackingNumber;
      return norm === 'SHIPPED' || (s === 'PENDING' && hasTracking);
    });
  }, [orders]);
  const awaitingTrackingCount = useMemo(() => {
    return orders.filter((o) => {
      const s = (o.status || '').toUpperCase().trim();
      const hasTracking = !!(o as RevenueOrder & { trackingNumber?: string }).trackingNumber;
      return s === 'PENDING' && !hasTracking;
    }).length;
  }, [orders]);
  const totalStartingUnits = useMemo(() => getTotalStartingInventoryUnits(), []);
  const inventoryPercent = totalStartingUnits > 0 ? Math.min(100, Math.max(0, Math.round((inventoryTotal / totalStartingUnits) * 100))) : 0;
  const inventoryBannerColor = inventoryPercent >= 25 ? '#16a34a' : '#EB1C24';

  const topProductsBySales = useMemo(() => getProductSalesCounts(orders), [orders]);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminRevenue()
        .then((r) => {
          setTotalRevenue(r.totalRevenue);
          setTotalOrders(r.totalOrders);
          setBreakdown(r.breakdown || []);
        })
        .catch(() => {});
    }
  }, []);

  const formatWithCommas = (n: number) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const revenueFormatted = totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).replace('$', '$');
  const absRevenue = Math.abs(totalRevenue);
  const totalRevenueBannerValue =
    totalRevenue < 0
      ? (absRevenue >= 1000 ? `-${(absRevenue / 1000).toFixed(1)}k` : `-${Math.round(absRevenue)}`)
      : (absRevenue >= 1000 ? `+${(absRevenue / 1000).toFixed(1)}k` : `+${Math.round(absRevenue)}`);

  const avgOrderDisplay = orders.length && ordersStats.avgOrder > 0 ? `$${formatWithCommas(Math.round(ordersStats.avgOrder))}` : '—';
  const panelLabelsAndValues: Record<typeof REVENUE_TABS[number], { left: { label: string; value: string }; right: { label: string; value: string } }> = {
    OVERVIEW: { left: { label: 'TOTAL REVENUE', value: totalRevenueBannerValue }, right: { label: 'ORDERS', value: formatWithCommas(totalOrders) } },
    ORDERS: { left: { label: 'THIS MONTH', value: formatWithCommas(ordersStats.thisMonth) }, right: { label: 'AVG ORDER', value: avgOrderDisplay } },
    PRODUCTS: { left: { label: 'PROFIT MARGIN', value: '—' }, right: { label: 'INVENTORY', value: `${inventoryPercent}%` } },
    PAYMENTS: { left: { label: 'DISCOUNTS', value: '—' }, right: { label: 'FEES', value: '—' } },
  };
  const membershipTotalUsd = membershipPaymentsTotalUsd(membershipPayments);
  const panel =
    activeTab === 'PAYMENTS'
      ? {
          left: { label: 'MEMBERSHIP', value: formatWithCommas(membershipPayments.length) },
          right: {
            label: 'MEMBERSHIP $',
            value: membershipPayments.length ? `$${formatWithCommas(Math.round(membershipTotalUsd))}` : '—',
          },
        }
      : panelLabelsAndValues[activeTab];

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
          title="REVENUE"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {/* Main card – matches clients overview structure */}
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4" style={{ marginBottom: 0 }}>
                <h2
                  className="flex-1"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    marginLeft: '6px',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  REVENUE
                </h2>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                  <path d="M12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75Z" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.06715 15.68C9.3396 16.0241 9.69072 16.2978 10.091 16.4779C10.4912 16.658 10.9289 16.7393 11.3671 16.715H12.7471C13.3571 16.715 13.9422 16.4727 14.3735 16.0413C14.8048 15.61 15.0471 15.025 15.0471 14.415C15.0471 13.805 14.8048 13.22 14.3735 12.7887C13.9422 12.3573 13.3571 12.115 12.7471 12.115H11.2521C10.6421 12.115 10.0571 11.8727 9.6258 11.4413C9.19447 11.01 8.95215 10.425 8.95215 9.815C8.95215 9.205 9.19447 8.61999 9.6258 8.18865C10.0571 7.75732 10.6421 7.515 11.2521 7.515H12.6321C13.6671 7.515 14.3571 7.745 14.9321 8.55M11.9421 6.25V17.75" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Tab-specific panels – above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: activeTab === 'OVERVIEW' ? (totalRevenue < 0 ? '#EB1C24' : '#16a34a') : '#EB1C24' }}>{panel.left.value}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>{panel.left.label}</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: activeTab === 'PRODUCTS' ? inventoryBannerColor : '#EB1C24' }}>{panel.right.value}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>{panel.right.label}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {REVENUE_TABS.map((tab) => (
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

              {/* Tab content – outer scroll; inner padded wrapper so content never touches card border */}
              <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                <div
                  className="admin-revenue-tab-content"
                  style={{ paddingTop: '12px', paddingRight: '20px', paddingBottom: '0', paddingLeft: '20px', boxSizing: 'border-box' }}
                >
                {activeTab === 'OVERVIEW' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>REVENUE BREAKDOWN</h3>
                    <div className="space-y-2 mb-4">
                      {breakdown.length > 0
                        ? breakdown.slice(0, 4).map((row) => (
                        <div key={row.month} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.month}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>${row.value.toLocaleString()}</span>
                        </div>
                      ))
                        : [
                        { label: 'THIS MONTH', value: revenueFormatted },
                        { label: 'LAST MONTH', value: '$0' },
                        { label: 'THIS YEAR', value: revenueFormatted },
                        { label: 'GROWTH RATE', value: '—' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>QUARTERLY</h3>
                    <div className="flex justify-between gap-4 py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>Q1</span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>$89K</span>
                    </div>
                    <div className="flex justify-between gap-4 py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>Q2</span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>$95K</span>
                    </div>
                    <div className="flex justify-between gap-4 py-2">
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>Q3</span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>$112K</span>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '16px', marginBottom: '8px' }}>FINANCIAL HEALTH</h3>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'PROFIT MARGIN', value: '35%' },
                        { label: 'CASH FLOW', value: 'Positive' },
                        { label: 'DEBT RATIO', value: 'Low' },
                        { label: 'INVESTMENT RETURN', value: '18%' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '16px', marginBottom: '8px' }}>TOP PRODUCTS</h3>
                    <div className="space-y-2 mb-4">
                      {topProductsBySales.map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.count}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '16px', marginBottom: '8px' }}>MONTHLY BREAKDOWN</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'JANUARY', value: '$42,300' },
                        { label: 'FEBRUARY', value: '$38,900' },
                        { label: 'MARCH', value: '$45,600' },
                        { label: 'APRIL', value: '$41,200' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'ORDERS' && (
                  <AdminRevenueOrdersTab
                    orders={unfulfilledOrders}
                    setOrders={setOrders}
                    refreshOrders={refreshOrders}
                    expandedOrderId={expandedOrderId}
                    setExpandedOrderId={setExpandedOrderId}
                    onCloseExpanded={() => { setAddTrackingOrderId(null); setTrackingInput(''); setExpandedOrderId(null); }}
                  />
                )}
                {activeTab === 'PRODUCTS' && (
                  <>
                    <div className="space-y-2 mb-4">
                      {['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'].map((label) => (
                        <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{depletedInventory.products[label] ?? 0}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', marginBottom: '8px' }}>Tools</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>GIFT CARDS</span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>—</span>
                      </div>
                    </div>
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', marginBottom: '8px' }}>Packaging</p>
                    <div className="space-y-2 mb-4">
                      {Object.entries(depletedInventory.packaging).map(([label, value]) => (
                        <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'PAYMENTS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>MEMBERSHIP</h3>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', marginBottom: '10px', lineHeight: 1.4 }}>
                      Initial charges are recorded when a member completes premium checkout (3 / 6 / 12 mo prices match the membership upgrade chart). Auto-renew renewals at the same tier price require a payment processor (e.g. Stripe Billing); this list will include renewal rows when those webhooks sync.
                    </p>
                    {membershipPayments.length === 0 ? (
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', margin: 0, textTransform: 'uppercase' }}>
                        NO MEMBERSHIP PAYMENTS YET
                      </p>
                    ) : (
                      <div className="space-y-2 mb-4" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                        {membershipPayments.map((row) => {
                          const tierLabel = isSubscriptionTierId(row.subscriptionTier)
                            ? getSubscriptionDisplayName(row.subscriptionTier)
                            : row.subscriptionTier;
                          const d = row.createdAt ? new Date(row.createdAt) : null;
                          const dateStr =
                            d && !Number.isNaN(d.getTime())
                              ? `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
                              : '—';
                          return (
                            <div
                              key={row.id}
                              className="flex flex-col gap-1 py-2"
                              style={{ borderBottom: '1px solid #e5e7eb' }}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
                                  {tierLabel}
                                </span>
                                <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>
                                  ${Math.round(row.amountUsd).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#000' }}>{dateStr}</span>
                                <span style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
                                  {(row.userEmail || '').length > 28
                                    ? `${(row.userEmail || '').slice(0, 25)}…`
                                    : row.userEmail || '—'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', textTransform: 'uppercase' }}>
                                  {row.kind === 'renewal' ? 'RENEWAL' : 'INITIAL'}
                                  {row.autoRenew ? ' · AUTO-RENEW' : ''}
                                  {row.source === 'supabase' ? ' · STRIPE' : ''}
                                </span>
                                {row.nextBillingAt && row.autoRenew && (
                                  <span style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
                                    NEXT:{' '}
                                    {(() => {
                                      const nd = new Date(row.nextBillingAt);
                                      return Number.isNaN(nd.getTime())
                                        ? '—'
                                        : `${nd.getMonth() + 1}/${nd.getDate()}/${nd.getFullYear()}`;
                                    })()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginTop: '16px', marginBottom: '8px' }}>METHOD MIX (PLACEHOLDER)</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'CREDIT CARD', value: '68%' },
                        { label: 'PAYPAL', value: '22%' },
                        { label: 'BANK TRANSFER', value: '8%' },
                        { label: 'CASH', value: '2%' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div style={{ height: '24px', minHeight: '24px', flexShrink: 0 }} aria-hidden />
                </div>
              </div>
            </div>

            {activeTab === 'ORDERS' && (
            <>
              {/* Pending orders – own card below orders, square corners; only on ORDERS tab */}
              <div
                className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden mt-4"
                style={{ borderWidth: '1.3px', borderRadius: 0 }}
              >
                <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4" style={{ marginBottom: 0 }}>
                  <h2
                    className="flex-1"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '12px',
                      fontWeight: 500,
                      margin: 0,
                      marginLeft: '6px',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                    }}
                  >
PENDING
                </h2>
                  <img src="/assets/pending-icon.svg" alt="" style={{ width: 14, height: 14, flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }} />
                </div>
                <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />
                <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{pendingOrders.length}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>TOTAL</p>
                  </div>
                  <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                    <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{awaitingTrackingCount}</p>
                    <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>AWAITING TRACKING</p>
                  </div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
                  <div style={{ paddingTop: '12px', paddingRight: '20px', paddingBottom: '24px', paddingLeft: '20px', boxSizing: 'border-box' }}>
                  {pendingOrders.length === 0 ? (
                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', margin: 0, textTransform: 'uppercase' }}>NO PENDING ORDERS.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingOrders.map((order) => {
                        const displayStatus = normalizeOrderStatusForDisplay(order.status || '');
                        const firstImage = order.lineItems?.[0]?.productName
                          ? getProductImage(order.lineItems[0].productName)
                          : order.productImage || getProductImage((order.productName || 'NOIR').toString());
                        const orderAmount = order.total ?? order.amount ?? 0;
                        return (
                          <div
                            key={order.id}
                            className="bg-white border border-gray-200 p-3 flex items-center gap-3"
                            style={{ borderRadius: '4px' }}
                          >
                            <img src={firstImage} alt="" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: 0 }}>{order.date}</p>
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: '2px 0 0 0' }}>ORDER #{(order.orderNumber || order.id || '').toString().replace(/^ORDER\s*#?\s*/i, '').trim() || '—'}</p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080', margin: '2px 0 0 0' }}>${orderAmount.toLocaleString()}</p>
                            </div>
                            <span className="flex-shrink-0 admin-order-status-pill" style={getStatusPillStyle(displayStatus)}><span style={{ lineHeight: 1 }}>{displayStatus}</span></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ height: '24px', minHeight: '24px', flexShrink: 0 }} aria-hidden />
                  </div>
                </div>
              </div>
            </>
            )}

            <PageActionsBelowCard>
              {activeTab === 'ORDERS' && expandedOrderId && expandedOrder ? (
                <>
                  {addTrackingOrderId === expandedOrderId && (
                    <>
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="TRACKING NUMBER"
                        className="w-full py-2 px-3 border border-black"
                        style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', textTransform: 'uppercase', marginBottom: '10px', boxSizing: 'border-box' }}
                      />
                      <div className="flex gap-2" style={{ marginBottom: '10px' }}>
                        <button type="button" onClick={() => handleAddTracking(expandedOrder)} disabled={!trackingInput.trim()} className="flex-1 py-2 border border-black font-medium" style={pageActionButtonStyle}>SAVE TRACKING</button>
                        <button type="button" onClick={() => { setAddTrackingOrderId(null); setTrackingInput(''); }} className="py-2 px-3 border border-gray-300 font-medium" style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', textTransform: 'uppercase' }}>CANCEL</button>
                      </div>
                    </>
                  )}
                  <button type="button" onClick={() => handleCopyOrder(expandedOrder)} className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50" style={pageActionButtonStyle}>COPY</button>
                  <button type="button" onClick={() => setAddTrackingOrderId(expandedOrderId)} className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50" style={{ ...pageActionButtonStyle, marginTop: '10px' }}>ADD TRACKING</button>
                </>
              ) : activeTab === 'OVERVIEW' ? (
                <button
                  type="button"
                  onClick={() => navigate('/admin/revenue/accounting-report')}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  VIEW ACCOUNTING REPORT
                </button>
              ) : activeTab === 'ORDERS' ? (
                <button
                  type="button"
                  onClick={() => navigate('/admin/revenue/fulfilled-orders')}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  VIEW FULFILLED ORDERS
                </button>
              ) : activeTab === 'PRODUCTS' ? (
                <button
                  type="button"
                  onClick={() => navigate('/admin/revenue/edit-inventory')}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  EDIT INVENTORY
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/admin/revenue/fraud-analysis')}
                  className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  VIEW FRAUD ANALYSIS
                </button>
              )}
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}

