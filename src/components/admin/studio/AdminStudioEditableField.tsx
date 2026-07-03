import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioEditableFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  accentHex?: string;
};

/** Inline editable demo field — light frosted card. */
export function AdminStudioEditableField({
  label,
  value,
  onChange,
  multiline = false,
  accentHex = ADMIN_STUDIO_THEME.accent,
}: AdminStudioEditableFieldProps) {
  const sharedClass =
    'w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none focus:border-black/40 transition-colors placeholder:text-black/25';
  const sharedStyle = { fontWeight: 515 as const, lineHeight: 1.45, borderColor: ADMIN_STUDIO_THEME.inputBorder };

  return (
    <div
      className="rounded-sm p-3"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderLeft: `2px solid ${accentHex}`,
        border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
        borderLeftWidth: '2px',
        borderLeftColor: accentHex,
      }}
    >
      <label
        className="block text-[8px] font-futura uppercase mb-1.5 tracking-wider"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
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
