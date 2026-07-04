import type { CastingTalentProfile } from '../../../utils/adminStudioCastingDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

const STATUS_LABELS: Record<CastingTalentProfile['castingStatus'], string> = {
  available: 'AVAILABLE',
  booked: 'BOOKED',
  filming: 'FILMING',
  'on-break': 'ON BREAK',
  'season-complete': 'SEASON DONE',
  retired: 'RETIRED',
  inactive: 'INACTIVE',
  'guest-appearance': 'GUEST',
};

type AdminStudioCastingTalentCardProps = {
  talent: CastingTalentProfile;
  onClick: () => void;
};

/** Casting talent card — IMDb meets Apple editorial. */
export function AdminStudioCastingTalentCard({ talent, onClick }: AdminStudioCastingTalentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left overflow-hidden transition-transform duration-300 active:scale-[0.98] bg-white/80 border border-black/15 shadow-md"
      style={{ aspectRatio: '3 / 4', borderWidth: '1.3px' }}
    >
      <img
        src={talent.portraitSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 15%, rgba(255,255,255,0.88) 65%, #FFFFFF 100%)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: talent.accentHex }} />
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 text-[6px] font-futura uppercase z-10 bg-white/90"
        style={{
          fontWeight: 515,
          border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
          color: talent.castingStatus === 'available' ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary,
        }}
      >
        {STATUS_LABELS[talent.castingStatus]}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p
          className="text-[11px] leading-tight"
          style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}
        >
          {talent.name}
        </p>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: talent.accentHex }}>
          {talent.role}
        </p>
        <p className="text-[6px] font-futura uppercase line-clamp-1 mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {talent.primaryShows}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1 text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          <span>S{talent.currentSeason} · {talent.episodesAppeared} EPS</span>
          <span className="text-right">WR {talent.wardrobeCount}</span>
          <span className="col-span-2">{talent.availability}</span>
        </div>
      </div>
    </button>
  );
}
