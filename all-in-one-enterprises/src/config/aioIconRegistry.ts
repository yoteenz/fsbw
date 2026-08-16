/**
 * All In One semantic icon registry (Refinement 03E + 03F).
 * Request icons by meaning — not hardcoded paths in components.
 */

/** Homepage service-discovery icons (03E / 03E.1) — do not replace via 03F */
export const aioServiceDiscoveryIcons = {
  serviceStartBusiness: '/brand/icons/services/aio-icon-start-business.png',
  servicePermitsCompliance: '/brand/icons/services/aio-icon-permits-compliance.png',
  serviceTruckingInsurance: '/brand/icons/services/aio-icon-trucking-insurance.png',
  serviceDispatch: '/brand/icons/services/aio-icon-dispatch.png',
  serviceMoveFreight: '/brand/icons/services/aio-icon-move-freight.png',
  serviceGetPaidFaster: '/brand/icons/services/aio-icon-get-paid-faster.png',
} as const;

/** Compliance + business (03F Sheet 1) */
export const aioComplianceIcons = {
  companyFormation: '/brand/icons/compliance/aio-icon-company-formation.png',
  operatingAuthority: '/brand/icons/compliance/aio-icon-operating-authority.png',
  permits: '/brand/icons/compliance/aio-icon-permits.png',
  boc3: '/brand/icons/compliance/aio-icon-boc3.png',
  iftaFuelTax: '/brand/icons/compliance/aio-icon-ifta-fuel-tax.png',
  irpRoadTax: '/brand/icons/compliance/aio-icon-irp-road-tax.png',
  renewals: '/brand/icons/compliance/aio-icon-renewals.png',
  documentVault: '/brand/icons/compliance/aio-icon-document-vault.png',
} as const;

/** Fleet + freight operations (03F Sheet 2) — operationsDispatch distinct from homepage serviceDispatch */
export const aioFreightIcons = {
  fleet: '/brand/icons/freight/aio-icon-fleet.png',
  driver: '/brand/icons/freight/aio-icon-driver.png',
  operationsDispatch: '/brand/icons/freight/aio-icon-dispatch-operations.png',
  loadFreight: '/brand/icons/freight/aio-icon-load-freight.png',
  routeTracking: '/brand/icons/freight/aio-icon-route-tracking.png',
  bolPod: '/brand/icons/freight/aio-icon-bol-pod.png',
  shipper: '/brand/icons/freight/aio-icon-shipper.png',
  brokerage: '/brand/icons/freight/aio-icon-brokerage.png',
} as const;

  /** Finance + platform (03F Sheet 3) */
export const aioPlatformIcons = {
  factoring: '/brand/icons/platform/aio-icon-factoring.png',
  /** TEMP — replace with public/brand/icons/platform/aio-icon-bookkeeping.png when artwork approved */
  bookkeeping: '/brand/icons/platform/aio-icon-reports-analytics.png',
  invoiceBilling: '/brand/icons/platform/aio-icon-invoice-billing.png',
  payments: '/brand/icons/platform/aio-icon-payments.png',
  reportsAnalytics: '/brand/icons/platform/aio-icon-reports-analytics.png',
  messages: '/brand/icons/platform/aio-icon-messages.png',
  notifications: '/brand/icons/platform/aio-icon-notifications.png',
  calendarScheduling: '/brand/icons/platform/aio-icon-calendar-scheduling.png',
  support: '/brand/icons/platform/aio-icon-support.png',
} as const;

export const aioIconRegistry = {
  ...aioServiceDiscoveryIcons,
  ...aioComplianceIcons,
  ...aioFreightIcons,
  ...aioPlatformIcons,
} as const;

export type AioIconKey = keyof typeof aioIconRegistry;

/** Bump when re-normalizing source assets (03F.2 expanded library pass) */
export const AIO_ICON_ASSET_VERSION = '03f2';

export type AioExpandedIconMeta = {
  key: AioIconKey;
  label: string;
  group: 'compliance' | 'freight' | 'platform';
  filename: string;
  canvas: 512;
  occupancyPct: number;
  minRecommendedSize: number;
  displayRange: [number, number];
};

