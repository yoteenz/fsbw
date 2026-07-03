type AdminStudioSingleSelectProps = {
  label: string;
  value: string;
  options: readonly string[] | Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  accentHex?: string;
};

/** Single-select dropdown styled for dark Studio stage. */
export function AdminStudioSingleSelect({
  label,
  value,
  options,
  onChange,
  accentHex = '#EB1C24',
}: AdminStudioSingleSelectProps) {
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

  return (
    <div>
      <label
        className="block text-[8px] font-futura uppercase mb-1.5 tracking-wider"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border text-white text-[9px] font-futura uppercase px-3 py-2 outline-none appearance-none"
        style={{
          fontWeight: 515,
          borderColor: `${accentHex}55`,
          borderLeftWidth: '2px',
        }}
      >
        {normalized.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#121212', color: '#fff' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
