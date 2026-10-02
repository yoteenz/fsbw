import type { DocumentaryCameraAwareness, ResidentDocumentaryProfile, ResidentId } from './types';
import { SEASON1_RESIDENT_IDS } from './season1-residents';

const V = 'v1.0.0';

function profile(
  residentId: ResidentId,
  cameraAwareness: DocumentaryCameraAwareness,
  partial: Omit<ResidentDocumentaryProfile, 'residentId' | 'cameraAwareness' | 'version'>
): ResidentDocumentaryProfile {
  return {
    residentId,
    cameraAwareness,
    version: V,
    ...partial,
  };
}

const CAMERA_SEED: Record<ResidentId, DocumentaryCameraAwareness> = {
  'SW-RESIDENT-001': 'ignores_until_break',
  'SW-RESIDENT-002': 'speaks_when_worth_it',
  'SW-RESIDENT-003': 'plays_to_camera',
  'SW-RESIDENT-004': 'dislikes_camera',
  'SW-RESIDENT-005': 'owns_every_camera',
  'SW-RESIDENT-006': 'forgets_camera',
  'SW-RESIDENT-007': 'always_knows_camera',
  'SW-RESIDENT-008': 'image_aware',
};

function defaultDocumentaryFields(
  residentId: ResidentId,
  displayName: string
): Omit<ResidentDocumentaryProfile, 'residentId' | 'cameraAwareness' | 'version'> {
  const others = SEASON1_RESIDENT_IDS.filter((id) => id !== residentId);
  return {
    confessionalStyle: `${displayName} — observational confessional; workplace mockumentary grammar`,
    defaultCameraReaction: 'Composed until the room gets absurd',
    howTheyLieToCamera: 'Polished half-truths about how fine everything is',
    howCameraCatchesContradictions: 'Cutaway after someone else tells the truth',
    breakComposureTriggers: ['Client chaos', 'Production shortcuts'],
    willNotDiscussOnCamera: ['Unapproved deals', 'Raw financial fear'],
    talksAboutMost: others.slice(0, 2),
    pretendsNotToCareAbout: others.slice(2, 3),
    runningVisualGags: [],
    signatureLookToCamera: 'Quick glance — meaning depends on resident',
    publicSocialIdentity: `${displayName} — Studio World office cast`,
    personalFeedEnergy: 'Behind-the-scenes professional, not influencer spam',
    recurringBits: [],
    audienceCatchpoints: ['Competence under pressure', 'Found family at work'],
    memePotential: 'Medium — character-driven not quote-driven',
    rootForThemBecause: 'They care about craft and people',
    dislikeThemBecause: 'They can be intimidating or withholding',
    audienceDiscoversOverTime: 'Soft edges and private rituals',
    remainsMysterious: 'What they do after hours',
  };
}

export const SEASON1_DOCUMENTARY_PROFILES: ResidentDocumentaryProfile[] = [
  profile('SW-RESIDENT-001', CAMERA_SEED['SW-RESIDENT-001'], {
    ...defaultDocumentaryFields('SW-RESIDENT-001', 'Etta Vale'),
    confessionalStyle: 'Controlled, precise — pretends camera is not there until something ridiculous happens',
    defaultCameraReaction: 'Stillness, then one devastating line',
    howTheyLieToCamera: 'Claims everything was always the plan',
    howCameraCatchesContradictions: 'Micro-expressions when Caspian oversells',
    breakComposureTriggers: ['Bad taste winning a meeting', 'Unearned confidence'],
    signatureLookToCamera: 'Slow sidelong look after chaos',
    talksAboutMost: ['SW-RESIDENT-005', 'SW-RESIDENT-002'],
    pretendsNotToCareAbout: ['SW-RESIDENT-003'],
  }),
  profile('SW-RESIDENT-002', CAMERA_SEED['SW-RESIDENT-002'], {
    ...defaultDocumentaryFields('SW-RESIDENT-002', 'Zuri Hale'),
    confessionalStyle: 'Only speaks when she has something worth saying',
    signatureLookToCamera: 'Direct, calm — no wasted frames',
    talksAboutMost: ['SW-RESIDENT-001', 'SW-RESIDENT-008'],
  }),
  profile('SW-RESIDENT-003', CAMERA_SEED['SW-RESIDENT-003'], {
    ...defaultDocumentaryFields('SW-RESIDENT-003', 'Jules Mercer'),
    confessionalStyle: 'Plays to camera — host energy',
    runningVisualGags: ['Fixing someone’s lapel mid-crisis'],
    talksAboutMost: ['SW-RESIDENT-001', 'SW-RESIDENT-007'],
  }),
  profile('SW-RESIDENT-004', CAMERA_SEED['SW-RESIDENT-004'], {
    ...defaultDocumentaryFields('SW-RESIDENT-004', 'Noa Kline'),
    confessionalStyle: 'Reluctant — dislikes camera presence',
    howTheyLieToCamera: 'Technically true statements that omit the point',
    talksAboutMost: ['SW-RESIDENT-001', 'SW-RESIDENT-005'],
  }),
  profile('SW-RESIDENT-005', CAMERA_SEED['SW-RESIDENT-005'], {
    ...defaultDocumentaryFields('SW-RESIDENT-005', 'Caspian Reed'),
    confessionalStyle: 'Believes every camera is his camera',
    runningVisualGags: ['Blocking fluorescent lights with a scarf'],
    talksAboutMost: ['SW-RESIDENT-001', 'SW-RESIDENT-006'],
  }),
  profile('SW-RESIDENT-006', CAMERA_SEED['SW-RESIDENT-006'], {
    ...defaultDocumentaryFields('SW-RESIDENT-006', 'Iona Wells'),
    confessionalStyle: 'Forgets camera exists — accidentally says too much',
    breakComposureTriggers: ['Someone touches unfinished fabrication'],
    talksAboutMost: ['SW-RESIDENT-007', 'SW-RESIDENT-001'],
  }),
  profile('SW-RESIDENT-007', CAMERA_SEED['SW-RESIDENT-007'], {
    ...defaultDocumentaryFields('SW-RESIDENT-007', 'Marlowe Saint'),
    confessionalStyle: 'Always seems to know where the camera is',
    howTheyLieToCamera: 'Charm — never a direct falsehood',
    talksAboutMost: ['SW-RESIDENT-003', 'SW-RESIDENT-006'],
  }),
  profile('SW-RESIDENT-008', CAMERA_SEED['SW-RESIDENT-008'], {
    ...defaultDocumentaryFields('SW-RESIDENT-008', 'Elio Vahn'),
    confessionalStyle: 'Always aware of how he is being perceived',
    signatureLookToCamera: 'Measured smile — calculating warmth',
    talksAboutMost: ['SW-RESIDENT-002', 'SW-RESIDENT-001'],
  }),
];
