import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioSingleSelectProps = {
  label: string;
  value: string;
  options: readonly string[] | Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  accentHex?: string;
};

export function AdminStudioSingleSelect({
  label,
  value,
  options,
  onChange,
  accentHex = ADMIN_STUDIO_THEME.accent,
}: AdminStudioSingleSelectProps) {
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

  return (
    <div>
      <label
        className="block text-[8px] font-futura uppercase mb-1.5 tracking-wider"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border text-black text-[9px] font-futura uppercase px-3 py-2 outline-none appearance-none"
        style={{
          fontWeight: 515,
          borderColor: ADMIN_STUDIO_THEME.inputBorder,
          borderLeftWidth: '2px',
          borderLeftColor: accentHex,
        }}
      >
        {normalized.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
