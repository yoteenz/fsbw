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
  id: string;
  links: PublicNavLink[];
};

/** Seven discovery categories — POST-BUILD REFINEMENT 05 */
export const servicesMegaMenu: PublicNavCategory[] = [
  {
    id: 'start-my-business',
    title: 'Start My Business',
    links: [
      { label: 'LLC Formation', href: aioPaths.serviceSlug('llc-formation-assistance'), serviceSlug: 'formation' },
      { label: 'INC / Corporation', href: aioPaths.serviceSlug('corporation-formation-assistance'), serviceSlug: 'formation' },
      { label: 'EIN / Business Setup', href: aioPaths.serviceSlug('ein-assistance'), serviceSlug: 'formation' },
      { label: 'Startup Services', href: aioPaths.serviceSlug('trucking-business-startup'), serviceSlug: 'formation' },
    ],
  },
  {
    id: 'get-road-ready',
    title: 'Get Road Ready',
    links: [
      { label: 'USDOT', href: aioPaths.serviceSlug('usdot-registration'), serviceSlug: 'authorities' },
      { label: 'Operating Authority', href: aioPaths.serviceSlug('operating-authority-assistance'), serviceSlug: 'authorities' },
      { label: 'BOC-3', href: aioPaths.serviceSlug('boc-3-assistance'), serviceSlug: 'boc3' },
      { label: 'UCR', href: aioPaths.serviceSlug('ucr-registration'), serviceSlug: 'ucr' },
      { label: 'IRP', href: aioPaths.serviceSlug('irp-apportioned-registration'), serviceSlug: 'permitting' },
      { label: 'IFTA', href: aioPaths.serviceSlug('ifta-fuel-tax-assistance'), serviceSlug: 'fuel-tax' },
      { label: 'HVUT / 2290', href: aioPaths.serviceSlug('hvut-form-2290'), serviceSlug: 'hvut' },
      { label: 'Insurance', href: aioPaths.insurance, serviceSlug: 'insurance' },
      { label: 'Tags / Titles', href: aioPaths.serviceSlug('tag-services'), serviceSlug: 'tags' },
    ],
  },
  {
    id: 'permits-taxes-compliance',
    title: 'Permits, Taxes & Compliance',
    links: [
      { label: 'Permits', href: aioPaths.permitting, serviceSlug: 'permitting' },
      { label: 'IFTA Filing', href: aioPaths.serviceSlug('ifta-filing'), serviceSlug: 'fuel-tax' },
      { label: 'Road Taxes', href: aioPaths.serviceSlug('road-tax-assistance'), serviceSlug: 'road-tax' },
      { label: 'UCR Renewal', href: aioPaths.serviceSlug('ucr-renewal'), serviceSlug: 'ucr' },
      { label: 'MCS-150 / Biennial Update', href: aioPaths.serviceSlug('mcs-150-biennial-update'), serviceSlug: 'mcs150' },
      { label: 'Authority Maintenance', href: aioPaths.serviceSlug('authority-maintenance'), serviceSlug: 'authorities' },
      { label: 'Renewals', href: aioPaths.serviceSlug('renewals'), serviceSlug: 'permitting' },
    ],
  },
  {
    id: 'safety-drivers',
    title: 'Safety & Drivers',
    links: [
      { label: 'Drug & Alcohol Consortium', href: aioPaths.serviceSlug('drug-alcohol-consortium'), serviceSlug: 'consortium' },
      { label: 'Clearinghouse Assistance', href: aioPaths.serviceSlug('fmcsa-clearinghouse-assistance'), serviceSlug: 'clearinghouse' },
      { label: 'Driver Qualification Files', href: aioPaths.serviceSlug('driver-qualification-files'), serviceSlug: 'dq-files' },
      { label: 'DOT Compliance Support', href: aioPaths.serviceSlug('dot-compliance-support'), serviceSlug: 'dot-compliance' },
      { label: 'Audit Support', href: aioPaths.serviceSlug('dot-audit-support'), serviceSlug: 'dot-audit' },
      { label: 'Safety Programs', href: aioPaths.serviceSlug('safety-compliance-programs'), serviceSlug: 'safety-programs' },
      { label: 'ELD Services', href: aioPaths.serviceSlug('eld-services'), serviceSlug: 'eld' },
    ],
  },
  {
    id: 'operate-my-business',
    title: 'Operate',
    links: [
      { label: 'Dispatch', href: aioPaths.dispatching, serviceSlug: 'dispatch' },
      { label: 'Find a Driver', href: aioPaths.driverLink, serviceSlug: 'driverlink' },
      { label: 'Truck Maintenance & Repair', href: aioPaths.fleetCare, serviceSlug: 'fleetcare' },
      { label: 'Insurance', href: aioPaths.insurance, serviceSlug: 'insurance' },
      { label: 'Fleet / Operational Support', href: aioPaths.serviceSlug('operational-support'), serviceSlug: 'dispatch' },
      { label: 'Bookkeeping', href: aioPaths.bookkeeping, serviceSlug: 'bookkeeping' },
    ],
  },
  {
    id: 'move-freight',
    title: 'Move Freight',
    links: [
      { label: 'Brokerage', href: aioPaths.brokerage, serviceSlug: 'brokerage' },
      { label: 'Shipper Services', href: aioPaths.serviceSlug('shipper-services'), serviceSlug: 'brokerage' },
      { label: 'Freight Quote', href: aioPaths.serviceSlug('freight-quote'), serviceSlug: 'brokerage' },
    ],
  },
  {
    id: 'manage-my-money',
    title: 'Manage My Money',
    links: [
      { label: 'Bookkeeping', href: aioPaths.bookkeeping, serviceSlug: 'bookkeeping' },
      { label: 'Books Rescue', href: aioPaths.serviceSlug('books-rescue'), serviceSlug: 'bookkeeping' },
      { label: 'Factoring', href: aioPaths.factoring, serviceSlug: 'factoring' },
      { label: 'Payroll', href: aioPaths.serviceSlug('payroll-services'), serviceSlug: 'payroll' },
      { label: 'Tax Preparation', href: aioPaths.serviceSlug('tax-preparation'), serviceSlug: 'tax-prep' },
    ],
  },
];

export const resourcesMenuLinks: PublicNavLink[] = [
  { label: 'Road Ready™', href: aioPaths.roadReadyPublic },
  { label: 'Find a Service', href: aioPaths.servicesFind },
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
