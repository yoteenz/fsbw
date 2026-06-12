import type { CartItem } from '../types/cart';
import { CONSULT_STYLE_ANALYSIS_TIERS } from './consultStyleAnalysisAddon';

export function hairstyleAnalysisCartLine(comparisonCount: 1 | 4): CartItem {
  const tier = CONSULT_STYLE_ANALYSIS_TIERS.find((t) => t.comparisonCount === comparisonCount);
  if (!tier) {
    throw new Error('Invalid hairstyle analysis comparison count');
  }
  return {
    id: `hairstyle-analysis-${Date.now()}`,
    name: 'HAIRSTYLE ANALYSIS',
    price: tier.priceUsd,
    quantity: 1,
    type: 'hairstyle-analysis',
    hairstyleAnalysisComparisonCount: comparisonCount,
    hairstyleAnalysisNonRefundable: true,
    bookingBagSubtitle: `STYLE ANALYSIS · ${tier.label}`,
    image: '/assets/natural front.png',
  };
}

export function appendHairstyleAnalysisToLocalCart(comparisonCount: 1 | 4): CartItem[] {
  const line = hairstyleAnalysisCartLine(comparisonCount);
  const raw = localStorage.getItem('cartItems');
  const items: CartItem[] = raw ? (JSON.parse(raw) as CartItem[]) : [];
  const next = [...items, line];
  localStorage.setItem('cartItems', JSON.stringify(next));
  localStorage.setItem('cartCount', String(next.length));
  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: next.length }));
  window.dispatchEvent(new Event('cartUpdated'));
  window.dispatchEvent(new Event('cartItemsChanged'));
  return next;
}
