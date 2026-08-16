import { useState } from 'react';
import { GLOSSARY } from '../road-ready/roadReadyConfig';

type Props = {
  term: string;
  children?: React.ReactNode;
};

export function GlossaryTooltip({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const definition = GLOSSARY[term];

  if (!definition) return <>{children ?? term}</>;

  return (
    <span className="aio-glossary">
      <button
        type="button"
        className="aio-glossary__trigger"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {children ?? term}
        <span className="aio-glossary__icon" aria-hidden="true">?</span>
      </button>
      {open && (
        <span role="tooltip" className="aio-glossary__panel">
          <strong>{term}</strong>
          <p>{definition}</p>
          <button type="button" className="aio-glossary__close" onClick={() => setOpen(false)}>
            Close
          </button>
        </span>
      )}
    </span>
  );
}
