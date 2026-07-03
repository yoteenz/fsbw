import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioMetricTileProps = {
  label: string;
  value: string;
  accentHex?: string;
};

export function AdminStudioMetricTile({ label, value, accentHex = ADMIN_STUDIO_THEME.accent }: AdminStudioMetricTileProps) {
  return (
    <div
      className="p-3 bg-white/70 border"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: `2px solid ${accentHex}`,
      }}
    >
      <p
        className="text-[7px] font-futura uppercase mb-1 tracking-wider"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        {label}
      </p>
      <p
        className="text-[14px] leading-none"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}
