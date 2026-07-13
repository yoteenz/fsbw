/** Server enforcement for Experience Lab V2 production writes. */
export function assertExperienceLabV2LiveWriteAllowed(modeHeader: string | undefined): {
  ok: boolean;
  code?: string;
  message?: string;
} {
  if (modeHeader !== 'CONTROLLED_LIVE') {
    return { ok: false, code: 'V2_READ_ONLY', message: 'Experience Lab V2 live writes require CONTROLLED_LIVE mode.' };
  }
  if (process.env.EXPERIENCE_LAB_V2_LIVE_ACTIONS !== 'true' && process.env.EXPERIENCE_LAB_V2_LIVE_ACTIONS !== '1') {
    return { ok: false, code: 'V2_LIVE_DISABLED', message: 'Experience Lab V2 live actions are disabled server-side.' };
  }
  return { ok: true };
}
