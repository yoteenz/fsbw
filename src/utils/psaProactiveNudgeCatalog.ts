/**
 * Static catalog of every proactive PSA nudge variant — for copy review / debug UI.
 * Sample placeholders match what runtime nudges use in psaProactiveNudges.ts + psaOrderCelebrations.ts.
 */
import type { PsaNudgePageContext, PsaProactiveNudgeKind } from './psaProactiveNudges';

export type PsaNudgeCatalogEntry = {
  variantId: string;
  kind: PsaProactiveNudgeKind;
  variantLabel: string;
  priority: number;
  pageContexts: PsaNudgePageContext[];
  headline: string;
  body?: string;
  prefilledMessage?: string;
  actionLabel: string;
  actionPath: string;
  notes?: string;
};

export type PsaNudgeCatalogCategory = {
  kind: PsaProactiveNudgeKind;
  label: string;
  description: string;
  sortOrder: number;
  entries: PsaNudgeCatalogEntry[];
};

const SAMPLE = {
  orderNumber: 'ORDER #332',
  hoursLeft: '18',
  productName: 'NOIR',
  unitLabel: 'NOIR',
  status: 'PREPARING',
  notificationTitle: 'YOUR ORDER IS READY!',
  notificationMessage: 'ORDER #332 IS COMPLETE.',
  stageLabel: 'CONSTRUCTING UNIT',
  trackingNote: 'YOUR UNIT IS BEING BUILT.',
  adminAlertTitle: 'MEMBERSHIP PERK UNLOCKED',
} as const;

