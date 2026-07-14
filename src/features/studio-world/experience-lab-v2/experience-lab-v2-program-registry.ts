/**
 * Experience Lab V2 — program registry (Command Dock program selector).
 * Bridges canonical Studio World program definitions; no hardcoded UI strings in components.
 */

import {
  EXPERIENCE_LAB_PROGRAMS,
  getExperienceLabProgramDefinition,
  resolveDefaultExperienceLabProgram,
  type ExperienceLabProgram,
  type ExperienceLabProgramDefinition,
} from '../../../studio-os-core/canonical-studio-world/experience-lab-program';

export type { ExperienceLabProgram, ExperienceLabProgramDefinition };

export const EXPERIENCE_LAB_V2_PROGRAMS = EXPERIENCE_LAB_PROGRAMS;

export function listExperienceLabV2Programs(): ExperienceLabProgramDefinition[] {
  return EXPERIENCE_LAB_V2_PROGRAMS;
}

export function resolveExperienceLabV2Program(id: ExperienceLabProgram): ExperienceLabProgramDefinition {
  return getExperienceLabProgramDefinition(id) ?? EXPERIENCE_LAB_V2_PROGRAMS[0]!;
}

export function defaultExperienceLabV2Program(): ExperienceLabProgram {
  return resolveDefaultExperienceLabProgram();
}

export function programBreadcrumbLabel(program: ExperienceLabProgram): string {
  return program === 'studio-world' ? 'STUDIO WORLD' : 'INDUSTRY PACKS';
}
