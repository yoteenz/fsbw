import { aioGetStarted, aioPaths } from '../utils/paths';
import {
  aioComplianceIcons,
  aioFreightIcons,
  aioPlatformIcons,
  aioServiceDiscoveryIcons,
  AIO_ICON_ASSET_VERSION,
  type AioIconKey,
} from '../config/aioIconRegistry';
import { startBusinessJourneyDef } from '../journeys/startBusinessJourneyConfig';

const v = (path: string) => `${path}?v=${AIO_ICON_ASSET_VERSION}`;

export const homepageHeroSupportingCopy =
  'Everything behind your trucking business—from formation and compliance to dispatch, bookkeeping and freight—connected in one place.';

export type HomepagePathway = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  iconSrc: string;
};

/** Four high-level customer pathways — category routers, not individual service pages. */
export const homepagePathways: HomepagePathway[] = [
  {
    id: 'start-business',
    title: 'START A BUSINESS',
    description: 'Formation, authority, insurance & registration.',
    ctaLabel: 'START MY ROADMAP',
    href: aioPaths.startYourBusiness,
    iconSrc: v(aioServiceDiscoveryIcons.serviceStartBusiness),
  },
  {
    id: 'stay-compliant',
    title: 'STAY COMPLIANT',
    description: 'Permits, filings, renewals & Road Ready™.',
    ctaLabel: 'CHECK MY BUSINESS',
    href: aioGetStarted('compliance'),
    iconSrc: v(aioServiceDiscoveryIcons.servicePermitsCompliance),
  },
  {
    id: 'run-operation',
    title: 'RUN MY OPERATION',
    description: 'Dispatch, fleet support & business services.',
    ctaLabel: 'EXPLORE OPERATIONS',
    href: aioPaths.dispatching,
    iconSrc: v(aioServiceDiscoveryIcons.serviceDispatch),
  },
  {
    id: 'manage-money',
    title: 'MOVE & MANAGE MONEY',
    description: 'Freight, factoring, bookkeeping & financial solutions.',
    ctaLabel: 'EXPLORE MONEY',
    href: aioPaths.factoring,
    iconSrc: v(aioServiceDiscoveryIcons.serviceGetPaidFaster),
  },
];

export type HomepageRoadmapStage = {
  id: string;
  number: string;
  title: string;
  description: string;
  href: string;
  iconKey: AioIconKey;
};

/** Six-stage lifecycle journey — routes from canonical Start Your Business config. */
export const homepageRoadmapStages: HomepageRoadmapStage[] = startBusinessJourneyDef.steps.map((step) => ({
  id: step.id,
  number: step.number,
  title: step.title,
  description:
    step.id === 'build'
      ? 'Form your LLC or INC and establish your foundation.'
      : step.id === 'authorize'
        ? 'Complete operating authority and required filings.'
        : step.id === 'protect'
          ? 'Secure the appropriate insurance coverage.'
          : step.id === 'register'
            ? 'Handle permits, IFTA, IRP and applicable registrations.'
            : step.id === 'activate'
              ? 'Complete compliance and operational setup.'
              : 'Begin operating with the appropriate systems and support.',
  href: step.route,
  iconKey:
    step.id === 'build'
      ? 'companyFormation'
      : step.id === 'authorize'
        ? 'operatingAuthority'
        : step.id === 'protect'
          ? 'serviceTruckingInsurance'
          : step.id === 'register'
            ? 'permits'
            : step.id === 'activate'
              ? 'renewals'
              : 'operationsDispatch',
}));

export const homepageConnectedValue = [
  {
    id: 'records',
    title: 'YOUR RECORDS STAY WITH YOU.',
    body: 'Forms, permits, POAs, renewals and historical documents organized in your Digital Records Vault.',
    iconSrc: v(aioComplianceIcons.documentVault),
  },
  {
    id: 'roadmap',
    title: 'YOUR ROADMAP STAYS CURRENT.',
    body: 'Road Ready™ tracks what’s done, what’s next and what needs attention.',
    iconSrc: v(aioFreightIcons.routeTracking),
  },
  {
    id: 'connected',
    title: 'YOUR SERVICES STAY CONNECTED.',
    body: 'The same client record follows the customer through formation, compliance, dispatch, bookkeeping and growth.',
    iconSrc: v(aioPlatformIcons.messages),
  },
] as const;

export const homepageRoadReadyPromptHref = aioGetStarted();
