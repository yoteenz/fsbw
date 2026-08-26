import type {
  ExperiencePageOverrideRecordV2,
  ExperiencePageRecord,
  ExperienceSectionRecord,
  MaterialScreenRecord,
  ExperiencePageInstanceRecord,
} from '../types';

export type OverrideApplyResult = {
  pages: ExperiencePageRecord[];
  sections: ExperienceSectionRecord[];
  materialScreens: MaterialScreenRecord[];
  instances: ExperiencePageInstanceRecord[];
  applied: string[];
  conflicts: ExperiencePageOverrideRecordV2[];
};

function findPage(pages: ExperiencePageRecord[], targetId: string): ExperiencePageRecord | undefined {
  return pages.find((p) => p.experiencePageId === targetId || p.representativeScreenId === targetId);
}

export function applyExperiencePageOverrides(
  pages: ExperiencePageRecord[],
  sections: ExperienceSectionRecord[],
  materialScreens: MaterialScreenRecord[],
  instances: ExperiencePageInstanceRecord[],
  overrides: ExperiencePageOverrideRecordV2[],
): OverrideApplyResult {
  const active = overrides.filter((o) => o.active && o.status !== 'OVERRIDE_CONFLICT' && o.status !== 'RETIRED');
  const nextPages = pages.map((p) => ({ ...p }));
  const applied: string[] = [];
  const conflicts: ExperiencePageOverrideRecordV2[] = [];

  for (const override of active) {
    const page = findPage(nextPages, override.targetId);
    if (!page) {
      conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
      continue;
    }

    switch (override.overrideType) {
      case 'FORCE_PRIMARY':
        page.founderPrimary = true;
        page.captureEligible = true;
        applied.push(override.overrideId);
        break;
      case 'FORCE_SUPPORTING':
        page.founderPrimary = false;
        page.founderDesignable = true;
        applied.push(override.overrideId);
        break;
      case 'FORCE_INTERNAL':
        page.founderPrimary = false;
        page.sectionId = override.value || `${page.projectId}:section:internal-workspace`;
        page.experienceType = 'WORKSPACE_PAGE';
        page.captureEligible = false;
        page.priority = 'INTERNAL';
        applied.push(override.overrideId);
        break;
      case 'FORCE_SECTION':
        page.sectionId = override.value;
        applied.push(override.overrideId);
        break;
      case 'FORCE_REPRESENTATIVE':
        page.representativeRoute = override.value;
        applied.push(override.overrideId);
        break;
      case 'FORCE_MERGE':
        conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
        break;
      default:
        applied.push(override.overrideId);
    }
  }

  return { pages: nextPages, sections, materialScreens, instances, applied, conflicts };
}
