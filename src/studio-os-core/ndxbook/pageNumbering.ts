/** Global page numbering — format page 001, page 002, … across all ndxbook volumes. */

export function formatPageLabel(pageNumber: number): string {
  const n = Math.max(1, Math.floor(pageNumber));
  return `page ${String(n).padStart(3, '0')}`;
}

export function parsePageNumber(label: string): number | null {
  const match = label.trim().match(/^page\s+(\d+)$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
}

export function getNextPageNumber(existingPages: { pageNumber: number }[], storedNext?: number): number {
  if (storedNext && storedNext > 0) {
    const maxExisting = existingPages.reduce((max, p) => Math.max(max, p.pageNumber), 0);
    return Math.max(storedNext, maxExisting + 1);
  }
  const max = existingPages.reduce((max, p) => Math.max(max, p.pageNumber), 0);
  return max + 1;
}

export function allocatePageNumber(
  existingPages: { pageNumber: number }[],
  storedNext?: number
): { pageNumber: number; pageLabel: string; nextPageNumber: number } {
  const pageNumber = getNextPageNumber(existingPages, storedNext);
  return {
    pageNumber,
    pageLabel: formatPageLabel(pageNumber),
    nextPageNumber: pageNumber + 1,
  };
}
