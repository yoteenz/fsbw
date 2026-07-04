import type { LegacyAwardCategory } from '../../../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioLegacyAwardCardProps = {
  award: LegacyAwardCategory;
};

export function AdminStudioLegacyAwardCard({ award }: AdminStudioLegacyAwardCardProps) {
  return (
    <div
      className="p-3 border"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: '3px solid #CA8A04',
      }}
    >
      <div className="flex justify-between items-start">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          {award.title}
        </p>
        <span className="text-[9px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#CA8A04' }}>
          {award.year}
        </span>
      </div>
      <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: '#CA8A04' }}>
        WINNER
      </p>
      <p className="text-[11px] mt-0.5" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
        {award.winner}
      </p>
      <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        NOMINEES: {award.nominees.join(' · ')}
      </p>
    </div>
  );
}
