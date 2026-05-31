/** Fetch same-origin (or public) asset and trigger a file download (works when `<a download>` is ignored). */
export async function downloadAssetFile(href: string, filename: string): Promise<void> {
  const absoluteUrl = href.startsWith('http')
    ? href
    : new URL(href, window.location.origin).href;

  const response = await fetch(absoluteUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
