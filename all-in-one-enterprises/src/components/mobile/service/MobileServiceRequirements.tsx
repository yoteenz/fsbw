import { useState } from 'react';

type Props = {
  requirements: string[];
  documents: string[];
};

export function MobileServiceRequirements({ requirements, documents }: Props) {
  const [open, setOpen] = useState(false);
  const items = [...requirements, ...documents];
  if (!items.length) return null;

  return (
    <section className="aio-msvc-requirements">
      <button
        type="button"
        className="aio-msvc-requirements__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          <span className="aio-msvc-section-label">What You&apos;ll Need</span>
          <span className="aio-msvc-requirements__count">{items.length} items</span>
        </span>
        <span className="aio-msvc-requirements__chevron" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <ul className="aio-msvc-requirements__list">
          {items.map((item) => (
            <li key={item}>
              <span className="aio-msvc-requirements__check" aria-hidden="true">
                ○
              </span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="aio-msvc-requirements__upload-note">
        Upload Document — available in your client portal when a service request is active.
      </p>
    </section>
  );
}
