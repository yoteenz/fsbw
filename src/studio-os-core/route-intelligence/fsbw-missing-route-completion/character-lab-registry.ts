import {
  CHARACTER_LAB_BASE_PATH,
  CHARACTER_LAB_DESIGN_FAMILY_ID,
  CHARACTER_LAB_EXPERIENCE_PAGE_ID,
  CHARACTER_LAB_SECTION_ID,
  CHARACTER_LAB_SHARED_COMPONENT_PATHS,
  CHARACTER_LAB_SHARED_SHELL_ID,
  CHARACTER_LAB_SHELL_GEOMETRY,
  CHARACTER_LAB_TABS,
  VOICE_LAB_DEFAULT_SOURCE_SIBLING_ID,
  VOICE_LAB_ROUTE,
  VOICE_LAB_TARGET_ID,
} from '../../../components/admin/studio/character-lab/characterLabConfig';
import type { FamilySiblingCandidate, MissingPageCandidateRecord } from '../types';

export type CharacterLabParentRecord = {
  experiencePageId: string;
  sectionId: string;
  designFamilyId: string;
  sharedShellId: string;
  displayName: string;
  representativeRoute: string;
  memberRoutes: string[];
  materialScreens: string[];
  tabStates: string[];
  sharedComponentPaths: string[];
  shellGeometry: typeof CHARACTER_LAB_SHELL_GEOMETRY;
};

export function resolveCharacterLabParent(): CharacterLabParentRecord {
  return {
    experiencePageId: CHARACTER_LAB_EXPERIENCE_PAGE_ID,
    sectionId: CHARACTER_LAB_SECTION_ID,
    designFamilyId: CHARACTER_LAB_DESIGN_FAMILY_ID,
    sharedShellId: CHARACTER_LAB_SHARED_SHELL_ID,
    displayName: 'Character Lab',
    representativeRoute: `${CHARACTER_LAB_BASE_PATH}/character`,
    memberRoutes: CHARACTER_LAB_TABS.map((t) => t.route),
    materialScreens: [],
    tabStates: CHARACTER_LAB_TABS.map((t) => t.id),
    sharedComponentPaths: [...CHARACTER_LAB_SHARED_COMPONENT_PATHS],
    shellGeometry: CHARACTER_LAB_SHELL_GEOMETRY,
  };
}

export function listCharacterLabCodeSiblings(): FamilySiblingCandidate[] {
  const parent = resolveCharacterLabParent();
  return CHARACTER_LAB_TABS.filter((t) => !t.isDerivedTarget).map((tab) => {
    const siblingId = `studio-world:character-lab:${tab.id}`;
    const score = 100 - tab.siblingRank * 5;
    return {
      siblingId,
      designScreenId: siblingId,
      route: tab.route,
      displayName: tab.label,
      familyId: parent.designFamilyId,
      shellId: parent.sharedShellId,
      score,
      confidence: score >= 85 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW',
      similarityExplanation: `Character Lab ${tab.label} tab · shared shell · same tab rail · rank ${tab.siblingRank}`,
      hasSnapshot: false,
      snapshotStale: false,
      captureRequired: true,
    } satisfies FamilySiblingCandidate;
  });
}

export function selectCharacterLabSourceSibling(
  founderOverrideSiblingId?: string,
): { sibling: FamilySiblingCandidate; candidates: FamilySiblingCandidate[] } {
  const candidates = listCharacterLabCodeSiblings().sort((a, b) => b.score - a.score);
  if (founderOverrideSiblingId) {
    const picked = candidates.find((c) => c.siblingId === founderOverrideSiblingId);
    if (picked) return { sibling: picked, candidates };
  }
  const defaultSibling =
    candidates.find((c) => c.siblingId === VOICE_LAB_DEFAULT_SOURCE_SIBLING_ID) ?? candidates[0];
  if (!defaultSibling) {
    throw new Error('No Character Lab source siblings available');
  }
  return { sibling: defaultSibling, candidates };
}

export function voiceLabMissingTargetCandidate(): MissingPageCandidateRecord {
  const parent = resolveCharacterLabParent();
  return {
    candidateId: VOICE_LAB_TARGET_ID,
    projectId: 'studio-world',
    experiencePageId: parent.experiencePageId,
    displayName: 'Voice Lab',
    representativeRoute: VOICE_LAB_ROUTE,
    sectionId: parent.sectionId,
    designFamilyIds: [parent.designFamilyId],
    sourceKind: 'EXPERIENCE_PAGE',
    ownership: 'FSBW',
    implementationStatus: 'IMPLEMENTATION_MISSING' as const,
  };
}
