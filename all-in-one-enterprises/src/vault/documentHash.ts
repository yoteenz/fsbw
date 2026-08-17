/** SHA-256 hash for duplicate detection — browser Web Crypto API. */
export async function hashFileSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function findDuplicateDocuments(
  organizationId: string,
  fileHash: string,
  documents: { id: string; organizationId: string; fileHash?: string; title: string }[],
): { id: string; title: string }[] {
  return documents
    .filter((d) => d.organizationId === organizationId && d.fileHash === fileHash)
    .map((d) => ({ id: d.id, title: d.title }));
}
