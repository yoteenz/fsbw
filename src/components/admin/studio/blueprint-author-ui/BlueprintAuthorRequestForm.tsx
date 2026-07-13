import type { CSSProperties } from 'react';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontFamily: 'system-ui, sans-serif',
  boxSizing: 'border-box',
};

const btnStyle: CSSProperties = {
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  background: '#eb1c24',
  color: '#fff',
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
};

/** Founder request capture — triggers Blueprint Author, not generation. */
export function BlueprintAuthorRequestForm({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'Describe what you want Studio World to build…',
  label = 'Founder request',
}: Props) {
  return (
    <div data-blueprint-author-request style={{ fontFamily: 'system-ui, sans-serif' }}>
      <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
      />
      <button
        type="button"
        style={{ ...btnStyle, marginTop: 8, opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
        disabled={isLoading || !value.trim()}
        onClick={onSubmit}
      >
        {isLoading ? 'Authoring blueprint…' : 'Author Construction Plan'}
      </button>
      <p style={{ margin: '8px 0 0', fontSize: '10px', color: '#64748b' }}>
        Blueprint Author translates your request into a Construction Plan. AI workers start only after you approve.
      </p>
    </div>
  );
}
