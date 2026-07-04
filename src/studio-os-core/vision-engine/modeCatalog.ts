import { VISION_MODE_LABELS } from './constants';
import type { VisionModeKind } from './types';

/** Canonical Vision Mode templates — workspace adapters populate stops. */
export const VISION_MODE_CATALOG: Array<{
  kind: VisionModeKind;
  name: string;
  description: string;
  presenterDefault: boolean;
  recordOptimized: boolean;
}> = [
  {
    kind: 'creative-partner',
    name: VISION_MODE_LABELS['creative-partner'],
    description: 'Designers, agencies, photographers — presenter notes & voiceover.',
    presenterDefault: true,
    recordOptimized: true,
  },
  {
    kind: 'investor',
    name: VISION_MODE_LABELS.investor,
    description: 'Investor relations — business narrative, traction, vision.',
    presenterDefault: true,
    recordOptimized: true,
  },
  {
    kind: 'brand-story',
    name: VISION_MODE_LABELS['brand-story'],
    description: 'Brand philosophy, mansion architecture, emotional positioning.',
    presenterDefault: false,
    recordOptimized: false,
  },
  {
    kind: 'product-showcase',
    name: VISION_MODE_LABELS['product-showcase'],
    description: 'Signature collection & product hero moments.',
    presenterDefault: false,
    recordOptimized: true,
  },
  {
    kind: 'product-launch',
    name: VISION_MODE_LABELS['product-launch'],
    description: 'Launch cinematic — CTA slides & finale emphasis.',
    presenterDefault: true,
    recordOptimized: true,
  },
  {
    kind: 'employee-onboarding',
    name: VISION_MODE_LABELS['employee-onboarding'],
    description: 'Internal team — rooms, flows, operating philosophy.',
    presenterDefault: true,
    recordOptimized: false,
  },
  {
    kind: 'agency-presentation',
    name: VISION_MODE_LABELS['agency-presentation'],
    description: 'Agency pitch — collaboration opportunities & expansion.',
    presenterDefault: true,
    recordOptimized: true,
  },
  {
    kind: 'press-tour',
    name: VISION_MODE_LABELS['press-tour'],
    description: 'Press & media — story beats without internal notes.',
    presenterDefault: false,
    recordOptimized: true,
  },
  {
    kind: 'sales-demo',
    name: VISION_MODE_LABELS['sales-demo'],
    description: 'Sales — conversion paths & membership value.',
    presenterDefault: false,
    recordOptimized: true,
  },
  {
    kind: 'franchise-demo',
    name: VISION_MODE_LABELS['franchise-demo'],
    description: 'Franchise expansion — scalable mansion model.',
    presenterDefault: true,
    recordOptimized: false,
  },
  {
    kind: 'self-guided',
    name: VISION_MODE_LABELS['self-guided'],
    description: 'Explorable mode — user-controlled pacing, no autoplay lock.',
    presenterDefault: false,
    recordOptimized: false,
  },
];
