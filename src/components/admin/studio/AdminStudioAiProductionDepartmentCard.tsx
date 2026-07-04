import type { AiProductionDepartmentId, AiProductionDepartmentState } from '../../../utils/adminStudioAiProductionEngineDemo';
import { DEPARTMENT_STATUS_LABELS } from '../../../utils/adminStudioAiProductionEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

const STATUS_COLORS: Record<string, string> = {
  complete: '#16A34A',
  approved: '#16A34A',
  'in-progress': '#EB1C24',
  generating: '#CA8A04',
  pending: '#CA8A04',
  waiting: '#9CA3AF',
  queued: '#6B7280',
  paused: '#6B7280',
  rejected: '#EB1C24',
  skipped: '#9CA3AF',
};

type AdminStudioAiProductionDepartmentCardProps = {
  departmentId: AiProductionDepartmentId;
  title: string;
  description: string;
  metric?: string;
  state?: AiProductionDepartmentState;
  accentHex?: string;
  onClick?: () => void;
  live?: boolean;
};

export function AdminStudioAiProductionDepartmentCard({
  departmentId,
  title,
  description,
  metric,
  state,
  accentHex = '#EB1C24',
  onClick,
  live,
}: AdminStudioAiProductionDepartmentCardProps) {
  const status = state?.status ?? 'waiting';
  const statusColor = STATUS_COLORS[status] ?? ADMIN_STUDIO_THEME.textSecondary;
  const progress = state?.progress ?? 0;
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full text-left p-2.5 border transition-all ${live ? 'animate-pulse' : ''}`}
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: `3px solid ${live ? accentHex : ADMIN_STUDIO_THEME.panelBorder}`,
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.35 }}>
          {title}
        </p>
        {metric ? (
          <span className="text-[12px] leading-none shrink-0" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
            {metric}
          </span>
        ) : null}
      </div>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
        {description}
      </p>
      {state ? (
        <>
          <p className="text-[6px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: statusColor }}>
            {DEPARTMENT_STATUS_LABELS[status]}
          </p>
          <div className="h-1 mt-1 bg-white/80 border overflow-hidden" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, background: accentHex }}
            />
          </div>
        </>
      ) : null}
      <p className="text-[4px] font-futura uppercase mt-1 opacity-0 h-0 overflow-hidden" aria-hidden>
        {departmentId}
      </p>
    </Wrapper>
  );
}
