import type { AudienceMetric } from '../../../utils/adminStudioAudienceBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAudienceMetricCardProps = {
  metric: AudienceMetric;
};

export function AdminStudioAudienceMetricCard({ metric }: AdminStudioAudienceMetricCardProps) {
  return (
    <div
      className="p-2.5 border"
      style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
    >
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {metric.label}
      </p>
      <p className="text-[13px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
        {metric.value}
      </p>
      {metric.trend ? (
        <p
          className="text-[5px] font-futura uppercase mt-1"
          style={{ fontWeight: 515, color: metric.trendUp ? '#16A34A' : ADMIN_STUDIO_THEME.accent }}
        >
          {metric.trend}
        </p>
      ) : null}
    </div>
  );
}
