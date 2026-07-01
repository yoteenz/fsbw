import { isBuildAWigCustomizePath } from './buildAWigRoutes';

/** Product customize/edit **sub-page** (e.g. `…/noir/customize/length`), not the hub. */
export function isBuildAWigProductSubPagePathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  if (!p.startsWith('/build-a-wig/')) return false;
  return /\/(customize|edit)\/[^/]+/.test(p);
}

export function isBawCustomizeSubPage(pathname: string): boolean {
  return isBuildAWigCustomizePath(pathname) && isBuildAWigProductSubPagePathname(pathname);
}

export function isBawEditSubPage(pathname: string): boolean {
  return pathname.includes('/edit/') && isBuildAWigProductSubPagePathname(pathname);
}

function dispatchBawStorageChange(): void {
  window.dispatchEvent(new CustomEvent('customStorageChange'));
}

/**
 * In-progress tap on a customize/edit sub-page — draft keys only.
 * Hub `selected*` updates happen on **Confirm** only.
 */
export function persistBawScalarDraftTap(
  pathname: string,
  field: string,
  value: string,
  price?: string,
): void {
  if (isBawCustomizeSubPage(pathname)) {
    localStorage.setItem(`customizeSelected${field}`, value);
    if (price !== undefined) localStorage.setItem(`customizeSelected${field}Price`, price);
  } else if (isBawEditSubPage(pathname)) {
    localStorage.setItem(`editSelected${field}`, value);
    if (price !== undefined) localStorage.setItem(`editSelected${field}Price`, price);
  } else {
    localStorage.setItem(`selected${field}`, value);
    if (price !== undefined) localStorage.setItem(`selected${field}Price`, price);
  }
  dispatchBawStorageChange();
}

/** Promote a scalar choice to confirmed hub keys (+ mode-specific mirrors). */
export function persistBawScalarConfirmed(
  pathname: string,
  field: string,
  value: string,
  price?: string,
  opts?: { isCustomizeMode?: boolean; isEditMode?: boolean },
): void {
  const isCustomizeMode =
    opts?.isCustomizeMode ??
    (pathname.includes('/customize') || isBawCustomizeSubPage(pathname));
  const isEditMode =
    opts?.isEditMode ??
    (pathname.includes('/edit') || localStorage.getItem('editingCartItem') !== null);

  localStorage.setItem(`selected${field}`, value);
  if (price !== undefined) localStorage.setItem(`selected${field}Price`, price);
  if (isCustomizeMode) {
    localStorage.setItem(`customizeSelected${field}`, value);
    if (price !== undefined) localStorage.setItem(`customizeSelected${field}Price`, price);
  }
  if (isEditMode) {
    localStorage.setItem(`editSelected${field}`, value);
    if (price !== undefined) localStorage.setItem(`editSelected${field}Price`, price);
  }
}

export function persistBawJsonDraftTap(pathname: string, field: string, json: string, price?: string): void {
  if (isBawCustomizeSubPage(pathname)) {
    localStorage.setItem(`customizeSelected${field}`, json);
    if (price !== undefined) localStorage.setItem(`customizeSelected${field}Price`, price);
  } else if (isBawEditSubPage(pathname)) {
    localStorage.setItem(`editSelected${field}`, json);
    if (price !== undefined) localStorage.setItem(`editSelected${field}Price`, price);
  } else {
    localStorage.setItem(`selected${field}`, json);
    if (price !== undefined) localStorage.setItem(`selected${field}Price`, price);
  }
  dispatchBawStorageChange();
}

export function persistBawJsonConfirmed(
  pathname: string,
  field: string,
  json: string,
  price?: string,
  opts?: { isCustomizeMode?: boolean; isEditMode?: boolean },
): void {
  const isCustomizeMode =
    opts?.isCustomizeMode ??
    (pathname.includes('/customize') || isBawCustomizeSubPage(pathname));
  const isEditMode =
    opts?.isEditMode ??
    (pathname.includes('/edit') || localStorage.getItem('editingCartItem') !== null);

  localStorage.setItem(`selected${field}`, json);
  if (price !== undefined) localStorage.setItem(`selected${field}Price`, price);
  if (isCustomizeMode) {
    localStorage.setItem(`customizeSelected${field}`, json);
    if (price !== undefined) localStorage.setItem(`customizeSelected${field}Price`, price);
  }
  if (isEditMode) {
    localStorage.setItem(`editSelected${field}`, json);
    if (price !== undefined) localStorage.setItem(`editSelected${field}Price`, price);
  }
}

