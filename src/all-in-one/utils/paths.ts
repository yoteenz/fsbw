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
  industries: `${BASE}/about#industries`,
  resources: `${BASE}/about#resources`,
} as const;

export function aioServicePath(slug: string): string {
  return `${BASE}/services/${slug}`;
}
