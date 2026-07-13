import type { ContentRightsRecord } from './contract';

export function assertExperienceLabPackPromotionRights(
  rights: ContentRightsRecord | null
): { ok: true } | { ok: false; code: string; message: string } {
  if (!rights) {
    return {
      ok: false,
      code: 'RIGHTS_RECORD_REQUIRED',
      message: 'Founder-created mod cannot be promoted into official pack without explicit acquisition or licensing record.',
    };
  }
  if (!rights.rightsHolder || rights.rightsGranted.length === 0) {
    return { ok: false, code: 'RIGHTS_INCOMPLETE', message: 'Rights record must specify holder and granted rights.' };
  }
  return { ok: true };
}
