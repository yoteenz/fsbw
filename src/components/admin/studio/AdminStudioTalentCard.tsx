import type { TalentAgencyEntry } from '../../../utils/adminStudioTalentAgencyDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

const STATUS_LABELS: Record<TalentAgencyEntry['status'], string> = {
  active: 'ACTIVE',
  'in-development': 'IN DEV',
  archived: 'ARCHIVED',
  future: 'FUTURE',
};

type AdminStudioTalentCardProps = {
  talent: TalentAgencyEntry;
  onClick: () => void;
};

/** Talent Agency directory card — luxury casting portrait tile. */
export function AdminStudioTalentCard({ talent, onClick }: AdminStudioTalentCardProps) {
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
        className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 18%, rgba(255,255,255,0.85) 62%, #FFFFFF 100%)`,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: talent.accentHex }} />
      <div
        className="absolute top-2 left-2 px-1.5 py-0.5 text-[6px] font-futura uppercase z-10 bg-white/95"
        style={{ fontWeight: 515, border: `1px solid ${talent.accentHex}88`, color: talent.accentHex }}
      >
        CAST
      </div>
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 text-[6px] font-futura uppercase z-10 bg-white/90"
        style={{
          fontWeight: 515,
          border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
          color: talent.status === 'active' ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary,
        }}
      >
        {STATUS_LABELS[talent.status]}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p
          className="text-[11px] leading-tight mb-0.5"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.textPrimary,
          }}
        >
          {talent.name}
        </p>
        <p
          className="text-[7px] font-futura uppercase line-clamp-1"
          style={{ fontWeight: 515, color: talent.accentHex }}
        >
          {talent.role}
        </p>
        <p
          className="text-[6px] font-futura uppercase line-clamp-2 mt-1"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}
        >
          {talent.primaryShows}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            VOICE {talent.voiceProfileSummary.split('·')[0]?.trim()}
          </p>
          <p className="text-[5px] font-futura uppercase text-right" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            WARDROBE {talent.wardrobeCount}
          </p>
          <p className="text-[5px] font-futura uppercase col-span-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            SETS {talent.environmentCount} · UPD {talent.lastUpdated}
          </p>
        </div>
      </div>
    </button>
  );
}
