import { useRef, useState } from 'react';
import { VAULT_CATEGORIES, DOCUMENT_TYPES, FILE_POLICY } from '../vault/vaultConfig';
import type { VaultCategory, VaultUploadInput } from '../vault/vaultTypes';
import { uploadVaultDocument } from '../demo/vaultActions';
import { getOrganizationId } from '../demo/vaultActions';

type Props = {
  onUploaded?: () => void;
  defaultCategory?: VaultCategory;
  roadReadyItemId?: string;
  serviceRequestId?: string;
  relatedEntityType?: VaultUploadInput['relatedEntityType'];
  relatedEntityId?: string;
};

export function VaultUpload({ onUploaded, defaultCategory = 'business', roadReadyItemId, serviceRequestId, relatedEntityType, relatedEntityId }: Props) {
  const [category, setCategory] = useState<VaultCategory>(defaultCategory);
  const [documentType, setDocumentType] = useState('');
  const [title, setTitle] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError('Title and file are required.');
      return;
    }
    setState('uploading');
    setError('');
    const orgId = getOrganizationId();
    const result = await uploadVaultDocument({
      organizationId: orgId,
      category,
      documentType: documentType || DOCUMENT_TYPES[category][0],
      title: title.trim(),
      file,
      issuedAt: issuedAt || undefined,
      expiresAt: expiresAt || undefined,
      notes: notes || undefined,
      roadReadyItemId,
      serviceRequestId,
      relatedEntityType,
      relatedEntityId,
    });
    if (result.error) {
      setState('error');
      setError(result.error);
      return;
    }
    setState('done');
    setFile(null);
    setTitle('');
    onUploaded?.();
    setTimeout(() => setState('idle'), 2000);
  };

  return (
    <form className="aio-vault-upload" onSubmit={onSubmit}>
      <h3>Upload Document</h3>
      <label className="aio-rr-field">
        <span className="aio-rr-field__label">Category</span>
        <select className="aio-intake-input" value={category} onChange={(e) => setCategory(e.target.value as VaultCategory)}>
          {VAULT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </label>
      <label className="aio-rr-field">
        <span className="aio-rr-field__label">Document Type</span>
        <select className="aio-intake-input" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
          <option value="">Select…</option>
          {DOCUMENT_TYPES[category].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="aio-rr-field">
        <span className="aio-rr-field__label">Title</span>
        <input className="aio-intake-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <div className="aio-vault-upload__dates">
        <label className="aio-rr-field">
          <span className="aio-rr-field__label">Issue Date <span className="aio-rr-field__optional">Optional</span></span>
          <input type="date" className="aio-intake-input" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
        </label>
        <label className="aio-rr-field">
          <span className="aio-rr-field__label">Expiration Date <span className="aio-rr-field__optional">Optional</span></span>
          <input type="date" className="aio-intake-input" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </label>
      </div>
      <label className="aio-rr-field">
        <span className="aio-rr-field__label">Notes <span className="aio-rr-field__optional">Optional</span></span>
        <textarea className="aio-intake-input aio-intake-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div
        className="aio-vault-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) setFile(f);
        }}
      >
        <input ref={inputRef} type="file" accept={FILE_POLICY.allowedExtensions.join(',')} className="aio-sr-only" id="vault-file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <label htmlFor="vault-file" className="aio-btn aio-btn--outline">Browse Files</label>
        {file && <p>{file.name} ({Math.round(file.size / 1024)} KB)</p>}
        <p className="aio-prototype-note">PDF, JPG, PNG, WEBP · max {Math.round(FILE_POLICY.maxBytes / 1024 / 1024)}MB</p>
      </div>
      {error && <p className="aio-auth-error" role="alert">{error}</p>}
      <button type="submit" className="aio-btn aio-btn--gold" disabled={state === 'uploading'}>
        {state === 'uploading' ? 'Uploading…' : state === 'done' ? 'Uploaded' : 'Upload For Review'}
      </button>
    </form>
  );
}
