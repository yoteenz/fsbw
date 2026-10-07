/** Founder rule: no lowercase text on AIO pages — the browser tab title included, whoever sets it. */
export function enforceUppercaseDocumentTitle(): void {
  const apply = () => {
    const upper = document.title.toUpperCase();
    if (document.title !== upper) document.title = upper;
  };
  apply();
  new MutationObserver(apply).observe(document.head, { subtree: true, childList: true, characterData: true });
}
