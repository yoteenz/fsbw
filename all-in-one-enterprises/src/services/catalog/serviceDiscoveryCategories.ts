import type { ServiceDiscoveryCategoryMeta } from './serviceCatalogTypes';

export const SERVICE_DISCOVERY_CATEGORIES: ServiceDiscoveryCategoryMeta[] = [
  {
    id: 'start-my-business',
    title: 'Start My Business',
    headline: 'Build your trucking business the right way.',
    description: 'LLC and corporation formation, EIN support, business setup, and startup consultation.',
    order: 1,
    icon: 'formation',
  },
  {
    id: 'get-road-ready',
    title: 'Get Road Ready',
    headline: 'Everything you need to get operational.',
    description: 'USDOT, authority, BOC-3, UCR, IRP, IFTA, HVUT, insurance, tags, titles, ELD, and consortium enrollment.',
    order: 2,
    icon: 'legal',
  },
  {
    id: 'permits-taxes-compliance',
    title: 'Permits, Taxes & Compliance',
    headline: 'Stay current with filings and renewals.',
    description: 'Permits, IFTA filing, road taxes, UCR renewal, MCS-150, authority maintenance, and compliance calendar.',
    order: 3,
    icon: 'compliance',
  },
  {
    id: 'safety-drivers',
    title: 'Safety & Drivers',
    headline: 'Protect your operation and your drivers.',
    description: 'Drug & alcohol consortium, Clearinghouse, DQ files, DOT compliance, audit support, safety programs, and ELD.',
    order: 4,
    icon: 'safety',
  },
  {
    id: 'operate-my-business',
    title: 'Operate My Business',
    headline: 'Run day-to-day operations with support.',
    description: 'Dispatch, fleet services, insurance, renewals, document management, and appointments.',
    order: 5,
    icon: 'dispatching',
  },
  {
    id: 'move-freight',
    title: 'Move Freight',
    headline: 'Brokerage and shipper services.',
    description: 'Freight quotes, load coordination, carrier matching, and shipment tracking.',
    order: 6,
    icon: 'brokerage',
  },
  {
    id: 'manage-my-money',
    title: 'Manage My Money',
    headline: 'Financial back-office for carriers.',
    description: 'Bookkeeping, Books Rescue, factoring, payroll, tax preparation, and invoices.',
    order: 7,
    icon: 'bookkeeping',
  },
];

export function getDiscoveryCategoryMeta(id: string): ServiceDiscoveryCategoryMeta | undefined {
  return SERVICE_DISCOVERY_CATEGORIES.find((c) => c.id === id);
}
