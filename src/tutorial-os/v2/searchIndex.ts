import type { TutorialSearchEntry } from './schema';
import { getAllTours } from '../registry';

/** Build search index from tour steps + keywords (data-driven). */
export function buildTutorialSearchIndex(): TutorialSearchEntry[] {
  const entries: TutorialSearchEntry[] = [];
  for (const tour of getAllTours()) {
    for (const step of tour.steps) {
      const keywords = [
        step.title.toLowerCase(),
        step.body.toLowerCase(),
        step.benefit.toLowerCase(),
        tour.customerName.toLowerCase(),
        ...(step.pageId ? [step.pageId] : []),
        ...(step.featureId ? [step.featureId] : []),
      ];
      entries.push({
        id: `${tour.id}:${step.id}`,
        query: step.title,
        keywords,
        tourId: tour.id,
        stepId: step.id,
        label: step.title,
        snippet: step.body.slice(0, 120),
      });
    }
  }
  entries.push(
    {
      id: 'search-vouchers-redeem',
      query: 'How do I redeem vouchers?',
      keywords: ['redeem', 'voucher', 'vouchers', 'how do i redeem vouchers'],
      tourId: 'vouchers-walkthrough',
      stepId: 'vouchers-redeem',
      label: 'REDEEMING VOUCHERS',
      snippet: 'Redeem from Rewards when you have enough points.',
    },
    {
      id: 'search-wishlist',
      query: 'Where is Wishlist?',
      keywords: ['wishlist', 'where is wishlist', 'saved', 'favorites'],
      tourId: 'wishlist-tour',
      label: 'WISHLIST TOUR',
      snippet: 'Save units and products you are considering.',
    },
    {
      id: 'search-slay-tickets',
      query: 'How do Slay Tickets work?',
      keywords: ['slay tickets', 'tickets', 'lounge unlock'],
      tourId: 'mansion-tour',
      stepId: 'rewards-tickets-widget',
      label: 'SLAY TICKETS',
      snippet: 'Ticket balance unlocks Lounge TV content.',
    },
    {
      id: 'search-referrals',
      query: 'How do referrals work?',
      keywords: ['referrals', 'refer a friend', 'referral program'],
      tourId: 'account-tour',
      label: 'REFERRAL PROGRAM',
      snippet: 'Refer friends and earn rewards.',
    }
  );
  return entries;
}

export function searchTutorialIndex(query: string, limit = 8): TutorialSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = buildTutorialSearchIndex();
  const scored = index
    .map((entry) => {
      let score = 0;
      if (entry.query.toLowerCase().includes(q)) score += 10;
      if (entry.label.toLowerCase().includes(q)) score += 8;
      for (const kw of entry.keywords) {
        if (kw.includes(q)) score += 4;
        if (q.split(/\s+/).every((w) => kw.includes(w))) score += 6;
      }
      return { entry, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.entry);
}

export function getSuggestedNextTutorial(completedTourIds: string[]): string | undefined {
  const order = ['mansion-tour', 'wishlist-tour', 'vouchers-walkthrough', 'checkout-tour', 'build-a-wig-tour'];
  return order.find((id) => !completedTourIds.includes(id));
}
