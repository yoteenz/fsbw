export type CopyResult = { ok: true } | { ok: false; error: string };

export async function copyTextToClipboard(text: string): Promise<CopyResult> {
  if (!text.trim()) return { ok: false, error: 'Nothing to copy' };
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    }
  } catch {
    /* fallback below */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok ? { ok: true } : { ok: false, error: 'Copy failed — select the text manually' };
  } catch {
    return { ok: false, error: 'Copy failed — select the text manually' };
  }
}
