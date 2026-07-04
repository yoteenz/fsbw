import type { AiProductionRun } from '../../../utils/adminStudioAiProductionEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAiProductionRunCardProps = {
  run: AiProductionRun;
  onClick: () => void;
};

const RUN_STATUS_COLORS: Record<AiProductionRun['runStatus'], string> = {
  draft: '#9CA3AF',
  running: '#EB1C24',
  paused: '#CA8A04',
  'draft-complete': '#16A34A',
  rejected: '#EB1C24',
};

export function AdminStudioAiProductionRunCard({ run, onClick }: AdminStudioAiProductionRunCardProps) {
  const statusColor = RUN_STATUS_COLORS[run.runStatus];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 border transition-transform active:scale-[0.98]"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: `3px solid ${run.accentHex}`,
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[8px] font-futura uppercase line-clamp-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.35 }}>
          {run.title}
        </p>
        <span className="text-[10px] leading-none shrink-0" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: run.accentHex }}>
          {run.qualityScore}%
        </span>
      </div>
      <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: statusColor }}>
        {run.runStatus.replace('-', ' ').toUpperCase()} · {run.currentDepartment.replace('-', ' ').toUpperCase()}
      </p>
      <p className="text-[5px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {run.showName} · UPD {run.lastUpdated}
      </p>
    </button>
  );
}
