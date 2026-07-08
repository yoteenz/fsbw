import { EXECUTIVE_ATRIUM_PATH } from '../constants';
import type { HeadquartersZone } from '../types';

/** Executive Headquarters architecture — spatial zones, not dashboard panels. */
export const HEADQUARTERS_ZONES: HeadquartersZone[] = [
  {
    id: 'executive-atrium',
    title: 'Executive Atrium™',
    purpose: 'Default arrival — the founder enters the living headquarters of their company.',
    routePath: EXECUTIVE_ATRIUM_PATH,
    relatedSystems: ['Studio Command Center™', 'Living Headquarters™'],
  },
  {
    id: 'founder-office',
    title: 'Founder Office™',
    purpose: 'Chief of Staff operations, founder calibration, and executive decision support.',
    routePath: '/admin/studio/chief-of-staff',
    relatedSystems: ['Chief of Staff™', 'Founder Operating System™'],
  },
  {
    id: 'department-wings',
    title: 'Department Wings™',
    purpose: 'Every department exists as a wing with purpose — create, produce, distribute, intelligence, legacy.',
    routePath: '/admin/studio/hub',
    relatedSystems: ['Headquarters Experience™', 'Industry Architecture™'],
  },
  {
    id: 'mission-control',
    title: 'Mission Control™',
    purpose: 'Executive operating room — missions, departments, approvals, live activity.',
    routePath: '/admin/studio/world/command-center',
    relatedSystems: ['Mission Control™', 'Executive Council™'],
  },
  {
    id: 'daily-briefing',
    title: 'Daily Briefing™',
    purpose: 'Intelligence briefings answer what the founder should understand or do next.',
    routePath: '/admin/studio/headquarters-principles',
    relatedSystems: ['Ambient Awareness™', 'Anticipation Engine™'],
  },
  {
    id: 'ai-concierge',
    title: 'AI Concierge™',
    purpose: 'Digital staff and concierges operate departments — not generic assistants.',
    routePath: '/admin/studio/concierge-layer',
    relatedSystems: ['Concierge Layer™', 'Shadow Mode™'],
  },
  {
    id: 'studio-intelligence',
    title: 'Studio Intelligence™',
    purpose: 'Model-agnostic intelligence layer — organization first, models second.',
    routePath: '/admin/studio/studio-intelligence-architecture',
    relatedSystems: ['Studio Intelligence Architecture™', 'Knowledge Fabric™'],
  },
  {
    id: 'orb',
    title: 'Orb™',
    purpose: 'Contextual executive intelligence with constitutional citations.',
    routePath: '/admin/studio/overview',
    relatedSystems: ['Orb™', 'Hero Objects™'],
  },
  {
    id: 'atlas',
    title: 'Atlas™',
    purpose: 'Spatial navigation and discovery — replaces menu-first wayfinding.',
    routePath: '/admin/studio/world-atlas',
    relatedSystems: ['Studio World Atlas™', 'World Graph™'],
  },
];

export function listHeadquartersZones(): HeadquartersZone[] {
  return [...HEADQUARTERS_ZONES];
}

export function getHeadquartersZone(id: HeadquartersZone['id']): HeadquartersZone | undefined {
  return HEADQUARTERS_ZONES.find((z) => z.id === id);
}

export function getDefaultHeadquartersArrivalPath(): string {
  return EXECUTIVE_ATRIUM_PATH;
}
