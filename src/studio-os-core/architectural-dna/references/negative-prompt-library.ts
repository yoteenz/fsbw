import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { RECEPTION_CONTAMINATION_MARKERS } from '../../canonical-studio-world/department-architectural-fingerprints';

export const NEGATIVE_PROMPT_LIBRARY_VERSION = 'negative-prompt-library.v1' as const;

/** Department-specific forbidden elements — mandatory negative prompts. */
export const DEPARTMENT_NEGATIVE_PROMPTS: Partial<Record<CanonicalMainDepartmentId, string[]>> = {
  'experience-lab': [
    'Reception desk',
    'Waiting room',
    'Reception seating',
    'Corporate lobby',
    'Reception landmark',
    'Retail checkout',
    'Concierge desk',
    'Receptionist furniture',
  ],
  'creative-director-studio': [
    'Reception',
    'Waiting room',
    'Blueprint holograms',
    'Medical furniture',
    'Restaurant furniture',
    'Reception desk',
    'Corporate lobby',
  ],
  marketplace: [
    'Conference room',
    'Reception',
    'Corporate office',
    'Executive boardroom',
    'Waiting lounge',
  ],
  'command-center': [
    'Reception desk',
    'Waiting lounge',
    'Retail storefront',
    'Restaurant',
  ],
  'founder-suite': [
    'Reception desk',
    'Concierge desk',
    'Waiting lounge',
    'Retail checkout',
  ],
};

const UNIVERSAL_FORBIDDEN = [
  'generic luxury room',
  'shared reception template',
  'wireframe',
  'blueprint diagram',
  'CAD view',
  'UI mockup',
  'isolated object cutout',
];

export function resolveDepartmentNegativePrompts(departmentId: CanonicalMainDepartmentId): string[] {
  const specific = DEPARTMENT_NEGATIVE_PROMPTS[departmentId] ?? [];
  return [...new Set([...specific, ...RECEPTION_CONTAMINATION_MARKERS, ...UNIVERSAL_FORBIDDEN])];
}
