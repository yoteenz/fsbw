import type { AdminStudioDistributionTarget } from '../../../utils/adminStudioDistributionDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioDistributionTargetsProps = {
  targets: AdminStudioDistributionTarget[];
  onToggle: (targetId: AdminStudioDistributionTarget['id'], enabled: boolean) => void;
  accentHex?: string;
};

export function AdminStudioDistributionTargets({
  targets,
  onToggle,
  accentHex = ADMIN_STUDIO_THEME.accent,
}: AdminStudioDistributionTargetsProps) {
  return (
    <div
      className="p-3 border bg-white/60"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
      }}
    >
      <p
        className="text-[8px] font-futura uppercase tracking-wider mb-2"
        style={{ fontWeight: 515, color: accentHex }}
      >
        DISTRIBUTION TARGETS
      </p>
      <div className="space-y-1.5">
        {targets.map((target) => {
          const isComingSoon = target.activation === 'COMING_SOON';
          const statusColor = isComingSoon
            ? ADMIN_STUDIO_THEME.textSecondary
            : target.enabled
              ? '#16A34A'
              : '#CA8A04';
          const statusLabel = isComingSoon ? 'COMING SOON' : target.enabled ? 'ACTIVE' : 'OFF';

          return (
            <div
              key={target.id}
              className="flex items-center gap-2 px-2 py-2 border bg-white/80"
              style={{
                opacity: isComingSoon ? 0.65 : 1,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                borderLeft: `2px solid ${isComingSoon ? ADMIN_STUDIO_THEME.textSecondary : accentHex}`,
              }}
            >
              <button
                type="button"
                disabled={isComingSoon}
                onClick={() => !isComingSoon && onToggle(target.id, !target.enabled)}
                className="flex-shrink-0 w-8 h-4 rounded-full relative transition-colors disabled:cursor-not-allowed border"
                style={{
                  background: isComingSoon
                    ? ADMIN_STUDIO_THEME.chipInactiveBg
                    : target.enabled
                      ? `${accentHex}55`
                      : ADMIN_STUDIO_THEME.chipInactiveBg,
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
                aria-label={`Toggle ${target.label}`}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all border"
                  style={{
                    left: !isComingSoon && target.enabled ? '18px' : '2px',
                    background: '#FFFFFF',
                    borderColor: ADMIN_STUDIO_THEME.panelBorder,
                  }}
                />
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[8px] font-futura uppercase truncate"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}
                >
                  {target.label}
                </p>
                {target.plannedNote ? (
                  <p
                    className="text-[6px] font-futura uppercase truncate"
                    style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
                  >
                    {target.plannedNote}
                  </p>
                ) : null}
              </div>
              <span
                className="flex-shrink-0 text-[6px] font-futura uppercase px-1.5 py-0.5"
                style={{
                  fontWeight: 515,
                  color: statusColor,
                  border: `1px solid ${statusColor}44`,
                }}
              >
                {statusLabel}
              </span>
            </div>
          );
        })}
      </div>
      <p
        className="text-[6px] font-futura uppercase pt-1"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
      >
        DESKTOP MANSION + MOBILE APP PLANNED FOR PHASE 2 · NO DISPATCH YET
      </p>
    </div>
  );
}
