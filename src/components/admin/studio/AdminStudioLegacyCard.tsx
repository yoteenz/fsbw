import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioLegacyCardProps = {
  title: string;
  metric: string;
  description: string;
  accentHex?: string;
  onClick?: () => void;
  locked?: boolean;
};

export function AdminStudioLegacyCard({
  title,
  metric,
  description,
  accentHex = '#8B0000',
  onClick,
  locked,
}: AdminStudioLegacyCardProps) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="w-full text-left p-2.5 border transition-transform active:scale-[0.98]"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderTop: `2px solid ${accentHex}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {locked ? '🔒 ' : ''}{title}
      </p>
      <p className="text-[14px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
        {metric}
      </p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
        {description}
      </p>
    </Wrapper>
  );
}
