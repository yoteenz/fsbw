/** Storefront product search results live on home shop (UNITS strip filters by `?q=`). */
export const SHOP_PRODUCT_SEARCH_PATH = '/home/shop';

export function shopProductSearchHref(query: string, queryKey = 'q'): string {
  const value = query.trim();
  if (!value) return SHOP_PRODUCT_SEARCH_PATH;
  const params = new URLSearchParams();
  params.set(queryKey, value);
  return `${SHOP_PRODUCT_SEARCH_PATH}?${params.toString()}`;
}
