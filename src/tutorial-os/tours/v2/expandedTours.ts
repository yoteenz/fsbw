import type { TutorialTourDefinitionV2 } from '../../v2/schema';

function stubNodes(prefix: string, titles: string[], route: string): TutorialTourDefinitionV2['nodes'] {
  return titles.map((title, i) => ({
    id: `${prefix}-step-${i + 1}`,
    kind: 'widget' as const,
    pageId: prefix,
    title: title.toUpperCase(),
    body: `${title} — interactive walkthrough step (architecture seeded; copy editable in StudioOS).`,
    benefit: `Learn ${title.toLowerCase()} on the live interface.`,
    route,
    animationType: 'glow' as const,
    position: 'bottom' as const,
    spotlight: true,
    completionTrigger: 'view' as const,
  }));
}

function stubTour(
  id: string,
  customerName: string,
  stepTitles: string[],
  route: string,
  status: 'enabled' | 'draft' = 'draft'
): TutorialTourDefinitionV2 {
  const nodes = stubNodes(id, stepTitles, route);
  return {
    id,
    moduleName: customerName,
    customerName,
    productLabel: 'Onboarding Tutorial',
    description: `${customerName} — ${stepTitles.length} steps (V2 architecture).`,
    estimatedMinutes: Math.max(2, Math.ceil(stepTitles.length / 4)),
    status,
    linearNodeIds: nodes.map((n) => n.id),
    nodes,
  };
}

export const WISHLIST_TOUR_DEF = stubTour(
  'wishlist-tour',
  'Wishlist Tour',
  ['Saved lists', 'Add to wishlist', 'Move to bag', 'Restock alerts', 'Share list'],
  '/wishlist',
  'enabled'
);

export const CHECKOUT_TOUR_DEF = stubTour(
  'checkout-tour',
  'Checkout Tour',
  [
    'Bag overview',
    'Configuration snapshot',
    'Shipping',
    'Billing',
    'Loyalty & vouchers',
    'Order authorization',
    'Payment',
    'Confirmation',
    'Order tracking',
  ],
  '/checkout',
  'enabled'
);

export const BUILD_A_WIG_TOUR_DEF = stubTour(
  'build-a-wig-tour',
  'Build-A-Wig Tour',
  [
    'Unit hub',
    'Length',
    'Density',
    'Texture',
    'Color',
    'Lace',
    'Hairline',
    'Styling',
    'Add-ons',
    'Cap size',
    'Live preview',
    'Confirm selection',
    'Add to bag',
    'Edit from bag',
    'Premium options',
    'Salon styling',
    'Bang & layers',
    'Share slay card',
    'View subscriptions',
    'Save draft',
    'Try mode',
    'Member customize',
    'Edit flow',
    'NOIR live color',
    'Finish build',
  ],
  '/build-a-wig/view',
  'draft'
);

export const REWARDS_TOUR_DEF = stubTour(
  'rewards-tour',
  'Rewards Tour',
  [
    'Rewards overview',
    'Tier chart',
    'Points earning',
    'Point redemptions',
    'Slay tickets',
    'Digital cash',
    'Vouchers intro',
    'Collectibles',
    'Premium chart',
    'Membership upgrade',
    'Affiliate perks',
    'Slay Challenge',
  ],
  '/account/rewards',
  'enabled'
);
