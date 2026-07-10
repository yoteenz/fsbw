import { loadMediaBlob, saveMediaBlob } from '../media-storage';
import { getOrCreateGuestSessionId, readResumeToken } from './guest-identity';
import type { ExpertCaptureMediaRef } from './types';

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '') as string;
}

export async function sha256Hex(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function uploadAnswerMedia(input: {
  sessionId: string;
  answerId: string;
  questionId: string;
  mediaId: string;
  localBlobId: string | null;
  blob?: Blob | null;
  isPartial?: boolean;
}): Promise<ExpertCaptureMediaRef> {
  const ref: ExpertCaptureMediaRef = {
    mediaId: input.mediaId,
    answerId: input.answerId,
    questionId: input.questionId,
    localBlobId: input.localBlobId,
    storagePath: null,
    checksumSha256: null,
    uploadStatus: 'pending',
    isPartial: input.isPartial ?? false,
    byteSize: null,
    mimeType: 'video/webm',
  };

  let blob = input.blob ?? null;
  if (!blob && input.localBlobId) {
    blob = await loadMediaBlob(input.localBlobId);
  }
  if (!blob || blob.size === 0) {
    ref.uploadStatus = 'none';
    return ref;
  }

  ref.uploadStatus = 'uploading';
  ref.byteSize = blob.size;
  ref.checksumSha256 = await sha256Hex(blob);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  headers['X-Guest-Session-Id'] = getOrCreateGuestSessionId();
  const resume = readResumeToken(input.sessionId);
  if (resume) headers['X-Expert-Capture-Resume-Token'] = resume;

  try {
    if (blob.size <= 4 * 1024 * 1024) {
      const dataUrl = await blobToDataUrl(blob);
      const res = await fetch(`${apiBase()}/api/expert-capture/media`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'upload',
          sessionId: input.sessionId,
          answerId: input.answerId,
          questionId: input.questionId,
          mediaId: input.mediaId,
          dataUrl,
          isPartial: input.isPartial ?? false,
          guestSessionId: getOrCreateGuestSessionId(),
          resumeToken: resume,
        }),
      });
      if (!res.ok) throw new Error(`Upload failed ${res.status}`);
      const data = (await res.json()) as { storagePath?: string; checksumSha256?: string };
      ref.storagePath = data.storagePath ?? null;
      ref.checksumSha256 = data.checksumSha256 ?? ref.checksumSha256;
      ref.uploadStatus = 'uploaded';
      return ref;
    }

    const prep = await fetch(`${apiBase()}/api/expert-capture/media`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'prepare',
        sessionId: input.sessionId,
        answerId: input.answerId,
        questionId: input.questionId,
        mediaId: input.mediaId,
        isPartial: input.isPartial ?? false,
        mimeType: blob.type || 'video/webm',
        guestSessionId: getOrCreateGuestSessionId(),
        resumeToken: resume,
      }),
    });
    if (!prep.ok) throw new Error(`Prepare upload failed ${prep.status}`);
    const prepData = (await prep.json()) as { signedUrl: string; storagePath: string; token: string };
    const put = await fetch(prepData.signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': blob.type || 'video/webm', 'x-upsert': 'true' },
      body: blob,
    });
    if (!put.ok) throw new Error(`Signed upload failed ${put.status}`);

    const confirm = await fetch(`${apiBase()}/api/expert-capture/media`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'confirm',
        sessionId: input.sessionId,
        answerId: input.answerId,
        questionId: input.questionId,
        mediaId: input.mediaId,
        storagePath: prepData.storagePath,
        checksumSha256: ref.checksumSha256,
        byteSize: blob.size,
        isPartial: input.isPartial ?? false,
        guestSessionId: getOrCreateGuestSessionId(),
        resumeToken: resume,
      }),
    });
    if (!confirm.ok) throw new Error(`Confirm upload failed ${confirm.status}`);
    ref.storagePath = prepData.storagePath;
    ref.uploadStatus = 'uploaded';
    return ref;
  } catch {
    ref.uploadStatus = 'failed';
    await saveMediaBlob(input.localBlobId ?? input.mediaId, blob);
    return ref;
  }
}

export async function persistPartialRecordingChunk(input: {
  sessionId: string;
  answerId: string;
  questionId: string;
  chunkBlob: Blob;
  partialMediaId: string;
}): Promise<void> {
  await saveMediaBlob(input.partialMediaId, input.chunkBlob);
}
