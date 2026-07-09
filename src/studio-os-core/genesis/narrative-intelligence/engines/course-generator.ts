import type { XniNarrativeBlueprint } from '../types';

export type XniCourseStructure = {
  structureId: string;
  blueprintId: string;
  modules: { moduleId: string; title: string; lessons: string[]; outcome: string }[];
};

/** Course Generator™ — modular learning arc from blueprint */
export function generateCourseStructure(blueprint: XniNarrativeBlueprint): XniCourseStructure {
  return {
    structureId: `course-${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    modules: blueprint.storyArc.map((stage, i) => ({
      moduleId: `mod-${i + 1}`,
      title: `Module ${i + 1}: ${stage}`,
      lessons: blueprint.scenes.filter((s) => s.arcStage === stage).map((s) => s.title),
      outcome: `Audience can articulate ${stage.toLowerCase()} for ${blueprint.topic}`,
    })),
  };
}
