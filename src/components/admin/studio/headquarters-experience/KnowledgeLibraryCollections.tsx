import { useState } from 'react';
import { HQ, hqBody, hqLabel } from './hqExperienceTheme';
import { HqGlassSurface } from './HqWingZone';

export type LibraryCollectionItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  meta?: string;
};

const COLLECTION_TABS = ['Recent', 'Pinned', 'Published', 'Drafts'] as const;

type Props = {
  items: LibraryCollectionItem[];
  emptyMessage?: string;
  onSelectItem?: (id: string) => void;
  accentHex?: string;
};

/** Knowledge Library — premium collection experience (Apple Books inspired). */
export function KnowledgeLibraryCollections({
  items,
  emptyMessage = 'Knowledge should feel collected — not stored.',
  onSelectItem,
  accentHex = HQ.red,
}: Props) {
  const [tab, setTab] = useState<(typeof COLLECTION_TABS)[number]>('Recent');

  const filtered = items.filter((item) => {
    const s = item.status.toLowerCase();
    if (tab === 'Published') return s.includes('publish') || s.includes('live');
    if (tab === 'Drafts') return s.includes('draft') || s.includes('queue');
    if (tab === 'Pinned') return s.includes('pin') || item.meta?.includes('PIN');
    return true;
  });

  return (
    <HqGlassSurface>
      <p style={{ ...hqLabel, color: accentHex, margin: 0 }}>KNOWLEDGE LIBRARY</p>
      <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 4 }}>Curated collections · not a file list</p>

      <div className="flex flex-wrap gap-1 mt-4">
        {COLLECTION_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              ...hqLabel,
              fontSize: '5px',
              padding: '4px 8px',
              borderRadius: 4,
              border: tab === t ? `1px solid ${accentHex}` : '1px solid rgba(0,0,0,0.08)',
              background: tab === t ? `rgba(235,28,36,0.06)` : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              color: tab === t ? accentHex : HQ.gray,
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ ...hqBody, color: HQ.gray, marginTop: 16, textAlign: 'center' }}>{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-2">
          {filtered.slice(0, 6).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem?.(item.id)}
              className="text-left p-3 rounded-lg transition-transform active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                cursor: onSelectItem ? 'pointer' : 'default',
              }}
            >
              <p style={{ ...hqLabel, fontSize: '5px', color: accentHex }}>{item.status.toUpperCase()}</p>
              <p style={{ ...hqBody, fontFamily: '"Futura PT Medium"', fontSize: '8px', marginTop: 4 }}>{item.title}</p>
              <p style={{ ...hqBody, fontSize: '7px', color: HQ.gray, marginTop: 2 }}>{item.subtitle}</p>
              {item.meta ? <p style={{ ...hqLabel, fontSize: '5px', marginTop: 6 }}>{item.meta}</p> : null}
            </button>
          ))}
        </div>
      )}
    </HqGlassSurface>
  );
}
