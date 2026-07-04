import type { AudienceJourneyStep } from '../../../utils/adminStudioAudienceBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAudienceJourneyFlowProps = {
  steps: AudienceJourneyStep[];
  accentHex?: string;
};

export function AdminStudioAudienceJourneyFlow({ steps, accentHex = '#EB1C24' }: AdminStudioAudienceJourneyFlowProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.id} className="flex flex-col items-center">
          {i > 0 ? <div className="text-[10px] py-0.5" style={{ color: accentHex }}>↓</div> : null}
          <div
            className="w-full p-2.5 border"
            style={{
              background: ADMIN_STUDIO_THEME.panelBg,
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
              borderLeft: `2px solid ${accentHex}`,
            }}
          >
            <div className="flex justify-between items-center gap-2">
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                {step.label}
              </p>
              <p className="text-[6px] font-futura uppercase shrink-0" style={{ fontWeight: 515, color: '#16A34A' }}>
                {step.continueRate}% CONTINUE
              </p>
            </div>
            <div className="h-1 mt-1.5 bg-white/80 border overflow-hidden" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <div className="h-full" style={{ width: `${step.continueRate}%`, background: accentHex }} />
            </div>
            <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              {step.dropOffRate}% DROP-OFF
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
