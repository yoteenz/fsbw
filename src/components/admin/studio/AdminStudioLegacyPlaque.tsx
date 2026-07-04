import type { LegacyHallOfFameEntry } from '../../../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioLegacyPlaqueProps = {
  entry: LegacyHallOfFameEntry;
};

export function AdminStudioLegacyPlaque({ entry }: AdminStudioLegacyPlaqueProps) {
  return (
    <div
      className="p-3 border text-center"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.85) 100%)',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderTop: `3px solid ${entry.accentHex}`,
        boxShadow: `inset 0 0 0 1px ${entry.accentHex}22`,
      }}
    >
      <p className="text-[5px] font-futura uppercase tracking-widest" style={{ fontWeight: 515, color: entry.accentHex }}>
        ★ HALL OF FAME ★
      </p>
      <p className="text-[6px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {entry.category}
      </p>
      <p className="text-[13px] mt-1 leading-tight" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
        {entry.honoree}
      </p>
      <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
        {entry.citation}
      </p>
      <p className="text-[10px] mt-2" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: entry.accentHex }}>
        {entry.year}
      </p>
    </div>
  );
}
