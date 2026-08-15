type Doc = { id: string; label: string; onFile: boolean };

type Props = {
  documents: Doc[];
};

export function AIODocumentChecklist({ documents }: Props) {
  return (
    <ul className="aio-doc-checklist">
      {documents.map((doc) => (
        <li key={doc.id} className={doc.onFile ? 'aio-doc-checklist__item--on-file' : 'aio-doc-checklist__item'}>
          <span className="aio-doc-checklist__mark" aria-hidden="true">
            {doc.onFile ? '✓' : '○'}
          </span>
          <span>{doc.label}</span>
          {doc.onFile ? <span className="aio-doc-checklist__tag">Already on File</span> : null}
        </li>
      ))}
    </ul>
  );
}
