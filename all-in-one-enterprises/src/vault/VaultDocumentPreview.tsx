import { canPreviewDocument } from './vaultStorage';
import { useVaultStorageUrl } from './useVaultStorageUrl';

type Props = {
  mimeType?: string;
  storageReference?: string;
  imgClassName?: string;
  linkClassName?: string;
  linkLabel?: string;
};

/** Resolves demo IndexedDB refs for img / PDF open links. */
export function VaultDocumentPreview({
  mimeType,
  storageReference,
  imgClassName = 'aio-vault-preview__img',
  linkClassName = 'aio-btn aio-btn--outline',
  linkLabel = 'View file',
}: Props) {
  const previewUrl = useVaultStorageUrl(storageReference);
  if (!canPreviewDocument(mimeType) || !storageReference || !previewUrl) return null;

  if (mimeType?.startsWith('image/')) {
    return <img src={previewUrl} alt="" className={imgClassName} />;
  }

  return (
    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {linkLabel}
    </a>
  );
}
