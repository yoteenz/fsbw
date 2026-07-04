import type { AudiencePrediction } from '../../../utils/adminStudioAudienceBrainDemo';
import { confidenceLabel } from '../../../utils/adminStudioAudienceBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAudiencePredictionCardProps = {
  prediction: AudiencePrediction;
};

export function AdminStudioAudiencePredictionCard({ prediction }: AdminStudioAudiencePredictionCardProps) {
  const conf = confidenceLabel(prediction.confidence);

  return (
    <div
      className="p-2.5 border"
      style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          {prediction.topic}
        </p>
        <span className="text-[10px] leading-none shrink-0" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.accent }}>
          {prediction.confidence}%
        </span>
      </div>
      <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {prediction.forecast}
      </p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {prediction.horizon} · {conf} — NOT CERTAINTY
      </p>
    </div>
  );
}