/** All proactive nudge copy variants, grouped by kind (priority order). */
export function getPsaProactiveNudgeCatalog(): PsaNudgeCatalogCategory[] {
  const catalog: PsaNudgeCatalogCategory[] = [
    {
      kind: 'unsigned_form',
      label: 'Unsigned order form',
      description: 'PLACED order needs client authorization signature within 24h.',
      sortOrder: 1,
      entries: [
        {
          variantId: 'unsigned_form.with_order',
          kind: 'unsigned_form',
          variantLabel: 'With order number',
          priority: 1,
          pageContexts: ['orders', 'general'],
          headline: 'SIGN YOUR ORDER FORM',
          body: `${SAMPLE.orderNumber} — ${SAMPLE.hoursLeft}H LEFT`,
          prefilledMessage: `Help me sign the order authorization form for ${SAMPLE.orderNumber} before it expires.`,
          actionLabel: 'SIGN FORM',
          actionPath: '/tools/order-form',
        },
        {
          variantId: 'unsigned_form.no_order',
          kind: 'unsigned_form',
          variantLabel: 'No order number',
          priority: 1,
          pageContexts: ['orders', 'general'],
          headline: 'SIGN YOUR ORDER FORM',
          body: `${SAMPLE.hoursLeft}H LEFT`,
          prefilledMessage: 'Help me sign my order authorization form before it expires.',
          actionLabel: 'SIGN FORM',
          actionPath: '/tools/order-form',
        },
      ],
    },
    {
      kind: 'expiring_consult',
      label: 'Expiring consult offer',
      description: 'Consult offer snapshot expires within 48 hours.',
      sortOrder: 2,
      entries: [
        {
          variantId: 'expiring_consult.with_order',
          kind: 'expiring_consult',
          variantLabel: 'With order number',
          priority: 2,
          pageContexts: ['orders', 'general'],
          headline: 'CONSULT OFFER EXPIRING',
          body: `${SAMPLE.orderNumber} — ${SAMPLE.hoursLeft}H LEFT`,
          prefilledMessage: `Walk me through my consult offer on ${SAMPLE.orderNumber} before it expires.`,
          actionLabel: 'VIEW OFFER',
          actionPath: '/account/orders?orderId=…&consultOffer=1',
        },
        {
          variantId: 'expiring_consult.no_order',
          kind: 'expiring_consult',
          variantLabel: 'No order number',
          priority: 2,
          pageContexts: ['orders', 'general'],
          headline: 'CONSULT OFFER EXPIRING',
          body: `${SAMPLE.hoursLeft}H LEFT`,
          prefilledMessage: 'Walk me through my consult offer before it expires.',
          actionLabel: 'VIEW OFFER',
          actionPath: '/account/orders?consultOffer=1',
        },
      ],
    },
    {
      kind: 'stock_alert',
      label: 'Stock alert — cart',
      description: 'Item in bag marked out_of_stock.',
      sortOrder: 3,
      entries: [
        {
          variantId: 'stock_alert.cart.with_product',
          kind: 'stock_alert',
          variantLabel: 'With product name',
          priority: 3,
          pageContexts: ['general'],
          headline: 'ITEM OUT OF STOCK',
          body: `${SAMPLE.productName} IN YOUR BAG`,
          prefilledMessage: `${SAMPLE.productName} in my bag is out of stock. What are my options?`,
          actionLabel: 'NOTIFY ME',
          actionPath: '/build-a-wig/noir (product route)',
        },
        {
          variantId: 'stock_alert.cart.fallback',
          kind: 'stock_alert',
          variantLabel: 'No product name',
          priority: 3,
          pageContexts: ['general'],
          headline: 'ITEM OUT OF STOCK',
          body: 'IN YOUR BAG',
          prefilledMessage: 'Something in my bag is out of stock. What are my options?',
          actionLabel: 'NOTIFY ME',
          actionPath: '/home/shop',
        },
      ],
    },
    {
      kind: 'baw_draft',
      label: 'Build-a-Wig draft / session',
      description: 'Only on /build-a-wig/* when draft saved or in-progress session detected.',
      sortOrder: 4,
      entries: [
        {
          variantId: 'baw_draft.saved',
          kind: 'baw_draft',
          variantLabel: 'Saved draft',
          priority: 4,
          pageContexts: ['baw'],
          headline: 'YOUR BAW DRAFT IS SAVED',
          body: SAMPLE.unitLabel,
          prefilledMessage: `Help me finish my ${SAMPLE.unitLabel} Build-a-Wig configuration where I left off.`,
          actionLabel: 'CONTINUE BAW',
          actionPath: '/build-a-wig/noir',
        },
        {
          variantId: 'baw_draft.session',
          kind: 'baw_draft',
          variantLabel: 'In-progress session (not saved)',
          priority: 4,
          pageContexts: ['baw'],
          headline: 'FINISH YOUR CUSTOMIZATION',
          body: SAMPLE.unitLabel,
          prefilledMessage: `Help me finish my ${SAMPLE.unitLabel} Build-a-Wig configuration where I left off.`,
          actionLabel: 'CONTINUE BAW',
          actionPath: '/build-a-wig/noir',
        },
      ],
    },
    {
      kind: 'order_celebration',
      label: 'Order celebration (one-time)',
      description: 'Smart celebrations from psaOrderCelebrations.ts — shown once per order milestone.',
      sortOrder: 5,
      entries: [
        {
          variantId: 'order_celebration.placed.with_order',
          kind: 'order_celebration',
          variantLabel: 'Placed — with order #',
          priority: 5,
          pageContexts: ['orders'],
          headline: 'YOUR ORDER IS IN MOTION',
          body: SAMPLE.orderNumber,
          prefilledMessage: `My order ${SAMPLE.orderNumber} just went through. What happens next?`,
          actionLabel: 'VIEW ORDER',
          actionPath: '/orders',
          notes: 'Within 48h of placedAt; status PLACED / CONFIRMED / PROCESSING.',
        },
        {
          variantId: 'order_celebration.placed.fallback',
          kind: 'order_celebration',
          variantLabel: 'Placed — no order #',
          priority: 5,
          pageContexts: ['orders'],
          headline: 'YOUR ORDER IS IN MOTION',
          body: 'ORDER CONFIRMED',
          prefilledMessage: 'My order just went through. What happens next?',
          actionLabel: 'VIEW ORDER',
          actionPath: '/orders',
        },
        {
          variantId: 'order_celebration.shipped.with_order',
          kind: 'order_celebration',
          variantLabel: 'Shipped — with order #',
          priority: 5,
          pageContexts: ['orders'],
          headline: "SHE'S ON THE WAY",
          body: SAMPLE.orderNumber,
          prefilledMessage: `Track my order ${SAMPLE.orderNumber} for me.`,
          actionLabel: 'VIEW ORDER',
          actionPath: '/orders',
        },
        {
          variantId: 'order_celebration.shipped.fallback',
          kind: 'order_celebration',
          variantLabel: 'Shipped — no order #',
          priority: 5,
          pageContexts: ['orders'],
          headline: "SHE'S ON THE WAY",
          body: 'PACKAGE SHIPPED',
          prefilledMessage: 'Something shipped. Help me track it.',
          actionLabel: 'VIEW ORDER',
          actionPath: '/orders',
        },
        {
          variantId: 'order_celebration.delivered.with_order',
          kind: 'order_celebration',
          variantLabel: 'Delivered — with order #',
          priority: 5,
          pageContexts: ['orders'],
          headline: 'YOUR PACKAGE ARRIVED',
          body: SAMPLE.orderNumber,
          prefilledMessage: `My order ${SAMPLE.orderNumber} was delivered. Any first-wear tips?`,
          actionLabel: 'VIEW ORDER',
          actionPath: '/orders',
          notes: 'Within 72h of placedAt; status DELIVERED.',
        },
        {
          variantId: 'order_celebration.delivered.fallback',
          kind: 'order_celebration',
          variantLabel: 'Delivered — no order #',
          priority: 5,
          pageContexts: ['orders'],
          headline: 'YOUR PACKAGE ARRIVED',
          body: 'DELIVERED',
          prefilledMessage: 'My package arrived. Any first-wear tips?',
          actionLabel: 'VIEW ORDER',
          actionPath: '/orders',
        },
      ],
    },
    {
      kind: 'stock_alert',
      label: 'Stock alert — wishlist / notifications',
      description: 'From unread notifications (BACK IN STOCK / LOW STOCK). Body often mirrors alert message.',
      sortOrder: 6,
      entries: [
        {
          variantId: 'stock_alert.notif.low_stock',
          kind: 'stock_alert',
          variantLabel: 'Low stock (notification)',
          priority: 6,
          pageContexts: ['wishlist'],
          headline: 'LOW STOCK ALERT',
          body: 'YOUR WISHLIST ITEM IS LOW IN STOCK.',
          prefilledMessage: 'Something on my wishlist changed stock. What should I do?',
          actionLabel: 'SHOP NOW',
          actionPath: '/wishlist',
          notes: 'Upstream alert title: LOW STOCK: ACT FAST!',
        },
        {
          variantId: 'stock_alert.notif.back_in_stock',
          kind: 'stock_alert',
          variantLabel: 'Back in stock (notification)',
          priority: 6,
          pageContexts: ['wishlist'],
          headline: 'BACK IN STOCK',
          body: 'YOUR WISHLIST ITEM IS BACK IN STOCK.',
          prefilledMessage: 'Something on my wishlist changed stock. What should I do?',
          actionLabel: 'SHOP NOW',
          actionPath: '/wishlist',
          notes: 'Upstream alert title: BACK IN STOCK: SHOP NOW!',
        },
        {
          variantId: 'stock_alert.notif.back_in_stock.fallback_body',
          kind: 'stock_alert',
          variantLabel: 'Back in stock — empty message fallback',
          priority: 6,
          pageContexts: ['wishlist'],
          headline: 'BACK IN STOCK',
          body: 'ON YOUR WISHLIST',
          prefilledMessage: 'Something on my wishlist changed stock. What should I do?',
          actionLabel: 'SHOP NOW',
          actionPath: '/wishlist',
        },
        {
          variantId: 'stock_alert.notif.unit_back',
          kind: 'stock_alert',
          variantLabel: 'Unit back in stock alert',
          priority: 6,
          pageContexts: ['wishlist'],
          headline: 'BACK IN STOCK',
          body: `${SAMPLE.productName} IS AVAILABLE NOW — SHOP BEFORE IT SELLS OUT.`,
          prefilledMessage: 'Something on my wishlist changed stock. What should I do?',
          actionLabel: 'SHOP NOW',
          actionPath: '/home/shop',
          notes: 'Upstream title: {unitName} IS BACK IN STOCK',
        },
      ],
    },
    {
      kind: 'order_update',
      label: 'Order update — notifications',
      description: 'Mapped from unread order-related account notifications.',
      sortOrder: 7,
      entries: [
        {
          variantId: 'order_update.notif.tracking',
          kind: 'order_update',
          variantLabel: 'Tracking update',
          priority: 7,
          pageContexts: ['orders'],
          headline: 'ORDER TRACKING UPDATE',
          body: `${SAMPLE.stageLabel}: ${SAMPLE.trackingNote}`,
          prefilledMessage: `Tell me about this order update: ${SAMPLE.stageLabel}: ${SAMPLE.trackingNote}`,
          actionLabel: 'VIEW TRACKING',
          actionPath: '/account/concierge?orderId=…',
        },
        {
          variantId: 'order_update.notif.ready',
          kind: 'order_update',
          variantLabel: 'Order ready (consult)',
          priority: 7,
          pageContexts: ['orders'],
          headline: 'YOUR ORDER IS READY',
          body: SAMPLE.notificationMessage,
          prefilledMessage: `Tell me about this order update: ${SAMPLE.notificationMessage}`,
          actionLabel: 'VIEW OFFER',
          actionPath: '/account/orders?…',
        },
        {
          variantId: 'order_update.notif.received',
          kind: 'order_update',
          variantLabel: 'Order received',
          priority: 7,
          pageContexts: ['orders'],
          headline: 'ORDER CONFIRMED',
          body: 'ORDER #332 IS BEING PROCESSED.',
          prefilledMessage: 'Tell me about this order update: ORDER #332 IS BEING PROCESSED.',
          actionLabel: 'VIEW DETAILS',
          actionPath: '/account/orders?…',
          notes: 'Upstream title: WE\'VE RECEIVED YOUR ORDER!',
        },
        {
          variantId: 'order_update.notif.generic',
          kind: 'order_update',
          variantLabel: 'Generic / truncated title',
          priority: 7,
          pageContexts: ['orders'],
          headline: 'ORDER UPDATE',
          body: SAMPLE.notificationMessage,
          prefilledMessage: 'I have a new order update. What should I know?',
          actionLabel: 'VIEW ORDER',
          actionPath: '/account/orders',
        },
      ],
    },
    {
      kind: 'order_update',
      label: 'Order update — status change',
      description: 'Unseen SHIPPED / PREPARING / CONFIRMED status on active orders.',
      sortOrder: 8,
      entries: [
        {
          variantId: 'order_update.status.shipped',
          kind: 'order_update',
          variantLabel: 'Status SHIPPED',
          priority: 7,
          pageContexts: ['orders'],
          headline: "SHE'S ON THE WAY",
          body: SAMPLE.orderNumber,
          prefilledMessage: `My order ${SAMPLE.orderNumber} status changed to SHIPPED. What's next?`,
          actionLabel: 'VIEW ORDER',
          actionPath: '/account/orders?orderId=…',
        },
        {
          variantId: 'order_update.status.preparing',
          kind: 'order_update',
          variantLabel: 'Status PREPARING',
          priority: 7,
          pageContexts: ['orders'],
          headline: 'ORDER UPDATE',
          body: SAMPLE.orderNumber,
          prefilledMessage: `My order ${SAMPLE.orderNumber} status changed to PREPARING. What's next?`,
          actionLabel: 'VIEW ORDER',
          actionPath: '/account/orders?orderId=…',
        },
        {
          variantId: 'order_update.status.confirmed',
          kind: 'order_update',
          variantLabel: 'Status CONFIRMED',
          priority: 7,
          pageContexts: ['orders'],
          headline: 'ORDER UPDATE',
          body: SAMPLE.orderNumber,
          prefilledMessage: `My order ${SAMPLE.orderNumber} status changed to CONFIRMED. What's next?`,
          actionLabel: 'VIEW ORDER',
          actionPath: '/account/orders?orderId=…',
        },
        {
          variantId: 'order_update.status.no_order',
          kind: 'order_update',
          variantLabel: 'No order number — status only',
          priority: 7,
          pageContexts: ['orders'],
          headline: 'ORDER UPDATE',
          body: SAMPLE.status,
          prefilledMessage: `My order status changed to ${SAMPLE.status}. What's next?`,
          actionLabel: 'VIEW ORDER',
          actionPath: '/account/orders?orderId=…',
        },
      ],
    },
    {
      kind: 'profile_alert',
      label: 'Profile / general alert',
      description: 'Unread non-order, non-stock notifications (incl. admin messages).',
      sortOrder: 9,
      entries: [
        {
          variantId: 'profile_alert.with_title',
          kind: 'profile_alert',
          variantLabel: 'With alert title',
          priority: 8,
          pageContexts: ['alerts'],
          headline: 'NEW PROFILE ALERT',
          body: SAMPLE.adminAlertTitle,
          prefilledMessage: `I have a new alert: ${SAMPLE.adminAlertTitle}. What should I do?`,
          actionLabel: 'VIEW ALERTS',
          actionPath: '/account/alerts',
        },
        {
          variantId: 'profile_alert.fallback',
          kind: 'profile_alert',
          variantLabel: 'No title fallback',
          priority: 8,
          pageContexts: ['alerts'],
          headline: 'NEW PROFILE ALERT',
          body: 'VIEW YOUR ALERTS',
          prefilledMessage: 'I have a new profile alert. What should I do?',
          actionLabel: 'VIEW ALERTS',
          actionPath: '/account/alerts',
        },
      ],
    },
  ];
  return catalog.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Flat list in display order (category sort, then entry order). */
export function flattenPsaProactiveNudgeCatalog(categories = getPsaProactiveNudgeCatalog()): PsaNudgeCatalogEntry[] {
  return categories.flatMap((c) => c.entries);
}

/** Copy-friendly block for one variant. */
export function formatPsaNudgeCatalogEntryForCopy(entry: PsaNudgeCatalogEntry): string {
  const lines = [
    `VARIANT: ${entry.variantId}`,
    `KIND: ${entry.kind}`,
    `LABEL: ${entry.variantLabel}`,
    `PRIORITY: ${entry.priority}`,
    `PAGE CONTEXTS: ${entry.pageContexts.join(', ')}`,
    `HEADLINE: ${entry.headline}`,
    `BODY: ${entry.body ?? ''}`,
    `PREFILLED: ${entry.prefilledMessage ?? ''}`,
    `ACTION LABEL: ${entry.actionLabel}`,
    `ACTION PATH: ${entry.actionPath}`,
  ];
  if (entry.notes) lines.push(`NOTES: ${entry.notes}`);
  return lines.join('\n');
}

/** All variants as one pasteable document. */
export function formatFullPsaNudgeCatalogForCopy(categories = getPsaProactiveNudgeCatalog()): string {
  return categories
    .map((cat) => {
      const header = `# ${cat.label.toUpperCase()} (priority ${cat.sortOrder})\n${cat.description}\n`;
      const blocks = cat.entries.map((e) => formatPsaNudgeCatalogEntryForCopy(e)).join('\n\n---\n\n');
      return `${header}\n${blocks}`;
    })
    .join('\n\n==========\n\n');
}
