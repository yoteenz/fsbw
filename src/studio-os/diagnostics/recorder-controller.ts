/**
 * Global flight recorder session controls — independent of React diagnostic pages.
 */
import { resetFlightSession } from './flight-recorder/context-snapshot';
import { clearMemoryMirror, getMemoryMirror } from './flight-recorder/persistence';
import { recordFlightEvent, resetFlightRecorderSequence } from './flight-recorder/recorder';
import {
  getRecordingElapsedMs,
  getRecordingStartedAt,
  isRecorderActive,
  isRecorderPaused,
  readMemoryUsageLabel,
  resetRecorderClock,
  setRecorderPaused,
  setRecorderRecording,
} from './recorder-state';

export type RecorderRuntimeStatus = {
  recording: boolean;
  paused: boolean;
  sessionId: string;
  elapsedMs: number;
  eventCount: number;
  memoryLabel: string;
};

export { isRecorderActive, isRecorderPaused, getRecordingElapsedMs };

export function pauseRecording(): void {
  if (isRecorderPaused()) return;
  setRecorderPaused(true);
  recordFlightEvent('RECORDER_PAUSED', 'recorder-controller');
}

export function resumeRecording(): void {
  if (!isRecorderPaused()) return;
  setRecorderPaused(false);
  recordFlightEvent('RECORDER_RESUMED', 'recorder-controller');
}

export function startRecording(): void {
  setRecorderRecording(true);
  setRecorderPaused(false);
  resetRecorderClock();
  recordFlightEvent('RECORDER_STARTED', 'recorder-controller');
}

export function clearRecording(): void {
  recordFlightEvent('RECORDER_CLEARED', 'recorder-controller');
  clearMemoryMirror();
  resetFlightRecorderSequence();
  resetFlightSession();
  resetRecorderClock();
  setRecorderRecording(true);
  setRecorderPaused(false);
}

export function getRecorderRuntimeStatus(sessionId: string): RecorderRuntimeStatus {
  return {
    recording: isRecorderActive() || isRecorderPaused(),
    paused: isRecorderPaused(),
    sessionId,
    elapsedMs: getRecordingElapsedMs(),
    eventCount: getMemoryMirror().length,
    memoryLabel: readMemoryUsageLabel(),
  };
}

export { getRecordingStartedAt };
