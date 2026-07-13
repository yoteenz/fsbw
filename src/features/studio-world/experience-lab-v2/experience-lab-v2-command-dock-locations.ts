/** Primary HQ / department locations shown in Experience Lab Command Dock row 2. */

import type { ExperienceLabIconName } from '../icons/experience-lab-icon-registry';

export const EXPERIENCE_LAB_COMMAND_DOCK_LOGO_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/IMG_6238.webp';

/** Legacy source reference — superseded by IMG_6238.webp. */
export const EXPERIENCE_LAB_COMMAND_DOCK_LOGO_SOURCE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/IMG_6238.webp';

/** Studio World logo — height matches combined title + subtitle in row 1. */
export function resolveExperienceLabCommandDockLogoUrl(): string {
  const base =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!base) return EXPERIENCE_LAB_COMMAND_DOCK_LOGO_PATH;
  return `${base.replace(/\/$/, '')}${EXPERIENCE_LAB_COMMAND_DOCK_LOGO_PATH}`;
}

export type CommandDockLocationId =
  | 'frontal-slayer-hq'
  | 'experience-lab'
  | 'reception'
  | 'creative-director-studio'
  | 'permit-office'
  | 'command-center';

export type CommandDockLocationTab = {
  id: CommandDockLocationId;
  title: string;
  subtitle: string;
  icon: ExperienceLabIconName;
  /** When true, subtitle is left-aligned (e.g. Active Headquarters under HQ name). */
  subtitleAlignLeft?: boolean;
  /** When true, tab shows live status indicator (e.g. revision pulse). */
  showLiveIndicator?: boolean;
};

export const EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS: CommandDockLocationTab[] = [
  {
    id: 'frontal-slayer-hq',
    title: 'FRONTAL SLAYER',
    subtitle: 'ACTIVE HEADQUARTERS',
    icon: 'projects',
    subtitleAlignLeft: true,
  },
  {
    id: 'experience-lab',
    title: 'EXPERIENCE LAB',
    subtitle: 'ARCHITECTURE STUDIO',
    icon: 'experienceLab',
  },
  {
    id: 'reception',
    title: 'RECEPTION',
    subtitle: 'GUEST ARRIVAL',
    icon: 'users',
    showLiveIndicator: true,
  },
  {
    id: 'creative-director-studio',
    title: 'CREATIVE DIRECTOR STUDIO',
    subtitle: 'ASSET MANUFACTURING',
    icon: 'attachments',
  },
  {
    id: 'permit-office',
    title: 'PERMIT OFFICE',
    subtitle: 'MUNICIPAL PERMITS',
    icon: 'permissions',
  },
  {
    id: 'command-center',
    title: 'COMMAND CENTER',
    subtitle: 'EXECUTIVE BRIDGE',
    icon: 'terminal',
  },
];

export type CommandDockStatusLabel = 'APPROVED' | 'PENDING' | 'REJECTED';

export function formatCommandDockApprovalStatus(status: string): CommandDockStatusLabel {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'approved') return 'APPROVED';
  if (normalized === 'rejected' || normalized === 'failed' || normalized === 'blocked') return 'REJECTED';
  return 'PENDING';
}

export function formatCommandDockPermitStatus(status: string): CommandDockStatusLabel {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'clear' || normalized === 'approved') return 'APPROVED';
  if (normalized === 'blocked' || normalized === 'rejected') return 'REJECTED';
  return 'PENDING';
}

export function commandDockStatusClass(label: CommandDockStatusLabel): string {
  if (label === 'APPROVED') return 'elab-status--ok';
  if (label === 'REJECTED') return 'elab-status--danger';
  return 'elab-status--warn';
}

export function commandDockLocationSubtitle(
  tab: CommandDockLocationTab,
  revision: number
): string {
  if (tab.id === 'reception') return `REVISION ${revision}`;
  return tab.subtitle;
}
