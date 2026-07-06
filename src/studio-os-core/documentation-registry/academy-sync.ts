import { getAllRegistryEntries } from './registration';

export type AcademyLessonFromRegistry = {
  id: string;
  title: string;
  summary: string;
  moduleId: string;
  registryRef: string;
  category: string;
  eligibleFor: ('courses' | 'lessons' | 'tutorials' | 'guides' | 'knowledge-checks' | 'certifications')[];
};

/** Studio Institute™ content generated from Documentation Registry™. */
export function buildAcademyLessonsFromRegistry(): AcademyLessonFromRegistry[] {
  return getAllRegistryEntries().map((entry) => ({
    id: entry.academyLessons[0] ?? `academy:lesson-${entry.internalId}`,
    title: entry.officialName,
    summary: entry.purpose,
    moduleId: entry.moduleId ?? entry.internalId,
    registryRef: entry.internalId,
    category: entry.category,
    eligibleFor: ['courses', 'lessons', 'tutorials', 'guides', 'knowledge-checks', 'certifications'],
  }));
}

export function getAcademyLessonsForModule(moduleId: string): AcademyLessonFromRegistry[] {
  return buildAcademyLessonsFromRegistry().filter((l) => l.moduleId === moduleId || l.registryRef === moduleId);
}

export function summarizeAcademySync(): string {
  const lessons = buildAcademyLessonsFromRegistry();
  return `${lessons.length} academy lessons eligible — courses, tutorials, guides, and certifications generated from Documentation Registry™.`;
}
