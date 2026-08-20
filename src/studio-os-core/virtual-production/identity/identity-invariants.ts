/**
 * Nia identity invariants — descriptive production notes from approved canon text.
 * Not speculative biometrics; sourced from film-trilogy bibles + FS character canon.
 */

export type NiaIdentityInvariantSection = {
  id: string;
  label: string;
  notes: string[];
  sources: string[];
};

/** Text-derived invariants until approved reference imagery exists */
export const NIA_IDENTITY_INVARIANTS_V1: NiaIdentityInvariantSection[] = [
  {
    id: 'face_presentation',
    label: 'Face presentation',
    notes: [
      'Late-20s presentation — confident, naturally stylish, comfortable alone',
      'Relatable over perfect — never performative model energy',
      'Subconscious expression grammar — occasional smile, never frozen glamour',
    ],
    sources: ['film-trilogy-visual-story-bible.md', 'frontal-slayer-canon.ts'],
  },
  {
    id: 'eyes_brows',
    label: 'Eyes & brows',
    notes: [
      'Believable glances — environmental discovery, not direct camera performance in social pilot',
      'Eyebrows should read natural and consistent across frontal, 3/4, and profile stress-test slots',
    ],
    sources: ['film-trilogy-master-cinematography-bible.md', 'nia-behavior-v1'],
  },
  {
    id: 'nose_lips_jaw',
    label: 'Nose, lips & jaw',
    notes: [
      'Facial geometry must remain the same person across expression slots (neutral, smile, serious)',
      'Smile must not reshape jaw, eye anatomy, or age presentation',
      'Profile views are identity stress tests — reject attractive frames that read as a different person',
    ],
    sources: ['NIA IDENTITY LOCK sprint spec §14–15'],
  },
  {
    id: 'skin',
    label: 'Skin presentation',
    notes: [
      'Photorealistic commercial realism — visible texture, natural tonal variation',
      'Avoid AI wax skin, beauty-filter smoothing, excessive airbrush, synthetic pore overlays',
    ],
    sources: ['NIA IDENTITY LOCK sprint spec §13'],
  },
  {
    id: 'hair',
    label: 'Hair',
    notes: [
      'Long luxurious soft waves — healthy, voluminous, natural movement',
      'Hair-detail slot must preserve canonical hairline, texture, density, parting, length',
      'Hair reference must not accidentally redefine face geometry',
    ],
    sources: ['film-trilogy-visual-story-bible.md', 'frontal-slayer-canon.ts'],
  },
  {
    id: 'body',
    label: 'Body continuity',
    notes: [
      'Medium, full-body, and movement slots must share approximate proportions and silhouette',
      'Shoulder, limb, and height presentation should remain consistent relative to environment',
      'No noticeably different body types across reference slots',
    ],
    sources: ['NIA IDENTITY LOCK sprint spec §11'],
  },
  {
    id: 'wardrobe_props',
    label: 'Locked look (context)',
    notes: [
      'White cropped fitted polo with FS red piping',
      'White pleated skirt with FS red trim at hem',
      'White toe shoes with red detailing; white earbuds; iced matcha or latte',
      'One hand free — no purse, no sunglasses, minimal jewelry',
    ],
    sources: ['film-trilogy-visual-story-bible.md', 'FS_WARDROBE_NIA_LOCKED'],
  },
  {
    id: 'forbidden',
    label: 'Forbidden deviations',
    notes: [
      'Choreographed model poses',
      'Sunglasses or purse',
      'Hair outside locked soft-wave look',
      'Wardrobe outside locked polo/skirt set without explicit approval',
      '13 independent text-to-image interpretations — must read as ONE person',
    ],
    sources: ['frontal-slayer-canon.ts'],
  },
];

export function buildIdentityInvariantsDocument(): Record<string, unknown> {
  return {
    version: 1,
    characterKey: 'nia',
    status: 'text_canon_locked',
    imageAnchorRequired: true,
    sections: NIA_IDENTITY_INVARIANTS_V1,
    qcMode: 'MANUAL IDENTITY QC',
    updatedAt: new Date().toISOString(),
  };
}
