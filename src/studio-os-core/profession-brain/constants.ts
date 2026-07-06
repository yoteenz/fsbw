/** Milestone 91 — Profession Brain™ V1.0 */

export const PROFESSION_BRAIN_STORAGE_KEY = 'studioOs_professionBrain_v1';
export const PROFESSION_BRAIN_VERSION = '1.0.0';

export const PROFESSION_BRAIN_PHILOSOPHY = [
  'Businesses are built on knowledge — not software.',
  'The Profession Brain preserves expertise, reasoning, and professional judgment.',
  'It should think like the founder — not simply repeat instructions.',
  'Knowledge should never die with one person.',
];

import { getBrandVoice, STUDIO_OS_OFFICIAL_TAGLINE } from '../brand-positioning';

export const PROFESSION_BRAIN_TAGLINE = getBrandVoice('profession-brain');

export const PROFESSION_BRAIN_MASTER_TAGLINE = STUDIO_OS_OFFICIAL_TAGLINE;

export const LIVING_BRAIN_PROMPT = 'Would you like to update the Profession Brain?';

export const KNOWLEDGE_DOMAINS = [
  'Professional expertise',
  'Decision-making logic',
  'Business rules',
  'Industry regulations',
  'Best practices',
  'Common mistakes',
  'Exceptions',
  'Lessons learned',
  'Professional judgment',
  'Founder intuition',
  'Historical decisions',
  'Company standards',
  'Internal policies',
  'Customer expectations',
  'Industry terminology',
  'Templates & forms',
  'Compliance knowledge',
  'Operational shortcuts',
  'Business philosophy',
  'Institutional stories',
] as const;

export const STUDIO_OS_PROFESSION_BRAIN_UPDATED = 'studio-os-profession-brain-updated';
