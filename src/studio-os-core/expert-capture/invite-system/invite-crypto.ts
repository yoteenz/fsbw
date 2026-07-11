/** Hash optional invite PIN — never store plain PIN server-side. */
export async function hashInvitePin(pin: string): Promise<string> {
  const normalized = pin.trim();
  if (!normalized) return '';
  const data = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyInvitePin(pin: string, pinHash: string | null | undefined): Promise<boolean> {
  if (!pinHash) return true;
  const hash = await hashInvitePin(pin);
  return hash === pinHash;
}
