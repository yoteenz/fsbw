import type { LegacyTimeCapsule } from '../../../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioLegacyTimeCapsuleCardProps = {
  capsule: LegacyTimeCapsule;
};

export function AdminStudioLegacyTimeCapsuleCard({ capsule }: AdminStudioLegacyTimeCapsuleCardProps) {
  return (
    <div
      className="p-3 border"
      style={{
        background: 'linear-gradient(180deg, rgba(13,148,136,0.06) 0%, rgba(255,255,255,0.88) 100%)',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderTop: '2px solid #0D9488',
      }}
    >
      <div className="flex justify-between items-start">
        <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          {capsule.title}
        </p>
        <span className="text-[5px] font-futura uppercase px-1.5 py-0.5 border" style={{ fontWeight: 515, color: '#0D9488', borderColor: '#0D9488' }}>
          {capsule.status}
        </span>
      </div>
      <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SEALED {capsule.sealedDate} · REOPEN {capsule.reopenDate}
      </p>
      <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
        CONTENTS: {capsule.contents.join(' · ')}
      </p>
      <p className="text-[4px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: '#0D9488' }}>
        SEALED FOREVER · EDIT DISABLED · ANNIVERSARY REOPEN ONLY
      </p>
    </div>
  );
}
