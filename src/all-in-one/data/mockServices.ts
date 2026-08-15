import type { AioIntentCard, AioServiceDivision } from '../types';
import { aioGetStarted } from '../utils/paths';

export const serviceDivisions: AioServiceDivision[] = [
  { id: 'permitting', title: 'PERMITTING & COMPLIANCE', slug: 'permitting', icon: 'permitting' },
  { id: 'formation', title: 'BUSINESS FORMATION', slug: 'business-formation', icon: 'formation' },
  { id: 'insurance', title: 'TRUCKING INSURANCE', slug: 'insurance', icon: 'insurance' },
  { id: 'dispatching', title: 'DISPATCHING SERVICES', slug: 'dispatching', icon: 'dispatching' },
  { id: 'factoring', title: 'FACTORING', slug: 'factoring', icon: 'factoring' },
  { id: 'brokerage', title: 'BROKERAGE SERVICES', slug: 'brokerage', icon: 'brokerage' },
];

export const intentCards: AioIntentCard[] = [
  {
    id: 'startup',
    title: 'START MY TRUCKING BUSINESS',
    description: 'From formation through becoming operational.',
    cta: 'GET STARTED',
    href: aioGetStarted('start-business'),
    icon: 'startup',
    row: 1,
  },
  {
    id: 'legal',
    title: 'GET MY TRUCK LEGAL',
    description: 'Permits, tags, authorities, taxes and related compliance requirements.',
    cta: 'GET STARTED',
    href: aioGetStarted('get-legal'),
    icon: 'legal',
    row: 1,
  },
  {
    id: 'compliance',
    title: 'KEEP MY BUSINESS COMPLIANT',
    description: 'Renewals, filings, deadlines and document management.',
    cta: 'GET STARTED',
    href: aioGetStarted('compliance'),
    icon: 'compliance',
    row: 1,
  },
  {
    id: 'insurance',
    title: 'GET TRUCKING INSURANCE',
    description: 'Request commercial transportation coverage assistance.',
    cta: 'GET A QUOTE',
    href: aioGetStarted('insurance'),
    icon: 'insurance',
    row: 1,
  },
  {
    id: 'dispatch',
    title: 'FIND LOADS & RUN MY TRUCK',
    description: 'Dispatch support to keep the carrier moving.',
    cta: 'GET STARTED',
    href: aioGetStarted('dispatch'),
    icon: 'dispatch',
    row: 2,
  },
  {
    id: 'factoring',
    title: 'GET PAID FASTER',
    description: 'Turn completed loads into cash flow without waiting weeks for broker payment.',
    cta: 'EXPLORE FACTORING',
    href: aioGetStarted('factoring'),
    icon: 'factoring',
    row: 2,
  },
  {
    id: 'freight',
    title: 'MOVE FREIGHT',
    description: 'Brokerage solutions for moving freight.',
    cta: 'REQUEST A QUOTE',
    href: aioGetStarted('move-freight'),
    icon: 'freight',
    row: 2,
  },
];

export const servicePageMeta: Record<
  string,
  { title: string; headline: string; description: string }
> = {
  permitting: {
    title: 'Permitting & Compliance',
    headline: 'Stay legal. Stay rolling.',
    description:
      'Assistance with tags, registrations, IRP, IFTA, operating authority, renewals, and compliance administration.',
  },
  'business-formation': {
    title: 'Business Formation',
    headline: 'Build your trucking business the right way.',
    description:
      'LLC and corporation formation assistance, EIN guidance, startup packages, and business documentation support.',
  },
  insurance: {
    title: 'Trucking Insurance',
    headline: 'Coverage solutions for the road ahead.',
    description:
      'Commercial trucking insurance inquiries — liability, cargo, physical damage, and related transportation coverage assistance.',
  },
  dispatching: {
    title: 'Dispatching Services',
    headline: 'Keep your truck moving.',
    description:
      'Dispatch support, load coordination, and carrier-focused operational assistance.',
  },
  factoring: {
    title: 'Factoring Solutions',
    headline: "Don't let completed loads tie up your cash flow.",
    description:
      'Invoice funding options designed to help eligible carriers access working capital through future factoring partners. Funding subject to approval and applicable terms.',
  },
  brokerage: {
    title: 'Brokerage Services',
    headline: 'Move freight with confidence.',
    description:
      'Shipper-focused freight movement, quote requests, shipment coordination, and load tracking.',
  },
};
