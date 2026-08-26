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
  supersededPageIds: string[];
};

function findPage(pages: ExperiencePageRecord[], targetId: string): ExperiencePageRecord | undefined {
  return pages.find((p) => p.experiencePageId === targetId || p.representativeScreenId === targetId);
}

function parseJsonValue<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mergePagesIntoTarget(
  pages: ExperiencePageRecord[],
  targetId: string,
  memberPageIds: string[],
): { pages: ExperiencePageRecord[]; superseded: string[] } | null {
  const targetIdx = pages.findIndex((p) => p.experiencePageId === targetId);
  if (targetIdx < 0) return null;
  const target = pages[targetIdx]!;
  const members = memberPageIds
    .map((id) => pages.find((p) => p.experiencePageId === id))
    .filter((p): p is ExperiencePageRecord => !!p && p.experiencePageId !== targetId);

  if (!members.length) return null;

  for (const member of members) {
    if (member.projectId !== target.projectId) return null;
    if (member.referencePolicy !== target.referencePolicy) return null;
    if (member.referencePolicy === 'UNIQUE_REFERENCE_REQUIRED' && target.referencePolicy !== member.referencePolicy) {
      return null;
    }
  }

  const merged: ExperiencePageRecord = {
    ...target,
    memberDesignScreenIds: [...new Set([...target.memberDesignScreenIds, ...members.flatMap((m) => m.memberDesignScreenIds)])],
    memberRouteIds: [...new Set([...target.memberRouteIds, ...members.flatMap((m) => m.memberRouteIds)])],
    routeNodeCount: target.routeNodeCount + members.reduce((n, m) => n + m.routeNodeCount, 0),
  };

  const superseded = members.map((m) => m.experiencePageId);
  const next = pages.map((p) => {
    if (p.experiencePageId === targetId) return merged;
    if (superseded.includes(p.experiencePageId)) {
      return {
        ...p,
        founderPrimary: false,
        captureEligible: false,
        priority: 'INTERNAL' as const,
      };
    }
    return p;
  });

  return { pages: next, superseded };
}

function splitPage(
  pages: ExperiencePageRecord[],
  sourcePageId: string,
  payload: { newPageId: string; displayName: string; sectionId: string; memberScreenIds: string[]; representativeRoute?: string },
): ExperiencePageRecord[] | null {
  const source = pages.find((p) => p.experiencePageId === sourcePageId);
  if (!source) return null;
  const screenSet = new Set(payload.memberScreenIds);
  if (!payload.memberScreenIds.every((id) => source.memberDesignScreenIds.includes(id))) return null;

  const newPage: ExperiencePageRecord = {
    ...source,
    experiencePageId: payload.newPageId,
    displayName: payload.displayName,
    sectionId: payload.sectionId,
    memberDesignScreenIds: payload.memberScreenIds,
    memberRouteIds: source.memberRouteIds.filter((_, i) => {
      const sid = source.memberDesignScreenIds[i];
      return sid ? screenSet.has(sid) : false;
    }),
    representativeRoute: payload.representativeRoute ?? source.representativeRoute,
    routeNodeCount: payload.memberScreenIds.length,
    abstractionConfidence: 'HIGH',
  };

  const remainingScreens = source.memberDesignScreenIds.filter((id) => !screenSet.has(id));
  if (!remainingScreens.length) return null;

  return pages
    .filter((p) => p.experiencePageId !== sourcePageId)
    .concat([
      { ...source, memberDesignScreenIds: remainingScreens, routeNodeCount: remainingScreens.length },
      newPage,
    ]);
}

