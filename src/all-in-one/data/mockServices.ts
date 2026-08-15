import type { AioIntentCard, AioServiceDivision } from '../types';
import { aioPaths } from '../utils/paths';

export const serviceDivisions: AioServiceDivision[] = [
  { id: 'permitting', title: 'PERMITTING & COMPLIANCE', slug: 'permitting', icon: 'permitting' },
  { id: 'formation', title: 'BUSINESS FORMATION', slug: 'business-formation', icon: 'formation' },
  { id: 'insurance', title: 'TRUCKING INSURANCE', slug: 'insurance', icon: 'insurance' },
  { id: 'dispatching', title: 'DISPATCHING SERVICES', slug: 'dispatching', icon: 'dispatching' },
  { id: 'brokerage', title: 'BROKERAGE SERVICES', slug: 'brokerage', icon: 'brokerage' },
];

export const intentCards: AioIntentCard[] = [
  {
    id: 'startup',
    title: 'START MY TRUCKING BUSINESS',
    description: 'From formation through becoming operational.',
    cta: 'GET STARTED',
    href: aioPaths.businessFormation,
    icon: 'startup',
  },
  {
    id: 'legal',
    title: 'GET MY TRUCK LEGAL',
    description: 'Permits, tags, authorities, taxes and related compliance requirements.',
    cta: 'GET STARTED',
    href: aioPaths.permitting,
    icon: 'legal',
  },
  {
    id: 'compliance',
    title: 'KEEP MY BUSINESS COMPLIANT',
    description: 'Renewals, filings, deadlines and document management.',
    cta: 'GET STARTED',
    href: aioPaths.roadmap,
    icon: 'compliance',
  },
  {
    id: 'dispatch',
    title: 'FIND LOADS & RUN MY TRUCK',
    description: 'Dispatch support to keep the carrier moving.',
    cta: 'GET STARTED',
    href: aioPaths.dispatching,
    icon: 'dispatch',
  },
  {
    id: 'freight',
    title: 'MOVE FREIGHT',
    description: 'Brokerage solutions for moving freight.',
    cta: 'REQUEST A QUOTE',
    href: aioPaths.brokerage,
    icon: 'freight',
  },
  {
    id: 'insurance',
    title: 'GET TRUCKING INSURANCE',
    description: 'Request commercial transportation coverage assistance.',
    cta: 'GET A QUOTE',
    href: aioPaths.insurance,
    icon: 'insurance',
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
  brokerage: {
    title: 'Brokerage Services',
    headline: 'Move freight with confidence.',
    description:
      'Shipper-focused freight movement, quote requests, shipment coordination, and load tracking.',
  },
};
