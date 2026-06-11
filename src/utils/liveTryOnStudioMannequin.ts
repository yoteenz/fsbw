export type LiveTryOnCaptureAngle = 'left' | 'front' | 'right';

export function mannequinPublicUrlForAngle(
  urls: [string, string, string] | null | undefined,
  angle: LiveTryOnCaptureAngle
): string | undefined {
  if (!urls) return undefined;
  const [left, front, right] = urls;
  if (angle === 'left') return left || front;
  if (angle === 'right') return right || front;
  return front || left || right;
}

export function formatStudioTryOnError(message: string): string {
  const code = message.trim().toUpperCase();
  if (code === 'COLOR_PREVIEW_MISSING') {
    return 'YOUR COLOR PREVIEW IS NOT READY YET — WAIT FOR PREP TO FINISH, THEN TRY AGAIN';
  }
  return code;
}
