/** Role SVGs in `public/assets/` for careers + admin worker cards (header icon). */
const DEFAULT_SRC = '/assets/NOIR/account-icon-red.svg';

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

export function workerRoleHeaderIconSrc(workerId: string): string {
  return BY_WORKER_ID[workerId] ?? DEFAULT_SRC;
}