export function applyExperiencePageOverrides(
  pages: ExperiencePageRecord[],
  sections: ExperienceSectionRecord[],
  materialScreens: MaterialScreenRecord[],
  instances: ExperiencePageInstanceRecord[],
  overrides: ExperiencePageOverrideRecordV2[],
): OverrideApplyResult {
  const active = overrides.filter((o) => o.active && o.status !== 'OVERRIDE_CONFLICT' && o.status !== 'RETIRED');
  let nextPages = pages.map((p) => ({ ...p }));
  let nextMaterial = materialScreens.map((m) => ({ ...m }));
  let nextInstances = instances.map((i) => ({ ...i }));
  const applied: string[] = [];
  const conflicts: ExperiencePageOverrideRecordV2[] = [];
  const supersededPageIds: string[] = [];

  for (const override of active) {
    const page = findPage(nextPages, override.targetId);

    switch (override.overrideType) {
      case 'FORCE_PRIMARY':
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        page.founderPrimary = true;
        page.captureEligible = true;
        applied.push(override.overrideId);
        break;

      case 'FORCE_SUPPORTING':
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        page.founderPrimary = false;
        page.founderDesignable = true;
        page.captureEligible = true;
        applied.push(override.overrideId);
        break;

      case 'FORCE_INTERNAL':
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        page.founderPrimary = false;
        page.sectionId = override.value || `${page.projectId}:section:internal-workspace`;
        page.experienceType = 'WORKSPACE_PAGE';
        page.captureEligible = false;
        page.priority = 'INTERNAL';
        applied.push(override.overrideId);
        break;

      case 'FORCE_SECTION':
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        page.sectionId = override.value;
        applied.push(override.overrideId);
        break;

      case 'FORCE_REPRESENTATIVE': {
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        const rep = parseJsonValue<{ route?: string; screenId?: string }>(override.value, {});
        if (rep.route) page.representativeRoute = rep.route;
        if (rep.screenId) page.representativeScreenId = rep.screenId;
        applied.push(override.overrideId);
        break;
      }

      case 'FORCE_MERGE': {
        const payload = parseJsonValue<{ targetPageId: string; memberPageIds: string[] }>(override.value, {
          targetPageId: '',
          memberPageIds: [],
        });
        const merged = mergePagesIntoTarget(nextPages, payload.targetPageId || override.targetId, payload.memberPageIds);
        if (!merged) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        nextPages = merged.pages;
        supersededPageIds.push(...merged.superseded);
        applied.push(override.overrideId);
        break;
      }

      case 'FORCE_SPLIT': {
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        const payload = parseJsonValue<{
          newPageId: string;
          displayName: string;
          sectionId: string;
          memberScreenIds: string[];
          representativeRoute?: string;
        }>(override.value, {
          newPageId: `${page.experiencePageId}:split`,
          displayName: `${page.displayName} Split`,
          sectionId: page.sectionId,
          memberScreenIds: [],
        });
        const split = splitPage(nextPages, override.targetId, payload);
        if (!split) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        nextPages = split;
        applied.push(override.overrideId);
        break;
      }

      case 'FORCE_MATERIAL_SCREEN': {
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        const payload = parseJsonValue<{ parentExperiencePageId: string }>(override.value, {
          parentExperiencePageId: '',
        });
        const parent = findPage(nextPages, payload.parentExperiencePageId);
        if (!parent) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        const matId = `${parent.experiencePageId}:mat:${page.experiencePageId.split(':').pop()}`;
        nextMaterial.push({
          materialScreenId: matId,
          projectId: page.projectId,
          experiencePageId: parent.experiencePageId,
          displayName: page.displayName,
          stepType: 'OTHER',
          memberDesignScreenIds: page.memberDesignScreenIds,
          memberRouteIds: page.memberRouteIds,
          representativeRoute: page.representativeRoute,
          referencePolicy: page.referencePolicy,
          captureEligible: page.captureEligible,
          order: nextMaterial.filter((m) => m.experiencePageId === parent.experiencePageId).length,
        });
        parent.materialScreenIds = [...parent.materialScreenIds, matId];
        page.founderPrimary = false;
        page.captureEligible = false;
        applied.push(override.overrideId);
        break;
      }

      case 'FORCE_INSTANCE': {
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        const payload = parseJsonValue<{ parentExperiencePageId: string; instanceKind?: ExperiencePageInstanceRecord['instanceKind'] }>(
          override.value,
          { parentExperiencePageId: '' },
        );
        const parent = findPage(nextPages, payload.parentExperiencePageId);
        if (!parent) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        const instId = `${parent.experiencePageId}:inst:${page.displayName.toLowerCase().replace(/\s+/g, '-')}`;
        nextInstances.push({
          instanceId: instId,
          projectId: page.projectId,
          experiencePageId: parent.experiencePageId,
          displayName: page.displayName,
          slugOrId: page.representativeRoute.split('/').filter(Boolean).pop() ?? page.displayName,
          memberDesignScreenIds: page.memberDesignScreenIds,
          memberRouteIds: page.memberRouteIds,
          representativeRoute: page.representativeRoute,
          instanceKind: payload.instanceKind ?? 'OTHER',
          captureEligible: false,
        });
        parent.instanceIds = [...parent.instanceIds, instId];
        page.founderPrimary = false;
        page.captureEligible = false;
        applied.push(override.overrideId);
        break;
      }

      case 'FORCE_STATE':
        if (!page) {
          conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
          break;
        }
        page.founderPrimary = false;
        page.captureEligible = false;
        page.visualStateIds = [...page.visualStateIds, override.value || `${page.experiencePageId}:state`];
        applied.push(override.overrideId);
        break;

      default:
        if (page) applied.push(override.overrideId);
        else conflicts.push({ ...override, status: 'OVERRIDE_CONFLICT' });
    }
  }

  return { pages: nextPages, sections, materialScreens: nextMaterial, instances: nextInstances, applied, conflicts, supersededPageIds };
}
