export {
  createEmptySession,
  loadSession,
  saveSession,
  clearSessionStorage,
  getActiveQuestions,
  getCurrentQuestion,
  estimateRemainingMinutes,
  createAnswerForQuestion,
  newKnowledgeItem,
  countProgress,
} from './session-storage';

export { saveMediaBlob, loadMediaBlob, deleteMediaBlob, clearAllMediaBlobs, newMediaBlobId } from './media-storage';
export { callInterviewAi, extractKnowledgeLocally } from './interview-engine';
export { detectFollowUpNeeded, buildLocalFollowUpQuestion } from './follow-up-detector';
export {
  applyKnowledgeExtraction,
  approveAnswerKnowledge,
  rejectAnswerKnowledge,
  markNeedsClarification,
  buildSessionSummary,
} from './knowledge-extraction';
export { buildExportBundle, downloadExportBundle } from './export-service';
export type { ExpertCaptureExportBundle } from './export-service';
export {
  DEFAULT_EXPERT_CAPTURE_PROFILE,
  ALL_IN_ONE_PERMITTING_PROFILE,
  TAX_PREPARATION_PROFILE,
  getExpertCaptureProfile,
} from './profiles';
export type { ExpertCaptureProfile, ExpertCaptureBranding } from './profiles';
export * from './persistence';
export {
  requestMediaStream,
  attachMirroredPreview,
  createMicLevelMonitor,
  SessionRecorder,
  startSpeechTranscription,
  speakText,
} from './recording-service';
export { EXPERT_CAPTURE_FUTURE_PLACEHOLDERS } from './placeholders';
export { EXPERT_CAPTURE_ROUTE, BASE_INTERVIEW_QUESTIONS, CONSENT_RETENTION_DAYS } from './constants';

export type * from './types';
