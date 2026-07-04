import type { ExecutiveHealthMetric } from '../../../utils/adminStudioExecutiveCommandCenterDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioExecutiveHealthGridProps = {
  metrics: ExecutiveHealthMetric[];
  accentHex?: string;
};

export function AdminStudioExecutiveHealthGrid({ metrics, accentHex = '#EB1C24' }: AdminStudioExecutiveHealthGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((m) => (
        <div key={m.label} className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${accentHex}` }}>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{m.label}</p>
          <p className="text-[12px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{m.value}</p>
          {m.sub ? (
            <p className="text-[5px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: accentHex }}>{m.sub}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
