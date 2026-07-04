import type { LegacyVaultFirst } from '../../../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioLegacyVaultItemProps = {
  item: LegacyVaultFirst;
};

export function AdminStudioLegacyVaultItem({ item }: AdminStudioLegacyVaultItemProps) {
  return (
    <div
      className="p-2.5 border"
      style={{
        background: 'linear-gradient(135deg, rgba(31,41,55,0.04) 0%, rgba(255,255,255,0.9) 100%)',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: '3px solid #1F2937',
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[7px] font-futura uppercase flex-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          🔒 {item.title}
        </p>
        <span className="text-[8px] flex-shrink-0" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#1F2937' }}>
          {item.date}
        </span>
      </div>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
        {item.description}
      </p>
      <p className="text-[4px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#1F2937' }}>
        PERMANENTLY LOCKED · NEVER EDITABLE
      </p>
    </div>
  );
}
