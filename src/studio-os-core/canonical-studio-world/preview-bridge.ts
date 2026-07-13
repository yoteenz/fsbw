import type { ExperienceLabIndustryPackOptionId } from './contract';
import type { CreativePreviewCompanyId } from '../creative-studio-preview/types';

/**
 * Internal bridge until Creative Studio Preview Compiler migrates off company IDs.
 * UI no longer exposes company switcher — this mapping is implementation-only.
 */
const PACK_TO_PREVIEW_BINDING: Partial<Record<ExperienceLabIndustryPackOptionId, CreativePreviewCompanyId>> = {
  'hair-brand': 'frontal-slayer',
  'hair-salon': 'frontal-slayer',
  'medical-practice': 'studio-os',
  'law-firm': 'studio-os',
  'real-estate': 'studio-os',
  'architecture': 'studio-os',
  restaurant: 'frontal-slayer',
  fitness: 'frontal-slayer',
  creator: 'ndx',
  agency: 'ndx',
  education: 'studio-os',
  'e-commerce': 'frontal-slayer',
  technology: 'studio-os',
  nonprofit: 'studio-os',
  hospitality: 'frontal-slayer',
  corporate: 'studio-os',
  government: 'studio-os',
  'custom-blank': 'studio-os',
};

export function resolveInternalPreviewBinding(packOptionId: ExperienceLabIndustryPackOptionId): CreativePreviewCompanyId {
  return PACK_TO_PREVIEW_BINDING[packOptionId] ?? 'studio-os';
}
