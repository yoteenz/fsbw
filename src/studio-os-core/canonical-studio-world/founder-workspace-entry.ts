/**
 * Founder workspace entry — Industry Pack clones into tenant HQ; founders enter CDS only.
 * Experience Lab publishes approved packs; founders never see EL.
 */

import type { ApprovedHeadquartersHandoff } from '../industry-packs/contract';
import { buildApprovedHeadquartersHandoff } from '../industry-packs/approved-headquarters-handoff';
import { getIndustryPack } from '../industry-packs/industry-pack-registry';
import type { ExperienceLabIndustryPackOptionId } from './contract';
import { getExperienceLabPackOption } from './experience-lab-entry';
import { planExperienceLabHeadquartersFromPack } from './integration';
import { FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH } from './permission-model';

export type FounderIndustryPackCloneInput = {
  packOptionId: ExperienceLabIndustryPackOptionId;
  organizationId: string;
  founderPackInstanceId: string;
  /** Published Founder Render from Studio World admin approval pipeline. */
  founderRenderJobId: string;
  previewArtifactUrl: string;
  approvedAt: string;
  approvedBy: string;
};

export type FounderIndustryPackCloneResult =
  | {
      ok: true;
      handoff: ApprovedHeadquartersHandoff;
      creativeDirectorStudioEntryPath: typeof FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH;
    }
  | { ok: false; code: string; message: string };

/**
 * Founder selects Industry Pack at company creation — Studio World clones the published pack
 * into the founder workspace. Founder enters Creative Director Studio to customize HQ.
 */
export function clonePublishedIndustryPackToFounderWorkspace(
  input: FounderIndustryPackCloneInput
): FounderIndustryPackCloneResult {
  const option = getExperienceLabPackOption(input.packOptionId);
  if (!option) {
    return { ok: false, code: 'PACK_OPTION_UNKNOWN', message: `Unknown Industry Pack: ${input.packOptionId}` };
  }

  const pack = getIndustryPack(option.industryPackId);
  if (!pack) {
    return { ok: false, code: 'PACK_NOT_PUBLISHED', message: `Industry Pack ${option.industryPackId} is not published.` };
  }

  const planResult = planExperienceLabHeadquartersFromPack({
    packOptionId: input.packOptionId,
    companyHqOrganizationId: input.organizationId,
  });
  if (!planResult.ok) {
    if ('code' in planResult) {
      return { ok: false, code: planResult.code, message: planResult.message };
    }
    const nested = planResult.error;
    return { ok: false, code: nested.code, message: nested.message };
  }

  const handoff = buildApprovedHeadquartersHandoff({
    pack,
    organizationId: input.organizationId,
    founderPackInstanceId: input.founderPackInstanceId,
    founderRenderJobId: input.founderRenderJobId,
    previewArtifactUrl: input.previewArtifactUrl,
    approvedAt: input.approvedAt,
    approvedBy: input.approvedBy,
    generationPlan: planResult.plan,
  });

  return {
    ok: true,
    handoff,
    creativeDirectorStudioEntryPath: FOUNDER_CREATIVE_WORKSPACE_ENTRY_PATH,
  };
}
