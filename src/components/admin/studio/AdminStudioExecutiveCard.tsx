import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioExecutiveCardProps = {
  title: string;
  metric: string;
  description: string;
  accentHex?: string;
  onClick?: () => void;
};

export function AdminStudioExecutiveCard({ title, metric, description, accentHex = '#EB1C24', onClick }: AdminStudioExecutiveCardProps) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="w-full text-left p-2.5 border transition-transform active:scale-[0.98]"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderTop: `2px solid ${accentHex}`,
      }}
    >
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{title}</p>
      <p className="text-[14px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{metric}</p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{description}</p>
    </Wrapper>
  );
}
