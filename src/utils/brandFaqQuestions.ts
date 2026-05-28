/** Local mirror of brand FAQ question submissions (admin fallback when API/DB unavailable). */
export const BRAND_FAQ_QUESTIONS_STORAGE_KEY = 'adminBrandFaqQuestions';

export type BrandFaqQuestionRecord = {
  id: string;
  name: string;
  email: string;
  question: string;
  timestamp: string;
  status: 'new' | 'read';
};

export function loadBrandFaqQuestionsLocal(): BrandFaqQuestionRecord[] {
  try {
    const raw = localStorage.getItem(BRAND_FAQ_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as BrandFaqQuestionRecord[]) : [];
  } catch {
    return [];
  }
}

export function appendBrandFaqQuestionLocal(entry: BrandFaqQuestionRecord): void {
  const list = loadBrandFaqQuestionsLocal();
  list.unshift(entry);
  localStorage.setItem(BRAND_FAQ_QUESTIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
  window.dispatchEvent(new CustomEvent('brandFaqQuestionsUpdated'));
}

export function markBrandFaqQuestionReadLocal(id: string): void {
  const list = loadBrandFaqQuestionsLocal();
  const next = list.map((row) => (row.id === id ? { ...row, status: 'read' as const } : row));
  localStorage.setItem(BRAND_FAQ_QUESTIONS_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('brandFaqQuestionsUpdated'));
}
