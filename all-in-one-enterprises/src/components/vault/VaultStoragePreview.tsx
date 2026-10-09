import type { VaultDocument } from '../../vault/vaultTypes';
import { useVaultStorageUrl } from '../../hooks/useVaultStorageUrl';
import { canPreviewDocument } from '../../vault/vaultStorage';

type Props = {
  doc: Pick<VaultDocument, 'mimeType' | 'storageReference'>;
  imgClassName?: string;
  linkClassName?: string;
  pdfLinkLabel?: string;
};

export function VaultStoragePreview({
  doc,
  imgClassName = 'aio-vault-preview__img',
  linkClassName = 'aio-btn aio-btn--outline',
  pdfLinkLabel = 'View file',
}: Props) {
  const url = useVaultStorageUrl(doc.storageReference);

  if (!canPreviewDocument(doc.mimeType) || !doc.storageReference) return null;
  if (!url) return <p className="aio-vault-preview__loading">Loading preview…</p>;

  if (doc.mimeType?.startsWith('image/')) {
    return <img src={url} alt="" className={imgClassName} />;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {pdfLinkLabel}
    </a>
  );
}
