import type { ServiceDivision } from '../../data/services';
import type { AioIconKey } from '../../config/aioIconRegistry';

/** Maps discovery category IDs to division slugs for hub routing */
export const discoveryCategoryToDivision: Partial<Record<string, ServiceDivision>> = {
  'start-my-business': 'business-formation',
  'permits-taxes-compliance': 'permitting',
  'safety-drivers': 'safety',
  'operate-my-business': 'dispatching',
  'move-freight': 'brokerage',
  'manage-my-money': 'financial',
};

/** Icon keys for division hubs */
export const divisionIconKey: Record<ServiceDivision, AioIconKey> = {
  permitting: 'permits',
  'business-formation': 'companyFormation',
  insurance: 'serviceTruckingInsurance',
  dispatching: 'serviceDispatch',
  factoring: 'factoring',
  bookkeeping: 'bookkeeping',
  brokerage: 'brokerage',
  safety: 'driver',
  financial: 'bookkeeping',
};

/** Moodboard-aligned hub eyebrow overrides (content from live division meta when possible) */
export const divisionHubEyebrow: Partial<Record<ServiceDivision, string>> = {
  permitting: 'Permits & Compliance',
  'business-formation': 'Start My Business',
  insurance: 'Trucking Insurance',
  dispatching: 'Dispatch Services',
  brokerage: 'Move Freight',
  factoring: 'Factoring Solutions',
  bookkeeping: 'Bookkeeping',
  safety: 'Safety & Drivers',
  financial: 'Manage My Money',
};
