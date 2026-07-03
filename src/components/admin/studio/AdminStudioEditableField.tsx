type AdminStudioEditableFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  accentHex?: string;
};

/** Inline editable demo field — glass card, no tables. */
export function AdminStudioEditableField({
  label,
  value,
  onChange,
  multiline = false,
  accentHex = '#EB1C24',
}: AdminStudioEditableFieldProps) {
  const sharedClass =
    'w-full bg-white/5 border border-white/15 text-white text-[10px] font-futura uppercase px-3 py-2 outline-none focus:border-white/40 transition-colors placeholder:text-white/25';
  const sharedStyle = { fontWeight: 515 as const, lineHeight: 1.45 };

  return (
    <div
      className="rounded-sm p-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderLeft: `2px solid ${accentHex}`,
      }}
    >
      <label
        className="block text-[8px] font-futura uppercase mb-1.5 tracking-wider"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${sharedClass} resize-y min-h-[72px]`}
          style={sharedStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={sharedClass}
          style={sharedStyle}
        />
      )}
    </div>
  );
}
