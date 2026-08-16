import { aioPaths } from '../utils/paths';

export type RouteCategory =
  | 'PUBLIC'
  | 'CUSTOMER'
  | 'STAFF'
  | 'MANAGEMENT'
  | 'SYSTEM'
  | 'SECURITY'
  | 'DEBUG';

export interface AioRouteEntry {
  path: string;
  category: RouteCategory;
  label: string;
  dynamic?: boolean;
}

export const AIO_ROUTE_MANIFEST: AioRouteEntry[] = [
  { path: aioPaths.home, category: 'PUBLIC', label: 'Home' },
  { path: aioPaths.services, category: 'PUBLIC', label: 'Services' },
  { path: aioPaths.about, category: 'PUBLIC', label: 'About' },
  { path: aioPaths.contact, category: 'PUBLIC', label: 'Contact' },
  { path: aioPaths.getStarted, category: 'PUBLIC', label: 'Get Started / Road Ready entry' },
  { path: aioPaths.schedule, category: 'PUBLIC', label: 'Schedule appointment' },
  { path: aioPaths.portal, category: 'CUSTOMER', label: 'Portal home' },
  { path: aioPaths.roadReady, category: 'CUSTOMER', label: 'Road Ready' },
  { path: aioPaths.portalOnboarding, category: 'CUSTOMER', label: 'Road Ready onboarding' },
  { path: aioPaths.portalBilling, category: 'CUSTOMER', label: 'Billing' },
  { path: aioPaths.portalVault, category: 'CUSTOMER', label: 'Document vault' },
  { path: aioPaths.portalMessages, category: 'CUSTOMER', label: 'Messages' },
  { path: aioPaths.portalAppointments, category: 'CUSTOMER', label: 'Appointments' },
  { path: aioPaths.portalDispatch, category: 'CUSTOMER', label: 'Dispatch' },
  { path: aioPaths.portalFactoring, category: 'CUSTOMER', label: 'Factoring' },
  { path: aioPaths.portalInsurance, category: 'CUSTOMER', label: 'Insurance' },
  { path: aioPaths.portalSettingsSecurity, category: 'CUSTOMER', label: 'Portal security settings' },
  { path: aioPaths.office, category: 'STAFF', label: 'Office home' },
  { path: aioPaths.officeClients, category: 'STAFF', label: 'Clients' },
  { path: aioPaths.officeCrm, category: 'STAFF', label: 'CRM' },
  { path: aioPaths.officeDispatch, category: 'STAFF', label: 'Dispatch' },
  { path: aioPaths.officeBrokerage, category: 'STAFF', label: 'Brokerage' },
  { path: aioPaths.officeFactoring, category: 'STAFF', label: 'Factoring' },
  { path: aioPaths.officeInsurance, category: 'STAFF', label: 'Insurance' },
  { path: aioPaths.officeBilling, category: 'STAFF', label: 'Billing' },
  { path: aioPaths.officeManagement, category: 'MANAGEMENT', label: 'Management' },
  { path: aioPaths.officeReports, category: 'MANAGEMENT', label: 'Reports' },
  { path: aioPaths.officeIntegrations, category: 'STAFF', label: 'Integrations' },
  { path: aioPaths.officeSecurity, category: 'SECURITY', label: 'Security Center' },
  { path: aioPaths.officeDataHealth, category: 'SYSTEM', label: 'Data Health' },
  { path: aioPaths.officeQa, category: 'SYSTEM', label: 'QA Command Center' },
  { path: aioPaths.officeQaAccessibility, category: 'SYSTEM', label: 'QA Accessibility' },
  { path: aioPaths.officeQaPerformance, category: 'SYSTEM', label: 'QA Performance' },
  { path: aioPaths.officeQaDevices, category: 'SYSTEM', label: 'QA Devices' },
  { path: aioPaths.officeQaBrowsers, category: 'SYSTEM', label: 'QA Browsers' },
  { path: aioPaths.officeSecurityProductionReadiness, category: 'SECURITY', label: 'Production readiness' },
];

export function getRoutesByCategory(category: RouteCategory): AioRouteEntry[] {
  return AIO_ROUTE_MANIFEST.filter((r) => r.category === category);
}

export function getRouteManifestSummary() {
  const byCategory = {} as Record<RouteCategory, number>;
  for (const r of AIO_ROUTE_MANIFEST) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }
  return { total: AIO_ROUTE_MANIFEST.length, byCategory };
}
