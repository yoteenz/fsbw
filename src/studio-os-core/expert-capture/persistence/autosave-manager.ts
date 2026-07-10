import type { ExpertCaptureProfile } from '../profiles/profile-types';
import { saveSession } from '../session-storage';
import { buildPersistedDocument, newMutationId } from './document-builder';
import { readDeviceMetadata, isOnline } from './guest-identity';
import { syncExpertCaptureDocument } from './server-sync';
import type {
  ExpertCapturePersistedDocument,
  ExpertCaptureRuntimeState,
  ExpertCaptureSaveStatus,
} from './types';
import type { ExpertCaptureSession } from '../types';

export type AutosaveSnapshot = {
  session: ExpertCaptureSession;
  runtime: ExpertCaptureRuntimeState;
  mediaRefs?: ExpertCapturePersistedDocument['mediaRefs'];
  sessionVersion: number;
  resumeToken?: string | null;
};

export type AutosaveListener = (state: {
  status: ExpertCaptureSaveStatus;
  lastSavedAt: string | null;
  lastServerConfirmedAt: string | null;
  message: string;
}) => void;

export class ExpertCaptureAutosaveManager {
  private timer: ReturnType<typeof setInterval> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private listener: AutosaveListener | null = null;
  private lastSavedAt: string | null = null;
  private lastServerConfirmedAt: string | null = null;
  private status: ExpertCaptureSaveStatus = 'idle';
  private pending: AutosaveSnapshot | null = null;
  private inFlight = false;

  constructor(
    private profile: ExpertCaptureProfile,
    private companyId: string
  ) {}

  onStatusChange(listener: AutosaveListener | null): void {
    this.listener = listener;
    this.emit();
  }

  private emit(message?: string): void {
    this.listener?.({
      status: this.status,
      lastSavedAt: this.lastSavedAt,
      lastServerConfirmedAt: this.lastServerConfirmedAt,
      message:
        message ??
        (this.status === 'saved'
          ? 'Saved'
          : this.status === 'saving'
            ? 'Saving…'
            : this.status === 'offline_pending'
              ? 'Offline — changes pending'
              : this.status === 'failed'
                ? 'Save failed'
                : ''),
    });
  }

  startRecordingInterval(getSnapshot: () => AutosaveSnapshot | null): void {
    this.stopRecordingInterval();
    this.timer = setInterval(() => {
      const snap = getSnapshot();
      if (snap) void this.save(snap, { reason: 'recording_interval' });
    }, 12_000);
  }

  stopRecordingInterval(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  scheduleSave(snapshot: AutosaveSnapshot, delayMs = 400): void {
    this.pending = snapshot;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (this.pending) void this.save(this.pending, { reason: 'debounced' });
    }, delayMs);
  }

  async save(
    snapshot: AutosaveSnapshot,
    opts: { reason?: string; force?: boolean } = {}
  ): Promise<{ localOk: boolean; serverOk: boolean; sessionVersion: number }> {
    if (this.inFlight && !opts.force) {
      this.pending = snapshot;
      return { localOk: true, serverOk: false, sessionVersion: snapshot.sessionVersion };
    }

    this.inFlight = true;
    this.status = 'saving';
    this.emit(opts.reason === 'recording_interval' ? 'Autosaving…' : 'Saving…');

    saveSession(snapshot.session, this.profile);
    this.lastSavedAt = new Date().toISOString();

    const doc = buildPersistedDocument({
      session: snapshot.session,
      runtime: snapshot.runtime,
      sessionVersion: snapshot.sessionVersion,
      lastMutationId: newMutationId(),
      guestSessionId: null,
      resumeToken: snapshot.resumeToken ?? null,
      activeDeviceId: readDeviceMetadata().deviceId,
      deviceMetadata: readDeviceMetadata(),
      mediaRefs: snapshot.mediaRefs,
    });

    let nextVersion = snapshot.sessionVersion;
    let serverOk = false;

    if (isOnline()) {
      const result = await syncExpertCaptureDocument({
        document: doc,
        companyId: this.companyId,
        profileId: this.profile.id,
        expectedVersion: snapshot.sessionVersion,
      });
      if (result.ok) {
        nextVersion = result.sessionVersion;
        this.lastServerConfirmedAt = result.lastSavedAt;
        serverOk = result.serverConfirmed;
        this.status = 'saved';
        this.emit('Saved');
      } else if (result.conflict) {
        this.status = 'failed';
        this.emit('Conflict detected');
      } else if (result.offline) {
        this.status = 'offline_pending';
        this.emit('Offline — changes pending');
      } else {
        this.status = 'failed';
        this.emit(result.error);
      }
    } else {
      this.status = 'offline_pending';
      this.emit('Offline — changes pending');
    }

    this.inFlight = false;
    if (this.pending) {
      const next = this.pending;
      this.pending = null;
      void this.save(next);
    }

    return { localOk: true, serverOk, sessionVersion: nextVersion };
  }

  flushPending(): void {
    if (this.pending) {
      const snap = this.pending;
      this.pending = null;
      void this.save(snap, { force: true });
    }
  }

  dispose(): void {
    this.stopRecordingInterval();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }
}
