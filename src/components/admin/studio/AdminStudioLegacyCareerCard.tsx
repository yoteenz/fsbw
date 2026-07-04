import type { LegacyTalentCareer } from '../../../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioLegacyCareerCardProps = {
  career: LegacyTalentCareer;
};

export function AdminStudioLegacyCareerCard({ career }: AdminStudioLegacyCareerCardProps) {
  return (
    <div className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
      <div className="flex gap-3">
        <div
          className="w-12 h-12 flex-shrink-0 border flex items-center justify-center text-[16px]"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.8)', fontFamily: '"Covered By Your Grace", sans-serif' }}
        >
          {career.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{career.name}</p>
          <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{career.role}</p>
          <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: career.status.includes('LEGEND') ? '#CA8A04' : ADMIN_STUDIO_THEME.textSecondary }}>
            {career.status} · JOINED {career.joinedDate}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-3">
        <div className="text-center p-1 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[10px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>{career.episodeCount}</p>
          <p className="text-[4px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>EPISODES</p>
        </div>
        <div className="text-center p-1 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[10px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>{career.campaignCount}</p>
          <p className="text-[4px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>CAMPAIGNS</p>
        </div>
        <div className="text-center p-1 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[10px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>{career.communityRating}%</p>
          <p className="text-[4px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>RATING</p>
        </div>
      </div>
      <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SHOWS: {career.shows} · CATCHPHRASE: "{career.catchphrase}"
      </p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        FIRST: {career.firstAppearance} · LATEST: {career.latestAppearance}
      </p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
        UPCOMING: {career.upcoming}
      </p>
      <div className="mt-2 space-y-0.5">
        {career.highlights.map((h) => (
          <p key={h} className="text-[5px] font-futura uppercase px-2 py-0.5 border" style={{ fontWeight: 515, color: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.selectedBg }}>
            ★ {h}
          </p>
        ))}
      </div>
    </div>
  );
}
