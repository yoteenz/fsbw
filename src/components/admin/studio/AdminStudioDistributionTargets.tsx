import type { AdminStudioDistributionTarget } from '../../../utils/adminStudioDistributionDemo';

type AdminStudioDistributionTargetsProps = {
  targets: AdminStudioDistributionTarget[];
  onToggle: (targetId: AdminStudioDistributionTarget['id'], enabled: boolean) => void;
  accentHex?: string;
};

/** Per-pack distribution targets — ACTIVE toggles + COMING SOON planned slots. */
export function AdminStudioDistributionTargets({
  targets,
  onToggle,
  accentHex = '#EB1C24',
}: AdminStudioDistributionTargetsProps) {
  return (
    <div
      className="p-3 space-y-2"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
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
          const statusColor = isComingSoon ? '#9A9A9A' : target.enabled ? '#4ADE80' : '#FBBF24';
          const statusLabel = isComingSoon ? 'COMING SOON' : target.enabled ? 'ACTIVE' : 'OFF';

          return (
            <div
              key={target.id}
              className="flex items-center gap-2 px-2 py-2"
              style={{
                opacity: isComingSoon ? 0.55 : 1,
                background: 'rgba(255,255,255,0.04)',
                borderLeft: `2px solid ${isComingSoon ? '#9A9A9A' : accentHex}`,
              }}
            >
              <button
                type="button"
                disabled={isComingSoon}
                onClick={() => !isComingSoon && onToggle(target.id, !target.enabled)}
                className="flex-shrink-0 w-8 h-4 rounded-full relative transition-colors disabled:cursor-not-allowed"
                style={{
                  background: isComingSoon
                    ? 'rgba(255,255,255,0.08)'
                    : target.enabled
                      ? `${accentHex}88`
                      : 'rgba(255,255,255,0.12)',
                }}
                aria-label={`Toggle ${target.label}`}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                  style={{
                    left: !isComingSoon && target.enabled ? '18px' : '2px',
                    background: isComingSoon ? '#9A9A9A' : '#FFFFFF',
                  }}
                />
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[8px] font-futura uppercase truncate"
                  style={{ fontWeight: 515, color: isComingSoon ? '#9A9A9A' : '#FFFFFF' }}
                >
                  {target.label}
                </p>
                {target.plannedNote ? (
                  <p
                    className="text-[6px] font-futura uppercase truncate"
                    style={{ fontWeight: 515, color: '#9A9A9A' }}
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
        style={{ fontWeight: 515, color: '#9A9A9A', lineHeight: 1.45 }}
      >
        DESKTOP MANSION + MOBILE APP PLANNED FOR PHASE 2 · NO DISPATCH YET
      </p>
    </div>
  );
}
