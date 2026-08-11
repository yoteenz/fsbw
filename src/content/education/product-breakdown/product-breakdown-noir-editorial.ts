import type { ProductBreakdownEditorialContent } from './types';

/** NOIR-only editorial presentation — anatomy / precision archetype. */
export const PRODUCT_BREAKDOWN_EDITORIAL_NOIR: Partial<ProductBreakdownEditorialContent> = {
  thesis:
    'Straight raw Cambodian hair, 200% density, and HD film lace — engineered for a refined melt worth inspecting up close.',
  readTime: '4 MIN',
  atAGlance: [
    {
      id: 'lace',
      label: 'LACE',
      spec: '13×6 HD FILM LACE',
      detail: 'Ultra-thin construction designed for a refined transition.',
      tier: 'primary',
    },
    {
      id: 'hair',
      label: 'HAIR',
      spec: 'RAW CAMBODIAN STRAIGHT',
      detail: 'Single-donor human hair selected for movement and longevity.',
      tier: 'primary',
    },
    {
      id: 'density',
      label: 'DENSITY',
      spec: '200% DENSITY',
      detail: 'Handmade fullness from root to tip.',
      tier: 'primary',
    },
    {
      id: 'length',
      label: 'LENGTH',
      spec: '16" – 30"',
      detail: 'True-to-length options via Build-A-Wig.',
      tier: 'primary',
    },
    {
      id: 'hairline',
      label: 'HAIRLINE',
      spec: 'PRE-PLUCKED HAIRLINE',
      detail: 'Lightly bleached single-strand knots for a natural finish.',
      tier: 'secondary',
    },
    {
      id: 'cap',
      label: 'CAP / FIT',
      spec: 'BREATHABLE STRETCH CAP',
      detail: 'Removable combs and adjustable elastic band.',
      tier: 'secondary',
    },
  ],
  inspectionPoints: [
    {
      id: 'noir-hairline',
      label: 'PRE-PLUCKED HAIRLINE',
      caption: 'Graduated density creates a softer transition at the front.',
      imageId: 'noir-inspect-hairline',
    },
    {
      id: 'noir-lace',
      label: 'HD FILM LACE',
      caption: 'Fine lace construction minimizes visual weight against the skin.',
      imageId: 'noir-inspect-lace',
    },
    {
      id: 'noir-parting',
      label: 'PARTING SPACE',
      caption: '13×6 coverage creates flexible frontal styling space.',
      imageId: 'noir-inspect-hairline',
    },
    {
      id: 'noir-side',
      label: 'SIDE PROFILE',
      caption: 'Inspect silhouette and density from the side.',
      imageId: 'noir-side-profile',
    },
    {
      id: 'noir-strands',
      label: 'RAW CAMBODIAN HAIR',
      caption: 'Single-donor texture selected for movement and longevity.',
      imageId: 'noir-hero-front',
    },
  ],
  interiorCallouts: [
    {
      number: '01',
      label: 'HD FILM LACE',
      body: 'Ultra-thin lace area designed for the most undetectable melt.',
    },
    {
      number: '02',
      label: 'ELASTIC BAND',
      body: 'Built-in band for added security without glue-only reliance.',
    },
    {
      number: '03',
      label: 'REMOVABLE COMBS',
      body: 'Adjust combs to match your install preference.',
    },
    {
      number: '04',
      label: 'ADJUSTABLE STRAP',
      body: 'Customize cap fit for comfort during long wear days.',
    },
  ],
  productNote: {
    number: '01',
    body:
      'The HD film lace is the engineering story — inspect how the lace lays flat before melt, then how heat and pressure refine the transition at the hairline.',
  },
  benefitPoints: [
    {
      feature: 'HD FILM LACE',
      meaning: '',
      whyItMatters: 'REFINED HAIRLINE TRANSITION',
    },
    {
      feature: 'SINGLE-DONOR RAW CAMBODIAN HAIR',
      meaning: '',
      whyItMatters: 'MOVEMENT + LONGEVITY',
    },
    {
      feature: '200% DENSITY',
      meaning: '',
      whyItMatters: 'FULL SIGNATURE SILHOUETTE',
    },
    {
      feature: 'LIGHTLY BLEACHED SINGLE-STRAND KNOTS',
      meaning: '',
      whyItMatters: 'MORE REFINED FRONTAL DETAIL',
    },
  ],
  includedItems: [{ label: '1 SIGNATURE UNIT', detail: 'Delivered in its natural, uncustomized state.' }],
  bestFor:
    'Clients who want a straight off-black silhouette, a refined HD lace melt, and Build-A-Wig customization without sacrificing construction quality.',
  careNotes: [
    'Handle lace gently — avoid heavy product buildup at the hairline.',
    'Raw Cambodian hair can be professionally colored when properly cared for.',
    'Store on a mannequin or in a satin bag away from direct heat when not worn.',
  ],
};
