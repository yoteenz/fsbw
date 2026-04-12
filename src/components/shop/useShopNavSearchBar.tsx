import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useSiteNavSearch } from '../../hooks/useSiteNavSearch';

type SearchTriggerProps = Omit<ComponentPropsWithoutRef<'button'>, 'onClick'>;

/**
 * Shop / product nav bars: search icon + centered input (replaces breadcrumb only), same behavior as admin header search.
 */
export function useShopNavSearchBar() {
  const { navSearchOpen, handleSearchIconClick, navSearchInputProps } = useSiteNavSearch();

  function NavCenter({
    showMobileMenu,
    children,
  }: {
    showMobileMenu: boolean;
    /** Breadcrumb row (typically a `<p>`); shown when menu open or search closed */
    children: ReactNode;
  }) {
    return (
      <div
        className="flex-1 flex items-center justify-center min-w-0 h-full"
        style={{ paddingLeft: '96px', paddingRight: '96px' }}
      >
        {navSearchOpen && !showMobileMenu ? <input {...navSearchInputProps} /> : children}
      </div>
    );
  }

  function SearchTrigger({ children, type = 'button', ...props }: SearchTriggerProps) {
    return (
      <button type={type} {...props} onClick={handleSearchIconClick} aria-label={props['aria-label'] ?? 'Search'}>
        {children}
      </button>
    );
  }

  return { NavCenter, SearchTrigger, navSearchOpen };
}
