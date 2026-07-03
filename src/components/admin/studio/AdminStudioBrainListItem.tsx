import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioBrainListItemProps = {
  title: string;
  subtitle?: string;
  accentHex?: string;
  isSelected: boolean;
  onSelect: () => void;
};

export function AdminStudioBrainListItem({
  title,
  subtitle,
  accentHex = ADMIN_STUDIO_THEME.accent,
  isSelected,
  onSelect,
}: AdminStudioBrainListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left px-3 py-2 transition-all border"
      style={{
        background: isSelected ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
        borderColor: isSelected ? accentHex : ADMIN_STUDIO_THEME.panelBorder,
        borderLeftWidth: isSelected ? '2px' : '1px',
        borderLeftColor: isSelected ? accentHex : ADMIN_STUDIO_THEME.panelBorder,
      }}
    >
      <p
        className="text-[9px] font-futura uppercase leading-tight"
        style={{ fontWeight: 515, color: isSelected ? ADMIN_STUDIO_THEME.textPrimary : ADMIN_STUDIO_THEME.textSecondary }}
      >
        {title}
      </p>
      {subtitle ? (
        <p
          className="text-[7px] font-futura uppercase mt-0.5"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}
        >
          {subtitle}
        </p>
      ) : null}
    </button>
  );
}
