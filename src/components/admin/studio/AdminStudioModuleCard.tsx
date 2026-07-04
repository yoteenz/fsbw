import { useNavigate } from 'react-router-dom';
import type { AdminStudioModule } from '../../../utils/adminStudioNavigation';
import { STUDIO_STATUS_LABELS } from '../../../utils/adminStudioNavigation';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioModuleCardProps = {
  module: AdminStudioModule;
  compact?: boolean;
};

/** Studio module tile — title, purpose, status, metric, and CTA. */
export function AdminStudioModuleCard({ module, compact = false }: AdminStudioModuleCardProps) {
  const navigate = useNavigate();
  const statusLabel = STUDIO_STATUS_LABELS[module.status];
  const statusColor =
    module.status === 'live' ? '#16A34A' : module.status === 'demo' ? ADMIN_STUDIO_THEME.accent : '#6B7280';

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden shadow-lg ${compact ? 'p-3' : 'p-4'}`}
      style={{ borderWidth: '1.3px' }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`font-bold tracking-wider uppercase ${compact ? 'text-base' : 'text-lg'}`}
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.accent,
            lineHeight: 1.1,
          }}
        >
          {module.title}
        </span>
        <span
          className="text-black font-bold text-lg flex-shrink-0 uppercase"
          style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
        >
          {module.metric}
        </span>
      </div>

      <p
        className={`mt-2 text-left font-futura uppercase ${compact ? 'text-[8px]' : 'text-[9px]'}`}
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
      >
        {module.purpose}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className="text-[7px] font-futura uppercase px-1.5 py-0.5 border"
          style={{ fontWeight: 515, color: statusColor, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          {statusLabel}
        </span>
        <span
          className="text-[6px] font-futura uppercase"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          UPDATED · DEMO
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate(module.route)}
        className="mt-3 w-full py-2 text-[8px] font-futura uppercase border transition-colors active:scale-[0.99]"
        style={{
          fontWeight: 515,
          color: ADMIN_STUDIO_THEME.textOnAccent,
          background: ADMIN_STUDIO_THEME.accent,
          borderColor: ADMIN_STUDIO_THEME.panelBorder,
        }}
      >
        {module.ctaLabel}
      </button>
    </div>
  );
}
