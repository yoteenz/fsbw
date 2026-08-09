export type {
  SignatureUnitEducationProfile,
  SignatureUnitEducationMedia,
  SignatureUnitEducationNotes,
  UnitContextSource,
  DemonstrationUnitStrategy,
  ContinuityStage,
  ResolvedEducationUnitContext,
  ChapterMediaResolution,
} from './types';

export {
  SIGNATURE_UNIT_EDUCATION_PROFILES,
  getSignatureUnitEducationProfile,
  getActiveSignatureUnitEducationProfiles,
  isKnownSignatureUnitId,
} from './registry';

export {
  readFollowThisUnitPreference,
  writeFollowThisUnitPreference,
  readContinuityUnitPreference,
  writeContinuityUnitPreference,
} from './educationUnitPreference';

export {
  resolveEducationUnitContext,
  type ResolveEducationUnitContextInput,
} from './resolveEducationUnitContext';

export { resolveChapterMedia, type ResolveChapterMediaInput } from './resolveChapterMedia';
