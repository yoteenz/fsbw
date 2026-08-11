import type { ProductBreakdownEditorialContent } from './types';

/** DEV-ONLY supplemental editorial metadata for BLANCO Product Breakdown QA. */
export const PRODUCT_BREAKDOWN_EDITORIAL_BLANCO: ProductBreakdownEditorialContent = {
  id: 'product-breakdown-blanco',
  unitId: 'blanco',
  productType: 'SIGNATURE UNIT',
  thesis:
    'Every detail of Blanco is designed for a seamless melt, natural movement, and long-lasting wear with platinum-ready versatility.',
  readTime: '4 MIN',
  productNote: {
    number: '01',
    body:
      'The HD film lace lays flat immediately — but the real advantage is how it melts with heat and pressure against the hairline.',
  },
  benefitPoints: [
    {
      feature: 'HD FILM LACE',
      meaning: '13×6 ultra-thin lace with extended parting room',
      whyItMatters: 'Finer-looking hairline transition and more styling flexibility from ear to ear.',
    },
    {
      feature: 'RAW RUSSIAN HAIR',
      meaning: 'Single-donor straight texture with natural luster',
      whyItMatters: 'Natural movement and longevity when properly cared for and customized.',
    },
    {
      feature: '250% DENSITY',
      meaning: 'Full from root to tip on a straight silhouette',
      whyItMatters: 'Volume that reads premium without sacrificing lace realism at the front.',
    },
    {
      feature: 'SECURE CAP CONSTRUCTION',
      meaning: 'Stretchy breathable cap with removable combs and adjustable band',
      whyItMatters: 'Confidence and comfortable wear during long install days.',
    },
  ],
  inspectionPoints: [
    {
      id: 'blanco-pre-plucked',
      label: 'PRE-PLUCKED HAIRLINE',
      caption: 'Natural density with delicate baby hair for a realistic finish.',
      imageId: 'blanco-inspect-hairline',
    },
    {
      id: 'blanco-hd-lace',
      label: 'HD FILM LACE',
      caption: 'Ultra-thin construction intended to melt seamlessly into the skin.',
      imageId: 'blanco-inspect-lace',
    },
    {
      id: 'blanco-parting',
      label: '13×6 PARTING SPACE',
      caption: 'Extra parting room from ear to ear for versatile styling.',
      imageId: 'blanco-inspect-side',
    },
    {
      id: 'blanco-secure-fit',
      label: 'SECURE FIT',
      caption: 'Elastic band, combs and adjustable strap for a secure, custom fit.',
      imageId: 'blanco-inspect-right',
    },
    {
      id: 'blanco-raw-hair',
      label: 'RAW RUSSIAN HAIR',
      caption: 'Single-donor hair with natural movement and minimal shedding when cared for.',
      imageId: 'blanco-hero-front',
    },
  ],
  bestFor:
    'Clients who want a straight signature silhouette, platinum-ready color versatility, and a fuller 250% density with extended lace parting room.',
  careNotes: [
    'Handle lace gently — avoid heavy product buildup at the hairline.',
    'Raw hair can be professionally colored and toned; follow heat and chemical care guidance.',
    'Store on a mannequin or in a satin bag away from direct heat when not worn.',
  ],
  relatedEducation: [
    {
      id: 'blanco-lace-mastery',
      label: 'GO DEEPER INTO LACE',
      description: 'Lace Mastery',
      targetType: 'mastery',
      targetId: 'mastery-lace',
    },
    {
      id: 'blanco-care-intro',
      label: 'HOW TO CARE FOR THIS TEXTURE',
      description: 'Intro To Your Unit',
      targetType: 'season',
      targetId: 'season-care-mastery',
    },
  ],
};
