import type { AudienceRecommendation } from '../../../utils/adminStudioAudienceBrainDemo';
import { confidenceLabel } from '../../../utils/adminStudioAudienceBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAudienceRecommendationCardProps = {
  recommendation: AudienceRecommendation;
  onClick?: () => void;
};

export function AdminStudioAudienceRecommendationCard({ recommendation, onClick }: AdminStudioAudienceRecommendationCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  const conf = confidenceLabel(recommendation.confidence);

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="w-full text-left p-3 border transition-transform active:scale-[0.98]"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: `3px solid ${recommendation.accentHex}`,
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.35 }}>
          {recommendation.title}
        </p>
        <span className="text-[10px] leading-none shrink-0" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: recommendation.accentHex }}>
          {recommendation.confidence}%
        </span>
      </div>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
        {recommendation.evidence}
      </p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: recommendation.accentHex }}>
        {recommendation.category} · {conf} CONFIDENCE
      </p>
    </Wrapper>
  );
}
