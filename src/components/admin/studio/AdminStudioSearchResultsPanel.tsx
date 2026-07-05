import { useNavigate } from 'react-router-dom';
import type { StudioSearchHit } from '../../../utils/adminStudioSearch';
import { getStudioNavGroup } from '../../../utils/adminStudioNavigation';
import { STUDIO_STATUS_LABELS } from '../../../utils/adminStudioNavigation';

type Props = {
  query: string;
  results: StudioSearchHit[];
  onClear: () => void;
};

/** Studio-scoped header search results — navigates to matching modules only. */
export function AdminStudioSearchResultsPanel({ query, results, onClear }: Props) {
  const navigate = useNavigate();
  const trimmed = query.trim();

  if (!trimmed) return null;

  return (
    <div
      className="mb-3 border bg-white/95 backdrop-blur-sm overflow-hidden"
      style={{ borderWidth: '1.3px', borderColor: '#000' }}
      role="listbox"
      aria-label="Studio search results"
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: '#e5e7eb' }}
      >
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '9px',
            color: '#808080',
            margin: 0,
          }}
        >
          STUDIO SEARCH · {results.length} RESULT{results.length === 1 ? '' : 'S'}
        </p>
        <button
          type="button"
          onClick={onClear}
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '8px',
            color: '#EB1C24',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          CLEAR
        </button>
      </div>

      {results.length === 0 ? (
        <p
          className="px-3 py-3"
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '10px',
            color: '#808080',
            margin: 0,
          }}
        >
          NO STUDIO MODULES MATCH &ldquo;{trimmed.toUpperCase()}&rdquo;
        </p>
      ) : (
        <div className="max-h-[280px] overflow-y-auto">
          {results.map((hit) => {
            const group = getStudioNavGroup(hit.groupId);
            const status = hit.module?.status;
            return (
              <button
                key={hit.id}
                type="button"
                role="option"
                onClick={() => {
                  onClear();
                  navigate(hit.route);
                }}
                className="w-full text-left px-3 py-2.5 border-b hover:bg-black/[0.03] transition-colors"
                style={{ borderColor: '#f3f4f6' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="block truncate"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
                      color: '#EB1C24',
                    }}
                  >
                    {hit.label}
                  </span>
                  {status ? (
                    <span
                      className="shrink-0"
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '8px',
                        color: status === 'live' ? '#EB1C24' : '#808080',
                      }}
                    >
                      {STUDIO_STATUS_LABELS[status]}
                    </span>
                  ) : null}
                </div>
                <span
                  className="block truncate"
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '9px',
                    color: '#666',
                    marginTop: '2px',
                  }}
                >
                  {hit.subtitle}
                </span>
                {group ? (
                  <span
                    className="block truncate"
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '8px',
                      color: '#999',
                      marginTop: '3px',
                    }}
                  >
                    {group.label}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
