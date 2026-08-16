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

/** Bump when re-normalizing source assets (03F.1 cache bust) */
export const AIO_ICON_ASSET_VERSION = '03f1';

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
