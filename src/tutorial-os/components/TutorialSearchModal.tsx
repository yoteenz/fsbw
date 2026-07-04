import { useState } from 'react';
import { searchTutorialIndex } from '../v2/searchIndex';
import type { TutorialSearchEntry } from '../v2/schema';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (entry: TutorialSearchEntry) => void;
};

export function TutorialSearchModal({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const results = query.trim() ? searchTutorialIndex(query) : [];

  if (!open) return null;

  return (
    <div
      className="tutorial-os-welcome-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial search"
      onClick={onClose}
    >
      <div
        className="tutorial-os-welcome-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px' }}
      >
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#808080',
            marginBottom: '6px',
          }}
        >
          ONBOARDING TUTORIAL
        </p>
        <h2
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '13px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#EB1C24',
            marginBottom: '12px',
          }}
        >
          SEARCH TUTORIALS
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="HOW DO I REDEEM VOUCHERS?"
          autoFocus
          className="w-full border border-black px-3 py-2 mb-3"
          style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', textTransform: 'uppercase' }}
        />
        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {results.length === 0 && query.trim() ? (
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#808080', textTransform: 'uppercase' }}>
              NO MATCHES — TRY WISHLIST, VOUCHERS, OR REFERRALS
            </p>
          ) : null}
          {results.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                onSelect(entry);
                onClose();
                setQuery('');
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '6px',
                background: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '10px',
                  color: '#EB1C24',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                {entry.label}
              </span>
              <span
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '9px',
                  color: '#808080',
                  textTransform: 'uppercase',
                }}
              >
                {entry.snippet}
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="tutorial-os-welcome-btn tutorial-os-welcome-btn--ghost" style={{ marginTop: '12px' }}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

export function TutorialSearchLauncher({
  onOpen,
  labelTranslateX = '7px',
}: {
  onOpen: () => void;
  labelTranslateX?: string;
}) {
  return (
    <div className="flex items-center justify-between cursor-pointer" onClick={onOpen}>
      <span
        style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '14px',
          color: 'black',
          fontWeight: '500',
          textTransform: 'uppercase',
          transform: `translateX(${labelTranslateX})`,
        }}
      >
        TUTORIAL SEARCH
      </span>
    </div>
  );
}
