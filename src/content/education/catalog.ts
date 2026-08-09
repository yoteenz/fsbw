import type { EducationContentFamily, EducationPillar, SlayTip } from './types';
import { FAMILY_PLUCKING } from './families/plucking';
import { SLAY_TIP_DEV_WET_HAIRLINE } from './slay-tips/dev-wet-hairline-plucking';

const FAMILIES: EducationContentFamily[] = [FAMILY_PLUCKING];
const SLAY_TIPS: SlayTip[] = [SLAY_TIP_DEV_WET_HAIRLINE];

const familyById = new Map(FAMILIES.map((f) => [f.id, f]));
const familyBySlug = new Map(FAMILIES.map((f) => [f.slug, f]));
const tipById = new Map(SLAY_TIPS.map((t) => [t.id, t]));
const tipBySlug = new Map(SLAY_TIPS.map((t) => [t.slug, t]));

export function getAllEducationFamilies(): EducationContentFamily[] {
  return FAMILIES.filter((f) => f.published !== false);
}

export function getEducationFamilyById(id: string): EducationContentFamily | undefined {
  return familyById.get(id);
}

export function getEducationFamilyBySlug(slug: string): EducationContentFamily | undefined {
  return familyBySlug.get(slug);
}

export function getAllSlayTips(): SlayTip[] {
  return SLAY_TIPS.filter((t) => t.published !== false);
}

export function getSlayTipById(id: string): SlayTip | undefined {
  return tipById.get(id);
}

export function getSlayTipBySlug(slug: string): SlayTip | undefined {
  return tipBySlug.get(slug);
}

export function getSlayTipsForFamily(familyId: string): SlayTip[] {
  const family = familyById.get(familyId);
  if (!family?.slayTipIds?.length) return [];
  return family.slayTipIds
    .map((id) => tipById.get(id))
    .filter((t): t is SlayTip => Boolean(t) && (t as SlayTip).published !== false);
}

export function getSlayTipsForPsaEpisode(episodeId: string): SlayTip[] {
  return getAllSlayTips().filter(
    (t) => t.relatedPSAEpisodeId === episodeId && t.published !== false
  );
}

export function getSlayTipsByPillar(pillar: EducationPillar): SlayTip[] {
  return getAllSlayTips().filter((t) => t.pillar === pillar);
}

export function getFamilyForPsaEpisode(episodeId: string): EducationContentFamily | undefined {
  return getAllEducationFamilies().find(
    (f) => f.primaryPSAEpisodeId === episodeId || f.relatedPSAEpisodeIds?.includes(episodeId)
  );
}

export function getFamilyForSlayTip(tipId: string): EducationContentFamily | undefined {
  const tip = tipById.get(tipId);
  if (!tip?.contentFamilyId) return undefined;
  return familyById.get(tip.contentFamilyId);
}

/** Learn-tab pillar rails — foundation only; empty pillars show coming soon. */
export const EDUCATION_PILLAR_RAILS = [
  { id: 'lace', title: 'LACE', pillar: 'lace' as EducationPillar },
  { id: 'color', title: 'COLOR', pillar: 'color' as EducationPillar },
  { id: 'style', title: 'STYLE', pillar: 'style' as EducationPillar },
  { id: 'care', title: 'CARE', pillar: 'care' as EducationPillar },
] as const;

export function getSlayTipsForLearnRail(railId: string): SlayTip[] {
  if (railId === 'slay-tips') return getAllSlayTips();
  const pillarRail = EDUCATION_PILLAR_RAILS.find((r) => r.id === railId);
  if (pillarRail) return getSlayTipsByPillar(pillarRail.pillar);
  return [];
}
