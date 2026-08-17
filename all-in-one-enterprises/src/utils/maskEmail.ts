/** Mask email for privacy in success states — e.g. t••••@example.com */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const maskLen = Math.min(Math.max(local.length - 1, 1), 4);
  return `${local[0]}${'•'.repeat(maskLen)}@${domain}`;
}
