import type { CastingProductionEntry } from '../../../utils/adminStudioCastingDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

const STATUS_COLORS: Record<CastingProductionEntry['productionStatus'], string> = {
  draft: ADMIN_STUDIO_THEME.textSecondary,
  casting: '#CA8A04',
  approved: '#16A34A',
  locked: '#EB1C24',
  filming: '#EB1C24',
  post: '#4A90D9',
  scheduled: '#8B5CF6',
  released: '#16A34A',
};

type AdminStudioCastingBoardCardProps = {
  production: CastingProductionEntry;
  onClick: () => void;
};

/** Casting board production card. */
export function AdminStudioCastingBoardCard({ production, onClick }: AdminStudioCastingBoardCardProps) {
  const statusColor = STATUS_COLORS[production.productionStatus];
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 border transition-transform active:scale-[0.98] bg-white/80"
      style={{
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: `3px solid ${production.accentHex}`,
      }}
    >
      <div className="flex justify-between items-start gap-2 mb-1">
        <p
          className="text-[10px] leading-tight"
          style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}
        >
          {production.showName}
        </p>
        <span
          className="shrink-0 px-1.5 py-0.5 text-[5px] font-futura uppercase"
          style={{ fontWeight: 515, color: statusColor, border: `1px solid ${statusColor}44` }}
        >
          {production.productionStatus.replace('-', ' ')}
        </span>
      </div>
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EP {production.episodeNumber} · {production.episodeTitle}
      </p>
      <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: production.accentHex }}>
        {production.studioName}
      </p>
      <p className="text-[6px] font-futura uppercase mt-1 line-clamp-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        CAST: {production.selectedTalent.replace(/\n/g, ' · ')}
      </p>
      <div className="mt-2 flex justify-between text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        <span>SHOOT {production.shootDate || 'TBD'}</span>
        <span>PUB {production.publishDate || 'TBD'}</span>
      </div>
    </button>
  );
}
