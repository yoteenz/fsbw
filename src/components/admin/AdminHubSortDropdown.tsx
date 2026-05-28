import { useState } from 'react';

type AdminHubSortDropdownProps = {
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
  ariaLabel?: string;
  formatLabel?: (option: string) => string;
};

const defaultFormatLabel = (opt: string) => opt.toUpperCase();

/** Matches admin meetings hub: compact sort control above tab lists. */
export function AdminHubSortDropdown({
  value,
  options,
  onChange,
  ariaLabel = 'Sort list',
  formatLabel = defaultFormatLabel,
}: AdminHubSortDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" style={{ marginLeft: '2px', display: 'inline-flex', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5"
        style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', whiteSpace: 'nowrap', flexShrink: 0 }}
        aria-label={ariaLabel}
      >
        <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>{formatLabel(value)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', color: '#EB1C24' }}
          aria-hidden
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 py-1 bg-white border border-black shadow-lg z-20 min-w-[120px]"
            style={{ borderWidth: '1.3px', marginTop: '7px' }}
          >
            {options
              .filter((opt) => opt !== value)
              .map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}
                >
                  {formatLabel(opt)}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
