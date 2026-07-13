export const EXPERIENCE_LAB_PROGRAM_VERSION = 'experience-lab-program.v1' as const;
export const EXPERIENCE_LAB_PROGRAM_STORAGE_KEY = 'experience-lab-admin-program.v1' as const;

/** Two separate admin creation programs — never combine. */
export type ExperienceLabProgram = 'studio-world' | 'industry-packs';

export type ExperienceLabProgramDefinition = {
  programId: ExperienceLabProgram;
  title: string;
  subtitle: string;
  description: string;
};

export const EXPERIENCE_LAB_PROGRAMS: ExperienceLabProgramDefinition[] = [
  {
    programId: 'studio-world',
    title: 'BUILD STUDIO WORLD',
    subtitle: 'Studio World Infrastructure',
    description: 'Create, revise, render, approve, and publish canonical Studio World main departments.',
  },
  {
    programId: 'industry-packs',
    title: 'BUILD INDUSTRY PACKS',
    subtitle: 'Industry Headquarters Packs',
    description: 'Create, revise, render, approve, and publish official headquarters packs for industries.',
  },
];

export function resolveDefaultExperienceLabProgram(): ExperienceLabProgram {
  return 'studio-world';
}

export function getExperienceLabProgramDefinition(
  program: ExperienceLabProgram
): ExperienceLabProgramDefinition | undefined {
  return EXPERIENCE_LAB_PROGRAMS.find((p) => p.programId === program);
}
