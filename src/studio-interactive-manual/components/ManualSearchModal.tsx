import { useState } from 'react';
import { searchManualIndex } from '../searchIndex';
import type { ManualSearchEntry } from '../types';
import { KH_VISUAL, khActionBtn, khCaption, khPanelStyle } from '../../components/admin/studio/knowledge-hub/knowledgeHubTheme';
import { STUDIO_INTERACTIVE_MANUAL_LABEL } from '../constants';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (entry: ManualSearchEntry) => void;
};

export function ManualSearchModal({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const results = query.trim() ? searchManualIndex(query) : [];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 100020, background: 'rgba(0,0,0,0.4)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Manual search"
      onClick={onClose}
    >
      <div
        style={{ ...khPanelStyle, width: 'min(92vw, 420px)', padding: '16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={khCaption}>{STUDIO_INTERACTIVE_MANUAL_LABEL.toUpperCase()}</p>
        <p style={{ ...khCaption, color: KH_VISUAL.red, fontSize: '12px', marginBottom: '12px' }}>SEARCH MANUAL</p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="HOW DO APPROVALS WORK?"
          autoFocus
          className="w-full border border-black px-3 py-2 mb-3"
          style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', textTransform: 'uppercase' }}
        />
        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
          {results.length === 0 && query.trim() ? (
            <p style={khCaption}>NO MATCHES — TRY ASSET FACTORY, APPROVALS, OR EXPORTS</p>
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
              style={{ ...khActionBtn, display: 'block', width: '100%', textAlign: 'left', marginBottom: '6px' }}
            >
              <span style={{ color: KH_VISUAL.red, display: 'block' }}>{entry.label}</span>
              <span style={{ ...khCaption, fontSize: '8px' }}>{entry.snippet}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} style={{ ...khActionBtn, marginTop: '12px', width: '100%' }}>
          CLOSE
        </button>
      </div>
    </div>
  );
}
