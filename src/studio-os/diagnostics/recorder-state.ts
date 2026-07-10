/** Recording gate — shared by recorder + controller (avoids circular imports). */
let recording = true;
let paused = false;
let recordingStartedAt = Date.now();

export function isRecorderActive(): boolean {
  return recording && !paused;
}

export function isRecorderPaused(): boolean {
  return paused;
}

export function setRecorderPaused(value: boolean): void {
  paused = value;
}

export function setRecorderRecording(value: boolean): void {
  recording = value;
}

export function resetRecorderClock(): void {
  recordingStartedAt = Date.now();
}

export function getRecordingStartedAt(): number {
  return recordingStartedAt;
}

export function getRecordingElapsedMs(): number {
  return Date.now() - recordingStartedAt;
}

export function readMemoryUsageLabel(): string {
  try {
    const perf = performance as Performance & { memory?: { usedJSHeapSize?: number } };
    if (perf.memory?.usedJSHeapSize != null) {
      return `${Math.round(perf.memory.usedJSHeapSize / (1024 * 1024))} MB`;
    }
  } catch {
    /* unsupported */
  }
  return 'n/a';
}
