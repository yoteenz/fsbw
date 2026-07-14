import { EXPERIENCE_LAB_PROGRAMS } from '../../../../studio-os-core/canonical-studio-world/experience-lab-program';
import { listCanonicalDepartmentTree } from '../../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { INDUSTRY_DEFINITIONS } from '../../../../studio-os-core/industry-architecture/industries';
import type { ExperienceLabV3ProgramId } from '../experience-lab-v3.types';

export type V3ProgramDefinition = {
  programId: ExperienceLabV3ProgramId;
  title: string;
  subtitle: string;
};

export type V3DepartmentEntry = {
  id: string;
  label: string;
  programId: ExperienceLabV3ProgramId;
  category: 'infrastructure' | 'world-location' | 'industry';
};

/** Studio World world-location departments — operational destinations, not canonical infra. */
const STUDIO_WORLD_LOCATIONS: V3DepartmentEntry[] = [
  { id: 'reception', label: 'Reception', programId: 'studio-world', category: 'world-location' },
  { id: 'lobby', label: 'Lobby', programId: 'studio-world', category: 'world-location' },
  { id: 'gallery', label: 'Gallery', programId: 'studio-world', category: 'world-location' },
  { id: 'showroom', label: 'Showroom', programId: 'studio-world', category: 'world-location' },
  { id: 'marketplace', label: 'Marketplace', programId: 'studio-world', category: 'world-location' },
  { id: 'rewards', label: 'Rewards', programId: 'studio-world', category: 'world-location' },
  { id: 'tv-lounge', label: 'TV Lounge', programId: 'studio-world', category: 'world-location' },
  { id: 'penthouse', label: 'Penthouse', programId: 'studio-world', category: 'world-location' },
  { id: 'build-a-wig', label: 'Build-A-Wig', programId: 'studio-world', category: 'world-location' },
  { id: 'founder-suite', label: 'Founder Suite', programId: 'studio-world', category: 'world-location' },
  { id: 'psa', label: 'PSA', programId: 'studio-world', category: 'world-location' },
  { id: 'experience-lab', label: 'Experience Lab', programId: 'studio-world', category: 'infrastructure' },
];

export function listV3Programs(): V3ProgramDefinition[] {
  return EXPERIENCE_LAB_PROGRAMS.map((p) => ({
    programId: p.programId as ExperienceLabV3ProgramId,
    title: p.title,
    subtitle: p.subtitle,
  }));
}

/** Dynamic department list — no hardcoded navigation in components. */
export function listV3DepartmentsForProgram(programId: ExperienceLabV3ProgramId): V3DepartmentEntry[] {
  if (programId === 'studio-world') {
    const infra = listCanonicalDepartmentTree()
      .flatMap((group) => group.departments)
      .filter((d) => d.departmentId !== 'experience-lab')
      .slice(0, 8)
      .map((d) => ({
        id: d.departmentId,
        label: d.name,
        programId: 'studio-world' as const,
        category: 'infrastructure' as const,
      }));
    return [...STUDIO_WORLD_LOCATIONS, ...infra];
  }

  return INDUSTRY_DEFINITIONS.map((ind) => ({
    id: ind.id,
    label: ind.label,
    programId: 'industry-packs' as const,
    category: 'industry' as const,
  }));
}

export function resolveV3DepartmentLabel(programId: ExperienceLabV3ProgramId, departmentId: string): string {
  return listV3DepartmentsForProgram(programId).find((d) => d.id === departmentId)?.label ?? departmentId;
}
