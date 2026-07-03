import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioChipSelectProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (item: string) => void;
  accentHex?: string;
};

export function AdminStudioChipSelect({
  label,
  options,
  selected,
  onToggle,
  accentHex = ADMIN_STUDIO_THEME.accent,
}: AdminStudioChipSelectProps) {
  return (
    <div>
      <p
        className="text-[8px] font-futura uppercase mb-2 tracking-wider"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isOn = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className="px-2 py-1 text-[7px] font-futura uppercase transition-all"
              style={{
                fontWeight: 515,
                color: isOn ? ADMIN_STUDIO_THEME.textPrimary : ADMIN_STUDIO_THEME.textSecondary,
                background: isOn ? ADMIN_STUDIO_THEME.chipActiveBg : ADMIN_STUDIO_THEME.chipInactiveBg,
                border: isOn ? `1px solid ${accentHex}` : `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
