import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioExecutiveOpportunityCardProps = {
  opportunity: {
    id: string;
    title: string;
    category: string;
    confidence: number;
    evidence: string;
    expectedImpact: string;
    accentHex: string;
  };
};

export function AdminStudioExecutiveOpportunityCard({ opportunity }: AdminStudioExecutiveOpportunityCardProps) {
  return (
    <div className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${opportunity.accentHex}` }}>
      <div className="flex justify-between items-start gap-2">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.35 }}>{opportunity.title}</p>
        <span className="text-[10px] leading-none shrink-0" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: opportunity.accentHex }}>{opportunity.confidence}%</span>
      </div>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>{opportunity.evidence}</p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: opportunity.accentHex }}>{opportunity.category} · IMPACT: {opportunity.expectedImpact}</p>
    </div>
  );
}
