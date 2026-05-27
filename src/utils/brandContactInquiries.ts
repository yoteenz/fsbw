/** Local mirror of brand contact form submissions (admin UI fallback when API/DB unavailable). */
export const BRAND_CONTACT_INQUIRIES_STORAGE_KEY = 'adminBrandContactInquiries';

export type BrandContactInquiryRecord = {
  id: string;
  name: string;
  email: string;
  isOrderRelated: 'yes' | 'no';
  orderNumber: string;
  message: string;
  timestamp: string;
  status: 'new' | 'read';
};

export function loadBrandContactInquiriesLocal(): BrandContactInquiryRecord[] {
  try {
    const raw = localStorage.getItem(BRAND_CONTACT_INQUIRIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as BrandContactInquiryRecord[]) : [];
  } catch {
    return [];
  }
}

export function appendBrandContactInquiryLocal(entry: BrandContactInquiryRecord): void {
  const list = loadBrandContactInquiriesLocal();
  list.unshift(entry);
  localStorage.setItem(BRAND_CONTACT_INQUIRIES_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
  window.dispatchEvent(new CustomEvent('brandContactInquiriesUpdated'));
}

export function countNewBrandContactInquiriesLocal(): number {
  return loadBrandContactInquiriesLocal().filter((r) => r.status === 'new').length;
}
