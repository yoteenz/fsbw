/** Shared 2D/3D hero toggle across all unit product PDPs (`/straight/noir`, `/wavy/soft-wave`, etc.). */
export const PRODUCT_3D_VIEW_STORAGE_KEY = 'product-3d-view';

const LEGACY_NOIR_3D_VIEW_KEY = 'noir-3d-view';

export function readProduct3dViewPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const shared = localStorage.getItem(PRODUCT_3D_VIEW_STORAGE_KEY);
    if (shared === 'true') return true;
    if (shared === 'false') return false;
    const legacy = localStorage.getItem(LEGACY_NOIR_3D_VIEW_KEY);
    if (legacy === 'true' || legacy === 'false') {
      localStorage.setItem(PRODUCT_3D_VIEW_STORAGE_KEY, legacy);
      return legacy === 'true';
    }
  } catch {
    /* ignore quota / private mode */
  }
  return false;
}

export function persistProduct3dViewPreference(is3D: boolean): void {
  try {
    localStorage.setItem(PRODUCT_3D_VIEW_STORAGE_KEY, String(is3D));
  } catch {
    /* ignore */
  }
}