/** Expanded platform library catalog (03F / 03F.2) — 24 production icons */
export const aioExpandedIconCatalog: AioExpandedIconMeta[] = [
  { key: 'companyFormation', label: 'Company Formation', group: 'compliance', filename: 'aio-icon-company-formation.png', canvas: 512, occupancyPct: 66.4, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'operatingAuthority', label: 'Operating Authority', group: 'compliance', filename: 'aio-icon-operating-authority.png', canvas: 512, occupancyPct: 66.8, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'permits', label: 'Permits', group: 'compliance', filename: 'aio-icon-permits.png', canvas: 512, occupancyPct: 68.0, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'boc3', label: 'BOC-3', group: 'compliance', filename: 'aio-icon-boc3.png', canvas: 512, occupancyPct: 66.4, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'iftaFuelTax', label: 'IFTA / Fuel Tax', group: 'compliance', filename: 'aio-icon-ifta-fuel-tax.png', canvas: 512, occupancyPct: 66.6, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'irpRoadTax', label: 'IRP / Road Tax', group: 'compliance', filename: 'aio-icon-irp-road-tax.png', canvas: 512, occupancyPct: 68.0, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'renewals', label: 'Renewals', group: 'compliance', filename: 'aio-icon-renewals.png', canvas: 512, occupancyPct: 66.6, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'documentVault', label: 'Document Vault', group: 'compliance', filename: 'aio-icon-document-vault.png', canvas: 512, occupancyPct: 66.6, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'fleet', label: 'Fleet', group: 'freight', filename: 'aio-icon-fleet.png', canvas: 512, occupancyPct: 65.2, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'driver', label: 'Driver', group: 'freight', filename: 'aio-icon-driver.png', canvas: 512, occupancyPct: 67.6, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'operationsDispatch', label: 'Dispatch (operations)', group: 'freight', filename: 'aio-icon-dispatch-operations.png', canvas: 512, occupancyPct: 65.4, minRecommendedSize: 40, displayRange: [40, 64] },
  { key: 'loadFreight', label: 'Load / Freight', group: 'freight', filename: 'aio-icon-load-freight.png', canvas: 512, occupancyPct: 65.2, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'routeTracking', label: 'Route / Tracking', group: 'freight', filename: 'aio-icon-route-tracking.png', canvas: 512, occupancyPct: 66.4, minRecommendedSize: 40, displayRange: [40, 64] },
  { key: 'bolPod', label: 'BOL / POD', group: 'freight', filename: 'aio-icon-bol-pod.png', canvas: 512, occupancyPct: 66.8, minRecommendedSize: 40, displayRange: [40, 64] },
  { key: 'shipper', label: 'Shipper', group: 'freight', filename: 'aio-icon-shipper.png', canvas: 512, occupancyPct: 65.2, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'brokerage', label: 'Brokerage', group: 'freight', filename: 'aio-icon-brokerage.png', canvas: 512, occupancyPct: 63.3, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'factoring', label: 'Factoring / Cash Flow', group: 'platform', filename: 'aio-icon-factoring.png', canvas: 512, occupancyPct: 64.6, minRecommendedSize: 40, displayRange: [40, 64] },
  { key: 'invoiceBilling', label: 'Invoice / Billing', group: 'platform', filename: 'aio-icon-invoice-billing.png', canvas: 512, occupancyPct: 65.0, minRecommendedSize: 40, displayRange: [40, 64] },
  { key: 'payments', label: 'Payments / Payouts', group: 'platform', filename: 'aio-icon-payments.png', canvas: 512, occupancyPct: 64.8, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'reportsAnalytics', label: 'Reports / Analytics', group: 'platform', filename: 'aio-icon-reports-analytics.png', canvas: 512, occupancyPct: 65.4, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'messages', label: 'Messages / Chat', group: 'platform', filename: 'aio-icon-messages.png', canvas: 512, occupancyPct: 63.3, minRecommendedSize: 32, displayRange: [32, 64] },
  { key: 'notifications', label: 'Notifications', group: 'platform', filename: 'aio-icon-notifications.png', canvas: 512, occupancyPct: 66.0, minRecommendedSize: 40, displayRange: [40, 64] },
  { key: 'calendarScheduling', label: 'Calendar / Scheduling', group: 'platform', filename: 'aio-icon-calendar-scheduling.png', canvas: 512, occupancyPct: 66.6, minRecommendedSize: 40, displayRange: [40, 64] },
  { key: 'support', label: 'Support / Help', group: 'platform', filename: 'aio-icon-support.png', canvas: 512, occupancyPct: 66.6, minRecommendedSize: 32, displayRange: [32, 64] },
];

export function getAioIconSrc(key: AioIconKey): string {
  return `${aioIconRegistry[key]}?v=${AIO_ICON_ASSET_VERSION}`;
}

/** Road Ready™ sample / demo roadmap item → icon */
export const aioRoadmapItemIcons: Record<string, AioIconKey> = {
  formation: 'companyFormation',
  usdot: 'operatingAuthority',
  authority: 'operatingAuthority',
  boc3: 'boc3',
  insurance: 'serviceTruckingInsurance',
  irp: 'irpRoadTax',
  ifta: 'iftaFuelTax',
  permits: 'permits',
  dispatch: 'operationsDispatch',
  factoring: 'factoring',
  bookkeeping: 'bookkeeping',
};

/** Client command center health cards → icon */
export const aioBusinessHealthIcons: Partial<Record<string, AioIconKey>> = {
  roadReady: 'companyFormation',
  documents: 'documentVault',
  renewals: 'renewals',
  insurance: 'serviceTruckingInsurance',
  fleet: 'fleet',
  billing: 'invoiceBilling',
  bookkeeping: 'bookkeeping',
};
