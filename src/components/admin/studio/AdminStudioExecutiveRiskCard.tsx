import type { ExecutiveRisk } from '../../../utils/adminStudioExecutiveCommandCenterDemo';
import { urgencyColor } from '../../../utils/adminStudioExecutiveCommandCenterDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioExecutiveRiskCardProps = {
  risk: ExecutiveRisk;
};

export function AdminStudioExecutiveRiskCard({ risk }: AdminStudioExecutiveRiskCardProps) {
  const color = urgencyColor(risk.urgency);

  return (
    <div className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${color}` }}>
      <div className="flex justify-between items-start gap-2">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{risk.title}</p>
        <span className="text-[5px] font-futura uppercase shrink-0" style={{ fontWeight: 515, color }}>{risk.urgency}</span>
      </div>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{risk.description}</p>
      <p className="text-[5px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: color }}>{risk.module}</p>
    </div>
  );
}
