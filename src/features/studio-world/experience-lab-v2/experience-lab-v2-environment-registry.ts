/**
 * Environment registry — data-driven environments per department or industry pack.
 */

import { getIndustryPack } from '../../../studio-os-core/industry-packs/industry-pack-registry';
import type { StudioWorldDepartmentId } from './experience-lab-v2-department-registry';
import { resolveStudioWorldDepartment } from './experience-lab-v2-department-registry';

export type EnvironmentEntry = {
  id: string;
  label: string;
};

const STUDIO_WORLD_ENVIRONMENTS: Partial<Record<StudioWorldDepartmentId, EnvironmentEntry[]>> = {
  'experience-lab': [
    { id: 'reception', label: 'RECEPTION' },
    { id: 'grand-lobby', label: 'GRAND LOBBY' },
    { id: 'blueprint-lab', label: 'BLUEPRINT LAB' },
  ],
  'creative-director-studio': [
    { id: 'approval-suite', label: 'APPROVAL SUITE' },
    { id: 'render-review', label: 'RENDER REVIEW' },
  ],
  'asset-manufacturing': [
    { id: 'manufacturing-floor', label: 'MANUFACTURING FLOOR' },
    { id: 'asset-vault', label: 'ASSET VAULT' },
  ],
  'permit-center': [
    { id: 'permit-desk', label: 'PERMIT DESK' },
    { id: 'inspection-hall', label: 'INSPECTION HALL' },
  ],
  marketplace: [
    { id: 'pavilion', label: 'MARKETPLACE PAVILION' },
    { id: 'licensing-hall', label: 'LICENSING HALL' },
  ],
  'command-center': [
    { id: 'executive-bridge', label: 'EXECUTIVE BRIDGE' },
    { id: 'mission-deck', label: 'MISSION DECK' },
  ],
  'executive-atrium': [
    { id: 'atrium', label: 'EXECUTIVE ATRIUM' },
    { id: 'founder-welcome', label: 'FOUNDER WELCOME' },
  ],
  institute: [
    { id: 'academy-hall', label: 'ACADEMY HALL' },
    { id: 'knowledge-vault', label: 'KNOWLEDGE VAULT' },
  ],
};

const DEFAULT_STUDIO_ENVIRONMENTS: EnvironmentEntry[] = [
  { id: 'reception', label: 'RECEPTION' },
  { id: 'lobby', label: 'LOBBY' },
  { id: 'operations', label: 'OPERATIONS' },
];

export function listStudioWorldEnvironments(departmentId: StudioWorldDepartmentId | null): EnvironmentEntry[] {
  if (!departmentId) return [];
  return STUDIO_WORLD_ENVIRONMENTS[departmentId] ?? DEFAULT_STUDIO_ENVIRONMENTS;
}

export function listIndustryPackEnvironments(packId: string | null): EnvironmentEntry[] {
  if (!packId) return [];
  const pack = getIndustryPack(packId);
  if (!pack) {
    return [
      { id: 'reception', label: 'RECEPTION' },
      { id: 'lobby', label: 'LOBBY' },
      { id: 'office', label: 'OFFICE' },
      { id: 'showroom', label: 'SHOWROOM' },
      { id: 'conference', label: 'CONFERENCE' },
      { id: 'consultation', label: 'CONSULTATION' },
      { id: 'operations', label: 'OPERATIONS' },
    ];
  }
  return pack.defaultDepartments.map((slot) => ({
    id: slot.slotId,
    label: slot.displayName.toUpperCase(),
  }));
}

export function resolveEnvironmentLabel(
  environments: EnvironmentEntry[],
  environmentId: string | null | undefined
): string | undefined {
  if (!environmentId) return undefined;
  return environments.find((e) => e.id === environmentId)?.label;
}

export function defaultEnvironmentId(
  environments: EnvironmentEntry[]
): string | null {
  return environments[0]?.id ?? null;
}

export function resolveCanonicalDepartmentForPipeline(input: {
  studioDepartmentId: StudioWorldDepartmentId | null;
}): string {
  const dept = resolveStudioWorldDepartment(input.studioDepartmentId);
  return dept?.canonicalDepartmentId ?? 'experience-lab';
}
