import type { FileScanStatus } from './securityTypes';

export const UPLOAD_LIMITS = {
  defaultMaxBytes: 10 * 1024 * 1024,
  pdfMaxBytes: 15 * 1024 * 1024,
  imageMaxBytes: 8 * 1024 * 1024,
} as const;

export const APPROVED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAGIC: { mime: string; bytes: number[] }[] = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF — WEBP container
];

export interface UploadValidationInput {
  fileName: string;
  declaredMime: string;
  sizeBytes: number;
  bytes?: Uint8Array;
}

export interface UploadValidationResult {
  ok: boolean;
  scanStatus: FileScanStatus;
  safeStorageName: string;
  displayName: string;
  error?: string;
}

export function sanitizeFileName(raw: string): string {
  const base = raw.replace(/[/\\?%*:|"<>]/g, '_').replace(/\.\./g, '_').trim();
  return base.slice(0, 180) || 'upload';
}

export function generateInternalStorageId(): string {
  return `doc-${crypto.randomUUID()}`;
}

function detectMime(bytes: Uint8Array): string | null {
  for (const sig of MAGIC) {
    if (sig.bytes.every((b, i) => bytes[i] === b)) return sig.mime;
  }
  return null;
}

export function validateUpload(input: UploadValidationInput): UploadValidationResult {
  const displayName = sanitizeFileName(input.fileName);
  const safeStorageName = generateInternalStorageId();

  if (input.sizeBytes <= 0) {
    return { ok: false, scanStatus: 'REJECTED', safeStorageName, displayName, error: 'Empty file' };
  }
  if (input.sizeBytes > UPLOAD_LIMITS.defaultMaxBytes) {
    return { ok: false, scanStatus: 'REJECTED', safeStorageName, displayName, error: 'File exceeds size limit' };
  }

  const ext = displayName.split('.').pop()?.toLowerCase() ?? '';
  const blockedExt = new Set(['exe', 'bat', 'cmd', 'sh', 'js', 'html', 'htm', 'svg', 'msi', 'dll', 'scr']);
  if (blockedExt.has(ext)) {
    return { ok: false, scanStatus: 'REJECTED', safeStorageName, displayName, error: 'File type not permitted' };
  }

  if (!APPROVED_MIME_TYPES.has(input.declaredMime)) {
    return { ok: false, scanStatus: 'REJECTED', safeStorageName, displayName, error: 'MIME type not permitted' };
  }

  if (input.bytes && input.bytes.length >= 4) {
    const detected = detectMime(input.bytes);
    if (detected && detected !== input.declaredMime && !(detected === 'image/webp' && input.declaredMime === 'image/webp')) {
      return { ok: false, scanStatus: 'QUARANTINED', safeStorageName, displayName, error: 'File content does not match declared type' };
    }
    if (!detected && input.declaredMime === 'application/pdf') {
      return { ok: false, scanStatus: 'QUARANTINED', safeStorageName, displayName, error: 'Invalid PDF signature' };
    }
  }

  // Malware scanning foundation — no scanner connected in debug
  return { ok: true, scanStatus: 'UPLOADED', safeStorageName, displayName };
}

export function contentDispositionAttachment(displayName: string): string {
  const safe = sanitizeFileName(displayName);
  return `attachment; filename="${safe.replace(/"/g, '')}"`;
}
