import type { OrganizationProfessionBrain, PublicKnowledgeSurface } from './types';

const PUBLIC_CAPABILITIES: PublicKnowledgeSurface['capabilities'] = [
  'learn',
  'ask',
  'prepare',
  'workflow',
  'book',
  'upgrade',
];

export function buildDefaultPublicSurfaces(brain: OrganizationProfessionBrain): PublicKnowledgeSurface[] {
  const customerFacing = ['hair-color', 'hair-analysis', 'fuel-tax', 'permit', 'marketing', 'legal-intake'];
  if (!customerFacing.includes(brain.id)) {
    return [
      {
        id: `public-${brain.id}`,
        brainId: brain.id,
        publicTitle: `${brain.label.replace(' Brain', '')} Expert`,
        description: 'Private operational knowledge — publish selectively when ready.',
        enabled: false,
        capabilities: ['learn', 'ask'],
      },
    ];
  }

  return [
    {
      id: `public-${brain.id}`,
      brainId: brain.id,
      publicTitle: `${brain.label.replace(' Brain', '')} Expert`,
      description: `Customers can learn, ask questions, and prepare before consultations — you control what is shared.`,
      enabled: brain.id === 'hair-color' || brain.id === 'marketing',
      capabilities: PUBLIC_CAPABILITIES,
    },
  ];
}

export function generateAllPublicSurfaces(
  brains: OrganizationProfessionBrain[]
): PublicKnowledgeSurface[] {
  return brains.flatMap(buildDefaultPublicSurfaces);
}
