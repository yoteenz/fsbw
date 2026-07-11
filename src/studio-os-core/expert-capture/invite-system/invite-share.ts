export type ShareResult = 'shared' | 'unsupported' | 'cancelled' | 'failed';

export async function shareInviteContent(opts: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareResult> {
  if (typeof navigator === 'undefined' || !navigator.share) return 'unsupported';
  try {
    await navigator.share({
      title: opts.title,
      text: opts.text,
      url: opts.url,
    });
    return 'shared';
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}
