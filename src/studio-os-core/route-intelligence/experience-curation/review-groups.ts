import type { CurationReviewGroup, CurationReviewQueueItem, ExperiencePageRecord } from '../types';

function categorizeFsPage(page: ExperiencePageRecord): string {
  const route = page.representativeRoute.toLowerCase();
  const name = page.displayName.toLowerCase();
  if (/shop|product|checkout|cart|bag|commerce|bundles|units/.test(route + name)) return 'COMMERCE';
  if (/build-a-wig|baw|customize|edit/.test(route + name)) return 'PERSONALIZATION';
  if (/account|wishlist|referral|order|payment|membership/.test(route + name)) return 'ACCOUNT';
  if (/slay-cam|slay-forecast|lobby|lounge|booking|review|message/.test(route + name)) return 'IMMERSIVE_CONTENT';
  if (/dashboard|admin|analytics|client|meeting|backend|worker|founder|studio|headquarters|revenue|audit/.test(route + name)) {
    return 'POSSIBLE_INTERNAL';
  }
  if (/sign-in|home|tools/.test(route + name)) return 'CUSTOMER_EXPERIENCE';
  return 'LOW_CONFIDENCE';
}

function categorizeAioPage(page: ExperiencePageRecord): string {
  const route = page.representativeRoute.toLowerCase();
  const name = page.displayName.toLowerCase();
  if (/^\/office|office/.test(route + name)) return 'OFFICE_INTERNAL';
  if (/portal|client-portal/.test(route)) return 'CUSTOMER_PORTAL';
  if (/carrier|shipper|driverlink/.test(route + name)) return 'ROLE_PORTAL';
  if (/load-board|my-loads|loads\//.test(route)) return 'LOAD_BOARD';
  if (/service-detail|services\//.test(route + name)) return 'SERVICE_DETAILS';
  if (/login|sign-up|signup|forgot|reset|verify|account|profile|settings/.test(route + name)) return 'AUTH_ACCOUNT';
  if (/:id|:loadid|:param|detail|ticket|application|shipment|client/.test(route)) return 'RECORD_DETAIL';
  if (/contact|privacy|get-started|start-your-business|roadmap|support|help|faq/.test(route + name)) return 'SUPPORT_INFORMATION';
  if (/dispatch|brokerage|fleet|management|operations|crm|billing/.test(route + name)) return 'BROKERAGE_DISPATCH';
  if (page.instanceIds.length > 0 && name.includes('service')) return 'SERVICE_DETAILS';
  return 'OTHER_LOW_CONFIDENCE';
}

export function buildFrontalSlayerReviewGroups(
  queue: CurationReviewQueueItem[],
  pages: ExperiencePageRecord[],
): CurationReviewGroup[] {
  const pageById = new Map(pages.map((p) => [p.experiencePageId, p]));
  const buckets = new Map<string, CurationReviewQueueItem[]>();

  for (const item of queue) {
    const page = pageById.get(item.experiencePageId);
    const cat = page ? categorizeFsPage(page) : item.category === 'POSSIBLE_INTERNAL_LEAK' ? 'POSSIBLE_INTERNAL' : 'LOW_CONFIDENCE';
    const list = buckets.get(cat) ?? [];
    list.push(item);
    buckets.set(cat, list);
  }

  for (const page of pages.filter((p) => p.abstractionConfidence === 'LOW' || p.abstractionConfidence === 'MEDIUM')) {
    if (queue.some((q) => q.experiencePageId === page.experiencePageId)) continue;
    const cat = categorizeFsPage(page);
    const list = buckets.get(cat) ?? [];
    list.push({
      category: 'LOW_CONFIDENCE',
      experiencePageId: page.experiencePageId,
      displayName: page.displayName,
      detail: `${page.abstractionConfidence} confidence`,
      severity: page.abstractionConfidence === 'LOW' ? 'WARNING' : 'INFO',
    });
    buckets.set(cat, list);
  }

  const order = [
    'CUSTOMER_EXPERIENCE',
    'COMMERCE',
    'PERSONALIZATION',
    'ACCOUNT',
    'IMMERSIVE_CONTENT',
    'POSSIBLE_INTERNAL',
    'POSSIBLE_DUPLICATE',
    'LOW_CONFIDENCE',
  ];

  return order
    .filter((cat) => buckets.has(cat))
    .map((cat) => ({
      groupId: `frontal-slayer:group:${cat.toLowerCase()}`,
      projectId: 'frontal-slayer',
      label: cat.replace(/_/g, ' '),
      category: cat,
      items: buckets.get(cat)!,
      recommendedAction: cat === 'POSSIBLE_INTERNAL' ? ('MOVE_TO_WORKSPACE' as const) : ('KEEP_AS_PAGE' as const),
      confidence: cat === 'POSSIBLE_INTERNAL' ? ('HIGH' as const) : ('MEDIUM' as const),
    }));
}

export function buildAioReviewGroups(
  queue: CurationReviewQueueItem[],
  pages: ExperiencePageRecord[],
): CurationReviewGroup[] {
  const pageById = new Map(pages.map((p) => [p.experiencePageId, p]));
  const buckets = new Map<string, CurationReviewQueueItem[]>();

  const primaryPages = pages.filter((p) => p.founderPrimary);
  for (const page of primaryPages) {
    const cat = categorizeAioPage(page);
    const list = buckets.get(cat) ?? [];
    if (!list.some((i) => i.experiencePageId === page.experiencePageId)) {
      list.push({
        category: page.abstractionConfidence === 'LOW' ? 'LOW_CONFIDENCE' : 'POSSIBLE_DUPLICATE_PAGE',
        experiencePageId: page.experiencePageId,
        displayName: page.displayName,
        detail: page.representativeRoute,
        severity: cat === 'OFFICE_INTERNAL' ? 'CRITICAL' : 'INFO',
      });
    }
    buckets.set(cat, list);
  }

  for (const item of queue) {
    const page = pageById.get(item.experiencePageId);
    const cat = page ? categorizeAioPage(page) : 'OTHER_LOW_CONFIDENCE';
    const list = buckets.get(cat) ?? [];
    if (!list.some((i) => i.experiencePageId === item.experiencePageId)) list.push(item);
    buckets.set(cat, list);
  }

  const order = [
    'PUBLIC_WEBSITE',
    'SERVICE_DETAILS',
    'AUTH_ACCOUNT',
    'CUSTOMER_PORTAL',
    'ROLE_PORTAL',
    'LOAD_BOARD',
    'BROKERAGE_DISPATCH',
    'RECORD_DETAIL',
    'SUPPORT_INFORMATION',
    'OFFICE_INTERNAL',
    'OTHER_LOW_CONFIDENCE',
  ];

  return order
    .filter((cat) => buckets.has(cat))
    .map((cat) => ({
      groupId: `all-in-one-enterprise:group:${cat.toLowerCase()}`,
      projectId: 'all-in-one-enterprise',
      label: cat.replace(/_/g, ' '),
      category: cat,
      items: buckets.get(cat)!,
      recommendedAction:
        cat === 'OFFICE_INTERNAL'
          ? ('MOVE_TO_WORKSPACE' as const)
          : cat === 'SERVICE_DETAILS'
            ? ('BATCH_MAKE_INSTANCES' as const)
            : ('KEEP_AS_PAGE' as const),
      confidence: cat === 'OFFICE_INTERNAL' ? 'HIGH' : 'MEDIUM',
    }));
}
