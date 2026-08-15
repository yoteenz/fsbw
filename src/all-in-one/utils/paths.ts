import { aioAppConfig } from '../config/appConfig';

const BASE = aioAppConfig.routes.base;

export const aioPaths = {
  home: BASE,
  portal: `${BASE}/portal`,
  services: `${BASE}/services`,
  permitting: `${BASE}/services/permitting`,
  businessFormation: `${BASE}/services/business-formation`,
  insurance: `${BASE}/services/insurance`,
  dispatching: `${BASE}/services/dispatching`,
  factoring: `${BASE}/services/factoring`,
  brokerage: `${BASE}/services/brokerage`,
  portalFactoring: `${BASE}/portal/factoring`,
  about: `${BASE}/about`,
  contact: `${BASE}/contact`,
  roadmap: `${BASE}/roadmap`,
  getStarted: `${BASE}/get-started`,
  roadmapResults: `${BASE}/roadmap/results`,
  servicePlan: `${BASE}/service-plan`,
  requestSubmit: `${BASE}/request/submit`,
  industries: `${BASE}/about#industries`,
  resources: `${BASE}/about#resources`,
  serviceSlug: (slug: string) => `${BASE}/services/${slug}`,
  portalRequest: (requestId: string) => `${BASE}/portal/requests/${requestId}`,
  requestConfirmation: (requestId: string) => `${BASE}/request/confirmation/${requestId}`,
} as const;

export function aioServicePath(slug: string): string {
  return aioPaths.serviceSlug(slug);
}

export function aioGetStarted(goal?: string): string {
  return goal ? `${BASE}/get-started?goal=${goal}` : `${BASE}/get-started`;
}
