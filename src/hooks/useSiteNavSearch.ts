import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DEFAULT_QUERY_KEY = 'q';

/**
 * Shop-style nav: search icon opens a centered input **in place of** breadcrumb text (same UX idea as admin header).
 * **Enter** navigates with `?q=...` on the current path; **Escape** / **Backspace** on empty / blur when empty closes and clears.
 */
export function useSiteNavSearch(queryKey: string = DEFAULT_QUERY_KEY) {
  const navigate = useNavigate();
  const location = useLocation();
  const navSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [navSearchOpen, setNavSearchOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const sp = new URLSearchParams(window.location.search);
      return Boolean((sp.get(queryKey) || '').trim());
    } catch {
      return false;
    }
  });

  const [navSearchDraft, setNavSearchDraft] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return (new URLSearchParams(window.location.search).get(queryKey) || '').trim();
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const q = (sp.get(queryKey) || '').trim();
    if (q) {
      setNavSearchOpen(true);
      setNavSearchDraft(q);
    }
  }, [location.search, queryKey]);

  const submitNavSearch = useCallback(() => {
    const value = navSearchDraft.trim();
    const next = new URLSearchParams(location.search);
    if (!value) {
      next.delete(queryKey);
    } else {
      next.set(queryKey, value);
    }
    const qs = next.toString();
    navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
  }, [location.pathname, location.search, navigate, navSearchDraft, queryKey]);

  const closeNavSearch = useCallback(() => {
    setNavSearchOpen(false);
    setNavSearchDraft('');
    const next = new URLSearchParams(location.search);
    if (next.has(queryKey)) {
      next.delete(queryKey);
      const qs = next.toString();
      navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate, queryKey]);

  const handleSearchIconClick = useCallback(() => {
    if (navSearchOpen) {
      navSearchInputRef.current?.focus();
      return;
    }
    setNavSearchOpen(true);
  }, [navSearchOpen]);

  const handleNavSearchBlur = useCallback(() => {
    if (!navSearchDraft.trim()) closeNavSearch();
  }, [closeNavSearch, navSearchDraft]);

  const handleNavSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitNavSearch();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeNavSearch();
        return;
      }
      if (e.key === 'Backspace' && navSearchDraft.length === 0) {
        e.preventDefault();
        closeNavSearch();
      }
    },
    [closeNavSearch, navSearchDraft.length, submitNavSearch]
  );

  const navSearchInputProps = {
    ref: navSearchInputRef,
    type: 'text' as const,
    value: navSearchDraft,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setNavSearchDraft(e.target.value),
    onBlur: handleNavSearchBlur,
    onKeyDown: handleNavSearchKeyDown,
    placeholder: 'SEARCH…',
    className:
      'w-full max-w-full min-w-0 bg-transparent border-none outline-none text-xs uppercase placeholder:text-[#EB1C24]',
    style: {
      fontFamily: "'Futura PT Medium'",
      fontWeight: 500,
      color: '#EB1C24',
      fontSize: '12px',
      textAlign: 'center' as const,
    },
    autoFocus: true,
  };

  return {
    navSearchOpen,
    navSearchDraft,
    setNavSearchDraft,
    navSearchInputRef,
    handleSearchIconClick,
    handleNavSearchBlur,
    handleNavSearchKeyDown,
    submitNavSearch,
    closeNavSearch,
    navSearchInputProps,
  };
}
