import { useRef, useState } from 'react';
import { FILE_POLICY } from '../../vault/vaultConfig';
import { validateUploadFile } from '../../vault/vaultStorage';

type Props = {
  multiple?: boolean;
  allowFolder?: boolean;
  label?: string;
  onFilesSelected: (files: File[]) => void | Promise<void>;
  disabled?: boolean;
};

export function SecureDocumentUploader({
  multiple = true,
  allowFolder = false,
  label = 'Upload documents',
  onFilesSelected,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const accept = FILE_POLICY.allowedExtensions.join(',');

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    const files = [...fileList];
    const errors: string[] = [];
    for (const file of files) {
      const err = validateUploadFile(file);
      if (err) errors.push(`${file.name}: ${err}`);
    }
    if (errors.length) {
      setError(errors.join(' '));
      return;
    }
    setUploading(true);
    try {
      await onFilesSelected(files);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="aio-doc-uploader">
      <div
        className={`aio-doc-uploader__drop${dragOver ? ' aio-doc-uploader__drop--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <p>{label}</p>
        <p className="aio-doc-uploader__hint">PDF, JPG, JPEG, PNG · up to {Math.round(FILE_POLICY.maxBytes / 1024 / 1024)}MB</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            className="aio-btn aio-btn--gold"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Choose Files'}
          </button>
          {allowFolder ? (
            <button
              type="button"
              className="aio-btn aio-btn--outline-dark"
              disabled={disabled || uploading}
              onClick={() => folderRef.current?.click()}
            >
              Choose Folder
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="aio-doc-uploader__input"
          accept={accept}
          multiple={multiple}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {allowFolder ? (
          <input
            ref={folderRef}
            type="file"
            className="aio-doc-uploader__input"
            // @ts-expect-error webkitdirectory is supported in Chromium
            webkitdirectory=""
            multiple
            onChange={(e) => void handleFiles(e.target.files)}
          />
        ) : null}
      </div>
      {error ? <p className="aio-doc-vault-error" role="alert">{error}</p> : null}
    </div>
  );
}
