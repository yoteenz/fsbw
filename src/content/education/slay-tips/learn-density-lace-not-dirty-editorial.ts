import type { SlayTip } from '../types';

/** DEV-ONLY — full editorial module set for Slay Tip detail QA. */
const IMG_HERO = '/assets/BLANCO%20Hairline.png';
const IMG_LACE = '/assets/BLANCO%20LACE.png';
const IMG_HAIRLINE = '/assets/NOIR/mannequin%20top.png';
const IMG_UNDERSIDE = '/assets/NOIR/mannequin%20bottom.png';
const THUMB = '/assets/NOIR/blanco-thumb.png';

export const SLAY_TIP_DEV_EDITORIAL_LACE_NOT_DIRTY: SlayTip = {
  id: 'slay-tip-dev-density-lace-not-dirty',
  slug: 'dev-lace-not-dirty',
  title: 'YOUR LACE IS NOT DIRTY',
  publicTitle: "YOUR LACE ISN'T DIRTY",
  previewCopy: 'That cloudy cast may not mean it\'s time for wash day.',
  revealTitle: 'INSPECT BEFORE YOU WASH.',
  subtitle: 'SLAY TIP · DEV DENSITY',
  shortDescription: 'Discoloration and product buildup are not the same problem.',
  pillar: 'care',
  format: 'scrapbook',
  slayTicketCost: 0,
  published: true,
  readTime: '2 MIN',
  thumbnailUrl: THUMB,
  coverImageUrl: IMG_HERO,
  relatedSlayTipId: 'slay-tip-dev-density-melt-check',
  deeperContent: {
    contentType: 'season',
    seasonId: 'season-care-03-wash-day',
    masteryId: 'mastery-care',
    title: 'WASH DAY 101',
    description: 'The right way to cleanse your unit.',
  },
  heroMedia: [
    {
      id: 'lace-hero-hairline',
      src: IMG_HERO,
      alt: 'Lace hairline macro',
      role: 'hero',
      order: 0,
      objectPosition: 'center 42%',
    },
    {
      id: 'lace-macro-mesh',
      src: IMG_LACE,
      alt: 'Lace mesh close-up',
      role: 'macro',
      order: 1,
      objectPosition: 'center center',
    },
    {
      id: 'lace-detail-hairline',
      src: IMG_HAIRLINE,
      alt: 'Hairline angle detail',
      role: 'detail',
      order: 2,
      objectPosition: 'center 35%',
    },
    {
      id: 'lace-detail-underside',
      src: IMG_UNDERSIDE,
      alt: 'Cap underside detail',
      role: 'supporting',
      order: 3,
      objectPosition: 'center center',
    },
  ],
  modules: [
    {
      type: 'quickRead',
      body:
        'Your lace can appear cloudy even when the unit itself does not need a full wash. Before reaching for shampoo, identify what is actually sitting on the lace.',
    },
    {
      type: 'diagnosticRow',
      seeing: 'Product residue, oils, makeup transfer or hard-water buildup.',
      notToDo: 'Do not automatically wash the entire unit.',
      move: 'Inspect → identify → spot clean where appropriate.',
    },
    {
      type: 'lookCloser',
      items: [
        {
          number: '01',
          label: 'THE LACE',
          imageId: 'lace-macro-mesh',
          caption: 'A light cloudy appearance can come from product and oils.',
        },
        {
          number: '02',
          label: 'THE HAIRLINE',
          imageId: 'lace-detail-hairline',
          caption: 'Baby hairs and styling product can create a cast.',
        },
        {
          number: '03',
          label: 'THE UNDERSIDE',
          imageId: 'lace-detail-underside',
          caption: 'Check the underside before assuming the entire unit needs cleansing.',
        },
      ],
    },
    {
      type: 'slayerNote',
      number: '01',
      body:
        'Most unnecessary washes come from reacting, not inspecting. A clear lace doesn\'t always mean a clean one. Learn to read it.',
    },
    {
      type: 'comparison',
      leftLabel: 'PRODUCT CAST',
      rightLabel: 'ACTUAL BUILDUP',
      leftImageId: 'lace-macro-mesh',
      rightImageId: 'lace-detail-underside',
    },
    {
      type: 'takeaway',
      body:
        'Inspect first. Not every cloudy lace is dirty lace. Spot clean when needed and protect your unit from unnecessary wear.',
    },
  ],
};
