/** Role SVGs in `public/assets/` for careers + admin worker cards (header icon). */
const DEFAULT_SRC = '/assets/NOIR/account-icon.svg';

const BY_WORKER_ID: Record<string, string> = {
  '1': '/assets/assistant-icon.svg',
  '2': '/assets/director-icon.svg',
  '3': '/assets/accountant-icon.svg',
  '4': '/assets/lawyer-icon.svg',
  '5': '/assets/graphic-designer-icon.svg',
  '6': '/assets/photographer-icon.svg',
  '7': '/assets/videographer-icon.svg',
  '8': '/assets/social-manager-icon.svg',
  '9': '/assets/makeup-artist-icon.svg',
  '10': '/assets/hair-stylist-icon.svg',
  /** Same art as Account → Membership “More ways to earn” (`src/assets/icons/more-ways.svg`). */
  '11': '/assets/more-ways-earn-icon.svg',
};

const WORKER_DASHBOARD_ICON_PATHS = new Set<string>(Object.values(BY_WORKER_ID));

/**
 * `RoleCardSectionHeader` uses a CSS filter to tint black NOIR art to brand red.
 * Worker role SVGs are already `#EB1C24` (stroke/fill); the same filter breaks them (e.g. red squares).
 */
export function roleHeaderIconApplyCssFilter(iconSrc: string): boolean {
  if (WORKER_DASHBOARD_ICON_PATHS.has(iconSrc)) return false;
  return true;
}

export function workerRoleHeaderIconSrc(workerId: string): string {
  return BY_WORKER_ID[workerId] ?? DEFAULT_SRC;
}
