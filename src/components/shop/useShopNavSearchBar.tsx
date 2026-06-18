import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useSiteNavSearch } from '../../hooks/useSiteNavSearch';

type SearchTriggerProps = Omit<ComponentPropsWithoutRef<'button'>, 'onClick'>;

/**
 * Shop / product nav bars: search icon + left-aligned input (replaces breadcrumb only).
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
    const searchActive = navSearchOpen && !showMobileMenu;
    return (
      <div
        className={`flex-1 flex items-center min-w-0 h-full whitespace-nowrap ${searchActive ? 'justify-start' : 'justify-center'}`}
        style={{ paddingLeft: '64px', paddingRight: '64px' }}
      >
        {searchActive ? <input {...navSearchInputProps} /> : children}
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