/** Set when the user taps **Confirm selection** — not on Back or in-progress taps. */
export function markBawConfirmedReturnFromSubpage(): void {
  sessionStorage.setItem('comingFromSubPage', 'true');
  dispatchBawStorageChange();
}

/** Back without confirm: drop abandoned draft for this field. */
export function revertBawDraftScalarToConfirmed(pathname: string, field: string): void {
  const confirmed = localStorage.getItem(`selected${field}`);
  const confirmedPrice = localStorage.getItem(`selected${field}Price`);
  if (isBawCustomizeSubPage(pathname)) {
    if (confirmed != null) localStorage.setItem(`customizeSelected${field}`, confirmed);
    else localStorage.removeItem(`customizeSelected${field}`);
    if (confirmedPrice != null) localStorage.setItem(`customizeSelected${field}Price`, confirmedPrice);
    else localStorage.removeItem(`customizeSelected${field}Price`);
  } else if (isBawEditSubPage(pathname)) {
    if (confirmed != null) localStorage.setItem(`editSelected${field}`, confirmed);
    else localStorage.removeItem(`editSelected${field}`);
    if (confirmedPrice != null) localStorage.setItem(`editSelected${field}Price`, confirmedPrice);
    else localStorage.removeItem(`editSelected${field}Price`);
  }
}

export function revertBawDraftJsonToConfirmed(pathname: string, field: string): void {
  const confirmed = localStorage.getItem(`selected${field}`);
  const confirmedPrice = localStorage.getItem(`selected${field}Price`);
  if (isBawCustomizeSubPage(pathname)) {
    if (confirmed != null) localStorage.setItem(`customizeSelected${field}`, confirmed);
    else localStorage.removeItem(`customizeSelected${field}`);
    if (confirmedPrice != null) localStorage.setItem(`customizeSelected${field}Price`, confirmedPrice);
    else localStorage.removeItem(`customizeSelected${field}Price`);
  } else if (isBawEditSubPage(pathname)) {
    if (confirmed != null) localStorage.setItem(`editSelected${field}`, confirmed);
    else localStorage.removeItem(`editSelected${field}`);
    if (confirmedPrice != null) localStorage.setItem(`editSelected${field}Price`, confirmedPrice);
    else localStorage.removeItem(`editSelected${field}Price`);
  }
}

export function revertBawStylingDraftToConfirmed(pathname: string): void {
  const copyOptional = (draftPrefix: string, confirmedKey: string) => {
    const confirmed = localStorage.getItem(confirmedKey);
    const draftKey = `${draftPrefix}${confirmedKey.replace(/^selected/, '')}`;
    if (confirmed != null) localStorage.setItem(draftKey, confirmed);
    else localStorage.removeItem(draftKey);
  };

  if (isBawCustomizeSubPage(pathname)) {
    copyOptional('customizeSelected', 'selectedHairStyling');
    copyOptional('customizeSelected', 'selectedPartSelection');
    copyOptional('customizeSelected', 'selectedStyling');
    copyOptional('customizeSelected', 'selectedStylingPrice');
    copyOptional('customizeSelected', 'selectedAddOns');
    copyOptional('customizeSelected', 'selectedAddOnsPrice');
  } else if (isBawEditSubPage(pathname)) {
    copyOptional('editSelected', 'selectedHairStyling');
    copyOptional('editSelected', 'selectedPartSelection');
    copyOptional('editSelected', 'selectedStyling');
    copyOptional('editSelected', 'selectedStylingPrice');
    copyOptional('editSelected', 'selectedAddOns');
    copyOptional('editSelected', 'selectedAddOnsPrice');
  }
}

/** Read initial sub-page value: draft first on customize/edit sub-pages, else confirmed hub. */
export function readBawSubpageInitScalar(pathname: string, field: string, fallback: string): string {
  if (isBawEditSubPage(pathname)) {
    return (
      localStorage.getItem(`editSelected${field}`) ||
      localStorage.getItem(`selected${field}`) ||
      fallback
    );
  }
  if (isBawCustomizeSubPage(pathname)) {
    return (
      localStorage.getItem(`customizeSelected${field}`) ||
      localStorage.getItem(`selected${field}`) ||
      fallback
    );
  }
  return localStorage.getItem(`selected${field}`) || fallback;
}
