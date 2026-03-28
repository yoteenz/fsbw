/** Role SVGs in `public/assets/` for careers + admin worker cards (header icon). */
const DEFAULT_SRC = '/assets/NOIR/account-icon.svg';

const BY_WORKER_ID: Record<string, string> = {
  '1': '/assets/personal-assistant-icon.svg',
  '2': '/assets/creative-director-icon.svg',
  '3': '/assets/accountant-icon.svg',
  '4': '/assets/lawyer-icon.svg',
  '5': '/assets/graphic-designer-icon.svg',
  '6': '/assets/photographer-icon.svg',
  '7': '/assets/videographer-icon.svg',
  '8': '/assets/media-icon.svg',
  '9': '/assets/makeup-artist-icon.svg',
  '10': '/assets/hair-stylist-icon.svg',
};

export function workerRoleHeaderIconSrc(workerId: string): string {
  return BY_WORKER_ID[workerId] ?? DEFAULT_SRC;
}
