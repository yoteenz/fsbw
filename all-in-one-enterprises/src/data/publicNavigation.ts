import { aioPaths } from '../utils/paths';
import { getPublicServiceCta } from '../launch/serviceActivationLaunch';

export type PublicNavLink = {
  label: string;
  href: string;
  /** Service slug for activation badge (optional) */
  serviceSlug?: string;
};

export type PublicNavCategory = {
  title: string;
  links: PublicNavLink[];
};

export const servicesMegaMenu: PublicNavCategory[] = [
  {
    title: 'Start & Register',
    links: [
      { label: 'Business Formation', href: aioPaths.businessFormation, serviceSlug: 'business-formation' },
      { label: 'Operating Authority', href: aioPaths.serviceSlug('operating-authority-assistance'), serviceSlug: 'authorities' },
      { label: 'BOC-3', href: aioPaths.serviceSlug('boc-3-assistance'), serviceSlug: 'boc3' },
      { label: 'Tags & Registration', href: aioPaths.serviceSlug('tag-services'), serviceSlug: 'tags' },
    ],
  },
  {
    title: 'Permits & Compliance',
    links: [
      { label: 'Permitting', href: aioPaths.permitting, serviceSlug: 'permitting' },
      { label: 'IRP', href: aioPaths.serviceSlug('irp-apportioned-registration'), serviceSlug: 'permitting' },
      { label: 'IFTA', href: aioPaths.serviceSlug('ifta-fuel-tax-assistance'), serviceSlug: 'fuel-tax' },
      { label: 'Fuel Taxes', href: aioPaths.serviceSlug('ifta-fuel-tax-assistance'), serviceSlug: 'fuel-tax' },
      { label: 'Road / Use Taxes', href: aioPaths.serviceSlug('road-tax-assistance'), serviceSlug: 'road-tax' },
      { label: 'Renewals', href: aioPaths.serviceSlug('renewals'), serviceSlug: 'permitting' },
      { label: 'Compliance Services', href: aioPaths.serviceSlug('compliance-support'), serviceSlug: 'permitting' },
    ],
  },
  {
    title: 'Operate',
    links: [
      { label: 'Dispatching', href: aioPaths.dispatching, serviceSlug: 'dispatching' },
      { label: 'Bookkeeping', href: aioPaths.bookkeeping, serviceSlug: 'bookkeeping' },
      { label: 'Factoring', href: aioPaths.factoring, serviceSlug: 'factoring' },
      { label: 'Trucking Insurance', href: aioPaths.insurance, serviceSlug: 'insurance' },
    ],
  },
  {
    title: 'Move Freight',
    links: [
      { label: 'Brokerage', href: aioPaths.brokerage, serviceSlug: 'brokerage' },
      { label: 'Shipper Services', href: aioPaths.serviceSlug('shipper-services'), serviceSlug: 'brokerage' },
      { label: 'Request a Freight Quote', href: aioPaths.serviceSlug('freight-quote'), serviceSlug: 'brokerage' },
    ],
  },
];

export const resourcesMenuLinks: PublicNavLink[] = [
  { label: 'Road Ready™', href: aioPaths.roadReadyPublic },
  { label: 'Start Your Business', href: aioPaths.startYourBusiness },
  { label: 'Trucking Resources', href: `${aioPaths.about}#resources` },
  { label: 'Compliance Guide', href: aioPaths.roadmap },
  { label: 'Contact & FAQ', href: aioPaths.contact },
];

export function navLinkActivationBadge(serviceSlug?: string): string | null {
  if (!serviceSlug) return null;
  const { state, allowed } = getPublicServiceCta(serviceSlug);
  if (allowed && (state === 'GO' || state === 'LIMITED_PILOT')) return null;
  if (state === 'COMING_SOON') return 'Coming Soon';
  if (state === 'HOLD' || state === 'BLOCKED') return 'Request Info';
  if (state === 'INTERNAL_ONLY' || state === 'DISABLED') return null;
  return null;
}
