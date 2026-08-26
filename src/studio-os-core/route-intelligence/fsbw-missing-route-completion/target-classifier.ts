import type {
  DesignFamilyRecord,
  ExperiencePageRecord,
  MaterialScreenRecord,
  MissingDesignTargetType,
  MissingPageCandidateRecord,
  StudioWorldDesignRouteManifest,
} from '../types';

export type ClassifyMissingTargetInput = {
  candidate: MissingPageCandidateRecord;
  manifest: StudioWorldDesignRouteManifest;
  parentExperiencePage?: ExperiencePageRecord;
};

const TAB_PATTERNS = [
  /voice[- ]?lab/i,
  /\/tab\//i,
  /\/tabs\//i,
  /character[- ]?lab.*voice/i,
  /\/voice$/i,
  /activeTab/i,
];

const VISUAL_STATE_PATTERNS = [
  /drawer|modal|menu-open|expanded|filter-open|sort-open|panel-open/i,
  /state=|\/open$/i,
];

const INSTANCE_PATTERNS = [
  /:param|:id|:slug|:unitSlug|:productId|:serviceId/i,
  /\/try\//i,
  /instance/i,
];

const ASSET_PATTERNS = [/asset-variant|thumbnail|preview-image|hero-image/i];

function findParentPage(
  candidate: MissingPageCandidateRecord,
  manifest: StudioWorldDesignRouteManifest,
): ExperiencePageRecord | undefined {
  const pageSet = manifest.projectPageSets?.find((p) => p.projectId === candidate.projectId);
  if (!pageSet) return undefined;
  if (candidate.experiencePageId) {
    return pageSet.experiencePages?.find((p) => p.experiencePageId === candidate.experiencePageId);
  }
  const route = candidate.representativeRoute;
  return pageSet.experiencePages?.find(
    (p) => route.startsWith(p.representativeRoute.replace(/:[^/]+/g, '')) || p.memberRouteIds.some((r) => route.includes(r)),
  );
}

function familyForCandidate(
  candidate: MissingPageCandidateRecord,
  manifest: StudioWorldDesignRouteManifest,
): DesignFamilyRecord | undefined {
  const families = manifest.designFamilies ?? [];
  for (const id of candidate.designFamilyIds) {
    const f = families.find((x) => x.designFamilyId === id);
    if (f) return f;
  }
  const route = candidate.representativeRoute.toLowerCase();
  return families.find(
    (f) =>
      f.projectId === candidate.projectId &&
      (route.includes(f.representativeRoute.replace(/:[^/]+/g, '')) ||
        f.displayName.toLowerCase().split(' ').some((w) => route.includes(w.toLowerCase()))),
  );
}

export function classifyMissingDesignTarget(input: ClassifyMissingTargetInput): MissingDesignTargetType {
  const { candidate, manifest } = input;
  const route = candidate.representativeRoute;
  const name = candidate.displayName;
  const parent = input.parentExperiencePage ?? findParentPage(candidate, manifest);
  const family = familyForCandidate(candidate, manifest);

  if (TAB_PATTERNS.some((p) => p.test(route) || p.test(name))) {
    return 'TAB_STATE';
  }

  if (VISUAL_STATE_PATTERNS.some((p) => p.test(route) || p.test(name))) {
    return 'VISUAL_STATE';
  }

  if (ASSET_PATTERNS.some((p) => p.test(route) || p.test(name))) {
    return 'ASSET_VARIANT';
  }

  if (INSTANCE_PATTERNS.some((p) => p.test(route)) && parent) {
    if (/content|copy|text|headline/i.test(name)) return 'CONTENT_INSTANCE';
    if (/data|record|row|entry/i.test(name)) return 'DATA_INSTANCE';
    return 'CONTENT_INSTANCE';
  }

  if (parent && parent.materialScreenIds.length > 0) {
    const materialScreens = manifest.projectPageSets
      ?.find((p) => p.projectId === candidate.projectId)
      ?.materialScreens?.filter((m: MaterialScreenRecord) => m.experiencePageId === parent.experiencePageId);
    if (materialScreens?.length) {
      const isNested = materialScreens.some(
        (m) => m.representativeRoute === route || m.displayName.toLowerCase() === name.toLowerCase(),
      );
      if (isNested || /step|screen|panel|stage|hub/i.test(name)) {
        return 'MATERIAL_SCREEN';
      }
    }
  }

  if (!family && !parent) {
    if (/wizard|hub|landing|homepage|unique/i.test(name)) return 'UNIQUE_EXPERIENCE';
    return 'UNKNOWN_REVIEW_REQUIRED';
  }

  if (family && parent && (TAB_PATTERNS.some((p) => p.test(name)) || /lab|workspace|tab/i.test(name))) {
    return 'TAB_STATE';
  }

  if (family) return 'FAMILY_DERIVED_PAGE';

  return 'UNIQUE_EXPERIENCE';
}

export function isTrueMissingRouteHandoff(
  targetType: MissingDesignTargetType,
  candidate: MissingPageCandidateRecord,
): boolean {
  if (targetType === 'UNKNOWN_REVIEW_REQUIRED' && !candidate.designFamilyIds.length) return true;
  if (targetType === 'UNIQUE_EXPERIENCE') return true;
  return false;
}

export function targetTypePromotesToPage(targetType: MissingDesignTargetType): boolean {
  return targetType === 'UNIQUE_EXPERIENCE' || targetType === 'FAMILY_DERIVED_PAGE';
}
