import { aioGetStarted, aioPaths } from '../utils/paths';
import type { AioIntentCard } from '../types';
import { aioServiceDiscoveryIcons, AIO_ICON_ASSET_VERSION } from '../config/aioIconRegistry';

const v = (path: string) => `${path}?v=${AIO_ICON_ASSET_VERSION}`;

export type HomePathway = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: AioIntentCard['icon'];
  iconSrc: string;
  serviceSlug: string;
};

export const homePathways: HomePathway[] = [
  {
    id: 'start-business',
    title: 'START MY BUSINESS',
    description: 'Form your LLC or INC and get everything you need to hit the road.',
    href: aioPaths.startYourBusiness,
    icon: 'startup',
    iconSrc: v(aioServiceDiscoveryIcons.serviceStartBusiness),
    serviceSlug: 'business-formation',
  },
  {
    id: 'permits-compliance',
    title: 'PERMITS & COMPLIANCE',
    description: 'Stay legal and avoid expensive fines. We handle the details.',
    href: aioPaths.permitting,
    icon: 'compliance',
    iconSrc: v(aioServiceDiscoveryIcons.servicePermitsCompliance),
    serviceSlug: 'permitting',
  },
  {
    id: 'insurance',
    title: 'TRUCKING INSURANCE',
    description: 'Protect your business with the right coverage at the right price.',
    href: aioPaths.insurance,
    icon: 'insurance',
    iconSrc: v(aioServiceDiscoveryIcons.serviceTruckingInsurance),
    serviceSlug: 'insurance',
  },
  {
    id: 'dispatch',
    title: 'DISPATCH MY TRUCKS',
    description: 'Professional dispatch. More loads. Better rates. Less hassle.',
    href: aioPaths.dispatching,
    icon: 'dispatch',
    iconSrc: v(aioServiceDiscoveryIcons.serviceDispatch),
    serviceSlug: 'dispatching',
  },
  {
    id: 'move-freight',
    title: 'MOVE FREIGHT',
    description: 'Brokerage and shipper solutions to move freight efficiently.',
    href: aioPaths.brokerage,
    icon: 'freight',
    iconSrc: v(aioServiceDiscoveryIcons.serviceMoveFreight),
    serviceSlug: 'brokerage',
  },
  {
    id: 'factoring',
    title: 'GET PAID FASTER',
    description: 'Factoring solutions designed to help improve cash flow.',
    href: aioPaths.factoring,
    icon: 'factoring',
    iconSrc: v(aioServiceDiscoveryIcons.serviceGetPaidFaster),
    serviceSlug: 'factoring',
  },
];

export const roadReadyTeaserCategories = [
  'Business Formation',
  'USDOT Number',
  'Operating Authority',
  'BOC-3',
  'Insurance',
  'IRP / IFTA / Permits',
  'Dispatch & More',
];

export const heroTrustItems = [
  { title: 'One Platform.', subtitle: 'Every Solution.' },
  { title: 'Compliance-First.', subtitle: 'Peace of Mind.' },
  { title: 'Experts Who', subtitle: 'Truck With You.' },
];

export const heroSecondaryCtaHref = aioPaths.roadReadyPublic;

export const heroPrimaryCtaHref = aioGetStarted('start-business');
