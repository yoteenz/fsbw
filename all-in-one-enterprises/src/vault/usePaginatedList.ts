import { useMemo, useState, useEffect } from 'react';

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    total: items.length,
  };
}

export function usePaginatedList<T>(items: T[], pageSize = 25) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    setPage(0);
  }, [items.length, pageSize]);

  const slice = useMemo(() => paginateItems(items, safePage, pageSize).items, [items, safePage, pageSize]);

  return {
    page: safePage,
    pageCount,
    pageSize,
    total: items.length,
    items: slice,
    setPage,
    hasPrev: safePage > 0,
    hasNext: safePage < pageCount - 1,
    goPrev: () => setPage((p) => Math.max(0, p - 1)),
    goNext: () => setPage((p) => Math.min(pageCount - 1, p + 1)),
  };
}
